import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import VisitList from "@/components/visits/VisitList";

export const metadata: Metadata = {
  title: "Visites",
};

export default function VisitsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visites</h1>
          <p className="text-gray-500">Gérez toutes vos visites immobilières</p>
        </div>
        <Link
          href="/visits/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle visite
        </Link>
      </div>

      <VisitList />
    </div>
  );
}
