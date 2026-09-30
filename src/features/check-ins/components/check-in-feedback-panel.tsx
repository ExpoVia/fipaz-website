import { clsx } from "clsx";
import { CircleCheck, Clock3, ScanLine, TriangleAlert, UserRound } from "lucide-react";

import { formatPoints, formatTime } from "@/lib/format";
import type { ScanFeedback } from "../hooks/use-check-in-scanner";

interface CheckInFeedbackPanelProps {
  feedback: ScanFeedback | null;
}

const TONE_STYLES = {
  success: "border-emerald-700 bg-emerald-50 text-emerald-900",
  duplicate: "border-amber-700 bg-amber-50 text-amber-900",
  error: "border-rose-700 bg-rose-50 text-rose-900",
} as const;

function VisitorAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (photoUrl) {
    return (
      // Foto de visitante servida por el backend: sin dominio fijo, no vale la pena configurar next/image.
      // eslint-disable-next-line @next/next/no-img-element -- ver comentario anterior.
      <img
        src={photoUrl}
        alt={name}
        className="h-14 w-14 shrink-0 rounded-full border-2 border-current object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-current bg-white/60"
    >
      <UserRound className="h-7 w-7" />
    </span>
  );
}

/** Resultado del último escaneo: éxito (+puntos), duplicado (amigable) o error. */
export function CheckInFeedbackPanel({ feedback }: CheckInFeedbackPanelProps) {
  if (!feedback) {
    return (
      <div role="status" className="pixel-card flex min-h-[168px] flex-col items-center justify-center gap-2 p-6 text-center">
        <ScanLine aria-hidden="true" className="h-8 w-8 text-[var(--expo-blue)]" />
        <p className="text-sm font-bold text-slate-600">Apunta la cámara al código QR del visitante.</p>
      </div>
    );
  }

  if (feedback.kind === "error") {
    return (
      <div role="alert" className={clsx("flex min-h-[168px] flex-col gap-2 rounded-2xl border-2 p-5", TONE_STYLES.error)}>
        <div className="flex items-center gap-2 font-black">
          <TriangleAlert aria-hidden="true" className="h-5 w-5 shrink-0" />
          No se pudo registrar
        </div>
        <p className="text-sm font-medium">{feedback.message}</p>
      </div>
    );
  }

  const { checkIn } = feedback;
  const isDuplicate = feedback.kind === "duplicate";

  return (
    <div
      role="status"
      className={clsx("flex min-h-[168px] flex-col gap-3 rounded-2xl border-2 p-5", TONE_STYLES[isDuplicate ? "duplicate" : "success"])}
    >
      <div className="flex items-center gap-2 font-black">
        {isDuplicate ? (
          <Clock3 aria-hidden="true" className="h-5 w-5 shrink-0" />
        ) : (
          <CircleCheck aria-hidden="true" className="h-5 w-5 shrink-0" />
        )}
        {isDuplicate ? "Ya hizo check-in hoy" : "Check-in registrado"}
      </div>

      <div className="flex items-center gap-3">
        <VisitorAvatar name={checkIn.participantName} photoUrl={checkIn.participantPhotoUrl} />
        <div className="min-w-0">
          <p className="truncate text-lg font-black">{checkIn.participantName}</p>
          <p className="text-xs font-bold opacity-80">{formatTime(checkIn.checkedInAt)}</p>
        </div>
      </div>

      {isDuplicate ? (
        <p className="text-sm font-medium">Este visitante ya sumó sus puntos hoy en este stand.</p>
      ) : (
        <p className="text-2xl font-black">+{formatPoints(checkIn.pointsAwarded)}</p>
      )}
    </div>
  );
}
