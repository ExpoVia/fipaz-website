"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Info, Loader2 } from "lucide-react";

import { PanelMobileDrawer } from "./panel-mobile-drawer";
import { PanelNavbar } from "./panel-navbar";
import { PanelSidebar } from "./panel-sidebar";
import {
  accessRoute,
  getActivePanel,
  getAvailablePanels,
  getRolesForPanel,
  hasPanelAccess,
  requiredPanelForPath,
} from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";

interface PanelShellProps {
  children: ReactNode;
}

/**
 * Guard de todo `/panel/*`. Exige una sesión real y que su rol dé acceso a la sección:
 * las rutas de expositor piden un rol de empresa y las de organizador, un rol de evento.
 * `/panel` (el resumen) es común y muestra la vista del rol activo.
 */
export function PanelShell({ children }: PanelShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useCompanyAuthStore((state) => state.hasHydrated);
  const session = useCompanyAuthStore((state) => state.session);
  const verifySession = useCompanyAuthStore((state) => state.verifySession);
  const setActiveRole = useCompanyAuthStore((state) => state.setActiveRole);

  const required = requiredPanelForPath(pathname);
  const activePanel = getActivePanel(session);
  // Al cerrar sesión el rol activo ya no existe: se recuerda el último panel para volver a su acceso.
  const lastPanel = useRef(activePanel);
  useEffect(() => {
    if (activePanel) lastPanel.current = activePanel;
  }, [activePanel]);
  const allowed = required
    ? hasPanelAccess(session, required)
    : getAvailablePanels(session).length > 0;

  // Al entrar se confirma la sesión y los roles con el backend (un rol revocado deja de valer al instante).
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    void verifySession().then((valid) => {
      if (!cancelled) setVerified(valid);
    });
    return () => { cancelled = true; };
  }, [hydrated, verifySession]);

  useEffect(() => {
    if (!hydrated) return;
    // Sin sesión (nunca la hubo, venció o se cerró): a la pantalla de acceso del panel pedido.
    if (!session) {
      router.replace(accessRoute(required ?? lastPanel.current));
      return;
    }
    if (!verified) return;
    // Sesión válida pero sin el rol que exige la ruta: la pantalla de acceso explica por qué.
    if (!allowed) {
      router.replace(accessRoute(required));
      return;
    }
    // La ruta es de otro panel al que la cuenta también tiene acceso: se cambia el rol activo.
    if (required && activePanel !== required) {
      const role = getRolesForPanel(session, required)[0];
      if (role) setActiveRole(role.id);
    }
  }, [hydrated, session, verified, allowed, required, activePanel, router, setActiveRole]);

  const ready = hydrated && !!session && verified && allowed;

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--expo-bg)]">
      <PanelNavbar onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex flex-1 min-h-0">
        <PanelSidebar />
        <PanelMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            {!ready ? (
              <div className="flex min-h-[35vh] items-center justify-center gap-3 text-sm font-bold text-slate-400">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                Preparando tu panel…
              </div>
            ) : (
              <>
                <p className="mb-5 flex items-start gap-2 rounded-xl border-2 border-[var(--expo-blue)] bg-white px-3 py-2.5 text-xs font-medium leading-5 text-[var(--expo-navy)]">
                  <Info size={16} className="mt-0.5 shrink-0 text-[var(--expo-blue)]" aria-hidden="true" />
                  <span><strong>Datos de demostración.</strong> Perfiles, stands, promociones, premios, visitas, prospectos, puntos y métricas son ejemplos; las fechas y el recinto de FIPAZ están sujetos a confirmación.</span>
                </p>
                {children}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
