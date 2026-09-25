"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button, ErrorState, ListSkeleton, Modal, StatusBadge } from "@/components/admin";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getStockLevel } from "../adjustments";
import {
  ADJUSTMENT_TYPE_LABELS,
  ADJUSTMENT_TYPE_TONES,
  STOCK_LEVEL_LABELS,
  STOCK_LEVEL_TONES,
} from "../constants";
import { useInventoryDetail } from "../hooks/use-inventory";
import type { InventoryAdjustment, InventoryItem } from "../types";
import { StockBreakdown } from "./stock-breakdown";

interface InventoryDetailModalProps {
  /** Fila de la lista: sirve de título y de respaldo mientras carga el detalle. */
  item: InventoryItem;
  onAdjust: () => void;
  onClose: () => void;
}

function HistoryEntry({ entry }: { entry: InventoryAdjustment }) {
  const isPositive = entry.delta >= 0;

  return (
    <li className="rounded-xl border-2 border-[var(--expo-line)] bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge tone={ADJUSTMENT_TYPE_TONES[entry.type]}>{ADJUSTMENT_TYPE_LABELS[entry.type]}</StatusBadge>
        <span
          className={`font-mono text-sm font-black ${isPositive ? "text-emerald-800" : "text-rose-800"}`}
          aria-label={`${isPositive ? "Suma" : "Resta"} ${Math.abs(entry.delta)} unidades`}
        >
          {isPositive ? "+" : "−"}
          {formatNumber(Math.abs(entry.delta))}
        </span>
      </div>
      <p className="mt-2 text-sm font-bold text-[var(--expo-navy)]">{entry.reason}</p>
      {entry.note && <p className="mt-0.5 text-xs font-medium text-slate-600">{entry.note}</p>}
      <p className="mt-2 text-xs font-medium text-slate-600">
        Stock físico {formatNumber(entry.previousOnHand)} → {formatNumber(entry.newOnHand)} ·{" "}
        {formatDateTime(entry.createdAt)} · {entry.createdBy}
      </p>
    </li>
  );
}

export function InventoryDetailModal({ item, onAdjust, onClose }: InventoryDetailModalProps) {
  const { data, status, reload } = useInventoryDetail(item.id);
  const inventory = data?.inventory ?? item;
  const level = getStockLevel(inventory);

  return (
    <Modal
      title={item.rewardName}
      description={`SKU ${item.sku}`}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} data-autofocus>
            Cerrar
          </Button>
          <Button variant="primary" onClick={onAdjust} leadingIcon={<SlidersHorizontal aria-hidden="true" className="h-4 w-4" />}>
            Ajustar stock
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <section aria-label="Existencias">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-[var(--expo-navy)]">Existencias</h3>
            <StatusBadge tone={STOCK_LEVEL_TONES[level]}>{STOCK_LEVEL_LABELS[level]}</StatusBadge>
          </div>
          <StockBreakdown totals={inventory} />
          <p className="mt-3 text-xs font-medium text-slate-600">
            Última actualización: {formatDateTime(inventory.updatedAt)}
          </p>
        </section>

        <section aria-label="Historial de ajustes">
          <h3 className="mb-3 text-sm font-black text-[var(--expo-navy)]">Historial de ajustes</h3>
          {status === "loading" && <ListSkeleton label="Cargando historial" rows={3} />}
          {status === "error" && (
            <ErrorState title="No pudimos cargar el historial." description="Intenta nuevamente." onRetry={reload} />
          )}
          {status === "success" && data.history.length === 0 && (
            <p className="rounded-xl border-2 border-dashed border-[var(--expo-line)] p-4 text-center text-sm font-medium text-slate-600">
              Todavía no hay ajustes registrados para este premio.
            </p>
          )}
          {status === "success" && data.history.length > 0 && (
            <ol className="space-y-2">
              {data.history.map((entry) => (
                <HistoryEntry key={entry.id} entry={entry} />
              ))}
            </ol>
          )}
        </section>
      </div>
    </Modal>
  );
}
