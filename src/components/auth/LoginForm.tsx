"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ oauthError }: { oauthError?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    oauthError ? "La connexion avec Google a échoué. Veuillez réessayer." : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setError("Email ou mot de passe incorrect");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mt-8 space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <GoogleAuthButton label="Se connecter avec Google" />

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 dark:text-gray-500">ou</span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              Oublié ?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Se connecter
        </Button>
      </form>
    </div>
  );
}
