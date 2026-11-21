import { useEffect, useRef, useState } from 'react';
import { ConfirmActionDialog } from '../components/ConfirmActionDialog';
import {
  cacRegistrationNumber,
  useVerificationActions,
  type BusinessChecksOutcome,
  type PreviewOutcome,
} from '../hooks/business/useVerification';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { FormDropdown } from '../components/ui/FormDropdown';
import type { CacEntityType, VerificationDraft } from './verificationDraft';

interface VerificationCacFormScreenProps {
  onBack: () => void;
  draft: VerificationDraft;
  onDraftChange: (patch: Partial<VerificationDraft>) => void;
  /** Carries both stored checks to the success screen. */
  onVerified: (checks: BusinessChecksOutcome) => void;
  /** The registry check needs a person to review it; receives readable reasons. */
  onNeedsReview?: (reasons: string[]) => void;
}

const ENTITY_TYPES: { key: CacEntityType; icon: string; label: string; description: string }[] = [
  { key: 'BN', icon: 'storefront', label: 'Business Name', description: 'Registered business name (BN)' },
  { key: 'RC', icon: 'apartment', label: 'Limited Company', description: 'Limited liability company (RC)' },
  { key: 'IT', icon: 'account_balance', label: 'Incorporated Trustee', description: 'Incorporated trustees (IT)' },
];

const previewRow = (label: string, value: string | number | null | undefined) => (
  <div className="flex items-start justify-between gap-3 py-1.5">
    <span className="font-caption text-caption text-on-surface-variant shrink-0">{label}</span>
    <span className="font-label-sm text-label-sm text-on-surface text-right font-medium break-words">
      {value == null || value === '' ? 'Not published' : String(value)}
    </span>
  </div>
);

export function VerificationCacFormScreen({ onBack, draft, onDraftChange, onVerified, onNeedsReview }: VerificationCacFormScreenProps) {
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

  const formatValid = draft.cacNumber.trim().length >= 4;
  const representativeNameValid = draft.representativeName.trim().split(/\s+/).filter(Boolean).length >= 2;
  const canVerify = draft.entity !== '' && formatValid && draft.businessName.trim().length > 0 && representativeNameValid;

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
      const registrationNumber = cacRegistrationNumber(draft.entity, draft.cacNumber);
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
    const registrationNumber = preview.preview.registrationNumber || cacRegistrationNumber(draft.entity, draft.cacNumber);
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
        entity: draft.entity || 'BN',
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

  const handleFileSelected = (file: File | null) => {
    if (file) setFileName(file.name);
  };

  const removeFile = () => {
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AppScreen>
      <ScreenHeader title="Cac Verification" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-2xl space-y-space-lg">
        {/* Progress / Verification Indicator Pill */}
        <div className="flex items-center justify-between pt-space-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
            <Icon name="verified_user" className="text-[16px]" />
            <span>CAC Verification</span>
          </div>
          <div aria-label="Step 2 of 3" className="flex items-center gap-1.5">
            <span className="w-6 h-1.5 rounded-full bg-primary" />
            <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
            <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
          </div>
        </div>

        {/* Header Text Group */}
        <div className="space-y-1.5">
          <h2 className="font-heading-md text-heading-md text-on-surface tracking-tight leading-snug">
            Enter your CAC registration details
          </h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant leading-normal">
            We'll check the registration details and show you what can be autofilled before you confirm anything.
          </p>
        </div>

        {/* Registry Preview Notice */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-low shadow-sm">
          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
            <Icon name="bolt" className="text-primary text-[20px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-label-md text-label-md font-semibold text-on-surface">Registry preview</p>
            <p className="font-caption text-caption text-on-surface-variant truncate">
              Nothing is stored until you confirm the details
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium shrink-0">
            Preview
          </span>
        </div>

        {/* Verification Form */}
        <form
          className="flex flex-col flex-1 space-y-space-md"
          onSubmit={(event) => {
            event.preventDefault();
            handlePreview();
          }}
        >
          {/* Entity Type Dropdown */}
          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm font-medium text-on-surface">
              Business Entity Type
            </label>
            <FormDropdown
              ariaLabel="Business Entity Type"
              options={ENTITY_TYPES.map((entity) => ({
                value: entity.key,
                label: entity.label,
                description: entity.description,
                icon: entity.icon,
              }))}
              placeholder="Choose your CAC Type"
              value={draft.entity}
              onChange={(entity) => onDraftChange({ entity: entity as CacEntityType })}
            />
          </div>

          {/* CAC Number Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-label-sm text-label-sm font-medium text-on-surface" htmlFor="cacNumber">
                CAC Registration Number (RC / BN Number)
              </label>
              {formatValid && (
                <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                  <Icon name="check_circle" className="text-[14px]" /> Format valid
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Icon
                name="badge"
                className="absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none"
              />
              <input
                className="w-full h-11 pl-11 pr-11 bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-xl shadow-sm focus:bg-surface-canvas focus:outline-none transition-all placeholder:text-text-tertiary"
                id="cacNumber"
                placeholder="BN-0000000"
                type="text"
                value={draft.cacNumber}
                onChange={(event) => onDraftChange({ cacNumber: event.target.value })}
              />
              <div className="absolute right-3.5 flex items-center text-primary" title="Registration number">
                <Icon name="domain_verification" filled className="text-[20px]" />
              </div>
            </div>
            <p className="font-caption text-caption text-on-surface-variant px-1">
              Enter your RC, BN, or IT number as printed on your certificate.
            </p>
          </div>

          {/* Registered Business Name Field */}
          <div className="space-y-1.5">
            <label className="block font-label-sm text-label-sm font-medium text-on-surface" htmlFor="businessName">
              Registered Business Name
            </label>
            <div className="relative flex items-center">
              <Icon
                name="corporate_fare"
                className="absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none"
              />
              <input
                className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-xl shadow-sm focus:bg-surface-canvas focus:outline-none transition-all placeholder:text-text-tertiary"
                id="businessName"
                placeholder="Legal entity name"
                type="text"
                value={draft.businessName}
                onChange={(event) => onDraftChange({ businessName: event.target.value })}
              />
            </div>
            <p className="font-caption text-caption text-on-surface-variant px-1">
              We'll replace this with the registry name only if you confirm it.
            </p>
          </div>

          {/* Representative Name Field */}
          <div className="space-y-1.5">
            <label className="block font-label-sm text-label-sm font-medium text-on-surface" htmlFor="representativeName">
              Director or Beneficial Owner Name
            </label>
            <div className="relative flex items-center">
              <Icon
                name="person"
                className="absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none"
              />
              <input
                className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-xl shadow-sm focus:bg-surface-canvas focus:outline-none transition-all placeholder:text-text-tertiary"
                id="representativeName"
                placeholder="Full legal name as published"
                type="text"
                value={draft.representativeName}
                onChange={(event) => onDraftChange({ representativeName: event.target.value })}
              />
            </div>
            <p className="font-caption text-caption text-on-surface-variant px-1">
              Checked separately against published directors and beneficial owners. A registry match alone does not prove
              account ownership.
            </p>
          </div>

          {/* Optional Certificate Upload Section */}
          <div className="p-3 rounded-xl bg-surface-container-low space-y-2.5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="upload_file" className="text-primary text-[20px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-label-sm text-label-sm font-semibold text-on-surface">CAC Certificate</h3>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-medium">
                    Optional
                  </span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mt-0.5 leading-normal">
                  You can select a file for reference. It is not uploaded or used by this registry check.
                </p>
              </div>
            </div>
            {fileName ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-badge-discount-bg text-on-surface">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="description" className="text-badge-discount-text text-[20px] shrink-0" />
                  <span className="font-label-sm text-label-sm font-medium truncate">{fileName}</span>
                </div>
                <button className="text-on-surface-variant hover:text-error shrink-0" type="button" onClick={removeFile}>
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
            ) : (
              <div
                className="p-3 rounded-xl bg-surface-canvas flex flex-col items-center justify-center text-center space-y-1.5 cursor-pointer transition-colors hover:bg-surface-container-lowest"
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
                }}
              >
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                  <Icon name="add_photo_alternate" className="text-primary text-[22px]" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-label-sm text-label-sm text-primary font-medium">Attach PDF or Photo</p>
                  <p className="font-caption text-caption text-text-tertiary">PDF, JPG, or PNG up to 10MB</p>
                </div>
              </div>
            )}
            <input
              accept=".pdf,image/*"
              className="hidden"
              id="fileInput"
              ref={fileInputRef}
              type="file"
              onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
            />
          </div>

          {/* Trust & Privacy Shield */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-tint-blue text-on-secondary-container">
            <Icon name="gshield" filled className="text-primary text-[18px] shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
              Only the details you confirm are saved. A registry preview is not proof that you own or operate the
              business.
            </p>
          </div>

          {/* Action Decks */}
          <div className="mt-auto pt-space-xs space-y-3">
            <button
              className={`w-full h-11 rounded-xl text-on-primary font-button-primary text-button-primary font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                verified
                  ? 'bg-badge-discount-text'
                  : 'bg-primary shadow-lg shadow-primary/20 hover:opacity-95'
              } ${!canVerify && !verified ? 'opacity-50' : ''}`}
              id="submitVerifyBtn"
              type="submit"
              disabled={verifying || verified || preview !== null || !canVerify}
            >
              {verifying ? (
                <>
                  <Icon name="progress_activity" className="animate-spin text-[20px]" />
                  <span>Checking Details...</span>
                </>
              ) : verified ? (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Checks Complete</span>
                </>
              ) : (
                <>
                  <span>Preview Registry Details</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </>
              )}
            </button>
            {/* Business setup link */}
            <div className="text-center pt-1">
              <p className="font-caption text-caption text-on-surface-variant">
                Not incorporated yet?
                <button className="text-primary font-medium hover:underline ml-1 inline-flex items-center" type="button">
                  Register your business first →
                </button>
              </p>
              {!canVerify && (
                <p className="font-caption text-caption text-text-tertiary mt-1.5 flex items-center justify-center gap-1">
                  <Icon name="info" className="text-[14px]" />
                  Choose your CAC type, registration details and a director or owner name to continue
                </p>
              )}
            </div>
          </div>
        </form>
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
    </AppScreen>
  );
}
