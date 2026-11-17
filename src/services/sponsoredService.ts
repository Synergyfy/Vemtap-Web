import { api, hasApiConfig } from './api/client';

export type SponsoredEventType = 'impression' | 'tap';

const VIEWER_KEY = 'vemtap_viewer_key';
const REPEAT_MS = 60 * 60 * 1000;
const lastSent = new Map<string, number>();

const viewerKey = () => {
  try {
    const stored = window.localStorage.getItem(VIEWER_KEY);
    if (stored) return stored;
    const key = `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(VIEWER_KEY, key);
    return key;
  } catch {
    return `v-${Date.now().toString(36)}-session`;
  }
};

/** Promoted deals — `GET /sponsored`, and their views/taps — `POST /sponsored/events`. */
export const sponsoredService = {
  list: async (params: { placement: 'home' | 'feed'; lat?: number; lng?: number; limit?: number }) => {
    const response = await api.get<{ data?: { campaignId: string; offer: Record<string, unknown> }[] }>('/sponsored', { params });
    return Array.isArray(response?.data) ? response.data : [];
  },

  /** Analytics never get in the way: repeats within the hour are skipped and failures are ignored. */
  track: (campaignId: string, offerId: string, type: SponsoredEventType) => {
    if (!hasApiConfig()) return;
    const key = `${campaignId}:${offerId}:${type}`;
    const now = Date.now();
    const previous = lastSent.get(key);
    if (previous !== undefined && now - previous < REPEAT_MS) return;
    lastSent.set(key, now);
    void api.post('/sponsored/events', { viewerKey: viewerKey(), events: [{ campaignId, offerId, type }] }).catch(() => undefined);
  },
};
