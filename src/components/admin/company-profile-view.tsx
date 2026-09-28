"use client";

import { useState } from "react";
import { Building2, Camera, CheckCircle2, ExternalLink, Globe, ImageOff, Loader2, Mail, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { categories } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CompanyAuthGuard } from "@/components/admin/company-auth-guard";
import type { CompanyProfileInput } from "@/types/panel";
import type { StandCategory } from "@/types/demo";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/.+\..+/;

function isValidUrl(value: string) {
  return value === "" || URL_PATTERN.test(value);
}

// ─── Logo uploader (guardado local para la demo) ──────────────────────────────

function LogoUploader({
  currentUrl,
  onChange,
}: {
  currentUrl: string;
  onChange: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  function handleFile(file: File) {
    setUploadError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setUploadError("Elige una imagen PNG, JPG o WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 2 MB.");
      return;
    }
    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (image.width < 200 || image.height < 200) {
        setUploadError("La imagen debe medir al menos 200 × 200 px.");
        setUploading(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setLocalPreview(reader.result);
          onChange(reader.result);
        }
        setUploading(false);
      };
      reader.onerror = () => {
        setUploadError("No se pudo leer la imagen. Inténtalo nuevamente.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setUploadError("No se pudo abrir la imagen. Inténtalo nuevamente.");
      setUploading(false);
    };
    image.src = objectUrl;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const preview = localPreview ?? (currentUrl.startsWith("/") || currentUrl.startsWith("http") || currentUrl.startsWith("data:image/") ? currentUrl : null);

  return (
    <div className="flex items-center gap-5">
      {/* Preview */}
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-bg)] shadow-[3px_3px_0_var(--expo-navy)]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo de empresa" className="h-full w-full object-contain p-1" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff size={28} className="text-slate-300" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 size={22} className="animate-spin text-[var(--expo-blue)]" />
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
          dragging
            ? "border-[var(--expo-blue)] bg-[var(--expo-sky)]/20"
            : "border-[var(--expo-line)] bg-[var(--expo-bg)] hover:border-[var(--expo-blue)]"
        }`}
      >
        <Camera size={20} className="text-slate-400" />
        <p className="text-sm font-bold text-slate-500">
          Arrastra tu logo aquí{" "}
          <label className="cursor-pointer text-[var(--expo-blue)] underline underline-offset-2">
            o selecciona un archivo
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </label>
        </p>
        <p className="text-xs text-slate-400">PNG, JPG, WebP · Mín. 200×200 px · Máx. 2 MB</p>
        {uploadError && <p role="alert" className="text-xs font-bold text-rose-600">{uploadError}</p>}
        <p className="text-xs text-slate-400">Prueba local: se conserva en este navegador.</p>
      </div>
    </div>
  );
}

// ─── Preview del perfil público ───────────────────────────────────────────────

function PublicProfilePreview({
  name,
  description,
  category,
  customCategory,
  logoUrl,
  website,
}: {
  name: string;
  description: string;
  category: StandCategory | null;
  customCategory: string;
  logoUrl: string;
  website: string;
}) {
  return (
    <div className="pixel-card overflow-hidden">
      <div className="border-b-2 border-[var(--expo-line)] bg-[var(--expo-bg)] px-4 py-2.5">
        <p className="pixel-label text-slate-400">Vista previa — perfil público</p>
      </div>
      <div className="flex items-start gap-4 p-5">
        <div className="size-14 shrink-0 overflow-hidden rounded-xl border-2 border-[var(--expo-line)] bg-[var(--expo-bg)]">
          {logoUrl.startsWith("/") || logoUrl.startsWith("http") || logoUrl.startsWith("data:image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 size={24} className="text-slate-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[var(--expo-navy)]">{name || "Nombre de empresa"}</h3>
            {category && <StandCategoryBadge category={category} customCategory={customCategory} />}
          </div>
          <p className="mt-1 line-clamp-3 text-sm text-slate-600">
            {description || "Descripción de la empresa…"}
          </p>
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--expo-blue)] hover:underline"
            >
              <Globe size={12} />
              {website.replace(/^https?:\/\//, "")}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

function ProfileForm() {
  const session = useCompanyAuthStore((s) => s.session);
  const companies = usePanelStore((s) => s.companies);
  const updateCompany = usePanelStore((s) => s.updateCompany);

  const company = companies.find((c) => c.id === session?.companyId);

  const [displayName, setDisplayName] = useState(company?.name ?? "");
  const [description, setDescription] = useState(company?.description ?? "");
  const [logoPath, setLogoPath] = useState(company?.logoPath ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(company?.websiteUrl ?? "");
  const [contactEmail, setContactEmail] = useState(company?.contactEmail ?? "");
  const [category, setCategory] = useState<StandCategory>(company?.category ?? "technology");
  const [customCategory, setCustomCategory] = useState(company?.customCategory ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!company) {
    return (
      <p className="text-sm text-slate-500">
        No se encontró tu empresa. Verifica tu sesión.
      </p>
    );
  }

  // TS narrowed: company is defined from here on
  const companyId = company.id;
  const companyTags = company.tags;
  const companyActivity = company.activity;
  const companyPromotion = company.promotion;

  function validate() {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = "El nombre no puede estar vacío.";
    if (displayName.trim().length > 120) errs.displayName = "Máximo 120 caracteres.";
    if (!description.trim()) errs.description = "La descripción es requerida.";
    if (description.trim().length > 2000) errs.description = "Máximo 2000 caracteres.";
    if (!EMAIL_PATTERN.test(contactEmail.trim())) errs.contactEmail = "Correo inválido.";
    if (!isValidUrl(websiteUrl.trim())) errs.websiteUrl = "URL inválida. Debe comenzar con https://";
    if (category === "other" && !customCategory.trim()) errs.customCategory = "Especifica tu categoría.";
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    const patch: CompanyProfileInput = {
      name: displayName.trim(),
      category,
      customCategory: category === "other" ? customCategory.trim() : undefined,
      description: description.trim(),
      contactEmail: contactEmail.trim(),
      logoPath,
      websiteUrl: websiteUrl.trim(),
      tags: companyTags,
      activity: companyActivity,
      promotion: companyPromotion,
    };

    // Simula latencia de red
    setTimeout(() => {
      updateCompany(companyId, patch);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  }

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Perfil de empresa" },
        ]}
        title="Perfil de empresa"
        description="Esta información es visible para los visitantes en la app ExpoVia."
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-4 py-2 font-black text-white shadow-[3px_3px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Guardar cambios
          </button>
        }
      />

      {/* Toast de guardado */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mb-5 flex items-center gap-2 rounded-xl border-2 border-[var(--expo-green)] bg-[var(--expo-green)]/15 px-4 py-3"
          >
            <CheckCircle2 size={16} className="text-[var(--expo-green)]" />
            <span className="text-sm font-black text-[var(--expo-navy)]">
              Cambios guardados correctamente
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Formulario */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="pixel-card p-5">
            <p className="pixel-label mb-3 text-[var(--expo-blue)]">Logo de empresa</p>
            <LogoUploader currentUrl={logoPath} onChange={setLogoPath} />
          </div>

          {/* Datos básicos */}
          <div className="pixel-card space-y-5 p-5">
            <p className="pixel-label text-[var(--expo-blue)]">Datos de marca</p>

            {/* displayName */}
            <div>
              <label className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
                Nombre visible <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full rounded-xl border-2 p-3 text-sm font-medium outline-none transition-colors ${errors.displayName ? "border-rose-400" : "border-slate-300 focus:border-[var(--expo-blue)]"}`}
              />
              {errors.displayName && <p className="mt-1 text-xs font-bold text-rose-500">{errors.displayName}</p>}
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
              {category === "other" && (
                <div className="mt-3">
                  <label htmlFor="profile-custom-category" className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
                    Especifica la categoría <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="profile-custom-category"
                    type="text"
                    maxLength={60}
                    value={customCategory}
                    onChange={(event) => setCustomCategory(event.target.value)}
                    className={`w-full rounded-xl border-2 p-3 text-sm font-medium outline-none transition-colors ${errors.customCategory ? "border-rose-400" : "border-slate-300 focus:border-[var(--expo-blue)]"}`}
                  />
                  {errors.customCategory && <p className="mt-1 text-xs font-bold text-rose-500">{errors.customCategory}</p>}
                </div>
              )}
            </div>

            {/* description */}
            <div>
              <label className="mb-1.5 block text-sm font-black text-[var(--expo-navy)]">
                Descripción corta <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full rounded-xl border-2 p-3 text-sm font-medium outline-none transition-colors ${errors.description ? "border-rose-400" : "border-slate-300 focus:border-[var(--expo-blue)]"}`}
              />
              <div className="mt-1 flex justify-between">
                {errors.description
                  ? <p className="text-xs font-bold text-rose-500">{errors.description}</p>
                  : <span />}
                <span className={`text-xs ${description.length > 280 ? "text-rose-500" : "text-slate-400"}`}>
                  {description.length}/2000
                </span>
              </div>
            </div>

            {/* website */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-black text-[var(--expo-navy)]">
                <Globe size={14} />
                Sitio web
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://tuempresa.com"
                className={`w-full rounded-xl border-2 p-3 text-sm font-medium outline-none transition-colors ${errors.websiteUrl ? "border-rose-400" : "border-slate-300 focus:border-[var(--expo-blue)]"}`}
              />
              {errors.websiteUrl && <p className="mt-1 text-xs font-bold text-rose-500">{errors.websiteUrl}</p>}
            </div>

            {/* email */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-black text-[var(--expo-navy)]">
                <Mail size={14} />
                Email de contacto <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={`w-full rounded-xl border-2 p-3 text-sm font-medium outline-none transition-colors ${errors.contactEmail ? "border-rose-400" : "border-slate-300 focus:border-[var(--expo-blue)]"}`}
              />
              {errors.contactEmail && <p className="mt-1 text-xs font-bold text-rose-500">{errors.contactEmail}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar: preview */}
        <div className="space-y-4">
          <PublicProfilePreview
            name={displayName}
            description={description}
            category={category}
            customCategory={customCategory}
            logoUrl={logoPath}
            website={websiteUrl}
          />

          {/* Acceso rápido */}
          <div className="pixel-card p-4">
            <p className="pixel-label mb-3 text-slate-400">Acceso rápido</p>
            <a
              href="/panel/mi-stand"
              className="flex items-center gap-2 text-sm font-bold text-[var(--expo-blue)] hover:underline"
            >
              → Ver perfil en panel de expositor
            </a>
            <a
              href="/panel/mi-stand/qr"
              className="mt-2 flex items-center gap-2 text-sm font-bold text-[var(--expo-blue)] hover:underline"
            >
              → Gestionar QR de check-in
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export function CompanyProfileView() {
  return (
    <CompanyAuthGuard>
      <ProfileForm />
    </CompanyAuthGuard>
  );
}
