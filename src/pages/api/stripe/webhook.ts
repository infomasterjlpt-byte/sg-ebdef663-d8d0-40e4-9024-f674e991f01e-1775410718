import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia"
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Disable Next.js body parsing to get raw body for Stripe signature verification
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
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }

  try {
    // Handle the event
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

        // Determine subscription type based on amount (in yen × 100)
        // Less than 5000 (¥50.00) = monthly, otherwise annual
        const subscriptionType = amountTotal < 5000 ? "monthly" : "annual";

        // Find user by email and update premium status
        const { data: user, error: findError } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", customerEmail)
          .single();

        if (findError || !user) {
          console.error("User not found for email:", customerEmail, findError);
          return res.status(404).json({ error: "User not found" });
        }

        // Update user with premium status and stripe info
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            is_premium: true,
            stripe_customer_id: customerId,
            subscription_type: subscriptionType
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Failed to update user:", updateError);
          return res.status(500).json({ error: "Failed to update user" });
        }

        console.log(`User ${customerEmail} upgraded to premium (${subscriptionType})`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: user, error: findError } = await supabaseAdmin
          .from("users")
          .select("id, email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (findError || !user) {
          console.error("User not found for customer ID:", customerId, findError);
          return res.status(404).json({ error: "User not found" });
        }

        // Downgrade user to free tier
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            is_premium: false,
            subscription_type: null
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Failed to downgrade user:", updateError);
          return res.status(500).json({ error: "Failed to downgrade user" });
        }

        console.log(`User ${user.email} subscription cancelled`);
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