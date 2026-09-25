"use client";

import { useId } from "react";

import { Button, Modal, SelectField, TextAreaField, TextField } from "@/components/admin";
import { useZodForm } from "@/hooks/use-zod-form";
import {
  DYNAMIC_LIMITS,
  DYNAMIC_STATUS_OPTIONS,
  DYNAMIC_TYPE_OPTIONS,
} from "../constants";
import type { Dynamic, DynamicInput } from "../types";
import { dynamicFormSchema, getDynamicFormValues } from "../validation";

interface DynamicFormModalProps {
  /** Dinámica a editar; sin ella el formulario crea una nueva. */
  dynamic?: Dynamic;
  onSubmit: (input: DynamicInput) => Promise<void>;
  onClose: () => void;
}

export function DynamicFormModal({ dynamic, onSubmit, onClose }: DynamicFormModalProps) {
  const formId = useId();
  const isEditing = dynamic !== undefined;
  const { formRef, values, field, handleSubmit, submitting, submitError } = useZodForm({
    schema: dynamicFormSchema,
    initialValues: getDynamicFormValues(dynamic),
    submitFallbackError: "No pudimos guardar la dinámica. Intenta nuevamente.",
  });

  return (
    <Modal
      title={isEditing ? "Editar dinámica" : "Crear dinámica"}
      description={
        isEditing
          ? "Actualiza los datos de la dinámica del stand."
          : "Configura una nueva dinámica para que los visitantes sumen puntos en tu stand."
      }
      dismissible={!submitting}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} variant="primary" loading={submitting}>
            {isEditing ? "Guardar cambios" : "Crear dinámica"}
          </Button>
        </>
      }
    >
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

        <TextField {...field("name")} label="Nombre" required placeholder="Ej. Trivia Andina Tech" autoComplete="off" />

        <TextAreaField
          {...field("description")}
          label="Descripción"
          rows={3}
          hint="Opcional. Explica qué debe hacer el visitante."
          counter={{ current: values.description.trim().length, max: DYNAMIC_LIMITS.descriptionMax }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField {...field("type")} label="Tipo" required placeholder="Selecciona un tipo" options={DYNAMIC_TYPE_OPTIONS} />
          <TextField
            {...field("points")}
            label="Puntos"
            required
            inputMode="numeric"
            placeholder="0"
            hint="Puntos que recibe el visitante al completarla."
            autoComplete="off"
          />
        </div>

        <SelectField {...field("status")} label="Estado" required options={DYNAMIC_STATUS_OPTIONS} />
      </form>
    </Modal>
  );
}
