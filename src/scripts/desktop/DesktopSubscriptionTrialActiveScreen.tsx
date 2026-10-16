import { Icon } from '../../components/ui/Icon';
import { SubscriptionChrome } from './SubscriptionChrome';

interface DesktopSubscriptionTrialActiveScreenProps {
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

const WEEKLY_FOOTFALL = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 55 },
  { day: 'Wed', value: 38 },
  { day: 'Thu', value: 61 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 100 },
  { day: 'Sun', value: 72 },
];

const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;
const RING_PCT = 0.2333;

export function DesktopSubscriptionTrialActiveScreen({
  onBack,
  onExploreDashboard,
  onSubscribe,
  onCreateCampaign,
}: DesktopSubscriptionTrialActiveScreenProps) {
  return (
    <SubscriptionChrome
      onBrand={onBack}
      activeNav="billing"
      breadcrumb="Trial Status"
      statusPills={['Invoices', 'Payment Vault']}
    >
      <div className="max-w-6xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-badge-discount-bg/30 via-surface-subtle to-surface-canvas shadow-sm">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/5 pointer-events-none blur-2xl" />
          <div className="relative z-10 p-space-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  <span className="font-label-sm text-label-sm tracking-wide uppercase font-semibold">
                    Live Subscription
                  </span>
                </span>
                <span className="font-caption text-caption text-text-tertiary">Merchant ID #VEM-88204</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                VEMTAP Growth Trial Active
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary">
                You're currently exploring VEMTAP Growth for free.
              </p>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-canvas/80 border border-border-subtle/60 shadow-sm">
              <Icon name="lan" className="text-badge-discount-text text-[16px]" />
              <span className="font-caption text-caption text-text-secondary">Growth node: connected</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <section className="relative rounded-2xl bg-surface-subtle p-space-lg shadow-sm overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-surface-tint-blue rounded-full opacity-60 pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between mb-space-md">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                    Plan Timeline
                  </span>
                  <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                    <span className="font-heading-lg text-heading-lg text-primary-container font-bold">23</span>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">days remaining</span>
                  </div>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                    <circle cx="32" cy="32" r={RING_R} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" />
                    <circle
                      cx="32"
                      cy="32"
                      r={RING_R}
                      fill="none"
                      stroke="currentColor"
                      className="text-primary-container"
                      strokeDasharray={`${RING_PCT * RING_C} ${RING_C}`}
                      strokeLinecap="round"
                      strokeWidth="6"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-label-md text-label-md text-primary-container font-bold">
                    23%
                  </span>
                </div>
              </div>
              <div className="relative z-10 flex flex-col gap-space-2xs mb-space-md">
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden flex gap-0.5 p-0.5">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '23.33%' }} />
                  <div className="bg-border-active/40 h-full flex-1 rounded-full" />
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span className="font-caption text-caption">Day 7 of 30 used</span>
                  <span className="font-caption text-caption font-medium text-text-primary">23% elapsed</span>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-between pt-space-xs text-text-secondary bg-surface-canvas/60 rounded-xl px-space-sm py-space-2xs">
                <div className="flex items-center gap-space-2xs">
                  <Icon name="calendar_today" className="text-[15px] text-text-tertiary" />
                  <span className="font-caption text-caption">Oct 18, 2024</span>
                </div>
                <span className="font-caption text-caption text-text-tertiary">•</span>
                <div className="flex items-center gap-space-2xs">
                  <Icon name="event_available" className="text-[15px] text-text-tertiary" />
                  <span className="font-caption text-caption font-medium text-text-primary">Nov 17, 2024</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-surface-canvas p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-l-4 border-primary-container">
              <div className="flex items-start gap-space-sm min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
                  <Icon name="rocket_launch" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-label-md font-semibold text-text-primary">
                    Get seen 3.4x more with Growth
                  </p>
                  <p className="font-caption text-caption text-text-secondary mt-space-2xs leading-snug">
                    Your trial keeps the lights on — Growth puts you at the top of neighborhood discovery with priority
                    pin placement, the verified badge and hyperlocal deal broadcast.
                  </p>
                </div>
              </div>
              {onCreateCampaign && (
                <button
                  type="button"
                  onClick={onCreateCampaign}
                  className="shrink-0 h-10 px-space-md bg-primary-container hover:bg-primary-hover active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-space-xs text-on-primary font-label-md text-label-md font-semibold shadow-[0_4px_14px_-3px_rgba(6,108,244,0.35)]"
                >
                  <Icon name="campaign" className="text-[18px]" />
                  <span>Create Campaign</span>
                </button>
              )}
            </section>

            <section className="flex flex-col sm:flex-row gap-space-sm">
              <button
                className="flex-1 h-11 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_20px_-4px_rgba(6,108,244,0.35)] text-on-primary font-label-md text-label-md font-semibold"
                type="button"
                onClick={onExploreDashboard}
              >
                <span>Continue to Cluster</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <button
                className="flex-1 h-11 bg-surface-tint-blue active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-space-2xs text-primary-container font-label-md text-label-md font-semibold shadow-sm"
                type="button"
                onClick={onSubscribe}
              >
                <Icon name="verified" className="text-[18px]" />
                <span>Subscribe Now &amp; Lock In Growth (₦5,000/mo)</span>
              </button>
            </section>

            <section className="rounded-xl bg-surface-subtle p-space-md shadow-sm flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0 text-primary-container">
                <Icon name="notifications_active" className="text-[16px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-text-primary">Gentle Guarantee</span>
                <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                  We'll send you an in-app and email reminder 3 days before your trial ends. No unexpected surprises or
                  charges.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
              <section className="rounded-xl bg-surface-canvas p-space-md shadow-sm border border-border-subtle/60">
                <div className="flex items-center justify-between mb-space-sm">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">QR Desk</h3>
                  <Icon name="qr_code_scanner" className="text-primary text-[20px]" />
                </div>
                <div className="flex items-center gap-space-md">
                  <div className="w-20 h-20 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-border-subtle">
                    <Icon name="qr_code_2" className="text-text-primary text-[48px]" />
                  </div>
                  <div className="flex flex-col gap-space-2xs">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Table passes live</span>
                    <span className="font-caption text-caption text-text-secondary">128 scans this week</span>
                    <span className="font-caption text-caption text-badge-discount-text font-semibold">+18% vs last</span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl bg-surface-canvas p-space-md shadow-sm border border-border-subtle/60">
                <div className="flex items-center justify-between mb-space-sm">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Weekly Footfall</h3>
                  <Icon name="insights" className="text-primary text-[20px]" />
                </div>
                <div className="flex items-end justify-between gap-space-2xs h-20">
                  {WEEKLY_FOOTFALL.map((bar) => (
                    <div key={bar.day} className="flex flex-col items-center gap-space-2xs flex-1">
                      <div
                        className="w-full rounded-t bg-primary-container/80"
                        style={{ height: `${bar.value}%` }}
                        title={`${bar.value}`}
                      />
                      <span className="font-caption text-caption text-text-tertiary">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Your active trial includes</h3>
                <span className="font-caption text-caption text-text-tertiary">8 of 8</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {TRIAL_INCLUDES.map((item) => (
                  <div
                    className={`flex ${item.stacked ? 'items-start' : 'items-center'} gap-space-sm`}
                    key={item.title}
                  >
                    <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name={item.icon} filled className="text-badge-discount-text text-[14px]" />
                    </div>
                    {item.stacked ? (
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-medium text-text-primary">{item.title}</span>
                        <span className="font-caption text-caption text-text-secondary">{item.sub}</span>
                        <div className="flex gap-space-2xs mt-space-2xs flex-wrap">
                          {['Apo', 'Wuse II'].map((chip) => (
                            <span
                              key={chip}
                              className="px-space-2xs py-0.5 rounded bg-surface-tint-blue text-primary-container font-caption text-caption"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="font-label-md text-label-md text-text-primary">{item.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-border-subtle/60 flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs min-w-0">
                <Icon name="apartment" className="text-primary text-[18px] shrink-0" />
                <span className="font-label-sm text-label-sm text-text-primary truncate">
                  Running 10+ branches? Enterprise desk
                </span>
              </div>
              <button
                type="button"
                className="shrink-0 font-label-sm text-label-sm text-primary-container hover:underline"
              >
                Contact
              </button>
            </section>

            <section className="rounded-xl bg-surface-tint-blue p-space-md shadow-sm flex items-start gap-space-sm">
              <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <Icon name="support_agent" className="text-primary text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Need a hand?</span>
                <p className="font-caption text-caption text-text-secondary mt-space-2xs leading-relaxed">
                  Our merchant success team is one message away — replies within minutes on WhatsApp.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SubscriptionChrome>
  );
}
