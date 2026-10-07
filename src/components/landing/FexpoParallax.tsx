"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { Building2, Store, User } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./FexpoParallax.module.css";

const imageBase = "/img/landing/section2";

const problems = [
  { title: "Visitante", badge: "DESORIENTACIÓN", icon: User, color: "pink", problem: "No siempre sabe qué empresas existen, dónde están o cuál puede resolver lo que busca.", detail: "Se pierden buenas oportunidades por falta de guía clara dentro del recinto." },
  { title: "Expositor", badge: "SIN SEGUIMIENTO", icon: Store, color: "yellow", problem: "Recibe visitantes, pero muchas interacciones terminan sin seguimiento ni métricas claras.", detail: "Dificultad para convertir el tráfico del stand en prospectos calificados." },
  { title: "Organizador", badge: "FALTA DE CAPA DIGITAL", icon: Building2, color: "mint", problem: "Gestiona espacios, expositores y actividades sin una capa digital integrada para toda la experiencia.", detail: "Falta de analítica en tiempo real sobre el flujo real de asistentes." },
] as const;

type SceneLayerProps = { number: number; name: string; className?: string; mouseStrength?: number };

function SceneLayer({ number, name, className = "", mouseStrength = 0 }: SceneLayerProps) {
  return (
    <div className={`${styles.layer} ${className}`} data-layer={name}>
      <div className={styles.mouseLayer} data-mouse-strength={mouseStrength}>
        <Image src={`${imageBase}/p2-img${number}.png`} alt="" fill unoptimized loading="eager"
          fetchPriority={number === 1 || number === 4 ? "high" : "auto"} sizes="100vw"
          draggable={false} className={styles.layerImage} />
      </div>
    </div>
  );
}

const SkyLayer = () => <SceneLayer number={1} name="sky" mouseStrength={0.1} />;
const CloudsLayer = () => <SceneLayer number={2} name="clouds" mouseStrength={0.2} />;
const SkylineLayer = () => <SceneLayer number={3} name="skyline" mouseStrength={0.35} />;
const BuildingsLayer = () => <SceneLayer number={4} name="buildings" mouseStrength={0.5} />;
const PeopleLayer = () => <SceneLayer number={6} name="people" mouseStrength={0.85} />;
const ForegroundLayer = () => <SceneLayer number={7} name="foreground" mouseStrength={1.1} />;

function FloatingElementsLayer() {
  return (
    <>
      <SceneLayer number={5} name="floating-base" className={styles.floatingBase} mouseStrength={0.7} />
      <SceneLayer number={5} name="floating-cubes" className={styles.floatingCubes} mouseStrength={0.7} />
      <SceneLayer number={5} name="airship" className={styles.airship} mouseStrength={1} />
    </>
  );
}

function ContentOverlay() {
  return (
    <div className={styles.content}>
      <div className={styles.copy}>
        <span className={styles.eyebrow} data-reveal="eyebrow"><span aria-hidden="true">✦</span> EL DESAFÍO EN LAS FERIAS HOY</span>
        <h2 className={styles.title} data-reveal="title">Una feria llena de oportunidades no debería sentirse difícil de navegar.</h2>
        <p className={styles.subtitle} data-reveal="subtitle">En un evento multitudinario, la falta de una capa digital integrada genera fricción en cada paso del recorrido.</p>
      </div>
      <div className={styles.cards} aria-label="Desafíos de cada participante">
        {problems.map((card) => {
          const Icon = card.icon;
          return (
            <article className={styles.card} data-card key={card.title}>
              <div className={styles.cardTop}>
                <span className={styles.cardIcon} data-color={card.color}><Icon aria-hidden="true" size={21} strokeWidth={2.5} /></span>
                <span className={styles.cardBadge} data-color={card.color}>{card.badge}</span>
              </div>
              <h3>{card.title}</h3>
              <p className={styles.cardProblem}>{card.problem}</p>
              <p className={styles.cardDetail}>{card.detail}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function FexpoParallax() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ anchors: true, lerp: 0.12, smoothWheel: true, syncTouch: false });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const context = gsap.context(() => {
        const layer = (name: string) => section.querySelector<HTMLElement>(`[data-layer="${name}"]`)!;
        const mobile = () => window.matchMedia("(max-width: 767px)").matches;
        const distance = (desktop: number, small: number) => () => mobile() ? small : desktop;
        let updateMouse = () => {};
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top top", end: "+=200%", scrub: 1.2, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: () => updateMouse() },
        });

        timeline
          .fromTo(layer("sky"), { yPercent: distance(2, 1) }, { yPercent: 0, duration: 1 }, 0)
          .fromTo(layer("clouds"), { yPercent: distance(5, 2), xPercent: distance(-1.2, -0.3) }, { yPercent: 0, xPercent: 0, duration: 1 }, 0)
          .fromTo(layer("skyline"), { yPercent: distance(8, 3) }, { yPercent: 0, duration: 1 }, 0)
          .fromTo(layer("buildings"), { yPercent: distance(12, 5), scale: distance(1.02, 1.005) }, { yPercent: 0, scale: 1, duration: 1 }, 0)
          .fromTo(layer("floating-base"), { yPercent: distance(15, 5) }, { yPercent: 0, duration: 1 }, 0)
          .fromTo(layer("floating-cubes"), { yPercent: distance(18, 6), xPercent: distance(-1.1, -0.3) }, { yPercent: 0, xPercent: 0, duration: 1 }, 0)
          .fromTo(layer("airship"), { yPercent: distance(10, 4), xPercent: distance(7, 2) }, { yPercent: 0, xPercent: 0, duration: 1 }, 0)
          .fromTo(layer("people"), { yPercent: distance(18, 7) }, { yPercent: 0, duration: 1 }, 0)
          .fromTo(layer("foreground"), { yPercent: distance(25, 9), scale: distance(1.04, 1.01) }, { yPercent: 0, scale: 1, duration: 1 }, 0)
          .fromTo("[data-reveal='eyebrow']", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.18)
          .fromTo("[data-reveal='title']", { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.14 }, 0.31)
          .fromTo("[data-reveal='subtitle']", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.46)
          .fromTo("[data-card]", { y: 80, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.13, stagger: 0.12 }, 0.61);

        if (window.matchMedia("(pointer: fine) and (min-width: 768px)").matches) {
          let pointerX = 0;
          let pointerY = 0;
          const movers = [...section.querySelectorAll<HTMLElement>("[data-mouse-strength]")]
            .filter((element) => Number(element.dataset.mouseStrength) > 0)
            .map((element) => ({
              strength: Number(element.dataset.mouseStrength),
              x: gsap.quickTo(element, "x", { duration: 0.7, ease: "power2.out" }),
              y: gsap.quickTo(element, "y", { duration: 0.7, ease: "power2.out" }),
            }));
          updateMouse = () => {
            const strength = Math.max(0, 1 - (timeline.scrollTrigger?.progress ?? 0) / 0.85);
            movers.forEach((mover) => {
              mover.x(pointerX * mover.strength * 12 * strength);
              mover.y(pointerY * mover.strength * 9 * strength);
            });
          };
          const onPointerMove = (event: PointerEvent) => {
            const bounds = section.getBoundingClientRect();
            pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
            pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
            updateMouse();
          };
          const onPointerLeave = () => { pointerX = 0; pointerY = 0; updateMouse(); };
          section.addEventListener("pointermove", onPointerMove);
          section.addEventListener("pointerleave", onPointerLeave);
          return () => {
            section.removeEventListener("pointermove", onPointerMove);
            section.removeEventListener("pointerleave", onPointerLeave);
          };
        }
      }, section);

      ScrollTrigger.refresh();
      return () => {
        context.revert();
        gsap.ticker.remove(tick);
        lenis.off("scroll", ScrollTrigger.update);
        lenis.destroy();
      };
    });

    return () => media.revert();
  }, []);

  return (
    <section id="problema" ref={sectionRef} className={`${styles.parallax} fexpo-parallax`} aria-label="El desafío en las ferias hoy">
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.artwork}>
          <SkyLayer /><CloudsLayer /><SkylineLayer />
          <BuildingsLayer />
          <FloatingElementsLayer /><PeopleLayer /><ForegroundLayer />
        </div>
      </div>
      <ContentOverlay />
    </section>
  );
}
