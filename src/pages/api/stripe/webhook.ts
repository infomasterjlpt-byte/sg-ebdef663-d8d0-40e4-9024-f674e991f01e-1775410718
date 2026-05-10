import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia"
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

        // ¥499 = 49900 in Stripe (amount in smallest currency unit)
        // ¥2499 = 249900 in Stripe
        const subscriptionType = amountTotal <= 50000 ? "monthly" : "sixmonth";

        // Find user in profiles table by email
        const { data: profile, error: findError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .single();

        if (findError || !profile) {
          console.error("Profile not found for email:", customerEmail, findError);
          return res.status(404).json({ error: "User not found" });
        }

        // Update profile with premium status
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
  is_premium: true,
  stripe_customer_id: customerId,
  subscription_type: subscriptionType
} as any)
          .eq("id", profile.id);

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

        const { data: profile, error: findError } = await supabaseAdmin
          .from("profiles")
          .select("id, email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (findError || !profile) {
          console.error("Profile not found for customer ID:", customerId, findError);
          return res.status(404).json({ error: "User not found" });
        }

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
  is_premium: false,
  subscription_type: null
} as any)
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
