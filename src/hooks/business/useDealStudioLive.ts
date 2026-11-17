import { createContext, useContext } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import {
  DEFAULT_BUNDLE_CATALOG,
  type ComboProduct,
  type DealStudioDraft,
} from '../../scripts/deals/dealStudioShared';
import { useCatalogueItems } from './useCatalogueItems';

/** The catalogue item the live deal is built on, for the Deal Studio steps. */
export const DealSourceContext = createContext<CatalogueItem | null>(null);

export const useDealSource = () => useContext(DealSourceContext);

export interface DealBranchOption {
  id: string;
  name: string;
  area: string;
  /** False when the deal's item isn't sold at this branch (the API would refuse it). */
  sellsItem: boolean;
}

/**
 * The branches a deal can run at, defaulting to the active one. An item that
 * lists its branches limits the choice to where it's sold.
 */
export function pickDealBranchIds(
  studio: Pick<DealStudioDraft, 'branchIds'>,
  options: DealBranchOption[],
  activeBranchId?: string,
) {
  const allowed = options.filter((option) => option.sellsItem).map((option) => option.id);
  const chosen = (studio.branchIds ?? []).filter((id) => allowed.includes(id));
  if (chosen.length) return chosen;
  if (activeBranchId && allowed.includes(activeBranchId)) return [activeBranchId];
  return allowed.slice(0, 1);
}

/** The business's live branches as deal choices. `source` defaults to the Deal Studio's item. */
export function useDealBranchOptions(sourceOverride?: CatalogueItem | null) {
  const live = hasApiConfig();
  const { branches, activeBranchId } = useBusinessBranch();
  const contextSource = useDealSource();
  const source = sourceOverride === undefined ? contextSource : sourceOverride;
  const soldAt = source?.branches?.length ? new Set(source.branches.map((branch) => branch.id)) : null;
  const options: DealBranchOption[] = live
    ? branches
        .filter((branch): branch is typeof branch & { id: string } => Boolean(branch.id))
        .map((branch) => ({
          id: branch.id,
          name: branch.name,
          area: branch.area,
          sellsItem: soldAt ? soldAt.has(branch.id) : true,
        }))
    : [];
  return { live, options, activeBranchId };
}

/** Live branch choices for the deal plus the ones it currently runs at. Empty in demo mode. */
export function useDealBranches(studio: Pick<DealStudioDraft, 'branchIds'>) {
  const { live, options, activeBranchId } = useDealBranchOptions();
  const selectedIds = live ? pickDealBranchIds(studio, options, activeBranchId) : [];
  const selected = options.filter((option) => selectedIds.includes(option.id));
  /** The studio patch that turns `id` on or off (the last branch can't be turned off). */
  const toggle = (id: string): Partial<DealStudioDraft> => {
    const next = selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id];
    return { branchIds: next.length ? next : selectedIds };
  };
  return { live, options, selectedIds, selected, toggle, activeBranchId };
}

/**
 * Items a combo can pair with the deal's item (`current`): the business's
 * active catalogue live, the sample menu in demo mode.
 */
export function useDealBundleCatalog(title: string, basePrice: number, sourceOverride?: CatalogueItem | null): ComboProduct[] {
  const live = hasApiConfig();
  const contextSource = useDealSource();
  const source = sourceOverride === undefined ? contextSource : sourceOverride;
  const products = useCatalogueItems('product');
  const services = useCatalogueItems('service');
  const current: ComboProduct = { id: 'current', name: title, price: basePrice };
  if (!live) return [current, ...DEFAULT_BUNDLE_CATALOG];
  const others = [...(products.data ?? []), ...(services.data ?? [])]
    .filter((item) => item.id !== source?.id && item.status === 'active' && !item.isSuspended)
    .map((item) => ({ id: item.id, name: item.name, price: toPrice(item.price ?? undefined) ?? 0 }))
    .filter((item) => item.price > 0);
  return [current, ...others];
}
