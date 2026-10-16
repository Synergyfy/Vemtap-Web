import type { BusinessContact } from '../../context/ContactsContext';
import { URBAN_BUSINESS } from '../businessData';

/**
 * SMS & Email campaign model for the Messages section.
 *
 * Everything here is frontend-only demonstration data: campaigns, sample
 * contacts, templates and simulated delivery events are stored in local state
 * (see CampaignsContext). No SMS gateway or email provider is connected.
 *
 * BACKEND GAP — a future API must own: recipient eligibility + consent checks,
 * unsubscribe/suppression lists, actual sending, scheduling execution,
 * delivery/engagement webhooks and per-message pricing.
 */

export type CampaignChannel = 'sms' | 'email';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'paused';

/** How the business picks who receives the campaign. */
export type AudienceMode = 'all' | 'segment' | 'individual' | 'filtered';

export type ActivityFilter = 'any' | 'new' | 'returning' | 'frequent';
export type SpendFilter = 'any' | 'low' | 'mid' | 'high';

export interface AudienceFilters {
  activity: ActivityFilter;
  spend: SpendFilter;
  /** Marketing opt-in is stored per contact (ContactsContext) and applies to both channels. */
  consent: 'any' | 'opted-in';
}

export interface AudienceSelection {
  mode: AudienceMode;
  /** Saved segment key when mode === 'segment' (see SAVED_SEGMENTS). */
  segmentKey: string;
  filters: AudienceFilters;
  /** Contact keys when mode === 'individual'. */
  selectedKeys: string[];
}

/**
 * Contact shape used by the campaign audience pool.
 *
 * `unsubscribedChannels` is deliberately NOT added to BusinessContact — it only
 * exists on sample records so channel-level opt-outs can be demonstrated
 * without touching the shared customer database.
 * BACKEND GAP: real unsubscribe/suppression state lives server-side.
 */
export interface CampaignContact extends BusinessContact {
  unsubscribedChannels?: CampaignChannel[];
}

export interface ExclusionBreakdown {
  reason: ExclusionReason;
  label: string;
  count: number;
}

export type ExclusionReason = 'no-consent' | 'unsubscribed' | 'missing-phone' | 'missing-email';

export interface AudienceOutcome {
  /** Contacts that matched the selection, before channel eligibility. */
  matched: CampaignContact[];
  /** Contacts that may actually receive the message. */
  eligible: CampaignContact[];
  excluded: Array<{ contact: CampaignContact; reason: ExclusionReason }>;
  excludedCount: number;
  exclusionCounts: ExclusionBreakdown[];
}

export interface CampaignStats {
  queued: number;
  sent?: number;
  delivered?: number;
  failed?: number;
  bounced?: number;
  opened?: number;
  clicked?: number;
}

export interface CampaignHistoryEntry {
  at: number;
  label: string;
  kind: 'created' | 'edited' | 'saved' | 'scheduled' | 'cancelled' | 'queued' | 'sent' | 'failed' | 'duplicated';
}

export interface CampaignRecord {
  id: string;
  channel: CampaignChannel;
  name: string;
  status: CampaignStatus;
  audience: AudienceSelection;
  /** Human summary of the selection, e.g. "Segment · Returning Customers". */
  audienceLabel: string;
  /** Eligible recipients captured when the campaign was saved/scheduled/sent. */
  recipientCount: number;
  /** Contacts matched but not sendable, captured at the same time. */
  excludedCount: number;
  exclusionBreakdown: ExclusionBreakdown[];
  // --- content ---
  smsBody?: string;
  smsLink?: string;
  emailSubject?: string;
  emailPreheader?: string;
  emailBody?: string;
  senderName?: string;
  senderEmail?: string;
  // --- timing ---
  createdAt: number;
  updatedAt: number;
  scheduledAt?: number;
  sentAt?: number;
  // --- results ---
  stats?: CampaignStats;
  history: CampaignHistoryEntry[];
  /** True when this record was queued locally instead of by a provider. */
  simulatedSend?: boolean;
}

/* ------------------------------------------------------------------ */
/* Business + provider constants                                       */
/* ------------------------------------------------------------------ */

/** Times are displayed in the business timezone, matching the rest of VEMTAP. */
export const CAMPAIGN_TIMEZONE = { short: 'WAT', long: 'West Africa Time (WAT)', offset: 'UTC+1' };

export const BUSINESS_NAME = URBAN_BUSINESS.name;

/**
 * SMS credit pricing shown in More → Add-ons & Credits ("₦1,500 / 100 Credits").
 * It is the only pricing data that exists in this project, so estimates are
 * labelled as demonstration figures — a connected provider must confirm them.
 */
export const SMS_CREDIT_BUNDLE = { naira: 1500, credits: 100 };
/** Balance surfaced on the Add-ons screen (hard-coded there too). */
export const SMS_CREDIT_BALANCE = 0;
export const SMS_CREDITS_PER_SEGMENT = 1;

/* ------------------------------------------------------------------ */
/* Personalisation                                                     */
/* ------------------------------------------------------------------ */

export interface PersonalisationToken {
  token: string;
  label: string;
  sample: string;
}

/** Only tokens the current data can actually resolve. */
export const PERSONALISATION_TOKENS: PersonalisationToken[] = [
  { token: '{{first_name}}', label: 'First name', sample: 'Amaka' },
  { token: '{{business_name}}', label: 'Business name', sample: BUSINESS_NAME },
];

const TOKEN_PATTERN = /\{\{\s*([a-z_]+)\s*\}\}/g;

export function findUnknownTokens(text: string): string[] {
  const known = new Set(PERSONALISATION_TOKENS.map((entry) => entry.token.replace(/[{}]/g, '')));
  const unknown = new Set<string>();
  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const key = match[1];
    if (!known.has(key)) unknown.add(`{{${key}}}`);
  }
  // A stray opening brace pair without a valid token name is still a mistake.
  for (const stray of text.matchAll(/\{\{([^}]*)\}\}/g)) {
    const key = stray[1].trim();
    if (!key || !/^[a-z_]+$/.test(key)) unknown.add(`{{${stray[1]}}}`);
  }
  return [...unknown];
}

export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
}

/** Renders a message with sample values so previews read like a real send. */
export function renderPersonalisation(
  text: string,
  contact?: Pick<CampaignContact, 'name'>,
  businessName: string = BUSINESS_NAME,
): string {
  return text.replace(TOKEN_PATTERN, (whole, key: string) => {
    switch (key) {
      case 'first_name':
        return contact ? firstNameOf(contact.name) : 'Amaka';
      case 'business_name':
        return businessName;
      default:
        return whole;
    }
  });
}

/* ------------------------------------------------------------------ */
/* SMS segments                                                        */
/* ------------------------------------------------------------------ */

const GSM7_BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const GSM7_EXTENDED = '^{}\\[~]|€';

export interface SmsAnalysis {
  /** Characters typed by the user. */
  characters: number;
  /** Billable encoding units: septets for GSM-7, UTF-16 code units for UCS-2. */
  units: number;
  encoding: 'GSM-7' | 'UCS-2';
  segments: number;
  /** Characters one segment carries before the message is split. */
  perSegment: number;
  /** 1600 septets / 700 code units is the usual concatenated ceiling. */
  overLimit: boolean;
}

/**
 * Segment maths per the GSM 03.38 / UCS-2 rules most Nigerian providers use:
 * 160 chars single (153 concatenated) for GSM-7, 70 (67 concatenated) for UCS-2.
 * Extended GSM characters cost two septets.
 */
export function analyseSms(text: string): SmsAnalysis {
  const characters = [...text].length;
  let gsm7 = true;
  let septets = 0;
  for (const char of text) {
    if (GSM7_BASIC.includes(char)) septets += 1;
    else if (GSM7_EXTENDED.includes(char)) septets += 2;
    else {
      gsm7 = false;
      break;
    }
  }

  if (gsm7) {
    const perSegment = 160;
    const segments = septets === 0 ? 0 : septets <= perSegment ? 1 : Math.ceil(septets / 153);
    return {
      characters,
      units: septets,
      encoding: 'GSM-7',
      segments,
      perSegment,
      overLimit: septets > 1600,
    };
  }

  const units = text.length;
  const perSegment = 70;
  const segments = units === 0 ? 0 : units <= perSegment ? 1 : Math.ceil(units / 67);
  return { characters, units, encoding: 'UCS-2', segments, perSegment, overLimit: units > 700 };
}

/* ------------------------------------------------------------------ */
/* Audience pool                                                       */
/* ------------------------------------------------------------------ */

/**
 * Sample customer records used when the business has not completed an order in
 * this browser yet. Names, phones and emails mirror the mock patrons already
 * shown on the Customers screen so the two screens never disagree.
 * Replace with GET /merchants/{id}/contacts once the backend exists.
 */
export const SAMPLE_CAMPAIGN_CONTACTS: CampaignContact[] = [
  {
    key: 'sample:8032198831',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Michael James',
    phone: '+234 803 219 8831',
    email: 'michael.j@example.com',
    orderRefs: ['VG-94021', 'VG-91140', 'VG-88004'],
    lastOrderRef: 'VG-94021',
    orderCount: 11,
    totalSpend: 318500,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 60,
    createdAt: Date.now() - 86400000 * 220,
    updatedAt: Date.now() - 3600000,
  },
  {
    key: 'sample:8124430912',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Sarah Adams',
    phone: '+234 812 443 0912',
    email: 'sarah.a@example.com',
    orderRefs: ['VG-93880', 'VG-90011'],
    lastOrderRef: 'VG-93880',
    orderCount: 6,
    totalSpend: 146200,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 120,
    createdAt: Date.now() - 86400000 * 180,
    updatedAt: Date.now() - 7200000,
  },
  {
    key: 'sample:8027719044',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Dr. Chidi Okafor',
    phone: '+234 802 771 9044',
    email: 'c.okafor@wusehealth.ng',
    orderRefs: ['BK-77402', 'VG-92760'],
    lastOrderRef: 'BK-77402',
    orderCount: 4,
    totalSpend: 342000,
    // Transactional relationship only — never opted into marketing.
    marketingConsent: false,
    createdAt: Date.now() - 86400000 * 300,
    updatedAt: Date.now() - 86400000,
  },
  {
    key: 'sample:8189023341',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Amaka Kalu',
    phone: '+234 818 902 3341',
    email: 'amaka.k@example.com',
    orderRefs: ['VG-94510'],
    lastOrderRef: 'VG-94510',
    orderCount: 1,
    totalSpend: 18500,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 2,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    key: 'sample:7014459022',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Tunde Bakare',
    phone: '+234 701 445 9022',
    // No email on file — SMS only.
    orderRefs: ['VG-91188'],
    lastOrderRef: 'VG-91188',
    orderCount: 3,
    totalSpend: 96500,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 40,
    createdAt: Date.now() - 86400000 * 140,
    updatedAt: Date.now() - 86400000 * 6,
  },
  {
    key: 'sample:9061187742',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Halima Yusuf',
    phone: '+234 906 118 7742',
    email: 'halima.y@example.com',
    orderRefs: ['BK-76120'],
    lastOrderRef: 'BK-76120',
    orderCount: 5,
    totalSpend: 210000,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 90,
    // Replied STOP to the last text — SMS opt-out, email still allowed.
    unsubscribedChannels: ['sms'],
    createdAt: Date.now() - 86400000 * 260,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    key: 'sample:8152246631',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Chioma Nwosu',
    phone: '+234 815 224 6631',
    email: 'chioma.n@example.com',
    orderRefs: ['VG-93010', 'VG-92440'],
    lastOrderRef: 'VG-93010',
    orderCount: 2,
    totalSpend: 62000,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 75,
    createdAt: Date.now() - 86400000 * 95,
    updatedAt: Date.now() - 86400000 * 9,
  },
  {
    key: 'sample:8039901176',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Ibrahim Musa',
    phone: '+234 803 990 1176',
    email: 'ibrahim.musa@gmail.com',
    orderRefs: ['VG-94620'],
    lastOrderRef: 'VG-94620',
    orderCount: 1,
    totalSpend: 24000,
    marketingConsent: false,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    key: 'sample:8127703308',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Ngozi Eze',
    phone: '',
    email: 'ngozi.e@example.com',
    orderRefs: ['VG-92210', 'VG-91904'],
    lastOrderRef: 'VG-92210',
    orderCount: 2,
    totalSpend: 42000,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 30,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 11,
  },
  {
    key: 'sample:8093307715',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Emeka Obi',
    phone: '+234 809 330 7715',
    email: 'emeka.obi@example.com',
    orderRefs: ['VG-91620'],
    lastOrderRef: 'VG-91620',
    orderCount: 3,
    totalSpend: 88000,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 110,
    // Clicked "unsubscribe" in the last newsletter.
    unsubscribedChannels: ['email'],
    createdAt: Date.now() - 86400000 * 200,
    updatedAt: Date.now() - 86400000 * 15,
  },
  {
    key: 'sample:8000000000',
    merchantId: '104',
    merchantName: BUSINESS_NAME,
    name: 'Bisi Adebayo',
    phone: 'N/A',
    email: undefined,
    orderRefs: ['VG-90880'],
    lastOrderRef: 'VG-90880',
    orderCount: 1,
    totalSpend: 12000,
    marketingConsent: true,
    marketingConsentAt: Date.now() - 86400000 * 20,
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 45,
  },
];

/** Real purchase-derived contacts first, sample records only fill the gaps. */
export function buildAudiencePool(contacts: BusinessContact[]): CampaignContact[] {
  const pool: CampaignContact[] = [...contacts];
  const seen = new Set(contacts.flatMap((contact) => [contact.key, digitsOf(contact.phone)]));
  for (const sample of SAMPLE_CAMPAIGN_CONTACTS) {
    const phone = digitsOf(sample.phone);
    if (seen.has(sample.key) || (phone && seen.has(phone))) continue;
    pool.push(sample);
  }
  return pool;
}

function digitsOf(value?: string): string {
  return (value ?? '').replace(/\D/g, '');
}

/* ------------------------------------------------------------------ */
/* Eligibility                                                         */
/* ------------------------------------------------------------------ */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value?: string): boolean {
  return !!value && EMAIL_PATTERN.test(value.trim());
}

/** Accepts local (0803…) and international (+234 803…) Nigerian numbers. */
export function isValidPhone(value?: string): boolean {
  const digits = digitsOf(value);
  return digits.length >= 10 && digits.length <= 15;
}

export function isEligible(contact: CampaignContact, channel: CampaignChannel): boolean {
  return !exclusionReason(contact, channel);
}

/** Returns why a contact cannot receive the message, or null when eligible. */
export function exclusionReason(contact: CampaignContact, channel: CampaignChannel): ExclusionReason | null {
  if (contact.unsubscribedChannels?.includes(channel)) return 'unsubscribed';
  if (!contact.marketingConsent) return 'no-consent';
  if (channel === 'sms') return isValidPhone(contact.phone) ? null : 'missing-phone';
  return isValidEmail(contact.email) ? null : 'missing-email';
}

export const EXCLUSION_LABELS: Record<ExclusionReason, string> = {
  'no-consent': 'No marketing opt-in',
  unsubscribed: 'Unsubscribed from this channel',
  'missing-phone': 'Missing or invalid phone number',
  'missing-email': 'Missing or invalid email address',
};

/* ------------------------------------------------------------------ */
/* Saved segments                                                      */
/* ------------------------------------------------------------------ */

/**
 * Saved segments reuse the definitions already shown on the Segments screen
 * where the contact data can express them. Deal- and branch-specific segments
 * (Lunch Combo Claimers, Wuse II Regulars…) are intentionally omitted because
 * contacts carry no deal or branch attribute — inventing one would fake the
 * recipient count.
 */
export interface SavedSegment {
  key: string;
  label: string;
  desc: string;
  match: (contact: CampaignContact) => boolean;
}

const DAY = 86400000;

export const SAVED_SEGMENTS: SavedSegment[] = [
  {
    key: 'all-customers',
    label: 'All Customers',
    desc: 'Every customer record for this business.',
    match: () => true,
  },
  {
    key: 'returning',
    label: 'Returning Customers',
    desc: 'Placed 2 or more orders.',
    match: (contact) => contact.orderCount >= 2,
  },
  {
    key: 'frequent',
    label: 'Frequent Customers (VIP)',
    desc: '5+ orders or more than ₦100,000 total spend.',
    match: (contact) => contact.orderCount >= 5 || contact.totalSpend > 100000,
  },
  {
    key: 'new-customers',
    label: 'New Customers',
    desc: 'A single order so far.',
    match: (contact) => contact.orderCount <= 1,
  },
  {
    key: 'dormant',
    label: 'Inactive / Dormant',
    desc: 'No order in the last 90 days.',
    match: (contact) => contact.updatedAt < Date.now() - DAY * 90,
  },
];

export function findSegment(key: string): SavedSegment | undefined {
  return SAVED_SEGMENTS.find((segment) => segment.key === key);
}

export const DEFAULT_FILTERS: AudienceFilters = { activity: 'any', spend: 'any', consent: 'any' };

export const DEFAULT_AUDIENCE: AudienceSelection = {
  mode: 'all',
  segmentKey: 'all-customers',
  filters: { ...DEFAULT_FILTERS },
  selectedKeys: [],
};

export const ACTIVITY_FILTER_LABELS: Record<ActivityFilter, string> = {
  any: 'Any activity',
  new: 'New (1 order)',
  returning: 'Returning (2+ orders)',
  frequent: 'Frequent (5+ orders)',
};

export const SPEND_FILTER_LABELS: Record<SpendFilter, string> = {
  any: 'Any spend',
  low: 'Under ₦20,000',
  mid: '₦20,000 – ₦100,000',
  high: 'Over ₦100,000',
};

function matchesFilters(contact: CampaignContact, filters: AudienceFilters): boolean {
  if (filters.consent === 'opted-in' && !contact.marketingConsent) return false;
  if (filters.activity !== 'any') {
    if (filters.activity === 'new' && contact.orderCount > 1) return false;
    if (filters.activity === 'returning' && contact.orderCount < 2) return false;
    if (filters.activity === 'frequent' && !(contact.orderCount >= 5 || contact.totalSpend > 100000)) return false;
  }
  if (filters.spend !== 'any') {
    if (filters.spend === 'low' && contact.totalSpend >= 20000) return false;
    if (filters.spend === 'mid' && (contact.totalSpend < 20000 || contact.totalSpend > 100000)) return false;
    if (filters.spend === 'high' && contact.totalSpend <= 100000) return false;
  }
  return true;
}

export function matchAudience(pool: CampaignContact[], selection: AudienceSelection): CampaignContact[] {
  switch (selection.mode) {
    case 'segment':
      return pool.filter(findSegment(selection.segmentKey)?.match ?? (() => true));
    case 'individual':
      return pool.filter((contact) => selection.selectedKeys.includes(contact.key));
    case 'filtered':
      return pool.filter((contact) => matchesFilters(contact, selection.filters));
    case 'all':
    default:
      return pool;
  }
}

/** Selected customers and sendable recipients are never assumed to be equal. */
export function evaluateAudience(
  pool: CampaignContact[],
  selection: AudienceSelection,
  channel: CampaignChannel,
): AudienceOutcome {
  const matched = matchAudience(pool, selection);
  const eligible: CampaignContact[] = [];
  const excluded: Array<{ contact: CampaignContact; reason: ExclusionReason }> = [];

  for (const contact of matched) {
    const reason = exclusionReason(contact, channel);
    if (reason) excluded.push({ contact, reason });
    else eligible.push(contact);
  }

  const tally = new Map<ExclusionReason, number>();
  for (const entry of excluded) tally.set(entry.reason, (tally.get(entry.reason) ?? 0) + 1);
  const exclusionCounts: ExclusionBreakdown[] = [...tally.entries()]
    .map(([reason, count]) => ({ reason, label: EXCLUSION_LABELS[reason], count }))
    .sort((a, b) => b.count - a.count);

  return { matched, eligible, excluded, excludedCount: excluded.length, exclusionCounts };
}

/** Short label for review panels, audience summaries and campaign rows. */
export function describeAudience(selection: AudienceSelection): string {
  switch (selection.mode) {
    case 'segment':
      return `Segment · ${findSegment(selection.segmentKey)?.label ?? 'All Customers'}`;
    case 'individual':
      return selection.selectedKeys.length === 1
        ? '1 selected customer'
        : `${selection.selectedKeys.length} selected customers`;
    case 'filtered': {
      const parts: string[] = [];
      if (selection.filters.activity !== 'any') parts.push(ACTIVITY_FILTER_LABELS[selection.filters.activity]);
      if (selection.filters.spend !== 'any') parts.push(SPEND_FILTER_LABELS[selection.filters.spend]);
      if (selection.filters.consent === 'opted-in') parts.push('Marketing opt-in');
      return parts.length ? `Filtered · ${parts.join(' · ')}` : 'Filtered audience';
    }
    case 'all':
    default:
      return 'All customers';
  }
}

export function countSegment(pool: CampaignContact[], segmentKey: string): number {
  const segment = findSegment(segmentKey);
  if (!segment) return 0;
  return pool.filter(segment.match).length;
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export interface MessageTemplate {
  key: string;
  channel: CampaignChannel;
  title: string;
  desc: string;
  subject?: string;
  preheader?: string;
  body: string;
}

export const SMS_TEMPLATES: MessageTemplate[] = [
  {
    key: 'new-offer',
    channel: 'sms',
    title: 'New Offer',
    desc: 'Announce something new on the menu.',
    body: 'Hi {{first_name}}, a new treat just landed at {{business_name}}. Show this text and enjoy it today. Reply STOP to opt out.',
  },
  {
    key: 'special-discount',
    channel: 'sms',
    title: 'Special Discount',
    desc: 'Limited-time price cut.',
    body: '{{first_name}}, enjoy 20% off every order this week at {{business_name}}. Valid Mon–Sat. Reply STOP to opt out.',
  },
  {
    key: 'thank-you',
    channel: 'sms',
    title: 'Customer Thank You',
    desc: 'A short appreciation note.',
    body: 'Thank you for dining with us, {{first_name}}! We loved having you at {{business_name}}. See you again soon.',
  },
  {
    key: 'loyalty-reward',
    channel: 'sms',
    title: 'Loyalty Reward',
    desc: 'Remind customers about points.',
    body: 'Hi {{first_name}}, your loyalty points are waiting at {{business_name}}. Redeem them on your next visit before they expire.',
  },
  {
    key: 'business-update',
    channel: 'sms',
    title: 'Event or Business Update',
    desc: 'Hours, location or event news.',
    body: '{{business_name}} update: we open at 10:00 AM this Saturday. {{first_name}}, your table is one call away.',
  },
  {
    key: 'follow-up',
    channel: 'sms',
    title: 'Customer Follow-up',
    desc: 'Check in after a visit.',
    body: 'Hi {{first_name}}, thanks for visiting {{business_name}}. How was everything? Reply here any time — we read every message.',
  },
];

export const EMAIL_TEMPLATES: MessageTemplate[] = [
  {
    key: 'promotional-offer',
    channel: 'email',
    title: 'Promotional Offer',
    desc: 'Drive sales with a clear offer.',
    subject: '20% off this week at {{business_name}}',
    preheader: 'A little thank-you for being a regular.',
    body: 'Hi {{first_name}},\n\nEnjoy 20% off every order from Monday to Saturday this week at {{business_name}}.\n\nNo code needed — just mention this email when you order.\n\nSee you soon,\nThe {{business_name}} team',
  },
  {
    key: 'new-products',
    channel: 'email',
    title: 'New Products or Services',
    desc: 'Introduce something new.',
    subject: 'Just in: something new at {{business_name}}',
    preheader: 'Fresh additions to the menu.',
    body: 'Hi {{first_name}},\n\nWe have added something new to the menu at {{business_name}} — and we would love for you to be among the first to try it.\n\nDrop by this week and tell us what you think.\n\nWarm regards,\nThe {{business_name}} team',
  },
  {
    key: 'appreciation',
    channel: 'email',
    title: 'Customer Appreciation',
    desc: 'Thank your best customers.',
    subject: 'Thank you, {{first_name}}!',
    preheader: 'A short note from the whole team.',
    body: 'Hi {{first_name}},\n\nThank you for choosing {{business_name}} again and again. Customers like you make our work worthwhile.\n\nAs a token of appreciation, enjoy a complimentary dessert on your next visit.\n\nWith gratitude,\nThe {{business_name}} team',
  },
  {
    key: 'loyalty-rewards',
    channel: 'email',
    title: 'Loyalty Rewards',
    desc: 'Points and tier reminders.',
    subject: 'Your loyalty rewards are ready, {{first_name}}',
    preheader: 'Redeem before your points expire.',
    body: 'Hi {{first_name}},\n\nYour loyalty points at {{business_name}} are ready to spend. Redeem them on your next order before they expire.\n\nThank you for being a loyal customer.\n\nThe {{business_name}} team',
  },
  {
    key: 'announcement',
    channel: 'email',
    title: 'Business Announcement',
    desc: 'Hours, moves and policy updates.',
    subject: 'An update from {{business_name}}',
    preheader: 'Everything you need to know in one place.',
    body: 'Hi {{first_name}},\n\nWe have a quick update from {{business_name}}: our opening hours have changed for this month.\n\nWe are now open Monday to Saturday, 10:00 AM – 10:00 PM.\n\nThank you for your understanding.\nThe {{business_name}} team',
  },
  {
    key: 'follow-up',
    channel: 'email',
    title: 'Follow-up Email',
    desc: 'Re-engage after a visit.',
    subject: 'We hope to see you again soon, {{first_name}}',
    preheader: 'How was your last visit?',
    body: 'Hi {{first_name}},\n\nIt has been a while since your last visit to {{business_name}}. We would love to hear how we did and welcome you back.\n\nReply to this email — a real person reads every message.\n\nWarm regards,\nThe {{business_name}} team',
  },
];

export function templatesFor(channel: CampaignChannel): MessageTemplate[] {
  return channel === 'sms' ? SMS_TEMPLATES : EMAIL_TEMPLATES;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export const SMS_MAX_RECIPIENT_HINT = 'Carriers may split messages longer than 10 segments.';

export function validateSms(body: string, recipientCount: number): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!body.trim()) errors.body = 'Write your message before continuing.';
  const unknown = findUnknownTokens(body);
  if (unknown.length) errors.body = `Unsupported personalisation tag: ${unknown.join(', ')}. Use the token picker.`;
  if (body.trim() && recipientCount === 0)
    errors.recipients = 'This campaign has no eligible recipients — update the audience.';
  if (analyseSms(body).overLimit) errors.body = SMS_MAX_RECIPIENT_HINT;
  return errors;
}

export function validateEmail(
  subject: string,
  body: string,
  senderName: string,
  senderEmail: string,
  recipientCount: number,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!subject.trim()) errors.subject = 'Add a subject line so recipients know what this is about.';
  if (!body.trim()) errors.body = 'Write the email content before continuing.';
  if (!senderName.trim()) errors.senderName = 'Sender name is required.';
  if (!isValidEmail(senderEmail)) errors.senderEmail = 'Enter a valid sender email address.';
  const unknown = [...findUnknownTokens(subject), ...findUnknownTokens(body)];
  if (unknown.length) errors.body = `Unsupported personalisation tag: ${[...new Set(unknown)].join(', ')}.`;
  if ((subject.trim() || body.trim()) && recipientCount === 0)
    errors.recipients = 'This campaign has no eligible recipients — update the audience.';
  return errors;
}

/** Campaign name is validated once for both channels. */
export function validateCampaignName(name: string): string | undefined {
  if (!name.trim()) return 'Give the campaign an internal name so you can find it later.';
  if (name.trim().length > 80) return 'Keep the campaign name under 80 characters.';
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Scheduling                                                          */
/* ------------------------------------------------------------------ */

export const MIN_SCHEDULE_MINUTES = 5;

/** Returns an error message when the picked time is unusable, otherwise null. */
export function validateSchedule(localValue: string): string | null {
  if (!localValue) return 'Choose a date and time for this campaign.';
  const when = new Date(localValue).getTime();
  if (Number.isNaN(when)) return 'That date and time could not be read.';
  if (when < Date.now() + MIN_SCHEDULE_MINUTES * 60000)
    return `Schedule at least ${MIN_SCHEDULE_MINUTES} minutes from now.`;
  return null;
}

/** Converts a datetime-local value into a timestamp using the browser clock. */
export function scheduleToTimestamp(localValue: string): number | undefined {
  const when = new Date(localValue).getTime();
  return Number.isNaN(when) ? undefined : when;
}

/** Formats a timestamp for a datetime-local input. */
export function timestampToLocalInput(ts: number): string {
  const date = new Date(ts);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

/** Default suggestion: next whole hour, at least one hour out. */
export function defaultScheduleValue(): string {
  const next = new Date(Date.now() + 3600000);
  next.setMinutes(0, 0, 0);
  if (next.getTime() < Date.now() + MIN_SCHEDULE_MINUTES * 60000) next.setHours(next.getHours() + 1);
  return timestampToLocalInput(next.getTime());
}

/* ------------------------------------------------------------------ */
/* Pricing estimate                                                    */
/* ------------------------------------------------------------------ */

export interface SmsCostEstimate {
  credits: number;
  naira: number;
  segments: number;
  recipients: number;
}

/**
 * Demonstration estimate only: segments × recipients credits at the bundle rate
 * advertised on the Add-ons screen. Confirm real pricing with your provider.
 */
export function estimateSmsCost(segments: number, recipients: number): SmsCostEstimate | null {
  if (segments <= 0 || recipients <= 0) return null;
  const credits = segments * SMS_CREDITS_PER_SEGMENT * recipients;
  const bundles = Math.ceil(credits / SMS_CREDIT_BUNDLE.credits);
  return { credits, naira: bundles * SMS_CREDIT_BUNDLE.naira, segments, recipients };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatClock(ts: number): string {
  const date = new Date(ts);
  const hour24 = date.getHours();
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour = hour24 % 12 || 12;
  return `${hour}:${pad(date.getMinutes())} ${suffix}`;
}

export function formatDate(ts: number): string {
  const date = new Date(ts);
  return `${DAYS[date.getDay()]}, ${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateTime(ts: number): string {
  return `${formatDate(ts)} · ${formatClock(ts)} ${CAMPAIGN_TIMEZONE.short}`;
}

export function formatShortDate(ts: number): string {
  const date = new Date(ts);
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]}, ${formatClock(ts)}`;
}

/** "just now", "3h ago", "in 2 days" — used for created/scheduled/sent dates. */
export function relativeWhen(ts: number): string {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const minute = 60000;
  const hour = 3600000;
  const day = 86400000;
  const suffix = diff >= 0 ? '' : ' ago';
  const prefix = diff >= 0 ? 'in ' : '';
  if (abs < minute) return diff >= 0 ? 'soon' : 'just now';
  if (abs < hour) return `${prefix}${Math.round(abs / minute)}m${suffix}`;
  if (abs < day) return `${prefix}${Math.round(abs / hour)}h${suffix}`;
  if (abs < day * 30) return `${prefix}${Math.round(abs / day)}d${suffix}`;
  return formatShortDate(ts);
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-NG');
}

export function formatNaira(value: number): string {
  return `₦${value.toLocaleString('en-NG')}`;
}

/* ------------------------------------------------------------------ */
/* Status presentation                                                 */
/* ------------------------------------------------------------------ */

export interface StatusMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
  icon: string;
}

export const STATUS_META: Record<CampaignStatus, StatusMeta> = {
  draft: {
    label: 'Draft',
    badgeClass: 'bg-surface-container text-text-secondary',
    dotClass: 'bg-text-tertiary',
    icon: 'edit_note',
  },
  scheduled: {
    label: 'Scheduled',
    badgeClass: 'bg-surface-tint-blue text-primary',
    dotClass: 'bg-primary',
    icon: 'schedule',
  },
  sending: {
    label: 'Queued',
    badgeClass: 'bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-500',
    icon: 'cell_tower',
  },
  sent: {
    label: 'Sent',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    dotClass: 'bg-badge-discount-text',
    icon: 'check_circle',
  },
  failed: {
    label: 'Failed',
    badgeClass: 'bg-error-container text-on-error',
    dotClass: 'bg-error',
    icon: 'error',
  },
  paused: {
    label: 'Paused',
    badgeClass: 'bg-surface-container-high text-on-surface-variant',
    dotClass: 'bg-text-secondary',
    icon: 'pause_circle',
  },
};

export type StatusFilterKey = 'all' | 'draft' | 'scheduled' | 'sending' | 'sent' | 'attention';

export const STATUS_FILTERS: Array<{ key: StatusFilterKey; label: string }> = [
  { key: 'all', label: 'All Campaigns' },
  { key: 'draft', label: 'Drafts' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'sending', label: 'Sending' },
  { key: 'sent', label: 'Sent' },
  { key: 'attention', label: 'Failed / Paused' },
];

export function matchesStatusFilter(status: CampaignStatus, filter: StatusFilterKey): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'attention':
      return status === 'failed' || status === 'paused';
    default:
      return status === filter;
  }
}

export const CHANNEL_META: Record<CampaignChannel, { label: string; icon: string; description: string }> = {
  sms: {
    label: 'SMS',
    icon: 'sms',
    description:
      'Send text messages to customers who opted in. Character and segment counts update as you type, and only valid, consenting numbers are included.',
  },
  email: {
    label: 'Email',
    icon: 'mail',
    description:
      'Send branded emails with a subject line, preview text and desktop or mobile preview. Only contacts with a valid, opted-in email address are included.',
  },
};

/* ------------------------------------------------------------------ */
/* Sample campaigns                                                    */
/* ------------------------------------------------------------------ */

const HISTORY_SPAN = (entries: CampaignHistoryEntry[]): number => entries[0]?.at ?? Date.now();

function entry(at: number, kind: CampaignHistoryEntry['kind'], label: string): CampaignHistoryEntry {
  return { at, kind, label };
}

const HOUR = 3600000;

export function buildSeedCampaigns(): CampaignRecord[] {
  const now = Date.now();

  const smsSent = now - 3 * DAY;
  const smsDraft = now - 26 * HOUR;
  const smsScheduled = now + 2 * DAY;
  const smsSentOld = now - 11 * DAY;
  const smsFailed = now - 6 * DAY;

  const emailSent = now - 5 * DAY;
  const emailDraft = now - 20 * HOUR;
  const emailScheduled = now + 4 * DAY;
  const emailPaused = now - 9 * DAY;

  const seeds: CampaignRecord[] = [
    {
      id: 'seed-sms-jollof-friday',
      channel: 'sms',
      name: 'Jollof Friday Promo',
      status: 'sent',
      audience: { ...DEFAULT_AUDIENCE, mode: 'segment', segmentKey: 'returning' },
      audienceLabel: 'Segment · Returning Customers',
      recipientCount: 812,
      excludedCount: 48,
      exclusionBreakdown: [
        { reason: 'no-consent', label: EXCLUSION_LABELS['no-consent'], count: 31 },
        { reason: 'unsubscribed', label: EXCLUSION_LABELS.unsubscribed, count: 12 },
        { reason: 'missing-phone', label: EXCLUSION_LABELS['missing-phone'], count: 5 },
      ],
      smsBody:
        'Hi {{first_name}}, Jollof Friday is on at {{business_name}} — order any jollof plate today and get a free drink. Reply STOP to opt out.',
      createdAt: smsSent - 5 * HOUR,
      updatedAt: smsSent,
      sentAt: smsSent,
      stats: { queued: 860, sent: 842, delivered: 806, failed: 36 },
      history: [
        entry(smsSent - 5 * HOUR, 'created', 'Campaign created'),
        entry(smsSent - 2 * HOUR, 'saved', 'Audience and message saved'),
        entry(smsSent, 'queued', 'Queued for delivery to 812 recipients'),
        entry(smsSent + 6 * HOUR, 'sent', 'Provider reported 842 sent · 806 delivered'),
      ],
    },
    {
      id: 'seed-sms-weekend-discount',
      channel: 'sms',
      name: 'Weekend Rice Discount',
      status: 'draft',
      audience: { ...DEFAULT_AUDIENCE, mode: 'filtered', filters: { activity: 'any', spend: 'any', consent: 'opted-in' } },
      audienceLabel: 'Filtered · Marketing opt-in',
      recipientCount: 0,
      excludedCount: 0,
      exclusionBreakdown: [],
      smsBody:
        '{{first_name}}, enjoy ₦1,000 off every fried rice plate this Saturday and Sunday at {{business_name}}. Reply STOP to opt out.',
      createdAt: smsDraft,
      updatedAt: smsDraft,
      history: [entry(smsDraft, 'created', 'Draft created')],
    },
    {
      id: 'seed-sms-loyalty-expiry',
      channel: 'sms',
      name: 'Loyalty Points Expiry Reminder',
      status: 'scheduled',
      audience: { ...DEFAULT_AUDIENCE, mode: 'segment', segmentKey: 'frequent' },
      audienceLabel: 'Segment · Frequent Customers (VIP)',
      recipientCount: 164,
      excludedCount: 11,
      exclusionBreakdown: [
        { reason: 'no-consent', label: EXCLUSION_LABELS['no-consent'], count: 8 },
        { reason: 'missing-phone', label: EXCLUSION_LABELS['missing-phone'], count: 3 },
      ],
      smsBody:
        'Hi {{first_name}}, your loyalty points at {{business_name}} expire on the 30th. Redeem them on your next visit. Reply STOP to opt out.',
      createdAt: now - 2 * DAY,
      updatedAt: now - DAY,
      scheduledAt: smsScheduled,
      history: [
        entry(now - 2 * DAY, 'created', 'Campaign created'),
        entry(now - DAY, 'scheduled', 'Scheduled to send in 2 days'),
      ],
    },
    {
      id: 'seed-sms-anniversary',
      channel: 'sms',
      name: 'Anniversary Thank You',
      status: 'sent',
      audience: { ...DEFAULT_AUDIENCE, mode: 'segment', segmentKey: 'all-customers' },
      audienceLabel: 'Segment · All Customers',
      recipientCount: 1204,
      excludedCount: 96,
      exclusionBreakdown: [
        { reason: 'no-consent', label: EXCLUSION_LABELS['no-consent'], count: 62 },
        { reason: 'unsubscribed', label: EXCLUSION_LABELS.unsubscribed, count: 21 },
        { reason: 'missing-phone', label: EXCLUSION_LABELS['missing-phone'], count: 13 },
      ],
      smsBody:
        '{{business_name}} turns 4 today — thank you for every visit, {{first_name}}. Show this message for a free dessert this week.',
      createdAt: smsSentOld - 4 * HOUR,
      updatedAt: smsSentOld,
      sentAt: smsSentOld,
      stats: { queued: 1300, sent: 1281, delivered: 1238, failed: 43 },
      history: [
        entry(smsSentOld - 4 * HOUR, 'created', 'Campaign created'),
        entry(smsSentOld, 'queued', 'Queued for delivery to 1,204 recipients'),
        entry(smsSentOld + 9 * HOUR, 'sent', 'Provider reported 1,281 sent · 1,238 delivered'),
      ],
    },
    {
      id: 'seed-sms-hours-change',
      channel: 'sms',
      name: 'Sunday Hours Change',
      status: 'failed',
      audience: { ...DEFAULT_AUDIENCE, mode: 'segment', segmentKey: 'all-customers' },
      audienceLabel: 'Segment · All Customers',
      recipientCount: 402,
      excludedCount: 24,
      exclusionBreakdown: [
        { reason: 'no-consent', label: EXCLUSION_LABELS['no-consent'], count: 17 },
        { reason: 'missing-phone', label: EXCLUSION_LABELS['missing-phone'], count: 7 },
      ],
      smsBody:
        '{{business_name}} update: we now close at 6:00 PM on Sundays. {{first_name}}, plan your visit accordingly.',
      createdAt: smsFailed - 3 * HOUR,
      updatedAt: smsFailed,
      sentAt: smsFailed,
      stats: { queued: 426, sent: 0, failed: 426 },
      history: [
        entry(smsFailed - 3 * HOUR, 'created', 'Campaign created'),
        entry(smsFailed, 'failed', 'Send failed — the provider rejected the sender ID'),
      ],
    },
    {
      id: 'seed-email-october-lunch',
      channel: 'email',
      name: 'October Lunch Deal',
      status: 'sent',
      audience: { ...DEFAULT_AUDIENCE, mode: 'segment', segmentKey: 'returning' },
      audienceLabel: 'Segment · Returning Customers',
      recipientCount: 596,
      excludedCount: 44,
      exclusionBreakdown: [
        { reason: 'no-consent', label: EXCLUSION_LABELS['no-consent'], count: 28 },
        { reason: 'unsubscribed', label: EXCLUSION_LABELS.unsubscribed, count: 11 },
        { reason: 'missing-email', label: EXCLUSION_LABELS['missing-email'], count: 5 },
      ],
      emailSubject: 'Your 20% lunch deal is back, {{first_name}}',
      emailPreheader: 'Monday to Saturday, 12:00 – 3:00 PM.',
      senderName: BUSINESS_NAME,
      senderEmail: 'hello@urbangrillbistro.ng',
      emailBody:
        'Hi {{first_name}},\n\nOur 20% lunch deal is back at {{business_name}} every Monday to Saturday from 12:00 PM to 3:00 PM.\n\nBring a friend — the offer applies to the whole table.\n\nWarm regards,\nThe {{business_name}} team',
      createdAt: emailSent - 6 * HOUR,
      updatedAt: emailSent,
      sentAt: emailSent,
      stats: { queued: 640, sent: 632, delivered: 618, bounced: 14, opened: 296, clicked: 84 },
      history: [
        entry(emailSent - 6 * HOUR, 'created', 'Campaign created'),
        entry(emailSent, 'queued', 'Queued for delivery to 596 recipients'),
        entry(emailSent + 4 * HOUR, 'sent', 'Provider reported 632 sent · 618 delivered'),
      ],
    },
    {
      id: 'seed-email-dessert-menu',
      channel: 'email',
      name: 'New Dessert Menu Launch',
      status: 'draft',
      audience: { ...DEFAULT_AUDIENCE, mode: 'all' },
      audienceLabel: 'All customers',
      recipientCount: 0,
      excludedCount: 0,
      exclusionBreakdown: [],
      emailSubject: 'Something sweet just landed at {{business_name}}',
      emailPreheader: 'Six new desserts, made fresh daily.',
      senderName: BUSINESS_NAME,
      senderEmail: '',
      emailBody: 'Hi {{first_name}},\n\nSix new desserts just joined the menu at {{business_name}}.\n\nCome taste them this weekend.',
      createdAt: emailDraft,
      updatedAt: emailDraft,
      history: [entry(emailDraft, 'created', 'Draft created — sender email still needed')],
    },
    {
      id: 'seed-email-appreciation-week',
      channel: 'email',
      name: 'Customer Appreciation Week',
      status: 'scheduled',
      audience: { ...DEFAULT_AUDIENCE, mode: 'segment', segmentKey: 'frequent' },
      audienceLabel: 'Segment · Frequent Customers (VIP)',
      recipientCount: 148,
      excludedCount: 9,
      exclusionBreakdown: [
        { reason: 'no-consent', label: EXCLUSION_LABELS['no-consent'], count: 6 },
        { reason: 'missing-email', label: EXCLUSION_LABELS['missing-email'], count: 3 },
      ],
      emailSubject: 'Thank you, {{first_name}} — a gift from {{business_name}}',
      emailPreheader: 'Appreciation week, just for our regulars.',
      senderName: BUSINESS_NAME,
      senderEmail: 'hello@urbangrillbistro.ng',
      emailBody:
        'Hi {{first_name}},\n\nCustomer appreciation week starts Monday, and our regulars get a complimentary dessert on us.\n\nSimply show this email at the counter.\n\nWith gratitude,\nThe {{business_name}} team',
      createdAt: now - 3 * DAY,
      updatedAt: now - DAY,
      scheduledAt: emailScheduled,
      history: [
        entry(now - 3 * DAY, 'created', 'Campaign created'),
        entry(now - DAY, 'scheduled', 'Scheduled to send in 4 days'),
      ],
    },
    {
      id: 'seed-email-kitchen-maintenance',
      channel: 'email',
      name: 'Kitchen Maintenance Notice',
      status: 'paused',
      audience: { ...DEFAULT_AUDIENCE, mode: 'segment', segmentKey: 'all-customers' },
      audienceLabel: 'Segment · All Customers',
      recipientCount: 612,
      excludedCount: 51,
      exclusionBreakdown: [
        { reason: 'no-consent', label: EXCLUSION_LABELS['no-consent'], count: 34 },
        { reason: 'unsubscribed', label: EXCLUSION_LABELS.unsubscribed, count: 12 },
        { reason: 'missing-email', label: EXCLUSION_LABELS['missing-email'], count: 5 },
      ],
      emailSubject: '{{business_name}} will close early on Thursday',
      emailPreheader: 'Kitchen maintenance from 4:00 PM.',
      senderName: BUSINESS_NAME,
      senderEmail: 'hello@urbangrillbistro.ng',
      emailBody:
        'Hi {{first_name}},\n\n{{business_name}} will close at 4:00 PM this Thursday for kitchen maintenance. We open again at 10:00 AM on Friday.\n\nWe are sorry for the inconvenience.\nThe {{business_name}} team',
      createdAt: emailPaused - 2 * DAY,
      updatedAt: emailPaused,
      history: [
        entry(emailPaused - 2 * DAY, 'created', 'Campaign created'),
        entry(emailPaused, 'saved', 'Paused while the closure date is confirmed'),
      ],
    },
  ];

  // Defensive: keep history ordered oldest-first for the detail timeline.
  return seeds.map((seed) => ({
    ...seed,
    history: [...seed.history].sort((a, b) => a.at - b.at),
    createdAt: Math.min(seed.createdAt, HISTORY_SPAN(seed.history)),
  }));
}

/* ------------------------------------------------------------------ */
/* Record helpers                                                      */
/* ------------------------------------------------------------------ */

export function newCampaignId(): string {
  return `cmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyDraft(channel: CampaignChannel): CampaignRecord {
  const now = Date.now();
  return {
    id: newCampaignId(),
    channel,
    name: '',
    status: 'draft',
    audience: { ...DEFAULT_AUDIENCE, filters: { ...DEFAULT_FILTERS }, selectedKeys: [] },
    audienceLabel: 'All customers',
    recipientCount: 0,
    excludedCount: 0,
    exclusionBreakdown: [],
    smsBody: channel === 'sms' ? '' : undefined,
    smsLink: '',
    emailSubject: '',
    emailPreheader: '',
    emailBody: channel === 'email' ? '' : undefined,
    senderName: BUSINESS_NAME,
    senderEmail: '',
    createdAt: now,
    updatedAt: now,
    history: [entry(now, 'created', 'Draft started')],
  };
}

/** Completed campaigns are immutable — editing one produces a fresh copy. */
export function duplicateCampaign(source: CampaignRecord): CampaignRecord {
  const now = Date.now();
  return {
    ...source,
    id: newCampaignId(),
    name: `${source.name || 'Untitled campaign'} (copy)`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    scheduledAt: undefined,
    sentAt: undefined,
    stats: undefined,
    simulatedSend: false,
    history: [entry(now, 'duplicated', `Duplicated from "${source.name || 'Untitled campaign'}"`)],
  };
}
