import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { registered?: string; error?: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Bienvenue</h1>
      <p className="mt-2 text-gray-500">Connectez-vous à votre compte VisitFlow</p>

      {searchParams.registered && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Compte créé ! Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.
        </div>
      )}

      <LoginForm oauthError={searchParams.error === "oauth"} />

      <p className="mt-6 text-center text-sm text-gray-500">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
