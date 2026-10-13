import { MERCHANT_IMAGE } from './orderData';

/**
 * Admin-controlled announcement / promotional banner content.
 *
 * The customer dashboard rotates these below the greeting. Content is modelled
 * the way an admin console would configure it (audience, window, publication
 * status, CTA + destination) rather than being hardcoded inside a screen.
 *
 * BACKEND GAP: this is a local module standing in for what would be
 * `GET /announcements?audience=customer&now=ISO`, including the admin CRUD
 * surface that writes it. `activeAnnouncements()` applies the same windowing
 * rules the server would.
 */

export type AnnouncementAudience = 'all' | 'new-customers' | 'returning' | 'businesses';
export type AnnouncementTone = 'promo' | 'info' | 'upgrade' | 'alert';
export type AnnouncementDestination =
  | 'deals'
  | 'featured'
  | 'my-deals'
  | 'orders'
  | 'dashboard'
  | 'notifications'
  | 'saved'
  | 'subscription';

export interface Announcement {
  id: string;
  audience: AnnouncementAudience;
  title: string;
  message: string;
  image?: string;
  icon: string;
  tone: AnnouncementTone;
  cta: string;
  destination: AnnouncementDestination;
  /** ISO date, inclusive. */
  start: string;
  /** ISO date, exclusive. */
  end: string;
  published: boolean;
}

const MONTHS = 1000 * 60 * 60 * 24 * 30;

export const ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: 'ann-weekend-offers',
    audience: 'all',
    title: 'Fresh weekend offers just dropped',
    message: 'New deals from Urban Grill, Glow & Serenity and 40+ Apo businesses.',
    image: MERCHANT_IMAGE,
    icon: 'local_offer',
    tone: 'promo',
    cta: 'Explore Deals',
    destination: 'deals',
    start: new Date(Date.now() - 2 * MONTHS).toISOString(),
    end: new Date(Date.now() + 3 * MONTHS).toISOString(),
    published: true,
  },
  {
    id: 'ann-platform-update',
    audience: 'all',
    title: 'Faster pickup tracking is live',
    message: 'Orders now show a live status from Submitted through to Ready for Collection.',
    icon: 'bolt',
    tone: 'info',
    cta: 'View My Orders',
    destination: 'orders',
    start: new Date(Date.now() - MONTHS).toISOString(),
    end: new Date(Date.now() + 4 * MONTHS).toISOString(),
    published: true,
  },
  {
    id: 'ann-upgrade-growth',
    audience: 'returning',
    title: 'Unlock Growth for 3.4x more reach',
    message: 'Priority pins, verified badge and hyperlocal broadcasts from ₦4,500/mo.',
    icon: 'trending_up',
    tone: 'upgrade',
    cta: 'See Growth Plans',
    destination: 'subscription',
    start: new Date(Date.now() - MONTHS).toISOString(),
    end: new Date(Date.now() + 5 * MONTHS).toISOString(),
    published: true,
  },
  // --- filtered out by activeAnnouncements(), kept to prove the rules work ---
  {
    id: 'ann-draft-riverside',
    audience: 'new-customers',
    title: 'Riverside Night Market opens Friday',
    message: 'Thirty new vendors, live music and a welcome voucher on your first order.',
    icon: 'celebration',
    tone: 'alert',
    cta: 'Get Notified',
    destination: 'notifications',
    start: new Date(Date.now() - MONTHS).toISOString(),
    end: new Date(Date.now() + 2 * MONTHS).toISOString(),
    // Never published: the admin has not approved this one yet.
    published: false,
  },
  {
    id: 'ann-ramadan-specials',
    audience: 'all',
    title: 'Ramadan Iftar specials',
    message: 'Extended evening hours and iftar bundles across participating kitchens.',
    icon: 'ramadan',
    tone: 'promo',
    cta: 'Browse Bundles',
    destination: 'deals',
    start: new Date(Date.now() + 2 * MONTHS).toISOString(),
    end: new Date(Date.now() + 4 * MONTHS).toISOString(),
    published: true,
  },
  {
    id: 'ann-black-friday-2024',
    audience: 'all',
    title: 'Black Friday 2024 wrap-up',
    message: 'Thanks for an incredible weekend — 12,400 vouchers redeemed citywide.',
    icon: 'history',
    tone: 'info',
    cta: 'View My Deals',
    destination: 'my-deals',
    start: new Date(Date.now() - 12 * MONTHS).toISOString(),
    end: new Date(Date.now() - 9 * MONTHS).toISOString(),
    published: true,
  },
];

/** Published announcements whose `[start, end)` window contains `now`. */
export function activeAnnouncements(now: Date = new Date()): Announcement[] {
  const stamp = now.getTime();
  return ANNOUNCEMENTS.filter((item) => {
    if (!item.published) return false;
    const start = Date.parse(item.start);
    const end = Date.parse(item.end);
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    return start <= stamp && stamp < end;
  }).slice();
}
