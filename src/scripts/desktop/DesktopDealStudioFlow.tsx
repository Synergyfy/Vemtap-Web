import { useState } from 'react';
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
}: DesktopDealStudioFlowProps) {
  const [draft] = useState<ProductDraft>(initialDraft ?? INITIAL_PRODUCT_DRAFT);
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
      />
    );

  return (
    <DesktopDealStudioStep4Screen
      draft={draft}
      studio={studio}
      onBack={() => setStep(3)}
      onEditOffer={() => setStep(1)}
      onEditRules={() => setStep(2)}
      onEditLocations={() => setStep(3)}
      onPublish={onComplete}
      onAnalytics={onComplete}
      onSaveDraft={onExit}
    />
  );
}
