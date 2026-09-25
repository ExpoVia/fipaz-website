import { ServiceError } from "@/lib/api/service-error";
import { createMockId, mockRequest, sortNewestFirst } from "@/lib/mock/mock-runtime";
import { dynamicsStore } from "./dynamics.mock";
import type { Dynamic, DynamicsService } from "./types";

/**
 * Servicio de dinámicas.
 *
 * Implementación SIMULADA: lee y escribe en `dynamicsStore` (memoria + sessionStorage).
 * Para conectar el backend, reemplaza el cuerpo de cada método por una llamada HTTP a la
 * ruta indicada en su comentario (ver `API_ENDPOINTS.dynamics`) y elimina `dynamics.mock.ts`.
 * La firma pública NO cambia, por lo que hooks y componentes no requieren modificaciones.
 */

function requireDynamic(dynamicId: string): Dynamic {
  const dynamic = dynamicsStore.find(dynamicId);
  if (!dynamic) throw new ServiceError("NOT_FOUND", "No encontramos la dinámica solicitada.");
  return dynamic;
}

export const dynamicsService: DynamicsService = {
  // GET /stands/:standId/dynamics
  getDynamicsByStand(standId) {
    return mockRequest(() =>
      sortNewestFirst(dynamicsStore.all().filter((dynamic) => dynamic.standId === standId)),
    );
  },

  // GET /dynamics/:dynamicId
  getDynamicById(dynamicId) {
    return mockRequest(() => requireDynamic(dynamicId));
  },

  // POST /stands/:standId/dynamics
  createDynamic(data) {
    return mockRequest(() => {
      const now = new Date().toISOString();
      return dynamicsStore.insert({ id: createMockId("dyn"), ...data, createdAt: now, updatedAt: now });
    });
  },

  // PUT /dynamics/:dynamicId
  updateDynamic(dynamicId, data) {
    return mockRequest(() => {
      requireDynamic(dynamicId);
      return dynamicsStore.patch(dynamicId, { ...data, updatedAt: new Date().toISOString() }) as Dynamic;
    });
  },

  // DELETE /dynamics/:dynamicId
  deleteDynamic(dynamicId) {
    return mockRequest(() => {
      requireDynamic(dynamicId);
      dynamicsStore.remove(dynamicId);
    });
  },

  // PATCH /dynamics/:dynamicId/status
  toggleDynamicStatus(dynamicId) {
    return mockRequest(() => {
      const current = requireDynamic(dynamicId);
      return dynamicsStore.patch(dynamicId, {
        status: current.status === "active" ? "inactive" : "active",
        updatedAt: new Date().toISOString(),
      }) as Dynamic;
    });
  },
};
