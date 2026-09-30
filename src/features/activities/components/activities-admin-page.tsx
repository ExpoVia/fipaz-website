"use client";

import { useMemo, useState } from "react";
import { Ban, CalendarDays, ClipboardCheck, Eye, Pencil, Plus, UserCheck } from "lucide-react";

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
import { getErrorMessage } from "@/lib/api/service-error";
import { formatDateOnly, formatNumber, formatPoints } from "@/lib/format";
import { matchesQuery } from "@/lib/text";
import { ACTIVITY_STATUS_LABELS, ACTIVITY_STATUS_TONES, ACTIVITY_STATUSES } from "../constants";
import { useActivities } from "../hooks/use-activities";
import type { Activity, ActivityStatus } from "../types";
import { ActivityDetailModal } from "./activity-detail-modal";
import { ActivityFormModal } from "./activity-form-modal";

type Dialog =
  | { kind: "create" }
  | { kind: "edit"; activity: Activity }
  | { kind: "detail"; activity: Activity }
  | { kind: "cancel"; activity: Activity };

interface ActivitiesAdminPageProps {
  standId: string;
  standName: string;
}

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  ...ACTIVITY_STATUSES.map((value) => ({ value, label: ACTIVITY_STATUS_LABELS[value] })),
] as const;

/** Una actividad ya cancelada o finalizada no admite cancelación. */
function canCancel(activity: Activity): boolean {
  return activity.status !== "cancelled" && activity.status !== "finished";
}

export function ActivitiesAdminPage({ standId, standName }: ActivitiesAdminPageProps) {
  const { activities, status, error, reload, create, update, cancel } = useActivities(standId);
  const toast = useToast();

  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "all">("all");

  const filtered = useMemo(
    () =>
      activities.filter(
        (activity) =>
          (statusFilter === "all" || activity.status === statusFilter) &&
          matchesQuery(search, activity.name, activity.description),
      ),
    [activities, search, statusFilter],
  );

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  const columns: DataColumn<Activity>[] = [
    {
      id: "name",
      header: "Nombre",
      cell: (activity) => <span className="font-black text-[var(--expo-navy)]">{activity.name}</span>,
    },
    {
      id: "date",
      header: "Fecha",
      className: "whitespace-nowrap",
      cell: (activity) => formatDateOnly(activity.date),
    },
    {
      id: "time",
      header: "Hora",
      className: "whitespace-nowrap font-mono text-xs font-bold",
      cell: (activity) => (activity.endTime ? `${activity.startTime} – ${activity.endTime}` : activity.startTime),
    },
    {
      id: "capacity",
      header: "Capacidad",
      hideBelowXl: true,
      className: "whitespace-nowrap text-right font-mono font-bold",
      cell: (activity) => formatNumber(activity.capacity),
    },
    {
      id: "registered",
      header: "Registrados",
      className: "whitespace-nowrap text-right",
      cell: (activity) => (
        <div>
          <p className="font-mono font-bold">{formatNumber(activity.registered)}</p>
          {activity.registered >= activity.capacity && (
            <p className="text-xs font-black text-amber-800">Cupo lleno</p>
          )}
        </div>
      ),
    },
    {
      id: "attendees",
      header: "Asistentes",
      hideBelowXl: true,
      className: "whitespace-nowrap text-right font-mono font-bold",
      cell: (activity) => formatNumber(activity.attendees),
    },
    {
      id: "points",
      header: "Puntos",
      hideBelowXl: true,
      className: "whitespace-nowrap font-mono font-bold",
      cell: (activity) => formatPoints(activity.points),
    },
    {
      id: "status",
      header: "Estado",
      cell: (activity) => (
        <StatusBadge tone={ACTIVITY_STATUS_TONES[activity.status]}>{ACTIVITY_STATUS_LABELS[activity.status]}</StatusBadge>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Administración", href: adminRoutes.home() },
          { label: standName },
          { label: "Actividades" },
        ]}
        title="Actividades del stand"
        description="Programa las actividades de tu stand, controla el cupo y registra la asistencia de los participantes."
        actions={
          <Button
            variant="primary"
            disabled={status !== "success"}
            onClick={() => setDialog({ kind: "create" })}
            leadingIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
          >
            Crear actividad
          </Button>
        }
      />

      {status === "loading" && <ListSkeleton label="Cargando actividades" />}

      {status === "error" && (
        <ErrorState
          title="No pudimos cargar las actividades."
          description={getErrorMessage(error, "Intenta nuevamente.")}
          onRetry={reload}
        />
      )}

      {status === "success" && activities.length === 0 && (
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title="Todavía no tienes actividades programadas."
          description="Crea tu primera actividad para que los visitantes puedan registrarse."
          action={
            <Button variant="primary" onClick={() => setDialog({ kind: "create" })} leadingIcon={<Plus aria-hidden="true" className="h-4 w-4" />}>
              Crear actividad
            </Button>
          }
        />
      )}

      {status === "success" && activities.length > 0 && (
        <>
          <ListToolbar summary={`${filtered.length} de ${activities.length} actividades`}>
            <SearchField label="Buscar" value={search} onChange={setSearch} placeholder="Nombre o descripción" />
            <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTIONS} />
          </ListToolbar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-7 w-7" />}
              title="Ninguna actividad coincide con tu búsqueda."
              description="Prueba con otros términos o quita los filtros."
              action={hasActiveFilters ? <Button onClick={clearFilters}>Limpiar filtros</Button> : undefined}
            />
          ) : (
            <DataTable
              caption="Actividades programadas del stand"
              columns={columns}
              rows={filtered}
              getRowId={(activity) => activity.id}
              renderActions={(activity) => (
                <RowActions
                  label={`Acciones de ${activity.name}`}
                  items={[
                    { id: "detail", label: "Ver detalle", icon: Eye, onSelect: () => setDialog({ kind: "detail", activity }) },
                    { id: "edit", label: "Editar", icon: Pencil, onSelect: () => setDialog({ kind: "edit", activity }) },
                    { id: "attendees", label: "Ver asistentes", icon: UserCheck, href: adminRoutes.attendance(activity.id, "present") },
                    { id: "attendance", label: "Marcar asistencia", icon: ClipboardCheck, href: adminRoutes.attendance(activity.id) },
                    {
                      id: "cancel",
                      label: "Cancelar actividad",
                      icon: Ban,
                      tone: "danger",
                      disabled: !canCancel(activity),
                      onSelect: () => setDialog({ kind: "cancel", activity }),
                    },
                  ]}
                />
              )}
            />
          )}
        </>
      )}

      {dialog?.kind === "create" && (
        <ActivityFormModal
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            const created = await create(input);
            toast.success(`Actividad «${created.name}» creada.`);
          }}
        />
      )}

      {dialog?.kind === "edit" && (
        <ActivityFormModal
          activity={dialog.activity}
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            const updated = await update(dialog.activity.id, input);
            toast.success(`Actividad «${updated.name}» actualizada.`);
          }}
        />
      )}

      {dialog?.kind === "detail" && (
        <ActivityDetailModal
          activity={dialog.activity}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog({ kind: "edit", activity: dialog.activity })}
        />
      )}

      {dialog?.kind === "cancel" && (
        <ConfirmDialog
          title="Cancelar actividad"
          description={
            <>
              <p>
                Vas a cancelar <strong>«{dialog.activity.name}»</strong>. Los {formatNumber(dialog.activity.registered)}{" "}
                participantes registrados verán la actividad como cancelada y ya no podrás marcar su asistencia.
              </p>
              <p>Esta acción no se puede deshacer.</p>
            </>
          }
          confirmLabel="Cancelar actividad"
          dismissLabel="Volver"
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            await cancel(dialog.activity.id);
            toast.success(`Actividad «${dialog.activity.name}» cancelada.`);
          }}
        />
      )}
    </>
  );
}
