import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { useLocation } from '../context/LocationContext';
import { useHomeDealCategories } from '../hooks/useHomeDealCategories';
import { useDealFilters } from '../context/DealFiltersContext';
import { useDiscoverBusinesses } from '../hooks/useDiscoverBusinesses';
import { Skeleton } from '../components/ui/Skeleton';

interface DiscoverScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenBusiness: (business: BusinessCard) => void;
  onOpenFilters: () => void;
  onOpenNotifications: () => void;
  onBusinessSetup: () => void;
  onOpenLocation?: () => void;
}

import { toDiscoverCard, type BusinessCard } from './discoverData';

export function DiscoverScreen({ onTab, onOpenBusiness, onOpenFilters, onOpenNotifications, onBusinessSetup, onOpenLocation }: DiscoverScreenProps) {
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
  const [toast, setToast] = useState<string | null>(null);
  const { district, city, radius } = useLocation();
  const toastTimers = useRef<number[]>([]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);


  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };


  const openCard = (index: number) => {
    const card = businessCards[index];
    if (!card || !card.name) return;

    const normalized = card.name.toLowerCase();
    const isSpa = card.venue === 'spa' || normalized.includes('spa') || normalized.includes('serenity') || normalized.includes('glow');
    const isUrban = card.venue === 'urban' || normalized.includes('grill') || normalized.includes('bistro') || normalized.includes('restaurant');

    if (!isSpa && !isUrban && normalized.trim() !== '') {
      onOpenBusiness(card);
      return;
    }

    onOpenBusiness(card);
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <span className="font-heading-sm text-heading-sm text-on-surface tracking-tight">Discover</span>
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Notifications"
              type="button"
              onClick={onOpenNotifications}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-variant/40 transition-colors"
            >
              <Icon name="notifications" className="text-on-surface-variant text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative w-full pt-14 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="px-margin pt-space-xs pb-space-sm flex flex-col gap-space-sm bg-surface-canvas shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Businesses Near You</h1>
              <div className="flex items-center gap-space-xs">
                <button
                  aria-label="Filter businesses"
                  type="button"
                  onClick={onOpenFilters}
                  className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-text-secondary active:scale-95 transition-transform shadow-sm"
                >
                  <Icon name="tune" className="text-[20px]" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (onOpenLocation) onOpenLocation();
                  else showToast('Location picker coming soon');
                }}
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

            <div className="relative w-full">
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

          <div className="w-full py-space-sm bg-surface-canvas">
            <div className="flex items-center gap-space-xs px-margin overflow-x-auto no-scrollbar scroll-smooth">
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

          <div className="flex flex-col gap-space-md px-margin pt-space-xs pb-space-lg">
            <div className="flex items-center justify-between text-text-secondary pt-space-xs">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                {discover.loading ? 'Loading businesses…' : businessCards.length > 0 ? `Spotlight Discoveries (${businessCards.length})` : 'Spotlight Discoveries'}
              </span>
              <span className="font-caption text-caption text-text-tertiary">Real-time Perks</span>
            </div>

            {discover.loading ? (
              Array.from({ length: 3 }, (_, key) => (
                <div key={key} role="status" aria-busy="true" className="w-full bg-surface-canvas rounded-2xl overflow-hidden shadow-sm">
                  <span className="sr-only">Loading businesses</span>
                  <Skeleton className="w-full aspect-[16/9] rounded-none" />
                  <div className="p-space-md space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-8 w-full rounded-xl" />
                  </div>
                </div>
              ))
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
              businessCards.map((card, index) => (
                <article
                  key={`${card.name}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCard(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openCard(index);
                    }
                  }}
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
              ))
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
        </div>
      </main>

      <MobileTabBar active="discover" onTab={onTab} />

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
