"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Gift, Loader2, Plus, Trash2, Trophy } from "lucide-react";

import { adminRoutes } from "@/config/admin-routes";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { organizerApi, type EventCategory, type EventMission, type MissionMode } from "@/lib/api/organizer";
import { errorMessage, NoEventNotice, RemoteState, useOrganizerEvent } from "./organizer-event";
import { PanelPageHeader } from "./panel-page-header";

const MODE_LABELS: Record<MissionMode, string> = {
  any_stand: "Cualquier stand",
  specific_stands: "Stands específicos",
  categories: "Por categorías",
  special_action: "Acción especial",
};

const field = "mt-1 w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-sm focus:border-[var(--expo-blue)] focus:outline-none";

export function GamificacionView() {
  const { eventId, eventName } = useOrganizerEvent();
  return (
    <>
      <PanelPageHeader eyebrow="Organizador" title="Gamificación" description={`Misiones y premios de ${eventName}, guardados en el servidor.`} demo={false} />
      {!eventId ? <NoEventNotice /> : (
        <>
          <MissionsSection eventId={eventId} />
          <RewardsSection eventId={eventId} />
        </>
      )}
    </>
  );
}

function MissionsSection({ eventId }: { eventId: string }) {
  const data = useAsyncResource(`missions:${eventId}`, async () => {
    const [missions, categories] = await Promise.all([organizerApi.getMissions(eventId), organizerApi.getCategories(eventId)]);
    return { missions, categories };
  });

  return (
    <section className="mb-6" aria-labelledby="missions-heading">
      <h2 id="missions-heading" className="mb-3 flex items-center gap-2 text-lg font-black text-[var(--expo-navy)]"><Trophy aria-hidden="true" className="h-5 w-5 text-[var(--expo-yellow)]" />Misiones</h2>
      <RemoteState resource={data} label="las misiones">
        {({ missions, categories }) => (
          <>
            {missions.length === 0 ? <p className="pixel-card mb-4 p-5 text-sm text-slate-500">El evento aún no tiene misiones. Crea la primera abajo.</p> : (
              <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {missions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    eventId={eventId}
                    mission={mission}
                    onChanged={(saved) => data.setData((current) => ({ ...current, missions: current.missions.map((item) => (item.id === saved.id ? saved : item)) }))}
                    onDeleted={() => data.setData((current) => ({ ...current, missions: current.missions.filter((item) => item.id !== mission.id) }))}
                  />
                ))}
              </div>
            )}
            <MissionForm eventId={eventId} categories={categories} onCreated={(created) => data.setData((current) => ({ ...current, missions: [...current.missions, created] }))} />
          </>
        )}
      </RemoteState>
    </section>
  );
}

function MissionCard({ eventId, mission, onChanged, onDeleted }: {
  eventId: string;
  mission: EventMission;
  onChanged: (mission: EventMission) => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

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
    <article className="pixel-card flex flex-col gap-2 p-4" aria-label={`Misión ${mission.title}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-black text-[var(--expo-navy)]">{mission.title}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${mission.isActive ? "bg-[var(--expo-green)]/15 text-[var(--expo-green)]" : "bg-slate-100 text-slate-500"}`}>
          {mission.isActive ? "Activa" : "Pausada"}
        </span>
      </div>
      {mission.description && <p className="text-sm text-slate-600">{mission.description}</p>}
      <p className="text-xs font-bold text-slate-500">{MODE_LABELS[mission.mode]} · {mission.targetCount} {mission.targetCount === 1 ? "visita" : "visitas"} · +{mission.pointsReward} puntos</p>
      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-bold">
        <button type="button" disabled={busy} onClick={() => void run(async () => {
          onChanged(await organizerApi.setMissionActive(eventId, mission.id, !mission.isActive));
        }, "No se pudo cambiar el estado de la misión.")} className="text-[var(--expo-blue)] underline disabled:opacity-60">
          {mission.isActive ? "Pausar" : "Activar"}
        </button>
        {confirming ? (
          <>
            <button type="button" disabled={busy} onClick={() => void run(async () => {
              await organizerApi.deleteMission(eventId, mission.id);
              onDeleted();
            }, "No se pudo eliminar la misión.")} className="rounded-lg bg-rose-600 px-2.5 py-1 text-white disabled:opacity-60">Confirmar eliminación</button>
            <button type="button" onClick={() => setConfirming(false)} className="text-slate-500 underline">Cancelar</button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-1 text-rose-600"><Trash2 className="h-3.5 w-3.5" />Eliminar</button>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    </article>
  );
}

function MissionForm({ eventId, categories, onCreated }: { eventId: string; categories: EventCategory[]; onCreated: (mission: EventMission) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetCount, setTargetCount] = useState(3);
  const [pointsReward, setPointsReward] = useState(50);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) { setError("El título de la misión es obligatorio."); return; }
    setSaving(true);
    setError("");
    try {
      onCreated(await organizerApi.createMission(eventId, {
        title: title.trim(), description: description.trim() || null, targetCount, pointsReward, categoryIds,
      }));
      setTitle("");
      setDescription("");
      setCategoryIds([]);
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo crear la misión."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="pixel-card max-w-2xl space-y-4 p-5" aria-labelledby="new-mission-heading">
      <h3 id="new-mission-heading" className="font-black text-[var(--expo-navy)]">Nueva misión</h3>
      <label className="block text-sm font-bold">Título<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className={field} /></label>
      <label className="block text-sm font-bold">Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className={field} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-bold">Visitas requeridas<input type="number" min={1} max={100} value={targetCount} onChange={(event) => setTargetCount(Math.max(1, Number(event.target.value) || 1))} className={field} /></label>
        <label className="block text-sm font-bold">Puntos de premio<input type="number" min={0} max={10000} value={pointsReward} onChange={(event) => setPointsReward(Math.max(0, Number(event.target.value) || 0))} className={field} /></label>
      </div>
      {categories.length > 0 && (
        <fieldset className="text-sm">
          <legend className="font-bold">Limitar a categorías (opcional)</legend>
          <p className="text-xs text-slate-500">Sin selección, cuenta la visita a cualquier stand.</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {categories.map((category) => (
              <label key={category.id} className="inline-flex items-center gap-1.5">
                <input type="checkbox" checked={categoryIds.includes(category.id)} onChange={(event) => setCategoryIds((current) => event.target.checked ? [...current, category.id] : current.filter((id) => id !== category.id))} />
                {category.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-4 py-2 text-sm font-black disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Crear misión
      </button>
    </form>
  );
}

function RewardsSection({ eventId }: { eventId: string }) {
  const rewards = useAsyncResource(`rewards:${eventId}`, () => organizerApi.getRewards(eventId));
  return (
    <section aria-labelledby="rewards-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="rewards-heading" className="flex items-center gap-2 text-lg font-black text-[var(--expo-navy)]"><Gift aria-hidden="true" className="h-5 w-5 text-[var(--expo-purple)]" />Premios</h2>
        <div className="flex gap-3 text-sm font-bold">
          <Link href={adminRoutes.rewards(eventId)} className="text-[var(--expo-blue)] underline">Gestionar premios</Link>
          <Link href={adminRoutes.inventory(eventId)} className="text-[var(--expo-blue)] underline">Inventario</Link>
        </div>
      </div>
      <RemoteState resource={rewards} label="los premios">
        {(items) => items.length === 0 ? <p className="pixel-card p-5 text-sm text-slate-500">El evento aún no tiene premios en su catálogo.</p> : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((reward) => (
              <li key={reward.id} className="pixel-card flex items-center justify-between gap-2 p-4 text-sm">
                <span className="font-bold text-[var(--expo-navy)]">{reward.name}</span>
                <span className="font-mono text-xs text-slate-500">{reward.costPoints} pts{reward.isActive ? "" : " · inactivo"}</span>
              </li>
            ))}
          </ul>
        )}
      </RemoteState>
    </section>
  );
}
