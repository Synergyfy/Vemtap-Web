import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { hasActiveTrial, startTrial } from '../../utils/trialState';
import { hasApiConfig } from '../../services/api/client';
import { useActiveSubscription, useSubscriptionMutations, useSubscriptionPlans } from '../../hooks/business/useSubscription';
import { featuredPlan, planPriceLine } from '../subscriptionLive';
import { SubscriptionChrome } from './SubscriptionChrome';

interface DesktopSubscriptionTrialConfirmScreenProps {
  onBack: () => void;
  onTrialStarted: () => void;
  onSubscribeNow: () => void;
}

const TIMELINE_STEPS = [
  {
    icon: 'bolt',
    iconFill: true,
    circleClass: 'bg-primary-container',
    iconClass: 'text-on-primary-container',
    title: 'Today',
    tag: 'Trial Starts',
    tagClass: 'text-primary',
    body: 'Instant access to all features unlocked across your account.',
    inspector: 'Your account has been upgraded to a Growth Preview workspace. All modules are live right now — catalog, deals, locations, analytics, messaging and loyalty tools are ready to use.',
  },
  {
    icon: 'card_giftcard',
    iconFill: true,
    circleClass: 'bg-badge-discount-bg',
    iconClass: 'text-badge-discount-text',
    title: 'Next 30 Days',
    tag: '100% Free',
    tagClass: 'text-badge-discount-text',
    body: 'Full access, zero commitment, and cancel or pause anytime.',
    inspector: 'For the next 30 days you enjoy the complete Growth experience at no cost. No credit card is stored, no automatic charge will occur, and you can pause or cancel at any point from your billing settings.',
  },
  {
    icon: 'flag',
    iconFill: false,
    circleClass: 'bg-surface-container-high',
    iconClass: 'text-secondary',
    title: 'Day 30',
    tag: '₦5,000 / month',
    tagClass: 'text-text-secondary',
    body: 'Continue with Growth. Only billed if you deliberately choose to upgrade.',
    inspector: 'On day 30 your trial simply expires unless you choose to subscribe. If you upgrade, Growth continues seamlessly at ₦5,000/month with every product, deal, location and customer record preserved.',
  },
];

const TRIAL_FEATURES = [
  { icon: 'storefront', label: 'Business profile' },
  { icon: 'inventory_2', label: 'Products & services' },
  { icon: 'local_offer', label: 'Deals & offers' },
  { icon: 'hub', label: 'Multiple locations' },
  { icon: 'qr_code_scanner', label: 'QR & smart tags' },
  { icon: 'chat_bubble_outline', label: 'Customer messaging' },
  { icon: 'near_me', label: 'Hyper-local discovery' },
  { icon: 'insights', label: 'Business analytics' },
  { icon: 'loyalty', label: 'Loyalty & rewards' },
];

const FAST_TRACK = [
  'Add your first product or service',
  'Publish a launch deal to nearby shoppers',
  'Print your official business QR code',
];

const CAFE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAm63ZEemWbUrB_5h9Ij-SEaSZvBccybkbb55Wx2t5-hJww4m8tWKchYAGt9Z1z6iINEe11DhAqHnh3vHfDW2ubJRcMtJHlsnIQhefRVUKdV3mJz9xXR3U0HD7Z1sM-BwwjBmSCiiUphexp5WZZPOhWmr0Pfm-xl7cSgMcEYbvNIL8IjTd_GKHFBolNhZovmUcDuh5-H_OJSgqp8MZnI0ixE39WZcRBOVGTRqoEF_St8UPr7gWzI7LX1A';
const CAFE_ALT =
  'A modern artisanal coffee shop counter with warm amber lighting, brushed concrete, fresh pastries on display, and a customer tapping a smartphone for mobile pickup, captured in warm photorealistic detail.';
const BOUTIQUE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBz0_tK5vpPRI9uX6MPXOOI1t7EbV0dHh2VzsuxWkbi4KUox-rjZG3FDOE-du4TVdeDTveiPmxKC9kG0M4Lk9onafyLqjhnyYECvdObxee3ie7ogY7iXKOnPS4Z_l3nSjgmwpYaKtUb-qL6SqfNXEZU63EJ_pNJ_MHzNuZQbN00EK31nE0cdfCRWXX-TKFsFnMNh2Kak8Q74wFu-C0Cisj_4LvzyJgb1X9bMNL1LPBU8jawuYFFFxNKCA';
const BOUTIQUE_ALT =
  'A brightly lit boutique clothing studio with clean minimalist apparel racks, elegant plants, and a shopkeeper preparing stylish packages for hyper-local delivery, shot in crisp contemporary style.';

export function DesktopSubscriptionTrialConfirmScreen({
  onBack,
  onTrialStarted,
  onSubscribeNow,
}: DesktopSubscriptionTrialConfirmScreenProps) {
  const [phase, setPhase] = useState<'idle' | 'activating' | 'activated'>('idle');
  const [selectedStep, setSelectedStep] = useState(0);
  const timers = useRef<number[]>([]);
  const live = hasApiConfig();
  const plans = useSubscriptionPlans();
  const subscription = useActiveSubscription();
  const { startTrial: startTrialMutation } = useSubscriptionMutations();

  // Live mode trialling the API's featured plan; demo keeps the scripted copy.
  const featured = featuredPlan(plans.data ?? []);
  const sub = subscription.data ?? null;
  const trialDays = featured?.trialDurationDays ?? 30;
  const priceTag = featured ? planPriceLine(featured, 'monthly') : '₦5,000 / month';
  const planName = featured?.name ?? 'Growth';
  const timeline = TIMELINE_STEPS.map((step) => ({
    ...step,
    title:
      step.title === 'Next 30 Days' ? `Next ${trialDays} Days` : step.title === 'Day 30' ? `Day ${trialDays}` : step.title,
    tag: step.tag === '₦5,000 / month' ? priceTag : step.tag,
    body: step.body.replace('Growth', planName),
    inspector: step.inspector
      .replace(/30 days/g, `${trialDays} days`)
      .replace(/₦5,000\/month/g, `${priceTag.split(' / ')[0]}/month`)
      .replace(/Growth Preview/g, `${planName} Preview`)
      .replace(/Growth/g, planName),
  }));

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  // Safety net: if a trial is already active (e.g. the user navigated back and
  // re-entered this screen), never allow a second activation — go straight to
  // the active-trial screen without touching the stored start date.
  useEffect(() => {
    if (live ? sub?.status === 'trial' : hasActiveTrial()) {
      onTrialStarted();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, sub?.status]);

  const handleStartTrial = () => {
    if (phase !== 'idle') return;
    if (live) {
      if (!featured) return;
      setPhase('activating');
      startTrialMutation.mutate(
        { planId: featured.id, billingPeriod: 'monthly' },
        {
          onSuccess: () => {
            setPhase('activated');
            timers.current.push(window.setTimeout(() => onTrialStarted(), 1200));
          },
          onError: () => setPhase('idle'),
        },
      );
      return;
    }
    const { fresh } = startTrial();
    if (!fresh) {
      // Trial was already started previously — do not reset the period or
      // create a duplicate subscription. Just proceed to the active screen.
      onTrialStarted();
      return;
    }
    setPhase('activating');
    timers.current.push(window.setTimeout(() => setPhase('activated'), 800));
    timers.current.push(window.setTimeout(() => onTrialStarted(), 1900));
  };

  return (
    <SubscriptionChrome onBrand={onBack} activeNav="billing">
      <div className="max-w-6xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-surface-tint-blue via-surface-subtle to-surface-canvas shadow-sm">
          <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-primary/5 pointer-events-none blur-2xl" />
          <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full bg-secondary-container/20 pointer-events-none blur-2xl" />
          <div className="relative z-10 p-space-xl flex flex-col items-center text-center gap-space-sm">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-md animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shadow-md">
                <Icon name="verified" filled className="text-on-primary-container text-[34px]" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-badge-discount-bg text-badge-discount-text">
                <Icon name="check_circle" filled className="text-[16px]" />
              </span>
            </div>
            <span className="px-space-sm py-space-2xs rounded-full bg-surface-canvas/80 text-primary font-caption text-caption font-semibold uppercase tracking-wider border border-primary/15">
              Tier: {planName} Plan Preview
            </span>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight max-w-2xl">
              Your {trialDays}-day trial starts now
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
              Explore VEMTAP, add your products and services, create deals, manage your locations and see how customers
              interact with your business.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-xs mt-space-xs">
              {[
                { icon: 'event_available', label: `${trialDays}-Day Full Access` },
                { icon: 'credit_card_off', label: 'No Credit Card' },
                { icon: 'bolt', label: 'Instant Activation' },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold"
                >
                  <Icon name={badge.icon} className="text-[15px]" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Trial Timeline</h2>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Risk Free
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div className="relative flex flex-col gap-space-md pl-space-xs">
                  <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-secondary-container" />
                  {timeline.map((step, index) => {
                    const active = selectedStep === index;
                    return (
                      <button
                        key={step.title}
                        type="button"
                        onClick={() => setSelectedStep(index)}
                        className={`relative flex items-start gap-space-sm text-left rounded-lg p-space-2xs transition-colors ${
                          active ? 'bg-surface-canvas shadow-sm' : 'hover:bg-surface-canvas/60'
                        }`}
                      >
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full ${step.circleClass} flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          <Icon name={step.icon} filled={step.iconFill} className={`${step.iconClass} text-[16px]`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-space-xs">
                            <span className="font-label-md text-label-md text-text-primary font-semibold">
                              {step.title}
                            </span>
                            <span className={`font-caption text-caption font-medium ${step.tagClass}`}>{step.tag}</span>
                          </div>
                          <p className="font-caption text-caption text-text-secondary mt-space-2xs">{step.body}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="rounded-xl bg-surface-canvas p-space-md shadow-sm border border-border-subtle/60 flex flex-col gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <div
                      className={`w-8 h-8 rounded-full ${timeline[selectedStep].circleClass} flex items-center justify-center`}
                    >
                      <Icon
                        name={timeline[selectedStep].icon}
                        filled={timeline[selectedStep].iconFill}
                        className={`${timeline[selectedStep].iconClass} text-[16px]`}
                      />
                    </div>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      {timeline[selectedStep].title}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                    {timeline[selectedStep].inspector}
                  </p>
                </div>
              </div>
            </section>

            <section className="flex items-start gap-space-sm rounded-xl bg-surface-tint-blue p-space-lg shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <Icon name="security" filled className="text-primary text-[22px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-text-primary font-semibold">No Card Required</span>
                <p className="font-label-sm text-label-sm text-text-secondary mt-space-2xs leading-snug">
                  No payment card is required to start your trial. You will not be automatically charged.
                </p>
              </div>
            </section>

            <section className="rounded-xl bg-surface-canvas p-space-lg shadow-sm border border-border-subtle/60">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">Fast Track Checklist</h3>
              <div className="flex flex-col gap-space-xs">
                {FAST_TRACK.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-space-sm rounded-lg bg-surface-subtle px-space-sm py-space-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
                      <Icon name="radio_button_unchecked" className="text-primary text-[15px]" />
                    </div>
                    <span className="font-label-sm text-label-sm text-text-primary">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between px-space-xs mb-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary">Supported Merchant Categories</span>
                <span className="font-caption text-caption text-primary">Over 4,200 local spots</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <div className="relative h-40 rounded-xl overflow-hidden shadow-sm">
                  <img alt={CAFE_ALT} className="w-full h-full object-cover" src={CAFE_IMG} />
                  <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/20 to-transparent flex flex-col justify-end p-space-sm">
                    <span className="font-label-md text-label-md text-surface-canvas font-semibold">Cafes &amp; Dining</span>
                    <span className="font-caption text-caption text-surface-tint-blue">1,840+ merchants onboard</span>
                  </div>
                </div>
                <div className="relative h-40 rounded-xl overflow-hidden shadow-sm">
                  <img alt={BOUTIQUE_ALT} className="w-full h-full object-cover" src={BOUTIQUE_IMG} />
                  <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/20 to-transparent flex flex-col justify-end p-space-sm">
                    <span className="font-label-md text-label-md text-surface-canvas font-semibold">
                      Retail &amp; Fashion
                    </span>
                    <span className="font-caption text-caption text-surface-tint-blue">2,360+ merchants onboard</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <section className="rounded-xl bg-surface-canvas p-space-lg shadow-sm border border-border-subtle/60">
              <div className="flex items-center justify-between mb-space-sm">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">What's included</h3>
                <span className="font-label-sm text-label-sm text-text-secondary">All-inclusive</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-xs">
                {TRIAL_FEATURES.map((feature) => (
                  <div
                    key={feature.icon}
                    className="flex items-center gap-space-xs p-space-xs bg-surface-subtle rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
                      <Icon name={feature.icon} className="text-primary text-[18px]" />
                    </div>
                    <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-space-sm pt-space-sm border-t border-border-subtle/60 flex items-center justify-between">
                <span className="font-caption text-caption text-text-secondary">9 modules unlocked instantly</span>
                <span className="font-caption text-caption text-badge-discount-text font-semibold">₦0 today</span>
              </div>
            </section>

            <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">Trial Summary</h3>
              <div className="flex flex-col gap-space-xs">
                {[
                  { label: 'Plan', value: live ? planName : 'Growth Preview' },
                  { label: 'Duration', value: `${trialDays} days` },
                  { label: 'Card required', value: 'No' },
                  { label: 'Auto-charge', value: 'Never' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-space-2xs">
                    <span className="font-caption text-caption text-text-secondary">{row.label}</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-xl bg-surface-container-lowest shadow-sm border border-border-subtle/60 p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <span className="font-label-md text-label-md text-text-primary font-semibold">
              Ready when you are — no rush
            </span>
            <span className="font-caption text-caption text-text-secondary">
              Start free, or subscribe now to lock Growth immediately. Compliance: PCI-DSS Level 1 &amp; NDPR.
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-space-sm w-full sm:w-auto">
            <button
              type="button"
              onClick={onSubscribeNow}
              className="h-11 px-space-lg rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs hover:bg-surface-tint-blue active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <span>Subscribe Now</span>
              <span className="text-text-secondary">
                {live ? `(${priceTag.split(' / ')[0]}/mo)` : '(₦5,000/mo)'}
              </span>
            </button>
            <button
              type="button"
              disabled={phase !== 'idle'}
              onClick={handleStartTrial}
              className={`h-11 px-space-lg rounded-xl font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all whitespace-nowrap ${
                phase === 'activated' ? 'bg-badge-discount-text text-on-primary' : 'bg-primary-container text-on-primary'
              }`}
            >
              {phase === 'idle' && (
                <>
                  <span>Start My Free Trial</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </>
              )}
              {phase === 'activating' && (
                <>
                  <Icon name="progress_activity" className="animate-spin text-[20px]" />
                  <span>Activating...</span>
                </>
              )}
              {phase === 'activated' && (
                <>
                  <Icon name="check" className="text-[20px]" />
                  <span>Activated! Welcome Aboard</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </SubscriptionChrome>
  );
}
