import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen dark:bg-gray-950">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-600 p-12 dark:bg-brand-900 lg:flex">
        <Link href="/" className="text-2xl font-bold text-white">
          VisitFlow
        </Link>
        <div>
          <blockquote className="text-xl font-medium text-white">
            &ldquo;VisitFlow a transformé la façon dont je gère mes visites.
            J&apos;économise 3 heures par semaine.&rdquo;
          </blockquote>
          <p className="mt-4 text-brand-200">Sophie Martin — Agent immobilier, Paris</p>
        </div>
        <p className="text-brand-200 text-sm">© {new Date().getFullYear()} VisitFlow</p>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 dark:bg-gray-900 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 block text-center text-xl font-bold text-brand-600 lg:hidden">
            VisitFlow
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
