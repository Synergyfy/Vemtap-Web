import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import type { VerificationIdType } from './verificationDraft';
import { ID_TYPE_REQUIREMENTS, useIdTypeStep } from '../hooks/business/useVerification';

interface VerificationIdTypeScreenProps {
  onBack: () => void;
  idType: VerificationIdType;
  onIdTypeChange: (idType: VerificationIdType) => void;
  onContinue: () => void;
}

const ID_OPTIONS: { key: VerificationIdType; name: string }[] = [
  { key: 'nin', name: 'NIN' },
  { key: 'drivers_license', name: "Driver's Licence" },
  { key: 'passport', name: 'International Passport' },
  { key: 'voters_card', name: "Voter's Card" },
  { key: 'bvn', name: 'BVN' },
];

export function VerificationIdTypeScreen({
  onBack,
  idType,
  onIdTypeChange,
  onContinue,
}: VerificationIdTypeScreenProps) {
  const [preparing, setPreparing] = useState(false);
  const timer = useRef<number | null>(null);
  // Live: what each ID really needs, the name it must match and the last attempt.
  const step = useIdTypeStep();
  const live = step.live;
  const options = ID_OPTIONS.map((option) => ({
    ...option,
    description: ID_TYPE_REQUIREMENTS[option.key],
  }));
  const selected = options.find((option) => option.key === idType) ?? options[0];

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const handleContinue = () => {
    if (live) return onContinue();
    if (preparing) return;
    setPreparing(true);
    timer.current = window.setTimeout(() => onContinue(), 1000);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Verify Your Identity" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-lg">
        {/* Top Progress Bar & Step Tracker */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
            <Icon name="shield_person" filled className="text-[15px]" />
            <span>Step 1 of 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1.5 rounded-full bg-primary-container" />
            <div className="w-1.5 h-1.5 rounded-full bg-surface-variant" />
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col space-y-1 mb-4">
          <h2 className="font-heading-md text-heading-md text-on-surface">Who are you?</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
            Select a government-issued ID to verify your identity. This verifies the person operating this business
            account.
          </p>
          {step.accountName && (
            <p className="font-label-sm text-label-sm text-on-surface">
              The name on your ID must match: <span className="font-semibold">{step.accountName}</span>
            </p>
          )}
        </div>

        {step.lastAttempt && (
          <div
            className={`flex items-start gap-2.5 p-3 mb-4 rounded-xl ${
              step.lastAttempt.underReview ? 'bg-surface-tint-blue text-primary' : 'bg-error-container/40 text-on-surface'
            }`}
          >
            <Icon name={step.lastAttempt.underReview ? 'pending_actions' : 'error'} className="text-[18px] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-label-sm text-label-sm font-semibold">
                {step.lastAttempt.underReview
                  ? `Your last check (${step.lastAttempt.label}) is under review.`
                  : `Your last check (${step.lastAttempt.label}) didn’t go through.`}
              </span>
              {step.lastAttempt.reasons.map((reason) => (
                <span key={reason} className="font-caption text-caption text-on-surface-variant">
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Verified Security Banner */}
        <div className="flex items-center gap-2.5 p-3 mb-4 rounded-xl bg-surface-container-low shadow-sm">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
            <Icon name="verified_user" filled className="text-primary text-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-label-sm text-label-sm text-on-surface">Identity check</p>
            <p className="font-caption text-caption text-on-surface-variant">
              {live ? 'Registry check with a selfie face match' : 'Connected with accredited verification services'}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0 animate-pulse" />
        </div>

        {/* ID type dropdown */}
        <div className="flex flex-col gap-space-2xs">
          <label className="font-label-sm text-label-sm font-medium text-on-surface" htmlFor="id-type-select">
            Identity document type
          </label>
          <div className="relative flex items-center">
            <select
              className="w-full h-11 appearance-none rounded-xl bg-surface-container-lowest px-space-md pr-space-xl text-on-surface font-button-secondary text-button-secondary shadow-sm focus:outline-none"
              id="id-type-select"
              value={idType}
              onChange={(event) => onIdTypeChange(event.target.value as VerificationIdType)}
            >
              {options.map((option) => (
                <option className="bg-surface-container-lowest text-on-surface" key={option.key} value={option.key}>
                  {option.name}
                  {step.lastAttempt?.idType === option.key ? ' (last tried)' : ''}
                </option>
              ))}
            </select>
            <Icon name="expand_more" className="pointer-events-none absolute right-space-md text-[20px] text-text-secondary" />
          </div>
          <div className="p-3 mt-space-2xs rounded-xl bg-surface-container-low shadow-sm">
            <p className="font-label-md text-label-md text-on-surface font-semibold">{selected.name}</p>
            <p className="font-caption text-caption text-on-surface-variant leading-relaxed mt-0.5">{selected.description}</p>
          </div>
        </div>

        {/* Security & Privacy Reassurance Notice */}
        <div className="mt-4 p-3 rounded-xl bg-surface-container-low flex items-start gap-2.5 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="lock" className="text-primary text-[16px]" />
          </div>
          <div className="flex-1">
            <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
              Your personal identity information is handled securely and only used for verification and account
              authentication.
            </p>
          </div>
        </div>

        {/* Bottom CTA Container */}
        <div className="mt-auto pt-5 flex flex-col items-center">
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.98] transition-all duration-150"
            id="btn-continue"
            type="button"
            disabled={preparing}
            onClick={handleContinue}
          >
            {preparing ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-[20px]" />
                <span>Preparing verification...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </>
            )}
          </button>
          {!live && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-on-surface-variant font-caption text-caption">
              <Icon name="verified" className="text-[15px] text-primary" />
              <span>Instant identity verification in 30 seconds</span>
            </div>
          )}
        </div>
      </div>
    </AppScreen>
  );
}
