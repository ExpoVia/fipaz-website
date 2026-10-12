import Image from "next/image";
import type { ReactNode } from "react";
import { EntrancePortal, interiorImage } from "./EntrancePortal";
import styles from "./FexpoParallax.module.css";

function SceneLayer({ number, name, className = "", mouseStrength = 0, children }: {
  number: number; name: string; className?: string; mouseStrength?: number; children?: ReactNode;
}) {
  return <div className={`${styles.layer} ${className}`} data-layer={name}>
    <div className={styles.mouseLayer} data-mouse-strength={mouseStrength}>
      <Image src={`/img/landing/section2/p2-img${number}.png`} alt="" fill unoptimized loading="eager"
        fetchPriority={number === 1 ? "high" : "auto"} sizes="100vw" draggable={false} className={styles.layerImage} />
      {children}
    </div>
  </div>;
}

/** The entrance uses the original layers and their coordinate system, never a second exterior. */
export function FairScene() {
  return <div className={styles.scene} aria-hidden="true">
    <div className={styles.artwork} data-fair-artwork>
      <div className={styles.camera} data-fair-camera>
        <SceneLayer number={1} name="sky" mouseStrength={0.15} />
        <SceneLayer number={2} name="clouds" mouseStrength={0.3} />
        <SceneLayer number={6} name="skyline" className={styles.skyline} mouseStrength={0.5} />
        <SceneLayer number={4} name="airship" className={styles.airship} mouseStrength={1.2} />
        <SceneLayer number={5} name="ground" className={styles.ground} mouseStrength={0.8}>
          <EntrancePortal />
        </SceneLayer>
      </div>
    </div>
    {/* Screen-space interior. It continues the doorway's own pixels and opens to the full frame, so the exterior
        artwork never has to be zoomed to 30x+ to arrive inside. */}
    <div className={styles.iris} data-entrance-iris>
      <div className={styles.irisRoom} data-entrance-iris-room>
        <Image src={interiorImage} alt="" fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" loading="eager" draggable={false} className={styles.layerImage} />
      </div>
      <div className={styles.irisGlow} data-entrance-iris-glow />
    </div>
  </div>;
}
