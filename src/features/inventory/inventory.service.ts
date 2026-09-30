import { API_MODE } from "@/lib/api/config";
import { inventoryHttpService } from "./inventory.http-service";
import { inventoryMockService } from "./inventory.mock-service";
import type { InventoryService } from "./types";

/**
 * Punto único de acceso al servicio de inventario. Los hooks solo importan `inventoryService`.
 * `NEXT_PUBLIC_API_MODE=http` usa el backend; cualquier otro valor usa los datos simulados.
 */
export const inventoryService: InventoryService = API_MODE === "http" ? inventoryHttpService : inventoryMockService;
