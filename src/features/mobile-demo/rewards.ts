import type { Reward } from "./types";

export const REWARDS: readonly Reward[] = [
  {
    id: "reward-coffee",
    title: "Cafe de cortesia",
    description: "Retiralo en el stand de Sabor Andino mostrando tu codigo.",
    cost: 250,
    stockLabel: "100 por dia",
  },
  {
    id: "reward-diagnostic",
    title: "Diagnostico de procesos (30 min)",
    description: "Sesion agendada despues de la feria con Altura Labs.",
    cost: 500,
    stockLabel: "20 cupos",
  },
  {
    id: "reward-kit",
    title: "Kit de escritorio",
    description: "Stock limitado, entrega en el stand.",
    cost: 400,
    stockLabel: "30 unidades",
  },
] as const;
