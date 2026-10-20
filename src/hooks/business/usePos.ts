import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { posService, type KitchenStatus, type NewSaleInput, type PosSalesQuery } from '../../services/posService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

export const posKeys = {
  all: ['pos'] as const,
  register: () => [...posKeys.all, 'register'] as const,
  zReport: () => [...posKeys.all, 'z-report'] as const,
  tills: (branchId?: string) => [...posKeys.all, 'tills', branchId ?? 'all'] as const,
  summary: () => [...posKeys.all, 'summary'] as const,
  sales: (query: PosSalesQuery) => [...posKeys.all, 'sales', query] as const,
  sale: (id: string) => [...posKeys.all, 'sale', id] as const,
  held: (branchId?: string) => [...posKeys.all, 'held', branchId ?? 'all'] as const,
  customers: (search: string, branchId?: string) => [...posKeys.all, 'customers', search, branchId ?? 'all'] as const,
  kitchen: (branchId?: string) => [...posKeys.all, 'kitchen', branchId ?? 'all'] as const,
  staffPins: () => [...posKeys.all, 'staff-pins'] as const,
};

const live = () => hasApiConfig();

export function useRegisterStatus() {
  return useQuery({ queryKey: posKeys.register(), queryFn: posService.registerStatus, enabled: live(), refetchInterval: 60_000 });
}

export function useZReport(enabled: boolean) {
  return useQuery({ queryKey: posKeys.zReport(), queryFn: posService.zReport, enabled: live() && enabled });
}

export function usePosTills() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({ queryKey: posKeys.tills(activeBranchId), queryFn: () => posService.tills(activeBranchId), enabled: live() && Boolean(activeBranchId) });
}

export function usePosBranchSummary() {
  return useQuery({ queryKey: posKeys.summary(), queryFn: posService.branchSummary, enabled: live(), refetchInterval: 60_000 });
}

export function usePosSales(query: Omit<PosSalesQuery, 'branchId'>) {
  const { activeBranchId } = useBusinessBranch();
  const full = { ...query, branchId: activeBranchId };
  return useQuery({ queryKey: posKeys.sales(full), queryFn: () => posService.sales(full), enabled: live() && Boolean(activeBranchId), placeholderData: (prev) => prev });
}

export function usePosSale(id: string | null) {
  return useQuery({ queryKey: posKeys.sale(id ?? 'none'), queryFn: () => posService.sale(id as string), enabled: live() && Boolean(id) });
}

export function useHeldSales() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({ queryKey: posKeys.held(activeBranchId), queryFn: () => posService.heldSales(activeBranchId), enabled: live() && Boolean(activeBranchId) });
}

export function usePosCustomers(search: string) {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: posKeys.customers(search, activeBranchId),
    queryFn: () => posService.customers({ search: search || undefined, branchId: activeBranchId }),
    enabled: live(),
  });
}

export function useKitchenStream() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: posKeys.kitchen(activeBranchId),
    queryFn: () => posService.kitchen(activeBranchId),
    enabled: live() && Boolean(activeBranchId),
    refetchInterval: 15_000,
  });
}

export function useStaffPins() {
  return useQuery({ queryKey: posKeys.staffPins(), queryFn: posService.staffPins, enabled: live() });
}

/** Every POS write, each refreshing what it can change. */
export function usePosMutations() {
  const queryClient = useQueryClient();
  const refresh = (...keys: (readonly unknown[])[]) => keys.forEach((queryKey) => void queryClient.invalidateQueries({ queryKey }));
  const afterSale = () => {
    refresh([...posKeys.all, 'sales'], posKeys.register(), posKeys.summary(), posKeys.tills(), ['catalogue-items'], ['pos-dashboard']);
  };
  return {
    openRegister: useMutation({ mutationFn: posService.openRegister, onSuccess: () => refresh(posKeys.register(), [...posKeys.all, 'tills'], posKeys.summary()) }),
    closeRegister: useMutation({ mutationFn: posService.closeRegister, onSuccess: () => refresh(posKeys.register(), posKeys.zReport(), [...posKeys.all, 'tills'], posKeys.summary()) }),
    cashDrop: useMutation({ mutationFn: posService.cashDrop, onSuccess: () => refresh(posKeys.register(), posKeys.zReport()) }),
    createTill: useMutation({ mutationFn: posService.createTill, onSuccess: () => refresh([...posKeys.all, 'tills'], posKeys.summary()) }),
    // Never paused offline: a failed attempt is what moves the sale into the offline queue.
    completeSale: useMutation({ mutationFn: (body: NewSaleInput) => posService.completeSale(body), onSuccess: afterSale, networkMode: 'always' }),
    refundSale: useMutation({
      mutationFn: ({ id, ...body }: Parameters<typeof posService.refundSale>[1] & { id: string }) => posService.refundSale(id, body),
      onSuccess: (sale) => {
        queryClient.setQueryData(posKeys.sale(sale.id), sale);
        afterSale();
      },
    }),
    holdSale: useMutation({ mutationFn: posService.holdSale, onSuccess: () => refresh([...posKeys.all, 'held']) }),
    deleteHeldSale: useMutation({ mutationFn: posService.deleteHeldSale, onSuccess: () => refresh([...posKeys.all, 'held']) }),
    setKitchenStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: KitchenStatus }) => posService.setKitchenStatus(id, status),
      onSuccess: () => refresh([...posKeys.all, 'kitchen'], ['business-orders']),
    }),
    adjustStock: useMutation({
      mutationFn: ({ productId, quantity, reason }: { productId: string; quantity: number; reason?: string }) =>
        posService.adjustStock(productId, { quantity, reason }),
      onSuccess: () => refresh(['catalogue-items']),
    }),
    setStaffPin: useMutation({
      mutationFn: ({ userId, pin, isSupervisor }: { userId: string; pin: string; isSupervisor?: boolean }) =>
        posService.setStaffPin(userId, { pin, isSupervisor }),
      onSuccess: () => refresh(posKeys.staffPins()),
    }),
    removeStaffPin: useMutation({ mutationFn: posService.removeStaffPin, onSuccess: () => refresh(posKeys.staffPins()) }),
  };
}
