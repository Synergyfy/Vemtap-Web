import { api } from './api/client';
import type {
  AudienceSelection,
  CampaignChannel,
  CampaignHistoryEntry,
  CampaignRecord,
  ExclusionBreakdown,
} from '../scripts/campaigns/campaignsData';

/**
 * SMS and Email campaigns (`/campaigns`). The backend stores a campaign as
 * name, channel, audience, message, subject, schedule and status, and
 * `POST /campaigns/:id/send` delivers it through the messaging engine (now, or
 * when a scheduled campaign falls due).
 *
 * `message` holds the readable body; `link` (counted through a tracked
 * `/c/:id` URL), `senderName` and `replyTo` (the builder's sender email) have
 * their own columns. The rest of what the web builder needs (audience
 * selection, recipient counts, preheader, history) travels as JSON in the
 * free-text `audience` field.
 */
type ApiStatus = 'Active' | 'Scheduled' | 'Recurring' | 'Draft' | 'Completed';
type ApiType = 'WhatsApp' | 'SMS' | 'Email';

export interface ApiCampaign {
  id: string;
  name: string;
  type: ApiType;
  audience: string;
  message: string;
  scheduledFor?: string | null;
  status: ApiStatus;
  subject?: string | null;
  link?: string | null;
  senderName?: string | null;
  replyTo?: string | null;
  sent?: number;
  delivered?: string;
  clicks?: number;
  branchId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CampaignMeta {
  v: 1;
  selection: AudienceSelection;
  label: string;
  recipientCount: number;
  excludedCount: number;
  exclusionBreakdown: ExclusionBreakdown[];
  smsLink?: string;
  emailSubject?: string;
  emailPreheader?: string;
  senderName?: string;
  senderEmail?: string;
  sentAt?: number;
  history: CampaignHistoryEntry[];
}

const TYPE: Record<CampaignChannel, ApiType> = { sms: 'SMS', email: 'Email' };

const toApiStatus = (status: CampaignRecord['status']): ApiStatus =>
  status === 'scheduled' ? 'Scheduled' : status === 'sending' ? 'Active' : status === 'sent' ? 'Completed' : 'Draft';

const fromApiStatus = (status: ApiStatus): CampaignRecord['status'] =>
  status === 'Scheduled' || status === 'Recurring' ? 'scheduled' : status === 'Active' ? 'sending' : status === 'Completed' ? 'sent' : 'draft';

const readMeta = (audience: string): CampaignMeta | null => {
  try {
    const parsed = JSON.parse(audience);
    return parsed && parsed.v === 1 ? (parsed as CampaignMeta) : null;
  } catch {
    return null;
  }
};

export function campaignFromApi(row: ApiCampaign): CampaignRecord | null {
  const channel = row.type === 'SMS' ? 'sms' : row.type === 'Email' ? 'email' : null;
  if (!channel) return null;
  const meta = readMeta(row.audience);
  const status = fromApiStatus(row.status);
  const createdAt = new Date(row.createdAt).getTime();
  return {
    id: row.id,
    channel,
    name: row.name,
    status,
    audience: meta?.selection ?? { mode: 'all', segmentKey: 'all-customers', filters: { activity: 'any', spend: 'any', consent: 'any' }, selectedKeys: [] },
    audienceLabel: meta?.label ?? (row.audience || 'All customers'),
    recipientCount: meta?.recipientCount ?? 0,
    excludedCount: meta?.excludedCount ?? 0,
    exclusionBreakdown: meta?.exclusionBreakdown ?? [],
    smsBody: channel === 'sms' ? row.message : undefined,
    smsLink: row.link ?? meta?.smsLink ?? '',
    emailSubject: row.subject ?? meta?.emailSubject ?? '',
    emailPreheader: meta?.emailPreheader ?? '',
    emailBody: channel === 'email' ? row.message : undefined,
    senderName: row.senderName ?? meta?.senderName ?? '',
    senderEmail: row.replyTo ?? meta?.senderEmail ?? '',
    createdAt,
    updatedAt: new Date(row.updatedAt).getTime(),
    scheduledAt: status === 'scheduled' && row.scheduledFor ? new Date(row.scheduledFor).getTime() : undefined,
    sentAt: meta?.sentAt,
    stats: status === 'sending' || status === 'sent' ? { queued: row.sent || meta?.recipientCount || 0, sent: row.sent || undefined, clicked: row.clicks || undefined } : undefined,
    history: meta?.history ?? [{ at: createdAt, kind: 'created', label: 'Campaign created' }],
  };
}

function campaignToApi(record: CampaignRecord) {
  const meta: CampaignMeta = {
    v: 1,
    selection: record.audience,
    label: record.audienceLabel,
    recipientCount: record.recipientCount,
    excludedCount: record.excludedCount,
    exclusionBreakdown: record.exclusionBreakdown,
    smsLink: record.smsLink || undefined,
    emailSubject: record.emailSubject || undefined,
    emailPreheader: record.emailPreheader || undefined,
    senderName: record.senderName || undefined,
    senderEmail: record.senderEmail || undefined,
    sentAt: record.sentAt,
    history: record.history,
  };
  return {
    name: record.name.trim() || 'Untitled campaign',
    type: TYPE[record.channel],
    audience: JSON.stringify(meta),
    // The backend requires a message; an empty draft saves a single space.
    message: (record.channel === 'sms' ? record.smsBody : record.emailBody) || ' ',
    ...(record.channel === 'email' && record.emailSubject ? { subject: record.emailSubject.slice(0, 200) } : {}),
    // Only values the API accepts (an http(s) link, a valid reply-to email); null clears a field.
    link: /^https?:\/\/\S+$/i.test(record.smsLink?.trim() ?? '') ? record.smsLink!.trim().slice(0, 500) : null,
    senderName: record.senderName?.trim() ? record.senderName.trim().slice(0, 80) : null,
    replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.senderEmail?.trim() ?? '') ? record.senderEmail!.trim() : null,
    status: toApiStatus(record.status),
    ...(record.status === 'scheduled' && record.scheduledAt ? { scheduledFor: new Date(record.scheduledAt).toISOString() } : {}),
  };
}

export const messageCampaignsService = {
  list: () => api.get<ApiCampaign[]>('/campaigns').then((rows) => rows.map(campaignFromApi).filter((c): c is CampaignRecord => c !== null)),
  create: (record: CampaignRecord, branchId: string) =>
    api.post<ApiCampaign>('/campaigns', { ...campaignToApi(record), branchId }, { params: { branchId } }),
  update: (id: string, record: CampaignRecord) => api.patch<ApiCampaign>(`/campaigns/${id}`, campaignToApi(record)),
  remove: (id: string) => api.del<unknown>(`/campaigns/${id}`),
  /**
   * Sends now, or — when the campaign's schedule is in the future — keeps it
   * scheduled and lets the server send it when due. Customers who are not the
   * business's, or who opted out of the channel, are skipped by the server.
   */
  send: (id: string, customerIds: string[], subject?: string) =>
    api
      .post<ApiCampaign>(`/campaigns/${id}/send`, { customerIds, ...(subject ? { subject: subject.slice(0, 200) } : {}) })
      .then(campaignFromApi),
  /** `GET /campaigns/:id/stats` — delivery counts by status plus tracked-link clicks. */
  stats: (id: string) => api.get<ApiCampaignStats>(`/campaigns/${id}/stats`),
  /** `POST /campaigns/:id/test` — sends it, prefixed [TEST], to the caller's own email or phone (1 credit). */
  sendTest: (id: string) => api.post<{ to: string; channel: ApiType; status: string }>(`/campaigns/${id}/test`),
};

export interface ApiCampaignStats {
  recipients: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  clicks: number;
  deliveredRate: number;
  clickRate: number;
}
