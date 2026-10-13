import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationIdSuccessScreenProps {
  onBack: () => void;
  onContinue: () => void;
  legalName: string;
  documentLabel: string;
  reference: string;
  onBrand?: () => void;
}

export function DesktopVerificationIdSuccessScreen({
  onBack,
  onContinue,
  legalName,
  documentLabel,
  reference,
  onBrand,
}: DesktopVerificationIdSuccessScreenProps) {
  const now = new Date();
  const verifiedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const verifiedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const initials = legalName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="w-full bg-badge-discount-bg py-space-xs px-margin">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-space-md flex-wrap">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-badge-discount-text text-surface-canvas text-[13px]">
              <Icon name="check" className="text-[14px]" />
            </span>
            <span className="font-label-md text-label-md text-badge-discount-text font-semibold tracking-wide">
              Identity Verification Complete • Step 1 Passed
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
            <Icon name="lock" className="text-[15px] text-badge-discount-text" />
            <span>256-Bit Vault Enclave • NIMC Validated</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-margin py-space-2xl flex flex-col gap-space-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
          <div className="flex items-start gap-space-lg">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute w-20 h-20 rounded-full bg-badge-discount-bg animate-ping opacity-75" />
              <div className="w-20 h-20 rounded-2xl bg-badge-discount-bg flex items-center justify-center shadow-sm relative z-10">
                <Icon name="verified" filled className="text-badge-discount-text text-[44px]" />
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-caption text-caption uppercase tracking-wider text-primary font-semibold">
                  Stage 1 of 3 Verified
                </span>
                <span className="text-outline-variant">•</span>
                <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text inline-block" /> Level 2 Clearance
                </span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Identity verified</h1>
              <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
                Your personal identity has been successfully validated against national identity registries. You are
                ready to configure merchant ownership and linked store locations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-xl shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1.5 rounded-full bg-primary" />
              <div className="w-2 h-1.5 rounded-full bg-outline-variant" />
              <div className="w-2 h-1.5 rounded-full bg-outline-variant" />
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium ml-space-xs">
              Step 1 Completed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-md p-space-xl flex flex-col gap-space-lg">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="badge" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Verified Identity Dossier</h2>
                </div>
                <span className="inline-flex items-center gap-1 px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-semibold">
                  <Icon name="check_circle" className="text-[13px]" /> Verified
                </span>
              </div>
              <div className="flex items-center gap-space-md p-space-md rounded-lg bg-surface-subtle">
                <div className="w-14 h-14 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary font-heading-sm text-heading-sm shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-secondary">Verified Person</span>
                  <span className="font-heading-sm text-heading-sm text-text-primary truncate">{legalName}</span>
                  <span className="font-caption text-caption text-text-tertiary">
                    Natural Person ID Entity • Resident Profile
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col p-space-md rounded-lg bg-surface-container-low">
                  <span className="font-caption text-caption text-text-secondary">Document Type</span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold mt-0.5">
                    {documentLabel}
                  </span>
                  <span className="font-caption text-caption text-text-tertiary mt-1">Federal Republic of Nigeria</span>
                </div>
                <div className="flex flex-col p-space-md rounded-lg bg-surface-container-low">
                  <span className="font-caption text-caption text-text-secondary">Document Reference</span>
                  <div className="flex items-center gap-space-xs mt-0.5">
                    <span className="font-label-md text-label-md text-text-primary font-semibold tracking-widest">
                      {reference}
                    </span>
                    <Icon name="verified" className="text-[16px] text-badge-discount-text" />
                  </div>
                  <span className="font-caption text-caption text-text-tertiary mt-1">Masked for NDPR safety</span>
                </div>
                <div className="flex flex-col p-space-md rounded-lg bg-surface-container-low">
                  <span className="font-caption text-caption text-text-secondary">Timestamp</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium mt-0.5">{verifiedDate}</span>
                  <span className="font-caption text-caption text-text-tertiary mt-0.5">{verifiedTime} WAT (UTC+1)</span>
                </div>
                <div className="flex flex-col p-space-md rounded-lg bg-surface-container-low">
                  <span className="font-caption text-caption text-text-secondary">Validation Engine</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium mt-0.5">
                    NIMC Direct Link
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-medium mt-0.5">
                    Response Code: 200 OK
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-inverse-surface text-inverse-on-surface">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="key" className="text-primary-fixed-dim text-[18px]" />
                    <span className="font-caption text-caption font-semibold tracking-wider text-surface-variant uppercase">
                      Cryptographic Signature
                    </span>
                  </div>
                  <span className="font-caption text-caption text-surface-tint-blue font-mono bg-on-primary-fixed px-space-xs py-space-2xs rounded">
                    NDPR-SIG
                  </span>
                </div>
                <div className="font-mono text-label-sm text-inverse-on-surface break-all select-all bg-inverse-surface p-space-xs rounded">
                  VT-NIN-984210-OK-8fa93c2004d41e7be84a0c8121f00cb76d8
                </div>
                <span className="text-surface-dim font-caption text-caption">SHA-256 Hash Authenticated</span>
              </div>
            </div>
            <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-tint-blue text-primary">
              <Icon name="shield_lock" className="text-[24px] text-primary shrink-0" />
              <p className="font-label-sm text-label-sm text-on-secondary-container">
                Your biometric records are purged upon verification validation. Only the zero-knowledge verification
                hash remains retained to secure your business account.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-md p-space-xl flex flex-col gap-space-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="storefront" className="text-tertiary-container text-[24px]" />
                  <div>
                    <span className="font-caption text-caption text-tertiary-container uppercase tracking-wider font-semibold">
                      Incoming Milestone
                    </span>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Next Stage: Business Registration
                    </h2>
                  </div>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high font-label-sm text-caption text-on-surface-variant font-semibold">
                  Step 2 of 3
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Tell us whether your store or enterprise maintains an official CAC (Corporate Affairs Commission)
                corporate registration number, or if you operate as an accredited artisan / sole trader.
              </p>
              <div className="flex flex-col gap-space-sm">
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                  Unlocked Merchant Privileges:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  {[
                    {
                      icon: 'verified_user',
                      iconClass: 'text-badge-discount-text',
                      title: 'Verified Operator Badge',
                      body: 'Surfaces trust badges across user search feeds.',
                    },
                    {
                      icon: 'pin_drop',
                      iconClass: 'text-primary',
                      title: 'Abuja Outlets Enabled',
                      body: 'Link up to 5 branch storefronts immediately.',
                    },
                    {
                      icon: 'bolt',
                      iconClass: 'text-primary-container',
                      title: 'Instant VEMTAP Deals',
                      body: 'Publish discount vouchers straight to app consumers.',
                    },
                    {
                      icon: 'account_balance_wallet',
                      iconClass: 'text-badge-discount-text',
                      title: 'Direct NGN Settlement',
                      body: 'Automated same-day deposits into your linked bank.',
                    },
                  ].map((perk) => (
                    <div
                      key={perk.title}
                      className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low"
                    >
                      <Icon name={perk.icon} className={`${perk.iconClass} text-[20px] shrink-0 mt-0.5`} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-sm text-label-sm font-semibold text-text-primary">{perk.title}</span>
                        <span className="font-caption text-caption text-text-secondary">{perk.body}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-space-xs p-space-md rounded-xl bg-surface-subtle">
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  Preparation Checklist for Step 2:
                </span>
                <ul className="flex flex-col gap-space-2xs text-text-secondary font-label-sm text-label-sm">
                  {[
                    'Registered Business Name or Trade Alias',
                    'CAC RC/BN Number (optional for micro-traders)',
                    'Primary Physical Storefront Address in Nigeria',
                  ].map((item) => (
                    <li className="flex items-center gap-space-xs" key={item}>
                      <Icon name="check_box" className="text-primary text-[16px]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-canvas shadow-sm flex-wrap">
              <div className="flex items-center gap-space-sm min-w-0">
                <Icon name="policy" className="text-on-surface-variant text-[20px] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    NDPR Security Guarantee
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Compliant with Nigeria Data Protection Regulation 2023.
                  </span>
                </div>
              </div>
              <button className="font-label-sm text-label-sm text-primary font-semibold hover:underline shrink-0" type="button">
                Read Policy
              </button>
            </div>
          </div>
        </div>

        <div className="w-full bg-surface-canvas rounded-xl shadow-lg p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0">
              <Icon name="download_done" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Stage 1 Receipt Ready</span>
              <span className="font-caption text-caption text-text-secondary">
                Official verification certificate signed with cryptographic timestamp.
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-md w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-space-lg py-space-sm rounded-xl font-label-md text-label-md font-medium text-text-primary hover:bg-surface-container-low transition-colors flex items-center justify-center gap-space-xs"
              type="button"
            >
              <Icon name="file_download" className="text-[18px]" />
              <span>Download Verification Receipt (PDF)</span>
            </button>
            <button
              className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary bg-primary-container text-on-primary hover:bg-primary transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-space-xs text-center"
              type="button"
              onClick={onContinue}
            >
              <span>Continue to Business Registration</span>
              <Icon name="arrow_forward" className="text-[20px]" />
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
