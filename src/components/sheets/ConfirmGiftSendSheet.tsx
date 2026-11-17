import { Icon } from '../ui/Icon';
import { formatNaira, type DealDetail } from '../../hooks/useDealDetail';
import { NO_IMAGE } from '../../utils/homeOffer';
import { SheetShell } from './SheetShell';

export interface ConfirmGiftSendSheetProps {
  /** The live deal this sheet is for. */
  detail?: DealDetail | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
  recipient?: { name: string; email: string; phone?: string } | null;
  /** Why sending failed. */
  error?: string | null;
  busy?: boolean;
}

export function ConfirmGiftSendSheet({ open, onClose, onConfirm, onEdit, recipient, detail, error, busy }: ConfirmGiftSendSheetProps) {
  const safeRecipient = recipient ?? { name: '', email: '', phone: undefined };
  const recipientInitials = safeRecipient.name.split(/\s+/).map((part) => part.charAt(0)).join('').toUpperCase().slice(0, 2);

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-space-xs">
        <div className="w-12 h-1.5 rounded-full bg-surface-container/60" />
      </div>

      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between px-space-lg pt-space-xs pb-space-xs">
          <div className="flex items-center gap-space-2xs">
            <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
              <Icon name="redeem" className="text-[18px]" />
            </div>
            <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wider uppercase">
              Gift Dispatch
            </span>
          </div>
          <button
            aria-label="Close sheet"
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="px-space-lg pt-space-xs pb-space-sm">
          <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
            Send this deal as a gift?
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
            Review recipient details before confirming.
          </p>
        </div>

        <div className="px-space-lg space-y-space-md pb-space-lg">
          <div className="bg-surface-subtle rounded-2xl p-space-md space-y-space-md shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-xs bg-primary-fixed text-primary flex items-center justify-center font-semibold">
                  {recipientInitials}
                </div>
                <div>
                  <div className="flex items-center gap-space-2xs">
                    <span className="font-heading-sm text-heading-sm text-text-primary">{safeRecipient.name}</span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{safeRecipient.email}</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                <Icon name="card_giftcard" className="text-[20px]" filled />
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-sm space-y-space-xs shadow-xs">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-space-xs text-text-secondary">
                  <Icon name="mail" className="text-[18px] text-text-tertiary" />
                  <span className="font-caption text-caption">Email Address</span>
                </div>
                <span className="font-label-md text-label-md text-text-primary font-medium">{safeRecipient.email}</span>
              </div>
              <div className="w-full h-px bg-surface-container-high/60" />
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-space-xs text-text-secondary">
                  <Icon name="call" className="text-[18px] text-text-tertiary" />
                  <span className="font-caption text-caption">Mobile Phone</span>
                </div>
                <span className="font-label-md text-label-md text-text-primary font-medium">
                  {safeRecipient.phone || safeRecipient.email}
                </span>
              </div>
            </div>

            <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-start gap-space-xs">
              <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                The recipient will receive a verification link and instructions for using the claimed deal.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-space-md space-y-space-xs shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
                Attached Perk
              </span>
              {detail && detail.discountPercent > 0 && (
                <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold">
                  {detail.discountPercent}% OFF
                </span>
              )}
            </div>
            <div className="flex items-center gap-space-sm pt-space-2xs">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-xs">
                <img
                  className="w-full h-full object-cover"
                  alt={detail?.title ?? ''}
                  src={detail?.image ?? NO_IMAGE}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-heading-sm text-heading-sm text-text-primary truncate">{detail?.businessName}</h4>
                <p className="font-body-md text-body-md text-text-secondary truncate">{detail?.title} • {formatNaira(detail?.price ?? 0)}</p>
              </div>
            </div>
            <div className="pt-space-xs flex items-center gap-space-2xs text-text-secondary">
              <Icon name="storefront" className="text-[16px] text-tertiary shrink-0" />
              <p className="font-caption text-caption text-on-surface-variant">
                Payment is made directly by recipient at the venue upon redemption.
              </p>
            </div>
          </div>

          <div className="pt-space-xs space-y-space-xs">
            {error ? (
              <p role="alert" className="font-label-sm text-label-sm text-error">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="relative overflow-hidden w-full h-[52px] bg-primary-container active:scale-[0.98] transition-transform rounded-2xl flex items-center justify-center gap-space-xs text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)]"
            >
              <span>{busy ? 'Sending Gift…' : 'Confirm & Send Gift'}</span>
              <span className="text-[18px]">🎁</span>
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="w-full h-11 flex items-center justify-center font-button-secondary text-button-secondary text-text-secondary active:text-text-primary transition-colors"
            >
              Edit Recipient Details
            </button>
          </div>
        </div>
      </div>
    </SheetShell>
  );
}
