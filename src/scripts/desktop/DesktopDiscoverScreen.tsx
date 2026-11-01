import { useEffect, useState } from 'react';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { Icon } from '../../components/ui/Icon';
import { useLocation } from '../../context/LocationContext';
import { useHomeDealCategories } from '../../hooks/useHomeDealCategories';
import { useDealFilters } from '../../context/DealFiltersContext';
import { useDiscoverBusinesses } from '../../hooks/useDiscoverBusinesses';
import { Skeleton } from '../../components/ui/Skeleton';
import { toDiscoverCard, type BusinessCard } from '../discoverData';

interface DesktopDiscoverScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  onOpenBusiness: (business: BusinessCard) => void;
  onBusinessSetup: () => void;
}

export function DesktopDiscoverScreen({ onNav, onOpenFilters, onOpenBusiness, onBusinessSetup }: DesktopDiscoverScreenProps) {
  // Live business categories (GET /categories); the chosen one filters the businesses.
  const { categories } = useHomeDealCategories();
  // Shared with the Filters screen, so the chips and filters always agree.
  const { filters: dealFilters, setFilters, narrowed } = useDealFilters();
  const categoryId = dealFilters.categoryId;
  const setCategoryId = (id: string | null) => setFilters({ categoryId: id });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  // Live businesses near the customer (GET /public/businesses + live deal counts).
  const discover = useDiscoverBusinesses({ categoryId, search });
  const businessCards: BusinessCard[] = discover.businesses.map(toDiscoverCard);
  const activeCategory = categories.find((item) => item.id === categoryId);
  const emptyText = narrowed
    ? 'No businesses have deals matching your filters.'
    : search
    ? `No businesses match “${search}”${activeCategory?.id ? ` in ${activeCategory.label}` : ''}.`
    : activeCategory?.id
      ? `No businesses in ${activeCategory.label} near you yet.`
      : 'No businesses near you yet.';
  const { district, city, radius } = useLocation();



  return (
    <DesktopPage activeNav="discover" onNav={onNav} withHeader withFooter>
      <section className="w-full px-margin py-space-md bg-surface-canvas shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Businesses Near You</h1>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                aria-label="Filter businesses"
                onClick={onOpenFilters}
                className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-text-secondary active:scale-95 transition-transform shadow-sm"
              >
                <Icon name="tune" className="text-[20px]" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <button
              type="button"
              className="inline-flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-tint-blue text-primary-container active:opacity-80 transition-opacity"
            >
              <Icon name="location_on" className="text-[18px]" />
              <span className="font-label-md text-label-md font-semibold">{district}, {city}</span>
              <Icon name="keyboard_arrow_down" className="text-[16px]" />
            </button>
            <div className="flex items-center gap-1 text-text-tertiary">
              <Icon name="radar" className="text-[14px]" />
              <span className="font-caption text-caption">Within {radius} km radius</span>
            </div>
          </div>

          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-text-tertiary">
              <Icon name="search" className="text-[20px]" />
            </div>
            <input
              type="search"
              placeholder="Search businesses, foods, salons..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                aria-label="Search businesses"
              className="w-full h-12 pl-11 pr-space-md rounded-xl bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:bg-surface-canvas shadow-sm transition-all"
            />
          </div>
        </div>
      </section>

      <div className="w-full py-space-sm bg-surface-canvas shadow-sm">
        <div className="max-w-7xl mx-auto px-margin flex items-center gap-space-xs overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((item) => (
            <button
              key={item.id ?? 'all'}
              type="button"
              aria-pressed={categoryId === item.id}
                  onClick={() => setCategoryId(item.id)}
              className={`shrink-0 h-9 px-4 rounded-full font-label-md text-label-md transition-all flex items-center justify-center ${
                categoryId === item.id
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="w-full px-margin py-space-md">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
          <div className="flex items-center justify-between text-text-secondary pt-space-xs">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
              {discover.loading ? 'Loading businesses…' : businessCards.length > 0 ? `Spotlight Discoveries (${businessCards.length})` : 'Spotlight Discoveries'}
            </span>
            <span className="font-caption text-caption text-text-tertiary">Real-time Perks</span>
          </div>

          {discover.loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-md">{Array.from({ length: 6 }, (_, key) => (
                <div key={key} role="status" aria-busy="true" className="w-full bg-surface-canvas rounded-2xl overflow-hidden shadow-sm">
                  <span className="sr-only">Loading businesses</span>
                  <Skeleton className="w-full aspect-[16/9] rounded-none" />
                  <div className="p-space-md space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-8 w-full rounded-xl" />
                  </div>
                </div>
              ))}</div>
            ) : businessCards.length === 0 ? (
            <div className="w-full rounded-2xl border border-dashed border-outline-variant bg-surface-canvas p-space-xl text-center shadow-sm">
              <div className="w-14 h-14 mx-auto mb-space-sm rounded-full bg-surface-subtle flex items-center justify-center">
                <Icon name="travel_explore" className="text-[28px] text-primary-container" />
              </div>
              <h2 className="font-heading-sm text-heading-sm text-on-surface">{discover.error ? 'Couldn’t load businesses' : 'No live businesses yet'}</h2>
              <p className="mt-space-xs font-body-md text-body-md text-text-secondary max-w-sm mx-auto">
                {discover.error ?? emptyText}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-md">
              {businessCards.map((card, index) => (
                <article
                  key={`${card.name}-${index}`}
                  role="button"
                  onClick={() => onOpenBusiness(card)}
                  className="w-full bg-surface-canvas rounded-2xl overflow-hidden shadow-sm flex flex-col active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/9] bg-surface-container overflow-hidden">
                    <img className="w-full h-full object-cover" alt={card.alt} src={card.image} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {card.badge ? (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-surface-canvas/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                      <Icon name={card.badgeIcon} className="text-[15px] text-primary-container" filled />
                      <span className="font-caption text-caption font-semibold text-text-primary">{card.badge}</span>
                    </div>
                    ) : null}
                    {card.rating ? (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-on-primary">
                      <Icon name="star" className="text-[16px] text-amber-400" filled />
                      <span className="font-label-sm text-label-sm font-bold">{card.rating}</span>
                      <span className="font-caption text-caption opacity-90">{card.reviews}</span>
                    </div>
                    ) : null}
                  </div>
                  <div className="p-space-md flex flex-col gap-space-xs">
                    <div className="flex items-start justify-between gap-space-xs">
                      <div className="min-w-0 flex-1">
                        <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{card.name}</h2>
                        <p className="font-caption text-caption text-text-secondary mt-0.5">{card.kind}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary shrink-0">
                        <Icon name="arrow_forward" className="text-[18px]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Icon name="near_me" className="text-[16px] text-primary" />
                      <span className="font-caption text-caption text-text-secondary">{card.distance || 'Location not set'}</span>
                    </div>
                    <div className="mt-space-2xs pt-space-xs">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-badge-discount-bg text-badge-discount-text shadow-sm w-full">
                        <Icon name="local_offer" className="text-[18px]" />
                        <span className="font-label-sm text-label-sm font-semibold truncate">{card.deals}</span>
                        <Icon name="bolt" className="text-[16px] ml-auto" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="pt-space-md pb-space-lg flex flex-col items-center justify-center text-center">
            <p className="font-caption text-caption text-text-secondary">Own a local store or clinic?</p>
            <button
              type="button"
              onClick={onBusinessSetup}
              className="font-label-md text-label-md font-semibold text-primary-container inline-flex items-center gap-1 mt-1 hover:underline"
            >
              <span>Set up your business on VEMTAP</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </div>
        </div>
      </section>
    </DesktopPage>
  );
}
