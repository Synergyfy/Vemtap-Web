/**
 * Admin-controlled referral explainer video.
 *
 * FRONTEND ONLY. There is no backend yet, so this module is the single source
 * of truth for the video the "See Referral Benefits" popup plays. It is edited
 * from the Platform Admin screen at `/admin/referral`.
 *
 * Integration notes for the future backend:
 *  - `getReferralVideoSetting()` → replace with `GET /admin/referral-video`.
 *  - `setReferralVideoUrl()` → replace with `PUT /admin/referral-video`.
 *  - The localStorage override exists only so an admin can swap the link in
 *    this build without redeploying. It must never win over a real API value.
 *  - Only YouTube is supported because the player is an embed. Widen
 *    `parseYouTubeId` when the backend accepts other providers.
 */

/**
 * Shipped default. This is YouTube's own public IFrame-player sample video —
 * deliberately a real, playable, long-lived link rather than an invented URL,
 * so the player demonstrably works until an admin swaps in the real explainer.
 */
export const DEFAULT_REFERRAL_VIDEO_URL = 'https://www.youtube.com/watch?v=M7lc1UVf-VE';

const STORAGE_KEY = 'vemtap_admin_referral_video';

/** YouTube video ids are exactly 11 URL-safe characters. */
const VIDEO_ID = /^[\w-]{11}$/;

export interface ReferralVideoSetting {
  /** The link as stored — the shipped default, or an admin's override. */
  url: string;
  /** True once an admin has replaced the shipped default. */
  overridden: boolean;
}

export interface ReferralVideoUpdateResult {
  ok: boolean;
  /** Plain-language reason, present only when `ok` is false. */
  message?: string;
}

/**
 * Accepts every YouTube shape an admin is likely to paste — a bare id,
 * `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/` or `/live/` — and returns the
 * 11-character id, or null when the link isn't a YouTube video.
 */
export function parseYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (VIDEO_ID.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '').toLowerCase();

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0] ?? '';
    return VIDEO_ID.test(id) ? id : null;
  }

  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;

  const fromQuery = url.searchParams.get('v');
  if (fromQuery && VIDEO_ID.test(fromQuery)) return fromQuery;

  // /embed/{id}, /shorts/{id}, /live/{id}, /v/{id}
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts.length >= 2 ? parts[1] : '';
  return VIDEO_ID.test(id) ? id : null;
}

/** Embed-safe player URL for a raw link, or null when it can't play. */
export function referralVideoEmbedUrl(url: string): string | null {
  const id = parseYouTubeId(url);
  // youtube-nocookie keeps the embed off the tracking-cookie path.
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}

/** True when the given link would actually play in the embed. */
export function isPlayableVideo(url: string): boolean {
  return referralVideoEmbedUrl(url) !== null;
}

export function getReferralVideoSetting(): ReferralVideoSetting {
  if (typeof window === 'undefined') return { url: DEFAULT_REFERRAL_VIDEO_URL, overridden: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { url: DEFAULT_REFERRAL_VIDEO_URL, overridden: false };
    const parsed: unknown = JSON.parse(raw);
    const url =
      typeof parsed === 'object' && parsed !== null && 'url' in parsed
        ? (parsed as { url: unknown }).url
        : null;
    // A corrupt or since-rejected value silently falls back to the default.
    if (typeof url === 'string' && isPlayableVideo(url)) return { url, overridden: true };
  } catch {
    // localStorage unavailable or unparsable — the default is still correct.
  }
  return { url: DEFAULT_REFERRAL_VIDEO_URL, overridden: false };
}

export function getReferralVideoUrl(): string {
  return getReferralVideoSetting().url;
}

/**
 * Saves an admin's replacement link. An empty string clears the override so
 * the shipped default comes back — never a broken player.
 */
export function setReferralVideoUrl(input: string): ReferralVideoUpdateResult {
  const trimmed = input.trim();
  if (!trimmed) {
    clearReferralVideoUrl();
    return { ok: true };
  }
  if (!isPlayableVideo(trimmed)) {
    return {
      ok: false,
      message: 'That is not a YouTube link. Paste a youtube.com/watch, youtu.be or /shorts URL.',
    };
  }
  if (typeof window === 'undefined') return { ok: false, message: 'Local storage is not available here.' };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: trimmed, updatedAt: Date.now() }));
  } catch {
    return { ok: false, message: 'This browser blocked local storage, so the change was not saved.' };
  }
  return { ok: true };
}

export function clearReferralVideoUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
