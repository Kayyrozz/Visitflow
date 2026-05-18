import { createClient } from "@/lib/supabase/server";
import type { VisiteInsert, VisiteUpdate } from "@/types/database";

export async function getVisites(options?: {
  statut?: string;
  agentId?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();

  let query = supabase
    .from("visites")
    .select(`
      *,
      bien:biens(id, titre, adresse, ville, type, prix),
      prospect:prospects(id, nom, prenom, email, telephone),
      agent:agents(id, nom, prenom),
      score:scores(interet, coup_de_coeur)
    `)
    .order("date_visite", { ascending: true });

  if (options?.statut) query = query.eq("statut", options.statut as "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE" | "NO_SHOW");
  if (options?.agentId) query = query.eq("agent_id", options.agentId);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, (options.offset + (options.limit ?? 10)) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getVisiteById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("visites")
    .select(`
      *,
      bien:biens(*),
      prospect:prospects(*),
      agent:agents(id, nom, prenom, email, telephone),
      score:scores(*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createVisite(visite: VisiteInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("visites")
    .insert(visite)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVisite(id: string, updates: VisiteUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("visites")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteVisite(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("visites").delete().eq("id", id);
  if (error) throw error;
}

export async function getVisitesAVenir(limit = 5) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("visites")
    .select(`
      id, date_visite, statut, duree_minutes,
      prospect:prospects(nom, prenom),
      bien:biens(adresse, ville)
    `)
    .gte("date_visite", new Date().toISOString())
    .eq("statut", "PLANIFIEE")
    .order("date_visite", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}
