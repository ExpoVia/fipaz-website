"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, ChevronDown, Menu } from "lucide-react";

import { getActivePanel, getActiveRole, getRolesForPanel } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { useExhibitor } from "./exhibitor-context";
import { PanelAccountMenu } from "./panel-account-menu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface PanelNavbarProps {
  onMenuClick: () => void;
}

export function PanelNavbar({ onMenuClick }: PanelNavbarProps) {
  const session = useCompanyAuthStore((state) => state.session);
  const activePanel = getActivePanel(session);
  const activeRole = getActiveRole(session);
  const { stand } = useExhibitor();
  const eventName = activePanel === "expositor" ? stand?.eventName ?? "Evento por asignar" : activeRole?.eventName ?? "Evento por seleccionar";
  const detail = activePanel === "expositor" ? stand ? `Stand ${stand.boothCode}` : "Panel de expositor" : "Panel de organizador";
  const multipleEvents = activePanel === "organizador" && getRolesForPanel(session, "organizador").filter((role) => role.eventId).length > 1;
  const eventContent = <>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0878f9] dark:bg-[#16233D] dark:text-[#1479F5]"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span>
    <span className="min-w-0 text-left"><span className="block truncate text-sm font-extrabold text-[#17254a] dark:text-[#F5F9FF]">{eventName}</span><span className="block truncate text-xs font-medium text-[#7185aa] dark:text-[#B8C7E6]">{detail}</span></span>
    {multipleEvents && <ChevronDown aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-[#6982ab] dark:text-[#B8C7E6]" />}
  </>;

  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between gap-3 border-b border-[#e5edf8] bg-white/95 px-4 backdrop-blur-md sm:px-7 lg:px-9 dark:border-[#223354] dark:bg-[#101A2E]/95">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir navegación del panel"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe8f5] text-[#314b78] hover:bg-[#f1f6fd] lg:hidden dark:border-[#223354] dark:text-[#F5F9FF] dark:hover:bg-[#16233D]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/panel" aria-label="Fexpo, ir al resumen" className="shrink-0 lg:hidden"><Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={104} height={32} priority className="h-auto w-[104px]" /></Link>
        {multipleEvents ? <Link href="/panel/eventos" className="panel-surface hidden min-w-0 items-center gap-3 px-3 py-2.5 hover:border-[#b9d8ff] lg:flex lg:w-[340px] dark:hover:border-[#1479F5]">{eventContent}</Link> : <div className="panel-surface hidden min-w-0 items-center gap-3 px-3 py-2.5 lg:flex lg:w-[340px]">{eventContent}</div>}
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <Link
          href="/"
          className="hidden items-center gap-1 text-xs font-bold text-[#667da3] hover:text-[#0878f9] md:inline-flex dark:text-[#B8C7E6] dark:hover:text-[#1479F5]"
        >
          Ir al sitio <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
        <span aria-hidden="true" className="hidden h-7 w-px bg-[#e3eaf4] md:block dark:bg-[#223354]" />
        <ThemeToggle />
        <PanelAccountMenu />
      </div>
    </header>
  );
}
