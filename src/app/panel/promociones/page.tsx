import type { Metadata } from "next";

import { panelPromotions } from "@/data/panel-mock";
import { PanelPageHeader } from "@/components/panel";
import type { FlashPromotion } from "@/types/panel";

export const metadata: Metadata = { title: "Ofertas relámpago" };

const STATUS_STYLES: Record<FlashPromotion["status"], string> = {
  activa: "bg-[var(--expo-green)]/15 text-[var(--expo-green)] border-[var(--expo-green)]",
  programada: "bg-[var(--expo-sky)]/20 text-[var(--expo-blue)] border-[var(--expo-blue)]",
  finalizada: "bg-slate-100 text-slate-500 border-slate-300",
};

const STATUS_LABELS: Record<FlashPromotion["status"], string> = {
  activa: "Activa",
  programada: "Programada",
  finalizada: "Finalizada",
};

function formatRange(from: string, to: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(from)} – ${fmt(to)}`;
}

export default function PromocionesPage() {
  return (
    <>
      <PanelPageHeader
        eyebrow="Promociones"
        title="Ofertas relámpago"
        description="Publica descuentos por tiempo limitado dirigidos a visitantes cercanos a tu stand."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {panelPromotions.map((promo) => (
          <div key={promo.id} className="pixel-card flex flex-col gap-2 p-4">
            <span
              className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLES[promo.status]}`}
            >
              {STATUS_LABELS[promo.status]}
            </span>
            <p className="text-2xl font-black text-[var(--expo-navy)]">{promo.discountLabel}</p>
            <p className="text-sm font-bold text-slate-700">{promo.title}</p>
            <p className="text-xs font-mono text-slate-500">
              {formatRange(promo.activeFrom, promo.activeTo)}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
