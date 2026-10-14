import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';
import { maskPhone } from '../../../utils/format';

export interface ConfirmGiftSendModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSend: () => void;
  /** Gift recipient collected in the previous step. */
  recipient?: { name: string; email: string; phone?: string } | null;
}

type DispatchState = 'idle' | 'sending' | 'sent';

export function ConfirmGiftSendModal({ open, onClose, onEdit, onSend, recipient }: ConfirmGiftSendModalProps) {
  const recipientName = recipient?.name ?? 'Samuel Adeleke';
  const recipientPhoneDisplay = recipient?.phone ? maskPhone(recipient.phone) : '+234 802 345 6789';
  const firstName = recipientName.split(/\s+/)[0] || recipientName || 'recipient';
  const [agreed, setAgreed] = useState(true);
  const [state, setState] = useState<DispatchState>('idle');
  const timers = useRef<Array<number>>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setState('idle');
      setAgreed(true);
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    }
  }, [open]);

  const handleSend = () => {
    if (state !== 'idle') return;
    setState('sending');
    timers.current.push(
      window.setTimeout(() => {
        setState('sent');
        timers.current.push(window.setTimeout(() => onSend(), 1000));
      }, 1200),
    );
  };

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-xl"
      backdropClassName="bg-on-surface/40 backdrop-blur-md"
      cardClassName="bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-primary-container via-surface-tint-blue to-badge-discount-text" />

      <div className="px-6 pt-6 pb-3 bg-surface-container-lowest flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
              <Icon name="card_giftcard" className="text-[14px]" />
              <span>Step 2 of 2: Review &amp; Send</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              Verified Partner
            </span>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            Review &amp; Confirm Gift Deal
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-0.5">
            Please review your gift details before dispatching the voucher pass.
          </p>
        </div>
        <ModalCloseButton onClose={onClose} label="Close modal" />
      </div>

      <div className="px-6 py-4 flex flex-col gap-5 max-h-[768px] overflow-y-auto">
        <div className="relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br from-primary-container/40 via-surface-variant to-badge-discount-text/40 shadow-md">
          <div className="bg-gradient-to-b from-surface-tint-blue/90 via-surface-container-lowest to-surface-container-lowest p-4 rounded-[14px] relative">
            <div className="absolute -right-8 -top-8 w-32 h-32 opacity-10 pointer-events-none text-primary">
              <svg fill="currentColor" viewBox="0 0 100 100" aria-hidden="true">
                <path d="M50 0 L60 38 L100 50 L60 62 L50 100 L40 62 L0 50 L40 38 Z" />
              </svg>
            </div>

            <div className="flex items-center justify-between gap-2 pb-2 relative">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl">🎁</span>
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                  A Special Treat for {recipientName}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-caption text-caption font-semibold uppercase tracking-wider shrink-0">
                VEMTAP PASS
              </span>
            </div>

            <div className="flex items-start gap-3 mt-2 pt-1 relative">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                <img
                  className="w-full h-full object-cover"
                  alt="Signature woodfire flame-grilled beef steak combo with golden french fries and craft iced peach beverage in Abuja bistro setting"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXC0UICumcOqUgWRJhksyfo1WV4W_z_Jah24z17LixUVf_ZwyTV7cOsMK8mUbjlRW0wDeE9yhj2K30sqtivL48v2w685VmwyLNsVx4AdCwwcUurgusf3wMMjPCx6qbHD6POoacLsb0JgzozuqmuUWFLDymyq-Ow0tH8GDpH3UrTbdesSIX-AjcYMeqgChtR-jGUGCmDLtSQ8k-42V8pISEEi-4ILLBVobVDoxD3Wyq"
                />
                <div className="absolute top-1 left-1 bg-badge-discount-bg text-badge-discount-text text-[10px] font-bold px-1.5 py-0.5 rounded">
                  20% OFF
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading-sm text-heading-sm text-text-primary leading-tight truncate">
                  Prime 3-Course Lunch Combo &amp; Craft Beverage
                </h3>
                <div className="flex items-center gap-1 text-text-secondary mt-1">
                  <Icon name="storefront" className="text-[16px] text-primary" />
                  <span className="font-body-md text-body-md truncate">
                    Urban Grill &amp; Bistro • Apo District, Abuja
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 rounded-xl bg-surface-canvas shadow-sm relative">
              <div className="flex items-start gap-2">
                <Icon name="format_quote" className="text-[20px] text-primary mt-0.5 shrink-0" />
                <p className="font-body-md text-body-md text-on-surface italic">
                  "Enjoy this lunch on me! Hope you love the woodfire steaks at Urban Grill."
                  <span className="block text-right font-label-sm text-label-sm not-italic font-bold text-text-primary mt-1">
                    - Zainab
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 flex flex-col gap-2">
              <div className="flex items-start gap-2 text-text-secondary">
                <Icon
                  name="check_circle"
                  className="text-[18px] text-badge-discount-text shrink-0 mt-0.5"
                />
                <span className="font-label-sm text-label-sm text-on-surface">
                  Includes: 1x Angus burger or chicken plate, truffle parmesan fries, house iced peach cooler
                </span>
              </div>
              <div className="flex items-start gap-2 text-text-secondary">
                <Icon name="schedule" className="text-[18px] text-primary shrink-0 mt-0.5" />
                <span className="font-caption text-caption text-text-secondary">
                  Terms: Valid for 48 hours from claim • Redeemable Mon-Fri 12:00 PM - 4:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-subtle p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between pb-0.5">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary">
              Fulfillment &amp; Billing Dispatch
            </span>
            <span className="inline-flex items-center gap-1 font-caption text-caption text-badge-discount-text font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
              WhatsApp Gateway Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body-md text-body-md pt-1">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-tertiary">Recipient</span>
              <span className="font-label-md text-label-md text-text-primary font-medium flex items-center gap-1">
                <Icon name="person" className="text-[16px] text-text-secondary" />
                {recipientName}
              </span>
              <span className="font-caption text-caption text-text-secondary">{recipientPhoneDisplay}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-tertiary">Delivery Channel</span>
              <span className="font-label-md text-label-md text-badge-discount-text font-medium flex items-center gap-1">
                <Icon name="chat" className="text-[16px]" />
                WhatsApp Instant Delivery
              </span>
              <span className="font-caption text-caption text-text-secondary">Interactive link + Offline QR</span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-tertiary">Sender Profile</span>
              <span className="font-label-md text-label-md text-text-primary font-medium flex items-center gap-1">
                <Icon name="badge" className="text-[16px] text-text-secondary" />
                Zainab Ahmed
              </span>
              <span className="font-caption text-caption text-text-secondary truncate">
                zainab.ahmed@example.com
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-tertiary">Upfront Cost (Sender)</span>
              <span className="font-label-md text-label-md text-badge-discount-text font-bold flex items-center gap-1">
                <span>₦0.00</span>
                <span className="font-caption text-caption text-text-secondary font-normal">(Free to send)</span>
              </span>
              <span className="font-caption text-caption text-text-tertiary">
                Zero online pre-payment required
              </span>
            </div>
          </div>

          <div className="mt-2 p-2.5 rounded-lg bg-surface-container-high/60 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Icon name="point_of_sale" className="text-[18px] text-primary shrink-0" />
              <span className="font-body-md text-body-md text-on-surface truncate">
                Recipient pays upon counter redemption:
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-heading-sm text-heading-sm font-bold text-primary">₦9,600</span>
              <span className="font-caption text-caption text-badge-discount-text ml-1">(20% OFF)</span>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-canvas hover:bg-surface-tint-blue/30 cursor-pointer transition-colors group select-none shadow-sm">
          <input
            className="mt-0.5 w-4 h-4 rounded text-primary-container focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer"
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span className="font-body-md text-body-md text-text-primary leading-snug">
            I confirm the recipient details are correct and authorize{' '}
            <strong className="text-primary font-semibold">VEMTAP</strong> to generate a personalized gift pass.
          </span>
        </label>
      </div>

      <div className="px-6 py-5 bg-surface-container-lowest flex flex-col gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          disabled={!agreed || state !== 'idle'}
          onClick={handleSend}
          className={`w-full h-[52px] rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg shadow-primary-container/25 ${
            !agreed ? 'bg-primary-container text-on-primary opacity-50 pointer-events-none' : ''
          } ${
            state === 'sent'
              ? 'bg-badge-discount-text text-on-primary shadow-none'
              : 'bg-primary-container text-on-primary hover:bg-primary'
          }`}
        >
          {state === 'sending' ? (
            <>
              <Icon name="progress_activity" className="text-[20px] animate-spin" />
              <span>Dispatching WhatsApp Pass...</span>
            </>
          ) : state === 'sent' ? (
            <>
              <Icon name="check_circle" filled className="text-[20px] text-on-primary" />
              <span>Pass Dispatched to {firstName}!</span>
            </>
          ) : (
            <>
              <span>Send Gift Voucher Pass Now</span>
              <span className="text-lg">🎁</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onEdit}
            className="font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary px-1 py-1 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Icon name="edit" className="text-[16px]" />
            <span>Edit Gift Details</span>
          </button>
          <div className="flex items-center gap-1 font-caption text-caption text-text-tertiary">
            <Icon name="lock" className="text-[14px] text-badge-discount-text" />
            <span>Encrypted Dispatch</span>
          </div>
        </div>

        <p className="font-caption text-caption text-text-tertiary text-center px-4 pt-1 leading-normal">
          Recipient will receive an instant WhatsApp message with an interactive pass link and offline-ready QR code.
        </p>
      </div>
    </DesktopModal>
  );
}
