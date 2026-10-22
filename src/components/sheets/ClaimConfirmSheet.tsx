import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

const DEAL_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCK4Pwz9CVEhljjHVcnT9BgI3Nbi9M9b9FWI65bQmcAwi6z5H71R5ZWNcp3kMOEEoE5uD_moOYuJIip6emFcbDXzgjC9iHz1cM4t4et9ZtLjup8r-LYHxyKhr8cvaRwiiaocICSuaV-SCxGKG2hQzWubPAuBLJnQ9yfX8y2fwHJAkT_sQc-xVvaKyerZrNXlhrFsyPz-6nwXC6s_wD9Rxgpa5GHNuBzONM_Yy0KG0yc';

const DEAL_ALT =
  'Vibrant gourmet grilled artisan burger with golden crispy shoestring fries served on a dark rustic wooden board in a softly lit upscale restaurant ambiance';

const HOW_TO_CLAIM_STEPS = [
  'Tap Confirm to instantly obtain your one-time digital dynamic QR code pass.',
  'Arrive at the featured local business during the active redemption window.',
  'Present the QR screen before requesting the bill to redeem your discount right away.',
];

const TERMS_BULLETS = [
  '• Valid strictly for dine-in patrons between Monday and Friday.',
  '• Cannot be combined with other ongoing happy hour promotions.',
  '• One claim allowed per party per table.',
  '• Reservation expires if unredeemed within the 48-hour voucher countdown window.',
];

type NestedSheet = 'howTo' | 'terms' | null;

export interface ClaimConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClaimConfirmSheet({ open, onClose, onConfirm }: ClaimConfirmSheetProps) {
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<'idle' | 'locking' | 'success'>('idle');
  const [nested, setNested] = useState<NestedSheet>(null);

  const close = () => {
    setStatus('idle');
    setNested(null);
    onClose();
  };

  const confirm = () => {
    if (!consent || status !== 'idle') return;
    setStatus('locking');
    window.setTimeout(() => setStatus('success'), 900);
    window.setTimeout(() => {
      setStatus('idle');
      onConfirm();
    }, 1700);
  };

  return (
    <>
      <SheetShell open={open} onClose={close}>
        <div className="w-full flex justify-center pt-3 pb-space-xs">
          <div className="w-12 h-1.5 rounded-full bg-surface-container/60" />
        </div>

        <div className="flex flex-col w-full px-margin pb-safe">
          <div className="flex items-center justify-between w-full mb-space-sm">
            <div className="flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-1 rounded-full font-label-sm text-label-sm">
              <Icon name="timer" filled className="text-[16px]" />
              <span>Reserved for 10:00 mins</span>
            </div>
            <button
              aria-label="Close dialog"
              type="button"
              onClick={close}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors active:scale-95 text-on-surface-variant"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          <div className="flex flex-col gap-1 mb-space-md">
            <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
              Confirm Deal Reservation
            </h2>
            <p className="font-body-md text-body-md text-text-secondary">
              Review the claim conditions before your one-time voucher is generated.
            </p>
          </div>

          <div className="flex flex-col bg-surface-subtle rounded-2xl p-space-md shadow-sm mb-space-md">
            <div className="flex items-center gap-space-sm mb-space-sm">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                <img className="w-full h-full object-cover" alt={DEAL_ALT} src={DEAL_IMAGE} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary truncate">
                  Local dining partner
                </span>
                <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">Featured local deal</h3>
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs bg-surface-canvas rounded-xl p-space-sm shadow-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-label-sm text-label-sm text-text-secondary">Pay at Venue</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading-sm text-heading-sm text-text-primary">₦9,600</span>
                  <span className="font-label-sm text-label-sm text-badge-discount-text bg-badge-discount-bg px-1.5 py-0.5 rounded-md font-semibold">
                    Save ₦2,400
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-space-xs mt-space-2xs">
                <span className="font-caption text-caption text-text-tertiary">Claiming as</span>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <Icon name="account_circle" className="text-[15px] text-text-tertiary" />
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">john@email.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-surface-tint-blue rounded-2xl p-space-md mb-space-lg shadow-sm transition-all duration-200">
            <label className="flex items-start gap-space-sm cursor-pointer select-none">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input
                  checked={consent}
                  className="peer sr-only"
                  id="terms-toggle"
                  type="checkbox"
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <div className="w-5 h-5 rounded-md bg-surface-canvas peer-checked:bg-primary-container flex items-center justify-center transition-all duration-150 shadow-sm">
                  <Icon
                    name="check"
                    className={`text-on-primary text-[17px] transition-opacity ${consent ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-body-md text-body-md text-text-primary leading-snug">
                  I have read and understand the reservation conditions:
                </span>
                <div className="flex flex-wrap items-center gap-x-space-xs gap-y-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setNested('howTo')}
                    className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container hover:underline py-0.5 font-semibold"
                  >
                    <span>How to Claim</span>
                    <Icon name="arrow_outward" className="text-[15px]" />
                  </button>
                  <span className="text-text-tertiary font-caption text-caption">•</span>
                  <button
                    type="button"
                    onClick={() => setNested('terms')}
                    className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container hover:underline py-0.5 font-semibold"
                  >
                    <span>Deal Terms &amp; Conditions</span>
                    <Icon name="arrow_outward" className="text-[15px]" />
                  </button>
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-space-xs w-full">
            <button
              type="button"
              onClick={confirm}
              disabled={!consent || status !== 'idle'}
              className={`w-full h-[52px] active:scale-[0.98] transition-all duration-150 text-on-primary font-button-primary text-button-primary rounded-2xl flex items-center justify-center gap-2 ${
                status === 'success'
                  ? 'bg-badge-discount-text shadow-none'
                  : consent
                    ? 'bg-primary-container shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)]'
                    : 'bg-primary-container opacity-40 cursor-not-allowed shadow-none'
              }`}
            >
              {status === 'idle' && (
                <>
                  <Icon name="confirmation_number" filled className="text-[20px]" />
                  <span>Confirm &amp; Reserve Deal</span>
                </>
              )}
              {status === 'locking' && (
                <>
                  <Icon name="progress_activity" className="text-[20px] animate-spin" />
                  <span>Locking Your Discount...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <Icon name="check_circle" filled className="text-[20px]" />
                  <span>Claimed Successfully!</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={close}
              className="w-full h-11 bg-transparent active:bg-surface-container-low transition-colors text-text-secondary font-button-secondary text-button-secondary rounded-xl flex items-center justify-center"
            >
              Cancel / Not Now
            </button>
          </div>

          <div className="flex items-center justify-center gap-space-xs mt-space-sm px-space-xs text-center">
            <Icon name="verified_user" filled className="text-[16px] text-badge-discount-text shrink-0" />
            <span className="font-caption text-caption text-text-secondary">
              Zero upfront fee • Guaranteed discount held exclusively for you
            </span>
          </div>
        </div>
      </SheetShell>

      <SheetShell open={nested === 'howTo'} onClose={() => setNested(null)}>
        <div className="flex flex-col w-full p-margin pb-safe max-h-[751px]">
          <div className="flex items-center justify-between mb-space-md">
            <h4 className="font-heading-sm text-heading-sm text-text-primary">How to Claim Voucher</h4>
            <button
              aria-label="Close"
              type="button"
              onClick={() => setNested(null)}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="flex flex-col gap-space-md overflow-y-auto mb-space-lg">
            {HOW_TO_CLAIM_STEPS.map((step, index) => (
              <div key={step} className="flex gap-space-sm items-start">
                <div className="w-7 h-7 rounded-full bg-surface-tint-blue text-primary-container flex items-center justify-center shrink-0 font-label-md text-label-md font-semibold">
                  {index + 1}
                </div>
                <p className="font-body-md text-body-md text-text-secondary">{step}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setNested(null)}
            className="w-full h-12 bg-surface-container text-text-primary font-button-primary text-button-primary rounded-xl active:scale-[0.98] transition-transform"
          >
            Understood
          </button>
        </div>
      </SheetShell>

      <SheetShell open={nested === 'terms'} onClose={() => setNested(null)}>
        <div className="flex flex-col w-full p-margin pb-safe max-h-[751px]">
          <div className="flex items-center justify-between mb-space-md">
            <h4 className="font-heading-sm text-heading-sm text-text-primary">Deal Terms &amp; Conditions</h4>
            <button
              aria-label="Close"
              type="button"
              onClick={() => setNested(null)}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="flex flex-col gap-space-sm overflow-y-auto mb-space-lg font-body-md text-body-md text-text-secondary">
            {TERMS_BULLETS.map((bullet) => (
              <p key={bullet}>{bullet}</p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setNested(null)}
            className="w-full h-12 bg-surface-container text-text-primary font-button-primary text-button-primary rounded-xl active:scale-[0.98] transition-transform"
          >
            I Agree
          </button>
        </div>
      </SheetShell>
    </>
  );
}
