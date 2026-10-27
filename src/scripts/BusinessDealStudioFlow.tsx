import { useEffect, useState } from 'react';
import { useLiveDealPublish } from '../hooks/business/useLiveDealPublish';
import { toPrice, type CatalogueItem } from '../services/catalogueItemsService';
import { INITIAL_DEAL_STUDIO_DRAFT, type DealStudioDraft } from './dealStudio';
import { INITIAL_PRODUCT_DRAFT, type ProductDraft } from './productDraft';
import { BusinessDealStudioStep1Screen } from './BusinessDealStudioStep1Screen';
import { BusinessDealStudioStep2Screen } from './BusinessDealStudioStep2Screen';
import { BusinessDealStudioStep3Screen } from './BusinessDealStudioStep3Screen';
import { BusinessDealStudioStep4Screen } from './BusinessDealStudioStep4Screen';

interface BusinessDealStudioFlowProps {
  /** Seed product for the deal (defaults to the standard catalog draft). */
  initialDraft?: ProductDraft;
  /** Seed studio configuration (defaults to a fresh draft). */
  initialStudio?: DealStudioDraft;
  /** Live: the real catalogue item this deal is for (from the item's "Make deal"). */
  sourceItem?: CatalogueItem | null;
  onExit: () => void;
  onComplete: () => void;
}

/**
 * Self-contained mobile Deal Studio (steps 1–4).
 *
 * Used by the business dashboard's "Create Deal" so the dashboard runs the
 * exact same flow as the onboarding wizard: deal type → per-type config →
 * limits & claim restrictions → branches & schedule → review & publish.
 * Mirrors `DesktopDealStudioFlow`; do not fork a second implementation.
 */
export function BusinessDealStudioFlow({
  initialDraft,
  initialStudio,
  sourceItem = null,
  onExit,
  onComplete,
}: BusinessDealStudioFlowProps) {
  // Live: the deal is built on the chosen catalogue item and published to the API.
  const liveDeal = useLiveDealPublish(onComplete, sourceItem);
  const [draft] = useState<ProductDraft>(() =>
    sourceItem
      ? {
          ...(initialDraft ?? INITIAL_PRODUCT_DRAFT),
          title: sourceItem.name,
          description: sourceItem.description ?? '',
          basePrice: String(toPrice(sourceItem.price ?? undefined) ?? ''),
          comparePrice: String(toPrice(sourceItem.compareAtPrice ?? undefined) ?? ''),
          // The sample product's variants and photo don't belong to this item.
          variantsEnabled: false,
          variants: [],
          mainImage: sourceItem.mainImage ?? undefined,
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
  const [studio, setStudio] = useState<DealStudioDraft>(initialStudio ?? INITIAL_DEAL_STUDIO_DRAFT);
  const [step, setStep] = useState(1);

  const handleStudioChange = (patch: Partial<DealStudioDraft>) =>
    setStudio((previous) => ({ ...previous, ...patch }));

  if (step === 1)
    return (
      <BusinessDealStudioStep1Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={onExit}
        onNext={() => setStep(2)}
        onSaveDraft={onExit}
      />
    );

  if (step === 2)
    return (
      <BusinessDealStudioStep2Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        onSaveDraft={onExit}
      />
    );

  if (step === 3)
    return (
      <BusinessDealStudioStep3Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        onSaveDraft={onExit}
      />
    );

  return (
    <>
      <BusinessDealStudioStep4Screen
        draft={draft}
        studio={studio}
        onBack={() => setStep(3)}
        onEditOffer={() => setStep(1)}
        onEditRules={() => setStep(2)}
        onEditLocations={() => setStep(3)}
        onPublish={onComplete}
        livePublish={liveDeal.live ? () => liveDeal.publishAsync(studio) : undefined}
        onSaveDraft={onExit}
      />
      {liveDeal.error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {liveDeal.error}
        </div>
      )}
    </>
  );
}
