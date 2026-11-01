import { Icon } from '../ui/Icon';
import { Skeleton, SkeletonGroup } from '../ui/Skeleton';
import { pickSearchResult } from '../../utils/appEvents';
import type { SearchBusinessResult, SearchDealResult } from '../../hooks/usePublicSearch';

const naira = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

/**
 * Live search results (deals + businesses) for the desktop navbar dropdown and
 * the mobile home page. Picking a result fires SEARCH_PICK_EVENT for the router.
 */
export function SearchResults({
  query,
  deals,
  businesses,
  loading,
  error,
  onPicked,
}: {
  query: string;
  deals: SearchDealResult[];
  businesses: SearchBusinessResult[];
  loading: boolean;
  error: string | null;
  onPicked?: () => void;
}) {
  const pick = (action: () => void) => {
    action();
    onPicked?.();
  };

  if (loading) {
    return (
      <SkeletonGroup label="Searching" className="p-space-sm space-y-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </SkeletonGroup>
    );
  }
  if (error) return <p role="alert" className="p-space-md font-body-md text-body-md text-error">{error}</p>;
  if (deals.length === 0 && businesses.length === 0) {
    return <p className="p-space-md font-body-md text-body-md text-text-secondary">No deals or businesses match “{query}”.</p>;
  }

  return (
    <div className="py-space-xs" aria-label="Search results">
      {businesses.length > 0 ? (
        <div>
          <p className="px-space-md pt-space-xs pb-1 font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary">Businesses</p>
          {businesses.map((business) => (
            <button
              key={business.code}
              type="button"
              onClick={() => pick(() => pickSearchResult({ kind: 'business', code: business.code, id: business.id, name: business.name }))}
              className="w-full flex items-center gap-3 px-space-md py-2 text-left hover:bg-surface-subtle focus:bg-surface-subtle outline-none"
            >
              <span className="w-10 h-10 rounded-xl bg-surface-tint-blue overflow-hidden flex items-center justify-center shrink-0">
                {business.logo ? <img className="w-full h-full object-cover" alt="" src={business.logo} /> : <Icon name="storefront" className="text-primary text-[20px]" />}
              </span>
              <span className="min-w-0">
                <span className="block font-label-md text-label-md text-text-primary font-semibold truncate">{business.name}</span>
                {business.meta ? <span className="block font-caption text-caption text-text-secondary truncate">{business.meta}</span> : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {deals.length > 0 ? (
        <div>
          <p className="px-space-md pt-space-xs pb-1 font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary">Deals</p>
          {deals.map((deal) => (
            <button
              key={deal.id}
              type="button"
              onClick={() =>
                pick(() =>
                  pickSearchResult({
                    kind: 'deal',
                    deal: {
                      id: deal.id,
                      title: deal.title,
                      business: deal.business,
                      location: deal.location,
                      price: deal.price || undefined,
                      oldPrice: deal.oldPrice || undefined,
                      discountLabel: deal.discount,
                      image: deal.image,
                    },
                  }),
                )
              }
              className="w-full flex items-center gap-3 px-space-md py-2 text-left hover:bg-surface-subtle focus:bg-surface-subtle outline-none"
            >
              <img className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0" alt="" src={deal.image} />
              <span className="min-w-0 flex-1">
                <span className="block font-label-md text-label-md text-text-primary font-semibold truncate">{deal.title}</span>
                <span className="block font-caption text-caption text-text-secondary truncate">{[deal.business, deal.location].filter(Boolean).join(' · ')}</span>
              </span>
              <span className="text-right shrink-0">
                <span className="block font-caption text-caption font-bold text-badge-discount-text">{deal.discount}</span>
                {deal.price > 0 ? <span className="block font-label-sm text-label-sm text-text-primary font-semibold">{naira(deal.price)}</span> : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => pick(() => pickSearchResult({ kind: 'all-deals', query }))}
        className="w-full flex items-center justify-between px-space-md py-2.5 mt-1 border-t border-border-subtle font-label-md text-label-md text-primary font-semibold hover:bg-surface-subtle"
      >
        See all deals for “{query}”
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>
    </div>
  );
}
