import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, User, Calendar, FileText } from "lucide-react";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Détail visite",
};

// Mock data — replace with DB fetch
const mockVisit = {
  id: "1",
  status: "PLANIFIEE" as const,
  scheduledAt: new Date("2026-05-20T14:00:00"),
  property: {
    address: "12 rue de la Paix",
    city: "Paris",
    postalCode: "75001",
    type: "Appartement",
    surface: 65,
    price: 450000,
  },
  client: {
    firstName: "Marie",
    lastName: "Leblanc",
    email: "marie.leblanc@email.com",
    phone: "06 12 34 56 78",
  },
  notes: "Cliente intéressée par un appartement de 3 pièces. Budget max 500k€.",
};

export default function VisitDetailPage({ params }: { params: { id: string } }) {
  const visit = mockVisit;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/visits"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Visite #{params.id}
        </h1>
        <Badge status={visit.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Property info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Bien immobilier</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {visit.property.address}
          </p>
          <p className="text-gray-500">
            {visit.property.postalCode} {visit.property.city}
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {visit.property.type}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {visit.property.surface} m²
            </span>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(visit.property.price)}
            </span>
          </div>
        </div>

        {/* Client info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <User className="h-4 w-4" />
            <span className="font-medium">Client</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {visit.client.firstName} {visit.client.lastName}
          </p>
          <p className="text-gray-500">{visit.client.email}</p>
          <p className="text-gray-500">{visit.client.phone}</p>
        </div>

        {/* Schedule */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Date et heure</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {new Intl.DateTimeFormat("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(visit.scheduledAt)}
          </p>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Notes</span>
          </div>
          <p className="text-gray-700">{visit.notes || "Aucune note"}</p>
        </div>
      </div>
    </div>
  );
}
