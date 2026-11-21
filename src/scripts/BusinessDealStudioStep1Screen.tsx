import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ProductImage } from '../components/ui/ProductImage';
import { UserAvatar } from '../components/ui/UserAvatar';
import type { DealStudioDraft } from './dealStudio';
import {
  DEAL_TYPE_OPTIONS,
  dealTypeTitle,
  formatDealAmount,
  withDealStructure,
  withSelectedProducts,
  type DealStructure,
} from './deals/dealStudioShared';
import { useDealProductCatalog } from '../hooks/business/useDealStudioLive';
import { DealProductPicker } from './deals/DealProductPicker';
import { DealTypeSelector } from './deals/DealStudioConfigurator';
import type { ProductDraft } from './productDraft';

interface BusinessDealStudioStep1ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

/** Step 1: ask what kind of deal, then pick live catalogue products. */
export function BusinessDealStudioStep1Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessDealStudioStep1ScreenProps) {
  const [page, setPage] = useState<'structure' | 'products'>('structure');
  const { catalog, loading, error } = useDealProductCatalog();
  const structure = studio.structure;
  const activeOption = DEAL_TYPE_OPTIONS.find((option) => option.id === structure);
  const minProducts = structure === 'bundle' ? 2 : 1;
  const selectedProducts = catalog.filter((product) => studio.productIds.includes(product.id));
  const enoughProducts = selectedProducts.length >= minProducts;

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

  const regularTotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-space-xs text-on-surface hover:text-primary active:scale-95 transition-transform"
              type="button"
              onClick={() => (page === 'products' ? setPage('structure') : onBack())}
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
            <button
              aria-label="Save Draft"
              className="min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary"
              type="button"
              onClick={onSaveDraft}
            >
              Save
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-40">
        <div className="px-margin pt-space-sm pb-space-2xs flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">
              Step 1 of 5: {page === 'structure' ? 'Deal Structure' : 'Products'}
            </span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">20% Complete</span>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '20%' }} />
          </div>
        </div>

        {page === 'structure' ? (
          <>
            <div className="px-margin mt-space-md">
              <h2 className="font-heading-md text-heading-md text-text-primary leading-snug">
                What kind of deal do you want to create?
              </h2>
              <p className="font-caption text-caption text-text-secondary leading-snug mt-1">
                Pick one simple structure. You’ll choose the products next.
              </p>
            </div>
            <div className="px-margin mt-space-sm">
              <DealTypeSelector selected={structure} onSelect={chooseStructure} />
            </div>
            <div className="px-margin mt-space-sm rounded-xl bg-surface-subtle px-space-sm py-space-2xs flex items-start gap-space-xs">
              <Icon name="info" className="text-[16px] text-primary mt-0.5 shrink-0" />
              <p className="font-caption text-caption text-text-secondary leading-snug">
                Free Delivery can be added later as an extra benefit. Deals use products from your own catalogue only.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="px-margin mt-space-md flex items-start justify-between gap-space-xs">
              <div className="min-w-0">
                <h2 className="font-heading-md text-heading-md text-text-primary leading-snug">
                  Choose products for your {dealTypeTitle(structure ?? null)}
                </h2>
                <p className="font-caption text-caption text-text-secondary leading-snug">
                  {structure === 'bundle'
                    ? 'Pick at least 2 products. They stay in your public catalogue and will also appear in Deals.'
                    : 'Pick at least 1 product from your live catalogue.'}
                </p>
              </div>
              <button
                className="font-caption text-caption text-primary font-semibold flex items-center gap-0.5 shrink-0 mt-0.5"
                type="button"
                onClick={() => setPage('structure')}
              >
                <Icon name="swap_horiz" className="text-[14px]" /> Change
              </button>
            </div>

            {selectedProducts.length > 0 && (
              <div className="px-margin mt-space-sm">
                <div className="rounded-xl bg-surface-tint-blue px-space-sm py-space-2xs flex items-center gap-space-xs">
                  <div className="flex -space-x-2">
                    {selectedProducts.slice(0, 3).map((product) => (
                      <ProductImage
                        key={product.id}
                        alt={product.name}
                        className="h-8 w-8 rounded-full ring-2 ring-surface-tint-blue"
                        iconClassName="text-[12px]"
                        showLabel={false}
                        src={product.image}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-primary font-semibold">
                      {selectedProducts.length} product{selectedProducts.length === 1 ? '' : 's'} selected
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Regular total ₦{formatDealAmount(regularTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="px-margin mt-space-sm">
              <DealProductPicker
                error={error ? 'We couldn’t load your live catalogue. Pull to refresh and try again.' : null}
                loading={loading}
                minProducts={minProducts}
                products={catalog}
                selectedIds={studio.productIds}
                onToggle={toggleProduct}
              />
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pb-safe flex flex-col gap-space-2xs pt-space-2xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {page === 'structure' ? (
          <>
            <button
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center disabled:opacity-40"
              disabled={!structure}
              type="button"
              onClick={() => structure && setPage('products')}
            >
              <span>{structure ? `Continue with ${activeOption?.title ?? 'this deal'}` : 'Select a deal type to continue'}</span>
              {structure && <Icon name="arrow_forward" className="text-[18px]" />}
            </button>
            <button
              className="w-full h-9 rounded-xl font-button-secondary text-button-secondary text-text-secondary"
              type="button"
              onClick={onBack}
            >
              Back
            </button>
          </>
        ) : (
          <>
            <button
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center disabled:opacity-40"
              disabled={!enoughProducts}
              type="button"
              onClick={onNext}
            >
              <span>
                {enoughProducts ? 'Continue to Offer Setup' : `Select ${minProducts} product${minProducts === 1 ? '' : 's'} to continue`}
              </span>
              {enoughProducts && <Icon name="arrow_forward" className="text-[18px]" />}
            </button>
            <button
              className="w-full h-9 rounded-xl font-button-secondary text-button-secondary text-text-secondary"
              type="button"
              onClick={() => setPage('structure')}
            >
              Back to deal types
            </button>
          </>
        )}
      </div>
    </AppScreen>
  );
}
