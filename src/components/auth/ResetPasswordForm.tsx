"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z.string().min(8, "Minimum 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const supabase = createClient();

    // Écoute l'événement PASSWORD_RECOVERY déclenché par Supabase
    // quand l'utilisateur arrive via le lien email
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Au cas où la session serait déjà établie (rechargement de page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: FormData) => {
    setError(null);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (success) {
    return (
      <div className="mt-8 rounded-lg bg-green-50 px-4 py-4 text-sm text-green-700">
        Mot de passe mis à jour ! Redirection vers la connexion…
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mt-8 rounded-lg bg-yellow-50 px-4 py-4 text-sm text-yellow-700">
        Vérification du lien en cours…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Input
        id="password"
        type="password"
        label="Nouveau mot de passe"
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
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
}
