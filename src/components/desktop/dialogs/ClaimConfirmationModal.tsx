import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';

export interface ClaimConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deal?: {
    title?: string;
    business?: string;
    location?: string;
    price?: number | string;
    oldPrice?: number | string;
    discountLabel?: string;
  } | null;
}

const REDEMPTION: Array<{ icon: string; label: string; value: string }> = [
  { icon: 'schedule', label: 'Validity Window:', value: 'Valid for 48 hours from claim time' },
  { icon: 'today', label: 'Operational Hours:', value: 'Check local business hours for the selected merchant' },
  { icon: 'place', label: 'Location:', value: 'Nearby local branch • Your selected area' },
];

export function ClaimConfirmationModal({ open, onClose, onConfirm, deal }: ClaimConfirmationModalProps) {
  const dealTitle = deal?.title || 'This deal';
  const businessName = deal?.business?.trim() || 'This business';
  const dealLocation = deal?.location?.trim() || 'Your selected location';
  const price = Number(deal?.price ?? 0) || 0;
  const oldPrice = Number(deal?.oldPrice ?? price) || price;
  const discountLabel = deal?.discountLabel || 'Instant savings';

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[580px]"
      backdropClassName="bg-inverse-surface/60 backdrop-blur-sm p-margin"
    >
      <div className="bg-surface-tint-blue px-space-xl py-space-sm flex items-center justify-between">
        <div className="flex items-center gap-space-2xs">
          <Icon name="verified_user" className="text-primary-container text-[18px]" />
          <span className="font-label-sm text-label-sm text-primary-container tracking-wider uppercase font-semibold">
            VEMTAP Zero-Risk Claim
          </span>
        </div>
        <span className="font-caption text-caption text-secondary">Secured Pass Reservation</span>
      </div>

      <div className="p-space-xl space-y-space-lg overflow-y-auto">
        <div className="flex items-start justify-between gap-space-md">
          <div>
            <h3 className="font-heading-lg text-heading-lg text-on-surface">Confirm Your Deal Reservation</h3>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Review your instant booking voucher summary below.
            </p>
          </div>
          <ModalCloseButton onClose={onClose} label="Close modal" />
        </div>

        <div className="bg-surface-subtle rounded-xl p-space-md space-y-space-sm">
          <div className="flex items-start justify-between pb-space-sm bg-surface-canvas/60 p-space-sm rounded-lg gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                <Icon name="storefront" className="text-[22px]" />
              </div>
              <div className="min-w-0">
                <span className="font-caption text-caption text-text-secondary block">Selected Merchant</span>
                <span className="font-heading-sm text-heading-sm text-on-surface">{businessName}</span>
                <span className="font-caption text-caption text-text-tertiary block">{dealLocation}</span>
              </div>
            </div>
            <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-2.5 py-1 rounded-md font-semibold shrink-0">
              {discountLabel}
            </span>
          </div>

          <div className="px-space-xs pt-1 space-y-space-xs font-body-md text-body-md">
            <div className="flex items-center justify-between text-text-secondary gap-space-sm">
              <span className="line-clamp-1 pr-2">{dealTitle}</span>
              <span className="text-text-tertiary line-through font-label-md">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(oldPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between text-badge-discount-text">
              <span className="flex items-center gap-1 font-label-md">
                <Icon name="local_offer" className="text-[16px]" />
                Exclusive VEMTAP Discount
              </span>
              <span className="font-semibold">
                -{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Math.max(oldPrice - price, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between text-text-secondary pt-1 font-label-md gap-space-sm">
              <span className="flex items-center gap-1">
                <Icon name="flash_on" className="text-[16px] text-primary-container" />
                Advance Deposit Required
              </span>
              <span className="text-badge-discount-text font-semibold text-right">
                ₦0.00 (Zero online pre-payment)
              </span>
            </div>
            <div className="pt-space-xs mt-space-xs bg-surface-canvas p-space-sm rounded-lg flex items-center justify-between gap-space-sm">
              <div>
                <span className="font-caption text-caption text-text-secondary block">Amount Payable at Counter</span>
                <span className="font-caption text-caption text-text-tertiary">Pay upon arrival after service</span>
              </div>
              <span className="font-heading-md text-heading-md text-on-surface font-bold">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-semibold text-label-md shrink-0">
              ZA
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">Zainab Ahmed</span>
                <Icon name="verified" className="text-primary-container text-[16px]" filled />
              </div>
              <p className="font-caption text-caption text-text-secondary truncate">
                zainab.ahmed@example.com • +234 803 555 0192
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block font-caption text-caption text-primary-container bg-surface-canvas px-2.5 py-1 rounded-full font-medium shrink-0">
            Instant Pass Holder
          </span>
        </div>

        <div className="bg-surface-subtle rounded-xl p-space-md space-y-space-xs">
          {REDEMPTION.map((row) => (
            <div key={row.label} className="flex items-start gap-space-sm">
              <Icon name={row.icon} className="text-primary-container text-[18px] mt-0.5" />
              <div className="font-body-md text-body-md text-text-secondary">
                <span className="text-on-surface font-medium">{row.label}</span> {row.value}
              </div>
            </div>
          ))}
        </div>

        <p className="font-caption text-caption text-text-secondary leading-relaxed bg-surface-tint-blue/40 p-space-sm rounded-lg text-center">
          By confirming, 1 voucher code will be issued and reserved under your name. Show your code on arrival to
          receive this discount.
        </p>

        <div className="flex flex-col gap-space-sm pt-space-2xs">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-[52px] bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-2xl shadow-md transition-all flex items-center justify-center gap-space-xs active:scale-[0.98]"
          >
            <span>Confirm &amp; Reserve Voucher Pass</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary transition-colors text-center"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </DesktopModal>
  );
}
