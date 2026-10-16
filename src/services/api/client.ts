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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

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

  const headers = new Headers(options.headers ?? {});
  const requestMethod = (options.method ?? 'GET').toUpperCase();

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
