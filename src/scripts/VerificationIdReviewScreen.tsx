import { useEffect, useState } from 'react';
import { useVerificationActions } from '../hooks/business/useVerification';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerificationIdReviewScreenProps {
  onBack: () => void;
  onRetry: () => void;
  onUseAnotherId: () => void;
  /** Readable reasons from the verification check, when one was stored. */
  reasons?: string[];
  /** Backend check id, so manual review is attached to the right record. */
  checkId?: string;
}

const GENERAL_REASONS = [
  { icon: 'badge', body: 'Check the ID number and name you entered.' },
  { icon: 'blur_on', body: 'If you uploaded a document, make sure the details can be read clearly.' },
  { icon: 'support_agent', body: 'If the details are correct, request a manual review.' },
];

export function VerificationIdReviewScreen({
  onBack,
  onRetry,
  onUseAnotherId,
  reasons,
  checkId,
}: VerificationIdReviewScreenProps) {
  const verification = useVerificationActions();
  const [manualRequested, setManualRequested] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    if (!manualError) return;
    const timeout = window.setTimeout(() => setManualError(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [manualError]);

  const handleManualReview = async () => {
    if (manualRequested || manualLoading) return;
    setManualLoading(true);
    setManualError(null);
    try {
      await verification.requestManualReview(checkId);
      setManualRequested(true);
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Could not request a review. Please try again.');
    } finally {
      setManualLoading(false);
    }
  };

  const displayedReasons = reasons?.length
    ? reasons.map((reason) => ({ icon: 'error_outline', body: reason }))
    : GENERAL_REASONS;

  return (
    <AppScreen>
      <ScreenHeader title="Id Verification Needs Review" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-lg">
        {/* Review Hero */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div className="relative w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mb-3 shadow-sm">
            <Icon name="privacy_tip" filled className="text-tertiary text-[32px]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-canvas shadow-sm flex items-center justify-center">
              <Icon name="cached" className="text-tertiary text-[16px]" />
            </div>
          </div>
          <h2 className="font-heading-sm text-heading-sm leading-tight text-on-surface mb-1.5 tracking-tight">
            We couldn't verify your identity
          </h2>
          <p className="font-body-md text-body-md leading-snug text-on-surface-variant max-w-[320px]">
            Please check your information and try again. Minor mismatches or blurry scans are easy to fix.
          </p>
        </div>

        {/* Common Reasons Card */}
        <div className="bg-surface-subtle rounded-xl p-4 shadow-sm mb-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <Icon name="lightbulb" className="text-primary text-[18px]" />
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">Common reasons this happens</h3>
          </div>
          <div className="space-y-2.5">
            {displayedReasons.map((reason, index) => (
              <div className="flex items-start gap-2.5" key={`${reason.icon}-${index}`}>
                <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name={reason.icon} className="text-primary text-[13px]" />
                </div>
                <p className="font-caption text-caption text-on-surface-variant flex-1 leading-snug">{reason.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reassurance Banner */}
        <div className="bg-surface-container-low rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 mb-4">
          <Icon name="verified_user" className="text-badge-discount-text text-[18px] shrink-0" />
          <p className="font-label-sm text-label-sm text-on-surface leading-tight">
            Don't worry — this does not affect your account or ability to use VEMTAP.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2.5">
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            type="button"
            onClick={onRetry}
          >
            <span>Try Again</span>
            <Icon name="refresh" className="text-[18px]" />
          </button>
          <button
            className="w-full h-11 rounded-xl bg-surface-canvas text-on-surface font-button-secondary text-button-secondary shadow-sm flex items-center justify-center gap-2 active:bg-surface-subtle transition-colors"
            type="button"
            onClick={onUseAnotherId}
          >
            <Icon name="contact_page" className="text-[18px] text-on-surface-variant" />
            <span>Use Another ID (Passport or Licence)</span>
          </button>
          <div className="flex flex-col items-center text-center mt-1 px-3">
            <button
              className={`font-button-secondary text-button-secondary hover:text-primary flex items-center justify-center gap-1.5 py-1.5 transition-colors ${
                manualRequested ? 'text-primary' : 'text-on-surface-variant'
              }`}
              id="manual-review-btn"
              type="button"
              disabled={manualRequested || manualLoading}
              onClick={handleManualReview}
            >
              <Icon
                name={manualRequested ? 'check_circle' : manualLoading ? 'progress_activity' : 'support_agent'}
                className={`text-[18px]${manualLoading ? ' animate-spin' : ''}`}
                filled={manualRequested}
              />
              <span>
                {manualRequested
                  ? 'Manual Review Requested'
                  : manualLoading
                    ? 'Requesting Review...'
                    : 'Request Manual Review'}
              </span>
            </button>
            <span className="font-caption text-caption text-text-tertiary">
              {manualRequested ? 'Your review request has been recorded.' : 'Our compliance team will review this check.'}
            </span>
          </div>
        </div>
      </div>
      {manualError && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {manualError}
        </div>
      )}
    </AppScreen>
  );
}
