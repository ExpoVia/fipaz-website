import { ADMIN_DEFAULT_EVENT_ID } from "@/features/admin/admin-scope";
import { createMockCollection } from "@/lib/mock/mock-collection";
import type { Reward } from "./types";

const FIPAZ = ADMIN_DEFAULT_EVENT_ID;

/** Datos semilla: cubren todos los tipos y ambos estados. Los ids enlazan con `inventory.mock.ts`. */
function createRewardsSeed(): Reward[] {
  return [
    {
      id: "rwd-001",
      eventId: FIPAZ,
      name: "Mochila ExpoVia",
      description: "Mochila urbana con compartimento para laptop y bolsillo antirrobo.",
      type: "merch",
      costPoints: 500,
      imageUrl: "/assets/rewards/backpack-removebg-preview.png",
      status: "active",
      createdAt: "2026-09-07T12:00:00-04:00",
      updatedAt: "2026-09-07T12:00:00-04:00",
    },
    {
      id: "rwd-002",
      eventId: FIPAZ,
      name: "Tomatodo térmico",
      description: "Botella de acero inoxidable de 500 ml que conserva la temperatura por 12 horas.",
      type: "merch",
      costPoints: 300,
      imageUrl: "/assets/rewards/tomatodo.png",
      status: "active",
      createdAt: "2026-09-07T11:30:00-04:00",
      updatedAt: "2026-09-08T16:20:00-04:00",
    },
    {
      id: "rwd-003",
      eventId: FIPAZ,
      name: "Voucher de café",
      description: "Un café de especialidad en cualquiera de las cafeterías aliadas de la feria.",
      type: "voucher",
      costPoints: 120,
      imageUrl: "/assets/rewards/coffee.png",
      status: "active",
      createdAt: "2026-09-07T11:00:00-04:00",
      updatedAt: "2026-09-07T11:00:00-04:00",
    },
    {
      id: "rwd-004",
      eventId: FIPAZ,
      name: "Póster edición limitada",
      description: "Póster ilustrado de La Paz en formato A2, numerado a mano.",
      type: "product",
      costPoints: 150,
      imageUrl: "/assets/rewards/poster.png",
      status: "inactive",
      createdAt: "2026-09-07T10:30:00-04:00",
      updatedAt: "2026-09-09T08:00:00-04:00",
    },
    {
      id: "rwd-005",
      eventId: FIPAZ,
      name: "Entrada VIP a conferencia",
      description: "Acceso preferente a la conferencia de cierre y encuentro con los oradores.",
      type: "experience",
      costPoints: 800,
      imageUrl: "/assets/rewards/ticket.png",
      status: "active",
      createdAt: "2026-09-07T10:00:00-04:00",
      updatedAt: "2026-09-09T10:15:00-04:00",
    },
    {
      id: "rwd-006",
      eventId: FIPAZ,
      name: "Insignia Explorador",
      description: "Insignia digital que se muestra en el perfil del visitante.",
      type: "badge",
      costPoints: 50,
      status: "active",
      createdAt: "2026-09-07T09:30:00-04:00",
      updatedAt: "2026-09-07T09:30:00-04:00",
    },
    {
      id: "rwd-007",
      eventId: "event-expocruz",
      name: "Boleto de sorteo",
      description: "Participa en el sorteo de premios sorpresa del cierre del evento.",
      type: "other",
      costPoints: 60,
      status: "active",
      createdAt: "2026-09-06T12:00:00-04:00",
      updatedAt: "2026-09-06T12:00:00-04:00",
    },
  ];
}

export const rewardsStore = createMockCollection<Reward>("rewards", createRewardsSeed);
