import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerificationCompleteScreenProps {
  onBack: () => void;
  onActivate: () => void;
  onPreviewStorefront: () => void;
  legalName: string;
  cacNumber: string;
}

const BURGER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBeoDqzO4anB8Z-TU6M-cbD3FQJO-Ip7BzoIsvYZJaOZhcKc7ntuU4bR_ZugHITIMPdjNhg5aBnPkz1omKk8iA6CvNRqbSSfmiHjCMijjw2UANIVzgXlkrnYgguwiQqQY3BAZCu1PSUO1eKTPE0mqQYuTJJhCBd8k6dhqFzHiK-563AAUlOj-cm0UN0aU3l9U1SoGltJeYsMxuI07jAEz2GBpP48CkpTD01PKphMVZQn71RHylcoHyVWQ';
const BURGER_ALT =
  'Modern gourmet artisan grill burger with melted smoked cheddar, caramelized onions, fresh microgreens, and crisp fries photographed in warm natural daylight inside an upscale bistro with rich wooden textures and minimalist brand colors.';

function VerifiedShield() {
  return (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="shieldGrad" x1="8" x2="56" y1="4" y2="60">
          <stop offset="0%" stopColor="#066CF4" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <radialGradient cx="50%" cy="50%" id="checkGlow" r="50%">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M32 4L11 11.5V29.5C11 43.8 19.8 55.8 32 60C44.2 55.8 53 43.8 53 29.5V11.5L32 4Z" fill="url(#shieldGrad)" />
      <path
        d="M32 8L15 14.5V29.5C15 41.5 22.3 51.5 32 55.2C41.7 51.5 49 41.5 49 29.5V14.5L32 8Z"
        fill="#FFFFFF"
        fillOpacity="0.15"
      />
      <circle cx="32" cy="32" fill="white" r="18" />
      <path
        d="M25 32.5L29.5 37L39 27"
        stroke="#059669"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
    </svg>
  );
}

interface Pillar {
  icon: string;
  title: string;
  status: string;
  detail: string;
}

export function VerificationCompleteScreen({
  onBack,
  onActivate,
  onPreviewStorefront,
  legalName,
  cacNumber,
}: VerificationCompleteScreenProps) {
  const pillars: Pillar[] = [
    { icon: 'badge', title: 'Identity', status: 'Verified', detail: `Operator: ${legalName}` },
    { icon: 'domain_verification', title: 'Business', status: 'CAC verified', detail: `Registry: ${cacNumber}` },
    {
      icon: 'storefront',
      title: 'Business Location',
      status: 'Added',
      detail: 'Apo District, Abuja • 2 Branches Active',
    },
    {
      icon: 'palette',
      title: 'Business Profile',
      status: 'Ready',
      detail: 'Logo, Cover, Catalog & Deal Configured',
    },
  ];

  return (
    <AppScreen>
      <ScreenHeader title="Verification Complete" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-space-2xl space-y-space-lg">
        {/* Celebratory Hero Visual Section */}
        <div className="flex flex-col items-center text-center pt-space-md">
          <div className="relative flex items-center justify-center w-28 h-28 mb-space-md">
            <div className="absolute inset-0 rounded-full bg-badge-discount-bg blur-xl opacity-90" />
            <div className="absolute inset-2 rounded-full bg-surface-tint-blue blur-lg opacity-70" />
            <div className="relative w-24 h-24 rounded-full bg-surface-container-lowest shadow-xl flex items-center justify-center">
              <VerifiedShield />
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-md">
                <Icon name="verified" filled className="text-badge-discount-text text-[16px]" />
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-space-2xs px-3 py-1 rounded-full bg-badge-discount-bg mb-space-xs">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-label-sm text-label-sm text-badge-discount-text">Account 100% Validated</span>
          </div>
          <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">You're verified</h2>
          <p className="font-label-sm text-label-sm text-text-secondary">Your business is ready for the next step.</p>
        </div>

        {/* Pillars Confirmation Summary Bento Card */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Verification Breakdown
            </span>
            <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold flex items-center gap-1">
              <Icon name="check_circle" filled className="text-[15px]" />
              4 / 4 Confirmed
            </span>
          </div>
          {/* Verified Items List */}
          <div className="space-y-space-sm">
            {pillars.map((pillar) => (
              <div className="flex items-start gap-space-sm p-space-xs rounded-lg bg-surface-subtle" key={pillar.icon}>
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
                  <Icon name={pillar.icon} filled className="text-primary-container text-[20px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-label-md text-label-md text-text-primary">{pillar.title}</h4>
                    <span className="font-label-sm text-label-sm text-badge-discount-text flex items-center gap-0.5">
                      <Icon name="done" className="text-[14px]" /> {pillar.status}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 truncate">{pillar.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Verified Storefront Preview Inset Banner */}
          <div className="pt-space-xs">
            <div className="flex items-center gap-space-sm p-space-xs rounded-xl bg-surface-container-low">
              <img
                alt={BURGER_ALT}
                className="w-14 h-14 rounded-lg object-cover shadow-sm shrink-0"
                src={BURGER_IMG}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-label-md text-label-md text-text-primary truncate">Urban Grill & Bistro</p>
                  <Icon name="verified" filled className="text-primary-container text-[16px]" />
                </div>
                <p className="font-caption text-caption text-text-secondary truncate">
                  Live Catalog • 1 Active Welcome Voucher
                </p>
                <div className="inline-flex items-center gap-1 mt-0.5">
                  <span className="font-caption text-caption text-badge-discount-text font-medium">
                    Ready for consumer discovery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Trust Status Banner */}
        <div className="relative overflow-hidden rounded-xl bg-surface-tint-blue p-space-md">
          <div className="relative z-10 flex items-start gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <Icon name="verified_user" className="text-on-primary text-[18px]" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-label-md text-label-md text-text-primary font-semibold">Official Trust Status</h3>
              <p className="font-label-sm text-label-sm text-text-secondary">
                Your official VEMTAP Verified Business badge is now active. Your storefront will feature the verified
                trust checkmark across all customer discovery searches.
              </p>
            </div>
          </div>
        </div>

        {/* Action Deck Area */}
        <div className="mt-auto space-y-space-md pt-space-xs w-full">
          <div className="text-center">
            <p className="font-label-sm text-label-sm text-text-secondary">
              Your business is ready for the next step.
            </p>
          </div>
          {/* Primary CTA button */}
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-md shadow-primary/20 flex items-center justify-center gap-space-xs hover:opacity-95 active:scale-[0.98] transition-all"
            id="activateBtn"
            type="button"
            onClick={onActivate}
          >
            <span>Continue to Activation</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          {/* Secondary Text Action */}
          <div className="flex justify-center">
            <button
              className="h-11 px-space-md flex items-center justify-center gap-space-2xs text-text-primary font-button-secondary text-button-secondary hover:text-primary-container transition-colors active:scale-95"
              id="previewBtn"
              type="button"
              onClick={onPreviewStorefront}
            >
              <Icon name="visibility" className="text-[18px]" />
              <span>Preview Verified Storefront</span>
            </button>
          </div>
          {/* Reassurance Footer */}
          <div className="flex items-center justify-center gap-space-2xs text-text-tertiary pt-space-xs">
            <Icon name="lock" className="text-[16px]" />
            <span className="font-caption text-caption text-text-secondary">
              Encrypted & securely stored via NDPR compliance standards.
            </span>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
