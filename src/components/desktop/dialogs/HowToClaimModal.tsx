import { useState } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';

export interface HowToClaimModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

interface Step {
  icon: string;
  iconClass: string;
  title: string;
  badge: string;
  badgeClass: string;
  copy: string;
}

const STEPS: Step[] = [
  {
    icon: 'touch_app',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: '1. Tap Claim Online (100% Free)',
    badge: '₦0 Charged',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold',
    copy: 'Reserve your voucher instantly. No debit card, no pre-payment required on VEMTAP.',
  },
  {
    icon: 'storefront',
    iconClass: 'bg-surface-container text-on-secondary-container',
    title: '2. Visit the Featured Merchant',
    badge: 'Nearby',
    badgeClass: 'font-caption text-caption text-text-secondary bg-surface-container',
    copy: 'Head to the active local branch during the valid redemption window for your selected offer.',
  },
  {
    icon: 'qr_code_2',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: '3. Show Voucher & Pay at Counter',
    badge: 'Pay ₦9,600',
    badgeClass: 'font-label-sm text-label-sm text-primary font-bold',
    copy: 'Present your offline-ready QR pass or 6-digit claim code to your server. Settle the discounted ₦9,600 via POS card swipe, transfer, or cash.',
  },
];

const TERMS: string[] = [
  'Valid strictly for dine-in and scheduled takeaway.',
  'Limit of 2 voucher claims per customer per week.',
  'Voucher expires 48 hours after claiming if not redeemed.',
  'Cannot be combined with ongoing in-house happy hour promotions.',
  'NDPR compliant: Your personal payment details are never stored.',
];

export function HowToClaimModal({ open, onClose, onProceed }: HowToClaimModalProps) {
  const [agreed, setAgreed] = useState(true);

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[640px]"
      backdropClassName="bg-on-surface/60 backdrop-blur-sm"
      cardClassName="bg-surface-canvas rounded-2xl max-h-[92vh]"
    >
      <div className="px-space-xl pt-space-xl pb-space-lg bg-surface-canvas flex items-start justify-between gap-space-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-space-xs text-primary font-label-sm text-label-sm bg-surface-tint-blue px-space-sm py-0.5 rounded-full mb-1">
            <Icon name="format_image_left" className="text-[14px]" />
            <span>Verified Zero-Risk Guarantee</span>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface tracking-tight">How to Claim &amp; Voucher Terms</h2>
          <p className="font-body-md text-body-md text-text-secondary flex items-center gap-1.5">
            <span className="font-medium text-on-surface">Featured Local Deal</span>
            <span className="text-text-tertiary">•</span>
            <span>Local dining partner</span>
          </p>
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="px-space-xl py-space-sm overflow-y-auto space-y-space-lg">
        <div className="space-y-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-bold block">
            Simple 3-Step Redemption Flow
          </span>
          <div className="space-y-space-sm">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container-low/70 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${step.iconClass}`}
                >
                  <Icon name={step.icon} className="text-[22px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 gap-space-sm">
                    <h3 className="font-heading-sm text-heading-sm text-on-surface">{step.title}</h3>
                    <span className={`${step.badgeClass} px-space-xs py-0.5 rounded whitespace-nowrap`}>{step.badge}</span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary leading-snug">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm">
          <div className="flex items-center gap-space-xs">
            <Icon name="gavel" className="text-[18px] text-on-surface" />
            <span className="font-heading-sm text-heading-sm text-on-surface">Deal Terms &amp; Conditions</span>
          </div>
          <ul className="space-y-space-xs font-body-md text-body-md text-text-secondary">
            {TERMS.map((term, index) => (
              <li key={term} className="flex items-start gap-space-sm">
                <Icon
                  name="check_circle"
                  filled
                  className="text-[18px] text-badge-discount-text shrink-0 mt-0.5"
                />
                <span className={index === TERMS.length - 1 ? 'text-on-surface font-medium' : undefined}>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-space-xl pt-space-md pb-space-xl bg-surface-canvas space-y-space-md shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <label className="flex items-start gap-space-sm cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-1 w-4 h-4 rounded accent-primary-container cursor-pointer transition-all"
          />
          <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">
            I have read and agree to the deal terms and merchant redemption rules.
          </span>
        </label>

        <div className="flex flex-col gap-space-xs">
          <button
            type="button"
            disabled={!agreed}
            onClick={onProceed}
            className={`w-full h-[52px] rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs transition-all active:scale-[0.99] ${
              agreed
                ? 'bg-primary-container hover:bg-primary text-on-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)]'
                : 'bg-surface-container-high text-text-tertiary cursor-not-allowed'
            }`}
          >
            <span>Understood, Proceed to Claim Deal (₦9,600)</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary rounded-xl transition-colors flex items-center justify-center"
          >
            Close &amp; Return to Deal
          </button>
        </div>
      </div>
    </DesktopModal>
  );
}
