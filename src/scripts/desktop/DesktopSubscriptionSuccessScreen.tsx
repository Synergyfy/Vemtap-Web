import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { SubscriptionChrome } from './SubscriptionChrome';
import { downloadCsv } from '../../utils/exportCsv';
import { printKvTable, printReport } from '../../utils/printReport';
import { hasApiConfig } from '../../services/api/client';
import {
  useActiveSubscription,
  useBillingHistory,
  usePaymentMethod,
  useSubscriptionPlans,
} from '../../hooks/business/useSubscription';
import { featuredPlan, planPriceLine, renewalDate } from '../subscriptionLive';
import { formatNaira } from '../../utils/format';

interface DesktopSubscriptionSuccessScreenProps {
  onGoDashboard: () => void;
  onExploreFeatures: () => void;
}

const RECEIPT_ROWS = [
  { label: 'Transaction ID', value: 'VT-SUB-982410', copy: true },
  { label: 'Business Locations', value: 'Apo & Wuse II' },
  { label: 'Payment Date', value: 'Today, Oct 18, 2024' },
  { label: 'Next Billing Date', value: 'Nov 18, 2024' },
];

const UNLOCKED_BENEFITS = [
  {
    title: 'Verified storefront active on nearby feeds',
    body: 'Visible to shoppers within 5km of Apo & Wuse II.',
  },
  {
    title: 'Unlimited deal creation & QR tap codes live',
    body: 'One-tap redemption ready for counter checkout.',
  },
  {
    title: 'Customer direct messaging & orders unlocked',
    body: 'Accept real-time inquiries and immediate orders.',
  },
];

const LIFT_BARS = [
  { label: 'Impressions', free: 20, growth: 100 },
  { label: 'Deal claims', free: 15, growth: 85 },
  { label: 'Messages', free: 25, growth: 90 },
  { label: 'Walk-ins', free: 18, growth: 78 },
];

const STORE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBBS6f2StSn5jzvi7cW3Zwy6DxTkVU0VLWtEPEVLiBG8HnHEzNeN60vmytS1VD4pxHvNCrBXaztDntxLRpZsNGWmmV3aJMvDc64k2CRbcWH-fNRKZnC3T2yjxa640OuMxxpzOcI0nio10-A1grk9jj-C24CzgiGEk4836K1rSy3JpAymebH-FYW9z_X6ohGAyTGwGwVppNAiYGaSCHn4wRKAjc9g8jgpI1mnj7gUXranQWd-6PngMaDbQ';
const STORE_ALT =
  'A modern stylish boutique storefront in Abuja with clean glass architecture, warm evening ambient lighting, and subtle blue branding accents reflecting modern retail elegance.';

export function DesktopSubscriptionSuccessScreen({
  onGoDashboard,
  onExploreFeatures,
}: DesktopSubscriptionSuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const live = hasApiConfig();
  const subscription = useActiveSubscription();
  const plans = useSubscriptionPlans();
  const billing = useBillingHistory();
  const payment = usePaymentMethod();

  // Live: the newest invoice + active subscription drive the receipt; demo
  // keeps the scripted Growth receipt.
  const sub = subscription.data ?? null;
  const featured = featuredPlan(plans.data ?? []);
  const planName = sub?.plan?.name ?? featured?.name ?? 'Growth';
  const latest = (billing.data ?? [])[0] ?? null;
  const priceLine = featured ? planPriceLine(featured, sub?.billingPeriod ?? 'monthly') : null;
  const paidText = latest ? formatNaira(Number(latest.amount) || 0) : priceLine ? priceLine.split(' / ')[0] : '₦5,000';
  const paidTotalText = latest ? `${paidText}.00` : '₦5,000.00';
  const card = live && payment.data?.hasCard ? payment.data.card : null;
  const receiptRows = live
    ? [
        { label: 'Transaction ID', value: latest?.reference ?? '—', copy: true },
        { label: 'Payment Date', value: latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today' },
        { label: 'Next Billing Date', value: renewalDate(sub?.endDate) ?? '—' },
      ]
    : RECEIPT_ROWS;
  const invoiceRef = live ? (latest?.reference ?? 'VT-SUB-PENDING') : 'VT-SUB-982410';

  const handleCopy = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleDownloadInvoice = () => {
    downloadCsv(
      `vemtap-subscription-invoice-${invoiceRef}.csv`,
      ['Field', 'Value'],
      [
        ...receiptRows.map((row) => [row.label, row.value]),
        ['Amount Paid', paidTotalText],
        ['Plan', `VEMTAP ${planName}`],
        [
          'Payment method',
          live ? (card ? `${card.brand ?? 'Card'} •••• ${card.last4}` : 'Card on file') : 'Mastercard •••• 4128',
        ],
      ],
    );
    printReport(
      `VEMTAP Subscription Invoice — ${invoiceRef}`,
      `${printKvTable('Invoice', receiptRows.map((row) => [row.label, row.value] as [string, string]))}
       ${printKvTable('Line items', [
         live
           ? [`VEMTAP ${planName} plan — subscription`, paidText]
           : ['VEMTAP Growth plan — monthly subscription', '₦4,651.16'],
         live ? ['VAT', 'included'] : ['VAT (7.5%)', '₦348.84'],
         ['Amount paid', paidTotalText],
       ])}
       <p class="foot">A CSV copy of this invoice downloaded alongside the PDF.</p>`,
    );
  };

  return (
    <SubscriptionChrome activeNav="billing" breadcrumb="Payment Confirmed">
      <div className="max-w-6xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-badge-discount-bg/40 via-surface-subtle to-surface-canvas shadow-sm">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/5 pointer-events-none blur-2xl" />
          <div className="relative z-10 p-space-xl flex flex-col items-center text-center gap-space-sm">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full bg-badge-discount-bg animate-ping opacity-25" />
              <div className="relative w-16 h-16 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-lg shadow-badge-discount-text/10">
                <div className="w-11 h-11 rounded-full bg-badge-discount-text flex items-center justify-center text-surface-canvas shadow-inner">
                  <Icon name="check" filled className="text-[26px]" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-surface-canvas shadow-sm">
                <Icon name="verified" filled className="text-[12px]" />
              </div>
            </div>
            <span className="px-space-sm py-space-2xs rounded-full bg-surface-container text-primary font-caption text-caption uppercase tracking-wider font-semibold">
              Payment Successful
            </span>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              You're now on VEMTAP {planName}
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary max-w-lg">
              Your business is active and ready to grow with VEMTAP.
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-surface-subtle p-space-md shadow-sm flex items-center gap-space-md">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-container">
            <img alt={STORE_ALT} className="w-full h-full object-cover" src={STORE_IMG} />
            <div className="absolute bottom-0 inset-x-0 h-3 bg-gradient-to-t from-text-primary/70 to-transparent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-heading-sm text-heading-sm text-text-primary truncate">Urban Grill &amp; Bistro</span>
              <Icon name="verified" filled className="text-primary text-[16px]" />
            </div>
            <span className="font-caption text-caption text-badge-discount-text font-semibold">
              Storefront status: LIVE &amp; GROWING
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
            <Icon name="trending_up" className="text-[15px]" />
            Growth Active
          </span>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
          <section className="rounded-xl bg-surface-canvas p-space-lg shadow-sm border border-border-subtle/60">
            <div className="flex items-center justify-between mb-space-sm">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Receipt</h2>
              <div className="flex items-center gap-space-xs">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-subtle text-text-secondary hover:text-primary font-caption text-caption transition-colors"
                >
                  <Icon name={copied ? 'check' : 'content_copy'} className="text-[14px]" />
                  {copied ? 'Copied' : 'Copy ID'}
                </button>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-border-subtle/60">
              {receiptRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-space-xs">
                  <span className="font-caption text-caption text-text-secondary">{row.label}</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-space-sm pt-space-sm border-t border-border-subtle flex items-center justify-between">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Amount Paid</span>
              <span className="font-heading-md text-heading-md text-text-primary font-bold">{paidTotalText}</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="mt-space-md w-full h-11 rounded-xl bg-surface-tint-blue text-primary-container font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all"
            >
              <Icon name="download" className="text-[18px]" />
              <span>Download Invoice</span>
            </button>
          </section>

          <div className="flex flex-col gap-space-lg">
            <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm">
              <h2 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">
                Your {planName} benefits are live
              </h2>
              <div className="flex flex-col gap-space-sm">
                {UNLOCKED_BENEFITS.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-space-sm">
                    <div className="w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="check" filled className="text-badge-discount-text text-[15px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">{benefit.title}</span>
                      <span className="font-caption text-caption text-text-secondary mt-space-2xs">{benefit.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface-canvas p-space-lg shadow-sm border border-border-subtle/60">
              <div className="flex items-center justify-between mb-space-sm">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Expected lift vs free plan</h3>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  +380% avg
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {LIFT_BARS.map((bar) => (
                  <div key={bar.label} className="flex flex-col gap-space-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-text-secondary">{bar.label}</span>
                      <span className="font-caption text-caption text-text-primary font-semibold">{bar.growth}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary-container rounded-full"
                        style={{ width: `${bar.free}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-badge-discount-text/80 rounded-full opacity-60"
                        style={{ width: `${bar.growth}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-caption text-caption text-text-tertiary mt-space-sm">
                Based on average 30-day outcomes for Growth merchants in Abuja &amp; Lagos.
              </p>
            </section>
          </div>
        </div>

        <section className="rounded-xl bg-surface-container-lowest shadow-sm border border-border-subtle/60 p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <p className="font-caption text-caption text-text-secondary text-center sm:text-left">
            Need help activating features? Visit the Support Desk anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch gap-space-sm w-full sm:w-auto">
            <button
              type="button"
              onClick={onExploreFeatures}
              className="h-11 px-space-lg rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs hover:bg-surface-tint-blue active:scale-[0.98] transition-all"
            >
              <Icon name="widgets" className="text-[18px]" />
              <span>Explore Features</span>
            </button>
            <button
              type="button"
              onClick={onGoDashboard}
              className="h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-md flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all"
            >
              <span>Go to Business Dashboard</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </section>
      </div>
    </SubscriptionChrome>
  );
}
