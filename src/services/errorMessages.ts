import { ApiError } from './api/client';

const FIELD_LABEL: Record<string, string> = {
  phone: 'phone number',
  email: 'email address',
  officialEmail: 'business email',
  whatsappNumber: 'WhatsApp number',
  name: 'name',
  uniqueCode: 'code',
  username: 'username',
};

/**
 * Readable copy for an API failure. Unique-key conflicts arrive as the raw
 * database text (`Key (phone)=(+234…) already exists.`), so those are rewritten.
 */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError && error.status === 409) {
    const field = /Key \((\w+)\)/.exec(error.message)?.[1];
    if (field) return `That ${FIELD_LABEL[field] ?? field} is already used by another business. Use a different one.`;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
