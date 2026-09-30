import { companyFetch } from "@/lib/api/company-fetch";
import type { CompanyRegistrationInput } from "@/types/panel";

export class CompanyRegistrationError extends Error {}

interface CompanyIdentityResponse {
  id?: string;
  companyId?: string;
  name?: string;
}

interface CreateCompanyResponse extends CompanyIdentityResponse {
  company?: CompanyIdentityResponse;
  data?: CompanyIdentityResponse & { company?: CompanyIdentityResponse };
}

export async function createCompany(input: CompanyRegistrationInput & { participationType: "expositor" | "patrocinador" }) {
  const response = await companyFetch("/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      category: input.category,
      customCategory: input.customCategory,
      description: input.description,
      contactEmail: input.contactEmail,
      participationType: input.participationType,
    }),
  });
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    const detail = payload as { message?: string; code?: string } | null;
    throw new CompanyRegistrationError(detail?.message ?? detail?.code ?? `No se pudo registrar la empresa (${response.status}).`);
  }
  const result = payload as CreateCompanyResponse | null;
  const company = result?.data?.company ?? result?.company ?? result?.data ?? result;
  const id = company?.id?.trim() || company?.companyId?.trim();
  if (!id) throw new CompanyRegistrationError("El backend no devolvió el identificador de la empresa.");
  return { id, name: company?.name?.trim() || input.name };
}
