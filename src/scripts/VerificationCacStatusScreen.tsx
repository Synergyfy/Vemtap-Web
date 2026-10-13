import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerificationCacStatusScreenProps {
  onBack: () => void;
  registered: boolean;
  onRegisteredChange: (registered: boolean) => void;
  onContinue: () => void;
}

const CAC_OPTIONS = [
  {
    value: 'registered',
    badgeIcon: 'verified',
    badgeFill: true,
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    badgeLabel: 'CAC Registered',
    icon: 'workspace_premium',
    iconFill: true,
    iconClass: 'text-primary',
    title: 'Yes, my business is registered',
    description:
      'I have a Registered Business Name, Limited Liability (LLC/Ltd), or Incorporated Trustee CAC registration.',
    stripIcon: 'stars',
    stripIconClass: 'text-primary-container',
    strip: (
      <>
        Unlocks official <strong className="text-primary-container font-semibold">Verified Business</strong> badge &
        higher reach
      </>
    ),
  },
  {
    value: 'unregistered',
    badgeIcon: 'storefront',
    badgeFill: false,
    badgeClass: 'bg-surface-container-high text-on-surface-variant',
    badgeLabel: 'Sole Trader / Unregistered',
    icon: 'store',
    iconFill: false,
    iconClass: 'text-secondary',
    title: "No, my business isn't registered",
    description:
      'I operate as an individual, artisan, or informal brand. I want to launch quickly without documents for now.',
    stripIcon: 'check_circle',
    stripIconClass: 'text-badge-discount-text',
    strip: <>You can still sell, post deals & use all core VEMTAP tools</>,
  },
];

export function VerificationCacStatusScreen({
  onBack,
  registered,
  onRegisteredChange,
  onContinue,
}: VerificationCacStatusScreenProps) {
  return (
    <AppScreen>
      <ScreenHeader title="Business Registration" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-lg">
        {/* Progress Header Meta */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-border-subtle" />
            <span className="h-1.5 w-8 rounded-full bg-primary-container" />
          </div>
          <span className="font-label-sm text-label-sm text-text-secondary bg-surface-container px-2 py-0.5 rounded-full">
            Step 2 of 2
          </span>
        </div>

        {/* Screen Typography Intro */}
        <div className="mt-4 mb-5">
          <h2 className="font-heading-md text-heading-md text-on-surface">Is your business registered?</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1.5">
            Select whether your business is officially registered with the Corporate Affairs Commission (CAC).
          </p>
        </div>

        {/* Interactive Choice Options */}
        <div className="flex flex-col gap-3.5">
          {CAC_OPTIONS.map((option) => {
            const active = registered === (option.value === 'registered');
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onRegisteredChange(option.value === 'registered')}
                className={`w-full text-left p-4 rounded-xl shadow-sm transition-all duration-200 ${
                  active ? 'bg-surface-tint-blue shadow-md' : 'bg-surface-container-lowest'
                }`}
              >
                {/* Top Row: Badge & Radio Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${option.badgeClass}`}>
                    <Icon name={option.badgeIcon} filled={option.badgeFill} className="text-[16px]" />
                    <span className="font-label-sm text-label-sm font-semibold">{option.badgeLabel}</span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      active ? 'bg-primary-container' : 'bg-surface-container'
                    }`}
                  >
                    <Icon
                      name="check"
                      className={`text-white text-[16px] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </div>
                </div>
                {/* Body Content */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <Icon name={option.icon} filled={option.iconFill} className={`text-[22px] ${option.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading-sm text-heading-sm text-on-surface leading-snug">{option.title}</h3>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
                {/* Benefit / Reassurance Strip */}
                <div className="mt-3 flex items-center gap-1.5 bg-surface-subtle p-2 rounded-lg">
                  <Icon name={option.stripIcon} className={`text-[16px] ${option.stripIconClass}`} />
                  <span className="font-label-sm text-label-sm font-medium text-text-primary">{option.strip}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual Delight & Help Information Callout */}
        <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="info" className="text-primary text-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-caption text-caption text-on-surface-variant leading-snug">
              <strong className="font-medium text-on-surface">No pressure:</strong> You can always upload and verify
              your CAC registration certificate later under{' '}
              <span className="font-semibold text-primary">Business Profile Settings</span>.
            </p>
          </div>
        </div>

        {/* Sticky-Safe Bottom Action Deck */}
        <div className="mt-auto pt-8 flex flex-col gap-3">
          <button
            className="w-full h-[52px] bg-primary-container text-on-primary rounded-xl font-button-primary text-button-primary font-semibold flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-transform"
            id="continue-button"
            type="button"
            onClick={onContinue}
          >
            <span>Continue</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <div className="flex items-center justify-center gap-1.5 py-1 text-center">
            <Icon name="lock" className="text-[15px] text-text-tertiary" />
            <span className="font-caption text-caption text-text-secondary">
              Official CAC lookup integration is secure and encrypted
            </span>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
