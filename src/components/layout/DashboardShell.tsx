"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardShell({
  children,
  trialDaysLeft = 0,
}: {
  children: React.ReactNode;
  trialDaysLeft?: number;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-page flex h-screen overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} trialDaysLeft={trialDaysLeft} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
