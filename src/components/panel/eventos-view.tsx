"use client";

import { CalendarCheck, Globe } from "lucide-react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { organizerApi } from "@/lib/api/organizer";
import { getRolesForPanel } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { PanelPageHeader } from "./panel-page-header";

function EventKpisLine({ eventId }: { eventId: string }) {
  const kpis = useAsyncResource(`event-card:${eventId}`, () => organizerApi.getKpis(eventId));
  if (kpis.status === "loading") return <p className="text-xs text-slate-400">Cargando cifras…</p>;
  if (kpis.status === "error") return <p className="text-xs text-rose-600">No se pudieron cargar las cifras.</p>;
  return <p className="text-xs font-bold text-slate-500">{kpis.data.totalParticipants} participantes · {kpis.data.totalCheckins} check-ins · {kpis.data.activeStands} stands activos</p>;
}

export function EventosView() {
  const session = useCompanyAuthStore((state) => state.session);
  const setActiveRole = useCompanyAuthStore((state) => state.setActiveRole);
  const roles = getRolesForPanel(session, "organizador");
  const superAdmin = roles.some((role) => role.role === "super_admin");
  const eventRoles = roles.filter((role) => role.eventId);

  return (
    <>
      <PanelPageHeader eyebrow="Visión multi-evento" title="Mis eventos" description="Eventos que administra tu cuenta. Elige uno para trabajar sobre él en todo el panel." demo={false} />
      {eventRoles.length === 0 ? (
        <p className="pixel-card p-5 text-sm text-slate-600">
          {superAdmin ? "Tu cuenta de superadministrador no está asignada a un evento concreto; el panel usa el evento configurado del sitio." : "Tu cuenta no administra ningún evento todavía."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventRoles.map((role) => {
            const active = role.id === session?.activeRoleId;
            return (
              <div key={role.id} className={`pixel-card flex flex-col gap-2 p-4 ${active ? "ring-2 ring-[var(--expo-yellow)]" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${active ? "bg-[var(--expo-yellow)] text-[var(--expo-navy)]" : "bg-sky-100 text-[var(--expo-blue)]"}`}>
                    {active ? "Evento activo" : "Disponible"}
                  </span>
                  {active ? <CalendarCheck aria-hidden="true" className="h-4 w-4 text-[var(--expo-blue)]" /> : <Globe aria-hidden="true" className="h-4 w-4 text-slate-400" />}
                </div>
                <h3 className="text-lg font-black text-[var(--expo-navy)]">{role.eventName ?? "Evento sin nombre"}</h3>
                <EventKpisLine eventId={role.eventId as string} />
                {!active && (
                  <button type="button" onClick={() => setActiveRole(role.id)} className="mt-1 self-start text-sm font-bold text-[var(--expo-blue)] underline">Trabajar en este evento</button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500">El backend todavía no expone un catálogo de todos los eventos; aquí aparecen solo los que tu cuenta administra.</p>
    </>
  );
}
