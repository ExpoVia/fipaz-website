"use client";

import { Pencil } from "lucide-react";

import { Button, DetailList, Modal, StatusBadge } from "@/components/admin";
import { formatDateTime, formatPoints } from "@/lib/format";
import { DYNAMIC_STATUS_LABELS, DYNAMIC_STATUS_TONES, DYNAMIC_TYPE_LABELS } from "../constants";
import type { Dynamic } from "../types";

interface DynamicDetailModalProps {
  dynamic: Dynamic;
  onEdit: () => void;
  onClose: () => void;
}

export function DynamicDetailModal({ dynamic, onEdit, onClose }: DynamicDetailModalProps) {
  return (
    <Modal
      title={dynamic.name}
      description="Detalle de la dinámica"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} data-autofocus>
            Cerrar
          </Button>
          <Button variant="primary" onClick={onEdit} leadingIcon={<Pencil aria-hidden="true" className="h-4 w-4" />}>
            Editar
          </Button>
        </>
      }
    >
      <DetailList
        items={[
          { label: "Tipo", value: DYNAMIC_TYPE_LABELS[dynamic.type] },
          { label: "Puntos otorgados", value: formatPoints(dynamic.points) },
          {
            label: "Estado",
            value: (
              <StatusBadge tone={DYNAMIC_STATUS_TONES[dynamic.status]}>
                {DYNAMIC_STATUS_LABELS[dynamic.status]}
              </StatusBadge>
            ),
          },
          { label: "Identificador", value: <span className="font-mono">{dynamic.id}</span> },
          { label: "Creada", value: formatDateTime(dynamic.createdAt) },
          { label: "Última actualización", value: formatDateTime(dynamic.updatedAt) },
        ]}
      />
      <div className="mt-5 border-t-2 border-[var(--expo-line)] pt-4">
        <p className="pixel-label text-slate-600">Descripción</p>
        <p className="mt-1 whitespace-pre-line text-sm font-medium text-slate-700">
          {dynamic.description ?? "Sin descripción."}
        </p>
      </div>
    </Modal>
  );
}
