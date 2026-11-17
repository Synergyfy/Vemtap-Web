import { api } from './api/client';

/** An owner's unfinished business setup, kept on the account so it resumes on any device. */
export const businessSetupService = {
  async get(): Promise<Record<string, unknown> | null> {
    const response = await api.get<{ progress?: Record<string, unknown> | null }>('/users/me/business-setup');
    return response?.progress ?? null;
  },

  async save(progress: Record<string, unknown>): Promise<void> {
    await api.put('/users/me/business-setup', { progress });
  },

  async clear(): Promise<void> {
    await api.del('/users/me/business-setup');
  },
};
