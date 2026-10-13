import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { SubscriptionChrome } from './SubscriptionChrome';

interface DesktopSubscriptionOverviewScreenProps {
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

const HOW_TRIAL_WORKS = [
  { step: '1', body: 'Start your 30-day free trial — no card needed.' },
  { step: '2', body: 'Explore every Growth tool with your real data.' },
  { step: '3', body: 'Subscribe anytime to keep full visibility live.' },
];

const FEATURE_CARDS = [
  {
    icon: 'near_me',
    title: 'Priority local listing',
    body: 'Appear ahead of free listings in the 5km discovery feed shoppers actually use.',
  },
  {
    icon: 'verified',
    title: 'Verified trust badge',
    body: 'Official checkmark on your profile, deals and QR codes that converts browsers into walk-ins.',
  },
  {
    icon: 'insights',
    title: 'Full analytics suite',
    body: 'Revenue, visits, deal redemption and loyalty metrics updated in real time.',
  },
];

const GROWTH_METRIC_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAIBMNslXwC_lzD-mEs8J_Y2EBjgCR10rgvgK412xQyz6e1FjbSHVvz9MvfUDmlHky92VKTbZO88_vDAjjBRXMeq0J2Kwo5mxSLE7JvonE5bIPibLLoVq4mNAOPgNywJIqOFPlBp0bDhLnlQJ842No6L0jovywxv2jT7LLXzrj3wJeB03da5PocWwz5UEWPpb7sRYoDDOeo-yF99cmG5U9xgB03O1sTmRfUjqU1aNKVkwtl4dS-1wNV-w';
const GROWTH_METRIC_ALT =
  'A smiling modern Nigerian boutique owner arranging products behind a contemporary sunlit retail counter with a card terminal and branded shopping bags, captured in crisp warm commercial photography with clean natural light.';

export function DesktopSubscriptionOverviewScreen({
  onBack,
  onStartTrial,
  onSubscribe,
  onViewAddons,
}: DesktopSubscriptionOverviewScreenProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const price = billing === 'monthly' ? '₦5,000' : '₦4,000';
  const priceNote = billing === 'monthly' ? '/ month' : '/ month, billed annually';

  return (
    <SubscriptionChrome onBrand={onBack} activeNav="billing">
      <div className="max-w-6xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-surface-tint-blue via-surface-subtle to-surface-canvas shadow-sm">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/5 pointer-events-none blur-2xl" />
          <div className="relative z-10 p-space-xl flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold w-fit">
                <Icon name="verified" filled className="text-[15px]" />
                Simple, transparent pricing
              </span>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight max-w-2xl">
                Choose how you want to grow with VEMTAP
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
                Start free, experience VEMTAP, and continue when you're ready.
              </p>
            </div>
            <div className="flex items-center gap-space-xs p-space-2xs rounded-xl bg-surface-canvas/80 border border-border-subtle/60 shadow-sm self-start lg:self-auto">
              {(['monthly', 'annual'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBilling(mode)}
                  className={`px-space-sm py-space-xs rounded-lg font-label-md text-label-md transition-colors ${
                    billing === mode
                      ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-on-surface'
                  }`}
                >
                  {mode === 'monthly' ? 'Monthly' : 'Annual'}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <section className="relative rounded-2xl bg-surface-subtle shadow-md overflow-hidden p-space-lg">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-surface-tint-blue rounded-full blur-2xl pointer-events-none opacity-80" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
                      Official Plan
                    </span>
                  </div>
                  <span className="px-space-sm py-space-2xs rounded-full bg-surface-tint-blue text-primary-container font-label-sm text-label-sm">
                    SME Preferred
                  </span>
                </div>
                <h2 className="font-heading-md text-heading-md text-text-primary">VEMTAP Growth</h2>
                <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                  <span className="font-display-hero text-display-hero text-text-primary font-bold">{price}</span>
                  <span className="font-caption text-caption text-text-secondary">{priceNote}</span>
                </div>
                <p className="font-label-sm text-label-sm text-text-secondary mt-space-xs">
                  Everything you need to manage and grow your business on VEMTAP.
                </p>

                <div className="w-full rounded-xl bg-badge-discount-bg px-space-sm py-space-xs mt-space-md mb-space-md flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mb-space-md">
                  {PLAN_FEATURES.map((feature, index) => (
                    <div className="flex items-start gap-space-xs" key={feature}>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          index === 3 ? 'bg-badge-discount-bg' : 'bg-surface-tint-blue'
                        }`}
                      >
                        <Icon
                          name="check"
                          className={`text-[14px] font-bold ${
                            index === 3 ? 'text-badge-discount-text' : 'text-primary-container'
                          }`}
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

                <div className="w-full pt-space-xs">
                  <button
                    aria-expanded={breakdownOpen}
                    className="w-full flex items-center justify-between py-space-xs px-space-sm rounded-xl bg-surface-canvas text-text-primary hover:bg-surface-subtle transition-colors"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-sm p-space-sm rounded-xl bg-surface-canvas">
                      {BREAKDOWN_SECTIONS.map((section) => (
                        <div className="flex flex-col" key={section.title}>
                          <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                            {section.title}
                          </span>
                          <p className="font-caption text-caption text-text-secondary mt-space-2xs">{section.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="flex flex-col sm:flex-row gap-space-sm">
              <button
                type="button"
                onClick={onStartTrial}
                className="flex-1 h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-md hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
              >
                <span>Start 30-Day Free Trial</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={onSubscribe}
                className="flex-1 h-11 rounded-xl bg-surface-tint-blue text-primary-container font-button-secondary text-button-secondary active:scale-[0.98] transition-all flex items-center justify-center"
              >
                <span>Subscribe Now ({price}/mo)</span>
              </button>
            </section>
            <div className="flex items-center justify-center gap-space-2xs -mt-space-sm">
              <Icon name="lock" className="text-[15px] text-text-tertiary" />
              <span className="font-caption text-caption text-text-secondary">
                No credit card required to start your free trial. Cancel anytime.
              </span>
            </div>

            <section className="rounded-xl bg-surface-canvas p-space-lg shadow-sm border border-border-subtle/60">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
                    <Icon name="rocket_launch" className="text-primary text-[18px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">
                    Why go Growth immediately?
                  </h3>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                  3.4x visibility
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                The free trial lets you explore VEMTAP — but visibility, trust and reach only fully unlock on Growth.
                Most Growth merchants recover the ₦5,000/mo with their first boosted sale.
              </p>
            </section>

            <div className="flex items-center justify-center">
              <button
                className="inline-flex items-center gap-space-2xs font-label-sm text-label-sm text-primary-container hover:underline"
                type="button"
                onClick={onViewAddons}
              >
                <span>Looking for Boosts or SMS? View paid add-ons</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <section className="relative rounded-xl overflow-hidden shadow-sm h-48">
              <img alt={GROWTH_METRIC_ALT} className="w-full h-full object-cover" src={GROWTH_METRIC_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/20 to-transparent flex flex-col justify-end p-space-md">
                <span className="font-caption text-caption text-surface-tint-blue uppercase tracking-wider font-semibold">
                  Live Growth Metric
                </span>
                <span className="font-heading-sm text-heading-sm text-surface-canvas font-semibold">
                  +380% more local impressions
                </span>
              </div>
            </section>

            <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">How Trial Works</h3>
              <div className="flex flex-col gap-space-sm">
                {HOW_TRIAL_WORKS.map((item) => (
                  <div className="flex items-start gap-space-sm" key={item.step}>
                    <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 font-label-md text-label-md font-bold">
                      {item.step}
                    </div>
                    <p className="font-label-sm text-label-sm text-text-secondary mt-space-2xs leading-snug">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-border-subtle/60">
              <div className="flex items-center gap-space-xs mb-space-xs">
                <Icon name="apartment" className="text-primary text-[18px]" />
                <span className="font-caption text-caption text-primary uppercase tracking-wider font-semibold">
                  Enterprise
                </span>
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Running 10+ branches?</h3>
              <p className="font-caption text-caption text-text-secondary mt-space-2xs leading-relaxed">
                Talk to us about multi-outlet pricing, SSO staff accounts and dedicated onboarding.
              </p>
              <button
                type="button"
                className="mt-space-sm h-11 w-full rounded-xl bg-surface-tint-blue text-primary-container font-button-secondary text-button-secondary flex items-center justify-center active:scale-[0.98] transition-all"
              >
                Contact Enterprise Desk
              </button>
            </section>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-xl bg-surface-canvas p-space-lg shadow-sm border border-border-subtle/60 flex flex-col gap-space-xs"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                <Icon name={card.icon} className="text-[22px]" />
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">{card.title}</h3>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">{card.body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-surface-tint-blue p-space-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
              <Icon name="support_agent" className="text-primary text-[22px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Questions about pricing?</span>
              <span className="font-caption text-caption text-text-secondary">
                Our merchant desk replies on WhatsApp within minutes.
              </span>
            </div>
          </div>
          <button
            type="button"
            className="h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center active:scale-[0.98] transition-all"
          >
            Chat with Support
          </button>
        </section>
      </div>
    </SubscriptionChrome>
  );
}
