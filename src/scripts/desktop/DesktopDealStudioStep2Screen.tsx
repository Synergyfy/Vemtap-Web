import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';
import { dealTypeTitle, selectedRegularTotal, validateDealConfiguration } from '../deals/dealStudioShared';
import { useDealBranches, useDealProductCatalog } from '../../hooks/business/useDealStudioLive';
import { DealOfferConfigurator } from '../deals/DealStudioConfigurator';

interface DesktopDealStudioStep2ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: string) => void;
}

const STEPS = ['Deal & Products', 'Offer Setup', 'Deal Information', 'Deal Gallery', 'Review & Publish'];

export function DesktopDealStudioStep2Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
}: DesktopDealStudioStep2ScreenProps) {
  const { catalog } = useDealProductCatalog();
  const dealBranches = useDealBranches(studio);
  const selectedProducts = catalog.filter((product) => studio.productIds.includes(product.id));
  const errors = validateDealConfiguration(studio, selectedRegularTotal(studio, catalog), catalog);

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
              <span className="text-primary font-semibold">Step 2 of 5: Offer Setup</span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm mt-space-2xs">
              {STEPS.map((label, index) => (
                <div key={label} className="flex items-center gap-space-xs">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-caption text-caption font-bold ${
                      index === 0 ? 'bg-badge-discount-bg text-badge-discount-text' : index === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {index === 0 ? <Icon name="check" className="text-[15px]" /> : index + 1}
                  </span>
                  <span className={`font-label-sm text-label-sm ${index === 1 ? 'text-primary font-semibold' : 'text-on-surface'}`}>{label}</span>
                  {index < STEPS.length - 1 && <span className="w-8 h-0.5 bg-surface-container-highest" />}
                </div>
              ))}
            </div>
          </div>
          <span className="font-label-md text-label-md text-primary font-bold">40% Completed</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-space-xl pt-space-xl pb-space-3xl">
        <div className="flex flex-col gap-space-2xs mb-space-lg">
          <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
            Configure your {dealTypeTitle(studio.structure ?? null)}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Applies to {selectedProducts.length} live product{selectedProducts.length === 1 ? '' : 's'} at{' '}
            {dealBranches.selected.length || 1} branch{dealBranches.selected.length === 1 ? '' : 'es'}. Catalogue prices
            are never changed by a deal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm">
            <DealOfferConfigurator catalog={catalog} studio={studio} onStudioChange={onStudioChange} />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <Icon name="inventory_2" className="text-[20px] text-primary" />
                <span className="font-label-md text-label-md text-on-surface font-bold">Deal Products</span>
              </div>
              <div className="flex flex-col gap-space-2xs">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg bg-surface-subtle px-space-sm py-space-2xs">
                    <span className="font-label-sm text-label-sm text-on-surface font-medium truncate">{product.name}</span>
                    <span className="font-label-sm text-label-sm text-text-secondary">₦{product.price.toLocaleString('en-NG')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-surface-tint-blue p-space-md">
              <div className="flex items-start gap-space-xs">
                <Icon name="info" className="text-[18px] text-primary mt-0.5" />
                <p className="font-body-md text-body-md text-text-secondary">
                  Prices here are the offer terms customers see. Your public product catalogue keeps its original
                  price after this deal is published.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <button type="button" onClick={onBack} className="px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs">
              <Icon name="arrow_back" className="text-[18px]" /> Back to Products
            </button>
            <button type="button" onClick={onSaveDraft} className="px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs">
              <Icon name="save" className="text-[18px]" /> Save as Draft
            </button>
          </div>
          <button
            type="button"
            disabled={errors.length > 0}
            onClick={onNext}
            className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs disabled:opacity-40"
          >
            <span>{errors.length > 0 ? errors[0] : 'Continue to Deal Information'}</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
        </div>
      </div>
    </>
  );

  if (onNav) return <MerchantShell activeNav="business-deals" onNav={onNav}>{inner}</MerchantShell>;
  return <BusinessSetupChrome activeNav="deals">{inner}</BusinessSetupChrome>;
}
