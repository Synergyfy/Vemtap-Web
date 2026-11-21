import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { ProductDraft } from './productDraft';
import type { DealStudioDraft } from './dealStudio';
import { DealMediaPreview } from './deals/DealMediaGallery';
import {
  DEAL_PUBLICATION_COPY,
  publishDeal,
  type DealPublicationResult,
} from './deals/dealPublication';
import {
  dealBadgeLabel,
  dealTypeTitle,
  formatDealAmount,
  formatDealDate,
  resolveDealPricing,
  selectedRegularTotal,
  validateDealConfiguration,
  validateDealGallery,
  validateDealInformation,
  describeQuantityTiers,
  galleryDealMedia,
  mainDealMedia,
} from './deals/dealStudioShared';
import { useDealProductCatalog } from '../hooks/business/useDealStudioLive';

interface BusinessDealStudioStep4ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onBack: () => void;
  onEditOffer: () => void;
  onEditRules: () => void;
  onEditGallery: () => void;
  onEditLocations: () => void;
  onPublish: () => void;
  livePublish?: () => Promise<DealPublicationResult>;
  onSaveDraft: () => void;
}

/** Step 5: preview the customer-facing deal (including its gallery) and publish it. */
export function BusinessDealStudioStep4Screen({
  studio,
  onBack,
  onEditOffer,
  onEditRules,
  onEditGallery,
  onEditLocations,
  onPublish,
  livePublish,
  onSaveDraft,
}: BusinessDealStudioStep4ScreenProps) {
  const [publication, setPublication] = useState<DealPublicationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const { catalog } = useDealProductCatalog();
  const selectedProducts = catalog.filter((product) => studio.productIds.includes(product.id));
  const regularTotal = selectedRegularTotal(studio, catalog);
  const pricing = resolveDealPricing(studio, regularTotal, catalog);
  const errors = [
    ...validateDealConfiguration(studio, regularTotal, catalog),
    ...validateDealInformation(studio),
    ...validateDealGallery(studio),
  ];
  const canPublish = errors.length === 0 && !publishing;
  const mainMedia = mainDealMedia(studio);
  const galleryMedia = galleryDealMedia(studio);
  const title = studio.title.trim() || dealTypeTitle(studio.structure ?? null);

  const handlePublish = async () => {
    if (!canPublish || publication) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const result = livePublish
        ? await livePublish()
        : publishDeal({ dealTitle: title, studio });
      setPublication(result);
      setShowResult(true);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Could not publish this deal.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <button aria-label="Go back" className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-space-xs text-on-surface" type="button" onClick={onBack}>
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider leading-none">VEMTAP Merchant</span>
              <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight">Preview & Publish</h1>
            </div>
          </div>
          <button className="px-space-xs text-primary font-button-secondary text-button-secondary" type="button" onClick={onSaveDraft}>Save</button>
        </div>
      </header>

      <div className="flex flex-col w-full pb-44">
        <div className="px-margin pt-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Step 5 of 5: Review & Publish</span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">100% Complete</span>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden mt-space-2xs">
            <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="px-margin mt-space-md">
          <h2 className="font-heading-md text-heading-md text-text-primary">How customers will see it</h2>
          <p className="font-caption text-caption text-text-secondary">Check the preview before publishing.</p>
        </div>

        <div className="px-margin mt-space-sm bg-surface-canvas rounded-2xl overflow-hidden shadow-sm ring-1 ring-border-subtle">
          <DealMediaPreview alt={title} className="h-44 w-full" item={mainMedia} />
          <div className="p-space-sm flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between gap-space-xs">
              <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                {dealBadgeLabel(studio, pricing.savingsPct)}
              </span>
              {studio.freeDelivery && (
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Free Delivery
                </span>
              )}
            </div>
            <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold">{title}</h3>
            {studio.description && <p className="font-caption text-caption text-text-secondary">{studio.description}</p>}
            <div className="flex items-baseline gap-space-xs">
              <span className="font-heading-md text-heading-md text-primary font-bold">₦{formatDealAmount(pricing.dealPrice)}</span>
              <span className="font-label-sm text-label-sm text-text-tertiary line-through">₦{formatDealAmount(pricing.originalTotal)}</span>
              <span className="ml-auto font-caption text-caption text-badge-discount-text font-semibold">
                Save ₦{formatDealAmount(Math.max(pricing.savings, 0))}
              </span>
            </div>
            <p className="font-caption text-caption text-text-tertiary">
              {formatDealDate(studio.startDate)} → {formatDealDate(studio.endDate)} • {studio.vouchers} available
            </p>
          </div>
        </div>

        <div className="px-margin mt-space-sm rounded-xl bg-surface-container-lowest p-space-sm shadow-sm flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Deal gallery</span>
            <span className="font-caption text-caption text-text-secondary">{1 + galleryMedia.length} of 5 slots used</span>
          </div>
          <div className="flex gap-space-2xs overflow-x-auto pb-space-2xs">
            {[mainMedia, ...galleryMedia].map((item, index) => (
              <DealMediaPreview
                alt={`${title} media ${index + 1}`}
                className="h-16 w-20 rounded-lg shrink-0"
                item={item}
                key={`${item?.url ?? 'empty'}-${index}`}
              />
            ))}
          </div>
        </div>

        <div className="px-margin mt-space-sm rounded-xl bg-surface-container-lowest p-space-sm shadow-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Deal structure</span>
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">{dealTypeTitle(studio.structure ?? null)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Products</span>
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">{selectedProducts.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Deal quantity</span>
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">{studio.vouchers}</span>
          </div>
          {studio.structure === 'buy-more-save-more' &&
            describeQuantityTiers(studio, regularTotal).map((line) => (
              <p key={line} className="font-caption text-caption text-text-secondary">{line}</p>
            ))}
        </div>

        <div className="px-margin mt-space-sm flex flex-wrap gap-space-xs">
          <button className="px-space-sm py-space-2xs rounded-lg bg-surface-subtle text-primary font-label-sm text-label-sm" type="button" onClick={onEditOffer}>Edit offer</button>
          <button className="px-space-sm py-space-2xs rounded-lg bg-surface-subtle text-primary font-label-sm text-label-sm" type="button" onClick={onEditRules}>Edit deal information</button>
          <button className="px-space-sm py-space-2xs rounded-lg bg-surface-subtle text-primary font-label-sm text-label-sm" type="button" onClick={onEditGallery}>Edit deal gallery</button>
          <button className="px-space-sm py-space-2xs rounded-lg bg-surface-subtle text-primary font-label-sm text-label-sm" type="button" onClick={onEditLocations}>Edit branches</button>
        </div>

        {errors.length > 0 && (
          <div className="px-margin mt-space-sm rounded-xl bg-error-container px-space-sm py-space-2xs flex flex-col gap-1">
            {errors.map((error) => (
              <p key={error} className="font-caption text-caption text-on-error-container">• {error}</p>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pb-safe flex flex-col gap-space-2xs pt-space-2xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {publishError && (
          <p className="rounded-lg bg-error-container px-space-xs py-space-2xs font-caption text-caption text-on-error-container">{publishError}</p>
        )}
        <button
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center disabled:opacity-40"
          disabled={!canPublish}
          type="button"
          onClick={() => void handlePublish()}
        >
          <span>{publishing ? 'Publishing…' : publication ? 'Published' : 'Publish Deal'}</span>
          {!publishing && !publication && <Icon name="rocket_launch" className="text-[18px]" />}
        </button>
        <button className="w-full h-9 rounded-xl text-text-secondary font-button-secondary text-button-secondary" type="button" onClick={onPublish}>
          Continue without publishing
        </button>
      </div>

      {showResult && publication && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 flex items-end sm:items-center justify-center p-0 sm:p-space-md">
          <div className="w-full max-w-[430px] rounded-t-2xl sm:rounded-2xl bg-surface-canvas p-space-lg flex flex-col items-center gap-space-sm text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${DEAL_PUBLICATION_COPY[publication.status].tone}`}>
              <Icon name={DEAL_PUBLICATION_COPY[publication.status].icon} className="text-[34px]" />
            </div>
            <h3 className="font-heading-md text-heading-md text-on-surface font-bold">{DEAL_PUBLICATION_COPY[publication.status].title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{publication.message}</p>
            <p className="font-caption text-caption text-on-surface-variant">Ref {publication.reference}</p>
            <button
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary"
              type="button"
              onClick={() => {
                setShowResult(false);
                onPublish();
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
