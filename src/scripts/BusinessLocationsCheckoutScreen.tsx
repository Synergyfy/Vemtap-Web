import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import {
  formatNaira,
  getLocationPricing,
  locationFeeAt,
  locationsFeeTotal,
} from './locationPricing';

/**
 * Checkout for additional business locations added from the business
 * dashboard (the ₦2,000-per-extra-location, one-time purchase).
 *
 * FRONTEND-ONLY: the payment below is simulated end to end — no gateway call
 * is made and no real money moves. The sandbox outcome switch exists so both
 * the successful and the failed/cancelled paths can be previewed. The location
 * must never be treated as paid unless the simulated success path completes;
 * on failure or cancellation the business can retry or drop the unpaid
 * location and exit back to its locations list.
 */

export interface CheckoutLocation {
  id: string;
  name: string;
  subtitle: string;
  address: string;
  hours: string;
}

interface BusinessLocationsCheckoutScreenProps {
  businessName: string;
  primaryLocation?: { street: string };
  /** Additional locations awaiting payment. The primary location is never here. */
  pendingBranches: CheckoutLocation[];
  /** Additional locations already paid for in this setup run (shown as included). */
  paidCount?: number;
  onBack: () => void;
  /** Simulated payment succeeded — mark these locations paid and finish. */
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

export function BusinessLocationsCheckoutScreen({
  businessName,
  primaryLocation,
  pendingBranches,
  paidCount = 0,
  onBack,
  onPaid,
  onRemovePendingAndExit,
}: BusinessLocationsCheckoutScreenProps) {
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
  // so their position in the full location list decides whether admin-config
  // free allowances still cover them.
  const pendingIndexes = pendingBranches.map((_, index) => 1 + paidCount + index);
  const pendingFees = pendingIndexes.map((index) => locationFeeAt(index, pricing));
  const totalDue = locationsFeeTotal(pendingIndexes, pricing);
  const needsPayment = totalDue > 0;
  const pendingIds = pendingBranches.map((branch) => branch.id);
  const label = businessName.trim() || 'Your Store';

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const handlePay = () => {
    if (payState === 'processing') return;
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

  const handleRetry = () => setPayState('idle');

  return (
    <AppScreen surface="bg-surface-canvas">
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all disabled:opacity-40"
            disabled={payState === 'processing'}
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[22px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1">
            <h1 className="font-label-sm text-label-sm text-text-secondary line-clamp-1">
              Additional Locations Checkout
            </h1>
          </div>
          <div className="w-11 h-11" />
        </div>
      </header>

      <div className="flex flex-col w-full px-margin pt-space-md pb-space-2xl gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs bg-surface-container-high px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-sm text-label-sm text-secondary font-medium">Add Location</span>
            </div>
            <span className="font-label-sm text-label-sm font-semibold text-primary">Checkout</span>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mt-space-2xs">
            Pay for Additional Locations
          </h2>
          <p className="font-body-md text-body-md text-text-secondary">
            Review your new locations and pay the one-time fee to activate them on your business profile.
          </p>
        </div>

        {/* Frontend demo notice — never claim a real charge was made. */}
        <div className="flex items-start gap-space-sm p-3 rounded-xl bg-badge-discount-bg border border-border-subtle">
          <Icon name="science" className="text-[18px] text-badge-discount-text flex-shrink-0 mt-0.5" />
          <p className="font-caption text-caption text-text-primary leading-relaxed">
            <span className="font-semibold">Simulated checkout (demo).</span> This preview does not process
            real payments and never charges a card. Use the sandbox switch below to preview a successful or
            declined payment.
          </p>
        </div>

        {/* Order summary */}
        <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-sm border border-border-subtle">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Order Summary</h3>
            <span className="font-caption text-caption text-text-secondary">One-time payment</span>
          </div>

          <div className="flex items-center justify-between gap-space-sm py-space-xs border-b border-border-subtle/80">
            <div className="flex items-center gap-space-sm min-w-0">
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
            <div className="flex items-center justify-between gap-space-sm py-space-xs border-b border-border-subtle/80">
              <div className="flex items-center gap-space-sm min-w-0">
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
              className="flex items-center justify-between gap-space-sm py-space-xs border-b border-border-subtle/80"
              key={branch.id}
            >
              <div className="flex items-center gap-space-sm min-w-0">
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

          <div className="flex items-center justify-between pt-space-xs">
            <div className="flex flex-col">
              <span className="font-heading-sm text-heading-sm text-text-primary">Total Due Today</span>
              <span className="font-caption text-caption text-text-secondary">
                {pendingBranches.length} additional location{pendingBranches.length > 1 ? 's' : ''} ·{' '}
                {formatNaira(pricing.pricePerAdditionalLocation)} each
              </span>
            </div>
            <span className="font-heading-lg text-heading-lg text-primary font-bold">
              {formatNaira(totalDue)}
            </span>
          </div>
        </div>

        {/* Payment method */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary">Payment Method</h3>
            <span className="font-caption text-caption text-text-secondary">Secured by 256-bit SSL</span>
          </div>
          <div className="flex flex-col gap-space-xs">
            {PAYMENT_OPTIONS.map((option) => {
              const active = option.key === method;
              return (
                <button
                  className={`w-full text-left p-3 rounded-xl shadow-sm transition-all relative ${
                    active ? 'bg-surface-tint-blue' : 'bg-surface-container-lowest'
                  }`}
                  disabled={payState === 'processing' || payState === 'success'}
                  key={option.key}
                  type="button"
                  onClick={() => setMethod(option.key)}
                >
                  <div className="flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm min-w-0">
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

        {/* Sandbox outcome — frontend demo only */}
        <div className="flex flex-col gap-space-xs p-3 rounded-xl bg-surface-subtle border border-border-subtle">
          <div className="flex items-center gap-space-xs">
            <Icon name="tune" className="text-[16px] text-text-secondary" />
            <span className="font-label-sm text-label-sm text-text-secondary font-semibold">
              Sandbox preview (demo only)
            </span>
          </div>
          <div className="flex gap-space-xs mt-space-2xs">
            {(
              [
                { key: 'success', label: 'Successful payment' },
                { key: 'declined', label: 'Declined payment' },
              ] as const
            ).map((option) => {
              const active = option.key === simulatedOutcome;
              return (
                <button
                  className={`flex-1 h-9 rounded-lg font-button-secondary text-button-secondary transition-all active:scale-[0.98] ${
                    active ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest text-text-secondary'
                  }`}
                  disabled={payState === 'processing' || payState === 'success'}
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

        {/* Action deck + simulated payment states */}
        <div className="flex flex-col gap-space-sm">
          {payState === 'idle' && (
            <>
              <button
                className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary rounded-xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] flex items-center justify-center gap-2 transition-all"
                type="button"
                onClick={handlePay}
              >
                <Icon name="lock" className="text-[18px]" />
                <span>
                  {needsPayment ? `Pay ${formatNaira(totalDue)} & Add Locations` : 'Confirm Additional Locations'}
                </span>
                <Icon name="arrow_forward" className="text-[19px]" />
              </button>
              <p className="font-caption text-caption text-text-secondary text-center leading-relaxed">
                One-time payment — not a subscription. Your primary location stays free.
              </p>
            </>
          )}

          {payState === 'processing' && (
            <>
              <button
                className="w-full h-[52px] bg-surface-container-high text-text-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 transition-all"
                disabled
                type="button"
              >
                <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Processing Payment...</span>
              </button>
              <button
                className="w-full h-10 text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors"
                type="button"
                onClick={handleCancelPayment}
              >
                Cancel payment
              </button>
            </>
          )}

          {payState === 'success' && (
            <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest border border-badge-discount-text/40 shadow-sm">
              <div className="flex items-start gap-space-sm">
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
              <button
                className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary rounded-xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] flex items-center justify-center gap-2 transition-all"
                type="button"
                onClick={() => onPaid(pendingIds)}
              >
                <span>Finish &amp; View My Locations</span>
                <Icon name="arrow_forward" className="text-[19px]" />
              </button>
            </div>
          )}

          {(payState === 'failed' || payState === 'cancelled') && (
            <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest border border-badge-discount-text/40 shadow-sm">
              <div className="flex items-start gap-space-sm">
                <div className="w-9 h-9 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0">
                  <Icon name={payState === 'failed' ? 'error' : 'cancel'} className="text-[21px]" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-heading-sm text-heading-sm text-text-primary">
                    {payState === 'failed'
                      ? 'Payment failed (simulated)'
                      : 'Payment cancelled'}
                  </span>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    {payState === 'failed'
                      ? 'No charge was made and your new locations are still unpaid, so they have not been added.'
                      : 'The payment was cancelled before it completed. Your new locations are still unpaid.'}{' '}
                    Retry the payment, or remove the locations and go back to your location list.
                  </p>
                </div>
              </div>
              <button
                className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary rounded-xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] flex items-center justify-center gap-2 transition-all"
                type="button"
                onClick={handleRetry}
              >
                <Icon name="refresh" className="text-[19px]" />
                <span>Try Payment Again</span>
              </button>
              <button
                className="w-full h-11 bg-surface-container hover:bg-surface-container-high active:scale-[0.98] text-text-primary rounded-xl font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-1.5"
                type="button"
                onClick={onRemovePendingAndExit}
              >
                <Icon name="location_off" className="text-[17px]" />
                <span>Remove Locations &amp; Go Back</span>
              </button>
            </div>
          )}
        </div>

        <p className="font-caption text-caption text-text-secondary text-center leading-relaxed">
          One-time payment per additional location — your primary location always stays free.
        </p>
      </div>
    </AppScreen>
  );
}
