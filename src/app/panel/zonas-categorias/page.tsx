import type { Metadata } from "next";

import { categories, zones } from "@/data/demo-data";
import { PanelPageHeader } from "@/components/panel";

export const metadata: Metadata = { title: "Zonas y categorías" };

export default function ZonasCategoriasPage() {
  return (
    <>
      <PanelPageHeader
        eyebrow="Organizador"
        title="Zonas y categorías"
        description="Administración de pabellones y rubros del evento."
      />

      <div className="pixel-card mb-6 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--expo-line)] text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-bold">Zona</th>
              <th className="px-4 py-3 font-bold">Código</th>
              <th className="px-4 py-3 font-bold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--expo-line)]">
            {zones.map((zone) => (
              <tr key={zone.id}>
                <td className="px-4 py-3 font-bold text-[var(--expo-navy)]">{zone.name}</td>
                <td className="px-4 py-3 font-mono text-slate-500">{zone.shortCode}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled
                    className="rounded-lg border-2 border-[var(--expo-line)] px-3 py-1 text-xs font-bold text-slate-400"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="pixel-card flex items-center justify-between p-4">
            <span className="font-bold text-[var(--expo-navy)]">{category.label}</span>
            <span
              className="h-4 w-4 rounded-full border-2 border-white shadow"
              style={{ background: category.colorToken }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </>
  );
}
