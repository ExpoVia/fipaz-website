import type { Reward } from "@/lib/types";

export const REWARDS: Reward[] = [
  {
    id: "sticker-expovia",
    title: "Sticker ExpoVia",
    description:
      'Sticker coleccionable edición especial "La Paz Expone". Diseño pixel-art exclusivo de esta edición. Ideal para tu laptop o cuaderno.',
    cost: 100,
    imagePath: "/assets/rewards/ticket.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🎨",
  },
  {
    id: "cafe-cortesia",
    title: "Café de cortesía",
    description:
      "Un café gratis en el patio de la feria. Presenta tu código en el puesto de bebidas y disfruta tu merecido descanso entre stands.",
    cost: 200,
    imagePath: "/assets/rewards/coffee.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "☕",
  },
  {
    id: "kit-explorador",
    title: "Kit Explorador",
    description:
      "El paquete del explorador: cuadernillo A5, lapicera y pin metálico de ExpoVia. Para los visitantes más dedicados de la feria.",
    cost: 500,
    imagePath: "/assets/rewards/backpack-removebg-preview.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🎒",
  },
  {
    id: "tomatodo-expovia",
    title: "Tomatodo ExpoVia",
    description:
      "Termo/tomatodo con el logo de La Paz Expone 2026. Acompáñate durante toda la feria con tu bebida favorita.",
    cost: 350,
    imagePath: "/assets/rewards/tomatodo.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🍶",
  },
  {
    id: "llavero-coleccionable",
    title: "Llavero coleccionable",
    description:
      "Llavero pixel-art en forma de estrella de La Paz Expone. Cada edición tiene un diseño diferente — ¡este es el de 2026!",
    cost: 150,
    imagePath: "/assets/rewards/llavero.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🔑",
  },
  {
    id: "poster-digital",
    title: "Póster digital FIPAZ",
    description:
      "Un póster personalizado generado con los stands que visitaste. Descárgalo, compártelo y muestra tu recorrido en la feria.",
    cost: 250,
    imagePath: "/assets/rewards/poster.png",
    stockLabel: "Demo · Sin stock real",
    emoji: "🖼️",
  },
];

export function getRewardById(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id);
}
