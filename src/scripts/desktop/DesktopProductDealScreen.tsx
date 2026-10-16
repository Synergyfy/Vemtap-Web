import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { getActiveVariants } from '../productVariants';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { ProductDraft } from './desktopProductDraft';

interface DesktopProductDealScreenProps {
  draft: ProductDraft;
  onConvert: () => void;
  onViewCatalog: () => void;
  onAddAnother: () => void;
}

const DEAL_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Gk5henx0H60v2fdWjUzQ4M51EhIGt-EodjVlELrfulMGBTQEwqYd_E2vcYNQ1FSQ4IPJzF75lzYdT8XlsmZ34LDGQpnOcjBNOJXtkAkRSZCOwKANa-8U_CaqUnTF_2uDUwd5a5ceT_gPbnIXZXXoxfzQAa7nmjSH6ddO9IWYDaRY33hXuoLx04bEsDmPNgiTjtkQvT4am40VAK9FlS2WSAQgP6M6o6IZ2zqyK4fU',
    alt: 'Close up gourmet plating of woodfire aged ribeye steak sizzling on dark cast iron skillet with rosemary sprig, roasted garlic, and melting herb butter, professional culinary photography with warm moody studio lighting',
  },
];

const DISCOUNT_PILLS = [15, 20, 25, 30];

const toNumber = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function DesktopProductDealScreen({
  draft,
  onConvert,
  onViewCatalog,
  onAddAnother,
}: DesktopProductDealScreenProps) {
  const [discount, setDiscount] = useState(20);
  const [convertState, setConvertState] = useState<'idle' | 'activating'>('idle');
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const activeBranchCount = Object.values(draft.branches).filter(Boolean).length;
  const activeVariants = getActiveVariants(draft);
  const variantPriceSource =
    activeVariants.find((variant) => variant.name === 'Regular')?.price ?? activeVariants[0]?.price ?? draft.basePrice;
  const parsedVariantPrice = toNumber(variantPriceSource);
  const basePrice =
    parsedVariantPrice > 0 ? parsedVariantPrice : toNumber(draft.basePrice);
  const dealPrice = Math.round(basePrice * (1 - discount / 100));
  const variantPrices = activeVariants.map((variant) => toNumber(variant.price)).filter((price) => price > 0);
  const priceMin = variantPrices.length > 0 ? Math.min(...variantPrices) : basePrice;
  const priceMax = variantPrices.length > 0 ? Math.max(...variantPrices) : basePrice;
  const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const handleConvert = () => {
    if (convertState !== 'idle') return;
    setConvertState('activating');
    timers.current.push(window.setTimeout(() => onConvert(), 600));
  };

  return (
    <BusinessSetupChrome activeNav="catalog">
      <div className="w-full bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-margin py-space-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
              <span className="w-7 h-2 rounded-full bg-primary-container" />
              <span className="w-2 h-2 rounded-full bg-outline-variant" />
              <span className="w-2 h-2 rounded-full bg-outline-variant" />
            </div>
            <div className="flex items-center gap-space-xs text-on-surface">
              <span className="font-label-md text-label-md text-primary font-semibold">Step 2 of 4:</span>
              <span className="font-label-md text-label-md text-text-primary">Create Deal Offer</span>
              <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full font-medium">
                100% Catalog Complete
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-lg text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
              <span className="font-caption text-caption">Catalog Live &amp; Synced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="schedule" className="text-[16px] text-primary" />
              <span className="font-caption text-caption">Est. Deal Setup: 30 secs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-margin w-full py-space-xl flex flex-col gap-space-xl">
        <div className="w-full rounded-2xl bg-surface-container-lowest shadow-md p-space-md sm:p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-start sm:items-center gap-space-md">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
              <img
                className="w-full h-full object-cover"
                alt={DEAL_IMAGES[0].alt}
                src={DEAL_IMAGES[0].src}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-xs mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <Icon name="store" className="text-[14px]" /> Catalog Status: Live in Storefront
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-medium">
                  {activeBranchCount} Active Branches
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-medium">
                  In Stock
                </span>
              </div>
              <h2 className="font-heading-sm text-heading-sm text-text-primary">{draft.title}</h2>
              <p className="font-body-md text-body-md text-text-secondary">
                Standard Pricing:{' '}
                <span className="font-semibold text-text-primary">
                  ₦{formatAmount(priceMin)} – ₦{formatAmount(priceMax)}
                </span>{' '}
                • Category: {draft.subCategory}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm self-end lg:self-center">
            <button
              type="button"
              className="px-space-md py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="visibility" className="text-[18px]" /> Preview Menu Item
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-primary">
            <Icon name="bolt" className="text-[20px]" filled />
            <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
              Discovery Radar Opportunity
            </span>
          </div>
          <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
            Growth Accelerator: Make this product a VEMTAP Deal?
          </h1>
          <p className="font-body-lg text-body-lg text-text-secondary max-w-3xl">
            Unlock high-intent foot traffic from thousands of nearby diners actively searching your neighborhood
            for limited-time offers right now.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="rounded-2xl p-space-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between transition-all">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-text-secondary">
                      <Icon name="menu_book" className="text-[22px]" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-caption text-caption text-text-secondary font-medium">
                      Standard
                    </span>
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary mb-1">Regular Product</h3>
                  <p className="font-body-md text-body-md text-text-secondary mb-space-md">
                    Listed in your standard menu catalog at full price. Visible only to patrons already browsing
                    your specific profile.
                  </p>
                  <div className="flex flex-col gap-2.5 pt-space-xs">
                    <div className="flex items-start gap-2">
                      <Icon name="check" className="text-[18px] text-outline mt-0.5" />
                      <span className="font-label-md text-label-md text-text-secondary">
                        Passive profile discovery
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="check" className="text-[18px] text-outline mt-0.5" />
                      <span className="font-label-md text-label-md text-text-secondary">
                        Full catalog margins retain 100%
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="close" className="text-[18px] text-outline-variant mt-0.5" />
                      <span className="font-label-md text-label-md text-text-tertiary">
                        No deals feed broadcast
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="close" className="text-[18px] text-outline-variant mt-0.5" />
                      <span className="font-label-md text-label-md text-text-tertiary">Zero push alert triggers</span>
                    </div>
                  </div>
                </div>
                <div className="mt-space-lg pt-space-md bg-surface-subtle p-3 rounded-xl flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Est. Daily Discovery Range</span>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">15 – 30 views</span>
                </div>
              </div>

              <div className="rounded-2xl p-space-lg bg-surface-tint-blue shadow-md relative overflow-hidden flex flex-col justify-between transition-all">
                <div className="absolute top-0 right-0 bg-primary-container text-on-primary font-caption text-caption px-3 py-1 rounded-bl-xl font-bold uppercase tracking-wider flex items-center gap-1">
                  <Icon name="local_fire_department" className="text-[14px]" /> Recommended
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                      <Icon name="radar" className="text-[22px]" />
                    </span>
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-primary mb-1">VEMTAP Deal Offer</h3>
                  <p className="font-body-md text-body-md text-text-primary mb-space-md">
                    Featured on the hyperlocal Deals Feed, map radar pings, and real-time push alerts to drive
                    walk-in customers instantly.
                  </p>
                  <div className="flex flex-col gap-2.5 pt-space-xs">
                    <div className="flex items-start gap-2">
                      <Icon name="check_circle" className="text-[18px] text-badge-discount-text mt-0.5" filled />
                      <span className="font-label-md text-label-md text-text-primary font-medium">
                        Hyperlocal 3km Radar Feed alert
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="check_circle" className="text-[18px] text-badge-discount-text mt-0.5" filled />
                      <span className="font-label-md text-label-md text-text-primary font-medium">
                        Map pin glow on consumer apps
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="check_circle" className="text-[18px] text-badge-discount-text mt-0.5" filled />
                      <span className="font-label-md text-label-md text-text-primary font-medium">
                        Exclusive "Deal Hunter" push alerts
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="check_circle" className="text-[18px] text-badge-discount-text mt-0.5" filled />
                      <span className="font-label-md text-label-md text-text-primary font-medium">
                        Cap quotas &amp; claim windows
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-space-lg pt-space-md bg-surface-canvas p-3 rounded-xl shadow-sm flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">
                    Est. First-Week Reach Boost
                  </span>
                  <span className="font-label-md text-label-md font-bold text-primary">+340% Foot Traffic</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading-sm text-heading-sm text-text-primary">
                    Hyperlocal Discovery Simulation
                  </h4>
                  <p className="font-caption text-caption text-text-secondary">
                    Simulated 3.5km consumer radius around Victoria Island &amp; Lekki Phase 1
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-md text-label-md font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" /> 1,840 Active
                  Hunters Online
                </span>
              </div>
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container-high flex items-center justify-center">
                <svg
                  className="w-full h-full text-primary"
                  fill="none"
                  viewBox="0 0 600 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="300"
                    cy="100"
                    r="40"
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    strokeOpacity="0.15"
                    strokeWidth="1.5"
                  />
                  <circle cx="300" cy="100" r="80" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
                  <circle
                    cx="300"
                    cy="100"
                    r="120"
                    stroke="currentColor"
                    strokeDasharray="6 6"
                    strokeOpacity="0.12"
                    strokeWidth="1"
                  />
                  <circle cx="300" cy="100" fill="currentColor" fillOpacity="0.9" r="9" />
                  <circle cx="300" cy="100" r="18" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
                  <circle cx="230" cy="65" fill="#059669" r="4" />
                  <circle cx="370" cy="75" fill="#059669" r="5" />
                  <circle cx="270" cy="140" fill="#059669" r="4" />
                  <circle cx="350" cy="130" fill="#059669" r="4.5" />
                  <circle cx="190" cy="120" fill="#059669" r="3.5" />
                  <circle cx="410" cy="95" fill="#059669" r="4" />
                  <path d="M300 100 L440 40 A140 140 0 0 0 300 0 Z" fill="currentColor" fillOpacity="0.08" />
                </svg>
                <div className="absolute bottom-3 left-4 bg-surface-canvas/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                  <span className="font-caption text-caption font-semibold text-text-primary">
                    Your Branch: Lekki Admiralty Way
                  </span>
                  <span className="text-text-tertiary text-xs">•</span>
                  <span className="font-caption text-caption text-text-secondary">
                    0.4 km average walk-time: 6m
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-space-md sm:p-space-lg bg-surface-container flex items-start gap-space-md shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
                <Icon name="lightbulb" className="text-[24px]" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Merchant Pro Tip</span>
                  <span className="font-caption text-caption text-tertiary font-semibold uppercase tracking-wider">
                    High Conversion Strategy
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  You do not have to discount everything. Pick signature dishes like this{' '}
                  <strong className="text-on-surface">Ribeye Steak</strong> as magnet offers to pull first-time
                  diners through your doors. Once seated, guests average 2.4× their ticket on drinks and sides at
                  regular margins!
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="rounded-3xl p-space-lg sm:p-space-xl bg-surface-canvas shadow-xl flex flex-col gap-space-md relative">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-md text-label-md font-bold flex items-center gap-1.5">
                  <Icon name="bolt" className="text-[16px]" /> Fastest Setup: 30 secs
                </span>
                <span className="font-caption text-caption text-text-secondary">Step 2 → Deal Studio</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-heading-lg text-heading-lg text-text-primary">
                  Turn into a Deal Now <span className="text-tertiary-container">🔥</span>
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  We will automatically import your photos, description, and base pricing straight into the Deal
                  Studio. Just choose your discount % and voucher quota!
                </p>
              </div>
              <div className="rounded-2xl p-space-md bg-surface-subtle flex flex-col gap-space-sm mt-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-text-secondary font-medium">
                    Suggested Deal Price:
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading-sm text-heading-sm text-badge-discount-text font-bold">
                      ₦{dealPrice.toLocaleString('en-US')}
                    </span>
                    <span className="font-caption text-caption text-text-tertiary line-through">
                      ₦{basePrice.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {DISCOUNT_PILLS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setDiscount(pill)}
                      className={`py-2 rounded-xl text-center font-label-md text-label-md transition-all cursor-pointer ${
                        discount === pill
                          ? 'bg-primary text-on-primary font-bold shadow-md'
                          : 'bg-surface-canvas shadow-sm text-text-secondary hover:bg-surface-tint-blue'
                      }`}
                    >
                      -{pill}%
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-space-xs text-text-secondary">
                  <span className="font-caption text-caption flex items-center gap-1">
                    <Icon name="check" className="text-[14px] text-badge-discount-text" /> High resolution photo
                    ready
                  </span>
                  <span className="font-caption text-caption flex items-center gap-1">
                    <Icon name="check" className="text-[14px] text-badge-discount-text" /> SKU #{draft.skuCode} linked
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleConvert}
                disabled={convertState !== 'idle'}
                className={`w-full py-4 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center cursor-pointer ${
                  convertState === 'activating' ? 'opacity-80 cursor-not-allowed hover:translate-y-0' : ''
                }`}
              >
                {convertState === 'idle' ? (
                  <>
                    <span>Convert to Deal Offer (Auto-Imported)</span>
                    <Icon name="arrow_forward" className="text-[20px]" />
                  </>
                ) : (
                  <>
                    <Icon name="progress_activity" className="text-[20px] animate-spin" />
                    <span>Activating...</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-space-xs text-text-tertiary">
                <Icon name="lock_clock" className="text-[16px]" />
                <span className="font-caption text-caption">
                  No upfront fees • You only pay standard 2.5% on redeemed vouchers
                </span>
              </div>
            </div>

            <div className="rounded-2xl p-space-lg bg-surface-container-low shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs text-text-secondary">
                <Icon name="inventory_2" className="text-[20px]" />
                <h4 className="font-heading-sm text-heading-sm text-text-primary">Keep as Regular Product Only</h4>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Item remains active in your standard in-store and takeout menus at full price, without external
                deal radar highlights.
              </p>
              <div className="pt-space-xs flex flex-col sm:flex-row gap-space-xs">
                <button
                  type="button"
                  onClick={onViewCatalog}
                  className="flex-1 py-3 px-space-md rounded-xl bg-surface-canvas hover:bg-surface-container-high text-text-primary font-label-md text-label-md text-center transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Icon name="list_alt" className="text-[18px]" /> View in Catalog
                </button>
                <button
                  type="button"
                  onClick={onAddAnother}
                  className="flex-1 py-3 px-space-md rounded-xl bg-surface-canvas hover:bg-surface-container-high text-text-primary font-label-md text-label-md text-center transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Icon name="add_circle" className="text-[18px]" /> Add Another Item
                </button>
              </div>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-subtle flex items-start gap-space-xs text-text-secondary">
              <Icon name="info" className="text-[18px] text-text-tertiary mt-0.5" />
              <p className="font-caption text-caption leading-relaxed">
                <strong>Flexible control:</strong> You can switch or promote any item anytime directly from your
                Products tab. Deal campaigns can be paused or capped at any threshold with zero penalty.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md mb-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary flex-shrink-0">
              <Icon name="smartphone" className="text-[24px]" />
            </div>
            <div>
              <h4 className="font-heading-sm text-heading-sm text-text-primary">
                Want to preview how consumers view this?
              </h4>
              <p className="font-caption text-caption text-text-secondary">
                Preview the VEMTAP Customer App Deal Card, Countdown Timer &amp; One-Tap Redemption flow.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-space-lg py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Icon name="open_in_new" className="text-[18px]" /> Test Consumer View
          </button>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
