import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationStatusCenterScreenProps {
  onBack: () => void;
  onUpdateInfo: () => void;
  onManageLocations?: () => void;
  onBrand?: () => void;
}

const BUSINESS_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAarvXxTllFjmrWyAjU5r7WGOLEVTVViBsVPPNlhFRphLcv0Z7YdvavE8rHwYPrICOXnmIIMOTZP2yCGFTlolJS0gofjiXITYhskM4KxHKHAw3C6s8QdmXQ_S3f0Y6h0p8bEkMrbZfbUiyUEH27srpYBYX3BApkdj7-9zvgaJl9F1N9KSFDRZxl8gaB9aUz970lYlFFysMlg9PTwAN3l8OhELBK5-n0a6Wf5xdMtiXxDkcAYCcOZYOvXw';

const RAIL_CHECKS = [
  { label: 'Legal Entity Validated (CAC)' },
  { label: '2 Physical Hubs Inspected (Apo & Wuse II)' },
  { label: 'Protection Protocol (NDPR Active)' },
];

const TRUST_PATH = 'M0 40 L30 36 L60 38 L90 28 L120 32 L150 18 L180 20 L210 12 L240 16 L270 8 L300 4';

export function DesktopVerificationStatusCenterScreen({
  onBack,
  onUpdateInfo,
  onManageLocations,
  onBrand,
}: DesktopVerificationStatusCenterScreenProps) {
  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-6xl mx-auto py-space-lg px-margin flex flex-col gap-space-xl w-full">
        <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-primary/5 pointer-events-none blur-2xl" />
          <div className="p-space-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
              <div className="relative">
                <img
                  alt="Urban Grill and Bistro dining hall"
                  className="w-20 h-20 rounded-xl object-cover shadow-sm ring-2 ring-primary/20"
                  src={BUSINESS_IMG}
                />
                <div className="absolute -bottom-2 -right-2 bg-badge-discount-bg text-badge-discount-text w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                  <Icon name="verified" filled className="text-[18px]" />
                </div>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Urban Grill &amp; Bistro</h1>
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold uppercase tracking-wider flex items-center gap-space-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Tier 3 Merchant
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary flex items-center gap-space-xs flex-wrap">
                  <Icon name="event_available" className="text-text-tertiary text-[18px]" />
                  <span>
                    Last verified on <strong className="text-text-primary font-semibold">Oct 18, 2024</strong>
                  </span>
                  <span className="text-text-tertiary">•</span>
                  <span className="text-badge-discount-text font-medium flex items-center gap-space-2xs">
                    <Icon name="check_circle" className="text-[16px]" />
                    100% Compliant
                  </span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-space-sm bg-surface-container-low/70 rounded-xl p-space-sm sm:self-auto self-stretch">
              <div className="flex flex-col items-center justify-center px-space-sm py-space-2xs text-center">
                <span className="font-caption text-caption text-text-secondary">Legal Standing</span>
                <span className="font-label-md text-label-md text-badge-discount-text font-semibold flex items-center gap-1">
                  <Icon name="shield_with_heart" className="text-[14px]" /> Validated
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-space-sm py-space-2xs text-center">
                <span className="font-caption text-caption text-text-secondary">Audited Hubs</span>
                <span className="font-label-md text-label-md text-text-primary font-semibold">2 Locations</span>
              </div>
              <div className="flex flex-col items-center justify-center px-space-sm py-space-2xs text-center">
                <span className="font-caption text-caption text-text-secondary">Security Vault</span>
                <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1">
                  <Icon name="lock" className="text-[14px]" /> NDPR Shield
                </span>
              </div>
            </div>
          </div>
          <div className="bg-surface-subtle px-space-xl py-space-md flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-lg text-text-secondary font-label-sm text-label-sm">
              {RAIL_CHECKS.map((check) => (
                <div className="flex items-center gap-space-2xs" key={check.label}>
                  <Icon name="check_circle" filled className="text-badge-discount-text text-[18px]" />
                  <span className="text-text-primary font-medium">{check.label}</span>
                </div>
              ))}
            </div>
            <span className="font-caption text-caption text-text-tertiary">Permanent Credential Ref: VMT-7749-ABJ</span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Credentials &amp; Standing</h2>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                  4 of 4 Active
                </span>
              </div>
              <span className="font-caption text-caption text-text-secondary">Continuous Real-time Sync</span>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="badge" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-label-md text-label-md text-text-primary font-bold">Identity Verification</h3>
                      <span className="px-space-2xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        Verified
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-primary font-medium mt-space-2xs">Zainab Ahmed</p>
                    <p className="font-label-sm text-label-sm text-text-secondary">
                      National Identification Number (NIN ending in •••• 4821)
                    </p>
                  </div>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary hover:text-surface-tint font-semibold flex items-center gap-1 group whitespace-nowrap"
                  type="button"
                >
                  <span>View Details</span>
                  <Icon name="arrow_forward" className="text-[16px] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <div className="bg-surface-subtle p-space-sm rounded-lg flex items-center justify-between text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-space-2xs">
                  <Icon name="verified" className="text-badge-discount-text text-[16px]" />
                  Gov-issued ID &amp; Biometric Facial Check Passed
                </span>
                <span className="text-text-tertiary">Verified Dec 2023</span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="corporate_fare" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-label-md text-label-md text-text-primary font-bold">Business Registration (CAC)</h3>
                      <span className="px-space-2xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        Active Filing
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-primary font-medium mt-space-2xs">
                      Corporate Affairs Commission of Nigeria
                    </p>
                    <p className="font-label-sm text-label-sm text-text-secondary">
                      Registration ID: <span className="font-mono text-text-primary font-medium">BN-3491820</span>
                    </p>
                  </div>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary hover:text-surface-tint font-semibold flex items-center gap-1 group whitespace-nowrap"
                  type="button"
                >
                  <span>View Certificate</span>
                  <Icon name="arrow_forward" className="text-[16px] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <div className="bg-surface-subtle p-space-sm rounded-lg flex flex-wrap items-center justify-between gap-space-xs text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-space-2xs">
                  <Icon name="task_alt" className="text-badge-discount-text text-[16px]" />
                  Registered 14 May 2021 • Category: Hospitality &amp; Dining
                </span>
                <span className="text-text-tertiary">CAC Electronic Register Match</span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="storefront" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-label-md text-label-md text-text-primary font-bold">Physical Business Locations</h3>
                      <span className="px-space-2xs py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                        2 Inspected
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-primary font-medium mt-space-2xs">
                      Apo Grand Hub &amp; Wuse II Flagship
                    </p>
                    <p className="font-label-sm text-label-sm text-text-secondary">
                      Geofenced GPS Beacon active with verified storefront photos
                    </p>
                  </div>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary hover:text-surface-tint font-semibold flex items-center gap-1 group whitespace-nowrap"
                  type="button"
                  onClick={onManageLocations}
                >
                  <span>Manage Locations</span>
                  <Icon name="arrow_forward" className="text-[16px] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                <div className="p-space-xs rounded-lg bg-surface-subtle flex items-center gap-space-xs">
                  <div className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                      Plot 182, Apo District
                    </span>
                    <span className="font-caption text-caption text-text-secondary">Audit Pass: On-site Agent VMT-90</span>
                  </div>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-subtle flex items-center gap-space-xs">
                  <div className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                      42 Adetokunbo Ademola, Wuse II
                    </span>
                    <span className="font-caption text-caption text-text-secondary">Audit Pass: GPS &amp; Utility Receipt</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0">
                    <Icon name="workspace_premium" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-label-md text-label-md text-text-primary font-bold">Storefront Standing</h3>
                      <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                        In Good Standing
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                      Full merchant rights unlocked: Hyper-local customer discovery, direct deal publishing, real-time
                      tap reservations, and instant customer pass redemption.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-md pt-space-xs text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-1 text-badge-discount-text font-semibold">
                  <Icon name="thumb_up" className="text-[16px]" /> 0 Customer Disputes
                </span>
                <span className="text-text-tertiary">•</span>
                <span>Policy Compliance: 100%</span>
                <span className="text-text-tertiary">•</span>
                <span>Fraud Risk: Minimal</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold uppercase tracking-wider">
                  Consumer Trust Multiplier
                </span>
                <Icon name="insights" className="text-primary text-[20px]" />
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-baseline gap-space-xs">
                  <span className="text-4xl font-extrabold text-text-primary tracking-tight">3.4x</span>
                  <span className="font-label-md text-label-md text-text-secondary font-semibold">Foot Traffic Lift</span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  Verified merchants receive preferential placement across consumer feeds and local search suggestions
                  within 5km radius.
                </p>
              </div>
              <div className="bg-surface-subtle p-space-md rounded-xl flex flex-col gap-space-sm">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="text-text-primary font-bold">Platform Trust Score</span>
                  <span className="text-primary font-extrabold text-heading-sm font-heading-sm">98 / 100</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '98%' }} />
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                  <span>Top 2% in Abuja</span>
                  <span className="text-badge-discount-text font-semibold">Tier 3 Qualified</span>
                </div>
              </div>
              <div className="pt-space-2xs">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                  30-Day Consumer Impressions (Verified Badge Lift)
                </span>
                <svg className="w-full h-12 text-primary mt-space-2xs" fill="none" viewBox="0 0 300 48">
                  <path d={TRUST_PATH} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  <path
                    d={`${TRUST_PATH} L300 48 L0 48 Z`}
                    fill="currentColor"
                    fillOpacity="0.08"
                  />
                </svg>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs text-text-primary">
                <Icon name="manage_history" className="text-text-secondary text-[20px]" />
                <h3 className="font-label-md text-label-md font-bold">Manage Legal Information</h3>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Any modification to registered business name, legal structure, or executive directors requires mandatory
                re-verification to protect customer integrity.
              </p>
              <button
                className="w-full h-11 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-primary font-button-secondary text-button-secondary font-semibold transition-colors flex items-center justify-center gap-space-xs shadow-sm"
                type="button"
                onClick={onUpdateInfo}
              >
                <Icon name="edit_document" className="text-[18px]" />
                <span>Update Verification Information</span>
              </button>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <Icon name="verified" className="text-primary text-[20px]" />
                <h3 className="font-label-md text-label-md text-text-primary font-bold">Enterprise Audit Proof</h3>
              </div>
              <p className="font-label-sm text-label-sm text-text-secondary">
                Need certified proof of platform merchant verification for commercial bank loan applications or
                commercial leases?
              </p>
              <button
                className="font-label-sm text-label-sm text-primary hover:text-surface-tint font-bold flex items-center gap-1 pt-space-2xs self-start"
                type="button"
              >
                <span>Request Official Verification Letter →</span>
              </button>
            </div>

            <div className="rounded-xl bg-surface-container-low p-space-md flex items-start gap-space-sm text-text-secondary font-caption text-caption">
              <Icon name="policy" className="text-text-tertiary text-[20px] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-space-2xs">
                <span className="font-semibold text-text-primary">Regulatory Safe Harbor</span>
                <p>
                  VEMTAP operations comply strictly with the Nigeria Data Protection Act (NDPA) and NDPR guidelines.
                  Encrypted records are securely held under tokenized vault architecture.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest px-space-lg py-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm text-text-secondary font-label-sm text-label-sm">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
            <span className="font-medium text-text-primary">System Integrity: 100% Secure</span>
            <span className="text-text-tertiary hidden sm:inline">•</span>
            <span className="hidden sm:inline">Last automated compliance check passed today at 04:15 WAT</span>
          </div>
          <div className="flex items-center gap-space-md font-caption text-caption text-text-tertiary">
            <span>Node: ABV-EDGE-04</span>
            <button className="text-primary hover:underline font-semibold" type="button">
              Run Live Ping
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
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
