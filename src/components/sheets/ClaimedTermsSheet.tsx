import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

interface ClaimedTermsSheetProps {
  open: boolean;
  onClose: () => void;
}

const TERMS = [
  'Valid strictly for Dine-in and Takeaway at Apo, Abuja location.',
  'Offer cannot be merged with ongoing happy hour specials.',
  'Voucher code expires automatically on 20 Sep 2025 at 11:59 PM.',
  'One voucher claim per table / group order.',
];

export function ClaimedTermsSheet({ open, onClose }: ClaimedTermsSheetProps) {
  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-outline-variant/60" />
      </div>
      <div className="flex flex-col p-space-lg space-y-space-md">
        <div className="flex items-center justify-between">
          <h4 className="font-heading-sm text-heading-sm text-text-primary">Deal Terms</h4>
          <button
            aria-label="Close dialog"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        <ul className="font-body-md text-body-md text-text-secondary space-y-2 list-disc pl-5">
          {TERMS.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 bg-primary text-on-primary font-button-primary text-button-primary rounded-xl mt-space-sm"
        >
          Understood
        </button>
      </div>
    </SheetShell>
  );
}
