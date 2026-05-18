import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
      <p className="mt-2 text-gray-500">
        Entrez votre email pour recevoir un lien de réinitialisation
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
