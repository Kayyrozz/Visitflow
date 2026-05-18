import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const prospectSchema = z.object({
  nom: z.string().min(1).max(100),
  prenom: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal("")),
  telephone: z.string().max(20).optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
});

// Strip characters that could manipulate PostgREST filter syntax
function sanitizeSearch(input: string): string {
  return input.replace(/[%_\\()|,]/g, "").trim().slice(0, 100);
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: agent } = await supabase
    .from("agents")
    .select("id, agence_id")
    .eq("user_id", user.id)
    .single();

  if (!agent) return NextResponse.json({ error: "Profil agent introuvable" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const rawSearch = searchParams.get("q");
  const statut = searchParams.get("statut");

  let query = supabase
    .from("prospects")
    .select("*", { count: "exact" })
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false });

  if (rawSearch) {
    const search = sanitizeSearch(rawSearch);
    if (search) {
      query = query.or(
        `nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%`
      );
    }
  }

  if (statut) {
    const validStatuts = ["ACTIF", "INACTIF", "CONVERTI", "PERDU"] as const;
    type StatutType = typeof validStatuts[number];
    if (!validStatuts.includes(statut as StatutType)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    query = query.eq("statut", statut as StatutType);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const result = prospectSchema.safeParse(body);
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

  if (!agent) return NextResponse.json({ error: "Profil agent introuvable" }, { status: 403 });

  const { data, error } = await supabase
    .from("prospects")
    .insert({ ...result.data, agent_id: agent.id, agence_id: agent.agence_id as string })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
