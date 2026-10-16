import { URBAN_BUSINESS, findBusinessBySlug, type BusinessProfileRef } from './businessData';

/**
 * Customer invite service — FRONTEND MOCK ADAPTER (no network calls).
 *
 * Powers the "Send Invite Link" flow and the public /join/{business} page so
 * the full UX can be built and tested before the backend exists.
 *
 * ── BACKEND INTEGRATION POINTS ─────────────────────────────────────────────
 *  1. POST /merchants/{merchantId}/customer-invites
 *       body : { channels?: string[] }
 *       resp : { token: string, url: string, expiresAt?: string }
 *       → replace generateCustomerInvite() with a real fetch; keep the
 *         CustomerInvite shape so the UI does not change.
 *  2. GET /public/customer-invites/{token}
 *       resp : { merchantId, merchantName, valid: boolean }
 *       → validate the token when the join page loads (findBusinessBySlug is
 *         the current local stand-in).
 *  3. POST /public/customer-invites/{token}/registrations
 *       body : { fullName, phone, email? }
 *       resp : { status: 'registered' | 'pending_email' }
 *       → replace registerCustomerViaInvite(); the two outcomes map directly
 *         onto the two success states of the join page.
 *  4. POST /public/customer-invites/{token}/email-registration
 *       body : { email }
 *       resp : 202 — server queues the invitation email.
 *       → the UI never claims an email was sent in this mock; wording stays
 *         in future tense until this endpoint is wired.
 * No secrets are stored here. Tokens are random, non-sensitive placeholders.
 * ───────────────────────────────────────────────────────────────────────────
 */

export interface CustomerInvite {
  businessSlug: string;
  businessName: string;
  token: string;
  /** Mock URL pending backend — mirrors the /join/{slug}?invite=… staff pattern. */
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

/** MOCK: simulates generating a signed invite link for the business. */
export function generateCustomerInvite(business: BusinessProfileRef = URBAN_BUSINESS): Promise<CustomerInvite> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        reject(offlineError());
        return;
      }
      const token = randomToken();
      resolve({
        businessSlug: business.slug,
        businessName: business.name,
        token,
        url: buildCustomerInviteUrl(business.slug, token),
        createdAt: Date.now(),
        isPlaceholder: true,
      });
    }, MOCK_LATENCY_MS);
  });
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
  /** Always true for the mock — nothing was persisted server-side. */
  isMock: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * MOCK: simulates a customer registering through an invite link. Rejects on
 * invalid input so the UI's error state is reachable; never claims to have
 * sent email or written to a database.
 */
export function registerCustomerViaInvite(
  businessSlug: string,
  inviteToken: string | null,
  input: InviteRegistrationInput,
): Promise<InviteRegistrationResult> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        reject(offlineError());
        return;
      }
      const business = findBusinessBySlug(businessSlug);
      if (!business || !inviteToken) {
        reject(new Error('This invite link is no longer valid. Ask the business for a new one.'));
        return;
      }
      if (!input.fullName.trim() || !input.phone.trim()) {
        reject(new Error('Full name and phone number are required.'));
        return;
      }
      if (input.phone.replace(/\D/g, '').length < 7) {
        reject(new Error('Enter a valid phone number.'));
        return;
      }
      if (input.email && !EMAIL_RE.test(input.email.trim())) {
        reject(new Error('Enter a valid email address.'));
        return;
      }
      resolve({
        outcome: input.email?.trim() ? 'email-invite-pending' : 'details-submitted',
        businessName: business.name,
        isMock: true,
      });
    }, MOCK_LATENCY_MS);
  });
}
