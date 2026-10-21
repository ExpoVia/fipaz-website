"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";

import { exhibitorApi, type ExhibitorCompany } from "@/lib/api/exhibitor";
import { canEditCompany } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { PanelPageHeader } from "./panel-page-header";

export function CompanyDetailsView() {
  const { company, reload } = useExhibitor();
  const editable = useCompanyAuthStore((state) => canEditCompany(state.session));
  return <ExhibitorState requireStand={false}>{company && <CompanyForm key={company.id} company={company} editable={editable} reload={reload} />}</ExhibitorState>;
}

function CompanyForm({ company, editable, reload }: { company: ExhibitorCompany; editable: boolean; reload: () => Promise<void> }) {
  const verifySession = useCompanyAuthStore((state) => state.verifySession);
  const [name, setName] = useState(company.displayName);
  const [description, setDescription] = useState(company.description ?? "");
  const [contactEmail, setContactEmail] = useState(company.contactEmail ?? "");
  const [website, setWebsite] = useState(company.website ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await exhibitorApi.updateCompany(company.id, {
        displayName: name.trim(), description: description.trim() || null,
        contactEmail: contactEmail.trim() || null, website: website.trim() || null,
      });
      await reload();
      await verifySession();
      setMessage("Cambios guardados en el servidor.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm focus:border-[var(--expo-blue)] focus:outline-none disabled:bg-slate-100";
  return (
    <>
      <PanelPageHeader eyebrow="Empresa" title="Perfil de empresa" description="Datos de contacto y marca guardados en el servidor." demo={false} />
      {!editable && <p role="note" className="mb-5 rounded-xl border border-[var(--expo-blue)] bg-white p-3 text-sm">Solo lectura: tu rol de personal no permite editar la empresa.</p>}
      <form onSubmit={(event) => void save(event)} className="pixel-card max-w-2xl space-y-5 p-6">
        <fieldset disabled={!editable || saving} className="space-y-5">
          <label className="block text-sm font-bold">Nombre de la empresa<input value={name} onChange={(event) => setName(event.target.value)} maxLength={160} required className={field} /></label>
          <label className="block text-sm font-bold">Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className={field} /></label>
          <label className="block text-sm font-bold">Correo de contacto<input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className={field} /></label>
          <label className="block text-sm font-bold">Sitio web<input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" className={field} /></label>
        </fieldset>
        <p className="text-xs text-slate-500">La carga de logo aún no está disponible en el servidor.</p>
        {message && <p role="status" className="text-sm font-bold">{message}</p>}
        {editable && <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-5 py-2.5 text-sm font-black disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Guardar cambios</button>}
      </form>
    </>
  );
}
