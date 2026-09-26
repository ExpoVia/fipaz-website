/**
 * Error tipado que devuelve la capa de servicios. La UI solo conoce este contrato: lo lanzan
 * los servicios simulados y el cliente HTTP (`http-client.ts`), que traduce cada respuesta de
 * error del backend a un código y un mensaje en español.
 */
export type ServiceErrorCode =
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NETWORK"
  | "UNKNOWN";

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
