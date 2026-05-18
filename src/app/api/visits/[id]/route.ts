import { NextResponse } from "next/server";

// Cet endpoint est remplacé par /api/visites/[id] (Supabase).
export function GET() {
  return NextResponse.json({ error: "Utilisez /api/visites/[id] à la place." }, { status: 410 });
}
export function PATCH() {
  return NextResponse.json({ error: "Utilisez /api/visites/[id] à la place." }, { status: 410 });
}
export function DELETE() {
  return NextResponse.json({ error: "Utilisez /api/visites/[id] à la place." }, { status: 410 });
}
