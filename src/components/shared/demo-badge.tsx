import { FlaskConical } from "lucide-react";

interface DemoBadgeProps {
  /** Texto de la etiqueta; por defecto la exigida para toda cifra mock. */
  label?: string;
  className?: string;
}

/** Marca una métrica o tablero como dato de ejemplo (no proviene de un evento real). */
export function DemoBadge({ label = "Datos de demostración", className = "" }: DemoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border border-[var(--expo-blue)] bg-sky-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[var(--expo-blue)] ${className}`}
    >
      <FlaskConical aria-hidden="true" className="h-3 w-3" />
      {label}
    </span>
  );
}
