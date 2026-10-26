import { hasApiConfig } from '../services/api/client';
import { money, personName, type PosSale, type PosTill } from '../services/posService';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { usePosOffline } from '../context/PosOfflineContext';
import { useProfile } from '../context/ProfileContext';
import { useMyBusiness } from '../hooks/business/useMyBusiness';
import {
  useHeldSales,
  useKitchenStream,
  usePosBranchSummary,
  usePosMutations,
  usePosTills,
  useRegisterStatus,
  useZReport,
} from '../hooks/business/usePos';
import { formatNaira } from '../utils/format';

/**
 * Live POS state shared by the POS screens: the open register session and its
 * till, today's takings, the kitchen stream, held tickets and the offline
 * queue, plus the labels the screens repeat.
 */

export const naira = (value?: number | null) => (value == null ? '—' : formatNaira(value));

export const METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Bank Transfer',
  bank_transfer: 'Bank Transfer',
  one_tap: 'One-Tap',
  wallet: 'Wallet',
  split: 'Split',
  voucher: 'Voucher',
  points: 'Loyalty Points',
};

export const methodLabel = (method?: string | null) =>
  method ? (METHOD_LABEL[method] ?? method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, ' ')) : '—';

/** "09:42 AM" */
export const timeLabel = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

/** "Today, 09:42 AM" / "Oct 14, 09:42 AM" */
export const whenLabel = (iso?: string | null) => {
  if (!iso) return '—';
  const at = new Date(iso);
  const day =
    at.toDateString() === new Date().toDateString()
      ? 'Today'
      : at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${day}, ${timeLabel(iso)}`;
};

export const TILL_STATUS_LABEL: Record<PosTill['status'], string> = {
  active: 'Active',
  idle: 'Idle',
  offline: 'Offline',
  disabled: 'Disabled',
};

/** "Counter · ₦12,000 today · Ada O. signed in" */
export const tillMeta = (till: PosTill) =>
  [
    till.deviceLabel || till.code,
    `${naira(money(till.todaySales))} today`,
    till.occupant ? `${till.occupant.cashierName ?? 'Cashier'} signed in` : 'No one signed in',
  ]
    .filter(Boolean)
    .join(' · ');

export const saleCustomer = (sale: PosSale) => sale.customerName || personName(sale.customer);

export const saleItemsLine = (sale: PosSale) =>
  (sale.items ?? [])
    .map((item) => `${item.productName ?? 'Item'} ×${item.quantity}`)
    .join(' • ') || `${sale.itemCount ?? 0} items`;

export const SALE_STATUS_LABEL: Record<string, string> = {
  completed: 'Paid',
  refunded: 'Refunded',
  partial_refund: 'Part refunded',
  voided: 'Voided',
};

export const saleStatusLabel = (sale: PosSale) => SALE_STATUS_LABEL[sale.status] ?? sale.status;

/** The till, register session and today's figures for the POS home and drawer. */
export function useLivePos() {
  const live = hasApiConfig();
  const { branch, activeBranchId } = useBusinessBranch();
  const profile = useProfile();
  const business = useMyBusiness();
  const register = useRegisterStatus();
  const tills = usePosTills();
  const summary = usePosBranchSummary();
  const session = register.data?.isOpen ? (register.data.session ?? null) : null;
  const zReport = useZReport(Boolean(session));
  const kitchen = useKitchenStream();
  const held = useHeldSales();
  const offline = usePosOffline();
  const mutations = usePosMutations();

  const branchSummary =
    (summary.data ?? []).find((row) => row.branchId === activeBranchId) ?? (summary.data ?? []).find((row) => row.current);
  const till = session?.till ?? (session?.tillId ? (tills.data ?? []).find((row) => row.id === session.tillId) : null) ?? null;
  const todaySales = money(branchSummary?.todaySales);
  const todayCount = branchSummary?.todayTransactions ?? 0;
  const breakdown = Object.entries(zReport.data?.paymentBreakdown ?? {}).map(([method, amount]) => ({
    method,
    label: methodLabel(method),
    amount: money(amount),
  }));
  const breakdownTotal = breakdown.reduce((sum, row) => sum + row.amount, 0);

  /** Opens the register on a till — the given one, the first usable one, or a new "Till 01". */
  const openOnTill = async (tillId?: string) => {
    let id = tillId ?? (tills.data ?? []).find((row) => row.status !== 'disabled' && !row.occupant)?.id;
    if (!id) {
      if (!activeBranchId) throw new Error('Pick a branch first.');
      id = (await mutations.createTill.mutateAsync({ branchId: activeBranchId, name: 'Till 01' })).id;
    }
    return mutations.openRegister.mutateAsync({ openingCash: 0, tillId: id });
  };

  return {
    live,
    openOnTill,
    branchName: branch.name,
    branchArea: branch.area,
    businessName: business.data?.name ?? '—',
    cashierName: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—',
    register,
    session,
    isOpen: Boolean(session),
    tillName: till?.name ?? '—',
    tills: tills.data ?? [],
    tillsLoaded: tills.isSuccess,
    zReport: zReport.data,
    todaySales,
    todayCount,
    averageTicket: todayCount ? todaySales / todayCount : 0,
    breakdown: breakdown
      .sort((a, b) => b.amount - a.amount)
      .map((row) => ({ ...row, share: breakdownTotal ? Math.round((row.amount / breakdownTotal) * 1000) / 10 : 0 })),
    kitchen: kitchen.data,
    heldCount: held.data?.length ?? 0,
    offline,
    mutations,
    error: register.error ?? tills.error ?? summary.error,
  };
}

export type LivePos = ReturnType<typeof useLivePos>;
