"use client";

import { PanelPageHeader } from "./panel-page-header";

export function ProspectosView() {
  return (
    <>
      <PanelPageHeader eyebrow="Prospectos" title="Captura de contactos" description="Esta función aún no está habilitada para el evento." demo={false} />
      <p className="pixel-card max-w-2xl p-5 text-sm text-slate-600">El backend todavía no registra prospectos ni consentimiento para compartir datos de visitantes con expositores. No hay contactos reales que mostrar.</p>
    </>
  );
}
