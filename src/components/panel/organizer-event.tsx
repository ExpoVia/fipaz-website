"use client";

import type { ReactNode } from "react";

import type { AsyncResource } from "@/hooks/use-async-resource";
import { getActiveRole } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";

export interface OrganizerEvent {
  eventId: string | null;
  eventName: string;
}

/**
 * Evento que administra el rol activo. `event_admin` trae su evento en el rol; `super_admin` no
 * está acotado a ninguno, así que usa el evento configurado del despliegue.
 */
export function useOrganizerEvent(): OrganizerEvent {
  const role = useCompanyAuthStore((state) => getActiveRole(state.session));
  const eventId = role?.eventId ?? (role?.role === "super_admin" ? process.env.NEXT_PUBLIC_FIPAZ_EVENT_ID ?? null : null);
  return { eventId, eventName: role?.eventName ?? "el evento" };
}

export function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** Carga, error con reintento o contenido de un recurso del backend. */
export function RemoteState<T>({ resource, label, children }: {
  resource: AsyncResource<T>;
  label: string;
  children: (data: T) => ReactNode;
}) {
  if (resource.status === "loading") return <p role="status" className="text-sm font-bold text-slate-500">Cargando {label}…</p>;
  if (resource.status === "error") return (
    <div role="alert" className="rounded-xl border-2 border-rose-400 bg-rose-50 p-5 text-sm text-rose-900">
      <p>{errorMessage(resource.error, `No se pudieron cargar ${label}.`)}</p>
      <button type="button" onClick={resource.reload} className="mt-3 font-bold underline">Reintentar</button>
    </div>
  );
  return <>{children(resource.data)}</>;
}

/** Aviso cuando la cuenta no tiene un evento asignado (p. ej. super_admin sin evento configurado). */
export function NoEventNotice() {
  return (
    <p role="alert" className="pixel-card p-5 text-sm text-slate-600">
      Tu cuenta no tiene un evento asignado. Pide a un administrador que te dé el rol de organizador de un evento.
    </p>
  );
}

const COLOR_TOKENS: Record<string, string> = {
  red: "#e5484d",
  yellow: "var(--expo-yellow)",
  blue: "var(--expo-blue)",
  green: "var(--expo-green)",
  purple: "var(--expo-purple)",
  pink: "var(--expo-pink)",
  sky: "var(--expo-sky)",
  mint: "var(--expo-mint)",
  coral: "var(--expo-coral)",
};

/** Color CSS de un `colorToken` del backend ("red", "#3366ff"…); gris si no hay. */
export function tokenColor(token: string | null | undefined): string {
  if (!token) return "#94a3b8";
  return COLOR_TOKENS[token] ?? (/^#[0-9a-f]{3,8}$/i.test(token) ? token : "#94a3b8");
}
