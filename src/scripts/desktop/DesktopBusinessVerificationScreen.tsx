import { useEffect, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { useSessionUser } from '../../hooks/useSessionUser';
import {
  useVerificationActions,
  useVerificationStatus,
  type BusinessChecksOutcome,
  type CheckOutcome,
} from '../../hooks/business/useVerification';
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
  // Live: a flow resumed from the intro skips earlier steps, so its Back returns to the intro.
  const [resumedAt, setResumedAt] = useState<DesktopVerificationStep | null>(null);
  const [idOutcome, setIdOutcome] = useState<CheckOutcome | null>(null);
  const [cacChecks, setCacChecks] = useState<BusinessChecksOutcome | null>(null);
  const backTo = (resumed: DesktopVerificationStep, previous: DesktopVerificationStep) => () => setStep(resumedAt === resumed ? 'intro' : previous);
  const verificationStatus = useVerificationStatus();
  const session = useSessionUser();
  const verification = useVerificationActions();
  // Live checks start blank (prefilled with the account name); demo keeps sample values.
  const [draft, setDraft] = useState<VerificationDraft>(() =>
    hasApiConfig()
      ? { ...INITIAL_VERIFICATION_DRAFT, idNumber: '', legalName: '', entity: '', cacNumber: '', businessName: '', representativeName: '' }
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

  // Resuming after the CAC check: show its (masked) number rather than a blank.
  useEffect(() => {
    const masked = verificationStatus.data?.business?.maskedId;
    if (hasApiConfig() && masked) setDraft((current) => (current.cacNumber ? current : { ...current, cacNumber: masked }));
  }, [verificationStatus.data]);

  const updateDraft = (patch: Partial<VerificationDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const changeIdType = (idType: VerificationIdType) => {
    updateDraft({ idType, idNumber: hasApiConfig() ? '' : DEFAULT_ID_NUMBERS[idType] });
  };

  const idConfig = ID_TYPE_CONFIG[draft.idType];
  const rawId = idConfig.normalize(draft.idNumber);
  const reference = `•••• ${rawId.slice(-4).padStart(4, '0')}`;
  const sandboxCheck =
    idOutcome?.check.environment === 'test' ||
    cacChecks?.business.check.environment === 'test' ||
    cacChecks?.representative?.check.environment === 'test';

  const renderStep = () => {
    switch (step) {
    case 'intro':
      return (
        <DesktopVerificationIntroScreen
          onBack={onBack}
          onBrand={onBrand}
          onStart={(from) => {
            setResumedAt(from ?? null);
            setStep(from ?? 'idType');
          }}
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
          key={draft.idType}
          onBrand={onBrand}
          onBack={() => setStep('idType')}
          draft={draft}
          onDraftChange={updateDraft}
          onResult={(result) => {
            setIdOutcome(result);
            setStep(result.result === 'success' ? 'idSuccess' : 'idReview');
          }}
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
          reference={idOutcome?.check.maskedId ?? reference}
          check={idOutcome?.check}
        />
      );
    case 'idReview':
      return (
        <DesktopVerificationIdReviewScreen
          onBrand={onBrand}
          onBack={() => setStep('idForm')}
          onRetry={() => setStep('idForm')}
          onUseAnotherId={() => setStep('idType')}
          reasons={idOutcome?.reasons}
          checkId={idOutcome?.check.id}
        />
      );
    case 'cacStatus':
      return (
        <DesktopVerificationCacStatusScreen
          onBrand={onBrand}
          onBack={backTo('cacStatus', 'idSuccess')}
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
          onVerified={(checks) => {
            setCacChecks(checks);
            setStep('cacSuccess');
          }}
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
          representativeName={draft.representativeName}
          businessCheck={cacChecks?.business.check}
          check={cacChecks?.representative?.check ?? cacChecks?.business.check}
        />
      );
    case 'inReview':
      return (
        <DesktopVerificationReviewScreen
          onBrand={onBrand}
          onBack={backTo('inReview', 'cacSuccess')}
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
          onBack={backTo('complete', 'inReview')}
          onActivate={onActivate}
          onPreviewStorefront={onPreviewStorefront}
          legalName={draft.legalName}
          cacNumber={draft.cacNumber}
          businessName={draft.businessName}
          sandbox={sandboxCheck}
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
