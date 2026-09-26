"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, Clock, UserCheck, Users, UserX, Undo2, X } from "lucide-react";

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
  SearchField,
  StatusBadge,
  useToast,
} from "@/components/admin";
import type { DataColumn } from "@/components/admin";
import { MetricCard } from "@/components/panel/metric-card";
import { adminRoutes } from "@/config/admin-routes";
import { ADMIN_DEFAULT_STAND_ID } from "@/features/admin/admin-scope";
import { useBusyIds } from "@/hooks/use-busy-ids";
import { getErrorMessage, ServiceError } from "@/lib/api/service-error";
import { formatDateOnly, formatNumber, formatPoints, formatTime } from "@/lib/format";
import { matchesQuery } from "@/lib/text";
import { getParticipantState, summarizeAttendance } from "../attendance";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_TONES,
  PARTICIPANT_STATE_LABELS,
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_TONES,
} from "../constants";
import { useAttendance } from "../hooks/use-attendance";
import type { AttendanceRecord, ParticipantState } from "../types";

interface AttendanceAdminPageProps {
  activityId: string;
  /** Filtro de estado con el que se abre la pantalla (`?status=`). */
  initialStatus?: ParticipantState;
}

const STATE_FILTER_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "registered", label: PARTICIPANT_STATE_LABELS.registered },
  { value: "present", label: PARTICIPANT_STATE_LABELS.present },
  { value: "absent", label: PARTICIPANT_STATE_LABELS.absent },
  { value: "cancelled", label: PARTICIPANT_STATE_LABELS.cancelled },
] as const;

export function AttendanceAdminPage({ activityId, initialStatus }: AttendanceAdminPageProps) {
  const resource = useAttendance(activityId);
  const { status, error, reload, confirm, markAbsent, revert } = resource;
  const toast = useToast();
  const busy = useBusyIds();

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<ParticipantState | "all">(initialStatus ?? "all");

  const data = resource.status === "success" ? resource.data : undefined;
  const activity = data?.activity;
  const records = useMemo(() => data?.records ?? [], [data]);

  const summary = useMemo(() => summarizeAttendance(records), [records]);
  const filtered = useMemo(
    () =>
      records.filter(
        (record) =>
          (stateFilter === "all" || getParticipantState(record) === stateFilter) &&
          matchesQuery(search, record.participantName, record.participantEmail, record.participantId),
      ),
    [records, search, stateFilter],
  );

  const hasActiveFilters = search.trim() !== "" || stateFilter !== "all";
  const locked = activity?.status === "cancelled";

  function clearFilters() {
    setSearch("");
    setStateFilter("all");
  }

  async function runAction(
    record: AttendanceRecord,
    action: (participantId: string) => Promise<AttendanceRecord>,
    successMessage: (updated: AttendanceRecord) => string,
    failureMessage: string,
  ) {
    try {
      const updated = await busy.run(record.participantId, () => action(record.participantId));
      toast.success(successMessage(updated));
    } catch (failure) {
      toast.error(getErrorMessage(failure, failureMessage));
    }
  }

  const columns: DataColumn<AttendanceRecord>[] = [
    {
      id: "participant",
      header: "Participante",
      cell: (record) => <span className="font-black text-[var(--expo-navy)]">{record.participantName}</span>,
    },
    {
      id: "contact",
      header: "Correo o identificador",
      cell: (record) => (
        <div className="min-w-0">
          <p className="truncate">{record.participantEmail}</p>
          <p className="font-mono text-xs text-slate-600">{record.participantId}</p>
        </div>
      ),
    },
    {
      id: "registration",
      header: "Registro",
      cell: (record) => (
        <StatusBadge tone={REGISTRATION_STATUS_TONES[record.registrationStatus]}>
          {REGISTRATION_STATUS_LABELS[record.registrationStatus]}
        </StatusBadge>
      ),
    },
    {
      id: "attendance",
      header: "Asistencia",
      cell: (record) =>
        record.registrationStatus === "cancelled" ? (
          <span className="text-slate-500">—</span>
        ) : (
          <StatusBadge tone={ATTENDANCE_STATUS_TONES[record.attendanceStatus]}>
            {ATTENDANCE_STATUS_LABELS[record.attendanceStatus]}
          </StatusBadge>
        ),
    },
    {
      id: "arrivedAt",
      header: "Hora de llegada",
      className: "whitespace-nowrap font-mono text-xs font-bold",
      cell: (record) => (record.arrivedAt ? formatTime(record.arrivedAt) : <span className="text-slate-500">—</span>),
    },
    {
      id: "points",
      header: "Puntos",
      className: "whitespace-nowrap font-mono font-bold",
      cell: (record) => formatPoints(record.pointsAwarded),
    },
  ];

  function renderActions(record: AttendanceRecord) {
    const state = getParticipantState(record);
    if (state === "cancelled") return <span className="text-xs font-bold text-slate-500">Sin acciones</span>;

    const disabled = busy.isBusy(record.participantId) || locked;
    const name = record.participantName;

    return (
      <>
        {state !== "present" && (
          <Button
            size="sm"
            variant="primary"
            disabled={disabled}
            aria-label={`Confirmar asistencia de ${name}`}
            leadingIcon={<Check aria-hidden="true" className="h-4 w-4" />}
            onClick={() =>
              runAction(
                record,
                confirm,
                (updated) => `Asistencia confirmada: ${name} (+${formatNumber(updated.pointsAwarded)} pts).`,
                "No pudimos confirmar la asistencia.",
              )
            }
          >
            Confirmar
          </Button>
        )}
        {state === "registered" && (
          <Button
            size="sm"
            disabled={disabled}
            aria-label={`Marcar como ausente a ${name}`}
            leadingIcon={<X aria-hidden="true" className="h-4 w-4" />}
            onClick={() =>
              runAction(record, markAbsent, () => `${name} quedó marcado como ausente.`, "No pudimos marcar la ausencia.")
            }
          >
            Ausente
          </Button>
        )}
        {(state === "present" || state === "absent") && (
          <Button
            size="sm"
            disabled={disabled}
            aria-label={`Revertir asistencia de ${name}`}
            leadingIcon={<Undo2 aria-hidden="true" className="h-4 w-4" />}
            onClick={() =>
              runAction(record, revert, () => `Asistencia revertida para ${name}.`, "No pudimos revertir la asistencia.")
            }
          >
            Revertir
          </Button>
        )}
      </>
    );
  }

  const isNotFound = error instanceof ServiceError && error.code === "NOT_FOUND";
  const standId = activity?.standId ?? ADMIN_DEFAULT_STAND_ID;

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Administración", href: adminRoutes.home() },
          { label: "Actividades", href: adminRoutes.activities(standId) },
          ...(activity ? [{ label: activity.name }] : []),
          { label: "Asistencia" },
        ]}
        title="Asistencia de participantes"
        description={
          activity
            ? `${activity.name} · ${formatDateOnly(activity.date)} · ${
                activity.endTime ? `${activity.startTime} – ${activity.endTime}` : activity.startTime
              } · ${formatPoints(activity.points)} por asistir`
            : "Confirma quién llegó a la actividad y otorga sus puntos."
        }
        actions={
          <ButtonLink
            href={adminRoutes.activities(standId)}
            variant="secondary"
            leadingIcon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
          >
            Volver a actividades
          </ButtonLink>
        }
      />

      {status === "loading" && (
        <div className="space-y-4">
          <MetricsSkeleton />
          <ListSkeleton label="Cargando asistencia" />
        </div>
      )}

      {status === "error" && (
        <ErrorState
          title={isNotFound ? "No encontramos la actividad." : "No pudimos cargar la asistencia."}
          description={
            isNotFound
              ? "Puede que haya sido eliminada o que el enlace sea incorrecto."
              : getErrorMessage(error, "Intenta nuevamente.")
          }
          onRetry={isNotFound ? undefined : reload}
        />
      )}

      {activity && (
        <>
          {locked && (
            <p
              role="status"
              className="mb-4 rounded-xl border-2 border-rose-600 bg-rose-50 p-3 text-sm font-bold text-rose-900"
            >
              Esta actividad fue cancelada: puedes consultar la lista, pero no modificar la asistencia.
            </p>
          )}

          <section aria-label="Resumen de asistencia" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Registrados"
              value={`${formatNumber(summary.registered)} / ${formatNumber(activity.capacity)}`}
              icon={Users}
              hint={
                summary.cancelled === 0
                  ? "Cupo de la actividad"
                  : `${summary.cancelled} ${summary.cancelled === 1 ? "registro cancelado" : "registros cancelados"}`
              }
            />
            <MetricCard label="Presentes" value={formatNumber(summary.present)} icon={UserCheck} hint="Asistencia confirmada" />
            <MetricCard label="Ausentes" value={formatNumber(summary.absent)} icon={UserX} hint="Marcados como ausentes" />
            <MetricCard label="Pendientes" value={formatNumber(summary.pending)} icon={Clock} hint="Aún sin marcar" />
          </section>

          {records.length === 0 ? (
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="Todavía no hay participantes registrados."
              description="Cuando los visitantes se registren en la actividad, aparecerán aquí para marcar su asistencia."
            />
          ) : (
            <>
              <ListToolbar summary={`${filtered.length} de ${records.length} participantes`}>
                <SearchField
                  label="Buscar participante"
                  value={search}
                  onChange={setSearch}
                  placeholder="Nombre, correo o identificador"
                />
                <FilterSelect label="Estado" value={stateFilter} onChange={setStateFilter} options={STATE_FILTER_OPTIONS} />
              </ListToolbar>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-7 w-7" />}
                  title="Ningún participante coincide con tu búsqueda."
                  description="Prueba con otros términos o quita los filtros."
                  action={hasActiveFilters ? <Button onClick={clearFilters}>Limpiar filtros</Button> : undefined}
                />
              ) : (
                <DataTable
                  caption="Participantes registrados en la actividad"
                  columns={columns}
                  rows={filtered}
                  getRowId={(record) => record.id}
                  renderActions={renderActions}
                  actionsLayout="inline"
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
