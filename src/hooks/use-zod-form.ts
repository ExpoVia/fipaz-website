"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { z } from "zod";

import { getErrorMessage } from "@/lib/api/service-error";

type FormValues = Record<string, string>;
type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

export interface FieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (event: FieldChangeEvent) => void;
  onBlur: () => void;
  error: string | undefined;
}

interface UseZodFormOptions<TValues extends FormValues, TOutput> {
  schema: z.ZodType<TOutput>;
  initialValues: TValues;
  /** Mensaje cuando el envío falla por un motivo que no es un `ServiceError`. */
  submitFallbackError: string;
}

function collectErrors(schema: z.ZodType, values: FormValues): Record<string, string> {
  const result = schema.safeParse(values);
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
}

/**
 * Estado de formulario validado con un esquema Zod. Los errores se derivan de los valores
 * actuales y solo se muestran en campos tocados o después de un intento de envío, así el
 * usuario no ve errores antes de escribir. Al fallar el envío, el foco pasa al primer
 * campo inválido.
 */
export function useZodForm<TValues extends FormValues, TOutput>({
  schema,
  initialValues,
  submitFallbackError,
}: UseZodFormOptions<TValues, TOutput>) {
  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<TValues>(initialValues);
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = useMemo(() => collectErrors(schema, values), [schema, values]);

  const field = useCallback(
    (name: keyof TValues & string): FieldProps => ({
      id: `${idPrefix}-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        const { value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
      },
      onBlur: () => setTouched((current) => new Set(current).add(name)),
      error: submitted || touched.has(name) ? errors[name] : undefined,
    }),
    [idPrefix, values, touched, submitted, errors],
  );

  const handleSubmit = useCallback(
    (onValid: (output: TOutput) => Promise<void>) => async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;

      setSubmitted(true);
      setSubmitError(null);

      const result = schema.safeParse(values);
      if (!result.success) {
        requestAnimationFrame(() => {
          formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        });
        return;
      }

      setSubmitting(true);
      try {
        await onValid(result.data);
      } catch (error) {
        setSubmitError(getErrorMessage(error, submitFallbackError));
      } finally {
        setSubmitting(false);
      }
    },
    [schema, values, submitting, submitFallbackError],
  );

  return { formRef, values, field, handleSubmit, submitting, submitError };
}
