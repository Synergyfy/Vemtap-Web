import { useState } from 'react';
import { useLiveDealPublish } from '../hooks/business/useLiveDealPublish';
import { DealItemPicker } from '../components/business/DealItemPicker';
import { DealPublishError } from '../components/business/DealPublishError';
import { toPrice } from '../services/catalogueItemsService';
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
  onExit,
  onComplete,
}: BusinessDealStudioFlowProps) {
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
          }));
        }}
      />
    );
  }

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
    <DealPublishError message={liveDeal.error} onDismiss={liveDeal.clearError} />
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
    </>
  );
}
