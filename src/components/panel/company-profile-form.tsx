"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { exhibitorApi, type ExhibitorStand } from "@/lib/api/exhibitor";
import { canEditCompany } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { PanelPageHeader } from "./panel-page-header";

export function CompanyProfileForm() {
  const { stand, reload } = useExhibitor();
  const editable = useCompanyAuthStore((state) => canEditCompany(state.session));
  return (
    <ExhibitorState>
      {!editable ? <p role="note" className="pixel-card p-5">Tu rol permite ver el stand, pero no editarlo.</p> : stand && <StandForm key={stand.id} stand={stand} reload={reload} />}
    </ExhibitorState>
  );
}

function StandForm({ stand, reload }: { stand: ExhibitorStand; reload: () => Promise<void> }) {
  const router = useRouter();
  const [name, setName] = useState(stand.displayName);
  const [description, setDescription] = useState(stand.description ?? "");
  const [tags, setTags] = useState(stand.tags.join(", "));
  const [activity, setActivity] = useState(stand.activityHighlight ?? "");
  const [promotion, setPromotion] = useState(stand.promotionHighlight ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) { setError("El nombre del stand es obligatorio."); return; }
    setSaving(true);
    setError("");
    try {
      await exhibitorApi.updateStand(stand.id, {
        displayName: name.trim(), description: description.trim() || null,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        activityHighlight: activity.trim() || null,
        promotionHighlight: promotion.trim() || null,
      });
      await reload();
      router.replace("/panel/mi-stand");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  const field = "w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm focus:border-[var(--expo-blue)] focus:outline-none";
  return (
    <>
      <PanelPageHeader eyebrow="Mi stand" title="Editar stand" description="Los cambios se guardan en el servidor y aparecerán al volver a cargar." demo={false} />
      <form onSubmit={(event) => void save(event)} className="pixel-card max-w-2xl space-y-5 p-6">
        <label className="block text-sm font-bold">Nombre visible<input value={name} onChange={(event) => setName(event.target.value)} maxLength={160} className={`mt-1 ${field}`} required /></label>
        <label className="block text-sm font-bold">Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className={`mt-1 ${field}`} /></label>
        <label className="block text-sm font-bold">Etiquetas, separadas por comas<input value={tags} onChange={(event) => setTags(event.target.value)} className={`mt-1 ${field}`} /></label>
        <label className="block text-sm font-bold">Actividad destacada<input value={activity} onChange={(event) => setActivity(event.target.value)} className={`mt-1 ${field}`} /></label>
        <label className="block text-sm font-bold">Promoción visible<input value={promotion} onChange={(event) => setPromotion(event.target.value)} className={`mt-1 ${field}`} /></label>
        <p className="text-xs text-slate-500">Los datos de contacto de la empresa se editan en <Link href="/panel/empresa" className="font-bold text-[var(--expo-blue)] underline">Perfil de empresa</Link>.</p>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-5 py-2.5 text-sm font-black disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Guardar cambios
        </button>
      </form>
    </>
  );
}
