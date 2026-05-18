import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const visiteSchema = z.object({
  bien_id: z.string().uuid(),
  prospect_id: z.string().uuid(),
  date_visite: z.string().datetime(),
  duree_minutes: z.number().int().positive().default(60),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statut = searchParams.get("statut");

  const { data: agent } = await supabase
    .from("agents")
    .select("id, agence_id")
    .eq("user_id", user.id)
    .single();

  if (!agent) {
    return NextResponse.json({ error: "Profil agent introuvable" }, { status: 403 });
  }

  const validStatuts = ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE", "NO_SHOW"] as const;
  type VisiteStatut = typeof validStatuts[number];

  if (statut && !validStatuts.includes(statut as VisiteStatut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  let query = supabase
    .from("visites")
    .select(`
      *,
      bien:biens(id, titre, adresse, ville, type, prix),
      prospect:prospects(id, nom, prenom, email),
      score:scores(interet, coup_de_coeur)
    `)
    .eq("agent_id", agent.id)
    .order("date_visite", { ascending: true });

  if (statut) query = query.eq("statut", statut as VisiteStatut);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const result = visiteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("id, agence_id")
    .eq("user_id", user.id)
    .single();

  if (!agent) {
    return NextResponse.json({ error: "Profil agent introuvable" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("visites")
    .insert({
      ...result.data,
      agent_id: agent.id,
      agence_id: agent.agence_id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
