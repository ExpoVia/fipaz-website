export function companyApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL?.trim().replace(/\/$/, "");
  if (!baseUrl) throw new Error("Falta configurar NEXT_PUBLIC_AGENT_BACKEND_URL.");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}/api/v1${normalizedPath}`;
}
