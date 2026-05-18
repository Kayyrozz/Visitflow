import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: agent } = await admin
    .from("agents")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!agent) {
    return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
  }

  const { error } = await admin
    .from("subscriptions")
    .update({ onboarded: true, updated_at: new Date().toISOString() })
    .eq("agent_id", agent.id);

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
