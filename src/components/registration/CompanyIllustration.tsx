import styles from "./company-illustration.module.css";

interface CompanyIllustrationProps {
  /** Qué tan completo está el paso 1 del formulario, de 0 a 1. Hace crecer los gráficos y, al llegar a 1, aparece la insignia de verificado. */
  progress?: number;
  /** Tecleo reciente en el formulario: muestra una burbuja de "escribiendo" junto a la laptop. */
  typing?: boolean;
  /** Paso actual del formulario (0, 1 o 2). Al entrar al paso 1 ("Tipo de participación") el personaje saluda. */
  step?: number;
}

const clampBar = (value: number) => Math.min(1, Math.max(0.14, value));

/**
 * Escena "registro de empresa": expositora en su stand con laptop y tarjetas de
 * interfaz flotando. Va inline (no `<img>`) a propósito, por tres motivos:
 * - se apoya en el degradado de la página en vez de llevar su propio fondo blanco,
 *   así que se integra con el resto de la pantalla en lugar de leerse como una foto recortada;
 * - reacciona a `progress`/`typing` con transiciones CSS directas sobre sus atributos
 *   (fill, stroke, transform), algo que un `<img>` externo no permite;
 * - sus animaciones son CSS dentro del documento, así que el reset global de
 *   `prefers-reduced-motion` (globals.css) las alcanza igual que a cualquier otro nodo.
 * Estilo y paleta: ver el pie de la pantalla de registro (`RegistrationForm`).
 */
export function CompanyIllustration({ progress = 0, typing = false, step = 0 }: CompanyIllustrationProps) {
  const bar1 = clampBar(progress * 1.2);
  const bar2 = clampBar(progress);
  const bar3 = clampBar(progress * 0.75 + 0.15);
  const complete = progress >= 0.999;
  // Un único gesto, no un bucle: al entrar al paso 2 el personaje saluda y vuelve a su postura.
  const greeting = step === 1;

  return (
    <svg viewBox="0 0 640 460" width="640" height="460" fill="none" role="img" aria-hidden="true" className="h-auto w-full">
      <defs>
        <linearGradient id="reg-panel" x1="160" y1="90" x2="480" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E7F3FF" />
          <stop offset="100%" stopColor="#A9D0FF" />
        </linearGradient>
        <radialGradient id="reg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A9D0FF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#A9D0FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Resplandor ambiental: funde la escena con el fondo de la página, sin borde de "tarjeta". */}
      <ellipse cx="330" cy="210" rx="300" ry="220" fill="url(#reg-glow)" className={styles.glow} />

      {/* Confeti geométrico de fondo */}
      <g>
        <rect x="-7" y="-7" width="14" height="14" rx="3" fill="#A9D0FF" opacity="0.4" transform="translate(68,58) rotate(45)" className={styles.driftA} />
        <rect x="-6" y="-6" width="12" height="12" rx="3" fill="#1479F5" opacity="0.25" transform="translate(596,332) rotate(45)" className={styles.driftB} />
        <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#FFCA35" opacity="0.55" transform="translate(582,38) rotate(45)" className={styles.driftA} />
        <circle cx="238" cy="46" r="4" fill="#A9D0FF" opacity="0.5" className={styles.shimmer} />
        <circle cx="502" cy="362" r="5" fill="#A9D0FF" opacity="0.4" className={styles.shimmer} />
      </g>

      {/* Sombra de piso */}
      <ellipse cx="322" cy="432" rx="210" ry="13" fill="#12264E" opacity="0.06" />

      {/* Planta: se mece con una leve brisa */}
      <g className={styles.sway}>
        <ellipse cx="120" cy="344" rx="13" ry="34" fill="#1479F5" stroke="#12264E" strokeWidth="2" transform="rotate(-16 120 390)" />
        <ellipse cx="120" cy="340" rx="13" ry="38" fill="#A9D0FF" stroke="#12264E" strokeWidth="2" transform="rotate(5 120 390)" />
        <ellipse cx="120" cy="346" rx="11" ry="32" fill="#1479F5" stroke="#12264E" strokeWidth="2" opacity="0.9" transform="rotate(24 120 390)" />
        <polygon points="90,390 150,390 142,428 98,428" fill="#A9D0FF" stroke="#12264E" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="85" y="384" width="65" height="12" rx="6" fill="#E7F3FF" stroke="#12264E" strokeWidth="2" />
      </g>

      {/* Pared del stand */}
      <g>
        <rect x="160" y="90" width="320" height="230" rx="28" fill="url(#reg-panel)" stroke="#12264E" strokeWidth="3" />

        <rect x="-11" y="-11" width="22" height="22" rx="4" fill="#1479F5" transform="translate(320,124) rotate(45)" className={styles.shimmer} />
        <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#A9D0FF" stroke="#12264E" strokeWidth="1.5" transform="translate(300,156) rotate(45)" />
        <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#FFCA35" transform="translate(340,156) rotate(45)" />

        <rect x="240" y="194" width="160" height="10" rx="5" fill="#FFFFFF" opacity="0.85" />
        <rect x="265" y="212" width="110" height="8" rx="4" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* Persona detrás del mostrador: respira y parpadea de a ratos; al entrar al paso 2, saluda */}
      <g className={greeting ? styles.greet : undefined}>
        <path d="M362,212 Q332,232 322,268" stroke="#12264E" strokeWidth="26" strokeLinecap="round" fill="none" />
        <path d="M362,212 Q332,232 322,268" stroke="#1479F5" strokeWidth="20" strokeLinecap="round" fill="none" />
        <circle cx="320" cy="270" r="11" fill="#E7F3FF" stroke="#12264E" strokeWidth="3" />

        {/* Brazo derecho: se alza y saluda solo al entrar al paso 2 (gira desde el hombro). */}
        <g className={greeting ? styles.waveArm : undefined}>
          <path d="M418,214 Q442,238 436,272" stroke="#12264E" strokeWidth="26" strokeLinecap="round" fill="none" />
          <path d="M418,214 Q442,238 436,272" stroke="#1479F5" strokeWidth="20" strokeLinecap="round" fill="none" />
          <circle cx="436" cy="274" r="11" fill="#E7F3FF" stroke="#12264E" strokeWidth="3" />
        </g>

        <g className={styles.breathe}>
          <rect x="350" y="195" width="80" height="110" rx="26" fill="#1479F5" stroke="#12264E" strokeWidth="3" />
          <rect x="382" y="198" width="16" height="22" rx="4" fill="#FFCA35" stroke="#12264E" strokeWidth="2" />

          <rect x="382" y="180" width="16" height="20" fill="#E7F3FF" stroke="#12264E" strokeWidth="2.5" />
          <circle cx="390" cy="150" r="34" fill="#E7F3FF" stroke="#12264E" strokeWidth="3" />
          <rect x="360" y="108" width="60" height="38" rx="19" fill="#12264E" />
          <circle cx="378" cy="152" r="3.5" fill="#12264E" className={styles.blink} />
          <circle cx="402" cy="152" r="3.5" fill="#12264E" className={styles.blink} />
          <path d="M378,164 Q390,172 402,164" stroke="#12264E" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Mostrador */}
      <g>
        <rect x="170" y="300" width="300" height="70" rx="14" fill="#A9D0FF" stroke="#12264E" strokeWidth="3" />
        <rect x="162" y="288" width="316" height="18" rx="9" fill="#FFFFFF" stroke="#12264E" strokeWidth="3" />
        <rect x="-9" y="-9" width="18" height="18" rx="3" fill="#FFFFFF" opacity="0.9" stroke="#12264E" strokeWidth="1.5" transform="translate(320,335) rotate(45)" />
      </g>

      {/* Laptop sobre el mostrador: el mini gráfico crece con lo que se completa en el formulario */}
      <g transform="rotate(-4 270 285)">
        <rect x="225" y="278" width="90" height="8" rx="4" fill="#12264E" />
        <rect x="235" y="228" width="70" height="52" rx="6" fill="#FFFFFF" stroke="#12264E" strokeWidth="3" />
        <rect x="241" y="234" width="58" height="5" rx="2.5" fill="#A9D0FF" opacity="0.7" />
        <rect x="245" y="256" width="8" height="14" rx="2" fill="#A9D0FF" className={styles.reactiveBar} style={{ transform: `scaleY(${bar1})` }} />
        <rect x="258" y="248" width="8" height="22" rx="2" fill="#1479F5" className={styles.reactiveBar} style={{ transform: `scaleY(${bar2})` }} />
        <rect x="271" y="260" width="8" height="10" rx="2" fill="#FFCA35" className={styles.reactiveBar} style={{ transform: `scaleY(${bar3})` }} />
      </g>

      {/* Burbuja "escribiendo": aparece con cada cambio en el formulario y se apaga tras una pausa */}
      <g transform="translate(302,194)" style={{ opacity: typing ? 1 : 0, transition: "opacity 220ms ease" }}>
        <rect x="-28" y="-16" width="56" height="30" rx="15" fill="#FFFFFF" stroke="#12264E" strokeWidth="2" />
        <circle cx="-12" cy="-1" r="3.4" fill="#1479F5" className={styles.dot} style={{ animationDelay: "0ms" }} />
        <circle cx="0" cy="-1" r="3.4" fill="#1479F5" className={styles.dot} style={{ animationDelay: "120ms" }} />
        <circle cx="12" cy="-1" r="3.4" fill="#1479F5" className={styles.dot} style={{ animationDelay: "240ms" }} />
      </g>

      {/* Tarjeta flotante: perfil verificado */}
      <g transform="rotate(5 520 110)" className={styles.floatA}>
        <ellipse cx="520" cy="166" rx="75" ry="10" fill="#12264E" opacity="0.08" />
        <rect x="460" y="75" width="130" height="78" rx="18" fill="#FFFFFF" stroke="#12264E" strokeWidth="2.5" />
        <circle cx="486" cy="104" r="15" fill="#A9D0FF" stroke="#12264E" strokeWidth="2" />
        <circle cx="486" cy="100" r="5" fill="#12264E" />
        <path d="M478,113 Q486,105 494,113" stroke="#12264E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="508" y="96" width="62" height="7" rx="3.5" fill="#12264E" opacity="0.8" />
        <rect x="508" y="108" width="42" height="6" rx="3" fill="#12264E" opacity="0.35" />
        <rect x="472" y="126" width="98" height="2" fill="#A9D0FF" opacity="0.6" />
        <circle cx="478" cy="138" r="4" fill="#1479F5" />
        <rect x="488" y="135" width="50" height="6" rx="3" fill="#12264E" opacity="0.25" />
        <g style={{ opacity: complete ? 1 : 0, transition: "opacity 320ms ease" }}>
          <circle cx="580" cy="82" r="18" fill="none" stroke="#1479F5" strokeWidth="2.5" className={styles.pulseRing} />
        </g>
        <circle
          cx="580" cy="82" r="14"
          fill={complete ? "#1479F5" : "#E7F3FF"}
          stroke={complete ? "#FFFFFF" : "#12264E"}
          strokeWidth={complete ? 3 : 2}
          className={`${styles.badgeCircle} ${complete ? styles.badgePop : ""}`}
        />
        <path
          d="M573,82 L578,87 L588,75"
          stroke={complete ? "#FFFFFF" : "#A9D0FF"}
          strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
          className={styles.badgeCheck}
        />
      </g>

      {/* Tarjeta flotante: visitas, con el mismo gráfico que crece con el formulario */}
      <g transform="rotate(-6 110 248)" className={styles.floatB}>
        <ellipse cx="110" cy="310" rx="62" ry="9" fill="#12264E" opacity="0.08" />
        <rect x="55" y="200" width="110" height="95" rx="18" fill="#FFFFFF" stroke="#12264E" strokeWidth="2.5" />
        <rect x="70" y="214" width="55" height="7" rx="3.5" fill="#12264E" opacity="0.3" />
        <rect x="68" y="278" width="80" height="2" fill="#A9D0FF" opacity="0.6" />
        <rect x="72" y="252" width="16" height="26" rx="4" fill="#A9D0FF" className={styles.reactiveBar} style={{ transform: `scaleY(${bar1})` }} />
        <rect x="96" y="236" width="16" height="42" rx="4" fill="#1479F5" className={styles.reactiveBar} style={{ transform: `scaleY(${bar2})` }} />
        <rect x="120" y="260" width="16" height="18" rx="4" fill="#FFCA35" className={styles.reactiveBar} style={{ transform: `scaleY(${bar3})` }} />
      </g>
    </svg>
  );
}
