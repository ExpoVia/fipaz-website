"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2, ShieldAlert, Store } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { BrandMark } from "@/components/shared/brand-mark";
import type { PanelRole } from "@/config/panel-navigation";
import {
  describeRole,
  getAvailablePanels,
  getRolesForPanel,
  hasPanelAccess,
  PANEL_LABELS,
} from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";

const COPY: Record<PanelRole | "any", { title: string; description: string }> = {
  expositor: {
    title: "Acceso de expositor",
    description: "Entra con la cuenta de Google con la que registraste tu empresa para gestionar tu stand.",
  },
  organizador: {
    title: "Acceso de organizador",
    description: "Entra con la cuenta de Google a la que se le asignó la administración de un evento.",
  },
  any: {
    title: "Acceso al panel",
    description: "Entra con Google. Te llevamos al panel que corresponde a tu cuenta.",
  },
};

const PANEL_ICONS: Record<PanelRole, typeof Store> = { expositor: Store, organizador: Building2 };

interface AccessScreenProps {
  /** Panel al que la persona intentaba entrar (viene de `/acceso?panel=`). */
  panel: PanelRole | null;
}

/**
 * Pantalla de acceso compartida por los dos paneles. No hay "cuentas de organizador" o de expositor:
 * es la misma cuenta de Google y los roles de `GET /auth/me` deciden a qué panel entra.
 */
export function AccessScreen({ panel }: AccessScreenProps) {
  const router = useRouter();
  const hydrated = useCompanyAuthStore((state) => state.hasHydrated);
  const session = useCompanyAuthStore((state) => state.session);
  const verifySession = useCompanyAuthStore((state) => state.verifySession);
  const loginWithGoogle = useCompanyAuthStore((state) => state.loginWithGoogle);
  const setActiveRole = useCompanyAuthStore((state) => state.setActiveRole);
  const logout = useCompanyAuthStore((state) => state.logout);

  const [verifiedOnce, setVerifiedOnce] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Una sesión guardada puede estar vencida o haber perdido roles: se confirma con el backend una vez.
  useEffect(() => {
    if (!hydrated || !useCompanyAuthStore.getState().session) return;
    let cancelled = false;
    void verifySession().then(() => { if (!cancelled) setVerifiedOnce(true); });
    return () => { cancelled = true; };
  }, [hydrated, verifySession]);

  // Sin sesión no hay nada que confirmar; con una guardada, se espera la verificación.
  const checked = hydrated && (verifiedOnce || !session);

  const available = getAvailablePanels(session);
  const target = panel && hasPanelAccess(session, panel) ? panel : panel ? null : available[0] ?? null;

  // Con acceso al panel pedido (o a alguno, si no se pidió uno) se entra directo.
  useEffect(() => {
    if (!checked || !session || !target) return;
    const role = getRolesForPanel(session, target)[0];
    if (role) setActiveRole(role.id);
    router.replace("/panel");
  }, [checked, session, target, setActiveRole, router]);

  async function handleCredential(idToken: string) {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle(idToken);
      setVerifiedOnce(true); // La sesión recién creada ya viene confirmada por el backend.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  function enter(destination: PanelRole) {
    const role = getRolesForPanel(session, destination)[0];
    if (role) setActiveRole(role.id);
    router.replace("/panel");
  }

  const copy = COPY[panel ?? "any"];
  const loading = !hydrated || !checked || (!!session && !!target);

  return (
    <div className="min-h-dvh bg-[var(--expo-bg)] text-[var(--expo-navy)] antialiased">
      <header className="border-b-2 border-[var(--expo-line)] bg-white py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[var(--expo-blue)]">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Volver al inicio
          </Link>
          <BrandMark />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="rounded-2xl border-2 border-[var(--expo-navy)] bg-white p-6 shadow-[5px_5px_0_var(--expo-navy)]">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-bold text-slate-400">
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              {session ? "Entrando a tu panel…" : "Preparando el acceso…"}
            </div>
          ) : session ? (
            <NoAccess
              panel={panel}
              email={session.email}
              roleLabels={session.roles.map(describeRole)}
              availablePanels={available}
              onEnter={enter}
              onLogout={() => void logout()}
            />
          ) : (
            <>
              <h1 className="text-2xl font-black">{copy.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{copy.description}</p>

              <div className="mt-6">
                {busy ? (
                  <div className="flex min-h-11 items-center justify-center gap-2 text-sm font-black">
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> Validando tu cuenta…
                  </div>
                ) : (
                  <GoogleSignInButton onCredential={(credential) => void handleCredential(credential)} />
                )}
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-xl border-2 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {error}
                </p>
              )}

              {panel !== "organizador" && (
                <p className="mt-6 text-center text-sm text-slate-500">
                  ¿Todavía no registraste tu empresa?{" "}
                  <Link href="/registro-empresa" className="font-black text-[var(--expo-blue)] hover:underline">
                    Regístrala aquí
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

interface NoAccessProps {
  panel: PanelRole | null;
  email: string;
  roleLabels: string[];
  availablePanels: PanelRole[];
  onEnter: (panel: PanelRole) => void;
  onLogout: () => void;
}

/** La sesión es válida pero la cuenta no tiene el rol que el panel exige. */
function NoAccess({ panel, email, roleLabels, availablePanels, onEnter, onLogout }: NoAccessProps) {
  const scope = panel ? `el panel de ${PANEL_LABELS[panel].toLowerCase()}` : "ningún panel";

  return (
    <div>
      <span className="flex size-12 items-center justify-center rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-coral)] text-white shadow-[3px_3px_0_var(--expo-navy)]">
        <ShieldAlert aria-hidden="true" className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-2xl font-black">Sin acceso al panel</h1>
      <p className="mt-2 text-sm text-slate-600">
        La cuenta <strong>{email}</strong> no tiene permisos para {scope}
        {roleLabels.length > 0 ? ` (tus roles: ${roleLabels.join(", ")}).` : "."}
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {availablePanels.map((available) => {
          const Icon = PANEL_ICONS[available];
          return (
            <button
              key={available}
              type="button"
              onClick={() => onEnter(available)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-4 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_var(--expo-navy)]"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              Entrar como {PANEL_LABELS[available].toLowerCase()}
            </button>
          );
        })}
        {panel !== "organizador" && !availablePanels.includes("expositor") && (
          <Link
            href="/registro-empresa"
            className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-4 py-2.5 text-sm font-black shadow-[3px_3px_0_var(--expo-navy)]"
          >
            Registrar mi empresa
          </Link>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm font-black text-slate-600 hover:border-slate-400"
        >
          Cerrar sesión
        </button>
      </div>

      {panel === "organizador" && (
        <p className="mt-4 text-xs text-slate-500">
          El rol de organizador lo asigna la administración de la plataforma. Si deberías tenerlo, pídelo con este mismo correo.
        </p>
      )}
    </div>
  );
}
