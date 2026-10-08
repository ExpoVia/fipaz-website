import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const entranceDuration = 1.95;
// Original image: door centre (836, 557); ground overscan 1.06, pivot 52%, final scale 2.
const entranceY = 0.52 + (0.5 + (0.592 - 0.5) * 1.06 - 0.52) * 2;

/** Appends the entrance to its owner's timeline; all geometry remains reversible on scroll. */
export function appendEntrance(timeline: gsap.core.Timeline, section: HTMLElement, start: number) {
  const find = (selector: string) => section.querySelector<HTMLElement>(selector)!;
  const camera = find("[data-fair-camera]");
  const ground = find('[data-layer="ground"]');
  const artwork = find("[data-fair-artwork]");
  const interior = find("[data-entrance-interior]");
  const room = { scale: 0.4 };
  let width = 1;
  let artworkWidth = 1;
  let finalScale = 20;

  // These layout measurements run only on setup/refresh, never during scrolling.
  const measure = () => {
    width = section.clientWidth;
    artworkWidth = artwork.clientWidth;
    finalScale = section.clientHeight * 1.2 / (artwork.clientHeight * 0.029 * 1.06 * 2);
    gsap.set(interior, { width, height: section.clientHeight });
  };
  measure();
  gsap.set(camera, { transformOrigin: `50% ${entranceY * 100}%` });
  gsap.set(interior, { xPercent: -50, yPercent: -50 });
  const setRoomScaleX = gsap.quickSetter(interior, "scaleX");
  const setRoomScaleY = gsap.quickSetter(interior, "scaleY");
  const render = () => {
    const worldScale = Number(gsap.getProperty(camera, "scaleX")) * Number(gsap.getProperty(ground, "scaleX")) * 1.06;
    const apertureWidth = artworkWidth * 0.0375 * worldScale;
    // The near door grows faster than the room behind it. One image stays mounted throughout.
    const roomScale = Math.max(room.scale, Math.min(1.03, apertureWidth / width * 1.12));
    setRoomScaleX(roomScale / worldScale);
    setRoomScaleY(roomScale / worldScale);
  };
  const previousUpdate = timeline.eventCallback("onUpdate");
  timeline.eventCallback("onUpdate", function (this: gsap.core.Timeline) { previousUpdate?.call(this); render(); });
  ScrollTrigger.addEventListener("refreshInit", measure);

  timeline.addLabel("entrance", start)
    .to('[data-entrance-skip]', { autoAlpha: 1, duration: 0.05 }, start)
    .to(ground, { scale: 2, duration: 0.48, ease: "power1.inOut" }, start + 0.08)
    .to('[data-layer="skyline"]', { yPercent: 12, duration: 0.48, ease: "power1.inOut" }, start + 0.08)
    .to('[data-entrance-detail]', { opacity: 1, duration: 0.34 }, start + 0.24)
    .to('[data-entrance-people]', { opacity: 1, duration: 0.34 }, start + 0.24)
    .to('[data-entrance-portal]', { autoAlpha: 1, duration: 0.18 }, start + 0.37)
    .to(camera, { yPercent: -(entranceY - 0.5) * 100, duration: 0.65, ease: "power1.inOut" }, start + 0.44)
    .to(camera, { scale: 2.9, duration: 0.43, ease: "power1.inOut" }, start + 0.56)
    .addLabel("doors", start + 0.88)
    .to('[data-entrance-door="left"]', { xPercent: -103, duration: 0.28, ease: "power2.inOut" }, start + 0.88)
    .to('[data-entrance-door="right"]', { xPercent: 103, duration: 0.28, ease: "power2.inOut" }, start + 0.88)
    .to(camera, { scale: 3.2, duration: 0.32, ease: "none" }, start + 0.99)
    .to(room, { scale: 0.62, duration: 0.5, ease: "none" }, start + 0.82)
    .to('[data-entrance-glow]', { opacity: 0.24, duration: 0.18 }, start + 0.9)
    .to('[data-entrance-glow]', { opacity: 0.08, duration: 0.17 }, start + 1.08)
    .addLabel("threshold", start + 1.31)
    .to('[data-entrance-people]', { opacity: 0, duration: 0.27 }, start + 1.28)
    .to(camera, { scale: () => finalScale, duration: 0.48, ease: "power2.inOut" }, start + 1.31)
    .to(room, { scale: 1.03, duration: 0.48, ease: "power1.inOut" }, start + 1.31)
    .to('[data-entrance-glow]', { opacity: 0.92, scale: 1.25, duration: 0.16, ease: "power1.in" }, start + 1.4)
    .to('[data-entrance-glow]', { opacity: 0, duration: 0.2, ease: "power1.out" }, start + 1.56)
    .to('[data-entrance-exit]', { opacity: 1, duration: 0.18 }, start + 1.75)
    .addLabel("inside", start + 1.8)
    .to('[data-entrance-skip]', { autoAlpha: 0, duration: 0.05 }, start + 1.85)
    .to({}, { duration: 0.15 }, start + 1.8);
  render();
  return () => ScrollTrigger.removeEventListener("refreshInit", measure);
}
