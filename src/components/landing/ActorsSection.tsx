"use client";

import React from "react";
import { motion } from "motion/react";
import { User, Store, Building2, CheckCircle2, ArrowUpRight } from "lucide-react";
import { PixelStar } from "./PixelIcons";

export function ActorsSection() {
  const actors = [
    {
      id: "visitantes",
      title: "Para Visitantes",
      subtitle: "Orientación, diversión y beneficios reales en cada paso.",
      icon: <User aria-hidden="true" className="h-7 w-7 text-white" />,
      headerBg: "bg-[var(--expo-blue)]",
      badgeColor: "bg-[var(--expo-sky)] text-[var(--expo-navy)]",
      features: [
        "Descubrimiento inteligente de stands por rubro y afinidad.",
        "Mapa digital interactivo con rutas optimizadas paso a paso.",
        "Acumulación de puntos por registrar check-ins con NFC.",
        "Misiones temáticas y desbloqueo de recompensas exclusivas.",
        "Acceso instantáneo a catálogos, ofertas y promociones del stand.",
        "Historial personal de visitas guardado en un solo perfil.",
      ],
    },
    {
      id: "expositores",
      title: "Para Expositores",
      subtitle: "Captura de leads, visibilidad y tráfico calificado.",
      icon: <Store aria-hidden="true" className="h-7 w-7 text-[var(--expo-navy)]" />,
      headerBg: "bg-[var(--expo-yellow)]",
      badgeColor: "bg-[var(--expo-pink)] text-[var(--expo-navy)]",
      features: [
        "Perfil digital de marca accesible antes, durante y después.",
        "Aumento comprobable de tráfico físico guiado mediante rutas.",
        "Registro inmediato de visitas mediante placas NFC con validación.",
        "Publicación de ofertas relámpago dirigidas a visitantes cercanos.",
        "Captura de prospectos y contactos calificados con seguimiento.",
        "Métricas claras sobre horas pico, permanencia e impacto.",
      ],
    },
    {
      id: "organizadores",
      title: "Para Organizadores",
      subtitle: "Control, analítica en vivo y una capa digital de primer nivel.",
      icon: <Building2 aria-hidden="true" className="h-7 w-7 text-white" />,
      headerBg: "bg-[var(--expo-purple)]",
      badgeColor: "bg-[var(--expo-mint)] text-[var(--expo-navy)]",
      features: [
        "Gestión centralizada y actualización dinámica del mapa del evento.",
        "Administración simplificada de pabellones, zonas y categorías.",
        "Campañas de gamificación globales para dinamizar zonas frías.",
        "Métricas consolidadas de afluencia y flujo de personas en tiempo real.",
        "Experiencia uniforme que eleva el valor percibido del evento.",
        "Infraestructura escalable lista para múltiples ferias y recintos.",
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
            VALOR MULTILATERAL
          </span>

          <h2 className="text-3xl font-black tracking-tight text-[var(--expo-navy)] sm:text-5xl">
            Soluciones integradas para cada actor de la feria.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-700 font-medium">
            ExpoVia crea un círculo virtuoso que beneficia simultáneamente al público asistente, a las marcas participantes y a la empresa organizadora.
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
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                <span>Plataforma ExpoVia</span>
                <span className="flex items-center gap-1 text-[var(--expo-blue)]">
                  Beneficios <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.li>
          ))}
        </ul>

      </div>
    </section>
  );
}
