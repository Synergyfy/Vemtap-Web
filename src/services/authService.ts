import { ApiError, api } from './api/client';
import { clearAuthTokens, getRefreshToken, setAuthTokens } from './api/client';

export interface AuthUser {
  id?: string;
  email?: string;
  role?: string;
  name?: string;
}

export interface AuthTokensResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  refresh?: string;
  user?: AuthUser;
}

export const authService = {
  login: async (payload: { identifier: string; password?: string }) => {
    const response = await api.post<AuthTokensResponse>('/auth/login', payload);

    const accessToken = response.accessToken ?? response.token;
    const refreshToken = response.refreshToken ?? response.refresh;

    if (accessToken) {
      setAuthTokens(accessToken, refreshToken);
    }

    return response;
  },

  refresh: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available.');
    }

    const response = await api.post<AuthTokensResponse>('/auth/refresh', { refreshToken });
    const accessToken = response.accessToken ?? response.token;
    const nextRefreshToken = response.refreshToken ?? response.refresh;

    if (accessToken) {
      setAuthTokens(accessToken, nextRefreshToken ?? refreshToken);
    }

    return response;
  },

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
