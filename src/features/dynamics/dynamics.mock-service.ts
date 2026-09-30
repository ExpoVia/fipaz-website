import { ServiceError } from "@/lib/api/service-error";
import { createMockId, mockRequest, sortNewestFirst } from "@/lib/mock/mock-runtime";
import { dynamicsStore } from "./dynamics.mock";
import type { Dynamic, DynamicsService } from "./types";

/**
 * Servicio SIMULADO de dinámicas (`NEXT_PUBLIC_API_MODE=mock`, el valor por defecto).
 *
 * Lee y escribe en `dynamicsStore` (memoria + sessionStorage). La implementación contra el
 * backend está en `dynamics.http-service.ts`; `dynamics.service.ts` elige cuál se usa.
 */

function requireDynamic(dynamicId: string): Dynamic {
  const dynamic = dynamicsStore.find(dynamicId);
  if (!dynamic) throw new ServiceError("NOT_FOUND", "No encontramos la dinámica solicitada.");
  return dynamic;
}

export const dynamicsMockService: DynamicsService = {
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
