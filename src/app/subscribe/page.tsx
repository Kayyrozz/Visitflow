import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isSubscriptionActive, getTrialDaysLeft } from "@/lib/subscription";
import type { Subscription } from "@/lib/subscription";
import SubscribeClient from "@/components/subscription/SubscribeClient";

export default async function SubscribePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id, prenom, nom, email, role")
    .eq("user_id", user.id)
    .single();

  if (!agent) redirect("/login");

  // Admins are never blocked
  if (agent.role === "ADMIN") redirect("/dashboard");

  const { data: sub } = await admin
    .from("subscriptions")
    .select("*")
    .eq("agent_id", agent.id)
    .single();

  const subscription = sub as Subscription | null;

  // Redirect to dashboard only for paid active subscriptions (not trialing)
  const isPaidActive = subscription?.status === "active" || subscription?.status === "manual_active";
  if (isPaidActive && subscription?.onboarded) redirect("/dashboard");

  const trialDaysLeft = getTrialDaysLeft(subscription);

  return (
    <SubscribeClient
      agentName={`${agent.prenom} ${agent.nom}`}
      subscription={subscription}
      trialDaysLeft={trialDaysLeft}
    />
  );
}
