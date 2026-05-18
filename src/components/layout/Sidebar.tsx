"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  Building2,
  X,
  MessageCircle,
  UsersRound,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/visits", label: "Visites", icon: Calendar },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/biens", label: "Biens", icon: Building2 },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/reports", label: "Rapports", icon: BarChart3 },
  { href: "/equipe", label: "Équipe", icon: UsersRound },
  { href: "/contact", label: "Support", icon: MessageCircle },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0 lg:z-auto lg:transition-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo + fermeture mobile */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
        <span className="text-xl font-bold text-brand-600 dark:text-brand-400">VisitFlow</span>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Paramètres */}
      <div className="border-t border-gray-200 px-3 py-4 dark:border-gray-700">
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          )}
        >
          <Settings className="h-5 w-5" />
          Paramètres
        </Link>
      </div>
    </aside>
  );
}
