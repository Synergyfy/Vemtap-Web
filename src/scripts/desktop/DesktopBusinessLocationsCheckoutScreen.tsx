import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { formatNaira, getLocationPricing, locationFeeAt, locationsFeeTotal } from '../locationPricing';

/**
 * Desktop checkout for additional business locations added from the business
 * dashboard (the ₦2,000-per-extra-location, one-time purchase).
 *
 * FRONTEND-ONLY: payment is simulated end to end — no gateway call, no real
 * charge. The sandbox switch previews both the successful and the
 * failed/cancelled outcomes. A location is only ever marked paid on the
 * simulated success path; otherwise the merchant retries or drops the unpaid
 * locations and exits back to the locations list.
 */

export interface CheckoutBranch {
  id: string;
  name: string;
  address: string;
  hours: string;
}

interface DesktopBusinessLocationsCheckoutScreenProps {
  businessName: string;
  primaryLocation?: { street: string };
  /** Additional locations awaiting payment — the primary location is never here. */
  pendingBranches: CheckoutBranch[];
  /** Additional locations already paid for in this run (shown as included). */
  paidCount?: number;
  onBack: () => void;
  /** Simulated payment succeeded — mark these ids paid and finish. */
  onPaid: (branchIds: string[]) => void;
  /** Give up on checkout: remove the unpaid locations and exit back to the list. */
  onRemovePendingAndExit: () => void;
}

type PaymentMethod = 'paystack' | 'virtual_account' | 'wallet';
type PayState = 'idle' | 'processing' | 'success' | 'failed' | 'cancelled';

const PAYMENT_OPTIONS: {
  key: PaymentMethod;
  icon: string;
  title: string;
  sub: string;
}[] = [
  {
    key: 'paystack',
    icon: 'credit_card',
    title: 'Paystack / Flutterwave',
    sub: 'Debit cards, bank transfer, USSD',
  },
  {
    key: 'virtual_account',
    icon: 'account_balance',
    title: 'Direct Bank Transfer',
    sub: 'Instant virtual account in checkout',
  },
  {
    key: 'wallet',
    icon: 'contactless',
    title: 'Apple Pay / Google Pay',
    sub: 'One-touch payment authorization',
  },
];

export function DesktopBusinessLocationsCheckoutScreen({
  businessName,
  primaryLocation,
  pendingBranches,
  paidCount = 0,
  onBack,
  onPaid,
  onRemovePendingAndExit,
}: DesktopBusinessLocationsCheckoutScreenProps) {
  const pricing = getLocationPricing();
  const [method, setMethod] = useState<PaymentMethod>('paystack');
  // Sandbox preview: which simulated result the mock gateway should return.
  const [simulatedOutcome, setSimulatedOutcome] = useState<'success' | 'declined'>('success');
  const [payState, setPayState] = useState<PayState>('idle');
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  // Pending locations sit after the free primary one (and any paid extras),
  // so admin-config free allowances still cover them.
  const pendingIndexes = pendingBranches.map((_, index) => 1 + paidCount + index);
  const pendingFees = pendingIndexes.map((index) => locationFeeAt(index, pricing));
  const totalDue = locationsFeeTotal(pendingIndexes, pricing);
  const needsPayment = totalDue > 0;
  const pendingIds = pendingBranches.map((branch) => branch.id);
  const label = businessName.trim() || 'Your Store';
  const busy = payState === 'processing';

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const handlePay = () => {
    if (busy) return;
    if (!needsPayment) {
      // Admin config made these free — nothing to simulate.
      setPayState('success');
      return;
    }
    setPayState('processing');
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setPayState(simulatedOutcome === 'success' ? 'success' : 'failed');
    }, 2400);
  };

  const handleCancelPayment = () => {
    clearTimer();
    setPayState('cancelled');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-8 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            className="w-10 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary transition-colors cursor-pointer disabled:opacity-40"
            disabled={busy}
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <span className="font-label-sm text-caption text-primary font-semibold uppercase tracking-wider">
            Add Location • Checkout
          </span>
        </div>
        <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
          Pay for Additional Locations
        </h1>
        <p className="font-body-md text-body-md text-text-secondary">
          Review your new locations and pay the one-time fee to activate them on your business profile.
        </p>
      </div>

      {/* Frontend demo notice — never claim a real charge was made. */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-badge-discount-bg border border-border-subtle">
        <Icon name="science" className="text-[18px] text-badge-discount-text flex-shrink-0 mt-0.5" />
        <p className="font-caption text-caption text-text-primary leading-relaxed">
          <span className="font-semibold">Simulated checkout (demo).</span> This preview does not process real
          payments and never charges a card. Use the sandbox switch below to preview a successful or declined
          payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Order summary */}
        <div className="bg-surface-canvas rounded-xl p-5 shadow-sm border border-surface-container flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Order Summary</h3>
            <span className="font-caption text-caption text-text-secondary">One-time payment</span>
          </div>

          <div className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                <Icon name="storefront" className="text-[19px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                  {label} (Main)
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {primaryLocation?.street || 'Primary business location'}
                </span>
              </div>
            </div>
            <span className="font-label-md text-label-md font-semibold text-badge-discount-text flex-shrink-0">
              Free
            </span>
          </div>

          {paidCount > 0 && (
            <div className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0">
                  <Icon name="check_circle" className="text-[19px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate">
                    {paidCount} additional location{paidCount > 1 ? 's' : ''} already paid
                  </span>
                  <span className="font-caption text-caption text-text-secondary">Included — nothing due</span>
                </div>
              </div>
              <span className="font-label-md text-label-md font-semibold text-text-tertiary">₦0</span>
            </div>
          )}

          {pendingBranches.map((branch, index) => (
            <div
              className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle/80"
              key={branch.id}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="add_location_alt" className="text-[19px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate">{branch.name}</span>
                  <span className="font-caption text-caption text-text-secondary truncate">{branch.address}</span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="font-label-md text-label-md font-semibold text-text-primary">
                  {formatNaira(pendingFees[index])}
                </span>
                <span className="font-caption text-caption text-text-tertiary">
                  {pendingFees[index] === 0 ? 'Free' : 'Due'}
                </span>
              </div>
            </div>
          ))}

          <div className="flex items-end justify-between pt-2">
            <div className="flex flex-col">
              <span className="font-heading-sm text-heading-sm text-text-primary">Total Due Today</span>
              <span className="font-caption text-caption text-text-secondary">
                {pendingBranches.length} additional location{pendingBranches.length > 1 ? 's' : ''} ·{' '}
                {formatNaira(pricing.pricePerAdditionalLocation)} each
              </span>
            </div>
            <span className="font-heading-lg text-heading-lg text-primary font-bold">{formatNaira(totalDue)}</span>
          </div>
        </div>

        {/* Payment method + sandbox */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary">Payment Method</h3>
              <span className="font-caption text-caption text-text-secondary">Secured by 256-bit SSL</span>
            </div>
            <div className="flex flex-col gap-2">
              {PAYMENT_OPTIONS.map((option) => {
                const active = option.key === method;
                return (
                  <button
                    className={`w-full text-left p-3.5 rounded-xl shadow-sm transition-all relative cursor-pointer ${
                      active ? 'bg-surface-tint-blue' : 'bg-surface-canvas hover:bg-surface-subtle'
                    }`}
                    disabled={busy || payState === 'success'}
                    key={option.key}
                    type="button"
                    onClick={() => setMethod(option.key)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg bg-surface-canvas flex items-center justify-center shadow-sm flex-shrink-0 ${
                            active ? 'text-primary' : 'text-text-secondary'
                          }`}
                        >
                          <Icon name={option.icon} className="text-[19px]" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-label-md text-label-md text-text-primary font-semibold block truncate">
                            {option.title}
                          </span>
                          <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                            {option.sub}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          active ? 'bg-primary' : 'bg-surface-container-high'
                        }`}
                      >
                        <Icon
                          name="check"
                          className={`text-[13px] ${active ? 'text-on-primary' : 'text-transparent'}`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-subtle border border-border-subtle">
            <div className="flex items-center gap-2">
              <Icon name="tune" className="text-[16px] text-text-secondary" />
              <span className="font-label-sm text-label-sm text-text-secondary font-semibold">
                Sandbox preview (demo only)
              </span>
            </div>
            <div className="flex gap-2">
              {(
                [
                  { key: 'success', label: 'Successful payment' },
                  { key: 'declined', label: 'Declined payment' },
                ] as const
              ).map((option) => {
                const active = option.key === simulatedOutcome;
                return (
                  <button
                    className={`flex-1 h-9 rounded-lg font-button-secondary text-button-secondary transition-all active:scale-[0.98] cursor-pointer ${
                      active
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-canvas text-text-secondary hover:bg-surface-container'
                    }`}
                    disabled={busy || payState === 'success'}
                    key={option.key}
                    type="button"
                    onClick={() => setSimulatedOutcome(option.key)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulated payment result panel */}
          {payState === 'success' && (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-canvas border border-badge-discount-text/40 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0">
                  <Icon name="check_circle" className="text-[21px]" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-heading-sm text-heading-sm text-text-primary">
                    Payment successful (simulated)
                  </span>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    {pendingBranches.length} additional location
                    {pendingBranches.length > 1 ? 's are' : ' is'} now ready to activate with your primary
                    location. No real charge was made — this is a frontend demo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(payState === 'failed' || payState === 'cancelled') && (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-canvas border border-badge-discount-text/40 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0">
                  <Icon name={payState === 'failed' ? 'error' : 'cancel'} className="text-[21px]" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-heading-sm text-heading-sm text-text-primary">
                    {payState === 'failed' ? 'Payment failed (simulated)' : 'Payment cancelled'}
                  </span>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    {payState === 'failed'
                      ? 'No charge was made and your new locations are still unpaid, so they have not been added.'
                      : 'The payment was cancelled before it completed. Your new locations are still unpaid.'}{' '}
                    Retry the payment, or remove the locations and go back to your location list.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="font-caption text-caption text-text-secondary text-center leading-relaxed -mt-4">
        One-time payment per additional location — not a subscription. Your primary location always stays
        free.
      </p>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80 -mx-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors disabled:opacity-40"
              disabled={busy}
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back</span>
            </button>
            {busy && (
              <button
                className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-badge-discount-text hover:bg-badge-discount-bg font-button-secondary text-button-secondary transition-colors"
                type="button"
                onClick={handleCancelPayment}
              >
                <Icon name="cancel" className="text-[16px]" />
                <span>Cancel payment</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            {payState === 'idle' && (
              <button
                className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all disabled:cursor-not-allowed"
                type="button"
                onClick={handlePay}
              >
                <Icon name="lock" className="text-[18px]" />
                <span>{needsPayment ? `Pay ${formatNaira(totalDue)} & Add Locations` : 'Confirm Additional Locations'}</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            )}
            {payState === 'processing' && (
              <span className="inline-flex items-center justify-center gap-space-xs bg-surface-container-high text-text-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary">
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Processing Payment…</span>
              </span>
            )}
            {payState === 'success' && (
              <button
                className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                type="button"
                onClick={() => onPaid(pendingIds)}
              >
                <span>Finish &amp; View My Locations</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            )}
            {(payState === 'failed' || payState === 'cancelled') && (
              <>
                <button
                  className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
                  type="button"
                  onClick={onRemovePendingAndExit}
                >
                  <Icon name="location_off" className="text-[16px]" />
                  <span>Remove Locations &amp; Go Back</span>
                </button>
                <button
                  className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                  type="button"
                  onClick={() => setPayState('idle')}
                >
                  <Icon name="refresh" className="text-[18px]" />
                  <span>Try Payment Again</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
