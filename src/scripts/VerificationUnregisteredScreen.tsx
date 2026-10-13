import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerificationUnregisteredScreenProps {
  onBack: () => void;
  onContinue: () => void;
  onLearnMore: () => void;
  legalName: string;
}

const UNLOCKED_PERKS = [
  { icon: 'local_offer', body: 'Post deals and create daily flash offers' },
  { icon: 'qr_code_2', body: 'Set up your storefront & share instant QR code' },
  { icon: 'forum', body: 'Receive customer chat messages & bookings directly' },
];

const RESERVED_PERKS = [
  { icon: 'verified', body: 'Official blue Verified Business checkmark on storefront' },
  { icon: 'push_pin', body: 'Pinned placement in curated top neighborhood feeds' },
];

export function VerificationUnregisteredScreen({
  onBack,
  onContinue,
  onLearnMore,
  legalName,
}: VerificationUnregisteredScreenProps) {
  return (
    <AppScreen>
      <ScreenHeader
        title="Unregistered Business"
        onBack={onBack}
        trailing={
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Help & Support"
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-high/60 transition-colors"
              type="button"
            >
              <Icon name="help_outline" className="text-[20px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        }
      />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-2xl space-y-space-lg">
        {/* Friendly Reassurance Graphic & Hero Content */}
        <div className="flex flex-col items-center text-center pt-space-sm">
          <div className="relative w-24 h-24 mb-space-md flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary-fixed/40 scale-105 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center shadow-sm">
              <Icon name="storefront" filled className="text-primary text-[42px]" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-sm">
                <Icon name="handshake" filled className="text-badge-discount-text text-[20px]" />
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm mb-space-xs">
            <Icon name="sentiment_satisfied" className="text-[16px] text-primary" />
            <span>No worries at all</span>
          </div>
          <h2 className="font-heading-md text-heading-md text-text-primary font-semibold">That's okay</h2>
          <p className="font-label-sm text-label-sm text-text-secondary mt-space-2xs max-w-xs">
            You can still use VEMTAP if your business is not currently CAC registered.
          </p>
        </div>

        {/* Verification Status Dual Card */}
        <div className="flex flex-col gap-space-xs p-space-xs bg-surface-container-low rounded-xl">
          <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-lowest shadow-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-9 h-9 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0">
                <Icon name="check_circle" filled className="text-badge-discount-text text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-caption text-caption text-text-tertiary">Operator Identity</span>
                <span className="font-heading-sm text-heading-sm font-semibold text-text-primary truncate">
                  {legalName}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-space-2xs px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold flex-shrink-0">
              <Icon name="done" className="text-[13px]" />
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-lowest shadow-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <Icon name="domain_disabled" className="text-on-surface-variant text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-caption text-caption text-text-tertiary">CAC Registration</span>
                <span className="font-body-md text-body-md text-text-primary font-medium truncate">
                  Informal / Sole Trader
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex-shrink-0">
              Not registered
            </span>
          </div>
        </div>

        {/* Explanation & Scope Section */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
          <div className="p-space-sm rounded-lg bg-surface-tint-blue text-on-primary-fixed-variant flex items-start gap-space-xs">
            <Icon name="info" className="text-primary text-[18px] mt-0.5 flex-shrink-0" />
            <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
              Your business may have access to some VEMTAP features, but it won't receive the Verified Business badge
              until the required business verification is completed.
            </p>
          </div>

          {/* What You Can Do (Unlocked Perks) */}
          <div>
            <div className="flex items-center gap-space-2xs mb-space-xs">
              <Icon name="check" className="text-badge-discount-text text-[16px]" />
              <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                What you can do right now
              </h3>
            </div>
            <div className="space-y-space-xs">
              {UNLOCKED_PERKS.map((perk) => (
                <div className="flex items-start gap-space-xs" key={perk.icon}>
                  <div className="w-5 h-5 rounded-full bg-badge-discount-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={perk.icon} className="text-badge-discount-text text-[13px]" />
                  </div>
                  <span className="font-body-md text-body-md text-text-secondary leading-relaxed">{perk.body}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reserved for CAC Verified */}
          <div className="pt-space-xs">
            <div className="flex items-center gap-space-2xs mb-space-xs">
              <Icon name="verified" className="text-primary text-[16px]" />
              <h3 className="font-label-md text-label-md font-semibold text-text-primary">Reserved for CAC Verified</h3>
            </div>
            <div className="space-y-space-xs bg-surface-subtle p-space-sm rounded-lg">
              {RESERVED_PERKS.map((perk) => (
                <div className="flex items-start gap-space-xs" key={perk.icon}>
                  <div className="w-5 h-5 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={perk.icon} className="text-primary text-[13px]" />
                  </div>
                  <span className="font-body-md text-body-md text-text-secondary leading-relaxed">{perk.body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col items-center gap-space-sm pt-space-xs">
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-space-xs active:scale-[0.98] transition-transform"
            id="btn-continue"
            type="button"
            onClick={onContinue}
          >
            <span>Continue</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
          <button
            className="h-10 px-space-md text-primary font-button-secondary text-button-secondary flex items-center gap-space-2xs hover:underline active:opacity-75 transition-opacity"
            id="btn-learn-more"
            type="button"
            onClick={onLearnMore}
          >
            <span>Learn about business verification</span>
            <Icon name="arrow_forward" className="text-[15px]" />
          </button>
        </div>

        {/* Bottom Friendly Footnote */}
        <div className="p-space-sm rounded-lg bg-surface-container-high/50 text-center">
          <p className="font-caption text-caption text-text-secondary">
            You can register your business with CAC and upgrade your status anytime under{' '}
            <span className="text-text-primary font-medium">Business Profile</span>.
          </p>
        </div>
      </div>
    </AppScreen>
  );
}
