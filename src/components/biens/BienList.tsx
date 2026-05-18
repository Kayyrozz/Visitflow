import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Building2, MapPin, Ruler, Tag } from "lucide-react";

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

export default async function BienList() {
  const supabase = createClient();
  const { data: biens } = await supabase
    .from("biens")
    .select("id, titre, type, adresse, ville, surface, prix, statut, description")
    .order("created_at", { ascending: false });

  if (!biens || biens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-200" />
        <p className="font-medium text-gray-400">Aucun bien enregistré</p>
        <p className="mt-1 text-sm text-gray-300">
          Ajoutez votre premier bien pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {biens.map((b) => (
        <Link
          key={b.id}
          href={`/biens/${b.id}`}
          className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{b.titre}</p>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Tag className="h-3 w-3" />
                {TYPE_LABELS[b.type] ?? b.type}
              </span>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUT_STYLES[b.statut] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {STATUT_LABELS[b.statut] ?? b.statut}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{b.adresse}, {b.ville}</span>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4 mt-auto pt-3 border-t border-gray-100">
            {b.surface && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Ruler className="h-3.5 w-3.5 text-gray-400" />
                {b.surface} m²
              </div>
            )}
            {b.prix && (
              <div className="ml-auto text-sm font-semibold text-brand-700">
                {formatPrice(b.prix)}
              </div>
            )}
          </div>

          {b.description && (
            <p className="mt-2 text-xs text-gray-400 line-clamp-2">{b.description}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
