import { useEffect, useRef, useState } from 'react';
import { useVerificationActions } from '../../hooks/business/useVerification';
import { Icon } from '../../components/ui/Icon';
import { ID_TYPE_CONFIG, type VerificationDraft } from '../verificationDraft';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationIdFormScreenProps {
  onBack: () => void;
  draft: VerificationDraft;
  onDraftChange: (patch: Partial<VerificationDraft>) => void;
  onResult: (outcome: 'success' | 'review') => void;
  onBrand?: () => void;
}

export function DesktopVerificationIdFormScreen({
  onBack,
  draft,
  onDraftChange,
  onResult,
  onBrand,
}: DesktopVerificationIdFormScreenProps) {
  const config = ID_TYPE_CONFIG[draft.idType];
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'selfie' | 'checking' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const verification = useVerificationActions();
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const timer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const raw = config.normalize(draft.idNumber);
  const valid = config.isValid(raw);
  const isNin = draft.idType === 'nin';

  const handleNumberChange = (value: string) => {
    onDraftChange({ idNumber: config.format(config.normalize(value)) });
  };

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    // Called straight from the click so the selfie tab is not popup-blocked.
    verification
      .verifyIdentity(
        { idType: draft.idType, idNumber: raw, legalName: draft.legalName, dateOfBirth: draft.dateOfBirth },
        setStage,
      )
      .then((outcome) => onResult(outcome.result))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Verification failed. Please try again.'))
      .finally(() => {
        setSubmitting(false);
        setStage(null);
      });
  };

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-7xl mx-auto px-margin py-space-xl w-full">
        <div className="mb-space-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-space-2xs bg-surface-tint-blue px-space-sm py-space-2xs rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider">
                  Step 2 of 3
                </span>
              </div>
              <span className="text-text-tertiary font-label-sm text-label-sm">•</span>
              <span className="font-label-md text-label-md text-text-secondary">{config.pill}</span>
            </div>
            <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption">
              <Icon name="lock_outline" className="text-[16px] text-badge-discount-text" />
              <span>Bank-Grade 256-Bit SSL Pipeline Active</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-space-xs h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" />
            <div className="h-full bg-primary rounded-full transition-all duration-500" />
            <div className="h-full bg-surface-container-high rounded-full" />
          </div>
        </div>

        <div className="mb-space-2xl">
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mb-space-2xs">
            {config.heading}
          </h1>
          <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
            Your information is used only for identity verification and fraud prevention via Nigerian Identity
            Management Commission (NIMC) enterprise rails.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-xl bg-surface-canvas p-space-xl rounded-xl shadow-sm">
            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="desktop-id-input">
                  {config.fieldLabel}
                </label>
                <span className="font-caption text-caption text-text-tertiary">{config.counter}</span>
              </div>
              <div className="relative flex items-center">
                <input
                  className={`w-full h-11 rounded-xl px-space-md text-on-surface bg-surface-container-low transition-all duration-200 outline-none focus:bg-surface-canvas shadow-inner ${
                    isNin ? 'font-heading-sm text-heading-sm tracking-widest' : 'font-body-lg text-body-lg tracking-wide'
                  }`}
                  id="desktop-id-input"
                  inputMode={config.inputMode}
                  maxLength={config.maxLength + 3}
                  placeholder={config.placeholder}
                  type={config.inputMode === 'numeric' ? 'tel' : 'text'}
                  value={draft.idNumber}
                  onChange={(event) => handleNumberChange(event.target.value)}
                />
                {valid && (
                  <div className="absolute right-space-md flex items-center gap-space-2xs">
                    <Icon name="check_circle" filled className="text-badge-discount-text text-[22px]" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-space-xs mt-space-2xs p-space-sm bg-surface-subtle rounded-lg text-text-secondary">
                <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <Icon name="dialpad" className="text-[15px] text-primary" />
                </div>
                <p className="font-caption text-caption">
                  {config.helperLead}
                  <strong className="text-text-primary font-semibold">{config.helperStrong}</strong>
                  {config.helperTail}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="desktop-legal-name">
                  Full Legal Name (as shown on ID)
                </label>
                {isNin && (
                  <span className="flex items-center gap-space-2xs font-caption text-caption text-primary">
                    <Icon name="verified" className="text-[14px]" />
                    <span>Matched to NIMC</span>
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  className={`w-full h-11 rounded-xl px-space-md font-body-lg text-body-lg text-text-primary bg-surface-container-low outline-none ${
                    isNin ? 'cursor-not-allowed select-none' : 'focus:bg-surface-canvas shadow-inner transition-all'
                  }`}
                  id="desktop-legal-name"
                  readOnly={isNin}
                  type="text"
                  value={draft.legalName}
                  onChange={(event) => onDraftChange({ legalName: event.target.value })}
                />
                {isNin && (
                  <div className="absolute right-space-md flex items-center text-text-tertiary">
                    <Icon name="lock" className="text-[20px]" />
                  </div>
                )}
              </div>
              {isNin && (
                <p className="font-caption text-caption text-text-tertiary">
                  Verified against official telecommunications and citizen records.
                </p>
              )}
            </div>

            {isNin && (
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="desktop-dob">
                  Date of Birth (DD/MM/YYYY)
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-11 rounded-xl px-space-md font-body-lg text-body-lg text-text-primary bg-surface-container-low transition-all duration-200 outline-none focus:bg-surface-canvas shadow-inner"
                    id="desktop-dob"
                    placeholder="DD / MM / YYYY"
                    type="text"
                    value={draft.dateOfBirth ?? ''}
                    onChange={(event) => onDraftChange({ dateOfBirth: event.target.value })}
                  />
                  <div className="absolute right-space-md flex items-center text-text-secondary pointer-events-none">
                    <Icon name="calendar_today" className="text-[20px]" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-space-xs pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-text-primary font-semibold">
                  {config.uploadTitle}
                </label>
                <span className="px-space-xs py-space-2xs bg-surface-container-high text-on-surface-variant font-label-sm text-caption rounded-full">
                  Optional
                </span>
              </div>
              {uploaded ? (
                <div className="flex items-center justify-between p-space-md bg-badge-discount-bg rounded-xl">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <Icon name="task_alt" className="text-badge-discount-text text-[20px] shrink-0" />
                    <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                      {config.fileName}
                    </span>
                  </div>
                  <button
                    className="text-text-tertiary hover:text-error shrink-0"
                    type="button"
                    onClick={() => setUploaded(false)}
                  >
                    <Icon name="close" className="text-[18px]" />
                  </button>
                </div>
              ) : (
                <div
                  className={`group relative flex flex-col items-center justify-center p-space-xl rounded-xl transition-all duration-300 cursor-pointer text-center border-2 border-dashed ${
                    dragOver
                      ? 'bg-surface-tint-blue border-primary'
                      : 'bg-surface-subtle hover:bg-surface-tint-blue/30 border-transparent'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOver(false);
                    if (event.dataTransfer.files.length > 0) setUploaded(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setUploaded(true);
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-primary group-hover:text-on-primary text-primary flex items-center justify-center mb-space-sm transition-colors duration-200">
                    <Icon name="add_a_photo" className="text-[24px]" />
                  </div>
                  <p className="font-body-md text-body-md text-text-primary font-medium mb-space-2xs">
                    <span className="text-primary font-semibold hover:underline">Click to browse</span> or drag and
                    drop document
                  </p>
                  <p className="font-caption text-caption text-text-secondary max-w-sm mb-space-sm">
                    Digital slip or ID card photo. Ensure document is clear, well-lit, and all 4 corners are visible.
                  </p>
                  <div className="flex items-center gap-space-sm text-text-tertiary font-caption text-caption">
                    <span>PNG, JPG, PDF</span>
                    <span>•</span>
                    <span>Max 10MB</span>
                  </div>
                  <input
                    accept="image/*,.pdf"
                    className="hidden"
                    type="file"
                    onChange={() => setUploaded(true)}
                    ref={fileInputRef}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md">
              <button
                className="w-full sm:w-auto px-space-lg h-11 flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary hover:bg-surface-container-low rounded-xl transition-all"
                type="button"
                onClick={onBack}
              >
                <Icon name="arrow_back" className="text-[18px]" />
                <span>Back to ID Selection</span>
              </button>
              <button
                className="w-full sm:w-auto px-space-2xl h-11 bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:shadow-[0_8px_28px_-2px_rgba(6,108,244,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs disabled:opacity-60"
                type="button"
                disabled={submitting || !valid}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Icon name="progress_activity" className="animate-spin text-[20px]" />
                    <span>{stage === 'selfie' ? 'Finish the selfie check in the new tab…' : config.loadingLabel}</span>
                  </>
                ) : (
                  <>
                    <span>Verify Identity</span>
                    <Icon name="arrow_forward" className="text-[20px]" />
                  </>
                )}
              </button>
            </div>
            {error ? (
              <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
                {error}
              </p>
            ) : null}
            <div className="flex items-center justify-center gap-space-2xs text-text-tertiary font-caption text-caption pt-space-2xs">
              <Icon name="speed" className="text-[16px] text-badge-discount-text" />
              <span>Instant verification usually takes under 15 seconds.</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas p-space-lg rounded-xl shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between mb-space-md">
                <div>
                  <span className="font-label-sm text-caption uppercase tracking-wider text-text-tertiary font-semibold block mb-space-2xs">
                    Official Gateway
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">NIMC Direct Query</h2>
                </div>
                <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs bg-badge-discount-bg text-badge-discount-text rounded-full font-label-sm text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <span>Connected</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-space-sm mb-space-md">
                <div className="p-space-sm bg-surface-container-low rounded-lg">
                  <span className="font-caption text-caption text-text-secondary block mb-space-2xs">
                    Average Query Latency
                  </span>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">&lt; 15 sec</span>
                </div>
                <div className="p-space-sm bg-surface-container-low rounded-lg">
                  <span className="font-caption text-caption text-text-secondary block mb-space-2xs">Status Match</span>
                  <div className="flex items-center gap-space-2xs text-badge-discount-text font-label-md text-label-md font-semibold">
                    <Icon name="verified" className="text-[18px]" />
                    <span>Active Link</span>
                  </div>
                </div>
              </div>
              <div className="p-space-sm bg-surface-tint-blue rounded-xl flex items-center justify-between flex-wrap gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-caption">
                    V
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">Merchant Rails</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span className="w-6 h-0.5 bg-primary/40" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                    <Icon name="account_balance" className="text-[16px]" />
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">NIMC Registry</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-lg rounded-xl shadow-sm">
              <div className="flex items-center gap-space-sm mb-space-sm">
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="shield" className="text-[22px]" />
                </div>
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">NDPR Strict Compliance</h2>
                  <span className="font-caption text-caption text-text-secondary">Data Protection &amp; Zero Storage</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary mb-space-md">
                Your information is securely encrypted in transit and verified directly against government databases.{' '}
                <strong>VEMTAP never stores your unmasked ID records</strong> or raw biometric records.
              </p>
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                  <Icon name="lock" className="text-badge-discount-text text-[18px]" />
                  <span>TLS 1.3 End-to-End Cryptography</span>
                </div>
                <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                  <Icon name="verified_user" className="text-badge-discount-text text-[18px]" />
                  <span>Regulated by Nigeria Data Protection Commission</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-lg rounded-xl shadow-sm">
              <div className="flex items-center gap-space-xs mb-space-sm text-primary">
                <Icon name="lightbulb" className="text-[20px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Mismatch Prevention Tips</h2>
              </div>
              <ul className="flex flex-col gap-space-sm text-text-secondary font-body-md text-body-md">
                {[
                  'Name must match the legal name registered with your telecom provider.',
                  'Double-check the 11-digit NIN string carefully before finalizing validation.',
                  'Date of birth must correlate precisely with your initial voter or passport record.',
                ].map((tip) => (
                  <li className="flex items-start gap-space-xs" key={tip}>
                    <Icon name="check_circle" className="text-text-tertiary text-[18px] shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
