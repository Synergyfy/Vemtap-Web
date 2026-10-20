import { ApiError, api } from './api/client';
import { clearAuthTokens, getRefreshToken, setAuthTokens } from './api/client';

export interface AuthUser {
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthTokensResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  token?: string;
  refresh?: string;
  user?: AuthUser;
}

const readTokenValue = (payload: unknown, keys: string[]) => {
  const seen = new Set<unknown>();

  const visit = (value: unknown): string | undefined => {
    if (value === null || value === undefined || typeof value !== 'object') {
      return undefined;
    }

    if (seen.has(value)) {
      return undefined;
    }
    seen.add(value);

    for (const key of keys) {
      const candidate = (value as Record<string, unknown>)[key];
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    for (const nestedKey of ['data', 'result', 'payload', 'auth', 'tokens']) {
      const nestedValue = (value as Record<string, unknown>)[nestedKey];
      const nestedToken = visit(nestedValue);
      if (nestedToken) {
        return nestedToken;
      }
    }

    return undefined;
  };

  return visit(payload);
};

export const authService = {
  login: async (payload: { identifier: string; password?: string }) => {
    const response = await api.post<AuthTokensResponse>('/auth/login', payload);

    const accessToken = readTokenValue(response, ['accessToken', 'access_token', 'token']);
    const refreshToken = readTokenValue(response, ['refreshToken', 'refresh_token', 'refresh']);

    if (!accessToken) {
      throw new Error('Login response did not include an access token.');
    }

    setAuthTokens(accessToken, refreshToken);

    return response;
  },

  refresh: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available.');
    }

    const response = await api.post<AuthTokensResponse>('/auth/refresh', { refreshToken });
    const accessToken = readTokenValue(response, ['accessToken', 'access_token', 'token']);
    const nextRefreshToken = readTokenValue(response, ['refreshToken', 'refresh_token', 'refresh']) ?? refreshToken;

    if (!accessToken) {
      throw new Error('Refresh response did not include a new access token.');
    }

    setAuthTokens(accessToken, nextRefreshToken ?? refreshToken);

    return response;
  },

  requestPinReset: (payload: { email: string }) =>
    api.post<{ message: string }>('/auth/customer/pin/forgot', payload),

  resetPin: (payload: { email: string; otp: string; newPin: string }) =>
    api.post<{ message: string }>('/auth/customer/pin/reset', payload),

  logout: async () => {
    const refreshToken = getRefreshToken();

    try {
      await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        console.warn('Logout endpoint is not implemented on the backend. Clearing local session only.');
        return;
      }
      throw error;
    } finally {
      clearAuthTokens();
    }
  },
};
