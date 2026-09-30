"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "react-qr-code";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  Maximize2,
  QrCode,
  RefreshCw,
  ShieldOff,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { usePanelStore } from "@/store/panel-store";
import type { QrToken } from "@/types/panel";
import { PanelPageHeader } from "./panel-page-header";

// ─── Constantes de configuración ─────────────────────────────────────────────

const TTL_OPTIONS = [
  { value: 30, label: "30 seg" },
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 300, label: "5 min" },
] as const;

const SCAN_OPTIONS = [
  { value: 1, label: "1 escaneo" },
  { value: 5, label: "5 escaneos" },
  { value: 10, label: "10 escaneos" },
  { value: 0, label: "Sin límite" },
] as const;

const STATUS_CONFIG = {
  active: {
    label: "Activo",
    className: "border-[var(--expo-green)] bg-[var(--expo-green)]/15 text-[var(--expo-green)]",
  },
  expired: {
    label: "Expirado",
    className: "border-slate-300 bg-slate-100 text-slate-500",
  },
  revoked: {
    label: "Revocado",
    className: "border-[var(--expo-coral)] bg-[var(--expo-coral)]/15 text-[var(--expo-coral)]",
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQrValue(standId: string, qrId: string): string {
  return `EXPOVIA:CHECKIN:${standId}:${qrId}`;
}

function getSecondsLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Sub-componente: Countdown ring ──────────────────────────────────────────

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? seconds / total : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const color =
    progress > 0.5
      ? "var(--expo-green)"
      : progress > 0.2
        ? "var(--expo-yellow)"
        : "var(--expo-coral)";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        {/* Track */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="var(--expo-line)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.5s" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-black text-[var(--expo-navy)] tabular-nums">
          {formatCountdown(seconds)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">restante</span>
      </div>
    </div>
  );
}

// ─── Sub-componente: QR activo ────────────────────────────────────────────────

function ActiveQrCard({
  token,
  onRevoke,
  onExpired,
}: {
  token: QrToken;
  onRevoke: () => void;
  onExpired: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(token.expiresAt));
  const [copied, setCopied] = useState(false);
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const expiredRef = useRef(false);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const qrValue = buildQrValue(token.standId, token.id);

  useEffect(() => {
    if (token.status !== "active") return;
    const interval = setInterval(() => {
      const left = getSecondsLeft(token.expiresAt);
      setSecondsLeft(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpired();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [token.expiresAt, token.status, onExpired]);

  useEffect(() => {
    if (!isQrExpanded) return;

    const previousOverflow = document.body.style.overflow;
    const expandButton = expandButtonRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsQrExpanded(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      expandButton?.focus();
    };
  }, [isQrExpanded]);

  function handleCopy() {
    navigator.clipboard.writeText(qrValue).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isExpired = token.status === "expired" || secondsLeft === 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="pixel-card overflow-hidden"
      >
      {/* Header de la card */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-[var(--expo-line)] bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <QrCode size={18} className="text-[var(--expo-blue)]" />
          <span className="font-black text-[var(--expo-navy)]">QR activo</span>
          <span className="font-mono text-xs font-bold text-slate-400">#{token.id}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${
            isExpired ? STATUS_CONFIG.expired.className : STATUS_CONFIG.active.className
          }`}
        >
          {isExpired ? "Expirado" : "Activo"}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
        {/* QR code */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div
            className={`relative rounded-2xl border-4 p-4 transition-all ${
              isExpired
                ? "border-slate-200 opacity-40 grayscale"
                : "border-[var(--expo-navy)] shadow-[6px_6px_0_var(--expo-navy)]"
            }`}
            aria-label={`Código QR para check-in en stand ${token.standId}`}
          >
            <QRCode
              value={qrValue}
              size={200}
              bgColor="#ffffff"
              fgColor="#2f2d4c"
              level="H"
            />
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
                <span className="rounded-xl border-2 border-slate-300 bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500">
                  Expirado
                </span>
              </div>
            )}
          </div>
          <button
            ref={expandButtonRef}
            type="button"
            onClick={() => setIsQrExpanded(true)}
            className="flex size-8 items-center justify-center rounded-lg border border-[var(--expo-line)] bg-white text-[var(--expo-navy)] transition-colors hover:bg-[var(--expo-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--expo-blue)]"
            aria-label="Ampliar QR"
            title="Ampliar QR"
          >
            <Maximize2 size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Info y acciones */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Countdown */}
          {!isExpired && (
            <div className="flex items-center gap-4">
              <CountdownRing seconds={secondsLeft} total={token.ttl} />
              <div>
                <p className="pixel-label text-slate-500">TTL configurado</p>
                <p className="mt-0.5 font-black text-[var(--expo-navy)]">
                  {token.ttl < 60 ? `${token.ttl}s` : `${token.ttl / 60} min`}
                </p>
              </div>
            </div>
          )}

          {/* Parámetros */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-[var(--expo-line)] p-3">
              <p className="pixel-label text-slate-400">Escaneos</p>
              <p className="mt-0.5 text-lg font-black text-[var(--expo-navy)]">
                {token.scansUsed}
                <span className="text-sm font-bold text-slate-400">
                  {token.maxScans === 0 ? " / ∞" : ` / ${token.maxScans}`}
                </span>
              </p>
            </div>
            <div className="rounded-xl border-2 border-[var(--expo-line)] p-3">
              <p className="pixel-label text-slate-400">Generado</p>
              <p className="mt-0.5 text-sm font-bold text-[var(--expo-navy)]">
                {formatTime(token.createdAt)}
              </p>
            </div>
          </div>

          {/* Valor del QR */}
          <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--expo-line)] bg-[var(--expo-bg)] px-3 py-2">
            <code className="flex-1 truncate text-[11px] font-mono text-slate-500">{qrValue}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-lg border border-[var(--expo-line)] bg-white p-1.5 hover:bg-slate-50"
              aria-label="Copiar valor del QR"
            >
              {copied ? (
                <CheckCircle2 size={14} className="text-[var(--expo-green)]" />
              ) : (
                <ClipboardCopy size={14} className="text-slate-400" />
              )}
            </button>
          </div>

          {/* Revocar */}
          {!isExpired && (
            <button
              type="button"
              onClick={onRevoke}
              className="flex items-center gap-2 self-start rounded-xl border-2 border-[var(--expo-coral)] bg-white px-4 py-2 text-sm font-black text-[var(--expo-coral)] shadow-[2px_2px_0_var(--expo-coral)] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldOff size={15} />
              Revocar QR
            </button>
          )}
        </div>
      </div>
      </motion.div>
      {isQrExpanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsQrExpanded(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`expanded-qr-title-${token.id}`}
              className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col items-center gap-4 overflow-y-auto rounded-2xl border-4 border-[var(--expo-navy)] bg-white p-5 shadow-[8px_8px_0_var(--expo-navy)] sm:p-7"
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsQrExpanded(false)}
                className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg border border-[var(--expo-line)] bg-white text-[var(--expo-navy)] transition-colors hover:bg-[var(--expo-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--expo-blue)]"
                aria-label="Cerrar QR ampliado"
                title="Cerrar"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <h2
                id={`expanded-qr-title-${token.id}`}
                className="pr-10 text-center font-black text-[var(--expo-navy)]"
              >
                QR de check-in · #{token.id}
              </h2>
              <div
                className={`relative rounded-xl border-4 border-[var(--expo-navy)] bg-white p-3 shadow-[4px_4px_0_var(--expo-navy)] ${
                  isExpired ? "opacity-40 grayscale" : ""
                }`}
              >
                <QRCode
                  value={qrValue}
                  size={420}
                  className="block h-auto w-[min(74vw,420px)]"
                  bgColor="#ffffff"
                  fgColor="#2f2d4c"
                  level="H"
                />
                {isExpired && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                    <span className="rounded-xl border-2 border-slate-300 bg-white px-3 py-1 text-xs font-black uppercase text-slate-500">
                      Expirado
                    </span>
                  </div>
                )}
              </div>
              <p className="text-center text-sm font-bold text-slate-500">
                {isExpired ? "Este código QR expiró" : `Expira en ${formatCountdown(secondsLeft)}`}
              </p>
            </motion.div>
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Sub-componente: Historial ────────────────────────────────────────────────

function QrHistoryTable({ tokens }: { tokens: QrToken[] }) {
  if (tokens.length === 0) return null;

  return (
    <div className="pixel-card overflow-hidden">
      <div className="border-b-2 border-[var(--expo-line)] px-5 py-3">
        <p className="font-black text-[var(--expo-navy)]">Historial de QRs</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--expo-line)] bg-[var(--expo-bg)]">
              {["ID", "TTL", "Escaneos", "Creado", "Estado"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-wide text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => {
              const cfg = STATUS_CONFIG[t.status];
              return (
                <tr key={t.id} className="border-b border-[var(--expo-line)] last:border-0 hover:bg-[var(--expo-bg)]">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--expo-navy)]">#{t.id}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.ttl < 60 ? `${t.ttl}s` : `${t.ttl / 60} min`}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.scansUsed} / {t.maxScans === 0 ? "∞" : t.maxScans}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {formatTime(t.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function QrStandView() {
  const hasHydrated = usePanelStore((s) => s.hasHydrated);
  const activeCompanyId = usePanelStore((s) => s.activeCompanyId);
  const qrTokens = usePanelStore((s) => s.qrTokens);
  const generateQr = usePanelStore((s) => s.generateQr);
  const revokeQr = usePanelStore((s) => s.revokeQr);
  const expireQr = usePanelStore((s) => s.expireQr);

  const [selectedTtl, setSelectedTtl] = useState<number>(60);
  const [selectedMaxScans, setSelectedMaxScans] = useState<number>(10);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  // Tokens del stand activo
  const standTokens = qrTokens.filter((t) => t.standId === activeCompanyId);
  const activeToken = standTokens.find((t) => t.status === "active") ?? null;

  const handleGenerate = useCallback(() => {
    generateQr(activeCompanyId, selectedTtl, selectedMaxScans);
  }, [activeCompanyId, selectedTtl, selectedMaxScans, generateQr]);

  const handleRevoke = useCallback((qrId: string) => {
    revokeQr(qrId);
    setRevokeConfirm(null);
  }, [revokeQr]);

  const handleExpired = useCallback((qrId: string) => {
    expireQr(qrId);
  }, [expireQr]);

  if (!hasHydrated) return null;

  return (
    <>
      <PanelPageHeader
        eyebrow="Mi stand · QR"
        title="Códigos QR de validación"
        description="Genera QR de check-in para visitantes. Cada código tiene un tiempo de vida y límite de escaneos configurable."
      />

      <div className="flex flex-col gap-6">

        {/* Panel de generación */}
        <div className="pixel-card flex flex-col gap-5 p-5">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[var(--expo-yellow)]" />
            <h2 className="font-black text-[var(--expo-navy)]">Generar nuevo QR</h2>
          </div>

          {/* TTL selector */}
          <div>
            <p className="pixel-label mb-2 text-slate-500">Tiempo de vida (TTL)</p>
            <div className="flex flex-wrap gap-2">
              {TTL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTtl(opt.value)}
                  className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-black transition-all ${
                    selectedTtl === opt.value
                      ? "border-[var(--expo-blue)] bg-[var(--expo-blue)] text-white shadow-[2px_2px_0_var(--expo-navy)]"
                      : "border-[var(--expo-line)] bg-white text-[var(--expo-navy)] hover:border-[var(--expo-blue)]"
                  }`}
                >
                  <Clock size={13} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max scans selector */}
          <div>
            <p className="pixel-label mb-2 text-slate-500">Límite de escaneos</p>
            <div className="flex flex-wrap gap-2">
              {SCAN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedMaxScans(opt.value)}
                  className={`rounded-xl border-2 px-3 py-2 text-sm font-black transition-all ${
                    selectedMaxScans === opt.value
                      ? "border-[var(--expo-purple)] bg-[var(--expo-purple)] text-white shadow-[2px_2px_0_var(--expo-navy)]"
                      : "border-[var(--expo-line)] bg-white text-[var(--expo-navy)] hover:border-[var(--expo-purple)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advertencia si ya hay QR activo */}
          <AnimatePresence>
            {activeToken && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 rounded-xl border-2 border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/15 p-3 text-sm font-bold text-[var(--expo-navy)]"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--expo-yellow)]" />
                <span>
                  Ya tienes un QR activo <span className="font-mono">#{activeToken.id}</span>.
                  Genera uno nuevo para reemplazarlo (el anterior se marcará como expirado).
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón generar */}
          <button
            type="button"
            onClick={handleGenerate}
            className="flex w-fit items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-5 py-3 font-black text-white shadow-[4px_4px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--expo-navy)]"
          >
            <QrCode size={18} />
            Generar QR
          </button>
        </div>

        {/* QR activo */}
        <AnimatePresence mode="wait">
          {activeToken && (
            <div key={activeToken.id}>
              {/* Confirm revocar */}
              <AnimatePresence>
                {revokeConfirm === activeToken.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border-2 border-[var(--expo-coral)] bg-[var(--expo-coral)]/10 p-4"
                  >
                    <p className="flex-1 text-sm font-bold text-[var(--expo-navy)]">
                      ¿Confirmas que deseas revocar el QR <span className="font-mono">#{activeToken.id}</span>?
                      Los visitantes ya no podrán usarlo.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRevokeConfirm(null)}
                        className="rounded-xl border-2 border-slate-300 bg-white px-3 py-1.5 text-sm font-black text-slate-600 hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(activeToken.id)}
                        className="flex items-center gap-1.5 rounded-xl border-2 border-[var(--expo-coral)] bg-[var(--expo-coral)] px-3 py-1.5 text-sm font-black text-white shadow-[2px_2px_0_var(--expo-navy)]"
                      >
                        <ShieldOff size={14} />
                        Sí, revocar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <ActiveQrCard
                token={activeToken}
                onRevoke={() => setRevokeConfirm(activeToken.id)}
                onExpired={() => handleExpired(activeToken.id)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Estado vacío cuando no hay QR activo ni historial */}
        {!activeToken && standTokens.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[var(--expo-line)] bg-white py-14 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-sky)] shadow-[4px_4px_0_var(--expo-navy)]">
              <QrCode size={30} className="text-[var(--expo-navy)]" />
            </span>
            <p className="mt-4 font-black text-[var(--expo-navy)]">Sin QR generados aún</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Configura los parámetros arriba y presiona <strong>Generar QR</strong> para crear el primer código.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className="mt-5 flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-5 py-2.5 font-black text-white shadow-[3px_3px_0_var(--expo-navy)] hover:-translate-y-0.5 transition-all"
            >
              <RefreshCw size={15} />
              Generar primer QR
            </button>
          </div>
        )}

        {/* Historial */}
        <QrHistoryTable tokens={standTokens} />
      </div>
    </>
  );
}
