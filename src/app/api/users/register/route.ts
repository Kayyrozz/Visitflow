import { NextResponse } from "next/server";

// L'inscription se fait via Supabase Auth côté client (supabase.auth.signUp).
// Cet endpoint n'est plus utilisé.
export function POST() {
  return NextResponse.json(
    { error: "L'inscription se fait directement via Supabase Auth." },
    { status: 410 }
  );
}
