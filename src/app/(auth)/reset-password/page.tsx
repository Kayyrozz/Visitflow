import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
};

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
      <p className="mt-2 text-gray-500">
        Choisissez un nouveau mot de passe pour votre compte
      </p>

      <ResetPasswordForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
