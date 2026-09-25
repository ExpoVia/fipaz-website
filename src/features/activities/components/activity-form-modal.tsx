"use client";

import { useId, useMemo } from "react";

import { Button, Modal, SelectField, TextAreaField, TextField } from "@/components/admin";
import { useZodForm } from "@/hooks/use-zod-form";
import { ACTIVITY_LIMITS, ACTIVITY_STATUS_OPTIONS } from "../constants";
import type { Activity, ActivityInput } from "../types";
import { createActivitySchema, getActivityFormValues } from "../validation";

interface ActivityFormModalProps {
  /** Actividad a editar; sin ella el formulario crea una nueva. */
  activity?: Activity;
  onSubmit: (input: ActivityInput) => Promise<void>;
  onClose: () => void;
}

export function ActivityFormModal({ activity, onSubmit, onClose }: ActivityFormModalProps) {
  const formId = useId();
  const isEditing = activity !== undefined;
  const minCapacity = activity?.registered ?? 0;
  const schema = useMemo(() => createActivitySchema({ minCapacity }), [minCapacity]);
  const { formRef, values, field, handleSubmit, submitting, submitError } = useZodForm({
    schema,
    initialValues: getActivityFormValues(activity),
    submitFallbackError: "No pudimos guardar la actividad. Intenta nuevamente.",
  });

  return (
    <Modal
      title={isEditing ? "Editar actividad" : "Crear actividad"}
      description={
        isEditing
          ? "Actualiza la agenda de la actividad."
          : "Programa una actividad para que los visitantes se registren y sumen puntos al asistir."
      }
      dismissible={!submitting}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} variant="primary" loading={submitting}>
            {isEditing ? "Guardar cambios" : "Crear actividad"}
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

        <TextField {...field("name")} label="Nombre" required placeholder="Ej. Taller de automatización" autoComplete="off" />

        <TextAreaField
          {...field("description")}
          label="Descripción"
          rows={3}
          hint="Opcional. Qué van a hacer o aprender los asistentes."
          counter={{ current: values.description.trim().length, max: ACTIVITY_LIMITS.descriptionMax }}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField {...field("date")} type="date" label="Fecha" required />
          <TextField {...field("startTime")} type="time" label="Hora de inicio" required />
          <TextField {...field("endTime")} type="time" label="Hora de finalización" hint="Opcional." />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            {...field("capacity")}
            label="Capacidad"
            required
            inputMode="numeric"
            placeholder="Ej. 30"
            autoComplete="off"
            hint={minCapacity > 0 ? `Mínimo ${minCapacity} (ya registrados).` : "Personas que caben."}
          />
          <TextField
            {...field("points")}
            label="Puntos"
            required
            inputMode="numeric"
            placeholder="0"
            autoComplete="off"
            hint="Por asistir."
          />
          <SelectField {...field("status")} label="Estado" required options={ACTIVITY_STATUS_OPTIONS} />
        </div>
      </form>
    </Modal>
  );
}
