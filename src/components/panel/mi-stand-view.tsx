"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Building2, Mail, Pencil, QrCode, ScanLine, Store } from "lucide-react";

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
      {stand && <>
        <PanelPageHeader eyebrow="Mi stand" title="Perfil de marca" description="Así se presenta tu stand dentro del evento. La información viene del servidor." demo={false} />
        <section className="panel-surface overflow-hidden" aria-label="Datos del stand">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
            <div className="flex min-h-48 flex-col justify-between rounded-2xl bg-[linear-gradient(145deg,#e0f0ff,#f3f7ff_58%,#dce8ff)] p-5">
              <Store aria-hidden="true" className="h-12 w-12 text-[#0878f9]" strokeWidth={1.5} />
              <span className="self-start rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#0878f9]">Stand {stand.boothCode}</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0878f9]">{stand.eventName}</p><h2 className="mt-1 text-2xl font-extrabold text-[#152345] sm:text-[1.8rem]">{stand.displayName}</h2></div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${stand.status === "active" ? "bg-[#e4f8ef] text-[#0d986e]" : "bg-[#fff2da] text-[#aa7400]"}`}>{stand.status === "active" ? "Activo" : stand.status}</span>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[#5f7499]">{stand.description || "Aún no hay una descripción. Puedes agregarla al editar el stand."}</p>
              {stand.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{stand.tags.map((tag) => <span key={tag} className="rounded-full bg-[#f0f5fc] px-3 py-1.5 text-xs font-semibold text-[#557099]">#{tag}</span>)}</div>}
              <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 border-t border-[#e9eff7] pt-4 text-xs font-semibold text-[#60779c]"><span>+{stand.visitPoints} puntos por visita</span>{company?.contactEmail && <span className="inline-flex items-center gap-1.5"><Mail aria-hidden="true" className="h-3.5 w-3.5" />{company.contactEmail}</span>}</div>
            </div>
          </div>
          {(stand.activityHighlight || stand.promotionHighlight) && <div className="grid gap-3 border-t border-[#edf1f8] bg-[#fbfdff] px-5 py-4 sm:grid-cols-2 sm:px-7">{stand.activityHighlight && <p className="text-sm text-[#62779b]"><strong className="text-[#1e3159]">Actividad:</strong> {stand.activityHighlight}</p>}{stand.promotionHighlight && <p className="text-sm text-[#62779b]"><strong className="text-[#1e3159]">Promoción:</strong> {stand.promotionHighlight}</p>}</div>}
          <div className="flex flex-wrap gap-2 border-t border-[#edf1f8] px-5 py-4 sm:px-7">
            {editable && <Link href="/panel/mi-stand/editar" className="inline-flex items-center gap-2 rounded-xl bg-[#0878f9] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0067d9]"><Pencil aria-hidden="true" className="h-4 w-4" />Editar perfil</Link>}
            <Link href="/panel/mi-stand/qr" className="inline-flex items-center gap-2 rounded-xl border border-[#d8e4f3] bg-white px-4 py-2.5 text-sm font-bold text-[#294671] hover:bg-[#f4f8fd]"><QrCode aria-hidden="true" className="h-4 w-4" />Gestionar QR</Link>
          </div>
        </section>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link href="/panel/visitas" className="panel-surface flex items-center gap-3 p-4 text-sm font-bold text-[#2b466f] hover:border-[#c8dfff]"><span className="rounded-xl bg-[#eaf3ff] p-2.5 text-[#0878f9]"><ScanLine aria-hidden="true" className="h-5 w-5" /></span>Visitas verificadas<ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 text-[#7990b4]" /></Link>
          <Link href="/panel/metricas-stand" className="panel-surface flex items-center gap-3 p-4 text-sm font-bold text-[#2b466f] hover:border-[#c8dfff]"><span className="rounded-xl bg-[#f0edff] p-2.5 text-[#6851ea]"><BarChart3 aria-hidden="true" className="h-5 w-5" /></span>Ver métricas<ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 text-[#7990b4]" /></Link>
          <Link href="/panel/empresa" className="panel-surface flex items-center gap-3 p-4 text-sm font-bold text-[#2b466f] hover:border-[#c8dfff]"><span className="rounded-xl bg-[#e4f8ef] p-2.5 text-[#11a778]"><Building2 aria-hidden="true" className="h-5 w-5" /></span>Perfil de empresa<ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 text-[#7990b4]" /></Link>
        </div>
      </>}
    </ExhibitorState>
  );
}
