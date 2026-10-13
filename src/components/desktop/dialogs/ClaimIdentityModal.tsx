import { useState } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';

export interface ClaimIdentityModalProps {
  open: boolean;
  onClose: () => void;
  onClaimSelf: () => void;
  onGift: () => void;
  onSomeoneElse: () => void;
}

type Option = 'myself' | 'gift' | 'other';

const OPTIONS: Array<{
  value: Option;
  icon: string;
  iconClass: string;
  title: string;
  badge?: string;
  copy: string;
}> = [
  {
    value: 'myself',
    icon: 'person',
    iconClass: 'bg-primary-container text-on-primary-container',
    title: 'Claim for Myself',
    copy: 'Voucher code will be issued instantly to your VEMTAP account (Zainab Ahmed) and saved to My Deals.',
  },
  {
    value: 'gift',
    icon: 'featured_seasonal_and_gifts',
    iconClass: 'bg-secondary-container text-on-secondary-container',
    title: 'Send as a Gift 🎁',
    badge: 'Most Popular',
    copy: 'Personalize a digital gift card with a custom message and schedule delivery via WhatsApp, Email, or SMS.',
  },
  {
    value: 'other',
    icon: 'group_add',
    iconClass: 'bg-surface-container-high text-primary',
    title: 'Claim for Someone Else',
    copy: 'Authorize another person to present the voucher pass and redeem the discount directly under their name.',
  },
];

export function ClaimIdentityModal({ open, onClose, onClaimSelf, onGift, onSomeoneElse }: ClaimIdentityModalProps) {
  const [selected, setSelected] = useState<Option>('myself');

  const handleContinue = () => {
    if (selected === 'gift') onGift();
    else if (selected === 'other') onSomeoneElse();
    else onClaimSelf();
  };

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[580px]"
      backdropClassName="bg-on-surface/50 backdrop-blur-sm"
      cardClassName="bg-surface-canvas rounded-xl"
    >
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold tracking-wider uppercase">
          <Icon name="verified_user" className="text-[14px]" />
          <span>VEMTAP Zero-Risk Claim</span>
        </div>
        <ModalCloseButton onClose={onClose} label="Close modal" />
      </div>

      <div className="px-6 pt-2 pb-4 flex flex-col gap-1">
        <h2 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
          How would you like to claim this deal?
        </h2>
        <p className="font-body-md text-body-md text-text-secondary">
          Choose who will redeem this voucher pass at Urban Grill &amp; Bistro.
        </p>
      </div>

      <div className="px-6 flex flex-col gap-4 overflow-y-auto">
        <div className="p-3.5 rounded-xl bg-surface-container-low shadow-sm flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative bg-surface-dim">
            <img
              className="w-full h-full object-cover"
              alt="Plated artisanal grilled platter with colorful seasoned vegetable medley at Urban Grill & Bistro Apo Abuja"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCae9ls0dapHyTLe-tYB9uhNt_hUJE2QAAdV2y_MVPHC76VbKWGYmtiOiPlDFj-_cbwZ4ybtfZvIghTgM4PFsM1-MiS3ASzXHSm7QQ0_QjhA-3HQ_zgW5WfD8CmyMNsBVqD3UPI93tx9chuEy1esEjbXiMYwbt1lUkEWhlqTSIfmIcXeUhHL_1My2jkMLk2CjwQ3_42znyGtZVtN740cPIGEbbniuGZ7eRx1xnRMqkM"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary truncate">
              Urban Grill &amp; Bistro • Apo, Abuja
            </span>
            <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate leading-tight">
              Prime 3-Course Lunch Combo &amp; Craft Beverage
            </h3>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 pt-0.5">
              <span className="font-button-primary text-button-primary font-bold text-on-surface">₦9,600</span>
              <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                Save ₦2,400 (20% OFF)
              </span>
              <span className="text-text-tertiary text-[11px] font-caption hidden sm:inline">
                • Zero upfront payment • Pay in-store
              </span>
            </div>
          </div>
        </div>

        <div aria-label="Select claim recipient option" className="flex flex-col gap-2.5" role="radiogroup">
          {OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <label
                key={option.value}
                className={`group relative flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all duration-150 shadow-sm ${
                  isSelected ? 'bg-surface-tint-blue' : 'bg-surface-canvas hover:bg-surface-subtle'
                }`}
              >
                <input
                  className="sr-only"
                  name="claim_method"
                  type="radio"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setSelected(option.value)}
                />
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${option.iconClass}`}
                >
                  <Icon name={option.icon} className="text-[20px]" filled={option.value === 'myself'} />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading-sm text-heading-sm text-on-surface font-bold">{option.title}</span>
                    {option.badge ? (
                      <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold tracking-tight">
                        {option.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-0.5">{option.copy}</p>
                </div>
                <div className="shrink-0 mt-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                      isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-transparent'
                    }`}
                  >
                    <Icon name="check" className="text-[14px]" />
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="p-6 pt-5 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Continue with Selected Option</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="font-button-secondary text-button-secondary text-text-secondary hover:text-on-surface transition-colors py-1"
        >
          Cancel and return to deal
        </button>

        <div className="pt-2 flex items-center justify-center gap-2 text-text-tertiary font-caption text-caption text-center">
          <Icon name="lock" className="text-[14px] text-badge-discount-text" />
          <span>NDPR Data Privacy Compliant • Instant Voucher Generation</span>
        </div>
      </div>
    </DesktopModal>
  );
}
