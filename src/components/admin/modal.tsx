"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
} as const;

interface ModalProps {
  title: string;
  description?: string;
  size?: keyof typeof SIZES;
  /** Cierra con Escape, el botón X y clic en el fondo. Se desactiva mientras se envía un formulario. */
  dismissible?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

// Cuántos modales abiertos bloquean el scroll del body (por si un modal abre otro).
let scrollLocks = 0;

/**
 * Diálogo modal sobre `<dialog>` nativo: el navegador aporta la trampa de foco, el
 * aislamiento del resto de la página y la tecla Escape. Se monta solo mientras está abierto,
 * así que su estado interno (formularios) se reinicia en cada apertura. Al desmontar
 * devuelve el foco al elemento que lo abrió.
 *
 * Marca con `data-autofocus` el elemento que debe recibir el foco inicial; si no hay, se usa
 * el primer campo de formulario y, en su defecto, el comportamiento por defecto del navegador.
 */
export function Modal({
  title,
  description,
  size = "md",
  dismissible = true,
  onClose,
  children,
  footer,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressStartedOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog.showModal();
    (
      dialog.querySelector<HTMLElement>("[data-autofocus]") ??
      dialog.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea")
    )?.focus();

    scrollLocks += 1;
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onPointerDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        // Solo cierra si el gesto empezó y terminó en el fondo: arrastrar para seleccionar
        // texto y soltar fuera no debe descartar el formulario.
        if (dismissible && pressStartedOnBackdrop.current && event.target === event.currentTarget) {
          onClose();
        }
      }}
      className={clsx(
        "m-auto w-[calc(100%-1.5rem)] rounded-2xl border-2 border-[var(--expo-navy)] bg-white p-0 text-[var(--expo-navy)] shadow-[6px_6px_0_rgb(47_45_76/25%)] backdrop:bg-[rgb(47_45_76/55%)] open:flex",
        SIZES[size],
      )}
    >
      <div className="flex max-h-[90dvh] min-h-0 w-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b-2 border-[var(--expo-line)] px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-black leading-snug">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm font-medium text-slate-600">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            aria-label="Cerrar"
            className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-transparent text-slate-600 hover:border-[var(--expo-line)] hover:bg-[var(--expo-bg)] disabled:opacity-40"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t-2 border-[var(--expo-line)] bg-[var(--expo-bg)] px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
