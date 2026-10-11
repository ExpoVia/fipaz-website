"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown, Compass, Gift, Smartphone, Award } from "lucide-react";
import { pixelifyFont, pressStartFont } from "./fonts";
import heroImage from "../../../public/img/landing/1ra landing.png";

const benefits = [
  { icon: <Compass className="h-4 w-4 text-[var(--expo-blue)]" />, text: "Explora el mapa" },
  { icon: <Smartphone className="h-4 w-4 text-[var(--expo-green)]" />, text: "Haz check-in con NFC" },
  { icon: <Award className="h-4 w-4 text-[var(--expo-purple)]" />, text: "Completa misiones" },
  { icon: <Gift className="h-4 w-4 text-[var(--expo-coral)]" />, text: "Canjea premios" },
];

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[calc(100svh-65px)] flex-col justify-center overflow-hidden bg-[#eaf6fa] py-8 sm:py-14 lg:min-h-[calc(100vh-72px)] lg:py-10"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_32%,#d8eff6_0%,transparent_32%),linear-gradient(135deg,#f4fafc_0%,#e9f4fb_55%,#eee5f4_100%)]" />
      {/* The illustration fills the screen behind the copy. On phones it is only softened (a 1px blur and a light veil that
          lets the colours through); from lg up the veil sits on the text side only. */}
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none -z-10 scale-[1.03] object-cover object-[66%_center] blur-[1px] lg:scale-100 lg:object-center lg:blur-none"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(244,250,252,0.5)_0%,rgba(244,250,252,0.34)_50%,rgba(244,250,252,0.16)_100%)] lg:hidden" />
      <div className="pointer-events-none absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgba(244,250,252,0.97)_0%,rgba(244,250,252,0.92)_36%,rgba(244,250,252,0.5)_58%,rgba(244,250,252,0)_78%)] lg:block" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-10 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="mx-auto max-w-xl text-center sm:max-w-2xl lg:col-span-7 lg:mx-0 lg:text-left">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-4 inline-block max-w-full sm:mb-5">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border-2 border-[var(--expo-navy)] bg-white/95 px-3 py-2 shadow-[3px_3px_0_var(--expo-navy)] sm:px-4">
              <span className="text-xs font-black text-[var(--expo-blue)]">✦</span>
              <span className={`${pressStartFont.className} text-[8px] leading-relaxed uppercase tracking-wide text-[var(--expo-navy)] sm:text-[10px] sm:tracking-wider`}>
                La app ya es real · NFC y puntos
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={`${pixelifyFont.className} text-center text-[2.65rem] leading-[0.98] font-bold tracking-tight text-[var(--expo-navy)] [text-shadow:0_2px_14px_rgba(255,255,255,0.7)] sm:text-7xl sm:leading-[0.96] lg:text-left lg:text-8xl lg:[text-shadow:none]`}
          >
            Explora. <br />
            Conecta. <br />
            <span className="relative inline-block pb-2 text-[#3a2bd0] [text-shadow:0_2px_12px_rgba(255,255,255,0.95),0_0_2px_rgba(255,255,255,0.9)] lg:bg-gradient-to-r lg:from-[var(--expo-blue)] lg:via-[var(--expo-purple)] lg:to-[var(--expo-lilac)] lg:bg-clip-text lg:text-transparent lg:[text-shadow:none]">
              Vive Fexpo.
              <span className="absolute bottom-0 left-0 -z-10 h-2.5 w-full -rotate-1 rounded-sm bg-[var(--expo-yellow)]/85" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed font-semibold text-pretty text-[var(--expo-navy)] [text-shadow:0_1px_10px_rgba(255,255,255,0.85)] sm:mt-7 sm:text-xl lg:mx-0 lg:font-medium lg:text-slate-700 lg:[text-shadow:none]"
          >
            Fexpo ya es real: es la app para ferias que ya tenemos. Explora stands y rutas, haz check-in con NFC y suma puntos en cada visita.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3 sm:mt-8 sm:flex sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <Link href="/demo" className="group col-span-2 inline-flex w-full items-center justify-center gap-3 border-3 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-7 py-3.5 text-lg font-black text-[var(--expo-navy)] shadow-[5px_5px_0_var(--expo-navy)] transition-all hover:-translate-y-1 hover:bg-[#ffe066] active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-auto">
              <span className="text-lg font-black">Probar demo</span>
              <ArrowRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/panel" className="inline-flex w-full items-center justify-center gap-2 border-3 border-[var(--expo-navy)] bg-[var(--expo-sky)] px-3 py-3.5 sm:px-6 text-base font-extrabold text-[var(--expo-navy)] shadow-[5px_5px_0_var(--expo-navy)] transition-all hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-auto">
              <span className="text-[15px] font-extrabold whitespace-nowrap min-[380px]:text-base">Ver el panel</span>
            </Link>
            <a href="#problema" className="inline-flex w-full items-center justify-center gap-2 border-3 border-[var(--expo-navy)] bg-white px-3 py-3.5 sm:px-6 text-base font-extrabold text-[var(--expo-navy)] shadow-[5px_5px_0_var(--expo-navy)] transition-all hover:-translate-y-1 hover:bg-white active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-auto">
              <span className="text-[15px] font-extrabold whitespace-nowrap min-[380px]:text-base">Conoce más</span>
              <ChevronDown className="h-4 w-4 stroke-[2.5] min-[380px]:h-5 min-[380px]:w-5" />
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }} className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2.5 sm:mt-10 sm:max-w-2xl sm:grid-cols-4 sm:gap-3 lg:mx-0">
            {benefits.map((item) => (
              <div key={item.text} className="flex min-h-14 min-w-0 items-center gap-2 rounded-lg border-2 border-[var(--expo-line)] bg-white p-2.5 shadow-sm">
                {item.icon}
                <span className="min-w-0 text-[11px] leading-tight font-bold text-[var(--expo-navy)] [overflow-wrap:anywhere] sm:text-xs">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
