import { companyApiUrl } from "@/lib/api/company-api-url";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ListStandsQueryDto,
  StandListItemDto,
  StandListResponseDto,
  StandResponseDto,
} from "@/types/stands-api";

export class StandsApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "StandsApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isStandResponseDto(value: unknown): value is StandResponseDto {
  if (!isRecord(value) || !isRecord(value.company)) return false;

  const categoriesAreValid = Array.isArray(value.categories)
    && value.categories.every((category) =>
      isRecord(category)
      && isString(category.id)
      && isString(category.slug)
      && isString(category.label),
    );
  const locationIsValid = value.location === null
    || (isRecord(value.location)
      && isString(value.location.floorId)
      && (value.location.zoneId === null || isString(value.location.zoneId))
      && typeof value.location.x === "number"
      && Number.isFinite(value.location.x)
      && typeof value.location.y === "number"
      && Number.isFinite(value.location.y));

  return isString(value.id)
    && isString(value.boothCode)
    && isString(value.displayName)
    && isNullableString(value.description)
    && isString(value.company.id)
    && isString(value.company.displayName)
    && categoriesAreValid
    && Array.isArray(value.tags)
    && value.tags.every(isString)
    && typeof value.featured === "boolean"
    && isNullableString(value.activityHighlight)
    && isNullableString(value.promotionHighlight)
    && locationIsValid;
}

function parseList(payload: unknown, query: ListStandsQueryDto): StandListResponseDto {
  const root = payload as Record<string, unknown> | null;
  const data = root?.data as Record<string, unknown> | StandListItemDto[] | undefined;
  const meta = (root?.meta ?? root?.pagination ?? (data && !Array.isArray(data) ? data.meta : undefined)) as Record<string, unknown> | undefined;
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(root?.items)
      ? root.items
      : Array.isArray(root?.results)
        ? root.results
        : Array.isArray(data)
          ? data
          : data && !Array.isArray(data)
            ? (Array.isArray(data.items) ? data.items : Array.isArray(data.data) ? data.data : [])
            : [];
  const page = Number(meta?.page ?? root?.page ?? query.page ?? 1);
  const limit = Number(meta?.limit ?? root?.limit ?? query.limit ?? items.length);
  const rawTotal = meta?.total ?? root?.total;
  const total = rawTotal === undefined ? undefined : Number(rawTotal);
  return { items: items as StandListItemDto[], page, limit, total };
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    const root = isRecord(payload) ? payload : null;
    const detail = root?.error && isRecord(root.error) ? root.error : root;
    const message = typeof detail?.message === "string" ? detail.message : undefined;
    const code = typeof detail?.code === "string" ? detail.code : undefined;
    throw new StandsApiError(message ?? code ?? `No se pudieron cargar los stands (${response.status}).`, response.status);
  }
  return payload as T;
}

export async function listStands(eventId: string, query: ListStandsQueryDto = {}): Promise<StandListResponseDto> {
  if (!eventId.trim()) {
    throw new StandsApiError("Falta configurar el UUID del evento para cargar sus stands.");
  }
  if (query.query && query.query.length > 100) {
    throw new StandsApiError("La búsqueda no puede superar los 100 caracteres.");
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const suffix = params.size ? `?${params.toString()}` : "";
  let response: Response;
  try {
    response = await fetch(companyApiUrl(`${API_ENDPOINTS.stands.byEvent(eventId)}${suffix}`), { headers: { Accept: "application/json" } });
  } catch {
    throw new StandsApiError("No se pudo conectar con el servicio de stands.");
  }
  return parseList(await readResponse<unknown>(response), query);
}

export async function getStandById(standId: string): Promise<StandResponseDto> {
  let response: Response;
  try {
    response = await fetch(companyApiUrl(`/stands/${encodeURIComponent(standId)}`), {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new StandsApiError("No se pudo conectar con el servicio de stands.");
  }
  const payload = await readResponse<unknown>(response);
  const root = isRecord(payload) ? payload : null;
  const data = root?.data;
  const nestedData = isRecord(data) && "stand" in data ? data.stand : data;
  const detail = root?.stand ?? nestedData ?? payload;
  if (!isStandResponseDto(detail)) {
    throw new StandsApiError("El servicio devolvió un detalle de stand incompleto o inválido.");
  }
  return detail;
}
