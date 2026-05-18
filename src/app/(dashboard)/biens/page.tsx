import type { Metadata } from "next";
import BienList from "@/components/biens/BienList";
import NewBienModal from "@/components/biens/NewBienModal";

export const metadata: Metadata = { title: "Biens" };

export default function BiensPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biens</h1>
          <p className="text-gray-500">Gérez votre portefeuille immobilier</p>
        </div>
        <NewBienModal />
      </div>

      <BienList />
    </div>
  );
}
