"use client";

import { ClipboardCheck, Pencil } from "lucide-react";

import { Button, ButtonLink, DetailList, Modal, StatusBadge } from "@/components/admin";
import { adminRoutes } from "@/config/admin-routes";
import { formatDateOnly, formatDateTime, formatNumber, formatPoints } from "@/lib/format";
import { ACTIVITY_STATUS_LABELS, ACTIVITY_STATUS_TONES } from "../constants";
import type { Activity } from "../types";

interface ActivityDetailModalProps {
  activity: Activity;
  onEdit: () => void;
  onClose: () => void;
}

export function ActivityDetailModal({ activity, onEdit, onClose }: ActivityDetailModalProps) {
  return (
    <Modal
      title={activity.name}
      description="Detalle de la actividad"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} data-autofocus>
            Cerrar
          </Button>
          <ButtonLink
            href={adminRoutes.attendance(activity.id)}
            leadingIcon={<ClipboardCheck aria-hidden="true" className="h-4 w-4" />}
          >
            Ver asistencia
          </ButtonLink>
          <Button variant="primary" onClick={onEdit} leadingIcon={<Pencil aria-hidden="true" className="h-4 w-4" />}>
            Editar
          </Button>
        </>
      }
    >
      <DetailList
        items={[
          { label: "Fecha", value: formatDateOnly(activity.date) },
          {
            label: "Horario",
            value: activity.endTime ? `${activity.startTime} – ${activity.endTime}` : `Desde las ${activity.startTime}`,
          },
          { label: "Capacidad", value: `${formatNumber(activity.capacity)} personas` },
          { label: "Registrados", value: formatNumber(activity.registered) },
          { label: "Asistentes", value: formatNumber(activity.attendees) },
          { label: "Puntos por asistir", value: formatPoints(activity.points) },
          {
            label: "Estado",
            value: (
              <StatusBadge tone={ACTIVITY_STATUS_TONES[activity.status]}>
                {ACTIVITY_STATUS_LABELS[activity.status]}
              </StatusBadge>
            ),
          },
          { label: "Identificador", value: <span className="font-mono">{activity.id}</span> },
          { label: "Creada", value: formatDateTime(activity.createdAt) },
          { label: "Última actualización", value: formatDateTime(activity.updatedAt) },
        ]}
      />
      <div className="mt-5 border-t-2 border-[var(--expo-line)] pt-4">
        <p className="pixel-label text-slate-600">Descripción</p>
        <p className="mt-1 whitespace-pre-line text-sm font-medium text-slate-700">
          {activity.description ?? "Sin descripción."}
        </p>
      </div>
    </Modal>
  );
}
