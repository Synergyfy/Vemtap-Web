import { useEffect, useState, type ReactNode } from 'react';
import { DealSourceContext } from '../hooks/business/useDealStudioLive';
import { hasApiConfig } from '../services/api/client';
import { useLiveDealPublish } from '../hooks/business/useLiveDealPublish';
import { firstUsableItemImage } from './catalogueLive';
import { toPrice, type CatalogueItem } from '../services/catalogueItemsService';
import { INITIAL_DEAL_STUDIO_DRAFT, LIVE_DEAL_STUDIO_DRAFT, type DealStudioDraft } from './dealStudio';
import { INITIAL_PRODUCT_DRAFT, type ProductDraft } from './productDraft';
import { withSelectedProducts, type DealPriceChoice } from './deals/dealStudioShared';
import { BusinessDealStudioStep1Screen } from './BusinessDealStudioStep1Screen';
import { BusinessDealStudioStep2Screen } from './BusinessDealStudioStep2Screen';
import { BusinessDealStudioStep3Screen } from './BusinessDealStudioStep3Screen';
import { BusinessDealGalleryScreen } from './BusinessDealGalleryScreen';
import { BusinessDealStudioStep4Screen } from './BusinessDealStudioStep4Screen';

interface BusinessDealStudioFlowProps {
  /** Seed product for the deal (defaults to the standard catalog draft). */
  initialDraft?: ProductDraft;
  /** Seed studio configuration (defaults to a fresh draft). */
  initialStudio?: DealStudioDraft;
  /** Live: the real catalogue item preselected by "Make a Deal". */
  sourceItem?: CatalogueItem | null;
  /** Kept for callers restoring an older deal; the wizard always starts type-first. */
  priceChoice?: DealPriceChoice;
  onExit: () => void;
  onComplete: () => void;
}

/**
 * Self-contained mobile Deal Studio (steps 1–5): deal structure and live
 * products → offer setup → deal information → deal gallery → preview/publish.
 * Mirrors `DesktopDealStudioFlow`; do not fork a second implementation.
 */
export function BusinessDealStudioFlow({
  initialDraft,
  initialStudio,
  sourceItem = null,
  onExit,
  onComplete,
}: BusinessDealStudioFlowProps) {
  const liveDeal = useLiveDealPublish(onComplete, sourceItem, (patch) => setStudio((previous) => ({ ...previous, ...patch })));
  const [draft] = useState<ProductDraft>(() =>
    sourceItem
      ? {
          ...(initialDraft ?? INITIAL_PRODUCT_DRAFT),
          title: sourceItem.name,
          description: sourceItem.description ?? '',
          basePrice: String(toPrice(sourceItem.price ?? undefined) ?? ''),
          comparePrice: String(toPrice(sourceItem.compareAtPrice ?? undefined) ?? ''),
          variantsEnabled: false,
          variants: [],
          sku: sourceItem.sku ?? '',
          skuCode: sourceItem.sku ?? '',
        }
      : initialDraft ?? INITIAL_PRODUCT_DRAFT,
  );
  useEffect(() => {
    if (!liveDeal.error) return undefined;
    const timer = window.setTimeout(liveDeal.clearError, 4000);
    return () => window.clearTimeout(timer);
  }, [liveDeal.error]);

  const [studio, setStudio] = useState<DealStudioDraft>(() => {
    const base = initialStudio ?? (hasApiConfig() ? LIVE_DEAL_STUDIO_DRAFT : INITIAL_DEAL_STUDIO_DRAFT);
    if (!sourceItem) return base;
    return withSelectedProducts(
      { ...base, title: sourceItem.name },
      [sourceItem.id],
      [
        {
          id: sourceItem.id,
          name: sourceItem.name,
          price: toPrice(sourceItem.price ?? undefined) ?? 0,
          image: firstUsableItemImage(sourceItem),
        },
      ],
    );
  });
  const [step, setStep] = useState(1);
  const wrap = (node: ReactNode) => <DealSourceContext.Provider value={liveDeal.source}>{node}</DealSourceContext.Provider>;
  const handleStudioChange = (patch: Partial<DealStudioDraft>) => setStudio((previous) => ({ ...previous, ...patch }));

  if (step === 1)
    return wrap(
      <BusinessDealStudioStep1Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={onExit}
        onNext={() => setStep(2)}
        onSaveDraft={onExit}
      />,
    );

  if (step === 2)
    return wrap(
      <BusinessDealStudioStep2Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        onSaveDraft={onExit}
      />,
    );

  if (step === 3)
    return wrap(
      <BusinessDealStudioStep3Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        onSaveDraft={onExit}
      />,
    );

  if (step === 4)
    return wrap(
      <BusinessDealGalleryScreen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(3)}
        onNext={() => setStep(5)}
        onSaveDraft={onExit}
      />,
    );

  return wrap(
    <>
      <BusinessDealStudioStep4Screen
        draft={draft}
        studio={studio}
        onBack={() => setStep(4)}
        onEditOffer={() => setStep(2)}
        onEditRules={() => setStep(3)}
        onEditGallery={() => setStep(4)}
        onEditLocations={() => setStep(3)}
        onPublish={onComplete}
        livePublish={liveDeal.live ? () => liveDeal.publishAsync(studio) : undefined}
        onSaveDraft={onExit}
      />
      {liveDeal.error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface px-4 py-2.5 text-label-md font-medium text-inverse-on-surface shadow-lg">
          {liveDeal.error}
        </div>
      )}
    </>,
  );
}
