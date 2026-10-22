import { api, ApiError } from './api/client';

const unwrapEnvelope = <TValue>(payload: TValue): TValue => {
  if (!payload || typeof payload !== 'object') return payload;

  const record = payload as Record<string, unknown>;
  if ('data' in record && record.data !== undefined) return record.data as TValue;
  if ('result' in record && record.result !== undefined) return record.result as TValue;
  if ('payload' in record && record.payload !== undefined) return record.payload as TValue;

  return payload;
};

const extractArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  for (const key of ['data', 'items', 'results', 'rows', 'reviews', 'list']) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  return [];
};

const handleMissingEndpoint = <TResponse>(error: unknown, fallback: TResponse): TResponse => {
  if (error instanceof ApiError && [404, 405].includes(error.status)) {
    return fallback;
  }

  throw error;
};

export const reviewService = {
  list: async (offerId: string, params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`/deals/${encodeURIComponent(offerId)}/reviews`, { params }));
    } catch (error) {
      return handleMissingEndpoint(error, [] as unknown[]);
    }
  },

  preview: async (offerId: string) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`/deals/${encodeURIComponent(offerId)}/reviews/preview`));
    } catch (error) {
      return handleMissingEndpoint(error, { averageRating: 0, count: 0, reviews: [] } as Record<string, unknown>);
    }
  },

  create: async (offerId: string, body: Record<string, unknown>) => {
    try {
      return unwrapEnvelope(await api.post<unknown>(`/deals/${encodeURIComponent(offerId)}/reviews`, body));
    } catch (error) {
      return handleMissingEndpoint(error, { created: false } as Record<string, unknown>);
    }
  },

  get: async (offerId: string, reviewId: string) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`/deals/${encodeURIComponent(offerId)}/reviews/${encodeURIComponent(reviewId)}`));
    } catch (error) {
      return handleMissingEndpoint(error, null as unknown);
    }
  },

  update: async (offerId: string, reviewId: string, body: Record<string, unknown>) => {
    try {
      return unwrapEnvelope(await api.patch<unknown>(`/deals/${encodeURIComponent(offerId)}/reviews/${encodeURIComponent(reviewId)}`, body));
    } catch (error) {
      return handleMissingEndpoint(error, { updated: false } as Record<string, unknown>);
    }
  },

  remove: async (offerId: string, reviewId: string) => {
    try {
      return await api.del<unknown>(`/deals/${encodeURIComponent(offerId)}/reviews/${encodeURIComponent(reviewId)}`);
    } catch (error) {
      return handleMissingEndpoint(error, { deleted: false } as Record<string, unknown>);
    }
  },

  toggleLike: async (offerId: string, reviewId: string) => {
    try {
      return unwrapEnvelope(await api.post<unknown>(`/deals/${encodeURIComponent(offerId)}/reviews/${encodeURIComponent(reviewId)}/like`));
    } catch (error) {
      return handleMissingEndpoint(error, { liked: false } as Record<string, unknown>);
    }
  },

  listByOffer: async (offerId: string, params?: Record<string, string | number | boolean | undefined>) => {
    return extractArray(await reviewService.list(offerId, params));
  },
};
