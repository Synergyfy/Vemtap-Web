import { URBAN_BUSINESS, findBusinessBySlug, type BusinessProfileRef } from './businessData';
import { api, hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';

/**
 * Customer invite service — powers the "Send Invite Link" flow and the public
 * /join/{business}?invite=TOKEN page.
 *
 * With an API configured every call is live:
 *  - `POST /business-customers/invites`                      → issue a link
 *  - `GET  /public/customer-invites/:token`                  → validate on load
 *  - `POST /public/customer-invites/:token/registrations`    → join (name, phone, email?)
 *  - `POST /public/customer-invites/:token/email-registration` → join with an email only
 * Without one (demo build) the functions below fall back to a local mock that
 * persists nothing and never claims an email was sent.
 */

export interface CustomerInvite {
  businessSlug: string;
  businessName: string;
  token: string;
  url: string;
  createdAt: number;
  /** True while the mock adapter is active (no server-issued token). */
  isPlaceholder: boolean;
}

const MOCK_LATENCY_MS = 600;

const randomToken = () => `VEMINV${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export function buildCustomerInviteUrl(businessSlug: string, token: string): string {
  return `https://vemtap.com/join/${encodeURIComponent(businessSlug)}?invite=${encodeURIComponent(token)}`;
}

const offlineError = () => new Error('You appear to be offline. Reconnect and try generating the invite again.');

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

const mockDelay = () => new Promise<void>((resolve) => window.setTimeout(resolve, MOCK_LATENCY_MS));

/** Issues a signed invite link for the signed-in business (mock without an API). */
export async function generateCustomerInvite(business: BusinessProfileRef = URBAN_BUSINESS): Promise<CustomerInvite> {
  if (isOffline()) throw offlineError();

  if (hasApiConfig()) {
    try {
      const response = await api.post<{ token: string; url: string; merchantName: string }>(
        '/business-customers/invites',
        { channels: ['link', 'qr'] },
      );
      const slug = new URL(response.url).pathname.split('/').filter(Boolean).pop() ?? '';
      return {
        businessSlug: decodeURIComponent(slug),
        businessName: response.merchantName,
        token: response.token,
        url: response.url,
        createdAt: Date.now(),
        isPlaceholder: false,
      };
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Could not create the invite link.'));
    }
  }

  await mockDelay();
  const token = randomToken();
  return {
    businessSlug: business.slug,
    businessName: business.name,
    token,
    url: buildCustomerInviteUrl(business.slug, token),
    createdAt: Date.now(),
    isPlaceholder: true,
  };
}

export interface InviteLookup {
  businessName: string;
  valid: boolean;
}

/** Resolves the business behind a join link; `null` for an unknown link. */
export async function lookupCustomerInvite(businessSlug: string, inviteToken: string | null): Promise<InviteLookup | null> {
  if (!inviteToken) return null;

  if (hasApiConfig()) {
    try {
      const invite = await api.get<{ merchantName: string; valid: boolean }>(
        `/public/customer-invites/${encodeURIComponent(inviteToken)}`,
      );
      return { businessName: invite.merchantName, valid: invite.valid };
    } catch {
      return null;
    }
  }

  const business = findBusinessBySlug(businessSlug);
  return business ? { businessName: business.name, valid: true } : null;
}

export interface InviteRegistrationInput {
  fullName: string;
  phone: string;
  email?: string;
}

export interface InviteRegistrationResult {
  /** 'email-invite-pending' → customer gave an email; 'details-submitted' → no email. */
  outcome: 'email-invite-pending' | 'details-submitted';
  businessName: string;
  /** True only for the demo build — nothing was persisted server-side. */
  isMock: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Registers a customer through an invite link. Rejects on invalid input so the
 * UI's error state is reachable.
 */
export async function registerCustomerViaInvite(
  businessSlug: string,
  inviteToken: string | null,
  input: InviteRegistrationInput,
): Promise<InviteRegistrationResult> {
  if (isOffline()) throw offlineError();
  if (!inviteToken) throw new Error('This invite link is no longer valid. Ask the business for a new one.');
  if (!input.fullName.trim() || !input.phone.trim()) throw new Error('Full name and phone number are required.');
  if (input.phone.replace(/\D/g, '').length < 7) throw new Error('Enter a valid phone number.');
  if (input.email && !EMAIL_RE.test(input.email.trim())) throw new Error('Enter a valid email address.');

  if (hasApiConfig()) {
    try {
      const response = await api.post<{ status: 'registered' | 'pending_email'; merchantName: string }>(
        `/public/customer-invites/${encodeURIComponent(inviteToken)}/registrations`,
        {
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          ...(input.email?.trim() ? { email: input.email.trim() } : {}),
        },
      );
      return {
        outcome: response.status === 'pending_email' ? 'email-invite-pending' : 'details-submitted',
        businessName: response.merchantName,
        isMock: false,
      };
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Something went wrong. Please try again.'));
    }
  }

  await mockDelay();
  const business = findBusinessBySlug(businessSlug);
  if (!business) throw new Error('This invite link is no longer valid. Ask the business for a new one.');
  return {
    outcome: input.email?.trim() ? 'email-invite-pending' : 'details-submitted',
    businessName: business.name,
    isMock: true,
  };
}
