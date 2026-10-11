/** Filtros y paginación aceptados por GET /api/v1/events/:eventId/stands. */
export interface ListStandsQueryDto {
  query?: string;
  categoryId?: string;
  featured?: boolean;
  floorId?: string;
  zoneId?: string;
  page?: number;
  limit?: number;
}

export interface StandCategoryDto {
  id: string;
  slug: string;
  label: string;
}

export interface StandCompanyDto {
  id: string;
  displayName: string;
}

export interface StandLocationDto {
  floorId: string;
  zoneId: string | null;
  x: number;
  y: number;
}

/** Campos compartidos por la respuesta de detalle y los elementos del listado. */
export interface StandResponseDto {
  id: string;
  boothCode: string;
  displayName: string;
  description: string | null;
  company: StandCompanyDto;
  categories: StandCategoryDto[];
  tags: string[];
  featured: boolean;
  activityHighlight: string | null;
  promotionHighlight: string | null;
  location: StandLocationDto | null;
}

/** Elemento del listado; `relevance` solo lo devuelve GET /events/:eventId/stands. */
export interface StandListItemDto extends StandResponseDto {
  relevance: number;
}

export interface StandListResponseDto {
  items: StandListItemDto[];
  page: number;
  limit: number;
  total?: number;
}
