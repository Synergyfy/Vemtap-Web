import { useEffect, useRef, useState } from 'react';
import { useVerificationActions } from '../hooks/business/useVerification';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ID_TYPE_CONFIG, type VerificationDraft } from './verificationDraft';

interface VerificationIdFormScreenProps {
  onBack: () => void;
  draft: VerificationDraft;
  onDraftChange: (patch: Partial<VerificationDraft>) => void;
  onResult: (outcome: 'success' | 'review') => void;
}

export function VerificationIdFormScreen({ onBack, draft, onDraftChange, onResult }: VerificationIdFormScreenProps) {
  const config = ID_TYPE_CONFIG[draft.idType];
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'selfie' | 'checking' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const verification = useVerificationActions();
  const [infoOpen, setInfoOpen] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const timer = useRef<number | null>(null);

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
    <AppScreen>
      <ScreenHeader title="Id Verification" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-lg">
        {/* Progress Header Meta & Step Bar */}
        <div className="flex flex-col gap-space-xs mt-space-sm mb-space-lg">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-surface-container text-primary">
              <Icon name="verified_user" filled className="text-[14px]" />
              <span className="font-label-sm text-label-sm">{config.pill}</span>
            </div>
            <span className="font-caption text-caption text-text-tertiary">Step 2 of 3</span>
          </div>
          <div className="flex items-center gap-space-2xs pt-1">
            <div className="w-6 h-1.5 rounded-full bg-primary" />
            <div className="w-6 h-1.5 rounded-full bg-primary" />
            <div className="w-1.5 h-1.5 rounded-full bg-surface-variant" />
          </div>
        </div>

        {/* Header Text Section */}
        <div className="flex flex-col gap-space-2xs mb-space-lg">
          <h2 className="font-heading-md text-heading-md text-on-surface">{config.heading}</h2>
          <p className="font-label-sm text-label-sm text-text-secondary">
            Your information is used only for identity verification and fraud prevention.
          </p>
        </div>

        {/* Verification Form */}
        <form
          className="flex flex-col flex-1 gap-space-md"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          {/* Field 1: ID Number */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                className="flex items-center gap-1 font-label-sm text-label-sm font-medium text-on-surface"
                htmlFor="id-number-input"
              >
                <span>{config.fieldLabel}</span>
                <button
                  aria-label={`${config.fieldLabel} info`}
                  className="text-text-tertiary hover:text-primary transition-colors inline-flex"
                  type="button"
                  onClick={() => setInfoOpen((open) => !open)}
                >
                  <Icon name="info" className="text-[16px]" />
                </button>
              </label>
              <span className="font-caption text-caption text-text-tertiary">{config.counter}</span>
            </div>
            <div className="relative flex items-center">
              <input
                className={`w-full h-11 px-space-md pr-12 rounded-xl bg-surface-container-lowest text-on-surface font-button-secondary text-button-secondary placeholder:text-text-tertiary focus:outline-none shadow-sm transition-all ${
                  draft.idType === 'nin' ? 'tracking-wider' : 'tracking-wide'
                }`}
                id="id-number-input"
                inputMode={config.inputMode}
                placeholder={config.placeholder}
                type={config.inputMode === 'numeric' ? 'tel' : 'text'}
                value={draft.idNumber}
                onChange={(event) => handleNumberChange(event.target.value)}
              />
              <div
                className={`absolute right-space-md items-center justify-center w-6 h-6 rounded-full bg-badge-discount-bg text-badge-discount-text ${
                  valid ? 'flex' : 'hidden'
                }`}
              >
                <Icon name="check" className="text-[16px] font-bold" />
              </div>
            </div>
            {/* Quick USSD helper microcopy */}
            <div className="flex items-center gap-1.5 px-1 pt-0.5">
              <Icon name="phone_iphone" className="text-[14px] text-primary" />
              <p className="font-caption text-caption text-text-secondary">
                {config.helperLead}
                <span className="font-semibold text-primary">{config.helperStrong}</span>
                {config.helperTail}
              </p>
            </div>
          </div>

          {/* Field 2: Full Legal Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm font-medium text-on-surface" htmlFor="legal-name">
              Full Legal Name (as shown on ID)
            </label>
            <div className="relative flex items-center">
              <input
                className="w-full h-11 px-space-md pr-12 rounded-xl bg-surface-container-lowest text-on-surface font-button-secondary text-button-secondary focus:outline-none shadow-sm"
                id="legal-name"
                type="text"
                value={draft.legalName}
                onChange={(event) => onDraftChange({ legalName: event.target.value })}
              />
              <div className="absolute right-space-md flex items-center justify-center text-text-tertiary">
                <Icon name="lock" className="text-[18px]" />
              </div>
            </div>
          </div>

          {/* Document Capture / Slip Upload Fallback Card */}
          <div className="flex flex-col gap-space-xs p-space-sm rounded-xl bg-surface-container-lowest shadow-sm mt-space-xs">
            <div className="flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                <Icon name="badge" className="text-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <h3 className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                    {config.uploadTitle}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container text-text-secondary font-caption text-[10px] uppercase font-bold">
                    Optional
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-0.5 leading-relaxed">
                  {config.uploadCaption}
                </p>
              </div>
            </div>
            {uploaded ? (
              <div className="flex items-center justify-between p-space-xs px-space-sm rounded-lg bg-surface-container">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="task_alt" className="text-badge-discount-text text-[18px] shrink-0" />
                  <span className="font-caption text-caption text-on-surface font-medium truncate max-w-[200px]">
                    {config.fileName}
                  </span>
                </div>
                <button className="text-text-tertiary hover:text-error shrink-0" type="button" onClick={() => setUploaded(false)}>
                  <Icon name="close" className="text-[16px]" />
                </button>
              </div>
            ) : (
              <button
                className="w-full h-10 px-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs transition-colors"
                type="button"
                onClick={() => setUploaded(true)}
              >
                <Icon name="photo_camera" className="text-[18px] text-primary" />
                <span>{config.uploadAction}</span>
              </button>
            )}
          </div>

          {/* Official Database Security Banner */}
          <div className="p-space-sm rounded-xl bg-surface-tint-blue flex items-start gap-space-xs">
            <Icon name="shield_lock" filled className="text-primary text-[18px] shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
              Your information is securely encrypted and verified directly with official databases. VEMTAP never shares
              your sensitive ID records.
            </p>
          </div>

          {error ? (
            <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
              {error}
            </p>
          ) : null}
          {/* Action Section */}
          <div className="mt-auto pt-space-sm flex flex-col gap-space-xs">
            <button
              className="w-full h-11 rounded-xl bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs shadow-md transition-all"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Icon name="sync" className="animate-spin text-[20px]" />
                  <span>{stage === 'selfie' ? 'Finish the selfie check in the new tab…' : config.loadingLabel}</span>
                </>
              ) : (
                <>
                  <span>{config.submitLabel}</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </>
              )}
            </button>
            <p className="text-center font-caption text-caption text-text-secondary">
              Instant verification usually takes under 15 seconds.
            </p>
          </div>
        </form>

        {/* Info Modal / Toast Micro-interaction */}
        {infoOpen && (
          <div className="fixed inset-x-margin bottom-space-2xl z-50 p-space-md rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl flex items-start gap-space-sm">
            <Icon name="help_outline" className="text-[20px] text-primary-fixed shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md font-semibold text-inverse-on-surface">{config.infoTitle}</p>
              <p className="font-caption text-caption text-surface-dim mt-0.5">{config.infoBody}</p>
            </div>
            <button className="text-surface-dim hover:text-inverse-on-surface" type="button" onClick={() => setInfoOpen(false)}>
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
        )}
      </div>
    </AppScreen>
  );
}
