"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { ArrowLeft, Loader2, Lock, Menu } from "lucide-react";

import { DemoBadge } from "@/components/shared/demo-badge";
import { getAdminNavigation } from "@/config/admin-navigation";
import type { AdminNavigationItem } from "@/config/admin-navigation";
import type { PanelRole } from "@/config/panel-navigation";
import { API_MODE } from "@/lib/api/config";
import { ADMIN_DEFAULT_EVENT_ID, ADMIN_DEFAULT_STAND_ID } from "@/features/admin/admin-scope";
import type { AdminScope } from "@/features/admin/admin-scope";
import { ToastProvider } from "./toast";
import { accessRoute, hasPanelAccess } from "@/lib/panel-access";
import { isSessionValid, useCompanyAuthStore } from "@/store/company-auth-store";
// Registra el vaciado del estado del panel al terminar la sesión (logout o refresh fallido).
import "@/store/panel-store";

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

/**
 * Panel (rol) que exige una ruta de `/admin` con sesión real: premios e inventario son del evento
 * y los gestiona el organizador; dinámicas, actividades, escáner y empresa son del expositor.
 * El backend vuelve a validar el alcance (empresa/evento) en cada petición.
 */
function requiredAdminPanel(pathname: string): PanelRole {
  return pathname.startsWith("/admin/events/") ? "organizador" : "expositor";
}

function isItemActive(pathname: string, item: AdminNavigationItem): boolean {
  // Resumen es la raíz del módulo: solo está activo en la ruta exacta.
  if (item.id === "resumen") return pathname === item.href;
  return pathname.startsWith(item.href) || item.activePrefixes.some((prefix) => pathname.startsWith(prefix));
}

function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const session = useCompanyAuthStore((state) => state.session);
  const params = useParams<{ standId?: string; eventId?: string }>();
  const allItems = getAdminNavigation(useAdminScope());
  const isCompanyItem = (item: AdminNavigationItem) => item.id === "company-profile" || item.id === "company-stands";
  const demoModules = isDemoModulesRoute(pathname);
  // Modo demostración: los módulos simulados se ven sin sesión; el perfil de empresa sigue pidiéndola.
  const isExhibitor = isSessionValid(session) && hasPanelAccess(session, "expositor");
  const isOrganizer = isSessionValid(session) && hasPanelAccess(session, "organizador");
  // Con backend real los ids por defecto son de la demo (no UUID): un módulo solo se enlaza
  // cuando la URL ya trae el stand o el evento reales.
  const hasStand = typeof params.standId === "string";
  const hasEvent = typeof params.eventId === "string";
  const items = demoModules
    ? allItems.filter((item) => !isCompanyItem(item) || isExhibitor)
    : allItems.filter((item) => {
        if (isCompanyItem(item)) return isExhibitor;
        if (item.id === "resumen") return false;
        if (item.id === "premios" || item.id === "inventario") return isOrganizer && hasEvent;
        return isExhibitor && hasStand;
      });

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
              className="panel-nav-link"
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
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between gap-3 border-b border-[#e5edf8] bg-white/95 px-4 backdrop-blur-md sm:px-7 lg:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir navegación de administración"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe8f5] text-[#314b78] hover:bg-[#f1f6fd] lg:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
        <Link href="/panel" aria-label="Fexpo, volver al panel" className="lg:hidden"><Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={104} height={32} priority className="h-auto w-[104px]" /></Link>
        <div className="panel-surface hidden items-center gap-3 px-4 py-2.5 sm:flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0878f9]"><Lock aria-hidden="true" className="h-5 w-5" /></span>
          <span><span className="block text-sm font-extrabold text-[#17254a]">Administración</span><span className="block text-xs font-medium text-[#7185aa]">Gestión de stands y eventos</span></span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Link href="/panel" className="inline-flex items-center gap-1 text-xs font-bold text-[#0878f9] hover:underline">
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Volver al panel</span><span className="sm:hidden">Panel</span>
        </Link>
        {!demoModules && (
          <button type="button" onClick={onLogout} className="hidden text-xs font-bold text-[#667da3] hover:text-[#0878f9] sm:inline">
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
      className="panel-sidebar sticky top-0 hidden h-dvh w-[268px] shrink-0 flex-col border-r border-[#e5edf8] bg-white px-5 pb-6 pt-7 lg:flex"
    >
      <Link href="/panel" aria-label="Fexpo, volver al panel" className="mb-11 inline-flex w-fit items-center px-2"><Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={160} height={48} priority className="h-auto w-[148px]" /></Link>
      <p className="mb-3 px-4 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#96a6c1]">Administración</p>
      <nav aria-label="Módulos de administración" className="min-h-0 flex-1 overflow-y-auto pr-1">
        <AdminNavList />
      </nav>
      <Link href="/panel" className="panel-nav-link mt-5 border-t border-[#e8eef7] pt-4"><ArrowLeft aria-hidden="true" className="h-[18px] w-[18px]" />Volver al panel</Link>
    </aside>
  );
}

function AdminMobileDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer.Root direction="left" open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
        <Drawer.Content className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col gap-6 overflow-y-auto border-r border-[#e5edf8] bg-white p-5 outline-none lg:hidden">
          <Drawer.Title className="sr-only">Navegación de administración</Drawer.Title>
          <Drawer.Description className="sr-only">Módulos del panel de administración</Drawer.Description>
          <Link href="/panel" onClick={() => onOpenChange(false)} aria-label="Fexpo, volver al panel"><Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={140} height={42} className="h-auto w-[140px]" /></Link>
          <p className="-mb-4 px-3 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#96a6c1]">Administración</p>
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
  const requiredPanel = requiredAdminPanel(pathname);
  const companyAdmin = isSessionValid(session) && hasPanelAccess(session, requiredPanel) && sessionVerification === "verified";

  const demoModules = isDemoModulesRoute(pathname);

  useEffect(() => {
    if (demoModules || !authHydrated) return;
    if (!hasSession) {
      router.replace(accessRoute(requiredPanel));
      return;
    }
    let cancelled = false;
    void verifySession().then((result) => {
      if (cancelled) return;
      if (result === "valid" && hasPanelAccess(useCompanyAuthStore.getState().session, requiredPanel)) {
        setSessionVerification("verified");
      }
      else if (result === "unavailable") setSessionVerification("unavailable");
      else router.replace(accessRoute(requiredPanel));
    });
    return () => { cancelled = true; };
  }, [demoModules, authHydrated, hasSession, session?.accessToken, requiredPanel, verifySession, router]);

  async function retrySessionVerification() {
    setSessionVerification("checking");
    const result = await verifySession();
    if (result === "valid" && hasPanelAccess(useCompanyAuthStore.getState().session, requiredPanel)) {
      setSessionVerification("verified");
    }
    else if (result === "unavailable") setSessionVerification("unavailable");
    else router.replace(accessRoute(requiredPanel));
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
      <div className="fexpo-panel flex min-h-dvh bg-[#f4f8fd]">
        <a
          href="#admin-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-black focus:text-[var(--expo-navy)]"
        >
          Saltar al contenido
        </a>
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminNavbar onMenuClick={() => setDrawerOpen(true)} onLogout={() => void logout()} demoModules={demoModules} />
          <AdminMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
          <main id="admin-content" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
            <div className="mx-auto w-full max-w-[1440px]">
              {demoModules && (
                <p className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border-2 border-[var(--expo-blue)] bg-white px-3 py-2.5 text-xs font-medium leading-5 text-[var(--expo-navy)]">
                  <DemoBadge label="Prototipo · datos de demostración" />
                  Gestión del stand con datos simulados: no se guarda nada fuera de este navegador.
                </p>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
