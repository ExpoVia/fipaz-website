"use client";

import { Activity, ScanLine, Star, Store, Trophy, UsersRound, Zap } from "lucide-react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { organizerApi } from "@/lib/api/organizer";
import { ProgressBar } from "@/components/pixel/ProgressBar";
import { MetricCard } from "./metric-card";
import { NoEventNotice, RemoteState, tokenColor, useOrganizerEvent } from "./organizer-event";
import { PanelPageHeader } from "./panel-page-header";

const LEADERBOARD_SIZE = 10;

export function MetricasEventoView() {
  const { eventId, eventName } = useOrganizerEvent();
  const metrics = useAsyncResource(`event-metrics:${eventId}`, async () => {
    if (!eventId) throw new Error("Sin evento");
    const [kpis, map, leaderboard] = await Promise.all([
      organizerApi.getKpis(eventId),
      organizerApi.getPublishedMap(eventId),
      organizerApi.getLeaderboard(eventId),
    ]);
    const zones = map.floors.flatMap((floor) => floor.zones.map((zone) => ({
      ...zone,
      floorName: floor.name,
      stands: floor.stands.filter((stand) => stand.zoneId === zone.id).length,
    })));
    return { kpis, zones, leaderboard: leaderboard.slice(0, LEADERBOARD_SIZE) };
  });

  return (
    <>
      <PanelPageHeader eyebrow="Métricas" title="Métricas del evento" description={`Cifras agregadas de ${eventName}, sin datos personales de los visitantes.`} demo={false} />
      {!eventId ? <NoEventNotice /> : (
        <RemoteState resource={metrics} label="las métricas del evento">
          {({ kpis, zones, leaderboard }) => {
            const maxStands = Math.max(1, ...zones.map((zone) => zone.stands));
            return (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Participantes" value={String(kpis.totalParticipants)} icon={UsersRound} demo={false} />
                  <MetricCard label="Check-ins" value={String(kpis.totalCheckins)} icon={ScanLine} demo={false} />
                  <MetricCard label="Visitas únicas" value={String(kpis.uniqueVisits)} icon={Activity} demo={false} hint="Visitante y stand distintos" />
                  <MetricCard label="Puntos emitidos" value={String(kpis.pointsIssued)} icon={Star} demo={false} />
                  <MetricCard label="Stands activos" value={String(kpis.activeStands)} icon={Store} demo={false} />
                  <MetricCard label="Asistentes a actividades" value={String(kpis.activityAttendees)} icon={UsersRound} demo={false} />
                  <MetricCard label="Canjes validados" value={String(kpis.redemptionsValidated)} icon={Zap} demo={false} />
                </div>

                <section className="pixel-card mt-6 flex flex-col gap-4 p-5" aria-labelledby="zones-heading">
                  <h2 id="zones-heading" className="pixel-label text-slate-500">Stands ubicados por zona (mapa publicado)</h2>
                  {zones.length === 0 ? <p className="text-sm text-slate-500">El mapa publicado todavía no tiene zonas.</p> : zones.map((zone) => (
                    <div key={zone.id}>
                      <div className="mb-1 flex items-center justify-between text-sm font-bold text-[var(--expo-navy)]">
                        <span className="flex items-center gap-2">
                          <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: tokenColor(zone.colorToken) }} />
                          {zone.name} <span className="font-normal text-slate-500">· {zone.floorName}</span>
                        </span>
                        <span className="font-mono text-xs text-slate-500">{zone.stands} {zone.stands === 1 ? "stand" : "stands"}</span>
                      </div>
                      <ProgressBar value={zone.stands} max={maxStands} showLabel={false} colorClass="bg-[var(--expo-purple)]" />
                    </div>
                  ))}
                </section>

                <section className="pixel-card mt-6 p-5" aria-labelledby="leaderboard-heading">
                  <h2 id="leaderboard-heading" className="flex items-center gap-2 text-lg font-black text-[var(--expo-navy)]"><Trophy aria-hidden="true" className="h-5 w-5 text-[var(--expo-yellow)]" />Ranking de visitantes</h2>
                  {leaderboard.length === 0 ? <p className="mt-3 text-sm text-slate-500">Todavía nadie suma puntos en el evento.</p> : (
                    <ol className="mt-3 divide-y divide-[var(--expo-line)]">
                      {leaderboard.map((entry) => (
                        <li key={entry.userId} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span className="font-bold text-[var(--expo-navy)]"><span className="mr-2 font-mono text-slate-500">#{entry.position}</span>{entry.displayName ?? "Visitante"}</span>
                          <span className="font-mono text-xs text-slate-500">{entry.rankingScore} pts · nivel {entry.level}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
                <p className="mt-4 text-xs text-slate-500">La afluencia por hora y la permanencia en cada zona todavía no se miden en el backend.</p>
              </>
            );
          }}
        </RemoteState>
      )}
    </>
  );
}
