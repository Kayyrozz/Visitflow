import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getTrialDaysLeft } from "@/lib/subscription";
import type { Subscription } from "@/lib/subscription";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id, prenom, nom, email")
    .eq("user_id", user.id)
    .single();

  if (!agent) {
    return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("*")
    .eq("agent_id", agent.id)
    .single();

  // Retrieve or create Stripe customer
  let customerId: string | undefined = sub?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: agent.email,
      name: `${agent.prenom} ${agent.nom}`,
      metadata: { agent_id: agent.id },
    });
    customerId = customer.id;

    await admin
      .from("subscriptions")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("agent_id", agent.id);
  }

  const trialDays = getTrialDaysLeft(sub as Subscription | null);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    subscription_data: trialDays > 0
      ? { trial_period_days: trialDays, metadata: { agent_id: agent.id } }
      : { metadata: { agent_id: agent.id } },
    success_url: `${baseUrl}/dashboard?subscribed=1`,
    cancel_url: `${baseUrl}/subscribe`,
    metadata: { agent_id: agent.id },
  });

  return NextResponse.json({ url: session.url });
}
