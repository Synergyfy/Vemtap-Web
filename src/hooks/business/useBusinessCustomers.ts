import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessCustomersService, type CustomersQuery } from '../../services/businessCustomersService';

export const customerKeys = { all: ['business-customers'] as const };

export function useBusinessCustomers(query: CustomersQuery) {
  return useQuery({
    queryKey: [...customerKeys.all, 'list', query],
    queryFn: () => businessCustomersService.list(query),
    enabled: hasApiConfig(),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerDossier(userId: string | null) {
  return useQuery({
    queryKey: [...customerKeys.all, 'dossier', userId],
    queryFn: () => businessCustomersService.get(userId as string),
    enabled: hasApiConfig() && Boolean(userId),
  });
}

export function useSaveCustomerNote(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { note?: string; tags?: string[] }) => businessCustomersService.saveNote(userId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...customerKeys.all, 'dossier', userId] }),
  });
}
