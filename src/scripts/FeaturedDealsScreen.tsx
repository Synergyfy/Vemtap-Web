import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface FeaturedDeal {
  img: string;
  alt: string;
  discount: string;
  promo: string;
  distance: string;
  area: string;
  urgencyIcon: string;
  urgencyText: string;
  urgencyClass: string;
  merchant: string;
  rating: string;
  title: string;
  desc: string;
  oldPrice: string;
  price: string;
  save: string;
}

const DEALS: FeaturedDeal[] = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlWSBpyzahSuoexRCi945DXbk25G3sOolUkU-bTSrPFP2K_8an0qvPDjWE1YWz__udUS6v9e77f3-bh0PRMzHX1fYw0T1Uqnh4rVw0vz3qZyyhDbn11JKiGBd4cDU8yvmm3f_lzZM3mDLss2dgr6AIbXJqjRLqE13vozGcqwvL6UE3JJBuhhU2FZWotpFN6sceKIS4cMrBWh9JNj_tlopO8seHPwpOpcb2byLhpTkFDKexqEbXkbbP9Q',
    alt: 'A mouthwatering gourmet burger platter served on warm rustic dark slate with seasoned potato wedges, craft pale ale beer with condensation, and vibrant artisanal dipping sauces in a trendy modern restaurant interior with warm ambient hanging pendant lights and soft background blur in Apo Abuja Nigeria',
    discount: '20% OFF',
    promo: 'Promoted',
    distance: '0.4 km',
    area: 'Apo Boulevard',
    urgencyIcon: 'schedule',
    urgencyText: 'Expires in 4h',
    urgencyClass: 'bg-error-container/90 text-on-error-container',
    merchant: 'Urban Grill & Bistro',
    rating: '4.9',
    title: '20% Off Prime Lunch Combo & Craft Beverage',
    desc: 'Signature flame-grilled cut with seasoned sides, cold pressed house soda or craft iced tea.',
    oldPrice: '₦12,000',
    price: '₦9,600',
    save: 'Save ₦2,400',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMMq2p2R60fy8nGqTffVlFuNFXj_JULtN0PNvSiorrseQ547ZELJ0-_5LlDP143Y8OEsKVTl2FHNPDecHuhTb7lpTitdZ25h2DOskoIaVC_LsM9bBnQ8YCdkGDMLCMMoXDaZFjPN0w4adJQeOLhyHH6t7ZQCC3utKwWOqo4NX3UlgCef4CI1SNLquEyqk6gDCtGh04yrZ2ZZnNSSP_3jfqWKeC8-cbQozghrDp3g6S0fDoVEpMM7EEUw',
    alt: 'Row of exclusive limited-edition sneakers on minimalist concrete display shelves in a premium streetwear boutique studio, neon ambient blue lighting, reflective polished floor, crisp modern fashion aesthetics in Area 11 Abuja',
    discount: '30% OFF',
    promo: 'Sponsored',
    distance: '1.2 km',
    area: 'Area 11',
    urgencyIcon: 'bolt',
    urgencyText: 'Limited 15 Left',
    urgencyClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    merchant: 'Sole District Boutique',
    rating: '4.8',
    title: 'Weekend Sneaker Drop & Urban Streetwear Pass',
    desc: 'Valid across high-top designer sneakers, oversized graphic hoodies, and fresh cargo caps.',
    oldPrice: '₦40,000',
    price: '₦28,000',
    save: 'Save ₦12,000',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoTMqwPuiebQOXvJeWM5oQp_ToAp7FZcPST3J3ZoYcy29Zn7KMjrfHyqiXRx8tl6pP2n3V_AefaCcYRoUEstW96G2ecZLusMKY2aNOkEv3aPVMYkFRdXVZQdaUOPBoEWrAJzzIj6PdsTxjyqYnFc5QMG8lKM5jJ7Nk1nPgGSiWEocU_RH7qm1TiGresCuBrngLlYJDj5ZmXqEHidslSExNBectOm5IWU8MfpsxkvJHlDbSl3X_ntQyuw',
    alt: 'Serene luxury spa treatment room with warm wooden slat walls, white rolled towels, eucalyptus leaves in a glass vase, gentle candle glow, soothing modern aesthetic in Maitama Abuja luxury wellness salon',
    discount: '25% OFF',
    promo: 'Promoted',
    distance: '1.4 km',
    area: 'Maitama Heights',
    urgencyIcon: 'trending_up',
    urgencyText: 'Popular',
    urgencyClass: 'bg-surface-tint-blue text-primary',
    merchant: 'Glow & Serenity Spa & Salon',
    rating: '5.0',
    title: 'Weekend Glow Facial & Sauna Therapy Pass',
    desc: 'Full 75-minute hydration peel, deep facial mask, steam sauna, and complimentary herbal detox infusion.',
    oldPrice: '₦25,000',
    price: '₦18,500',
    save: 'Save ₦6,500',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1cAXhSqymfVjN281YG5KWwJqFViU_QUk0ifJxzxQeb3rRiQaknLiDNP5IvunH6hJ1HrDx8UR7rj251rGzYeuXomeJXNF6qJ8k9wZ4qaS0nIIgWPdo5BU1RBE64NmiITAOlLUkBpzSPeUY8AZko8GsqrbLbMPii0vvSSNBHiirCWC2-djSbX54bc4kvZw5MjYZl02qKUOJqu7gm_b-4_VP7sqEQvV23nJIp1tstplMSG9JRnNqNqmfyw',
    alt: 'Rooftop terrace fine dining table overlooking panoramic city skyline at sunset in Central District Abuja, fine wine glasses, exquisite culinary seafood presentation, warm violet sky tones and ambient fairy lights',
    discount: '50% OFF',
    promo: 'Sponsored',
    distance: '2.1 km',
    area: 'Central District',
    urgencyIcon: 'alarm',
    urgencyText: 'Ends Tonight',
    urgencyClass: 'bg-error-container text-on-error-container',
    merchant: 'The Sky Lounge & Grill',
    rating: '4.9',
    title: "Chef's 5-Course Sunset Tasting Menu for Two",
    desc: 'Handcrafted seasonal courses including braised beef short ribs, grilled king prawns, and chocolate soufflé.',
    oldPrice: '₦49,000',
    price: '₦24,500',
    save: 'Save ₦24,500',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTiTiNm-VwwOcHXKte7bQeh4Lm5yTwqooorUJyORX5ZYUCFDIyF_Xpdz9rnX3V70M3TUdXW8YFqe0Wq1_ogHbzibWschLM89u6CEHHEF8fcTkQwJC9g64f8sZOexYv4-lsBOtpumfyr3P1k_osWCmlUZDFXXfe5nnKjswHF7K6CLNvm3qyywi7duHCkLkWIqNMCAnlMUUNbRA2fxpaVTBd1HMccupvCTYfZFxtFNPEfHMOkhIq-tUUmQ',
    alt: 'Freshly baked sourdough artisan loaf with crisp golden crust sliced on a light wooden cutting board next to a cup of creamy cappuccino with latte art in a sunlit Scandinavian bakery cafe in Garki Abuja',
    discount: '30% OFF',
    promo: 'Promoted',
    distance: '2.8 km',
    area: 'Garki II',
    urgencyIcon: 'bakery_dining',
    urgencyText: 'Breakfast Only',
    urgencyClass: 'bg-secondary-fixed text-on-secondary-fixed',
    merchant: 'Artisan Bakery & Cafe',
    rating: '4.7',
    title: 'Artisanal Sourdough & Specialty Breakfast Combo',
    desc: 'Warm sourdough basket, avocado mash, poached free-range eggs, and double shot flat white.',
    oldPrice: '₦6,500',
    price: '₦4,500',
    save: 'Save ₦2,000',
  },
];

const SORTS: { label: string; icon: string; filled?: boolean }[] = [
  { label: 'Closest to You', icon: 'near_me', filled: true },
  { label: 'Highest Discount', icon: 'percent' },
  { label: 'Ending Soon', icon: 'timer' },
  { label: 'Popular', icon: 'local_fire_department' },
];

const RADII = ['3 km', '5 km', '10 km', '25 km'];

export interface FeaturedDealsScreenProps {
  onBack: () => void;
  onOpenDeal: () => void;
}

function dealCardProps(onOpen: () => void) {
  return {
    onClick: onOpen,
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen();
      }
    },
  };
}

export function FeaturedDealsScreen({ onBack, onOpenDeal }: FeaturedDealsScreenProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [radius, setRadius] = useState('10 km');
  const [sortIndex, setSortIndex] = useState(0);
  const [saved, setSaved] = useState<boolean[]>(() => DEALS.map(() => false));
  const [toast, setToast] = useState<string | null>(null);
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

  const toggleSaved = (index: number) => {
    setSaved((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center -ml-space-xs text-on-surface rounded-full active:scale-95 transition-transform"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-space-2xs min-w-0">
                <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Featured Deals</h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption uppercase tracking-wider font-semibold">
                  Promoted
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Filter deals"
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-full active:scale-95 transition-transform"
            >
              <Icon name="tune" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 bg-surface">
        <div className="flex flex-col w-full">
          <section className="flex flex-col gap-space-sm px-margin pt-space-md pb-space-xs bg-surface-canvas shadow-sm">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs min-w-0 bg-surface-container-low px-space-sm py-space-xs rounded-full">
                <Icon name="location_on" className="text-primary text-[18px] flex-shrink-0" filled />
                <span className="font-label-md text-label-md text-on-surface truncate font-semibold">Apo, Abuja</span>
                <span className="font-caption text-caption text-text-secondary">Within</span>
                <button
                  aria-label="Adjust radius"
                  type="button"
                  onClick={() => setDrawerOpen((open) => !open)}
                  className="flex items-center gap-0.5 font-label-md text-label-md text-primary font-bold active:scale-95 transition-transform"
                >
                  <span>{radius}</span>
                  <Icon name="expand_more" className="text-[16px]" />
                </button>
              </div>
              <div className="flex items-center gap-1 px-space-xs py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>5 Live Deals</span>
              </div>
            </div>

            <div
              className={
                drawerOpen
                  ? 'flex items-center justify-between gap-space-xs p-space-xs bg-surface-container rounded-xl transition-all duration-300'
                  : 'hidden'
              }
            >
              <span className="font-caption text-caption text-text-secondary pl-1">Max distance:</span>
              <div className="flex items-center gap-1">
                {RADII.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setRadius(value);
                      setDrawerOpen(false);
                    }}
                    className={
                      value === radius
                        ? 'px-2.5 py-1 rounded-full text-caption font-label-sm font-semibold bg-primary text-on-primary shadow-sm transition-all'
                        : 'px-2.5 py-1 rounded-full text-caption font-label-sm font-semibold bg-surface-canvas text-text-secondary transition-all'
                    }
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1 -mx-margin px-margin">
              {SORTS.map((sort, index) => (
                <button
                  key={sort.label}
                  type="button"
                  onClick={() => setSortIndex(index)}
                  className={
                    index === sortIndex
                      ? 'flex items-center gap-1 px-space-sm h-9 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold whitespace-nowrap active:scale-95 transition-transform'
                      : 'flex items-center gap-1 px-space-sm h-9 rounded-full bg-surface-container text-text-secondary font-label-md text-label-md font-medium whitespace-nowrap active:scale-95 transition-transform'
                  }
                >
                  <Icon name={sort.icon} className="text-[16px]" filled={Boolean(sort.filled) && index === sortIndex} />
                  <span>{sort.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-start gap-space-xs p-space-xs bg-surface-container-low rounded-xl mb-1">
              <Icon name="verified_user" className="text-primary text-[17px] mt-0.5 flex-shrink-0" />
              <p className="font-caption text-caption text-text-secondary leading-snug">
                Promoted and sponsored offers from verified local merchants near your GPS pinpoint. Ranked strictly by
                geographic distance.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-space-md px-margin py-space-md">
            {DEALS.map((deal, index) => (
              <article
                key={deal.title}
                {...dealCardProps(onOpenDeal)}
                className="flex flex-col bg-surface-canvas rounded-2xl shadow-sm overflow-hidden active:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative w-full h-44 overflow-hidden">
                  <img className="w-full h-full object-cover" alt={deal.alt} src={deal.img} />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                      {deal.discount}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-caption text-caption font-medium tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
                      {deal.promo}
                    </span>
                  </div>
                  <button
                    aria-label="Save deal"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSaved(index);
                    }}
                    className={
                      saved[index]
                        ? 'absolute top-3 right-3 w-9 h-9 rounded-full bg-error-container backdrop-blur-md flex items-center justify-center text-error shadow-sm active:scale-90 transition-transform'
                        : 'absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-canvas/90 backdrop-blur-md flex items-center justify-center text-text-primary shadow-sm active:scale-90 transition-transform'
                    }
                  >
                    <Icon name={saved[index] ? 'favorite' : 'favorite_border'} className="text-[20px]" filled={saved[index]} />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas/95 backdrop-blur-md shadow-sm">
                    <Icon name="near_me" className="text-primary text-[14px]" filled />
                    <span className="font-caption text-caption text-text-primary font-bold">{deal.distance}</span>
                    <span className="font-caption text-caption text-text-secondary">• {deal.area}</span>
                  </div>
                  <div
                    className={`absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md font-caption text-caption font-semibold ${deal.urgencyClass}`}
                  >
                    <Icon name={deal.urgencyIcon} className="text-[13px]" />
                    <span>{deal.urgencyText}</span>
                  </div>
                </div>
                <div className="flex flex-col p-space-md gap-space-xs">
                  <div className="flex items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-label-md text-label-md font-bold text-text-primary truncate">{deal.merchant}</span>
                      <Icon name="check_circle" className="text-primary text-[16px] flex-shrink-0" filled />
                      <span className="font-caption text-caption text-text-tertiary">Verified Partner</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-tertiary-container flex-shrink-0">
                      <Icon name="star" className="text-[15px]" filled />
                      <span className="font-caption text-caption font-bold text-text-primary">{deal.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary leading-snug font-bold">{deal.title}</h3>
                  <p className="font-body-md text-caption text-text-secondary line-clamp-1">{deal.desc}</p>
                  <div className="flex items-center justify-between gap-space-sm pt-space-xs mt-1">
                    <div className="flex flex-col">
                      <span className="font-caption text-caption text-text-tertiary line-through leading-none">{deal.oldPrice}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading-md text-heading-md text-text-primary font-bold">{deal.price}</span>
                        <span className="font-caption text-caption text-badge-discount-text font-semibold">{deal.save}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenDeal}
                      className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold shadow-sm active:scale-95 transition-transform flex items-center gap-1"
                    >
                      <span>View Deal</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <footer className="flex flex-col items-center px-margin pt-space-sm pb-space-2xl text-center">
            <div className="w-full p-space-md rounded-2xl bg-surface-container-low flex flex-col items-center gap-space-2xs text-center shadow-sm">
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary mb-1">
                <Icon name="info" className="text-[20px]" />
              </div>
              <h4 className="font-label-md text-label-md font-bold text-text-primary">About Featured Listings</h4>
              <p className="font-caption text-caption text-text-secondary max-w-xs leading-relaxed">
                Featured Deals are sponsored placements boosted by verified local merchants. Ranking is strictly computed
                based on exact real-time GPS proximity to Apo, Abuja.
              </p>
              <button
                type="button"
                onClick={() => showToast('Ranking is based on live GPS distance from Apo, Abuja')}
                className="mt-space-xs font-caption text-caption text-primary font-semibold flex items-center gap-0.5 active:opacity-75"
              >
                <span>Learn how VEMTAP ranking works</span>
                <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            </div>
            <div className="mt-space-lg flex items-center gap-1.5 text-center justify-center">
              <span className="font-caption text-caption text-text-secondary">Own a business in Abuja?</span>
              <button
                type="button"
                onClick={() => showToast('Business Boost opens in the merchant hub')}
                className="font-caption text-caption font-semibold text-primary flex items-center gap-0.5 active:opacity-75"
              >
                <span>Boost your deals on VEMTAP</span>
                <Icon name="chevron_right" className="text-[14px]" />
              </button>
            </div>
          </footer>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
