import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const scoreSchema = z.object({
  visite_id: z.string().uuid(),
  prospect_id: z.string().uuid(),
  bien_id: z.string().uuid(),
  interet: z.number().int().min(1).max(5).optional(),
  coup_de_coeur: z.boolean().default(false),
  notes: z.string().optional(),
  recommandation: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const result = scoreSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("scores")
    .upsert(result.data, { onConflict: "visite_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
