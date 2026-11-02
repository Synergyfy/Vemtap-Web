import { useCallback, useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import { api, getAccessToken, hasApiConfig } from '../services/api/client';
import { NO_IMAGE } from '../utils/homeOffer';
import { dealEndsLabel } from './useDealDetail';

/**
 * The customer's saved deals, businesses and services, shared by the desktop and
 * mobile Saved pages. Reads `GET /me/saved`; a bookmark saves or unsaves through
 * the toggle endpoint of the item's own type, so the deal page and this list agree.
 */

export type SavedCategory = 'deals' | 'businesses' | 'services';

export interface SavedItem {
  /** The deal, business or service id. */
  id: string;
  category: SavedCategory;
  layout: 'large' | 'compact';
  image: string;
  title: string;
  /** Deal: its business. Business: its category. Service: its business. */
  subtitle: string;
  place: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  /** "Ends in 3 days" / "Deal ended"; empty for anything but deals. */
  endsLabel: string;
  /** Service duration, when set. */
  badge: string | null;
  /** The business's public code, for opening its page. */
  code: string | null;
}

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const amount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toSavedItem = (row: unknown): SavedItem | null => {
  const entry = rec(row);
  const item = rec(entry.item);
  const type = String(entry.type ?? '').toLowerCase();
  if (type === 'deal') {
    const id = text(item.offerId);
    if (!id) return null;
    const price = amount(item.calculatedPrice);
    const original = amount(item.originalPrice);
    const end = text(item.endDate);
    const endDate = end && !Number.isNaN(new Date(end).getTime()) ? new Date(end) : null;
    return {
      id,
      category: 'deals',
      layout: 'large',
      image: text(item.mainImage) || NO_IMAGE,
      title: text(item.name),
      subtitle: text(item.businessName),
      place: text(item.branchAddress) || text(item.branchName),
      price,
      oldPrice: original > price ? original : price,
      discountPercent: amount(item.discountPercent),
      endsLabel: item.isExpired === true ? 'Deal ended' : dealEndsLabel(endDate) ?? 'Ongoing',
      badge: null,
      code: null,
    };
  }
  if (type === 'business') {
    const id = text(item.id);
    if (!id) return null;
    return {
      id,
      category: 'businesses',
      layout: 'large',
      image: text(item.logoUrl) || NO_IMAGE,
      title: text(item.name),
      subtitle: text(item.categoryName),
      place: [text(item.address), text(item.city)].filter(Boolean).join(', '),
      price: 0,
      oldPrice: 0,
      discountPercent: 0,
      endsLabel: '',
      badge: null,
      code: text(item.slug) || null,
    };
  }
  if (type === 'service') {
    const id = text(item.id);
    if (!id) return null;
    const price = amount(item.price);
    return {
      id,
      category: 'services',
      layout: 'compact',
      image: text(item.mainImage) || NO_IMAGE,
      title: text(item.name),
      subtitle: text(item.businessName),
      place: text(item.branchName),
      price,
      oldPrice: price,
      discountPercent: 0,
      endsLabel: '',
      badge: item.duration != null && item.duration !== '' ? String(item.duration) : null,
      code: null,
    };
  }
  return null;
};

export function useSavedItems() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [unsaved, setUnsaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(() => hasApiConfig() && Boolean(getAccessToken()));
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!hasApiConfig() || !getAccessToken()) {
      setLoading(false);
      return;
    }
    let ignore = false;
    setLoading(true);
    setError(null);
    api
      .get<unknown>('/me/saved', { params: { page: 1, limit: 50 } })
      .then((payload) => {
        if (ignore) return;
        const rows = Array.isArray(payload) ? payload : Array.isArray(rec(payload).data) ? (rec(payload).data as unknown[]) : [];
        setItems(rows.map(toSavedItem).filter((item): item is SavedItem => Boolean(item)));
        setUnsaved([]);
      })
      .catch(() => {
        if (!ignore) setError('Your saved items couldn’t be loaded. Please try again.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  /** Saves or unsaves one item; resolves to whether it is saved now, rejects when it failed. */
  const toggleSaved = useCallback(async (item: SavedItem): Promise<boolean> => {
    const result =
      item.category === 'deals'
        ? await api.post<unknown>(`/deals/${encodeURIComponent(item.id)}/save`)
        : item.category === 'businesses'
          ? await accountService.toggleBusinessSave(item.id)
          : await accountService.toggleServiceSave(item.id);
    const record = rec(result);
    const saved = ('saved' in record ? record : rec(record.data)).saved === true;
    setUnsaved((current) => (saved ? current.filter((id) => id !== item.id) : [...current, item.id]));
    return saved;
  }, []);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { items, unsaved, loading, error, reload, toggleSaved };
}

