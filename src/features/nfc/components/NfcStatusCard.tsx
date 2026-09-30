"use client";

import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  MapPin,
  RefreshCw,
} from "lucide-react";
import type { NfcStage, Stand } from "@/types/demo";
import type { MissionProgress } from "@/lib/demo-domain";
import { DEMO_FIXTURE } from "@/data/demo-fixture";

interface NfcStatusCardProps {
  stage: NfcStage;
  targetStand: Stand | undefined;
  totalPoints: number;
  missionTitle?: string;
  missionProgress?: MissionProgress;
  confirmationRequested: boolean;
  onStart: () => void;
  onContinue: () => void;
  onConfirm: () => void;
  onNavigateProgress: () => void;
  onNavigateMissions: () => void;
  onReturnToStand: () => void;
  onRetry: () => void;
  onScanAnother: () => void;
  onSimulateError?: () => void;
}

export function NfcStatusCard({
  stage,
  targetStand,
  totalPoints,
  missionTitle,
  missionProgress,
  confirmationRequested,
  onStart,
  onContinue,
  onConfirm,
  onNavigateProgress,
  onNavigateMissions,
  onReturnToStand,
  onRetry,
  onScanAnother,
  onSimulateError,
}: NfcStatusCardProps) {
  switch (stage) {
    // ── idle ──────────────────────────────────────────────────────────────────
    case "idle":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full border border-[var(--expo-blue)] bg-sky-50 px-3 py-1 text-xs font-bold text-[var(--expo-navy)]">Datos de demostración</span>
          <p className="text-slate-600 leading-6 max-w-xs">
            Acerca el teléfono a la etiqueta NFC del stand para registrar tu
            visita y ganar{" "}
            <span className="font-bold text-[var(--expo-blue)]">{DEMO_FIXTURE.points.perNewVisit} puntos</span>.
          </p>
          <button
            onClick={onStart}
            className="nfc-btn-primary"
            style={{ minHeight: 44 }}
          >
            Iniciar simulación
          </button>
          {onSimulateError && (
            <button
              onClick={onSimulateError}
              className="text-xs text-slate-400 underline mt-1"
              style={{ minHeight: 44 }}
            >
              Simular error
            </button>
          )}
        </div>
      );

    // ── searching ─────────────────────────────────────────────────────────────
    case "searching":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-semibold text-[var(--expo-navy)]">
            Acerca tu teléfono a la etiqueta
          </p>
          <p className="text-sm text-slate-500">
            Buscando señal NFC&hellip;
          </p>
        </div>
      );

    // ── detected ──────────────────────────────────────────────────────────────
    case "detected":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-[var(--expo-green)]">
            <MapPin size={18} />
            <span className="font-bold text-sm uppercase tracking-wide">
              Stand detectado
            </span>
          </div>
          {targetStand && (
            <div className="rounded-xl border-2 border-[var(--expo-line)] bg-white px-6 py-4 w-full max-w-xs">
              <Image
                className="mx-auto mb-3"
                src="/assets/nfc/nfc-tag.svg"
                alt=""
                width={80}
                height={56}
              />
              <p className="font-black text-lg text-[var(--expo-navy)]">
                {targetStand.name}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {targetStand.block ? `Bloque ${targetStand.block} · ` : ""}{targetStand.boothCode}
              </p>
              <p className="text-sm text-slate-600 mt-2 leading-5">
                {targetStand.description}
              </p>
            </div>
          )}
          <button
            onClick={onContinue}
            className="nfc-btn-primary"
            style={{ minHeight: 44 }}
          >
            Continuar
          </button>
        </div>
      );

    // ── confirming ────────────────────────────────────────────────────────────
    case "confirming":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-semibold text-[var(--expo-navy)]">
            {confirmationRequested
              ? "Registrando visita…"
              : "Confirma que deseas registrar esta visita"}
          </p>
          {!confirmationRequested && targetStand && (
            <p className="text-sm text-slate-500">
              {targetStand.name} · {targetStand.boothCode}
            </p>
          )}
          <button
            disabled={confirmationRequested}
            onClick={onConfirm}
            className={`nfc-btn-primary ${
              confirmationRequested ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ minHeight: 44 }}
          >
            {confirmationRequested ? "Confirmando…" : "Confirmar visita"}
          </button>
        </div>
      );

    // ── success ───────────────────────────────────────────────────────────────
    case "success":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full border border-[var(--expo-blue)] bg-sky-50 px-3 py-1 text-xs font-bold text-[var(--expo-navy)]">Datos de demostración</span>
          <Image
            src="/assets/nfc/visit-success.svg"
            alt=""
            width={72}
            height={72}
          />
          <div>
            <p className="text-3xl font-black text-[var(--expo-navy)]">
              +{DEMO_FIXTURE.points.perNewVisit} puntos
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Total: <span className="font-bold">{totalPoints}</span> puntos
            </p>
          </div>
          {targetStand && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--expo-green)] font-medium">
              <CheckCircle2 size={14} aria-hidden="true" />
              {targetStand.name} registrado
            </p>
          )}
          {missionTitle && missionProgress && (
            <div className="w-full rounded-xl border border-[var(--expo-line)] bg-white p-3 text-left">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-[var(--expo-navy)]">
                  {missionTitle}
                </span>
                <span className="font-mono font-bold text-[var(--expo-purple)]">
                  {missionProgress.visited}/{missionProgress.required}
                </span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--expo-line)]"
                role="progressbar"
                aria-label={`Progreso de ${missionTitle}`}
                aria-valuemin={0}
                aria-valuemax={missionProgress.required}
                aria-valuenow={missionProgress.visited}
              >
                <div
                  className="h-full rounded-full bg-[var(--expo-purple)] transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (missionProgress.visited / missionProgress.required) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
          <button
            onClick={onNavigateProgress}
            className="nfc-btn-primary"
            style={{ minHeight: 44 }}
          >
            Ver progreso
          </button>
          <button
            onClick={onReturnToStand}
            className="nfc-btn-secondary"
            style={{ minHeight: 44 }}
          >
            Volver al stand
          </button>
        </div>
      );

    // ── duplicate ─────────────────────────────────────────────────────────────
    case "duplicate":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full border border-[var(--expo-blue)] bg-sky-50 px-3 py-1 text-xs font-bold text-[var(--expo-navy)]">Datos de demostración</span>
          <Copy size={40} className="text-[var(--expo-yellow)]" strokeWidth={1.5} />
          <div>
            <p className="font-bold text-[var(--expo-navy)] text-lg">
              Ya registraste este stand
            </p>
            <p className="text-sm text-slate-500 mt-1">
              No se suman puntos por una visita repetida.
            </p>
          </div>
          <button
            onClick={onNavigateMissions}
            className="nfc-btn-primary"
            style={{ minHeight: 44 }}
          >
            Ver otra misión
          </button>
          <button
            onClick={onScanAnother}
            className="nfc-btn-secondary"
            style={{ minHeight: 44 }}
          >
            Escanear otro stand
          </button>
        </div>
      );

    // ── error ─────────────────────────────────────────────────────────────────
    case "error":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle
            size={40}
            className="text-[var(--expo-coral)]"
            strokeWidth={1.5}
          />
          <div>
            <p className="font-bold text-[var(--expo-navy)] text-lg">
              No se pudo escanear
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Revisa que estés cerca de la etiqueta NFC del stand.
            </p>
          </div>
          <button
            onClick={onRetry}
            className="nfc-btn-primary flex items-center gap-2"
            style={{ minHeight: 44 }}
          >
            <RefreshCw size={16} />
            Intentar de nuevo
          </button>
        </div>
      );

    default:
      return null;
  }
}
