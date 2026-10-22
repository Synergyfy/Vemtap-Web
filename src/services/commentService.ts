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

const commentsBasePath = (itemId: string) => `/catalogue/business/comments/public/catalogue/items/${encodeURIComponent(itemId)}/comments`;

export const commentService = {
  list: async (itemId: string, params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(commentsBasePath(itemId), { params }));
    } catch (error) {
      return handleMissingEndpoint(error, [] as unknown[]);
    }
  },

  create: async (itemId: string, body: Record<string, unknown>) => {
    try {
      return unwrapEnvelope(await api.post<unknown>(commentsBasePath(itemId), body));
    } catch (error) {
      return handleMissingEndpoint(error, { created: false } as Record<string, unknown>);
    }
  },

  update: async (itemId: string, commentId: string, body: Record<string, unknown>) => {
    try {
      return unwrapEnvelope(await api.patch<unknown>(`${commentsBasePath(itemId)}/${encodeURIComponent(commentId)}`, body));
    } catch (error) {
      return handleMissingEndpoint(error, { updated: false } as Record<string, unknown>);
    }
  },

  remove: async (itemId: string, commentId: string) => {
    try {
      return await api.del<unknown>(`${commentsBasePath(itemId)}/${encodeURIComponent(commentId)}`);
    } catch (error) {
      return handleMissingEndpoint(error, { deleted: false } as Record<string, unknown>);
    }
  },

  getLikes: async (itemId: string, commentId: string) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`${commentsBasePath(itemId)}/${encodeURIComponent(commentId)}/likes`));
    } catch (error) {
      return handleMissingEndpoint(error, { likes: 0 } as Record<string, unknown>);
    }
  },

  toggleLike: async (itemId: string, commentId: string) => {
    try {
      return unwrapEnvelope(await api.post<unknown>(`${commentsBasePath(itemId)}/${encodeURIComponent(commentId)}/like`));
    } catch (error) {
      return handleMissingEndpoint(error, { liked: false } as Record<string, unknown>);
    }
  },
};
