import { api } from './api/client';

/** Optional details the category form collects (type, description, icon, image). */
export interface CategoryDetails {
  kind?: 'product' | 'service';
  description?: string;
  icon?: string;
  imageUrl?: string;
}

export interface CatalogueCategory {
  id: string;
  name: string;
  businessId?: string | null;
  kind?: 'product' | 'service' | null;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
}

/** The business's own catalogue categories — `/catalogue/categories` (bare arrays). */
export const categoriesService = {
  list: (kind?: 'product' | 'service') =>
    api.get<CatalogueCategory[]>(
      kind ? `/catalogue/categories?kind=${encodeURIComponent(kind)}` : '/catalogue/categories',
    ),

  create: (name: string, details: CategoryDetails = {}) =>
    api.post<CatalogueCategory>('/catalogue/categories', { name, ...details }),

  rename: (id: string, name: string) =>
    api.patch<CatalogueCategory>(`/catalogue/categories/${id}`, { name }),

  /** Name and/or details; fields left out are kept. */
  update: (id: string, input: { name?: string } & CategoryDetails) =>
    api.patch<CatalogueCategory>(`/catalogue/categories/${id}`, input),

  /** The backend detaches the category from its items first. */
  remove: (id: string) => api.del<{ id: string }>(`/catalogue/categories/${id}`),

  /** Sends the complete ordered id list; the backend assigns sortOrder = index. */
  reorder: (orderedIds: string[]) => api.patch<CatalogueCategory[]>('/catalogue/categories/reorder', { orderedIds }),
};
