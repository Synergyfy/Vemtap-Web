import { useEffect, useMemo, useState } from 'react';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useBusinessCustomers } from './useBusinessCustomers';
import { useCatalogueItemMutations, useCatalogueItems } from './useCatalogueItems';
import { useLoyaltyLogs, useLoyaltyMutations } from './useLoyalty';
import type { CustomerCard } from '../../services/businessCustomersService';
import type { CatalogueItem } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { whenLabel } from '../../scripts/customersLive';
import { logEntry } from '../../scripts/loyaltyLive';

/**
 * Live data for the Rewards hub (desktop and mobile): the customer points desk,
 * points per product/service, and the points ledger. Both screens map these
 * rows into the same layout; every action goes to the API.
 */

/** Tiers come from the points balance (`GET /business-customers`), highest first. */
export const LOYALTY_TIERS = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'] as const;
export type LoyaltyTierFilter = 'all' | (typeof LOYALTY_TIERS)[number];

/** Badge colours per tier, top tiers in purple. */
export const tierBadgeClass = (tier: string) =>
  tier === 'Diamond' || tier === 'Platinum'
    ? 'bg-purple-100 text-purple-700'
    : tier === 'Gold'
      ? 'bg-amber-100 text-amber-800'
      : tier === 'Silver'
        ? 'bg-slate-200 text-slate-700'
        : 'bg-orange-100 text-orange-800';

export interface DeskMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: string;
  points: number;
  totalSpent: number;
  lastVisit: string;
}

export interface DeskItem {
  id: string;
  name: string;
  type: 'product' | 'service';
  category: string;
  price: number;
  points: number;
}

export interface DeskTransaction {
  id: string;
  memberName: string;
  points: number;
  reason: string;
  date: string;
  branch: string;
}

const toMember = (row: CustomerCard): DeskMember => ({
  id: row.userId,
  name: row.name || row.phone || row.email || 'Customer',
  phone: row.phone ?? row.email ?? '',
  email: row.email ?? undefined,
  tier: row.tier || 'Bronze',
  points: Number(row.pointsBalance) || 0,
  totalSpent: Number(row.spend) || 0,
  lastVisit: whenLabel(row.lastSeenAt) || '—',
});

const toItem = (item: CatalogueItem): DeskItem => ({
  id: item.id,
  name: item.name,
  type: item.itemType === 'service' ? 'service' : 'product',
  category: item.category?.name ?? (item.itemType === 'service' ? 'Service' : 'Product'),
  price: Number(item.price) || 0,
  points: Number(item.loyaltyPointsValue) || 0,
});

/** "0803 456 7890" / "+234 803…" → "+2348034567890", the shape sign-up saves. */
export const nigerianPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return `+234${digits.startsWith('234') ? digits.slice(3) : digits.replace(/^0/, '')}`;
};

export function useLoyaltyDesk() {
  const { activeBranchId } = useBusinessBranch();
  const [memberSearch, setMemberSearch] = useState('');
  const [search, setSearch] = useState('');

  // Typing searches the API after a short pause, not on every key.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(memberSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [memberSearch]);

  const customers = useBusinessCustomers({ search: search || undefined, sort: 'recent', page: 1, limit: 100 });
  const products = useCatalogueItems('product');
  const services = useCatalogueItems('service');
  const logs = useLoyaltyLogs();
  const { givePoints, deductPoints, registerCustomer } = useLoyaltyMutations();
  const { update } = useCatalogueItemMutations();

  const members = useMemo(() => (customers.data?.data ?? []).map(toMember), [customers.data]);
  const items = useMemo(
    () => [...(products.data ?? []), ...(services.data ?? [])].map(toItem),
    [products.data, services.data],
  );
  const transactions = useMemo<DeskTransaction[]>(
    () =>
      (logs.data ?? []).map((log) => {
        const entry = logEntry(log);
        const points = Math.abs(Number(log.amount) || 0);
        return {
          id: log.id,
          memberName: entry.member,
          points: entry.positive ? points : -points,
          reason: entry.reason,
          date: entry.date,
          branch: entry.branch,
        };
      }),
    [logs.data],
  );

  const needBranch = () => {
    if (!activeBranchId) throw new Error('Your branch is still loading. Try again in a moment.');
    return activeBranchId;
  };

  /** Give (+) or deduct (−) points; resolves with the toast message. */
  const adjustPoints = async (member: DeskMember, mode: 'award' | 'deduct', points: number, reason: string) => {
    const branchId = needBranch();
    const input = { customerId: member.id, branchId, points, reason };
    if (mode === 'award') await givePoints.mutateAsync(input);
    else await deductPoints.mutateAsync(input);
    return `${mode === 'award' ? 'Gave' : 'Deducted'} ${points.toLocaleString('en-US')} pts ${mode === 'award' ? 'to' : 'from'} ${member.name}`;
  };

  /** "Add Customer": found by email/phone or created; welcome points awarded. Resolves with the toast message. */
  const addCustomer = async (details: { name: string; phone: string; email: string; welcomePoints: number }) => {
    const branchId = needBranch();
    const [firstName, ...rest] = details.name.trim().split(/\s+/);
    const phone = nigerianPhone(details.phone);
    if (!firstName || phone.length < 8) throw new Error('Enter the customer’s name and a valid phone number.');
    const created = await registerCustomer.mutateAsync({
      firstName,
      lastName: rest.join(' ') || undefined,
      phone,
      email: details.email.trim() || undefined,
      welcomePoints: details.welcomePoints > 0 ? details.welcomePoints : undefined,
      branchId,
    });
    const bonus = details.welcomePoints > 0 ? ` (+${details.welcomePoints.toLocaleString('en-US')} welcome pts)` : '';
    return `${created.isNewCustomer ? 'Added' : 'Welcomed back'} ${created.name}${bonus}`;
  };

  /** Points one item earns. */
  const setItemPoints = (id: string, points: number) =>
    update.mutateAsync({ id, input: { loyaltyPointsValue: Math.max(0, Math.round(points)) } });

  /** Same points on every product, service, or both; resolves with the toast message. */
  const bulkAssign = async (target: 'all' | 'product' | 'service', points: number) => {
    const value = Math.max(0, Math.round(points));
    const chosen = items.filter((item) => (target === 'all' || item.type === target) && item.points !== value);
    const results = await Promise.allSettled(chosen.map((item) => setItemPoints(item.id, value)));
    const failed = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (failed.length) {
      throw new Error(`${failed.length} of ${chosen.length} items couldn't be updated. ${apiErrorMessage(failed[0].reason, 'Please try again.')}`);
    }
    const what = target === 'all' ? 'all products & services' : `all ${target}s`;
    return `${value.toLocaleString('en-US')} points set on ${what}`;
  };

  return {
    memberSearch,
    setMemberSearch,
    members,
    totalMembers: customers.data?.total ?? members.length,
    membersLoading: customers.isLoading,
    membersError: customers.error,
    items,
    itemsLoading: products.isLoading || services.isLoading,
    itemsError: products.error ?? services.error,
    transactions,
    transactionsLoading: logs.isLoading,
    adjustPoints,
    adjusting: givePoints.isPending || deductPoints.isPending,
    addCustomer,
    adding: registerCustomer.isPending,
    setItemPoints,
    bulkAssign,
  };
}
