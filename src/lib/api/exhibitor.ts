import { z } from "zod";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http-client";

const companySchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  description: z.string().nullable(),
  logoPath: z.string().nullable(),
  website: z.string().nullable(),
  contactEmail: z.string().nullable(),
});

const standSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  eventId: z.string().uuid(),
  eventName: z.string(),
  boothCode: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  activityHighlight: z.string().nullable(),
  promotionHighlight: z.string().nullable(),
  visitPoints: z.number(),
  status: z.string(),
});

const kpisSchema = z.object({
  activeStands: z.number(),
  uniqueVisitors: z.number(),
  totalCheckins: z.number(),
  firstVisits: z.number(),
  activityAttendees: z.number(),
  redemptionsValidated: z.number(),
  unitsDelivered: z.number(),
});

const checkinSchema = z.object({
  id: z.string().uuid(),
  standId: z.string().uuid(),
  userId: z.string().uuid(),
  method: z.enum(["nfc", "qr", "manual", "system"]),
  acceptedAt: z.string(),
});

const issuedQrSchema = z.object({
  qrId: z.string().uuid(),
  token: z.string().min(1),
  expiresAt: z.string(),
});

export type ExhibitorCompany = z.infer<typeof companySchema>;
export type ExhibitorStand = z.infer<typeof standSchema>;
export type CompanyKpis = z.infer<typeof kpisSchema>;
export type StandCheckin = z.infer<typeof checkinSchema>;
export type IssuedStandQr = z.infer<typeof issuedQrSchema>;

export const exhibitorApi = {
  async getCompany(companyId: string): Promise<ExhibitorCompany> {
    return companySchema.parse(await apiGet(`/companies/${encodeURIComponent(companyId)}`));
  },
  async getStands(companyId: string): Promise<ExhibitorStand[]> {
    return z.array(standSchema).parse(await apiGet(`/companies/${encodeURIComponent(companyId)}/stands`));
  },
  async getKpis(companyId: string, eventId: string): Promise<CompanyKpis> {
    return kpisSchema.parse(await apiGet(`/companies/${encodeURIComponent(companyId)}/kpis`, { query: { eventId } }));
  },
  async updateCompany(companyId: string, patch: {
    displayName?: string;
    description?: string | null;
    contactEmail?: string | null;
    website?: string | null;
  }): Promise<ExhibitorCompany> {
    return companySchema.parse(await apiPatch(`/companies/${encodeURIComponent(companyId)}`, patch));
  },
  async updateStand(standId: string, patch: {
    displayName?: string;
    description?: string | null;
    tags?: string[];
    activityHighlight?: string | null;
    promotionHighlight?: string | null;
  }): Promise<void> {
    await apiPatch(`/stands/${encodeURIComponent(standId)}`, patch);
  },
  async getCheckins(standId: string): Promise<StandCheckin[]> {
    return z.array(checkinSchema).parse(await apiGet(`/stands/${encodeURIComponent(standId)}/check-ins`));
  },
  async issueQr(standId: string, ttlSeconds: number, maxScans: number): Promise<IssuedStandQr> {
    return issuedQrSchema.parse(await apiPost(`/stands/${encodeURIComponent(standId)}/qr`, { ttlSeconds, maxScans }));
  },
  async revokeQr(qrId: string): Promise<void> {
    await apiDelete(`/qr/${encodeURIComponent(qrId)}`);
  },
};
