import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  nom: z.string().min(1).max(100),
  adresse: z.string().max(200).optional(),
  ville: z.string().max(100).optional(),
  code_postal: z.string().max(10).optional(),
  telephone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id, agence_id")
    .eq("user_id", user.id)
    .single();

  if (!agent) return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
  if (agent.agence_id) return NextResponse.json({ error: "Agence déjà associée" }, { status: 409 });

  // Create agency
  const { data: agence, error: agenceError } = await admin
    .from("agences")
    .insert({
      nom: parsed.data.nom,
      adresse: parsed.data.adresse || null,
      ville: parsed.data.ville || null,
      code_postal: parsed.data.code_postal || null,
      telephone: parsed.data.telephone || null,
      email: parsed.data.email || null,
    })
    .select("id")
    .single();

  if (agenceError || !agence) {
    return NextResponse.json({ error: "Erreur lors de la création de l'agence" }, { status: 500 });
  }

  // Assign agent to new agency and set role to MANAGER (they're the owner)
  const { error: updateError } = await admin
    .from("agents")
    .update({ agence_id: agence.id, role: "MANAGER" })
    .eq("id", agent.id);

  if (updateError) {
    return NextResponse.json({ error: "Erreur lors de l'assignation" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
