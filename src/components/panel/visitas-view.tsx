"use client";

import { ScanLine } from "lucide-react";

import { panelCheckIns } from "@/data/panel-mock";
import { usePanelStore } from "@/store/panel-store";
import { PanelPageHeader } from "./panel-page-header";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
}

export function VisitasView() {
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  const activeCompanyId = usePanelStore((state) => state.activeCompanyId);
  if (!hasHydrated) return null;

  const checkIns = panelCheckIns.filter((checkIn) => checkIn.standId === activeCompanyId);

  return (
    <>
      <PanelPageHeader
        eyebrow="Visitas NFC"
        title="Check-ins registrados"
        description="Cada visita se valida cuando el visitante acerca su teléfono a la placa NFC de tu stand."
      />

      {checkIns.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no tienes visitas registradas.</p>
      ) : (
        <div className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden">
          {checkIns.map((checkIn) => (
            <div key={checkIn.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--expo-mint)]/40">
                  <ScanLine aria-hidden="true" className="h-4 w-4 text-[var(--expo-green)]" />
                </span>
                <span className="text-sm font-bold text-[var(--expo-navy)]">{checkIn.visitorLabel}</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">
                {formatTime(checkIn.checkedInAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
