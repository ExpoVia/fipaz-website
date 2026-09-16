import type { Metadata } from "next";
import { ScanLine } from "lucide-react";

import { panelCheckIns } from "@/data/panel-mock";
import { PanelPageHeader } from "@/components/panel";

export const metadata: Metadata = { title: "Visitas NFC" };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
}

export default function VisitasPage() {
  return (
    <>
      <PanelPageHeader
        eyebrow="Visitas NFC"
        title="Check-ins registrados"
        description="Cada visita se valida cuando el visitante acerca su teléfono a la placa NFC de tu stand."
      />

      <div className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden">
        {panelCheckIns.map((checkIn) => (
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
    </>
  );
}
