import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationIdReviewScreenProps {
  onBack: () => void;
  onRetry: () => void;
  onUseAnotherId: () => void;
  onBrand?: () => void;
}

const DIAGNOSTICS = [
  {
    icon: 'badge',
    title: "Information doesn't match official records",
    body: 'Names entered must exactly match NIMC database records. Check maiden names, hyphenated surnames, or middle name order.',
    tip: 'If your NIN slip includes initials (e.g., "O. John"), enter your full legal baptismal/birth name.',
    tipIcon: 'lightbulb',
  },
  {
    icon: 'blur_on',
    title: 'Document details or photo could not be read clearly',
    body: 'Ensure no glare, reflections, plastic sleeve sheen, or low-resolution camera blur. Natural indirect daylight yields 99.4% first-time clarity.',
    tip: 'Avoid flashlight or direct overhead LED bulbs aimed at laminated card surfaces.',
    tipIcon: 'flare',
  },
  {
    icon: 'crop_free',
    title: "Document was cropped or corners weren't visible",
    body: "All 4 edges and corners of the physical identity slip or plastic card must be entirely visible within the capture viewfinder frame.",
    tip: 'Place card flat on a dark, non-reflective tabletop before snapping.',
    tipIcon: 'photo_camera',
  },
  {
    icon: 'cloud_sync',
    title: 'Official verification network is temporarily slow or unavailable',
    body: 'Governmental registries (NIMC gateway or FRSC portals) periodically experience telecommunications maintenance windows during business peaks.',
    tip: 'Gateway Status: Normal responsiveness restored as of 12 minutes ago.',
    tipIcon: 'info',
  },
];

export function DesktopVerificationIdReviewScreen({
  onBack,
  onRetry,
  onUseAnotherId,
  onBrand,
}: DesktopVerificationIdReviewScreenProps) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [retrying, setRetrying] = useState(false);
  const [manualRequested, setManualRequested] = useState(false);

  const handleRetry = () => {
    if (retrying) return;
    setRetrying(true);
    window.setTimeout(() => {
      setRetrying(false);
      onRetry();
    }, 900);
  };

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="w-full bg-error-container text-on-error-container px-margin py-space-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-space-md flex-wrap">
          <div className="flex items-center gap-space-xs font-label-md text-label-md font-semibold">
            <Icon name="error" filled className="text-[20px] text-error" />
            <span>Verification Notice • Action Required</span>
            <span className="hidden md:inline font-normal text-text-secondary ml-space-xs">
              Reference: #KYC-NIN-92841-ABJ
            </span>
          </div>
          <div className="flex items-center gap-space-sm text-caption font-caption">
            <span className="inline-flex items-center gap-space-2xs bg-surface-canvas/80 px-space-xs py-space-2xs rounded-full text-on-surface font-medium">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
              Attempt 1 of 3 Used
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-margin py-space-xl flex flex-col gap-space-2xl">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-text-secondary">
            <span>Merchant Portal</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span>Compliance &amp; Trust</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">National Identity Verification</span>
          </div>
          <div className="flex items-center gap-space-xs font-caption text-caption text-text-tertiary">
            <Icon name="shield_lock" className="text-[16px] text-badge-discount-text" />
            <span>256-Bit Encrypted Data Tunnel</span>
          </div>
        </div>

        <div className="w-full bg-surface-canvas rounded-xl p-space-xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-tertiary-fixed-dim/40 to-transparent pointer-events-none blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-space-xl">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-md">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-canvas flex items-center justify-center">
                  <Icon name="sync_problem" filled className="text-tertiary-container text-[42px] animate-spin" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-tertiary-container text-on-tertiary rounded-full w-7 h-7 flex items-center justify-center shadow-sm">
                <Icon name="priority_high" className="text-[16px] font-bold" />
              </div>
            </div>
            <div className="flex flex-col gap-space-xs text-center md:text-left flex-1 min-w-0">
              <div className="inline-flex items-center justify-center md:justify-start gap-space-xs flex-wrap">
                <span className="px-space-xs py-space-2xs bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-caption rounded-full uppercase tracking-wider font-semibold">
                  Immediate Review Needed
                </span>
                <span className="text-text-tertiary text-caption font-caption">Last scan: Today, 14:32 WAT</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
                We couldn't verify your identity
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary max-w-3xl">
                Please check your information and try again. Minor mismatches or blurry scans are easy to fix and
                typically resolve in seconds once updated.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between gap-space-md flex-wrap">
              <div>
                <h2 className="font-heading-md text-heading-md text-on-surface">
                  Troubleshooting &amp; Common Reasons
                </h2>
                <p className="font-label-md text-label-md text-text-secondary mt-space-2xs">
                  Inspect the primary friction points flagged by our validation engine:
                </p>
              </div>
              <span className="hidden sm:inline-block px-space-xs py-space-2xs bg-surface-container-high text-on-surface-variant font-label-sm text-caption rounded-md font-medium">
                4 Core Checks
              </span>
            </div>
            <div className="flex flex-col gap-space-md">
              {DIAGNOSTICS.map((item, index) => {
                const open = expanded === index;
                return (
                  <div
                    key={item.icon}
                    className={`bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                      open ? 'bg-surface-tint-blue/30' : ''
                    }`}
                    onClick={() => setExpanded(open ? null : index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') setExpanded(open ? null : index);
                    }}
                  >
                    <div className="flex items-start gap-space-md">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          open
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-tint-blue text-primary group-hover:bg-primary group-hover:text-on-primary'
                        }`}
                      >
                        <Icon name={item.icon} className="text-[22px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-space-sm">
                          <h3 className="font-heading-sm text-heading-sm text-on-surface">{item.title}</h3>
                          <Icon
                            name={open ? 'expand_less' : 'expand_more'}
                            className="text-outline text-[20px] transition-transform duration-200 shrink-0"
                          />
                        </div>
                        <p className="font-body-md text-body-md text-text-secondary mt-space-xs">{item.body}</p>
                        {open && (
                          <div className="mt-space-sm pt-space-sm flex flex-wrap items-center gap-space-xs font-label-sm text-caption text-primary">
                            <Icon name={item.tipIcon} className="text-[16px]" />
                            <span>Tip: {item.tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-badge-discount-bg text-on-surface rounded-xl p-space-lg shadow-sm flex items-start gap-space-md">
              <div className="w-10 h-10 rounded-full bg-badge-discount-text/10 flex items-center justify-center shrink-0 text-badge-discount-text">
                <Icon name="check_circle" filled className="text-[24px]" />
              </div>
              <div className="flex flex-col gap-space-2xs">
                <span className="font-heading-sm text-heading-sm text-badge-discount-text font-semibold">
                  Zero Store Disruption
                </span>
                <p className="font-body-md text-body-md text-on-surface font-medium leading-snug">
                  Don't worry — this does not affect your active merchant account, stored deals, or day-to-day
                  operations on VEMTAP. You can safely retry anytime.
                </p>
                <div className="flex items-center gap-space-xs mt-space-2xs font-caption text-caption text-text-secondary">
                  <Icon name="lock" className="text-[14px]" />
                  <span>All catalog items &amp; payouts remain secured under escrow</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-xs flex-wrap">
                <div className="flex items-center gap-space-xs">
                  <Icon name="support_agent" className="text-primary text-[22px]" />
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Abuja Compliance Desk</h3>
                </div>
                <span className="px-space-xs py-space-2xs bg-surface-container text-on-surface-variant font-label-sm text-caption rounded-full">
                  HQ Tier 2
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Prefer a human review? Request manual verification from our dedicated Abuja compliance officers.
              </p>
              <div className="bg-surface-subtle p-space-sm rounded-lg flex items-center justify-between text-on-surface font-label-sm text-label-sm gap-space-xs flex-wrap">
                <span className="flex items-center gap-space-2xs text-text-secondary">
                  <Icon name="schedule" className="text-[18px]" />
                  Typical Turnaround
                </span>
                <span className="font-semibold text-primary">Under 24 Hours</span>
              </div>
              <button
                className="w-full bg-surface-tint-blue hover:bg-primary/10 text-primary py-space-sm px-space-md rounded-lg font-button-secondary text-button-secondary transition-colors text-center flex items-center justify-center gap-space-xs"
                type="button"
                disabled={manualRequested}
                onClick={() => setManualRequested(true)}
              >
                <Icon
                  name={manualRequested ? 'check_circle' : 'assignment_turned_in'}
                  className="text-[18px]"
                  filled={manualRequested}
                />
                <span>{manualRequested ? 'Manual Review Requested' : 'Dispatch for Manual Review'}</span>
              </button>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0">
                  <Icon name="chat" className="text-[22px]" />
                </div>
                <div>
                  <h4 className="font-heading-sm text-heading-sm text-on-surface">Instant Live Assistance</h4>
                  <p className="font-caption text-caption text-text-secondary">
                    Direct secure channel for active merchants
                  </p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Need urgent guidance on formatting your document? Chat directly with an active Verification Officer on
                WhatsApp.
              </p>
              <button
                className="w-full bg-badge-discount-bg hover:bg-badge-discount-text/20 text-badge-discount-text py-space-sm px-space-md rounded-lg font-button-secondary text-button-secondary transition-colors flex items-center justify-center gap-space-xs"
                type="button"
              >
                <Icon name="forum" className="text-[20px]" />
                <span>Chat with Verification Desk on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-canvas rounded-xl p-space-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-space-lg mt-space-md">
          <div className="flex items-center gap-space-sm w-full md:w-auto">
            <button
              className="w-full md:w-auto h-11 px-space-lg bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-button-secondary text-button-secondary transition-colors flex items-center justify-center gap-space-xs"
              type="button"
              onClick={onUseAnotherId}
            >
              <Icon name="contact_page" className="text-[20px] text-text-secondary" />
              <span>Use Another ID (Passport or Driver's Licence)</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-space-md w-full md:w-auto">
            <button
              className="font-label-md text-label-md text-text-secondary hover:text-primary transition-colors text-center order-2 sm:order-1 px-space-xs"
              type="button"
              onClick={() => setManualRequested(true)}
              disabled={manualRequested}
            >
              {manualRequested ? 'Manual Review Requested' : 'Request Manual Review (Compliance Desk)'}
            </button>
            <button
              className="w-full sm:w-auto h-11 px-space-2xl bg-primary hover:bg-[#0559CA] active:scale-[0.98] text-on-primary rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-space-xs order-1 sm:order-2 disabled:opacity-70"
              type="button"
              disabled={retrying}
              onClick={handleRetry}
            >
              {retrying ? (
                <>
                  <Icon name="progress_activity" className="animate-spin text-[20px]" />
                  <span>Reopening Scanner...</span>
                </>
              ) : (
                <>
                  <span>Try Again</span>
                  <Icon name="sync" className="text-[20px]" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            className="px-space-md py-space-xs text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Document Details</span>
          </button>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
