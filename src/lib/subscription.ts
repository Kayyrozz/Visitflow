import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "manual_active";

export type Subscription = {
  id: string;
  agent_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  trial_end: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
};

export function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (sub.status === "active" || sub.status === "manual_active") return true;
  if (sub.status === "trialing" && new Date(sub.trial_end) > new Date()) return true;
  return false;
}

export function getTrialDaysLeft(sub: Subscription | null): number {
  if (!sub || sub.status !== "trialing") return 0;
  const diff = new Date(sub.trial_end).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export async function getAgentSubscription(
  supabase: SupabaseClient,
  agentId: string
): Promise<Subscription | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("agent_id", agentId)
    .single();
  return data as Subscription | null;
}
