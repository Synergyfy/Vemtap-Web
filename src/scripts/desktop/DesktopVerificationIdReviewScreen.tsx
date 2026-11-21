import { useEffect, useState } from 'react';
import { useVerificationActions } from '../../hooks/business/useVerification';
import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationIdReviewScreenProps {
  onBack: () => void;
  onRetry: () => void;
  onUseAnotherId: () => void;
  onBrand?: () => void;
  reasons?: string[];
  checkId?: string;
}

const DIAGNOSTICS = [
  {
    icon: 'badge',
    title: 'Check the details you entered',
    body: 'Make sure the ID number and name match the document you supplied.',
    tip: 'Use your full legal name as it appears on the ID, including middle names where shown.',
    tipIcon: 'lightbulb',
  },
  {
    icon: 'blur_on',
    title: 'Document details could not be read clearly',
    body: 'Glare, low resolution or a partially hidden document can stop the details being read.',
    tip: 'Use even, indirect light and keep the whole document visible.',
    tipIcon: 'flare',
  },
  {
    icon: 'crop_free',
    title: 'The document may be cropped',
    body: 'Include all edges of the document so the full layout is visible.',
    tip: 'Place the document flat on a dark, non-reflective surface before capturing it.',
    tipIcon: 'photo_camera',
  },
];

export function DesktopVerificationIdReviewScreen({
  onBack,
  onRetry,
  onUseAnotherId,
  onBrand,
  reasons,
  checkId,
}: DesktopVerificationIdReviewScreenProps) {
  const verification = useVerificationActions();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [retrying, setRetrying] = useState(false);
  const [manualRequested, setManualRequested] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    if (!manualError) return;
    const timeout = window.setTimeout(() => setManualError(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [manualError]);

  const handleRetry = () => {
    if (retrying) return;
    setRetrying(true);
    window.setTimeout(() => {
      setRetrying(false);
      onRetry();
    }, 900);
  };

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

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="w-full bg-error-container text-on-error-container px-margin py-space-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-space-md flex-wrap">
          <div className="flex items-center gap-space-xs font-label-md text-label-md font-semibold">
            <Icon name="error" filled className="text-[20px]" />
            <span>Identity check needs review</span>
          </div>
          <div className="flex items-center gap-space-sm text-caption font-caption">
            <span className="inline-flex items-center gap-space-2xs rounded-full bg-surface-canvas/80 px-space-xs py-space-2xs font-medium text-on-surface">
              <Icon name="lock" className="text-[14px]" />
              Credential references are masked
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-margin py-space-xl flex flex-col gap-space-2xl">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-text-secondary">
            <span>Merchant Portal</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span>Compliance &amp; Trust</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">Identity Verification</span>
          </div>
          <div className="flex items-center gap-space-xs font-caption text-caption text-text-tertiary">
            <Icon name="shield_lock" className="text-[16px] text-badge-discount-text" />
            <span>Checked through the configured verification provider</span>
          </div>
        </div>

        <div className="w-full bg-surface-canvas rounded-xl p-space-xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-tertiary-fixed-dim/40 to-transparent pointer-events-none blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-space-xl">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-md">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-canvas flex items-center justify-center">
                  <Icon name="sync_problem" filled className="text-tertiary-container text-[42px] animate-spin" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-tertiary-container text-on-tertiary rounded-full w-7 h-7 flex items-center justify-center shadow-sm">
                <Icon name="priority_high" className="text-[16px] font-bold" />
              </div>
            </div>
            <div className="flex flex-col gap-space-xs text-center md:text-left flex-1 min-w-0">
              <div className="inline-flex items-center justify-center md:justify-start gap-space-xs flex-wrap">
                <span className="px-space-xs py-space-2xs bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-caption rounded-full uppercase tracking-wider font-semibold">
                  Review needed
                </span>
              </div>
              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
                We couldn't verify your identity
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary max-w-3xl">
                Check the details below and try again. If the information is correct, you can request a manual review.
              </p>
            </div>
          </div>
        </div>

        {reasons && reasons.length > 0 && (
          <div className="w-full bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface">What the check reported</span>
            <ul className="flex flex-col gap-space-2xs">
              {reasons.map((reason, index) => (
                <li key={`${reason}-${index}`} className="flex items-start gap-space-xs font-body-md text-body-md text-text-secondary">
                  <Icon name="error_outline" className="text-[18px] text-tertiary shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between gap-space-md flex-wrap">
              <div>
                <h2 className="font-heading-md text-heading-md text-on-surface">
                  Troubleshooting &amp; Common Reasons
                </h2>
                <p className="font-label-md text-label-md text-text-secondary mt-space-2xs">
                  Check these common causes before you try again:
                </p>
              </div>
              <span className="hidden sm:inline-block px-space-xs py-space-2xs bg-surface-container-high text-on-surface-variant font-label-sm text-caption rounded-md font-medium">
                {DIAGNOSTICS.length} Common causes
              </span>
            </div>
            <div className="flex flex-col gap-space-md">
              {DIAGNOSTICS.map((item, index) => {
                const open = expanded === index;
                return (
                  <div
                    key={item.icon}
                    className={`bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                      open ? 'bg-surface-tint-blue/30' : ''
                    }`}
                    onClick={() => setExpanded(open ? null : index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') setExpanded(open ? null : index);
                    }}
                  >
                    <div className="flex items-start gap-space-md">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          open
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-tint-blue text-primary group-hover:bg-primary group-hover:text-on-primary'
                        }`}
                      >
                        <Icon name={item.icon} className="text-[22px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-space-sm">
                          <h3 className="font-heading-sm text-heading-sm text-on-surface">{item.title}</h3>
                          <Icon
                            name={open ? 'expand_less' : 'expand_more'}
                            className="text-outline text-[20px] transition-transform duration-200 shrink-0"
                          />
                        </div>
                        <p className="font-body-md text-body-md text-text-secondary mt-space-xs">{item.body}</p>
                        {open && (
                          <div className="mt-space-sm pt-space-sm flex flex-wrap items-center gap-space-xs font-label-sm text-caption text-primary">
                            <Icon name={item.tipIcon} className="text-[16px]" />
                            <span>Tip: {item.tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-badge-discount-bg text-on-surface rounded-xl p-space-lg shadow-sm flex items-start gap-space-md">
              <div className="w-10 h-10 rounded-full bg-badge-discount-text/10 flex items-center justify-center shrink-0 text-badge-discount-text">
                <Icon name="check_circle" filled className="text-[24px]" />
              </div>
              <div className="flex flex-col gap-space-2xs">
                <span className="font-heading-sm text-heading-sm text-badge-discount-text font-semibold">
                  Zero Store Disruption
                </span>
                <p className="font-body-md text-body-md text-on-surface font-medium leading-snug">
                  This check does not change your saved business details. You can correct them and try again.
                </p>
                <div className="flex items-center gap-space-xs mt-space-2xs font-caption text-caption text-text-secondary">
                  <Icon name="lock" className="text-[14px]" />
                  <span>Only a masked credential reference is stored</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-xs flex-wrap">
                <div className="flex items-center gap-space-xs">
                  <Icon name="support_agent" className="text-primary text-[22px]" />
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Manual review</h3>
                </div>
                <span className="px-space-xs py-space-2xs bg-surface-container text-on-surface-variant font-label-sm text-caption rounded-full">
                  Optional
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                If your details are correct, ask our team to review this check. The request is attached to this
                verification record.
              </p>
              <button
                className="w-full bg-surface-tint-blue hover:bg-primary/10 text-primary py-space-sm px-space-md rounded-lg font-button-secondary text-button-secondary transition-colors text-center flex items-center justify-center gap-space-xs disabled:opacity-60"
                type="button"
                disabled={manualRequested || manualLoading}
                onClick={handleManualReview}
              >
                <Icon
                  name={manualRequested ? 'check_circle' : manualLoading ? 'progress_activity' : 'assignment_turned_in'}
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
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0">
                  <Icon name="help" className="text-[22px]" />
                </div>
                <div>
                  <h4 className="font-heading-sm text-heading-sm text-on-surface">Need a hand?</h4>
                  <p className="font-caption text-caption text-text-secondary">Review the preparation tips first.</p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                The tips on the left cover the most common reasons a check needs another look.
              </p>
              <button
                className="w-full bg-badge-discount-bg hover:bg-badge-discount-text/20 text-badge-discount-text py-space-sm px-space-md rounded-lg font-button-secondary text-button-secondary transition-colors flex items-center justify-center gap-space-xs"
                type="button"
                onClick={() => setExpanded(0)}
              >
                <Icon name="lightbulb" className="text-[20px]" />
                <span>Show Preparation Tips</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-canvas rounded-xl p-space-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-space-lg mt-space-md">
          <div className="flex items-center gap-space-sm w-full md:w-auto">
            <button
              className="w-full md:w-auto h-11 px-space-lg bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-button-secondary text-button-secondary transition-colors flex items-center justify-center gap-space-xs"
              type="button"
              onClick={onUseAnotherId}
            >
              <Icon name="contact_page" className="text-[20px] text-text-secondary" />
              <span>Use Another ID (Passport or Driver's Licence)</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-space-md w-full md:w-auto">
            <button
              className="font-label-md text-label-md text-text-secondary hover:text-primary transition-colors text-center order-2 sm:order-1 px-space-xs"
              type="button"
              onClick={handleManualReview}
              disabled={manualRequested || manualLoading}
            >
              {manualRequested
                ? 'Manual Review Requested'
                : manualLoading
                  ? 'Requesting Review...'
                  : 'Request Manual Review'}
            </button>
            <button
              className="w-full sm:w-auto h-11 px-space-2xl bg-primary hover:bg-[#0559CA] active:scale-[0.98] text-on-primary rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-space-xs order-1 sm:order-2 disabled:opacity-70"
              type="button"
              disabled={retrying}
              onClick={handleRetry}
            >
              {retrying ? (
                <>
                  <Icon name="progress_activity" className="animate-spin text-[20px]" />
                  <span>Reopening Scanner...</span>
                </>
              ) : (
                <>
                  <span>Try Again</span>
                  <Icon name="sync" className="text-[20px]" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            className="px-space-md py-space-xs text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Document Details</span>
          </button>
        </div>
      </div>
      {manualError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-space-lg py-space-sm text-label-md font-medium shadow-lg">
          {manualError}
        </div>
      )}
    </BusinessVerificationChrome>
  );
}
