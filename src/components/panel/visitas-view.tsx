"use client";

import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";

import { exhibitorApi, type StandCheckin } from "@/lib/api/exhibitor";
import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { PanelPageHeader } from "./panel-page-header";

export function VisitasView() {
  const { stand } = useExhibitor();
  return <ExhibitorState>{stand && <VisitsForStand key={stand.id} standId={stand.id} />}</ExhibitorState>;
}

function VisitsForStand({ standId }: { standId: string }) {
  const [visits, setVisits] = useState<StandCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void exhibitorApi.getCheckins(standId).then((rows) => {
      if (!cancelled) setVisits(rows);
    }).catch((cause: unknown) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : "No se pudieron cargar las visitas.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [standId]);

  return (
    <>
      <PanelPageHeader eyebrow="Visitas verificadas" title="Check-ins registrados" description="Últimos 200 registros confirmados por el servidor para este stand." demo={false} />
      {loading ? <p role="status">Cargando visitas…</p> : error ? <p role="alert" className="rounded-lg bg-rose-50 p-4 text-rose-700">{error}</p> : visits.length === 0 ? (
        <p className="pixel-card p-5 text-sm text-slate-600">Aún no hay visitas registradas en este stand.</p>
      ) : (
        <div className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden">
          {visits.map((visit) => (
            <div key={visit.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <ScanLine aria-hidden="true" className="h-4 w-4 text-[var(--expo-green)]" />
                <span className="text-sm font-bold text-[var(--expo-navy)]">Visitante ···{visit.userId.slice(-6)}</span>
                <span className="text-xs uppercase text-slate-500">{visit.method}</span>
              </div>
              <time dateTime={visit.acceptedAt} className="font-mono text-xs text-slate-500">{new Date(visit.acceptedAt).toLocaleString("es-BO")}</time>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
