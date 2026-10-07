import { Fragment, type CSSProperties } from "react";
import { solutionCopy, solutionSteps } from "./SolutionSection";
import scene from "./FexpoParallax.module.css";
import styles from "./SolutionOverlay.module.css";

// Second act of the FexpoParallax scene. Hidden until the scroll timeline reveals it; FexpoParallax drives it
// through the data-solution-* attributes.
export function SolutionOverlay() {
  const words = solutionCopy.title.split(" ");

  return (
    <div className={styles.solution} data-solution>
      <div className={scene.copy}>
        <span className={scene.eyebrow} data-solution-reveal="eyebrow"><span aria-hidden="true">✦</span> {solutionCopy.eyebrow}</span>
        <h2 className={`${scene.title} ${styles.heading}`} aria-label={solutionCopy.title}>
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className={styles.word} aria-hidden="true">
                <span className={`${styles.wordInner} ${word === solutionCopy.accentWord ? scene.titleAccent : ""}`} data-solution-word>{word}</span>
              </span>
              {index < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </h2>
        <p className={scene.subtitle} data-solution-reveal="subtitle">{solutionCopy.subtitle}</p>
      </div>
      <ol className={styles.steps} aria-label="Pasos del recorrido">
        {solutionSteps.map((step, index) => (
          <li className={styles.step} data-step data-tilt style={{ "--accent": step.accent } as CSSProperties} key={step.name}>
            <div className={styles.stepTop}>
              <span className={styles.stepIcon}>{step.icon}</span>
              <span className={styles.stepNumber}>0{index + 1}</span>
            </div>
            <h3>{step.name}</h3>
            <p className={styles.stepDesc}>{step.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
