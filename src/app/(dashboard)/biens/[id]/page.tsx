import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Ruler, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import EditBienModal from "@/components/biens/EditBienModal";
import BienPhotos from "@/components/biens/BienPhotos";

const TYPE_LABELS: Record<string, string> = {
  APPARTEMENT: "Appartement",
  MAISON: "Maison",
  TERRAIN: "Terrain",
  COMMERCIAL: "Local commercial",
  AUTRE: "Autre",
};

const STATUT_STYLES: Record<string, string> = {
  DISPONIBLE: "bg-green-100 text-green-700",
  SOUS_COMPROMIS: "bg-amber-100 text-amber-700",
  VENDU: "bg-gray-100 text-gray-600",
  RETIRE: "bg-red-100 text-red-700",
};

const STATUT_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible",
  SOUS_COMPROMIS: "Sous compromis",
  VENDU: "Vendu",
  RETIRE: "Retiré",
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("biens")
    .select("titre")
    .eq("id", params.id)
    .single();
  return { title: data?.titre ?? "Bien" };
}

export default async function BienDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: bien } = await supabase
    .from("biens")
    .select("id, titre, type, adresse, ville, code_postal, surface, prix, description, statut, photos")
    .eq("id", params.id)
    .single();

  if (!bien) notFound();

  const photos = (bien.photos as string[]) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/biens"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux biens
        </Link>
        <EditBienModal bien={bien} />
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{bien.titre}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {TYPE_LABELS[bien.type] ?? bien.type}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {bien.adresse}, {bien.ville} {bien.code_postal}
              </span>
            </div>
          </div>
          <span
            className={`self-start shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
              STATUT_STYLES[bien.statut] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {STATUT_LABELS[bien.statut] ?? bien.statut}
          </span>
        </div>

        <div className="flex items-center gap-6 py-4 border-y border-gray-100">
          {bien.surface && (
            <div className="flex items-center gap-2 text-gray-700">
              <Ruler className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">{bien.surface} m²</span>
            </div>
          )}
          {bien.prix && (
            <div className="text-xl font-bold text-brand-700">
              {formatPrice(bien.prix)}
            </div>
          )}
        </div>

        {bien.description && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">{bien.description}</p>
        )}
      </div>

      {/* Photos */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Photos</h2>
        <BienPhotos bienId={bien.id} photos={photos} />
      </div>
    </div>
  );
}
