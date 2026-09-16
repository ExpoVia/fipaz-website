import type { Metadata } from "next";

import { panelLeads } from "@/data/panel-mock";
import { PanelPageHeader } from "@/components/panel";

export const metadata: Metadata = { title: "Prospectos" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-BO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProspectosPage() {
  return (
    <>
      <PanelPageHeader
        eyebrow="Prospectos"
        title="Contactos capturados"
        description="Personas que dejaron sus datos en tu stand durante el evento."
      />

      <div className="pixel-card overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--expo-line)] text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-bold">Nombre</th>
              <th className="px-4 py-3 font-bold">Contacto</th>
              <th className="px-4 py-3 font-bold">Interés</th>
              <th className="px-4 py-3 font-bold">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--expo-line)]">
            {panelLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-3 font-bold text-[var(--expo-navy)]">{lead.name}</td>
                <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[var(--expo-bg)] px-2.5 py-1 text-xs font-bold text-[var(--expo-navy)]">
                    {lead.interestTag}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {formatDate(lead.capturedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
