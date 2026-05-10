import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia"
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Create admin client directly to avoid type issues
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerEmail = session.customer_details?.email;
        const customerId = session.customer as string;
        const amountTotal = session.amount_total || 0;

        if (!customerEmail) {
          console.error("No customer email in checkout session");
          return res.status(400).json({ error: "Missing customer email" });
        }

        const subscriptionType = amountTotal <= 50000 ? "monthly" : "sixmonth";

        // Find profile by email
        const { data: profiles, error: findError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .limit(1);

        if (findError || !profiles || profiles.length === 0) {
          console.error("Profile not found for email:", customerEmail, findError);
          return res.status(404).json({ error: "User not found" });
        }

        const profileId = profiles[0].id;

        // Update profile
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_premium: true,
            stripe_customer_id: customerId,
            subscription_type: subscriptionType
          })
          .eq("id", profileId);

        if (updateError) {
          console.error("Failed to update profile:", updateError);
          return res.status(500).json({ error: "Failed to update profile" });
        }

        console.log(`User ${customerEmail} upgraded to premium (${subscriptionType})`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profiles, error: findError } = await supabaseAdmin
          .from("profiles")
          .select("id, email")
          .eq("stripe_customer_id", customerId)
          .limit(1);

        if (findError || !profiles || profiles.length === 0) {
          console.error("Profile not found for customer ID:", customerId);
          return res.status(404).json({ error: "User not found" });
        }

        const profile = profiles[0];

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_premium: false,
            subscription_type: null
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Failed to downgrade profile:", updateError);
          return res.status(500).json({ error: "Failed to downgrade profile" });
        }

        console.log(`User ${profile.email} subscription cancelled`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
