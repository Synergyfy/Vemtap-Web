import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerificationIntroScreenProps {
  onBack: () => void;
  onStart: () => void;
  onLater: () => void;
}

const WHY_ITEMS = [
  {
    icon: 'security',
    title: 'Protect customers',
    body: 'Helps prevent fake businesses and fraudulent deals across your local community.',
  },
  {
    icon: 'handshake',
    title: 'Build trust',
    body: 'Verified businesses earn the verified badge and greater shopper confidence.',
  },
  {
    icon: 'rocket_launch',
    title: 'Unlock business features',
    body: 'Verification is required before participating in VEMTAP discovery and instant deals.',
  },
];

export function VerificationIntroScreen({ onBack, onStart, onLater }: VerificationIntroScreenProps) {
  return (
    <AppScreen>
      <ScreenHeader title="Verify Your Business" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-lg">
        {/* Onboarding Progress Stepper Tracker */}
        <div className="w-full pt-space-xs pb-space-sm flex flex-col items-center">
          <div className="flex items-center justify-center gap-space-2xs w-full max-w-[340px]">
            <div className="flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-surface-container-high text-on-surface-variant">
              <Icon name="check_circle" filled className="text-[15px] text-badge-discount-text" />
              <span className="font-label-sm text-label-sm">Setup</span>
            </div>
            <div className="h-[2px] w-3 bg-primary-container/30 rounded-full" />
            <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-tint-blue shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-sm text-label-sm font-semibold text-primary-container">Verification</span>
            </div>
            <div className="h-[2px] w-3 bg-surface-variant rounded-full" />
            <div className="flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-surface-container-lowest text-text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-surface-variant" />
              <span className="font-label-sm text-label-sm">Activation</span>
            </div>
          </div>
        </div>

        {/* Trust Shield Hero Graphic */}
        <div className="relative w-full flex flex-col items-center justify-center pt-space-xs pb-space-sm">
          <div className="absolute w-44 h-44 rounded-full bg-primary-container/10 blur-2xl -z-10 pointer-events-none" />
          <div className="relative w-20 h-20 rounded-full bg-surface-tint-blue shadow-md flex items-center justify-center">
            <div className="absolute inset-1 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-inner">
              <Icon name="verified_user" filled className="text-primary-container text-[40px]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-badge-discount-bg shadow-sm flex items-center justify-center">
              <Icon name="lock" filled className="text-badge-discount-text text-[15px]" />
            </div>
          </div>
        </div>

        {/* Hero Content Headline & Context */}
        <div className="text-center px-space-xs">
          <h2 className="font-heading-md text-heading-md text-text-primary">Verify your business</h2>
          <p className="font-label-md text-label-md text-text-secondary mt-space-2xs max-w-[320px] mx-auto">
            Help us keep VEMTAP safe for customers and genuine businesses.
          </p>
          <div className="mt-space-sm p-space-xs rounded-xl bg-surface-container-low text-left flex items-start gap-space-xs">
            <Icon name="info" className="text-primary-container text-[18px] mt-0.5 shrink-0" />
            <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
              You'll verify your identity and provide your business registration information where applicable.
            </p>
          </div>
        </div>

        {/* Why Verify? Section (Elevated Card) */}
        <div className="mt-space-md rounded-xl bg-surface-container-lowest shadow-sm p-space-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary">
              Why Verification Matters
            </span>
            <Icon name="verified" className="text-primary-container text-[16px]" />
          </div>
          {WHY_ITEMS.map((item) => (
            <div className="flex items-start gap-space-xs" key={item.icon}>
              <div className="w-8 h-8 rounded-xl bg-surface-tint-blue flex items-center justify-center shrink-0">
                <Icon name={item.icon} filled className="text-primary-container text-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-label-md text-label-md font-semibold text-text-primary">{item.title}</h3>
                <p className="font-caption text-caption text-text-secondary mt-0.5">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance Notice */}
        <div className="mt-space-md px-space-xs flex items-center gap-space-xs rounded-xl bg-surface-subtle p-space-sm">
          <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
            <Icon name="check" filled className="text-badge-discount-text text-[15px]" />
          </div>
          <p className="font-caption text-caption text-text-secondary leading-snug">
            Verification builds safety for both you and your buyers. We keep your credentials strictly confidential and
            encrypted.
          </p>
        </div>

        {/* Bottom Actions Deck */}
        <div className="mt-auto pt-space-md flex flex-col items-center gap-space-2xs w-full">
          <button
            className="w-full h-11 rounded-xl bg-primary-container hover:bg-primary active:scale-[0.98] transition-all text-on-primary font-button-secondary text-button-secondary shadow-md flex items-center justify-center gap-space-xs"
            type="button"
            onClick={onStart}
          >
            <span>Start Verification</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <button
            className="h-10 px-space-md text-text-secondary hover:text-text-primary active:scale-95 transition-all font-label-md text-label-md"
            type="button"
            onClick={onLater}
          >
            I'll do this later
          </button>
          <p className="font-caption text-caption text-text-tertiary text-center px-space-sm mt-space-2xs leading-relaxed">
            You can continue setting up your business, but some features may remain unavailable until verification is
            completed.
          </p>
        </div>
      </div>
    </AppScreen>
  );
}
