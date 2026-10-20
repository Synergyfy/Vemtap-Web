import { useEffect, useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import { useSessionUser } from '../hooks/useSessionUser';
import { useVerificationActions } from '../hooks/business/useVerification';
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
import { BusinessSetupProgress } from '../components/BusinessSetupProgress';
import { useBusinessSetupNav } from './businessSetup';
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
  const setupNav = useBusinessSetupNav();
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
          onNeedsReview={() => setStep('inReview')}
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

  return (
    <div className="biz-flow">
      {setupNav && (
        <div className="w-full max-w-[430px] mx-auto px-gutter pt-safe pt-2">
          <BusinessSetupProgress {...setupNav} variant="mobile" />
        </div>
      )}
      {renderStep()}
    </div>
  );
}
