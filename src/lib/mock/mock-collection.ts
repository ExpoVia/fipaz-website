import { MOCK_STORAGE_PREFIX, readSession, writeSession } from "./mock-storage";

/**
 * "Tabla" en memoria que hace de base de datos de los servicios simulados. Se siembra de
 * forma perezosa (solo en cliente, en la primera lectura) y persiste en sessionStorage.
 * Es un detalle exclusivo de los mocks: desaparece cuando el servicio pase a usar HTTP.
 */
export interface MockCollection<T extends { id: string }> {
  all(): readonly T[];
  find(id: string): T | undefined;
  insert(item: T): T;
  patch(id: string, changes: Partial<T>): T | undefined;
  remove(id: string): T | undefined;
  removeWhere(predicate: (item: T) => boolean): void;
}

function parseCollection<T>(raw: string | null): T[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

export function createMockCollection<T extends { id: string }>(
  name: string,
  seed: () => T[],
): MockCollection<T> {
  const storageKey = `${MOCK_STORAGE_PREFIX}${name}`;
  let items: T[] | null = null;

  function read(): T[] {
    if (items === null) items = parseCollection<T>(readSession(storageKey)) ?? seed();
    return items;
  }

  function commit(next: T[]): void {
    items = next;
    writeSession(storageKey, JSON.stringify(next));
  }

  return {
    all: read,
    find: (id) => read().find((item) => item.id === id),
    insert(item) {
      commit([...read(), item]);
      return item;
    },
    patch(id, changes) {
      const current = read().find((item) => item.id === id);
      if (!current) return undefined;
      const updated = { ...current, ...changes };
      commit(read().map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    remove(id) {
      const current = read().find((item) => item.id === id);
      if (current) commit(read().filter((item) => item.id !== id));
      return current;
    },
    removeWhere(predicate) {
      commit(read().filter((item) => !predicate(item)));
    },
  };
}
