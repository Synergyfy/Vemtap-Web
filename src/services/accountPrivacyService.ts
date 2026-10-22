import { api } from './api/client';

/** `/account/privacy/*` — NDPR controls on the account settings. */
export interface AccountPrivacy {
  /** Business-wide: optional AI processing of the business's data is stopped. */
  restrictProcessing: boolean;
  /** Business-wide: AI analysis of the dashboards is allowed. */
  analytics: boolean;
  /** Personal: VemTap marketing notifications. */
  marketing: boolean;
  /** Personal: email on a sign-in from a new device. */
  deviceAlerts: boolean;
  /** Whether the caller may change the business-wide choices (owner or manager). */
  canManageBusiness: boolean;
}

export interface DataRequestRow {
  id: string;
  reference: string;
  type: 'export' | 'rectification';
  status: 'open' | 'completed';
  details: string | null;
  createdAt: string;
  dueAt: string;
  completedAt: string | null;
}

export const accountPrivacyService = {
  get: () => api.get<AccountPrivacy>('/account/privacy'),
  update: (patch: Partial<Omit<AccountPrivacy, 'canManageBusiness'>>) => api.patch<AccountPrivacy>('/account/privacy', patch),
  export: () =>
    api.post<{ fileName: string; mimeType: string; content: string; reference: string }>('/account/privacy/export'),
  requests: () => api.get<{ data: DataRequestRow[]; total: number }>('/account/privacy/requests'),
  requestRectification: (details: string) =>
    api.post<DataRequestRow>('/account/privacy/requests', { type: 'rectification', details }),
};
