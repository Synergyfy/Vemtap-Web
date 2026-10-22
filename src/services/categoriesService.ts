import { api } from './api/client';
import { withMock } from './mock';

export interface CatalogueCategory {
  id: string;
  name: string;
  businessId?: string | null;
}

let mockCategories: CatalogueCategory[] = [
  { id: 'cat-grills', name: 'Grills & Mains' },
  { id: 'cat-sides', name: 'Sides' },
  { id: 'cat-drinks', name: 'Drinks' },
  { id: 'cat-desserts', name: 'Desserts' },
  { id: 'cat-spa', name: 'Spa Treatments' },
];

/** The business's own catalogue categories — `/catalogue/categories` (bare arrays). */
export const categoriesService = {
  list: () => withMock(() => api.get<CatalogueCategory[]>('/catalogue/categories'), () => [...mockCategories]),

  create: (name: string) =>
    withMock(
      () => api.post<CatalogueCategory>('/catalogue/categories', { name }),
      () => {
        const created = { id: `cat-${Date.now()}`, name };
        mockCategories = [...mockCategories, created];
        return created;
      },
    ),

  rename: (id: string, name: string) =>
    withMock(
      () => api.patch<CatalogueCategory>(`/catalogue/categories/${id}`, { name }),
      () => {
        mockCategories = mockCategories.map((c) => (c.id === id ? { ...c, name } : c));
        return { id, name };
      },
    ),

  /** The backend detaches the category from its items first. */
  remove: (id: string) =>
    withMock(
      () => api.del<{ id: string }>(`/catalogue/categories/${id}`),
      () => {
        mockCategories = mockCategories.filter((c) => c.id !== id);
        return { id };
      },
    ),

  /** Sends the complete ordered id list; the backend assigns sortOrder = index. */
  reorder: (orderedIds: string[]) =>
    withMock(
      () => api.patch<CatalogueCategory[]>('/catalogue/categories/reorder', { orderedIds }),
      () => {
        mockCategories = orderedIds
          .map((id) => mockCategories.find((c) => c.id === id))
          .filter((c): c is CatalogueCategory => Boolean(c));
        return [...mockCategories];
      },
    ),
};
