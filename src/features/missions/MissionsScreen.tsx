"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Transition } from "motion/react";
import {
  ChevronDown,
  MapPin,
  CheckCircle2,
  Lock,
  Camera,
  Share2,
  Gift,
  Wifi,
  Cpu,
  Map,
  UtensilsCrossed,
  CalendarCheck,
  Banknote,
  Rocket,
  Trophy,
  ScanLine,
  TrendingUp,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import { MISSIONS, getMissionById, STAND_NAMES } from "@/data/missions";
import { useDemoStore } from "@/store/demo-store";
import { CategoryBadge } from "@/components/pixel/CategoryBadge";
import { ProgressBar } from "@/components/pixel/ProgressBar";
import { PointsPill } from "@/components/pixel/PointsPill";
import type { Mission } from "@/lib/types";

// ─── Pixel-art styled icon wrapper ─────────────────────────────────────────
// Supports either a Lucide icon or a floating PNG image

interface PixelIconProps {
  icon: LucideIcon;
  bg: string;
  color: string;
  size?: number;
  locked?: boolean;
  imageSrc?: string;
  imageAlt?: string;
}

function PixelIcon({ icon: Icon, bg, color, size = 20, locked = false, imageSrc, imageAlt = "" }: PixelIconProps) {
  return (
    <span
      className={`relative flex size-11 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] ${locked ? "bg-slate-100" : imageSrc ? "bg-white/60" : bg} shadow-[2px_2px_0_var(--expo-navy)] overflow-hidden`}
      aria-hidden="true"
    >
      {locked ? (
        <Lock size={18} className="text-slate-400" strokeWidth={2.5} />
      ) : imageSrc ? (
        <motion.span
          className="relative flex size-8 shrink-0"
          animate={{ y: [0, -3, 0] }}
          transition={missionFloatTransition}
        >
          <Image src={imageSrc} alt={imageAlt} fill className="object-contain drop-shadow-sm" sizes="32px" />
        </motion.span>
      ) : (
        <Icon size={size} className={color} strokeWidth={2.5} />
      )}
    </span>
  );
}

// Mission icon config — maps each mission id to a Lucide icon + colors
const MISSION_ICONS: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  "primer-contacto":    { icon: Wifi,           bg: "bg-sky-100",    color: "text-[var(--expo-blue)]" },
  "ruta-tecnologica":   { icon: Cpu,            bg: "bg-blue-100",   color: "text-[var(--expo-blue)]" },
  "explorador-expovia": { icon: Map,            bg: "bg-green-100",  color: "text-[var(--expo-green)]" },
  "sabores-feria":      { icon: UtensilsCrossed, bg: "bg-orange-100", color: "text-[var(--expo-coral)]" },
  "agenda-activa":      { icon: CalendarCheck,  bg: "bg-yellow-100", color: "text-yellow-700" },
  "red-finanzas":       { icon: Banknote,       bg: "bg-yellow-50",  color: "text-yellow-700" },
  "embajador-expovia":  { icon: Share2,         bg: "bg-purple-100", color: "text-[var(--expo-purple)]" },
  "selfie-stand":       { icon: Camera,         bg: "bg-pink-100",   color: "text-[var(--expo-pink)]" },
  "maestro-mapa":       { icon: MapPin,         bg: "bg-teal-100",   color: "text-[var(--expo-mint)]" },
  "ruta-startups":      { icon: Rocket,         bg: "bg-green-50",   color: "text-[var(--expo-green)]" },
};

function getMissionIcon(missionId: string) {
  return MISSION_ICONS[missionId] ?? { icon: Trophy, bg: "bg-slate-100", color: "text-slate-600" };
}

// PNG assets for missions that have a matching image in /assets/missions/
const MISSION_IMAGES: Record<string, string> = {
  // Misiones con imagen propia
  "primer-contacto":    "/assets/missions/stand.png",
  "explorador-expovia": "/assets/missions/mapa.png",
  "sabores-feria":      "/assets/missions/food.png",
  "agenda-activa":      "/assets/missions/education.png",
  "red-finanzas":       "/assets/missions/money.png",
  "embajador-expovia":  "/assets/missions/redes-sociales.png",
  "selfie-stand":       "/assets/missions/camara.png",
  "maestro-mapa":       "/assets/missions/ubicacion.png",
  "ruta-tecnologica":   "/assets/missions/startup.png",
  "ruta-startups":      "/assets/missions/startup.png",
};

// Floating (levitating) animation shared across mission images
const missionFloatTransition: Transition = {
  duration: 2.6,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
};

// ─── NFC Simulation Overlay ────────────────────────────────────────────────
// Triggered per-stand from the mission expanded view

interface NfcSimOverlayProps {
  standId: string;
  standName: string;
  onDone: () => void;
}

function NfcSimOverlay({ standId, standName, onDone }: NfcSimOverlayProps) {
  const [stage, setStage] = useState<"scanning" | "detected" | "success">("scanning");
  const { visitStand, points } = useDemoStore();

  useEffect(() => {
    const t1 = setTimeout(() => setStage("detected"), 1400);
    const t2 = setTimeout(() => {
      visitStand(standId, standName);
      setStage("success");
    }, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--expo-navy)]/90 p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">

        {/* ── Scanning ── */}
        {stage === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            {/* NFC rings */}
            <div className="relative flex size-36 items-center justify-center">
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full border-2 border-[var(--expo-sky)]"
                  initial={{ width: 48, height: 48, opacity: 0.9 }}
                  animate={{ width: 48 + i * 28, height: 48 + i * 28, opacity: 0 }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.35,
                    ease: "easeOut",
                  }}
                />
              ))}
              <span className="relative flex size-14 items-center justify-center rounded-xl border-2 border-white/30 bg-[var(--expo-blue)] shadow-[4px_4px_0_rgba(0,0,0,0.4)]">
                <ScanLine size={28} className="text-white" strokeWidth={2} aria-hidden="true" />
              </span>
            </div>
            <div>
              <p className="text-lg font-black text-white">Buscando etiqueta NFC</p>
              <p className="mt-1 text-sm text-white/50">Simulación de demo · sin hardware real</p>
            </div>
          </motion.div>
        )}

        {/* ── Detected ── */}
        {stage === "detected" && (
          <motion.div
            key="detected"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.span
              className="flex size-16 items-center justify-center rounded-xl border-2 border-white/30 bg-[var(--expo-sky)] shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.4 }}
            >
              <ScanLine size={32} className="text-white" strokeWidth={2} aria-hidden="true" />
            </motion.span>
            <div>
              <p className="text-sm font-bold text-[var(--expo-sky)] uppercase tracking-widest">Etiqueta detectada</p>
              <p className="mt-1 text-xl font-black text-white">{standName}</p>
            </div>
          </motion.div>
        )}

        {/* ── Success ── */}
        {stage === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex flex-col items-center gap-5"
          >
            <span className="flex size-20 items-center justify-center rounded-2xl border-2 border-[var(--expo-green)] bg-[var(--expo-green)]/20 shadow-[4px_4px_0_var(--expo-green)]">
              <CheckCircle2 size={40} className="text-[var(--expo-green)]" strokeWidth={2.5} aria-hidden="true" />
            </span>

            <div>
              <p className="text-2xl font-black text-white">Visita registrada</p>
              <p className="mt-1 text-sm text-white/60">{standName}</p>
            </div>

            {/* Points gained */}
            <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/20 px-4 py-2">
              <TrendingUp size={16} className="text-[var(--expo-yellow)]" aria-hidden="true" />
              <span className="font-black text-[var(--expo-yellow)]">+50 puntos</span>
            </div>

            <PointsPill points={points + 50} size="lg" />

            <button
              onClick={onDone}
              className="mt-2 rounded-2xl border-2 border-[var(--expo-blue)] bg-[var(--expo-blue)] px-8 py-3 font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition-transform active:scale-95"
            >
              Continuar recorrido
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

// ─── Selfie Overlay ─────────────────────────────────────────────────────────

function SelfieOverlay({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<"prompt" | "flash" | "done">("prompt");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {stage === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              {/* Viewfinder */}
              <div className="flex size-52 items-center justify-center rounded-2xl border-4 border-white/30 bg-[var(--expo-navy)]">
                <Camera size={56} className="text-white/30" aria-hidden="true" />
              </div>
              {/* Corner brackets pixel-style */}
              {[
                "top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
                "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
                "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
                "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
              ].map((cls, i) => (
                <span key={i} className={`absolute size-8 border-white ${cls}`} aria-hidden="true" />
              ))}
            </div>
            <div>
              <p className="text-lg font-black text-white">Colócate frente al stand</p>
              <p className="mt-1 text-sm text-white/50">Simulación · no accede a tu cámara real</p>
            </div>
            {/* Shutter button */}
            <button
              onClick={() => { setStage("flash"); setTimeout(() => setStage("done"), 650); }}
              className="flex size-16 items-center justify-center rounded-full border-4 border-white bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.25)] transition-transform active:scale-90"
              aria-label="Tomar foto simulada"
            >
              <Camera size={26} className="text-[var(--expo-navy)]" aria-hidden="true" />
            </button>
            <button onClick={onDone} className="text-sm text-white/40 underline">Cancelar</button>
          </motion.div>
        )}

        {stage === "flash" && (
          <motion.div
            key="flash"
            className="fixed inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.55 }}
          />
        )}

        {stage === "done" && (
          <motion.div
            key="done"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex flex-col items-center gap-5"
          >
            <span className="flex size-20 items-center justify-center rounded-2xl border-2 border-[var(--expo-green)] bg-[var(--expo-green)]/20 shadow-[4px_4px_0_var(--expo-green)]">
              <CheckCircle2 size={40} className="text-[var(--expo-green)]" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-black text-white">Foto registrada</p>
              <p className="mt-1 text-sm text-white/50">Demo conceptual · sin almacenamiento real</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/20 px-4 py-2">
              <TrendingUp size={16} className="text-[var(--expo-yellow)]" aria-hidden="true" />
              <span className="font-black text-[var(--expo-yellow)]">+75 puntos</span>
            </div>
            <button
              onClick={onDone}
              className="mt-2 rounded-2xl border-2 border-[var(--expo-blue)] bg-[var(--expo-blue)] px-8 py-3 font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition-transform active:scale-95"
            >
              Continuar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Share Overlay ──────────────────────────────────────────────────────────

function ShareOverlay({ points, onDone }: { points: number; onDone: () => void }) {
  const [shared, setShared] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 pb-6 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl border-2 border-[var(--expo-navy)] bg-white p-6 shadow-[5px_5px_0_var(--expo-navy)]"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
      >
        {!shared ? (
          <>
            <h2 className="text-center text-xl font-black text-[var(--expo-navy)]">
              Comparte tu pasaporte
            </h2>
            <p className="mt-1 text-center text-xs text-slate-500">
              Demo conceptual · los botones no abren redes reales
            </p>

            {/* Passport preview */}
            <div className="mt-4 rounded-xl border-2 border-[var(--expo-line)] bg-[var(--expo-bg)] p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] shadow-[2px_2px_0_var(--expo-navy)]">
                  <Map size={22} className="text-white" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-black text-[var(--expo-navy)]">Pasaporte ExpoVia</p>
                  <p className="text-xs text-slate-500">La Paz Expone 2026 · {points} pts</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {[Cpu, UtensilsCrossed, Banknote].map((Icon, i) => (
                  <span key={i} className="flex size-8 items-center justify-center rounded-lg border border-[var(--expo-line)] bg-white shadow-[1px_1px_0_var(--expo-line)]">
                    <Icon size={14} className="text-[var(--expo-navy)]" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                ))}
                <span className="flex size-8 items-center justify-center rounded-lg border border-[var(--expo-line)] bg-white text-xs text-slate-400 shadow-[1px_1px_0_var(--expo-line)]">
                  +
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { name: "WhatsApp",  color: "bg-green-500", Icon: Share2 },
                { name: "Instagram", color: "bg-pink-500",  Icon: Camera },
                { name: "Facebook",  color: "bg-blue-600",  Icon: Share2 },
              ].map(({ name, color, Icon }) => (
                <button
                  key={name}
                  onClick={() => setShared(true)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl ${color} border-2 border-[var(--expo-navy)] p-3 text-white shadow-[3px_3px_0_var(--expo-navy)] transition-transform active:scale-95`}
                >
                  <Icon size={22} strokeWidth={2.5} aria-hidden="true" />
                  <span className="text-xs font-bold">{name}</span>
                </button>
              ))}
            </div>
            <button onClick={onDone} className="mt-4 w-full py-2 text-center text-sm text-slate-400 underline">Cancelar</button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <span className="flex size-20 items-center justify-center rounded-2xl border-2 border-[var(--expo-green)] bg-[var(--expo-green)]/20 shadow-[4px_4px_0_var(--expo-green)]">
              <CheckCircle2 size={40} className="text-[var(--expo-green)]" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <p className="text-xl font-black text-[var(--expo-navy)]">Compartido</p>
            <p className="text-center text-sm text-slate-500">
              Demo conceptual · ningún post fue publicado realmente
            </p>
            <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--expo-yellow)] bg-[#fff8e1] px-4 py-2">
              <TrendingUp size={16} className="text-[var(--expo-yellow)]" aria-hidden="true" />
              <span className="font-black text-[var(--expo-navy)]">+100 puntos</span>
            </div>
            <button
              onClick={onDone}
              className="mt-2 rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-navy)] px-8 py-3 font-black text-white shadow-[4px_4px_0_var(--expo-blue)] transition-transform active:scale-95"
            >
              Embajador activo
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Mission Card ────────────────────────────────────────────────────────────

interface MissionCardProps {
  mission: Mission;
  progress: number;
  isCompleted: boolean;
  isLocked: boolean;
  specialDone: boolean;
  onNavigateToMap?: () => void;
}

function MissionCard({
  mission,
  progress,
  isCompleted,
  isLocked,
  specialDone,
  onNavigateToMap,
}: MissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showSelfie, setShowSelfie] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [nfcTarget, setNfcTarget] = useState<{ id: string; name: string } | null>(null);

  const { completeMissionSpecialAction, points, visitedStandIds } = useDemoStore();
  const iconConfig = getMissionIcon(mission.id);
  const missionImageSrc = MISSION_IMAGES[mission.id];

  const actionDone = mission.specialAction ? specialDone : isCompleted;

  // For stand-based missions: find the next unvisited stand
  function getNextUnvisitedStand() {
    if (!mission.standIds) return null;
    const nextId = mission.standIds.find((id) => !visitedStandIds.includes(id));
    if (!nextId) return null;
    return { id: nextId, name: STAND_NAMES[nextId] ?? nextId };
  }

  function handleSpecialAction() {
    if (actionDone) return;
    if (mission.specialAction === "selfie") setShowSelfie(true);
    if (mission.specialAction === "share") setShowShare(true);
    if (mission.specialAction === "agenda") {
      completeMissionSpecialAction(mission.id);
    }
  }

  function handleSelfieClose() {
    setShowSelfie(false);
    completeMissionSpecialAction(mission.id);
  }

  function handleShareClose() {
    setShowShare(false);
    completeMissionSpecialAction(mission.id);
  }

  function handleSimulateStand() {
    const target = getNextUnvisitedStand();
    if (!target) return;
    setNfcTarget(target);
  }

  const hasStands = mission.standIds && mission.standIds.length > 0;
  const nextUnvisited = !isLocked ? getNextUnvisitedStand() : null;

  return (
    <>
      <AnimatePresence>
        {showSelfie && <SelfieOverlay key="selfie" onDone={handleSelfieClose} />}
        {showShare && <ShareOverlay key="share" points={points} onDone={handleShareClose} />}
        {nfcTarget && (
          <NfcSimOverlay
            key="nfc"
            standId={nfcTarget.id}
            standName={nfcTarget.name}
            onDone={() => setNfcTarget(null)}
          />
        )}
      </AnimatePresence>

      <motion.article
        layout
        className={`overflow-hidden rounded-2xl border-2 bg-white ${
          isLocked
            ? "border-slate-200 opacity-60 shadow-none"
            : isCompleted
              ? "border-[var(--expo-green)] shadow-[4px_4px_0_var(--expo-green)]"
              : "border-[var(--expo-navy)] shadow-[4px_4px_0_var(--expo-navy)]"
        }`}
      >
        {/* ── Header row ── */}
        <button
          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors active:bg-slate-50"
          onClick={() => !isLocked && setExpanded((v) => !v)}
          aria-expanded={expanded}
          disabled={isLocked}
        >
          <PixelIcon
            icon={iconConfig.icon}
            bg={iconConfig.bg}
            color={iconConfig.color}
            locked={isLocked}
            imageSrc={missionImageSrc}
            imageAlt={mission.title}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`truncate font-black ${isLocked ? "text-slate-400" : "text-[var(--expo-navy)]"}`}>
                {mission.title}
              </span>
              {isLocked && (
                <span className="shrink-0 rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[0.6rem] font-black uppercase tracking-wide text-slate-500">
                  Bloqueada
                </span>
              )}
              {isCompleted && !isLocked && (
                <CheckCircle2
                  size={15}
                  className="shrink-0 text-[var(--expo-green)]"
                  strokeWidth={2.5}
                  aria-label="Completada"
                />
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">{mission.shortDescription}</p>

            {!isLocked && !mission.specialAction && (
              <ProgressBar
                value={progress}
                max={mission.target}
                colorClass={isCompleted ? "bg-[var(--expo-green)]" : "bg-[var(--expo-purple)]"}
                heightClass="h-2"
                showLabel={false}
                className="mt-2"
              />
            )}
            {!isLocked && mission.specialAction && (
              <ProgressBar
                value={actionDone ? 1 : 0}
                max={1}
                colorClass={actionDone ? "bg-[var(--expo-green)]" : "bg-[var(--expo-purple)]"}
                heightClass="h-2"
                showLabel={false}
                className="mt-2"
              />
            )}
          </div>

          {/* Points + progress count + chevron */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded border border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-2 py-0.5 text-xs font-black text-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)]">
              +{mission.rewardPoints} pts
            </span>
            {!isLocked && !mission.specialAction && (
              <span className="text-[0.65rem] font-bold tabular-nums text-slate-400">
                {progress}/{mission.target}
              </span>
            )}
            {!isLocked && (
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.18 }} aria-hidden="true">
                <ChevronDown size={15} className="text-slate-400" />
              </motion.span>
            )}
          </div>
        </button>

        {/* ── Expandable body ── */}
        <AnimatePresence initial={false}>
          {expanded && !isLocked && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t-2 border-dashed border-[var(--expo-line)] px-4 pb-4 pt-3 space-y-3">
                {/* Description */}
                <p className="text-sm leading-relaxed text-slate-600">{mission.fullDescription}</p>

                {/* Category */}
                <div className="flex items-center gap-2">
                  <CategoryBadge category={mission.category} />
                  {!mission.specialAction && (
                    <span className="text-xs font-bold text-slate-400">
                      {progress} de {mission.target} completado
                    </span>
                  )}
                </div>

                {/* Stand list with per-stand simulate button */}
                {hasStands && (
                  <div className="grid gap-2">
                    {mission.standIds!.map((standId) => {
                      const visited = visitedStandIds.includes(standId);
                      const label = STAND_NAMES[standId] ?? standId;
                      return (
                        <div
                          key={standId}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                            visited
                              ? "border-[var(--expo-mint)] bg-[var(--expo-mint)]/20"
                              : "border-[var(--expo-line)] bg-[var(--expo-bg)]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {visited ? (
                              <CheckCircle2 size={14} className="shrink-0 text-[var(--expo-green)]" strokeWidth={2.5} aria-hidden="true" />
                            ) : (
                              <span className="size-3.5 shrink-0 rounded-sm border-2 border-slate-300" aria-hidden="true" />
                            )}
                            <span className={`truncate text-xs font-medium ${visited ? "text-slate-400 line-through" : "text-[var(--expo-navy)]"}`}>
                              {label}
                            </span>
                          </div>
                          {!visited ? (
                            <div className="flex shrink-0 gap-1.5 ml-2">
                              <button
                                onClick={onNavigateToMap}
                                className="flex items-center gap-1 rounded-lg border border-[var(--expo-navy)] bg-white px-2 py-1 text-xs font-bold text-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] transition-transform active:scale-95"
                              >
                                <MapPin size={10} strokeWidth={2.5} aria-hidden="true" />
                                Ubicar
                              </button>
                              <button
                                onClick={() => setNfcTarget({ id: standId, name: label })}
                                className="flex items-center gap-1 rounded-lg border border-[var(--expo-blue)] bg-[var(--expo-blue)] px-2 py-1 text-xs font-bold text-white shadow-[2px_2px_0_var(--expo-navy)] transition-transform active:scale-95"
                              >
                                <ScanLine size={10} strokeWidth={2.5} aria-hidden="true" />
                                Simular
                              </button>
                            </div>
                          ) : (
                            <span className="ml-2 shrink-0 rounded border border-[var(--expo-mint)] bg-[var(--expo-mint)]/30 px-1.5 py-0.5 text-[0.6rem] font-black uppercase text-slate-500">
                              Visitado
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Special action button (selfie / share / agenda) */}
                {mission.specialAction && (
                  <button
                    onClick={handleSpecialAction}
                    disabled={actionDone}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-black transition-transform active:scale-95 ${
                      actionDone
                        ? "border-[var(--expo-green)] bg-[var(--expo-green)]/10 text-[var(--expo-green)]"
                        : "border-[var(--expo-navy)] bg-[var(--expo-navy)] text-white shadow-[4px_4px_0_var(--expo-blue)]"
                    }`}
                  >
                    {actionDone ? (
                      <>
                        <CheckCircle2 size={18} strokeWidth={2.5} aria-hidden="true" />
                        Completado
                      </>
                    ) : mission.specialAction === "selfie" ? (
                      <>
                        <Camera size={18} strokeWidth={2.5} aria-hidden="true" />
                        Simular foto con el stand
                      </>
                    ) : mission.specialAction === "share" ? (
                      <>
                        <Share2 size={18} strokeWidth={2.5} aria-hidden="true" />
                        Compartir mi pasaporte
                      </>
                    ) : (
                      <>
                        <CalendarCheck size={18} strokeWidth={2.5} aria-hidden="true" />
                        Ver actividad destacada
                      </>
                    )}
                  </button>
                )}

                {/* Reward notice when completed */}
                {(isCompleted || actionDone) && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 rounded-xl border border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/20 px-3 py-2"
                  >
                    <Gift size={14} className="text-[var(--expo-yellow)]" strokeWidth={2.5} aria-hidden="true" />
                    <span className="text-xs font-black text-[var(--expo-navy)]">
                      +{mission.rewardPoints} puntos ganados
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </>
  );
}

// ─── Missions Screen ─────────────────────────────────────────────────────────

interface MissionsScreenProps {
  onNavigateToMap?: () => void;
}

export function MissionsScreen({ onNavigateToMap }: MissionsScreenProps) {
  const {
    missionProgress,
    specialActionsDone,
    unlockedMissionIds,
    getVisibleMissionIds,
    points,
    resetDemo,
  } = useDemoStore();

  const visibleIds = getVisibleMissionIds();
  const visibleMissions = visibleIds
    .map((id) => getMissionById(id))
    .filter((m): m is Mission => Boolean(m));

  const lockedMissions = MISSIONS.filter(
    (m) => m.unlockedBy && !unlockedMissionIds.includes(m.id),
  );

  // Global progress across all missions
  const totalSteps = MISSIONS.reduce((acc, m) => acc + m.target, 0);
  const doneSteps = MISSIONS.reduce((acc, m) => {
    const prog = m.specialAction
      ? specialActionsDone.includes(m.id) ? 1 : 0
      : Math.min(missionProgress[m.id] ?? 0, m.target);
    return acc + prog;
  }, 0);

  return (
    <div className="min-h-full px-4 py-5 sm:px-5 pb-8">

      {/* ── Header — pixel-panel (mismo estilo que ModulePlaceholder) ── */}
      <section className="pixel-panel relative overflow-hidden p-5 bg-[#e3d2ef] text-[var(--expo-navy)]">
        {/* Decorative square — igual que en ModulePlaceholder */}
        <span className="absolute -right-5 -top-5 size-24 rotate-12 border-8 border-white/30" aria-hidden="true" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="pixel-label opacity-75">La Paz Expone 2026</p>
            <h1 className="mt-2 text-2xl font-black leading-tight">Misiones</h1>
            <p className="mt-2 max-w-xs text-sm font-medium leading-6 opacity-80">
              Completa y gana puntos canjeables
            </p>
          </div>
          <PointsPill points={points} />
        </div>

        {/* Global progress bar — dentro del panel */}
        <div className="relative mt-4">
          <div className="flex items-center justify-between text-xs font-bold opacity-60">
            <span>Progreso global</span>
            <span>{doneSteps}/{totalSteps} pasos</span>
          </div>
          <ProgressBar
            value={doneSteps}
            max={totalSteps}
            colorClass="bg-[var(--expo-purple)]"
            heightClass="h-3"
            showLabel={false}
            className="mt-1"
          />
        </div>
      </section>

      {/* ── Demo notice ── */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-dashed border-[var(--expo-line)] bg-white px-4 py-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] bg-[var(--expo-sky)] shadow-[2px_2px_0_var(--expo-navy)]" aria-hidden="true">
          <ScanLine size={14} className="text-white" strokeWidth={2.5} />
        </span>
        <p className="text-xs text-slate-500">
          <strong className="text-[var(--expo-navy)]">Demo conceptual</strong> · Presiona{" "}
          <strong>Simular</strong> en cada stand para ver cómo sube la barra de progreso.
        </p>
      </div>

      {/* ── Mission list ── */}
      <div className="mt-4 grid gap-3">
        {visibleMissions.map((mission) => {
          const progress = missionProgress[mission.id] ?? 0;
          const specialDone = specialActionsDone.includes(mission.id);
          const isCompleted = mission.specialAction ? specialDone : progress >= mission.target;

          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              progress={progress}
              isCompleted={isCompleted}
              isLocked={false}
              specialDone={specialDone}
              onNavigateToMap={onNavigateToMap}
            />
          );
        })}

        {/* Locked missions teaser */}
        {lockedMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            progress={0}
            isCompleted={false}
            isLocked={true}
            specialDone={false}
          />
        ))}
      </div>

      {/* Unlock hint */}
      {lockedMissions.length > 0 && (
        <div className="mt-3 rounded-xl border-2 border-dashed border-[var(--expo-mint)] bg-[var(--expo-mint)]/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex size-6 items-center justify-center rounded border-2 border-[var(--expo-navy)] bg-[var(--expo-mint)] shadow-[2px_2px_0_var(--expo-navy)]" aria-hidden="true">
              <Lock size={12} className="text-[var(--expo-navy)]" strokeWidth={2.5} />
            </span>
            <p className="text-xs font-black text-[var(--expo-navy)]">Misiones por desbloquear</p>
          </div>
          <ul className="list-inside list-disc text-xs text-slate-500 space-y-0.5">
            {lockedMissions.map((m) => {
              const unlocker = getMissionById(m.unlockedBy!);
              return (
                <li key={m.id}>
                  <strong>{m.title}</strong> — completa{" "}
                  <em>{unlocker?.title ?? m.unlockedBy}</em>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Reiniciar simulación ── reutiliza el estilo app-topbar-action ── */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={resetDemo}
          className="app-topbar-action gap-2 rounded-xl border-2 border-[var(--expo-navy)] !bg-[#ffc21a] px-5 py-2.5 text-xs font-black !text-black shadow-[3px_3px_0_var(--expo-navy)] transition-transform active:scale-95"
        >
          <RotateCcw size={14} strokeWidth={2.5} aria-hidden="true" />
          Reiniciar simulación
        </button>
      </div>

    </div>
  );
}
