/**
 * Persistencia de sesión de los datos simulados. Usa sessionStorage para que los cambios
 * sobrevivan a una recarga de la pestaña, pero no entre sesiones. Todo acceso es tolerante
 * a fallos: en modo privado, con almacenamiento bloqueado o en servidor, degrada a memoria.
 */
export const MOCK_STORAGE_PREFIX = "expovia-admin-mock:v1:";

export function readSession(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento disponible: la sesión sigue funcionando solo en memoria.
  }
}

/** Borra todos los datos simulados guardados y recarga para volver a los datos semilla. */
export function resetMockData(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(MOCK_STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Nada que limpiar.
  }
  window.location.reload();
}
