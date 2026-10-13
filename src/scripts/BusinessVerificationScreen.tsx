import { useEffect, useState } from 'react';
import { VerificationIntroScreen } from './VerificationIntroScreen';
import { VerificationIdTypeScreen } from './VerificationIdTypeScreen';
import { VerificationIdFormScreen } from './VerificationIdFormScreen';
import { VerificationIdSuccessScreen } from './VerificationIdSuccessScreen';
import { VerificationIdReviewScreen } from './VerificationIdReviewScreen';
import { VerificationCacStatusScreen } from './VerificationCacStatusScreen';
import { VerificationCacFormScreen } from './VerificationCacFormScreen';
import { VerificationCacSuccessScreen } from './VerificationCacSuccessScreen';
import { VerificationReviewScreen } from './VerificationReviewScreen';
import { VerificationCompleteScreen } from './VerificationCompleteScreen';
import { VerificationUnregisteredScreen } from './VerificationUnregisteredScreen';
import {
  DEFAULT_ID_NUMBERS,
  ID_TYPE_CONFIG,
  INITIAL_VERIFICATION_DRAFT,
  type VerificationDraft,
  type VerificationIdType,
} from './verificationDraft';

type VerificationStep =
  | 'intro'
  | 'idType'
  | 'idForm'
  | 'idSuccess'
  | 'idReview'
  | 'cacStatus'
  | 'cacForm'
  | 'cacSuccess'
  | 'inReview'
  | 'complete'
  | 'unregistered';

export function BusinessVerificationScreen({
  onBack,
  onComplete,
  onActivate,
  onPreviewStorefront,
}: {
  onBack: () => void;
  onComplete: () => void;
  onActivate: () => void;
  onPreviewStorefront: () => void;
}) {
  const [step, setStep] = useState<VerificationStep>('intro');
  const [draft, setDraft] = useState<VerificationDraft>({
    ...INITIAL_VERIFICATION_DRAFT,
    entity: '',
    cacNumber: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const updateDraft = (patch: Partial<VerificationDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const changeIdType = (idType: VerificationIdType) => {
    updateDraft({ idType, idNumber: DEFAULT_ID_NUMBERS[idType] });
  };

  const idConfig = ID_TYPE_CONFIG[draft.idType];
  const rawId = idConfig.normalize(draft.idNumber);
  const reference = `•••• ${rawId.slice(-4).padStart(4, '0')}`;

  const renderStep = () => {
    switch (step) {
    case 'intro':
      return <VerificationIntroScreen onBack={onBack} onStart={() => setStep('idType')} onLater={onComplete} />;
    case 'idType':
      return (
        <VerificationIdTypeScreen
          onBack={() => setStep('intro')}
          idType={draft.idType}
          onIdTypeChange={changeIdType}
          onContinue={() => setStep('idForm')}
        />
      );
    case 'idForm':
      return (
        <VerificationIdFormScreen
          onBack={() => setStep('idType')}
          draft={draft}
          onDraftChange={updateDraft}
          onResult={(outcome) => setStep(outcome === 'success' ? 'idSuccess' : 'idReview')}
        />
      );
    case 'idSuccess':
      return (
        <VerificationIdSuccessScreen
          onBack={() => setStep('idForm')}
          onContinue={() => setStep('cacStatus')}
          legalName={draft.legalName}
          documentLabel={idConfig.documentLabel}
          reference={reference}
        />
      );
    case 'idReview':
      return (
        <VerificationIdReviewScreen
          onBack={() => setStep('idForm')}
          onRetry={() => setStep('idForm')}
          onUseAnotherId={() => setStep('idType')}
        />
      );
    case 'cacStatus':
      return (
        <VerificationCacStatusScreen
          onBack={() => setStep('idSuccess')}
          registered={draft.cacRegistered}
          onRegisteredChange={(registered) => updateDraft({ cacRegistered: registered })}
          onContinue={() => setStep(draft.cacRegistered ? 'cacForm' : 'unregistered')}
        />
      );
    case 'cacForm':
      return (
        <VerificationCacFormScreen
          onBack={() => setStep('cacStatus')}
          draft={draft}
          onDraftChange={updateDraft}
          onVerified={() => setStep('cacSuccess')}
        />
      );
    case 'cacSuccess':
      return (
        <VerificationCacSuccessScreen
          onBack={() => setStep('cacForm')}
          onContinue={() => setStep('inReview')}
          businessName={draft.businessName}
          cacNumber={draft.cacNumber}
          legalName={draft.legalName}
        />
      );
    case 'inReview':
      return (
        <VerificationReviewScreen
          onBack={() => setStep('cacSuccess')}
          onReviewComplete={() => setStep('complete')}
          legalName={draft.legalName}
          businessName={draft.businessName}
        />
      );
    case 'complete':
      return (
        <VerificationCompleteScreen
          onBack={() => setStep('inReview')}
          onActivate={onActivate}
          onPreviewStorefront={onPreviewStorefront}
          legalName={draft.legalName}
          cacNumber={draft.cacNumber}
        />
      );
    case 'unregistered':
      return (
        <VerificationUnregisteredScreen
          onBack={() => setStep('cacStatus')}
          onContinue={onActivate}
          onLearnMore={() => setStep('intro')}
          legalName={draft.legalName}
        />
      );
    }
  };

  return <div className="biz-flow">{renderStep()}</div>;
}
