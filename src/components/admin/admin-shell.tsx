"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Drawer } from "vaul";
import { clsx } from "clsx";
import { Menu } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { getAdminNavigation } from "@/config/admin-navigation";
import type { AdminNavigationItem } from "@/config/admin-navigation";
import { ADMIN_DEFAULT_EVENT_ID, ADMIN_DEFAULT_STAND_ID } from "@/features/admin/admin-scope";
import type { AdminScope } from "@/features/admin/admin-scope";
import { MockControls } from "./mock-controls";
import { ToastProvider } from "./toast";

/** Stand y evento de la URL actual; fuera de una ruta con contexto, los de la cuenta por defecto. */
function useAdminScope(): AdminScope {
  const params = useParams<{ standId?: string; eventId?: string }>();
  return {
    standId: typeof params.standId === "string" ? params.standId : ADMIN_DEFAULT_STAND_ID,
    eventId: typeof params.eventId === "string" ? params.eventId : ADMIN_DEFAULT_EVENT_ID,
  };
}

function isItemActive(pathname: string, item: AdminNavigationItem): boolean {
  // Resumen es la raíz del módulo: solo está activo en la ruta exacta.
  if (item.id === "resumen") return pathname === item.href;
  return pathname.startsWith(item.href) || item.activePrefixes.some((prefix) => pathname.startsWith(prefix));
}

function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = getAdminNavigation(useAdminScope());

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isItemActive(pathname, item);
        const Icon = item.icon;

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors",
                active
                  ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[3px_3px_0_var(--expo-navy)]"
                  : "border-transparent text-[var(--expo-navy)] hover:bg-[var(--expo-bg)]",
              )}
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-2 border-[var(--expo-line)] bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir navegación de administración"
          className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] p-2 text-[var(--expo-navy)] hover:bg-slate-100 lg:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
        <BrandMark />
        <span className="pixel-label hidden rounded-md border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-2 py-1 text-[var(--expo-navy)] sm:inline-block">
          Administración
        </span>
      </div>

      <Link href="/panel" className="text-xs font-bold text-[var(--expo-blue)] hover:underline">
        Volver al panel
      </Link>
    </header>
  );
}

function AdminSidebar() {
  return (
    <aside
      aria-label="Navegación de administración"
      className="hidden w-64 shrink-0 border-r-2 border-[var(--expo-line)] bg-white px-4 py-6 lg:flex lg:flex-col lg:gap-6"
    >
      <nav aria-label="Módulos de administración">
        <AdminNavList />
      </nav>
      <div className="mt-auto">
        <MockControls />
      </div>
    </aside>
  );
}

function AdminMobileDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer.Root direction="left" open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
        <Drawer.Content className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col gap-6 overflow-y-auto border-r-2 border-[var(--expo-navy)] bg-[var(--expo-card)] p-4 outline-none lg:hidden">
          <Drawer.Title className="sr-only">Navegación de administración</Drawer.Title>
          <Drawer.Description className="sr-only">Módulos del panel de administración</Drawer.Description>
          <nav aria-label="Módulos de administración">
            <AdminNavList onNavigate={() => onOpenChange(false)} />
          </nav>
          <div className="mt-auto">
            <MockControls />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col bg-[var(--expo-bg)]">
        <a
          href="#admin-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-black focus:text-[var(--expo-navy)]"
        >
          Saltar al contenido
        </a>
        <AdminNavbar onMenuClick={() => setDrawerOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <AdminSidebar />
          <AdminMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
          <main id="admin-content" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
