"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Loader2, QrCode, ScanLine, ShieldOff } from "lucide-react";

import { adminRoutes } from "@/config/admin-routes";
import { exhibitorApi, type IssuedStandQr } from "@/lib/api/exhibitor";
import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { PanelPageHeader } from "./panel-page-header";

export function QrStandView() {
  const { stand } = useExhibitor();
  const [ttl, setTtl] = useState(60);
  const [maxScans, setMaxScans] = useState(10);
  const [issued, setIssued] = useState<(IssuedStandQr & { standId: string }) | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const activeIssued = issued?.standId === stand?.id ? issued : null;
  const secondsLeft = activeIssued && now !== null ? Math.max(0, Math.ceil((Date.parse(activeIssued.expiresAt) - now) / 1000)) : 0;

  async function generate() {
    if (!stand) return;
    setBusy(true);
    setError("");
    try {
      setIssued({ ...await exhibitorApi.issueQr(stand.id, ttl, maxScans), standId: stand.id });
      setNow(Date.now());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo emitir el QR.");
    } finally { setBusy(false); }
  }

  async function revoke() {
    if (!activeIssued) return;
    setBusy(true);
    setError("");
    try {
      await exhibitorApi.revokeQr(activeIssued.qrId);
      setIssued(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo revocar el QR.");
    } finally { setBusy(false); }
  }

  return (
    <ExhibitorState>
      <PanelPageHeader eyebrow="Mi stand · QR" title="QR de check-in" description="Emite un código real del servidor para que los visitantes registren su visita a tu stand." demo={false} />
      {stand && <div className="space-y-5">
        <div className="pixel-card flex flex-wrap items-center justify-between gap-4 p-5">
          <div><h2 className="font-black">Escanear el QR de un visitante</h2><p className="text-sm text-slate-600">Usa la cámara para registrar un check-in con el QR personal del visitante.</p></div>
          <Link href={adminRoutes.scan(stand.id)} className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-4 py-2 text-sm font-black"><ScanLine className="h-4 w-4" />Abrir escáner</Link>
        </div>
        <div className="pixel-card max-w-2xl space-y-4 p-5">
          <h2 className="font-black">Emitir QR del stand</h2>
          <label className="block text-sm font-bold">Duración
            <select value={ttl} onChange={(event) => setTtl(Number(event.target.value))} className="ml-3 rounded-lg border-2 border-slate-300 bg-white p-2">
              <option value={30}>30 segundos</option><option value={60}>1 minuto</option><option value={120}>2 minutos</option><option value={300}>5 minutos</option>
            </select>
          </label>
          <label className="block text-sm font-bold">Máximo de escaneos
            <select value={maxScans} onChange={(event) => setMaxScans(Number(event.target.value))} className="ml-3 rounded-lg border-2 border-slate-300 bg-white p-2">
              <option value={1}>1</option><option value={5}>5</option><option value={10}>10</option><option value={100}>100</option>
            </select>
          </label>
          <button type="button" onClick={() => void generate()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-4 py-2 text-sm font-black text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}Generar QR</button>
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {activeIssued && secondsLeft > 0 && <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="inline-block rounded-xl border-2 border-[var(--expo-navy)] bg-white p-4"><QRCode value={activeIssued.token} size={220} /></div>
            <p role="status" className="text-sm font-bold">Expira en {secondsLeft} segundos. ID: {activeIssued.qrId}</p>
            <button type="button" onClick={() => void revoke()} disabled={busy} className="inline-flex items-center gap-2 text-sm font-bold text-rose-700 underline disabled:opacity-60"><ShieldOff className="h-4 w-4" />Revocar QR</button>
          </div>}
          {activeIssued && secondsLeft === 0 && <p role="status" className="text-sm text-slate-500">El último QR expiró. Puedes generar uno nuevo.</p>}
          <p className="text-xs text-slate-500">El servidor entrega el token una sola vez. Al salir o recargar esta página, el código deja de mostrarse; los QR anteriores conservan su vencimiento y límite en el servidor.</p>
        </div>
      </div>}
    </ExhibitorState>
  );
}
