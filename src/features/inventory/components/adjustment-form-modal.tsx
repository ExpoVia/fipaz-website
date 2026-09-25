"use client";

import { useId, useMemo } from "react";
import { ArrowRight } from "lucide-react";

import { Button, Modal, SelectField, TextAreaField, TextField } from "@/components/admin";
import { useZodForm } from "@/hooks/use-zod-form";
import { formatNumber } from "@/lib/format";
import { computeNewOnHand, getAdjustmentBlocker } from "../adjustments";
import { ADJUSTMENT_LIMITS, ADJUSTMENT_TYPE_HINTS, ADJUSTMENT_TYPE_OPTIONS, ADJUSTMENT_TYPES } from "../constants";
import type { AdjustmentInput, AdjustmentType, InventoryItem } from "../types";
import { createAdjustmentSchema, emptyAdjustmentFormValues } from "../validation";
import { StockBreakdown } from "./stock-breakdown";

interface AdjustmentFormModalProps {
  inventory: InventoryItem;
  onSubmit: (input: AdjustmentInput) => Promise<void>;
  onClose: () => void;
}

function isAdjustmentType(value: string): value is AdjustmentType {
  return (ADJUSTMENT_TYPES as readonly string[]).includes(value);
}

export function AdjustmentFormModal({ inventory, onSubmit, onClose }: AdjustmentFormModalProps) {
  const formId = useId();
  const { onHand, reserved } = inventory;
  const schema = useMemo(() => createAdjustmentSchema({ onHand, reserved }), [onHand, reserved]);
  const { formRef, values, field, handleSubmit, submitting, submitError } = useZodForm({
    schema,
    initialValues: emptyAdjustmentFormValues,
    submitFallbackError: "No pudimos registrar el ajuste. Intenta nuevamente.",
  });

  // Vista previa del resultado mientras se escribe, solo con tipo y cantidad interpretables.
  const type = isAdjustmentType(values.type) ? values.type : null;
  const quantity = /^\d+$/.test(values.quantity.trim()) ? Number(values.quantity.trim()) : 0;
  const preview =
    type && quantity > 0
      ? {
          newOnHand: computeNewOnHand(onHand, type, quantity),
          blocker: getAdjustmentBlocker({ onHand, reserved }, type, quantity),
        }
      : null;

  return (
    <Modal
      title="Ajustar stock"
      description={inventory.rewardName}
      dismissible={!submitting}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} variant="primary" loading={submitting}>
            Registrar ajuste
          </Button>
        </>
      }
    >
      <div className="mb-5">
        <StockBreakdown totals={inventory} />
      </div>

      <form
        id={formId}
        ref={formRef}
        noValidate
        onSubmit={handleSubmit(async (input) => {
          await onSubmit(input);
          onClose();
        })}
        className="space-y-4"
      >
        {submitError && (
          <p role="alert" className="rounded-xl border-2 border-rose-600 bg-rose-50 p-3 text-sm font-bold text-rose-900">
            {submitError}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            {...field("type")}
            label="Tipo de ajuste"
            required
            placeholder="Selecciona un tipo"
            options={ADJUSTMENT_TYPE_OPTIONS}
            hint={type ? ADJUSTMENT_TYPE_HINTS[type] : undefined}
          />
          <TextField
            {...field("quantity")}
            label="Cantidad"
            required
            inputMode="numeric"
            placeholder="Ej. 25"
            autoComplete="off"
            hint={type === "correction" ? "Stock físico real contado." : "Unidades del ajuste."}
          />
        </div>

        {preview && (
          <p
            role="status"
            className={
              preview.blocker
                ? "flex flex-wrap items-center gap-2 rounded-xl border-2 border-rose-600 bg-rose-50 p-3 text-sm font-bold text-rose-900"
                : "flex flex-wrap items-center gap-2 rounded-xl border-2 border-sky-600 bg-sky-50 p-3 text-sm font-bold text-sky-900"
            }
          >
            {preview.blocker ? (
              preview.blocker
            ) : (
              <>
                Stock físico: {formatNumber(onHand)}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                {formatNumber(preview.newOnHand)}
                <span className="font-medium">
                  · Disponible: {formatNumber(inventory.available)}
                  <ArrowRight aria-hidden="true" className="mx-1 inline h-4 w-4" />
                  {formatNumber(preview.newOnHand - reserved)}
                </span>
              </>
            )}
          </p>
        )}

        <TextField
          {...field("reason")}
          label="Motivo"
          required
          placeholder="Ej. Conteo físico del almacén"
          autoComplete="off"
          counter={{ current: values.reason.trim().length, max: ADJUSTMENT_LIMITS.reasonMax }}
        />

        <TextAreaField
          {...field("note")}
          label="Observación"
          rows={3}
          hint="Opcional. Detalles útiles para quien revise el historial."
          counter={{ current: values.note.trim().length, max: ADJUSTMENT_LIMITS.noteMax }}
        />
      </form>
    </Modal>
  );
}
