export interface ApiRequestOptions<TBody = unknown> extends Omit<RequestInit, 'body'> {
  body?: TBody;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const normalizeApiBaseUrl = (value: string) => {
  const base = value.trim().replace(/\/+$/, '');
  if (!base) return '';

  if (/\/api\/v\d+$/i.test(base)) return base;
  if (/\/api$/i.test(base)) return `${base}/v1`;
  if (/\/v\d+$/i.test(base)) return `${base.replace(/\/v\d+$/i, '')}/api/v1`;

  return `${base.replace(/\/$/, '')}/api/v1`;
};

const API_BASE_URL = normalizeApiBaseUrl(
  (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.EXPO_PUBLIC_API_BASE_URL ?? '') as string,
);
const ACCESS_TOKEN_KEY = 'vemtap_access_token';
const REFRESH_TOKEN_KEY = 'vemtap_refresh_token';

const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string | null) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // ignore storage errors in restricted contexts
  }
};

export const getAccessToken = () => readStorage(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => readStorage(REFRESH_TOKEN_KEY);
export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  writeStorage(ACCESS_TOKEN_KEY, accessToken);
  writeStorage(REFRESH_TOKEN_KEY, refreshToken ?? null);
};
export const clearAuthTokens = () => {
  writeStorage(ACCESS_TOKEN_KEY, null);
  writeStorage(REFRESH_TOKEN_KEY, null);
};

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
  const normalizedPath = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  if (!params) return normalizedPath;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });

  const queryString = search.toString();
  return queryString ? `${normalizedPath}${normalizedPath.includes('?') ? '&' : '?'}${queryString}` : normalizedPath;
};

export async function request<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error('API is not configured. Set VITE_API_BASE_URL in your environment.');
  }

  const requestOptions = options as ApiRequestOptions & { __retry?: boolean };
  const headers = new Headers(options.headers ?? {});
  const requestMethod = (options.method ?? 'GET').toUpperCase();
  const accessToken = getAccessToken();

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (options.body !== undefined && !headers.has('Content-Type') && requestMethod !== 'GET' && requestMethod !== 'HEAD') {
    headers.set('Content-Type', 'application/json');
  }

  const init: Record<string, unknown> = {
    ...options,
    method: requestMethod,
    headers,
  };

  if (options.body !== undefined && requestMethod !== 'GET' && requestMethod !== 'HEAD') {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(buildUrl(path, options.params), init as RequestInit);

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  let payload: unknown = null;
  if (response.status !== 204) {
    payload = isJson ? await response.json() : await response.text();
  }

  if (!response.ok) {
    const refreshToken = getRefreshToken();
    const isAuthAttempt = path === '/auth/login' || path === '/auth/refresh' || path === '/auth/logout';

    if (response.status === 401 && !requestOptions.__retry && !isAuthAttempt && refreshToken) {
      try {
        const refreshResponse = await fetch(buildUrl('/auth/refresh', {}), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshPayload = refreshResponse.headers.get('content-type')?.includes('application/json')
          ? await refreshResponse.json()
          : await refreshResponse.text();

        if (refreshResponse.ok) {
          const nextAccessToken = typeof refreshPayload === 'object' && refreshPayload && 'accessToken' in refreshPayload ? String((refreshPayload as { accessToken?: string }).accessToken) : null;
          const nextRefreshToken = typeof refreshPayload === 'object' && refreshPayload && 'refreshToken' in refreshPayload ? String((refreshPayload as { refreshToken?: string }).refreshToken) : refreshToken;
          if (nextAccessToken) {
            setAuthTokens(nextAccessToken, nextRefreshToken);
            return request<TResponse>(path, { ...options, __retry: true } as ApiRequestOptions & { __retry?: boolean });
          }
        }
      } catch {
        // ignore refresh failures and let the normal error handling below fire
      }
    }

    const messageText =
      (payload && typeof payload === 'object' && 'message' in payload && typeof (payload as { message?: unknown }).message === 'string' && (payload as { message: string }).message)
        || (payload && typeof payload === 'object' && 'error' in payload && typeof (payload as { error?: unknown }).error === 'string' && (payload as { error: string }).error)
        || (typeof payload === 'string' && payload.trim())
        || `Request failed with status ${response.status}`;
    throw new ApiError(String(messageText), response.status, payload);
  }

  return payload as TResponse;
}

export const api = {
  get: <TResponse>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<TResponse>(path, { ...options, method: 'GET' }),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>) =>
    request<TResponse>(path, { ...options, method: 'POST', body }),
  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>) =>
    request<TResponse>(path, { ...options, method: 'PATCH', body }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>) =>
    request<TResponse>(path, { ...options, method: 'PUT', body }),
  del: <TResponse>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<TResponse>(path, { ...options, method: 'DELETE' }),
};

export const getApiBaseUrl = () => API_BASE_URL;
export const hasApiConfig = () => Boolean(API_BASE_URL);
