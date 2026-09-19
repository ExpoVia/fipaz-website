"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Transition } from "motion/react";
import { CheckCircle2, Lock, Gift, Sparkles, Info, ScanLine, Trophy, Camera, Share2, RotateCcw } from "lucide-react";

import { REWARDS } from "@/data/rewards";
import { useDemoStore } from "@/store/demo-store";
import { PointsPill } from "@/components/pixel/PointsPill";
import type { Reward } from "@/lib/types";

// ─── Floating animation variant (levitación suave) ──────────────────────────
const floatTransition: Transition = {
  duration: 2.8,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
};


// ─── Redeem confirmation modal ──────────────────────────────────────────────

interface RedeemModalProps {
  reward: Reward;
  onConfirm: () => void;
  onCancel: () => void;
}

function RedeemModal({ reward, onConfirm, onCancel }: RedeemModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl border-4 border-[var(--expo-navy)] bg-white p-6 shadow-[6px_6px_0_var(--expo-navy)]"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div
            className="relative size-24 drop-shadow-[0_8px_12px_rgba(0,0,0,0.15)]"
            animate={{ y: [0, -8, 0] }}
            transition={floatTransition}
          >
            <Image
              src={reward.imagePath}
              alt={reward.title}
              fill
              className="object-contain"
              sizes="96px"
            />
          </motion.div>
          <div>
            <h2 className="text-xl font-black text-[var(--expo-navy)]">{reward.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{reward.description}</p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--expo-yellow)] bg-[#fff8e1] px-4 py-2">
            <Sparkles size={16} className="text-[var(--expo-yellow)]" aria-hidden="true" />
            <span className="font-black text-[var(--expo-navy)]">{reward.cost} puntos</span>
          </div>

          <p className="text-xs text-[var(--expo-coral)]">
            {reward.stockLabel}
          </p>

          <div className="mt-2 flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl border-2 border-[var(--expo-line)] py-3 font-bold text-slate-600 transition-transform active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-2xl bg-[var(--expo-navy)] py-3 font-black text-white shadow-[4px_4px_0_var(--expo-blue)] transition-transform active:scale-95"
            >
              Canjear
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Success modal ───────────────────────────────────────────────────────────

function RedeemSuccessModal({ reward, code, onClose }: { reward: Reward; code: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl border-4 border-[var(--expo-green)] bg-white p-6 text-center shadow-[6px_6px_0_var(--expo-green)]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-[var(--expo-green)] bg-[var(--expo-green)]/20 shadow-[4px_4px_0_var(--expo-green)] mx-auto">
          <CheckCircle2 size={40} className="text-[var(--expo-green)]" strokeWidth={2.5} />
        </div>
        <h2 className="mt-4 text-2xl font-black text-[var(--expo-navy)]">¡Canjeado!</h2>
        <p className="mt-1 text-sm text-slate-500">{reward.title}</p>

        {/* Code display */}
        <div className="mt-4 rounded-2xl border-2 border-dashed border-[var(--expo-navy)] bg-[var(--expo-bg)] py-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tu código</p>
          <p className="mt-1 font-mono text-3xl font-black tracking-widest text-[var(--expo-navy)]">
            {code}
          </p>
          <p className="mt-1 text-xs text-[var(--expo-coral)]">Demo conceptual · solo para entrevista</p>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          En el producto real presentarías este código en el stand o puesto de canje. Sin stock real en esta demostración.
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-[var(--expo-navy)] py-3 font-black text-white shadow-[4px_4px_0_var(--expo-blue)] transition-transform active:scale-95"
        >
          ¡Listo!
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Reward card ────────────────────────────────────────────────────────────

interface RewardCardProps {
  reward: Reward;
  points: number;
  isRedeemed: boolean;
  onRedeem: () => void;
}

function RewardCard({ reward, points, isRedeemed, onRedeem }: RewardCardProps) {
  const canAfford = points >= reward.cost;
  const isLocked = !canAfford && !isRedeemed;

  return (
    <motion.article
      layout
      className={`relative overflow-hidden rounded-2xl border-2 bg-white transition-all ${
        isRedeemed
          ? "border-[var(--expo-green)]"
          : isLocked
            ? "border-[var(--expo-line)] opacity-75"
            : "border-[var(--expo-navy)] shadow-[4px_4px_0_var(--expo-navy)]"
      }`}
    >
      {/* Redeemed ribbon */}
      {isRedeemed && (
        <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-[var(--expo-green)] px-3 py-1">
          <span className="text-xs font-black text-white">CANJEADO</span>
        </div>
      )}

      {/* Cost badge top-left */}
      {!isRedeemed && (
        <div
          className={`absolute left-3 top-3 z-10 flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-black ${
            canAfford
              ? "border-[var(--expo-yellow)] bg-[#fff8e1] text-[var(--expo-navy)]"
              : "border-slate-200 bg-slate-100 text-slate-500"
          }`}
        >
          {canAfford ? (
            <Sparkles size={10} className="text-[var(--expo-yellow)]" aria-hidden="true" />
          ) : (
            <Lock size={10} aria-hidden="true" />
          )}
          <span>{reward.cost} pts</span>
        </div>
      )}

      {/* Image illustration area — floating animation */}
      <div className={`flex items-center justify-center p-4 pt-10 ${isLocked ? "grayscale opacity-50" : ""}`}>
        <motion.div
          className="relative size-20 drop-shadow-[0_6px_8px_rgba(0,0,0,0.18)]"
          animate={{ y: [0, -7, 0] }}
          transition={floatTransition}
        >
          <Image
            src={reward.imagePath}
            alt={reward.title}
            fill
            className="object-contain"
            sizes="80px"
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <h3 className="font-black text-[var(--expo-navy)]">{reward.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {reward.description}
        </p>

        {/* Action */}
        <div className="mt-3">
          {isRedeemed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--expo-green)]/10 px-3 py-2">
              <CheckCircle2 size={16} className="text-[var(--expo-green)]" aria-hidden="true" />
              <span className="text-sm font-bold text-[var(--expo-green)]">¡Ya lo tienes!</span>
            </div>
          ) : isLocked ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
              <Lock size={14} className="text-slate-400" aria-hidden="true" />
              <span className="text-xs font-bold text-slate-400">
                Te faltan {reward.cost - points} pts
              </span>
            </div>
          ) : (
            <button
              onClick={onRedeem}
              className="w-full rounded-xl bg-[var(--expo-navy)] py-2.5 font-black text-sm text-white shadow-[3px_3px_0_var(--expo-blue)] transition-transform active:scale-95"
            >
              Canjear ahora
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Rewards screen ─────────────────────────────────────────────────────────

export function RewardsScreen() {
  const { points, redeemedRewardIds, redeemReward, resetDemo } = useDemoStore();

  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const [successData, setSuccessData] = useState<{ reward: Reward; code: string } | null>(null);

  function handleConfirmRedeem() {
    if (!pendingReward) return;
    const code = redeemReward(pendingReward.id, pendingReward.cost);
    if (code) {
      setSuccessData({ reward: pendingReward, code });
    }
    setPendingReward(null);
  }

  // Sort: available first, then locked, then redeemed
  const sorted = [...REWARDS].sort((a, b) => {
    const aRedeemed = redeemedRewardIds.includes(a.id);
    const bRedeemed = redeemedRewardIds.includes(b.id);
    const aAfford = points >= a.cost;
    const bAfford = points >= b.cost;
    if (aRedeemed !== bRedeemed) return aRedeemed ? 1 : -1;
    if (aAfford !== bAfford) return aAfford ? -1 : 1;
    return a.cost - b.cost;
  });

  return (
    <>
      <AnimatePresence>
        {pendingReward && (
          <RedeemModal
            key="modal"
            reward={pendingReward}
            onConfirm={handleConfirmRedeem}
            onCancel={() => setPendingReward(null)}
          />
        )}
        {successData && (
          <RedeemSuccessModal
            key="success"
            reward={successData.reward}
            code={successData.code}
            onClose={() => setSuccessData(null)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-full px-4 py-5 sm:px-5 pb-8">

        {/* ── Header — pixel-panel rosa (mismo estilo que ModulePlaceholder pink) ── */}
        <section className="pixel-panel relative overflow-hidden p-5 bg-[#fbdbe7] text-[var(--expo-navy)]">
          {/* Decorative square — igual que en ModulePlaceholder */}
          <span className="absolute -right-5 -top-5 size-24 rotate-12 border-8 border-white/30" aria-hidden="true" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="pixel-label opacity-75">Catálogo de premios</p>
              <h1 className="mt-2 text-2xl font-black leading-tight">Recompensas</h1>
              <p className="mt-2 max-w-xs text-sm font-medium leading-6 opacity-80">
                Canjea tus puntos por premios reales
              </p>
            </div>
            <PointsPill points={points} />
          </div>
        </section>

        {/* ── Demo notice ── */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-dashed border-[var(--expo-line)] bg-white px-4 py-2">
          <Info size={14} className="shrink-0 text-[var(--expo-blue)]" aria-hidden="true" />
          <p className="text-xs text-slate-500">
            <strong>Demo conceptual</strong> · Los premios son ilustrativos. En FIPAZ los organizadores definirán el catálogo real.
          </p>
        </div>

        {/* ── No points empty state ── */}
        {points === 0 && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border-2 border-dashed border-[var(--expo-line)] bg-white py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-sky)] shadow-[3px_3px_0_var(--expo-navy)]" aria-hidden="true">
              <Trophy size={28} className="text-white" strokeWidth={2.5} />
            </span>
            <p className="mt-3 font-black text-[var(--expo-navy)]">Aún no tienes puntos</p>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Visita stands con NFC y completa misiones para ganar puntos y canjearlos aquí.
            </p>
          </div>
        )}

        {/* ── Rewards grid ── */}
        {points > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {sorted.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                points={points}
                isRedeemed={redeemedRewardIds.includes(reward.id)}
                onRedeem={() => setPendingReward(reward)}
              />
            ))}
          </div>
        )}

        {/* ── How to earn more ── */}
        <div className="mt-6 rounded-2xl border-2 border-[var(--expo-line)] bg-[var(--expo-bg)] p-4">
          <div className="flex items-center gap-2">
            <Gift size={16} className="text-[var(--expo-purple)]" aria-hidden="true" />
            <p className="font-black text-[var(--expo-navy)] text-sm">¿Cómo ganar más puntos?</p>
          </div>
          <ul className="mt-3 grid gap-2">
            {[
              { Icon: ScanLine, color: "bg-[var(--expo-sky)]",  text: "Escanea NFC de un stand → +50 pts" },
              { Icon: Trophy,   color: "bg-[#e3d2ef]",          text: "Completa una misión → +25 a 250 pts" },
              { Icon: Camera,   color: "bg-[#fbdbe7]",          text: "Selfie con el stand → +75 pts" },
              { Icon: Share2,   color: "bg-[var(--expo-mint)]", text: "Comparte tu pasaporte → +100 pts" },
            ].map(({ Icon, color, text }) => (
              <li key={text} className="flex items-center gap-2 text-xs text-slate-600">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--expo-navy)] ${color} shadow-[1px_1px_0_var(--expo-navy)]`}
                  aria-hidden="true"
                >
                  <Icon size={12} className="text-[var(--expo-navy)]" strokeWidth={2.5} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Footer ── */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[var(--expo-lilac)]">
          <Sparkles size={14} aria-hidden="true" />
          <p className="text-xs font-bold">Más premios en FIPAZ 2026</p>
          <Sparkles size={14} aria-hidden="true" />
        </div>
      </div>
    </>
  );
}

