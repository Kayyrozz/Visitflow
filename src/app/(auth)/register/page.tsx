import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
      <p className="mt-2 text-gray-500">
        Commencez votre essai gratuit de 14 jours
      </p>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
