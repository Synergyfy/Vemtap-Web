import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import type { ClaimRecord } from '../context/ClaimsContext';
import { maskPhone } from '../utils/format';

export interface GiftRecipientSummary {
  name: string;
  email: string;
  phone?: string;
}

interface GiftSentScreenProps {
  recipient: GiftRecipientSummary | null;
  onDone: () => void;
  onSendAnother: () => void;
  onBack: () => void;
  claim?: ClaimRecord | null;
}

export function GiftSentScreen({ recipient, onDone, onSendAnother, onBack, claim }: GiftSentScreenProps) {
  const [copied, setCopied] = useState(false);
  const recipientName = recipient?.name || 'Recipient';
  const recipientEmail = recipient?.email || 'No email provided';
  const recipientPhone = recipient?.phone || claim?.recipient?.phone;
  const maskedPhone = recipientPhone ? maskPhone(recipientPhone) : null;
  const reference = claim?.ref ?? '#VT-GIFT-83921';

  const copyCode = () => {
    navigator.clipboard?.writeText(reference).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Gift Sent" onBack={onBack} />

      <div className="flex flex-col w-full px-margin py-space-lg">
        <div className="flex flex-col items-center text-center relative">
          <div className="relative flex items-center justify-center mb-space-md">
            <div className="absolute w-24 h-24 rounded-full bg-primary/10 blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-surface-tint-blue flex items-center justify-center shadow-sm">
              <Icon name="card_giftcard" filled className="text-primary-container text-[40px]" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-sm">
              <Icon name="check" className="text-badge-discount-text text-[18px]" />
            </div>
          </div>
          <h2 className="font-heading-md text-heading-md text-text-primary mb-space-2xs">Gift Deal Sent!</h2>
          <p className="font-body-md text-body-md text-text-secondary max-w-xs">
            We've sent the verification instructions to{' '}
            <span className="font-button-secondary text-text-primary">{recipientName}</span> (
            <span className="text-text-primary">{recipientEmail}</span>
            {maskedPhone ? <>, {maskedPhone}</> : null}).
          </p>
        </div>

        <div className="mt-space-lg bg-surface-canvas rounded-xl shadow-md overflow-hidden">
          <div className="p-space-md bg-surface-container-low flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
              <Icon name="restaurant" className="text-on-primary-fixed-variant text-[24px]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-space-2xs mb-1">
                <span className="px-space-2xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  20% OFF
                </span>
                <span className="font-caption text-caption text-text-tertiary">Gift Voucher</span>
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">Featured local deal</h3>
              <p className="font-caption text-caption text-text-secondary truncate">
                Local dining partner • Nearby
              </p>
            </div>
          </div>

          <div className="p-space-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between py-space-xs bg-surface-subtle px-space-sm rounded-lg">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                  Claim Code Reserved
                </span>
                <span className="font-button-primary text-text-primary tracking-wide">{reference}</span>
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary-container font-label-sm text-label-sm active:scale-95 transition-all"
              >
                <Icon name={copied ? 'check_circle' : 'content_copy'} className="text-[16px]" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="outgoing_mail" className="text-badge-discount-text text-[18px]" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-label-md text-label-md text-text-primary">Verification Dispatched</span>
                <span className="font-caption text-caption text-text-secondary">
                  Instant link sent via SMS &amp; Email to recipient
                </span>
              </div>
            </div>

            <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
              <Icon name="schedule" className="text-primary-container text-[20px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                {recipientName} must verify the link and redeem the deal themselves — this gift is reserved for them,
                not your account.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-space-xl flex flex-col gap-space-sm">
          <button
            type="button"
            onClick={onDone}
            className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
          >
            <span>View Gift in My Deals</span>
          </button>
          <button
            type="button"
            onClick={onSendAnother}
            className="w-full h-[44px] rounded-xl bg-transparent text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-space-2xs"
          >
            <Icon name="card_giftcard" className="text-[18px]" />
            Send Another Deal
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
