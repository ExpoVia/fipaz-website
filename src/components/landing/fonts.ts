import { Pixelify_Sans, Plus_Jakarta_Sans, Press_Start_2P, Sora, Space_Mono } from "next/font/google";

export const pixelifyFont = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const pressStartFont = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
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
