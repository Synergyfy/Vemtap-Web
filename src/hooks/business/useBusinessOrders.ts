import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessOrdersService, type BookingStatus, type BusinessOrder, type OrderStatus } from '../../services/businessOrdersService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

export const businessOrderKeys = { all: ['business-orders'] as const };

/** Orders at the active branch, refreshed every 30s so new tickets appear. */
export function useBusinessOrders() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: [...businessOrderKeys.all, 'orders', activeBranchId ?? 'all'],
    queryFn: () => businessOrdersService.orders({ branchId: activeBranchId, type: 'order', limit: 100 }),
    enabled: hasApiConfig() && Boolean(activeBranchId),
    refetchInterval: 30_000,
  });
}

/** One order, seeded from the branch list (which also carries the branch). */
export function useBusinessOrder(id: string | null | undefined) {
  const queryClient = useQueryClient();
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: [...businessOrderKeys.all, 'order', id],
    queryFn: async (): Promise<BusinessOrder> => {
      const order = await businessOrdersService.order(id as string);
      const listed = queryClient
        .getQueryData<BusinessOrder[]>([...businessOrderKeys.all, 'orders', activeBranchId ?? 'all'])
        ?.find((row) => row.id === id);
      return { ...listed, ...order, branch: order.branch ?? listed?.branch };
    },
    placeholderData: () =>
      queryClient
        .getQueryData<BusinessOrder[]>([...businessOrderKeys.all, 'orders', activeBranchId ?? 'all'])
        ?.find((row) => row.id === id),
    enabled: hasApiConfig() && Boolean(id),
  });
}

export function useBusinessBookings() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: [...businessOrderKeys.all, 'bookings', activeBranchId ?? 'all'],
    queryFn: () => businessOrdersService.bookings({ branchId: activeBranchId, limit: 100 }),
    enabled: hasApiConfig() && Boolean(activeBranchId),
    refetchInterval: 30_000,
  });
}

export function useOrderStatusMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: businessOrderKeys.all });
  return {
    order: useMutation({
      mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => businessOrdersService.setOrderStatus(id, status),
      onSuccess: refresh,
    }),
    booking: useMutation({
      mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => businessOrdersService.setBookingStatus(id, status),
      onSuccess: refresh,
    }),
  };
}
