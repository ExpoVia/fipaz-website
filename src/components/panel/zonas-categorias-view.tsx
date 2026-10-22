"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { organizerApi, type EventCategory, type MapZone } from "@/lib/api/organizer";
import { errorMessage, NoEventNotice, RemoteState, tokenColor, useOrganizerEvent } from "./organizer-event";
import { PanelPageHeader } from "./panel-page-header";

const COLOR_OPTIONS = [
  { value: "", label: "Sin color" },
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "yellow", label: "Amarillo" },
  { value: "red", label: "Rojo" },
  { value: "purple", label: "Morado" },
  { value: "pink", label: "Rosado" },
] as const;

const field = "min-h-10 rounded-lg border border-[#d7e3f3] bg-[#fbfdff] px-3 py-2 text-sm text-[#172344] focus:border-[#0878f9] focus:outline-none focus:ring-2 focus:ring-[#0878f9]/15 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:focus:border-[#1479F5]";
const primaryButton = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0878f9] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0067d9] disabled:opacity-50 dark:bg-[#1479F5]";

export function ZonasCategoriasView() {
  const { eventId, eventName } = useOrganizerEvent();
  return (
    <>
      <PanelPageHeader eyebrow="Organizador" title="Zonas y categorías" description={`Pabellones del plano y rubros de los stands de ${eventName}. Los cambios se guardan en el servidor.`} demo={false} />
      {!eventId ? <NoEventNotice /> : (
        <>
          <ZonesSection eventId={eventId} />
          <CategoriesSection eventId={eventId} />
        </>
      )}
    </>
  );
}

function ZonesSection({ eventId }: { eventId: string }) {
  const zones = useAsyncResource(`zones:${eventId}`, async () => {
    const versions = await organizerApi.getMapVersions(eventId);
    // La versión publicada es la que ven los visitantes; si no hay, la más reciente.
    const version = versions.find((item) => item.status === "published") ?? [...versions].sort((a, b) => b.version - a.version)[0];
    return version ? { version, floors: await organizerApi.getFloorsWithZones(eventId, version.id) } : null;
  });

  return (
    <section className="pixel-card mb-6 p-5 dark:border-[#223354] dark:bg-[#101A2E]" aria-labelledby="zones-heading">
      <h2 id="zones-heading" className="text-lg font-black text-[var(--expo-navy)] dark:text-[#F5F9FF]">Zonas del plano</h2>
      <RemoteState resource={zones} label="las zonas">
        {(data) => !data ? <p className="mt-2 text-sm text-slate-500 dark:text-[#B8C7E6]">El evento aún no tiene un mapa con zonas.</p> : (
          <>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#B8C7E6]">Versión v{data.version.version} del plano.</p>
            {data.floors.map((floor) => (
              <div key={floor.id} className="mt-4">
                <h3 className="pixel-label text-slate-500 dark:text-[#B8C7E6]">{floor.name}</h3>
                {floor.zones.length === 0 ? <p className="mt-1 text-sm text-slate-500 dark:text-[#B8C7E6]">Sin zonas en este piso.</p> : (
                  <ul className="mt-2 divide-y divide-[var(--expo-line)] dark:divide-[#223354]">
                    {floor.zones.map((zone) => (
                      <ZoneRow key={zone.id} eventId={eventId} zone={zone} onSaved={(saved) => zones.setData((current) => current && {
                        ...current,
                        floors: current.floors.map((item) => ({ ...item, zones: item.zones.map((z) => (z.id === saved.id ? saved : z)) })),
                      })} />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}
      </RemoteState>
    </section>
  );
}

function ZoneRow({ eventId, zone, onSaved }: { eventId: string; zone: MapZone; onSaved: (zone: MapZone) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(zone.name);
  const [shortCode, setShortCode] = useState(zone.shortCode ?? "");
  const [description, setDescription] = useState(zone.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      onSaved(await organizerApi.updateZone(eventId, zone.id, {
        name: name.trim(), shortCode: shortCode.trim() || null, description: description.trim() || null,
      }));
      setEditing(false);
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo guardar la zona."));
    } finally {
      setSaving(false);
    }
  }

  if (!editing) return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: tokenColor(zone.colorToken) }} />
        <span className="font-bold text-[var(--expo-navy)] dark:text-[#F5F9FF]">{zone.name}</span>
        {zone.shortCode && <span className="font-mono text-xs text-slate-500 dark:text-[#B8C7E6]">{zone.shortCode}</span>}
        {zone.description && <span className="text-xs text-slate-500 dark:text-[#B8C7E6]">· {zone.description}</span>}
      </span>
      <button type="button" onClick={() => setEditing(true)} aria-label={`Editar zona ${zone.name}`} className="rounded-lg border-2 border-[var(--expo-line)] px-3 py-1 text-xs font-bold text-[var(--expo-navy)] dark:border-[#223354] dark:text-[#F5F9FF] dark:hover:border-[#1479F5]">Editar</button>
    </li>
  );

  return (
    <li className="py-3">
      <form onSubmit={(event) => void save(event)} className="flex flex-wrap items-end gap-2 text-xs font-bold">
        <label className="flex flex-col gap-1 dark:text-[#B8C7E6]">Nombre<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} className={field} /></label>
        <label className="flex flex-col gap-1 dark:text-[#B8C7E6]">Código<input value={shortCode} onChange={(event) => setShortCode(event.target.value)} maxLength={8} className={`${field} w-20`} /></label>
        <label className="flex flex-1 flex-col gap-1 dark:text-[#B8C7E6]">Descripción<input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={200} className={field} /></label>
        <button type="submit" disabled={saving} className={primaryButton}>{saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Guardar zona</button>
        <button type="button" onClick={() => setEditing(false)} className="px-2 py-1.5 text-slate-500 underline dark:text-[#B8C7E6]">Cancelar</button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-400">{error}</p>}
    </li>
  );
}

function CategoriesSection({ eventId }: { eventId: string }) {
  const categories = useAsyncResource(`categories:${eventId}`, () => organizerApi.getCategories(eventId));
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!label.trim()) return;
    setCreating(true);
    setError("");
    try {
      const created = await organizerApi.createCategory(eventId, { label: label.trim(), colorToken: color || null });
      categories.setData((current) => [...current, created]);
      setLabel("");
      setColor("");
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo crear la categoría."));
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="pixel-card p-5 dark:border-[#223354] dark:bg-[#101A2E]" aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="text-lg font-black text-[var(--expo-navy)] dark:text-[#F5F9FF]">Categorías de stands</h2>
      <RemoteState resource={categories} label="las categorías">
        {(items) => (
          <>
            {items.length === 0 ? <p className="mt-2 text-sm text-slate-500 dark:text-[#B8C7E6]">El evento aún no tiene categorías.</p> : (
              <ul className="mt-2 divide-y divide-[var(--expo-line)] dark:divide-[#223354]">
                {[...items].sort((a, b) => a.sortOrder - b.sortOrder).map((category) => (
                  <CategoryRow
                    key={category.id}
                    eventId={eventId}
                    category={category}
                    onSaved={(saved) => categories.setData((current) => current.map((item) => (item.id === saved.id ? saved : item)))}
                    onDeleted={() => categories.setData((current) => current.filter((item) => item.id !== category.id))}
                  />
                ))}
              </ul>
            )}
            <form onSubmit={(event) => void create(event)} className="mt-4 flex flex-wrap items-end gap-2 border-t border-[var(--expo-line)] pt-4 text-xs font-bold dark:border-[#223354]">
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 dark:text-[#B8C7E6]">Nueva categoría<input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} placeholder="Ej. Tecnología" className={field} /></label>
              <label className="flex flex-col gap-1 dark:text-[#B8C7E6]">Color
                <select value={color} onChange={(event) => setColor(event.target.value)} className={field}>
                  {COLOR_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <button type="submit" disabled={creating || !label.trim()} className={`${primaryButton} w-full sm:w-auto`}>{creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Agregar categoría</button>
            </form>
            {error && <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-400">{error}</p>}
          </>
        )}
      </RemoteState>
    </section>
  );
}

function CategoryRow({ eventId, category, onSaved, onDeleted }: {
  eventId: string;
  category: EventCategory;
  onSaved: (category: EventCategory) => void;
  onDeleted: () => void;
}) {
  const [label, setLabel] = useState(category.label);
  const [color, setColor] = useState(category.colorToken ?? "");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const dirty = label.trim() !== category.label || (color || null) !== category.colorToken;

  async function run(work: () => Promise<void>, fallback: string) {
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (cause) {
      setError(errorMessage(cause, fallback));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div className="flex min-w-0 basis-full items-center gap-2.5 sm:basis-0 sm:flex-1">
          <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ background: tokenColor(color || null) }} />
          <label className="sr-only" htmlFor={`category-${category.id}`}>Nombre de la categoría {category.label}</label>
          <input id={`category-${category.id}`} value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} className={`${field} min-w-0 flex-1 font-bold`} />
        </div>
        <label className="sr-only" htmlFor={`category-color-${category.id}`}>Color de {category.label}</label>
        <select id={`category-color-${category.id}`} value={color} onChange={(event) => setColor(event.target.value)} className={field}>
          {COLOR_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          {color && !COLOR_OPTIONS.some((option) => option.value === color) && <option value={color}>{color}</option>}
        </select>
        <span className="font-mono text-xs text-slate-400 dark:text-[#B8C7E6]">{category.slug}</span>
        {dirty && (
          <button type="button" disabled={busy || !label.trim()} onClick={() => void run(async () => {
            onSaved(await organizerApi.updateCategory(eventId, category.id, { label: label.trim(), colorToken: color || null }));
          }, "No se pudo guardar la categoría.")} className={primaryButton}>Guardar</button>
        )}
        {confirming ? (
          <>
            <button type="button" disabled={busy} onClick={() => void run(async () => {
              await organizerApi.deleteCategory(eventId, category.id);
              onDeleted();
            }, "No se pudo eliminar la categoría.")} className="rounded-lg border-2 border-rose-600 bg-rose-600 px-3 py-1.5 text-xs font-black text-white disabled:opacity-60">Confirmar eliminación</button>
            <button type="button" onClick={() => setConfirming(false)} className="text-xs text-slate-500 underline dark:text-[#B8C7E6]">Cancelar</button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} aria-label={`Eliminar categoría ${category.label}`} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 className="h-4 w-4" /></button>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-400">{error}</p>}
    </li>
  );
}
