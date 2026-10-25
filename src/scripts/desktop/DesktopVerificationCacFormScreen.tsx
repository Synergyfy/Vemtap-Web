import { useEffect, useRef, useState } from 'react';
import { useVerificationActions } from '../../hooks/business/useVerification';
import { Icon } from '../../components/ui/Icon';
import type { CacEntityType, VerificationDraft } from '../verificationDraft';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationCacFormScreenProps {
  onBack: () => void;
  draft: VerificationDraft;
  onDraftChange: (patch: Partial<VerificationDraft>) => void;
  onVerified: () => void;
  /** The registry check needs a person to review it; receives readable reasons. */
  onNeedsReview?: (reasons: string[]) => void;
  onNotIncorporated?: () => void;
  onBrand?: () => void;
}

const ENTITY_PILLS: Array<{ key: CacEntityType; label: string; short: string }> = [
  { key: 'BN', label: 'Business Name', short: '(BN)' },
  { key: 'RC', label: 'Limited Liability', short: '(RC)' },
  { key: 'IT', label: 'Incorporated Trustee', short: '(IT)' },
];

const BENEFITS = [
  {
    icon: 'verified',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Blue Verified Merchant Badge',
    body: 'Displays on all hyper-local feeds, consumer search results, and map pins.',
  },
  {
    icon: 'trending_up',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: '3.8x Higher Conversion & Trust',
    body: 'Shoppers spend significantly more when businesses have verified corporate credentials.',
  },
  {
    icon: 'campaign',
    iconClass: 'bg-surface-container-high text-primary',
    title: 'Hyper-Local Deals Boost',
    body: 'Unlock access to priority push alerts, flash deal promotions, and seasonal campaigns.',
  },
  {
    icon: 'add_business',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Multi-Location Expansions',
    body: 'Add up to 50 branch locations under a unified corporate tax identity.',
  },
];

export function DesktopVerificationCacFormScreen({
  onBack,
  draft,
  onDraftChange,
  onVerified,
  onNeedsReview,
  onNotIncorporated,
  onBrand,
}: DesktopVerificationCacFormScreenProps) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Verification failures show briefly in the screen's toast.
  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [error]);
  const verification = useVerificationActions();
  const [verified, setVerified] = useState(false);
  const [fileName, setFileName] = useState<string | null>('CAC_BN_Certificate.pdf');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const entity: CacEntityType = draft.entity || 'BN';
  const formatValid = /^[A-Z]{2}-?\d{6,8}$/i.test(draft.cacNumber.trim()) || draft.cacNumber.trim().length >= 6;
  const canVerify = formatValid && draft.cacNumber.trim().length > 0;

  const handleVerify = () => {
    if (verifying || verified || !canVerify) return;
    setVerifying(true);
    setError(null);
    verification
      .verifyBusiness(draft.entity, draft.cacNumber)
      .then((outcome) => {
        if (outcome.result === 'review') {
          onNeedsReview?.(outcome.reasons);
          if (!onNeedsReview) setError(outcome.reasons[0] ?? 'Our team needs to review this registration.');
          return;
        }
        setVerified(true);
        timers.current.push(window.setTimeout(() => onVerified(), 1000));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Verification failed. Please try again.'))
      .finally(() => setVerifying(false));
  };

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-6xl mx-auto w-full px-space-md py-space-sm">
        <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm mb-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold tracking-wide uppercase">
                Step 2 of 3
              </span>
              <span className="text-text-tertiary font-caption text-caption">•</span>
              <span className="font-heading-sm text-heading-sm text-text-primary">
                Corporate Affairs Commission (CAC) Verification
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                66% Complete
              </span>
              <span className="font-caption text-caption text-text-tertiary">Estimated: &lt; 90 seconds</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div className="h-full bg-primary-container rounded-full transition-all duration-700 ease-out" style={{ width: '66%' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl p-space-xl shadow-sm">
              <div className="mb-space-lg">
                <div className="flex items-center gap-space-xs mb-space-2xs">
                  <span className="px-space-xs py-space-2xs rounded-md bg-surface-container text-on-surface-variant font-caption text-caption uppercase tracking-wider font-semibold">
                    Regulatory KYC
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                    <Icon name="bolt" className="text-[14px]" /> Automated Instant Sync
                  </span>
                </div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary mb-space-2xs">
                  Enter your CAC Registration Details
                </h1>
                <p className="font-body-md text-body-md text-text-secondary">
                  Your registration number will be validated directly against the Corporate Affairs Commission live
                  registry.
                </p>
              </div>

              <div className="flex flex-col gap-space-xs mb-space-lg">
                <label className="font-label-md text-label-md text-text-primary flex items-center justify-between">
                  <span>Incorporation Category</span>
                  <span className="font-caption text-caption text-text-tertiary">Select official status on CAC portal</span>
                </label>
                <div className="grid grid-cols-3 gap-space-xs">
                  {ENTITY_PILLS.map((pill) => {
                    const active = pill.key === entity;
                    return (
                      <button
                        key={pill.key}
                        type="button"
                        className={`flex flex-col items-center justify-center p-space-sm rounded-xl text-center transition-all cursor-pointer ${
                          active
                            ? 'bg-surface-tint-blue text-primary shadow-sm'
                            : 'bg-surface-subtle text-text-secondary hover:bg-surface-container-low'
                        }`}
                        onClick={() => onDraftChange({ entity: pill.key })}
                      >
                        <span className={`font-label-md text-label-md ${active ? 'font-semibold' : 'font-medium'}`}>
                          {pill.label}
                        </span>
                        <span className={`font-caption text-caption ${active ? 'text-primary opacity-80' : 'text-text-tertiary'}`}>
                          {pill.short}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-space-2xs mb-space-md">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-text-primary" htmlFor="desktop-cac-number">
                    CAC Registration Number (RC / BN / IT)
                  </label>
                  {formatValid && draft.cacNumber.trim().length > 0 && (
                    <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text">
                      <Icon name="verified" className="text-[14px]" />
                      <span className="font-caption text-caption font-semibold">Format Valid (Live Match)</span>
                    </div>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Icon name="fingerprint" className="absolute left-space-md text-text-tertiary pointer-events-none" />
                  <input
                    className="w-full h-12 pl-11 pr-32 rounded-xl bg-surface-subtle text-text-primary font-heading-sm text-heading-sm tracking-wider focus:bg-surface-canvas focus:outline-none focus:shadow-md transition-all font-mono"
                    id="desktop-cac-number"
                    type="text"
                    value={draft.cacNumber}
                    placeholder="BN-0000000"
                    onChange={(event) => onDraftChange({ cacNumber: event.target.value })}
                  />
                  <button
                    className="absolute right-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1"
                    type="button"
                  >
                    <Icon name="sync" className="text-[16px]" />
                    Re-check
                  </button>
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-tertiary px-space-2xs">
                  <span>Accepted prefixes: RC, BN, IT followed by 6–8 digits</span>
                  <span className="text-primary hover:underline flex items-center gap-1 cursor-pointer">
                    Lost certificate? <Icon name="open_in_new" className="text-[12px]" />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-space-2xs mb-space-lg">
                <label className="font-label-md text-label-md text-text-primary flex items-center justify-between">
                  <span>Registered Business Name</span>
                  <span className="font-caption text-caption text-badge-discount-text flex items-center gap-1 font-medium">
                    <Icon name="check_circle" className="text-[14px]" /> Verified Registry Title
                  </span>
                </label>
                <div className="relative flex items-center">
                  <Icon name="storefront" className="absolute left-space-md text-text-tertiary" />
                  <input
                    className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md font-semibold cursor-not-allowed select-none"
                    readOnly
                    type="text"
                    value={draft.businessName || 'Urban Grill & Bistro Ltd'}
                  />
                  <Icon name="lock" className="absolute right-space-md text-text-tertiary" />
                </div>
                <p className="font-caption text-caption text-text-secondary flex items-center gap-1">
                  <Icon name="info" className="text-[14px] text-text-tertiary" />
                  Must match official Corporate Affairs Commission incorporation documents exactly.
                </p>
              </div>

              <div className="flex flex-col gap-space-2xs mb-space-lg">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-text-primary flex items-center gap-space-2xs">
                    <span>Upload CAC Certificate</span>
                    <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
                      Recommended
                    </span>
                  </label>
                  <span className="font-caption text-caption text-text-tertiary">Speeds up tier-3 payout limit unlocking</span>
                </div>
                <div
                  className="rounded-xl p-space-md bg-surface-subtle hover:bg-surface-container-low transition-all text-center flex flex-col items-center justify-center gap-space-xs group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Icon name="cloud_upload" className="text-[24px]" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Click to replace or drag &amp; drop document
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Attach PDF or Photo (Max 10MB) • Color scan preferred
                    </span>
                  </div>
                </div>
                {fileName && (
                  <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low mt-space-2xs">
                    <div className="flex items-center gap-space-sm min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center text-error shrink-0">
                        <Icon name="picture_as_pdf" className="text-[22px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary truncate">{fileName}</span>
                        <div className="flex items-center gap-space-2xs font-caption text-caption text-text-tertiary">
                          <span>1.4 MB</span>
                          <span>•</span>
                          <span className="text-badge-discount-text font-medium flex items-center gap-0.5">
                            <Icon name="done_all" className="text-[12px]" /> Attached &amp; Validated
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs shrink-0">
                      <button
                        className="w-8 h-8 rounded-lg bg-surface-canvas text-text-secondary hover:text-primary transition-colors flex items-center justify-center"
                        title="Preview document"
                        type="button"
                      >
                        <Icon name="visibility" className="text-[18px]" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg bg-surface-canvas text-text-secondary hover:text-error transition-colors flex items-center justify-center"
                        title="Remove attachment"
                        type="button"
                        onClick={() => setFileName(null)}
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  accept=".pdf,image/*"
                  className="hidden"
                  type="file"
                  ref={fileInputRef}
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
                />
              </div>

              <div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-sm mb-space-lg">
                <Icon name="verified_user" className="text-primary text-[20px] mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Statutory Data Protection Guarantee
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    Your registration number is verified with accredited corporate registries under NDPR privacy
                    standards. Official records are only queried for business legitimacy.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
                <button
                  className="w-full sm:w-auto px-space-lg py-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-space-2xs"
                  type="button"
                  onClick={onBack}
                >
                  <Icon name="arrow_back" className="text-[18px]" />
                  <span>Back to Entity Selection</span>
                </button>
                <button
                  className={`w-full sm:w-auto px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs ${
                    verified ? 'bg-badge-discount-text' : 'bg-primary-container text-on-primary'
                  } ${!canVerify && !verified ? 'opacity-60' : ''}`}
                  type="button"
                  disabled={verifying || verified || !canVerify}
                  onClick={handleVerify}
                >
                  {verifying ? (
                    <>
                      <Icon name="progress_activity" className="animate-spin text-[18px]" />
                      <span>Verifying Registry...</span>
                    </>
                  ) : verified ? (
                    <>
                      <Icon name="check_circle" className="text-[18px]" />
                      <span>Business Verified!</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Business</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </>
                  )}
                </button>
              </div>

              {onNotIncorporated && (
                <div className="text-center mt-space-lg">
                  <button
                    className="font-label-sm text-label-sm text-primary hover:underline inline-flex items-center gap-1"
                    type="button"
                    onClick={onNotIncorporated}
                  >
                    <span>Not incorporated yet? Register as sole trader or informal merchant</span>
                    <Icon name="arrow_forward" className="text-[14px]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-2xs">
                  <Icon name="hub" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Registry Gateway</h2>
                </div>
                <div className="flex items-center gap-1.5 px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  Connected
                </div>
              </div>
              <p className="font-caption text-caption text-text-secondary mb-space-md">
                Official Corporate Affairs Commission direct handshake active via government-approved encrypted
                integration node.
              </p>
              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-md mb-space-sm">
                <div className="flex items-center justify-between text-center relative">
                  <div className="absolute left-1/4 right-1/4 top-1/2 -translate-y-1/2 h-0.5 bg-surface-container-high z-0">
                    <div className="h-full bg-primary w-2/3 rounded-full animate-pulse" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                      <Icon name="store" className="text-[20px]" />
                    </div>
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">VEMTAP Rails</span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium">Ready</span>
                  </div>
                  <div className="relative z-10 px-2 py-1 rounded-full bg-surface-canvas font-caption text-caption text-primary font-semibold flex items-center gap-1">
                    <Icon name="speed" className="text-[14px] text-badge-discount-text" />
                    &lt; 10 sec
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                      <Icon name="account_balance" className="text-[20px]" />
                    </div>
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">CAC Database</span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium">Active Link</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                  <div className="flex flex-col p-space-xs rounded-lg bg-surface-canvas">
                    <span className="font-caption text-caption text-text-tertiary">Registry Protocol</span>
                    <span className="font-label-sm text-label-sm font-medium text-text-primary">REST 2.4 SSL</span>
                  </div>
                  <div className="flex flex-col p-space-xs rounded-lg bg-surface-canvas">
                    <span className="font-caption text-caption text-text-tertiary">Response Latency</span>
                    <span className="font-label-sm text-label-sm font-medium text-badge-discount-text">380ms (Instant)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-space-2xs mb-space-sm">
                <Icon name="military_tech" className="text-primary text-[20px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Verification Benefits Unlocked</h2>
              </div>
              <p className="font-caption text-caption text-text-secondary mb-space-md">
                Completing official CAC authentication elevates your merchant profile across consumer apps and local
                rails.
              </p>
              <div className="flex flex-col gap-space-sm">
                {BENEFITS.map((benefit) => (
                  <div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-subtle" key={benefit.icon}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${benefit.iconClass}`}>
                      <Icon name={benefit.icon} className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">{benefit.title}</span>
                      <span className="font-caption text-caption text-text-secondary">{benefit.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name="lock_clock" className="text-[22px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    NDPR Compliance &amp; Escrow Security
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    TLS 1.3 256-bit encryption. Zero unmasked data storage.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {error}
        </div>
      )}
    </BusinessVerificationChrome>
  );
}
