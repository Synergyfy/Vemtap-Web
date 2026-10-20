import { api } from './api/client';

/** `GET /catalogue/items` row — money fields may arrive as strings. */
export interface CatalogueItem {
  id: string;
  name: string;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  shortDescription?: string | null;
  description?: string | null;
  mainImage?: string | null;
  galleryImages?: string[] | null;
  category?: { id: string; name: string } | null;
  categoryId?: string | null;
  status: string;
  /** `product` or `service`. */
  itemType: string;
  sku?: string | null;
  stockQuantity?: number | null;
  minStock?: number | null;
  allowBackOrder?: boolean | null;
  duration?: string | null;
  serviceMode?: string | null;
  isBookable?: boolean | null;
  isSuspended?: boolean | null;
  branches?: { id: string; name?: string | null; isActive?: boolean | null }[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Mirrors `CreateCatalogueItemDto` (subset the web sends). `branchId` is required. */
export interface CatalogueItemInput {
  name: string;
  description: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  shortDescription?: string;
  mainImage?: string;
  galleryImages?: string[];
  categoryId?: string;
  sku?: string;
  itemType?: 'product' | 'service';
  stockQuantity?: number;
  minStock?: number;
  allowBackOrder?: boolean;
  brand?: string;
  tags?: string[];
  duration?: string;
  serviceMode?: 'location' | 'customer' | 'online' | 'flexible';
  isBookable?: boolean;
  bookingMethod?: 'vemtap' | 'call' | 'whatsapp' | 'external';
  branchId: string;
}

export type CatalogueItemUpdate = Partial<CatalogueItemInput> & { status?: string; applyGlobally?: boolean };

const asList = (res: CatalogueItem[] | { data: CatalogueItem[] }) => (Array.isArray(res) ? res : res.data ?? []);

/** One branch's row of `GET/PUT /catalogue/items/:id/branch-pricing`. */
export interface BranchPricingRow {
  branchId: string;
  branchName: string;
  isMainBranch: boolean;
  isAvailable: boolean;
  price: number | string;
  compareAtPrice?: number | string | null;
  stockQuantity?: number | null;
  hasOverride?: boolean;
}

export interface ItemBranchPricing {
  itemId: string;
  pricingMode: 'uniform' | 'per_branch';
  basePrice: number | string;
  baseCompareAtPrice?: number | string | null;
  branches: BranchPricingRow[];
}

export interface SetBranchPricingInput {
  pricingMode: 'uniform' | 'per_branch';
  branches: { branchId: string; isAvailable: boolean; price?: number | null; compareAtPrice?: number | null; stockQuantity?: number | null }[];
}

export const catalogueItemsService = {
  /** Which branches carry an item and, when priced per branch, at what price. */
  branchPricing: (id: string) => api.get<ItemBranchPricing>(`/catalogue/items/${id}/branch-pricing`),
  setBranchPricing: (id: string, input: SetBranchPricingInput) => api.put<ItemBranchPricing>(`/catalogue/items/${id}/branch-pricing`, input),
  /** The API accepts `itemType` but does not apply it, so the type is also filtered here. */
  list: (query: { branchId?: string; itemType?: 'product' | 'service'; limit?: number } = {}) =>
    api
      .get<CatalogueItem[] | { data: CatalogueItem[] }>('/catalogue/items', { params: { ...query } })
      .then(asList)
      .then((items) => (query.itemType ? items.filter((item) => (item.itemType ?? 'product') === query.itemType) : items)),
  create: (input: CatalogueItemInput) => api.post<CatalogueItem>('/catalogue/items', input),
  update: (id: string, input: CatalogueItemUpdate) => api.patch<CatalogueItem>(`/catalogue/items/${id}`, input),
  /** Permanent delete everywhere; the backend needs `applyGlobally` (or a branchId). */
  remove: (id: string) => api.del<unknown>(`/catalogue/items/${id}`, { params: { applyGlobally: true } }),
};

// ---------------------------------------------------------------------------
// Draft → API mapping (shared by the dashboard catalogue and business setup)
// ---------------------------------------------------------------------------

/** "14,000" / "₦14,000" → 14000; undefined when blank or unreadable. */
export const toPrice = (value: string | number | undefined | null) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const clean = <T extends Record<string, unknown>>(input: T) =>
  Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined && v !== '')) as T;

export interface ProductDraftLike {
  title: string;
  description: string;
  basePrice: string;
  comparePrice: string;
  costPrice: string;
  skuCode?: string;
  sku?: string;
  lowStock: string;
  backorder: boolean;
  producer?: string;
  unbranded?: boolean;
  variants?: Array<{ inventory: string }>;
  variantsEnabled?: boolean;
}

export function productDraftToInput(draft: ProductDraftLike, branchId: string, extra: { mainImage?: string; categoryId?: string } = {}): CatalogueItemInput {
  const stock = draft.variantsEnabled && draft.variants?.length
    ? draft.variants.reduce((sum, v) => sum + (toPrice(v.inventory) ?? 0), 0)
    : undefined;
  return clean({
    name: draft.title.trim(),
    // The backend requires a description; fall back to the name.
    description: draft.description.trim() || draft.title.trim(),
    price: toPrice(draft.basePrice),
    compareAtPrice: toPrice(draft.comparePrice),
    costPrice: toPrice(draft.costPrice),
    sku: (draft.skuCode || draft.sku || '').trim() || undefined,
    itemType: 'product' as const,
    stockQuantity: stock,
    minStock: toPrice(draft.lowStock),
    allowBackOrder: draft.backorder,
    brand: draft.unbranded ? undefined : draft.producer?.trim() || undefined,
    mainImage: extra.mainImage,
    categoryId: extra.categoryId,
    branchId,
  });
}

export interface ServiceDraftLike {
  title: string;
  description: string;
  basePrice: string;
  comparePrice: string;
  standardPrice?: string;
  durationMins: number;
  deliveryFormat: 'in-salon' | 'mobile' | 'both';
  skuCode?: string;
  image?: string;
}

const SERVICE_MODE: Record<ServiceDraftLike['deliveryFormat'], CatalogueItemInput['serviceMode']> = {
  'in-salon': 'location',
  mobile: 'customer',
  both: 'flexible',
};

export function serviceDraftToInput(draft: ServiceDraftLike, branchId: string, extra: { categoryId?: string } = {}): CatalogueItemInput {
  const image = draft.image && /^https?:\/\//.test(draft.image) ? draft.image : undefined;
  return clean({
    name: draft.title.trim(),
    description: draft.description.trim() || draft.title.trim(),
    price: toPrice(draft.standardPrice) ?? toPrice(draft.basePrice),
    compareAtPrice: toPrice(draft.comparePrice),
    sku: draft.skuCode?.trim() || undefined,
    itemType: 'service' as const,
    duration: draft.durationMins ? `${draft.durationMins} mins` : undefined,
    serviceMode: SERVICE_MODE[draft.deliveryFormat],
    isBookable: true,
    bookingMethod: 'vemtap' as const,
    mainImage: image,
    categoryId: extra.categoryId,
    branchId,
  });
}
