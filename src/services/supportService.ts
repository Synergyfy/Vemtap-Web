import { api } from './api/client';

export const supportService = {
  queryBot: async (payload: Record<string, unknown>) => {
    try {
      return await api.post<unknown>('/support/bot/query', payload);
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && typeof (error as { status?: number }).status === 'number') {
        return { fallback: true, message: 'Support bot is temporarily unavailable.' };
      }
      throw error;
    }
  },

  escalate: async (payload: Record<string, unknown>) => {
    try {
      return await api.post<unknown>('/support/escalate', payload);
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && typeof (error as { status?: number }).status === 'number') {
        return { escalated: false, message: 'Unable to escalate support right now.' };
      }
      throw error;
    }
  },
};
