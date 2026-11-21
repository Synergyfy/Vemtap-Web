import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { UserAvatar } from '../components/ui/UserAvatar';
import type { DealStudioDraft } from './dealStudio';
import { validateDealGallery } from './deals/dealStudioShared';
import { DealMediaGallery } from './deals/DealMediaGallery';
import type { ProductDraft } from './productDraft';

interface BusinessDealGalleryScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

/** Step 4: compulsory main media plus up to four additional deal media slots. */
export function BusinessDealGalleryScreen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessDealGalleryScreenProps) {
  const errors = validateDealGallery(studio);

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-space-xs text-on-surface"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider leading-none">
                VEMTAP Merchant
              </span>
              <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight">Create Deal</h1>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs">
            <button className="px-space-xs text-primary font-button-secondary text-button-secondary" type="button" onClick={onSaveDraft}>
              Save
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-40">
        <div className="px-margin pt-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Step 4 of 5: Deal Gallery</span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">80% Complete</span>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden mt-space-2xs">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '80%' }} />
          </div>
        </div>

        <div className="px-margin mt-space-md">
          <h2 className="font-heading-md text-heading-md text-text-primary">Deal gallery</h2>
          <p className="font-caption text-caption text-text-secondary">
            Add the media customers will see. A main image or video is required before publishing.
          </p>
        </div>

        <div className="px-margin mt-space-sm">
          <DealMediaGallery onStudioChange={onStudioChange} studio={studio} />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pb-safe flex flex-col gap-space-2xs pt-space-2xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center disabled:opacity-40"
          disabled={errors.length > 0}
          type="button"
          onClick={onNext}
        >
          <span>{errors.length > 0 ? errors[0] : 'Preview & Publish'}</span>
          {errors.length === 0 && <Icon name="arrow_forward" className="text-[18px]" />}
        </button>
        <button className="w-full h-9 rounded-xl text-text-secondary font-button-secondary text-button-secondary" type="button" onClick={onBack}>
          Back to deal information
        </button>
      </div>
    </AppScreen>
  );
}
