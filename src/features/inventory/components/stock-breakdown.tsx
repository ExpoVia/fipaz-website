import { clsx } from "clsx";

import { formatNumber } from "@/lib/format";
import type { StockTotals } from "../types";

interface StockBreakdownProps {
  totals: StockTotals;
}

interface Metric {
  label: string;
  /** Término técnico que usa el backend, útil para el equipo de integración. */
  term: string;
  value: number;
  tone: string;
}

/**
 * Explica cómo se relacionan las cuatro cantidades del inventario:
 * disponible = stock físico − reservado; entregado es un acumulado aparte.
 */
export function StockBreakdown({ totals }: StockBreakdownProps) {
  const { onHand, reserved, available, delivered } = totals;

  const metrics: Metric[] = [
    { label: "Stock físico", term: "On hand", value: onHand, tone: "border-[var(--expo-navy)] text-[var(--expo-navy)]" },
    { label: "Reservado", term: "Reserved", value: reserved, tone: "border-amber-600 text-amber-900" },
    { label: "Disponible", term: "Available", value: available, tone: "border-emerald-600 text-emerald-800" },
    { label: "Entregado", term: "Delivered", value: delivered, tone: "border-purple-600 text-purple-800" },
  ];

  const availablePercent = onHand > 0 ? (Math.max(available, 0) / onHand) * 100 : 0;
  const reservedPercent = onHand > 0 ? (Math.min(reserved, onHand) / onHand) * 100 : 0;

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.term} className={clsx("rounded-xl border-2 bg-white p-3", metric.tone)}>
            <dt className="text-xs font-black uppercase tracking-wide">{metric.label}</dt>
            <dd className="mt-1 text-2xl font-black">{formatNumber(metric.value)}</dd>
            <p className="font-mono text-[11px] font-bold opacity-80">{metric.term}</p>
          </div>
        ))}
      </dl>

      <div>
        <div
          role="img"
          aria-label={`De ${onHand} unidades en stock físico, ${available} están disponibles y ${reserved} reservadas.`}
          className="flex h-3.5 overflow-hidden rounded-full border-2 border-[var(--expo-navy)] bg-slate-100"
        >
          <div className="bg-emerald-500" style={{ width: `${availablePercent}%` }} />
          <div className="bg-amber-400" style={{ width: `${reservedPercent}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Disponible
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Reservado
          </span>
        </div>
      </div>

      <p className="rounded-xl bg-[var(--expo-bg)] p-3 text-xs font-medium text-slate-700">
        <strong>Disponible = Stock físico − Reservado</strong> ({formatNumber(onHand)} − {formatNumber(reserved)} ={" "}
        {formatNumber(available)}). <strong>Entregado</strong> es un acumulado: esas unidades ya salieron del stock
        físico.
      </p>
    </div>
  );
}
