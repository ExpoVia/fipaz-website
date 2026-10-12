"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Scroll and pointer motion for the landing sections below the entrance. `FexpoParallax` owns the single Lenis
 * instance and feeds it to ScrollTrigger, so everything here simply creates triggers against the window scroll.
 *
 * Rules the sections rely on:
 * - Markup is complete and visible without this file; scripts only add the "from" state when a trigger is armed.
 * - Nothing runs under `prefers-reduced-motion: reduce`.
 * - GSAP never targets an element that also owns a CSS `translate` hover (see landing-fx.module.css): it folds the
 *   individual transform properties into `transform` and would silence the hover. It drives the wrapper instead.
 */

/** GSAP twin of `--ease-out` in globals.css, so scripted and CSS motion share one curve. */
export const UI_OUT = "uiOut";

let registered = false;
function register() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create(UI_OUT, "0.23, 1, 0.32, 1");
  registered = true;
}

export type FxSetup = (root: HTMLElement, finePointer: boolean) => void | (() => void);

/** Runs `setup` once the section is mounted and motion is allowed. `setup` must be a stable (module-level) function. */
export function useScrollFx(ref: RefObject<HTMLElement | null>, setup: FxSetup) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    register();
    const media = gsap.matchMedia();
    media.add(
      { motion: "(prefers-reduced-motion: no-preference)", fine: "(hover: hover) and (pointer: fine)" },
      ({ conditions }) => {
        if (!conditions?.motion) return;
        return setup(root, Boolean(conditions.fine));
      },
      root,
    );
    return () => media.revert();
  }, [ref, setup]);
}

/** Words rise through a line mask when the heading enters. Re-splits itself on resize and font load. */
export function revealHeading(heading: HTMLElement, start = "top 86%") {
  const split = SplitText.create(heading, {
    type: "lines,words",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.words, {
        yPercent: 108,
        duration: 0.9,
        ease: UI_OUT,
        stagger: 0.05,
        scrollTrigger: { trigger: heading, start, once: true },
      }),
  });
  return () => split.revert();
}

/** Each `[data-fx-depth]` layer drifts by its own distance (px) while the section crosses the viewport. */
export function depthLayers(root: HTMLElement) {
  gsap.utils.toArray<HTMLElement>("[data-fx-depth]", root).forEach((layer) => {
    const distance = Number(layer.dataset.fxDepth) || 0;
    gsap.fromTo(
      layer,
      { y: -distance },
      { y: distance, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.6 } },
    );
  });
}

/** Pointer-follow tilt for a card. Returns its disposer. Call only for fine pointers. */
export function tilt(el: HTMLElement, max = 3) {
  gsap.set(el, { transformPerspective: 900 });
  const rotateX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
  const rotateY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
  const move = (event: PointerEvent) => {
    const box = el.getBoundingClientRect();
    rotateY(((event.clientX - box.left) / box.width - 0.5) * max * 2);
    rotateX(-((event.clientY - box.top) / box.height - 0.5) * max * 2);
  };
  const leave = () => {
    rotateX(0);
    rotateY(0);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

/** The element leans toward the pointer while it is near, and settles back on leave. Fine pointers only. */
export function magnetic(el: HTMLElement, pull = 0.3) {
  const x = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3" });
  const y = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3" });
  const move = (event: PointerEvent) => {
    const box = el.getBoundingClientRect();
    x((event.clientX - (box.left + box.width / 2)) * pull);
    y((event.clientY - (box.top + box.height / 2)) * pull);
  };
  const leave = () => {
    x(0);
    y(0);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

/** Collects disposers so a setup function can return one cleanup. */
export function disposer() {
  const list: Array<() => void> = [];
  return {
    add(fn: () => void) {
      list.push(fn);
    },
    run() {
      list.splice(0).forEach((fn) => fn());
    },
  };
}
