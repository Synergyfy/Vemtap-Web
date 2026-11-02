import { useState } from 'react';
import { Icon } from '../../ui/Icon';
import { parsePrice } from '../../../utils/format';
import { DesktopModal } from '../DesktopModal';

export interface GiftRecipientValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** The sender's message; sent with the gift email. */
  note: string;
}

export interface GiftRecipientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  /** Receives the collected recipient details so the review step and gift record can use them. */
  onContinue: (values: GiftRecipientValues) => void;
  deal?: {
    title?: string;
    business?: string;
    location?: string;
    price?: number | string;
    oldPrice?: number | string;
    discountLabel?: string;
    image?: string;
  } | null;
}

const DEFAULT_MESSAGE = 'Enjoy this deal on me! Hope you love it.';

export function GiftRecipientDetailsModal({ open, onClose, onContinue, deal }: GiftRecipientDetailsModalProps) {
  const dealTitle = deal?.title || 'This deal';
  const businessName = deal?.business?.trim() || 'This local partner';
  const dealPrice = parsePrice(deal?.price);
  const dealImage = deal?.image ?? '';
  const defaultMessage = deal?.title
    ? `Enjoy this ${dealTitle.toLowerCase()} on me! Hope you love it at ${businessName}.`
    : DEFAULT_MESSAGE;
  const [message, setMessage] = useState(defaultMessage);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  const lastName = rest.join(' ');

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[620px]"
      backdropClassName="bg-on-surface/45 backdrop-blur-sm"
      cardClassName="bg-surface-canvas rounded-2xl"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-secondary-container" />

      <div className="px-6 pt-6 pb-4 bg-surface-canvas flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-primary font-medium tracking-wide uppercase">
              Step 1 of 2
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="font-caption text-caption text-text-secondary">Recipient Details</span>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="w-full grid grid-cols-2 gap-2">
          <div className="h-1.5 rounded-full bg-primary-container" />
          <div className="h-1.5 rounded-full bg-surface-container-high" />
        </div>

        <div className="flex flex-col gap-1 mt-1">
          <h2 className="font-heading-lg text-heading-lg text-on-surface flex items-center gap-2">
            Gift this Deal to Someone Special
            <span className="inline-block transform hover:rotate-12 transition-transform">🎁</span>
          </h2>
          <p className="font-body-md text-body-md text-text-secondary">
            Send a voucher pass for <span className="font-medium text-on-surface">{dealTitle}</span> at {businessName}.
          </p>
        </div>
      </div>

      <div className="mx-6 p-3 rounded-xl bg-surface-container-low flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
          <img
            className="w-full h-full object-cover"
            alt={dealTitle}
            src={dealImage}
          />
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
            20%
          </span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
              {businessName}
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(dealPrice)}
            </span>
          </div>
          <p className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1 mt-0.5">
            <Icon name="format_image_left" className="text-[14px]" />
            No payment charged now — recipient pays {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(dealPrice)} at the counter upon visit.
          </p>
        </div>
      </div>

      <form
        className="px-6 py-5 flex flex-col gap-4 overflow-y-auto"
        onSubmit={(event) => {
          event.preventDefault();
          onContinue({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: '',
            note: message.trim(),
          });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-between">
            <span>Recipient Full Name</span>
            <span className="font-caption text-caption text-text-tertiary font-normal">Required</span>
          </label>
          <div className="relative flex items-center">
            <Icon name="badge" className="absolute left-3.5 text-text-tertiary text-[20px]" />
            <input
              className="w-full h-[50px] pl-11 pr-4 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none transition-all"
              placeholder="Recipient's full name"
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface font-semibold">Recipient's Email Address</label>
          <input
            className="w-full h-[50px] px-4 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none transition-all"
            placeholder="Enter email address"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <span className="font-caption text-caption text-text-tertiary">The gift and how to claim it are sent to this email.</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold">
              Personal Gift Note <span className="font-normal text-text-tertiary">(Optional)</span>
            </label>
            <span className="font-caption text-caption text-text-tertiary">{message.length}/140</span>
          </div>
          <textarea
            className="w-full p-3.5 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none transition-all resize-none leading-relaxed"
            placeholder="Add a warm note for the recipient..."
            rows={2}
            maxLength={140}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 hover:bg-surface-tint active:scale-[0.99] transition-all"
          >
            <span>Continue to Gift Review</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 py-1 transition-colors"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              <span>Change claim method</span>
            </button>
            <div className="flex items-center gap-1.5 text-center text-text-tertiary">
              <Icon name="verified_user" filled className="text-[15px] text-badge-discount-text shrink-0" />
              <p className="font-caption text-caption">
                Zero-risk gifting: Your recipient receives a verified VEMTAP pass with redemption instructions.
              </p>
            </div>
          </div>
        </div>
      </form>
    </DesktopModal>
  );
}
