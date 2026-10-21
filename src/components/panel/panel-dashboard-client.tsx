"use client";

import Link from "next/link";
import { Activity, Building2, ScanLine, Star, Store, UsersRound, Zap } from "lucide-react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { organizerApi } from "@/lib/api/organizer";
import { getActivePanel } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { MetricCard } from "./metric-card";
import { PanelPageHeader } from "./panel-page-header";
import { useExhibitor } from "./exhibitor-context";
import { ExhibitorState } from "./exhibitor-state";
import { NoEventNotice, RemoteState, useOrganizerEvent } from "./organizer-event";

function ExpositorOverview() {
  const { company, stand, kpis, kpisError } = useExhibitor();

  return (
    <ExhibitorState requireStand={false}>
      <PanelPageHeader
        eyebrow="Resumen"
        title={`Hola, ${company?.displayName ?? "expositor"}`}
        description="Datos registrados para tu empresa en el evento."
        demo={false}
      />
      {kpis ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Check-ins" value={String(kpis.totalCheckins)} icon={ScanLine} demo={false} />
          <MetricCard label="Visitantes únicos" value={String(kpis.uniqueVisitors)} icon={UsersRound} demo={false} />
          <MetricCard label="Primeras visitas" value={String(kpis.firstVisits)} icon={Store} demo={false} />
          <MetricCard label="Asistentes a actividades" value={String(kpis.activityAttendees)} icon={Activity} demo={false} />
          <MetricCard label="Canjes validados" value={String(kpis.redemptionsValidated)} icon={Zap} demo={false} />
        </div>
      ) : <p role="status" className="text-sm text-slate-600">{kpisError ?? "Las métricas aparecerán cuando tu empresa tenga un stand asignado."}</p>}
      {stand && (
        <div className="pixel-card mt-6 flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--expo-navy)]">{stand.displayName}</h2>
            <span className="font-mono text-xs text-slate-500">{stand.boothCode}</span>
          </div>
          <p className="text-sm text-slate-600">{stand.description}</p>
          <Link href="/panel/mi-stand" className="mt-2 text-sm font-bold text-[var(--expo-blue)] hover:underline">
            Ver perfil completo del stand →
          </Link>
        </div>
      )}
      {!stand && <p className="pixel-card mt-6 p-5 text-sm text-slate-600">Tu empresa todavía no tiene un stand asignado en el evento.</p>}
    </ExhibitorState>
  );
}

function OrganizadorOverview() {
  const { eventId, eventName } = useOrganizerEvent();
  const overview = useAsyncResource(`overview:${eventId}`, async () => {
    if (!eventId) throw new Error("Sin evento");
    const [kpis, companies] = await Promise.all([organizerApi.getKpis(eventId), organizerApi.getCompanies(eventId)]);
    return { kpis, companies };
  });

  return (
    <>
      <PanelPageHeader eyebrow="Resumen" title="Panorama del evento" description={`Datos medidos por el servidor para ${eventName}.`} demo={false} />
      {!eventId ? <NoEventNotice /> : (
        <RemoteState resource={overview} label="el resumen del evento">
          {({ kpis, companies }) => (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Participantes" value={String(kpis.totalParticipants)} icon={UsersRound} demo={false} />
                <MetricCard label="Check-ins" value={String(kpis.totalCheckins)} icon={ScanLine} demo={false} />
                <MetricCard label="Stands activos" value={String(kpis.activeStands)} icon={Store} demo={false} />
                <MetricCard label="Puntos emitidos" value={String(kpis.pointsIssued)} icon={Star} demo={false} />
              </div>
              <div className="pixel-card mt-6 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black text-[var(--expo-navy)]">Empresas participantes</h2>
                  <span className="font-mono text-xs font-bold text-slate-500">{companies.length} en total</span>
                </div>
                {companies.length === 0 ? <p className="mt-3 text-sm text-slate-500">Aún no hay empresas inscritas en el evento.</p> : (
                  <ul className="mt-3 flex flex-col divide-y divide-[var(--expo-line)]">
                    {companies.slice(0, 8).map((company) => (
                      <li key={company.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="flex items-center gap-2 font-bold text-[var(--expo-navy)]"><Building2 aria-hidden="true" className="h-4 w-4 text-[var(--expo-blue)]" />{company.displayName}</span>
                        <span className="text-xs text-slate-500">{company.standCount} {company.standCount === 1 ? "stand" : "stands"} · {company.status === "active" ? "activa" : company.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/panel/expositores" className="mt-3 inline-block text-sm font-bold text-[var(--expo-blue)] hover:underline">Ver el directorio de stands →</Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MetricCard label="Visitas únicas a stands" value={String(kpis.uniqueVisits)} icon={Activity} demo={false} />
                <MetricCard label="Asistentes a actividades" value={String(kpis.activityAttendees)} icon={UsersRound} demo={false} />
                <MetricCard label="Canjes validados" value={String(kpis.redemptionsValidated)} icon={Zap} demo={false} />
              </div>
            </>
          )}
        </RemoteState>
      )}
    </>
  );
}

export function PanelDashboardClient() {
  const authHydrated = useCompanyAuthStore((state) => state.hasHydrated);
  const activePanel = useCompanyAuthStore((state) => getActivePanel(state.session));
  if (!authHydrated || !activePanel) return null;
  return activePanel === "expositor" ? <ExpositorOverview /> : <OrganizadorOverview />;
}
