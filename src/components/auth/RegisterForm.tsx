"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("Un compte existe déjà avec cet email.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    setSuccess(true);
    router.push("/login?registered=true");
  };

  if (success) {
    return (
      <div className="mt-8 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Compte créé ! Vérifiez votre email pour confirmer votre inscription.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <GoogleAuthButton label="S'inscrire avec Google" />

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 dark:text-gray-500">ou</span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="name"
          label="Nom complet"
          placeholder="Jean Dupont"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="password"
          type="password"
          label="Mot de passe"
          placeholder="Min. 8 caractères"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Créer mon compte
        </Button>
      </form>
    </div>
  );
}
