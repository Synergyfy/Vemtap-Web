import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationReviewScreenProps {
  onBack: () => void;
  onReviewComplete: () => void;
  onCatalog?: () => void;
  onDeals?: () => void;
  onProfile?: () => void;
  legalName: string;
  businessName: string;
  onBrand?: () => void;
}

type ReviewPhase = 0 | 1 | 2;

const PREVIEW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA8LOWRhd0z-_DIWvR_N1jp6VCFHIjD8uZ5vi_ttuIeqKyFYmeqoxXjeyN5Wyhyl8bt3rXwwYhm5KuMgpRDhxdM0HCHEOiwhoGJ9v036UzIdXntBW63MczDG6yXQZXEQbqRZ46cJj3rUZXUehwyu98gosrmGzuEitMtZAdaxuEMi3MyosAWSVIdFdSkvSlmihUs3pkPRVGQi25-fc4VTj4J-yEjVOVIEXjmNh42Ushb3eQHf3jccdDY2A';

const ACTION_ITEMS = [
  {
    icon: 'restaurant_menu',
    title: 'Configure Storefront & Menu',
    tag: 'Popular' as const,
    body: 'Upload dish photos, build pricing modifiers, and set open hours.',
    onClickKey: 'catalog' as const,
  },
  {
    icon: 'local_offer',
    title: 'Create Your First Deal',
    tag: null,
    body: 'Draft a 15% happy hour voucher ready to broadcast on launch day.',
    onClickKey: 'deals' as const,
  },
  {
    icon: 'qr_code_2',
    title: 'Download Table QR Stands',
    tag: null,
    body: 'Export high-res print templates for counter and table tap-points.',
    onClickKey: 'profile' as const,
  },
];

export function DesktopVerificationReviewScreen({
  onBack,
  onReviewComplete,
  onCatalog,
  onDeals,
  onProfile,
  legalName,
  businessName,
  onBrand,
}: DesktopVerificationReviewScreenProps) {
  const [phase, setPhase] = useState<ReviewPhase>(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.push(window.setTimeout(() => setPhase(1), 2500));
    timers.current.push(window.setTimeout(() => setPhase(2), 5200));
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  const fastForward = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setPhase(2);
  };

  const reviewComplete = phase === 2;

  const handleAction = (key: 'catalog' | 'deals' | 'profile') => {
    if (key === 'catalog') onCatalog?.();
    else if (key === 'deals') onDeals?.();
    else onProfile?.();
  };

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-6xl mx-auto w-full py-space-md flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-sm p-space-xl md:p-space-2xl flex flex-col items-center text-center">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-surface-tint-blue rounded-full blur-2xl pointer-events-none" />
          <div className="relative mb-space-md">
            <div className="relative w-20 h-20 rounded-full bg-surface-tint-blue flex items-center justify-center shadow-md">
              <span className="absolute inset-0 rounded-full bg-primary-container/20 animate-ping" />
              <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary-container/30 to-surface-tint/10 animate-pulse" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-surface-canvas flex items-center justify-center text-primary-container shadow-sm">
                <Icon name="published_with_changes" className="text-[32px]" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <Icon name="verified" filled className="text-[15px]" />
            </div>
          </div>
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-tint-blue text-primary mb-space-sm shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
              Application Under Review • Automated Sync Active
            </span>
          </div>
          <h1 className="font-heading-lg text-heading-lg text-text-primary mb-space-xs max-w-2xl">
            Verification in progress
          </h1>
          <p className="font-body-md text-body-md text-text-secondary max-w-xl">
            We are cross-referencing your submitted identity and corporate credentials against national registries.
            This typically completes in under 15 minutes.
          </p>
          <div className="mt-space-lg pt-space-md w-full max-w-xl flex items-center justify-between gap-space-md text-left">
            <div className="flex items-center gap-space-xs">
              <Icon name="sync" className="text-badge-discount-text text-[20px]" />
              <div>
                <p className="font-caption text-caption text-text-tertiary">Real-Time Connection</p>
                <p className="font-label-sm text-label-sm font-semibold text-text-primary">
                  Corporate Affairs Commission (CAC) API
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-space-xs">
              <Icon name="security" className="text-primary text-[20px]" />
              <div>
                <p className="font-caption text-caption text-text-tertiary">ID Verification Rail</p>
                <p className="font-label-sm text-label-sm font-semibold text-text-primary">NIMC National DB Handshake</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="fact_check" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Verification Pipeline</h2>
                </div>
                <span className="px-space-xs py-space-2xs rounded bg-surface-subtle text-text-secondary font-caption text-caption font-semibold uppercase tracking-wide">
                  Stage 3 of 4
                </span>
              </div>
              <div className="relative flex flex-col gap-space-md mt-space-xs">
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-surface-container-high z-0" />

                <div className="relative z-10 flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0 shadow-sm">
                    <Icon name="check_circle" filled className="text-[20px]" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-label-md text-label-md font-semibold text-text-primary">Identity submitted</h3>
                      <span className="font-caption text-caption text-badge-discount-text font-medium">Passed</span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      {legalName || 'Zainab Ahmed'} • NIN cross-verified via NIMC
                    </p>
                    <div className="mt-1 flex items-center gap-1 font-caption text-caption text-text-tertiary">
                      <Icon name="schedule" className="text-[13px]" />
                      <span>Completed at 14:22 WAT</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0 shadow-sm">
                    <Icon name="check_circle" filled className="text-[20px]" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                        Business information submitted
                      </h3>
                      <span className="font-caption text-caption text-badge-discount-text font-medium">Archived</span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      {businessName || 'Urban Grill & Bistro'} • CAC documents registered (RC-1849204)
                    </p>
                    <div className="mt-1 flex items-center gap-1 font-caption text-caption text-text-tertiary">
                      <Icon name="description" className="text-[13px]" />
                      <span>Certificate &amp; Form CAC 1.1 ingested</span>
                    </div>
                  </div>
                </div>

                {phase < 2 ? (
                  <div className="relative z-10 flex items-start gap-space-md p-space-sm -mx-space-sm rounded-lg bg-surface-tint-blue shadow-sm">
                    <div className="relative w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-md">
                      <span className="absolute inset-0 rounded-full bg-primary-container/30 animate-ping" />
                      <Icon name="autorenew" className="text-[20px] relative z-10" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-label-md text-label-md font-semibold text-primary">Verification in progress</h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold animate-pulse">
                          Running
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-text-primary mt-1 font-medium">
                        Registry cross-reference under review by compliance team
                      </p>
                      <p className="font-caption text-caption text-text-secondary mt-1">
                        Our automated engine is matching legal business name, registered Abuja address, and authorized
                        signatory records.
                      </p>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-sm overflow-hidden">
                        <div className="bg-primary-container h-full rounded-full w-2/3 transition-all duration-500" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex items-start gap-space-md">
                    <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0 shadow-sm">
                      <Icon name="check_circle" filled className="text-[20px]" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                          Verification in progress
                        </h3>
                        <span className="font-caption text-caption text-badge-discount-text font-medium">Passed</span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        Registry cross-reference cleared by compliance engine
                      </p>
                    </div>
                  </div>
                )}

                {phase < 2 ? (
                  <div className="relative z-10 flex items-start gap-space-md opacity-60">
                    <div className="w-10 h-10 rounded-full bg-surface-subtle text-text-tertiary flex items-center justify-center shrink-0">
                      <Icon name="verified" className="text-[20px]" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-label-md text-label-md font-semibold text-text-secondary">
                          VEMTAP verification complete
                        </h3>
                        <span className="font-caption text-caption text-text-tertiary">Pending Step 3</span>
                      </div>
                      <p className="font-caption text-caption text-text-tertiary mt-0.5">
                        Official Verified badge activation and automatic public catalog indexing
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex items-start gap-space-md p-space-sm -mx-space-sm rounded-lg bg-badge-discount-bg/60 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0 shadow-sm">
                      <Icon name="verified" filled className="text-[20px]" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                          VEMTAP verification complete
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-badge-discount-text text-on-primary font-caption text-caption font-semibold">
                          Ready
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        Official Verified badge activation and automatic public catalog indexing
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs text-text-primary font-heading-sm text-heading-sm">
                <Icon name="timelapse" className="text-primary text-[20px]" />
                <span>Turnaround Time Expectations</span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col gap-1">
                  <span className="font-caption text-caption text-text-secondary">Automated checks</span>
                  <span className="font-heading-md text-heading-md text-badge-discount-text">&lt; 15 mins</span>
                  <span className="font-caption text-caption text-text-tertiary">Standard instant pipeline</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col gap-1">
                  <span className="font-caption text-caption text-text-secondary">Manual desk review</span>
                  <span className="font-heading-md text-heading-md text-text-primary">2 – 24 hrs</span>
                  <span className="font-caption text-caption text-text-tertiary">Only if flagged for clarify</span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs p-space-xs px-space-sm rounded-lg bg-surface-subtle text-text-secondary font-caption text-caption mt-space-xs">
                <Icon name="notifications_active" className="text-primary text-[18px]" />
                <span>Push alerts and email confirmation will dispatch the moment verification settles.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                  <Icon name="rocket_launch" className="text-[18px]" />
                  <span>Zero-Downtime Workspace</span>
                </div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">You don't have to wait here!</h2>
                <p className="font-body-md text-body-md text-text-secondary">
                  Your back-office is unlocked. Setup your catalog, prepare specials, and prime your storefront so you
                  can launch instantly when verified.
                </p>
              </div>
              <div className="flex flex-col gap-space-sm">
                {ACTION_ITEMS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleAction(item.onClickKey)}
                    className="group p-space-md rounded-xl bg-surface-subtle hover:bg-surface-tint-blue transition-all duration-200 flex items-center justify-between shadow-sm text-left w-full"
                  >
                    <div className="flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-lg bg-surface-canvas text-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <Icon name={item.icon} className="text-[24px]" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-md text-label-md font-semibold text-text-primary group-hover:text-primary transition-colors">
                            {item.title}
                          </span>
                          {item.tag && (
                            <span className="px-space-2xs py-0.5 rounded bg-surface-container-high text-primary font-caption text-caption font-bold uppercase">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <span className="font-caption text-caption text-text-secondary mt-0.5">{item.body}</span>
                      </div>
                    </div>
                    <Icon
                      name="arrow_forward"
                      className="text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </button>
                ))}
              </div>
              <div className="p-space-md rounded-xl bg-surface-subtle flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                  <img alt="Urban Grill & Bistro dining room" className="w-full h-full object-cover" src={PREVIEW_IMAGE} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      {businessName || 'Urban Grill & Bistro'}
                    </span>
                    <Icon name="lock" className="text-text-tertiary text-[14px]" />
                  </div>
                  <p className="font-caption text-caption text-text-secondary truncate">Wuse 2, Abuja • Unverified Draft State</p>
                </div>
                <button
                  className="px-space-sm py-space-xs rounded-lg bg-surface-canvas text-primary font-label-sm text-label-sm font-medium hover:bg-surface-tint-blue transition-colors shadow-sm"
                  type="button"
                  onClick={() => handleAction('profile')}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                    <Icon name="support_agent" className="text-[18px]" />
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md font-semibold text-text-primary">Need urgent assistance?</h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Dedicated Abuja Verification &amp; Compliance Desk
                    </p>
                  </div>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Online
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary">
                If your CAC legal business name varies from your trade certificate, our compliance officers can resolve
                discrepancies manually right away.
              </p>
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <button
                  className="flex-1 min-w-[140px] px-space-md py-space-xs rounded-lg bg-surface-subtle hover:bg-surface-tint-blue text-text-primary hover:text-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center justify-center gap-space-xs shadow-sm"
                  type="button"
                >
                  <Icon name="chat" className="text-[18px] text-badge-discount-text" />
                  <span>WhatsApp Desk</span>
                </button>
                <button
                  className="flex-1 min-w-[140px] px-space-md py-space-xs rounded-lg bg-surface-subtle hover:bg-surface-tint-blue text-text-primary hover:text-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center justify-center gap-space-xs shadow-sm"
                  type="button"
                >
                  <Icon name="forum" className="text-[18px]" />
                  <span>In-Portal Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs text-text-secondary">
            <Icon name="live_help" className="text-[20px] text-primary" />
            <span className="font-body-md text-body-md text-text-secondary">Questions regarding verification?</span>
            <span className="font-label-md text-label-md font-semibold text-primary hover:underline cursor-pointer ml-1">
              Contact Merchant Support
            </span>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary transition-colors"
              type="button"
              onClick={onBack}
            >
              Check Status Later
            </button>
            <button
              className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-space-xs"
              type="button"
              onClick={reviewComplete ? onReviewComplete : fastForward}
            >
              <span>{reviewComplete ? 'Continue to Activation' : 'Continue Store Setup'}</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
