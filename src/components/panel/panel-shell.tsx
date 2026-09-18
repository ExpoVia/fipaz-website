"use client";

import { useState, type ReactNode } from "react";

import { PanelMobileDrawer } from "./panel-mobile-drawer";
import { PanelNavbar } from "./panel-navbar";
import { PanelSidebar } from "./panel-sidebar";

interface PanelShellProps {
  children: ReactNode;
}

export function PanelShell({ children }: PanelShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--expo-bg)]">
      <PanelNavbar onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex flex-1 min-h-0">
        <PanelSidebar />
        <PanelMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
