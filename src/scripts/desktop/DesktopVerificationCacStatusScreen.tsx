import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationCacStatusScreenProps {
  onBack: () => void;
  registered: boolean;
  onRegisteredChange: (registered: boolean) => void;
  onContinue: () => void;
  onBrand?: () => void;
}

export function DesktopVerificationCacStatusScreen({
  onBack,
  registered,
  onRegisteredChange,
  onContinue,
  onBrand,
}: DesktopVerificationCacStatusScreenProps) {
  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="relative w-full overflow-hidden pb-space-3xl">
        <div className="absolute -top-28 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-surface-tint-blue rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-margin pt-space-xl relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-xl">
            <div className="flex items-center gap-space-sm">
              <span className="px-space-sm py-space-2xs rounded-full bg-surface-tint-blue font-label-sm text-label-sm text-primary font-semibold tracking-wide">
                Step 2 of 2
              </span>
              <span className="font-label-md text-label-md text-text-secondary">Business Entity Status</span>
            </div>
            <div aria-label="Registration workflow progress" className="flex items-center gap-space-xs">
              <div className="h-1.5 w-6 rounded-full bg-primary-container" />
              <div className="h-1.5 w-8 rounded-full bg-primary-container shadow-sm" />
              <span className="font-caption text-caption text-text-secondary ml-space-xs font-medium">
                100% Onboarding Flow
              </span>
            </div>
          </div>

          <div className="max-w-3xl mb-space-2xl">
            <div className="inline-flex items-center gap-space-2xs text-text-secondary font-caption text-caption uppercase tracking-widest font-semibold mb-space-2xs">
              <span>Legal Structure</span>
              <span className="text-outline-variant">•</span>
              <span>Federal Regulatory Filing</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg md:font-display-hero md:text-display-hero text-on-surface mb-space-xs">
              Is your business registered?
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary">
              Select whether your business is officially registered with the Corporate Affairs Commission (CAC). This
              helps tailor your verification badges, settlement limits, and storefront discoverability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-space-xl" role="radiogroup">
            <button
              type="button"
              role="radio"
              aria-checked={registered}
              onClick={() => onRegisteredChange(true)}
              className={`group relative flex flex-col justify-between p-space-xl rounded-xl bg-surface-canvas transition-all duration-200 cursor-pointer text-left ${
                registered
                  ? 'shadow-md hover:shadow-xl ring-2 ring-primary-container'
                  : 'shadow-sm hover:shadow-lg ring-0'
              }`}
            >
              <div className="flex items-start justify-between gap-space-md mb-space-lg">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="verified" filled className="text-[32px]" />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                      CAC Registered
                    </span>
                    <h2 className="font-heading-md text-heading-md text-on-surface mt-space-2xs">
                      Yes, my business is registered
                    </h2>
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    registered ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-transparent'
                  }`}
                >
                  <Icon name="check" className="text-[18px]" />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-space-md">
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  I have a Registered Business Name, Limited Liability Company (LLC/Ltd), or Incorporated Trustee CAC
                  registration with a valid certificate.
                </p>
                <div className="p-space-md rounded-lg bg-surface-tint-blue/70">
                  <div className="flex items-start gap-space-xs">
                    <Icon name="stars" filled className="text-primary text-[20px] mt-0.5 shrink-0" />
                    <p className="font-label-md text-label-md text-on-primary-fixed-variant leading-snug">
                      Unlocks official <strong className="font-semibold">Verified Business badge</strong> &amp; higher
                      rank visibility across Abuja &amp; Lagos consumer feeds.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm pt-space-xs">
                  <Icon name="document_scanner" className="text-[18px] text-text-tertiary" />
                  <span>Requires RC Number / BN Number and certificate upload.</span>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md flex items-center justify-between text-caption font-caption text-text-tertiary gap-space-xs flex-wrap">
                <span className="flex items-center gap-space-2xs">
                  <Icon name="electric_bolt" className="text-[16px] text-badge-discount-text" />
                  Fast-track automated CAC API lookup
                </span>
                <span className={`font-semibold ${registered ? 'text-primary' : 'text-text-tertiary'}`}>
                  {registered ? 'Selected' : 'Click to choose'}
                </span>
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={!registered}
              onClick={() => onRegisteredChange(false)}
              className={`group relative flex flex-col justify-between p-space-xl rounded-xl bg-surface-canvas transition-all duration-200 cursor-pointer text-left ${
                !registered
                  ? 'shadow-md hover:shadow-xl ring-2 ring-primary-container'
                  : 'shadow-sm hover:shadow-lg ring-0'
              }`}
            >
              <div className="flex items-start justify-between gap-space-md mb-space-lg">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0">
                    <Icon name="storefront" className="text-[32px]" />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-label-sm text-caption font-medium">
                      Sole Trader / Informal
                    </span>
                    <h2 className="font-heading-md text-heading-md text-on-surface mt-space-2xs">
                      No, my business isn't registered
                    </h2>
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    !registered ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-transparent'
                  }`}
                >
                  <Icon name="check" className="text-[18px]" />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-space-md">
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  I operate as an individual, artisan, sole proprietor, or informal brand. I want to launch quickly
                  without official business documents for now.
                </p>
                <div className="p-space-md rounded-lg bg-surface-container-low">
                  <div className="flex items-start gap-space-xs">
                    <Icon name="check_circle" filled className="text-secondary text-[20px] mt-0.5 shrink-0" />
                    <p className="font-label-md text-label-md text-on-surface-variant leading-snug">
                      You can still sell, post deals &amp; use all core VEMTAP merchant tools without any friction or
                      delays.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm pt-space-xs">
                  <Icon name="bolt" className="text-[18px] text-text-tertiary" />
                  <span>Zero document friction. Launch your store profile immediately.</span>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md flex items-center justify-between text-caption font-caption text-text-tertiary gap-space-xs flex-wrap">
                <span className="flex items-center gap-space-2xs">
                  <Icon name="schedule" className="text-[16px]" />
                  Instant onboarding ready
                </span>
                <span className={`font-medium ${!registered ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
                  {!registered ? 'Selected' : 'Click to choose'}
                </span>
              </div>
            </button>
          </div>

          <div className="w-full p-space-md md:p-space-lg rounded-xl bg-surface-tint-blue/80 mb-space-2xl">
            <div className="flex items-start md:items-center gap-space-md justify-between flex-col md:flex-row">
              <div className="flex items-start sm:items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-lg bg-surface-canvas shadow-sm flex items-center justify-center text-primary shrink-0">
                  <Icon name="info" className="text-[24px]" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-primary-fixed font-semibold">
                    No pressure or rigid constraints
                  </h3>
                  <p className="font-caption text-caption text-on-secondary-container">
                    You can always upload and verify your CAC registration certificate later under Business Profile
                    Settings to upgrade your merchant tier anytime.
                  </p>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-space-2xs text-primary font-button-secondary text-button-secondary hover:underline shrink-0"
                type="button"
              >
                <span>Learn verification tiers</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-space-md pt-space-md">
            <button
              className="w-full sm:w-auto h-11 px-space-xl rounded-xl bg-surface-canvas text-text-secondary font-button-secondary text-button-secondary hover:bg-surface-container-low transition-colors shadow-sm flex items-center justify-center gap-space-xs"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[20px]" />
              <span>Back to Identity Verification</span>
            </button>
            <div className="w-full sm:w-auto flex items-center gap-space-md">
              <button
                className="w-full sm:w-auto h-11 px-space-2xl rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-lg shadow-primary-container/25 hover:bg-primary transition-all flex items-center justify-center gap-space-xs"
                type="button"
                onClick={onContinue}
              >
                <span>{registered ? 'Continue to CAC Verification' : 'Continue as Sole Merchant'}</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
            </div>
          </div>

          <div className="mt-space-2xl flex items-center justify-center gap-space-xs text-text-tertiary font-caption text-caption text-center">
            <Icon name="lock" className="text-[16px] text-badge-discount-text" />
            <span>
              Official CAC registry validation is strictly encrypted under NDPR compliance guidelines and secure banking
              protocols.
            </span>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
