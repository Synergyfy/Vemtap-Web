import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationCacSuccessScreenProps {
  onBack: () => void;
  onContinue: () => void;
  businessName: string;
  cacNumber: string;
  legalName: string;
  onBrand?: () => void;
}

const MERCHANT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBKkQ31DOVXy9rs6DFYib1J7YhF0HyWeM1YKZ0Um_l3KK8h7CZ5277alLBwVJ_m3jNlZSt5Pv2v7IxkVt5g1-qkSoA5bnQs4WcQOlHQATLNBcoJsDu4mFdWqQXRe7l4CxGLInq-NUqgbT5SwrwCb79rYT16k8rx-kO3aC4z0IAaoAI5H8gF5ApxTANvdpwlOOHzFznZ3mhSJ-tM_LfGSIprf2HLMxoq3zOCasnEzX2Yf9lGdCCl2E2wRw';

const PLATTER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLzcmg3IVmorz3bvPkpzY53KZEx9DDJVJKLm258isnYOEGlmcoUcb1edJpQ4nR6iJxMKUhqOYrHOmiwHfZH1p-V3nRFWUVEfRA-InDoK5JuH-bRm-1un4PCvbsgrqIuaHCJvhkw6V0l6BIjvSC5li54SFeUFD1NC-__NZ8NtT5hANOx2Wm3rTYICsrGjP54eTp0lcV5jUI3Tr_4R6w7HwW9LGLwwMESNSmMBE1SXv7_OGcBLQ_dFHA2w';

const PRIVILEGES = [
  {
    icon: 'verified',
    iconClass: 'bg-primary-container text-on-primary',
    title: 'Verified Operator',
    body: 'Permanent blue trust insignia',
  },
  {
    icon: 'trending_up',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Pinned Local Discovery',
    body: '+340% footfall search boost',
  },
  {
    icon: 'local_offer',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Instant Deals Engine',
    body: 'Flash promos go live without delay',
  },
  {
    icon: 'payments',
    iconClass: 'bg-surface-container-high text-primary',
    title: 'Multi-Till Settlements',
    body: 'Direct branch payout routing',
  },
];

const HASH = '0x9A48C88B97D11432E64A891001FCBD01A9491820F209CAC-NGR-2025';

export function DesktopVerificationCacSuccessScreen({
  onBack,
  onContinue,
  businessName,
  cacNumber,
  legalName,
  onBrand,
}: DesktopVerificationCacSuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(HASH);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-6xl mx-auto w-full px-margin py-space-xl flex flex-col gap-space-2xl">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-md p-space-xl md:p-space-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-badge-discount-bg/60 blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-20 w-64 h-64 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-xl">
            <div className="flex items-start md:items-center gap-space-lg">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-badge-discount-text/20 blur-md animate-pulse" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-sm">
                  <Icon name="verified" filled className="text-[36px] md:text-[44px] text-badge-discount-text" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center">
                  <Icon name="shield" filled className="text-[16px] text-primary" />
                </span>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold tracking-wide uppercase">
                    Official Validation Record
                  </span>
                  <span className="text-text-tertiary text-caption font-caption">•</span>
                  <span className="text-text-secondary font-label-sm text-label-sm font-medium">
                    Federal Republic of Nigeria
                  </span>
                </div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight font-bold">
                  Business registration verified
                </h1>
                <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
                  Your business registration has been successfully authenticated against Corporate Affairs Commission
                  (CAC) registry records.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-start md:items-end gap-space-xs bg-surface-subtle p-space-md rounded-xl shadow-sm">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-ping" />
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">Step 2 of 3 Completed</span>
              </div>
              <div className="flex items-center gap-space-2xs">
                <div className="w-28 h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="w-full h-full bg-badge-discount-text rounded-full transition-all duration-500" />
                </div>
                <span className="font-caption text-caption font-semibold text-badge-discount-text">100% Validated</span>
              </div>
              <span className="font-caption text-caption text-text-tertiary">Real-time CAC API match confirmed</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md relative overflow-hidden">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container-high shadow-sm">
                    <img alt="Urban Grill & Bistro interior" className="w-full h-full object-cover" src={MERCHANT_IMAGE} />
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                      <Icon name="check" filled className="text-[12px]" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                        {businessName || 'Urban Grill & Bistro'}
                      </h2>
                      <Icon name="verified" filled className="text-[18px] text-primary shrink-0" />
                    </div>
                    <p className="font-label-sm text-label-sm text-text-secondary truncate">
                      Victoria Island Lagos • Wuse II Abuja
                    </p>
                    <div className="flex items-center gap-space-xs mt-space-2xs">
                      <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-medium">
                        Restaurant &amp; Bar
                      </span>
                      <span className="px-space-xs py-space-2xs rounded-full bg-surface-subtle text-text-secondary font-caption text-caption">
                        Dual Branch
                      </span>
                    </div>
                  </div>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-space-2xs shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> Live Status
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="account_balance" className="text-primary text-[20px]" />
                  <span className="font-heading-sm text-heading-sm text-text-primary">Corporate Affairs Registry Entry</span>
                </div>
                <span className="font-caption text-caption text-text-tertiary font-mono">RC/BN SYNC: OK</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">Official Registered Name</span>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    {businessName || 'Urban Grill & Bistro Ltd'}
                  </span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">CAC Registration Number</span>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-mono font-semibold text-text-primary">
                      {cacNumber || 'BN-3491820'}
                    </span>
                    <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-space-2xs">
                      <Icon name="check_circle" className="text-[13px]" />
                      Live in Registry
                    </span>
                  </div>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">Primary Operator &amp; Signatory</span>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      {legalName || 'Zainab Ahmed'}
                    </span>
                    <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-medium flex items-center gap-space-2xs">
                      <Icon name="fingerprint" className="text-[13px]" />
                      Identity Verified (NIN Linked)
                    </span>
                  </div>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">Official Registry Date</span>
                  <span className="font-label-md text-label-md font-medium text-text-primary">
                    14 May 2021 (4 Years Active)
                  </span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs">
                  <span className="font-label-md text-label-md text-text-secondary">Regulatory Standing</span>
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    <span className="font-label-md text-label-md font-semibold text-badge-discount-text">
                      Active • Good Standing
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-space-2xs p-space-md rounded-xl bg-surface-container-high/60 flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="enhanced_encryption" className="text-text-secondary text-[16px]" />
                    <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                      NDPR Cryptographic Hash Certificate
                    </span>
                  </div>
                  <button
                    className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg bg-surface-container-lowest hover:bg-surface-tint-blue transition-colors text-text-primary font-caption text-caption"
                    type="button"
                    onClick={copyHash}
                  >
                    <Icon name="content_copy" className="text-[14px]" />
                    <span>Copy Key</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-surface-container-lowest/80 px-space-sm py-space-xs rounded-lg">
                  <code className="font-caption text-caption font-mono text-text-primary truncate">{HASH}</code>
                  {copied && (
                    <span className="font-caption text-caption text-badge-discount-text font-semibold pl-space-xs">Copied!</span>
                  )}
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-badge-discount-bg/40 flex items-start gap-space-sm">
                <Icon name="verified_user" className="text-badge-discount-text text-[22px] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-space-2xs">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Trust Assurance Guarantee
                  </span>
                  <p className="font-body-md text-body-md text-text-secondary leading-snug">
                    Your business will now display the official VEMTAP Verified badge on all storefront listings,
                    deals, and customer search results.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="phone_iphone" className="text-primary text-[20px]" />
                  <span className="font-heading-sm text-heading-sm text-text-primary">Live Storefront Feed Simulation</span>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Abuja &amp; Lagos Viewport
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Here is how your authenticated identity appears on consumer mobile feeds when customers search nearby
                dining.
              </p>
              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-sm transition-all hover:shadow-md">
                <div className="relative w-full h-36 rounded-lg overflow-hidden bg-surface-container">
                  <img alt="Gourmet grilled platter at Urban Grill & Bistro" className="w-full h-full object-cover" src={PLATTER_IMAGE} />
                  <div className="absolute top-2 left-2 px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold flex items-center gap-space-2xs">
                    <span>15% Tap Discount</span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-space-xs py-space-2xs rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-text-primary font-caption text-caption font-medium flex items-center gap-space-2xs">
                    <Icon name="near_me" className="text-[14px] text-badge-discount-text" />
                    <span>0.3 km away</span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-space-sm pt-space-2xs">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                        {businessName || 'Urban Grill & Bistro'}
                      </span>
                      <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold shrink-0">
                        <Icon name="verified" filled className="text-[13px]" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-space-2xs truncate">
                      Contemporary Dining • Victoria Island, Lagos • Open Now
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-label-sm text-label-sm font-bold text-text-primary flex items-center gap-space-2xs">
                      <Icon name="star" filled className="text-[16px] text-tertiary-container" />
                      4.9
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">(480+ visits)</span>
                  </div>
                </div>
                <div className="pt-space-xs flex items-center justify-between font-caption text-caption text-text-secondary">
                  <span className="flex items-center gap-space-2xs text-badge-discount-text font-medium">
                    <Icon name="verified_user" className="text-[15px]" />
                    CAC Registered Merchant
                  </span>
                  <span className="text-primary font-label-sm text-label-sm font-semibold hover:underline cursor-pointer">
                    Preview in App →
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Privileges Unlocked</h3>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                  4 of 4 Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                {PRIVILEGES.map((privilege) => (
                  <div className="p-space-sm rounded-lg bg-surface-subtle flex items-start gap-space-sm" key={privilege.icon}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${privilege.iconClass}`}>
                      <Icon name={privilege.icon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">{privilege.title}</span>
                      <span className="font-caption text-caption text-text-secondary">{privilege.body}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-space-xs flex items-center justify-between gap-space-md">
                <button
                  className="w-full h-11 px-space-md rounded-lg bg-surface-subtle hover:bg-surface-tint-blue text-text-primary hover:text-primary transition-colors font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs"
                  type="button"
                >
                  <Icon name="download" className="text-[18px] text-primary" />
                  <span>Download Official Verification Certificate (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest shadow-md p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name="timer" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-text-primary">
                Step 2 of 3 • Final setup takes less than 1 minute
              </span>
              <span className="font-caption text-caption text-text-secondary">
                Confirm payout bank credentials and launch live storefront campaigns
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
            <button
              className="h-12 px-space-lg rounded-xl text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors flex items-center justify-center"
              type="button"
              onClick={onBack}
            >
              Back to Verification Overview
            </button>
            <button
              className="h-12 px-space-xl rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary hover:bg-surface-tint active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs shadow-md"
              type="button"
              onClick={onContinue}
            >
              <span>Continue to Final Review</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
