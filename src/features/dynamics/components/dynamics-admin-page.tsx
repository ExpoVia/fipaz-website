"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Power, Sparkles, Trash2 } from "lucide-react";

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
import { useBusyIds } from "@/hooks/use-busy-ids";
import { getErrorMessage } from "@/lib/api/service-error";
import { formatDateOnly, formatPoints } from "@/lib/format";
import { matchesQuery } from "@/lib/text";
import {
  DYNAMIC_STATUS_LABELS,
  DYNAMIC_STATUS_TONES,
  DYNAMIC_TYPE_LABELS,
  DYNAMIC_TYPE_OPTIONS,
} from "../constants";
import { useDynamics } from "../hooks/use-dynamics";
import type { Dynamic, DynamicStatus, DynamicType } from "../types";
import { DynamicDetailModal } from "./dynamic-detail-modal";
import { DynamicFormModal } from "./dynamic-form-modal";

type Dialog =
  | { kind: "create" }
  | { kind: "edit"; dynamic: Dynamic }
  | { kind: "detail"; dynamic: Dynamic }
  | { kind: "delete"; dynamic: Dynamic };

interface DynamicsAdminPageProps {
  standId: string;
  standName: string;
}

const TYPE_FILTER_OPTIONS = [{ value: "all", label: "Todos los tipos" }, ...DYNAMIC_TYPE_OPTIONS] as const;
const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: DYNAMIC_STATUS_LABELS.active },
  { value: "inactive", label: DYNAMIC_STATUS_LABELS.inactive },
] as const;

export function DynamicsAdminPage({ standId, standName }: DynamicsAdminPageProps) {
  const { dynamics, status, reload, create, update, toggleStatus, remove } = useDynamics(standId);
  const toast = useToast();
  const busy = useBusyIds();

  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DynamicType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DynamicStatus | "all">("all");

  const filtered = useMemo(
    () =>
      dynamics.filter(
        (dynamic) =>
          (typeFilter === "all" || dynamic.type === typeFilter) &&
          (statusFilter === "all" || dynamic.status === statusFilter) &&
          matchesQuery(search, dynamic.name, dynamic.description, DYNAMIC_TYPE_LABELS[dynamic.type]),
      ),
    [dynamics, search, typeFilter, statusFilter],
  );

  const hasActiveFilters = search.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  async function handleToggle(dynamic: Dynamic) {
    try {
      const updated = await busy.run(dynamic.id, () => toggleStatus(dynamic.id));
      toast.success(
        updated.status === "active"
          ? `«${updated.name}» quedó activa.`
          : `«${updated.name}» quedó inactiva.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "No pudimos cambiar el estado de la dinámica."));
    }
  }

  const columns: DataColumn<Dynamic>[] = [
    {
      id: "name",
      header: "Nombre",
      cell: (dynamic) => <span className="font-black text-[var(--expo-navy)]">{dynamic.name}</span>,
    },
    {
      id: "description",
      header: "Descripción",
      className: "max-w-xs",
      hideBelowXl: true,
      cell: (dynamic) =>
        dynamic.description ? (
          <span className="line-clamp-2 text-slate-600">{dynamic.description}</span>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      id: "type",
      header: "Tipo",
      cell: (dynamic) => (
        <StatusBadge tone="info" className="normal-case">
          {DYNAMIC_TYPE_LABELS[dynamic.type]}
        </StatusBadge>
      ),
    },
    {
      id: "points",
      header: "Puntos",
      className: "whitespace-nowrap font-mono font-bold",
      cell: (dynamic) => formatPoints(dynamic.points),
    },
    {
      id: "status",
      header: "Estado",
      cell: (dynamic) => (
        <StatusBadge tone={DYNAMIC_STATUS_TONES[dynamic.status]}>{DYNAMIC_STATUS_LABELS[dynamic.status]}</StatusBadge>
      ),
    },
    {
      id: "createdAt",
      header: "Creación",
      className: "whitespace-nowrap text-slate-600",
      cell: (dynamic) => formatDateOnly(dynamic.createdAt.slice(0, 10)),
    },
  ];

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Administración", href: adminRoutes.home() },
          { label: standName },
          { label: "Dinámicas" },
        ]}
        title="Dinámicas del stand"
        description="Configura las dinámicas con las que los visitantes interactúan en tu stand y suman puntos."
        actions={
          <Button
            variant="primary"
            disabled={status !== "success"}
            onClick={() => setDialog({ kind: "create" })}
            leadingIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
          >
            Crear dinámica
          </Button>
        }
      />

      {status === "loading" && <ListSkeleton label="Cargando dinámicas" />}

      {status === "error" && (
        <ErrorState title="No pudimos cargar las dinámicas." description="Intenta nuevamente." onRetry={reload} />
      )}

      {status === "success" && dynamics.length === 0 && (
        <EmptyState
          icon={<Sparkles className="h-7 w-7" />}
          title="Todavía no tienes dinámicas configuradas."
          description="Crea tu primera dinámica para comenzar."
          action={
            <Button variant="primary" onClick={() => setDialog({ kind: "create" })} leadingIcon={<Plus aria-hidden="true" className="h-4 w-4" />}>
              Crear dinámica
            </Button>
          }
        />
      )}

      {status === "success" && dynamics.length > 0 && (
        <>
          <ListToolbar summary={`${filtered.length} de ${dynamics.length} dinámicas`}>
            <SearchField label="Buscar" value={search} onChange={setSearch} placeholder="Nombre, descripción o tipo" />
            <FilterSelect label="Tipo" value={typeFilter} onChange={setTypeFilter} options={TYPE_FILTER_OPTIONS} />
            <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTIONS} />
          </ListToolbar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-7 w-7" />}
              title="Ninguna dinámica coincide con tu búsqueda."
              description="Prueba con otros términos o quita los filtros."
              action={hasActiveFilters ? <Button onClick={clearFilters}>Limpiar filtros</Button> : undefined}
            />
          ) : (
            <DataTable
              caption="Dinámicas configuradas para el stand"
              columns={columns}
              rows={filtered}
              getRowId={(dynamic) => dynamic.id}
              renderActions={(dynamic) => (
                <RowActions
                  label={`Acciones de ${dynamic.name}`}
                  items={[
                    { id: "detail", label: "Ver detalle", icon: Eye, onSelect: () => setDialog({ kind: "detail", dynamic }) },
                    { id: "edit", label: "Editar", icon: Pencil, onSelect: () => setDialog({ kind: "edit", dynamic }) },
                    {
                      id: "toggle",
                      label: dynamic.status === "active" ? "Desactivar" : "Activar",
                      icon: Power,
                      disabled: busy.isBusy(dynamic.id),
                      onSelect: () => void handleToggle(dynamic),
                    },
                    { id: "delete", label: "Eliminar", icon: Trash2, tone: "danger", onSelect: () => setDialog({ kind: "delete", dynamic }) },
                  ]}
                />
              )}
            />
          )}
        </>
      )}

      {dialog?.kind === "create" && (
        <DynamicFormModal
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            const created = await create(input);
            toast.success(`Dinámica «${created.name}» creada.`);
          }}
        />
      )}

      {dialog?.kind === "edit" && (
        <DynamicFormModal
          dynamic={dialog.dynamic}
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            const updated = await update(dialog.dynamic.id, input);
            toast.success(`Dinámica «${updated.name}» actualizada.`);
          }}
        />
      )}

      {dialog?.kind === "detail" && (
        <DynamicDetailModal
          dynamic={dialog.dynamic}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog({ kind: "edit", dynamic: dialog.dynamic })}
        />
      )}

      {dialog?.kind === "delete" && (
        <ConfirmDialog
          title="Eliminar dinámica"
          description={
            <p>
              Vas a eliminar <strong>«{dialog.dynamic.name}»</strong>. Los visitantes dejarán de verla y esta acción no se
              puede deshacer.
            </p>
          }
          confirmLabel="Eliminar dinámica"
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            await remove(dialog.dynamic.id);
            toast.success(`Dinámica «${dialog.dynamic.name}» eliminada.`);
          }}
        />
      )}
    </>
  );
}
