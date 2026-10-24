"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  HeartPulse,
  Landmark,
  Laptop,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Rocket,
  ShieldCheck,
  Tag,
  UsersRound,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { CompanyIllustration } from "@/components/registration/CompanyIllustration";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  PasswordAuthForm,
  type PasswordAuthMode,
  type PasswordAuthValues,
} from "@/components/auth/password-auth-form";
import { categories } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { createCompany } from "@/lib/api/companies";
import { isPasswordLoginEnabled, type RoleAssignment } from "@/lib/api/company-auth";
import { hasPanelAccess } from "@/lib/panel-access";
import type { StandCategory } from "@/types/demo";
import styles from "./registration-form.module.css";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_STEPS = 2;

const PARTICIPATION_TYPES = [
  {
    id: "expositor",
    label: "Stand físico",
    description: "Presencia con stand en el pabellón",
    icon: MapPin,
  },
  {
    id: "patrocinador",
    label: "Patrocinador",
    description: "Presencia de marca sin stand propio",
    icon: Building2,
  },
] as const;

type ParticipationType = (typeof PARTICIPATION_TYPES)[number]["id"];

const CATEGORY_ICONS: Record<StandCategory, LucideIcon> = {
  technology: Laptop,
  health: HeartPulse,
  finance: Landmark,
  gastronomy: UtensilsCrossed,
  education: GraduationCap,
  startups: Rocket,
  other: MoreHorizontal,
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const inputClass =
  "access-field min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-base font-medium text-[#0f1b5c] shadow-[0_1px_2px_rgba(15,27,92,0.05)] outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-500 hover:border-slate-400 focus:border-[#0a62d6] focus:ring-4 focus:ring-[#0a62d6]/15 sm:text-sm dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:placeholder:text-[#B8C7E6]/50 dark:hover:border-[#1479F5]/70 dark:focus:border-[#1479F5]";
const labelClass = "mb-1.5 block text-sm font-bold text-[#0f1b5c] dark:text-[#F5F9FF]";
const iconClass = "pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-slate-500 dark:text-[#B8C7E6]";
const primaryButton =
  "group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0a62d6] px-5 py-3 text-base font-extrabold text-white shadow-[0_10px_24px_-12px_rgba(10,98,214,0.9)] transition-[filter,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a62d6] dark:bg-[#1479F5]";
const errorClass = "rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300";

function Required() {
  return <span aria-hidden="true" className="text-rose-500"> *</span>;
}

// ─── Progreso (columna izquierda) ─────────────────────────────────────────────

function StepProgress({ step }: { step: number }) {
  const current = Math.min(step + 1, TOTAL_STEPS);
  return (
    <div className="w-full max-w-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-[#B8C7E6]">
        Paso {current} de {TOTAL_STEPS}
      </p>
      <div
        role="progressbar"
        aria-label="Progreso del registro"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={current}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-[#16233D]"
      >
        <div
          className="h-full rounded-full bg-[#0a62d6] dark:bg-[#1479F5] transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ width: `${(current / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Datos de empresa ──────────────────────────────────────────────────

interface Step1Props {
  name: string;
  setName: (v: string) => void;
  category: StandCategory | null;
  setCategory: (v: StandCategory | null) => void;
  customCategory: string;
  setCustomCategory: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  error: string;
  onNext: () => void;
}

function Step1({
  name, setName, category, setCategory, customCategory, setCustomCategory, email, setEmail,
  description, setDescription, error, onNext,
}: Step1Props) {
  return (
    <StepPanel stepKey="step1">
      <CardHeading title="Registro de empresa" description="Completa la información para crear el perfil de tu empresa en Fexpo." />

      <div className="mt-5 grid gap-x-4 gap-y-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company-name" className={labelClass}>Nombre de la empresa<Required /></label>
          <div className="relative flex items-center">
            <Building2 aria-hidden="true" className={iconClass} />
            <input
              id="company-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Altura Labs S.R.L."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="company-email" className={labelClass}>Correo de contacto<Required /></label>
          <div className="relative flex items-center">
            <Mail aria-hidden="true" className={iconClass} />
            <input
              id="company-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@tuempresa.com"
              className={inputClass}
            />
          </div>
        </div>

        {category !== "other" && (
          <fieldset className="sm:col-span-2">
            <legend className={labelClass}>Elige la categoría de tu empresa</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(cat.id)}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a62d6] ${
                      active
                        ? "border-[#0a62d6] bg-[#eaf2ff] text-[#0a4fb0] dark:border-[#1479F5] dark:bg-[#1479F5]/20 dark:text-[#A9D0FF]"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#B8C7E6] dark:hover:border-[#1479F5]/60 dark:hover:bg-[#16233D]"
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {category === "other" && (
          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="company-custom-category" className="text-sm font-bold text-[#0f1b5c] dark:text-[#F5F9FF]">¿Cuál es tu categoría?<Required /></label>
              <button type="button" onClick={() => setCategory(null)} className="text-xs font-bold text-[#0a62d6] dark:text-[#1479F5] hover:underline">Cambiar categoría</button>
            </div>
            <div className="relative flex items-center">
              <Tag aria-hidden="true" className={iconClass} />
              <input
                id="company-custom-category"
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                maxLength={60}
                placeholder="Ej. Turismo sostenible"
                className={inputClass}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-500 dark:text-[#B8C7E6]">{customCategory.length}/60</p>
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="company-description" className={labelClass}>Descripción breve<Required /></label>
          <div className="relative">
            <FileText aria-hidden="true" className={`${iconClass} top-3.5`} />
            <textarea
              id="company-description"
              rows={4}
              maxLength={280}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Plataforma de desarrollo de apps móviles con IA para el mercado andino."
              className={`${inputClass} h-28 resize-y`}
            />
          </div>
          <p className="mt-1 text-right text-xs text-slate-500 dark:text-[#B8C7E6]">{description.length}/280</p>
        </div>
      </div>

      {error && <div role="alert" className={`${errorClass} mt-4`}>{error}</div>}

      <button type="button" onClick={onNext} className={`${primaryButton} mt-4`}>
        Continuar
        <ArrowRight aria-hidden="true" size={18} className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
      </button>
    </StepPanel>
  );
}

// ─── Step 2: Tipo de participación ────────────────────────────────────────────

interface Step2Props {
  participation: ParticipationType;
  setParticipation: (v: ParticipationType) => void;
  loading: boolean;
  onCredential: (credential: string) => void;
  error: string;
  onBack: () => void;
  /** Correo de contacto del paso 1: se propone como correo de la cuenta. */
  contactEmail: string;
  /** Sin él (acceso con contraseña deshabilitado) solo se ofrece Google. */
  onPasswordSubmit?: (values: PasswordAuthValues, mode: PasswordAuthMode) => Promise<void>;
  /** La ilustración se tapa los ojos mientras el campo de contraseña tiene el foco. */
  onPasswordFocusChange: (focused: boolean) => void;
}

function Step2({
  participation, setParticipation, loading, error, onBack, onCredential, contactEmail, onPasswordSubmit, onPasswordFocusChange,
}: Step2Props) {
  return (
    <StepPanel stepKey="step2">
      <CardHeading title="Tipo de participación" description="¿Cómo estará presente tu empresa en ExpoVia FIPAZ 2026?" />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PARTICIPATION_TYPES.map((type) => {
          const Icon = type.icon;
          const active = participation === type.id;
          return (
            <button
              key={type.id}
              type="button"
              aria-pressed={active}
              onClick={() => setParticipation(type.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a62d6] ${
                active
                  ? "border-[#0a62d6] bg-[#f3f8ff] shadow-[0_0_0_3px_rgba(10,98,214,0.12)] dark:border-[#1479F5] dark:bg-[#1479F5]/15"
                  : "border-slate-300 bg-white hover:border-slate-400 dark:border-[#223354] dark:bg-[#16233D] dark:hover:border-[#1479F5]/50"
              }`}
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-150 ${
                  active ? "bg-[#0a62d6] text-white dark:bg-[#1479F5]" : "bg-slate-100 text-slate-500 dark:bg-[#101A2E] dark:text-[#B8C7E6]"
                }`}
              >
                <Icon aria-hidden="true" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#0f1b5c] dark:text-[#F5F9FF]">{type.label}</p>
                <p className="text-sm text-slate-600 dark:text-[#B8C7E6]">{type.description}</p>
              </div>
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                  active ? "border-[#0a62d6] bg-[#0a62d6] dark:border-[#1479F5] dark:bg-[#1479F5]" : "border-slate-300 dark:border-[#223354]"
                }`}
              >
                {active && <span className="size-1.5 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium leading-4 text-slate-600 dark:border dark:border-[#223354] dark:bg-[#16233D] dark:text-[#B8C7E6]">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#0a62d6] dark:text-[#1479F5]" />
        <span>
          Al registrar tu empresa aceptas los Términos de Uso de ExpoVia y el Aviso de Privacidad para
          exposición de datos de marca en la plataforma.
        </span>
      </div>

      {error && <div role="alert" className={`${errorClass} mt-4`}>{error}</div>}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition-[background-color,transform] duration-150 ease-out hover:bg-slate-50 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a62d6] dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:hover:bg-[#223354]"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Atrás
        </button>
        <div className="min-w-0 flex-1">
          {loading ? (
            <div role="status" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-bold text-[#0f1b5c] dark:bg-[#16233D] dark:text-[#F5F9FF]">
              <Loader2 aria-hidden="true" size={17} className="animate-spin" /> Validando Google y registrando empresa…
            </div>
          ) : (
            <GoogleSignInButton onCredential={onCredential} />
          )}
        </div>
      </div>

      {onPasswordSubmit && !loading && (
        <div className={`${styles.compactAuth} mt-3`}>
          <div className="mb-2 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#B8C7E6]">
            <span className="h-px flex-1 bg-slate-200 dark:bg-[#223354]" aria-hidden="true" />
            o con tu correo
            <span className="h-px flex-1 bg-slate-200 dark:bg-[#223354]" aria-hidden="true" />
          </div>
          <PasswordAuthForm
            variant="fexpo"
            tone="blue"
            mode="register"
            allowModeSwitch
            defaultEmail={contactEmail}
            submitLabels={{ register: "Crear cuenta y registrar empresa", login: "Iniciar sesión y registrar empresa" }}
            busyLabel="Registrando tu empresa…"
            onSubmit={onPasswordSubmit}
            onPasswordFocusChange={onPasswordFocusChange}
          />
        </div>
      )}

      <p className="mt-2 text-center text-xs leading-4 text-slate-600 dark:text-[#B8C7E6]">
        {onPasswordSubmit
          ? "Tu cuenta, de Google o con correo, queda como administradora de la empresa cuando el backend confirma el registro."
          : "Google verifica tu cuenta y el backend confirma que tenga acceso de empresa antes de completar el registro."}
      </p>
    </StepPanel>
  );
}

// ─── Step 3: Éxito ────────────────────────────────────────────────────────────

function StepSuccess({ companyName }: { companyName: string }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="flex flex-col items-center py-10 text-center"
    >
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", duration: 0.5, bounce: 0.25 }}
        className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
      >
        <CheckCircle2 aria-hidden="true" size={42} />
      </motion.span>
      <h2 className="mt-6 text-2xl font-extrabold text-[#0f1b5c] dark:text-[#F5F9FF]">¡Empresa registrada!</h2>
      <p className="mt-2 text-slate-600 dark:text-[#B8C7E6]">
        <strong>{companyName}</strong> ya forma parte de ExpoVia FIPAZ 2026.
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-[#B8C7E6]/70">Redirigiendo a tu panel…</p>
      <Loader2 aria-hidden="true" className="mt-4 h-5 w-5 animate-spin text-slate-400 dark:text-[#B8C7E6]" />
    </motion.div>
  );
}

// ─── Piezas de la tarjeta ─────────────────────────────────────────────────────

function StepPanel({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

function CardHeading({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-900 dark:bg-amber-950/60 dark:text-amber-400">
        <UsersRound aria-hidden="true" className="h-3.5 w-3.5" />
        Para expositores
      </span>
      <h2 className="mt-3 text-balance text-[1.75rem] font-extrabold leading-tight tracking-tight text-[#0f1b5c] sm:text-3xl dark:text-[#F5F9FF]">{title}</h2>
      <p className="mt-1.5 text-pretty text-sm text-slate-600 sm:text-base dark:text-[#B8C7E6]">{description}</p>
    </header>
  );
}

// ─── Formulario principal ─────────────────────────────────────────────────────

export function RegistrationForm() {
  const router = useRouter();
  const registerCompany = usePanelStore((s) => s.registerCompany);
  const loginWithGoogle = useCompanyAuthStore((s) => s.loginWithGoogle);
  const loginWithPassword = useCompanyAuthStore((s) => s.loginWithPassword);
  const registerWithPassword = useCompanyAuthStore((s) => s.registerWithPassword);
  const verifySession = useCompanyAuthStore((s) => s.verifySession);

  // Step state
  const [step, setStep] = useState(0);

  // Paso 1
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StandCategory | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  // Paso 2
  const [participation, setParticipation] = useState<ParticipationType>("expositor");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // La ilustración reacciona a esto: cuánto del paso 1 está completo (0 a 1) y si hay
  // tecleo reciente. `typing` se apaga solo tras una pausa sin cambios.
  const [typing, setTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function pingTyping() {
    setTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(false), 900);
  }
  const formProgress = (
    (name.trim() ? 1 : 0) +
    (EMAIL_PATTERN.test(email.trim()) ? 1 : 0) +
    (category && (category !== "other" || customCategory.trim()) ? 1 : 0) +
    (description.trim().length >= 20 ? 1 : 0)
  ) / 4;

  // Mientras el campo de contraseña del paso 2 tiene el foco, el personaje se tapa los ojos.
  // El onBlur del propio campo ya lo apaga; este efecto es una red de seguridad si el
  // paso cambia por otra vía (por ejemplo, "Atrás") mientras el campo seguía enfocado.
  const [passwordFocused, setPasswordFocused] = useState(false);
  useEffect(() => {
    if (step !== 1) setPasswordFocused(false);
  }, [step]);

  // ── Validación paso 1 ──────────────────────────────────────────────────────
  function handleNextStep() {
    setError("");
    if (!name.trim()) { setError("Ingresa el nombre de tu empresa."); return; }
    if (!category) { setError("Selecciona una categoría."); return; }
    if (category === "other" && !customCategory.trim()) { setError("Especifica la categoría de tu empresa."); return; }
    if (customCategory.trim().length > 60) { setError("La categoría no puede superar los 60 caracteres."); return; }
    if (!EMAIL_PATTERN.test(email.trim())) { setError("Ingresa un correo de contacto válido."); return; }
    if (description.trim().length < 20) { setError("La descripción debe tener al menos 20 caracteres."); return; }
    if (description.trim().length > 280) { setError("La descripción no puede superar los 280 caracteres."); return; }
    setStep(1);
  }

  // ── Submit final ───────────────────────────────────────────────────────────
  /** Con la sesión ya iniciada (Google o correo): crea la empresa y confirma el rol nuevo. Lanza si falla. */
  async function completeRegistration(roles: readonly RoleAssignment[]) {
    // La cuenta ya administra una empresa: se entra a su panel en lugar de crear otra por accidente.
    if (roles.some((role) => role.role === "company_admin" || role.role === "company_staff")) {
      router.push("/panel");
      return;
    }

    const newCompany = await createCompany({
      name: name.trim(),
      category: category!,
      customCategory: category === "other" ? customCategory.trim() : undefined,
      contactEmail: email.trim(),
      description: description.trim(),
    });
    registerCompany({
      name: name.trim(), category: category!,
      customCategory: category === "other" ? customCategory.trim() : undefined,
      contactEmail: email.trim(), description: description.trim(),
    }, newCompany.id);
    // El rol nuevo solo aparece después de consultar /auth/me otra vez.
    const verification = await verifySession();
    if (verification === "unavailable") {
      throw new Error("La empresa se registró, pero el servicio de autenticación no está disponible para confirmar la sesión. Inténtalo nuevamente; la sesión se conserva.");
    }
    if (verification === "invalid" || !hasPanelAccess(useCompanyAuthStore.getState().session, "expositor")) {
      throw new Error("La empresa se registró, pero el backend no confirmó el rol de expositor para esta cuenta. Inicia sesión de nuevo.");
    }
    setStep(2);
    window.setTimeout(() => router.push("/panel"), 900);
  }

  /** Correo y contraseña: el propio formulario muestra los errores que se lancen aquí. */
  async function handlePasswordAuth(values: PasswordAuthValues, mode: PasswordAuthMode) {
    setError("");
    const current = useCompanyAuthStore.getState().session;
    // Reintento tras un fallo al crear la empresa: la cuenta ya existe y la sesión sigue abierta.
    if (current && current.email.toLowerCase() === values.email.toLowerCase()) {
      await completeRegistration(current.roles);
      return;
    }
    const me = mode === "register"
      ? await registerWithPassword({ email: values.email, password: values.password, displayName: values.displayName })
      : await loginWithPassword(values.email, values.password);
    await completeRegistration(me.roles);
  }

  async function handleGoogleCredential(idToken: string) {
    setError("");
    setLoading(true);
    try {
      const me = await loginWithGoogle(idToken);
      await completeRegistration(me.roles);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo completar el registro. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_12%_50%,#e4f0ff_0%,#f5f9ff_40%,#edf4ff_100%)] text-[#0f1b5c] antialiased dark:bg-none dark:bg-[#0B1220] dark:text-[#F5F9FF]">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] bg-[linear-gradient(145deg,#e4f0ff_0%,#d8e9ff_100%)] xl:block dark:hidden" aria-hidden="true" />

        <div className="relative mx-auto flex min-h-dvh w-full max-w-[1320px] flex-col px-4 sm:px-8">
          <header className="flex items-center gap-4 py-4">
            <Image src="/img/landing/fexpo-logo.png" alt="Fexpo" width={132} height={40} priority className="h-8 w-auto sm:h-9" />
            <span aria-hidden="true" className="h-7 w-px bg-slate-300 dark:bg-[#223354]" />
            <Link
              href="/"
              className="-ml-1 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-700 transition-colors duration-150 ease-out hover:text-[#0a62d6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a62d6] dark:text-[#B8C7E6] dark:hover:text-[#A9D0FF]"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Volver al inicio
            </Link>
            <div className="ml-auto flex items-center gap-3">
              {step < 2 && <div className="hidden w-48 sm:block xl:hidden"><StepProgress step={step} /></div>}
              <ThemeToggle variant="icon" />
            </div>
          </header>

          <div className="grid flex-1 items-center gap-8 pb-8 pt-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,680px)] xl:gap-10">
            <section className="access-rise hidden min-w-0 xl:block" aria-label="Presentación del registro">
              <div>
                {step < 2 && <StepProgress step={step} />}
                <h1 className="mt-5 text-balance text-[2.1rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:mt-6 lg:text-[2.7rem] xl:text-[2.9rem]">
                  Tu empresa, presente en <span className="text-[#0a62d6] dark:text-[#1479F5]">Fexpo</span><span className="text-amber-400">.</span>
                </h1>
                <p className="mt-3 max-w-md text-pretty text-base text-slate-600 sm:text-lg dark:text-[#B8C7E6]">
                  Registra tu empresa y comienza a preparar tu participación en la feria.
                </p>

                {/* Inline (no <img>): se funde con el degradado de la página y reacciona a lo que se llena en el formulario. */}
                <div className="relative mt-8 hidden xl:block">
                  <CompanyIllustration progress={formProgress} typing={typing} step={step} coverEyes={passwordFocused} />
                </div>
              </div>
            </section>

            <main
              style={{ "--access-delay": "100ms" } as React.CSSProperties}
              className="access-rise w-full justify-self-center rounded-3xl border border-[#dce7f7] bg-white p-5 shadow-[0_2px_8px_rgba(15,27,92,0.05),0_30px_70px_-28px_rgba(30,80,200,0.35)] sm:max-w-[680px] sm:p-7 lg:p-6 xl:max-w-none dark:border-[#223354] dark:bg-[#101A2E] dark:shadow-none"
            >
              {step < 2 && <div className="mb-5 sm:hidden"><StepProgress step={step} /></div>}
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <Step1
                    key="s1"
                    name={name} setName={(v) => { setName(v); pingTyping(); }}
                    category={category} setCategory={(v) => { setCategory(v); pingTyping(); }}
                    customCategory={customCategory} setCustomCategory={(v) => { setCustomCategory(v); pingTyping(); }}
                    email={email} setEmail={(v) => { setEmail(v); pingTyping(); }}
                    description={description} setDescription={(v) => { setDescription(v); pingTyping(); }}
                    error={error}
                    onNext={handleNextStep}
                  />
                )}
                {step === 1 && (
                  <Step2
                    key="s2"
                    participation={participation}
                    setParticipation={setParticipation}
                    loading={loading}
                    error={error}
                    onBack={() => { setError(""); setStep(0); }}
                    onCredential={handleGoogleCredential}
                    contactEmail={email.trim()}
                    onPasswordSubmit={isPasswordLoginEnabled() ? handlePasswordAuth : undefined}
                    onPasswordFocusChange={setPasswordFocused}
                  />
                )}
                {step === 2 && <StepSuccess key="success" companyName={name} />}
              </AnimatePresence>

              {step === 0 && (
                <p className="mt-5 text-center text-sm text-slate-600 dark:text-[#B8C7E6]">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href="/acceso?panel=expositor"
                    className="rounded font-semibold text-[#0a62d6] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a62d6] dark:text-[#1479F5]"
                  >
                    Inicia sesión
                  </Link>
                </p>
              )}
            </main>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
