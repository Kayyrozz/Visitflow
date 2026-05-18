import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!agent) {
    return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("agent_id", agent.id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "Aucun abonnement Stripe trouvé" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
  });

  return NextResponse.json({ url: session.url });
}
