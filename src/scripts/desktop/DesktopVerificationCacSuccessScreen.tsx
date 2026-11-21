import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { maskIdNumber, type VerificationCheck } from '../../services/verificationService';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationCacSuccessScreenProps {
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
  onBrand?: () => void;
}

const statusLabel = (check?: VerificationCheck) => {
  if (!check) return 'Not available';
  if (check.status === 'verified') return 'Verified';
  if (check.status === 'needs_review') return 'In review';
  if (check.status === 'failed') return 'Failed';
  return 'Pending';
};

const NEXT_STEPS = [
  {
    icon: 'fact_check',
    title: 'Final review',
    body: 'See the combined status of your identity, registration and representative checks.',
  },
  {
    icon: 'dashboard',
    title: 'Status centre',
    body: 'Track the outcome from your business verification dashboard at any time.',
  },
  {
    icon: 'storefront',
    title: 'Finish setup',
    body: 'Continue with catalogue, deals and storefront setup while checks are reviewed.',
  },
];

export function DesktopVerificationCacSuccessScreen({
  onBack,
  onContinue,
  businessName,
  cacNumber,
  legalName,
  representativeName,
  check,
  businessCheck,
  onBrand,
}: DesktopVerificationCacSuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const sandbox = check?.environment === 'test' || businessCheck?.environment === 'test';
  const environment = sandbox ? 'Sandbox' : check?.environment === 'live' ? 'Live' : 'Demo';
  const registrationVerified = businessCheck?.status === 'verified';
  const representativeVerified = check?.kind === 'representative' && check.status === 'verified';
  const safeRegistration = businessCheck?.maskedId || (check?.environment || businessCheck?.environment ? maskIdNumber(cacNumber) : cacNumber);
  const auditReference = check?.id ?? businessCheck?.id ?? 'Not available';
  const recordedAt = check?.createdAt
    ? new Date(check.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;
  const initials = businessName.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || 'BV';

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(auditReference);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-6xl mx-auto w-full px-margin py-space-xl flex flex-col gap-space-2xl">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-md p-space-xl md:p-space-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-badge-discount-bg/60 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-xl">
            <div className="flex items-start md:items-center gap-space-lg">
              <div className="relative shrink-0">
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-sm">
                  <Icon name={sandbox ? 'science' : 'verified'} filled className="text-[36px] md:text-[44px] text-badge-discount-text" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center">
                  <Icon name="shield" filled className="text-[16px] text-primary" />
                </span>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold tracking-wide uppercase">
                    Check record
                  </span>
                  <span className="text-text-secondary font-label-sm text-label-sm font-medium">{environment} result</span>
                </div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight font-bold">
                  {sandbox ? 'Sandbox business checks complete' : 'Business checks complete'}
                </h1>
                <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
                  {sandbox
                    ? 'These results came from sandbox checks. They are not live verification and must not be used as proof of a verified customer.'
                    : 'Your registration and representative checks have been recorded against your business account.'}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-start md:items-end gap-space-xs bg-surface-subtle p-space-md rounded-xl shadow-sm">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">Checks recorded</span>
              </div>
              <span className="font-caption text-caption text-text-tertiary">
                {recordedAt ? `Recorded ${recordedAt}` : 'Final review is next'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md relative overflow-hidden">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-tint-blue flex items-center justify-center shadow-sm">
                    <span className="font-heading-sm text-heading-sm text-primary font-semibold">{initials}</span>
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                      <Icon name={sandbox ? 'science' : 'check'} filled className="text-[12px]" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{businessName}</h2>
                    </div>
                    <p className="font-label-sm text-label-sm text-text-secondary truncate">
                      {environment} • Registration {statusLabel(businessCheck).toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="account_balance" className="text-primary text-[20px]" />
                  <span className="font-heading-sm text-heading-sm text-text-primary">Verification records</span>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Check references</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">Official Registered Name</span>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">{businessName}</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">CAC Registration Number</span>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-mono font-semibold text-text-primary">
                      {safeRegistration}
                    </span>
                    <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                      {statusLabel(businessCheck)}
                    </span>
                  </div>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">Account Operator</span>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">{legalName}</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">Representative Check</span>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      {representativeName || 'Not supplied'}
                    </span>
                    <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                      {statusLabel(check)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-space-2xs p-space-md rounded-xl bg-surface-container-high/60 flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="key" className="text-text-secondary text-[16px]" />
                    <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                      Audit Reference
                    </span>
                  </div>
                  <button
                    className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg bg-surface-container-lowest hover:bg-surface-tint-blue transition-colors text-text-primary font-caption text-caption"
                    type="button"
                    onClick={copyReference}
                  >
                    <Icon name="content_copy" className="text-[14px]" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-surface-container-lowest/80 px-space-sm py-space-xs rounded-lg">
                  <code className="font-caption text-caption font-mono text-text-primary truncate">{auditReference}</code>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-badge-discount-bg/40 flex items-start gap-space-sm">
                <Icon name="verified_user" className="text-badge-discount-text text-[22px] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-space-2xs">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Registry and ownership are separate
                  </span>
                  <p className="font-body-md text-body-md text-text-secondary leading-snug">
                    The CAC lookup does not prove that you operate the business. The representative check is stored
                    separately and shown in your verification status.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="fact_check" className="text-primary text-[20px]" />
                  <span className="font-heading-sm text-heading-sm text-text-primary">What happens next</span>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Final review
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {NEXT_STEPS.map((step) => (
                  <div className="p-space-sm rounded-lg bg-surface-subtle flex items-start gap-space-sm" key={step.icon}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary-container text-on-primary">
                      <Icon name={step.icon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">{step.title}</span>
                      <span className="font-caption text-caption text-text-secondary">{step.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Result summary</h3>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                  {environment}
                </span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between gap-space-sm">
                  <span className="font-label-sm text-label-sm text-text-secondary">Registration check</span>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">{statusLabel(businessCheck)}</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between gap-space-sm">
                  <span className="font-label-sm text-label-sm text-text-secondary">Representative check</span>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">{statusLabel(check)}</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between gap-space-sm">
                  <span className="font-label-sm text-label-sm text-text-secondary">Sandbox result</span>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    {sandbox ? 'Yes — not live verification' : 'No'}
                  </span>
                </div>
              </div>
              <p className="font-caption text-caption text-text-secondary">
                {representativeVerified && registrationVerified
                  ? 'Both checks are recorded. Final verification status depends on your identity check and any review.'
                  : 'One or more checks are still pending or need review. Your status centre shows the current outcome.'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest shadow-md p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name="timer" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-text-primary">Final review is next</span>
              <span className="font-caption text-caption text-text-secondary">
                Review your verification status, then continue with storefront setup.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
            <button
              className="h-12 px-space-lg rounded-xl text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors flex items-center justify-center gap-space-xs"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to CAC details</span>
            </button>
            <button
              className="h-12 px-space-xl rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs shadow-md"
              type="button"
              onClick={onContinue}
            >
              <span>Continue to Final Review</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
