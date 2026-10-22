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

/** Stores the tokens from any auth response (login, registration, role switch). */
export const storeAuthResponse = (response: unknown) => {
  const accessToken = readTokenValue(response, ['accessToken', 'access_token', 'token']);
  if (!accessToken) throw new Error('The response did not include an access token.');
  setAuthTokens(accessToken, readTokenValue(response, ['refreshToken', 'refresh_token', 'refresh']));
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

  requestPasswordReset: async (payload: { email: string }) => {
    return api.post('/auth/password-reset/request', payload);
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    return api.post('/auth/change-password', payload);
  },

  resetPassword: async (payload: { email: string; otp: string; newPassword: string }) => {
    return api.post('/auth/password-reset/reset', payload);
  },

  requestCustomerOtp: async (payload: { firstName?: string; lastName?: string; email: string; phone?: string; branchId?: string }) => {
    return api.post('/auth/customer/register/request-otp', payload);
  },

  verifyCustomerPin: async (payload: { email: string; code: string; pin: string; firstName?: string; lastName?: string; branchId?: string }) => {
    const response = await api.post<AuthTokensResponse>('/auth/customer/register/verify-and-set-pin', payload);

    const accessToken = readTokenValue(response, ['accessToken', 'access_token', 'token']);
    const refreshToken = readTokenValue(response, ['refreshToken', 'refresh_token', 'refresh']);

    if (accessToken) {
      setAuthTokens(accessToken, refreshToken ?? undefined);
    }

    return response;
  },

  requestEmailVerification: async (payload: { email: string }) => {
    return api.post('/auth/email-verification/send', payload);
  },

  verifyEmail: async (payload: { email: string; code: string }) => {
    return api.post('/auth/email-verification/verify', payload);
  },

  completeCustomerSetup: async (payload: Record<string, unknown>) => {
    return api.post('/auth/customer/complete-setup', payload);
  },

  googleSignIn: async (payload: Record<string, unknown>) => {
    const response = await api.post<AuthTokensResponse>('/auth/google', payload);

    const accessToken = readTokenValue(response, ['accessToken', 'access_token', 'token']);
    const refreshToken = readTokenValue(response, ['refreshToken', 'refresh_token', 'refresh']);

    if (accessToken) {
      setAuthTokens(accessToken, refreshToken ?? undefined);
    }

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

  /** Starts 2FA setup: a TOTP secret plus a scannable QR for authenticator apps (409 when already on). */
  setupTwoFactor: () => api.post<{ secret: string; otpauthUrl: string; qrSvg: string }>('/auth/2fa/setup'),
  confirmTwoFactor: (code: string) => api.post<{ enabled: boolean }>('/auth/2fa/confirm', { code }),
  disableTwoFactor: (code: string) => api.post<{ enabled: boolean }>('/auth/2fa/disable', { code }),

  requestPinReset: (payload: { email: string }) =>
    api.post<{ message: string }>('/auth/customer/pin/forgot', payload),

  resetPin: (payload: { email: string; otp: string; newPin: string }) =>
    api.post<{ message: string }>('/auth/customer/pin/reset', payload),

  /** Revokes this device's session server-side; a 401 means it is already gone. */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      throw error;
    } finally {
      clearAuthTokens();
    }
  },
};
