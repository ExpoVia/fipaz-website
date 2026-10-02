"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { User, Store, Building2, CheckCircle2, ArrowUpRight } from "lucide-react";
import { PixelStar } from "./PixelIcons";

export function ActorsSection() {
  const actors = [
    {
      id: "visitantes",
      href: "/demo",
      cta: "Probar como visitante",
      title: "Para Visitantes",
      subtitle: "Una propuesta de orientación y dinámicas para visitantes.",
      icon: <User aria-hidden="true" className="h-7 w-7 text-white" />,
      headerBg: "bg-[var(--expo-blue)]",
      badgeColor: "bg-[var(--expo-sky)] text-[var(--expo-navy)]",
      features: [
        "Exploración de stands ficticios por rubro.",
        "Mapa de referencia con rutas ilustrativas.",
        "Puntos de ejemplo por check-ins simulados.",
        "Misiones de muestra y propuestas de recompensa.",
        "Contenido de muestra para stands y promociones.",
        "Historial local de visitas de demostración.",
      ],
    },
    {
      id: "expositores",
      href: "/panel/mi-stand",
      cta: "Abrir panel de expositor",
      title: "Para Expositores",
      subtitle: "Funciones propuestas para marcas participantes.",
      icon: <Store aria-hidden="true" className="h-7 w-7 text-[var(--expo-navy)]" />,
      headerBg: "bg-[var(--expo-yellow)]",
      badgeColor: "bg-[var(--expo-pink)] text-[var(--expo-navy)]",
      features: [
        "Vista de ejemplo del perfil digital de una marca.",
        "Rutas ilustrativas para descubrir stands.",
        "Simulación de check-in; la validación NFC no está conectada.",
        "Ejemplos visuales de promociones, sin publicación en vivo.",
        "Datos de prospectos y visitas usados solo como muestra.",
        "Métricas de ejemplo, sin medición de asistencia real.",
      ],
    },
    {
      id: "organizadores",
      href: "/panel/metricas-evento",
      cta: "Abrir panel de organizador",
      title: "Para Organizadores",
      subtitle: "Herramientas conceptuales para organizar una feria.",
      icon: <Building2 aria-hidden="true" className="h-7 w-7 text-white" />,
      headerBg: "bg-[var(--expo-purple)]",
      badgeColor: "bg-[var(--expo-mint)] text-[var(--expo-navy)]",
      features: [
        "Propuesta de gestión de pabellones, zonas y categorías.",
        "Vista de ejemplo para administrar pabellones, zonas y categorías.",
        "Propuesta de campañas de ejemplo para visitantes.",
        "Vista ilustrativa de actividad, sin métricas de afluencia en vivo.",
        "Propuesta de experiencia para un evento.",
        "Concepto preparado para validarse en otros eventos.",
      ],
    },
  ];

  return (
    <section id="beneficios" className="scroll-mt-24 bg-[var(--expo-bg)] py-16 md:py-24 border-t-2 border-[var(--expo-line)] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-[var(--expo-navy)] bg-white px-3 py-1 rounded-md border-2 border-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] mb-3">
            <PixelStar className="w-3.5 h-3.5" />
            DATOS DE DEMOSTRACIÓN · FUNCIONES PROPUESTAS
          </span>

          <h2 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
            Visitante · Expositor · Organizador: una plataforma para varias ferias.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-700 font-medium">
            La demo presenta una propuesta para visitantes, marcas y organizadores. Sus interacciones y métricas son ilustrativas.
          </p>
        </div>

        {/* 3 Actor Cards */}
        <ul className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {actors.map((actor, idx) => (
            <motion.li
              key={actor.id}
              id={actor.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="scroll-mt-24 flex flex-col justify-between overflow-hidden rounded-2xl border-3 border-[var(--expo-navy)] bg-white shadow-[7px_7px_0_var(--expo-navy)] transition-all hover:-translate-y-1"
            >
              {/* Card Header Banner */}
              <div>
                <div className={`p-6 ${actor.headerBg} border-b-3 border-[var(--expo-navy)] text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl border-2 border-[var(--expo-navy)] bg-white/20 p-2.5 backdrop-blur-xs">
                      {actor.icon}
                    </div>
                    <span className={`font-mono text-[10px] font-black uppercase px-2.5 py-1 rounded border border-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] ${actor.badgeColor}`}>
                      AUDIENCIA 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 drop-shadow-xs">
                    {actor.title}
                  </h3>

                  <p className="mt-1 text-xs font-bold text-slate-800 leading-snug">
                    {actor.subtitle}
                  </p>
                </div>

                {/* Features List */}
                <ul className="p-6 space-y-3">
                  {actor.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-[var(--expo-green)] shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-slate-700 leading-normal">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Footer indicator */}
              <Link
                href={actor.href}
                className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between text-xs font-mono font-bold text-slate-500 transition-colors hover:bg-[var(--expo-bg)]"
              >
                <span>Plataforma ExpoVia</span>
                <span className="flex items-center gap-1 text-[var(--expo-blue)]">
                  {actor.cta} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

      </div>
    </section>
  );
}
