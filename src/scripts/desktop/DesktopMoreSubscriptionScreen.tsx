import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
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

interface DesktopMoreSubscriptionScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

const PLAN_FEATURES = [
  'Unlimited products & services',
  'POS terminals and offline sync',
  'Deals, Boosts & loyalty programmes',
  'Customer messaging & segments',
  'Analytics across all branches',
];

const INVOICES = [
  { id: 'INV-2025-0104', date: '1 Oct 2025', amount: '₦5,000', status: 'Paid', tone: 'bg-badge-discount-bg text-badge-discount-text' },
  { id: 'INV-2025-0092', date: '1 Sep 2025', amount: '₦5,000', status: 'Paid', tone: 'bg-badge-discount-bg text-badge-discount-text' },
  { id: 'INV-2025-0079', date: '1 Aug 2025', amount: '₦5,000', status: 'Paid', tone: 'bg-badge-discount-bg text-badge-discount-text' },
];

/**
 * Dashboard Subscription & Billing — reached from More → Subscription & Billing.
 * This is the account-holder view (current plan, payment method, invoices) inside
 * the business portal chrome. The onboarding subscription flow (route
 * 'subscription') is a separate journey for new sign-ups.
 */
export function DesktopMoreSubscriptionScreen({ onNav }: DesktopMoreSubscriptionScreenProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const live = hasApiConfig();
  const subscription = useActiveSubscription();
  const plans = useSubscriptionPlans();
  const billing = useBillingHistory();
  const payment = usePaymentMethod();

  const sub = subscription.data ?? null;
  const livePlan = sub ? (plans.data ?? []).find((plan) => plan.id === sub.planId) ?? featuredPlan(plans.data ?? []) : null;
  const renewLabel = sub?.status === 'trial' ? 'Ends' : 'Renews';
  const renewDate = renewalDate(sub?.endDate);
  const card = live && payment.data?.hasCard ? payment.data.card : null;
  const priceParts = livePlan ? planPriceLine(livePlan, sub?.billingPeriod ?? 'monthly').split(' / ') : null;

  const invoiceTone = (status: string) =>
    /paid|completed|success/i.test(status)
      ? 'bg-badge-discount-bg text-badge-discount-text'
      : /pending/i.test(status)
        ? 'bg-surface-tint-blue text-primary'
        : 'bg-error text-on-error';

  // Live mode lists real invoices; demo keeps the scripted register.
  const invoices = live
    ? (billing.data ?? []).map((record) => ({
        id: record.reference ?? record.id.slice(0, 8).toUpperCase(),
        date: record.createdAt
          ? new Date(record.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—',
        amount: formatNaira(Number(record.amount) || 0),
        status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase() : 'Paid',
        tone: invoiceTone(record.status ?? 'paid'),
      }))
    : INVOICES;

  const accountLines = (): [string, string][] => [
    ['Plan', live ? (sub?.plan?.name ?? 'No active plan') : 'VEMTAP Growth'],
    ['Renews', live ? (renewDate ?? '—') : '1 Nov 2025'],
    [
      'Payment method',
      live ? (card ? `${card.brand ?? 'Card'} ending •• ${card.last4}` : 'No card on file') : 'Mastercard ending •• 4291',
    ],
  ];

  /** Every invoice as a CSV register, plus a print-ready PDF statement. */
  const downloadAllInvoices = () => {
    downloadCsv(
      'vemtap-invoice-history.csv',
      ['Invoice', 'Date', 'Amount', 'Status'],
      invoices.map((invoice) => [invoice.id, invoice.date, invoice.amount, invoice.status]),
    );
    printReport(
      `VEMTAP Invoice History — ${live ? (sub?.plan?.name ?? 'Your account') : 'Gourmet Bites Bistro'}`,
      `${printKvTable('Account', accountLines())}
       ${printKvTable(
         'Invoices',
         invoices.map((invoice) => [invoice.id, `${invoice.date} • ${invoice.amount} • ${invoice.status}`]),
       )}
       <p class="foot">A CSV copy of the invoice register downloaded alongside this PDF.</p>`,
    );
  };

  /** Single invoice — print-ready PDF tax invoice. */
  const downloadInvoice = (id: string, date: string, amount: string, status: string) => {
    const net = amount.replace('₦', '');
    printReport(
      `VEMTAP Tax Invoice ${id}`,
      `${printKvTable('Invoice', [
        ['Invoice number', id],
        ['Issued', date],
        ['Status', status],
      ])}
       ${printKvTable('Supplier', [
        ['Supplier', 'VEMTAP Technologies Ltd'],
        ['TIN', '20194418-0001'],
        ['Contact', 'billing@vemtap.ng'],
      ])}
       ${printKvTable('Customer', [
        ['Business', live ? (sub?.plan?.name ? 'Subscribed business' : 'Your account') : 'Gourmet Bites Bistro'],
        ['TIN', 'TIN-8894102-NG'],
      ])}
       ${printKvTable('Line items', [
        ['VEMTAP plan charge', `₦${net}.00`],
        ['VAT (7.5%)', 'included'],
        ['Total charged', `₦${net}.00`],
      ])}
       <p class="foot">0% VEMTAP commission on settled sales. VAT invoices are filed with FIRS on your behalf.</p>`,
    );
  };

  return (
    <BusinessPortalChrome activeNav="more-subscription" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg">
        <section className="flex flex-col gap-space-2xs max-w-3xl">
          <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
            More · Account
          </span>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Subscription &amp; Billing</h1>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Manage your VEMTAP plan, payment method and invoice history for this business account.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Current plan */}
          <section className="lg:col-span-7 rounded-2xl bg-surface-canvas shadow-sm p-space-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
                  {live
                    ? sub
                      ? `Current plan · ${sub.status === 'trial' ? 'Trial' : 'Active'}`
                      : 'Current plan · None'
                    : 'Current plan · Active'}
                </span>
              </div>
              {renewDate && (
                <span className="px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  {renewLabel} {renewDate}
                </span>
              )}
            </div>

            <div className="flex items-end gap-space-xs flex-wrap">
              <span className="font-heading-xl text-heading-xl text-text-primary font-bold">
                {live ? (sub?.plan?.name ?? 'No active plan') : 'Growth'}
              </span>
              {priceParts && (
                <>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">{priceParts[0]}</span>
                  <span className="font-body-md text-body-md text-text-secondary pb-1">/ {priceParts[1]}</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
              {PLAN_FEATURES.map((feature) => (
                <div className="flex items-start gap-space-xs" key={feature}>
                  <div className="w-5 h-5 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="check" className="text-[14px] text-primary" />
                  </div>
                  <span className="font-label-sm text-label-sm text-text-primary">{feature}</span>
                </div>
              ))}
            </div>

            <div className="w-full pt-space-xs border-t border-border-subtle">
              <button
                aria-expanded={breakdownOpen}
                className="w-full flex items-center justify-between py-space-xs px-space-sm rounded-xl bg-surface-subtle text-text-primary hover:bg-surface-container transition-colors"
                type="button"
                onClick={() => setBreakdownOpen((open) => !open)}
              >
                <span className="font-label-sm text-label-sm">View everything included (Full Breakdown)</span>
                <Icon
                  name="expand_more"
                  className={`text-primary transition-transform duration-200 text-[20px] ${breakdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {breakdownOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-sm p-space-sm rounded-xl bg-surface-subtle">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Selling</span>
                    <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                      POS, Store Front, QR ordering, offline sync and daily ledgers across every branch.
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Growing</span>
                    <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                      Deals, Boosts, loyalty tiers, customer segments and scheduled campaigns.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Payment method + add-ons shortcut */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-xl flex flex-col gap-space-md">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Payment method</h2>
              {live ? (
                <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-subtle">
                  <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name={card ? 'credit_card' : 'credit_card_off'} className="text-[20px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      {card ? `${card.brand ?? 'Card'} •••• ${card.last4}` : 'No card on file'}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      {card ? `Expires ${card.expMonth ?? '?'}/${card.expYear ?? '?'} · Default card` : 'A card is saved when you subscribe to a paid plan.'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-subtle">
                  <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="credit_card" className="text-[20px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Visa •••• 4821</span>
                    <span className="font-caption text-caption text-text-secondary">Expires 09/27 · Default card</span>
                  </div>
                </div>
              )}
              <button
                className="h-[44px] rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary transition-colors flex items-center justify-center gap-space-2xs"
                type="button"
              >
                <Icon name="add_card" className="text-[18px]" />
                <span>Update payment method</span>
              </button>
            </section>

            <section className="rounded-2xl bg-surface-tint-blue p-space-lg flex items-start gap-space-sm">
              <Icon name="extension" className="text-primary text-[20px] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-md text-label-md text-primary font-bold">Need SMS or AI credits?</span>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Boosts, SMS and AI credits are one-time add-ons — they never change your base plan.
                </p>
                <button
                  className="mt-space-2xs self-start font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1"
                  type="button"
                  onClick={() => onNav('more-addons')}
                >
                  <span>View Add-ons &amp; Credits</span>
                  <Icon name="arrow_forward" className="text-[15px]" />
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Invoices */}
        <section className="rounded-2xl bg-surface-canvas shadow-sm overflow-hidden">
          <div className="p-space-lg pb-space-sm flex items-center justify-between">
            <h2 className="font-heading-sm text-heading-sm text-text-primary">Invoice history</h2>
            <button
              className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1"
              type="button"
              onClick={downloadAllInvoices}
            >
              <Icon name="download" className="text-[15px]" />
              <span>Download all</span>
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {live && invoices.length === 0 && (
              <div className="px-space-lg py-space-md font-body-md text-body-md text-on-surface-variant text-center">
                No invoices yet — they appear here after your first paid subscription charge.
              </div>
            )}
            {invoices.map((invoice) => (
              <div key={invoice.id} className="px-space-lg py-space-sm flex items-center justify-between gap-space-sm">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{invoice.id}</span>
                  <span className="font-caption text-caption text-text-secondary">{invoice.date}</span>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{invoice.amount}</span>
                  <span className={`px-space-xs py-0.5 rounded-full font-caption text-caption font-semibold ${invoice.tone}`}>
                    {invoice.status}
                  </span>
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-on-surface transition-colors"
                    type="button"
                    aria-label={`Download ${invoice.id}`}
                    onClick={() => downloadInvoice(invoice.id, invoice.date, invoice.amount, invoice.status)}
                  >
                    <Icon name="download" className="text-[18px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </BusinessPortalChrome>
  );
}