import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { ProductImage } from '../../components/ui/ProductImage';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';
import {
  DEAL_TYPE_OPTIONS,
  dealTypeTitle,
  formatDealAmount,
  withDealStructure,
  withSelectedProducts,
  type DealStructure,
} from '../deals/dealStudioShared';
import { useDealProductCatalog } from '../../hooks/business/useDealStudioLive';
import { DealProductPicker } from '../deals/DealProductPicker';
import { DealTypeSelector } from '../deals/DealStudioConfigurator';

interface DesktopDealStudioStep1ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: string) => void;
}

const STEP_RAIL: Array<{ step: string; label: string; meta: string }> = [
  { step: '1', label: 'Deal & Products', meta: 'Active Phase' },
  { step: '2', label: 'Offer Setup', meta: 'Next Step' },
  { step: '3', label: 'Deal Information', meta: 'Pending' },
  { step: '4', label: 'Deal Gallery', meta: 'Pending' },
  { step: '5', label: 'Review & Publish', meta: 'Final Approval' },
];

/** Step 1 for desktop: type first, then live products. */
export function DesktopDealStudioStep1Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
}: DesktopDealStudioStep1ScreenProps) {
  const [page, setPage] = useState<'structure' | 'products'>('structure');
  const { catalog, loading, error } = useDealProductCatalog();
  const structure = studio.structure;
  const activeOption = DEAL_TYPE_OPTIONS.find((option) => option.id === structure);
  const minProducts = structure === 'bundle' ? 2 : 1;
  const selectedProducts = catalog.filter((product) => studio.productIds.includes(product.id));
  const enoughProducts = selectedProducts.length >= minProducts;
  const regularTotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  const chooseStructure = (id: DealStructure) => {
    onStudioChange(withDealStructure(studio, id));
    setPage('products');
    window.scrollTo(0, 0);
  };

  const toggleProduct = (id: string) => {
    const next = studio.productIds.includes(id)
      ? studio.productIds.filter((value) => value !== id)
      : [...studio.productIds, id];
    onStudioChange(withSelectedProducts(studio, next, catalog));
  };

  const inner = (
    <>
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="max-w-7xl mx-auto px-space-xl py-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
            <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
              <span>Catalog Workflow</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Deal Studio</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                Step 1 of 5: {page === 'structure' ? 'Deal Structure' : 'Products'}
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Progress: <strong className="text-on-surface font-semibold">20% Complete</strong>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm pt-space-xs">
            {STEP_RAIL.map((item, index) => (
              <div
                key={item.step}
                className={`flex items-center gap-space-sm p-space-sm rounded-xl ${
                  index === 0 ? 'bg-surface-tint-blue shadow-sm' : 'bg-surface-container-low opacity-70'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md ${
                    index === 0 ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-highest text-on-surface-variant font-semibold'
                  }`}
                >
                  {item.step}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-label-md text-label-md truncate ${index === 0 ? 'text-primary font-semibold' : 'text-on-surface font-medium'}`}>
                    {item.label}
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">{item.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-space-xl py-space-lg w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold uppercase tracking-wider">
                Step 1 • Deal Foundation
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
              {page === 'structure' ? 'What kind of deal do you want to create?' : `Choose products for ${dealTypeTitle(structure ?? null)}`}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs max-w-3xl">
              {page === 'structure'
                ? 'Pick one simple structure. Free Delivery can be added later as an extra benefit.'
                : structure === 'bundle'
                  ? 'Pick at least 2 live products. They stay in your public catalogue and will also appear in Deals.'
                  : 'Pick at least 1 live product from your catalogue.'}
            </p>
          </div>
          {page === 'products' && (
            <button
              type="button"
              onClick={() => setPage('structure')}
              className="px-space-md py-space-xs rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md flex items-center gap-space-xs"
            >
              <Icon name="swap_horiz" className="text-[18px]" />
              <span>Change Deal Type</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {page === 'structure' ? (
              <>
                <div className="flex items-center justify-between px-space-2xs">
                  <span className="font-label-md text-label-md text-on-surface font-bold">Available Deal Structures</span>
                  <span className="font-caption text-caption text-on-surface-variant">Three simple options</span>
                </div>
                <DealTypeSelector selected={structure} onSelect={chooseStructure} variant="desktop" />
                <div className="rounded-2xl bg-surface-subtle p-space-md flex items-start gap-space-md">
                  <Icon name="info" className="text-[20px] text-primary mt-0.5" />
                  <p className="font-body-md text-body-md text-text-secondary">
                    Deals can only use your own live products. Services and bookings are not part of this deal flow.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm">
                <div className="flex items-center justify-between mb-space-md">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                      <Icon name={activeOption?.icon ?? 'inventory_2'} className="text-[22px]" />
                    </div>
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">
                        {activeOption?.title ?? 'Choose products'}
                      </h2>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Search and select from your live catalogue
                      </p>
                    </div>
                  </div>
                </div>
                <DealProductPicker
                  error={error ? 'We couldn’t load your live catalogue. Please try again.' : null}
                  loading={loading}
                  minProducts={minProducts}
                  products={catalog}
                  selectedIds={studio.productIds}
                  variant="desktop"
                  onToggle={toggleProduct}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <Icon name="shopping_bag" className="text-[20px] text-primary" />
                  <span className="font-label-md text-label-md text-on-surface font-bold">Selected Products</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">{selectedProducts.length} selected</span>
              </div>
              {selectedProducts.length === 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Products you select will appear here with their live catalogue prices.
                </p>
              ) : (
                <div className="flex flex-col gap-space-xs">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-space-xs rounded-xl bg-surface-subtle p-space-2xs">
                      <ProductImage
                        alt={product.name}
                        className="h-11 w-11 rounded-lg shrink-0"
                        iconClassName="text-[18px]"
                        showLabel={false}
                        src={product.image}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate block">{product.name}</span>
                        <span className="font-caption text-caption text-on-surface-variant">₦{formatDealAmount(product.price)}</span>
                      </div>
                      <button
                        aria-label={`Remove ${product.name}`}
                        className="text-text-tertiary hover:text-error"
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                      >
                        <Icon name="close" className="text-[16px]" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-space-xs border-t border-border-subtle">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Regular total</span>
                    <span className="font-heading-sm text-heading-sm text-primary font-bold">₦{formatDealAmount(regularTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => (page === 'products' ? setPage('structure') : onBack())}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>{page === 'products' ? 'Back to Deal Types' : 'Back to Deals'}</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-space-xs"
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <button
            type="button"
            disabled={page === 'structure' ? !structure : !enoughProducts}
            onClick={() => (page === 'structure' ? setPage('products') : onNext())}
            className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs disabled:opacity-40"
          >
            <span>
              {page === 'structure'
                ? structure
                  ? 'Continue to Products'
                  : 'Select a deal type to continue'
                : enoughProducts
                  ? 'Continue to Offer Setup'
                  : `Select ${minProducts} product${minProducts === 1 ? '' : 's'} to continue`}
            </span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
        </div>
      </div>
    </>
  );

  if (onNav) {
    return <MerchantShell activeNav="business-deals" onNav={onNav}>{inner}</MerchantShell>;
  }
  return <BusinessSetupChrome activeNav="deals">{inner}</BusinessSetupChrome>;
}
