import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';

interface DiscoverScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenUrban: () => void;
  onOpenSpa: () => void;
  onOpenFilters: () => void;
  onOpenNotifications: () => void;
  onBusinessSetup: () => void;
  onOpenLocation?: () => void;
}

import { BUSINESS_CARDS, DISCOVER_CATEGORIES, buildDiscoverCardsFromOffers, type BusinessCard } from './discoverData';

export function DiscoverScreen({ onTab, onOpenUrban, onOpenSpa, onOpenFilters, onOpenNotifications, onBusinessSetup, onOpenLocation }: DiscoverScreenProps) {
  const [category, setCategory] = useState('All');
  const [mapView, setMapView] = useState(false);
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>(BUSINESS_CARDS);
  const [bookmarked, setBookmarked] = useState<boolean[]>([false, false, false, false]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadOffers = async () => {
      if (!hasApiConfig()) {
        if (!ignore) setBusinessCards(BUSINESS_CARDS);
        return;
      }

      try {
        const response = await catalogueService.getPublicOffers({ page: 1, limit: 4 });
        const rows = Array.isArray(response?.data) ? response.data : [];
        const cards = buildDiscoverCardsFromOffers(rows as Record<string, unknown>[]);
        if (!ignore) setBusinessCards(cards.length > 0 ? cards : BUSINESS_CARDS);
      } catch {
        if (!ignore) setBusinessCards(BUSINESS_CARDS);
      }
    };

    loadOffers();
    return () => { ignore = true; };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  const toggleBookmark = (index: number) =>
    setBookmarked((prev) => prev.map((value, i) => (i === index ? !value : value)));

  const openCard = (index: number) => {
    if (index === 0) onOpenUrban();
    else if (index === 1) onOpenSpa();
    else showToast(businessCards[index]?.name + ' profile is coming soon');
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
                  aria-label="Toggle map view"
                  type="button"
                  onClick={() => setMapView((value) => !value)}
                  className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-text-secondary active:scale-95 transition-transform shadow-sm"
                >
                  <Icon name={mapView ? 'view_agenda' : 'map'} className="text-[20px] text-primary-container" />
                </button>
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
                <span className="font-label-md text-label-md font-semibold">Apo, Abuja</span>
                <Icon name="keyboard_arrow_down" className="text-[16px]" />
              </button>
              <div className="flex items-center gap-1 text-text-tertiary">
                <Icon name="radar" className="text-[14px]" />
                <span className="font-caption text-caption">Within 5 km radius</span>
              </div>
            </div>

            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-text-tertiary">
                <Icon name="search" className="text-[20px]" />
              </div>
              <input
                type="search"
                placeholder="Search businesses, foods, salons..."
                className="w-full h-12 pl-11 pr-space-md rounded-xl bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:bg-surface-canvas shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="w-full py-space-sm bg-surface-canvas">
            <div className="flex items-center gap-space-xs px-margin overflow-x-auto no-scrollbar scroll-smooth">
              {DISCOVER_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 h-9 px-4 rounded-full font-label-md text-label-md transition-all flex items-center justify-center ${
                    category === item
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-space-md px-margin pt-space-xs pb-space-lg">
            <div className="flex items-center justify-between text-text-secondary pt-space-xs">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Spotlight Discoveries (42)</span>
              <span className="font-caption text-caption text-text-tertiary">Real-time Perks</span>
            </div>

            {businessCards.map((card, index) => (
              <article
                key={card.name}
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
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-surface-canvas/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                    <Icon name={card.badgeIcon} className="text-[15px] text-primary-container" filled />
                    <span className="font-caption text-caption font-semibold text-text-primary">{card.badge}</span>
                  </div>
                  <button
                    aria-label={`Bookmark ${card.name}`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleBookmark(index);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-on-primary active:scale-90 transition-transform"
                  >
                    <Icon name={bookmarked[index] ? 'bookmark' : 'bookmark_border'} className="text-[18px]" filled={bookmarked[index]} />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-on-primary">
                    <Icon name="star" className="text-[16px] text-amber-400" filled />
                    <span className="font-label-sm text-label-sm font-bold">{card.rating}</span>
                    <span className="font-caption text-caption opacity-90">{card.reviews}</span>
                  </div>
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
                    <span className="font-caption text-caption text-text-secondary">{card.distance}</span>
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
