import { api, ApiError } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { formatDistanceKm } from '../context/LocationContext';
import type {
  ApiListResponse,
  CatalogueItemBranchPrice,
  CreateCatalogueItemDto,
  CreateCatalogueOfferDto,
  UpdateCatalogueItemDto,
  UpdateCatalogueOfferDto,
} from './types';

/**
 * Gives each feed row a readable `distance` ("1.2 km") from the API's
 * `distanceKm`, which screens already show in place of a generic label.
 */
const withDistanceLabels = <T>(response: T): T => {
  const label = (row: unknown) => {
    if (!row || typeof row !== 'object') return row;
    const record = row as Record<string, unknown>;
    const distance = formatDistanceKm(record.distanceKm);
    return distance && !record.distance ? { ...record, distance } : row;
  };
  if (Array.isArray(response)) return response.map(label) as T;
  if (response && typeof response === 'object') {
    const record = response as Record<string, unknown>;
    for (const key of ['data', 'items']) {
      if (Array.isArray(record[key])) return { ...record, [key]: (record[key] as unknown[]).map(label) } as T;
    }
  }
  return response;
};

type FeedParams = Record<string, string | number | boolean | undefined>;

const feedRows = (response: unknown): unknown[] => {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object') {
    const record = response as Record<string, unknown>;
    for (const key of ['data', 'items']) if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
};

/**
 * A public feed that never goes empty just because of the customer's location:
 * nothing within the radius → the nearest rows anywhere (still nearest first,
 * with real distances); location params rejected (an older API) → the plain feed.
 */
const nearestFeed = async <T>(params: FeedParams | undefined, load: (query?: FeedParams) => Promise<T>): Promise<T> => {
  const hasPoint = params?.lat !== undefined && params?.lng !== undefined;
  if (!hasPoint) return withDistanceLabels(await load(params));
  try {
    const nearby = await load(params);
    if (params?.radius === undefined || feedRows(nearby).length > 0) return withDistanceLabels(nearby);
    const { radius: _radius, ...anywhere } = params ?? {};
    return withDistanceLabels(await load(anywhere));
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 400) throw error;
    const { lat: _lat, lng: _lng, radius: _radius, sortBy: _sortBy, ...plain } = params ?? {};
    return withDistanceLabels(await load(plain));
  }
};

export const catalogueService = {
  getItems: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.items, { params }),

  getItemById: async (id: string) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.catalogue.itemById(id)),

  getItemsByBranch: async (branchId: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.itemsByBranch(branchId), { params }),

  getPublicItemById: async (id: string) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.catalogue.publicItemById(id)),

  getPublicItemsByBranch: async (branchId: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.publicItemsByBranch(branchId), { params }),

  getPublicCategoriesByBranch: async (branchId: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.publicCategoriesByBranch(branchId), { params }),

  getPublicOffers: async (params?: FeedParams) =>
    nearestFeed(params, (query) =>
      api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.publicOffers, { params: query }),
    ),

  getPublicOffersByBranch: async (branchId: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.publicOffersByBranch(branchId), { params }),

  getPublicOfferDetails: async (id: string) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.catalogue.publicOfferDetails(id)),

  getPublicBusinesses: async (params?: FeedParams) =>
    nearestFeed(params, (query) =>
      api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.public.businesses, { params: query }),
    ),

  searchPublicBusinesses: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.public.search, { params }),

  getPublicStats: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.public.stats, { params }),

  getPublicBusinessByCode: async (code: string) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.public.businessByCode(code)),

  getPublicBranchByCode: async (code: string) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.public.branchByCode(code)),

  getPublicBranchOrdering: async (branchId: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.public.branchOrdering(branchId), { params }),

  createItem: async (payload: CreateCatalogueItemDto) =>
    api.post<Record<string, unknown>>(API_ENDPOINTS.catalogue.items, payload),

  updateItem: async (id: string, payload: UpdateCatalogueItemDto) =>
    api.patch<Record<string, unknown>>(API_ENDPOINTS.catalogue.itemById(id), payload),

  getItemBranchPricing: async (id: string) =>
    api.get<{ pricingMode?: string; branches: CatalogueItemBranchPrice[] }>(API_ENDPOINTS.catalogue.itemBranchPricing(id)),

  putItemBranchPricing: async (id: string, body: { pricingMode: 'uniform' | 'per_branch'; branches: CatalogueItemBranchPrice[] }) =>
    api.put<Record<string, unknown>>(API_ENDPOINTS.catalogue.itemBranchPricing(id), body),

  getAdminOffers: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.adminOffers, { params }),

  createOffer: async (payload: CreateCatalogueOfferDto) =>
    api.post<Record<string, unknown>>(API_ENDPOINTS.catalogue.offers, payload),

  updateOffer: async (id: string, payload: UpdateCatalogueOfferDto) =>
    api.patch<Record<string, unknown>>(API_ENDPOINTS.catalogue.offerById(id), payload),

  getOfferStats: async (id: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.catalogue.offerStats(id), { params }),

  getOfferSummary: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.catalogue.offerSummary, { params }),
};
