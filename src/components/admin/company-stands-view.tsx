"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, Save, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { categories } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CompanyAuthGuard } from "@/components/admin/company-auth-guard";
import type { CompanyProfileInput } from "@/types/panel";
import type { StandCategory } from "@/types/demo";

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  function addTag(value: string) {
    const tag = value.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || tags.includes(tag) || tags.length >= 8) return;
    onChange([...tags, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-xl border-2 border-slate-300 p-2.5 focus-within:border-[var(--expo-blue)]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full border border-[var(--expo-line)] bg-[var(--expo-bg)] px-2.5 py-1 text-xs font-bold text-[var(--expo-navy)]"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-slate-400 hover:text-rose-500"
              aria-label={`Quitar ${tag}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
          }}
          onBlur={() => addTag(input)}
          placeholder={tags.length < 8 ? "Agrega etiqueta + Enter" : "Máx. 8 etiquetas"}
          disabled={tags.length >= 8}
          className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <p className="mt-1 text-xs text-slate-400">{tags.length}/8 etiquetas</p>
    </div>
  );
}

// ─── Stand edit form ──────────────────────────────────────────────────────────

function StandEditForm({ standId, onClose }: { standId: string; onClose: () => void }) {
  const companies = usePanelStore((s) => s.companies);
  const updateCompany = usePanelStore((s) => s.updateCompany);

  const stand = companies.find((c) => c.id === standId);
  if (!stand) return null;

  const [description, setDescription] = useState(stand.description);
  const [category, setCategory] = useState<StandCategory>(stand.category);
  const [tags, setTags] = useState<string[]>(stand.tags);
  const [activity, setActivity] = useState(stand.activity ?? "");
  const [promotion, setPromotion] = useState(stand.promotion ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // TS narrowed: stand is defined from here on
  const standName = stand.name;
  const standEmail = stand.contactEmail ?? "";

  function handleSave() {
    setError("");
    if (!description.trim()) { setError("La descripción es requerida."); return; }
    setSaving(true);

    const patch: CompanyProfileInput = {
      name: standName,
      category,
      description: description.trim(),
      contactEmail: standEmail,
      tags,
      activity: activity.trim() || undefined,
      promotion: promotion.trim() || undefined,
    };

    setTimeout(() => {
      updateCompany(standId, patch);
      setSaving(false);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    }, 700);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="pixel-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[var(--expo-line)] bg-[var(--expo-bg)] px-5 py-3">
        <div>
          <p className="font-black text-[var(--expo-navy)]">Editar stand</p>
          <p className="font-mono text-xs text-slate-500">
            {stand.name} · {stand.boothCode}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="Cerrar editor"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-5 p-5">
        {/* Descripción */}
        <div>
          <label className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
            Descripción del stand <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full rounded-xl border-2 p-3 text-sm font-medium outline-none ${error ? "border-rose-400" : "border-slate-300 focus:border-[var(--expo-blue)]"}`}
          />
          {error && <p className="mt-1 text-xs font-bold text-rose-500">{error}</p>}
        </div>

        {/* Categoría */}
        <div>
          <span className="mb-2 block text-sm font-black text-[var(--expo-navy)]">Categoría</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-all ${
                  category === cat.id
                    ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[2px_2px_0_var(--expo-navy)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-black text-[var(--expo-navy)]">
            <Tag size={14} />
            Etiquetas
          </label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Actividad */}
        <div>
          <label className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
            Actividad programada
          </label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Ej. Demo en vivo a las 15:00 hrs"
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium outline-none focus:border-[var(--expo-blue)]"
          />
        </div>

        {/* Promoción */}
        <div>
          <label className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
            Promoción vigente
          </label>
          <input
            type="text"
            value={promotion}
            onChange={(e) => setPromotion(e.target.value)}
            placeholder="Ej. 20% desc. en planes anuales presentando el código FIPAZ"
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium outline-none focus:border-[var(--expo-blue)]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-4 py-2.5 font-black text-white shadow-[3px_3px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
            {saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-slate-300 px-4 py-2.5 font-black text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stand card ───────────────────────────────────────────────────────────────

function StandListCard({
  standId,
  onEdit,
}: {
  standId: string;
  onEdit: (id: string) => void;
}) {
  const companies = usePanelStore((s) => s.companies);
  const stand = companies.find((c) => c.id === standId);
  if (!stand) return null;

  const isIncomplete = stand.tags.length === 0 && !stand.activity && !stand.promotion;

  return (
    <div className="pixel-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[var(--expo-navy)]">{stand.name}</h3>
            <StandCategoryBadge category={stand.category} />
            {isIncomplete && (
              <span className="rounded-full border border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/20 px-2 py-0.5 text-[10px] font-black text-[var(--expo-navy)]">
                Perfil incompleto
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-slate-400">
            <MapPin size={11} />
            {stand.boothCode}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{stand.description}</p>
          {stand.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {stand.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--expo-line)] bg-[var(--expo-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--expo-navy)]"
                >
                  #{tag}
                </span>
              ))}
              {stand.tags.length > 5 && (
                <span className="text-[10px] text-slate-400">+{stand.tags.length - 5} más</span>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onEdit(standId)}
          className="shrink-0 rounded-xl border-2 border-[var(--expo-navy)] bg-white px-3 py-2 text-sm font-black text-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5"
        >
          Editar
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stand.activity && (
          <div className="rounded-xl border-2 border-[var(--expo-line)] px-3 py-2">
            <p className="pixel-label text-slate-400">Actividad</p>
            <p className="mt-0.5 truncate text-xs font-bold text-[var(--expo-navy)]">{stand.activity}</p>
          </div>
        )}
        {stand.promotion && (
          <div className="rounded-xl border-2 border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/10 px-3 py-2">
            <p className="pixel-label text-slate-400">Promoción</p>
            <p className="mt-0.5 truncate text-xs font-bold text-[var(--expo-navy)]">{stand.promotion}</p>
          </div>
        )}
        <div className="rounded-xl border-2 border-[var(--expo-line)] px-3 py-2">
          <p className="pixel-label text-slate-400">Puntos</p>
          <p className="mt-0.5 text-xs font-black text-[var(--expo-navy)]">+{stand.points} pts</p>
        </div>
      </div>
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

function StandsListContent() {
  const session = useCompanyAuthStore((s) => s.session);
  const companies = usePanelStore((s) => s.companies);

  // En producción: GET /events/:eventId/stands?companyId=...
  // Aquí filtramos del store los stands de la empresa logueada
  const companyStands = companies.filter((c) => c.id === session?.companyId);

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Mis stands" },
        ]}
        title="Mis stands"
        description="Gestiona la descripción, etiquetas, actividades y promociones de tus stands en el evento."
      />

      {companyStands.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[var(--expo-line)] bg-white py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-sky)] shadow-[4px_4px_0_var(--expo-navy)]">
            <MapPin size={30} className="text-[var(--expo-navy)]" />
          </span>
          <p className="mt-4 font-black text-[var(--expo-navy)]">Sin stands registrados</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Registra tu empresa como expositora para que te asignen un stand en el evento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {companyStands.map((stand) => (
            <div key={stand.id}>
              <AnimatePresence>
                {editingId === stand.id && (
                  <motion.div key="edit-form" className="mb-3">
                    <StandEditForm
                      standId={stand.id}
                      onClose={() => setEditingId(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {editingId !== stand.id && (
                <StandListCard standId={stand.id} onEdit={setEditingId} />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function CompanyStandsView() {
  return (
    <CompanyAuthGuard>
      <StandsListContent />
    </CompanyAuthGuard>
  );
}
