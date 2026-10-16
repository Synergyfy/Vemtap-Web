export type ApiRequestOptions<TBody = unknown> = Omit<RequestInit, 'body'> & {
  body?: TBody;
  headers?: Record<string, string>;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

const withJsonBody = (body: unknown): RequestInit => ({
  body: body === undefined ? undefined : (JSON.stringify(body) as BodyInit),
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function hasApiConfig(): boolean {
  return Boolean(API_BASE_URL);
}

export async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  if (!hasApiConfig()) {
    throw new Error('API is not configured. Set VITE_API_BASE_URL in your environment.');
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const requestInit: Record<string, unknown> = {
    ...options,
    method: options.method ?? 'GET',
    headers: {
      ...(options.headers ?? {}),
      ...(options.body !== undefined && !options.headers?.['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
    },
  };

  if (options.body !== undefined && requestInit.method !== 'GET' && requestInit.method !== 'HEAD') {
    const jsonBody = withJsonBody(options.body);
    requestInit.body = jsonBody.body;
    requestInit.headers = {
      ...(requestInit.headers ?? {}),
      ...(jsonBody.headers ?? {}),
    };
  }

  const response = await fetch(url, requestInit as RequestInit);

  const isEmpty = response.status === 204 || response.headers.get('content-length') === '0';
  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    let message = `Request failed with status ${response.status}`;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { message?: string; error?: string };
        message = parsed.message ?? parsed.error ?? message;
      } catch {
        message = raw;
      }
    }
    throw new Error(message);
  }

  if (isEmpty) return undefined as TResponse;

  const text = await response.text();
  if (!text) return undefined as TResponse;

  try {
    return JSON.parse(text) as TResponse;
  } catch {
    return text as unknown as TResponse;
  }
}

export function apiGet<TResponse>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<TResponse> {
  return apiRequest<TResponse>(path, { ...options, method: 'GET' });
}

export function apiPost<TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>): Promise<TResponse> {
  return apiRequest<TResponse>(path, { ...options, method: 'POST', body });
}

export function apiPatch<TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>): Promise<TResponse> {
  return apiRequest<TResponse>(path, { ...options, method: 'PATCH', body });
}
