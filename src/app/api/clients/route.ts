import { NextResponse } from "next/server";

// Cet endpoint est remplacé par /api/prospects (Supabase).
export function GET() {
  return NextResponse.json({ error: "Utilisez /api/prospects à la place." }, { status: 410 });
}
export function POST() {
  return NextResponse.json({ error: "Utilisez /api/prospects à la place." }, { status: 410 });
}
