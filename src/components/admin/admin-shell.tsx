"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { clsx } from "clsx";
import { Loader2, Lock, Menu } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { DemoBadge } from "@/components/shared/demo-badge";
import { getAdminNavigation } from "@/config/admin-navigation";
import type { AdminNavigationItem } from "@/config/admin-navigation";
import { API_MODE } from "@/lib/api/config";
import { ADMIN_DEFAULT_EVENT_ID, ADMIN_DEFAULT_STAND_ID } from "@/features/admin/admin-scope";
import type { AdminScope } from "@/features/admin/admin-scope";
import { ToastProvider } from "./toast";
import { isSessionValid, useCompanyAuthStore } from "@/store/company-auth-store";

/** Stand y evento de la URL actual; fuera de una ruta con contexto, los de la cuenta por defecto. */
function useAdminScope(): AdminScope {
  const params = useParams<{ standId?: string; eventId?: string }>();
  return {
    standId: typeof params.standId === "string" ? params.standId : ADMIN_DEFAULT_STAND_ID,
    eventId: typeof params.eventId === "string" ? params.eventId : ADMIN_DEFAULT_EVENT_ID,
  };
}

/**
 * Con datos simulados (`API_MODE=mock`, el modo de la demo) los módulos de gestión son de
 * acceso abierto: no hay backend ni datos reales que proteger. Las pantallas de empresa
 * (`/admin/company/*`) usan la API de cuentas reales y siguen exigiendo sesión.
 */
function isDemoModulesRoute(pathname: string): boolean {
  return API_MODE === "mock" && !pathname.startsWith("/admin/company");
}

function isItemActive(pathname: string, item: AdminNavigationItem): boolean {
  // Resumen es la raíz del módulo: solo está activo en la ruta exacta.
  if (item.id === "resumen") return pathname === item.href;
  return pathname.startsWith(item.href) || item.activePrefixes.some((prefix) => pathname.startsWith(prefix));
}

function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const session = useCompanyAuthStore((state) => state.session);
  const allItems = getAdminNavigation(useAdminScope());
  const isCompanyItem = (item: AdminNavigationItem) => item.id === "company-profile" || item.id === "company-stands";
  const demoModules = isDemoModulesRoute(pathname);
  // Modo demostración: los módulos simulados se ven sin sesión; el perfil de empresa sigue pidiéndola.
  const items = demoModules
    ? allItems.filter((item) => !isCompanyItem(item) || isSessionValid(session))
    : isSessionValid(session)
      ? allItems.filter(isCompanyItem)
      : [];

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

function AdminNavbar({ onMenuClick, onLogout, demoModules }: { onMenuClick: () => void; onLogout: () => void; demoModules: boolean }) {
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

      <div className="flex items-center gap-4">
        <Link href="/panel" className="text-xs font-bold text-[var(--expo-blue)] hover:underline">
          Volver al panel
        </Link>
        {!demoModules && (
          <button type="button" onClick={onLogout} className="text-xs font-bold text-[var(--expo-blue)] hover:underline">
            Cerrar sesión
          </button>
        )}
      </div>
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const authHydrated = useCompanyAuthStore((state) => state.hasHydrated);
  const session = useCompanyAuthStore((state) => state.session);
  const hasSession = Boolean(session);
  const verifySession = useCompanyAuthStore((state) => state.verifySession);
  const logout = useCompanyAuthStore((state) => state.logout);
  const [sessionVerification, setSessionVerification] = useState<"checking" | "verified" | "unavailable">("checking");
  const companyAdmin = isSessionValid(session) && sessionVerification === "verified";

  const demoModules = isDemoModulesRoute(pathname);

  useEffect(() => {
    if (demoModules || !authHydrated) return;
    if (!hasSession) {
      router.replace("/registro-empresa");
      return;
    }
    let cancelled = false;
    void verifySession().then((result) => {
      if (cancelled) return;
      if (result === "valid") setSessionVerification("verified");
      else if (result === "unavailable") setSessionVerification("unavailable");
      else {
        logout();
        router.replace("/registro-empresa");
      }
    });
    return () => { cancelled = true; };
  }, [demoModules, authHydrated, hasSession, session?.accessToken, verifySession, logout, router]);

  useEffect(() => {
    if (!demoModules && companyAdmin && pathname !== "/admin/company/profile" && pathname !== "/admin/company/stands") {
      router.replace("/admin/company/profile");
    }
  }, [demoModules, companyAdmin, pathname, router]);

  const restrictedCompanyRoute = !demoModules && (!authHydrated || (companyAdmin && pathname !== "/admin/company/profile" && pathname !== "/admin/company/stands"));

  async function retrySessionVerification() {
    setSessionVerification("checking");
    const result = await verifySession();
    if (result === "valid") setSessionVerification("verified");
    else if (result === "unavailable") setSessionVerification("unavailable");
    else {
      logout();
      router.replace("/registro-empresa");
    }
  }

  if (!demoModules && authHydrated && session && sessionVerification === "unavailable") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[var(--expo-bg)] px-5 text-center">
        <p className="font-black text-[var(--expo-navy)]">No se pudo validar la sesión de empresa.</p>
        <p className="max-w-md text-sm text-slate-500">La sesión se conserva. El servicio de autenticación no responde ahora; inténtalo de nuevo cuando la conexión esté disponible.</p>
        <button
          type="button"
          onClick={() => void retrySessionVerification()}
          className="rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-4 py-2 text-sm font-black text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!demoModules && (!authHydrated || !companyAdmin)) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-3 bg-[var(--expo-bg)] text-sm font-bold text-slate-400">
        {authHydrated && !session ? <Lock aria-hidden="true" size={18} /> : <Loader2 aria-hidden="true" className="animate-spin" size={18} />}
        <span>{authHydrated && !session ? "Necesitas una sesión de empresa para entrar." : "Verificando sesión de empresa…"}</span>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col bg-[var(--expo-bg)]">
        <a
          href="#admin-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-black focus:text-[var(--expo-navy)]"
        >
          Saltar al contenido
        </a>
        <AdminNavbar onMenuClick={() => setDrawerOpen(true)} onLogout={logout} demoModules={demoModules} />
        <div className="flex min-h-0 flex-1">
          <AdminSidebar />
          <AdminMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
          <main id="admin-content" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">
              {demoModules && (
                <p className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border-2 border-[var(--expo-blue)] bg-white px-3 py-2.5 text-xs font-medium leading-5 text-[var(--expo-navy)]">
                  <DemoBadge label="Prototipo · datos de demostración" />
                  Gestión del stand con datos simulados: no se guarda nada fuera de este navegador.
                </p>
              )}
              {restrictedCompanyRoute ? null : children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
