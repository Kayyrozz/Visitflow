"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Clock } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import NotificationsDropdown from "@/components/layout/NotificationsDropdown";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header({
  onMenuClick,
  trialDaysLeft = 0,
}: {
  onMenuClick?: () => void;
  trialDaysLeft?: number;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("Agent");

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.name ?? user.email ?? "");
        setUserRole(user.app_metadata?.role ?? "Agent");
      }
    });
  }, []);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900 md:px-6">
      {/* Hamburger mobile */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 md:gap-3">
        {trialDaysLeft > 0 && (
          <Link
            href="/subscribe"
            className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>
              {trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""} d&apos;essai
            </span>
          </Link>
        )}

        <ThemeToggle />
        <NotificationsDropdown />

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-brand-600 text-xs md:text-sm font-medium text-white">
            {getInitials(userName)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName || "…"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
          title="Se déconnecter"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
