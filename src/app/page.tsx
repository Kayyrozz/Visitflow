import Link from "next/link";
import { ArrowRight, Calendar, Users, BarChart3, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Calendar,
      title: "Planification intelligente",
      description: "Organisez vos visites en quelques clics avec un agenda intégré.",
    },
    {
      icon: Users,
      title: "Gestion des clients",
      description: "Centralisez les informations de vos prospects et clients.",
    },
    {
      icon: BarChart3,
      title: "Rapports & analytics",
      description: "Suivez vos performances avec des tableaux de bord détaillés.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold text-brand-600">VisitFlow</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Gérez vos visites immobilières{" "}
            <span className="text-brand-600">sans effort</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500">
            VisitFlow centralise la planification, le suivi client et les rapports
            pour les agents immobiliers qui veulent gagner du temps.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/register"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700 sm:w-auto"
            >
              Démarrer maintenant <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-gray-200 px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Tout ce dont vous avez besoin
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <feature.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {["Gratuit 14 jours", "Sans carte bancaire", "Annulable à tout moment"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{item}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} VisitFlow. Tous droits réservés.
      </footer>
    </div>
  );
}
