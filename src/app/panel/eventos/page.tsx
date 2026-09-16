import type { Metadata } from "next";
import { Globe, MapPin } from "lucide-react";

import { PANEL_EVENTS } from "@/data/panel-mock";
import { PanelPageHeader } from "@/components/panel";
import type { PanelEventSummary } from "@/types/panel";

export const metadata: Metadata = { title: "Eventos" };

const STATUS_LABELS: Record<PanelEventSummary["status"], string> = {
  actual: "Edición actual",
  proximamente: "Próximamente",
  plantilla: "Plantilla lista",
};

const STATUS_STYLES: Record<PanelEventSummary["status"], string> = {
  actual: "bg-[var(--expo-yellow)] text-[var(--expo-navy)]",
  proximamente: "bg-sky-100 text-[var(--expo-blue)]",
  plantilla: "bg-purple-100 text-[var(--expo-purple)]",
};

export default function EventosPage() {
  return (
    <>
      <PanelPageHeader
        eyebrow="Visión multi-evento"
        title="Eventos del ecosistema ExpoVia"
        description="Un solo panel para administrar tu presencia en múltiples ferias."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PANEL_EVENTS.map((event) => (
          <div key={event.id} className="pixel-card flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLES[event.status]}`}
              >
                {STATUS_LABELS[event.status]}
              </span>
              {event.status === "actual" && (
                <Globe aria-hidden="true" className="h-4 w-4 text-[var(--expo-blue)]" />
              )}
            </div>
            <h3 className="text-lg font-black text-[var(--expo-navy)]">{event.name}</h3>
            <p className="flex items-center gap-1 font-mono text-xs font-bold text-slate-500">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-rose-500" />
              {event.city}
            </p>
            <p className="text-xs text-slate-600">{event.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
