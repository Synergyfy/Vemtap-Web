import { api } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type {
  ApiListResponse,
  CatalogueItemBranchPrice,
  CreateCatalogueItemDto,
  CreateCatalogueOfferDto,
  UpdateCatalogueItemDto,
  UpdateCatalogueOfferDto,
} from './types';

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

  getPublicOffers: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.publicOffers, { params }),

  getPublicOffersByBranch: async (branchId: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.publicOffersByBranch(branchId), { params }),

  getPublicOfferDetails: async (id: string) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.catalogue.publicOfferDetails(id)),

  getPublicBusinesses: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.public.businesses, { params }),

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

  getOfferBranchPricing: async (id: string) =>
    api.get<{ branches: Array<{ branchId: string; isActive?: boolean; dealPrice?: number; quantity?: number }> }>(
      API_ENDPOINTS.catalogue.offerBranchPricing(id),
    ),

  putOfferBranchPricing: async (
    id: string,
    body: { branches: Array<{ branchId: string; isActive?: boolean; dealPrice?: number; quantity?: number }> },
  ) => api.put<Record<string, unknown>>(API_ENDPOINTS.catalogue.offerBranchPricing(id), body),

  getOfferStats: async (id: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.catalogue.offerStats(id), { params }),

  getOfferSummary: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.catalogue.offerSummary, { params }),
};
