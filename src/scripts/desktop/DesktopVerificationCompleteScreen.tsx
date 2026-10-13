import { Icon } from '../../components/ui/Icon';
import { BusinessVerificationChrome } from './BusinessVerificationChrome';

interface DesktopVerificationCompleteScreenProps {
  onBack: () => void;
  onActivate: () => void;
  onPreviewStorefront: () => void;
  legalName: string;
  cacNumber: string;
  businessName: string;
  onBrand?: () => void;
}

const COVER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC0TVy9N9Y7MA3sdb_A308JAM7hjRHlXf5V3cE9TbayMtt4tIZh_Ff9qitTfimbnUOyC5RXd_Msym7vMvlW_eXGAkycCCO1wSX1xKzI3kUU_eC_If_NvIU1vHKpnxaE8XCcFWt2gsbVnHFz2HrQCsI83NnMMmuPynB9U7A7wYuxtgNRhpOeegakGL6uL4NSGB-2sa-Y_ubbZydR6EKDRlAKAj9bNdDL5YSmv6fQEnop_8U0MzGXIQ5Zkw';

const AVATAR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDuLGOyRvT_mK5UXGajMAhbXQWAnBoj1WMXJuk-nO8Zj2QUi6zuLwI7MOQ1mnf-uWwwFRrpXe018bQxjA02nv26Pfo7-BcXeVwbKfDysIMZZkhV17ehuQyMNdiM3UazQpkxN-JSAxOCg0EsNxtN37rms0a8c-DXSVRJ_IMOQGVG5YIelSD7ePxAhKJJ0R2I9tmExeyr9KyTmpTZocE62EptGEf_2hUGCNYWGUHnPF-Bj9KDu7-xvw6KqQ';

const BREAKDOWN_ICONS = [
  { num: '1', icon: 'badge', title: 'Operator Identity', status: 'Verified', statusIcon: 'check_circle' },
  { num: '2', icon: 'domain', title: 'Business Registry', status: 'CAC Verified', statusIcon: 'verified' },
  { num: '3', icon: 'pin_drop', title: 'Business Locations', status: 'Added & Geofenced', statusIcon: 'share_location' },
  { num: '4', icon: 'storefront', title: 'Business Profile', status: 'Ready', statusIcon: 'check_circle' },
];

const CATALOG_ITEMS = [
  { name: 'Smoked Asun Ribs', price: '₦9,500' },
  { name: 'Truffle Jollof Pot', price: '₦7,200' },
  { name: 'Zobo Sangria', price: '₦3,800' },
];

export function DesktopVerificationCompleteScreen({
  onBack,
  onActivate,
  onPreviewStorefront,
  legalName,
  cacNumber,
  businessName,
  onBrand,
}: DesktopVerificationCompleteScreenProps) {
  const merchantName = businessName || 'Urban Grill & Bistro';
  const breakdown = [
    { ...BREAKDOWN_ICONS[0], body: `${legalName || 'Zainab Ahmed'} • Managing Operator` },
    { ...BREAKDOWN_ICONS[1], body: `${cacNumber || 'BN-3491820'} • Corporate Affairs Commission` },
    { ...BREAKDOWN_ICONS[2], body: 'Apo District & Wuse II • 2 Branches' },
    { ...BREAKDOWN_ICONS[3], body: 'Logo, Cover, Catalog & Deals Configured' },
  ];

  return (
    <BusinessVerificationChrome activeNav="trust" onBrand={onBrand}>
      <div className="max-w-6xl mx-auto w-full py-8 px-6 flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-xl p-space-xl md:p-space-3xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-badge-discount-text/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-xl">
            <div className="flex flex-col gap-space-md max-w-2xl">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  Account 100% Validated • Tier 3 Certified
                </span>
                <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-medium">
                  <Icon name="bolt" className="text-[14px]" />
                  Instant Geofence Discovery Active
                </span>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">You're verified!</h1>
                <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">
                  All required trust and compliance checks have been successfully completed for{' '}
                  <span className="font-semibold text-text-primary">{merchantName}</span>. Your enterprise now commands
                  maximum tier privileges across the local discovery rail.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-lg pt-space-xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="verified" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-tertiary uppercase font-medium">Network Trust Tier</span>
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Tier 3 (Institutional)</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                    <Icon name="radar" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-tertiary uppercase font-medium">Consumer Radar</span>
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Live in 2 Outlets</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative shrink-0 self-center lg:self-auto">
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-surface-tint-blue via-surface-container-high to-surface-canvas shadow-lg flex items-center justify-center">
                <div className="absolute inset-2 rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: '24s' }} />
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-surface-canvas shadow-md flex flex-col items-center justify-center text-center p-space-xs">
                  <div className="relative flex items-center justify-center">
                    <Icon name="shield" filled className="text-primary text-[52px]" />
                    <Icon name="done_all" filled className="text-badge-discount-text text-[26px] absolute" />
                  </div>
                  <span className="font-caption text-caption font-bold text-text-primary tracking-wide mt-space-2xs">
                    LEVEL 3 PASS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-7 h-7 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                    <Icon name="fact_check" className="text-[18px]" />
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Verification Breakdown Dossier</h2>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-primary font-caption text-caption font-bold">
                  4 of 4 Confirmed
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {breakdown.map((item) => (
                  <div
                    className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle"
                    key={item.num}
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <div className="w-9 h-9 rounded-full bg-surface-canvas flex items-center justify-center text-primary shrink-0">
                        <Icon name={item.icon} className="text-[20px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                          {item.num}. {item.title}
                        </span>
                        <span className="font-caption text-caption text-text-secondary truncate">{item.body}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text shrink-0">
                      <Icon name={item.statusIcon} className="text-[16px]" />
                      <span className="font-caption text-caption font-semibold">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary">
                  Live Consumer Feed Mockup
                </span>
                <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-space-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> Published Public Profile
                </span>
              </div>
              <div className="rounded-xl overflow-hidden bg-surface-subtle shadow-sm flex flex-col">
                <div className="relative h-36 w-full">
                  <img alt="Modern bistro dining room cover" className="w-full h-full object-cover" src={COVER_IMAGE} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-space-sm left-space-sm">
                    <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                      15% Off First Dine-In
                    </span>
                  </div>
                  <div className="absolute -bottom-4 left-space-md flex items-end gap-space-sm">
                    <div className="w-14 h-14 rounded-xl bg-surface-canvas shadow-md p-1 flex items-center justify-center overflow-hidden">
                      <img alt="Urban Grill and Bistro logo" className="w-full h-full object-cover rounded-lg" src={AVATAR_IMAGE} />
                    </div>
                  </div>
                </div>
                <div className="pt-6 pb-space-md px-space-md flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-2xs">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">{merchantName}</h3>
                      <Icon name="verified" filled className="text-primary-container text-[20px]" />
                    </div>
                    <div className="flex items-center gap-space-2xs text-text-primary font-label-md text-label-md font-semibold">
                      <Icon name="star" filled className="text-[16px] text-amber-500" />
                      <span>4.9</span>
                      <span className="text-text-tertiary font-caption text-caption font-normal">(142)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm text-text-secondary font-caption text-caption">
                    <span className="flex items-center gap-space-2xs">
                      <Icon name="restaurant" className="text-[14px]" /> Nigerian-Continental Fusion
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-space-2xs">
                      <Icon name="pin_drop" className="text-[14px]" /> Apo District • 0.4 km
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-space-xs mt-space-xs pt-space-xs">
                    {CATALOG_ITEMS.map((item) => (
                      <div className="flex flex-col gap-space-2xs p-space-2xs rounded-lg bg-surface-canvas shadow-sm" key={item.name}>
                        <span className="font-caption text-caption font-medium text-text-primary truncate">{item.name}</span>
                        <span className="font-caption text-caption text-primary font-bold">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0">
                  <Icon name="verified" filled className="text-[28px]" />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <h2 className="font-heading-md text-heading-md text-text-primary">Official Blue Badge Active</h2>
                  <p className="font-body-md text-body-md text-text-secondary leading-normal">
                    Your verified emblem is officially bound to your merchant identity. Consumers tapping on nearby
                    radars, deals, or digital tap-passes instantly recognize your business as vetted and legitimate.
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-surface-tint-blue to-surface-container-high p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-semibold text-primary uppercase tracking-wide">
                    Platform Engagement Lift
                  </span>
                  <span className="font-caption text-caption font-bold px-space-xs py-space-2xs rounded bg-surface-canvas text-badge-discount-text">
                    Verified vs. Unverified
                  </span>
                </div>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-display-hero text-display-hero text-primary font-bold tracking-tight">+380%</span>
                  <span className="font-body-md text-body-md text-text-secondary font-medium">
                    average customer footfall &amp; tap interactions
                  </span>
                </div>
                <div className="w-full pt-space-xs">
                  <svg className="w-full h-14" fill="none" preserveAspectRatio="none" viewBox="0 0 360 60">
                    <path d="M0 50 Q 60 48, 120 38 T 240 22 T 360 4" fill="none" stroke="#0055c4" strokeLinecap="round" strokeWidth="3" />
                    <path d="M0 50 Q 60 48, 120 38 T 240 22 T 360 4 L 360 60 L 0 60 Z" fill="url(#liftGradient)" opacity="0.3" />
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="liftGradient" x1="0" x2="0" y1="0" y2="60">
                        <stop stopColor="#066cf4" />
                        <stop offset="1" stopColor="#066cf4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex justify-between items-center text-text-tertiary font-caption text-caption mt-1">
                    <span>Before CAC &amp; ID Proof</span>
                    <span>Active Badge Deployment</span>
                    <span className="font-semibold text-primary">Peak Conversion</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <button
                className="group bg-surface-canvas hover:bg-surface-tint-blue rounded-xl p-space-md shadow-sm transition-all duration-200 flex flex-col justify-between gap-space-md text-left w-full"
                type="button"
                onClick={onPreviewStorefront}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-subtle group-hover:bg-surface-canvas text-primary flex items-center justify-center transition-colors">
                    <Icon name="smartphone" className="text-[22px]" />
                  </div>
                  <Icon
                    name="arrow_forward"
                    className="text-[18px] text-text-tertiary group-hover:text-primary transition-transform group-hover:translate-x-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading-sm text-heading-sm text-text-primary">Preview Live App</span>
                  <span className="font-caption text-caption text-text-secondary mt-1">
                    Check how Abuja diners interact with your menu &amp; deals on mobile.
                  </span>
                </div>
              </button>
              <button
                className="group bg-surface-canvas hover:bg-surface-tint-blue rounded-xl p-space-md shadow-sm transition-all duration-200 flex flex-col justify-between gap-space-md text-left w-full"
                type="button"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-subtle group-hover:bg-surface-canvas text-badge-discount-text flex items-center justify-center transition-colors">
                    <Icon name="download" className="text-[22px]" />
                  </div>
                  <Icon
                    name="arrow_forward"
                    className="text-[18px] text-text-tertiary group-hover:text-primary transition-transform group-hover:translate-x-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading-sm text-heading-sm text-text-primary">Badge Asset Kit</span>
                  <span className="font-caption text-caption text-text-secondary mt-1">
                    Download vector badges for Instagram, website footers, and table tents.
                  </span>
                </div>
              </button>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name="lock" className="text-[22px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Secure Cryptographic Storage
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Enterprise verification documents encrypted under NDPR &amp; ISO 27001 audit standards.
                  </span>
                </div>
              </div>
              <Icon name="verified_user" className="text-badge-discount-text text-[20px] shrink-0" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-40 bg-surface-canvas/95 backdrop-blur-md rounded-xl shadow-xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm text-text-secondary font-label-md text-label-md">
            <Icon name="task_alt" className="text-badge-discount-text text-[20px]" />
            <span>
              Account status: <span className="text-text-primary font-semibold">Fully Certified &amp; Operational</span>
            </span>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-initial h-12 px-space-lg rounded-xl text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary font-medium transition-all duration-150 flex items-center justify-center gap-space-2xs text-center"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Review</span>
            </button>
            <button
              className="flex-1 sm:flex-initial h-12 px-space-lg rounded-xl bg-surface-subtle hover:bg-surface-container-high text-text-primary font-button-secondary text-button-secondary font-medium transition-all duration-150 flex items-center justify-center gap-space-2xs text-center"
              type="button"
              onClick={onPreviewStorefront}
            >
              <Icon name="visibility" className="text-[18px]" />
              <span>Preview Storefront</span>
            </button>
            <button
              className="flex-1 sm:flex-initial h-12 px-space-xl rounded-xl bg-primary-container hover:bg-surface-tint text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95 flex items-center justify-center gap-space-xs text-center"
              type="button"
              onClick={onActivate}
            >
              <span>Continue to Activation / Business Dashboard</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessVerificationChrome>
  );
}
