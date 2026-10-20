import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessOrdersService, type BookingStatus, type OrderStatus } from '../../services/businessOrdersService';
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
