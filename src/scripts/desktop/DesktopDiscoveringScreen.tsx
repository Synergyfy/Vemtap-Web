import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopDiscoveringScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onReady: () => void;
}

const MATCH_CARDS = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANS3djX6pm6cMqXKFUJ4hGra_90nynFDkNpTU4-S9kRgNGQrPTWqosaUYMUmgvFGD-QwVKX8g7lyF4vOdxMsdewYZPPDJZhfyLb9PYDv0RQElytELJ1ckpv7MYVghUbl3ZwRSdycMCY72PejejMZuIZiEa5dB6ZAHvjCNfUIWdKs42ZgexBukn1B_CZGe48SlUz5XQy44CpWFRc6uoRsiOafd0jKKS3AsRMPACrGfX',
    alt: 'Iced coffee and croissants on a table inside a bright modern cafe in Abuja',
    dealBadge: '25% OFF',
    timerIcon: 'schedule',
    timerText: '45m left',
    category: 'Food • Apo Resettlement',
    rating: '4.9',
    title: 'Artisan Roast • Breakfast Pair',
    copy: 'Complimentary fresh pastry on cold brew flight orders over ₦4,500.',
    distance: '0.6 km away',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANeyxLU4w1HYq22ALXrFxUvyb-vqk0uHJHOyfZRiHsqvArDF2sJI8qI9B03ARmUKh6cidrLfYRgJ53Y6Irxwk3NFJvngtLml0Dd2cUUH7Flz_fJ2tBbS_djHLjgfz8zttlJzxg8hONiSMwTfZ7I25nHHMWDFaDS-KEPyVBA3RdGd5zmG7eZqbd9Rqmz_rtDF4SY9CfgquBjHoQWeG_qxGZl0UiAL69HoLk9VuH5NyE',
    alt: 'Interior of a luxury sneaker boutique in Abuja with glowing display shelves',
    dealBadge: '₦8,000 VOUCHER',
    timerIcon: 'bolt',
    timerText: 'Flash Deal',
    category: 'Fashion • Apo Mall Zone',
    rating: '4.8',
    title: 'Sole District Flagship',
    copy: 'Instant checkout rebate on all retro releases and lifestyle apparel.',
    distance: '1.2 km away',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPys7eNPGCUOvBE3PF5FqtMNHn1OItgDNXGtb8OCFS55NEFzLNBMs5FcZpd6QxQ06ykwiv25wQNtkkwdMBAVlzBZ4KAG8jjQz1H2pfzy-5euYrdKQd3MdR0_FAEE_3ZmEb0ylae6ldLXFjBJMSvb7n8jNeZsOzPk83xBTRGtsIghQhRleQlJqlOoJQ0QOzLMfeSeB8bnqBkCwY1c53CVSmooOuWtUt76MIuezmG_s4',
    alt: 'Serene luxury day spa suite with essential oils and green plants in Abuja',
    dealBadge: '30% OFF',
    timerIcon: 'verified',
    timerText: 'Verified CAC',
    category: 'Wellness • Gudu – Apo',
    rating: '5.0',
    title: 'Serene Touch Wellness',
    copy: 'First-time reservation discount for deep tissue and hydro-therapy suites.',
    distance: '2.1 km away',
  },
];

const STAT_CHIPS = [
  { icon: 'bolt', tint: 'text-primary', label: '34 Flash Deals Unlocked' },
  { icon: 'storefront', tint: 'text-badge-discount-text', label: '18 Verified CAC Merchants' },
  { icon: 'local_cafe', tint: 'text-tertiary-container', label: '12 Local Dining Spots' },
];

export function DesktopDiscoveringScreen({ onNav, onReady }: DesktopDiscoveringScreenProps) {
  const [progress, setProgress] = useState(85);
  const [merchantCount, setMerchantCount] = useState(142);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (progress >= 100) return;
    const timer = window.setTimeout(() => {
      setProgress((value) => Math.min(100, value + 3));
      setMerchantCount((value) => value + Math.floor(Math.random() * 4) + 1);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    if (progress < 100) return;
    const timer = window.setTimeout(() => onReadyRef.current(), 1400);
    return () => window.clearTimeout(timer);
  }, [progress]);

  return (
    <DesktopPage activeNav="discover" onNav={onNav} withFooter withHeader>
      <section className="relative w-full overflow-hidden bg-surface py-space-xl lg:py-space-3xl flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full bg-gradient-to-tr from-primary-fixed/20 via-surface-tint-blue/30 to-transparent blur-3xl" />
          <div className="absolute -top-32 right-12 w-96 h-96 rounded-full bg-secondary-fixed/25 blur-2xl" />
          <div className="absolute -bottom-32 left-12 w-96 h-96 rounded-full bg-primary-fixed-dim/20 blur-2xl" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-margin flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-space-2xs rounded-full shadow-sm mb-space-lg">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="w-2 h-2 rounded-full bg-primary -ml-3" />
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
              Step 4 of 4 • Calibrating Feed
            </span>
          </div>

          <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight max-w-2xl">
            Finding what&apos;s around you...
          </h1>
          <p className="font-body-lg text-body-lg text-text-secondary max-w-xl mt-space-xs">
            Discovering verified deals, top-rated businesses, and curated products near Apo, Abuja.
          </p>

          <div className="relative w-full max-w-[620px] h-[480px] my-space-xl flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] rounded-full bg-surface-container-low shadow-[inset_0_0_40px_rgba(0,85,196,0.06)]" />
              <div className="absolute w-[380px] h-[380px] rounded-full bg-surface-container shadow-[inset_0_0_24px_rgba(0,85,196,0.08)]" />
              <div className="absolute w-[240px] h-[240px] rounded-full bg-surface-tint-blue shadow-inner" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[490px] h-[490px] rounded-full animate-ping opacity-20 bg-primary/20"
                style={{ animationDuration: '3.2s' }}
              />
              <div
                className="absolute w-[350px] h-[350px] rounded-full animate-ping opacity-30 bg-primary/25"
                style={{ animationDuration: '2.4s', animationDelay: '0.8s' }}
              />
            </div>

            <svg
              aria-hidden="true"
              className="absolute w-[500px] h-[500px] pointer-events-none z-10"
              viewBox="0 0 500 500"
            >
              <defs>
                <linearGradient id="desktopRadarSweep" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#0055c4" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#066cf4" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#066cf4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g transform="translate(250, 250)">
                <path d="M 0 0 L 0 -240 A 240 240 0 0 1 230 -60 Z" fill="url(#desktopRadarSweep)" />
                <animateTransform
                  attributeName="transform"
                  dur="4s"
                  from="0"
                  repeatCount="indefinite"
                  to="360"
                  type="rotate"
                />
              </g>
            </svg>

            <div className="relative z-20 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/30">
                <Icon name="near_me" filled className="text-[36px] -rotate-45" />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-badge-discount-text ring-4 ring-surface flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-surface-canvas animate-pulse" />
                </div>
              </div>
              <div className="mt-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-sm py-space-2xs rounded-full shadow-sm">
                <span className="font-caption text-caption font-semibold text-primary">
                  GPS: 9.0069° N, 7.5028° E
                </span>
              </div>
            </div>

            <div
              className="absolute -top-2 right-4 lg:right-6 z-20 animate-bounce"
              style={{ animationDuration: '3.6s' }}
            >
              <div className="bg-surface-canvas p-space-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-space-sm max-w-[240px] text-left">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <Icon name="coffee" className="text-[22px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-label-sm text-label-sm font-bold text-text-primary truncate">Cafe Neo</span>
                    <span className="font-caption text-caption bg-badge-discount-bg text-badge-discount-text px-1 rounded font-semibold">
                      -25%
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary truncate">Buy 1 Get 1 Free Promo</p>
                </div>
              </div>
            </div>

            <div className="absolute top-8 left-2 lg:left-6 z-20">
              <div className="bg-surface-canvas px-space-md py-space-xs rounded-full shadow-md flex items-center gap-space-xs">
                <Icon name="shopping_bag" className="text-base text-primary" />
                <span className="font-label-md text-label-md font-semibold text-text-primary">34 Deals Found</span>
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              </div>
            </div>

            <div className="absolute bottom-6 left-4 lg:left-8 z-20">
              <div className="bg-surface-canvas p-space-sm rounded-xl shadow-lg flex items-center gap-space-sm max-w-[230px] text-left">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                  <Icon name="steps" className="text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className="font-label-sm text-label-sm font-bold text-text-primary truncate block">
                    Sole District
                  </span>
                  <p className="font-caption text-caption text-primary font-medium truncate">
                    Weekend Sneaker Special
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 right-2 lg:right-8 z-20">
              <div className="bg-surface-canvas px-space-md py-space-xs rounded-full shadow-md flex items-center gap-space-xs">
                <Icon name="location_on" className="text-primary text-[18px]" />
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">Apo, Abuja</span>
                <span className="font-caption text-caption text-text-secondary">• &lt; 3.0 km</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl bg-surface-canvas p-space-lg rounded-xl shadow-md flex flex-col gap-space-md mb-space-lg text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  Scanning Apo, Abuja...
                </span>
              </div>
              <span className="font-caption text-caption text-text-secondary">
                {merchantCount} active merchant spots checked
              </span>
            </div>

            <div className="flex flex-col gap-space-2xs text-left">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-text-secondary font-medium">
                  Personalizing your local feed
                </span>
                <span className="font-label-md text-label-md font-bold text-primary tabular-nums">
                  {progress >= 100 ? '100% Ready!' : `${progress}%`}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary-container to-secondary transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-xs text-text-secondary font-caption text-caption">
              <span className="flex items-center gap-1">
                <Icon name="format_image_left" className="text-[15px] text-badge-discount-text" />
                Geo-verified listings only
              </span>
              <span className="flex items-center gap-1">
                <Icon name="speed" className="text-[15px] text-primary" />
                Instant redemption ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md w-full max-w-3xl mb-space-xl">
            {STAT_CHIPS.map((chip) => (
              <div
                key={chip.label}
                className="flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-xl bg-surface-container-low shadow-sm"
              >
                <Icon name={chip.icon} className={`${chip.tint} font-heading-sm text-heading-sm`} />
                <span className="font-label-md text-label-md font-semibold text-text-primary">{chip.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-space-sm">
            <button
              className="inline-flex items-center gap-space-xs font-button-primary text-button-primary text-primary hover:text-on-primary-fixed-variant transition-colors"
              type="button"
              onClick={onReady}
            >
              <span>Skip wait &amp; view all deals immediately</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <p className="font-caption text-caption text-text-tertiary">
              Your calibrated neighborhood feed will open automatically when ready.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-subtle py-space-2xl">
        <div className="max-w-6xl mx-auto px-margin">
          <div className="flex items-center justify-between mb-space-lg">
            <div>
              <h2 className="font-heading-md text-heading-md font-bold text-text-primary">
                Incoming Live Matches Around Apo
              </h2>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                Pre-cached discounts popping up in your neighborhood cluster right now
              </p>
            </div>
            <span className="hidden md:inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              <Icon name="sensors" className="text-[16px]" /> Active Radar Feed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {MATCH_CARDS.map((card) => (
              <article
                key={card.title}
                className="bg-surface-canvas rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg flex flex-col"
              >
                <div className="relative h-44 w-full bg-surface-container">
                  <img alt={card.alt} className="w-full h-full object-cover" src={card.image} />
                  <div className="absolute top-3 left-3 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold px-space-sm py-1 rounded-full shadow-sm">
                    {card.dealBadge}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-surface-canvas/90 backdrop-blur-md px-space-xs py-1 rounded font-caption text-caption font-semibold text-text-primary flex items-center gap-1">
                    <Icon name={card.timerIcon} className="text-[14px] text-primary" /> {card.timerText}
                  </div>
                </div>
                <div className="p-space-md flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
                        {card.category}
                      </span>
                      <span className="flex items-center gap-1 text-badge-discount-text font-caption text-caption font-bold">
                        <Icon name="star" className="text-[14px]" /> {card.rating}
                      </span>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold">{card.title}</h3>
                    <p className="font-body-md text-body-md text-text-secondary mt-1 line-clamp-2">{card.copy}</p>
                  </div>
                  <div className="pt-space-md mt-space-md flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                      <Icon name="near_me" className="text-[16px] text-primary" /> {card.distance}
                    </span>
                    <button
                      className="font-label-md text-label-md font-semibold text-primary hover:underline"
                      type="button"
                      onClick={onReady}
                    >
                      Preview →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </DesktopPage>
  );
}
