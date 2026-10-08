"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ArrowRight, Award, Check, Lock, RotateCcw, Star, Trophy } from "lucide-react";
import { demoCompanies, type DemoCompany, type JourneyStepId } from "./journey-data";
import styles from "./RewardDemo.module.css";

type RewardDemoProps = { reduced: boolean; company: DemoCompany; onNext: (step: JourneyStepId) => void };

const RING_R = 26;
const RING_LENGTH = 2 * Math.PI * RING_R;
const BALANCE_FROM = 330;
const BALANCE_TO = 430;
const NEXT_LEVEL = 500;
const MISSION_BONUS = BALANCE_TO - BALANCE_FROM;

// Confetti burst from the ring: fixed offsets (no randomness, so server and client render the same markup).
const CONFETTI: ReadonlyArray<{ dx: number; dy: number; color: string; round: boolean; spin: number }> = [
  { dx: 44, dy: -6, color: "#ffbd18", round: false, spin: 220 }, { dx: 38, dy: -30, color: "#d86bac", round: true, spin: -160 },
  { dx: 20, dy: -44, color: "#1687e8", round: false, spin: 300 }, { dx: -4, dy: -48, color: "#82d6bf", round: true, spin: -240 },
  { dx: -28, dy: -40, color: "#f27c68", round: false, spin: 180 }, { dx: -44, dy: -18, color: "#8b4fc7", round: true, spin: -280 },
  { dx: -46, dy: 8, color: "#ffbd18", round: false, spin: 260 }, { dx: -36, dy: 32, color: "#1687e8", round: true, spin: -200 },
  { dx: -14, dy: 46, color: "#d86bac", round: false, spin: 340 }, { dx: 12, dy: 48, color: "#82d6bf", round: true, spin: -120 },
  { dx: 34, dy: 36, color: "#f27c68", round: false, spin: 200 }, { dx: 48, dy: 16, color: "#8b4fc7", round: true, spin: -300 },
  { dx: 30, dy: -18, color: "#ffd34d", round: true, spin: 140 }, { dx: -30, dy: -12, color: "#ffd34d", round: false, spin: -180 },
  { dx: -8, dy: 26, color: "#ffffff", round: true, spin: 90 }, { dx: 10, dy: -28, color: "#ffffff", round: false, spin: -90 },
];

export function RewardDemo({ reduced, company, onNext }: RewardDemoProps) {
  const root = useRef<HTMLDivElement>(null);
  const [visited, setVisited] = useState(reduced);   // the stand just checked in at is marked once the demo starts
  const [complete, setComplete] = useState(reduced);
  const [unlocked, setUnlocked] = useState(reduced);
  const [run, setRun] = useState(0);

  // Two earlier stops (tech companies other than the one visited just now) plus the stand checked in at the NFC step.
  const earlier = demoCompanies.filter(item => item.id !== company.id && (item.tags as readonly string[]).includes("tecnología")).slice(0, 2);
  const stops = [...earlier, company];
  const done = visited ? 3 : 2;

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      const element = root.current!;
      const balance = element.querySelector<HTMLElement>("[data-balance]")!;
      const score = { value: BALANCE_FROM };
      balance.textContent = String(BALANCE_FROM);
      gsap.set("[data-ring-progress]", { strokeDashoffset: RING_LENGTH * (1 - 2 / 3) });
      gsap.set("[data-xp]", { scaleX: BALANCE_FROM / NEXT_LEVEL });
      gsap.set("[data-confetti], [data-bonus], [data-shine]", { opacity: 0 });
      gsap.timeline({ delay: 0.25 })
        .from("[data-stop]", { y: 10, opacity: 0, duration: 0.3, stagger: 0.08, ease: "power2.out" }, 0)
        .call(() => setVisited(true), [], 1.1)
        .to("[data-ring-progress]", { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }, 1.1)
        .fromTo("[data-stop-last]", { scale: 0.96 }, { scale: 1, duration: 0.5, ease: "back.out(3)" }, 1.1)
        .call(() => setComplete(true), [], 1.9)
        .fromTo("[data-ring]", { scale: 1 }, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 1.9)
        .fromTo("[data-confetti]", { x: 0, y: 0, opacity: 1, scale: 0.4, rotation: 0 }, {
          x: (index: number) => CONFETTI[index].dx, y: (index: number) => CONFETTI[index].dy, rotation: (index: number) => CONFETTI[index].spin,
          scale: 1, opacity: 0, duration: 1, ease: "power2.out", stagger: 0.012,
        }, 1.9)
        .fromTo("[data-bonus]", { y: 12, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.4)" }, 2)
        .to(score, { value: BALANCE_TO, duration: 0.9, ease: "power2.out", onUpdate: () => { balance.textContent = String(Math.round(score.value)); } }, 2.1)
        .to("[data-xp]", { scaleX: BALANCE_TO / NEXT_LEVEL, duration: 0.9, ease: "power2.out" }, 2.1)
        .call(() => setUnlocked(true), [], 2.8)
        .fromTo("[data-badge]", { scale: 0.8, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.4)" }, 2.8)
        .fromTo("[data-shine]", { xPercent: -140, opacity: 1 }, { xPercent: 160, duration: 0.8, ease: "power2.inOut" }, 2.9);
    }, root);
    return () => context.revert();
  }, [reduced, run]);

  const replay = () => { setVisited(reduced); setComplete(reduced); setUnlocked(reduced); setRun(current => current + 1); };

  return <div ref={root} className={styles.root}>
    <div className={styles.grid}>
      <section className={styles.mission} aria-label="Misión de exploración">
        <header className={styles.head}>
          <div className={styles.ringWrap} data-ring>
            <svg className={styles.ring} viewBox="0 0 64 64" role="progressbar" aria-label="Stands visitados" aria-valuemin={0} aria-valuemax={3} aria-valuenow={done}>
              <circle cx="32" cy="32" r={RING_R} fill="none" stroke="#eef1f7" strokeWidth="6" />
              <circle data-ring-progress cx="32" cy="32" r={RING_R} fill="none" stroke="url(#reward-ring)" strokeWidth="6" strokeLinecap="round" transform="rotate(-90 32 32)"
                strokeDasharray={RING_LENGTH} strokeDashoffset={RING_LENGTH * (1 - (reduced ? 1 : 2 / 3))} />
              <defs><linearGradient id="reward-ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffbd18" /><stop offset="1" stopColor="#ff8a3d" /></linearGradient></defs>
            </svg>
            <span className={styles.ringText} aria-hidden="true"><strong>{done}</strong>/3</span>
            {CONFETTI.map((piece, index) => <i key={index} data-confetti className={styles.confetti} data-round={piece.round} style={{ background: piece.color }} />)}
          </div>
          <div className={styles.headText}>
            <span className={styles.label}><Trophy size={13} aria-hidden="true" /> MISIÓN DE EXPLORACIÓN</span>
            <h4>Explora 3 stands de la feria</h4>
            <p role="status" data-complete={complete}>{complete ? <><Check size={14} strokeWidth={3} aria-hidden="true" /> ¡Misión completada!</> : "Un stand más para completarla"}</p>
          </div>
          <button type="button" className={styles.replay} onClick={replay} aria-label="Repetir simulación de la misión"><RotateCcw size={14} aria-hidden="true" /></button>
        </header>

        <ol className={styles.stops}>
          {stops.map((stop, index) => {
            const last = index === stops.length - 1;
            const checked = !last || visited;
            return <li className={styles.stop} key={stop.id} data-stop data-stop-last={last ? "" : undefined} data-state={checked ? "done" : "active"} style={{ "--tint": stop.tint, "--ink": stop.ink } as CSSProperties}>
              <span className={styles.avatar}>{stop.initials}</span>
              <span className={styles.stopText}><strong>{stop.name}</strong><small>Stand {stop.stand}{last ? " · tu check-in" : ""}</small></span>
              <span className={styles.stopState}>{checked ? <Check size={14} strokeWidth={3} aria-label="Visitado" /> : <span aria-label="Pendiente" />}</span>
            </li>;
          })}
        </ol>
      </section>

      <aside className={styles.rewards}>
        <div className={styles.badgeCard} data-unlocked={unlocked}>
          <span className={styles.badge} data-badge>
            <Award size={26} aria-hidden="true" />
            <i className={styles.shine} data-shine aria-hidden="true" />
            {!unlocked && <Lock className={styles.lock} size={13} aria-hidden="true" />}
          </span>
          <span className={styles.badgeText}><strong>Explorador Tech</strong><small>{unlocked ? "Insignia desbloqueada" : "Se desbloquea al completar la misión"}</small></span>
        </div>

        <div className={styles.balance}>
          <span className={styles.balanceLabel}><Star size={13} aria-hidden="true" /> Tu saldo de ejemplo</span>
          <span className={styles.balanceValue}><strong data-balance>{reduced ? BALANCE_TO : BALANCE_FROM}</strong> pts
            <em data-bonus style={reduced ? undefined : { opacity: 0 }}>+{MISSION_BONUS}</em></span>
          <span className={styles.level}><span>Nivel 3 · Explorador</span><span>{NEXT_LEVEL} pts</span></span>
          <span className={styles.xpTrack} aria-hidden="true"><span data-xp style={{ transform: `scaleX(${(reduced ? BALANCE_TO : BALANCE_FROM) / NEXT_LEVEL})` }} /></span>
        </div>

        <button type="button" className={styles.primary} onClick={() => onNext("connect")}>Conectar con la empresa<ArrowRight size={16} aria-hidden="true" /></button>
      </aside>
    </div>
  </div>;
}
