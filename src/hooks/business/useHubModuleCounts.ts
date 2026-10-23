import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { catalogueService } from '../../services/catalogueService';
import { catalogueItemsService } from '../../services/catalogueItemsService';
import { businessCustomersService } from '../../services/businessCustomersService';
import { branchService } from '../../services/branchService';
import { teamService } from '../../services/teamService';
import { verificationService } from '../../services/verificationService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

export type HubModuleCountKey = 'deals' | 'catalog' | 'customers' | 'team' | 'locations' | 'verification';

/**
 * Live chip labels for the Business Hub module cards. Each module is one
 * cached query; a module whose query has not answered yet (or failed) is left
 * out, so the card falls back to its own demo label. Empty outside live mode.
 */
export function useHubModuleCounts(): Partial<Record<HubModuleCountKey, string>> {
  const live = hasApiConfig();
  const { activeBranchId } = useBusinessBranch();
  const opts = { enabled: live, staleTime: 60_000 };

  const deals = useQuery({
    queryKey: ['hub-counts', 'deals', activeBranchId ?? 'all'],
    queryFn: () => catalogueService.getOfferSummary(activeBranchId ? { branchId: activeBranchId } : undefined),
    ...opts,
  });
  const items = useQuery({
    queryKey: ['hub-counts', 'catalog', activeBranchId ?? 'all'],
    queryFn: () => catalogueItemsService.list({ branchId: activeBranchId ?? undefined, limit: 500 }),
    ...opts,
  });
  const customers = useQuery({
    queryKey: ['hub-counts', 'customers'],
    queryFn: () => businessCustomersService.list({ page: 1, limit: 1 }),
    ...opts,
  });
  const team = useQuery({ queryKey: ['hub-counts', 'team'], queryFn: () => teamService.list({ allBranches: true }), ...opts });
  const branches = useQuery({ queryKey: ['hub-counts', 'branches'], queryFn: branchService.list, ...opts });
  const verification = useQuery({ queryKey: ['hub-counts', 'verification'], queryFn: verificationService.status, ...opts });

  if (!live) return {};
  const counts: Partial<Record<HubModuleCountKey, string>> = {};
  if (deals.data) counts.deals = `${Number(deals.data.activeDeals ?? 0)} Active`;
  if (items.data) {
    const services = items.data.filter((item) => item.itemType === 'service').length;
    const products = items.data.length - services;
    counts.catalog = `${products} ${products === 1 ? 'Item' : 'Items'} • ${services} ${services === 1 ? 'Service' : 'Services'}`;
  }
  if (customers.data) counts.customers = `${customers.data.total ?? 0} Customers`;
  if (team.data) counts.team = `${team.data.length} Staff`;
  if (branches.data) {
    const active = branches.data.filter((branch) => branch.isActive !== false).length;
    counts.locations = `${branches.data.length} ${branches.data.length === 1 ? 'Branch' : 'Branches'} (${active} Active)`;
  }
  if (verification.data) counts.verification = verification.data.isVerified ? 'Verified' : 'Not verified';
  return counts;
}

const CARD_COUNT: Record<string, HubModuleCountKey> = {
  deals: 'deals',
  catalog: 'catalog',
  customers: 'customers',
  staff: 'team',
  locations: 'locations',
  profile: 'verification',
};

/**
 * A hub card's chips: in live mode the live count (styled like the card's first
 * demo chip) or nothing, so no invented number is ever shown; demo chips otherwise.
 */
export function hubCardChips<T extends { label: string; chipClass: string }>(
  cardKey: string,
  demoChips: T[],
  counts: Partial<Record<HubModuleCountKey, string>>,
): T[] {
  if (!hasApiConfig()) return demoChips;
  const key = CARD_COUNT[cardKey];
  const label = key ? counts[key] : undefined;
  if (!label || !demoChips[0]) return [];
  return [{ ...demoChips[0], label }];
}
