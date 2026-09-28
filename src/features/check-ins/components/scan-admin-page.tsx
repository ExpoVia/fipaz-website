"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Camera, Loader2, RefreshCw, ScanLine, Users } from "lucide-react";

import { AdminPageHeader, Button, TextField } from "@/components/admin";
import { MetricCard } from "@/components/panel/metric-card";
import { adminRoutes } from "@/config/admin-routes";
import { useCheckInScanner } from "../hooks/use-check-in-scanner";
import { useQrScanner } from "../hooks/use-qr-scanner";
import { CheckInFeedbackPanel } from "./check-in-feedback-panel";

interface ScanAdminPageProps {
  standId: string;
  standName: string;
}

/** `/admin/stands/:standId/scan`: cámara del operador + registro continuo de check-ins por QR. */
export function ScanAdminPage({ standId, standName }: ScanAdminPageProps) {
  const { feedback, isProcessing, stats, handleDecode, submitManualCode } = useCheckInScanner(standId);
  const { videoRef, status, errorMessage, restart } = useQrScanner({ onDecode: handleDecode });

  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manualValue.trim()) return;
    submitManualCode(manualValue);
    setManualValue("");
  }

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Administración", href: adminRoutes.home() },
          { label: standName },
          { label: "Escáner QR" },
        ]}
        title="Escáner de check-in"
        description={`Escanea el QR que cada visitante muestra en su app para confirmar su presencia en ${standName}.`}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-[var(--expo-navy)] bg-slate-950 sm:aspect-video">
          <video ref={videoRef} muted playsInline autoPlay className="h-full w-full object-cover" />

          {status === "scanning" && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center p-10">
              <div className="aspect-square w-full max-w-72 rounded-2xl border-4 border-white/80 shadow-[0_0_0_2000px_rgb(0_0_0/35%)]" />
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-[var(--expo-navy)]/90 py-2 text-sm font-black text-white">
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              Verificando…
            </div>
          )}

          {status === "starting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
              <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin" />
              <p className="text-sm font-bold">Activando la cámara…</p>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-white">
              <Camera aria-hidden="true" className="h-8 w-8" />
              <p className="max-w-xs text-sm font-bold">{errorMessage}</p>
              <Button
                variant="secondary"
                onClick={restart}
                leadingIcon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                Reintentar
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <MetricCard
            label="Check-ins de la sesión"
            value={String(stats.registered)}
            icon={Users}
            hint={stats.duplicates > 0 ? `${stats.duplicates} repetidos` : "Nadie repetido todavía"}
          />

          <CheckInFeedbackPanel feedback={feedback} />

          <div className="pixel-card p-3">
            <button
              type="button"
              onClick={() => setManualOpen((open) => !open)}
              aria-expanded={manualOpen}
              className="flex w-full items-center gap-2 text-left text-xs font-bold text-[var(--expo-blue)]"
            >
              <ScanLine aria-hidden="true" className="h-4 w-4 shrink-0" />
              ¿No puedes escanear? Ingresa el código manualmente
            </button>

            {manualOpen && (
              <form onSubmit={handleManualSubmit} className="mt-3 flex items-end gap-2">
                <div className="flex-1">
                  <TextField
                    id="manual-credential"
                    label="Código del visitante"
                    value={manualValue}
                    onChange={(event) => setManualValue(event.target.value)}
                    placeholder="Ej. FIPAZ-VISITANTE-4821"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" disabled={isProcessing || !manualValue.trim()}>
                  Registrar
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
