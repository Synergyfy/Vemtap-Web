import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopHowToClaimScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onClaim: () => void;
  onTerms: () => void;
}

const STEPS: { step: string; title: string; icon: string; body: string; extra: ReactNode }[] = [
  {
    step: '1',
    title: 'Claim the Deal',
    icon: 'touch_app',
    body: 'Tap ‘Claim Deal’ to instantly reserve your offer in VEMTAP. No upfront payment required.',
    extra: (
      <div className="mt-space-xs inline-flex items-center gap-1.5 px-space-xs py-1 rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm">
        <Icon name="verified_user" className="text-primary text-[15px]" />
        <span>Reserved for 48 hours</span>
      </div>
    ),
  },
  {
    step: '2',
    title: 'Visit the Business',
    icon: 'near_me',
    body: 'Head to the featured local business in your area anytime before the deal expires.',
    extra: (
      <div className="mt-space-xs flex items-center justify-between gap-2 p-space-xs rounded-lg bg-surface-container-low">
        <div className="flex items-center gap-space-2xs min-w-0">
          <Icon name="location_on" className="text-primary text-[18px] shrink-0" />
          <span className="font-caption text-caption text-text-primary truncate">Your local branch</span>
        </div>
        <span className="font-label-sm text-label-sm text-primary shrink-0 font-medium">Nearby</span>
      </div>
    ),
  },
  {
    step: '3',
    title: 'Show Your Claim',
    icon: 'qr_code_scanner',
    body: 'Open ‘My Deals’ and show your active claim code or screen to the staff when placing your order.',
    extra: (
      <div className="mt-space-xs flex items-center gap-2 p-2 rounded-lg bg-surface-container-high/60 text-text-secondary font-caption text-caption">
        <Icon name="schedule" className="text-[16px] text-primary" />
        <span>Applies instantly at point of billing</span>
      </div>
    ),
  },
];

export function DesktopHowToClaimScreen({ onNav, onBack, onClaim, onTerms }: DesktopHowToClaimScreenProps) {
  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-tertiary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[16px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              My Deals
            </button>
            <Icon name="chevron_right" className="text-[16px]" />
            <span className="text-text-primary font-semibold">How to Claim</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption mb-space-xs shadow-sm">
              <Icon name="bolt" className="text-[14px]" filled />
              Instant Guarantee
            </span>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              Claim your deal in 3 simple steps
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-space-2xs leading-relaxed">
              Fast, seamless local savings with zero upfront commitment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start mt-8">
            <div className="flex flex-col gap-4 min-w-0">
              {STEPS.map((item, index) => (
                <div className="relative" key={item.step}>
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden sm:block absolute left-[26px] top-[72px] bottom-[-16px] w-px bg-border-subtle"
                    />
                  )}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
                    {index === 0 && (
                      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-surface-tint-blue rounded-full blur-2xl pointer-events-none" />
                    )}
                    <div className="flex items-start gap-space-sm relative">
                      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-md">
                        <span className="font-heading-sm text-heading-sm">{item.step}</span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-space-2xs mb-1">
                          <h2 className="font-heading-sm text-heading-sm text-text-primary">{item.title}</h2>
                          <span className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                            <Icon name={item.icon} className="text-[18px]" />
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-text-secondary leading-normal">{item.body}</p>
                        {item.extra}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="w-full flex flex-col gap-4 lg:sticky lg:top-24">
              <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-2xs">
                <div className="flex items-start gap-space-xs">
                  <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-body-md text-body-md text-text-secondary">
                      Need to cancel? You can release your claim anytime from your saved deals without penalty.
                    </p>
                    <button
                      type="button"
                      onClick={onTerms}
                      className="mt-space-xs inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:opacity-75 transition-opacity"
                    >
                      <span>View Terms &amp; Conditions</span>
                      <Icon name="arrow_forward" className="text-[16px]" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClaim}
                className="w-full h-[54px] bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-lg transition-all active:scale-[0.98]"
              >
                <Icon name="local_activity" className="text-[20px]" />
                <span>Claim Deal</span>
              </button>

              <div className="flex items-center justify-between px-space-xs font-caption text-caption text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <Icon name="schedule" className="text-[15px]" />
                  <span>Reserved for 48 hours</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="local_activity" className="text-[15px]" />
                  <span>No upfront payment required</span>
                </span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
