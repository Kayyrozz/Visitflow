import { createClient } from "@/lib/supabase/server";
import type { BienType, ProspectInsert, ProspectStatut, ProspectUpdate, VisiteStatut } from "@/types/database";

export type VisiteWithScore = {
  id: string;
  date_visite: string;
  statut: VisiteStatut;
  sms_envoye_at: string | null;
  sms_relance_at: string | null;
  feedback_recu_at: string | null;
  bien: { id: string; titre: string; adresse: string; ville: string; type: BienType } | null;
  score: {
    interet: number | null;
    coup_de_coeur: boolean;
    notes: string | null;
    recommandation: string | null;
  } | null;
};

export type ProspectWithHeat = {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  statut: ProspectStatut;
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
  updated_at: string;
  visites: VisiteWithScore[];
  heatScore: number | null;
};

export async function getProspects(options?: {
  statut?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();

  let query = supabase
    .from("prospects")
    .select("*, agent:agents(nom, prenom)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.statut) query = query.eq("statut", options.statut as "ACTIF" | "INACTIF" | "CONVERTI" | "PERDU");
  if (options?.search) {
    query = query.or(
      `nom.ilike.%${options.search}%,prenom.ilike.%${options.search}%,email.ilike.%${options.search}%`
    );
  }
  if (options?.limit) query = query.limit(options.limit);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getProspectById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prospects")
    .select(`
      *,
      agent:agents(id, nom, prenom),
      visites(
        id, date_visite, statut,
        bien:biens(titre, adresse, ville)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProspect(prospect: ProspectInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prospects")
    .insert(prospect)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProspect(id: string, updates: ProspectUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prospects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProspectsWithHeatScores(): Promise<ProspectWithHeat[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("prospects")
    .select(`
      id, nom, prenom, email, telephone, statut, budget_min, budget_max, notes, updated_at,
      visites(
        id, date_visite, statut, sms_envoye_at, sms_relance_at, feedback_recu_at,
        bien:biens(id, titre, adresse, ville, type),
        score:scores(interet, coup_de_coeur, notes, recommandation)
      )
    `)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((prospect) => {
    const visites = (prospect.visites ?? []) as VisiteWithScore[];
    const scores = visites
      .map((v) => {
        const s = v.score;
        if (!s) return null;
        // Handle both single object and array (Supabase version differences)
        const score = Array.isArray(s) ? s[0] : s;
        return score?.interet ?? null;
      })
      .filter((s): s is number => s !== null && s !== undefined);

    const heatScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

    return {
      id: prospect.id,
      nom: prospect.nom,
      prenom: prospect.prenom,
      email: prospect.email,
      telephone: prospect.telephone,
      statut: prospect.statut as ProspectStatut,
      budget_min: prospect.budget_min,
      budget_max: prospect.budget_max,
      notes: prospect.notes,
      updated_at: prospect.updated_at,
      visites,
      heatScore,
    };
  });
}
