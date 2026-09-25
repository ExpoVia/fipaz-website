import type { ReactNode } from "react";
import { clsx } from "clsx";

export type BadgeTone = "success" | "neutral" | "info" | "warning" | "danger" | "accent";

// Texto 800 sobre fondo 50: contraste alto sin depender solo del color (siempre lleva texto).
const TONES: Record<BadgeTone, string> = {
  success: "border-emerald-600 bg-emerald-50 text-emerald-800",
  neutral: "border-slate-400 bg-slate-100 text-slate-700",
  info: "border-sky-600 bg-sky-50 text-sky-800",
  warning: "border-amber-600 bg-amber-50 text-amber-900",
  danger: "border-rose-600 bg-rose-50 text-rose-800",
  accent: "border-purple-600 bg-purple-50 text-purple-800",
};

interface StatusBadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
