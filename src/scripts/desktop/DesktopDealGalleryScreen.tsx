import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';
import { validateDealGallery } from '../deals/dealStudioShared';
import { DealMediaGallery } from '../deals/DealMediaGallery';

interface DesktopDealGalleryScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: string) => void;
}

const STEPS = ['Deal & Products', 'Offer Setup', 'Deal Information', 'Deal Gallery', 'Review & Publish'];

/** Desktop Deal Gallery: the same live upload and AI prompt flow as mobile. */
export function DesktopDealGalleryScreen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
}: DesktopDealGalleryScreenProps) {
  const errors = validateDealGallery(studio);

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
              <span className="text-primary font-semibold">Step 4 of 5: Deal Gallery</span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm mt-space-2xs">
              {STEPS.map((label, index) => (
                <div key={label} className="flex items-center gap-space-xs">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-caption text-caption font-bold ${
                      index < 3
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : index === 3
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {index < 3 ? <Icon name="check" className="text-[15px]" /> : index + 1}
                  </span>
                  <span className={`font-label-sm text-label-sm ${index === 3 ? 'text-primary font-semibold' : 'text-on-surface'}`}>
                    {label}
                  </span>
                  {index < STEPS.length - 1 && <span className="w-8 h-0.5 bg-surface-container-highest" />}
                </div>
              ))}
            </div>
          </div>
          <span className="font-label-md text-label-md text-primary font-bold">80% Completed</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-space-xl pt-space-xl pb-space-3xl">
        <div className="flex flex-col gap-space-2xs mb-space-lg">
          <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">Deal gallery</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Add one compulsory main image or video and up to four additional media items. AI prompt buttons use
            everything you entered about this deal.
          </p>
        </div>

        <div className="max-w-5xl">
          <DealMediaGallery onStudioChange={onStudioChange} studio={studio} variant="desktop" />
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={onBack}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs"
            >
              <Icon name="arrow_back" className="text-[18px]" /> Back to Deal Information
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs"
            >
              <Icon name="save" className="text-[18px]" /> Save as Draft
            </button>
          </div>
          <button
            type="button"
            disabled={errors.length > 0}
            onClick={onNext}
            className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs disabled:opacity-40"
          >
            <span>{errors.length > 0 ? errors[0] : 'Preview & Publish'}</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
        </div>
      </div>
    </>
  );

  if (onNav) return <MerchantShell activeNav="business-deals" onNav={onNav}>{inner}</MerchantShell>;
  return <BusinessSetupChrome activeNav="deals">{inner}</BusinessSetupChrome>;
}
