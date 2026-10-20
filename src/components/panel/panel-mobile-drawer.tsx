"use client";

import { Drawer } from "vaul";
import { LogOut } from "lucide-react";

import { getPanelNavigationForRole } from "@/config/panel-navigation";
import { getActivePanel } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { PanelNavList } from "./panel-nav-list";

interface PanelMobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PanelMobileDrawer({ open, onOpenChange }: PanelMobileDrawerProps) {
  const activePanel = useCompanyAuthStore((state) => getActivePanel(state.session));
  const hasSession = useCompanyAuthStore((state) => Boolean(state.session));
  const logout = useCompanyAuthStore((state) => state.logout);
  const logoutAll = useCompanyAuthStore((state) => state.logoutAll);
  const items = activePanel ? getPanelNavigationForRole(activePanel) : [];

  function endSession(everywhere: boolean) {
    onOpenChange(false);
    // PanelShell detecta que ya no hay sesión y redirige a la pantalla de acceso de este panel.
    void (everywhere ? logoutAll() : logout());
  }

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
        <Drawer.Content
          className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col gap-4 border-r-2 border-[var(--expo-navy)] bg-[var(--expo-card)] p-4 outline-none lg:hidden"
        >
          <Drawer.Title className="sr-only">Navegación del panel</Drawer.Title>
          <PanelNavList items={items} onNavigate={() => onOpenChange(false)} />
          {hasSession && (
            <div className="mt-auto flex flex-col gap-1 border-t border-[var(--expo-line)] pt-3">
              <button
                type="button"
                onClick={() => endSession(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-bold text-[var(--expo-navy)] hover:bg-[var(--expo-bg)]"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Cerrar sesión
              </button>
              <button
                type="button"
                onClick={() => endSession(true)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold text-slate-500 hover:bg-[var(--expo-bg)]"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Cerrar sesión en todos los dispositivos
              </button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
