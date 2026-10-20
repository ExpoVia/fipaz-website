"use client";

import { useId, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { PASSWORD_MAX_LENGTH, passwordProblem } from "@/lib/api/company-auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PasswordAuthMode = "login" | "register";

export interface PasswordAuthValues {
  email: string;
  password: string;
  /** Solo en modo `register`. */
  displayName: string;
}

interface PasswordAuthFormProps {
  /** Modo inicial. */
  mode?: PasswordAuthMode;
  /** Muestra el enlace para alternar entre "Iniciar sesión" y "Crear cuenta". */
  allowModeSwitch?: boolean;
  defaultEmail?: string;
  /** Texto del botón en cada modo. */
  submitLabels?: Partial<Record<PasswordAuthMode, string>>;
  /** Texto mientras se envía. */
  busyLabel?: string;
  /** Lanza un `Error` con el mensaje que se muestra en el formulario. */
  onSubmit: (values: PasswordAuthValues, mode: PasswordAuthMode) => Promise<void>;
}

const DEFAULT_LABELS: Record<PasswordAuthMode, string> = {
  login: "Iniciar sesión",
  register: "Crear cuenta",
};

/** Acceso con correo y contraseña. Valida lo mismo que el backend antes de enviar. */
export function PasswordAuthForm({
  mode: initialMode = "login",
  allowModeSwitch = false,
  defaultEmail = "",
  submitLabels,
  busyLabel = "Validando tu cuenta…",
  onSubmit,
}: PasswordAuthFormProps) {
  const id = useId();
  const [mode, setMode] = useState<PasswordAuthMode>(initialMode);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const labels = { ...DEFAULT_LABELS, ...submitLabels };
  const registering = mode === "register";

  function validate(): string | null {
    if (registering && !displayName.trim()) return "Ingresa tu nombre.";
    if (!EMAIL_PATTERN.test(email.trim())) return "Ingresa un correo válido.";
    if (!password) return "Ingresa tu contraseña.";
    // Al iniciar sesión no se exige la longitud: el backend responde igual a una contraseña corta o incorrecta.
    return registering ? passwordProblem(password) : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSubmit({ email: email.trim(), password, displayName: displayName.trim() }, mode);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo completar el acceso. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(registering ? "login" : "register");
    setError("");
  }

  const inputClass =
    "w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-[var(--expo-navy)] outline-none transition-colors focus:border-[var(--expo-navy)] disabled:opacity-60";
  const labelClass = "mb-1 block text-xs font-extrabold text-[var(--expo-navy)]";

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate aria-label={labels[mode]} className="flex flex-col gap-3">
      {registering && (
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>Tu nombre</label>
          <input
            id={`${id}-name`}
            name="displayName"
            autoComplete="name"
            maxLength={80}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            disabled={busy}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor={`${id}-email`} className={labelClass}>Correo</label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete={registering ? "email" : "username"}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${id}-password`} className={labelClass}>Contraseña</label>
        <div className="relative">
          <input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={registering ? "new-password" : "current-password"}
            maxLength={PASSWORD_MAX_LENGTH}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
            aria-describedby={registering ? `${id}-password-hint` : undefined}
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-[var(--expo-navy)]"
          >
            {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>
        {registering && (
          <p id={`${id}-password-hint`} className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres.</p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border-2 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-4 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_var(--expo-navy)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
      >
        {busy ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            {busyLabel}
          </>
        ) : (
          labels[mode]
        )}
      </button>

      {allowModeSwitch && (
        <p className="text-center text-xs text-slate-500">
          {registering ? "¿Ya tienes una cuenta?" : "¿Todavía no tienes cuenta?"}{" "}
          <button type="button" onClick={switchMode} disabled={busy} className="font-black text-[var(--expo-blue)] hover:underline">
            {registering ? "Inicia sesión" : "Créala con tu correo"}
          </button>
        </p>
      )}
    </form>
  );
}
