import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  agentId: z.string().uuid(),
});

export async function PATCH(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createAdminClient();

  const { data: me } = await admin
    .from("agents")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  await admin
    .from("support_messages")
    .update({ read_by_admin: true })
    .eq("agent_id", parsed.data.agentId)
    .eq("sender", "agent")
    .eq("read_by_admin", false);

  return NextResponse.json({ success: true });
}
