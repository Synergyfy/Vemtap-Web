import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesService, type CatalogueCategory } from '../../services/categoriesService';

export const categoriesKeys = { all: ['catalogue-categories'] as const };

export function useCatalogueCategories() {
  return useQuery({ queryKey: categoriesKeys.all, queryFn: categoriesService.list });
}

export type CategoryMutation =
  | { type: 'create'; name: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'remove'; id: string }
  | { type: 'reorder'; orderedIds: string[] };

export function useCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, CategoryMutation, { previous?: CatalogueCategory[] }>({
    mutationFn: (input) => {
      switch (input.type) {
        case 'create':
          return categoriesService.create(input.name);
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
      const previous = queryClient.getQueryData<CatalogueCategory[]>(categoriesKeys.all);
      if (previous) {
        queryClient.setQueryData(
          categoriesKeys.all,
          input.orderedIds.map((id) => previous.find((c) => c.id === id)).filter(Boolean),
        );
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(categoriesKeys.all, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoriesKeys.all }),
  });
}
