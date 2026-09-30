"use client";

import { useCompanyAuthStore } from "@/store/company-auth-store";
import { companyApiUrl } from "@/lib/api/company-api-url";

/** Adjunta el access token, renueva la sesión y reintenta una vez después de un 401. */
export async function companyFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const auth = useCompanyAuthStore.getState();
  const send = (accessToken?: string) => {
    const headers = new Headers(init.headers);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(companyApiUrl(path), { ...init, headers });
  };

  const firstResponse = await send(auth.session?.accessToken);
  if (firstResponse.status !== 401) return firstResponse;

  if (!await auth.refreshAccessToken()) {
    auth.logout();
    return firstResponse;
  }

  const refreshedSession = useCompanyAuthStore.getState().session;
  if (!refreshedSession?.accessToken) {
    auth.logout();
    return firstResponse;
  }
  const retryResponse = await send(refreshedSession.accessToken);
  if (retryResponse.status === 401) useCompanyAuthStore.getState().logout();
  return retryResponse;
}
