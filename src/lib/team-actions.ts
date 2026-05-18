"use server";

import crypto from "crypto";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const createMemberSchema = z.object({
  prenom: z.string().min(1).max(50),
  nom: z.string().min(1).max(50),
  email: z.string().email(),
  telephone: z.string().max(20).optional().nullable(),
  role: z.enum(["AGENT", "MANAGER"]),
});

async function requireManagerOrAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Always use admin client to bypass RLS for the caller's own record
  const admin = createAdminClient();
  const { data: agent } = await admin
    .from("agents")
    .select("id, role, agence_id")
    .eq("user_id", user.id)
    .single();

  if (!agent) throw new Error("Agent introuvable");
  if (agent.role === "AGENT") throw new Error("Accès refusé — rôle insuffisant");
  if (!agent.agence_id) throw new Error("Vous n'êtes associé à aucune agence");

  return agent as { id: string; role: string; agence_id: string };
}

export async function createTeamMember(formData: unknown): Promise<{ tempPassword: string }> {
  const caller = await requireManagerOrAdmin();
  const data = createMemberSchema.parse(formData);
  const admin = createAdminClient();

  // Check email not already taken
  const { data: existing } = await admin
    .from("agents")
    .select("id")
    .eq("email", data.email)
    .maybeSingle();
  if (existing) throw new Error("Un compte existe déjà avec cet email.");

  // Generate a communicable temp password
  const tempPassword = `Vf-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${crypto.randomBytes(2).toString("hex")}!`;

  // Create auth user (email_confirm=true → no confirmation email needed)
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: `${data.prenom} ${data.nom}` },
  });

  if (createError) {
    if (createError.message.toLowerCase().includes("already")) {
      throw new Error("Un compte existe déjà avec cet email.");
    }
    throw new Error(createError.message);
  }

  const userId = created.user.id;

  // Trigger has created agent with agence_id=NULL — fix it now
  const { error: updateError } = await admin
    .from("agents")
    .update({
      agence_id: caller.agence_id,
      role: data.role,
      prenom: data.prenom,
      nom: data.nom,
      telephone: data.telephone ?? null,
    })
    .eq("user_id", userId);

  if (updateError) {
    await admin.auth.admin.deleteUser(userId);
    throw new Error("Erreur lors de la création du profil.");
  }

  // Set subscription to manual_active + onboarded so they can access immediately
  const { data: agentRow } = await admin
    .from("agents")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (agentRow) {
    await admin
      .from("subscriptions")
      .update({ status: "manual_active", onboarded: true, updated_at: new Date().toISOString() })
      .eq("agent_id", agentRow.id);
  }

  revalidatePath("/equipe");
  return { tempPassword };
}

export async function updateTeamMember(
  targetId: string,
  data: { role?: "AGENT" | "MANAGER"; actif?: boolean }
) {
  const caller = await requireManagerOrAdmin();
  const admin = createAdminClient();

  const { data: target } = await admin
    .from("agents")
    .select("id, agence_id, role")
    .eq("id", targetId)
    .single();

  if (!target || target.agence_id !== caller.agence_id) throw new Error("Accès refusé");
  if (caller.id === targetId) throw new Error("Vous ne pouvez pas modifier votre propre rôle ici");

  const { error } = await admin.from("agents").update(data).eq("id", targetId);
  if (error) throw new Error(error.message);

  revalidatePath("/equipe");
}

export async function removeTeamMember(targetId: string) {
  const caller = await requireManagerOrAdmin();
  if (caller.id === targetId) throw new Error("Vous ne pouvez pas vous supprimer vous-même");

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("agents")
    .select("id, agence_id, user_id, role")
    .eq("id", targetId)
    .single();

  if (!target || target.agence_id !== caller.agence_id) throw new Error("Accès refusé");
  if (caller.role === "MANAGER" && target.role === "MANAGER") {
    throw new Error("Un manager ne peut pas supprimer un autre manager");
  }

  if (target.user_id) {
    const { error } = await admin.auth.admin.deleteUser(target.user_id);
    if (error) throw new Error(error.message);
  } else {
    await admin.from("agents").delete().eq("id", targetId);
  }

  revalidatePath("/equipe");
}
