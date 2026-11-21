import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';
import { DEAL_PUBLICATION_COPY, publishDeal, type DealPublicationResult } from '../deals/dealPublication';
import { DealMediaPreview } from '../deals/DealMediaGallery';
import {
  dealBadgeLabel,
  dealTypeTitle,
  describeQuantityTiers,
  formatDealAmount,
  formatDealDate,
  galleryDealMedia,
  mainDealMedia,
  resolveDealPricing,
  selectedRegularTotal,
  validateDealConfiguration,
  validateDealGallery,
  validateDealInformation,
} from '../deals/dealStudioShared';
import { useDealProductCatalog } from '../../hooks/business/useDealStudioLive';

interface DesktopDealStudioStep4ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onBack: () => void;
  onEditOffer: () => void;
  onEditRules: () => void;
  onEditGallery: () => void;
  onEditLocations: () => void;
  onPublish: () => void;
  livePublish?: () => Promise<DealPublicationResult>;
  onAnalytics?: () => void;
  onSaveDraft: () => void;
  onNav?: (key: string) => void;
}

const STEPS = ['Deal & Products', 'Offer Setup', 'Deal Information', 'Deal Gallery', 'Review & Publish'];

/** Step 5: customer preview and publish for desktop. */
export function DesktopDealStudioStep4Screen({
  studio,
  onBack,
  onEditOffer,
  onEditRules,
  onEditGallery,
  onEditLocations,
  onPublish,
  livePublish,
  onSaveDraft,
  onNav,
}: DesktopDealStudioStep4ScreenProps) {
  const [publication, setPublication] = useState<DealPublicationResult | null>(null);
  const [showModal, setShowModal] = useState(false);
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
  const title = studio.title.trim() || dealTypeTitle(studio.structure ?? null);
  const mainMedia = mainDealMedia(studio);
  const galleryMedia = galleryDealMedia(studio);

  const handlePublish = async () => {
    if (!canPublish || publication) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const result = livePublish ? await livePublish() : publishDeal({ dealTitle: title, studio });
      setPublication(result);
      setShowModal(true);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Could not publish this deal.');
    } finally {
      setPublishing(false);
    }
  };

  const inner = (
    <>
      <div className="w-full bg-surface-container-lowest px-space-xl py-space-lg shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs text-secondary font-caption text-caption">
              <span>Catalog Workflow</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Deal Studio</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-primary font-semibold">Step 5 of 5: Review & Publish</span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm mt-space-2xs">
              {STEPS.map((label, index) => (
                <div key={label} className="flex items-center gap-space-xs">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-caption text-caption font-bold ${
                    index < 3 ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary text-on-primary'
                  }`}>
                    {index < 3 ? <Icon name="check" className="text-[15px]" /> : index + 1}
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <span className="font-label-md text-label-md text-primary font-bold">100% Completed</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-space-xl pt-space-xl pb-space-3xl">
        <div className="flex flex-col gap-space-2xs mb-space-lg">
          <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">Preview before publishing</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            This is how the deal will appear to customers. Publish when everything looks right.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-2xl overflow-hidden shadow-sm ring-1 ring-border-subtle max-w-xl">
              <DealMediaPreview alt={title} className="h-64 w-full" item={mainMedia} />
              <div className="p-space-md flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                    {dealBadgeLabel(studio, pricing.savingsPct)}
                  </span>
                  {studio.freeDelivery && (
                    <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">Free Delivery</span>
                  )}
                </div>
                <h2 className="font-heading-md text-heading-md text-on-surface font-bold">{title}</h2>
                {studio.description && <p className="font-body-md text-body-md text-on-surface-variant">{studio.description}</p>}
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-heading-lg text-heading-lg text-primary font-bold">₦{formatDealAmount(pricing.dealPrice)}</span>
                  <span className="font-label-md text-label-md text-on-surface-variant line-through">₦{formatDealAmount(pricing.originalTotal)}</span>
                  <span className="ml-auto font-caption text-caption text-badge-discount-text font-semibold">Save ₦{formatDealAmount(Math.max(pricing.savings, 0))}</span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant">
                  {formatDealDate(studio.startDate)} → {formatDealDate(studio.endDate)} • {studio.vouchers} available
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Deal gallery</span>
                <span className="font-caption text-caption text-on-surface-variant">{1 + galleryMedia.length} of 5 slots used</span>
              </div>
              <div className="grid grid-cols-5 gap-space-2xs">
                {[mainMedia, ...galleryMedia].map((item, index) => (
                  <DealMediaPreview
                    alt={`${title} media ${index + 1}`}
                    className="h-20 w-full rounded-lg"
                    item={item}
                    key={`${item?.url ?? 'empty'}-${index}`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">Deal structure</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">{dealTypeTitle(studio.structure ?? null)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">Selected products</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">{selectedProducts.length}</span>
              </div>
              {selectedProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg bg-surface-subtle px-space-sm py-space-2xs">
                  <span className="font-label-sm text-label-sm text-on-surface truncate">{product.name}</span>
                  <span className="font-label-sm text-label-sm text-text-secondary">₦{formatDealAmount(product.price)}</span>
                </div>
              ))}
              {studio.structure === 'buy-more-save-more' &&
                describeQuantityTiers(studio, regularTotal).map((line) => (
                  <p key={line} className="font-caption text-caption text-text-secondary">{line}</p>
                ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm">
              <span className="font-label-md text-label-md text-on-surface font-bold">Final checks</span>
              {errors.length === 0 ? (
                <div className="mt-space-sm flex items-start gap-space-xs rounded-xl bg-badge-discount-bg p-space-sm">
                  <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
                  <p className="font-body-md text-body-md text-badge-discount-text font-medium">Everything is ready to publish.</p>
                </div>
              ) : (
                <div className="mt-space-sm rounded-xl bg-error-container p-space-sm flex flex-col gap-1">
                  {errors.map((error) => (
                    <p key={error} className="font-caption text-caption text-on-error-container">• {error}</p>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-space-xs mt-space-md">
                <button type="button" onClick={onEditOffer} className="px-space-sm py-space-2xs rounded-lg bg-surface-subtle text-primary font-label-sm text-label-sm">Edit offer</button>
                <button type="button" onClick={onEditRules} className="px-space-sm py-space-2xs rounded-lg bg-surface-subtle text-primary font-label-sm text-label-sm">Edit information</button>
                <button type="button" onClick={onEditGallery} className="px-space-sm py-space-2xs rounded-lg bg-surface-subtle text-primary font-label-sm text-label-sm">Edit gallery</button>
                <button type="button" onClick={onEditLocations} className="px-space-sm py-space-2xs rounded-lg bg-surface-subtle text-primary font-label-sm text-label-sm">Edit branches</button>
              </div>
            </div>
            {publishError && (
              <div className="rounded-xl bg-error-container p-space-sm font-caption text-caption text-on-error-container">{publishError}</div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <button type="button" onClick={onBack} className="px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs">
              <Icon name="arrow_back" className="text-[18px]" /> Back
            </button>
            <button type="button" onClick={onSaveDraft} className="px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs">
              <Icon name="save" className="text-[18px]" /> Save as Draft
            </button>
          </div>
          <button
            type="button"
            disabled={!canPublish}
            onClick={() => void handlePublish()}
            className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs disabled:opacity-40"
          >
            <span>{publishing ? 'Publishing…' : publication ? 'Published' : 'Publish Deal'}</span>
            <Icon name="rocket_launch" className="text-[20px]" />
          </button>
        </div>
      </div>

      {showModal && publication && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 flex items-center justify-center p-space-md">
          <div className="w-full max-w-md rounded-2xl bg-surface-canvas p-space-lg flex flex-col items-center gap-space-sm text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${DEAL_PUBLICATION_COPY[publication.status].tone}`}>
              <Icon name={DEAL_PUBLICATION_COPY[publication.status].icon} className="text-[36px]" />
            </div>
            <h3 className="font-heading-md text-heading-md text-on-surface font-bold">{DEAL_PUBLICATION_COPY[publication.status].title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{publication.message}</p>
            <p className="font-caption text-caption text-on-surface-variant">Ref {publication.reference}</p>
            <button type="button" onClick={() => { setShowModal(false); onPublish(); }} className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary">
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (onNav) return <MerchantShell activeNav="business-deals" onNav={onNav}>{inner}</MerchantShell>;
  return <BusinessSetupChrome activeNav="deals">{inner}</BusinessSetupChrome>;
}
