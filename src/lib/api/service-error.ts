/**
 * Error tipado que devuelve la capa de servicios. La UI solo conoce este contrato:
 * hoy lo lanzan los servicios simulados; cuando exista backend, el cliente HTTP
 * deberá traducir la respuesta a estos códigos (404 → NOT_FOUND, 409 → CONFLICT,
 * 422 → VALIDATION, fallo de red o 5xx → NETWORK).
 */
export type ServiceErrorCode = "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "NETWORK" | "UNKNOWN";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message: string) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
  }
}

/** Mensaje en español apto para mostrar al usuario; nunca expone errores internos. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ServiceError ? error.message : fallback;
}
