"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { EllipsisVertical } from "lucide-react";
import { clsx } from "clsx";

export interface RowActionItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Acción local (abre un modal, ejecuta una mutación…). */
  onSelect?: () => void;
  /** Navegación a otra pantalla. */
  href?: string;
}

interface RowActionsProps {
  /** Nombre accesible del botón, p. ej. "Acciones de Trivia Andina". */
  label: string;
  items: ReadonlyArray<RowActionItem | false | null | undefined>;
}

const MENU_WIDTH = 224;
const ITEM_HEIGHT = 40;
const VIEWPORT_MARGIN = 8;

interface MenuPosition {
  top: number;
  left: number;
}

function getMenuPosition(trigger: HTMLElement, itemCount: number): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  const height = itemCount * ITEM_HEIGHT + 16;
  const left = Math.min(
    Math.max(rect.right - MENU_WIDTH, VIEWPORT_MARGIN),
    window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
  );
  const opensUpwards = rect.bottom + height + VIEWPORT_MARGIN > window.innerHeight;
  const top = opensUpwards ? Math.max(rect.top - height - 4, VIEWPORT_MARGIN) : rect.bottom + 4;
  return { top, left };
}

/**
 * Menú de acciones de una fila. Se dibuja en un portal con posición fija para no quedar
 * recortado por el scroll horizontal de la tabla. Teclado: flechas, Inicio/Fin, Escape
 * (devuelve el foco al botón) y Tab (cierra).
 */
export function RowActions({ label, items }: RowActionsProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const actions = items.filter((item): item is RowActionItem => Boolean(item));
  const open = position !== null;

  function close(restoreFocus: boolean) {
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;

    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();

    const closeIfOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setPosition(null);
      }
    };
    const dismiss = () => setPosition(null);

    document.addEventListener("pointerdown", closeIfOutside);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [open]);

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabledItems = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'),
    );
    const currentIndex = enabledItems.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        enabledItems[(currentIndex + 1) % enabledItems.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        enabledItems[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        enabledItems[enabledItems.length - 1]?.focus();
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
    }
  }

  if (actions.length === 0) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) close(false);
          else if (triggerRef.current) setPosition(getMenuPosition(triggerRef.current, actions.length));
        }}
        className="grid h-9 w-9 place-items-center rounded-lg border-2 border-transparent text-[var(--expo-navy)] hover:border-[var(--expo-line)] hover:bg-white aria-expanded:border-[var(--expo-navy)] aria-expanded:bg-white"
      >
        <EllipsisVertical aria-hidden="true" className="h-5 w-5" />
      </button>

      {position &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={handleMenuKeyDown}
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
            className="fixed z-50 rounded-xl border-2 border-[var(--expo-navy)] bg-white p-1 shadow-[4px_4px_0_rgb(47_45_76/25%)]"
          >
            {actions.map((action) => {
              const Icon = action.icon;
              const className = clsx(
                "flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-bold aria-disabled:cursor-not-allowed aria-disabled:opacity-45",
                action.tone === "danger"
                  ? "text-rose-700 hover:bg-rose-50 focus:bg-rose-50"
                  : "text-[var(--expo-navy)] hover:bg-[var(--expo-bg)] focus:bg-[var(--expo-bg)]",
              );
              const content = (
                <>
                  {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{action.label}</span>
                </>
              );

              if (action.href && !action.disabled) {
                return (
                  <Link
                    key={action.id}
                    role="menuitem"
                    href={action.href}
                    onClick={() => setPosition(null)}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={action.id}
                  type="button"
                  role="menuitem"
                  aria-disabled={action.disabled || undefined}
                  onClick={() => {
                    if (action.disabled) return;
                    // El foco vuelve al botón antes de ejecutar la acción: si abre un modal,
                    // este lo recordará como el elemento al que devolver el foco al cerrarse.
                    close(true);
                    action.onSelect?.();
                  }}
                  className={className}
                >
                  {content}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
