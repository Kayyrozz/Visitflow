import type { Metadata } from "next";
import ClientList from "@/components/clients/ClientList";
import NewClientModal from "@/components/clients/NewClientModal";

export const metadata: Metadata = {
  title: "Clients",
};

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">Gérez votre portefeuille clients</p>
        </div>
        <NewClientModal />
      </div>

      <ClientList />
    </div>
  );
}
