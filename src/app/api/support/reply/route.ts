import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  agentId: z.string().uuid(),
  agentName: z.string(),
  agentEmail: z.string().email(),
  content: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
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

  const { error } = await admin
    .from("support_messages")
    .insert({
      agent_id: parsed.data.agentId,
      agent_name: parsed.data.agentName,
      agent_email: parsed.data.agentEmail,
      sender: "admin",
      content: parsed.data.content,
    });

  if (error) return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });

  // Mark all unread agent messages as read
  await admin
    .from("support_messages")
    .update({ read_by_admin: true })
    .eq("agent_id", parsed.data.agentId)
    .eq("sender", "agent")
    .eq("read_by_admin", false);

  return NextResponse.json({ success: true });
}
