"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FairScene } from "./FairScene";
import { EntranceSkip, interiorImage } from "./EntrancePortal";
import { appendEntrance, entranceDuration } from "./entrance-motion";
import { journeyOverlayQuery } from "./journey/journey-data";
import styles from "./FexpoEntranceExperience.module.css";

/** On touch/small screens the journey precedes this stage in normal document flow. */
export function FexpoEntranceExperience() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ overlay: journeyOverlayQuery, motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
      if (conditions?.overlay || !conditions?.motion) return;
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { id: "fexpo-entrance", trigger: section, start: "top top", end: "+=300%", pin: true, scrub: 1.15, anticipatePin: 1, invalidateOnRefresh: true },
      });
      const cleanup = appendEntrance(timeline, section, 0);
      timeline.duration(entranceDuration);
      return cleanup;
    }, section);
    return () => media.revert();
  }, []);

  return <section ref={ref} className={styles.standalone} aria-label="Entrada al interior de la feria Fexpo">
    <FairScene />
    <EntranceSkip />
    <div className={styles.still}>
      <Image src={interiorImage} alt="Interior de Fexpo: recepción, stands y visitantes en un pabellón blanco, azul y amarillo." fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" />
    </div>
    <div className={styles.exit} data-entrance-exit aria-hidden="true" />
  </section>;
}
