"use client";

import Link from "next/link";

import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { PanelPageHeader } from "./panel-page-header";

export function PromocionesView() {
  const { stand } = useExhibitor();
  return (
    <ExhibitorState>
      <PanelPageHeader eyebrow="Promociones" title="Promoción visible del stand" description="Texto promocional guardado en tu stand y publicado con su perfil." demo={false} />
      <div className="pixel-card max-w-2xl p-5">
        <p className="text-sm text-slate-700">{stand?.promotionHighlight || "Este stand no tiene una promoción publicada."}</p>
        <Link href="/panel/mi-stand/editar" className="mt-4 inline-block text-sm font-bold text-[var(--expo-blue)] underline">Editar promoción visible</Link>
      </div>
      <p className="mt-4 text-xs text-slate-500">Las ofertas con horarios, descuentos y segmentación aún no tienen un servicio propio; aquí solo se muestra el texto real del stand.</p>
    </ExhibitorState>
  );
}
