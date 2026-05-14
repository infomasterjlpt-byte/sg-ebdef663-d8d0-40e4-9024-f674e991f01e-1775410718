// src/pages/api/stripe/cancel.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  // Get the user's stripe_customer_id from profiles
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id, is_premium")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  if (!profile.stripe_customer_id) {
    return res.status(400).json({ error: "No Stripe customer found for this user" });
  }

  if (!profile.is_premium) {
    return res.status(400).json({ error: "User is not a premium subscriber" });
  }

  // Find active subscriptions for this customer
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: "active",
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    // No active sub on Stripe — clean up the DB anyway
    await supabaseAdmin
      .from("profiles")
      .update({ is_premium: false, subscription_type: null })
      .eq("id", userId);

    return res.status(200).json({ message: "No active subscription found; account updated." });
  }

  const subscription = subscriptions.data[0];

  // Cancel at period end — user keeps access until billing cycle ends
  await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
  });

  const periodEnd = new Date(subscription.current_period_end * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return res.status(200).json({
    message: `Subscription cancelled. You will have access until ${periodEnd}.`,
    accessUntil: periodEnd,
  });
}
