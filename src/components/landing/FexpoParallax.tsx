"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Building2, Store, User } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { jakartaFont, soraFont, spaceMonoFont } from "./fonts";
import { SolutionOverlay } from "./SolutionOverlay";
import { journeyOverlayQuery } from "./journey/journey-data";
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
            <article className={styles.card} data-card data-tilt data-color={card.color} key={card.title}>
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

    media.add({ motion: "(prefers-reduced-motion: no-preference)", overlay: journeyOverlayQuery }, ({ conditions }) => {
      if (!conditions?.motion) return;
      const withSolution = Boolean(conditions.overlay);
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
        // One pinned scroll, two acts over the same scene. Timeline units: 0-1 is the problem act (scene pulls back, copy and
        // cards come in); it rests for `rest`, then fades out while the background keeps drifting, and the solution act
        // (SolutionOverlay) comes in over the same artwork. Scroll length is 200% of the viewport per unit.
        const rest = 0.15;
        const exitAt = 1 + rest;
        const enterAt = exitAt + 0.13;
        const total = withSolution ? 2.25 : 1.15;
        const solution = section.querySelector<HTMLElement>("[data-solution]")!;
        solution.inert = true;
        const cardIntro = withSolution ? gsap.fromTo("[data-solution] [data-journey-intro]", { opacity: 0, y: 35 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.55, ease: "power2.out", paused: true, clearProps: "transform,opacity" }) : null;
        let cardsRevealed = false;
        let solutionActive = false;
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top top", end: `+=${total * 200}%`, scrub: 1.2, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: () => updateMouse() },
          onUpdate() {
            const ready = withSolution && this.time() >= enterAt + 0.32;
            solution.inert = !ready;
            if (ready && !cardsRevealed) { cardIntro?.play(); cardsRevealed = true; }
            if (!ready && solutionActive) solution.dispatchEvent(new Event("journey-hide"));
            solutionActive = ready;
          },
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
          .fromTo("[data-card]", { y: 80, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.13, stagger: 0.12 }, 0.61);

        if (withSolution) {
          timeline
          // Act 1 leaves: copy first, then the cards, each drifting up as it fades.
          .to(["[data-reveal='eyebrow']", "[data-reveal='title']", "[data-reveal='subtitle']"], { autoAlpha: 0, y: -36, duration: 0.14, stagger: 0.04 }, exitAt)
          .to("[data-card]", { autoAlpha: 0, y: -48, scale: 0.96, duration: 0.14, stagger: 0.05 }, exitAt + 0.04)
          // The scene keeps moving underneath: slow push-in, the city drifts up, clouds slide, the airship flies off.
          .to(layer("ground"), { scale: 1.05, duration: 0.85, ease: "power1.inOut" }, exitAt)
          .to(layer("skyline"), { yPercent: -2.5, duration: 0.85 }, exitAt)
          .to(layer("clouds"), { xPercent: distance(3, 1.5), duration: 0.85 }, exitAt)
          .to(layer("airship"), { xPercent: 190, yPercent: -20, duration: 0.7, ease: "power1.in" }, exitAt)

          // Act 2 arrives over the same scene; its cards enter once and then respond only to interaction.
          .fromTo("[data-solution]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, enterAt)
          .fromTo("[data-solution-reveal='eyebrow']", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.1 }, enterAt)
          .fromTo("[data-solution-reveal='title']", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" }, enterAt + 0.05)
          .fromTo("[data-solution-reveal='subtitle']", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.1 }, enterAt + 0.26)
          .to({}, { duration: 0.01 }, total - 0.01);
        } else {
          timeline.to({}, { duration: 0.01 }, total - 0.01);
        }

        if (window.matchMedia("(pointer: fine) and (min-width: 768px)").matches) {
          // The artwork responds to the mouse in the first act and settles before the demos appear.
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
            // The product demo rests while the visitor reads and interacts with its controls.
            const strength = withSolution ? Math.max(0, 1 - Math.max(0, timeline.time() - exitAt) / 0.32) : 1;
            movers.forEach((mover) => {
              mover.x(pointerX * mover.strength * mouseRangeX * strength);
              mover.y(pointerY * mover.strength * mouseRangeY * strength);
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
          const cardCleanups = [...section.querySelectorAll<HTMLElement>("[data-tilt]")].map((card) => {
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
    <section id="problema" ref={sectionRef} className={`${styles.parallax} ${soraFont.variable} ${jakartaFont.variable} ${spaceMonoFont.variable} fexpo-parallax`} aria-label="El desafío en las ferias hoy y cómo lo resuelve Fexpo">
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.artwork}>
          <SkyLayer /><CloudsLayer /><SkylineLayer /><AirshipLayer /><GroundLayer />
        </div>
      </div>
      <ContentOverlay />
      <SolutionOverlay />
    </section>
  );
}
