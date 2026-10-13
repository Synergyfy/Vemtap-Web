import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { SubscriptionHeader } from './SubscriptionHeader';

interface SubscriptionPaymentScreenProps {
  onBack: () => void;
  onPaid: () => void;
}

type PaymentMethod = 'paystack' | 'virtual_account' | 'digital_wallet';

const PAYMENT_OPTIONS: {
  key: PaymentMethod;
  icon: string;
  title: string;
  sub: string;
  badge?: string;
}[] = [
  {
    key: 'paystack',
    icon: 'credit_card',
    title: 'Paystack / Flutterwave',
    sub: 'Debit Cards, Bank Transfer, USSD',
    badge: 'Fast',
  },
  {
    key: 'virtual_account',
    icon: 'account_balance',
    title: 'Direct Bank Transfer',
    sub: 'Instant virtual account generated in checkout',
  },
  {
    key: 'digital_wallet',
    icon: 'contactless',
    title: 'Apple Pay / Google Pay',
    sub: 'One-touch biometric payment authorization',
  },
];

const PLAN_HIGHLIGHTS = [
  'Multiple business locations included',
  'Unlimited products & services catalog',
  'Hyperlocal deal publishing & broadcast',
  'Customer direct messaging & fast orders',
  'Business analytics & loyalty rewards suite',
];

const STORE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAIBMNslXwC_lzD-mEs8J_Y2EBjgCR10rgvgK412xQyz6e1FjbSHVvz9MvfUDmlHky92VKTbZO88_vDAjjBRXMeq0J2Kwo5mxSLE7JvonE5bIPibLLoVq4mNAOPgNywJIqOFPlBp0bDhLnlQJ842No6L0jovywxv2jT7LLXzrj3wJeB03da5PocWwz5UEWPpb7sRYoDDOeo-yF99cmG5U9xgB03O1sTmRfUjqU1aNKVkwtl4dS-1wNV-w';
const STORE_ALT =
  'A smiling modern Nigerian boutique owner arranging products behind a contemporary sunlit retail counter with a card terminal and branded shopping bags, captured in crisp warm commercial photography with clean natural light.';

export function SubscriptionPaymentScreen({ onBack, onPaid }: SubscriptionPaymentScreenProps) {
  const [method, setMethod] = useState<PaymentMethod>('paystack');
  const [paying, setPaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const handlePay = () => {
    if (paying) return;
    setPaying(true);
    timer.current = window.setTimeout(() => onPaid(), 2400);
  };

  return (
    <AppScreen surface="bg-surface-canvas">
      <SubscriptionHeader title="Payment Method" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-2xl">
        {/* Top Visual Status Header */}
        <div className="pt-space-md pb-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <Icon name="bolt" filled className="text-[16px]" />
            </span>
            <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide uppercase">
              Merchant Tier
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-badge-discount-bg">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-caption text-caption text-badge-discount-text font-semibold">Zero Setup Fee</span>
          </div>
        </div>

        {/* Heading Block */}
        <div className="mb-space-lg">
          <h2 className="font-heading-md text-heading-md text-text-primary font-bold tracking-tight">
            Continue with VEMTAP Growth
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Activate your monthly subscription to keep your business running smoothly.
          </p>
        </div>

        {/* Plan Summary Highlight Card */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-subtle shadow-sm p-4 mb-space-md">
          <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-space-xs">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold mb-1.5">
                  <Icon name="verified" filled className="text-[13px]" />
                  POPULAR FOR RETAIL
                </div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">VEMTAP Growth</h3>
              </div>
              <div className="text-right">
                <div className="font-heading-md text-heading-md text-primary font-bold">₦5,000</div>
                <span className="font-caption text-caption text-text-secondary">/ month</span>
              </div>
            </div>
            <p className="font-label-sm text-label-sm text-text-secondary mb-space-sm flex items-center gap-1.5">
              <Icon name="autorenew" className="text-text-tertiary text-[14px]" />
              Monthly subscription • Cancel anytime
            </p>
            <div className="pt-space-sm mt-space-xs space-y-2 bg-surface-canvas rounded-xl p-3 shadow-sm">
              {PLAN_HIGHLIGHTS.map((feature) => (
                <div className="flex items-center gap-2.5" key={feature}>
                  <div className="w-5 h-5 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0">
                    <Icon name="check" className="text-[13px] text-badge-discount-text font-bold" />
                  </div>
                  <span className="font-label-sm text-label-sm text-text-primary">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Storefront Snapshot Preview */}
        <div className="mb-space-md p-3.5 rounded-2xl bg-surface-container-low flex items-center gap-3">
          <img
            alt={STORE_ALT}
            className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0"
            src={STORE_IMG}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-primary">
              <Icon name="storefront" filled className="text-[14px]" />
              <span className="font-caption text-caption font-semibold uppercase tracking-wider">Store Ready</span>
            </div>
            <p className="font-heading-sm text-heading-sm text-text-primary truncate font-semibold">
              Your storefront goes live
            </p>
            <p className="font-caption text-caption text-text-secondary">
              Direct customer discovery starts instantly upon activation.
            </p>
          </div>
        </div>

        {/* Payment Selection Section */}
        <div className="mb-space-md">
          <div className="flex items-center justify-between mb-space-xs">
            <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary">Payment Method</h3>
            <span className="font-caption text-caption text-primary font-medium">Secured by 256-bit SSL</span>
          </div>
          <div className="space-y-2" id="payment-options-group">
            {PAYMENT_OPTIONS.map((option) => {
              const active = option.key === method;
              return (
                <button
                  key={option.key}
                  type="button"
                  className={`w-full text-left p-3.5 rounded-2xl shadow-sm transition-all duration-200 relative ${
                    active ? 'bg-surface-tint-blue overflow-hidden' : 'bg-surface-subtle'
                  }`}
                  onClick={() => setMethod(option.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl bg-surface-canvas flex items-center justify-center shadow-sm flex-shrink-0 ${
                          active ? 'text-primary' : 'text-text-secondary'
                        }`}
                      >
                        <Icon name={option.icon} className="text-[20px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                            {option.title}
                          </span>
                          {option.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold">
                              {option.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-caption text-caption text-text-secondary truncate mt-0.5">{option.sub}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2 transition-colors ${
                        active ? 'bg-primary' : 'bg-surface-container-high'
                      }`}
                    >
                      <Icon
                        name="check"
                        className={`text-[14px] transition-colors ${active ? 'text-on-primary' : 'text-transparent'}`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Notice Card */}
        <div className="p-3.5 rounded-2xl bg-surface-subtle shadow-sm mb-space-md flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="lock" className="text-[16px]" />
          </div>
          <div className="min-w-0">
            <p className="font-label-sm text-label-sm text-text-primary font-semibold">Bank-grade Security</p>
            <p className="font-caption text-caption text-text-secondary mt-0.5 leading-relaxed">
              Payments are securely processed through regulated PCI-DSS compliant gateways. VEMTAP never stores your
              card number.
            </p>
          </div>
        </div>

        {/* Billing Summary Table */}
        <div className="rounded-2xl bg-surface-subtle shadow-sm p-4 mb-space-md">
          <h4 className="font-label-md text-label-md text-text-primary font-semibold mb-2">Billing Summary</h4>
          <div className="space-y-1.5 mb-space-sm">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-label-sm text-text-secondary">Growth Subscription (1 mo)</span>
              <span className="font-label-sm text-label-sm font-medium text-text-primary">₦5,000</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-text-secondary">VAT (7.5%)</span>
                <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                  Waived
                </span>
              </div>
              <span className="font-label-sm text-label-sm font-medium text-badge-discount-text">₦0</span>
            </div>
          </div>
          <div className="pt-space-xs bg-surface-canvas rounded-xl p-3 flex justify-between items-baseline shadow-sm">
            <div>
              <span className="font-heading-sm text-heading-sm font-semibold text-text-primary">Total Due Today</span>
              <span className="block font-caption text-caption text-text-secondary">Instant activation</span>
            </div>
            <span className="font-heading-md text-heading-md text-primary font-bold">₦5,000</span>
          </div>
        </div>

        {/* Action Deck */}
        <div className="space-y-space-sm">
          <button
            className="w-full h-11 rounded-2xl bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            id="subscribe-cta-btn"
            type="button"
            disabled={paying}
            onClick={handlePay}
          >
            {paying ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-[20px]" />
                <span>Preparing Secure Checkout...</span>
              </>
            ) : (
              <>
                <span>Pay ₦5,000 & Activate Growth</span>
                <Icon name="arrow_forward" className="text-[18px] transition-transform" />
              </>
            )}
          </button>
          <div className="text-center px-space-xs space-y-1">
            <p className="font-caption text-caption text-text-secondary leading-snug">
              Your subscription renews monthly at ₦5,000 until cancelled in settings.
            </p>
            <div>
              <a
                className="font-caption text-caption text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                href="#terms"
              >
                Terms & Subscription Policy
                <Icon name="open_in_new" className="text-[12px]" />
              </a>
            </div>
          </div>
        </div>

        {/* Success Toast Modal Simulation */}
        {paying && (
          <div className="fixed inset-x-6 bottom-8 z-50">
            <div className="rounded-2xl bg-surface-canvas text-text-primary p-4 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0">
                <Icon name="check_circle" className="text-[24px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label-md text-label-md font-semibold text-text-primary">
                  Connecting to Secure Gateway...
                </p>
                <p className="font-caption text-caption text-text-secondary">Routing to checkout channel.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppScreen>
  );
}
