"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { getErrorMessage } from "@/lib/api/service-error";
import { Button } from "./button";
import { Modal } from "./modal";

interface ConfirmDialogProps {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** Texto del botón que descarta el diálogo; cámbialo si "Cancelar" se confunde con la acción. */
  dismissLabel?: string;
  tone?: "danger" | "primary";
  /** Debe lanzar si la operación falla; el mensaje del `ServiceError` se muestra en el diálogo. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Confirmación de acciones destructivas o irreversibles, con estado de envío y error propio. */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  dismissLabel = "Cancelar",
  tone = "danger",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (failure) {
      setError(getErrorMessage(failure, "No pudimos completar la acción. Intenta nuevamente."));
      setPending(false);
    }
  }

  return (
    <Modal
      title={title}
      size="sm"
      dismissible={!pending}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending} data-autofocus>
            {dismissLabel}
          </Button>
          <Button variant={tone} onClick={handleConfirm} loading={pending}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm font-medium text-slate-700">
        {description}
        {error && (
          <p role="alert" className="rounded-xl border-2 border-rose-600 bg-rose-50 p-3 font-bold text-rose-900">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
