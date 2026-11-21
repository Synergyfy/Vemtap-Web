import { createContext, useContext } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { firstUsableItemImage } from '../../scripts/catalogueLive';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import type { ComboProduct, DealStudioDraft } from '../../scripts/deals/dealStudioShared';
import { useCatalogueItems } from './useCatalogueItems';

/** The primary live catalogue product the current deal is built around. */
export const DealSourceContext = createContext<CatalogueItem | null>(null);

export const useDealSource = () => useContext(DealSourceContext);

export interface DealBranchOption {
  id: string;
  name: string;
  area: string;
  /** False when any selected product isn't sold at this branch (the API would refuse it). */
  sellsItem: boolean;
}

type DealSourceInput = CatalogueItem | CatalogueItem[] | null | undefined;

const sourceList = (source: DealSourceInput): CatalogueItem[] => {
  if (!source) return [];
  return Array.isArray(source) ? source.filter(Boolean) : [source];
};

/**
 * The branches a deal can run at. When products are selected, only branches
 * that sell every selected product stay available.
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

/** Live products only — services are deliberately excluded in product-only mode. */
export function useDealProductCatalog() {
  const query = useCatalogueItems('product');
  const products = (query.data ?? []).filter((item) => item.status === 'active' && !item.isSuspended);
  const catalog: ComboProduct[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    price: toPrice(item.price ?? undefined) ?? 0,
    image: firstUsableItemImage(item),
  }));
  return {
    live: hasApiConfig(),
    products,
    catalog,
    loading: query.isLoading,
    error: query.error,
  };
}

/** Selected live catalogue products, in the order the merchant picked them. */
export function useDealSelectedProducts(productIds: string[], allProducts?: CatalogueItem[]) {
  const fallback = useDealProductCatalog();
  const products = allProducts ?? fallback.products;
  const byId = new Map(products.map((item) => [item.id, item]));
  return productIds.map((id) => byId.get(id)).filter((item): item is CatalogueItem => Boolean(item));
}

/** The business's configured branches as deal choices. */
export function useDealBranchOptions(sourceOverride?: DealSourceInput) {
  const { branches, activeBranchId } = useBusinessBranch();
  const contextSource = useDealSource();
  const sources = sourceOverride === undefined ? sourceList(contextSource) : sourceList(sourceOverride);
  const soldAtSets = sources
    .map((source) => (source.branches?.length ? new Set(source.branches.map((branch) => branch.id)) : null))
    .filter((set): set is Set<string> => Boolean(set));
  const soldAt = soldAtSets.length
    ? soldAtSets.reduce((intersection, set) => new Set([...intersection].filter((id) => set.has(id))))
    : null;
  const options: DealBranchOption[] = branches
    .filter((branch) => Boolean(branch.id || branch.key))
    .map((branch) => ({
      id: (branch.id || branch.key) as string,
      name: branch.name,
      area: branch.area || 'No address on file',
      sellsItem: soldAt && branch.id ? soldAt.has(branch.id) : true,
    }));
  return { live: hasApiConfig(), options, activeBranchId };
}

/** Configured branch choices for the deal plus the ones it currently runs at. */
export function useDealBranches(
  studio: Pick<DealStudioDraft, 'branchIds'>,
  sourceOverride?: DealSourceInput,
) {
  const { live, options, activeBranchId } = useDealBranchOptions(sourceOverride);
  const selectedIds = pickDealBranchIds(studio, options, activeBranchId);
  const selected = options.filter((option) => selectedIds.includes(option.id));
  /** The studio patch that turns `id` on or off (the last branch can't be turned off). */
  const toggle = (id: string): Partial<DealStudioDraft> => {
    const next = selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id];
    return { branchIds: next.length ? next : selectedIds };
  };
  return { live, options, selectedIds, selected, toggle, activeBranchId };
}

/** Kept for older callers: live products only, with no synthetic source entry. */
export function useDealBundleCatalog(_title: string, _basePrice: number, sourceOverride?: CatalogueItem | null): ComboProduct[] {
  const { catalog } = useDealProductCatalog();
  const contextSource = useDealSource();
  const source = sourceOverride === undefined ? contextSource : sourceOverride;
  return source?.id ? catalog.filter((product) => product.id !== source.id) : catalog;
}
