import { companyApiUrl } from "@/lib/api/company-api-url";
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
    const detail = payload as { message?: string; code?: string } | null;
    throw new StandsApiError(detail?.message ?? detail?.code ?? `No se pudieron cargar los stands (${response.status}).`, response.status);
  }
  return payload as T;
}

export async function listStands(query: ListStandsQueryDto = {}): Promise<StandListResponseDto> {
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
    response = await fetch(companyApiUrl(`/stands${suffix}`), { headers: { Accept: "application/json" } });
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
  const root = payload as { data?: StandResponseDto | { stand?: StandResponseDto }; stand?: StandResponseDto } | null;
  const detail = root?.data ?? root?.stand ?? payload;
  if (detail && typeof detail === "object" && "stand" in detail && detail.stand) return detail.stand;
  return detail as StandResponseDto;
}
