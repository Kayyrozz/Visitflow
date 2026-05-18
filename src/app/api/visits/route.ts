import { NextResponse } from "next/server";

// Cet endpoint est remplacé par /api/visites (Supabase).
// Conservé pour ne pas casser d'éventuelles intégrations existantes.
export function GET() {
  return NextResponse.json(
    { error: "Utilisez /api/visites à la place." },
    { status: 301, headers: { Location: "/api/visites" } }
  );
}

export function POST() {
  return NextResponse.json(
    { error: "Utilisez /api/visites à la place." },
    { status: 301, headers: { Location: "/api/visites" } }
  );
}
