import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { SegmentRef } from './BusinessSegmentsHubScreen';

interface BusinessSegmentActionsScreenProps {
  segment: SegmentRef;
  onBack: () => void;
  onLaunchCampaign: () => void;
  onOpenMessages: () => void;
  onOpenDeals: () => void;
  onOpenCrm: () => void;
}

export function BusinessSegmentActionsScreen({
  segment,
  onBack,
  onLaunchCampaign,
  onOpenMessages,
  onOpenDeals,
  onOpenCrm,
}: BusinessSegmentActionsScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  return (
    <AppScreen surface="bg-surface">
      <header className="sticky top-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back or close"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="close" className="text-[24px]" />
            </button>
            <h1 className="text-heading-sm font-heading-sm text-text-primary tracking-tight truncate">
              Segment Actions Sheet
            </h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Help or Information"
              className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container transition-colors"
              type="button"
              onClick={() => showToast('Marketing actions respect customer frequency caps')}
            >
              <Icon name="help_outline" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        <div className="flex flex-col w-full px-margin pt-space-xs pb-space-2xl">
          <div className="flex justify-center items-center py-space-xs mb-space-xs">
            <div className="w-10 h-1 rounded-full bg-outline-variant" />
          </div>

          <div className="flex flex-col w-full gap-space-2xs mb-space-md">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption uppercase tracking-wider font-semibold">
                Audience Activation
              </div>
              <button
                aria-label="Dismiss Sheet"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                type="button"
                onClick={onBack}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <div className="flex flex-col mt-space-2xs">
              <h2 className="text-heading-md font-heading-md text-text-primary tracking-tight">
                Use Segment: {segment.name}
              </h2>
              <div className="flex items-center gap-space-2xs mt-1 text-text-secondary font-label-md text-label-md flex-wrap">
                <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text" />
                <span>{segment.count} verified diners</span>
                <span className="text-text-tertiary">•</span>
                <span>{segment.meta}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full p-space-md rounded-xl bg-surface-container-low shadow-sm mb-space-lg">
            <div className="flex items-start justify-between gap-space-sm mb-space-sm">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                  <Icon name="groups" className="text-[20px]" filled />
                </div>
                <div className="min-w-0">
                  <h3 className="text-label-md font-label-md font-semibold text-text-primary truncate">
                    {segment.name}
                  </h3>
                  <p className="text-caption font-caption text-text-secondary">Urban Grill & Bistro</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-caption font-caption text-text-secondary block">Total Spend</span>
                <span className="text-label-md font-label-md font-semibold text-text-primary">₦3.28M</span>
              </div>
            </div>
            <p className="text-body-md font-body-md text-text-secondary leading-snug mb-space-sm">{segment.desc}</p>
            <div className="flex items-center gap-space-xs pt-space-xs bg-surface-canvas/60 p-space-xs rounded-lg">
              <Icon name="cell_tower" className="text-[16px] text-primary" filled />
              <span className="text-caption font-caption text-text-primary font-medium">
                {segment.count === '294' ? '264 Push/Feed ready' : 'Push/Feed ready'}{' '}
                <span className="text-text-tertiary mx-1">•</span> In-App Message ready
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-2xs mb-space-sm">
            <h3 className="text-label-md font-label-md font-semibold text-text-primary">Choose Marketing Action</h3>
            <p className="text-caption font-caption text-text-secondary">
              Directly connect with and trigger retention loops across this high-value audience.
            </p>
          </div>

          <div className="flex flex-col gap-space-sm w-full mb-space-lg">
            <div className="relative flex flex-col p-space-md rounded-xl bg-surface-canvas shadow-sm">
              <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <Icon name="rocket_launch" className="text-[22px]" filled />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-space-2xs">
                      <h4 className="text-heading-sm font-heading-sm text-text-primary truncate">
                        Create Structured Campaign
                      </h4>
                      <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                        Recommended
                      </span>
                    </div>
                    <p className="text-caption font-caption text-text-secondary mt-0.5">
                      Automated multi-channel reach
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-body-md font-body-md text-text-secondary mb-space-sm">
                Launch a targeted multi-day campaign featuring deals, products, or storefront visibility directly to
                this segment.
              </p>
              <div className="flex items-center gap-space-2xs text-caption font-caption text-text-tertiary mb-space-md">
                <Icon name="auto_fix_high" className="text-[15px]" />
                <span>Pre-fills this segment in Step 3 of Campaign Creator</span>
              </div>
              <button
                className="w-full h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center gap-space-xs font-button-primary text-button-primary shadow-md hover:bg-primary transition-all active:scale-[0.98]"
                type="button"
                onClick={onLaunchCampaign}
              >
                <span>Create Campaign</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>

            <div className="flex flex-col p-space-md rounded-xl bg-surface-canvas shadow-sm">
              <div className="flex items-start gap-space-sm mb-space-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                  <Icon name="bolt" className="text-[22px]" filled />
                </div>
                <div className="min-w-0">
                  <h4 className="text-heading-sm font-heading-sm text-text-primary">Send Direct In-App Message</h4>
                  <p className="text-caption font-caption text-text-secondary mt-0.5">High-touch 1-on-1 dialogue</p>
                </div>
              </div>
              <p className="text-body-md font-body-md text-text-secondary mb-space-sm">
                Send a personalized conversational greeting or exclusive voucher directly to customers who have
                messaged you.
              </p>
              <div className="flex items-center gap-space-2xs text-caption font-caption text-text-tertiary mb-space-md">
                <Icon name="verified_user" className="text-[15px]" />
                <span>Respects messaging rules & opt-in consent</span>
              </div>
              <button
                className="w-full h-11 rounded-xl bg-surface-container text-on-primary-fixed flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary hover:bg-surface-container-high transition-all active:scale-[0.98]"
                type="button"
                onClick={onOpenMessages}
              >
                <span>Compose Message</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>

            <div className="flex flex-col p-space-md rounded-xl bg-surface-canvas shadow-sm">
              <div className="flex items-start gap-space-sm mb-space-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high text-tertiary-container flex items-center justify-center shrink-0">
                  <Icon name="local_fire_department" className="text-[22px]" filled />
                </div>
                <div className="min-w-0">
                  <h4 className="text-heading-sm font-heading-sm text-text-primary">Promote an Exclusive Deal</h4>
                  <p className="text-caption font-caption text-text-secondary mt-0.5">Incentivize your next visits</p>
                </div>
              </div>
              <p className="text-body-md font-body-md text-text-secondary mb-space-sm">
                Attach an existing or new deal (e.g., 20% Off Lunch) and boost its visibility exclusively to this
                cohort.
              </p>
              <div className="flex items-center gap-space-2xs text-caption font-caption text-text-tertiary mb-space-md">
                <Icon name="local_offer" className="text-[15px]" />
                <span>Boost appears in their Deals Feed & Spotlight</span>
              </div>
              <button
                className="w-full h-11 rounded-xl bg-surface-container text-on-primary-fixed flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary hover:bg-surface-container-high transition-all active:scale-[0.98]"
                type="button"
                onClick={onOpenDeals}
              >
                <span>Promote Deal</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>

            <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-canvas shadow-sm gap-space-xs">
              <div className="flex items-center gap-space-sm min-w-0 pr-space-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-container text-secondary flex items-center justify-center shrink-0">
                  <Icon name="contact_page" className="text-[22px]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-label-md font-label-md font-semibold text-text-primary truncate">
                    Inspect Cohort in Customer CRM
                  </h4>
                  <p className="text-caption font-caption text-text-secondary truncate">
                    View individual profiles & history
                  </p>
                </div>
              </div>
              <button
                className="shrink-0 h-10 px-space-md rounded-lg bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-primary hover:text-on-primary transition-colors active:scale-95"
                type="button"
                onClick={onOpenCrm}
              >
                <span>Open CRM</span>
                <Icon name="north_east" className="text-[16px]" />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low mb-space-lg">
            <div className="w-7 h-7 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="shield" className="text-[18px]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h5 className="text-label-sm font-label-sm font-semibold text-text-primary">
                VEMTAP Fair Communication Rules
              </h5>
              <p className="text-caption font-caption text-text-secondary leading-relaxed">
                Direct messaging is restricted to business-relevant updates and respects customer frequency caps.
                Campaign delivery is paced to ensure maximum engagement without notification fatigue.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-space-xs">
            <button
              className="h-11 px-space-md flex items-center justify-center gap-space-xs text-text-secondary hover:text-text-primary font-label-md text-label-md font-medium transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Customer Segments</span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
