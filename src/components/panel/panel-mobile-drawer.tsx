"use client";

import Image from "next/image";
import Link from "next/link";
import { Drawer } from "vaul";
import { CircleHelp, LogOut } from "lucide-react";

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
        <Drawer.Overlay className="fixed inset-0 z-40 bg-[#102041]/35 lg:hidden" />
        <Drawer.Content
          className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col gap-4 overflow-y-auto border-r border-[#e5edf8] bg-white p-5 shadow-[12px_0_36px_rgb(24_57_104_/_12%)] outline-none lg:hidden"
        >
          <Drawer.Title className="sr-only">Navegación del panel</Drawer.Title>
          <Link href="/panel" onClick={() => onOpenChange(false)} aria-label="Fexpo, ir al resumen" className="mb-4 inline-flex w-fit items-center"><Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={148} height={44} className="h-auto w-[148px]" /></Link>
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#96a6c1]">Espacio de trabajo</p>
          <PanelNavList items={items} onNavigate={() => onOpenChange(false)} />
          {hasSession && (
            <div className="mt-auto flex flex-col gap-1 border-t border-[#e8eef7] pt-3">
              <Link href="/feedback" onClick={() => onOpenChange(false)} className="panel-nav-link"><CircleHelp aria-hidden="true" className="h-4 w-4" />Enviar comentarios</Link>
              <button
                type="button"
                onClick={() => endSession(false)}
                className="panel-nav-link w-full text-left"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Cerrar sesión
              </button>
              <button
                type="button"
                onClick={() => endSession(true)}
                className="panel-nav-link w-full text-left text-xs"
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
