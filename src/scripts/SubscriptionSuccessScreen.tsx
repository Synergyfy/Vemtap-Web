import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { downloadCsv } from '../utils/exportCsv';
import { printKvTable, printReport } from '../utils/printReport';
import { hasApiConfig } from '../services/api/client';
import {
  useActiveSubscription,
  useBillingHistory,
  usePaymentMethod,
  useSubscriptionPlans,
} from '../hooks/business/useSubscription';
import { featuredPlan, planPriceLine, renewalDate } from './subscriptionLive';
import { formatNaira } from '../utils/format';

interface SubscriptionSuccessScreenProps {
  onGoDashboard: () => void;
  onExploreFeatures: () => void;
}

const RECEIPT_ROWS = [
  { label: 'Transaction ID', value: 'VT-SUB-982410' },
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

const STORE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBBS6f2StSn5jzvi7cW3Zwy6DxTkVU0VLWtEPEVLiBG8HnHEzNeN60vmytS1VD4pxHvNCrBXaztDntxLRpZsNGWmmV3aJMvDc64k2CRbcWH-fNRKZnC3T2yjxa640OuMxxpzOcI0nio10-A1grk9jj-C24CzgiGEk4836K1rSy3JpAymebH-FYW9z_X6ohGAyTGwGwVppNAiYGaSCHn4wRKAjc9g8jgpI1mnj7gUXranQWd-6PngMaDbQ';
const STORE_ALT =
  'A modern stylish boutique storefront in Abuja with clean glass architecture, warm evening ambient lighting, and subtle blue branding accents reflecting modern retail elegance.';

export function SubscriptionSuccessScreen({
  onGoDashboard,
  onExploreFeatures,
}: SubscriptionSuccessScreenProps) {
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
  const card = live && payment.data?.hasCard ? payment.data.card : null;
  const billingLabel = sub?.billingPeriod
    ? sub.billingPeriod.charAt(0).toUpperCase() + sub.billingPeriod.slice(1)
    : 'Monthly';
  const receiptRows = live
    ? [
        { label: 'Transaction ID', value: latest?.reference ?? '—' },
        {
          label: 'Payment Date',
          value: latest?.createdAt
            ? new Date(latest.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Today',
        },
        { label: 'Next Billing Date', value: renewalDate(sub?.endDate) ?? '—' },
      ]
    : RECEIPT_ROWS;
  const invoiceRef = live ? (latest?.reference ?? 'VT-SUB-PENDING') : 'VT-SUB-982410';

  const downloadTaxInvoice = () => {
    downloadCsv(
      `vemtap-tax-invoice-${invoiceRef}.csv`,
      ['Field', 'Value'],
      [
        ...receiptRows.map((row) => [row.label, row.value]),
        ['Plan', `VEMTAP ${planName}`],
        ['Amount paid', `${paidText}.00`],
        [
          'Payment method',
          live ? (card ? `${card.brand ?? 'Card'} •••• ${card.last4}` : 'Card on file') : 'Mastercard •••• 4128',
        ],
      ],
    );
    printReport(
      `VEMTAP Tax Invoice — ${invoiceRef}`,
      `${printKvTable('Invoice', receiptRows.map((row) => [row.label, row.value] as [string, string]))}
       ${printKvTable('Line items', [
         live
           ? [`VEMTAP ${planName} plan — ${billingLabel.toLowerCase()} subscription`, paidText]
           : ['VEMTAP Growth plan — monthly subscription', '₦4,651.16'],
         live ? ['VAT', 'included'] : ['VAT (7.5%)', '₦348.84'],
         ['Amount paid', `${paidText}.00`],
       ])}
       ${printKvTable('Payment', [
         [
           'Method',
           live ? (card ? `${card.brand ?? 'Card'} •••• ${card.last4}` : 'Card on file') : 'Mastercard •••• 4128',
         ],
       ])}
       <p class="foot">A CSV copy of this tax invoice downloaded alongside the PDF.</p>`,
    );
  };

  return (
    <AppScreen surface="bg-surface-canvas">
      <div className="flex flex-col w-full flex-1 px-margin pb-10">
        {/* Top Ambient Celebration Canvas */}
        <div className="relative w-full flex flex-col items-center pt-6 pb-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
            <div className="w-72 h-72 rounded-full bg-badge-discount-bg/60 blur-3xl" />
            <div className="absolute top-0 right-4 w-32 h-32 rounded-full bg-primary-fixed/40 blur-2xl" />
          </div>
          {/* Animated Success Badge Emblem */}
          <div className="relative flex items-center justify-center mb-3">
            <div className="absolute w-20 h-20 rounded-full bg-badge-discount-bg animate-ping opacity-25" />
            <div className="relative w-16 h-16 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-lg shadow-badge-discount-text/10">
              <div className="w-11 h-11 rounded-full bg-badge-discount-text flex items-center justify-center text-surface-canvas shadow-inner">
                <Icon name="check" className="text-[26px] font-bold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }} />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-surface-canvas shadow-sm">
              <Icon name="verified" className="text-[12px] font-bold" />
            </div>
          </div>
          {/* Status Header */}
          <span className="px-2.5 py-0.5 mb-2 rounded-full bg-surface-container text-primary font-caption text-caption uppercase tracking-wider font-semibold">
            Payment Successful
          </span>
          <h1 className="font-heading-md text-heading-md font-bold text-text-primary text-center tracking-tight">
            You're now on VEMTAP {planName}
          </h1>
          <p className="font-label-md text-label-md text-text-secondary text-center mt-1 max-w-xs">
            Your business is active and ready to grow with VEMTAP.
          </p>
        </div>

        {/* Storefront Preview Card */}
        <div className="w-full bg-surface-subtle rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
            <img alt={STORE_ALT} className="w-full h-full object-cover" src={STORE_IMG} />
            <div className="absolute bottom-0 inset-x-0 h-3 bg-gradient-to-t from-text-primary/70 to-transparent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h2 className="font-label-md text-label-md font-semibold text-text-primary truncate">
                Apo & Wuse II Hubs
              </h2>
              <Icon name="check_circle" filled className="text-primary text-[14px]" />
            </div>
            <p className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
              Storefront live on discovery radars
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="font-caption text-caption text-text-tertiary block leading-tight">Locations</span>
            <p className="font-caption text-caption text-text-primary font-semibold">2 Active</p>
          </div>
        </div>

        {/* Receipt & Subscription Summary Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-3 mb-3.5">
          {/* Header of Receipt */}
          <div className="flex items-start justify-between pb-2.5 bg-surface-subtle -mx-4 -mt-4 p-4 rounded-t-xl">
            <div>
              <div className="flex items-center gap-1.5">
                <Icon name="workspace_premium" className="text-primary text-[16px]" />
                <span className="font-label-md text-label-md font-semibold text-text-primary">VEMTAP {planName}</span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-0.5">Subscription Plan</p>
            </div>
            <div className="text-right">
              <span className="font-heading-md text-heading-md text-text-primary font-bold tracking-tight">
                {paidText}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                / {priceLine ? priceLine.split(' / ')[1] : 'month'}
              </span>
            </div>
          </div>
          {/* Active Status Ribbon */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-badge-discount-bg text-badge-discount-text">
            <div className="flex items-center gap-1.5">
              <Icon name="autorenew" filled className="text-[14px]" />
              <span className="font-caption text-caption font-semibold">Active • Auto-renewing</span>
            </div>
            <span className="font-caption text-caption uppercase tracking-wider font-semibold">Billed {billingLabel}</span>
          </div>
          {/* Line Item Breakdown */}
          <div className="space-y-2.5 pt-0.5">
            {receiptRows.map((row) => (
              <div className="flex items-center justify-between" key={row.label}>
                <span className="font-caption text-caption text-text-secondary">{row.label}</span>
                <span className="font-caption text-caption text-text-primary font-semibold text-right truncate max-w-[200px]">
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="font-caption text-caption text-text-secondary">Payment Method</span>
              <div className="flex items-center gap-1.5">
                {(live ? card : true) && (
                  <div className="w-5 h-3.5 bg-surface-container rounded flex items-center justify-center px-0.5">
                    <span className="text-[8px] font-extrabold text-primary tracking-tighter">
                      {live ? (card?.brand ?? 'Card').slice(0, 2).toUpperCase() : 'MC'}
                    </span>
                  </div>
                )}
                <span className="font-caption text-caption text-text-primary font-medium">
                  {live ? (card ? `•••• ${card.last4}` : 'Card on file') : '•••• 4128'}
                </span>
              </div>
            </div>
          </div>
          {/* Download Receipt Link */}
          <div className="pt-1 flex justify-center">
            <button
              className="font-caption text-caption text-primary font-semibold flex items-center gap-1 hover:underline active:opacity-75"
              type="button"
              onClick={downloadTaxInvoice}
            >
              <Icon name="receipt_long" className="text-[14px]" />
              Download Tax Invoice • PDF
            </button>
          </div>
        </div>

        {/* Key Perks Activated */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-3.5 shadow-sm mb-4 space-y-2.5">
          <div className="flex items-center justify-between pb-0.5">
            <h3 className="font-label-md text-label-md text-text-primary font-semibold tracking-tight">
              Growth Benefits Unlocked
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
              All 3 Ready
            </span>
          </div>
          <div className="space-y-2.5 pt-0.5">
            {UNLOCKED_BENEFITS.map((benefit) => (
              <div className="flex items-start gap-2.5" key={benefit.title}>
                <div className="w-6 h-6 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-[14px] font-bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-caption text-caption text-text-primary font-semibold">{benefit.title}</p>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 leading-tight">{benefit.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Deck */}
        <div className="mt-auto w-full space-y-2.5">
          <button
            className="w-full h-[46px] bg-primary-container text-on-primary font-button-secondary text-button-secondary font-semibold rounded-xl flex items-center justify-center gap-2 shadow hover:bg-primary active:scale-[0.98] transition-all"
            type="button"
            onClick={onGoDashboard}
          >
            <span>Go to Business Dashboard</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
          <button
            className="w-full h-[44px] bg-surface-container text-text-primary font-button-secondary text-button-secondary font-medium rounded-xl flex items-center justify-center gap-1.5 hover:bg-surface-container-high active:scale-[0.99] transition-all"
            type="button"
            onClick={onExploreFeatures}
          >
            <Icon name="explore" className="text-[16px] text-secondary" />
            <span>Explore Growth Features</span>
          </button>
          {/* Support Help Footnote */}
          <div className="pt-1 text-center">
            <p className="font-caption text-caption text-text-tertiary">
              Questions about billing?{' '}
              <a className="text-primary font-medium hover:underline" href="mailto:support@vemtap.com">
                Contact Merchant Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
