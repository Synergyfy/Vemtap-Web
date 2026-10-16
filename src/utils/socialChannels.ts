/**
 * Social / messaging channel helpers.
 *
 * VEMTAP lets a merchant publish the places customers can find or contact them
 * (Instagram, Facebook, TikTok, YouTube, LinkedIn, WhatsApp and X). Merchants
 * should never have to know the canonical URL shape: they can paste a bare
 * `@handle`, a username, or a full profile link and we turn it into one
 * canonical, clickable destination URL.
 *
 * This module is intentionally frontend-only — it validates and normalises the
 * value the same way on every screen so the picker, the onboarding flow and the
 * storefront studio all agree on what "valid" means.
 */

export type ChannelPlatformId =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'whatsapp'
  | 'x';

export type ChannelInputKind = 'handle' | 'phone';

export interface ChannelPlatform {
  id: ChannelPlatformId;
  label: string;
  /** Material Symbols icon name (the icon set has no brand glyphs). */
  icon: string;
  /** Tailwind classes for the round platform chip. */
  iconClass: string;
  kind: ChannelInputKind;
  placeholder: string;
  hint: string;
}

/** Platforms VEMTAP supports, in the order shown to merchants. */
export const CHANNEL_PLATFORMS: ChannelPlatform[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'photo_camera',
    iconClass: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-on-primary',
    kind: 'handle',
    placeholder: '@urbangrill_lagos',
    hint: 'Username, @handle or link',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'thumb_up',
    iconClass: 'bg-[#1877F2] text-on-primary',
    kind: 'handle',
    placeholder: '@urbangrillbistro',
    hint: 'Username, @handle or link',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: 'music_note',
    iconClass: 'bg-inverse-surface text-on-primary',
    kind: 'handle',
    placeholder: '@urbangrill',
    hint: 'Username, @handle or link',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: 'smart_display',
    iconClass: 'bg-[#FF0000] text-on-primary',
    kind: 'handle',
    placeholder: '@urbangrill',
    hint: '@handle or channel link',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'work',
    iconClass: 'bg-[#0A66C2] text-on-primary',
    kind: 'handle',
    placeholder: 'company/urban-grill',
    hint: 'Company page or /in/ link',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'chat',
    iconClass: 'bg-badge-discount-text text-on-primary',
    kind: 'phone',
    placeholder: '0803 555 9821',
    hint: 'Phone number — link built for you',
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    icon: 'tag',
    iconClass: 'bg-inverse-surface text-on-primary',
    kind: 'handle',
    placeholder: '@urbangrillng',
    hint: 'Username, @handle or link',
  },
];

export const CHANNEL_PLATFORM_BY_ID: Record<ChannelPlatformId, ChannelPlatform> = CHANNEL_PLATFORMS.reduce(
  (map, platform) => {
    map[platform.id] = platform;
    return map;
  },
  {} as Record<ChannelPlatformId, ChannelPlatform>,
);

export function isChannelPlatform(value: string): value is ChannelPlatformId {
  return Object.prototype.hasOwnProperty.call(CHANNEL_PLATFORM_BY_ID, value);
}

export interface NormalizedChannel {
  ok: true;
  platform: ChannelPlatformId;
  /** Canonical destination URL that opens the profile / chat. */
  url: string;
  /** Clean handle (without a leading @) or WhatsApp digits. */
  handle: string;
  /** Short human label, e.g. `@urbangrill` or `+234 803 555 9821`. */
  display: string;
}

export interface ChannelError {
  ok: false;
  platform: ChannelPlatformId;
  error: string;
}

export type ChannelResult = NormalizedChannel | ChannelError;

/** Reasonable default for the Nigeria-first phone field. */
export interface WhatsAppOptions {
  /** Country calling code without '+', e.g. `234`. */
  defaultCountryCode?: string;
  /** National trunk prefix, e.g. `0`. */
  trunkPrefix?: string;
}

const ok = (platform: ChannelPlatformId, url: string, handle: string, display: string): NormalizedChannel => ({
  ok: true,
  platform,
  url,
  handle,
  display,
});

const fail = (platform: ChannelPlatformId, error: string): ChannelError => ({ ok: false, platform, error });

// --- Shared URL helpers ----------------------------------------------------

const URL_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

const stripAt = (value: string) => value.replace(/^@+/, '').trim();

const pathSegments = (url: URL) =>
  url.pathname
    .split('/')
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .filter(Boolean);

const normalizeHost = (host: string) =>
  host.toLowerCase().replace(/^www\./, '').replace(/^m\./, '').replace(/^mobile\./, '');

const matchesHost = (hostname: string, hosts: string[]) => {
  const host = normalizeHost(hostname);
  return hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
};

/**
 * Turn loose merchant input into a URL only when it genuinely looks like one.
 * `urbangrill` / `john.doe` stay handles; `instagram.com/x`, `x.com/y` and
 * `https://…` become URLs.
 */
const coerceUrl = (value: string): URL | null => {
  const hasScheme = URL_SCHEME.test(value);
  if (!hasScheme && !value.includes('/')) return null;
  try {
    return new URL(hasScheme ? value : `https://${value}`);
  } catch {
    return null;
  }
};

// --- Per-platform handle rules --------------------------------------------

interface HandleRules {
  hosts: string[];
  fromUrl: (url: URL) => string | null;
  validate: (handle: string) => string | null;
  toUrl: (handle: string) => string;
  display: (handle: string) => string;
}

const RESERVED = {
  instagram: new Set(['p', 'reel', 'reels', 'stories', 'explore', 'tv', 'accounts', 'about', 'legal', 'directory']),
  facebook: new Set(['watch', 'marketplace', 'gaming', 'groups', 'events', 'pages', 'people', 'help', 'login', 'policy', 'recover']),
  tiktok: new Set(['video', 'tag', 'music', 'discover', 'foryou', 'search', 'sound', 'live', 'explore']),
  linkedin: new Set(['feed', 'jobs', 'posts', 'pulse', 'help', 'login', 'signup', 'learning', 'games']),
  x: new Set(['home', 'explore', 'notifications', 'messages', 'search', 'i', 'intent', 'hashtag', 'settings', 'compose']),
};

const HANDLERS: Record<Exclude<ChannelPlatformId, 'whatsapp'>, HandleRules> = {
  instagram: {
    hosts: ['instagram.com'],
    fromUrl: (url) => {
      const [first] = pathSegments(url);
      if (!first || RESERVED.instagram.has(first.toLowerCase())) return null;
      return stripAt(first);
    },
    validate: (handle) =>
      /^[A-Za-z0-9._]{1,30}$/.test(handle)
        ? null
        : 'Instagram usernames can only use letters, numbers, dots and underscores.',
    toUrl: (handle) => `https://www.instagram.com/${handle}`,
    display: (handle) => `@${handle}`,
  },
  facebook: {
    hosts: ['facebook.com', 'fb.com', 'fb.me'],
    fromUrl: (url) => {
      const [first, second] = pathSegments(url);
      if (!first) return null;
      if (first.toLowerCase() === 'profile.php') {
        const id = url.searchParams.get('id');
        return id && /^\d+$/.test(id) ? `profile.php?id=${id}` : null;
      }
      if (RESERVED.facebook.has(first.toLowerCase())) return null;
      // Pages are commonly shared as /pages/<name>/<id>.
      if (first.toLowerCase() === 'pages' && second) return `pages/${second}`;
      return stripAt(first);
    },
    validate: (handle) => {
      if (handle.startsWith('profile.php?id=')) {
        return /^\d+$/.test(handle.slice('profile.php?id='.length))
          ? null
          : 'That Facebook link is missing a numeric profile id.';
      }
      if (handle.startsWith('pages/')) {
        return handle.length > 'pages/'.length ? null : 'That Facebook page link looks incomplete.';
      }
      return /^[A-Za-z0-9.]{5,50}$/.test(handle)
        ? null
        : 'Facebook usernames need at least 5 letters, numbers or dots.';
    },
    toUrl: (handle) => `https://www.facebook.com/${handle}`,
    display: (handle) => (handle.startsWith('profile.php') || handle.startsWith('pages/') ? handle : `@${handle}`),
  },
  tiktok: {
    hosts: ['tiktok.com'],
    fromUrl: (url) => {
      const [first] = pathSegments(url);
      if (!first) return null;
      const handle = stripAt(first);
      if (RESERVED.tiktok.has(handle.toLowerCase())) return null;
      return handle;
    },
    validate: (handle) =>
      /^[A-Za-z0-9._]{2,24}$/.test(handle) ? null : 'TikTok usernames are 2–24 letters, numbers, dots or underscores.',
    toUrl: (handle) => `https://www.tiktok.com/@${handle}`,
    display: (handle) => `@${handle}`,
  },
  youtube: {
    hosts: ['youtube.com', 'youtu.be'],
    fromUrl: (url) => {
      const [first, second] = pathSegments(url);
      if (!first) return null;
      if (first.startsWith('@')) return first;
      const lower = first.toLowerCase();
      if ((lower === 'channel' || lower === 'c' || lower === 'user') && second) return `${lower}/${second}`;
      return null;
    },
    validate: (handle) => {
      if (/^(channel|c|user)\//.test(handle)) {
        return /^[A-Za-z0-9._-]{1,80}$/.test(handle.split('/')[1] ?? '')
          ? null
          : 'That YouTube channel link looks incomplete.';
      }
      return /^[A-Za-z0-9._-]{1,60}$/.test(stripAt(handle))
        ? null
        : 'Enter a YouTube @handle or a channel / c / user link.';
    },
    toUrl: (handle) =>
      handle.startsWith('@') || /^(channel|c|user)\//.test(handle)
        ? `https://www.youtube.com/${handle}`
        : `https://www.youtube.com/@${stripAt(handle)}`,
    display: (handle) => {
      if (handle.startsWith('@') || /^(channel|c|user)\//.test(handle)) return handle;
      return `@${stripAt(handle)}`;
    },
  },
  linkedin: {
    hosts: ['linkedin.com'],
    fromUrl: (url) => {
      const [first, second] = pathSegments(url);
      if (!first) return null;
      const lower = first.toLowerCase();
      if ((lower === 'in' || lower === 'company' || lower === 'school' || lower === 'showcase') && second) {
        return `${lower}/${second}`;
      }
      if (RESERVED.linkedin.has(lower)) return null;
      return `company/${stripAt(first)}`;
    },
    validate: (handle) => {
      const path = /^(in|company|school|showcase)\/([A-Za-z0-9-]{2,100})$/.exec(handle);
      if (path) return null;
      return /^[A-Za-z0-9-]{2,100}$/.test(handle) ? null : 'Enter a LinkedIn company page or an /in/ profile.';
    },
    toUrl: (handle) => {
      const path = /^(in|company|school|showcase)\//.test(handle) ? handle : `company/${handle}`;
      return `https://www.linkedin.com/${path}`;
    },
    display: (handle) => {
      const path = /^(in|company|school|showcase)\//.test(handle) ? handle : `company/${handle}`;
      return `linkedin.com/${path}`;
    },
  },
  x: {
    hosts: ['x.com', 'twitter.com'],
    fromUrl: (url) => {
      const [first] = pathSegments(url);
      if (!first || RESERVED.x.has(first.toLowerCase())) return null;
      return stripAt(first);
    },
    validate: (handle) =>
      /^[A-Za-z0-9_]{1,15}$/.test(handle) ? null : 'X usernames use up to 15 letters, numbers or underscores.',
    toUrl: (handle) => `https://x.com/${handle}`,
    display: (handle) => `@${handle}`,
  },
};

const normalizeHandleChannel = (
  platform: Exclude<ChannelPlatformId, 'whatsapp'>,
  raw: string,
  rules: HandleRules,
): ChannelResult => {
  const value = raw.trim();
  if (!value) return fail(platform, 'Enter a username, @handle or profile link.');

  const url = coerceUrl(value);
  if (url) {
    if (matchesHost(url.hostname, rules.hosts)) {
      const handle = rules.fromUrl(url);
      if (!handle) {
        return fail(platform, `That ${CHANNEL_PLATFORM_BY_ID[platform].label} link is not a profile page.`);
      }
      const error = rules.validate(handle);
      if (error) return fail(platform, error);
      return ok(platform, rules.toUrl(handle), handle, rules.display(handle));
    }
    // A real URL pointed at some other site.
    if (URL_SCHEME.test(value)) {
      return fail(platform, `Use a link from ${rules.hosts[0]} or type your @handle.`);
    }
  }

  // Not a URL we recognise — treat it as a bare handle or platform-specific path.
  const handle = stripAt(value);
  const error = rules.validate(handle);
  if (error) return fail(platform, error);
  return ok(platform, rules.toUrl(handle), handle, rules.display(handle));
};

/**
 * WhatsApp is special: merchants type a phone number, never `wa.me`. We only
 * add the country code when it can be established reliably and we never prefix
 * a number that already carries one.
 */
export function normalizeWhatsApp(raw: string, options: WhatsAppOptions = {}): ChannelResult {
  const platform: ChannelPlatformId = 'whatsapp';
  const countryCode = (options.defaultCountryCode ?? '234').replace(/\D/g, '');
  const trunk = options.trunkPrefix ?? '0';
  const trimmed = raw.trim();
  if (!trimmed) return fail(platform, 'Enter a WhatsApp phone number.');

  const rawDigits = trimmed.replace(/\D/g, '');
  if (!rawDigits) return fail(platform, 'Enter a valid phone number using digits.');

  const hasPlus = trimmed.startsWith('+');
  const hasDoubleZero = !hasPlus && rawDigits.startsWith('00');
  let digits = hasDoubleZero ? rawDigits.slice(2) : rawDigits;

  let normalized: string;
  if (hasPlus || hasDoubleZero) {
    // Caller told us the country code explicitly — trust it.
    normalized = digits;
  } else if (countryCode && digits.startsWith(countryCode) && digits.length >= countryCode.length + 8) {
    // Already carries this country code (e.g. 234803…), don't double it.
    normalized = digits;
  } else if (trunk && digits.startsWith(trunk)) {
    // Local format with a trunk zero (e.g. 0803…) → swap the zero for the code.
    normalized = `${countryCode}${digits.slice(trunk.length)}`;
  } else if (digits.length === 10 && /^[789]/.test(digits)) {
    // Local mobile missing the trunk zero (e.g. 803…) → add the country code.
    normalized = `${countryCode}${digits}`;
  } else if (digits.length >= 11) {
    // Looks like a full international number typed without a leading '+'.
    normalized = digits;
  } else {
    return fail(platform, 'Add the country code (e.g. +234) so we can build a reliable link.');
  }

  if (normalized.length < 8 || normalized.length > 15) {
    return fail(platform, 'That phone number does not look valid. Check the digits and country code.');
  }

  return ok(platform, `https://wa.me/${normalized}`, normalized, `+${normalized}`);
}

/** Normalise any supported platform value into a canonical destination URL. */
export function normalizeChannel(
  platform: ChannelPlatformId,
  raw: string,
  options: WhatsAppOptions = {},
): ChannelResult {
  if (platform === 'whatsapp') return normalizeWhatsApp(raw, options);
  return normalizeHandleChannel(platform, raw, HANDLERS[platform]);
}

/** First platform id in `candidates` that is not already represented. */
export function firstAvailablePlatform(
  used: readonly ChannelPlatformId[],
  candidates: readonly ChannelPlatformId[] = CHANNEL_PLATFORMS.map((platform) => platform.id),
): ChannelPlatformId | null {
  return candidates.find((candidate) => !used.includes(candidate)) ?? null;
}
