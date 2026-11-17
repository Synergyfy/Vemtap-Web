import { Icon } from '../ui/Icon';
import { formatNaira, type DealDetail } from '../../hooks/useDealDetail';
import { NO_IMAGE } from '../../utils/homeOffer';
import { SheetShell } from './SheetShell';
import { maskPhone } from '../../utils/format';

export interface RecipientSummarySheetProps {
  /** The live deal this sheet is for. */
  detail?: DealDetail | null;
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  onEdit: () => void;
  /** Recipient details collected in the previous steps. */
  recipient?: { name: string; email: string; phone?: string } | null;
}

export function RecipientSummarySheet({ open, onClose, onContinue, onEdit, recipient, detail }: RecipientSummarySheetProps) {
  const recipientName = recipient?.name ?? '';
  const recipientEmail = recipient?.email ?? '';
  const recipientPhoneDisplay = recipient?.phone ? maskPhone(recipient.phone) : '';
  const initials =
    recipientName
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="flex justify-center pt-3 pb-3">
        <div className="w-12 h-1.5 bg-outline-variant rounded-full" />
      </div>

      <div className="px-6 pt-1 pb-8">
        <header className="flex items-center justify-between mt-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-tint-blue border border-border-active rounded-full text-primary-container text-xs font-semibold tracking-wide">
            <Icon name="check" className="text-[14px]" />
            <span className="tracking-wider text-[11px] font-bold uppercase">Recipient Confirmed</span>
          </div>
          <button
            aria-label="Close dialog"
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low text-text-secondary hover:bg-surface-container transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </header>

        <section className="mb-5">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-tight">Confirm Recipient Summary</h1>
          <p className="text-sm text-text-tertiary mt-1 leading-snug">
            Review the verified recipient details before continuing to claim this deal on their behalf.
          </p>
        </section>

        <section className="bg-surface-subtle border border-border-subtle rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle/80">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-primary-container to-primary flex items-center justify-center text-on-primary font-bold text-lg shadow-sm">
                <span>{initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-text-primary">{recipientName}</h2>
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary-container flex items-center justify-center">
              <Icon name="person" className="text-[20px]" />
            </div>
          </div>

          <div className="mt-3 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <div className="flex items-center gap-2 text-text-tertiary">
                <Icon name="mail" className="text-[16px]" />
                <span>Email</span>
              </div>
              <span className="font-medium text-text-primary">{recipientEmail}</span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <div className="flex items-center gap-2 text-text-tertiary">
                <Icon name="call" className="text-[16px]" />
                <span>Phone</span>
              </div>
              <span className="font-medium text-text-primary">{recipientPhoneDisplay}</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-tint-blue/50 border border-border-active rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Attached Perk</span>
            {detail && detail.discountPercent > 0 && (
              <span className="bg-badge-discount-bg text-badge-discount-text text-xs font-bold px-2 py-0.5 rounded-md">
                {detail.discountPercent}% OFF
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-surface-container overflow-hidden shrink-0 border border-border-subtle">
              <img
                alt={detail?.title ?? ''}
                className="w-full h-full object-cover"
                src={detail?.image ?? NO_IMAGE}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-text-primary truncate">{detail?.businessName}</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {detail?.title} • <span className="font-bold text-text-primary">{formatNaira(detail?.price ?? 0)}</span>
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-active/70 flex items-start gap-2 text-[11px] text-text-tertiary leading-snug">
            <Icon name="info" className="text-[16px] text-primary-container shrink-0 mt-0.5" />
            <span>
              Claim voucher will be generated in <strong>{recipientName}'s</strong> name. Payment is settled upon
              redemption.
            </span>
          </div>
        </section>

        <footer className="space-y-3">
          <button
            type="button"
            onClick={onContinue}
            className="w-full h-[52px] bg-primary-container hover:bg-primary active:bg-primary text-on-primary font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 transition-all text-base"
          >
            <span>Continue to Claim</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="w-full py-2.5 text-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Edit Recipient Details
          </button>
        </footer>
      </div>
    </SheetShell>
  );
}
