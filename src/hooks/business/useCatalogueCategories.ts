import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesService, type CatalogueCategory, type CategoryDetails } from '../../services/categoriesService';
import { hasApiConfig } from '../../services/api/client';

export const categoriesKeys = { all: ['catalogue-categories'] as const };

export function useCatalogueCategories(kind?: 'product' | 'service') {
  return useQuery({
    queryKey: [...categoriesKeys.all, kind ?? 'all'],
    queryFn: () => categoriesService.list(kind),
    enabled: hasApiConfig(),
  });
}

export type CategoryMutation =
  | { type: 'create'; name: string; details?: CategoryDetails }
  | { type: 'update'; id: string; name?: string; details?: CategoryDetails }
  | { type: 'rename'; id: string; name: string }
  | { type: 'remove'; id: string }
  | { type: 'reorder'; orderedIds: string[] };

export function useCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    Error,
    CategoryMutation,
    { previous?: Array<[readonly unknown[], CatalogueCategory[] | undefined]> }
  >({
    mutationFn: (input) => {
      switch (input.type) {
        case 'create':
          return categoriesService.create(input.name, input.details);
        case 'update':
          return categoriesService.update(input.id, { ...(input.name ? { name: input.name } : {}), ...input.details });
        case 'rename':
          return categoriesService.rename(input.id, input.name);
        case 'remove':
          return categoriesService.remove(input.id);
        case 'reorder':
          return categoriesService.reorder(input.orderedIds);
      }
    },
    // Reorder is applied optimistically so rows don't jump back while saving.
    onMutate: async (input) => {
      if (input.type !== 'reorder') return {};
      await queryClient.cancelQueries({ queryKey: categoriesKeys.all });
      const previous = queryClient.getQueriesData<CatalogueCategory[]>({ queryKey: categoriesKeys.all });
      previous.forEach(([key, list]) => {
        if (!list) return;
        queryClient.setQueryData(
          key,
          input.orderedIds.map((id) => list.find((c) => c.id === id)).filter(Boolean),
        );
      });
      return { previous };
    },
    onError: (_error, _input, context) => {
      context?.previous?.forEach(([key, list]) => {
        if (list) queryClient.setQueryData(key, list);
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoriesKeys.all }),
  });
}
