import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerificationReviewScreenProps {
  onBack: () => void;
  onReviewComplete: () => void;
  legalName: string;
  businessName: string;
}

type ReviewPhase = 0 | 1 | 2;

function ClockIcon() {
  return (
    <svg
      className="w-8 h-8 text-primary-container"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline
        className="animate-spin"
        points="12 7 12 12 15 15"
        style={{ animationDuration: '8s', transformOrigin: 'center' }}
      />
    </svg>
  );
}

export function VerificationReviewScreen({
  onBack,
  onReviewComplete,
  legalName,
  businessName,
}: VerificationReviewScreenProps) {
  const [phase, setPhase] = useState<ReviewPhase>(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.push(window.setTimeout(() => setPhase(1), 2500));
    timers.current.push(window.setTimeout(() => setPhase(2), 5200));
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  const fastForward = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setPhase(2);
  };

  const reviewComplete = phase === 2;

  return (
    <AppScreen>
      <ScreenHeader title="Verification Review" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pt-space-md pb-space-2xl">
        {/* Warm Ambient Verification Animation / Visual Badge */}
        <div className="relative flex items-center justify-center my-space-sm">
          <div className="absolute w-28 h-28 rounded-full bg-primary-container/10 animate-ping opacity-30" />
          <div className="absolute w-24 h-24 rounded-full bg-surface-tint-blue animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-surface-tint-blue flex items-center justify-center">
              <ClockIcon />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-sm">
              <Icon name="verified_user" className="text-on-tertiary-fixed text-[16px]" />
            </div>
          </div>
        </div>

        {/* Status Headlines */}
        <div className="text-center mt-space-sm mb-space-lg max-w-sm mx-auto">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm mb-space-xs">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            Application Under Review
          </span>
          <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
            Verification in progress
          </h2>
          <p className="font-label-sm text-label-sm text-text-secondary mt-space-2xs">
            We're checking the information you provided. This may take a little while.
          </p>
        </div>

        {/* Progress Checklist Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-sm mb-space-md">
          <div className="flex items-center justify-between pb-space-xs mb-space-xs">
            <span className="font-label-md text-label-md text-text-primary">Review Progress</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${
                reviewComplete
                  ? 'bg-badge-discount-bg text-badge-discount-text font-semibold'
                  : 'text-badge-discount-text bg-badge-discount-bg'
              }`}
            >
              {reviewComplete ? 'Review Complete' : phase === 0 ? 'Step 3 of 4' : 'Step 4 of 4'}
            </span>
          </div>
          <div className="space-y-space-md pt-space-xs">
            {/* Item 1: Completed */}
            <div className="flex items-start gap-space-sm">
              <div className="w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Icon name="check" className="text-badge-discount-text text-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label-md text-label-md text-text-primary">Identity submitted</p>
                <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                  {legalName} • NIN verified
                </p>
              </div>
              <Icon name="verified" className="text-badge-discount-text text-[18px]" />
            </div>
            {/* Item 2: Completed */}
            <div className="flex items-start gap-space-sm">
              <div className="w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Icon name="check" className="text-badge-discount-text text-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label-md text-label-md text-text-primary">Business information submitted</p>
                <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                  {businessName} • CAC documents received
                </p>
              </div>
              <Icon name="folder_special" className="text-badge-discount-text text-[18px]" />
            </div>
            {/* Item 3: Registry cross-reference */}
            {phase === 0 ? (
              <div className="flex items-start gap-space-sm bg-surface-tint-blue/70 p-space-xs rounded-lg">
                <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-on-primary animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-label-md text-label-md text-primary font-semibold">Verification in progress</p>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce" />
                  </div>
                  <p className="font-caption text-caption text-on-secondary-container mt-0.5 leading-snug">
                    Registry cross-reference under review by compliance team
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-space-sm">
                <div className="w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Icon name="check" className="text-badge-discount-text text-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-label-md text-text-primary">Registry cross-reference</p>
                  <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                    Compliance review passed
                  </p>
                </div>
                <Icon name="verified" className="text-badge-discount-text text-[18px]" />
              </div>
            )}
            {/* Item 4: Badge activation */}
            {phase < 2 ? (
              phase === 1 ? (
                <div className="flex items-start gap-space-sm bg-surface-tint-blue/70 p-space-xs rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-on-primary animate-ping" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-label-md text-label-md text-primary font-semibold">
                        Finalizing VEMTAP verification
                      </p>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce" />
                    </div>
                    <p className="font-caption text-caption text-on-secondary-container mt-0.5 leading-snug">
                      Activating your official Verified badge
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-space-sm opacity-60">
                  <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-label-md text-text-primary">VEMTAP verification complete</p>
                    <p className="font-caption text-caption text-text-tertiary mt-0.5">
                      Official Verified badge activation
                    </p>
                  </div>
                  <Icon name="workspace_premium" className="text-text-tertiary text-[18px]" />
                </div>
              )
            ) : (
              <div className="flex items-start gap-space-sm">
                <div className="w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Icon name="check" className="text-badge-discount-text text-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-label-md text-text-primary">VEMTAP verification complete</p>
                  <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                    Official Verified badge active
                  </p>
                </div>
                <Icon name="workspace_premium" className="text-badge-discount-text text-[18px]" />
              </div>
            )}
          </div>
        </div>

        {/* Turnaround Insight Badge */}
        <div className="w-full bg-surface-container-low rounded-xl p-space-sm flex items-start gap-space-sm mb-space-md">
          <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center flex-shrink-0">
            <Icon name="schedule" className="text-primary text-[20px]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-label-md text-label-md text-text-primary mb-0.5">Estimated Turnaround</h4>
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              Most verifications are reviewed within 2 to 24 hours. We'll send a push notification and email once your
              review is completed.
            </p>
          </div>
        </div>

        {/* Reassurance / Continuous Setup Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg flex items-start gap-space-sm relative overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0">
            <Icon name="storefront" className="text-badge-discount-text text-[20px]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-label-md text-label-md text-text-primary font-semibold">
                You don't have to wait here!
              </span>
              <span className="font-caption text-caption bg-surface-tint-blue text-primary px-1.5 py-0.5 rounded font-medium">
                Ready
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-text-secondary leading-normal">
              You can continue configuring your storefront, adding products, and customizing your deals in the
              meantime.
            </p>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="mt-auto w-full space-y-space-xs">
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-md shadow-primary-container/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            id="continue-setup-btn"
            type="button"
            onClick={reviewComplete ? onReviewComplete : fastForward}
          >
            <span>{reviewComplete ? 'Continue to Activation' : 'Continue Setup'}</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <button
            className="w-full h-11 rounded-xl text-text-primary font-label-sm text-label-sm hover:bg-surface-container-high/40 active:scale-[0.98] transition-all flex items-center justify-center"
            id="status-later-btn"
            type="button"
            onClick={onBack}
          >
            Check Status Later
          </button>
        </div>

        {/* Merchant Support Shortcut */}
        <div className="mt-space-md pt-space-xs text-center">
          <a
            className="inline-flex items-center gap-1 font-label-md text-caption text-text-secondary hover:text-primary transition-colors py-1 px-2 rounded-full hover:bg-surface-container-high/40"
            href="mailto:support@vemtap.com"
          >
            <span>Questions?</span>
            <span className="text-primary font-medium underline underline-offset-2">Contact Merchant Support</span>
          </a>
        </div>
      </div>
    </AppScreen>
  );
}
