import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { hasApiConfig } from '../services/api/client';
import { useActiveSubscription, useSubscriptionPlans } from '../hooks/business/useSubscription';
import { featuredPlan, planPriceLine, renewalDate, trialDaysLeft } from './subscriptionLive';
import { SubscriptionHeader } from './SubscriptionHeader';

interface SubscriptionTrialActiveScreenProps {
  onBack: () => void;
  onExploreDashboard: () => void;
  onSubscribe: () => void;
  onCreateCampaign?: () => void;
}

const TRIAL_INCLUDES = [
  {
    icon: 'check',
    title: 'Multiple business locations active',
    sub: 'Apo, Wuse II branches live and verifiable',
    stacked: true,
  },
  { icon: 'check', title: 'Products & services catalog' },
  { icon: 'check', title: 'Live deals & customer vouchers' },
  { icon: 'check', title: 'Hyper-local customer discovery' },
  { icon: 'check', title: 'In-app direct messaging' },
  { icon: 'check', title: 'Performance analytics & scan counts' },
  { icon: 'check', title: 'Customer loyalty & Tap rewards' },
  { icon: 'check', title: 'Official Business QR code' },
];

export function SubscriptionTrialActiveScreen({
  onBack,
  onExploreDashboard,
  onSubscribe,
  onCreateCampaign,
}: SubscriptionTrialActiveScreenProps) {
  const live = hasApiConfig();
  const subscription = useActiveSubscription();
  const plans = useSubscriptionPlans();

  // Live: the real trial subscription drives the timeline; demo keeps the
  // scripted "day 7 of 30" snapshot.
  const sub = subscription.data ?? null;
  const featured = featuredPlan(plans.data ?? []);
  const planName = sub?.plan?.name ?? featured?.name ?? 'Growth';
  const priceLine = featured ? planPriceLine(featured, 'monthly') : null;
  const totalDays = featured?.trialDurationDays ?? 30;
  const daysLeft = live ? trialDaysLeft(sub) ?? 0 : 23;
  const elapsed = Math.max(0, totalDays - daysLeft);
  const widthPct = totalDays ? Math.round((elapsed / totalDays) * 1000) / 10 : 0;
  const startText = sub?.startDate
    ? new Date(sub.startDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const endText = renewalDate(sub?.trialEndsAt ?? sub?.endDate);

  return (
    <AppScreen surface="bg-surface-canvas">
      <SubscriptionHeader title="Subscription Plans" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-8">
        {/* Status Header */}
        <div className="pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-space-xs bg-badge-discount-bg text-badge-discount-text px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-label-sm text-label-sm tracking-wide uppercase font-semibold">Live Subscription</span>
          </div>
          <span className="font-caption text-caption text-text-tertiary">
            {live && sub?.id ? `ID: #VEM-${sub.id.replace(/-/g, '').slice(0, 6).toUpperCase()}` : 'ID: #VEM-88204'}
          </span>
        </div>
        <div className="flex flex-col gap-1 mb-5">
          <h2 className="font-heading-md text-heading-md font-semibold text-text-primary tracking-tight">
            {planName} Trial Active
          </h2>
          <p className="font-label-sm text-label-sm text-text-secondary">
            You're currently exploring VEMTAP {planName} for free.
          </p>
        </div>

        {/* Plan Timeline Card */}
        <div className="bg-surface-subtle rounded-2xl p-4 shadow-sm mb-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-surface-tint-blue rounded-full opacity-60 pointer-events-none" />
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                Plan Timeline
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-heading-lg text-heading-lg text-primary-container font-bold">{daysLeft}</span>
                <span className="font-label-md text-label-md text-text-primary font-semibold">days remaining</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary-container">
              <Icon name="hourglass_top" className="text-[20px]" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden p-0.5">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${live ? widthPct : 23.33}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-text-secondary">
              <span className="font-caption text-caption">
                Day {live ? elapsed : 7} of {totalDays} used
              </span>
              <span className="font-caption text-caption font-medium text-text-primary">
                {live ? widthPct : 23}% elapsed
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 text-text-secondary bg-surface-canvas/60 rounded-xl px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Icon name="calendar_today" className="text-[15px] text-text-tertiary" />
              <span className="font-caption text-caption">{startText ?? 'Oct 18, 2024'}</span>
            </div>
            <span className="font-caption text-caption text-text-tertiary">•</span>
            <div className="flex items-center gap-1.5">
              <Icon name="event_available" className="text-[15px] text-text-tertiary" />
              <span className="font-caption text-caption font-medium text-text-primary">{endText ?? 'Nov 17, 2024'}</span>
            </div>
          </div>
        </div>

        {/* Growth Visibility Nudge */}
        <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm flex flex-col gap-3 border-l-4 border-primary-container mb-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
              <Icon name="rocket_launch" className="text-primary text-[20px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-md text-label-md font-semibold text-text-primary">
                Get seen 3.4x more with Growth
              </p>
              <p className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">
                Your trial keeps the lights on — Growth puts you at the top of neighborhood discovery with priority pin
                placement, the verified badge and hyperlocal deal broadcast.
              </p>
            </div>
          </div>
          {onCreateCampaign && (
            <button
              type="button"
              onClick={onCreateCampaign}
              className="w-full sm:w-auto self-start px-4 py-2 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-on-primary font-label-md text-label-md font-semibold shadow-[0_4px_14px_-3px_rgba(6,108,244,0.35)]"
            >
              <Icon name="campaign" className="text-[18px]" />
              <span>Create Campaign</span>
            </button>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-2.5 mb-5">
          <button
            className="w-full h-11 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(6,108,244,0.35)] text-on-primary font-label-md text-label-md font-semibold"
            type="button"
            onClick={onExploreDashboard}
          >
            <span>Continue to Cluster</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <button
            className="w-full h-11 bg-surface-tint-blue active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-1.5 text-primary-container font-label-md text-label-md font-semibold shadow-sm"
            type="button"
            onClick={onSubscribe}
          >
            <Icon name="verified" className="text-[18px]" />
            <span>
              Subscribe Now & Lock In {planName}
              {priceLine ? ` (${priceLine.split(' / ')[0]}/mo)` : ' (₦5,000/mo)'}
            </span>
          </button>
        </div>

        {/* Active Trial Includes */}
        <div className="flex flex-col gap-2.5 mb-5">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-label-md font-semibold text-text-primary">
              Your active trial includes
            </h3>
            <span className="font-caption text-caption text-text-tertiary">All-Inclusive</span>
          </div>
          <div className="bg-surface-subtle rounded-2xl p-3.5 flex flex-col gap-3 shadow-sm">
            {TRIAL_INCLUDES.map((item) => (
              <div className={`flex ${item.stacked ? 'items-start' : 'items-center'} gap-2.5`} key={item.title}>
                <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={item.icon} className="text-badge-discount-text text-[15px]" />
                </div>
                {item.stacked ? (
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md font-medium text-text-primary">{item.title}</span>
                    <span className="font-caption text-caption text-text-secondary">{item.sub}</span>
                  </div>
                ) : (
                  <span className="font-label-md text-label-md text-text-primary">{item.title}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gentle Guarantee Card */}
        <div className="bg-surface-subtle rounded-2xl p-3.5 flex items-start gap-3 shadow-sm mb-4">
          <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center flex-shrink-0 text-primary-container">
            <Icon name="notifications_active" className="text-[16px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-text-primary">Gentle Guarantee</span>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              We'll send you an in-app and email reminder 3 days before your trial ends. No unexpected surprises or
              charges.
            </p>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
