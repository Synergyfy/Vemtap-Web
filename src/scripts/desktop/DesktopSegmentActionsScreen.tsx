import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome } from './BusinessPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { SegmentRef } from '../BusinessSegmentsHubScreen';

interface DesktopSegmentActionsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  segment: SegmentRef;
  onBack: () => void;
  onLaunchCampaign: () => void;
  onOpenMessages: () => void;
  onOpenDeals: () => void;
  onOpenCrm: () => void;
}

export function DesktopSegmentActionsScreen({
  onNav,
  segment,
  onBack,
  onLaunchCampaign,
  onOpenMessages,
  onOpenDeals,
  onOpenCrm,
}: DesktopSegmentActionsScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

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
    <BusinessPortalChrome activeNav="business-customers" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm flex-wrap">
            <button type="button" className="hover:text-primary transition-colors" onClick={() => onNav('customers')}>
              Customers
            </button>
            <Icon name="chevron_right" className="text-outline text-[16px]" />
            <button type="button" className="hover:text-primary transition-colors" onClick={onBack}>
              Customer Segments
            </button>
            <Icon name="chevron_right" className="text-outline text-[16px]" />
            <span className="text-text-primary font-semibold">Segment Actions Sheet</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-space-2xs text-text-secondary hover:text-primary transition-colors font-label-md text-label-md w-fit"
            onClick={onBack}
          >
            <Icon name="close" className="text-[18px]" />
            <span>Back to Customer Segments</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption uppercase tracking-wider font-semibold">
                Audience Activation
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="text-caption font-caption text-text-tertiary">
                Marketing actions respect customer frequency caps
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Use Segment: {segment.name}
            </h1>
            <div className="flex items-center gap-space-2xs text-text-secondary font-label-md text-label-md flex-wrap">
              <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text" />
              <span>{segment.count} verified diners</span>
              <span className="text-text-tertiary">•</span>
              <span>{segment.meta}</span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed pt-space-2xs">
              Directly connect with and trigger retention loops across this high-value audience.
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              onClick={() => showToast('Marketing actions respect customer frequency caps')}
              className="px-space-md h-[46px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-xs shadow-sm"
            >
              <Icon name="help_outline" className="text-[18px] text-secondary" />
              <span>Frequency Caps</span>
            </button>
            <button
              type="button"
              onClick={onLaunchCampaign}
              className="px-space-lg h-[46px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
            >
              <span>Create Campaign</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-caption font-caption uppercase tracking-wider font-semibold">Verified Diners</span>
              <Icon name="groups" className="text-[18px] text-primary" filled />
            </div>
            <div className="mt-space-2xs flex items-baseline gap-1.5">
              <span className="font-heading-md text-heading-md text-text-primary font-bold leading-none">
                {segment.count}
              </span>
              <span className="text-caption font-caption text-badge-discount-text font-medium">Reachable</span>
            </div>
          </div>
          <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-caption font-caption uppercase tracking-wider font-semibold">Channel Reach</span>
              <Icon name="cell_tower" className="text-[18px] text-secondary" filled />
            </div>
            <div className="mt-space-2xs">
              <span className="font-label-md text-label-md text-text-primary font-semibold">
                {segment.count === '294' ? '264 Push/Feed ready' : 'Push/Feed ready'}
              </span>
              <span className="block text-caption font-caption text-text-secondary">
                <span className="text-text-tertiary mx-1">•</span> In-App Message ready
              </span>
            </div>
          </div>
          <div className="bg-surface-tint-blue rounded-xl p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-caption font-caption text-primary uppercase tracking-wider font-semibold">
                Total Spend
              </span>
              <Icon name="payments" className="text-[18px] text-primary" />
            </div>
            <div className="mt-space-2xs flex items-baseline gap-1.5">
              <span className="font-heading-md text-heading-md text-text-primary font-bold leading-none">₦3.28M</span>
              <span className="text-caption font-caption text-text-secondary">Trailing 90 days</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-lg items-start">
          <div className="flex flex-col gap-space-md min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                  Choose Marketing Action
                </h2>
                <p className="text-caption font-caption text-text-secondary">
                  Directly connect with and trigger retention loops across this high-value audience.
                </p>
              </div>
            </div>

            <div className="flex flex-col p-space-md rounded-xl bg-surface-canvas shadow-sm gap-space-sm">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <Icon name="rocket_launch" className="text-[22px]" filled />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-space-2xs">
                      <h3 className="text-heading-sm font-heading-sm text-text-primary truncate">
                        Create Structured Campaign
                      </h3>
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
              <p className="text-body-md font-body-md text-text-secondary">
                Launch a targeted multi-day campaign featuring deals, products, or storefront visibility directly to
                this segment.
              </p>
              <div className="flex items-center gap-space-2xs text-caption font-caption text-text-tertiary">
                <Icon name="auto_fix_high" className="text-[15px]" />
                <span>Pre-fills this segment in Step 3 of Campaign Creator</span>
              </div>
              <button
                className="w-full h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center gap-space-xs font-button-primary text-button-primary shadow-md hover:bg-primary transition-all"
                type="button"
                onClick={onLaunchCampaign}
              >
                <span>Create Campaign</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>

            <div className="flex flex-col p-space-md rounded-xl bg-surface-canvas shadow-sm gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                  <Icon name="bolt" className="text-[22px]" filled />
                </div>
                <div className="min-w-0">
                  <h3 className="text-heading-sm font-heading-sm text-text-primary">Send Direct In-App Message</h3>
                  <p className="text-caption font-caption text-text-secondary mt-0.5">High-touch 1-on-1 dialogue</p>
                </div>
              </div>
              <p className="text-body-md font-body-md text-text-secondary">
                Send a personalized conversational greeting or exclusive voucher directly to customers who have
                messaged you.
              </p>
              <div className="flex items-center gap-space-2xs text-caption font-caption text-text-tertiary">
                <Icon name="verified_user" className="text-[15px]" />
                <span>Respects messaging rules &amp; opt-in consent</span>
              </div>
              <button
                className="w-full h-11 rounded-xl bg-surface-container text-on-primary-fixed flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary hover:bg-surface-container-high transition-all"
                type="button"
                onClick={onOpenMessages}
              >
                <span>Compose Message</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>

            <div className="flex flex-col p-space-md rounded-xl bg-surface-canvas shadow-sm gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high text-tertiary flex items-center justify-center shrink-0">
                  <Icon name="local_fire_department" className="text-[22px]" filled />
                </div>
                <div className="min-w-0">
                  <h3 className="text-heading-sm font-heading-sm text-text-primary">Promote an Exclusive Deal</h3>
                  <p className="text-caption font-caption text-text-secondary mt-0.5">Incentivize your next visits</p>
                </div>
              </div>
              <p className="text-body-md font-body-md text-text-secondary">
                Attach an existing or new deal (e.g., 20% Off Lunch) and boost its visibility exclusively to this
                cohort.
              </p>
              <div className="flex items-center gap-space-2xs text-caption font-caption text-text-tertiary">
                <Icon name="local_offer" className="text-[15px]" />
                <span>Boost appears in their Deals Feed &amp; Spotlight</span>
              </div>
              <button
                className="w-full h-11 rounded-xl bg-surface-container text-on-primary-fixed flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary hover:bg-surface-container-high transition-all"
                type="button"
                onClick={onOpenDeals}
              >
                <span>Promote Deal</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-space-md min-w-0 lg:sticky lg:top-20">
            <div className="flex flex-col p-space-md rounded-xl bg-surface-container-low shadow-sm gap-space-sm">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="groups" className="text-[20px]" filled />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-label-md font-label-md font-semibold text-text-primary truncate">
                      {segment.name}
                    </h3>
                    <p className="text-caption font-caption text-text-secondary">Urban Grill &amp; Bistro</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-caption font-caption text-text-secondary block">Total Spend</span>
                  <span className="text-label-md font-label-md font-semibold text-text-primary">₦3.28M</span>
                </div>
              </div>
              <p className="text-body-md font-body-md text-text-secondary leading-snug">{segment.desc}</p>
              <div className="flex items-center gap-space-xs bg-surface-canvas p-space-xs rounded-lg">
                <Icon name="cell_tower" className="text-[16px] text-primary" filled />
                <span className="text-caption font-caption text-text-primary font-medium">
                  {segment.count === '294' ? '264 Push/Feed ready' : 'Push/Feed ready'}{' '}
                  <span className="text-text-tertiary mx-1">•</span> In-App Message ready
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-canvas shadow-sm gap-space-xs">
              <div className="flex items-center gap-space-sm min-w-0 pr-space-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-container text-secondary flex items-center justify-center shrink-0">
                  <Icon name="contact_page" className="text-[22px]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-label-md font-label-md font-semibold text-text-primary truncate">
                    Inspect Cohort in Customer CRM
                  </h3>
                  <p className="text-caption font-caption text-text-secondary truncate">
                    View individual profiles &amp; history
                  </p>
                </div>
              </div>
              <button
                className="shrink-0 h-10 px-space-md rounded-lg bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-primary hover:text-on-primary transition-colors"
                type="button"
                onClick={onOpenCrm}
              >
                <span>Open CRM</span>
                <Icon name="north_east" className="text-[16px]" />
              </button>
            </div>

            <div className="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low">
              <div className="w-7 h-7 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="shield" className="text-[18px]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-label-sm font-label-sm font-semibold text-text-primary">
                  VEMTAP Fair Communication Rules
                </h4>
                <p className="text-caption font-caption text-text-secondary leading-relaxed">
                  Direct messaging is restricted to business-relevant updates and respects customer frequency caps.
                  Campaign delivery is paced to ensure maximum engagement without notification fatigue.
                </p>
              </div>
            </div>

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
        <div className="fixed bottom-6 right-6 z-50 max-w-md px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface font-label-md text-label-md shadow-xl flex items-center gap-2">
          <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
          <span className="truncate">{toast}</span>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
