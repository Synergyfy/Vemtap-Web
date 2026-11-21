import { useEffect, useRef, useState } from 'react';
import { ConfirmActionDialog } from '../../components/ConfirmActionDialog';
import {
  cacRegistrationNumber,
  useVerificationActions,
  type BusinessChecksOutcome,
  type PreviewOutcome,
} from '../../hooks/business/useVerification';
import { Icon } from '../../components/ui/Icon';
import type { CacEntityType, VerificationDraft } from '../verificationDraft';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationCacFormScreenProps {
  onBack: () => void;
  draft: VerificationDraft;
  onDraftChange: (patch: Partial<VerificationDraft>) => void;
  /** Carries both stored checks to the success screen. */
  onVerified: (checks: BusinessChecksOutcome) => void;
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
    title: 'Verification record',
    body: 'Your confirmed registry details are saved against your business account.',
  },
  {
    icon: 'trending_up',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Clear trust information',
    body: 'Verified checks are reflected in your verification status and storefront information.',
  },
  {
    icon: 'campaign',
    iconClass: 'bg-surface-container-high text-primary',
    title: 'Deal setup stays available',
    body: 'You can keep building your catalog and deals while a check is reviewed.',
  },
  {
    icon: 'add_business',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Multiple locations',
    body: 'Add your branches after your business profile is set up.',
  },
];

const previewRow = (label: string, value: string | number | null | undefined) => (
  <div className="flex items-start justify-between gap-space-sm py-space-2xs">
    <span className="font-caption text-caption text-on-surface-variant shrink-0">{label}</span>
    <span className="font-label-sm text-label-sm text-on-surface text-right font-medium break-words">
      {value == null || value === '' ? 'Not published' : String(value)}
    </span>
  </div>
);

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
  const [preview, setPreview] = useState<PreviewOutcome | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
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
  const representativeNameValid = draft.representativeName.trim().split(/\s+/).filter(Boolean).length >= 2;
  const canVerify = formatValid && draft.cacNumber.trim().length > 0 && draft.businessName.trim().length > 0 && representativeNameValid;

  const closePreview = () => {
    setPreview(null);
    setAccepted(false);
  };

  const handleReview = (reasons: string[], fallback: string) => {
    onNeedsReview?.(reasons);
    if (!onNeedsReview) setError(reasons[0] ?? fallback);
  };

  const handlePreview = () => {
    if (verifying || verified || preview || !canVerify) return;
    setVerifying(true);
    setError(null);
    try {
      const registrationNumber = cacRegistrationNumber(entity, draft.cacNumber);
      verification
        .previewBusiness(registrationNumber)
        .then((outcome) => {
          if (outcome.result === 'review') {
            handleReview(outcome.reasons, 'Our team needs to review this registration.');
            return;
          }
          setPreview(outcome);
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not check this registration. Please try again.'))
        .finally(() => setVerifying(false));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enter a valid CAC number to continue.');
      setVerifying(false);
    }
  };

  const handleConfirmPreview = async () => {
    if (!preview || !accepted || verifying) return;
    setVerifying(true);
    setError(null);
    const registrationNumber = preview.preview.registrationNumber || cacRegistrationNumber(entity, draft.cacNumber);
    const previewId = preview.check.id;
    try {
      const businessOutcome = await verification.confirmBusiness({ registrationNumber, previewId, confirmed: true });
      if (businessOutcome.result === 'review') {
        closePreview();
        handleReview(businessOutcome.reasons, 'Our team needs to review this registration.');
        return;
      }
      const representativeOutcome = await verification.verifyRepresentative({
        previewId,
        representativeName: draft.representativeName,
      });
      if (representativeOutcome.result === 'review') {
        closePreview();
        handleReview(representativeOutcome.reasons, 'Our team needs to review this representative.');
        return;
      }
      onDraftChange({
        businessName: preview.preview.legalName || draft.businessName,
        cacNumber: registrationNumber,
        entity,
      });
      closePreview();
      setVerified(true);
      timers.current.push(
        window.setTimeout(() => onVerified({ business: businessOutcome, representative: representativeOutcome }), 1000),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
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
              <span className="font-caption text-caption text-text-tertiary">Registry preview before saving</span>
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
                    <Icon name="bolt" className="text-[14px]" /> Preview before confirm
                  </span>
                </div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary mb-space-2xs">
                  Enter your CAC Registration Details
                </h1>
                <p className="font-body-md text-body-md text-text-secondary">
                  We'll check the registration number with the configured provider and show you what can be autofilled
                  before anything is saved.
                </p>
              </div>

              <div className="flex flex-col gap-space-xs mb-space-lg">
                <label className="font-label-md text-label-md text-text-primary flex items-center justify-between">
                  <span>Incorporation Category</span>
                  <span className="font-caption text-caption text-text-tertiary">Select the type on your CAC document</span>
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
                      <Icon name="check_circle" className="text-[14px]" />
                      <span className="font-caption text-caption font-semibold">Format valid</span>
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
                    className="absolute right-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1 disabled:opacity-60"
                    type="button"
                    disabled={verifying || verified || preview !== null || !canVerify}
                    onClick={handlePreview}
                  >
                    <Icon name="sync" className="text-[16px]" />
                    Check
                  </button>
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-tertiary px-space-2xs">
                  <span>Accepted prefixes: RC, BN, IT followed by 6–8 digits</span>
                  <span className="text-text-tertiary">No details are stored from this check until you confirm.</span>
                </div>
              </div>

              <div className="flex flex-col gap-space-2xs mb-space-lg">
                <label className="font-label-md text-label-md text-text-primary" htmlFor="desktop-business-name">
                  <span>Registered Business Name</span>
                </label>
                <div className="relative flex items-center">
                  <Icon name="storefront" className="absolute left-space-md text-text-tertiary" />
                  <input
                    className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md font-semibold focus:bg-surface-canvas focus:outline-none transition-all"
                    id="desktop-business-name"
                    type="text"
                    value={draft.businessName}
                    placeholder="Legal entity name"
                    onChange={(event) => onDraftChange({ businessName: event.target.value })}
                  />
                  <Icon name="edit" className="absolute right-space-md text-text-tertiary" />
                </div>
                <p className="font-caption text-caption text-text-secondary flex items-center gap-1">
                  <Icon name="info" className="text-[14px] text-text-tertiary" />
                  We'll replace this with the registry name only if you confirm the preview.
                </p>
              </div>

              <div className="flex flex-col gap-space-2xs mb-space-lg">
                <label className="font-label-md text-label-md text-text-primary" htmlFor="desktop-representative-name">
                  <span>Director or Beneficial Owner Name</span>
                </label>
                <div className="relative flex items-center">
                  <Icon name="person" className="absolute left-space-md text-text-tertiary" />
                  <input
                    className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md font-semibold focus:bg-surface-canvas focus:outline-none transition-all"
                    id="desktop-representative-name"
                    type="text"
                    value={draft.representativeName}
                    placeholder="Full legal name as published"
                    onChange={(event) => onDraftChange({ representativeName: event.target.value })}
                  />
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  Checked separately against published directors and beneficial owners. A registry match alone does not
                  prove account ownership.
                </p>
              </div>

              <div className="flex flex-col gap-space-2xs mb-space-lg">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-text-primary flex items-center gap-space-2xs">
                    <span>CAC Certificate</span>
                    <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
                      Optional
                    </span>
                  </label>
                  <span className="font-caption text-caption text-text-tertiary">Selected for reference only</span>
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
                      Click to select a certificate
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      PDF or Photo (Max 10MB) • This file is not uploaded by the registry check
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
                        <span className="font-caption text-caption text-text-tertiary">Selected on this device only</span>
                      </div>
                    </div>
                    <button
                      className="w-8 h-8 rounded-lg bg-surface-canvas text-text-secondary hover:text-error transition-colors flex items-center justify-center"
                      title="Remove selection"
                      type="button"
                      onClick={() => {
                        setFileName(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
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
                    Data protection and ownership
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    Only the details you confirm are saved. The registry preview is not proof that you own or operate
                    the business.
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
                  disabled={verifying || verified || preview !== null || !canVerify}
                  onClick={handlePreview}
                >
                  {verifying ? (
                    <>
                      <Icon name="progress_activity" className="animate-spin text-[18px]" />
                      <span>Checking Details...</span>
                    </>
                  ) : verified ? (
                    <>
                      <Icon name="check_circle" className="text-[18px]" />
                      <span>Checks Complete</span>
                    </>
                  ) : (
                    <>
                      <span>Preview Registry Details</span>
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
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">How this check works</h2>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                  Preview first
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mb-space-md">
                You review the registry details before they are saved or used to complete your verification.
              </p>
              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-md mb-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                      <Icon name="edit_document" className="text-[20px]" />
                    </div>
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">Enter details</span>
                  </div>
                  <Icon name="arrow_forward" className="text-text-tertiary text-[18px]" />
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                      <Icon name="visibility" className="text-[20px]" />
                    </div>
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">Review preview</span>
                  </div>
                  <Icon name="arrow_forward" className="text-text-tertiary text-[18px]" />
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                      <Icon name="person_check" className="text-[20px]" />
                    </div>
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary text-center">Confirm representative</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-space-2xs mb-space-sm">
                <Icon name="military_tech" className="text-primary text-[20px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">What gets saved</h2>
              </div>
              <p className="font-caption text-caption text-text-secondary mb-space-md">
                Only the details you confirm are attached to your business verification record.
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
                    Registry lookup and ownership are separate
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    A company record is checked before the named representative is checked.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {error}
        </div>
      )}
      <ConfirmActionDialog
        open={preview !== null}
        onClose={closePreview}
        onConfirm={handleConfirmPreview}
        title="Confirm registry details"
        message="Review the details returned by the registry check. Only confirm if they match your business documents."
        bullets={[
          'These fields are for autofill only and are not proof of ownership.',
          'Confirming stores a business check and starts a separate representative check.',
        ]}
        confirmLabel="Confirm and continue"
        busy={verifying}
        confirmDisabled={!accepted || verifying}
      >
        {preview && (
          <div className="rounded-xl bg-surface-subtle p-space-sm">
            <div className="flex items-center gap-space-xs pb-space-xs">
              <Icon name="domain_verification" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">Registry preview</span>
            </div>
            {previewRow('Legal name', preview.preview.legalName)}
            {previewRow('Registration number', preview.preview.registrationNumber)}
            {previewRow('Status', preview.preview.status)}
            {previewRow('Registration date', preview.preview.registrationDate)}
            {previewRow('Company type', preview.preview.companyType)}
            {previewRow('Representatives published', preview.preview.representativeCount)}
            <label className="flex items-start gap-space-xs pt-space-xs text-on-surface font-label-sm text-label-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>I confirm these details match my business documents and may be used to complete my verification.</span>
            </label>
          </div>
        )}
      </ConfirmActionDialog>
    </BusinessVerificationChrome>
  );
}
