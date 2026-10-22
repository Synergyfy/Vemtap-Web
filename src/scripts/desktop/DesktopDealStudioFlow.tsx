import { useState } from 'react';
import { useLiveDealPublish } from '../../hooks/business/useLiveDealPublish';
import { DealItemPicker } from '../../components/business/DealItemPicker';
import { DealPublishError } from '../../components/business/DealPublishError';
import { toPrice } from '../../services/catalogueItemsService';
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
  onExit,
  onComplete,
  onNav,
}: DesktopDealStudioFlowProps) {
  const [draft, setDraft] = useState<ProductDraft>(initialDraft ?? INITIAL_PRODUCT_DRAFT);
  const liveDeal = useLiveDealPublish(onComplete);
  const [studio, setStudio] = useState<DealStudioDraft>(initialStudio ?? INITIAL_DEAL_STUDIO_DRAFT);
  const [step, setStep] = useState(1);

  const handleStudioChange = (patch: Partial<DealStudioDraft>) =>
    setStudio((previous) => ({ ...previous, ...patch }));

  // Live: the deal is for a real catalogue item, chosen before the studio opens.
  if (liveDeal.needsSource) {
    return (
      <DealItemPicker
        onExit={onExit}
        onPick={(item) => {
          liveDeal.pick(item);
          setDraft((previous) => ({
            ...previous,
            title: item.name,
            description: item.description ?? '',
            basePrice: String(toPrice(item.price ?? undefined) ?? ''),
            comparePrice: String(toPrice(item.compareAtPrice ?? undefined) ?? ''),
      // The draft starts from the sample product: drop its variants and photo.
      variantsEnabled: false,
      variants: [],
      mainImage: item.mainImage ?? undefined,
      sku: item.sku ?? '',
      skuCode: item.sku ?? '',
          }));
        }}
      />
    );
  }

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
    <DealPublishError message={liveDeal.error} onDismiss={liveDeal.clearError} />
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
    </>
  );
}
