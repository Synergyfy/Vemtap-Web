import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';

interface ClaimedTermsModalProps {
  open: boolean;
  onClose: () => void;
}

const TERMS = [
  'Valid strictly for Dine-in and Takeaway at Apo, Abuja location.',
  'Offer cannot be merged with ongoing happy hour specials.',
  'Voucher code expires automatically on 20 Sep 2025 at 11:59 PM.',
  'One voucher claim per table / group order.',
];

export function ClaimedTermsModal({ open, onClose }: ClaimedTermsModalProps) {
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
        <ul className="font-body-md text-body-md text-text-secondary space-y-space-xs list-disc pl-5">
          {TERMS.map((term) => (
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
