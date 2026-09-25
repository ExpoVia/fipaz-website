import { ServiceError } from "@/lib/api/service-error";
import { isMockFailureEnabled } from "./mock-controls";

const MIN_LATENCY_MS = 250;
const MAX_LATENCY_MS = 550;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ejecuta `handler` como si fuera una llamada de red: latencia, posible fallo simulado y
 * resultado clonado para que la UI nunca mute el "servidor" por referencia. Un `handler`
 * puede lanzar `ServiceError` (404, conflicto, validación) igual que lo haría el backend.
 */
export async function mockRequest<T>(handler: () => T): Promise<T> {
  await wait(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));

  if (isMockFailureEnabled()) {
    throw new ServiceError(
      "NETWORK",
      "No pudimos conectar con el servidor. Revisa tu conexión e intenta nuevamente.",
    );
  }

  return structuredClone(handler());
}

export function createMockId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Ordena del más reciente al más antiguo comparando instantes reales: los datos semilla usan
 * offset "-04:00" y los creados en sesión usan "Z", y esas cadenas no se ordenan bien como texto.
 * (Con backend, el orden lo resuelve el servidor.)
 */
export function sortNewestFirst<T extends { createdAt: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
