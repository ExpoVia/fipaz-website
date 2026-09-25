"use client";

import { useId } from "react";

import { Button, Modal, SelectField, TextAreaField, TextField } from "@/components/admin";
import { useZodForm } from "@/hooks/use-zod-form";
import {
  REWARD_IMAGE_OPTIONS,
  REWARD_LIMITS,
  REWARD_STATUS_OPTIONS,
  REWARD_TYPE_OPTIONS,
} from "../constants";
import type { Reward, RewardInput } from "../types";
import { getRewardFormValues, rewardFormSchema } from "../validation";
import { RewardThumbnail } from "./reward-thumbnail";

interface RewardFormModalProps {
  /** Premio a editar; sin él el formulario crea uno nuevo. */
  reward?: Reward;
  onSubmit: (input: RewardInput) => Promise<void>;
  onClose: () => void;
}

export function RewardFormModal({ reward, onSubmit, onClose }: RewardFormModalProps) {
  const formId = useId();
  const isEditing = reward !== undefined;
  const { formRef, values, field, handleSubmit, submitting, submitError } = useZodForm({
    schema: rewardFormSchema,
    initialValues: getRewardFormValues(reward),
    submitFallbackError: "No pudimos guardar el premio. Intenta nuevamente.",
  });

  return (
    <Modal
      title={isEditing ? "Editar premio" : "Crear premio"}
      description={
        isEditing
          ? "Actualiza los datos del premio del catálogo."
          : "Agrega un premio que los visitantes podrán canjear con sus puntos."
      }
      dismissible={!submitting}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} variant="primary" loading={submitting}>
            {isEditing ? "Guardar cambios" : "Crear premio"}
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

        <TextField {...field("name")} label="Nombre" required placeholder="Ej. Mochila ExpoVia" autoComplete="off" />

        <TextAreaField
          {...field("description")}
          label="Descripción"
          rows={3}
          hint="Opcional. Cuenta qué recibe el visitante."
          counter={{ current: values.description.trim().length, max: REWARD_LIMITS.descriptionMax }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField {...field("type")} label="Tipo" required placeholder="Selecciona un tipo" options={REWARD_TYPE_OPTIONS} />
          <TextField
            {...field("costPoints")}
            label="Costo en puntos"
            required
            inputMode="numeric"
            placeholder="0"
            autoComplete="off"
          />
        </div>

        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <SelectField
              {...field("imageUrl")}
              label="Imagen"
              options={REWARD_IMAGE_OPTIONS}
              hint="Elige una imagen del catálogo o usa el ícono por defecto."
            />
          </div>
          <div className="pt-6">
            <RewardThumbnail imageUrl={values.imageUrl || undefined} name={values.name.trim() || "Premio"} size="md" decorative />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField {...field("status")} label="Estado" required options={REWARD_STATUS_OPTIONS} />
          {isEditing ? (
            <div>
              <p className="mb-1 text-sm font-black text-[var(--expo-navy)]">Stock</p>
              <p className="rounded-xl bg-[var(--expo-bg)] p-3 text-xs font-medium text-slate-700">
                Las existencias se gestionan con ajustes desde <strong>Inventario</strong>.
              </p>
            </div>
          ) : (
            <TextField
              {...field("initialStock")}
              label="Stock inicial"
              inputMode="numeric"
              placeholder="0"
              autoComplete="off"
              hint="Opcional. Si lo dejas vacío, empieza en 0 y puedes reponer desde Inventario."
            />
          )}
        </div>
      </form>
    </Modal>
  );
}
