import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, hasApiConfig } from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';
import { catalogueService } from '../services/catalogueService';

/**
 * One public business page's live data, shared by the desktop and mobile views:
 * `GET /public/businesses/code/:code` for the profile, then for every active
 * branch `GET /catalogue/offers/public/:branchId` (deals) and
 * `GET /public/catalogue/items/branch/:branchId` (products & services).
 */

export interface PublicBranch {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface OpeningDay {
  day: string;
  label: string;
  open: string | null;
  close: string | null;
  closed: boolean;
}

export interface PublicBusiness {
  id: string;
  code: string;
  name: string;
  description: string | null;
  logo: string | null;
  cover: string | null;
  gallery: string[];
  category: string | null;
  subcategory: string | null;
  verified: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  email: string | null;
  socials: { label: string; url: string }[];
  amenities: string[];
  hours: OpeningDay[];
  latitude: number | null;
  longitude: number | null;
  branches: PublicBranch[];
}

export interface PublicCatalogueItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  kind: 'product' | 'service';
  category: string | null;
  /** Branches that carry the item (an order goes to one branch). */
  branchIds: string[];
}

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const str = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value.trim() : null);
const num = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
};
const unwrap = (payload: unknown): unknown => {
  const r = rec(payload);
  return 'data' in r && r.data !== undefined && !('name' in r) ? r.data : payload;
};
const rows = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  const r = rec(payload);
  for (const key of ['data', 'items', 'offers']) {
    if (Array.isArray(r[key])) return r[key] as unknown[];
    if (r[key] && typeof r[key] === 'object') {
      const inner = rows(r[key]);
      if (inner.length) return inner;
    }
  }
  return [];
};

/** `{ Monday: { open, close, closed } }` → ordered "Mon · 09:00 – 18:00" rows; empty when the business set none. */
const toHours = (value: unknown): OpeningDay[] => {
  const hours = rec(value);
  return WEEK.flatMap((day): OpeningDay[] => {
    const entry = rec(hours[day] ?? hours[day.toLowerCase()]);
    if (!Object.keys(entry).length) return [];
    if (entry.closed === true) return [{ day, label: 'Closed', open: null, close: null, closed: true }];
    const open = str(entry.open);
    const close = str(entry.close);
    return open && close ? [{ day, label: `${open} – ${close}`, open, close, closed: false }] : [];
  });
};

const SOCIAL_LABELS: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', x: 'X', twitter: 'X', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube' };

export const toBusiness = (payload: unknown, code: string): PublicBusiness => {
  const b = rec(unwrap(payload));
  const socials = Object.entries(rec(b.socials))
    .map(([key, url]) => ({ label: SOCIAL_LABELS[key.toLowerCase()] ?? key, url: str(url) }))
    .filter((entry): entry is { label: string; url: string } => Boolean(entry.url));
  const branches = (Array.isArray(b.branches) ? b.branches : [])
    .map(rec)
    .filter((branch) => str(branch.id) && branch.isActive !== false)
    .map((branch) => ({
      id: String(branch.id),
      name: str(branch.name) ?? 'Branch',
      address: str(branch.address),
      city: str(branch.city),
      phone: str(branch.phone),
      latitude: num(branch.latitude),
      longitude: num(branch.longitude),
    }));
  return {
    id: str(b.id) ?? '',
    code: str(b.uniqueCode) ?? code,
    name: str(b.name) ?? 'Business',
    description: str(b.description),
    logo: str(b.logoUrl) ?? str(b.logo),
    cover: str(b.coverImage),
    gallery: (Array.isArray(b.gallery) ? b.gallery : []).map(str).filter((url): url is string => Boolean(url)),
    category: str(rec(b.category).name) ?? str(b.categoryName),
    subcategory: str(rec(b.subcategory).name) ?? str(b.otherSubcategoryName),
    verified: b.isVerified === true || b.verificationStatus === 'verified',
    address: str(b.address),
    city: str(b.city),
    state: str(b.state),
    phone: str(b.phone),
    whatsapp: str(b.whatsappNumber),
    website: str(b.website),
    email: str(b.officialEmail),
    socials,
    amenities: (Array.isArray(b.amenities) ? b.amenities : []).map(str).filter((a): a is string => Boolean(a)),
    hours: toHours(b.openingHours),
    latitude: num(b.latitude),
    longitude: num(b.longitude),
    branches,
  };
};

const toItem = (value: unknown): PublicCatalogueItem | null => {
  const item = rec(value);
  const id = str(item.id);
  const name = str(item.name);
  if (!id || !name) return null;
  const type = String(item.itemType ?? item.type ?? '').toLowerCase();
  return {
    id,
    name,
    description: str(item.shortDescription) ?? str(item.description),
    price: num(item.price) ?? 0,
    image: str(item.mainImage) ?? str(item.image),
    kind: type === 'service' ? 'service' : 'product',
    category: str(rec(item.category).name) ?? str(item.categoryName),
    branchIds: [],
  };
};

const dedupe = <T,>(list: T[], key: (item: T) => string) => {
  const seen = new Set<string>();
  return list.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export function usePublicBusiness(code: string | null | undefined) {
  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [deals, setDeals] = useState<Record<string, unknown>[]>([]);
  const [items, setItems] = useState<PublicCatalogueItem[]>([]);
  const [loading, setLoading] = useState(() => Boolean(code) && hasApiConfig());
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setBusiness(null);
      setDeals([]);
      setItems([]);
      setError(null);
      if (!code || !hasApiConfig()) {
        setLoading(false);
        if (!code) setError('This business link is incomplete.');
        return;
      }
      setLoading(true);
      try {
        const profile = toBusiness(await api.get<unknown>(API_ENDPOINTS.public.businessByCode(code)), code);
        if (ignore) return;
        setBusiness(profile);
        setLoading(false);
        setCatalogueLoading(true);
        const perBranch = await Promise.all(
          profile.branches.map(async (branch) => {
            const [offers, catalogue] = await Promise.all([
              catalogueService.getPublicOffersByBranch(branch.id, { page: 1, limit: 50 }).then(rows).catch(() => []),
              api.get<unknown>(API_ENDPOINTS.catalogue.publicItemsByBranch(branch.id), { params: { page: 1, limit: 100 } }).then(rows).catch(() => []),
            ]);
            return { offers, catalogue, branchId: branch.id };
          }),
        );
        if (ignore) return;
        setDeals(dedupe(perBranch.flatMap((entry) => entry.offers.map(rec)).filter((offer) => str(offer.id)), (offer) => String(offer.id)));
        const merged = new Map<string, PublicCatalogueItem>();
        for (const entry of perBranch) {
          for (const raw of entry.catalogue) {
            const item = toItem(raw);
            if (!item) continue;
            const existing = merged.get(item.id) ?? item;
            existing.branchIds = [...new Set([...existing.branchIds, entry.branchId])];
            merged.set(item.id, existing);
          }
        }
        setItems([...merged.values()]);
      } catch (err) {
        if (ignore) return;
        setError(err instanceof ApiError && err.status === 404 ? 'We couldn’t find this business.' : 'This business couldn’t be loaded. Please try again.');
        setLoading(false);
      } finally {
        if (!ignore) setCatalogueLoading(false);
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, [code, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const products = items.filter((item) => item.kind === 'product');
  const services = items.filter((item) => item.kind === 'service');

  return { business, deals, products, services, loading, catalogueLoading, error, reload };
}

/** A Google Maps link for the business (no map image is shown — only the real address/coordinates). */
export const mapsLink = (business: Pick<PublicBusiness, 'latitude' | 'longitude' | 'name' | 'address' | 'city'>): string | null => {
  if (business.latitude != null && business.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
  }
  const text = [business.name, business.address, business.city].filter(Boolean).join(', ');
  return text ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}` : null;
};

/** A keyless OpenStreetMap embed centred on a real position, with a marker on it; null without coordinates. */
export const mapEmbedUrl = (latitude: number | null, longitude: number | null): string | null => {
  if (latitude == null || longitude == null) return null;
  const span = 0.005;
  const bbox = [longitude - span, latitude - span, longitude + span, latitude + span].map((value) => value.toFixed(6)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
};

const minutes = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(time.trim());
  if (!match) return null;
  let hour = Number(match[1]) % 24;
  const suffix = match[3]?.toLowerCase();
  if (suffix === 'pm' && hour < 12) hour += 12;
  if (suffix === 'am' && hour === 12) hour = 0;
  return hour * 60 + Number(match[2]);
};

/** Today's row and whether the business is open right now, from its own opening hours (null when it set none for today). */
export const todayHours = (hours: OpeningDay[], now = new Date()): { today: OpeningDay; openNow: boolean } | null => {
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const today = hours.find((entry) => entry.day === dayName);
  if (!today) return null;
  if (today.closed || !today.open || !today.close) return { today, openNow: false };
  const open = minutes(today.open);
  const close = minutes(today.close);
  if (open == null || close == null) return { today, openNow: false };
  const current = now.getHours() * 60 + now.getMinutes();
  const openNow = close > open ? current >= open && current < close : current >= open || current < close;
  return { today, openNow };
};
