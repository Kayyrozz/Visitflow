import Link from "next/link";

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <Link href="/dashboard" className="text-xl font-bold text-brand-400">
          VisitFlow
        </Link>
      </header>
      {children}
    </div>
  );
}
