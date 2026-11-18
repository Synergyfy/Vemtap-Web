import { useState } from 'react';
import { INITIAL_VERIFICATION_DRAFT, type VerificationDraft, type VerificationIdType } from './verificationDraft';
import { VerificationIdFormScreen } from './VerificationIdFormScreen';
import { VerificationIdTypeScreen } from './VerificationIdTypeScreen';
import { DesktopVerificationIdFormScreen } from './desktop/DesktopVerificationIdFormScreen';
import { DesktopVerificationIdTypeScreen } from './desktop/DesktopVerificationIdTypeScreen';

interface DashboardIdentityVerificationFlowProps {
  desktop: boolean;
  onBack: () => void;
  onComplete: (result: 'success' | 'review') => void;
  onNav?: (key: string) => void;
}

export function DashboardIdentityVerificationFlow({
  desktop,
  onBack,
  onComplete,
  onNav,
}: DashboardIdentityVerificationFlowProps) {
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [draft, setDraft] = useState<VerificationDraft>(() => ({
    ...INITIAL_VERIFICATION_DRAFT,
    idNumber: '',
    legalName: '',
    dateOfBirth: '',
  }));
  const changeDraft = (patch: Partial<VerificationDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const changeIdType = (idType: VerificationIdType) => changeDraft({ idType, idNumber: '' });

  if (desktop) {
    return step === 'type' ? (
      <DesktopVerificationIdTypeScreen
        inDashboard
        dashboardNav={onNav}
        onBack={onBack}
        idType={draft.idType}
        onIdTypeChange={changeIdType}
        onContinue={() => setStep('form')}
      />
    ) : (
      <DesktopVerificationIdFormScreen
        inDashboard
        dashboardNav={onNav}
        onBack={() => setStep('type')}
        draft={draft}
        onDraftChange={changeDraft}
        onResult={onComplete}
      />
    );
  }

  return step === 'type' ? (
    <VerificationIdTypeScreen
      onBack={onBack}
      idType={draft.idType}
      onIdTypeChange={changeIdType}
      onContinue={() => setStep('form')}
    />
  ) : (
    <VerificationIdFormScreen
      inDashboard
      onBack={() => setStep('type')}
      draft={draft}
      onDraftChange={changeDraft}
      onResult={onComplete}
    />
  );
}
