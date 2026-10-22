"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2, ShieldAlert, Store } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { PasswordAuthForm, type PasswordAuthValues } from "@/components/auth/password-auth-form";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { PanelRole } from "@/config/panel-navigation";
import { isPasswordLoginEnabled } from "@/lib/api/company-auth";
import {
  describeRole,
  getActivePanel,
  getAvailablePanels,
  getRolesForPanel,
  hasPanelAccess,
  PANEL_LABELS,
} from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
// Registra el vaciado del estado del panel al terminar la sesión (logout o refresh fallido).
import "@/store/panel-store";

const COPY: Record<PanelRole | "any", { title: string; description: string }> = {
  expositor: {
    title: "Acceso de expositor",
    description: "Ingresa para gestionar tu participación en la feria.",
  },
  organizador: {
    title: "Acceso de organizador",
    description: "Ingresa para administrar tu evento desde el panel.",
  },
  any: {
    title: "Acceso al panel",
    description: "Ingresa para gestionar tu participación en la feria.",
  },
};

const PANEL_ICONS: Record<PanelRole, typeof Store> = { expositor: Store, organizador: Building2 };

/** Retraso de entrada escalonado (ver `.access-rise` en globals.css). */
const rise = (delayMs: number) => ({ style: { "--access-delay": `${delayMs}ms` } as React.CSSProperties });

const BUTTON_BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-extrabold transition-[filter,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--expo-blue)]";
const PRIMARY_BUTTON = `${BUTTON_BASE} bg-[var(--expo-yellow)] text-[#0f1b5c] hover:brightness-95 dark:bg-[#FFCA35] dark:text-[#0B1220]`;
const SECONDARY_BUTTON = `${BUTTON_BASE} bg-[#0a62d6] text-white hover:brightness-110 dark:bg-[#1479F5]`;

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
  const loginWithPassword = useCompanyAuthStore((state) => state.loginWithPassword);
  const passwordLogin = isPasswordLoginEnabled();
  const setActiveRole = useCompanyAuthStore((state) => state.setActiveRole);
  const logout = useCompanyAuthStore((state) => state.logout);

  const [verification, setVerification] = useState<"checking" | "verified" | "unavailable">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Una sesión guardada puede estar vencida o haber perdido roles: se confirma con el backend una vez.
  useEffect(() => {
    if (!hydrated || !useCompanyAuthStore.getState().session) return;
    let cancelled = false;
    void verifySession().then((result) => {
      if (!cancelled) setVerification(result === "valid" ? "verified" : result === "unavailable" ? "unavailable" : "checking");
    });
    return () => { cancelled = true; };
  }, [hydrated, verifySession]);

  // Sin sesión no hay nada que confirmar; con una guardada, se espera la verificación.
  const checked = hydrated && (verification === "verified" || !session);

  const available = getAvailablePanels(session);
  // El enlace de entrada puede apuntar al otro panel. Tras autenticar, abrir siempre
  // uno de los paneles que el backend asignó a esta cuenta.
  const target = panel && hasPanelAccess(session, panel)
    ? panel
    : getActivePanel(session) ?? available[0] ?? null;

  // Con un rol válido se entra al panel solicitado o al propio de la cuenta.
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
      setVerification("verified"); // La sesión recién creada ya viene confirmada por el backend.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  /** El formulario muestra el error si falla; con sesión nueva, los efectos llevan al panel. */
  async function handlePasswordLogin({ email, password }: PasswordAuthValues) {
    setError("");
    await loginWithPassword(email, password);
    setVerification("verified"); // La sesión recién creada ya viene confirmada por el backend.
  }

  function enter(destination: PanelRole) {
    const role = getRolesForPanel(session, destination)[0];
    if (role) setActiveRole(role.id);
    router.replace("/panel");
  }

  async function retrySessionVerification() {
    setVerification("checking");
    const result = await verifySession();
    setVerification(result === "valid" ? "verified" : result === "unavailable" ? "unavailable" : "checking");
  }

  const copy = COPY[panel ?? "any"];
  const loading = !hydrated || (verification === "checking" && !!session) || (checked && !!session && !!target);

  return (
    <div className="min-h-dvh bg-white text-[#0f1b5c] antialiased dark:bg-[#0B1220] dark:text-[#F5F9FF]">
      <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="relative flex flex-col bg-white lg:items-center lg:justify-center lg:bg-white lg:px-16 lg:py-20 dark:bg-[#0B1220] lg:dark:bg-[#0B1220]">
          {/* Theme Toggle in top right */}
          <div className="absolute right-3 top-3 z-20 sm:right-6 sm:top-4 lg:right-10 lg:top-6">
            <ThemeToggle variant="icon" />
          </div>

          {/* Móvil y tablet: banda de color con ola; en escritorio el contenedor desaparece (lg:contents) y solo queda el texto. */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0a6cf0] via-[#2f5ff0] to-[#6b4df0] px-6 pb-16 pt-20 text-white sm:px-12 lg:contents lg:text-[#0f1b5c] dark:lg:text-[#F5F9FF]">
            <Link
              href="/"
              aria-label="Volver al inicio"
              className="absolute left-3 top-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:left-12 lg:top-6 lg:text-slate-600 lg:hover:bg-transparent lg:hover:text-[var(--expo-blue)] lg:focus-visible:outline-[var(--expo-blue)] sm:left-6 sm:top-4 dark:lg:text-[#B8C7E6] dark:lg:hover:text-[#A9D0FF]"
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">Volver al inicio</span>
            </Link>

            <svg aria-hidden="true" viewBox="0 0 390 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 w-full lg:hidden">
              <path d="M0 34C70 6 150 2 230 24S350 48 390 18V60H0Z" fill="white" fillOpacity="0.18" />
              <path d="M0 46C80 20 170 26 250 40S350 52 390 36V60H0Z" className="fill-white dark:fill-[#0B1220]" />
            </svg>

            <header className="mx-auto w-full max-w-[25rem] text-center">
              <span {...rise(0)} className="access-rise mx-auto mb-5 inline-flex rounded-2xl bg-white px-4 py-2.5 shadow-[0_8px_24px_-10px_rgba(15,27,92,0.55)] lg:hidden dark:bg-[#101A2E] dark:shadow-none dark:border dark:border-[#223354]">
                <Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={132} height={40} priority className="h-8 w-auto" />
              </span>
              <h1 {...rise(0)} className="access-rise text-balance text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[1.05]">
                Bienvenido a <span className="lg:text-[#0a6cf0] dark:lg:text-[#1479F5]">Fexpo</span>
              </h1>
              <h2 className="sr-only">{copy.title}</h2>
              <p {...rise(60)} className="access-rise mx-auto mt-2 max-w-xs text-balance text-base text-white/90 sm:text-lg lg:mt-3 lg:text-slate-600 dark:lg:text-[#B8C7E6]">{copy.description}</p>
            </header>
          </div>

          <div className="mx-auto w-full max-w-[25rem] flex-1 px-6 pb-10 pt-2 sm:px-0 lg:mt-8 lg:flex-none lg:px-0 lg:pb-0 lg:pt-0">
            <div className="flex flex-col">
              {verification === "unavailable" && session ? (
                <div {...rise(120)} className="access-rise flex flex-col items-center gap-3 text-center">
                  <p className="text-lg font-extrabold text-[#0f1b5c] dark:text-[#F5F9FF]">No pudimos validar tu sesión ahora.</p>
                  <p className="text-sm text-slate-600 dark:text-[#B8C7E6]">La sesión se conserva. Comprueba la conexión con el servicio e inténtalo de nuevo.</p>
                  <button type="button" onClick={() => void retrySessionVerification()} className={`${PRIMARY_BUTTON} mt-1 px-6`}>
                    Reintentar
                  </button>
                </div>
              ) : loading ? (
                <div role="status" className="flex min-h-40 items-center justify-center gap-3 text-sm font-semibold text-slate-600 dark:text-[#B8C7E6]">
                  <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
                  {session ? "Entrando a tu panel…" : "Preparando el acceso…"}
                </div>
              ) : session ? (
                <div {...rise(120)} className="access-rise">
                  <NoAccess
                    panel={panel}
                    email={session.email}
                    roleLabels={session.roles.map(describeRole)}
                    availablePanels={available}
                    onEnter={enter}
                    onLogout={() => void logout()}
                  />
                </div>
              ) : (
                <>
                  {/* En móvil el correo va primero y Google debajo de "o continúa con"; en escritorio, al revés. */}
                  <div {...rise(220)} className="access-rise order-4 mt-0 lg:order-1">
                    {busy ? (
                      <div role="status" className="flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-[#B8C7E6]">
                        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> Validando tu cuenta…
                      </div>
                    ) : (
                      <GoogleSignInButton onCredential={(credential) => void handleCredential(credential)} />
                    )}
                  </div>

                  {error && (
                    <p role="alert" className="access-rise order-1 mb-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300 lg:order-2 lg:mb-0 lg:mt-4">
                      {error}
                    </p>
                  )}

                  {passwordLogin && (
                    <>
                      <div {...rise(170)} className="access-rise order-3 my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#B8C7E6] lg:order-3">
                        <span className="h-px flex-1 bg-slate-200 dark:bg-[#223354]" aria-hidden="true" />
                        <span className="lg:hidden">o continúa con</span>
                        <span className="hidden lg:inline">o con tu correo</span>
                        <span className="h-px flex-1 bg-slate-200 dark:bg-[#223354]" aria-hidden="true" />
                      </div>
                      <div {...rise(120)} className="access-rise order-2 lg:order-4">
                        <PasswordAuthForm variant="fexpo" onSubmit={handlePasswordLogin} />
                      </div>
                    </>
                  )}

                  {panel !== "organizador" && (
                    <p {...rise(270)} className="access-rise order-5 mt-6 text-center text-sm text-slate-600 dark:text-[#B8C7E6] lg:mt-5">
                      ¿Todavía no registraste tu empresa?{" "}
                      <Link href="/registro-empresa" className="whitespace-nowrap rounded font-semibold text-[#0a62d6] underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--expo-blue)] dark:text-[#1479F5]">
                        Regístrala aquí
                      </Link>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <div className="relative hidden min-h-dvh overflow-hidden bg-[#dbe8ff] lg:block dark:bg-[#101A2E]">
          <Image
            src="/img/landing/login/login-img1.webp"
            alt="Una expositora gestiona su stand desde la laptop en una feria Fexpo, con avisos de “Gestiona tu stand” y “Conecta con visitantes”."
            fill
            sizes="(min-width: 1024px) 52vw, 0px"
            className="access-settle object-cover object-[50%_60%] dark:opacity-85"
          />
          <div className="pointer-events-none absolute inset-0 hidden bg-[#0B1220]/20 dark:block" />
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
      <span className="flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
        <ShieldAlert aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-2xl font-extrabold text-[#0f1b5c] dark:text-[#F5F9FF]">Sin acceso al panel</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-[#B8C7E6] [overflow-wrap:anywhere]">
        La cuenta <strong>{email}</strong> no tiene permisos para {scope}
        {roleLabels.length > 0 ? ` (tus roles: ${roleLabels.join(", ")}).` : "."}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {availablePanels.map((available) => {
          const Icon = PANEL_ICONS[available];
          return (
            <button
              key={available}
              type="button"
              onClick={() => onEnter(available)}
              className={SECONDARY_BUTTON}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              Entrar como {PANEL_LABELS[available].toLowerCase()}
            </button>
          );
        })}
        {panel !== "organizador" && !availablePanels.includes("expositor") && (
          <Link
            href="/registro-empresa"
            className={PRIMARY_BUTTON}
          >
            Registrar mi empresa
          </Link>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="min-h-11 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0f1b5c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--expo-blue)] dark:text-[#B8C7E6] dark:hover:bg-[#16233D] dark:hover:text-[#F5F9FF]"
        >
          Cerrar sesión
        </button>
      </div>

      {panel === "organizador" && (
        <p className="mt-4 text-sm text-slate-600 dark:text-[#B8C7E6]">
          El rol de organizador lo asigna la administración de la plataforma. Si deberías tenerlo, pídelo con este mismo correo.
        </p>
      )}
    </div>
  );
}
