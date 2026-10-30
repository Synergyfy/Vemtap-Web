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

const ID_OPTIONS: { key: VerificationIdType; icon: string; name: string; badge: string | null; description: string }[] = [
  {
    key: 'nin',
    icon: 'fingerprint',
    name: 'NIN',
    badge: 'Recommended • Instant',
    description: 'Fast digital verification via official NIMC database',
  },
  {
    key: 'drivers_license',
    icon: 'directions_car',
    name: "Driver's Licence",
    badge: null,
    description: 'Federal Road Safety Corps (FRSC) issued licence',
  },
  {
    key: 'passport',
    icon: 'menu_book',
    name: 'International Passport',
    badge: null,
    description: 'Nigerian Immigration Service (NIS) passport',
  },
  {
    key: 'voters_card',
    icon: 'how_to_vote',
    name: "Voter's Card",
    badge: null,
    description: 'Official INEC voter registry lookup via 19-character VIN',
  },
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
  const options = live
    ? ID_OPTIONS.map((option) => ({
        ...option,
        badge: option.key === 'nin' ? 'Recommended' : null,
        description: ID_TYPE_REQUIREMENTS[option.key],
      }))
    : ID_OPTIONS;

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
            <p className="font-label-sm text-label-sm text-on-surface">Official Identity Registry</p>
            <p className="font-caption text-caption text-on-surface-variant">
              {live ? 'Registry check with a selfie face match' : 'Connected with accredited verification services'}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0 animate-pulse" />
        </div>

        {/* ID Options List */}
        <div className="flex flex-col space-y-2.5">
          {options.map((option) => {
            const active = option.key === idType;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onIdTypeChange(option.key)}
                className={`w-full text-left p-3 rounded-xl shadow-sm transition-all duration-200 ${
                  active ? 'bg-surface-container-low' : 'bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                        active ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <Icon name={option.icon} className="text-[20px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">{option.name}</span>
                        {step.lastAttempt?.idType === option.key && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption">
                            Last tried
                          </span>
                        )}
                        {option.badge && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption">
                            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                      active ? 'bg-primary-container' : 'bg-surface-container-high'
                    }`}
                  >
                    {active ? (
                      <Icon name="check" className="text-on-primary text-[18px]" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-transparent" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Security & Privacy Reassurance Notice */}
        <div className="mt-4 p-3 rounded-xl bg-surface-container-low flex items-start gap-2.5 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="lock" className="text-primary text-[16px]" />
          </div>
          <div className="flex-1">
            <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
              Your personal identity information is protected by{' '}
              <span className="font-semibold text-on-surface">256-bit bank-grade encryption</span> and only used for
              account authentication and regulatory compliance.
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
