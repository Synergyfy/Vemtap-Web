import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import type { GiftRecipientSummary } from '../GiftSentScreen';
import type { ClaimRecord } from '../../context/ClaimsContext';
import { maskPhone } from '../../utils/format';

interface DesktopGiftSentScreenProps {
  onNav: (key: DesktopNavKey) => void;
  recipient?: GiftRecipientSummary | null;
  onBack: () => void;
  onDone: () => void;
  onSendAnother: () => void;
  claim?: ClaimRecord | null;
}

export function DesktopGiftSentScreen({
  onNav,
  recipient,
  onBack,
  onDone,
  onSendAnother,
  claim,
}: DesktopGiftSentScreenProps) {
  const [copied, setCopied] = useState(false);
  const timers = useRef<number[]>([]);

  const recipientName = recipient?.name || 'Recipient';
  const recipientEmail = recipient?.email || 'No email provided';
  const recipientPhone = recipient?.phone || claim?.recipient?.phone;
  const reference = claim?.ref ?? '#VT-GIFT-83921';

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const copyCode = () => {
    navigator.clipboard?.writeText(reference).catch(() => undefined);
    setCopied(true);
    timers.current.push(window.setTimeout(() => setCopied(false), 2000));
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-tertiary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[16px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              My Deals
            </button>
            <Icon name="chevron_right" className="text-[16px]" />
            <span className="text-text-primary font-semibold">Gift Sent</span>
          </nav>

          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption mb-space-xs shadow-sm">
              <Icon name="outgoing_mail" className="text-[14px]" />
              <span className="font-semibold tracking-wider uppercase">Verification Dispatched</span>
            </span>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">Gift Deal Sent!</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-space-2xs leading-relaxed">
              We've sent the verification instructions to{' '}
              <span className="font-button-secondary text-text-primary">{recipientName}</span> (
              <span className="text-text-primary">{recipientEmail}</span>
              {recipientPhone ? <>, {maskPhone(recipientPhone)}</> : null}).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="flex flex-col gap-4 min-w-0">
              <div className="relative bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden px-space-xl py-space-xl flex flex-col items-center">
                <div className="absolute -top-10 right-0 w-40 h-40 bg-surface-tint-blue rounded-full blur-2xl pointer-events-none" />
                <div className="relative flex items-center justify-center mb-space-md">
                  <div className="absolute w-28 h-28 rounded-full bg-primary-container/15 blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-surface-tint-blue flex items-center justify-center shadow-sm">
                    <Icon name="card_giftcard" filled className="text-primary text-[40px]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-sm">
                    <Icon name="check" className="text-badge-discount-text text-[18px]" />
                  </div>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-xl shadow-md overflow-hidden">
                <div className="p-space-md bg-surface-container-low flex items-center gap-space-sm">
                  <div className="w-12 h-12 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0 text-primary">
                    <Icon name="restaurant" className="text-[24px]" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-space-2xs mb-1">
                      <span className="px-space-2xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        20% OFF
                      </span>
                      <span className="font-caption text-caption text-text-tertiary">Gift Voucher</span>
                    </div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                      Lunch Combo — 20% Off
                    </h2>
                    <p className="font-caption text-caption text-text-secondary truncate">
                      Urban Grill &amp; Bistro • Apo, Abuja
                    </p>
                  </div>
                </div>

                <div className="p-space-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between gap-space-sm py-space-xs bg-surface-subtle px-space-sm rounded-lg">
                    <div className="flex flex-col min-w-0">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                        Claim Code Reserved
                      </span>
                      <span className="font-button-primary text-text-primary tracking-wide truncate">
                        {reference}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm hover:bg-surface-container-high active:scale-95 transition-all shrink-0"
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
                    <Icon name="schedule" className="text-primary text-[20px] shrink-0 mt-0.5" />
                    <p className="font-caption text-caption text-text-secondary leading-relaxed">
                      The recipient will have&nbsp;to activate and redeem this deal at checkout.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-full flex flex-col gap-4 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                  Gift Recipient
                </span>
                <p className="font-heading-sm text-heading-sm text-text-primary mt-1 truncate">{recipientName}</p>
                <p className="font-body-md text-body-md text-text-secondary break-all">{recipientEmail}</p>
                {recipientPhone && (
                  <p className="font-body-md text-body-md text-text-secondary break-all">{maskPhone(recipientPhone)}</p>
                )}
                <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="font-caption text-caption text-text-tertiary">Claim Code Reserved</span>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">{reference}</span>
                </div>
              </div>

              <div className="flex flex-col gap-space-sm w-full">
                <button
                  type="button"
                  onClick={onDone}
                  className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-lg hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
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
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
