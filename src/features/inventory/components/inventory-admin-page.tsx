"use client";

import { useMemo, useState } from "react";
import { Boxes, Eye, Gift, Lock, PackageCheck, SlidersHorizontal, Truck, Warehouse, X } from "lucide-react";

import {
  AdminPageHeader,
  Button,
  ButtonLink,
  DataTable,
  EmptyState,
  ErrorState,
  FilterSelect,
  ListSkeleton,
  ListToolbar,
  MetricsSkeleton,
  RowActions,
  SearchField,
  StatusBadge,
  useToast,
} from "@/components/admin";
import type { DataColumn } from "@/components/admin";
import { MetricCard } from "@/components/panel/metric-card";
import { adminRoutes } from "@/config/admin-routes";
import { RewardThumbnail } from "@/features/rewards/components/reward-thumbnail";
import { getErrorMessage } from "@/lib/api/service-error";
import { formatDateTime, formatNumber } from "@/lib/format";
import { matchesQuery } from "@/lib/text";
import { getStockLevel } from "../adjustments";
import { STOCK_LEVEL_LABELS, STOCK_LEVEL_TONES } from "../constants";
import { useInventory } from "../hooks/use-inventory";
import type { InventoryItem, StockLevel } from "../types";
import { AdjustmentFormModal } from "./adjustment-form-modal";
import { InventoryDetailModal } from "./inventory-detail-modal";

type Dialog = { kind: "detail"; item: InventoryItem } | { kind: "adjust"; item: InventoryItem };

interface InventoryAdminPageProps {
  eventId: string;
  eventName: string;
  /** Premio por el que se filtra al llegar desde su detalle (`?reward=`). */
  initialRewardId?: string;
}

const LEVEL_FILTER_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "ok", label: STOCK_LEVEL_LABELS.ok },
  { value: "low", label: STOCK_LEVEL_LABELS.low },
  { value: "out", label: STOCK_LEVEL_LABELS.out },
] as const;

export function InventoryAdminPage({ eventId, eventName, initialRewardId }: InventoryAdminPageProps) {
  const { inventory, status, error, reload, adjust } = useInventory(eventId);
  const toast = useToast();

  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<StockLevel | "all">("all");
  const [rewardFilterId, setRewardFilterId] = useState<string | null>(initialRewardId ?? null);

  const rewardFilterName = inventory.find((item) => item.rewardId === rewardFilterId)?.rewardName;

  const filtered = useMemo(
    () =>
      inventory.filter(
        (item) =>
          (rewardFilterId === null || item.rewardId === rewardFilterId) &&
          (levelFilter === "all" || getStockLevel(item) === levelFilter) &&
          matchesQuery(search, item.rewardName, item.sku),
      ),
    [inventory, search, levelFilter, rewardFilterId],
  );

  const totals = useMemo(
    () =>
      filtered.reduce(
        (sum, item) => ({
          onHand: sum.onHand + item.onHand,
          reserved: sum.reserved + item.reserved,
          available: sum.available + item.available,
          delivered: sum.delivered + item.delivered,
        }),
        { onHand: 0, reserved: 0, available: 0, delivered: 0 },
      ),
    [filtered],
  );

  const hasActiveFilters = search.trim() !== "" || levelFilter !== "all" || rewardFilterId !== null;

  function clearFilters() {
    setSearch("");
    setLevelFilter("all");
    setRewardFilterId(null);
  }

  const columns: DataColumn<InventoryItem>[] = [
    {
      id: "reward",
      header: "Premio",
      cell: (item) => (
        <span className="flex items-center gap-3">
          <RewardThumbnail imageUrl={item.rewardImageUrl} name={item.rewardName} size="sm" decorative />
          <span className="min-w-0 font-black text-[var(--expo-navy)]">{item.rewardName}</span>
        </span>
      ),
    },
    { id: "sku", header: "SKU", className: "whitespace-nowrap font-mono text-xs font-bold text-slate-700", cell: (item) => item.sku },
    {
      id: "onHand",
      header: "Stock total",
      className: "whitespace-nowrap text-right font-mono font-bold",
      cell: (item) => formatNumber(item.onHand),
    },
    {
      id: "available",
      header: "Disponible",
      className: "whitespace-nowrap text-right font-mono font-black text-emerald-800",
      cell: (item) => formatNumber(item.available),
    },
    {
      id: "reserved",
      header: "Reservado",
      className: "whitespace-nowrap text-right font-mono font-bold text-amber-900",
      cell: (item) => formatNumber(item.reserved),
    },
    {
      id: "delivered",
      header: "Entregado",
      className: "whitespace-nowrap text-right font-mono font-bold text-purple-800",
      cell: (item) => formatNumber(item.delivered),
    },
    {
      id: "level",
      header: "Estado",
      cell: (item) => {
        const level = getStockLevel(item);
        return <StatusBadge tone={STOCK_LEVEL_TONES[level]}>{STOCK_LEVEL_LABELS[level]}</StatusBadge>;
      },
    },
    {
      id: "updatedAt",
      header: "Última actualización",
      className: "whitespace-nowrap text-xs text-slate-600",
      hideBelowXl: true,
      cell: (item) => formatDateTime(item.updatedAt),
    },
  ];

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Administración", href: adminRoutes.home() },
          { label: eventName },
          { label: "Inventario" },
        ]}
        title="Inventario de premios"
        description="Controla cuántas unidades hay, cuántas están reservadas para canjes y cuántas ya se entregaron."
        actions={
          <ButtonLink
            href={adminRoutes.rewards(eventId)}
            variant="secondary"
            leadingIcon={<Gift aria-hidden="true" className="h-4 w-4" />}
          >
            Ver premios
          </ButtonLink>
        }
      />

      {status === "loading" && (
        <div className="space-y-4">
          <MetricsSkeleton />
          <ListSkeleton label="Cargando inventario" />
        </div>
      )}

      {status === "error" && (
        <ErrorState
          title="No pudimos cargar el inventario."
          description={getErrorMessage(error, "Intenta nuevamente.")}
          onRetry={reload}
        />
      )}

      {status === "success" && inventory.length === 0 && (
        <EmptyState
          icon={<Warehouse className="h-7 w-7" />}
          title="Todavía no hay inventario registrado."
          description="Crea un premio y su inventario aparecerá aquí para que puedas controlar el stock."
          action={
            <ButtonLink href={adminRoutes.rewards(eventId)} variant="primary">
              Ir a premios
            </ButtonLink>
          }
        />
      )}

      {status === "success" && inventory.length > 0 && (
        <>
          <section aria-label="Resumen de existencias" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Stock físico" value={formatNumber(totals.onHand)} icon={Boxes} hint="On hand" />
            <MetricCard label="Reservado" value={formatNumber(totals.reserved)} icon={Lock} hint="Reserved" />
            <MetricCard label="Disponible" value={formatNumber(totals.available)} icon={PackageCheck} hint="Available = físico − reservado" />
            <MetricCard label="Entregado" value={formatNumber(totals.delivered)} icon={Truck} hint="Delivered (acumulado)" />
          </section>

          <ListToolbar summary={`${filtered.length} de ${inventory.length} premios`}>
            <SearchField label="Buscar" value={search} onChange={setSearch} placeholder="Premio o SKU" />
            <FilterSelect label="Estado" value={levelFilter} onChange={setLevelFilter} options={LEVEL_FILTER_OPTIONS} />
            {rewardFilterId !== null && (
              <div className="flex items-center gap-2 pb-0.5">
                <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-[var(--expo-blue)] bg-sky-50 pl-3 pr-1 text-sm font-bold text-sky-900">
                  Premio: {rewardFilterName ?? "sin inventario"}
                  <button
                    type="button"
                    onClick={() => setRewardFilterId(null)}
                    aria-label="Quitar filtro de premio"
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-sky-100"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </span>
              </div>
            )}
          </ListToolbar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Warehouse className="h-7 w-7" />}
              title="Ningún inventario coincide con tu búsqueda."
              description={
                rewardFilterId !== null && !rewardFilterName
                  ? "Este premio todavía no tiene inventario registrado."
                  : "Prueba con otros términos o quita los filtros."
              }
              action={hasActiveFilters ? <Button onClick={clearFilters}>Limpiar filtros</Button> : undefined}
            />
          ) : (
            <DataTable
              caption="Inventario de los premios del evento"
              columns={columns}
              rows={filtered}
              getRowId={(item) => item.id}
              renderActions={(item) => (
                <RowActions
                  label={`Acciones de inventario de ${item.rewardName}`}
                  items={[
                    { id: "detail", label: "Ver detalle e historial", icon: Eye, onSelect: () => setDialog({ kind: "detail", item }) },
                    { id: "adjust", label: "Ajustar stock", icon: SlidersHorizontal, onSelect: () => setDialog({ kind: "adjust", item }) },
                  ]}
                />
              )}
            />
          )}
        </>
      )}

      {dialog?.kind === "detail" && (
        <InventoryDetailModal
          item={dialog.item}
          onClose={() => setDialog(null)}
          onAdjust={() => setDialog({ kind: "adjust", item: dialog.item })}
        />
      )}

      {dialog?.kind === "adjust" && (
        <AdjustmentFormModal
          inventory={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            const { inventory: updated } = await adjust(dialog.item.id, input);
            toast.success(`Stock de «${updated.rewardName}» actualizado: ${formatNumber(updated.onHand)} unidades.`);
          }}
        />
      )}
    </>
  );
}
