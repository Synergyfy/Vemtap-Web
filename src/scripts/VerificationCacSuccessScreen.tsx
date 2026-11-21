import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { maskIdNumber, type VerificationCheck } from '../services/verificationService';

interface VerificationCacSuccessScreenProps {
  onBack: () => void;
  onContinue: () => void;
  businessName: string;
  cacNumber: string;
  legalName: string;
  representativeName?: string;
  /** Representative/ownership check when available. */
  check?: VerificationCheck;
  /** CAC registration check. */
  businessCheck?: VerificationCheck;
}

const statusLabel = (check?: VerificationCheck) => {
  if (!check) return 'Not available';
  if (check.status === 'verified') return 'Verified';
  if (check.status === 'needs_review') return 'In review';
  if (check.status === 'failed') return 'Failed';
  return 'Pending';
};

export function VerificationCacSuccessScreen({
  onBack,
  onContinue,
  businessName,
  cacNumber,
  legalName,
  representativeName,
  check,
  businessCheck,
}: VerificationCacSuccessScreenProps) {
  const sandbox = check?.environment === 'test' || businessCheck?.environment === 'test';
  const environment = sandbox ? 'Sandbox' : check?.environment === 'live' ? 'Live' : 'Demo';
  const registrationVerified = businessCheck?.status === 'verified';
  const representativeVerified = check?.kind === 'representative' && check.status === 'verified';
  const safeRegistration = businessCheck?.maskedId || (check?.environment || businessCheck?.environment ? maskIdNumber(cacNumber) : cacNumber);
  const initials = businessName.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || 'BV';

  return (
    <AppScreen>
      <ScreenHeader title="Cac Verification Success" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-2xl">
        {/* Success Badge */}
        <div className="relative w-full flex flex-col items-center pt-space-md text-center">
          <div className="relative flex items-center justify-center my-space-sm">
            <div className="absolute -inset-4 bg-badge-discount-bg/80 rounded-full blur-xl scale-125 pointer-events-none" />
            <div className="relative w-20 h-20 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-lg shadow-badge-discount-text/10">
              <div className="w-14 h-14 rounded-full bg-badge-discount-text flex items-center justify-center text-on-primary shadow-inner">
                <Icon
                  name={sandbox ? 'science' : 'check'}
                  className="text-[34px]"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                />
              </div>
            </div>
          </div>
          <div className="px-space-xs mt-space-xs">
            <h2 className="font-heading-md text-heading-md text-on-surface tracking-tight">
              {sandbox ? 'Sandbox checks complete' : 'Business checks complete'}
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-space-2xs max-w-[320px] mx-auto leading-relaxed">
              {sandbox
                ? 'These results came from sandbox checks. They are not live verification and must not be used as proof of a verified customer.'
                : 'Your registration and representative checks have been recorded against your business account.'}
            </p>
          </div>
        </div>

        {/* Business Summary Strip */}
        <div className="mt-space-lg w-full bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm">
          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-surface-tint-blue flex items-center justify-center">
            <span className="font-heading-sm text-heading-sm text-primary font-semibold">{initials}</span>
            <div className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-tl-md px-1 py-0.5 flex items-center">
              <Icon name={sandbox ? 'science' : 'verified'} filled className="text-[10px]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-body-md text-body-md font-semibold text-on-surface truncate">{businessName}</span>
            </div>
            <p className="font-caption text-caption text-on-surface-variant truncate mt-0.5">
              {environment} result • {registrationVerified ? 'Registration recorded' : 'Registration checked'}
            </p>
          </div>
        </div>

        {/* Verification Summary Card */}
        <div className="mt-space-md w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary">
              Check record
            </span>
            <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
              {environment}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-caption text-caption text-on-surface-variant">Business Name</span>
            <span className="font-body-md text-body-md text-on-surface font-semibold truncate">{businessName}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-caption text-caption text-on-surface-variant">CAC Registration</span>
            <div className="self-start inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              <Icon name={registrationVerified ? 'check_circle' : 'schedule'} filled className="text-[14px]" />
              <span>{safeRegistration} • {statusLabel(businessCheck)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-caption text-caption text-on-surface-variant">Account Operator</span>
            <div className="self-start inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
              <Icon name="badge" filled className="text-[14px]" />
              <span>{legalName}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-caption text-caption text-on-surface-variant">Representative Check</span>
            <div className="self-start inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              <Icon name={representativeVerified ? 'person_check' : 'schedule'} filled className="text-[14px]" />
              <span>{representativeName || 'Not supplied'} • {statusLabel(check)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 pt-space-2xs">
            <span className="font-caption text-caption text-on-surface-variant">Ownership</span>
            <p className="font-label-sm text-label-sm text-on-surface leading-snug">
              The registry lookup and the representative check are separate records. A company record alone does not
              prove account ownership.
            </p>
          </div>
        </div>

        {/* Check Explanation Banner */}
        <div className="mt-space-md w-full bg-surface-container-low rounded-xl p-space-sm flex gap-space-sm items-start">
          <div className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="shield" filled className="text-[18px]" />
          </div>
          <p className="font-label-sm text-label-sm text-on-surface leading-snug">
            Trust badges and final verification status depend on all checks being complete. Continue to final review to
            see your current status.
          </p>
        </div>

        {/* Bottom Fixed Action Deck */}
        <div className="mt-auto pt-space-xl flex flex-col items-center gap-space-sm w-full">
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 active:scale-[0.98] transition-transform duration-100"
            type="button"
            onClick={onContinue}
          >
            <span>Continue to Final Review</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <p className="font-caption text-caption text-on-surface-variant text-center">
            {sandbox ? 'Sandbox result — not live verification' : 'Final review is next'}
          </p>
        </div>
      </div>
    </AppScreen>
  );
}
