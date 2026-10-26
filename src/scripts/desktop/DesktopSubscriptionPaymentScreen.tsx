import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { hasApiConfig } from '../../services/api/client';
import { usePricePreview, useSubscriptionCheckout, useSubscriptionPlans } from '../../hooks/business/useSubscription';
import { featuredPlan } from '../subscriptionLive';
import { formatNaira } from '../../utils/format';
import { SubscriptionChrome } from './SubscriptionChrome';

interface DesktopSubscriptionPaymentScreenProps {
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

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from billing settings and Growth stays active until the period ends.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'Zero. Setup is fully absorbed — you only pay the ₦5,000 monthly plan.',
  },
  {
    q: 'Which cards are supported?',
    a: 'All Nigerian Visa, Mastercard and Verve cards via Paystack / Flutterwave.',
  },
  {
    q: 'Do I get an invoice?',
    a: 'Every payment generates a downloadable VAT invoice in your billing history.',
  },
];

const STORE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAIBMNslXwC_lzD-mEs8J_Y2EBjgCR10rgvgK412xQyz6e1FjbSHVvz9MvfUDmlHky92VKTbZO88_vDAjjBRXMeq0J2Kwo5mxSLE7JvonE5bIPibLLoVq4mNAOPgNywJIqOFPlBp0bDhLnlQJ842No6L0jovywxv2jT7LLXzrj3wJeB03da5PocWwz5UEWPpb7sRYoDDOeo-yF99cmG5U9xgB03O1sTmRfUjqU1aNKVkwtl4dS-1wNV-w';
const STORE_ALT =
  'A smiling modern Nigerian boutique owner arranging products behind a contemporary sunlit retail counter with a card terminal and branded shopping bags, captured in crisp warm commercial photography with clean natural light.';
const FOLAKE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCf1bbGzmyknuRv6JJjZob16_tE3Rl83Fln41x6CqCXX8OVvYrxsHkmLDBBx89eBWIpmX18hXeGHaxIYD6ydAk_ZlxHQE82eaGn76pyXv_pBIyg66F46WT1wkBg-MKWxOoOgGYeT15wOcB3A7r-jL4Lx64FAulOZQLYvRmn782nf7chBB0qof3mzi8yHrjHtslTRpb2k8P1NF36d8VSt8rIvZsuX_0QzeVoctjvJugy4flJq-BEgPmOwg';
const FOLAKE_ALT =
  'Portrait of a confident Nigerian woman entrepreneur smiling warmly in her modern cafe, soft natural lighting, professional lifestyle photography.';

export function DesktopSubscriptionPaymentScreen({ onBack, onPaid }: DesktopSubscriptionPaymentScreenProps) {
  const [method, setMethod] = useState<PaymentMethod>('paystack');
  const [paying, setPaying] = useState(false);
  const timer = useRef<number | null>(null);
  const live = hasApiConfig();
  const plans = useSubscriptionPlans();
  const featured = featuredPlan(plans.data ?? []);
  const preview = usePricePreview(featured?.id, 'monthly');
  const checkout = useSubscriptionCheckout();

  // Live: the API preview drives the billing summary; demo keeps the scripted
  // Growth figures and the simulated gateway timer.
  const planName = featured?.name ?? 'Growth';
  const subtotal = preview.data ? Number(preview.data.subtotal) || 0 : null;
  const tax = preview.data ? Number(preview.data.taxAmount) || 0 : null;
  const total = preview.data ? Number(preview.data.total) || 0 : null;
  const totalText = total !== null ? `${formatNaira(total)}.00` : '₦5,000.00';

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const handlePay = () => {
    if (paying) return;
    if (live) {
      if (!featured) return;
      setPaying(true);
      checkout.mutate(
        { planId: featured.id, billingPeriod: 'monthly' },
        {
          onSuccess: (result) => {
            // Without a hosted checkout URL there is nothing to redirect to —
            // continue the flow as if paid (the backend activates on webhook).
            if (!result.authorization_url) onPaid();
          },
          onError: () => setPaying(false),
        },
      );
      return;
    }
    setPaying(true);
    timer.current = window.setTimeout(() => onPaid(), 2400);
  };

  return (
    <SubscriptionChrome onBrand={onBack} activeNav="billing" breadcrumb="Renew Your Plan">
      <div className="max-w-6xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-lg">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <Icon name="bolt" filled className="text-[16px]" />
            </span>
            <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide uppercase">
              Merchant Tier
            </span>
          </div>
          <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-caption text-caption text-badge-discount-text font-semibold">Zero Setup Fee</span>
          </div>
        </div>

        <div>
          <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
            Continue with VEMTAP {planName}
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
            Activate your monthly subscription to keep your business running smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm flex items-start gap-space-md">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                <img alt={STORE_ALT} className="w-full h-full object-cover" src={STORE_IMG} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">VEMTAP {planName}</h2>
                  <span className="px-space-xs py-space-2xs rounded-full bg-primary-container text-on-primary-container font-caption text-caption font-semibold">
                    OFFICIAL PLAN
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-space-2xs mb-space-xs">
                  Monthly subscription • Renews automatically
                </p>
                <div className="flex flex-col gap-space-2xs">
                  {PLAN_HIGHLIGHTS.map((item) => (
                    <div key={item} className="flex items-center gap-space-2xs">
                      <Icon name="check_circle" filled className="text-badge-discount-text text-[15px]" />
                      <span className="font-label-sm text-label-sm text-text-primary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-surface-canvas p-space-lg shadow-sm border border-border-subtle/60">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">Payment Gateway</h3>
              <div className="flex flex-col gap-space-xs">
                {PAYMENT_OPTIONS.map((option) => {
                  const selected = method === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setMethod(option.key)}
                      className={`w-full flex items-center gap-space-sm p-space-sm rounded-xl text-left transition-all ${
                        selected
                          ? 'bg-primary-container/25 border-2 border-primary-container shadow-sm'
                          : 'bg-surface-subtle border-2 border-transparent hover:bg-surface-container-low'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          selected ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-text-secondary'
                        }`}
                      >
                        <Icon name={option.icon} className="text-[20px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-md text-label-md text-text-primary font-semibold">
                            {option.title}
                          </span>
                          {option.badge && (
                            <span className="px-space-2xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                              {option.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-caption text-caption text-text-secondary mt-space-2xs">{option.sub}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? 'border-primary-container' : 'border-border-subtle'
                        }`}
                      >
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="flex items-start gap-space-sm rounded-xl bg-surface-tint-blue p-space-md shadow-sm">
              <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <Icon name="verified_user" filled className="text-primary text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Bank-grade security
                </span>
                <p className="font-caption text-caption text-text-secondary mt-space-2xs leading-relaxed">
                  Payments are routed through PCI-DSS Level 1 certified gateways. VEMTAP never stores your card
                  credentials. NDPR &amp; ISO/IEC 27001 compliant end-to-end.
                </p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-space-lg">
            <section className="rounded-xl bg-surface-subtle p-space-lg shadow-md">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">Billing Summary</h3>
              <div className="flex flex-col gap-space-xs">
                {[
                  { label: 'Plan', value: `VEMTAP ${planName} (Monthly)` },
                  { label: 'Subtotal', value: subtotal !== null ? `${formatNaira(subtotal)}.00` : '₦5,000.00' },
                  { label: 'Setup fee', value: 'Waived' },
                  {
                    label: preview.data?.taxRule?.rate ? `VAT (${preview.data.taxRule.rate}%)` : 'VAT',
                    value: tax !== null ? (tax ? formatNaira(tax) : 'Waived') : 'Absorbed by VEMTAP',
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-space-2xs">
                    <span className="font-caption text-caption text-text-secondary">{row.label}</span>
                    <span className="font-label-sm text-label-sm text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-space-sm pt-space-sm border-t border-border-subtle flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Total Due Today</span>
                <span className="font-heading-md text-heading-md text-text-primary font-bold">{totalText}</span>
              </div>
              <button
                type="button"
                disabled={paying}
                onClick={handlePay}
                className={`mt-space-md w-full h-11 rounded-xl font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all ${
                  paying ? 'bg-primary/80 text-on-primary' : 'bg-primary-container text-on-primary hover:bg-primary'
                }`}
              >
                {paying ? (
                  <>
                    <Icon name="progress_activity" className="animate-spin text-[20px]" />
                    <span>Routing to Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <Icon name="lock" className="text-[18px]" />
                    <span>
                      Activate {planName} — {totalText}
                    </span>
                  </>
                )}
              </button>
              <p className="text-center font-caption text-caption text-text-tertiary mt-space-xs">
                Encrypted checkout • Cancel anytime
              </p>
            </section>

            <section className="rounded-xl bg-surface-canvas p-space-md shadow-sm border border-border-subtle/60 flex items-start gap-space-sm">
              <img
                alt={FOLAKE_ALT}
                className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
                src={FOLAKE_IMG}
              />
              <div className="flex flex-col">
                <p className="font-label-sm text-label-sm text-text-primary leading-snug">
                  “Growth paid for itself in the first week. The QR desk alone doubled our lunch rush.”
                </p>
                <span className="font-caption text-caption text-text-secondary mt-space-2xs">
                  Folake Adebayo — Koffee &amp; Co. Roasters
                </span>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl bg-surface-canvas p-space-sm shadow-sm border border-border-subtle/60 flex flex-col gap-space-2xs"
                >
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">{faq.q}</span>
                  <span className="font-caption text-caption text-text-secondary leading-relaxed">{faq.a}</span>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </SubscriptionChrome>
  );
}
