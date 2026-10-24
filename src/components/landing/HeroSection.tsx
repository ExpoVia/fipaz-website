"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown, Compass, Gift, Smartphone, Award } from "lucide-react";
import { headingFont, eyebrowFont } from "./fonts";
import heroImage from "../../../public/img/landing/1ra landing.png";

const benefits = [
  { icon: <Compass className="h-4 w-4 text-[var(--expo-blue)] dark:text-[#1479F5]" />, text: "Explora el mapa" },
  { icon: <Smartphone className="h-4 w-4 text-[var(--expo-green)] dark:text-[#48bb78]" />, text: "Haz check-in con NFC" },
  { icon: <Award className="h-4 w-4 text-[var(--expo-purple)] dark:text-[#A9D0FF]" />, text: "Completa misiones" },
  { icon: <Gift className="h-4 w-4 text-[var(--expo-coral)] dark:text-[#FFCA35]" />, text: "Canjea premios" },
];

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[calc(100svh-65px)] flex-col justify-center overflow-hidden bg-[#eaf6fa] py-8 sm:py-14 lg:min-h-[calc(100vh-72px)] lg:py-10 dark:bg-[#0B1220]"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_32%,#d8eff6_0%,transparent_32%),linear-gradient(135deg,#f4fafc_0%,#e9f4fb_55%,#eee5f4_100%)] dark:bg-[radial-gradient(circle_at_78%_32%,#16233D_0%,transparent_40%),linear-gradient(135deg,#0B1220_0%,#101A2E_55%,#0B1220_100%)]" />
      {/* The illustration fills the screen behind the copy. On phones it is only softened; from lg up the veil sits on the text side only. */}
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none -z-10 scale-[1.03] object-cover object-[66%_center] blur-[1px] opacity-90 dark:opacity-40 lg:scale-100 lg:object-center lg:blur-none"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(244,250,252,0.5)_0%,rgba(244,250,252,0.34)_50%,rgba(244,250,252,0.16)_100%)] dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.85)_0%,rgba(11,18,32,0.65)_50%,rgba(11,18,32,0.45)_100%)] lg:hidden" />
      <div className="pointer-events-none absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgba(244,250,252,0.97)_0%,rgba(244,250,252,0.92)_36%,rgba(244,250,252,0.5)_58%,rgba(244,250,252,0)_78%)] dark:bg-[linear-gradient(90deg,rgba(11,18,32,0.98)_0%,rgba(11,18,32,0.92)_36%,rgba(11,18,32,0.6)_58%,rgba(11,18,32,0)_78%)] lg:block" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-10 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="mx-auto max-w-xl text-center sm:max-w-2xl lg:col-span-7 lg:mx-0 lg:text-left">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-4 inline-block max-w-full sm:mb-5">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--expo-blue)]/15 bg-white/90 px-3 py-2 shadow-[0_2px_10px_-2px_rgba(22,119,184,0.25)] backdrop-blur-sm sm:px-4 dark:border-[#223354] dark:bg-[#101A2E]/90 dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
              <span className="text-xs font-bold text-[var(--expo-blue)] dark:text-[#1479F5]">✦</span>
              <span className={`${eyebrowFont.className} text-[11px] font-bold leading-relaxed tracking-wide text-[var(--expo-navy)] dark:text-[#F5F9FF] sm:text-xs`}>
                La app ya es real · NFC y puntos
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={`${headingFont.className} text-center text-[2.65rem] leading-[0.98] font-bold tracking-tight text-[var(--expo-navy)] [text-shadow:0_2px_14px_rgba(255,255,255,0.7)] sm:text-7xl sm:leading-[0.96] lg:text-left lg:text-8xl lg:[text-shadow:none] dark:text-[#F5F9FF] dark:[text-shadow:none]`}
          >
            Explora. <br />
            Conecta. <br />
            <span className="relative inline-block pb-2 text-[#3a2bd0] [text-shadow:0_2px_12px_rgba(255,255,255,0.95),0_0_2px_rgba(255,255,255,0.9)] lg:text-[var(--expo-blue)] lg:[text-shadow:none] dark:text-[#1479F5]">
              Vive Fexpo.
              <span className="absolute bottom-0 left-0 -z-10 h-2.5 w-full -rotate-1 rounded-full bg-[var(--expo-yellow)]/85 dark:bg-[#FFCA35]/70" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed font-semibold text-pretty text-[var(--expo-navy)] [text-shadow:0_1px_10px_rgba(255,255,255,0.85)] sm:mt-7 sm:text-xl lg:mx-0 lg:font-medium lg:text-slate-700 lg:[text-shadow:none] dark:text-[#B8C7E6] dark:[text-shadow:none]"
          >
            Fexpo ya es real: es la app para ferias que ya tenemos. Explora stands y rutas, haz check-in con NFC y suma puntos en cada visita.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3 sm:mt-8 sm:flex sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <Link href="/demo" className="group col-span-2 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--expo-yellow)] px-7 py-3.5 text-lg font-extrabold text-[var(--expo-navy)] shadow-[0_14px_30px_-12px_rgba(255,194,26,0.75)] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#ffcf3d] active:translate-y-0 active:scale-[0.98] sm:w-auto dark:bg-[#FFCA35] dark:text-[#0B1220] dark:shadow-[0_14px_30px_-12px_rgba(255,202,53,0.5)]">
              <span className="text-lg font-extrabold">Probar demo</span>
              <ArrowRight className="h-5 w-5 stroke-[2.5] transition-transform duration-150 ease-out group-hover:translate-x-1" />
            </Link>
            <Link href="/panel" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--expo-sky)] px-3 py-3.5 sm:px-6 text-base font-bold text-[var(--expo-navy)] shadow-[0_10px_24px_-12px_rgba(47,45,76,0.3)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] sm:w-auto dark:bg-[#1479F5] dark:text-[#F5F9FF] dark:shadow-[0_10px_24px_-12px_rgba(20,121,245,0.4)]">
              <span className="text-[15px] font-bold whitespace-nowrap min-[380px]:text-base">Ver el panel</span>
            </Link>
            <a href="#problema" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3.5 sm:px-6 text-base font-bold text-[var(--expo-navy)] shadow-sm transition-[transform,box-shadow,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 active:translate-y-0 active:scale-[0.98] sm:w-auto dark:border-[#223354] dark:bg-[#101A2E] dark:text-[#F5F9FF] dark:hover:border-[#1479F5]">
              <span className="text-[15px] font-bold whitespace-nowrap min-[380px]:text-base">Conoce más</span>
              <ChevronDown className="h-4 w-4 stroke-[2.5] min-[380px]:h-5 min-[380px]:w-5" />
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }} className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2.5 sm:mt-10 sm:max-w-2xl sm:grid-cols-4 sm:gap-3 lg:mx-0">
            {benefits.map((item) => (
              <div key={item.text} className="flex min-h-14 min-w-0 items-center gap-2 rounded-xl border border-[var(--expo-line)] bg-white p-2.5 shadow-sm dark:border-[#223354] dark:bg-[#101A2E]">
                {item.icon}
                <span className="min-w-0 text-[11px] leading-tight font-bold text-[var(--expo-navy)] [overflow-wrap:anywhere] sm:text-xs dark:text-[#F5F9FF]">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
