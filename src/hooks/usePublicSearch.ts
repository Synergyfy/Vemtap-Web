import { useEffect, useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { useLocationQuery } from '../context/LocationContext';
import { offerDiscountLabel, offerImage, offerLocationLabel, realOfferId, type OfferRecord } from '../utils/homeOffer';

export interface SearchDealResult {
  id: string;
  title: string;
  business: string;
  location: string;
  image: string;
  discount: string;
  price: number;
  oldPrice: number;
}

export interface SearchBusinessResult {
  code: string;
  id: string;
  name: string;
  logo: string | null;
  meta: string;
}

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : '');

const toDeal = (value: unknown): SearchDealResult | null => {
  const offer = rec(value) as OfferRecord;
  const id = realOfferId(offer);
  const title = str(offer.name) || str(offer.title);
  if (!id || !title) return null;
  const price = Number(offer.calculatedPrice ?? offer.price ?? 0) || 0;
  const original = Number(offer.originalPrice ?? 0) || 0;
  return {
    id,
    title,
    business: str(rec(offer.business).name) || str(offer.branchName),
    location: offerLocationLabel(offer),
    image: offerImage(offer),
    discount: offerDiscountLabel(offer),
    price,
    oldPrice: original > price ? original : 0,
  };
};

const toBusiness = (value: unknown): SearchBusinessResult | null => {
  const b = rec(value);
  const code = str(b.uniqueCode) || str(b.slug) || str(b.code);
  const name = str(b.name);
  if (!code || !name) return null;
  return {
    code,
    id: str(b.id),
    name,
    logo: str(b.logoUrl) || str(b.logo) || null,
    meta: [str(rec(b.category).name) || str(b.categoryName), str(b.city)].filter(Boolean).join(' · '),
  };
};

/**
 * Live global search — `GET /public/search?q=` (deals + businesses), near the
 * customer when they have a location. Debounced; starts at 2 characters.
 */
export function usePublicSearch(input: string) {
  const locationQuery = useLocationQuery();
  const [query, setQuery] = useState('');
  const [deals, setDeals] = useState<SearchDealResult[]>([]);
  const [businesses, setBusinesses] = useState<SearchBusinessResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(input.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    let ignore = false;
    if (query.length < 2 || !hasApiConfig()) {
      setDeals([]);
      setBusinesses([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const { lat, lng, radius } = locationQuery as { lat?: number; lng?: number; radius?: number };
    catalogueService
      .searchPublicBusinesses({ q: query, limit: 6, lat, lng, radius })
      .then((response) => {
        if (ignore) return;
        const payload = rec(rec(response).data && !Array.isArray(rec(response).data) ? rec(response).data : response);
        setDeals((Array.isArray(payload.deals) ? payload.deals : []).map(toDeal).filter((d): d is SearchDealResult => Boolean(d)));
        setBusinesses((Array.isArray(payload.businesses) ? payload.businesses : []).map(toBusiness).filter((b): b is SearchBusinessResult => Boolean(b)));
      })
      .catch(() => {
        if (ignore) return;
        setDeals([]);
        setBusinesses([]);
        setError('Search isn’t available right now. Please try again.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [query, locationQuery]);

  const pending = input.trim().length >= 2 && (loading || input.trim() !== query);
  return { query, deals, businesses, loading: pending, error, active: input.trim().length >= 2 };
}
