"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { categories } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { createCompany } from "@/lib/api/companies";
import { hasPanelAccess } from "@/lib/panel-access";
import type { StandCategory } from "@/types/demo";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PARTICIPATION_TYPES = [
  {
    id: "expositor",
    label: "Stand físico",
    description: "Presencia con stand en el pabellón",
    icon: MapPin,
    color: "var(--expo-blue)",
  },
  {
    id: "patrocinador",
    label: "Patrocinador",
    description: "Presencia de marca sin stand propio",
    icon: Building2,
    color: "var(--expo-purple)",
  },
] as const;

type ParticipationType = (typeof PARTICIPATION_TYPES)[number]["id"];

// ─── Indicador de pasos ───────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`flex size-8 items-center justify-center rounded-full border-2 font-black text-sm transition-all ${
                done
                  ? "border-[var(--expo-green)] bg-[var(--expo-green)] text-white"
                  : active
                    ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[2px_2px_0_var(--expo-navy)]"
                    : "border-slate-300 bg-white text-slate-400"
              }`}
            >
              {done ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            {i < total - 1 && (
              <div
                className={`h-0.5 w-10 transition-colors ${done ? "bg-[var(--expo-green)]" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Datos de empresa ──────────────────────────────────────────────────

interface Step1Props {
  name: string;
  setName: (v: string) => void;
  category: StandCategory | null;
  setCategory: (v: StandCategory) => void;
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
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-black text-[var(--expo-navy)]">Datos de tu empresa</h2>
        <p className="mt-1 text-sm text-slate-500">
          Esta información será visible para los visitantes en la app ExpoVia.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border-2 border-[var(--expo-navy)] bg-white p-6 shadow-[5px_5px_0_var(--expo-navy)]">
        {/* Nombre */}
        <div>
          <label htmlFor="company-name" className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
            Nombre de la empresa <span className="text-rose-500">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Altura Labs S.R.L."
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium outline-none transition-colors focus:border-[var(--expo-blue)]"
          />
        </div>

        {/* Categoría */}
        <div>
          <span className="mb-2 block text-sm font-black text-[var(--expo-navy)]">
            Categoría <span className="text-rose-500">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-xl border-2 px-2 py-2.5 text-center text-xs font-black transition-all ${
                  category === cat.id
                    ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[3px_3px_0_var(--expo-navy)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {category === "other" && (
            <div className="mt-3">
              <label htmlFor="company-custom-category" className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
                ¿Cuál es tu categoría? <span className="text-rose-500">*</span>
              </label>
              <input
                id="company-custom-category"
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                maxLength={60}
                placeholder="Ej. Turismo sostenible"
                className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium outline-none transition-colors focus:border-[var(--expo-blue)]"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{customCategory.length}/60</p>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="company-email" className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
            Correo de contacto <span className="text-rose-500">*</span>
          </label>
          <input
            id="company-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contacto@tuempresa.com"
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium outline-none transition-colors focus:border-[var(--expo-blue)]"
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="company-description" className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
            Describe tu empresa en una frase <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="company-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Plataforma de desarrollo de apps móviles con IA para el mercado andino."
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium outline-none transition-colors focus:border-[var(--expo-blue)]"
          />
          <p className="mt-1 text-right text-xs text-slate-400">{description.length}/280</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border-2 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] py-4 text-base font-black text-[var(--expo-navy)] shadow-[5px_5px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--expo-navy)]"
      >
        Siguiente paso
        <ArrowRight size={18} />
      </button>
    </motion.div>
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
}

function Step2({ participation, setParticipation, loading, error, onBack, onCredential }: Step2Props) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-black text-[var(--expo-navy)]">Tipo de participación</h2>
        <p className="mt-1 text-sm text-slate-500">
          ¿Cómo estará presente tu empresa en ExpoVia FIPAZ 2026?
        </p>
      </div>

      <div className="space-y-3">
        {PARTICIPATION_TYPES.map((type) => {
          const Icon = type.icon;
          const active = participation === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setParticipation(type.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                active
                  ? "border-[var(--expo-navy)] bg-white shadow-[4px_4px_0_var(--expo-navy)]"
                  : "border-slate-200 bg-white hover:border-slate-400"
              }`}
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
                  active
                    ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[2px_2px_0_var(--expo-navy)]"
                    : "border-slate-200 bg-slate-100 text-slate-400"
                }`}
              >
                <Icon size={22} />
              </span>
              <div className="flex-1">
                <p className="font-black text-[var(--expo-navy)]">{type.label}</p>
                <p className="text-sm text-slate-500">{type.description}</p>
              </div>
              <div
                className={`size-5 rounded-full border-2 transition-colors ${
                  active ? "border-[var(--expo-blue)] bg-[var(--expo-blue)]" : "border-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Info legal */}
      <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--expo-blue)]" />
        <span>
          Al registrar tu empresa aceptas los Términos de Uso de ExpoVia y el Aviso de Privacidad para
          exposición de datos de marca en la plataforma.
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border-2 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 font-black text-slate-600 shadow-[3px_3px_0_slate-300] transition-all hover:border-slate-400"
        >
          <ArrowLeft size={16} />
          Atrás
        </button>
        <div className="flex-1">
          {loading ? (
            <div className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-3 text-sm font-black text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)]">
              <Loader2 size={17} className="animate-spin" /> Validando Google y registrando empresa…
            </div>
          ) : (
            <GoogleSignInButton onCredential={onCredential} />
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        Google verifica tu cuenta y el backend confirma que tenga acceso de empresa antes de completar el registro.
      </p>
    </motion.div>
  );
}

// ─── Step 3: Éxito ────────────────────────────────────────────────────────────

function StepSuccess({ companyName }: { companyName: string }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-8 text-center"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="flex size-20 items-center justify-center rounded-3xl border-3 border-[var(--expo-navy)] bg-[var(--expo-green)] shadow-[6px_6px_0_var(--expo-navy)]"
      >
        <CheckCircle2 size={40} className="text-white" />
      </motion.span>
      <h2 className="mt-6 text-2xl font-black text-[var(--expo-navy)]">¡Empresa registrada!</h2>
      <p className="mt-2 text-slate-600">
        <strong>{companyName}</strong> ya forma parte de ExpoVia FIPAZ 2026.
      </p>
      <p className="mt-1 text-sm text-slate-400">Redirigiendo a tu panel…</p>
      <Loader2 className="mt-4 h-5 w-5 animate-spin text-slate-300" />
    </motion.div>
  );
}

// ─── Formulario principal ─────────────────────────────────────────────────────

export function RegistrationForm() {
  const router = useRouter();
  const registerCompany = usePanelStore((s) => s.registerCompany);
  const loginWithGoogle = useCompanyAuthStore((s) => s.loginWithGoogle);
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
  async function handleGoogleCredential(idToken: string) {
    setError("");
    setLoading(true);
    try {
      const me = await loginWithGoogle(idToken);
      // La cuenta ya administra una empresa: se entra a su panel en lugar de crear otra por accidente.
      if (me.roles.some((role) => role.role === "company_admin" || role.role === "company_staff")) {
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

      // El rol nuevo (company_admin) solo aparece al volver a leer /auth/me.
      const confirmed = await verifySession();
      if (!confirmed || !hasPanelAccess(useCompanyAuthStore.getState().session, "expositor")) {
        throw new Error("La empresa se registró, pero el backend no confirmó el rol de administrador para esta cuenta. Inicia sesión de nuevo.");
      }
      setStep(2);
      window.setTimeout(() => router.push("/panel"), 900);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo completar el registro. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl pb-16">
      {step < 2 && <StepIndicator current={step} total={2} />}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <Step1
            key="s1"
            name={name} setName={setName}
            category={category} setCategory={setCategory}
            customCategory={customCategory} setCustomCategory={setCustomCategory}
            email={email} setEmail={setEmail}
            description={description} setDescription={setDescription}
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
          />
        )}
        {step === 2 && <StepSuccess key="success" companyName={name} />}
      </AnimatePresence>

      {step < 2 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          ¿Tu empresa ya está registrada?{" "}
          <Link href="/acceso?panel=expositor" className="font-black text-[var(--expo-blue)] hover:underline">
            Inicia sesión
          </Link>
        </p>
      )}
    </div>
  );
}
