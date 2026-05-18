"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getOrCreateAgent() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Utiliser le client admin pour contourner RLS (même approche que DashboardLayout)
  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id, agence_id")
    .eq("user_id", user.id)
    .single();

  if (agent?.agence_id) return agent;

  // Agent sans agence_id : créer l'agence et mettre à jour l'agent
  if (agent && !agent.agence_id) {
    const { data: agence } = await admin
      .from("agences")
      .insert({ nom: "Mon Agence" })
      .select("id")
      .single();
    if (!agence) throw new Error("Impossible de créer l'agence");
    await admin.from("agents").update({ agence_id: agence.id }).eq("id", agent.id);
    return { ...agent, agence_id: agence.id };
  }

  // Première connexion : créer agence + agent

  const fullName = (user.user_metadata?.name as string | undefined) ?? "";
  const parts = fullName.trim().split(" ");
  const prenom = parts[0] || "Agent";
  const nom = parts.slice(1).join(" ") || "—";

  const { data: agence } = await admin
    .from("agences")
    .insert({ nom: "Mon Agence" })
    .select("id")
    .single();

  if (!agence) throw new Error("Impossible de créer l'agence");

  const { data: newAgent } = await admin
    .from("agents")
    .insert({
      user_id: user.id,
      agence_id: agence.id,
      nom,
      prenom,
      email: user.email!,
      role: "ADMIN",
    })
    .select("id, agence_id")
    .single();

  if (!newAgent) throw new Error("Impossible de créer le profil agent");
  return newAgent;
}

export async function createProspect(data: {
  prenom: string;
  nom: string;
  email?: string;
  telephone?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  notes?: string;
}) {
  const agent = await getOrCreateAgent();
  const admin = createAdminClient();

  const { error } = await admin.from("prospects").insert({
    agent_id: agent.id,
    agence_id: agent.agence_id as string,
    prenom: data.prenom.trim(),
    nom: data.nom.trim(),
    email: data.email || null,
    telephone: data.telephone || null,
    budget_min: data.budget_min || null,
    budget_max: data.budget_max || null,
    notes: data.notes || null,
    statut: "ACTIF",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath("/dashboard");
}

export async function createVisite(data: {
  prospect_id: string;
  bien_id: string;
  date_visite: string;
  duree_minutes?: number;
  notes?: string;
}) {
  const agent = await getOrCreateAgent();
  const admin = createAdminClient();

  const { error } = await admin.from("visites").insert({
    agent_id: agent.id,
    agence_id: agent.agence_id as string,
    prospect_id: data.prospect_id,
    bien_id: data.bien_id,
    date_visite: data.date_visite,
    duree_minutes: data.duree_minutes ?? 60,
    notes: data.notes || null,
    statut: "PLANIFIEE",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/visits");
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

export async function updateProspect(
  id: string,
  data: {
    prenom: string;
    nom: string;
    email?: string;
    telephone?: string;
    budget_min?: number | null;
    budget_max?: number | null;
    notes?: string;
    statut: string;
  }
) {
  const agent = await getOrCreateAgent();
  const admin = createAdminClient();

  const { error } = await admin
    .from("prospects")
    .update({
      prenom: data.prenom.trim(),
      nom: data.nom.trim(),
      email: data.email || null,
      telephone: data.telephone || null,
      budget_min: data.budget_min || null,
      budget_max: data.budget_max || null,
      notes: data.notes || null,
      statut: data.statut as "ACTIF" | "INACTIF" | "CONVERTI" | "PERDU",
    })
    .eq("id", id)
    .eq("agent_id", agent.id);

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

export async function createEvenement(data: {
  titre: string;
  type: "REUNION" | "RENDEZ_VOUS";
  date_debut: string;
  duree_minutes?: number;
  notes?: string;
  prospect_id?: string;
}) {
  const agent = await getOrCreateAgent();
  const admin = createAdminClient();

  const { error } = await admin.from("evenements").insert({
    agent_id: agent.id,
    agence_id: agent.agence_id as string,
    titre: data.titre.trim(),
    type: data.type,
    date_debut: data.date_debut,
    duree_minutes: data.duree_minutes ?? 60,
    notes: data.notes || null,
    prospect_id: data.prospect_id || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/agenda");
}

export async function createBien(data: {
  titre: string;
  type: string;
  adresse: string;
  ville: string;
  code_postal: string;
  surface?: number | null;
  prix?: number | null;
  description?: string;
}) {
  const agent = await getOrCreateAgent();
  const admin = createAdminClient();

  const { error } = await admin.from("biens").insert({
    agent_id: agent.id,
    agence_id: agent.agence_id as string,
    titre: data.titre.trim(),
    type: data.type as "APPARTEMENT" | "MAISON" | "TERRAIN" | "COMMERCIAL" | "AUTRE",
    adresse: data.adresse.trim(),
    ville: data.ville.trim(),
    code_postal: data.code_postal.trim(),
    surface: data.surface || null,
    prix: data.prix || null,
    description: data.description || null,
    statut: "DISPONIBLE",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/biens");
  revalidatePath("/dashboard");
}

export async function updateBien(
  id: string,
  data: {
    titre: string;
    type: string;
    adresse: string;
    ville: string;
    code_postal: string;
    surface?: number | null;
    prix?: number | null;
    description?: string;
    statut: string;
  }
) {
  const agent = await getOrCreateAgent();
  const admin = createAdminClient();

  const { error } = await admin
    .from("biens")
    .update({
      titre: data.titre.trim(),
      type: data.type as "APPARTEMENT" | "MAISON" | "TERRAIN" | "COMMERCIAL" | "AUTRE",
      adresse: data.adresse.trim(),
      ville: data.ville.trim(),
      code_postal: data.code_postal.trim(),
      surface: data.surface || null,
      prix: data.prix || null,
      description: data.description || null,
      statut: data.statut as "DISPONIBLE" | "SOUS_COMPROMIS" | "VENDU" | "RETIRE",
    })
    .eq("id", id)
    .eq("agent_id", agent.id);

  if (error) throw new Error(error.message);
  revalidatePath("/biens");
  revalidatePath(`/biens/${id}`);
}

export async function addBienPhoto(bienId: string, photoUrl: string) {
  const agent = await getOrCreateAgent();
  const supabase = createClient();

  const { data: bien } = await supabase
    .from("biens")
    .select("photos")
    .eq("id", bienId)
    .eq("agent_id", agent.id)
    .single();

  if (!bien) throw new Error("Bien introuvable ou accès non autorisé");

  const photos = [...((bien.photos as string[]) ?? []), photoUrl];

  const admin = createAdminClient();
  const { error } = await admin
    .from("biens")
    .update({ photos })
    .eq("id", bienId)
    .eq("agent_id", agent.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/biens/${bienId}`);
}

export async function removeBienPhoto(bienId: string, photoUrl: string) {
  const agent = await getOrCreateAgent();
  const supabase = createClient();

  const { data: bien } = await supabase
    .from("biens")
    .select("photos")
    .eq("id", bienId)
    .eq("agent_id", agent.id)
    .single();

  if (!bien) throw new Error("Bien introuvable ou accès non autorisé");

  const photos = ((bien.photos as string[]) ?? []).filter((p) => p !== photoUrl);

  const admin = createAdminClient();
  const { error } = await admin
    .from("biens")
    .update({ photos })
    .eq("id", bienId)
    .eq("agent_id", agent.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/biens/${bienId}`);
}
