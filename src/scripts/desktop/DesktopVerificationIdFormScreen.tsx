import { useEffect, useRef, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { uploadImage } from '../../services/uploadService';
import { useVerificationActions, type CheckOutcome } from '../../hooks/business/useVerification';
import { Icon } from '../../components/ui/Icon';
import { ID_TYPE_CONFIG, type VerificationDraft } from '../verificationDraft';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationIdFormScreenProps {
  onBack: () => void;
  draft: VerificationDraft;
  onDraftChange: (patch: Partial<VerificationDraft>) => void;
  onResult: (outcome: CheckOutcome) => void;
  onBrand?: () => void;
  inDashboard?: boolean;
  dashboardNav?: (key: string) => void;
}

export function DesktopVerificationIdFormScreen({
  onBack,
  draft,
  onDraftChange,
  onResult,
  onBrand,
  inDashboard = false,
  dashboardNav,
}: DesktopVerificationIdFormScreenProps) {
  const config = ID_TYPE_CONFIG[draft.idType];
  const live = hasApiConfig();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [stage, setStage] = useState<'selfie' | 'checking' | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Verification failures show briefly in the screen's toast.
  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [error]);
  const verification = useVerificationActions();
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

  const handleNumberChange = (value: string) => {
    onDraftChange({ idNumber: config.format(config.normalize(value)) });
  };

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setDocumentUrl(url);
      setDocumentName(file.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'The document could not be uploaded. Try a smaller clear photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (submitting || uploading) return;
    if (config.document === 'required' && live && !documentUrl) {
      setError(`Upload a clear photo of your ${config.optionName.toLowerCase()} data page first.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    // Called straight from the click so the selfie tab is not popup-blocked.
    verification
      .verifyIdentity(
        {
          idType: draft.idType,
          idNumber: raw,
          legalName: draft.legalName,
          documentUrl: config.document === 'required' ? documentUrl ?? undefined : undefined,
        },
        setStage,
      )
      .then(onResult)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Verification failed. Please try again.'))
      .finally(() => {
        setSubmitting(false);
        setStage(null);
      });
  };

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand} inDashboard={inDashboard} dashboardNav={dashboardNav}>
      <div className="max-w-7xl mx-auto px-margin py-space-xl w-full">
        <div className="mb-space-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-space-2xs bg-surface-tint-blue px-space-sm py-space-2xs rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider">
                  Step {inDashboard ? '2 of 2' : '2 of 3'}
                </span>
              </div>
              <span className="text-text-tertiary font-label-sm text-label-sm">•</span>
              <span className="font-label-md text-label-md text-text-secondary">{config.pill}</span>
            </div>
            <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption">
              <Icon name="lock_outline" className="text-[16px] text-badge-discount-text" />
              <span>Encrypted verification request</span>
            </div>
          </div>
          <div className={`grid ${inDashboard ? 'grid-cols-2' : 'grid-cols-3'} gap-space-xs h-1.5 w-full bg-surface-container rounded-full overflow-hidden`}>
            <div className="h-full bg-primary rounded-full transition-all duration-500" />
            <div className="h-full bg-primary rounded-full transition-all duration-500" />
            {!inDashboard && <div className="h-full bg-surface-container-high rounded-full" />}
          </div>
        </div>

        <div className="mb-space-2xl">
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mb-space-2xs">
            {config.heading}
          </h1>
          <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
            Your information is used only to verify the person operating this account.
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
                    config.key === 'nin' || config.key === 'bvn' ? 'font-heading-sm text-heading-sm tracking-widest' : 'font-body-lg text-body-lg tracking-wide'
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
              </div>
              <div className="relative flex items-center">
                <input
                  className="w-full h-11 rounded-xl px-space-md font-body-lg text-body-lg text-text-primary bg-surface-container-low outline-none focus:bg-surface-canvas shadow-inner transition-all"
                  id="desktop-legal-name"
                  type="text"
                  value={draft.legalName}
                  onChange={(event) => onDraftChange({ legalName: event.target.value })}
                />
                <div className="absolute right-space-md flex items-center text-text-tertiary">
                  <Icon name="lock" className="text-[20px]" />
                </div>
              </div>
            </div>

            {config.document !== 'none' && (
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-text-primary font-semibold">
                    {config.uploadTitle}
                  </label>
                  <span className="px-space-xs py-space-2xs bg-surface-container-high text-on-surface-variant font-label-sm text-caption rounded-full">
                    {config.document === 'required' ? (live ? 'Required' : 'Optional') : 'Optional'}
                  </span>
                </div>
                {documentName ? (
                  <div className="flex items-center justify-between p-space-md bg-badge-discount-bg rounded-xl">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <Icon name="task_alt" className="text-badge-discount-text text-[20px] shrink-0" />
                      <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                        {documentName}
                      </span>
                    </div>
                    <button
                      className="text-text-tertiary hover:text-error shrink-0"
                      type="button"
                      onClick={() => {
                        setDocumentName(null);
                        setDocumentUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
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
                      void handleFileSelected(event.dataTransfer.files[0] ?? null);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-primary group-hover:text-on-primary text-primary flex items-center justify-center mb-space-sm transition-colors duration-200">
                      <Icon name="add_a_photo" className="text-[24px]" />
                    </div>
                    <p className="font-body-md text-body-md text-text-primary font-medium mb-space-2xs">
                      <span className="text-primary font-semibold hover:underline">Click to browse</span> or drag and
                      drop document
                    </p>
                    <p className="font-caption text-caption text-text-secondary max-w-sm mb-space-sm">{config.uploadCaption}</p>
                    <div className="flex items-center gap-space-sm text-text-tertiary font-caption text-caption">
                      <span>{uploading ? 'Uploading…' : 'PNG, JPG, PDF'}</span>
                      <span>•</span>
                      <span>Max 10MB</span>
                    </div>
                    <input
                      accept="image/*,.pdf"
                      className="hidden"
                      type="file"
                      ref={fileInputRef}
                      onChange={(event) => {
                        void handleFileSelected(event.target.files?.[0] ?? null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

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
                disabled={submitting || uploading || !valid}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Icon name="progress_activity" className="animate-spin text-[20px]" />
                    <span>{stage === 'selfie' ? 'Finish the selfie check in the new tab…' : config.loadingLabel}</span>
                  </>
                ) : (
                  <>
                    <span>{config.submitLabel}</span>
                    <Icon name="arrow_forward" className="text-[20px]" />
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-center gap-space-2xs text-text-tertiary font-caption text-caption pt-space-2xs">
              <Icon name="speed" className="text-[16px] text-badge-discount-text" />
              <span>
                {live
                  ? config.selfie
                    ? 'The selfie check opens in a new tab when you continue.'
                    : 'This is a record lookup — no selfie is needed.'
                  : 'Instant verification usually takes under 15 seconds.'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas p-space-lg rounded-xl shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between mb-space-md">
                <div>
                  <span className="font-label-sm text-caption uppercase tracking-wider text-text-tertiary font-semibold block mb-space-2xs">
                    Verification Gateway
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">
                    {live ? 'Provider Check' : config.documentLabel}
                  </h2>
                </div>
                <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs bg-surface-container text-text-secondary rounded-full font-label-sm text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <span>{live ? 'Sandbox ready' : 'Demo'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-space-sm mb-space-md">
                <div className="p-space-sm bg-surface-container-low rounded-lg">
                  <span className="font-caption text-caption text-text-secondary block mb-space-2xs">Check type</span>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    {config.selfie ? 'ID + selfie' : 'Record lookup'}
                  </span>
                </div>
                <div className="p-space-sm bg-surface-container-low rounded-lg">
                  <span className="font-caption text-caption text-text-secondary block mb-space-2xs">Document</span>
                  <span className="font-label-md text-label-md text-primary font-semibold">{config.documentLabel}</span>
                </div>
              </div>
              <div className="p-space-sm bg-surface-tint-blue rounded-xl flex items-center justify-between flex-wrap gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-caption">
                    V
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">VEMTAP</span>
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
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    {config.selfie ? 'Identity provider' : 'BVN registry'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-lg rounded-xl shadow-sm">
              <div className="flex items-center gap-space-sm mb-space-sm">
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="shield" className="text-[22px]" />
                </div>
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Data Protection</h2>
                  <span className="font-caption text-caption text-text-secondary">Minimal data, masked results</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary mb-space-md">
                Only the details you enter are sent for verification. Results are stored with masked identifiers and
                an audit reference.
              </p>
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                  <Icon name="lock" className="text-badge-discount-text text-[18px]" />
                  <span>Encrypted request and masked credentials</span>
                </div>
                <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                  <Icon name="verified_user" className="text-badge-discount-text text-[18px]" />
                  <span>Handled securely and only used for verification</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-lg rounded-xl shadow-sm">
              <div className="flex items-center gap-space-xs mb-space-sm text-primary">
                <Icon name="lightbulb" className="text-[20px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Check Tips</h2>
              </div>
              <ul className="flex flex-col gap-space-sm text-text-secondary font-body-md text-body-md">
                {[
                  `Enter your ${config.fieldLabel.toLowerCase()} exactly as printed.`,
                  'Use the legal name that matches your account and ID record.',
                  config.selfie ? 'Complete the selfie in good light with your face fully visible.' : 'No selfie is needed for this check.',
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
      {error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {error}
        </div>
      )}
    </BusinessVerificationChrome>
  );
}
