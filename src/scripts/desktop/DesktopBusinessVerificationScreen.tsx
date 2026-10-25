import { useEffect, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { useSessionUser } from '../../hooks/useSessionUser';
import { useVerificationActions } from '../../hooks/business/useVerification';
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
  const session = useSessionUser();
  const verification = useVerificationActions();
  // Live checks start blank (prefilled with the account name); demo keeps sample values.
  const [draft, setDraft] = useState<VerificationDraft>(() =>
    hasApiConfig()
      ? { ...INITIAL_VERIFICATION_DRAFT, idNumber: '', legalName: '', dateOfBirth: '', entity: '', cacNumber: '', businessName: '' }
      : { ...INITIAL_VERIFICATION_DRAFT, entity: '', cacNumber: '' },
  );

  useEffect(() => {
    const user = session.data;
    if (!user) return;
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    setDraft((current) => (current.legalName ? current : { ...current, legalName: name, businessName: user.business?.name ?? current.businessName }));
  }, [session.data]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const updateDraft = (patch: Partial<VerificationDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const changeIdType = (idType: VerificationIdType) => {
    updateDraft({ idType, idNumber: hasApiConfig() ? '' : DEFAULT_ID_NUMBERS[idType] });
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
          onNeedsReview={() => setStep('inReview')}
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
          onContinue={() => {
            // Hand the business to the review team, then continue setup either way —
            // the status centre shows the outcome and offers a retry.
            verification.submitUnregistered().catch(() => undefined).finally(onActivate);
          }}
          onLearnMore={() => setStep('intro')}
          legalName={draft.legalName}
        />
      );
    }
  };

  return <div className="biz-flow">{renderStep()}</div>;
}
