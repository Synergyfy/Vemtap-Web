import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { getTrialDaysLeft, hasActiveTrial } from '../utils/trialState';
import { SubscriptionHeader } from './SubscriptionHeader';

interface SubscriptionOverviewScreenProps {
  onBack: () => void;
  onStartTrial: () => void;
  onSubscribe: () => void;
  onViewAddons: () => void;
}

const PLAN_FEATURES = [
  'Business profile & storefront presence',
  'Products & services digital catalog',
  'Deals, discounts & flash offers',
  'Multiple business locations',
  'Business QR & Table NFC physical codes',
  'Customer messaging & direct chat',
  'Hyper-local customer discovery feed',
  'Customer engagement & repeat visits',
  'Loyalty & Tap rewards tools',
  'Real-time revenue & visit analytics',
  'Complete storefront & staff management',
];

const BREAKDOWN_SECTIONS = [
  {
    title: 'Storefront & Discovery',
    body: 'Custom domain routing, real-time hours, instant verified badge, and priority geo-listing across 5km radius.',
  },
  {
    title: 'Contactless Hardware Integration',
    body: 'Downloadable printable vector QR kits & sync-ready support for smart NFC tap plates.',
  },
  {
    title: 'Payments & Direct Settlements',
    body: 'Zero platform commission on cash settlements and support for direct Nigerian bank transfers.',
  },
  {
    title: 'Support & Business Concierge',
    body: 'WhatsApp dedicated merchant account manager & onboarding specialist assistance.',
  },
];

const GROWTH_COMPARISON = [
  {
    label: 'Local Visibility',
    free: 'Standard listing only',
    growth: 'Priority pin placement across 5km',
  },
  {
    label: 'Neighborhood Impressions',
    free: 'Organic reach only',
    growth: 'Up to 3.4x more impressions',
  },
  {
    label: 'Trust Badge',
    free: 'No badge during trial',
    growth: 'Official Verified Business checkmark',
  },
  {
    label: 'Deal Reach',
    free: 'Post deals manually',
    growth: 'Hyperlocal broadcast + flash deal push',
  },
  {
    label: 'Merchant Support',
    free: 'Standard help centre',
    growth: 'Dedicated merchant manager',
  },
];

export function SubscriptionOverviewScreen({
  onBack,
  onStartTrial,
  onSubscribe,
  onViewAddons,
}: SubscriptionOverviewScreenProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const trialActive = hasActiveTrial();
  const trialDaysLeft = getTrialDaysLeft();

  return (
    <AppScreen surface="bg-surface-canvas">
      <SubscriptionHeader title="Subscription Plans" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-8">
        {/* Intro */}
        <section className="mt-1 mb-4 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption mb-2">
            <Icon name="verified" filled className="text-[15px]" />
            <span>Simple, transparent pricing</span>
          </div>
          <h2 className="font-heading-md text-heading-md font-semibold text-text-primary tracking-tight leading-tight">
            Choose how you want to grow with VEMTAP
          </h2>
          <p className="font-label-sm text-label-sm text-text-secondary mt-1">
            Start free, experience VEMTAP, and continue when you're ready.
          </p>
        </section>

        {/* VEMTAP Growth Plan Card */}
        <div className="relative w-full rounded-2xl bg-surface-subtle shadow-md overflow-hidden p-3.5">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-surface-tint-blue rounded-full blur-2xl pointer-events-none opacity-80" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
                Official Plan
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary-container font-label-sm text-label-sm">
              SME Preferred
            </span>
          </div>
          <div className="flex flex-col mb-3">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">VEMTAP Growth</h3>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-heading-lg text-heading-lg text-text-primary font-bold">₦5,000</span>
              <span className="font-caption text-caption text-text-secondary">/ month</span>
            </div>
            <p className="font-label-sm text-label-sm text-text-secondary mt-1">
              Everything you need to manage and grow your business on VEMTAP.
            </p>
          </div>

          {/* Free Trial Banner */}
          <div className="w-full rounded-xl bg-badge-discount-bg px-3 py-2 mb-3.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="card_membership" className="text-badge-discount-text text-[18px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">
                Includes 30-Day Free Trial
              </span>
              <span className="font-caption text-caption text-text-secondary">
                No credit card or commitment required
              </span>
            </div>
          </div>

          {/* Feature Checklist */}
          <div className="flex flex-col gap-2.5 mb-3.5">
            {PLAN_FEATURES.map((feature, index) => (
              <div className="flex items-start gap-2.5" key={feature}>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    index === 3 ? 'bg-badge-discount-bg' : 'bg-surface-tint-blue'
                  }`}
                >
                  <Icon
                    name="check"
                    className={`text-[15px] font-bold ${index === 3 ? 'text-badge-discount-text' : 'text-primary-container'}`}
                  />
                </div>
                <span className="font-label-sm text-label-sm text-text-primary flex items-center gap-1.5 flex-wrap">
                  {feature}
                  {index === 3 && (
                    <span className="px-1.5 py-0.5 rounded bg-surface-tint-blue text-primary-container font-caption text-caption">
                      Included
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Full Breakdown Toggle */}
          <div className="w-full pt-3 pb-1">
            <button
              aria-expanded={breakdownOpen}
              className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-surface-canvas text-text-primary hover:bg-surface-subtle transition-colors"
              type="button"
              onClick={() => setBreakdownOpen((open) => !open)}
            >
              <span className="font-label-sm text-label-sm">View everything included (Full Breakdown)</span>
              <Icon
                name="expand_more"
                className={`text-primary-container transition-transform duration-200 text-[20px] ${
                  breakdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {breakdownOpen && (
              <div className="flex flex-col gap-3.5 mt-3 p-3.5 rounded-xl bg-surface-canvas">
                {BREAKDOWN_SECTIONS.map((section) => (
                  <div className="flex flex-col" key={section.title}>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">{section.title}</span>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">{section.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Why go Growth immediately? */}
        <div className="mt-4 bg-surface-canvas rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
                <Icon name="rocket_launch" className="text-primary text-[18px]" />
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">
                Why go Growth immediately?
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
              3.4x visibility
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {GROWTH_COMPARISON.map((row) => (
              <div className="bg-surface-subtle rounded-lg px-3 py-2 flex flex-col gap-0.5" key={row.label}>
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wide">
                  {row.label}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-caption text-caption text-text-tertiary">{row.free}</span>
                  <Icon name="trending_flat" className="text-text-tertiary text-[16px] shrink-0" />
                  <span className="font-label-sm text-label-sm text-primary font-semibold">{row.growth}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="font-caption text-caption text-text-secondary mt-3 leading-relaxed">
            The free trial lets you explore VEMTAP — but visibility, trust and reach only fully unlock on Growth. Most
            Growth merchants recover the ₦5,000/mo with their first boosted sale.
          </p>
        </div>

        {/* Action CTAs */}
        <section className="flex flex-col gap-2.5 mt-4">
          {trialActive ? (
            <button
              className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-md hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              type="button"
              onClick={onStartTrial}
            >
              <Icon name="verified" filled className="text-[18px]" />
              <span>View My Active Trial ({trialDaysLeft} days left)</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          ) : (
            <button
              className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-md hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              type="button"
              onClick={onStartTrial}
            >
              <span>Start 30-Day Free Trial</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          )}
          <button
            className="w-full h-11 rounded-xl bg-surface-tint-blue text-primary-container font-button-secondary text-button-secondary active:scale-[0.98] transition-all flex items-center justify-center"
            type="button"
            onClick={onSubscribe}
          >
            <span>Subscribe Now (₦5,000/mo)</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-text-secondary">
            <Icon name="lock" className="text-[15px] text-text-tertiary" />
            <span className="font-caption text-caption">
              {trialActive
                ? 'Your free trial is active — no card on file, cancel anytime.'
                : 'No credit card required to start your free trial. Cancel anytime.'}
            </span>
          </div>
        </section>

        {/* Add-ons Link & Footer */}
        <section className="mt-4 pt-3 pb-2 flex flex-col items-center text-center">
          <button
            className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-container hover:underline"
            type="button"
            onClick={onViewAddons}
          >
            <span>Looking for Boosts or SMS? View paid add-ons</span>
            <Icon name="arrow_forward" className="text-[16px] transition-transform" />
          </button>
          <p className="font-caption text-caption text-text-tertiary mt-1.5">
            Built for Nigerian retailers, restaurants, lounges, and service providers.
          </p>
        </section>
      </div>
    </AppScreen>
  );
}
