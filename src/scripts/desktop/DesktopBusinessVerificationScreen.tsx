import { useEffect, useState } from 'react';
import { DesktopVerificationIntroScreen } from './DesktopVerificationIntroScreen';
import { DesktopVerificationIdTypeScreen } from './DesktopVerificationIdTypeScreen';
import { DesktopVerificationIdFormScreen } from './DesktopVerificationIdFormScreen';
import { DesktopVerificationIdSuccessScreen } from './DesktopVerificationIdSuccessScreen';
import { DesktopVerificationIdReviewScreen } from './DesktopVerificationIdReviewScreen';
import { DesktopVerificationCacStatusScreen } from './DesktopVerificationCacStatusScreen';
import { DesktopVerificationCacFormScreen } from './DesktopVerificationCacFormScreen';
import { DesktopVerificationCacSuccessScreen } from './DesktopVerificationCacSuccessScreen';
import { DesktopVerificationReviewScreen } from './DesktopVerificationReviewScreen';
import { DesktopVerificationCompleteScreen } from './DesktopVerificationCompleteScreen';
import { DesktopVerificationUnregisteredScreen } from './DesktopVerificationUnregisteredScreen';
import {
  DEFAULT_ID_NUMBERS,
  ID_TYPE_CONFIG,
  INITIAL_VERIFICATION_DRAFT,
  type VerificationDraft,
  type VerificationIdType,
} from '../verificationDraft';

type DesktopVerificationStep =
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

interface DesktopBusinessVerificationScreenProps {
  onBack: () => void;
  onComplete: () => void;
  onActivate: () => void;
  onPreviewStorefront: () => void;
  onConfigureStorefront?: () => void;
  onCreateDeal?: () => void;
  onQrStands?: () => void;
  onBrand?: () => void;
}

export function DesktopBusinessVerificationScreen({
  onBack,
  onComplete,
  onActivate,
  onPreviewStorefront,
  onConfigureStorefront,
  onCreateDeal,
  onQrStands,
  onBrand,
}: DesktopBusinessVerificationScreenProps) {
  const [step, setStep] = useState<DesktopVerificationStep>('intro');
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
      return (
        <DesktopVerificationIntroScreen
          onBack={onBack}
          onBrand={onBrand}
          onStart={() => setStep('idType')}
          onLater={onComplete}
        />
      );
    case 'idType':
      return (
        <DesktopVerificationIdTypeScreen
          onBrand={onBrand}
          onBack={() => setStep('intro')}
          idType={draft.idType}
          onIdTypeChange={changeIdType}
          onContinue={() => setStep('idForm')}
        />
      );
    case 'idForm':
      return (
        <DesktopVerificationIdFormScreen
          onBrand={onBrand}
          onBack={() => setStep('idType')}
          draft={draft}
          onDraftChange={updateDraft}
          onResult={(outcome) => setStep(outcome === 'success' ? 'idSuccess' : 'idReview')}
        />
      );
    case 'idSuccess':
      return (
        <DesktopVerificationIdSuccessScreen
          onBrand={onBrand}
          onBack={() => setStep('idForm')}
          onContinue={() => setStep('cacStatus')}
          legalName={draft.legalName}
          documentLabel={idConfig.documentLabel}
          reference={reference}
        />
      );
    case 'idReview':
      return (
        <DesktopVerificationIdReviewScreen
          onBrand={onBrand}
          onBack={() => setStep('idForm')}
          onRetry={() => setStep('idForm')}
          onUseAnotherId={() => setStep('idType')}
        />
      );
    case 'cacStatus':
      return (
        <DesktopVerificationCacStatusScreen
          onBrand={onBrand}
          onBack={() => setStep('idSuccess')}
          registered={draft.cacRegistered}
          onRegisteredChange={(registered) => updateDraft({ cacRegistered: registered })}
          onContinue={() => setStep(draft.cacRegistered ? 'cacForm' : 'unregistered')}
        />
      );
    case 'cacForm':
      return (
        <DesktopVerificationCacFormScreen
          onBrand={onBrand}
          onBack={() => setStep('cacStatus')}
          draft={draft}
          onDraftChange={updateDraft}
          onVerified={() => setStep('cacSuccess')}
          onNotIncorporated={() => setStep('unregistered')}
        />
      );
    case 'cacSuccess':
      return (
        <DesktopVerificationCacSuccessScreen
          onBrand={onBrand}
          onBack={() => setStep('cacForm')}
          onContinue={() => setStep('inReview')}
          businessName={draft.businessName}
          cacNumber={draft.cacNumber}
          legalName={draft.legalName}
        />
      );
    case 'inReview':
      return (
        <DesktopVerificationReviewScreen
          onBrand={onBrand}
          onBack={() => setStep('cacSuccess')}
          onReviewComplete={() => setStep('complete')}
          onCatalog={onConfigureStorefront}
          onDeals={onCreateDeal}
          onProfile={onQrStands}
          legalName={draft.legalName}
          businessName={draft.businessName}
        />
      );
    case 'complete':
      return (
        <DesktopVerificationCompleteScreen
          onBrand={onBrand}
          onBack={() => setStep('inReview')}
          onActivate={onActivate}
          onPreviewStorefront={onPreviewStorefront}
          legalName={draft.legalName}
          cacNumber={draft.cacNumber}
          businessName={draft.businessName}
        />
      );
    case 'unregistered':
      return (
        <DesktopVerificationUnregisteredScreen
          onBrand={onBrand}
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
