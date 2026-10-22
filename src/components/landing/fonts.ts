import { Plus_Jakarta_Sans, Sora, Space_Mono } from "next/font/google";

// Tipografía de la landing: antes una fuente "pixel art" (Pixelify Sans / Press Start 2P),
// ahora una grotesca limpia y moderna. `headingFont` viste los títulos grandes de cada
// sección; `eyebrowFont` las etiquetas pequeñas en mayúsculas (el "ojo" sobre el título).
export const headingFont = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const eyebrowFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// Typography for the "problema" section; exposed as CSS variables so the module CSS can reference them.
export const soraFont = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const jakartaFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const spaceMonoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});
