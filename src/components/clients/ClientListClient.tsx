"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { getInitials } from "@/lib/utils";
import EditClientModal from "./EditClientModal";

type Prospect = {
  id: string;
  prenom: string;
  nom: string;
  email?: string | null;
  telephone?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  notes?: string | null;
  statut: string;
};

export default function ClientListClient({ prospects }: { prospects: Prospect[] }) {
  const [editing, setEditing] = useState<Prospect | null>(null);

  return (
    <>
      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-50">
        {prospects.map((p) => (
          <div
            key={p.id}
            className="flex cursor-pointer items-center gap-3 px-4 py-4 hover:bg-gray-50"
            onClick={() => setEditing(p)}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
              {getInitials(`${p.prenom} ${p.nom}`)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{p.prenom} {p.nom}</p>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                {p.email && (
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 shrink-0" />{p.email}
                  </span>
                )}
                {p.telephone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 shrink-0" />{p.telephone}
                  </span>
                )}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              {p.statut}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {prospects.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setEditing(p)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
                      {getInitials(`${p.prenom} ${p.nom}`)}
                    </div>
                    <p className="font-medium text-gray-900">{p.prenom} {p.nom}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 text-sm text-gray-500">
                    {p.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {p.email}
                      </div>
                    )}
                    {p.telephone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {p.telephone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {p.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="text-sm text-brand-600 hover:text-brand-700"
                    onClick={(e) => { e.stopPropagation(); setEditing(p); }}
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditClientModal prospect={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
