"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { getPanelNavigationForRole, PANEL_NAVIGATION } from "@/config/panel-navigation";
import { usePanelStore } from "@/store/panel-store";
import { PanelNavList } from "./panel-nav-list";

/**
 * Si alguien navega manualmente a una URL exclusiva del otro rol (ej. escribe
 * la URL a mano), el rol activo se corrige para que el sidebar no quede
 * mostrando una selección incoherente con la página visible.
 */
function usePanelRoleSync() {
  const pathname = usePathname();
  const activeRole = usePanelStore((state) => state.activeRole);
  const setActiveRole = usePanelStore((state) => state.setActiveRole);

  useEffect(() => {
    if (pathname === "/panel") return;
    const owner = PANEL_NAVIGATION.find(
      (item) => item.href !== "/panel" && pathname.startsWith(item.href),
    );
    if (owner && owner.role !== activeRole) {
      setActiveRole(owner.role);
    }
  }, [pathname, activeRole, setActiveRole]);
}

export function PanelSidebar() {
  usePanelRoleSync();
  const activeRole = usePanelStore((state) => state.activeRole);
  const items = getPanelNavigationForRole(activeRole);

  return (
    <aside
      aria-label="Navegación del panel"
      className="hidden w-64 shrink-0 border-r-2 border-[var(--expo-line)] bg-white px-4 py-6 lg:flex lg:flex-col"
    >
      <PanelNavList items={items} />
    </aside>
  );
}
