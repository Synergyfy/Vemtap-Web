import type { ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface HowToClaimScreenProps {
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
    body: 'Head to Urban Grill & Bistro in Apo, Abuja anytime before the deal expires on 20 Sep.',
    extra: (
      <div className="mt-space-xs flex items-center justify-between gap-2 p-space-xs rounded-lg bg-surface-container-low">
        <div className="flex items-center gap-space-2xs min-w-0">
          <Icon name="location_on" className="text-tertiary-container text-[18px] flex-shrink-0" />
          <span className="font-caption text-caption text-on-surface truncate">Plot 412, Apo Resettlement</span>
        </div>
        <span className="font-label-sm text-label-sm text-primary flex-shrink-0 font-medium">0.8 mi</span>
      </div>
    ),
  },
  {
    step: '3',
    title: 'Show Your Claim',
    icon: 'qr_code_scanner',
    body: 'Open ‘My Deals’ and show your active claim code or screen to the staff when placing your order.',
    extra: (
      <div className="mt-space-xs flex items-center gap-2 p-2 rounded-lg bg-surface-container-high/60 text-on-surface-variant font-caption text-caption">
        <Icon name="schedule" className="text-[16px] text-primary" />
        <span>Applies instantly at point of billing</span>
      </div>
    ),
  },
];

export function HowToClaimScreen({ onBack, onClaim, onTerms }: HowToClaimScreenProps) {
  return (
    <AppScreen>
      <ScreenHeader title="How to Claim" onBack={onBack} />

      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-md pb-space-xs">
          <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption mb-space-xs shadow-sm">
            <Icon name="bolt" className="text-[14px]" filled />
            Instant Guarantee
          </span>
          <h2 className="font-display-hero-mobile text-display-hero-mobile text-on-surface tracking-tight">
            Claim your deal in 3 simple steps
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs leading-relaxed">
            Fast, seamless local savings with zero upfront commitment.
          </p>
        </div>

        <div className="px-margin py-space-sm flex flex-col gap-space-sm relative">
          {STEPS.map((item, index) => (
            <div
              key={item.step}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden"
            >
              {index === 0 && (
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-primary-fixed/40 rounded-full blur-2xl pointer-events-none" />
              )}
              <div className="flex items-start gap-space-sm">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-container/25">
                  <span className="font-heading-sm text-heading-sm">{item.step}</span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5 relative">
                  <div className="flex items-center justify-between gap-space-2xs mb-1">
                    <h3 className="font-heading-sm text-heading-sm text-on-surface">{item.title}</h3>
                    <span className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                      <Icon name={item.icon} className="text-[18px]" />
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary leading-normal">{item.body}</p>
                  {item.extra}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-margin py-space-xs mb-space-3xl">
          <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-2xs">
            <div className="flex items-start gap-space-xs">
              <Icon name="info" className="text-secondary text-[20px] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-body-md text-body-md text-text-secondary">
                  Need to cancel? You can release your claim anytime from your saved deals without penalty.
                </p>
                <button
                  type="button"
                  onClick={onTerms}
                  className="mt-space-xs inline-flex items-center gap-1 font-label-md text-label-md text-primary active:opacity-75 transition-opacity"
                >
                  <span>View Terms &amp; Conditions</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/90 backdrop-blur-xl shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.06)] pb-safe">
        <div className="p-margin">
          <button
            type="button"
            onClick={onClaim}
            className="w-full h-[54px] bg-primary-container active:scale-[0.98] text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-lg shadow-primary-container/25 transition-all"
          >
            <Icon name="local_activity" className="text-[20px]" />
            <span>Claim Deal</span>
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
