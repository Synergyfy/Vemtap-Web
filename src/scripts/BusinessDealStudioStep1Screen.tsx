import { useState } from 'react';
import { useLiveDealBranch } from '../hooks/business/useLiveDealBranch';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { DealStudioDraft, DealStrategy } from './dealStudio';
import { DEAL_TYPE_OPTIONS, formatDealAmount, parseDealAmount, validateDealConfiguration } from './deals/dealStudioShared';
import { useDealBranches, useDealBundleCatalog } from '../hooks/business/useDealStudioLive';
import { draftImage, draftImageAlt } from './desktop/draftImage';
import { DealTypeConfigurator, DealTypeSelector } from './deals/DealStudioConfigurator';
import type { ComboProduct } from './deals/dealStudioShared';
import { getActiveVariants } from './productVariants';
import type { ProductDraft } from './productDraft';

interface BusinessDealStudioStep1ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const CATALOG_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBegO6wZn1Pkyeh_W7ogUoWoPzSup52SZy9Qsv6qu352UGD-32nsoPXPdnWU7nzr5oCNyyr75usbf5NsToY0h3jUp20Yx0TjiC4ooAn7tTorbsmJt1FlbxzZPG8gxGnyC7reOdNjoxbsGkzsqOHoDHTxpu0LhM33K2au5310WOcVSSixIJC5Kd047-jUuSz4P91sE2DGDRYKlajb2AVzoJ6n9vqYzYzQA9VXNAQCioA',
  alt: 'Gourmet prime woodfire aged ribeye steak sizzling on dark rustic slate with fresh rosemary sprig and coarse sea salt garnish, warm moody restaurant ambient lighting, rich deep brown and caramel tones, commercial food styling shot',
};

export function BusinessDealStudioStep1Screen({
  draft,
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessDealStudioStep1ScreenProps) {
  const [page, setPage] = useState<'choose' | 'configure'>(studio.strategy ? 'configure' : 'choose');

  const activeStrategy = DEAL_TYPE_OPTIONS.find((item) => item.id === studio.strategy);

  const activeVariants = getActiveVariants(draft);
  const regularVariant = activeVariants.find((variant) => variant.name === 'Regular') ?? activeVariants[0];
  const baseAmount = parseDealAmount(regularVariant?.price ?? draft.basePrice);
  const liveBranch = useLiveDealBranch();
  // Live: the branches picked for the deal (step 3); demo keeps the samples.
  const dealBranches = useDealBranches(studio);
  const activeBranchCount = liveBranch.live ? dealBranches.selectedIds.length : Object.values(studio.branches).filter(Boolean).length;

  const bundleCatalog: ComboProduct[] = useDealBundleCatalog(draft.title, baseAmount);
  const configErrors = studio.strategy ? validateDealConfiguration(studio, baseAmount, bundleCatalog) : [];

  const chooseStrategy = (id: DealStrategy) => {
    onStudioChange({ strategy: id });
    setPage('configure');
    window.scrollTo(0, 0);
  };

  const backToChoose = () => {
    setPage('choose');
    window.scrollTo(0, 0);
  };

  const openConfigure = () => {
    setPage('configure');
    window.scrollTo(0, 0);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-space-xs text-on-surface hover:text-primary active:scale-95 transition-transform"
              type="button"
              onClick={page === 'configure' ? backToChoose : onBack}
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider leading-none">
                VEMTAP Merchant
              </span>
              <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate max-w-[170px]">
                {page === 'configure' ? 'Discount Setup' : 'Basic Details'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Save Draft"
              className="min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-transform"
              type="button"
              onClick={onSaveDraft}
            >
              Save
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(6,108,244,0.25)]">
              <Icon name="person" className="text-on-primary text-[16px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-36">
        <div className="px-margin pt-space-sm pb-space-2xs flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-on-primary font-caption font-semibold">
                1
              </span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                Step 1 of 4: Discount Strategy
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-semibold">25% Complete</span>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '25%' }} />
          </div>
        </div>

        <div className="px-margin mt-space-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-space-sm px-space-sm py-space-2xs">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <img className="w-full h-full object-cover" alt={draftImageAlt(draft.title, CATALOG_IMAGE.alt)} src={draftImage(draft.mainImage, CATALOG_IMAGE.src)} />
                <div className="absolute bottom-0.5 left-0.5 px-1 py-px rounded bg-surface-canvas/90 backdrop-blur-sm flex items-center gap-0.5 shadow-xs">
                  <Icon name="sync" className="text-primary text-[9px]" filled />
                  <span className="font-caption text-[8px] leading-tight text-text-secondary font-medium">
                    POS Live
                  </span>
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-grow">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider leading-none">
                  Synced Catalog Item
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate leading-snug">
                  {draft.title}
                </h2>
                <div className="flex items-baseline gap-space-2xs">
                  <span className="font-label-sm text-label-sm text-text-secondary">Base:</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-bold">
                    ₦{formatDealAmount(baseAmount)}
                  </span>
                  {liveBranch.live ? null : <span className="font-caption text-caption text-text-tertiary">/ 350g cut</span>}
                  <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption font-semibold">
                    <span className="w-1 h-1 rounded-full bg-badge-discount-text inline-block" />
                    {activeBranchCount} {activeBranchCount === 1 ? 'Branch' : 'Branches'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-surface-subtle px-space-sm py-1">
              <div className="flex items-center gap-1 text-text-secondary">
                <Icon name="storefront" className="text-[13px] text-primary" />
                <span className="font-caption text-caption">{liveBranch.live
                    ? dealBranches.selected.length > 1
                      ? dealBranches.selected.map((branch) => branch.name).join(' • ')
                      : dealBranches.selected[0]?.area || liveBranch.area
                    : 'Victoria Island & Lekki Phase 1'}</span>
              </div>
              <button
                className="font-caption text-caption text-primary font-semibold hover:underline flex items-center gap-0.5"
                type="button"
              >
                Change item <Icon name="tune" className="text-[12px]" />
              </button>
            </div>
          </div>
        </div>

        {page === 'choose' && (
          <>
            <div className="px-margin mt-space-md">
              <h3 className="font-heading-md text-heading-md text-text-primary leading-snug">
                Choose Discount Strategy
              </h3>
              <p className="font-caption text-caption text-text-secondary leading-snug">
                Select how your deal is priced and presented to diners nearby.
              </p>
            </div>

            <div className="px-margin mt-space-sm">
              <DealTypeSelector selected={studio.strategy} onSelect={chooseStrategy} />
            </div>
          </>
        )}

        {page === 'configure' && activeStrategy && (
          <>
            <div className="px-margin mt-space-md">
              <div className="flex items-start justify-between gap-space-xs">
                <div className="min-w-0">
                  <h3 className="font-heading-md text-heading-md text-text-primary leading-snug">
                    {activeStrategy.title}
                  </h3>
                  <p className="font-caption text-caption text-text-secondary leading-snug">
                    {activeStrategy.description}
                  </p>
                </div>
                <button
                  className="font-caption text-caption text-primary font-semibold flex items-center gap-0.5 shrink-0 mt-0.5 hover:underline"
                  type="button"
                  onClick={backToChoose}
                >
                  <Icon name="swap_horiz" className="text-[14px]" /> Change
                </button>
              </div>
            </div>

            <div className="px-margin mt-space-sm">
              <DealTypeConfigurator
                basePrice={baseAmount}
                catalog={bundleCatalog}
                studio={studio}
                onStudioChange={onStudioChange}
              />
            </div>
          </>
        )}
      </div>

      {page === 'choose' ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pb-safe flex flex-col gap-space-2xs pt-space-2xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-space-2xs disabled:opacity-40 disabled:shadow-none"
            type="button"
            disabled={!studio.strategy}
            onClick={openConfigure}
          >
            <span>{studio.strategy ? 'Continue to Discount Setup' : 'Select a strategy to continue'}</span>
            {studio.strategy && <Icon name="arrow_forward" className="text-[18px]" />}
          </button>
          <button
            className="w-full h-9 rounded-xl bg-transparent text-text-secondary font-button-secondary text-button-secondary hover:text-text-primary active:scale-[0.99] transition-transform flex items-center justify-center gap-1"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Catalog Items</span>
          </button>
        </div>
      ) : (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pb-safe flex flex-col gap-space-2xs pt-space-2xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-space-2xs disabled:opacity-40 disabled:shadow-none"
            type="button"
            disabled={configErrors.length > 0}
            onClick={() => {
              if (configErrors.length === 0) onNext();
            }}
          >
            <span>{configErrors.length > 0 ? 'Fix the highlighted setup to continue' : 'Continue to Limits & Rules'}</span>
            {configErrors.length === 0 && <Icon name="arrow_forward" className="text-[18px]" />}
          </button>
          <button
            className="w-full h-9 rounded-xl bg-transparent text-text-secondary font-button-secondary text-button-secondary hover:text-text-primary active:scale-[0.99] transition-transform flex items-center justify-center gap-1"
            type="button"
            onClick={backToChoose}
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Discount Strategy</span>
          </button>
        </div>
      )}
    </AppScreen>
  );
}
