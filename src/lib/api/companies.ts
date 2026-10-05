import { z } from "zod";

import { readApiErrorMessage, unwrapEnvelope } from "@/lib/api/api-envelope";
import { companyFetch } from "@/lib/api/company-fetch";
import type { CompanyRegistrationInput } from "@/types/panel";

export class CompanyRegistrationError extends Error {}

const companySchema = z.object({ id: z.string().min(1), displayName: z.string() });

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null) as Promise<unknown>;
}

/**
 * Registra la empresa (`POST /companies`). El backend la crea y deja a la cuenta como
 * `company_admin` en una sola operación.
 *
 * El alta solo acepta nombre y descripción; el correo de contacto se guarda justo después
 * con `PATCH /companies/:id`. Categoría y tipo de participación aún no tienen dónde guardarse
 * en el backend y se conservan solo en el panel local.
 */
export async function createCompany(input: CompanyRegistrationInput) {
  const response = await companyFetch("/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName: input.name, description: input.description }),
  });
  const payload = await readJson(response);
  if (!response.ok) {
    throw new CompanyRegistrationError(
      readApiErrorMessage(payload, `No se pudo registrar la empresa (${response.status}).`),
    );
  }
  const parsed = companySchema.safeParse(unwrapEnvelope(payload));
  if (!parsed.success) {
    throw new CompanyRegistrationError("El backend no devolvió el identificador de la empresa.");
  }
  const company = { id: parsed.data.id, name: parsed.data.displayName };

  await saveContactEmail(company.id, input.contactEmail);
  return company;
}

/**
 * La empresa ya existe: si falla el correo de contacto no se revierte el alta. La persona puede
 * completarlo después desde el perfil de empresa.
 */
async function saveContactEmail(companyId: string, contactEmail: string): Promise<void> {
  try {
    await companyFetch(`/companies/${encodeURIComponent(companyId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactEmail }),
    });
  } catch {
    // Ver el comentario de la función.
  }
}
