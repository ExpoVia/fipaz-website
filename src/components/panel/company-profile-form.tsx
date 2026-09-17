"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { categories } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import type { StandCategory } from "@/types/demo";
import type { ExhibitorProfile } from "@/types/panel";
import { PanelPageHeader } from "./panel-page-header";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CompanyProfileForm() {
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  const activeCompanyId = usePanelStore((state) => state.activeCompanyId);
  const companies = usePanelStore((state) => state.companies);

  if (!hasHydrated) return null;

  const stand = companies.find((company) => company.id === activeCompanyId);
  if (!stand) {
    return (
      <p className="text-sm text-slate-500">
        No encontramos tu empresa. Regístrala primero desde{" "}
        <span className="font-bold text-[var(--expo-navy)]">/registro-empresa</span>.
      </p>
    );
  }

  // key={stand.id}: si cambia la empresa activa, se monta una instancia nueva
  // con sus propios valores iniciales, en vez de sincronizar estado por efecto.
  return <CompanyProfileFormFields key={stand.id} stand={stand} />;
}

function CompanyProfileFormFields({ stand }: { stand: ExhibitorProfile }) {
  const router = useRouter();
  const updateCompany = usePanelStore((state) => state.updateCompany);

  const [name, setName] = useState(stand.name);
  const [category, setCategory] = useState<StandCategory>(stand.category);
  const [contactEmail, setContactEmail] = useState(stand.contactEmail ?? "");
  const [description, setDescription] = useState(stand.description);
  const [tagsInput, setTagsInput] = useState(stand.tags.join(", "));
  const [activity, setActivity] = useState(stand.activity ?? "");
  const [promotion, setPromotion] = useState(stand.promotion ?? "");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !contactEmail.trim() || !description.trim()) {
      setErrorMsg("Nombre, correo y descripción son obligatorios.");
      return;
    }
    if (!EMAIL_PATTERN.test(contactEmail.trim())) {
      setErrorMsg("Ingresa un correo de contacto válido.");
      return;
    }

    setSaving(true);
    updateCompany(stand.id, {
      name: name.trim(),
      category,
      contactEmail: contactEmail.trim(),
      description: description.trim(),
      tags: tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      activity: activity.trim() || undefined,
      promotion: promotion.trim() || undefined,
    });

    setTimeout(() => {
      router.push("/panel/mi-stand");
    }, 400);
  }

  return (
    <>
      <PanelPageHeader
        eyebrow="Mi stand"
        title="Editar perfil"
        description="Completa la información que verán los visitantes y el equipo organizador."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="pixel-card space-y-5 p-6">
          <div>
            <label htmlFor="edit-name" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
              Nombre de la empresa <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-black text-[var(--expo-navy)]">
              Categoría <span className="text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`rounded-xl border-2 px-2 py-2.5 text-center text-xs font-black transition-all ${
                    category === cat.id
                      ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[3px_3px_0_var(--expo-navy)]"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="edit-email" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
              Correo de contacto <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
              Descripción <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="edit-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="edit-tags" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
              Etiquetas
            </label>
            <input
              id="edit-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="IA, apps, móvil (separadas por comas)"
              className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="edit-activity" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
              Actividad programada
            </label>
            <input
              id="edit-activity"
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Ej. Demo en vivo a las 15:00"
              className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="edit-promotion" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
              Promoción vigente
            </label>
            <input
              id="edit-promotion"
              type="text"
              value={promotion}
              onChange={(e) => setPromotion(e.target.value)}
              placeholder="Ej. 20% de descuento en plan Starter"
              className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border-2 border-rose-500 bg-rose-50 p-4 text-xs font-black text-rose-800">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-6 py-3 text-sm font-black text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </button>
      </form>
    </>
  );
}
