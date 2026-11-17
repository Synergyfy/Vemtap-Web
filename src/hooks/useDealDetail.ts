import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, getAccessToken, hasApiConfig } from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';
import { catalogueService } from '../services/catalogueService';
import { dealEngagementService } from '../services/dealEngagementService';
import { INITIAL_DEAL_STUDIO_DRAFT, LIVE_DEAL_STUDIO_DRAFT } from '../scripts/deals/dealStudioShared';
import { dealImageList, dealPrimaryImage } from '../utils/dealImages';
import { realOfferId } from '../utils/homeOffer';
import { toBusiness, type PublicBusiness } from './usePublicBusiness';

/**
 * One deal's live data, shared by the desktop and mobile deal pages:
 * `GET /catalogue/offers/public/details/:id` for the deal, `GET /deals/:id/engagement`
 * for its counts (the details response is cached) and
 * `GET /public/businesses/code/:code` for the merchant's profile.
 * A field the API did not send stays empty, so the page hides it instead of guessing.
 */

export interface DealDetail {
  id: string;
  title: string;
  description: string | null;
  image: string | undefined;
  images: string[];
  price: number;
  oldPrice: number;
  /** 0 when the deal has no saving. */
  discountPercent: number;
  endDate: Date | null;
  isExpired: boolean;
  isTrending: boolean;
  /** Vouchers on offer; null when the deal has no limit. */
  quantity: number | null;
  claimedCount: number;
  terms: string[];
  claimSteps: string[];
  /** The steps the business wrote itself; empty when it kept Deal Studio's pre-filled ones. */
  ownClaimSteps: string[];
  /** "Dine-in & Takeout". */
  channelsLabel: string | null;
  /** "1 Claim / Person". */
  claimLimitLabel: string | null;
  /** "Mon – Fri • 12:00 PM – 5:00 PM". */
  windowLabel: string | null;
  items: { id: string; name: string; price: number }[];
  branchId: string | null;
  branchName: string | null;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  businessId: string | null;
  businessCode: string | null;
  businessName: string;
  businessLogo: string | null;
  category: string | null;
  verified: boolean;
  /** The merchant's public profile; null when it could not be loaded. */
  profile: PublicBusiness | null;
  likesCount: number;
  reviewsCount: number;
  averageRating: number | null;
}

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const str = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value.trim() : null);
const num = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
};
const strings = (value: unknown): string[] => (Array.isArray(value) ? value.map(str).filter((entry): entry is string => Boolean(entry)) : []);
const unwrap = (payload: unknown): Record<string, unknown> => {
  const record = rec(payload);
  return 'id' in record ? record : rec(record.data);
};

const CHANNEL_LABELS: Record<string, string> = { dine_in: 'Dine-in', takeout: 'Takeout', reservation: 'Reservation' };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIOD_LABELS: Record<string, string> = { day: ' / Day', week: ' / Week', month: ' / Month' };

const channelsLabel = (value: unknown): string | null => {
  const labels = strings(value).map((channel) => CHANNEL_LABELS[channel] ?? channel);
  if (labels.length < 2) return labels[0] ?? null;
  return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
};

const clock = (time: string): string => {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return time;
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour < 12 ? 'AM' : 'PM'}`;
};

/** [1,2,3,4,5] → "Mon – Fri"; an empty list means every day. */
const daysLabel = (weekdays: number[]): string => {
  const days = [...new Set(weekdays)].filter((day) => day >= 0 && day <= 6).sort((a, b) => a - b);
  if (days.length === 0 || days.length === 7) return 'Every day';
  const consecutive = days.every((day, index) => index === 0 || day === days[index - 1] + 1);
  if (consecutive && days.length > 2) return `${DAY_NAMES[days[0]]} – ${DAY_NAMES[days[days.length - 1]]}`;
  return days.map((day) => DAY_NAMES[day]).join(', ');
};

const windowLabel = (value: unknown): string | null => {
  const windows = (Array.isArray(value) ? value : []).map(rec);
  const parts = windows.flatMap((entry) => {
    const start = str(entry.start);
    const end = str(entry.end);
    if (!start || !end) return [];
    const weekdays = (Array.isArray(entry.weekdays) ? entry.weekdays : []).map(Number);
    return [`${daysLabel(weekdays)} • ${clock(start)} – ${clock(end)}`];
  });
  return parts.length ? parts.join(', ') : null;
};

const claimLimitLabel = (limit: number | null, period: unknown): string | null =>
  limit && limit > 0 ? `${limit} Claim${limit === 1 ? '' : 's'} / Person${PERIOD_LABELS[String(period)] ?? ''}` : null;

const PREFILLED_CLAIM_STEPS = [LIVE_DEAL_STUDIO_DRAFT.claimSteps, INITIAL_DEAL_STUDIO_DRAFT.claimSteps];
const isPrefilledClaimSteps = (steps: string[]) =>
  PREFILLED_CLAIM_STEPS.some((prefilled) => prefilled.length === steps.length && prefilled.every((step, index) => step === steps[index]));

const toDetail = (offer: Record<string, unknown>, profile: PublicBusiness | null, engagement: Record<string, unknown>): DealDetail => {
  const business = rec(offer.business);
  const branch = rec(offer.branch);
  const price = num(offer.dealPrice) ?? num(offer.calculatedPrice) ?? 0;
  const original = num(offer.originalPrice) ?? 0;
  const oldPrice = original > price ? original : price;
  const end = str(offer.endDate);
  const endDate = end && !Number.isNaN(new Date(end).getTime()) ? new Date(end) : null;
  const liveBranch = profile?.branches.find((entry) => entry.id === str(offer.branchId));
  const claimSteps = strings(offer.claimSteps);
  return {
    id: String(offer.id),
    title: str(offer.name) ?? str(offer.title) ?? 'Deal',
    description: str(offer.longDescription) ?? str(offer.description),
    image: dealPrimaryImage(offer),
    images: dealImageList(offer),
    price,
    oldPrice,
    discountPercent: oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0,
    endDate,
    isExpired: offer.isExpired === true,
    isTrending: offer.isTrending === true,
    quantity: num(offer.quantity),
    claimedCount: Math.max(0, num(offer.claimedCount) ?? 0),
    terms: strings(offer.terms),
    claimSteps,
    ownClaimSteps: isPrefilledClaimSteps(claimSteps) ? [] : claimSteps,
    channelsLabel: channelsLabel(offer.redemptionChannels),
    claimLimitLabel: claimLimitLabel(num(offer.maxClaimsPerCustomer), offer.claimLimitPeriod),
    windowLabel: windowLabel(offer.redemptionWindows),
    items: (Array.isArray(offer.items) ? offer.items : []).map(rec).flatMap((item) => {
      const id = str(item.id);
      const name = str(item.name);
      return id && name ? [{ id, name, price: num(item.price) ?? 0 }] : [];
    }),
    branchId: str(offer.branchId),
    branchName: str(offer.branchName) ?? str(branch.name) ?? liveBranch?.name ?? null,
    address: [str(business.address) ?? str(branch.address), str(business.city) ?? str(branch.city)].filter(Boolean).join(', ') || null,
    phone: liveBranch?.phone ?? str(business.phone) ?? profile?.phone ?? null,
    latitude: num(business.latitude),
    longitude: num(business.longitude),
    businessId: str(business.id) ?? str(offer.businessId),
    businessCode: str(business.uniqueCode) ?? str(business.slug),
    businessName: str(business.name) ?? profile?.name ?? 'Business',
    businessLogo: str(business.logo) ?? profile?.logo ?? null,
    category: str(business.categoryName) ?? profile?.category ?? null,
    verified: business.isVerified === true || profile?.verified === true,
    profile,
    likesCount: Math.max(0, num(engagement.likesCount) ?? num(offer.likesCount) ?? 0),
    reviewsCount: Math.max(0, num(engagement.reviewsCount) ?? num(offer.reviewsCount) ?? 0),
    averageRating: num(engagement.averageRating) ?? num(offer.averageRating),
  };
};

/** "12d 3h" / "4h 12m" until the deal ends; null when it has no end date or already ended. */
export const dealTimeLeft = (endDate: Date | null, now = Date.now()): string | null => {
  if (!endDate) return null;
  const minutes = Math.floor((endDate.getTime() - now) / 60000);
  if (minutes <= 0) return null;
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes % 60}m`;
};

/** "Ends in 3 days" / "Ends in 4h 12m"; null when it has no end date or already ended. */
export const dealEndsLabel = (endDate: Date | null, now = Date.now()): string | null => {
  const left = dealTimeLeft(endDate, now);
  if (!left || !endDate) return null;
  const days = Math.ceil((endDate.getTime() - now) / 86400000);
  return days > 1 ? `Ends in ${days} days` : `Ends in ${left}`;
};

/** Straight-line kilometres from the customer's location to the deal's branch; null when either is unknown. */
export const dealDistanceKm = (deal: Pick<DealDetail, 'latitude' | 'longitude'>, lat?: number, lng?: number): number | null => {
  if (deal.latitude == null || deal.longitude == null || lat == null || lng == null) return null;
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = rad(deal.latitude - lat);
  const dLng = rad(deal.longitude - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(deal.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
};

export const formatNaira = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

export interface DealRule {
  icon: string;
  body: string;
}

/** The deal's real rules, grouped as the Terms pages show them; a group with nothing in it stays empty. */
export const dealTermsSections = (deal: DealDetail): { validity: DealRule[]; redemption: DealRule[]; merchant: DealRule[] } => ({
  validity: [
    { icon: 'event_available', body: deal.endDate ? `Valid until ${deal.endDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}.` : 'This deal has no end date.' },
    ...(deal.windowLabel ? [{ icon: 'schedule', body: `Redeemable ${deal.windowLabel}.` }] : []),
  ],
  redemption: [
    ...(deal.claimLimitLabel ? [{ icon: 'person', body: `Limit: ${deal.claimLimitLabel}.` }] : []),
    ...(deal.address ? [{ icon: 'pin_drop', body: `Valid at ${deal.branchName ? `${deal.branchName}, ` : ''}${deal.address}.` }] : []),
    ...(deal.channelsLabel ? [{ icon: 'room_service', body: `Available for ${deal.channelsLabel}.` }] : []),
    ...deal.claimSteps.map((step) => ({ icon: 'qr_code_scanner', body: step })),
  ],
  merchant: deal.terms.map((term) => ({ icon: 'gavel', body: term })),
});

/** Why the deal can't be claimed any more; null while it still can. */
export const dealUnavailableLabel = (deal: Pick<DealDetail, 'isExpired' | 'quantity' | 'claimedCount'>): string | null => {
  if (deal.isExpired) return 'Deal ended';
  return deal.quantity != null && deal.claimedCount >= deal.quantity ? 'Sold out' : null;
};

/** A wa.me link for the merchant's WhatsApp number, else their phone number; null when they have neither. */
export const dealWhatsappLink = (deal: Pick<DealDetail, 'phone' | 'profile'>): string | null => {
  const digits = (deal.profile?.whatsapp ?? deal.phone ?? '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith('0') ? `234${digits.slice(1)}` : digits}`;
};

/** The offer id at the end of a `/deals/<title>-<id>` link, so a reloaded or shared link opens the deal. */
export const dealIdFromPath = (path: string): string | undefined => {
  const match = /^\/deals\/.*?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i.exec(decodeURIComponent(path));
  return match?.[1];
};

export function useDealDetail(dealId: string | number | null | undefined) {
  const offerId = realOfferId({ id: dealId == null ? undefined : String(dealId) });
  const [detail, setDetail] = useState<DealDetail | null>(null);
  const [errorFor, setErrorFor] = useState<{ id: string; message: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!offerId || !hasApiConfig()) return;
    let ignore = false;
    setErrorFor(null);
    const load = async () => {
      try {
        const [offerResponse, engagement] = await Promise.all([
          catalogueService.getPublicOfferDetails(offerId),
          dealEngagementService.getEngagement(offerId).catch(() => ({})),
        ]);
        const offer = unwrap(offerResponse);
        const code = str(rec(offer.business).uniqueCode);
        const profile = code
          ? await api
              .get<unknown>(API_ENDPOINTS.public.businessByCode(code))
              .then((payload) => toBusiness(payload, code))
              .catch(() => null)
          : null;
        if (!ignore) setDetail(toDetail(offer, profile, rec(engagement)));
      } catch (error) {
        if (ignore) return;
        const missing = error instanceof ApiError && error.status === 404;
        setErrorFor({ id: offerId, message: missing ? 'We couldn’t find this deal.' : 'This deal couldn’t be loaded. Please try again.' });
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, [offerId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const current = detail && detail.id === offerId ? detail : null;
  const error = !hasApiConfig() || !offerId ? 'This deal isn’t available.' : errorFor?.id === offerId ? errorFor.message : null;

  return { detail: current, loading: !current && !error, error, reload };
}

/**
 * Whether the signed-in customer saved this deal, from `GET /deals/:id/save-status`.
 * `toggle` saves through `POST /deals/:id/save` (the backend toggles) and resolves to
 * the saved state; optimistic, rolled back and rethrown when it fails.
 */
export function useDealSaved(dealId: string | undefined) {
  const [saved, setSaved] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    setSaved(false);
    if (!dealId || !hasApiConfig() || !getAccessToken()) return;
    let ignore = false;
    api
      .get<unknown>(`/deals/${encodeURIComponent(dealId)}/save-status`)
      .then((payload) => {
        const record = rec(payload);
        const status = 'isSaved' in record ? record : rec(record.data);
        if (!ignore && !pending.current) setSaved(status.isSaved === true);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [dealId]);

  const toggle = useCallback(async (): Promise<boolean> => {
    if (!dealId || pending.current) return saved;
    pending.current = true;
    setSaved(!saved);
    try {
      const result = rec(await api.post<unknown>(`/deals/${encodeURIComponent(dealId)}/save`));
      const payload = 'saved' in result ? result : rec(result.data);
      const next = payload.saved === true;
      setSaved(next);
      return next;
    } catch (error) {
      setSaved(saved);
      throw error;
    } finally {
      pending.current = false;
    }
  }, [dealId, saved]);

  return { saved, toggle };
}
