"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { PanelMobileDrawer } from "./panel-mobile-drawer";
import { PanelNavbar } from "./panel-navbar";
import { PanelSidebar } from "./panel-sidebar";
import { PANEL_NAVIGATION } from "@/config/panel-navigation";
import { useCompanyAuthStore } from "@/store/company-auth-store";

interface PanelShellProps {
  children: ReactNode;
}

export function PanelShell({ children }: PanelShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const authHydrated = useCompanyAuthStore((state) => state.hasHydrated);
  const session = useCompanyAuthStore((state) => state.session);
  const companyAdmin = session?.role === "company_admin";
  const restrictedOrganizerPage = companyAdmin && PANEL_NAVIGATION.some(
    (item) => item.role === "organizador" && item.href !== "/panel" && pathname.startsWith(item.href),
  );

  useEffect(() => {
    if (restrictedOrganizerPage) router.replace("/panel/mi-stand");
  }, [restrictedOrganizerPage, router]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--expo-bg)]">
      <PanelNavbar onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex flex-1 min-h-0">
        <PanelSidebar />
        <PanelMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            {!authHydrated || restrictedOrganizerPage ? (
              <div className="flex min-h-[35vh] items-center justify-center text-sm font-bold text-slate-400">
                Preparando tu panel…
              </div>
            ) : children}
          </div>
        </main>
      </div>
    </div>
  );
}
