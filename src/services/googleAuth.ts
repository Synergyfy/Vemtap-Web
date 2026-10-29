/**
 * "Continue with Google" for the live API.
 *
 * The button sends the visitor to Google's OpenID Connect page; Google sends
 * them back to `/google-callback` with an ID token in the URL fragment, which
 * the backend verifies (`POST /auth/google`). A full-page redirect keeps the
 * existing buttons as they are and avoids popup blockers.
 */

/** Which journey started the Google sign-in. */
export type GoogleIntent = 'customer' | 'business' | 'sign-in';

export interface GooglePending {
  intent: GoogleIntent;
  /** The screen to return to (and to show an error on). */
  from: string;
  nonce: string;
  state: string;
}

export interface GoogleRedirectResult {
  pending: GooglePending;
  idToken?: string;
  /** Google's error code, e.g. `access_denied` when the visitor cancels. */
  error?: string;
}

const PENDING_KEY = 'vemtap_google_pending';
const CALLBACK_PATH = '/google-callback';

const clientId = () => (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || '';

const randomToken = () => {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/** Reads one claim from a JWT payload without verifying it (the backend verifies). */
const readJwtClaim = (jwt: string, claim: string): unknown => {
  try {
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return (JSON.parse(window.atob(payload)) as Record<string, unknown>)[claim];
  } catch {
    return undefined;
  }
};

/** Leaves the app for Google's account picker. Throws when Google sign-in isn't configured. */
export function startGoogleSignIn(intent: GoogleIntent, from: string) {
  const id = clientId();
  if (!id) throw new Error('Google sign-in isn’t available right now. Use your email instead.');

  const pending: GooglePending = { intent, from, nonce: randomToken(), state: randomToken() };
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    throw new Error('Google sign-in needs browser storage. Turn off private browsing and try again.');
  }

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: id,
    redirect_uri: `${window.location.origin}${CALLBACK_PATH}`,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: pending.nonce,
    state: pending.state,
    prompt: 'select_account',
  }).toString();
  window.location.assign(url.toString());
}

/**
 * On the page Google returned to, picks up the result once (and forgets the
 * pending attempt). Returns null on every other page load.
 */
export function takeGoogleRedirectResult(): GoogleRedirectResult | null {
  if (window.location.pathname !== CALLBACK_PATH) return null;

  let pending: GooglePending | null = null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    window.sessionStorage.removeItem(PENDING_KEY);
    pending = raw ? (JSON.parse(raw) as GooglePending) : null;
  } catch {
    pending = null;
  }
  if (!pending) return null;

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if (params.get('state') !== pending.state) return { pending, error: 'state_mismatch' };
  const error = params.get('error');
  if (error) return { pending, error };

  const idToken = params.get('id_token') ?? '';
  if (!idToken || readJwtClaim(idToken, 'nonce') !== pending.nonce) return { pending, error: 'invalid_token' };
  return { pending, idToken };
}
