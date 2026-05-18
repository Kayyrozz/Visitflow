import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function upsertSubscription(
  stripeSubscription: Stripe.Subscription,
  agentId?: string
) {
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawSub = stripeSubscription as any;

  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : (stripeSubscription.customer as { id: string }).id;

  // Resolve agent_id from metadata or customer lookup
  let resolvedAgentId: string | undefined = agentId ?? stripeSubscription.metadata?.agent_id ?? undefined;

  if (!resolvedAgentId) {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("agent_id")
      .eq("stripe_customer_id", customerId)
      .single();
    resolvedAgentId = sub?.agent_id;
  }

  if (!resolvedAgentId) return;

  const status = stripeSubscription.status as string;
  const mappedStatus =
    status === "active" ? "active"
    : status === "trialing" ? "trialing"
    : status === "past_due" ? "past_due"
    : status === "canceled" ? "canceled"
    : status === "unpaid" ? "unpaid"
    : "canceled";

  const periodEnd = rawSub.current_period_end
    ? new Date(rawSub.current_period_end * 1000).toISOString()
    : null;

  await admin.from("subscriptions").update({
    stripe_customer_id: customerId,
    stripe_subscription_id: stripeSubscription.id,
    status: mappedStatus,
    current_period_end: periodEnd,
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }).eq("agent_id", resolvedAgentId);
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(sub, session.metadata?.agent_id);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(sub);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
