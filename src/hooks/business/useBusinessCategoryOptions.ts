import { useQuery } from '@tanstack/react-query';
import { api, hasApiConfig } from '../../services/api/client';

interface BackendCategory {
  id: string;
  name: string;
  subcategories?: { id: string; name: string }[] | null;
}

export interface CategoryOption {
  /** Demo: the seed key; live: the backend category id. */
  value: string;
  label: string;
  subcategories: string[];
}

/**
 * Business categories for setup. Live: `GET /categories` (public, `{ items }`),
 * so the chosen category can be saved as a real `categoryId`. Demo: the seed list.
 */
export function useBusinessCategoryOptions(seed: { value?: string; label: string; subcategories: string[] }[]) {
  const live = hasApiConfig();
  const query = useQuery({
    queryKey: ['categories', 'business'],
    queryFn: async () => (await api.get<{ items: BackendCategory[] }>('/categories', { params: { limit: 100 } })).items,
    enabled: live,
    staleTime: 60 * 60_000,
  });

  const backend = query.data ?? [];
  const options: CategoryOption[] = live
    ? backend.map((c) => ({ value: c.id, label: c.name, subcategories: (c.subcategories ?? []).map((s) => s.name) }))
    : seed.map((c) => ({ value: c.value ?? c.label, label: c.label, subcategories: c.subcategories }));

  /** First selected category (by id or name) and the first tag that is one of its subcategories. */
  const resolve = (selected: string[], tags: string[]) => {
    const category = backend.find((c) => selected.includes(c.id) || selected.includes(c.name));
    const subcategory = category?.subcategories?.find((s) => tags.includes(s.name));
    return { categoryId: category?.id, subcategoryId: subcategory?.id };
  };

  return { options, resolve, isLoading: live && query.isLoading };
}
