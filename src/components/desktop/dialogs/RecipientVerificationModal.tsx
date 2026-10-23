import { useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';
import { maskPhone, parsePrice } from '../../../utils/format';

export interface RecipientVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: () => void;
  onBack: () => void;
  /** Recipient whose contact details should be verified. */
  recipient?: { name: string; email: string; phone?: string } | null;
  deal?: {
    business?: string;
    price?: number | string;
  } | null;
}

export function RecipientVerificationModal({
  open,
  onClose,
  onVerify,
  onBack,
  recipient,
  deal,
}: RecipientVerificationModalProps) {
  const [digits, setDigits] = useState(['5', '8', '2', '9', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(4);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const recipientName = recipient?.name ?? 'Samuel Adeleke';
  const maskedTarget = recipient?.phone ? maskPhone(recipient.phone) : recipient?.email ?? 'recipient@example.com';
  const businessName = deal?.business?.trim() || 'This local partner';
  const price = parsePrice(deal?.price);

  const focusInput = (index: number) => {
    setFocusedIndex(index);
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const digit = cleaned.slice(-1);
    setDigits((prev) => prev.map((item, i) => (i === index ? digit : item)));
    if (digit && index < 5) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) focusInput(index - 1);
  };

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[520px]"
      backdropClassName="bg-on-surface/40 backdrop-blur-sm"
      cardClassName="bg-surface-canvas rounded-xl p-6 md:p-8 gap-space-md shadow-[0_20px_50px_rgba(20,27,43,0.18)]"
    >
      <div className="flex items-center justify-between gap-space-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm tracking-wide font-semibold">
          <Icon name="verified_user" filled className="text-[15px]" />
          <span>RECIPIENT AUTHORIZATION</span>
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="flex flex-col gap-space-2xs">
        <h2 className="font-heading-lg text-heading-lg text-on-surface font-semibold tracking-tight">
          Verify Recipient's Contact
        </h2>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          We sent a 6-digit authorization code to{' '}
          <span className="font-label-md text-label-md text-on-surface font-medium">{maskedTarget}</span> to verify{' '}
          <span className="text-on-surface font-medium">{recipientName}</span> for this claim voucher pass.
        </p>
      </div>

      <div className="flex items-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-primary hover:text-on-primary-fixed-variant font-label-sm text-label-sm font-medium group transition-colors"
        >
          <Icon name="edit" className="text-[16px] group-hover:scale-110 transition-transform" />
          <span>Change contact details</span>
        </button>
      </div>

      <div className="flex flex-col gap-space-xs my-space-2xs">
        <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              aria-label={`Digit ${index + 1}`}
              inputMode="numeric"
              maxLength={1}
              type="text"
              value={digit}
              onFocus={() => setFocusedIndex(index)}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              className={
                focusedIndex === index
                  ? 'h-14 sm:h-16 w-full text-center rounded-xl bg-surface-canvas text-on-surface font-heading-lg text-heading-lg font-bold border-2 border-primary-container ring-4 ring-primary-container/15 focus:outline-none caret-primary transition-all'
                  : `h-14 sm:h-16 w-full text-center rounded-xl bg-surface-canvas font-heading-lg text-heading-lg font-bold border-2 focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 focus:outline-none transition-all shadow-sm ${
                      digit ? 'text-on-surface border-primary-container' : 'text-text-tertiary border-outline-variant'
                    }`
              }
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="font-caption text-caption text-text-tertiary">Didn't receive the code?</span>
          <div className="flex items-center gap-1.5 text-text-secondary font-label-sm text-label-sm">
            <Icon name="schedule" className="text-[15px] text-text-tertiary" />
            <span>
              Resend Code (<span className="text-primary font-semibold font-mono">0:45</span>)
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-surface-tint-blue p-space-sm flex items-start gap-space-xs">
        <div className="w-8 h-8 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shrink-0 shadow-sm">
          <Icon name="shield" filled className="text-[18px]" />
        </div>
        <p className="font-label-sm text-label-sm text-on-secondary-fixed-variant leading-relaxed">
          The recipient must verify this code to authorize claiming the deal and registering the redemption voucher
          directly under their name.
        </p>
      </div>

      <div className="rounded-xl bg-badge-discount-bg p-space-sm flex items-center gap-space-xs">
        <Icon name="check_circle" filled className="text-badge-discount-text text-[20px] shrink-0" />
        <p className="font-label-sm text-label-sm text-badge-discount-text font-medium leading-snug">
          No payment is taken now. Settle <span className="font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price)}</span> directly at {businessName} upon dining.
        </p>
      </div>

      <div className="flex flex-col gap-space-xs pt-space-xs">
        <button
          type="button"
          onClick={onVerify}
          className="w-full h-[52px] rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.99] transition-all"
        >
          <span>Verify &amp; Continue</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full h-11 rounded-lg text-text-secondary hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 transition-colors"
        >
          <Icon name="arrow_back" className="text-[16px]" />
          <span>Back to recipient details</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-space-xs pt-1 text-text-tertiary font-caption text-caption">
        <Icon name="lock" className="text-[14px]" />
        <span>256-bit Encrypted Nigerian Merchant Authorization</span>
      </div>
    </DesktopModal>
  );
}
