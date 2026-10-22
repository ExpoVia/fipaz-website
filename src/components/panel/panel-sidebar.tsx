"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleHelp, LogOut } from "lucide-react";

import { getPanelNavigationForRole } from "@/config/panel-navigation";
import { getActivePanel } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { PanelNavList } from "./panel-nav-list";

export function PanelSidebar() {
  const activePanel = useCompanyAuthStore((state) => getActivePanel(state.session));
  const logout = useCompanyAuthStore((state) => state.logout);
  // Sin sesión confirmada no se muestra ningún menú: PanelShell ya redirige al acceso.
  const items = activePanel ? getPanelNavigationForRole(activePanel) : [];

  return (
    <aside
      aria-label="Navegación del panel"
      className="panel-sidebar sticky top-0 hidden h-dvh w-[268px] shrink-0 flex-col border-r border-[#e5edf8] bg-white px-5 pb-6 pt-7 lg:flex"
    >
      <Link href="/panel" aria-label="Fexpo, ir al resumen" className="mb-11 inline-flex w-fit items-center px-2">
        <Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={160} height={48} priority className="h-auto w-[148px]" />
      </Link>
      <p className="mb-3 px-4 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#96a6c1]">Espacio de trabajo</p>
      <nav aria-label="Secciones del panel" className="min-h-0 flex-1 overflow-y-auto pr-1">
        <PanelNavList items={items} />
      </nav>
      <div className="mt-5 space-y-1 border-t border-[#e8eef7] pt-4">
        <Link href="/feedback" className="panel-nav-link"><CircleHelp aria-hidden="true" className="h-[18px] w-[18px]" />Enviar comentarios</Link>
        <button type="button" onClick={() => void logout()} className="panel-nav-link w-full text-left"><LogOut aria-hidden="true" className="h-[18px] w-[18px]" />Cerrar sesión</button>
      </div>
    </aside>
  );
}
