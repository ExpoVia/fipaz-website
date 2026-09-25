import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { clsx } from "clsx";

const CONTROL =
  "w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-[var(--expo-navy)] placeholder:text-slate-500 focus:border-[var(--expo-blue)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 aria-[invalid=true]:border-rose-600";

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  /** Contador de caracteres (p. ej. descripciones con límite). */
  counter?: { current: number; max: number };
  children: (aria: {
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
    "aria-required": true | undefined;
  }) => ReactNode;
}

/** Etiqueta + control + ayuda + error, con los atributos ARIA que los enlazan. */
function FieldShell({ id, label, required, hint, error, counter, children }: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const overLimit = counter ? counter.current > counter.max : false;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
        {label}
        {required && (
          <span aria-hidden="true" className="text-rose-600">
            {" "}
            *
          </span>
        )}
      </label>
      {children({
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required ? true : undefined,
      })}
      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {hint && (
            <p id={hintId} className="text-xs font-medium text-slate-600">
              {hint}
            </p>
          )}
          {error && (
            <p id={errorId} className="mt-0.5 text-xs font-bold text-rose-700">
              {error}
            </p>
          )}
        </div>
        {counter && (
          <p
            aria-hidden="true"
            className={clsx(
              "shrink-0 font-mono text-xs font-bold",
              overLimit ? "text-rose-700" : "text-slate-600",
            )}
          >
            {counter.current}/{counter.max}
          </p>
        )}
      </div>
    </div>
  );
}

interface CommonFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

interface TextFieldProps
  extends CommonFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  counter?: { current: number; max: number };
}

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  counter,
  className,
  ...input
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} counter={counter}>
      {(aria) => <input id={id} className={clsx(CONTROL, className)} {...aria} {...input} />}
    </FieldShell>
  );
}

interface TextAreaFieldProps
  extends CommonFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  counter?: { current: number; max: number };
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  required,
  counter,
  className,
  ...textarea
}: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} counter={counter}>
      {(aria) => (
        <textarea id={id} className={clsx(CONTROL, "resize-y", className)} {...aria} {...textarea} />
      )}
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps
  extends CommonFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  options: readonly SelectOption[];
  /** Opción vacía inicial (p. ej. "Selecciona un tipo"). */
  placeholder?: string;
}

export function SelectField({
  id,
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  className,
  ...select
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      {(aria) => (
        <select id={id} className={clsx(CONTROL, className)} {...aria} {...select}>
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}
