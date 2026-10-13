import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopFooter, DesktopNavHeader, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopDiscoverDealsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onNext: () => void;
  onSkip: () => void;
  onOpenDeal: () => void;
}

interface DealCardData {
  image: string;
  imageAlt: string;
  badgeIcon: string;
  badgeLabel: string;
  badgeTone: 'green' | 'blue';
  tagIcon: string;
  tagLabel: string;
  tagTone?: string;
  distance: string;
  rating: string;
  merchant: string;
  category: string;
  title: string;
  description: string;
  priceNote: string;
  price: string;
  priceAccent?: boolean;
}

const CARDS: DealCardData[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA--IKhfpFY8hwrkkmHIOrstr5N3Jk_sUT2Y1dYVhhDk-ZlAQP0cUxz4IM7n_zcNnX5M84dqkGax-5DvlqVZzHdf4YnDC7KsbnCCeJGiSaBXgekfPKG29XASeAgFqIpP1tRU1h-z3SjQDHigPqZo-qO7zewdL7L3h6nIBZWhjuIpsuCUj61fJVfart13xBaCOK0yXsVzstuTrx0ltrzj3Dc9xK1rolA1hgOmVDu9_G6',
    imageAlt: 'Gourmet smoked brisket lunch combo with fries in a contemporary restaurant',
    badgeIcon: 'local_fire_department',
    badgeLabel: '20% OFF',
    badgeTone: 'green',
    tagIcon: 'local_fire_department',
    tagLabel: 'Hot Deal',
    distance: '0.4 km away',
    rating: '4.9',
    merchant: 'Bistro 24 / Urban Grill',
    category: 'Food & Dining',
    title: '20% Off Lunch Menu',
    description: 'Valid on chef signature wood-fired grills, lunch specials, and hand-crafted mocktails.',
    priceNote: '₦12,000',
    price: '₦9,600',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCYimsHplSKATM4Y7VQrKA64HLhQltN2UTpwpjp-tKB8jQvo1s_ZrVL9UF-e1eWoafODzA3t-EEpwE8-yOjb098Gal3y8FUq1wNltZWmS3AqrZPSWSGI8rFj5ZDRNBgQhgtRLcN2vIENnyGBXiDzW2K-Lvy6vsjGB3-tAbgoz7kZrqE8Dl9-vwI5eo77z60dtlj6eOHIAeFX6lbe7--6Fu8W2ta9Nhk6G1n4o2F3dNZ',
    imageAlt: 'Luxury modern aesthetic spa room with botanical skincare bottles',
    badgeIcon: 'trending_up',
    badgeLabel: '30% OFF',
    badgeTone: 'green',
    tagIcon: 'bolt',
    tagLabel: 'Trending',
    tagTone: 'text-primary',
    distance: '1.2 km away',
    rating: '4.8',
    merchant: 'Glow Studio',
    category: 'Beauty & Spa',
    title: 'Weekend Beauty Deal',
    description: 'Deep facial cleanse with signature botanical scrub and complimentary hot towel session.',
    priceNote: '₦26,500',
    price: '₦18,500',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCFcY7p20PRikX5wBQg_-bzDLgFQKlRjoPKwqVLmIkWR0w0Rfv-GbvzuJjPmyDT5hEf1LEd1UhhLCUSlCfCqCkH0hRxOFRxsVInMSzkfq4FjwhkRiUyoiGPuFyhDgsGjEt--VLY6D7obnv_xAVHEtOoCeu2vJmB7O_Gt4VDBIBYRlkSe4phg5TPsVpEBBOdTqaElhdXQpCTo7vs8w_l5koXUe5ALbt6BucOpMCU9iim',
    imageAlt: 'Designer streetwear sneaker display shelf in a contemporary concept store',
    badgeIcon: 'auto_awesome',
    badgeLabel: 'SPECIAL OFFER',
    badgeTone: 'blue',
    tagIcon: 'loyalty',
    tagLabel: 'Drop 03',
    tagTone: 'text-secondary',
    distance: '0.8 km away',
    rating: '5.0',
    merchant: 'Sole District',
    category: 'Retail & Fashion',
    title: 'Weekend Sneaker Drop',
    description: 'Access curated apparel releases with exclusive in-store voucher redemption on premium streetwear.',
    priceNote: 'Voucher Gift',
    price: '15% Off Total',
    priceAccent: true,
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCf9IN3li-k5U40feITr7hNZC_7kXMWvVqDhzqKbUmky20l24mHfAREVSnw1_6ISPxMIZ-4uFn3c7OFCf_h274LsVsjkxMLJN0JS4Mj1qNC8Jh1SuaTn7xjVhz5IOIllm3_Q5KRawkulfnq5mVuz6s0NNz5Xm16A4x6cBNI3q4C3zSKl8ezwaCNfQYcmhmQ8s7t247gNeEb0gf4iTmnbrkIpv2PzJFuWGzH6uljCx0R',
    imageAlt: 'Rustic freshly baked sourdough loaves beside a cup of flat white coffee',
    badgeIcon: 'card_giftcard',
    badgeLabel: 'BOGO FREE',
    badgeTone: 'green',
    tagIcon: 'local_cafe',
    tagLabel: 'Morning Treat',
    tagTone: 'text-tertiary-container',
    distance: '500m away',
    rating: '4.7',
    merchant: 'Artisan Cafe',
    category: 'Bakery & Cafe',
    title: 'Artisanal Sourdough & Coffee',
    description: 'Buy one cold brew or flat white coffee, get a warm organic sourdough pastry free before noon.',
    priceNote: 'Special Deal',
    price: '2-for-1 Pass',
  },
];

const CATEGORIES = ['All Deals', 'Food & Dining', 'Beauty & Spa', 'Retail & Fashion', 'Bakery & Cafe', 'Fitness'];
const RADII = ['< 2km', 'Within 5km', '10km'];

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3Eip6-YwMGMr2STXR6NjlkIqAII-LD6sDRlFtXw1cLegLNfxlrmjWW3_R4ir5If1ILMCOKRblbw-mPNO5b4ZqiYtRZTW4fx3DfV3OJP1xkSpbZi-3n4nhrNamAFwmWpn6j-iMdtSwNtst62BEsQIhY-iFIHUFeoVlc1WMw6MXAFuRMlfE5nRb9_W9qU-SugFifXcvYXdLR_4slYxxsMxl-XAzfoS4_q9U0gzdusyvc5fnBJBGBHcTMQ';

export function DesktopDiscoverDealsScreen({ onNav, onNext, onSkip, onOpenDeal }: DesktopDiscoverDealsScreenProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [radius, setRadius] = useState(RADII[1]);

  return (
    <div className="w-full min-h-screen bg-surface-canvas font-body-md text-text-primary flex flex-col antialiased">
      <DesktopNavHeader active="deals" onNav={onNav} />

      <main className="w-full pt-20 flex-1 bg-surface-canvas">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden bg-gradient-to-b from-surface-tint-blue/60 via-surface-canvas to-surface-canvas py-space-2xl md:py-space-3xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-margin">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-xl">
                <div className="inline-flex items-center gap-space-2xs bg-surface-tint-blue px-space-md py-space-2xs rounded-full shadow-sm w-fit">
                  <Icon name="near_me" className="text-primary text-[18px]" />
                  <span className="font-label-sm text-label-sm font-semibold text-primary uppercase tracking-wider">
                    Hyperlocal Discovery
                  </span>
                </div>

                <div className="flex items-center gap-space-sm bg-surface-subtle px-space-md py-space-2xs rounded-full shadow-sm">
                  <span className="font-caption text-caption text-text-secondary font-medium">Onboarding</span>
                  <div className="flex items-center gap-space-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                    <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  </div>
                  <span className="font-caption text-caption text-text-primary font-semibold">Step 2 of 3</span>
                </div>
              </div>

              <div className="max-w-3xl flex flex-col gap-space-xs mb-space-2xl">
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight font-bold">
                  Discover Deals Near You
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary">
                  See offers from top-tier businesses around your location and find something extraordinary worth
                  buying nearby.
                </p>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg bg-surface-subtle p-space-md rounded-2xl shadow-sm mb-space-2xl">
                <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
                  {CATEGORIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`px-space-md py-space-2xs rounded-full font-label-md text-label-md transition-all shadow-sm whitespace-nowrap ${
                        category === item
                          ? 'bg-primary-container text-on-primary'
                          : 'bg-surface-canvas text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-space-xs flex-shrink-0">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider flex items-center gap-space-2xs">
                    <Icon name="radar" className="text-[16px]" /> Radius:
                  </span>
                  <div className="inline-flex bg-surface-container p-0.5 rounded-full">
                    {RADII.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRadius(item)}
                        className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-all ${
                          radius === item
                            ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg mb-space-3xl">
                {CARDS.map((deal) => (
                  <article
                    key={deal.title}
                    role="button"
                    tabIndex={0}
                    onClick={onOpenDeal}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenDeal();
                      }
                    }}
                    className="group relative flex flex-col bg-surface-canvas rounded-2xl overflow-hidden shadow-[0_4px_16px_-2px_rgba(13,37,76,0.06)] hover:shadow-[0_12px_28px_-4px_rgba(13,37,76,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={deal.imageAlt}
                        src={deal.image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-text-primary/70 via-transparent to-transparent" />

                      <div
                        className={`absolute top-space-sm left-space-sm flex items-center gap-1 px-space-sm py-1 rounded-full font-label-sm text-label-sm font-bold shadow-sm ${
                          deal.badgeTone === 'blue'
                            ? 'bg-surface-tint-blue text-primary'
                            : 'bg-badge-discount-bg text-badge-discount-text'
                        }`}
                      >
                        <Icon name={deal.badgeIcon} className="text-[15px]" />
                        <span>{deal.badgeLabel}</span>
                      </div>

                      <div className="absolute top-space-sm right-space-sm bg-surface-canvas/90 backdrop-blur-md px-space-sm py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Icon name={deal.tagIcon} className={`text-[14px] ${deal.tagTone ?? 'text-primary'}`} />
                        <span className="font-caption text-caption text-text-primary font-semibold">{deal.tagLabel}</span>
                      </div>

                      <div className="absolute bottom-space-sm left-space-sm right-space-sm flex items-center justify-between text-on-primary">
                        <div className="flex items-center gap-1 font-caption text-caption">
                          <Icon name="location_on" className="text-[16px] text-primary-fixed" />
                          <span>{deal.distance}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-surface-canvas/20 backdrop-blur-md px-space-2xs py-0.5 rounded-md font-label-sm text-label-sm font-semibold">
                          <Icon name="star" filled className="text-tertiary-fixed-dim text-[14px]" />
                          <span>{deal.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
                      <div>
                        <div className="flex items-center gap-space-2xs text-text-tertiary font-label-sm text-label-sm mb-1">
                          <span>{deal.merchant}</span>
                          <span>•</span>
                          <span>{deal.category}</span>
                        </div>
                        <h3 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary-container transition-colors line-clamp-1">
                          {deal.title}
                        </h3>
                        <p className="font-caption text-caption text-text-secondary line-clamp-2 mt-1">
                          {deal.description}
                        </p>
                      </div>

                      <div className="pt-space-xs flex items-center justify-between">
                        <div>
                          <span
                            className={`font-caption text-caption block leading-tight ${
                              deal.priceNote.includes('₦') ? 'text-text-tertiary line-through' : 'text-text-tertiary'
                            }`}
                          >
                            {deal.priceNote}
                          </span>
                          <span
                            className={`font-heading-sm text-heading-sm font-bold ${
                              deal.priceAccent ? 'text-primary' : 'text-text-primary'
                            }`}
                          >
                            {deal.price}
                          </span>
                        </div>
                        <button
                          aria-label="Claim offer"
                          type="button"
                          onClick={(event) => event.stopPropagation()}
                          className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary-container hover:bg-primary-container hover:text-on-primary flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Icon name="bookmark_add" className="text-[20px]" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="relative bg-surface-subtle rounded-3xl p-space-xl mb-space-3xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="inline-flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold">
                      <Icon name="satellite_alt" className="text-[18px]" />
                      <span>Continuous Radar Scan</span>
                    </div>
                    <h2 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
                      Real-time local perks, updated every 15 minutes.
                    </h2>
                    <p className="font-body-md text-body-md text-text-secondary">
                      VEMTAP continuously verifies inventory, operational hours, and flash discounts across verified
                      neighborhood merchants so you never walk in on an expired deal.
                    </p>

                    <div className="grid grid-cols-3 gap-space-sm pt-space-xs">
                      <div className="bg-surface-canvas p-space-sm rounded-xl shadow-sm">
                        <span className="font-heading-sm text-heading-sm font-bold text-text-primary block">128+</span>
                        <span className="font-caption text-caption text-text-tertiary">Active Nearby</span>
                      </div>
                      <div className="bg-surface-canvas p-space-sm rounded-xl shadow-sm">
                        <span className="font-heading-sm text-heading-sm font-bold text-badge-discount-text block">
                          Avg. 25%
                        </span>
                        <span className="font-caption text-caption text-text-tertiary">Savings Rate</span>
                      </div>
                      <div className="bg-surface-canvas p-space-sm rounded-xl shadow-sm">
                        <span className="font-heading-sm text-heading-sm font-bold text-primary block">&lt; 15 min</span>
                        <span className="font-caption text-caption text-text-tertiary">Instant Claim</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 relative h-72 md:h-80 rounded-2xl overflow-hidden shadow-inner">
                    <div
                      className="w-full h-full bg-cover bg-center rounded-2xl"
                      data-location="Victoria Island, Lagos"
                      style={{ backgroundImage: `url('${MAP_IMAGE}')` }}
                    />
                    <div className="absolute inset-0 bg-primary-container/10 backdrop-blur-[1px] pointer-events-none" />

                    <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex items-center justify-center rounded-full h-8 w-8 bg-primary-container text-on-primary shadow-lg">
                          <Icon name="restaurant" className="text-[16px]" />
                        </span>
                      </div>
                      <span className="bg-surface-canvas/90 backdrop-blur-md px-2 py-0.5 rounded-full font-caption text-caption font-semibold shadow-sm text-text-primary mt-1">
                        Bistro 24
                      </span>
                    </div>

                    <div className="absolute bottom-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <span className="relative inline-flex items-center justify-center rounded-full h-7 w-7 bg-badge-discount-text text-on-primary shadow-lg">
                          <Icon name="spa" className="text-[15px]" />
                        </span>
                      </div>
                      <span className="bg-surface-canvas/90 backdrop-blur-md px-2 py-0.5 rounded-full font-caption text-caption font-semibold shadow-sm text-text-primary mt-1">
                        Glow Studio
                      </span>
                    </div>

                    <div className="absolute bottom-space-md left-space-md bg-surface-canvas/95 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-md flex items-center gap-space-sm">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-badge-discount-text opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-badge-discount-text" />
                      </span>
                      <span className="font-label-sm text-label-sm text-text-primary font-medium">
                        Scanning within 5.0 km radius
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-r from-surface-tint-blue via-surface-container-low to-surface-tint-blue rounded-3xl p-space-xl md:p-space-2xl shadow-sm text-center max-w-4xl mx-auto mb-space-3xl">
                <div className="flex flex-col items-center gap-space-md">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)]">
                    <Icon name="explore" className="text-[30px]" />
                  </div>
                  <div className="max-w-xl flex flex-col gap-1">
                    <h2 className="font-heading-md text-heading-md font-bold text-text-primary">
                      Ready to explore discounts in your area?
                    </h2>
                    <p className="font-body-md text-body-md text-text-secondary">
                      Set your pinpoint neighborhood location in Step 3 to unlock verified secret menu drops, fast
                      checkout, and exclusive walk-in rewards.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-space-md w-full sm:w-auto mt-space-sm">
                    <button
                      type="button"
                      onClick={onNext}
                      className="w-full sm:w-auto h-[52px] font-button-primary text-button-primary bg-primary-container hover:bg-primary text-on-primary px-space-2xl rounded-xl flex items-center justify-center gap-space-xs transition-all shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:shadow-lg"
                    >
                      <span>Next: Find What's Near You</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={onSkip}
                      className="w-full sm:w-auto h-[52px] font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary px-space-lg rounded-xl flex items-center justify-center transition-colors"
                    >
                      Skip for now
                    </button>
                  </div>

                  <div className="pt-space-xs">
                    <p className="font-label-sm text-label-sm text-text-tertiary">
                      Own a business?{' '}
                      <button
                        type="button"
                        onClick={() => onNav('for-business')}
                        className="text-primary hover:underline font-semibold ml-1"
                      >
                        Set up your business on VEMTAP →
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DesktopFooter onNav={onNav} />
    </div>
  );
}
