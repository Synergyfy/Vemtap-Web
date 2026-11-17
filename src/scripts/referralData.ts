/**
 * VEMTAP Referral System — frontend model.
 *
 * Codes, links and QR codes work against the live backend:
 *  - `useReferralIdentity()` reads the code stored on the account
 *    (`GET /referrals/me`); `buildDemoReferralCode()` remains only as the
 *    stand-in when no API is configured (demo mode).
 *  - The provisional code captured from a referral URL or typed during
 *    sign-up is kept in localStorage (`vemtap_referral`, 30-day TTL) so it
 *    survives a reload mid-sign-up. It is sent with the sign-up request (or
 *    claimed with `POST /referrals/claim` for Google) and cleared once the
 *    account is registered or the claim succeeds.
 *  - `validateReferralCode()` stays format-only; the server decides whether a
 *    code exists, and an unknown code never blocks sign-up.
 */

export const REFERRAL_URL_PARAM = 'ref';

export type ReferralAudience = 'customer' | 'business';

export interface ReferralIdentity {
  /** The account's referral code — stored on the server, empty while it loads. */
  code: string;
  link: string;
  /** True only for the demo-mode preview code (no API configured). */
  isPreview: boolean;
}

/** Letters and digits, without 0/O/1/I so a preview code can be read aloud safely. */
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_DIGITS = '23456789';
const CODE_ALPHABET = CODE_LETTERS + CODE_DIGITS;
const CODE_LENGTH = 6;

/* ------------------------------------------------------------------ *
 * Codes
 * ------------------------------------------------------------------ */

/** Uppercases, keeps letters/digits/dashes (`VEM-8OGUU4` stays intact), max 16 chars. */
export function normaliseReferralCode(input: string): string {
  return input.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().slice(0, 16);
}

export interface ReferralCodeValidation {
  ok: boolean;
  code: string;
  message?: string;
}

/**
 * Local, format-only validation. The app has no server to confirm that a code
 * exists, so callers must present `ok` as "format accepted", never as
 * "referral verified" — see `REFERRAL_PENDING_NOTICE`.
 */
export function validateReferralCode(input: string): ReferralCodeValidation {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, code: '', message: 'Enter a referral code, or choose Skip for now.' };
  }
  if (/[^a-zA-Z0-9\s-]/.test(trimmed)) {
    return { ok: false, code: normaliseReferralCode(trimmed), message: 'Referral codes use letters, numbers and dashes only.' };
  }
  const code = normaliseReferralCode(trimmed);
  if (code.length < 4 || code.length > 16) {
    return { ok: false, code, message: 'Referral codes are 4 to 16 characters long.' };
  }
  return { ok: true, code };
}

/** Deterministic FNV-1a + xorshift so the same identity always previews the same code. */
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Stand-in for the code a backend will issue per account. Deterministic on
 * purpose: it lets the UI block "you entered your own code" locally.
 *
 * Codes are always alphanumeric — a plain draw comes out letters-only for
 * roughly one seed in five, so the missing kind is forced into one position.
 * The forced position is drawn from the seed too, so determinism (and with it
 * the self-referral check) is preserved.
 */
export function buildDemoReferralCode(seed: string): string {
  const source = seed.trim().toLowerCase() || 'guest';
  let state = hashString(source) || 1;
  const out: string[] = [];
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    out.push(CODE_ALPHABET[state % CODE_ALPHABET.length]);
  }

  const force = (pool: string) => {
    state >>>= 3;
    out[state % out.length] = pool[state % pool.length];
  };

  if (!out.some((character) => CODE_DIGITS.includes(character))) force(CODE_DIGITS);
  // Runs second so it corrects the (astronomically rare) all-digit draw too.
  if (!out.some((character) => CODE_LETTERS.includes(character))) force(CODE_LETTERS);

  return out.join('');
}

/**
 * The link a code points at: the sign-up page itself (customers: "Create
 * account", businesses: business sign-up), so the invited person starts
 * signing up straight away and Profile Setup prefills the code. Built from the
 * current origin so staging, production and local links all scan and share
 * correctly.
 */
export function buildReferralLink(code: string, audience: ReferralAudience = 'customer'): string {
  const base = `${window.location.origin}${audience === 'business' ? '/business-auth' : '/auth-code'}`;
  return code ? `${base}?${REFERRAL_URL_PARAM}=${encodeURIComponent(code)}` : base;
}

export function buildReferralIdentity(seed: string): ReferralIdentity {
  const code = buildDemoReferralCode(seed);
  return { code, link: buildReferralLink(code), isPreview: true };
}

/* ------------------------------------------------------------------ *
 * Provisional code carried through onboarding (localStorage, 30 days)
 * ------------------------------------------------------------------ */

/** localStorage key holding the provisional referral code between reloads. */
const PROVISIONAL_STORAGE_KEY = 'vemtap_referral';

/** A provisional code expires after 30 days. */
const PROVISIONAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** What is written to localStorage — `savedAt` drives the TTL. */
interface StoredProvisionalReferral {
  code: string;
  source: 'url' | 'manual';
  savedAt: number;
}

function readStoredProvisional(): StoredProvisionalReferral | null {
  try {
    const raw = window.localStorage.getItem(PROVISIONAL_STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredProvisionalReferral;
    if (!stored || typeof stored.code !== 'string' || !stored.code) return null;
    if (typeof stored.savedAt !== 'number' || Date.now() - stored.savedAt > PROVISIONAL_TTL_MS) {
      window.localStorage.removeItem(PROVISIONAL_STORAGE_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

export function getProvisionalReferralCode(): string {
  return readStoredProvisional()?.code ?? '';
}

/** True when the provisional code was prefilled from a referral URL. */
export function provisionalReferralIsFromUrl(): boolean {
  return readStoredProvisional()?.source === 'url';
}

export function setProvisionalReferralCode(code: string, source: 'url' | 'manual' = 'manual'): void {
  const stored = normaliseReferralCode(code);
  try {
    if (stored) {
      window.localStorage.setItem(
        PROVISIONAL_STORAGE_KEY,
        JSON.stringify({ code: stored, source, savedAt: Date.now() } satisfies StoredProvisionalReferral),
      );
    } else {
      window.localStorage.removeItem(PROVISIONAL_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode); the code then only lives for
    // this page load, which still covers a single sign-up session.
  }
}

export function clearProvisionalReferralCode(): void {
  try {
    window.localStorage.removeItem(PROVISIONAL_STORAGE_KEY);
  } catch {
    // ignore storage errors in restricted contexts
  }
}

/* ------------------------------------------------------------------ *
 * Referral URL handling
 * ------------------------------------------------------------------ */

/**
 * Reads a referral code from the current URL using the frontend's existing
 * query-string convention (`new URLSearchParams(window.location.search)`).
 * Accepts `?ref=`, `?referral=` or `?invite=`.
 */
export function readReferralCodeFromUrl(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(REFERRAL_URL_PARAM) ?? params.get('referral') ?? params.get('invite');
    return raw ? normaliseReferralCode(raw) : '';
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ *
 * Sharing
 * ------------------------------------------------------------------ */

export const FRIEND_SHARE_MESSAGE =
  'Discover VEMTAP — find local deals and connect with businesses around you.';

export const BUSINESS_SHARE_MESSAGE =
  'Grow your reach with VEMTAP — list your business, publish deals and connect with customers around you.';

export function referralShareMessage(audience: ReferralAudience, link: string): string {
  const headline = audience === 'business' ? BUSINESS_SHARE_MESSAGE : FRIEND_SHARE_MESSAGE;
  return `${headline} Join here: ${link}`;
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildXShareUrl(message: string, link: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`;
}

export type ShareOutcome = 'shared' | 'cancelled' | 'unavailable' | 'copied';

/** Web Share API where supported; otherwise the caller falls back to Copy Link. */
export async function shareViaWebShare(options: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareOutcome> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unavailable';
  }
  try {
    await navigator.share(options);
    return 'shared';
  } catch (error) {
    // A dismissed share sheet is a normal user action, not a failure.
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    return 'unavailable';
  }
}

export async function copyTextToClipboard(value: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Benefits copy — deliberately free of amounts, prizes and redemption values
 * ------------------------------------------------------------------ */

export const REFERRAL_PROGRAMME_NOTICE =
  'Reward amounts and qualification conditions will be announced when the referral programme is activated.';

export const BUSINESS_REFERRAL_BENEFITS: string[] = [
  'Refer other businesses to VEMTAP.',
  'Qualifying referrals may earn VEMTAP Credits.',
  'Credits are intended for eligible VEMTAP subscriptions, SMS credits and AI credits.',
  'Rewards will depend on the programme’s final eligibility rules.',
];

export const CUSTOMER_REFERRAL_BENEFITS: string[] = [
  'Refer businesses and friends to VEMTAP.',
  'Qualifying referrals may earn Points.',
  'Points may unlock participating-business discounts, offers and future rewards.',
  'Special referral challenges and prizes may be introduced later.',
];

/* ------------------------------------------------------------------ *
 * Dashboard page copy shared by the business and customer pages
 * ------------------------------------------------------------------ */

export const BUSINESS_HOW_IT_WORKS: string[] = [
  'Share your referral link with another business.',
  'The business registers and completes onboarding.',
  'Qualifying onboarding may earn a configured reward.',
  'A qualifying paid subscription may unlock an additional reward.',
  'Eligible credits may be used for VEMTAP subscriptions, SMS credits and AI credits.',
];

export const CUSTOMER_HOW_IT_WORKS: string[] = [
  'Share your referral link with a business or a friend.',
  'They sign up to VEMTAP and complete the relevant setup.',
  'Business referrals may earn a smaller onboarding reward, plus a larger bonus when a qualifying business subscribes.',
  'Consumer referrals may earn points for completing qualifying activities.',
  'Points may be redeemed for available participating-business discounts and rewards.',
];

export const REFERRAL_REWARDS_DISCLAIMER =
  'All reward values and qualification rules will be announced when the programme is activated.';

export const BUSINESS_REFERRAL_DISCLAIMER =
  'Reward rules will be finalised when the referral programme is activated.';
