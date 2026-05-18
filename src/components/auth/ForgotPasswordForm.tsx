"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      data.email,
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    if (resetError) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="mt-8 rounded-lg bg-green-50 px-4 py-4 text-sm text-green-700">
        Un email de réinitialisation vous a été envoyé. Vérifiez votre boîte de
        réception.
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
        id="email"
        type="email"
        label="Email"
        placeholder="vous@exemple.fr"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Envoyer le lien
      </Button>
    </form>
  );
}
