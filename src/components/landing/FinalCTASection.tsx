"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { PixelStar, PixelRewardChest } from "./PixelIcons";
import { ArrowRight, MessageSquareCheck, Sparkles } from "lucide-react";
import { pixelifyFont } from "./fonts";
import { UI_OUT, depthLayers, disposer, magnetic, useScrollFx } from "./scroll-fx";
import fx from "./landing-fx.module.css";

/** Pixel confetti at different depths: position, size, colour and how far each drifts while the section passes. */
const confetti = [
  { className: "top-[18%] left-[12%]", size: 12, color: "var(--expo-yellow)", depth: 70 },
  { className: "top-[62%] left-[7%]", size: 8, color: "var(--expo-pink)", depth: 30 },
  { className: "top-[30%] right-[10%]", size: 14, color: "var(--expo-mint)", depth: 90 },
  { className: "top-[74%] right-[16%]", size: 10, color: "var(--expo-sky)", depth: 45 },
  { className: "top-[12%] right-[30%]", size: 8, color: "var(--expo-lilac)", depth: 25 },
  { className: "top-[80%] left-[28%]", size: 10, color: "var(--expo-yellow)", depth: 55 },
];

/** The question lands line by line, the actions follow, and the buttons lean toward the pointer. */
function playCta(root: HTMLElement, finePointer: boolean) {
  const cleanup = disposer();

  const timeline = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 70%", once: true } });
  timeline
    .from(root.querySelector("[data-fx-eyebrow]"), { y: 16, opacity: 0, duration: 0.6, ease: UI_OUT })
    .from(root.querySelectorAll("[data-fx-line]"), { yPercent: 110, duration: 0.95, ease: UI_OUT, stagger: 0.08 }, 0.1)
    .from(root.querySelector("[data-fx-copy]"), { y: 20, opacity: 0, duration: 0.7, ease: UI_OUT }, 0.45)
    .from(root.querySelectorAll("[data-fx-action]"), { y: 28, opacity: 0, duration: 0.7, ease: UI_OUT, stagger: 0.08 }, 0.6);

  if (finePointer) {
    root.querySelectorAll<HTMLElement>("[data-fx-magnet]").forEach((item) => cleanup.add(magnetic(item, 0.28)));
  }

  depthLayers(root);
  return cleanup.run;
}

export function FinalCTASection() {
  const root = useRef<HTMLElement>(null);
  useScrollFx(root, playCta);

  return (
    <section
      ref={root}
      id="contacto"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-br from-[var(--expo-navy)] via-[#3D2D5B] to-[var(--expo-blue)] py-24 text-white md:py-32"
    >
      {/* Pixel grid and confetti drift at their own speeds */}
      <div
        aria-hidden="true"
        data-fx-depth="26"
        className="pointer-events-none absolute inset-x-0 -top-16 -bottom-16 [background-size:24px_24px] bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-10"
      />
      {confetti.map((piece) => (
        <span
          key={piece.className}
          aria-hidden="true"
          data-fx-depth={piece.depth}
          className={`${piece.className} ${fx.pixel} pointer-events-none absolute hidden opacity-80 md:block`}
          style={{ width: piece.size, height: piece.size, background: piece.color }}
        />
      ))}

      {/* Floating ornaments: parallax on the wrapper, idle float on the child */}
      <div aria-hidden="true" data-fx-depth="50" className="absolute top-10 left-10 hidden md:block">
        <span className={`${fx.float} inline-flex`}>
          <PixelStar className="h-9 w-9 opacity-90" color="#FFC21A" />
        </span>
      </div>
      <div aria-hidden="true" data-fx-depth="40" className="absolute right-12 bottom-10 hidden md:block">
        <span className={`${fx.float} inline-flex [animation-delay:-2s]`}>
          <PixelRewardChest className="h-11 w-11" />
        </span>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div
          data-fx-eyebrow
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-white/10 px-4 py-1 font-mono text-xs font-black tracking-wider text-sky-200"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          VALIDACIÓN Y MEJORA CONTINUA
        </div>

        <h2 className={`${pixelifyFont.className} text-4xl leading-[1.15] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl`}>
          <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
            <span data-fx-line className="block">
              ¿Cómo debería funcionar
            </span>
          </span>
          <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
            <span
              data-fx-line
              className="block bg-gradient-to-r from-[var(--expo-yellow)] to-[var(--expo-pink)] bg-clip-text text-transparent"
            >
              Fexpo para ti?
            </span>
          </span>
        </h2>

        <p data-fx-copy className="mx-auto mt-8 max-w-2xl text-base leading-relaxed font-medium text-slate-200 sm:text-xl">
          Estamos validando una experiencia temprana y queremos aprender de visitantes, expositores y organizadores para construir la versión ideal.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <div data-fx-action>
            <span data-fx-magnet className="inline-block">
              <Link
                href="/demo"
                className={`${fx.slab} ${fx.press} group inline-flex items-center gap-3 border-3 border-white bg-[var(--expo-yellow)] px-8 py-4 text-[var(--expo-navy)] [--slab-color:#ffffff] [--slab-offset:6px] hover:bg-[#FFE066]`}
              >
                <span className="text-lg font-black">Probar demo</span>
                <ArrowRight className="h-5 w-5 stroke-[3] transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Link>
            </span>
          </div>

          <div data-fx-action>
            <span data-fx-magnet className="inline-block">
              <Link
                href="/feedback"
                className={`${fx.slab} ${fx.press} inline-flex items-center gap-2.5 border-3 border-white bg-white/15 px-7 py-4 text-white [--slab-color:rgba(255,255,255,0.35)] [--slab-offset:6px] hover:bg-white/25`}
              >
                <MessageSquareCheck className="h-5 w-5" />
                <span className="text-lg font-bold">Dejar feedback</span>
              </Link>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
