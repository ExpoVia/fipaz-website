"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { PixelStar, PixelRewardChest } from "./PixelIcons";
import { ArrowRight, MessageSquareCheck, Sparkles } from "lucide-react";

export function FinalCTASection() {
  return (
    <section id="contacto" className="scroll-mt-24 relative overflow-hidden bg-gradient-to-br from-[var(--expo-navy)] via-[#3D2D5B] to-[var(--expo-blue)] py-20 text-white">
      
      {/* Decorative Pixel Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      {/* Floating Pixel Elements */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 left-10 hidden md:block"
      >
        <PixelStar className="w-8 h-8 opacity-80" color="#FFC21A" />
      </motion.div>

      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-12 hidden md:block"
      >
        <PixelRewardChest className="w-10 h-10 opacity-90" />
      </motion.div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-white/10 px-4 py-1 text-xs font-mono font-black tracking-wider text-sky-200 backdrop-blur-xs mb-6">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          VALIDACIÓN Y MEJORA CONTINUA
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
          ¿Cómo debería funcionar <br />
          <span className="bg-gradient-to-r from-[var(--expo-yellow)] to-[var(--expo-pink)] bg-clip-text text-transparent">
            ExpoVia para ti?
          </span>
        </h2>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-xl font-medium text-slate-200 leading-relaxed">
          Estamos validando una experiencia temprana y queremos aprender de visitantes, expositores y organizadores para construir la versión ideal.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <Link
            href="/demo"
            className="group inline-flex items-center gap-3 border-3 border-white bg-[var(--expo-yellow)] px-8 py-4 text-lg font-black text-[var(--expo-navy)] shadow-[6px_6px_0_#FFFFFF] transition-all hover:-translate-y-1 hover:bg-[#FFE066] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <span>Probar demo</span>
            <ArrowRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/feedback"
            className="inline-flex items-center gap-2.5 border-3 border-white bg-white/15 px-7 py-4 text-lg font-bold text-white backdrop-blur-xs shadow-[6px_6px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1 hover:bg-white/25 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <MessageSquareCheck className="h-5 w-5" />
            <span>Dejar feedback</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
