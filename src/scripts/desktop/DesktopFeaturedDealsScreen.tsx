import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';

interface DesktopFeaturedDealsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  onOpenDeal: () => void;
}

interface FeaturedDeal {
  image: string;
  imageAlt: string;
  discount: string;
  extra: { label: string; className: string; icon: string };
  window: { icon: string; label: string };
  distance: string;
  store: string;
  rating: string;
  reviews: string;
  title: string;
  copy: string;
  price: string;
  oldPrice: string;
  save: string;
}

const FEATURED_DEALS: FeaturedDeal[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDxtyJ8lPE2Mv8GCMaYUwkPs1iA9nOGDgt6JL2RjVgUg2sVRpfLxt7ol_e1hGEkKHZTf08tSXRznNtVEVFMK3JNn3oqH1kZRveAOUg7kmMqU-P0wMyPLQ9KvG2UZGGNHKwVmhaBIEXbM14h9-CRxbmRnyWFzogg-8u4iLo1oENMfHUYYIQLeb-ZVskSPf_qtcp6yTRAdCaMzKB7ai7YStSiCY_DoSH3eKLZCchk3ECz',
    imageAlt:
      'Close up gourmet chargrilled beef burger with smoked bacon and crisp fries served on artisanal wood slate at a trendy sunlit urban bistro in Abuja with natural lighting and soft warm depth.',
    discount: '20% OFF',
    extra: {
      label: 'Fast Claim',
      className: 'bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-medium',
      icon: 'bolt',
    },
    window: { icon: 'alarm', label: 'Expires in 4h' },
    distance: '0.4km away',
    store: 'Urban Grill & Bistro',
    rating: '4.9',
    reviews: '(184)',
    title: '20% Off Prime Lunch Combo & Craft Beverage',
    copy: 'Signature dry-aged prime beef burger or grilled chicken plate, accompanied by loaded fries and freshly brewed iced hibiscus tea.',
    price: '₦9,600',
    oldPrice: '₦12,000',
    save: 'Save ₦2,400 today',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtMNCcnGyMs_1bkUknKVikVVpRcby0k0s0ZBvtEQsc_4R-9ZUFAqeLx6ur0IFEwIJz4ts6h_tKstJxdxPR07Gzm1AOXGssJGfefuJboHcfqhHF2K0t1gPspl0Niqt-HyxSABXqQByUqz1wpO3DeCj7JU45dxFNn8al3yKVMjruVrAWeYkItP-5IEi74QYBhYioZlV3Yf4pL_GszLhDZQesJb1ZPkV7RNLiChrJp4jI',
    imageAlt:
      'High-end designer streetwear sneakers displayed on polished concrete pedestal in a minimalist modern boutique studio with sleek architectural lighting and luxury urban apparel racks.',
    discount: '30% OFF',
    extra: {
      label: 'Limited 15 Left',
      className: 'bg-error-container text-on-error-container font-semibold',
      icon: 'local_fire_department',
    },
    window: { icon: 'schedule', label: 'Valid through Sunday' },
    distance: '1.2km away',
    store: 'Sole District Boutique',
    rating: '4.8',
    reviews: '(96)',
    title: '30% Off Weekend Sneaker Drop & Streetwear Pass',
    copy: 'Redeemable across the new seasonal sneaker rack and luxury graphic hoodies. Includes on-the-spot custom lace swap.',
    price: '₦28,000',
    oldPrice: '₦40,000',
    save: 'Save ₦12,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABQdyVUWGnWP1TZLAK7j5LrpDjViCjK6RTmCevn-vXhmIBhcYQgrK16SLap69ZXLgT566Cb0u7rFjsEUThlgHZ3Y4x23T9dkkjVNnZU0CpHAUaxJZDIJv6PG1EvAg0Yh9565R5XoofBzRn_yuWQJ7AqYvMfbqyQwDUFcbGqVlObW0-YjJJ_x21IjpyYQ2TRsm1DNrBR_ey7KD-XsnEmKZuwGMaUnDQzMLL7N_9dhGM',
    imageAlt:
      'Serene wellness luxury spa interior in Abuja with cedar sauna, warm ambient bamboo lighting, aromatic essential oil diffusers, and plush folded organic towels in tranquil calm atmosphere.',
    discount: '25% OFF',
    extra: {
      label: 'Popular Choice',
      className: 'bg-secondary-fixed text-on-secondary-fixed font-semibold',
      icon: 'spa',
    },
    window: { icon: 'event_available', label: 'Weekend Only' },
    distance: '1.4km away',
    store: 'Glow & Serenity Spa',
    rating: '5.0',
    reviews: '(210)',
    title: '25% Off Weekend Glow Facial & Sauna Therapy Pass',
    copy: 'Full 60-minute botanical hydration facial, combined with 30-minute cedar infrared sauna session and herbal detox tonic.',
    price: '₦18,500',
    oldPrice: '₦25,000',
    save: 'Save ₦6,500',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDYVvk_zUvlBpNPsSW39ZIu40l3KCpc7EkGCApbQlu2NxqrDow8fjuw5UaGRcuY6Ht6Q4ti_E9Rw3LJxvbwLWPwqOmunZpeTLfHDDuPE3xYquh9CZ2b-hSiZy1_PRl34uOhK2IIN8Ef2wh5yzZ3WgdzuI-4uBOAqdplX5i6pNmhvRZgllOFTydKVhYUmfYde4-4MAn0JFH_uBfZu4LaaHtNzn_KY-V_SzDp2VGlKxO-',
    imageAlt:
      'Rooftop fine dining table overlooking Abuja city skyline at golden dusk hour with elegantly arranged five-course gourmet dishes and sparkling wine glasses in warm romantic ambiance.',
    discount: '50% OFF',
    extra: {
      label: 'Ends Tonight',
      className: 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold',
      icon: 'nightlife',
    },
    window: { icon: 'dinner_dining', label: 'Table for Two' },
    distance: '2.1km away',
    store: 'The Sky Lounge & Grill',
    rating: '4.9',
    reviews: '(340)',
    title: "50% Off Chef's 5-Course Sunset Tasting Menu for Two",
    copy: 'Pan-seared jumbo tiger prawns, slow-braised short ribs, truffle mash, and handcrafted molten chocolate fondant with panoramic city views.',
    price: '₦24,500',
    oldPrice: '₦49,000',
    save: 'Save ₦24,500 today',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChhxTwztwhe6liej7iAYom5i582P6VAb9QUvMdZMAnlFxm8zl_pRWi_2hkQOCSDtAXsUNrwePtqnBhKQxS5PcM7u00e0AYSaJhtROdpygIJS0lOrV4ul7hposwFe67V5S4OH_WNIMot9APFtc67-FPmnZ4BUC46rmwWs56hyeZhRatjINPSqU-w-19_1bFRsRvlTZNKnUvoQRQAQZ6r4t7dxzE2Zud9c8dx3bt56NL',
    imageAlt:
      'Freshly baked golden sourdough loaves and flaky butter croissants on a rustic marble counter with hot cappuccino poured with intricate latte art in an upscale Abuja European style cafe.',
    discount: '30% OFF',
    extra: {
      label: 'Breakfast Only',
      className: 'bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-semibold',
      icon: 'bakery_dining',
    },
    window: { icon: 'wb_sunny', label: '7:00 AM - 12:00 PM' },
    distance: '2.8km away',
    store: 'Artisan Bakery & Cafe',
    rating: '4.7',
    reviews: '(142)',
    title: '30% Off Artisanal Sourdough & Specialty Breakfast Combo',
    copy: 'Warm sourdough toast topped with poached eggs, smashed avocado, paired with single-origin pour-over coffee or flat white.',
    price: '₦4,500',
    oldPrice: '₦6,500',
    save: 'Save ₦2,000',
  },
];

const SORT_OPTIONS = [
  { key: 'closest', label: 'Closest to You', icon: 'near_me' },
  { key: 'discount', label: 'Highest Discount', icon: 'percent' },
  { key: 'ending', label: 'Ending Soonest', icon: 'timer' },
];

export function DesktopFeaturedDealsScreen({ onNav, onOpenFilters, onOpenDeal }: DesktopFeaturedDealsScreenProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('closest');
  const [locationOpen, setLocationOpen] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const toggleSave = (store: string) => {
    setSaved((prev) => ({ ...prev, [store]: !prev[store] }));
  };

  return (
    <>
      <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
        <section className="w-full px-margin pt-space-lg pb-space-md">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm flex-wrap">
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Featured Deals</h1>
                <span className="inline-flex items-center gap-1 px-space-xs py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed-variant font-caption text-caption font-semibold tracking-wider uppercase">
                  <Icon name="auto_awesome" className="text-[14px]" />
                  PROMOTED / SPONSORED
                </span>
                <span className="text-text-tertiary font-body-md text-body-md hidden sm:inline">•</span>
                <span className="font-label-md text-label-md text-text-secondary">5 Curated Local Offers</span>
              </div>

              <div className="flex items-center gap-space-xs self-start md:self-auto">
                <button
                  className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
                  type="button"
                  onClick={onOpenFilters}
                >
                  <Icon name="tune" className="text-[18px] text-primary" />
                  <span>Filters</span>
                  <span className="w-2 h-2 rounded-full bg-primary-container" />
                </button>
                <div className="hidden sm:flex items-center bg-surface-subtle p-1 rounded-xl shadow-sm">
                  <button
                    aria-label="Grid View"
                    className={`p-1.5 rounded-lg transition-colors ${
                      view === 'grid' ? 'bg-surface-canvas shadow-sm text-primary' : 'text-text-tertiary hover:text-text-primary'
                    }`}
                    type="button"
                    onClick={() => setView('grid')}
                  >
                    <Icon name="grid_view" className="text-[20px]" />
                  </button>
                  <button
                    aria-label="List View"
                    className={`p-1.5 rounded-lg transition-colors ${
                      view === 'list' ? 'bg-surface-canvas shadow-sm text-primary' : 'text-text-tertiary hover:text-text-primary'
                    }`}
                    type="button"
                    onClick={() => setView('list')}
                  >
                    <Icon name="view_agenda" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm py-space-xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <button
                  className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm"
                  type="button"
                  onClick={() => setLocationOpen(true)}
                >
                  <Icon name="location_on" className="text-[16px]" />
                  <span className="font-semibold">Apo, Abuja</span>
                  <span className="text-text-tertiary">•</span>
                  <span>Within 10km</span>
                </button>
                <span className="text-badge-discount-text font-label-sm text-label-sm bg-badge-discount-bg px-2.5 py-1 rounded-full font-medium">
                  5 Live Deals Active Now
                </span>
              </div>

              <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                {SORT_OPTIONS.map((option) => {
                  const active = option.key === sort;
                  return (
                    <button
                      key={option.key}
                      className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-surface-tint-blue text-primary shadow-sm'
                          : 'bg-surface-container-low hover:bg-surface-container text-text-secondary'
                      }`}
                      type="button"
                      onClick={() => setSort(option.key)}
                    >
                      <Icon name={option.icon} className="text-[15px]" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full flex items-start sm:items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant text-caption font-caption">
              <div className="flex items-center gap-space-xs">
                <Icon name="qr_code_2" className="text-primary text-[20px] shrink-0" />
                <span>
                  Promoted and sponsored offers from verified local merchants near your GPS pinpoint. Ranked strictly
                  by geographic distance.
                </span>
              </div>
              <button
                className="text-primary hover:underline font-label-sm text-label-sm shrink-0 hidden md:block"
                type="button"
              >
                Audit Criteria
              </button>
            </div>
          </div>
        </section>

        <section className="w-full px-margin py-space-sm">
          <div
            className={`max-w-7xl mx-auto grid gap-space-lg ${
              view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}
          >
            {FEATURED_DEALS.map((deal) => (
              <article
                key={deal.store}
                role="button"
                tabIndex={0}
                onClick={onOpenDeal}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenDeal();
                  }
                }}
                className="group flex flex-col rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(6,108,244,0.12)] transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="relative w-full h-56 overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={deal.imageAlt}
                    src={deal.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm">
                      {deal.discount}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full font-caption text-caption flex items-center gap-1 shadow-sm ${deal.extra.className}`}
                    >
                      <Icon name={deal.extra.icon} className="text-[14px]" />
                      {deal.extra.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      aria-label="Save Deal"
                      className={`w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center transition-colors shadow-sm ${
                        saved[deal.store] ? 'text-primary' : 'text-text-secondary hover:text-error'
                      }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSave(deal.store);
                      }}
                    >
                      <Icon
                        name={saved[deal.store] ? 'bookmark_added' : 'bookmark'}
                        className="text-[18px]"
                        filled={saved[deal.store]}
                      />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-caption font-caption">
                    <span className="inline-flex items-center gap-1 bg-on-surface/60 backdrop-blur-md px-2 py-0.5 rounded-md text-on-primary">
                      <Icon name={deal.window.icon} className="text-[14px] text-badge-discount-text" />
                      {deal.window.label}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-on-surface/60 backdrop-blur-md px-2 py-0.5 rounded-md text-on-primary">
                      <Icon name="near_me" className="text-[14px]" />
                      {deal.distance}
                    </span>
                  </div>
                </div>

                <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
                  <div className="space-y-space-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                          {deal.store}
                        </span>
                        <Icon name="verified" filled className="text-primary text-[16px] shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-on-surface font-label-sm text-label-sm shrink-0 bg-surface-container-low px-1.5 py-0.5 rounded">
                        <Icon name="star" filled className="text-[14px] text-amber-500" />
                        <span className="font-semibold">{deal.rating}</span>
                        <span className="text-text-tertiary">{deal.reviews}</span>
                      </div>
                    </div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                      {deal.title}
                    </h2>
                    <p className="font-body-md text-body-md text-text-secondary line-clamp-2">{deal.copy}</p>
                  </div>

                  <div className="pt-space-xs flex items-center justify-between gap-space-sm bg-surface-subtle -mx-space-md -mb-space-md p-space-md mt-auto">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading-md text-heading-md font-bold text-text-primary">{deal.price}</span>
                        <span className="font-caption text-caption text-text-tertiary line-through">{deal.oldPrice}</span>
                      </div>
                      <span className="font-caption text-caption text-badge-discount-text font-medium">{deal.save}</span>
                    </div>
                    <button
                      className="h-11 px-space-md bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center gap-1.5 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      type="button"
                    >
                      <span>View Deal</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <article className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] overflow-hidden p-space-md justify-between">
              <div className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption font-semibold tracking-wider uppercase text-primary">
                    Live Radar
                  </span>
                  <span className="flex items-center gap-1 text-badge-discount-text font-caption text-caption font-medium">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                    GPS Sync Active
                  </span>
                </div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  Explore 18+ Unlisted Neighborhood Perks
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Switch to the interactive neighborhood map to see unpromoted walk-in stamps, flash discounts, and
                  instant tap vouchers in Apo District.
                </p>

                <div
                  className="w-full h-36 rounded-xl bg-surface-container relative overflow-hidden flex items-end p-space-xs"
                  data-location="Apo District, Abuja, Nigeria"
                >
                  <div className="relative z-10 bg-surface-canvas/90 backdrop-blur-sm px-space-xs py-1 rounded-lg text-caption font-caption text-text-primary flex items-center gap-1 shadow-sm">
                    <Icon name="navigation" className="text-[16px] text-primary" />
                    <span>Apo Bridge corridor • 0.4 - 3.2km</span>
                  </div>
                </div>
              </div>

              <div className="pt-space-md mt-auto">
                <button
                  className="w-full h-11 bg-surface-tint-blue hover:bg-secondary-fixed text-primary font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  type="button"
                >
                  <Icon name="map" className="text-[18px]" />
                  <span>Switch to Map Radar</span>
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="w-full px-margin pt-space-xl pb-space-2xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div className="lg:col-span-8 p-space-lg rounded-2xl bg-surface-container-low flex flex-col sm:flex-row gap-space-md items-start">
              <div className="w-12 h-12 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="verified" className="text-[24px]" />
              </div>
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <h4 className="font-heading-sm text-heading-sm text-text-primary">
                    About Featured Listings on VEMTAP
                  </h4>
                  <span className="px-2 py-0.5 rounded text-caption font-caption bg-surface-canvas text-text-secondary font-medium">
                    NDPR Verified
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  Promoted placements let verified merchants showcase time-sensitive perks to nearby consumers. While
                  placement is sponsored, ranking priority is governed strictly by your real-time GPS distance and
                  historical fulfillment score (min. 4.5★ rating). Merchants cannot buy placement outside their
                  operational radius.
                </p>
                <div className="pt-space-2xs flex items-center gap-space-md text-caption font-caption text-text-tertiary flex-wrap">
                  <span className="flex items-center gap-1">
                    <Icon name="security" className="text-[14px]" />
                    Zero Location Tracking Storage
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="percent" className="text-[14px]" />
                    Guaranteed Price Match
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 p-space-lg rounded-2xl bg-surface-canvas shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] flex flex-col justify-between gap-space-md">
              <div className="space-y-space-2xs">
                <span className="text-caption font-caption font-semibold uppercase tracking-wider text-primary">
                  For Business Owners
                </span>
                <h4 className="font-heading-sm text-heading-sm text-text-primary">Own a business in Abuja?</h4>
                <p className="font-body-md text-body-md text-text-secondary">
                  Drive high-intent local foot traffic right to your counter during quiet hours. Boost your verified
                  deals across Apo, Garki, and Wuse.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:gap-2 transition-all self-start"
                type="button"
                onClick={() => onNav('for-business')}
              >
                <span>Boost your deals on VEMTAP</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        </section>
      </DesktopPage>
      <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}
