import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isSubscriptionActive, getTrialDaysLeft } from "@/lib/subscription";
import type { Subscription } from "@/lib/subscription";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id, role, agence_id")
    .eq("user_id", user.id)
    .single();

  // Agent record missing — sign out to avoid redirect loop, then go to login
  if (!agent) redirect("/api/auth/signout");

  let trialDaysLeft = 0;

  if (agent.role !== "ADMIN") {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("*")
      .eq("agent_id", agent.id)
      .single();

    const subscription = sub as Subscription | null;

    if (!isSubscriptionActive(subscription)) {
      redirect("/subscribe");
    }

    // New trialing user who hasn't chosen a plan yet
    if (subscription?.status === "trialing" && !subscription?.onboarded) {
      redirect("/subscribe");
    }

    // User has no agency yet → must create one before accessing the dashboard
    if (!agent.agence_id) {
      redirect("/onboarding/agence");
    }

    trialDaysLeft = getTrialDaysLeft(subscription);
  }

  return <DashboardShell trialDaysLeft={trialDaysLeft}>{children}</DashboardShell>;
}
