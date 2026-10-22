"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { PanelMobileDrawer } from "./panel-mobile-drawer";
import { PanelNavbar } from "./panel-navbar";
import { PanelSidebar } from "./panel-sidebar";
import {
  accessRoute,
  getActiveCompany,
  getActivePanel,
  getAvailablePanels,
  getRolesForPanel,
  hasPanelAccess,
  requiredPanelForPath,
} from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { ExhibitorProvider } from "./exhibitor-context";
// Registra el vaciado del estado del panel al terminar la sesión (logout o refresh fallido).
import "@/store/panel-store";

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
  const [verification, setVerification] = useState<"checking" | "verified" | "unavailable">("checking");
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
    void verifySession().then((result) => {
      if (!cancelled) setVerification(result === "valid" ? "verified" : result === "unavailable" ? "unavailable" : "checking");
    });
    return () => { cancelled = true; };
  }, [hydrated, verifySession]);

  async function retrySessionVerification() {
    setVerification("checking");
    const result = await verifySession();
    setVerification(result === "valid" ? "verified" : result === "unavailable" ? "unavailable" : "checking");
  }

  useEffect(() => {
    if (!hydrated) return;
    // Sin sesión (nunca la hubo, venció o se cerró): a la pantalla de acceso del panel pedido.
    if (!session) {
      router.replace(accessRoute(required ?? lastPanel.current));
      return;
    }
    if (verification !== "verified") return;
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
  }, [hydrated, session, verification, allowed, required, activePanel, router, setActiveRole]);

  const ready = hydrated && !!session && verification === "verified" && allowed && (!required || activePanel === required);
  const exhibitorCompanyId = ready && activePanel === "expositor" ? getActiveCompany(session)?.id ?? null : null;

  return (
    <ExhibitorProvider key={exhibitorCompanyId ?? "organizador"} companyId={exhibitorCompanyId}>
      <div className="fexpo-panel flex min-h-dvh">
        <PanelSidebar />
        <PanelMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PanelNavbar onMenuClick={() => setDrawerOpen(true)} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
            <div className="mx-auto w-full max-w-[1500px]">
            {verification === "unavailable" && session ? (
              <div className="flex min-h-[35vh] flex-col items-center justify-center gap-3 text-center">
                <p className="font-black text-[var(--expo-navy)]">No pudimos validar tu sesión ahora.</p>
                <p className="max-w-md text-sm text-slate-500">La sesión se conserva. Comprueba la conexión con el servicio e inténtalo de nuevo.</p>
                <button type="button" onClick={() => void retrySessionVerification()} className="rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-4 py-2 text-sm font-black text-[var(--expo-navy)]">
                  Reintentar
                </button>
              </div>
            ) : !ready ? (
              <div className="flex min-h-[35vh] items-center justify-center gap-3 text-sm font-bold text-slate-400">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                Preparando tu panel…
              </div>
            ) : children}
            </div>
          </main>
        </div>
      </div>
    </ExhibitorProvider>
  );
}
