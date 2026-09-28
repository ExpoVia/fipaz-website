"use client";

import Link from "next/link";
import { Building2, Pencil, QrCode } from "lucide-react";

import { zones } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { PointsPill } from "@/components/pixel/PointsPill";
import { PanelPageHeader } from "./panel-page-header";

export function MiStandView() {
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  const activeCompanyId = usePanelStore((state) => state.activeCompanyId);
  const companies = usePanelStore((state) => state.companies);

  if (!hasHydrated) return null;

  const stand = companies.find((company) => company.id === activeCompanyId);
  if (!stand) {
    return (
      <p className="text-sm text-slate-500">
        No encontramos tu empresa. <Link href="/registro-empresa" className="font-bold text-[var(--expo-blue)] hover:underline">Regístrala aquí</Link>.
      </p>
    );
  }

  const zone = zones.find((z) => z.id === stand.zoneId);
  const isIncomplete = stand.tags.length === 0 && !stand.activity && !stand.promotion;

  return (
    <>
      <PanelPageHeader
        eyebrow="Mi stand"
        title="Perfil de marca"
        description="Así ven tu empresa los visitantes dentro de la app de ExpoVia."
      />

      {isIncomplete && (
        <div className="mb-4 rounded-xl border-2 border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/15 p-3 text-sm font-bold text-[var(--expo-navy)]">
          Tu perfil está incompleto. Agrega etiquetas, actividad o una promoción para destacar tu stand.
        </div>
      )}

      <div className="pixel-card flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-[var(--expo-line)] bg-[var(--expo-bg)]">
              {stand.logoPath.startsWith("/") || stand.logoPath.startsWith("data:image/") || stand.logoPath.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stand.logoPath} alt={`Logo de ${stand.name}`} className="h-full w-full object-contain p-1" />
              ) : (
                <Building2 aria-hidden="true" size={26} className="text-slate-300" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-[var(--expo-navy)]">{stand.name}</h2>
              <p className="mt-1 font-mono text-xs font-bold text-slate-500">
                Stand {stand.boothCode} · {zone?.name ?? stand.zoneId}
              </p>
              {stand.contactEmail && (
                <p className="mt-0.5 font-mono text-xs text-slate-400">{stand.contactEmail}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StandCategoryBadge category={stand.category} customCategory={stand.customCategory} />
            <PointsPill points={stand.points} size="sm" />
          </div>
        </div>

        <p className="text-sm text-slate-700">{stand.description}</p>

        {stand.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stand.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--expo-line)] bg-[var(--expo-bg)] px-2.5 py-1 text-xs font-bold text-[var(--expo-navy)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {stand.activity && (
          <div className="rounded-xl border-2 border-[var(--expo-line)] p-3">
            <p className="pixel-label text-slate-500">Actividad programada</p>
            <p className="mt-1 text-sm font-bold text-[var(--expo-navy)]">{stand.activity}</p>
          </div>
        )}

        {stand.promotion && (
          <div className="rounded-xl border-2 border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/15 p-3">
            <p className="pixel-label text-slate-500">Promoción vigente</p>
            <p className="mt-1 text-sm font-bold text-[var(--expo-navy)]">{stand.promotion}</p>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/panel/mi-stand/editar"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5"
          >
            <Pencil className="h-4 w-4" />
            Editar perfil
          </Link>
          <Link
            href="/panel/mi-stand/qr"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-white px-4 py-2 text-sm font-black text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5"
          >
            <QrCode className="h-4 w-4" />
            Gestionar QR
          </Link>
        </div>
      </div>
    </>
  );
}
