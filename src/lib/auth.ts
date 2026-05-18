// Authentication is handled exclusively via Supabase Auth.
// See: src/lib/supabase/client.ts and src/lib/supabase/server.ts
//
// NextAuth configuration below is retained only to satisfy the
// /api/auth/[...nextauth] route. No mock user is defined —
// all sign-in/sign-up flows use supabase.auth directly.

import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token }) { return token; },
    async session({ session }) { return session; },
  },
};
