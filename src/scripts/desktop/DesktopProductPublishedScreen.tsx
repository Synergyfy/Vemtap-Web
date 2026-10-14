import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ProductDraft } from './desktopProductDraft';

interface DesktopProductPublishedScreenProps {
  draft: ProductDraft;
  onMakeDeal: () => void;
  onViewCatalog: () => void;
  onAddAnother: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const PUBLISHED_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpsN8HhOxVkyrlzsDSwWbUGCMx88H_i-90BzVRXFwiGexp5TQmPnpsXCVMNNUpRe7uxfo57ihFZuN1sb286o43Cccsc1Bfq4cETixHi2NZLcGFUUCbiCNWoIxrbEKlepUM4ZVandVLp9-O9ciAyksLpQx7Rt4rdxyME9dGck5X5bkm2ieVhQpVkkY1PujV1oiikexf1W1XU6HhE-7P1nVDVKkvKUKI9n8fsiZh3UpK',
    alt: 'Artisanal medium-rare woodfire aged ribeye steak sizzling on a cast-iron skillet with rosemary sprigs, sea salt flakes, and roasted garlic cloves, captured with warm commercial restaurant lighting and crisp hyper-detailed food photography styling.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9LdY0CvhdMswR-R5xFLz9LQRjT7nxUpev2XaZ4pOfMyf4P18wHhh1G1aIaxBM6szHaE4bxf-dXqtEamhiLknGLbvhiXSZpmsBNKQLZzcvZMaRsnoZGREGpYHQtX0xKOk3pmgTglu04s8IYQuKD5TPjotJRpqAcABLapXR1iWBm3iTUedNOncN7BvrdDZHas6WoYBgBt_x9YxEV5Zh4Rr3h9GEYFiceKFLpaLnrJXh',
    alt: 'Close up of gourmet steak voucher digital coupon card with clear discount ribbon, crisp aesthetic, and vibrant culinary presentation on minimalist background.',
  },
];

const segmentClass = (active: boolean, activeText: string) =>
  `flex items-center gap-2 px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer ${
    active ? `bg-surface-container-lowest shadow-sm ${activeText}` : 'text-text-secondary hover:text-on-surface'
  }`;

const toNumber = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function DesktopProductPublishedScreen({
  draft,
  onMakeDeal,
  onViewCatalog,
  onAddAnother,
  onNav,
}: DesktopProductPublishedScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [mode, setMode] = useState<'live' | 'draft'>('live');
  const [dealState, setDealState] = useState<'idle' | 'importing' | 'success'>('idle');
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const activeBranchCount = Object.values(draft.branches).filter(Boolean).length;
  const totalStock = draft.variants.reduce((sum, variant) => sum + toNumber(variant.inventory), 0);
  const variantPrices = draft.variants.map((variant) => toNumber(variant.price)).filter((price) => price > 0);
  const priceMin = variantPrices.length > 0 ? Math.min(...variantPrices) : toNumber(draft.basePrice);
  const priceMax = variantPrices.length > 0 ? Math.max(...variantPrices) : toNumber(draft.basePrice);

  const handleMakeDeal = () => {
    if (dealState !== 'idle') return;
    setDealState('importing');
    timers.current.push(window.setTimeout(() => setDealState('success'), 900));
    timers.current.push(window.setTimeout(() => onMakeDeal(), 2100));
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-surface-tint-blue/70 via-surface to-background pb-space-3xl">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-72 h-72 bg-tertiary-fixed/30 rounded-full blur-2xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-margin pt-space-xl">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="relative mb-space-md">
              <div className="w-16 h-16 rounded-2xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shadow-lg shadow-badge-discount-text/10">
                <Icon name="check_circle" className="text-[36px]" filled />
              </div>
              <div className="absolute -top-2 -right-3 px-2 py-0.5 rounded-full bg-surface-container-lowest shadow-sm flex items-center gap-1">
                <Icon name="auto_awesome" className="text-tertiary-container text-[14px]" />
                <span className="font-caption text-caption text-on-surface font-semibold tracking-wide uppercase">
                  Live Radar
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" /> Live on Storefront
              </span>
              <span className="text-text-tertiary font-caption text-caption">•</span>
              <span className="font-caption text-caption text-text-secondary">
                Radius: 3.5 km Hyperlocal Discovery
              </span>
            </div>
            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight mb-space-xs">
              Product is Live on Storefront!
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl">
              Shoppers within 3.5 km can now discover, browse, and order this item in real-time. Sync is
              established across your active store terminal network.
            </p>
            <div className="mt-space-lg flex items-center p-1 bg-surface-container-high rounded-full shadow-inner">
              <button
                type="button"
                onClick={() => setMode('live')}
                className={segmentClass(mode === 'live', 'text-primary')}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" /> ● Live on Storefront
              </button>
              <button
                type="button"
                onClick={() => setMode('draft')}
                className={segmentClass(mode === 'draft', 'text-on-surface')}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant" /> ○ Saved as Draft
              </button>
            </div>
          </div>

          <div className="mt-space-2xl grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
            <section className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-lg shadow-md">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="inventory_2" className="text-primary text-[20px]" />
                    <span className="font-label-md text-label-md text-on-surface font-semibold tracking-tight">
                      Live Item Dossier
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-caption text-caption text-on-surface-variant font-medium">
                    SKU: {draft.skuCode}
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-surface-container mb-space-md group">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={PUBLISHED_IMAGES[0].alt}
                    src={PUBLISHED_IMAGES[0].src}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                      Active in {activeBranchCount} Hubs
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-caption text-caption font-semibold">
                      Fresh Batch
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-caption text-caption flex items-center gap-1.5">
                    <Icon name="visibility" className="text-[14px]" />
                    <span>Visible to ~12.4k users</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-space-2xs">
                  <h2 className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight">
                    {draft.title}
                  </h2>
                  <span className="font-heading-sm text-heading-sm text-primary font-bold">
                    ₦{priceMin.toLocaleString('en-US')}{' '}
                    <span className="font-label-md text-label-md text-text-secondary font-normal">–</span> ₦
                    {priceMax.toLocaleString('en-US')}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary mb-space-md">{draft.description}</p>
                <div className="grid grid-cols-2 gap-space-sm mb-space-md">
                  <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Aggregate Inventory</span>
                    <span className="font-heading-sm text-heading-sm text-on-surface font-bold mt-1">
                      {totalStock} Units
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium mt-0.5">
                      Healthy coverage
                    </span>
                  </div>
                  <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Active Hubs</span>
                    <span className="font-heading-sm text-heading-sm text-on-surface font-bold mt-1">
                      {activeBranchCount} Locations
                    </span>
                    <span className="font-caption text-caption text-primary font-medium mt-0.5">
                      VI &amp; Lekki Phase 1
                    </span>
                  </div>
                </div>
                <div className="space-y-space-xs pb-space-sm">
                  <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <Icon name="storefront" className="text-[16px] text-text-tertiary" />
                      Victoria Island Flagship (Adeola Odeku)
                    </span>
                    <span className="font-semibold text-on-surface">28 units</span>
                  </div>
                  <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <Icon name="storefront" className="text-[16px] text-text-tertiary" />
                      Lekki Hub (Admiralty Way)
                    </span>
                    <span className="font-semibold text-on-surface">20 units</span>
                  </div>
                </div>
              </div>
              <div className="mt-space-md p-space-sm rounded-xl bg-surface-tint-blue flex items-start gap-space-xs">
                <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary font-semibold">Live Mode Enabled</span>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5">
                    Live items can be ordered immediately by local shoppers browsing your storefront. You can
                    toggle this to Draft at any time to temporarily pause orders.
                  </p>
                </div>
              </div>
            </section>

            <section className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-tint-blue p-space-xl shadow-xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/5 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-semibold">
                    <Icon name="local_fire_department" className="text-[18px]" filled />
                    Growth Booster
                  </div>
                  <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                    <Icon name="bolt" className="text-[15px] text-primary" />
                    Pre-Filled Deal Studio
                  </span>
                </div>
                <h2 className="font-heading-lg text-heading-lg text-on-surface tracking-tight mb-space-xs">
                  Boost Foot Traffic with a VEMTAP Deal 🔥
                </h2>
                <p className="font-label-md text-label-md text-primary font-semibold mb-space-sm">
                  Instant One-Tap Import
                </p>
                <p className="font-body-md text-body-md text-text-secondary max-w-xl mb-space-lg">
                  Transform this Ribeye Steak into a featured promotional voucher. Photos, pricing, and branches
                  will pre-fill into Deal Studio automatically.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm mb-space-lg">
                  <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                    <span className="font-caption text-caption text-text-secondary">Expected Reach</span>
                    <div className="my-2">
                      <span className="font-display-hero text-[30px] leading-tight text-primary font-bold">3.8x</span>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">
                      More views on Hyperlocal Map &amp; Deals radar
                    </span>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                    <span className="font-caption text-caption text-text-secondary">Average Conversion</span>
                    <div className="my-2">
                      <span className="font-display-hero text-[30px] leading-tight text-badge-discount-text font-bold">
                        +44%
                      </span>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Higher same-day checkout volume
                    </span>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                    <span className="font-caption text-caption text-text-secondary">Setup Speed</span>
                    <div className="my-2">
                      <span className="font-display-hero text-[30px] leading-tight text-tertiary font-bold">
                        {'< 60s'}
                      </span>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Zero asset re-uploading required
                    </span>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm mb-space-lg flex items-center gap-space-md">
                  <div className="w-20 h-16 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt={PUBLISHED_IMAGES[1].alt}
                      src={PUBLISHED_IMAGES[1].src}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                        20% OFF Suggested
                      </span>
                      <span className="font-caption text-caption text-text-secondary">Flash Weekend Voucher</span>
                    </div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold truncate mt-1">
                      Woodfire Aged Ribeye Steak Tasting Voucher
                    </p>
                    <p className="font-caption text-caption text-text-secondary">
                      Target price: ₦15,600 (Save ₦3,900)
                    </p>
                  </div>
                  <Icon name="arrow_forward" className="text-outline-variant text-[24px] hidden sm:block" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
                <button
                  type="button"
                  onClick={handleMakeDeal}
                  disabled={dealState !== 'idle'}
                  className={`w-full sm:w-auto flex-1 h-[52px] px-space-xl rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary shadow-lg shadow-primary-container/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-space-2xs cursor-pointer ${
                    dealState !== 'idle' ? 'opacity-90 cursor-not-allowed' : ''
                  }`}
                >
                  {dealState === 'idle' && (
                    <>
                      <span>Make as a Deal 🔥</span>
                      <Icon name="arrow_forward" className="text-[20px]" />
                    </>
                  )}
                  {dealState === 'importing' && (
                    <>
                      <Icon name="progress_activity" className="text-[20px] animate-spin" />
                      <span>Importing into Studio...</span>
                    </>
                  )}
                  {dealState === 'success' && (
                    <>
                      <Icon name="check" className="text-[20px]" />
                      <span>Imported to Deals!</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 text-text-secondary font-caption text-caption shrink-0">
                  <Icon name="verified" className="text-[16px] text-badge-discount-text" />
                  <span>No lock-in contract</span>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-space-2xl pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <Icon name="auto_stories" className="text-[22px]" />
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  Ready for customer transactions
                </p>
                <p className="font-caption text-caption text-text-secondary">
                  Inventory counts synchronize with your POS app in real-time.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-md">
              <button
                type="button"
                onClick={onViewCatalog}
                className="h-11 px-space-lg rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-button-secondary text-button-secondary transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Icon name="table_rows" className="text-[18px]" />
                <span>View in Products Catalog</span>
              </button>
              <button
                type="button"
                onClick={onAddAnother}
                className="font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Icon name="add" className="text-[18px]" />
                <span>Add Another Product or Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
