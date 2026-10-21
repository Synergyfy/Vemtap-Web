import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { isVariantProduct, getActiveVariants } from './productVariants';
import type { ProductDraft } from './productDraft';

interface BusinessProductPublishedScreenProps {
  draft: ProductDraft;
  onMakeDeal: () => void;
  onViewCatalog: () => void;
  onAddAnother: () => void;
}

const PUBLISHED_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0Wh9xjF3B-zT_UtyEIQsJ3MJ5Nadrc7dh12xOz_oxUozleqQFqIUeNRPhAC9Ch20Gh_54SPHuh_nrIsknnAK7GvyhQECDTbnTtv7bkygOTr_mqpLLspYr64Z06RABfyxEoSApwtls0D9cXuxTjCq3l5c7OPU3kGA43YHkV1b1KELzw1n14KRVIFCAEQR78DsaPYLmiCz4QPg-zwrgtVN6kVsoh-CdnJimByWCriftRACku84Bj60QcA',
    alt: 'Mouthwatering thick-cut woodfire aged ribeye steak sizzling on a rustic cast iron platter with rosemary garnish, tender charred exterior, ambient warm restaurant lighting with deep amber and warm copper tones.',
  },
];

const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function BusinessProductPublishedScreen({
  draft,
  onMakeDeal,
  onViewCatalog,
  onAddAnother,
}: BusinessProductPublishedScreenProps) {
  const [status, setStatus] = useState<'live' | 'draft'>('live');
  const isLive = status === 'live';

  const activeBranchCount = Object.values(draft.branches).filter(Boolean).length;
  const activeVariants = getActiveVariants(draft);
  const variantMode = isVariantProduct(draft);
  const totalStock = activeVariants.reduce((sum, variant) => sum + parseAmount(variant.inventory), 0);
  const variantPrices = activeVariants.map((variant) => parseAmount(variant.price)).filter((price) => price > 0);
  const lowPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : parseAmount(draft.basePrice);
  const highPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : lowPrice;
  const thumbnail = PUBLISHED_IMAGES[0];

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-2xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all"
              type="button"
              onClick={onViewCatalog}
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">
                Product Published Or Saved As Draft
              </h1>
              <span className="font-caption text-caption text-text-secondary truncate">
                Merchant Portal · Product Setup
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <div className="inline-flex items-center px-space-sm py-1 rounded-full bg-surface-tint-blue">
              <span className="font-label-sm text-label-sm text-primary font-semibold">Step 4 of 4</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full">
        <div className="px-margin pt-space-md pb-space-xs flex flex-col items-center text-center relative overflow-hidden">
          <div className="relative flex items-center justify-center my-space-xs">
            <div className="w-16 h-16 rounded-full bg-surface-tint-blue flex items-center justify-center shadow-sm">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_4px_16px_rgba(6,108,244,0.35)]">
                <Icon filled name="check_circle" className="text-[26px]" />
              </div>
            </div>
            <Icon
              filled
              name="auto_awesome"
              className="absolute -top-1 -right-1 text-tertiary-container text-[20px] animate-bounce"
            />
          </div>
          <h2 className="font-heading-md text-heading-md text-on-surface mt-space-xs">
            {isLive ? 'Product is Live on Storefront!' : 'Product Saved as Draft'}
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1 max-w-[320px]">
            {isLive ? (
              <>
                Shoppers within <span className="font-semibold text-text-primary">3.5 km</span> can now
                discover, browse, and order this item in real-time.
              </>
            ) : (
              'Hidden from customer search. Safe to update, edit pricing, or publish whenever you are ready.'
            )}
          </p>
          <div className="mt-space-md w-full max-w-[342px] p-1 rounded-full bg-surface-container flex items-center shadow-inner">
            <button
              className={`flex-1 py-2 px-space-sm rounded-full font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all duration-200 ${
                isLive
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-on-surface'
              }`}
              type="button"
              onClick={() => setStatus('live')}
            >
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span>Live on Storefront</span>
            </button>
            <button
              className={`flex-1 py-2 px-space-sm rounded-full font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all duration-200 ${
                !isLive
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-on-surface'
              }`}
              type="button"
              onClick={() => setStatus('draft')}
            >
              <span className="w-2 h-2 rounded-full bg-text-tertiary" />
              <span>Saved as Draft</span>
            </button>
          </div>
        </div>

        <div className="px-margin flex flex-col gap-space-md mt-space-sm pb-space-2xl">
          <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] flex flex-col gap-space-sm">
            <div className="flex items-start gap-space-sm">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                <img alt={thumbnail.alt} className="w-full h-full object-cover" src={thumbnail.src} />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-on-surface/80 backdrop-blur-sm text-surface-canvas font-caption text-caption font-semibold">
                  {activeBranchCount} Locs
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${
                      isLive
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : 'bg-surface-container-high text-text-secondary'
                    }`}
                  >
                    {isLive ? (
                      <Icon filled name="fiber_manual_record" className="text-[13px]" />
                    ) : (
                      <Icon name="edit_note" className="text-[13px]" />
                    )}
                    <span>{isLive ? 'Active in Catalog' : 'Draft Mode'}</span>
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">ID #VT-8821</span>
                </div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface truncate mt-1">
                  {draft.title}
                </h3>
                <p className="font-button-primary text-button-primary text-primary mt-0.5">
                  {variantMode ? (
                    <>
                      ₦{formatAmount(lowPrice)}{' '}
                      <span className="text-text-secondary font-normal text-caption">to</span> ₦
                      {formatAmount(highPrice)}
                    </>
                  ) : (
                    <>₦{formatAmount(lowPrice)}</>
                  )}
                </p>
              </div>
            </div>
            <div className="pt-space-2xs flex items-center justify-between bg-surface-subtle p-space-xs rounded-lg text-text-secondary font-label-sm text-label-sm">
              <div className="flex items-center gap-1.5">
                <Icon name="inventory_2" className="text-secondary text-[16px]" />
                <span>{variantMode ? `${totalStock} units in stock` : 'Standard item stock'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="storefront" className="text-secondary text-[16px]" />
                <span>Victoria Island &amp; Lekki 1</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-xs">
            <Icon name="info" className="text-primary text-[22px] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-primary font-semibold">
                {isLive ? 'Live Mode Enabled' : 'Draft Mode Stored Privately'}
              </span>
              <p className="font-caption text-caption text-text-secondary mt-0.5 leading-relaxed">
                {isLive
                  ? 'Live items can be ordered immediately by local shoppers browsing your storefront. You can toggle this to Draft at any time to temporarily pause orders.'
                  : 'This item will NOT appear on customer maps, menus, or checkout flows until published.'}
              </p>
            </div>
          </div>

          <div className="relative w-full rounded-xl overflow-hidden shadow-[0_8px_24px_-4px_rgba(6,108,244,0.18)] bg-gradient-to-br from-surface-tint-blue via-surface-container-lowest to-surface-container-high p-space-md flex flex-col gap-space-sm">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                <Icon
                  filled
                  name="local_fire_department"
                  className="text-[16px] text-tertiary-container animate-pulse"
                />
                <span>Growth Booster</span>
              </div>
              <span className="font-caption text-caption font-semibold text-primary">
                Instant One-Tap Import
              </span>
            </div>
            <div className="flex flex-col">
              <h4 className="font-heading-sm text-heading-sm text-on-surface">
                Boost Foot Traffic with a VEMTAP Deal 🔥
              </h4>
              <p className="font-body-md text-body-md text-text-secondary mt-1 leading-snug">
                Transform {draft.title || 'this item'} into a featured promotional voucher. Photos, pricing, and
                branches will pre-fill into Deal Studio automatically.
              </p>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-canvas/90 backdrop-blur rounded-lg p-space-xs shadow-sm">
              <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0">
                <Icon name="trending_up" className="text-[18px]" />
              </div>
              <p className="font-label-sm text-label-sm text-text-primary">
                Deals get{' '}
                <strong className="text-primary font-bold">3.8x more views</strong> on the Hyperlocal Map
                &amp; Deals radar.
              </p>
            </div>
            <button
              className="w-full h-[52px] mt-space-2xs rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all shadow-[0_8px_24px_-4px_rgba(6,108,244,0.30)] hover:bg-primary"
              type="button"
              onClick={onMakeDeal}
            >
              <span>Make as a Deal 🔥</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>

          <div className="flex flex-col gap-space-xs pt-space-xs pb-space-lg">
            <button
              className="w-full h-[50px] rounded-xl bg-surface-container text-on-surface font-button-primary text-button-primary flex items-center justify-center gap-2 active:bg-surface-container-high transition-colors"
              type="button"
              onClick={onViewCatalog}
            >
              <Icon name="format_list_bulleted" className="text-[20px]" />
              <span>View in Products Catalog</span>
            </button>
            <button
              className="w-full h-[48px] rounded-xl bg-transparent text-text-secondary font-label-md text-label-md flex items-center justify-center gap-2 hover:text-on-surface active:bg-surface-container-low transition-colors"
              type="button"
              onClick={onAddAnother}
            >
              <Icon name="add" className="text-[18px]" />
              <span>Add Another Product or Service</span>
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
