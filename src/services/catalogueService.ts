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

  getPublicOffers: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<ApiListResponse<Record<string, unknown>>>(API_ENDPOINTS.catalogue.publicOffers, { params }),

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
