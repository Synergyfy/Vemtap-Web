import { api, request, type ApiRequestOptions } from '../services/api/client';

export {
  ApiError,
  api,
  clearAuthTokens,
  getAccessToken,
  getApiBaseUrl,
  getRefreshToken,
  hasApiConfig,
  setAuthTokens,
} from '../services/api/client';
export { request } from '../services/api/client';
export type { ApiRequestOptions } from '../services/api/client';

export async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  return request<TResponse>(path, options);
}

export function apiGet<TResponse>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<TResponse> {
  return api.get<TResponse>(path, options);
}

export function apiPost<TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>): Promise<TResponse> {
  return api.post<TResponse, TBody>(path, body, options);
}

export function apiPatch<TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>): Promise<TResponse> {
  return api.patch<TResponse, TBody>(path, body, options);
}

export function apiPut<TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>): Promise<TResponse> {
  return api.put<TResponse, TBody>(path, body, options);
}

export function apiDelete<TResponse>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<TResponse> {
  return api.del<TResponse>(path, options);
}
