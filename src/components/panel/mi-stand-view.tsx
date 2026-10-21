"use client";

import Link from "next/link";
import { Pencil, QrCode } from "lucide-react";

import { canEditCompany } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { PanelPageHeader } from "./panel-page-header";

export function MiStandView() {
  const { company, stand } = useExhibitor();
  const editable = useCompanyAuthStore((state) => canEditCompany(state.session));

  return (
    <ExhibitorState>
      {stand && (
        <>
          <PanelPageHeader eyebrow="Mi stand" title="Perfil de marca" description="Información guardada en el evento y visible para los visitantes cuando el stand está publicado." demo={false} />
          <div className="pixel-card flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[var(--expo-navy)]">{stand.displayName}</h2>
                <p className="font-mono text-xs text-slate-500">Stand {stand.boothCode} · {stand.eventName}</p>
                <p className="mt-1 text-xs text-slate-500">Estado: {stand.status}</p>
              </div>
              <p className="text-sm font-bold text-[var(--expo-blue)]">+{stand.visitPoints} puntos por visita</p>
            </div>
            <p className="text-sm text-slate-700">{stand.description || "Sin descripción todavía."}</p>
            {stand.tags.length > 0 && <div className="flex flex-wrap gap-2">{stand.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--expo-bg)] px-2.5 py-1 text-xs font-bold">#{tag}</span>)}</div>}
            {stand.activityHighlight && <p className="text-sm"><strong>Actividad:</strong> {stand.activityHighlight}</p>}
            {stand.promotionHighlight && <p className="text-sm"><strong>Promoción visible:</strong> {stand.promotionHighlight}</p>}
            {company?.contactEmail && <p className="text-sm"><strong>Contacto:</strong> {company.contactEmail}</p>}
            <div className="mt-2 flex flex-wrap gap-3">
              {editable && <Link href="/panel/mi-stand/editar" className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-4 py-2 text-sm font-black text-white"><Pencil className="h-4 w-4" />Editar perfil</Link>}
              <Link href="/panel/mi-stand/qr" className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-white px-4 py-2 text-sm font-black"><QrCode className="h-4 w-4" />Gestionar QR</Link>
            </div>
          </div>
        </>
      )}
    </ExhibitorState>
  );
}
