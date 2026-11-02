import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, hasApiConfig } from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';

/** A product or service as `GET /public/catalogue/items/:id` returns it — only real fields. */
export interface CatalogueItemDetail {
  id: string;
  name: string;
  kind: 'product' | 'service';
  shortDescription: string | null;
  description: string | null;
  images: string[];
  /** Main price line, e.g. "₦12,000", "From ₦5,000", "₦5,000 – ₦9,000". Null when the business set no price. */
  priceLabel: string | null;
  /** Struck-through original price when there is a real discount or compare-at price. */
  wasLabel: string | null;
  discountLabel: string | null;
  category: string | null;
  duration: string | null;
  stockLabel: string | null;
  inStock: boolean;
  tags: string[];
  fulfillment: string[];
  variants: string[];
  brand: string | null;
  bookable: boolean;
  bookingLink: string | null;
  /** Unit price an order is charged (after the item's own discount), or 0 when it has no fixed price. */
  unitPrice: number;
  /** Raw fulfilment modes (`pickup`, `delivery`, `dine_in`, …). */
  modes: string[];
  /** Branches that sell the item — an order goes to one of them. */
  branches: { id: string; name: string; city: string | null }[];
}


const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);
const num = (value: unknown) => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
};
const strings = (value: unknown): string[] =>
  (Array.isArray(value) ? value : []).map((entry) => str(entry) ?? str(rec(entry).name) ?? str(rec(entry).label)).filter((v): v is string => Boolean(v));
const unwrap = (payload: unknown) => {
  const r = rec(payload);
  return r.data && typeof r.data === 'object' && !('name' in r) ? rec(r.data) : r;
};
const naira = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
const pretty = (value: string) => value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const toDetail = (payload: unknown): CatalogueItemDetail => {
  const item = unwrap(payload);
  const kind = String(item.itemType ?? '').toLowerCase() === 'service' ? 'service' : 'product';
  const price = num(item.price);
  const min = num(item.priceRangeMin);
  const max = num(item.priceRangeMax);
  const priceType = String(item.priceType ?? 'fixed').toLowerCase();
  const discountType = String(item.discountType ?? 'none').toLowerCase();
  const discountValue = num(item.discountValue) ?? 0;

  let finalPrice = price;
  let discountLabel: string | null = null;
  if (price != null && discountValue > 0 && discountType.includes('percent')) {
    finalPrice = Math.max(0, price * (1 - discountValue / 100));
    discountLabel = `${Math.round(discountValue)}% OFF`;
  } else if (price != null && discountValue > 0 && (discountType.includes('fixed') || discountType.includes('amount'))) {
    finalPrice = Math.max(0, price - discountValue);
    discountLabel = `${naira(discountValue)} OFF`;
  }

  let priceLabel: string | null = null;
  if (priceType.includes('range') && min != null && max != null) priceLabel = `${naira(min)} – ${naira(max)}`;
  else if ((priceType.includes('start') || priceType.includes('from')) && (min ?? finalPrice) != null) priceLabel = `From ${naira((min ?? finalPrice) as number)}`;
  else if (priceType.includes('free')) priceLabel = 'Free';
  else if (finalPrice != null && finalPrice > 0) priceLabel = naira(finalPrice);

  const compareAt = num(item.compareAtPrice);
  const wasLabel = discountLabel && price ? naira(price) : compareAt && finalPrice != null && compareAt > finalPrice ? naira(compareAt) : null;

  const stock = num(item.stockQuantity);
  const backOrder = item.allowBackOrder === true;
  const inStock = kind === 'service' || stock == null || stock > 0 || backOrder;
  const stockLabel = kind === 'service' || stock == null ? null : stock > 0 ? (stock <= 5 ? `Only ${stock} left` : 'In stock') : backOrder ? 'Available on back-order' : 'Out of stock';

  const images = [str(item.mainImage), ...strings(item.galleryImages)].filter((v, i, all): v is string => Boolean(v) && all.indexOf(v) === i);

  return {
    id: str(item.id) ?? '',
    name: str(item.name) ?? 'Item',
    kind,
    shortDescription: str(item.shortDescription),
    description: str(item.description),
    images,
    priceLabel,
    wasLabel,
    discountLabel,
    category: str(rec(item.category).name) ?? str(item.categoryName),
    duration: kind === 'service' ? str(item.duration) : null,
    stockLabel,
    inStock,
    tags: strings(item.tags),
    fulfillment: strings(item.fulfillmentModes).map(pretty),
    variants: strings(item.variants),
    brand: str(item.brand),
    bookable: item.isBookable === true,
    bookingLink: str(item.externalBookingLink),
    unitPrice: finalPrice != null && finalPrice > 0 ? finalPrice : 0,
    modes: strings(item.fulfillmentModes).map((mode) => mode.toLowerCase()),
    branches: (Array.isArray(item.branches) ? item.branches : [])
      .map(rec)
      .filter((branch) => str(branch.id) && branch.isActive !== false)
      .map((branch) => ({ id: String(branch.id), name: str(branch.name) ?? 'Branch', city: str(branch.city) })),
  };
};

/**
 * One live product/service for the detail page (desktop + mobile):
 * `GET /public/catalogue/items/:id`. The business it belongs to comes from
 * `usePublicBusiness` (the item itself does not carry it).
 */
export function usePublicCatalogueItem(itemId: string | null) {
  const [item, setItem] = useState<CatalogueItemDetail | null>(null);
  const [loading, setLoading] = useState(() => Boolean(itemId) && hasApiConfig());
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setItem(null);
    setError(null);
    if (!itemId || !hasApiConfig()) {
      setLoading(false);
      if (!itemId) setError('This link is incomplete.');
      return;
    }
    setLoading(true);
    api
      .get<unknown>(API_ENDPOINTS.catalogue.publicItemById(itemId))
      .then((payload) => {
        if (!ignore) setItem(toDetail(payload));
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof ApiError && err.status === 404 ? 'We couldn’t find this item.' : 'This item couldn’t be loaded. Please try again.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [itemId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { item, loading, error, reload };
}

export interface PublicOrderInput {
  itemId: string;
  quantity: number;
  branchId: string;
  fullName: string;
  phone: string;
  notes?: string;
  tableNumber?: string;
  bookingDate?: string;
  bookingTime?: string;
}

/**
 * Places a real order (or service booking) with the business — `POST /catalogue/orders`
 * (public). Resolves to a short reference like `#A1B2C3D4`; rejects with a readable message.
 */
export async function placePublicOrder(input: PublicOrderInput): Promise<string> {
  const [firstName, ...rest] = input.fullName.trim().split(/\s+/);
  const lastName = rest.join(' ');
  if (!firstName || !lastName) throw new Error('Please enter your first and last name.');
  if (!input.phone.trim()) throw new Error('Please enter your phone number.');
  if (!input.branchId) throw new Error('Choose a branch.');
  try {
    const order = rec(
      unwrap(
        await api.post<unknown>('/catalogue/orders', {
          firstName,
          lastName,
          phone: input.phone.trim(),
          notes: input.notes?.trim() || undefined,
          tableNumber: input.tableNumber?.trim() || undefined,
          bookingDate: input.bookingDate || undefined,
          bookingTime: input.bookingTime || undefined,
          branchId: input.branchId,
          source: 'storefront',
          items: [{ itemId: input.itemId, quantity: Math.max(1, input.quantity) }],
        }),
      ),
    );
    const id = str(order.id);
    return id ? `#${id.slice(0, 8).toUpperCase()}` : 'Sent';
  } catch (err) {
    throw new Error(err instanceof ApiError && err.message && !/^Request failed/.test(err.message) ? err.message : 'Your order couldn’t be sent. Please try again.');
  }
}
