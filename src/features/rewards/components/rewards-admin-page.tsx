"use client";

import { useMemo, useState } from "react";
import { Boxes, Eye, Gift, Pencil, Plus, Power, Trash2 } from "lucide-react";

import {
  AdminPageHeader,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  FilterSelect,
  ListSkeleton,
  ListToolbar,
  RowActions,
  SearchField,
  StatusBadge,
  useToast,
} from "@/components/admin";
import type { DataColumn } from "@/components/admin";
import { adminRoutes } from "@/config/admin-routes";
import { getStockLevel } from "@/features/inventory/adjustments";
import { useBusyIds } from "@/hooks/use-busy-ids";
import { getErrorMessage } from "@/lib/api/service-error";
import { formatNumber, formatPoints } from "@/lib/format";
import { matchesQuery } from "@/lib/text";
import {
  REWARD_STATUS_LABELS,
  REWARD_STATUS_TONES,
  REWARD_TYPE_LABELS,
  REWARD_TYPE_OPTIONS,
} from "../constants";
import { useRewards } from "../hooks/use-rewards";
import type { RewardStatus, RewardType, RewardWithStock } from "../types";
import { RewardDetailModal } from "./reward-detail-modal";
import { RewardFormModal } from "./reward-form-modal";
import { RewardThumbnail } from "./reward-thumbnail";

type Dialog =
  | { kind: "create" }
  | { kind: "edit"; reward: RewardWithStock }
  | { kind: "detail"; reward: RewardWithStock }
  | { kind: "delete"; reward: RewardWithStock };

interface RewardsAdminPageProps {
  eventId: string;
  eventName: string;
}

const TYPE_FILTER_OPTIONS = [{ value: "all", label: "Todos los tipos" }, ...REWARD_TYPE_OPTIONS] as const;
const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: REWARD_STATUS_LABELS.active },
  { value: "inactive", label: REWARD_STATUS_LABELS.inactive },
] as const;

function StockCell({ reward }: { reward: RewardWithStock }) {
  if (!reward.stock) return <span className="text-slate-500">Sin inventario</span>;

  const level = getStockLevel(reward.stock);
  return (
    <div>
      <p className="font-mono font-black text-[var(--expo-navy)]">{formatNumber(reward.stock.available)}</p>
      {level === "out" && <p className="text-xs font-black text-rose-700">Agotado</p>}
      {level === "low" && <p className="text-xs font-black text-amber-800">Stock bajo</p>}
    </div>
  );
}

export function RewardsAdminPage({ eventId, eventName }: RewardsAdminPageProps) {
  const { rewards, status, reload, create, update, toggleStatus, remove } = useRewards(eventId);
  const toast = useToast();
  const busy = useBusyIds();

  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RewardType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RewardStatus | "all">("all");

  const filtered = useMemo(
    () =>
      rewards.filter(
        (reward) =>
          (typeFilter === "all" || reward.type === typeFilter) &&
          (statusFilter === "all" || reward.status === statusFilter) &&
          matchesQuery(search, reward.name, reward.description, REWARD_TYPE_LABELS[reward.type]),
      ),
    [rewards, search, typeFilter, statusFilter],
  );

  const hasActiveFilters = search.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  async function handleToggle(reward: RewardWithStock) {
    try {
      const updated = await busy.run(reward.id, () => toggleStatus(reward.id));
      toast.success(
        updated.status === "active" ? `«${updated.name}» quedó activo.` : `«${updated.name}» quedó inactivo.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "No pudimos cambiar el estado del premio."));
    }
  }

  const columns: DataColumn<RewardWithStock>[] = [
    {
      id: "name",
      header: "Premio",
      cell: (reward) => (
        <span className="flex items-center gap-3">
          <RewardThumbnail imageUrl={reward.imageUrl} name={reward.name} size="sm" decorative />
          <span className="min-w-0 font-black text-[var(--expo-navy)]">{reward.name}</span>
        </span>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      cell: (reward) => (
        <StatusBadge tone="accent" className="normal-case">
          {REWARD_TYPE_LABELS[reward.type]}
        </StatusBadge>
      ),
    },
    {
      id: "description",
      header: "Descripción",
      className: "max-w-xs",
      hideBelowXl: true,
      cell: (reward) =>
        reward.description ? (
          <span className="line-clamp-2 text-slate-600">{reward.description}</span>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      id: "cost",
      header: "Costo",
      className: "whitespace-nowrap font-mono font-bold",
      cell: (reward) => formatPoints(reward.costPoints),
    },
    { id: "stock", header: "Stock disponible", cell: (reward) => <StockCell reward={reward} /> },
    {
      id: "status",
      header: "Estado",
      cell: (reward) => (
        <StatusBadge tone={REWARD_STATUS_TONES[reward.status]}>{REWARD_STATUS_LABELS[reward.status]}</StatusBadge>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Administración", href: adminRoutes.home() },
          { label: eventName },
          { label: "Premios" },
        ]}
        title="Premios y recompensas"
        description="Administra el catálogo de premios que los visitantes pueden canjear con sus puntos."
        actions={
          <Button
            variant="primary"
            disabled={status !== "success"}
            onClick={() => setDialog({ kind: "create" })}
            leadingIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
          >
            Crear premio
          </Button>
        }
      />

      {status === "loading" && <ListSkeleton label="Cargando premios" />}

      {status === "error" && (
        <ErrorState title="No pudimos cargar los premios." description="Intenta nuevamente." onRetry={reload} />
      )}

      {status === "success" && rewards.length === 0 && (
        <EmptyState
          icon={<Gift className="h-7 w-7" />}
          title="Todavía no tienes premios en el catálogo."
          description="Crea tu primer premio para que los visitantes tengan algo que canjear."
          action={
            <Button variant="primary" onClick={() => setDialog({ kind: "create" })} leadingIcon={<Plus aria-hidden="true" className="h-4 w-4" />}>
              Crear premio
            </Button>
          }
        />
      )}

      {status === "success" && rewards.length > 0 && (
        <>
          <ListToolbar summary={`${filtered.length} de ${rewards.length} premios`}>
            <SearchField label="Buscar" value={search} onChange={setSearch} placeholder="Nombre, descripción o tipo" />
            <FilterSelect label="Tipo" value={typeFilter} onChange={setTypeFilter} options={TYPE_FILTER_OPTIONS} />
            <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTIONS} />
          </ListToolbar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Gift className="h-7 w-7" />}
              title="Ningún premio coincide con tu búsqueda."
              description="Prueba con otros términos o quita los filtros."
              action={hasActiveFilters ? <Button onClick={clearFilters}>Limpiar filtros</Button> : undefined}
            />
          ) : (
            <DataTable
              caption="Catálogo de premios del evento"
              columns={columns}
              rows={filtered}
              getRowId={(reward) => reward.id}
              renderActions={(reward) => (
                <RowActions
                  label={`Acciones de ${reward.name}`}
                  items={[
                    { id: "detail", label: "Ver detalle", icon: Eye, onSelect: () => setDialog({ kind: "detail", reward }) },
                    { id: "edit", label: "Editar", icon: Pencil, onSelect: () => setDialog({ kind: "edit", reward }) },
                    {
                      id: "toggle",
                      label: reward.status === "active" ? "Desactivar" : "Activar",
                      icon: Power,
                      disabled: busy.isBusy(reward.id),
                      onSelect: () => void handleToggle(reward),
                    },
                    {
                      id: "inventory",
                      label: "Consultar inventario",
                      icon: Boxes,
                      href: adminRoutes.inventory(eventId, reward.id),
                    },
                    { id: "delete", label: "Eliminar", icon: Trash2, tone: "danger", onSelect: () => setDialog({ kind: "delete", reward }) },
                  ]}
                />
              )}
            />
          )}
        </>
      )}

      {dialog?.kind === "create" && (
        <RewardFormModal
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            const created = await create(input);
            toast.success(`Premio «${created.name}» creado.`);
          }}
        />
      )}

      {dialog?.kind === "edit" && (
        <RewardFormModal
          reward={dialog.reward}
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            // El stock inicial solo aplica al crear; después se gestiona desde Inventario.
            const updated = await update(dialog.reward.id, {
              name: input.name,
              description: input.description,
              type: input.type,
              costPoints: input.costPoints,
              imageUrl: input.imageUrl,
              status: input.status,
            });
            toast.success(`Premio «${updated.name}» actualizado.`);
          }}
        />
      )}

      {dialog?.kind === "detail" && (
        <RewardDetailModal
          reward={dialog.reward}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog({ kind: "edit", reward: dialog.reward })}
        />
      )}

      {dialog?.kind === "delete" && (
        <ConfirmDialog
          title="Eliminar premio"
          description={
            <>
              <p>
                Vas a eliminar <strong>«{dialog.reward.name}»</strong> del catálogo. Los visitantes dejarán de verlo.
              </p>
              {dialog.reward.stock && (
                <p>
                  También se eliminará su inventario ({formatNumber(dialog.reward.stock.onHand)} unidades físicas) y su
                  historial de ajustes. Esta acción no se puede deshacer.
                </p>
              )}
            </>
          }
          confirmLabel="Eliminar premio"
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            await remove(dialog.reward.id);
            toast.success(`Premio «${dialog.reward.name}» eliminado.`);
          }}
        />
      )}
    </>
  );
}
