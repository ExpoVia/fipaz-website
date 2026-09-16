import type { Metadata } from "next";

import { categories, stands, zones } from "@/data/demo-data";
import { PanelPageHeader } from "@/components/panel";

export const metadata: Metadata = { title: "Mapa del evento" };

export default function MapaEventoPage() {
  return (
    <>
      <PanelPageHeader
        eyebrow="Organizador"
        title="Gestión del mapa"
        description="Zonas activas y densidad de expositores por pabellón."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {zones.map((zone) => {
          const zoneStands = stands.filter((s) => s.zoneId === zone.id);
          const zoneCategories = categories.filter((c) => zone.categoryIds.includes(c.id));

          return (
            <div key={zone.id} className="pixel-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[var(--expo-navy)]">{zone.name}</h2>
                <span className="font-mono text-xs font-black text-slate-500">
                  Zona {zone.shortCode}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {zoneStands.length} expositores instalados
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {zoneCategories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{
                      color: category.colorToken,
                      background: `color-mix(in srgb, ${category.colorToken} 15%, white)`,
                    }}
                  >
                    {category.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Maqueta — la edición visual del mapa vive en el módulo interactivo de la demo (`/demo/map`).
      </p>
    </>
  );
}
