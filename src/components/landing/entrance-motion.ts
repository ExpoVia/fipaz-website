import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const entranceDuration = 1.95;
// Dwell time: the pinned scene keeps the finished interior and its copy for one more viewport of scroll (a timeline
// unit is 200% of its height) before releasing.
export const arrivalOverlap = 0.5;
// Original image: door centre (836, 557); ground overscan 1.06, pivot 52%, final scale 2.
const entranceY = 0.52 + (0.5 + (0.592 - 0.5) * 1.06 - 0.52) * 2;
// The exterior never zooms past this. Beyond it the interior takes over in screen space (the iris), so the 1900px
// artwork is never rasterised at 30x+ with a dozen composited layers, which is what shattered it into tiles on GPUs.
const cameraCeiling = 4.6;
// Portal aperture inside the door frame: 3.75% × 2.9% of the artwork, inset 3% sides / 4% top / 2% bottom.
const apertureShare = 0.94;

/** Appends the entrance to its owner's timeline; all geometry remains reversible on scroll. */
export function appendEntrance(timeline: gsap.core.Timeline, section: HTMLElement, start: number) {
  const find = (selector: string) => section.querySelector<HTMLElement>(selector)!;
  const camera = find("[data-fair-camera]");
  const ground = find('[data-layer="ground"]');
  const artwork = find("[data-fair-artwork]");
  const interior = find("[data-entrance-interior]");
  const iris = find("[data-entrance-iris]");
  const irisRoom = find("[data-entrance-iris-room]");
  const scene = artwork.parentElement!;
  const room = { scale: 0.4 };
  const irisState = { open: 0 };
  let width = 1;
  let height = 1;
  let artworkWidth = 1;
  let artworkHeight = 1;
  let deep = false;

  // These layout measurements run only on setup/refresh, never during scrolling.
  const measure = () => {
    width = section.clientWidth;
    height = section.clientHeight;
    artworkWidth = artwork.clientWidth;
    artworkHeight = artwork.clientHeight;
    gsap.set(interior, { width, height });
  };
  measure();
  gsap.set(camera, { transformOrigin: `50% ${entranceY * 100}%` });
  gsap.set(interior, { xPercent: -50, yPercent: -50 });
  const setRoomScaleX = gsap.quickSetter(interior, "scaleX");
  const setRoomScaleY = gsap.quickSetter(interior, "scaleY");
  const setIrisScaleX = gsap.quickSetter(irisRoom, "scaleX");
  const setIrisScaleY = gsap.quickSetter(irisRoom, "scaleY");
  const setIrisY = gsap.quickSetter(irisRoom, "y", "px");
  const render = () => {
    const worldScale = Number(gsap.getProperty(camera, "scaleX")) * Number(gsap.getProperty(ground, "scaleX")) * 1.06;
    const apertureWidth = artworkWidth * 0.0375 * worldScale;
    // The near door grows faster than the room behind it. One image stays mounted throughout.
    const roomScale = Math.max(room.scale, Math.min(1.03, apertureWidth / width * 1.12));
    setRoomScaleX(roomScale / worldScale);
    setRoomScaleY(roomScale / worldScale);

    // Screen-space interior: from the doorway's own rectangle it opens out to the full frame. Once the camera is
    // centred on the door, the aperture's centre is the section's centre, nudged down by the portal's 4%/2% insets.
    setIrisScaleX(roomScale);
    setIrisScaleY(roomScale);
    const portalHeight = artworkHeight * 0.029 * worldScale;
    const openWidth = apertureWidth * apertureShare;
    const openHeight = portalHeight * apertureShare;
    const centreY = height / 2 + portalHeight * 0.01;
    const closed = 1 - irisState.open;
    setIrisY(portalHeight * 0.01 * closed);
    const sides = Math.max(0, (width - openWidth) / 2) * closed;
    const top = Math.max(0, centreY - openHeight / 2) * closed;
    const bottom = Math.max(0, height - centreY - openHeight / 2) * closed;
    iris.style.clipPath = `inset(${top.toFixed(1)}px ${sides.toFixed(1)}px ${bottom.toFixed(1)}px ${sides.toFixed(1)}px)`;

    // Once the doors open the facade fills the frame; layers behind it can no longer be seen, so stop painting them.
    const nowDeep = timeline.time() >= start + 0.88;
    if (nowDeep !== deep) { deep = nowDeep; scene.toggleAttribute("data-entrance-deep", deep); }
  };
  const previousUpdate = timeline.eventCallback("onUpdate");
  timeline.eventCallback("onUpdate", function (this: gsap.core.Timeline) { previousUpdate?.call(this); render(); });
  ScrollTrigger.addEventListener("refreshInit", measure);

  timeline.addLabel("entrance", start)
    .to('[data-entrance-skip]', { autoAlpha: 1, duration: 0.05 }, start)
    .to(ground, { scale: 2, duration: 0.48, ease: "power1.inOut" }, start + 0.08)
    .to('[data-layer="skyline"]', { yPercent: 12, duration: 0.48, ease: "power1.inOut" }, start + 0.08)
    .to('[data-entrance-detail]', { autoAlpha: 1, duration: 0.34 }, start + 0.24)
    .to('[data-entrance-people]', { autoAlpha: 1, duration: 0.34 }, start + 0.24)
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
    .to('[data-entrance-people]', { autoAlpha: 0, duration: 0.27 }, start + 1.28)
    .to(camera, { scale: cameraCeiling, duration: 0.48, ease: "power2.inOut" }, start + 1.31)
    .to(room, { scale: 1.03, duration: 0.48, ease: "power1.inOut" }, start + 1.31)
    // The iris takes over from the in-world interior on the exact same pixels, then opens to the full frame.
    .set(iris, { autoAlpha: 1 }, start + 1.31)
    .to(irisState, { open: 1, duration: 0.48, ease: "power2.inOut" }, start + 1.31)
    .to('[data-entrance-iris-glow]', { opacity: 0.92, scale: 1.25, duration: 0.16, ease: "power1.in" }, start + 1.4)
    .to('[data-entrance-iris-glow]', { opacity: 0, duration: 0.2, ease: "power1.out" }, start + 1.56)
    .to('[data-entrance-exit]', { opacity: 1, duration: 0.18 }, start + 1.75)
    .addLabel("inside", start + 1.8)
    .to('[data-entrance-skip]', { autoAlpha: 0, duration: 0.05 }, start + 1.85)
    .to({}, { duration: 0.15 }, start + 1.8);
  render();
  return () => {
    ScrollTrigger.removeEventListener("refreshInit", measure);
    scene.removeAttribute("data-entrance-deep");
  };
}
