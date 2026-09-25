/** Minúsculas y sin acentos, para búsquedas que no distingan "Tecnología" de "tecnologia". */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** ¿`haystack` contiene `query` ignorando mayúsculas y acentos? Una búsqueda vacía coincide siempre. */
export function matchesQuery(query: string, ...haystack: Array<string | undefined>): boolean {
  const needle = normalizeText(query.trim());
  if (!needle) return true;
  return haystack.some((value) => value !== undefined && normalizeText(value).includes(needle));
}
