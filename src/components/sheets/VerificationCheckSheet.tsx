import { Icon } from '../ui/Icon';
import type { VerificationCheckSummary } from '../../hooks/business/useVerification';

interface VerificationCheckSheetProps {
  /** Which credential was tapped: the owner's ID or the CAC registration. */
  kind: 'id' | 'cac';
  /** The check as `GET /verification/status` reports it. */
  check: VerificationCheckSummary;
  /** False in demo mode, where the sheet keeps its sample certificate. */
  live: boolean;
  demo: { cacNumber: string; businessName: string };
  onClose: () => void;
  /** Opens the verification flow (nothing submitted, or a failed check). */
  onStart: () => void;
  /** Desktop shows it as a centred dialog; mobile as a bottom sheet. */
  centered?: boolean;
}

/** Credential details behind "View Details" / "View Certificate" on the verification status center. */
export function VerificationCheckSheet({ kind, check, live, demo, onClose, onStart, centered = false }: VerificationCheckSheetProps) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex justify-center ${centered ? 'items-center p-margin' : 'items-end'}`}
      role="dialog"
      aria-modal="true"
      onClick={() => onClose()}
    >
      <div
        className={`w-full max-w-lg bg-surface-container-lowest p-space-lg shadow-2xl ${centered ? 'rounded-2xl' : 'rounded-t-2xl'}`}
        onClick={(event) => event.stopPropagation()}
      >
        {!centered && <div className="w-12 h-1 rounded-full bg-surface-container-highest mx-auto mb-space-md" />}
        <div className="flex items-start justify-between mb-space-md">
          <div className="flex items-center gap-space-xs">
            <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
              <Icon name="verified_user" className="text-[24px]" />
            </div>
            <div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">
                {kind === 'id' ? 'Director Identification Proof' : 'CAC Registration Credential'}
              </h3>
              <p className="font-caption text-caption text-text-secondary">
                {!live || check.ok
                  ? 'Validated on Federal Database'
                  : check.submitted
                    ? 'Not verified yet'
                    : 'Nothing submitted yet'}
              </p>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary"
            type="button"
            onClick={() => onClose()}
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
        {/* Certificate Preview Container */}
        <div className="rounded-xl bg-surface-container-low p-space-md mb-space-md">
          {live ? (
            <>
              {check.submitted && (
                <>
                  <div className="flex justify-between items-center pb-2 mb-2">
                    <span className="font-caption text-caption text-text-tertiary">
                      {kind === 'id' ? check.idType ?? 'ID' : 'Registration Number'}
                    </span>
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      {check.ref ?? '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 mb-2">
                    <span className="font-caption text-caption text-text-tertiary">
                      {kind === 'id' ? 'Name on Record' : 'Registered Entity'}
                    </span>
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary text-right">
                      {check.name ?? '—'}
                    </span>
                  </div>
                </>
              )}
              <div className={`flex justify-between items-center ${check.submitted ? 'pb-2 mb-2' : ''}`}>
                <span className="font-caption text-caption text-text-tertiary">Status</span>
                <span
                  className={`font-label-sm text-label-sm font-semibold flex items-center gap-1 ${
                    check.ok ? 'text-badge-discount-text' : 'text-text-secondary'
                  }`}
                >
                  <Icon name={check.ok ? 'check_circle' : check.submitted ? 'schedule' : 'pending'} className="text-[14px]" />
                  {check.ok ? 'Active & Verified' : check.label}
                </span>
              </div>
              {check.submitted && (
                <div className="flex justify-between items-center">
                  <span className="font-caption text-caption text-text-tertiary">
                    {check.ok ? 'Verified On' : 'Submitted'}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">{check.date ?? '—'}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between items-center pb-2 mb-2">
                <span className="font-caption text-caption text-text-tertiary">Registration Number</span>
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  {demo.cacNumber}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 mb-2">
                <span className="font-caption text-caption text-text-tertiary">Registered Entity</span>
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  {demo.businessName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 mb-2">
                <span className="font-caption text-caption text-text-tertiary">Status</span>
                <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold flex items-center gap-1">
                  <Icon name="check_circle" className="text-[14px]" /> Active & Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-caption text-caption text-text-tertiary">Digital Hash</span>
                <span className="font-caption text-caption font-mono text-text-secondary">#vm-8492048-ng</span>
              </div>
            </>
          )}
        </div>
        {live && !check.ok && check.status !== 'pending' && check.status !== 'needs_review' && (
          <button
            className="w-full h-12 mb-space-sm rounded-xl bg-surface-container-high text-text-primary font-button-secondary text-button-secondary font-semibold active:scale-95 transition-transform"
            type="button"
            onClick={() => {
              onClose();
              onStart();
            }}
          >
            {check.submitted ? 'Try Again' : 'Start Verification'}
          </button>
        )}
        <button
          className="w-full h-12 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary font-semibold active:scale-95 transition-transform"
          type="button"
          onClick={() => onClose()}
        >
          Done
        </button>
      </div>
    </div>
  );
}
