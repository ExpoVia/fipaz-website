import Image from "next/image";
import styles from "./EntrancePortal.module.css";

export const interiorImage = "/img/landing/entrance/interior-main.png";

export function EntranceSkip() {
  return <a className={styles.skip} data-entrance-skip href="#como-funciona">Saltar entrada</a>;
}

/** Coordinates are measured in p2-img5's original 1672 × 941 canvas. */
export function EntrancePortal() {
  return (
    <div className={styles.registration} data-entrance-registration>
      <div className={styles.detail} data-entrance-detail>
        <Image src="/img/landing/entrance/facade-detail.png" alt="" fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" loading="eager" />
      </div>
      <div className={styles.portal} data-entrance-portal>
        <div className={styles.aperture}>
          <div className={styles.interior} data-entrance-interior>
            <Image src={interiorImage} alt="" fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" loading="eager" className={styles.interiorImage} />
          </div>
          <div className={`${styles.door} ${styles.left}`} data-entrance-door="left"><i /></div>
          <div className={`${styles.door} ${styles.right}`} data-entrance-door="right"><i /></div>
        </div>
        <Image src="/img/landing/entrance/entrance-frame.png" alt="" fill sizes="100vw" loading="eager" className={styles.frame} />
        <div className={styles.glow} data-entrance-glow />
      </div>
    </div>
  );
}
