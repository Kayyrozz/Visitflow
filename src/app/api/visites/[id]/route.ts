import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const patchSchema = z.object({
  statut: z.enum(["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE", "NO_SHOW"]).optional(),
  date_visite: z.string().datetime().optional(),
  duree_minutes: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional().nullable(),
  terminee_at: z.string().datetime().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data, error } = await supabase
    .from("visites")
    .select(`
      *,
      bien:biens(*),
      prospect:prospects(*),
      agent:agents(id, nom, prenom, email, telephone),
      score:scores(*)
    `)
    .eq("id", params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Visite introuvable" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 }
    );
  }

  if (Object.keys(result.data).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("visites")
    .update(result.data)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { error } = await supabase.from("visites").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
