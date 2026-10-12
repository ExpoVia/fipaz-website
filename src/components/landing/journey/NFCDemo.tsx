"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Nfc, RotateCcw, Smartphone, Star } from "lucide-react";
import type { DemoCompany, JourneyStepId } from "./journey-data";
import styles from "./NFCDemo.module.css";

type NFCDemoProps = { reduced: boolean; company: DemoCompany; onNext: (step: JourneyStepId) => void };

// /public/img/landing/section2/NFC.mp4: 1280x720, ~6s. A hand brings a phone to the Fexpo reader, the phone taps it and
// switches to "Check-in realizado" with a counter that climbs to +25 pts. The steps below follow its timeline.
const VIDEO_SRC = "/img/landing/section2/NFC.mp4";
const STEPS = [
  { label: "Acerca tu teléfono", hint: "Al lector del stand", icon: Smartphone },
  { label: "Leyendo etiqueta", hint: "Conexión NFC en curso", icon: Nfc },
  { label: "Check-in realizado", hint: "Visita registrada", icon: Check },
] as const;
const STEP_AT = [0, 1.7, 3.1];
const POINTS_FROM = 3.3;
const POINTS_TO = 4.1;
const POINTS = 25;

export function NFCDemo({ reduced, company, onNext }: NFCDemoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [stage, setStage] = useState(reduced ? 2 : 0);
  const [points, setPoints] = useState(reduced ? POINTS : 0);
  const [ended, setEnded] = useState(reduced);
  const [failed, setFailed] = useState(false);

  // Reads the playhead every frame: it drives the steps, the points counter and the progress bar without re-rendering
  // for each tick (state only changes when a value does).
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let frame = 0;
    let lastStage = -1;
    let lastPoints = -1;
    const tick = () => {
      const time = element.currentTime;
      const nextStage = time >= STEP_AT[2] ? 2 : time >= STEP_AT[1] ? 1 : 0;
      const nextPoints = Math.round(POINTS * Math.min(1, Math.max(0, (time - POINTS_FROM) / (POINTS_TO - POINTS_FROM))));
      if (nextStage !== lastStage) { lastStage = nextStage; setStage(nextStage); }
      if (nextPoints !== lastPoints) { lastPoints = nextPoints; setPoints(nextPoints); }
      if (bar.current && element.duration) bar.current.style.transform = `scaleX(${time / element.duration})`;
      frame = requestAnimationFrame(tick);
    };
    if (reduced) {
      // No autoplay: park on the last frame (the completed check-in); the replay button still plays it on request.
      const parkAtEnd = () => { element.currentTime = Math.max(0, element.duration - 0.05); };
      if (element.readyState >= 1) parkAtEnd(); else element.addEventListener("loadedmetadata", parkAtEnd, { once: true });
    } else {
      void element.play().catch(() => { /* blocked autoplay: the replay button starts it */ });
    }
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); element.pause(); };
  }, [reduced]);

  const replay = () => {
    const element = video.current;
    if (!element) return;
    element.currentTime = 0;
    setEnded(false);
    void element.play().catch(() => {});
  };

  const done = failed || stage === 2;
  const shownPoints = failed ? POINTS : points;

  return <div className={styles.root}>
    <div className={styles.stage}>
      <div className={styles.frame} data-ended={ended || failed}>
        {failed
          ? <div className={styles.fallback}><Nfc size={44} aria-hidden="true" /><span>Simulación NFC</span></div>
          : <video ref={video} className={styles.video} src={VIDEO_SRC} muted playsInline preload="auto" disablePictureInPicture
              aria-label="Demostración en video: un teléfono toca el lector NFC de Fexpo y muestra el check-in realizado"
              onEnded={() => setEnded(true)} onError={() => setFailed(true)} />}
        <span className={styles.tag}>SIMULACIÓN NFC</span>
        {!failed && <span className={styles.progress} aria-hidden="true"><span ref={bar} /></span>}
        {!failed && <button type="button" className={styles.replay} onClick={replay} aria-label="Repetir simulación NFC"><RotateCcw size={13} aria-hidden="true" /> Repetir</button>}
      </div>

      <div className={styles.side}>
        <ol className={styles.steps} aria-label="Pasos del check-in">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const state = done || index < stage ? "done" : index === stage ? "active" : "todo";
            return <li className={styles.step} data-state={state} key={step.label} aria-current={state === "active" ? "step" : undefined}>
              <span className={styles.node}>{state === "done" ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : <Icon size={15} aria-hidden="true" />}</span>
              <span className={styles.stepText}><strong>{step.label}</strong><small>{step.hint}</small></span>
            </li>;
          })}
        </ol>
        <div className={styles.points} data-visible={shownPoints > 0} aria-live="polite">
          <Star size={15} aria-hidden="true" /><strong>+{shownPoints}</strong> pts <span>de ejemplo</span>
        </div>
        <button type="button" className={styles.primary} onClick={() => onNext("reward")}>Ver mi misión<ArrowRight size={16} aria-hidden="true" /></button>
      </div>
    </div>
    <p className={styles.note}>{company.name} · Stand {company.stand} · Simulación NFC: no registra una visita real.</p>
  </div>;
}
