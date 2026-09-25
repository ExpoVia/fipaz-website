import type { ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "./button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="pixel-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-[var(--expo-navy)] bg-[#e8f4fb] text-[var(--expo-blue)]"
      >
        {icon}
      </span>
      <h2 className="text-lg font-black text-[var(--expo-navy)]">{title}</h2>
      {description && <p className="max-w-md text-sm font-medium text-slate-600">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description = "Intenta nuevamente.", onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border-2 border-rose-600 bg-rose-50 px-6 py-12 text-center"
    >
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-rose-700 bg-white text-rose-700"
      >
        <TriangleAlert className="h-7 w-7" />
      </span>
      <h2 className="text-lg font-black text-rose-900">{title}</h2>
      <p className="max-w-md text-sm font-medium text-rose-900">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} leadingIcon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

interface SkeletonProps {
  /** Texto para lectores de pantalla, p. ej. "Cargando dinámicas". */
  label: string;
  rows?: number;
}

/** Marcador de posición de una tabla/listado mientras carga. */
export function ListSkeleton({ label, rows = 5 }: SkeletonProps) {
  return (
    <div role="status" aria-busy="true" className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden">
      <span className="sr-only">{label}…</span>
      <div className="h-11 animate-pulse bg-slate-100" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4">
          <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200" />
          <div className="hidden h-4 flex-1 animate-pulse rounded bg-slate-200 sm:block" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="hidden h-4 w-16 animate-pulse rounded bg-slate-200 md:block" />
        </div>
      ))}
    </div>
  );
}

/** Marcador de posición de un bloque de tarjetas de métricas. */
export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="pixel-card h-[104px] animate-pulse bg-slate-100" />
      ))}
    </div>
  );
}
