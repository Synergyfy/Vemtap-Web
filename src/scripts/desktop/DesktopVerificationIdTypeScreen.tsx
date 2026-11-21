import { Icon } from '../../components/ui/Icon';
import type { VerificationIdType } from '../verificationDraft';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';
import { ID_TYPE_REQUIREMENTS, useIdTypeStep } from '../../hooks/business/useVerification';

interface DesktopVerificationIdTypeScreenProps {
  onBack: () => void;
  idType: VerificationIdType;
  onIdTypeChange: (idType: VerificationIdType) => void;
  onContinue: () => void;
  onBrand?: () => void;
  inDashboard?: boolean;
  dashboardNav?: (key: string) => void;
}

const ID_OPTIONS: { key: VerificationIdType; name: string }[] = [
  { key: 'nin', name: 'NIN' },
  { key: 'drivers_license', name: "Driver's Licence" },
  { key: 'passport', name: 'International Passport' },
  { key: 'voters_card', name: "Voter's Card" },
  { key: 'bvn', name: 'BVN' },
];

export function DesktopVerificationIdTypeScreen({
  onBack,
  idType,
  onIdTypeChange,
  onContinue,
  onBrand,
  inDashboard = false,
  dashboardNav,
}: DesktopVerificationIdTypeScreenProps) {
  // Live: what each ID really needs and the last attempt. The dropdown keeps
  // the existing step while removing demo-only badges and timing claims.
  const step = useIdTypeStep();
  const options = ID_OPTIONS.map((option) => ({
    ...option,
    description: ID_TYPE_REQUIREMENTS[option.key],
  }));
  const selected = options.find((option) => option.key === idType) ?? options[0];

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand} inDashboard={inDashboard} dashboardNav={dashboardNav}>
      <div className="w-full max-w-6xl mx-auto px-margin py-space-xl flex flex-col gap-space-2xl">
        <div className="w-full flex flex-col gap-space-xs bg-surface-canvas rounded-xl p-space-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs text-on-surface">
            <div className="flex items-center gap-space-xs">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-caption">
                1
              </span>
              <span className="font-heading-sm text-heading-sm">Step 1 of 2: Government-Issued Identity Selection</span>
            </div>
            <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
              <span>50% Completed</span>
              <span className="text-text-tertiary">•</span>
              <span className="text-primary font-semibold">Next: Document Details</span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
            <div className="bg-primary-container h-full rounded-full transition-all duration-500 ease-out w-1/2" />
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-space-xs">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-tint-blue rounded-full text-primary font-label-sm text-caption tracking-wide">
            <Icon name="verified" className="text-[16px]" />
            <span>Step 1 of 2 • Identity Verification</span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Who are you?</h1>
          <p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
            Select a government-issued ID to verify your identity. This verifies the person operating this business
            account.
          </p>
          {step.accountName && (
            <p className="font-body-md text-body-md text-on-surface">
              The name on your ID must match your account name: <strong>{step.accountName}</strong>
            </p>
          )}
        </div>

        {step.lastAttempt && (
          <div
            className={`flex items-start gap-space-sm p-space-md rounded-xl ${
              step.lastAttempt.underReview ? 'bg-surface-tint-blue text-primary' : 'bg-error-container/40 text-on-surface'
            }`}
          >
            <Icon name={step.lastAttempt.underReview ? 'pending_actions' : 'error'} className="text-[20px] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md font-semibold">
                {step.lastAttempt.underReview
                  ? `Your last check (${step.lastAttempt.label}) is with our team for review.`
                  : `Your last check (${step.lastAttempt.label}) didn’t go through.`}
              </span>
              {step.lastAttempt.reasons.map((reason) => (
                <span key={reason} className="font-caption text-caption text-text-secondary">
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <label className="text-text-tertiary font-label-sm text-caption uppercase tracking-wider font-semibold" htmlFor="desktop-id-type-select">
              Select Identity Document
            </label>
            <div className="relative flex items-center">
              <select
                className="w-full h-12 appearance-none rounded-xl bg-surface-canvas px-space-md pr-space-xl text-text-primary font-heading-sm text-heading-sm shadow-sm focus:outline-none"
                id="desktop-id-type-select"
                value={idType}
                onChange={(event) => onIdTypeChange(event.target.value as VerificationIdType)}
              >
                {options.map((option) => (
                  <option className="bg-surface-canvas text-text-primary" key={option.key} value={option.key}>
                    {option.name}
                    {step.lastAttempt?.idType === option.key ? ' (last tried)' : ''}
                  </option>
                ))}
              </select>
              <Icon name="expand_more" className="pointer-events-none absolute right-space-md text-[20px] text-text-secondary" />
            </div>
            <div className="p-space-lg rounded-xl bg-surface-canvas shadow-sm flex flex-col gap-space-2xs">
              <div className="flex items-center gap-space-xs">
                <span className="font-heading-sm text-heading-sm text-text-primary">{selected.name}</span>
                {step.lastAttempt?.idType === selected.key && (
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
                    Last tried
                  </span>
                )}
              </div>
              <p className="font-body-md text-body-md text-text-secondary">{selected.description}</p>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="text-text-tertiary font-label-sm text-caption uppercase tracking-wider font-semibold">
              Verification Safeguards
            </div>
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
              <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-tint-blue">
                <div className="p-2 bg-primary rounded-lg text-on-primary shrink-0 flex items-center justify-center">
                  <Icon name="assured_workload" className="text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-primary font-semibold">
                    Registry-backed check
                  </span>
                  <span className="font-caption text-caption text-text-secondary mt-0.5">
                    NIN, licence and voter’s card are checked against the registry with a face match; passports are checked from the uploaded data page.
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-start gap-space-xs">
                  <Icon name="lock" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Encrypted handling
                    </span>
                    <p className="font-body-md text-caption text-text-secondary">
                      Your personal identity information is handled securely and only used for verification and
                      account authentication.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-space-xs pt-space-xs">
                  <Icon name="shield_with_heart" className="text-badge-discount-text text-[20px] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Minimal ID Data
                    </span>
                    <p className="font-body-md text-caption text-text-secondary">
                      Only the ID details you enter are sent for verification. We never ask for banking passwords or card PINs.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-space-xs flex flex-wrap items-center gap-space-xs">
                <div className="px-space-xs py-1 rounded bg-surface-container text-on-surface font-caption text-caption flex items-center gap-1">
                  <Icon name={selected.key === 'bvn' ? 'account_balance' : 'fingerprint'} className="text-[14px] text-tertiary" />
                  <span>{selected.key === 'bvn' ? 'Record Lookup' : 'Biometric Matching'}</span>
                </div>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-subtle flex items-center gap-space-xs text-text-secondary">
              <Icon name="contact_support" className="text-[18px] shrink-0" />
              <span className="font-caption text-caption">
                You only need the number for NIN, BVN, licence or voter's card. For a passport, upload the data page.
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <button
            className="order-2 sm:order-1 px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Setup Overview</span>
          </button>
          <div className="order-1 sm:order-2 flex items-center gap-space-md w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-space-xl py-space-sm bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-space-xs"
              type="button"
              onClick={onContinue}
            >
              <span>Continue to {selected.name.split(' (')[0]} Details</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
