"use client";

import { Boxes, Pencil } from "lucide-react";

import { Button, ButtonLink, DetailList, Modal, StatusBadge } from "@/components/admin";
import { adminRoutes } from "@/config/admin-routes";
import { StockBreakdown } from "@/features/inventory/components/stock-breakdown";
import { formatDateTime, formatPoints } from "@/lib/format";
import { REWARD_STATUS_LABELS, REWARD_STATUS_TONES, REWARD_TYPE_LABELS } from "../constants";
import type { RewardWithStock } from "../types";
import { RewardThumbnail } from "./reward-thumbnail";

interface RewardDetailModalProps {
  reward: RewardWithStock;
  onEdit: () => void;
  onClose: () => void;
}

export function RewardDetailModal({ reward, onEdit, onClose }: RewardDetailModalProps) {
  return (
    <Modal
      title={reward.name}
      description="Detalle del premio"
      size="lg"
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
      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <RewardThumbnail imageUrl={reward.imageUrl} name={reward.name} size="lg" decorative />
          <div className="min-w-0 flex-1 space-y-4">
            <DetailList
              items={[
                { label: "Tipo", value: REWARD_TYPE_LABELS[reward.type] },
                { label: "Costo", value: formatPoints(reward.costPoints) },
                {
                  label: "Estado",
                  value: (
                    <StatusBadge tone={REWARD_STATUS_TONES[reward.status]}>{REWARD_STATUS_LABELS[reward.status]}</StatusBadge>
                  ),
                },
                { label: "Identificador", value: <span className="font-mono">{reward.id}</span> },
                { label: "Creado", value: formatDateTime(reward.createdAt) },
                { label: "Última actualización", value: formatDateTime(reward.updatedAt) },
              ]}
            />
            <div>
              <p className="pixel-label text-slate-600">Descripción</p>
              <p className="mt-1 whitespace-pre-line text-sm font-medium text-slate-700">
                {reward.description ?? "Sin descripción."}
              </p>
            </div>
          </div>
        </div>

        <section aria-label="Inventario asociado" className="border-t-2 border-[var(--expo-line)] pt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-black text-[var(--expo-navy)]">Inventario asociado</h3>
            {reward.stock && (
              <ButtonLink
                href={adminRoutes.inventory(reward.eventId, reward.id)}
                size="sm"
                leadingIcon={<Boxes aria-hidden="true" className="h-4 w-4" />}
              >
                Consultar inventario
              </ButtonLink>
            )}
          </div>
          {reward.stock ? (
            <StockBreakdown totals={reward.stock} />
          ) : (
            <p className="rounded-xl border-2 border-dashed border-[var(--expo-line)] p-4 text-center text-sm font-medium text-slate-600">
              Este premio no tiene inventario registrado.
            </p>
          )}
        </section>
      </div>
    </Modal>
  );
}
