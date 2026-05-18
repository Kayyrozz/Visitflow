"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Use admin client to bypass RLS (admin may have agence_id=NULL)
  const admin = createAdminClient();
  const { data: agent } = await admin
    .from("agents")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!agent || agent.role !== "ADMIN") throw new Error("Accès refusé");
  return agent;
}

export async function adminUpdateAgent(
  targetId: string,
  data: { role?: "AGENT" | "MANAGER" | "ADMIN"; actif?: boolean }
) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("agents")
    .update(data)
    .eq("id", targetId);

  if (error) throw new Error(error.message);
  revalidatePath("/backoffice");
}

export async function adminDeleteAgent(targetId: string) {
  const caller = await requireAdmin();
  if (caller.id === targetId) throw new Error("Vous ne pouvez pas supprimer votre propre compte");

  const admin = createAdminClient();

  // Get the auth user_id before deleting the agent record
  const { data: target } = await admin
    .from("agents")
    .select("user_id")
    .eq("id", targetId)
    .single();

  if (!target) throw new Error("Agent introuvable");

  // Delete the agent record first (cascade removes related data)
  const { error: agentError } = await admin.from("agents").delete().eq("id", targetId);
  if (agentError) throw new Error(agentError.message);

  // Then delete the Supabase Auth user so they cannot log back in
  if (target.user_id) {
    const { error: authError } = await admin.auth.admin.deleteUser(target.user_id);
    if (authError) throw new Error(authError.message);
  }

  revalidatePath("/backoffice");
}

export async function adminAssignAgentAgence(
  agentId: string,
  agenceId: string | null
) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("agents")
    .update({ agence_id: agenceId })
    .eq("id", agentId);

  if (error) throw new Error(error.message);
  revalidatePath("/backoffice");
}

export async function adminUpdateSubscription(
  subscriptionId: string,
  data: { status?: string; trial_end?: string }
) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("subscriptions")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", subscriptionId);

  if (error) throw new Error(error.message);
  revalidatePath("/backoffice");
}

export async function adminUpdateAgence(
  agenceId: string,
  data: { nom?: string; email?: string; telephone?: string; adresse?: string; ville?: string }
) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("agences")
    .update(data)
    .eq("id", agenceId);

  if (error) throw new Error(error.message);
  revalidatePath("/backoffice");
}
