"use client";

import { getPanelNavigationForRole } from "@/config/panel-navigation";
import { getActivePanel } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { PanelNavList } from "./panel-nav-list";

export function PanelSidebar() {
  const activePanel = useCompanyAuthStore((state) => getActivePanel(state.session));
  // Sin sesión confirmada no se muestra ningún menú: PanelShell ya redirige al acceso.
  const items = activePanel ? getPanelNavigationForRole(activePanel) : [];

  return (
    <aside
      aria-label="Navegación del panel"
      className="hidden w-64 shrink-0 border-r-2 border-[var(--expo-line)] bg-white px-4 py-6 lg:flex lg:flex-col"
    >
      <PanelNavList items={items} />
    </aside>
  );
}
