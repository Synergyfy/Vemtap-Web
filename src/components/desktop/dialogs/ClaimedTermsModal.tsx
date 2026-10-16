import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';
import { DEFAULT_CLAIMED_DEAL } from '../../../context/ClaimsContext';

interface ClaimedTermsModalProps {
  open: boolean;
  onClose: () => void;
  /** Terms frozen onto the claim; falls back to the sample deal's terms. */
  terms?: string[];
}

export function ClaimedTermsModal({ open, onClose, terms }: ClaimedTermsModalProps) {
  const displayTerms = terms && terms.length > 0 ? terms : DEFAULT_CLAIMED_DEAL.terms;
  return (
    <DesktopModal open={open} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center justify-between gap-space-md p-space-lg border-b border-border-subtle">
        <div className="flex flex-col gap-space-2xs">
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary w-fit">
            <Icon name="gavel" className="text-[14px]" />
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Deal Terms</span>
          </span>
          <h4 className="font-heading-sm text-heading-sm text-text-primary">Redemption Terms &amp; Conditions</h4>
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="p-space-lg">
        <p className="font-caption text-caption text-text-tertiary mb-space-sm">
          These are the terms that were in force when this deal was claimed.
        </p>
        <ul className="font-body-md text-body-md text-text-secondary space-y-space-xs list-disc pl-5">
          {displayTerms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>

        <div className="mt-space-md p-space-sm rounded-xl bg-surface-subtle flex items-start gap-2">
          <Icon name="shield" className="text-[18px] text-secondary shrink-0 mt-0.5" />
          <p className="font-caption text-caption text-text-secondary leading-snug">
            VEMTAP verifies every voucher cryptographically at the merchant terminal. Terms are enforced by the
            issuing merchant and audited under the VEMTAP Voucher Policy.
          </p>
        </div>
      </div>

      <div className="p-space-lg pt-0">
        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl transition-colors"
        >
          Understood
        </button>
      </div>
    </DesktopModal>
  );
}
