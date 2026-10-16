import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { hasActiveTrial, startTrial } from '../utils/trialState';
import { SubscriptionHeader } from './SubscriptionHeader';

interface SubscriptionTrialConfirmScreenProps {
  onBack: () => void;
  onTrialStarted: () => void;
  onSubscribeNow: () => void;
}

const TIMELINE_STEPS = [
  {
    icon: 'bolt',
    iconFill: false,
    circleClass: 'bg-primary-container',
    iconClass: 'text-on-primary-container',
    title: 'Today',
    tag: 'Trial Starts',
    tagClass: 'text-primary',
    body: 'Instant access to all features unlocked across your account.',
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
];

const CAFE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAm63ZEemWbUrB_5h9Ij-SEaSZvBccybkbb55Wx2t5-hJww4m8tWKchYAGt9Z1z6iINEe11DhAqHnh3vHfDW2ubJRcMtJHlsnIQhefRVUKdV3mJz9xXR3U0HD7Z1sM-BwwjBmSCiiUphexp5WZZPOhWmr0Pfm-xl7cSgMcEYbvNIL8IjTd_GKHFBolNhZovmUcDuh5-H_OJSgqp8MZnI0ixE39WZcRBOVGTRqoEF_St8UPr7gWzI7LX1A';
const CAFE_ALT =
  'A modern artisanal coffee shop counter with warm amber lighting, brushed concrete, fresh pastries on display, and a customer tapping a smartphone for mobile pickup, captured in warm photorealistic detail.';
const BOUTIQUE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBz0_tK5vpPRI9uX6MPXOOI1t7EbV0dHh2VzsuxWkbi4KUox-rjZG3FDOE-du4TVdeDTveiPmxKC9kG0M4Lk9onafyLqjhnyYECvdObxee3ie7ogY7iXKOnPS4Z_l3nSjgmwpYaKtUb-qL6SqfNXEZU63EJ_pNJ_MHzNuZQbN00EK31nE0cdfCRWXX-TKFsFnMNh2Kak8Q74wFu-C0Cisj_4LvzyJgb1X9bMNL1LPBU8jawuYFFFxNKCA';
const BOUTIQUE_ALT =
  'A brightly lit boutique clothing studio with clean minimalist apparel racks, elegant plants, and a shopkeeper preparing stylish packages for hyper-local delivery, shot in crisp contemporary style.';

export function SubscriptionTrialConfirmScreen({
  onBack,
  onTrialStarted,
  onSubscribeNow,
}: SubscriptionTrialConfirmScreenProps) {
  const [phase, setPhase] = useState<'idle' | 'activating' | 'activated'>('idle');
  const timers = useRef<number[]>([]);

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
    if (hasActiveTrial()) {
      onTrialStarted();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartTrial = () => {
    if (phase !== 'idle') return;
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
    <AppScreen surface="bg-surface-canvas">
      <SubscriptionHeader title="Subscription Plans" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-2xl">
        <div className="flex flex-col w-full gap-space-md py-space-sm">
          {/* Celebration & Header Visual Hero */}
          <div className="relative overflow-hidden bg-gradient-to-b from-surface-tint-blue via-surface-subtle to-surface-canvas rounded-xl shadow-sm p-space-md">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-space-sm flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-md animate-pulse" />
                <div className="relative w-14 h-14 rounded-full bg-primary-container flex items-center justify-center shadow-md">
                  <Icon name="verified" filled className="text-on-primary-container text-[30px]" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-badge-discount-bg text-badge-discount-text">
                  <Icon name="check_circle" filled className="text-[14px]" />
                </span>
              </div>
              <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                Your 30-day trial starts now
              </h2>
              <p className="font-label-sm text-label-sm text-text-secondary mt-space-xs max-w-[320px]">
                Explore VEMTAP, add your products and services, create deals, manage your locations and see how
                customers interact with your business.
              </p>
              <div className="flex items-center gap-space-2xs mt-space-md">
                <div className="w-6 h-1.5 rounded-full bg-primary-container" />
                <div className="w-1.5 h-1.5 rounded-full bg-border-active" />
                <div className="w-1.5 h-1.5 rounded-full bg-border-active" />
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/5 pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-secondary-container/20 pointer-events-none" />
          </div>

          {/* Timeline & Milestone Card */}
          <div className="bg-surface-subtle rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-heading-sm text-heading-sm text-text-primary">Trial Timeline</span>
              <span className="font-caption text-caption font-medium bg-surface-tint-blue text-primary px-space-xs py-space-2xs rounded-full">
                Risk Free
              </span>
            </div>
            <div className="relative flex flex-col gap-space-md pl-space-xs">
              <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-secondary-container" />
              {TIMELINE_STEPS.map((step) => (
                <div className="relative flex items-start gap-space-sm" key={step.title}>
                  <div
                    className={`relative z-10 w-6 h-6 rounded-full ${step.circleClass} flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5`}
                  >
                    <Icon name={step.icon} filled={step.iconFill} className={`${step.iconClass} text-[14px]`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{step.title}</span>
                      <span className={`font-caption text-caption font-medium ${step.tagClass}`}>{step.tag}</span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-space-2xs">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What's Included Grid */}
          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-sm">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">What's included in your trial</h3>
              <span className="font-label-sm text-label-sm text-text-secondary">All-inclusive</span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
              {TRIAL_FEATURES.map((feature) => (
                <div className="flex items-center gap-space-xs p-space-xs bg-surface-subtle rounded-lg" key={feature.icon}>
                  <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center flex-shrink-0">
                    <Icon name={feature.icon} className="text-primary text-[18px]" />
                  </div>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                    {feature.label}
                  </span>
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-space-xs p-space-xs bg-surface-subtle rounded-lg">
                <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center flex-shrink-0">
                  <Icon name="loyalty" className="text-primary text-[18px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">
                    Customer loyalty & rewards
                  </span>
                  <span className="font-caption text-caption text-text-secondary">Keep shoppers coming back</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Callout Banner */}
          <div className="flex items-start gap-space-sm bg-surface-tint-blue rounded-xl p-space-md shadow-sm">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="security" filled className="text-primary text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-text-primary font-semibold">No Card Required</span>
              <p className="font-label-sm text-label-sm text-text-secondary mt-space-2xs leading-snug">
                No payment card is required to start your trial. You will not be automatically charged.
              </p>
            </div>
          </div>

          {/* Merchant Preview Snapshots */}
          <div className="flex items-center justify-between px-space-xs pt-space-xs">
            <span className="font-label-sm text-label-sm text-text-secondary">Supported Merchant Categories</span>
            <span className="font-caption text-caption text-primary">Over 4,200 local spots</span>
          </div>
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="relative h-28 rounded-xl overflow-hidden shadow-sm">
              <img alt={CAFE_ALT} className="w-full h-full object-cover" src={CAFE_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/20 to-transparent flex flex-col justify-end p-space-xs">
                <span className="font-label-sm text-label-sm text-surface-canvas font-semibold">Cafes & Dining</span>
                <span className="font-caption text-caption text-surface-tint-blue">Smart orders active</span>
              </div>
            </div>
            <div className="relative h-28 rounded-xl overflow-hidden shadow-sm">
              <img alt={BOUTIQUE_ALT} className="w-full h-full object-cover" src={BOUTIQUE_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/20 to-transparent flex flex-col justify-end p-space-xs">
                <span className="font-label-sm text-label-sm text-surface-canvas font-semibold">
                  Retail & Fashion
                </span>
                <span className="font-caption text-caption text-surface-tint-blue">Live discovery deals</span>
              </div>
            </div>
          </div>

          {/* Action Deck */}
          <div className="flex flex-col gap-space-xs pt-space-sm pb-space-lg">
            <button
              className={`w-full h-[44px] rounded-xl font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all ${
                phase === 'activated'
                  ? 'bg-badge-discount-text text-on-primary'
                  : 'bg-primary-container text-on-primary'
              }`}
              id="start-trial-btn"
              type="button"
              disabled={phase !== 'idle'}
              onClick={handleStartTrial}
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
            <button
              className="w-full h-[44px] rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs hover:bg-surface-tint-blue active:scale-[0.98] transition-all"
              id="subscribe-now-btn"
              type="button"
              onClick={onSubscribeNow}
            >
              <span>Subscribe Now Instead</span>
              <span className="text-text-secondary">(₦5,000/mo)</span>
            </button>
            <p className="text-center font-caption text-caption text-text-tertiary mt-space-2xs">
              Tap to proceed. Instant activation in 3 seconds.
            </p>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
