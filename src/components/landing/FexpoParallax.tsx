"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Building2, Store, User } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { jakartaFont, soraFont, spaceMonoFont } from "./fonts";
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
          fetchPriority={number === 1 ? "high" : "auto"} sizes="100vw"
          draggable={false} className={styles.layerImage} />
      </div>
    </div>
  );
}

const SkyLayer = () => <SceneLayer number={1} name="sky" mouseStrength={0.15} />;
const CloudsLayer = () => <SceneLayer number={2} name="clouds" mouseStrength={0.3} />;
const SkylineLayer = () => <SceneLayer number={6} name="skyline" className={styles.skyline} mouseStrength={0.5} />;
const GroundLayer = () => <SceneLayer number={5} name="ground" className={styles.ground} mouseStrength={0.8} />;
const AirshipLayer = () => <SceneLayer number={4} name="airship" className={styles.airship} mouseStrength={1.2} />;

function ContentOverlay() {
  return (
    <div className={styles.content}>
      <div className={styles.copy}>
        <span className={styles.eyebrow} data-reveal="eyebrow"><span aria-hidden="true">✦</span> EL DESAFÍO EN LAS FERIAS HOY</span>
        <h2 className={styles.title} data-reveal="title">Una feria llena de <span className={styles.titleAccent}>oportunidades</span> no debería sentirse difícil de navegar.</h2>
        <p className={styles.subtitle} data-reveal="subtitle">Sin una capa digital integrada, cada paso del recorrido genera fricción.</p>
      </div>
      <div className={styles.cards} aria-label="Desafíos de cada participante">
        {problems.map((card) => {
          const Icon = card.icon;
          return (
            <article className={styles.card} data-card data-color={card.color} key={card.title}>
              <div className={styles.cardTop}>
                <span className={styles.cardIcon}><Icon aria-hidden="true" size={21} strokeWidth={2.5} /></span>
                <span className={styles.cardBadge}>{card.badge}</span>
              </div>
              <h3>{card.title}</h3>
              <p className={styles.cardProblem}>{card.problem}</p>
              <p className={styles.cardDetail}>{card.detail}</p>
              <span className={styles.cardArrow} aria-hidden="true"><ArrowRight size={16} strokeWidth={2.6} /></span>
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
        // The scene animates for 1 unit, then holds still so the last card can be read before the pin releases.
        const hold = 0.45;
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top top", end: `+=${(1 + hold) * 200}%`, scrub: 1.2, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: () => updateMouse() },
        });

        // Depth parallax: the nearer the layer, the more it travels between its start and rest pose.
        timeline
          .fromTo(layer("sky"), { yPercent: distance(-1, -0.5), scale: distance(1.06, 1.03) }, { yPercent: 0, scale: 1, duration: 1 }, 0)
          .fromTo(layer("clouds"), { yPercent: distance(-3, -1.5), xPercent: distance(-4, -1.5) }, { yPercent: 0, xPercent: 0, duration: 1 }, 0)
          // The city starts lower, hidden behind the fair buildings, and rises as the plaza pulls back.
          .fromTo(layer("skyline"), { yPercent: distance(20, 10), scale: distance(1.06, 1.03) }, { yPercent: 0, scale: 1, duration: 1 }, 0)
          // The airship enters from the left and settles on the right.
          .fromTo(layer("airship"), { xPercent: distance(-520, -380), yPercent: distance(30, 20), scale: distance(0.9, 0.95) }, { xPercent: 0, yPercent: 0, scale: 1, duration: 1 }, 0)
          // Plaza: starts zoomed in on the hall and pulls back, as if walking away, until the full image shows.
          .fromTo(layer("ground"), { scale: distance(1.9, 1.5) }, { scale: 1, duration: 0.9, ease: "power1.out" }, 0)
          .fromTo("[data-reveal='eyebrow']", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.18)
          .fromTo("[data-reveal='title']", { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.14 }, 0.31)
          .fromTo("[data-reveal='subtitle']", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.46)
          .fromTo("[data-card]", { y: 80, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.13, stagger: 0.12 }, 0.61)
          .to({}, { duration: hold }, 1);

        if (window.matchMedia("(pointer: fine) and (min-width: 768px)").matches) {
          // Hover parallax stays on for the whole section, including the final pose. Pointer is -0.5..0.5, so each
          // layer travels up to strength * range / 2 px; the image overscan in the CSS keeps its edges covered.
          const mouseRangeX = 44;
          const mouseRangeY = 26;
          let pointerX = 0;
          let pointerY = 0;
          const movers = [...section.querySelectorAll<HTMLElement>("[data-mouse-strength]")]
            .filter((element) => Number(element.dataset.mouseStrength) > 0)
            .map((element) => ({
              strength: Number(element.dataset.mouseStrength),
              x: gsap.quickTo(element, "x", { duration: 0.9, ease: "power2.out" }),
              y: gsap.quickTo(element, "y", { duration: 0.9, ease: "power2.out" }),
            }));
          updateMouse = () => {
            movers.forEach((mover) => {
              mover.x(pointerX * mover.strength * mouseRangeX);
              mover.y(pointerY * mover.strength * mouseRangeY);
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

          // Cards tilt towards the cursor; --mx/--my feed the spotlight gradient. The lift itself is CSS (`top`): GSAP
          // owns `transform` and also writes `translate: none` inline, so neither can be used for it.
          const cardCleanups = [...section.querySelectorAll<HTMLElement>("[data-card]")].map((card) => {
            gsap.set(card, { transformPerspective: 900 });
            const tiltX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
            const tiltY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
            const onCardMove = (event: PointerEvent) => {
              const bounds = card.getBoundingClientRect();
              const x = (event.clientX - bounds.left) / bounds.width;
              const y = (event.clientY - bounds.top) / bounds.height;
              tiltY((x - 0.5) * 16);
              tiltX(-(y - 0.5) * 12);
              card.style.setProperty("--mx", `${x * 100}%`);
              card.style.setProperty("--my", `${y * 100}%`);
            };
            const onCardLeave = () => { tiltX(0); tiltY(0); };
            card.addEventListener("pointermove", onCardMove);
            card.addEventListener("pointerleave", onCardLeave);
            return () => {
              card.removeEventListener("pointermove", onCardMove);
              card.removeEventListener("pointerleave", onCardLeave);
            };
          });

          return () => {
            section.removeEventListener("pointermove", onPointerMove);
            section.removeEventListener("pointerleave", onPointerLeave);
            cardCleanups.forEach((cleanup) => cleanup());
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
    <section id="problema" ref={sectionRef} className={`${styles.parallax} ${soraFont.variable} ${jakartaFont.variable} ${spaceMonoFont.variable} fexpo-parallax`} aria-label="El desafío en las ferias hoy">
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.artwork}>
          <SkyLayer /><CloudsLayer /><SkylineLayer /><AirshipLayer /><GroundLayer />
        </div>
      </div>
      <ContentOverlay />
    </section>
  );
}
