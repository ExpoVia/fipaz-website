import type { Reward } from "@/lib/types";

export const REWARDS: Reward[] = [
  {
    id: "sticker-expovia",
    title: "Sticker ExpoVia",
    description:
      'Propuesta: sticker coleccionable de ExpoVia con diseño pixel-art para laptop o cuaderno.',
    cost: 100,
    imagePath: "/assets/rewards/ticket.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🎨",
  },
  {
    id: "cafe-cortesia",
    title: "Café de cortesía",
    description:
      "Propuesta de cortesía de café durante la feria. La disponibilidad y las condiciones se definirían con la organización.",
    cost: 200,
    imagePath: "/assets/rewards/coffee.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "☕",
  },
  {
    id: "kit-explorador",
    title: "Kit Explorador",
    description:
      "Propuesta de kit para visitantes: cuadernillo, lapicera y pin de ExpoVia.",
    cost: 500,
    imagePath: "/assets/rewards/backpack.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🎒",
  },
  {
    id: "tomatodo-expovia",
    title: "Tomatodo ExpoVia",
    description:
      "Propuesta de tomatodo con identidad ExpoVia.",
    cost: 350,
    imagePath: "/assets/rewards/tomatodo.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🍶",
  },
  {
    id: "llavero-coleccionable",
    title: "Llavero coleccionable",
    description:
      "Propuesta de llavero pixel-art en forma de estrella ExpoVia.",
    cost: 150,
    imagePath: "/assets/rewards/llavero.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🔑",
  },
  {
    id: "poster-digital",
    title: "Póster digital FIPAZ",
    description:
      "Propuesta de póster digital que podría personalizarse con los stands visitados.",
    cost: 250,
    imagePath: "/assets/rewards/poster.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🖼️",
  },
];

export function getRewardById(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id);
}
