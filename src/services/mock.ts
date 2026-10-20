import { hasApiConfig } from './api/client';

const MOCK_LATENCY_MS = 350;

/**
 * Runs `live` against the backend when VITE_API_BASE_URL is set, otherwise
 * resolves `mock` after a short delay so screens stay usable as a demo.
 */
export async function withMock<T>(live: () => Promise<T>, mock: () => T): Promise<T> {
  if (hasApiConfig()) return live();
  await new Promise((resolve) => window.setTimeout(resolve, MOCK_LATENCY_MS));
  return mock();
}
