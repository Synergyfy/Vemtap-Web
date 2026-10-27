import { useEffect, useState } from 'react';
import { useLiveDealPublish } from '../../hooks/business/useLiveDealPublish';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { INITIAL_DEAL_STUDIO_DRAFT, type DealStudioDraft } from './desktopDealStudio';
import { INITIAL_PRODUCT_DRAFT, type ProductDraft } from './desktopProductDraft';
import { DesktopDealStudioStep1Screen } from './DesktopDealStudioStep1Screen';
import { DesktopDealStudioStep2Screen } from './DesktopDealStudioStep2Screen';
import { DesktopDealStudioStep3Screen } from './DesktopDealStudioStep3Screen';
import { DesktopDealStudioStep4Screen } from './DesktopDealStudioStep4Screen';

interface DesktopDealStudioFlowProps {
  /** Seed product for the deal (defaults to the standard catalog draft). */
  initialDraft?: ProductDraft;
  /** Seed studio configuration (defaults to a fresh draft). */
  initialStudio?: DealStudioDraft;
  /** Live: the real catalogue item this deal is for (from the item's "Make deal"). */
  sourceItem?: CatalogueItem | null;
  onExit: () => void;
  onComplete: () => void;
  onNav?: (key: string) => void;
}

/**
 * Self-contained desktop Deal Studio (steps 1–4).
 *
 * Used by the business dashboard's "Create Deal" so it runs the exact same
 * flow as the onboarding wizard: select deal type → configure that type →
 * limits & claim restrictions → branches & schedule → review, preview and
 * publish. Do not fork a second deal-creation implementation.
 */
export function DesktopDealStudioFlow({
  initialDraft,
  initialStudio,
  sourceItem = null,
  onExit,
  onComplete,
  onNav,
}: DesktopDealStudioFlowProps) {
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
      <DesktopDealStudioStep1Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={onExit}
        onNext={() => setStep(2)}
        onSaveDraft={onExit}
        onNav={onNav}
      />
    );

  if (step === 2)
    return (
      <DesktopDealStudioStep2Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        onSaveDraft={onExit}
        onNav={onNav}
      />
    );

  if (step === 3)
    return (
      <DesktopDealStudioStep3Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        onSaveDraft={onExit}
        onNav={onNav}
      />
    );

  return (
    <>
      <DesktopDealStudioStep4Screen
        draft={draft}
        studio={studio}
        onBack={() => setStep(3)}
        onEditOffer={() => setStep(1)}
        onEditRules={() => setStep(2)}
        onEditLocations={() => setStep(3)}
        onPublish={onComplete}
        livePublish={liveDeal.live ? () => liveDeal.publishAsync(studio) : undefined}
        onAnalytics={onComplete}
        onSaveDraft={onExit}
        onNav={onNav}
      />
      {liveDeal.error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {liveDeal.error}
        </div>
      )}
    </>
  );
}
