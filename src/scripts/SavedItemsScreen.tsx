import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface SavedItemsScreenProps {
  onBack: () => void;
  onOpenDeal: () => void;
  onOpenBusiness: () => void;
  onBrowse: () => void;
}

type SavedFilter = 'all' | 'deals' | 'businesses' | 'services';

const FILTERS: Array<{ key: SavedFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'deals', label: 'Deals' },
  { key: 'businesses', label: 'Businesses' },
  { key: 'services', label: 'Services & Menu' },
];

const URBAN_DEAL_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBEsUfoX0BR8wQbev0iY0OE3oaZcHAq3f_kmtPuvfFZALp7pRPBJnQVrjLgvZqOE3SLdv6aTMWEffa3q0kptxiKN6qz8PwTTXAK25hfeJ2PvEmN86xYRxv_myVwyUtTEG0z6cThggJsUtfBpHQo0nt1s6cnIjmg9daAPt5Ilc0xRdIDev1DP-tAsrYmgf1bG77UrHwGX8VvvRgIZfhau9QOYuH7F6hHkxgogsDe9AAF';
const GLOW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA9O6R9cW4pzDqYdT4glxLJjDCJwXVwqvZNPbNpdbD_nztxqvLjUxA4hfrV-yjyL9iv67jiwnUyIh0CCOFLmRGqwltlF4xwfFrtj08bFwR8W5UmusWtNkpMemY6NSkuqidaWpMCZQOFlOsR_hx1mDZx_KN_UqB4faG6xgeY0z3Crn4a-SY_XP2DjO3k0SE9215rm1GfpwHljDiyDknog6_PlORQISnW-ITM1_z0GXDX';
const SOLE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBhm7XroZ9CuhKjfJEOi0R-OjqQQ6dqDHGyajpAWfCcRmp6IDqkVZpysDWCWuXu-eu75kytL4hnqOkpKkZCjyUVTLYHfr0XsU90FbJDP9pw5t2ep23iEOyIcwLlASxKg5rF6zB9n-EbBiaAiFE5fii4-d8VZUoRxAIhgUxTPenZCLcVk_D3HrISWRJ2Y5FtBgBK8atS2XvseRwQZ9Tkn-1WYCF_Y5mqRFd1-MNWGcL1';
const DAILY_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg2NP24GXEqT1vCPeIDzreaRt2jz8tm4qcKNkVIdcuyCqBDOLgnw5BkuzVJQdrxp4yiURvkES7aaFaBStCY9ivtmDq4uwEODfVDfIRdFlBZzDEBeElfOyUlD0GhjJVXxph8r2kqdzk4Muh8c1X9lT2vjbhAX31a-1BFBGcRESgBJBmY5k9qIKxB95xPHTSQn2PUpU-0FdkwHhbSiw8ZWPtEgSrXK-0TkiujK_OUWvh';

interface SavedItem {
  id: string;
  category: Exclude<SavedFilter, 'all'>;
  layout: 'large' | 'compact';
  image: string;
  alt: string;
  action: 'deal' | 'business' | 'browse';
}

const ITEMS: SavedItem[] = [
  {
    id: 'urban',
    category: 'deals',
    layout: 'large',
    image: URBAN_DEAL_IMAGE,
    alt: 'Close up gourmet brioche prime beef burger with melting aged cheddar cheese, golden crispy seasoned french fries, and crafted iced soda drink on an upscale wooden bistro table under warm atmospheric bistro dining lights',
    action: 'deal',
  },
  {
    id: 'glow',
    category: 'businesses',
    layout: 'large',
    image: GLOW_IMAGE,
    alt: 'Luxury serene day spa interior featuring smooth minimalist warm stone walls, bamboo accents, tranquil water bowl with floating frangipani blossoms, clean white linen treatment loungers',
    action: 'business',
  },
  {
    id: 'sole',
    category: 'deals',
    layout: 'large',
    image: SOLE_IMAGE,
    alt: 'Editorial product shot of limited release designer athletic sneakers displayed on an elevated frosted glass plinth inside an urban minimalist streetwear sneaker boutique',
    action: 'browse',
  },
  {
    id: 'daily',
    category: 'services',
    layout: 'compact',
    image: DAILY_IMAGE,
    alt: 'Amber glass bottle filled with rich craft cold brew coffee sitting on a marble bakery counter beside a freshly baked butter croissant with golden morning window light',
    action: 'browse',
  },
];

export function SavedItemsScreen({ onBack, onOpenDeal, onOpenBusiness, onBrowse }: SavedItemsScreenProps) {
  const [filter, setFilter] = useState<SavedFilter>('all');
  const [query, setQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>(ITEMS.map((item) => item.id));
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const trimmed = query.trim().toLowerCase();
  const matches = (item: SavedItem) => {
    if (filter !== 'all' && item.category !== filter) return false;
    if (trimmed) {
      const haystack = `${item.id} ${item.category} ${item.alt}`.toLowerCase();
      if (!haystack.includes(trimmed)) return false;
    }
    return true;
  };
  const visible = ITEMS.filter(matches);
  const countFor = (key: SavedFilter) =>
    key === 'all' ? ITEMS.length : ITEMS.filter((item) => item.category === key).length;

  const toggleBookmark = (id: string, title: string) => {
    setBookmarks((current) => {
      if (current.includes(id)) {
        showToast(`Removed "${title}" from saved items`);
        return current.filter((item) => item !== id);
      }
      showToast(`Saved "${title}" to your list`);
      return [...current, id];
    });
  };

  const resetFilters = () => {
    setQuery('');
    setFilter('all');
  };

  const runAction = (action: SavedItem['action']) => {
    if (action === 'deal') onOpenDeal();
    else if (action === 'business') onOpenBusiness();
    else onBrowse();
  };

  const pillClass = (key: SavedFilter) =>
    key === filter
      ? 'shrink-0 h-[36px] px-space-md rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all flex items-center gap-1.5 active:scale-95'
      : 'shrink-0 h-[36px] px-space-md rounded-full bg-surface-container-lowest text-text-secondary font-label-md text-label-md shadow-sm transition-all flex items-center gap-1.5 hover:bg-surface-container-low active:scale-95';

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="h-14 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center -ml-space-xs rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate">
              Saved Items Hub
            </h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin pb-space-2xl gap-space-md pt-space-xs">
        <div className="flex flex-col gap-space-xs">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-outline">
              <Icon name="search" className="text-[20px]" />
            </div>
            <input
              className="w-full h-[50px] pl-[44px] pr-space-md bg-surface-container-lowest text-on-surface placeholder:text-text-tertiary font-body-md text-body-md rounded-xl shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors"
              id="saved-search-input"
              placeholder="Search saved deals, businesses & items..."
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                aria-label="Clear search"
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-space-md flex items-center text-outline hover:text-on-surface"
              >
                <Icon name="cancel" className="text-[18px]" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-space-2xs overflow-x-auto py-1 no-scrollbar -mx-margin px-margin">
            {FILTERS.map((item) => (
              <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={pillClass(item.key)}>
                <span>{item.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full font-caption text-caption ${
                    item.key === filter
                      ? 'bg-surface-container-lowest/20 text-on-primary'
                      : 'bg-surface-container text-text-secondary'
                  }`}
                >
                  {countFor(item.key)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-space-md">
          {visible.map((item) =>
            item.layout === 'large' ? (
              <LargeCard
                key={item.id}
                item={item}
                saved={bookmarks.includes(item.id)}
                onToggleBookmark={() =>
                  toggleBookmark(item.id, item.id === 'urban' ? 'Urban Grill combo deal' : item.id === 'glow' ? 'Glow & Serenity Spa' : 'Sole District Boutique deal')
                }
                onAction={() => runAction(item.action)}
              />
            ) : (
              <CompactCard
                key={item.id}
                item={item}
                saved={bookmarks.includes(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id, 'Artisan Cold Brew')}
                onAction={() => runAction(item.action)}
              />
            ),
          )}
        </div>

        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-space-3xl px-space-md gap-space-sm">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <Icon name="bookmark_border" className="text-[32px]" />
            </div>
            <div className="flex flex-col gap-1 max-w-[260px]">
              <h3 className="font-heading-sm text-heading-sm text-on-surface">No saved items found</h3>
              <p className="font-body-md text-body-md text-text-secondary">
                Try switching category tabs or clearing your search filters to explore local gems.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 px-space-lg h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary shadow-sm active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

        <footer className="pt-space-md flex items-start gap-space-xs p-space-md rounded-xl bg-surface-container-low text-text-secondary">
          <Icon name="cloud_done" className="text-primary text-[20px] shrink-0 mt-0.5" />
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            Saved items remain synced to your account. Deal prices and availability are managed directly by each
            local business.
          </p>
        </footer>
      </main>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface font-label-md text-label-md px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transition-all duration-300">
          <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}

function BookmarkButton({ saved, onClick, label }: { saved: boolean; onClick: () => void; label: string }) {
  return (
    <button
      aria-label={label}
      type="button"
      onClick={onClick}
      className="w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary flex items-center justify-center shadow-md active:scale-90 transition-transform"
    >
      <Icon name={saved ? 'bookmark' : 'bookmark_border'} className="text-[20px]" filled={saved} />
    </button>
  );
}

function LargeCard({
  item,
  saved,
  onToggleBookmark,
  onAction,
}: {
  item: SavedItem;
  saved: boolean;
  onToggleBookmark: () => void;
  onAction: () => void;
}) {
  if (item.id === 'urban') {
    return (
      <article className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-200">
        <div className="relative w-full h-44 overflow-hidden bg-surface-container-high">
          <img className="w-full h-full object-cover" src={item.image} data-alt={item.alt} alt={item.alt} />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-badge-discount-bg text-badge-discount-text px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-sm backdrop-blur-sm">
            <Icon name="schedule" className="text-[14px]" />
            <span>Expires in 3 days</span>
          </div>
          <div className="absolute top-3 right-3">
            <BookmarkButton saved={saved} onClick={onToggleBookmark} label="Toggle Urban Grill bookmark" />
          </div>
        </div>
        <div className="p-space-md flex flex-col gap-space-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-text-secondary font-label-sm text-label-sm">
              <Icon name="location_on" className="text-[16px] text-primary" />
              <span className="font-medium text-text-primary">Apo District</span>
              <span className="text-text-tertiary">•</span>
              <span>0.8 km</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
              20% OFF
            </span>
          </div>
          <h3 className="font-heading-sm text-heading-sm text-on-surface line-clamp-1">Urban Grill &amp; Bistro</h3>
          <p className="font-body-md text-body-md text-text-secondary line-clamp-1">
            Prime Lunch Combo with Handcrafted Lemonade
          </p>
          <div className="pt-space-2xs flex items-center justify-between mt-1 gap-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦9,600</span>
              <span className="font-body-md text-body-md text-text-tertiary line-through decoration-1">₦12,000</span>
            </div>
            <button
              type="button"
              onClick={onAction}
              className="h-10 px-space-md rounded-lg bg-primary text-on-primary font-button-secondary text-button-secondary shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>View Deal</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (item.id === 'glow') {
    return (
      <article className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-200">
        <div className="relative w-full h-40 overflow-hidden bg-surface-container-high">
          <img className="w-full h-full object-cover" src={item.image} data-alt={item.alt} alt={item.alt} />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-surface-container-lowest/90 text-on-surface px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-sm backdrop-blur-sm">
            <Icon name="spa" className="text-[14px] text-primary" />
            <span>Wellness &amp; Spa</span>
          </div>
          <div className="absolute top-3 right-3">
            <BookmarkButton saved={saved} onClick={onToggleBookmark} label="Toggle Glow & Serenity bookmark" />
          </div>
        </div>
        <div className="p-space-md flex flex-col gap-space-xs">
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-1 text-tertiary-container font-label-md text-label-md font-semibold">
              <Icon name="star" className="text-[18px] text-tertiary-container" filled />
              <span>4.9</span>
              <span className="text-text-tertiary font-normal">(96 reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-text-secondary font-label-sm text-label-sm">
              <Icon name="near_me" className="text-[16px] text-primary" />
              <span>1.4 km • Maitama Heights</span>
            </div>
          </div>
          <h3 className="font-heading-sm text-heading-sm text-on-surface line-clamp-1">Glow &amp; Serenity Spa &amp; Salon</h3>
          <div className="p-2.5 rounded-lg bg-surface-tint-blue flex items-center gap-2">
            <Icon name="local_offer" className="text-primary text-[18px] shrink-0" />
            <span className="font-label-sm text-label-sm text-primary font-medium truncate">
              Active deal: 20% Off Weekend Glow Facial
            </span>
          </div>
          <div className="pt-space-2xs flex items-center justify-between mt-1 gap-space-xs">
            <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              Open today until 8:00 PM
            </span>
            <button
              type="button"
              onClick={onAction}
              className="h-10 px-space-md rounded-lg bg-surface-container-high text-on-surface font-button-secondary text-button-secondary hover:bg-surface-container transition-all flex items-center gap-1 active:scale-95 shrink-0"
            >
              <span>View Business</span>
              <Icon name="storefront" className="text-[16px]" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-200">
      <div className="relative w-full h-44 overflow-hidden bg-surface-container-high">
        <img className="w-full h-full object-cover" src={item.image} data-alt={item.alt} alt={item.alt} />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-surface-container-lowest/95 text-tertiary px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-sm backdrop-blur-sm font-semibold">
          <Icon name="bolt" className="text-[14px]" />
          <span>Limited Vouchers</span>
        </div>
        <div className="absolute top-3 right-3">
          <BookmarkButton saved={saved} onClick={onToggleBookmark} label="Toggle Sole District bookmark" />
        </div>
      </div>
      <div className="p-space-md flex flex-col gap-space-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-text-secondary font-label-sm text-label-sm">
            <Icon name="location_on" className="text-[16px] text-primary" />
            <span className="font-medium text-text-primary">Garki Area</span>
            <span className="text-text-tertiary">•</span>
            <span>1.2 km</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
            30% OFF
          </span>
        </div>
        <h3 className="font-heading-sm text-heading-sm text-on-surface line-clamp-1">Sole District Boutique</h3>
        <p className="font-body-md text-body-md text-text-secondary line-clamp-1">
          Weekend Sneaker Drop &amp; Lifestyle Apparel
        </p>
        <div className="pt-space-2xs flex items-center justify-between mt-1 gap-space-xs">
          <div className="flex items-baseline gap-2">
            <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦28,000</span>
            <span className="font-body-md text-body-md text-text-tertiary line-through decoration-1">₦40,000</span>
          </div>
          <button
            type="button"
            onClick={onAction}
            className="h-10 px-space-md rounded-lg bg-primary text-on-primary font-button-secondary text-button-secondary shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>View Deal</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </div>
    </article>
  );
}

function CompactCard({
  item,
  saved,
  onToggleBookmark,
  onAction,
}: {
  item: SavedItem;
  saved: boolean;
  onToggleBookmark: () => void;
  onAction: () => void;
}) {
  return (
    <article className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex gap-space-md items-center transition-all duration-200">
      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
        <img className="w-full h-full object-cover" src={item.image} data-alt={item.alt} alt={item.alt} />
        <div className="absolute bottom-1 right-1 bg-surface-container-lowest/90 px-1.5 py-0.5 rounded font-caption text-caption text-text-secondary font-medium">
          500ml
        </div>
      </div>
      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <span className="font-caption text-caption text-text-tertiary block truncate">The Daily Knead Bakery</span>
            <h4 className="font-heading-sm text-heading-sm text-on-surface truncate">Artisan Cold Brew</h4>
          </div>
          <button
            aria-label="Toggle Cold Brew bookmark"
            type="button"
            onClick={onToggleBookmark}
            className="text-primary p-1 rounded-full active:scale-90 transition-transform shrink-0 -mr-1.5"
          >
            <Icon name={saved ? 'bookmark' : 'bookmark_border'} className="text-[20px]" filled={saved} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption my-1">
          <Icon name="location_on" className="text-[14px] text-primary" />
          <span>Wuse II • 2.1 km</span>
        </div>
        <div className="flex items-center justify-between pt-1 gap-space-xs">
          <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦5,000</span>
          <button
            type="button"
            onClick={onAction}
            className="h-8 px-3 rounded-md bg-surface-container text-primary font-label-sm text-label-sm font-semibold hover:bg-secondary-container transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Order</span>
            <Icon name="shopping_bag" className="text-[14px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
