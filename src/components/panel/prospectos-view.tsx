"use client";

import { panelLeads } from "@/data/panel-mock";
import { usePanelStore } from "@/store/panel-store";
import { PanelPageHeader } from "./panel-page-header";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-BO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProspectosView() {
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  const activeCompanyId = usePanelStore((state) => state.activeCompanyId);
  if (!hasHydrated) return null;

  const leads = panelLeads.filter((lead) => lead.standId === activeCompanyId);

  return (
    <>
      <PanelPageHeader
        eyebrow="Prospectos"
        title="Contactos capturados"
        description="Personas que dejaron sus datos en tu stand durante el evento."
      />

      {leads.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no has capturado prospectos.</p>
      ) : (
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
              {leads.map((lead) => (
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
      )}
    </>
  );
}
