import { useQuery } from '@tanstack/react-query';
import { api, hasApiConfig } from '../services/api/client';

interface BackendCategory {
  id: string;
  name: string;
}

export interface HomeDealCategory {
  /** Backend category id; `null` is the "All" chip (no filter). */
  id: string | null;
  label: string;
  icon?: string;
}

const ALL_CHIP: HomeDealCategory = { id: null, label: 'All' };

/** The backend has no icon per category, so pick one from the name. */
const ICON_RULES: [RegExp, string][] = [
  [/food|dining|restaurant|beverage|drink|cafe/i, 'restaurant'],
  [/fitness|gym|health|wellness/i, 'fitness_center'],
  [/beauty|spa|salon/i, 'spa'],
  [/hospitality|hotel|lodging|travel/i, 'hotel'],
  [/fashion|apparel|cloth/i, 'checkroom'],
  [/retail|shop|store|grocer/i, 'shopping_bag'],
  [/tech|gadget|electronic/i, 'devices'],
  [/service/i, 'home_repair_service'],
];

const iconFor = (name: string) => ICON_RULES.find(([pattern]) => pattern.test(name))?.[1] ?? 'category';

/**
 * Category chips for the customer home feed (desktop and mobile views).
 * Live: the public business categories from `GET /categories`; the chosen id is
 * sent as `categoryId` to `GET /catalogue/offers/public`, which filters offers
 * by their business's category. Without an API there is only "All".
 */
export function useHomeDealCategories() {
  const live = hasApiConfig();
  const query = useQuery({
    queryKey: ['categories', 'public'],
    queryFn: async () => (await api.get<{ items: BackendCategory[] }>('/categories', { params: { limit: 100 } })).items ?? [],
    enabled: live,
    staleTime: 60 * 60_000,
  });

  const categories: HomeDealCategory[] = [
    ALL_CHIP,
    ...(query.data ?? []).map((category) => ({ id: category.id, label: category.name, icon: iconFor(category.name) })),
  ];

  return { categories, isLoading: live && query.isLoading };
}
