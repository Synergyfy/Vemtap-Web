import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerificationCacSuccessScreenProps {
  onBack: () => void;
  onContinue: () => void;
  businessName: string;
  cacNumber: string;
  legalName: string;
}

const STOREFRONT_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA0zii5gSszMBCXy4x3QIkdgB7Zixtmh9cDepHQcvEz5KC5VugAI-95LYUhMHatMF7msTNf4ZyIuQPHPey06MAX05cQHB2qUB-5obtIywYNXfjHMkAtIWCXQHm_i_5bIzkoQ2Afv8JxKvsX9s1BUO6MgCkFU_F0lkaJyh8_T0PZ8blgEEtNq31NC0gGpScmK0KbaRpRJpJ0FZOWm8WTFI5KMTqyRHVeA_OHm1yNoUBzRcumlsEnfyHsBA';
const STOREFRONT_ALT =
  'Modern upscale bistro interior with warm ambient pendant lights, wooden dining tables, and lush green plants in a Lagos Nigeria restaurant.';

export function VerificationCacSuccessScreen({
  onBack,
  onContinue,
  businessName,
  cacNumber,
  legalName,
}: VerificationCacSuccessScreenProps) {
  return (
    <AppScreen>
      <ScreenHeader title="Cac Verification Success" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-2xl">
        {/* Ambient Glow & Celebratory Badge */}
        <div className="relative w-full flex flex-col items-center pt-space-md text-center">
          <div className="relative flex items-center justify-center my-space-sm">
            <div className="absolute -inset-4 bg-badge-discount-bg/80 rounded-full blur-xl scale-125 pointer-events-none" />
            <div className="relative w-20 h-20 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-lg shadow-badge-discount-text/10">
              <div className="w-14 h-14 rounded-full bg-badge-discount-text flex items-center justify-center text-on-primary shadow-inner">
                <Icon
                  name="check"
                  className="text-[34px]"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                />
              </div>
            </div>
          </div>
          {/* Verified Headline & Subtitle */}
          <div className="px-space-xs mt-space-xs">
            <h2 className="font-heading-md text-heading-md text-on-surface tracking-tight">Business verified</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-space-2xs max-w-[320px] mx-auto leading-relaxed">
              Your business registration has been successfully verified against CAC registry records.
            </p>
          </div>
        </div>

        {/* Storefront Preview Thumbnail & Trust Highlights Strip */}
        <div className="mt-space-lg w-full bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm">
          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-surface-container">
            <img alt={STOREFRONT_ALT} className="w-full h-full object-cover" src={STOREFRONT_IMG} />
            <div className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-tl-md px-1 py-0.5 flex items-center">
              <Icon name="verified" filled className="text-[10px]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-body-md text-body-md font-semibold text-on-surface truncate">{businessName}</span>
              <Icon name="verified" filled className="text-primary text-[18px] shrink-0" />
            </div>
            <p className="font-caption text-caption text-on-surface-variant truncate mt-0.5">
              Victoria Island, Lagos • Restaurant & Bar
            </p>
          </div>
        </div>

        {/* Verification Summary Card */}
        <div className="mt-space-md w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary">
              Official Record
            </span>
            <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
              Live in Registry
            </span>
          </div>
          {/* Business Name */}
          <div className="flex flex-col gap-1">
            <span className="font-caption text-caption text-on-surface-variant">Business Name</span>
            <span className="font-body-md text-body-md text-on-surface font-semibold truncate">{businessName}</span>
          </div>
          {/* CAC Registration Badge */}
          <div className="flex flex-col gap-1.5">
            <span className="font-caption text-caption text-on-surface-variant">CAC Registration</span>
            <div className="self-start inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              <Icon name="check_circle" filled className="text-[14px]" />
              <span>CAC Verified ({cacNumber})</span>
            </div>
          </div>
          {/* Identity Row */}
          <div className="flex flex-col gap-1.5">
            <span className="font-caption text-caption text-on-surface-variant">Account Operator</span>
            <div className="self-start inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              <Icon name="badge" filled className="text-[14px]" />
              <span>Identity Verified ({legalName})</span>
            </div>
          </div>
          {/* VEMTAP Trust Status */}
          <div className="flex flex-col gap-1.5 pt-space-2xs">
            <span className="font-caption text-caption text-on-surface-variant">Storefront Trust Badge</span>
            <div className="self-start inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
              <Icon name="verified" filled className="text-[14px]" />
              <span>Verified Business ✓</span>
            </div>
          </div>
        </div>

        {/* Trust Explanation Banner */}
        <div className="mt-space-md w-full bg-surface-container-low rounded-xl p-space-sm flex gap-space-sm items-start">
          <div className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="shield" filled className="text-[18px]" />
          </div>
          <p className="font-label-sm text-label-sm text-on-surface leading-snug">
            Your business will now display the official{' '}
            <span className="font-semibold text-primary">VEMTAP Verified</span> badge on all storefront listings,
            deals, and customer search results.
          </p>
        </div>

        {/* Bottom Fixed Action Deck */}
        <div className="mt-auto pt-space-xl flex flex-col items-center gap-space-sm w-full">
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 active:scale-[0.98] transition-transform duration-100"
            type="button"
            onClick={onContinue}
          >
            <span>Continue to Final Review</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <p className="font-caption text-caption text-on-surface-variant text-center">
            Step 3 of 4 • Final setup takes less than 1 minute
          </p>
        </div>
      </div>
    </AppScreen>
  );
}
