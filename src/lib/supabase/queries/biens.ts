import { createClient } from "@/lib/supabase/server";
import type { BienInsert, BienUpdate } from "@/types/database";

export async function getBiens(options?: {
  statut?: string;
  type?: string;
  prixMin?: number;
  prixMax?: number;
  search?: string;
  limit?: number;
}) {
  const supabase = createClient();

  let query = supabase
    .from("biens")
    .select("*, agent:agents(nom, prenom)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.statut) query = query.eq("statut", options.statut as "DISPONIBLE" | "SOUS_COMPROMIS" | "VENDU" | "RETIRE");
  if (options?.type) query = query.eq("type", options.type as "APPARTEMENT" | "MAISON" | "TERRAIN" | "COMMERCIAL" | "AUTRE");
  if (options?.prixMin) query = query.gte("prix", options.prixMin);
  if (options?.prixMax) query = query.lte("prix", options.prixMax);
  if (options?.search) {
    query = query.or(
      `titre.ilike.%${options.search}%,ville.ilike.%${options.search}%,adresse.ilike.%${options.search}%`
    );
  }
  if (options?.limit) query = query.limit(options.limit);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getBienById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("biens")
    .select(`
      *,
      agent:agents(id, nom, prenom, telephone),
      visites(id, date_visite, statut, prospect:prospects(nom, prenom))
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBien(bien: BienInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("biens")
    .insert(bien)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBien(id: string, updates: BienUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("biens")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
