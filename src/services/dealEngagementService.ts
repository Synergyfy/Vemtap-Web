import { api, ApiError } from './api/client';

const unwrapEnvelope = <TValue>(payload: TValue): TValue => {
  if (!payload || typeof payload !== 'object') return payload;

  const record = payload as Record<string, unknown>;
  if ('data' in record && record.data !== undefined) return record.data as TValue;
  if ('result' in record && record.result !== undefined) return record.result as TValue;
  if ('payload' in record && record.payload !== undefined) return record.payload as TValue;

  return payload;
};

const handleMissingEndpoint = <TResponse>(error: unknown, fallback: TResponse): TResponse => {
  if (error instanceof ApiError && [404, 405].includes(error.status)) {
    return fallback;
  }

  throw error;
};

export const dealEngagementService = {
  getEngagement: async (offerId: string) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`/deals/${encodeURIComponent(offerId)}/engagement`));
    } catch (error) {
      return handleMissingEndpoint(error, {
        likes: 0,
        comments: 0,
        liked: false,
        saved: false,
      } as Record<string, unknown>);
    }
  },

  getReactionStatus: async (offerId: string) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`/deals/${encodeURIComponent(offerId)}/reaction-status`));
    } catch (error) {
      return handleMissingEndpoint(error, { liked: false } as Record<string, unknown>);
    }
  },

  setReaction: async (offerId: string, type: 'LIKE' | 'LOVE' | 'FIRE' | 'CLAP' | 'like' | 'dislike' = 'like') => {
    const normalizedType = String(type).toLowerCase();
    const safeType = normalizedType === 'dislike' ? 'dislike' : 'like';

    try {
      return unwrapEnvelope(await api.post<unknown>(`/deals/${encodeURIComponent(offerId)}/reactions`, { type: safeType }));
    } catch (error) {
      return handleMissingEndpoint(error, { liked: false, likes: 0 } as Record<string, unknown>);
    }
  },

  reactAndRefresh: async (offerId: string, type: 'LIKE' | 'LOVE' | 'FIRE' | 'CLAP' | 'like' | 'dislike' = 'like') => {
    const response = await dealEngagementService.setReaction(offerId, type);
    const status = await dealEngagementService.getReactionStatus(offerId);
    return { response, status };
  },

  toggleSave: async (offerId: string) => {
    try {
      return unwrapEnvelope(await api.post<unknown>(`/deals/${encodeURIComponent(offerId)}/save`));
    } catch (error) {
      return handleMissingEndpoint(error, { saved: false } as Record<string, unknown>);
    }
  },
};
