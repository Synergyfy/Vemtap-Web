import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

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
                  Current plan · Active
                </span>
              </div>
              <span className="px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                Renews 1 Nov 2025
              </span>
            </div>

            <div className="flex items-end gap-space-xs flex-wrap">
              <span className="font-heading-xl text-heading-xl text-text-primary font-bold">Growth</span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">₦5,000</span>
              <span className="font-body-md text-body-md text-text-secondary pb-1">/ month</span>
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
              <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-subtle">
                <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="credit_card" className="text-[20px]" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">Visa •••• 4821</span>
                  <span className="font-caption text-caption text-text-secondary">Expires 09/27 · Default card</span>
                </div>
              </div>
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
            >
              <Icon name="download" className="text-[15px]" />
              <span>Download all</span>
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {INVOICES.map((invoice) => (
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