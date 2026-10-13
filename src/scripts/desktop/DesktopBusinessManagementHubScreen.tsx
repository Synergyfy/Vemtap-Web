import { type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantPortalChrome } from './MerchantPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessManagementHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onEditProfile?: () => void;
}

interface ModuleCardProps {
  icon: string;
  iconBg: string;
  iconText: string;
  badge: ReactNode;
  title: string;
  description: string;
  metricOne: { label: string; value: string; valueClass: string };
  metricTwo: { label: string; value: string; valueClass: string };
  footerNote: string;
  actionLabel: string;
  onAction?: () => void;
}

function ModuleCard({
  icon,
  iconBg,
  iconText,
  badge,
  title,
  description,
  metricOne,
  metricTwo,
  footerNote,
  actionLabel,
  onAction,
}: ModuleCardProps) {
  return (
    <div className="group bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      <div className="p-space-lg flex flex-col gap-space-md relative z-10">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center ${iconText} group-hover:scale-105 transition-transform`}>
            <Icon name={icon} className="text-[26px]" filled />
          </div>
          {badge}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors">{title}</h3>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-space-sm pt-space-xs">
          <div className="flex flex-col bg-surface-subtle px-space-sm py-2 rounded-lg flex-1">
            <span className="font-caption text-caption text-text-tertiary">{metricOne.label}</span>
            <span className={`font-label-md text-label-md font-bold ${metricOne.valueClass}`}>{metricOne.value}</span>
          </div>
          <div className="flex flex-col bg-surface-subtle px-space-sm py-2 rounded-lg flex-1">
            <span className="font-caption text-caption text-text-tertiary">{metricTwo.label}</span>
            <span className={`font-label-md text-label-md font-bold ${metricTwo.valueClass}`}>{metricTwo.value}</span>
          </div>
        </div>
      </div>
      <div className="px-space-lg py-space-sm bg-surface-subtle flex items-center justify-between group-hover:bg-surface-tint-blue transition-colors">
        <span className="font-caption text-caption text-text-secondary font-medium">{footerNote}</span>
        <button
          type="button"
          onClick={onAction}
          className="font-button-secondary text-button-secondary text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
        >
          <span>{actionLabel}</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}

interface BenefitItem {
  title: string;
  note: string;
}

const BENEFITS: BenefitItem[] = [
  { title: 'Zero POS Latency', note: 'Real-time local socket sync' },
  { title: 'Localized Taxes & Currency', note: 'State-level compliance (FCT/LASG)' },
  { title: 'Branch Master Controls', note: 'Override item pricing per node' },
  { title: 'Federated CRM Tracking', note: 'Recognize VIP guests everywhere' },
];

interface NodeEndpoint {
  name: string;
  meta: string;
  latency: string;
  primary: boolean;
}

const NODES: NodeEndpoint[] = [
  { name: 'Wuse II', meta: 'Abuja • Active', latency: '4ms Latency', primary: false },
  { name: 'Maitama', meta: 'Abuja • Active', latency: '6ms Latency', primary: false },
  { name: 'VI Island', meta: 'Lagos • Setup', latency: 'Staging Link', primary: true },
];

const SYNC_DOMAINS = ['Catalogues', 'Live Deals', 'Loyalty Points', 'POS Roles'];

export function DesktopBusinessManagementHubScreen({ onNav, onEditProfile }: DesktopBusinessManagementHubScreenProps) {
  return (
    <MerchantPortalChrome activeNav="overview" onNav={onNav}>
      <div className="flex flex-col w-full">
        {/* Interactive & Layout Header Section */}
        <section className="w-full pt-space-xl pb-space-lg flex flex-col gap-space-md">
          <div className="flex items-center gap-space-xs text-on-surface-variant">
            <button
              type="button"
              onClick={() => onNav('overview')}
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
            >
              <Icon name="home" className="text-[16px]" />
              <span>Home</span>
            </button>
            <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
            <button
              type="button"
              onClick={() => onNav('overview')}
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Business Hub
            </button>
            <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
            <span className="font-label-sm text-label-sm text-primary font-medium">Business Management &amp; Operations</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-2xs max-w-3xl">
              <div className="flex items-center gap-space-xs">
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container font-caption text-caption text-primary font-medium tracking-wide uppercase">
                  Enterprise Merchant OS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span className="font-caption text-caption text-text-tertiary">RC 1849204</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Business Management Hub</h1>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                Unified control center for operating and scaling your business, physical locations, product catalogs, and
                team access across Nigeria.
              </p>
            </div>

            <div className="flex items-center gap-space-sm flex-shrink-0">
              <button
                type="button"
                className="px-space-md h-[46px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-xs shadow-sm"
              >
                <Icon name="tune" className="text-[18px] text-secondary" />
                <span>Global Policies</span>
              </button>
              <button
                type="button"
                className="px-space-lg h-[46px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
              >
                <Icon name="add_business" className="text-[20px]" />
                <span>New Promotion / Item</span>
              </button>
            </div>
          </div>

          {/* Top Status Bar Banner */}
          <div className="w-full bg-surface-canvas rounded-xl shadow-[0_2px_12px_rgba(13,37,76,0.04)] p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-badge-discount-text ring-4 ring-badge-discount-bg" />
                <span className="font-label-md text-label-md text-text-primary font-semibold">Verified Business</span>
              </div>
              <div className="h-4 w-px bg-surface-variant hidden sm:block" />
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-text-secondary">
                <Icon name="storefront" className="text-[18px] text-primary" />
                <span className="text-text-primary font-medium">3 Branches Active</span>
              </div>
              <div className="h-4 w-px bg-surface-variant hidden sm:block" />
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-badge-discount-text">
                <Icon name="verified_user" className="text-[18px]" />
                <span className="font-medium">NDPR Compliant</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary font-caption text-caption">
                <Icon name="sync" className="text-[16px] animate-spin text-primary" />
                <span className="font-medium">Live Sync to 3 Sites: Wuse II, Maitama, Victoria Island</span>
              </div>
              <div className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg bg-surface-subtle text-text-primary font-label-sm text-label-sm font-medium">
                <Icon name="inventory_2" className="text-[16px] text-secondary" />
                <span>Catalogue Hub (50 Live Entities)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7 Core Management Modules Bento Grid */}
        <section className="w-full py-space-md flex flex-col gap-space-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="grid_view" className="text-primary text-[20px]" />
              <h2 className="font-heading-md text-heading-md text-text-primary">Operational Modules</h2>
            </div>
            <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption">
              <Icon name="bolt" className="text-[14px]" />
              <span>Real-time POS and Consumer App Federation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
            <ModuleCard
              icon="local_offer"
              iconBg="bg-surface-tint-blue"
              iconText="text-primary"
              badge={
                <span className="px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  71% Conversion
                </span>
              }
              title="Deals & Promotions"
              description="Create, schedule, and track performance of time-limited promotions and vouchers."
              metricOne={{ label: 'Active Runs', value: '3 Active, 1 Scheduled', valueClass: 'text-text-primary' }}
              metricTwo={{ label: 'Net Redemptions', value: '+184 Today', valueClass: 'text-badge-discount-text' }}
              footerNote="Auto-synced to consumer feed"
              actionLabel="Manage Deals"
              onAction={() => onNav('deals')}
            />

            <ModuleCard
              icon="inventory"
              iconBg="bg-surface-container"
              iconText="text-primary"
              badge={
                <div className="flex items-center gap-1 font-caption text-caption text-text-tertiary bg-surface-subtle px-space-xs py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <span>Stock OK</span>
                </div>
              }
              title="Products & Services"
              description="Manage menu items, treatments, SKU variations, pricing, and live inventory."
              metricOne={{ label: 'Inventory Breakdown', value: '42 Items • 8 Services', valueClass: 'text-text-primary' }}
              metricTwo={{ label: 'Master SKUs', value: '52 Live SKUs', valueClass: 'text-primary' }}
              footerNote="Synced with Wuse II & Maitama"
              actionLabel="Open Catalogue"
              onAction={() => onNav('catalog')}
            />

            <ModuleCard
              icon="groups_2"
              iconBg="bg-secondary-fixed"
              iconText="text-on-secondary-fixed-variant"
              badge={
                <span className="px-space-xs py-1 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
                  76 VIP Tiers
                </span>
              }
              title="Customer CRM"
              description="Manage customer records, lifetime order value, visit history, and messaging."
              metricOne={{ label: 'Directory Count', value: '482 Registered', valueClass: 'text-text-primary' }}
              metricTwo={{ label: 'Average LTV', value: '₦48,500', valueClass: 'text-text-primary' }}
              footerNote="Cross-store unified profiles"
              actionLabel="View CRM"
              onAction={() => onNav('customers')}
            />

            <ModuleCard
              icon="loyalty"
              iconBg="bg-tertiary-fixed"
              iconText="text-tertiary"
              badge={
                <span className="px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Rule: Active
                </span>
              }
              title="Loyalty Programme"
              description="Configure point accrual rules, reward tiers, and counter scan vouchers."
              metricOne={{ label: 'Accrual Rate', value: '₦10 per Point', valueClass: 'text-text-primary' }}
              metricTwo={{ label: 'Configured Perks', value: '3 Active Tiers', valueClass: 'text-tertiary' }}
              footerNote="NFC & QR Counter enabled"
              actionLabel="Configure Rules"
              onAction={() => onNav('settings')}
            />

            <ModuleCard
              icon="add_location_alt"
              iconBg="bg-surface-container-high"
              iconText="text-primary"
              badge={
                <span className="px-space-xs py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Geofence Guarded
                </span>
              }
              title="Locations & Branches"
              description="Manage physical stores, geofence radius, operating hours, and branch managers."
              metricOne={{ label: 'Operational State', value: '2 Active, 1 Setup', valueClass: 'text-text-primary' }}
              metricTwo={{ label: 'Total Registered', value: '3 Branches', valueClass: 'text-text-primary' }}
              footerNote="Abuja (2) & Lagos (1)"
              actionLabel="Manage Branches"
              onAction={() => onNav('locations')}
            />

            <ModuleCard
              icon="badge"
              iconBg="bg-surface-subtle"
              iconText="text-text-primary"
              badge={
                <span className="px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  100% Shift Coverage
                </span>
              }
              title="Staff & Team Access"
              description="Invite team members, assign role-based permissions, and manage POS cashiers."
              metricOne={{ label: 'Team Strength', value: '6 Staff Members', valueClass: 'text-text-primary' }}
              metricTwo={{ label: 'Role Matrix', value: '3 Custom Roles', valueClass: 'text-text-primary' }}
              footerNote="PIN & Biometric enabled"
              actionLabel="Manage Staff"
              onAction={() => onNav('settings')}
            />

            {/* Module 7: Business Profile & Branding (Full width span) */}
            <div className="group bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative md:col-span-2 xl:col-span-3">
              <div className="p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative z-10">
                <div className="flex items-start gap-space-md max-w-2xl">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-on-primary flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                    <Icon name="domain" className="text-[30px]" filled />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors">
                        Business Profile &amp; Branding
                      </h3>
                      <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1">
                        <Icon name="verified" className="text-[14px]" />
                        Verified Tier 3 Enterprise
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                      Manage public storefront, cover banner, verified CAC registration, and customer amenities.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-space-md">
                  <div className="flex items-center gap-space-sm bg-surface-subtle p-space-sm rounded-xl">
                    <div className="flex items-center gap-1 text-tertiary">
                      <Icon name="star" className="text-[22px]" filled />
                      <span className="font-heading-sm text-heading-sm text-text-primary">4.9</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-caption text-caption text-text-tertiary">Consumer Rating</span>
                      <span className="font-label-sm text-label-sm text-text-primary font-medium">128 Verified Reviews</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="px-space-lg h-[46px] rounded-xl bg-surface-tint-blue text-primary hover:bg-primary hover:text-on-primary font-button-primary text-button-primary transition-all flex items-center gap-space-xs"
                  >
                    <span>Edit Profile</span>
                    <Icon name="arrow_forward" className="text-[18px]" />
                  </button>
                </div>
              </div>
              <div className="px-space-lg py-space-sm bg-surface-subtle flex flex-col sm:flex-row items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-md font-caption text-caption text-text-secondary flex-wrap">
                  <span>
                    Primary Identity: <strong>VEMTAP Flagship Eatery &amp; Lounge</strong>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    Public Tag: <strong>@vemtap_wuse</strong>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    Amenities Configured: <strong>High-speed WiFi, Valet, POS Tap-to-Pay</strong>
                  </span>
                </div>
                <span className="font-caption text-caption text-primary font-medium">Last audited: Today, 09:14 AM</span>
              </div>
            </div>
          </div>
        </section>

        {/* Centralized Multi-Location Architecture Callout & Infographic */}
        <section className="w-full py-space-lg mb-space-xl">
          <div className="w-full bg-surface-canvas rounded-2xl shadow-[0_8px_24px_-4px_rgba(13,37,76,0.06)] overflow-hidden flex flex-col lg:flex-row items-stretch">
            {/* Left Narrative Panel */}
            <div className="p-space-xl lg:w-1/2 flex flex-col justify-between gap-space-lg">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="p-1.5 rounded-lg bg-surface-tint-blue text-primary">
                    <Icon name="hub" className="text-[20px]" />
                  </span>
                  <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                    High-Volume Infrastructure
                  </span>
                </div>
                <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                  Centralized Multi-Location Architecture
                </h2>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  Locations act as the single source of truth across the entire VEMTAP network. Any changes made to menus,
                  vouchers, deals, loyalty rules, or staff access pass through our instantaneous federation engine,
                  updating real-time POS terminals and customer discovery applications across Lagos &amp; Abuja without
                  manual reconciliation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
                  {BENEFITS.map((benefit) => (
                    <div key={benefit.title} className="flex items-start gap-space-xs">
                      <Icon name="check_circle" className="text-badge-discount-text text-[20px] flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-text-primary font-semibold">{benefit.title}</span>
                        <span className="font-caption text-caption text-text-tertiary">{benefit.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-space-md pt-space-md flex-wrap">
                <button
                  type="button"
                  className="px-space-lg h-[50px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
                >
                  <Icon name="account_tree" className="text-[20px]" />
                  <span>Explore Architecture Sync</span>
                </button>
                <button
                  type="button"
                  className="font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                >
                  <span>Read Architecture SLA</span>
                  <Icon name="open_in_new" className="text-[16px]" />
                </button>
              </div>
            </div>

            {/* Right Interactive Topology Panel */}
            <div className="lg:w-1/2 bg-surface-subtle p-space-lg sm:p-space-xl flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
              <div className="w-full max-w-lg bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-md relative z-10">
                <div className="flex items-center justify-between pb-space-xs border-b border-surface-variant">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-3 h-3 rounded-full bg-badge-discount-text animate-pulse" />
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Central Master Record</span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-mono">
                    NODE_CLUSTER_NG
                  </span>
                </div>

                <div className="w-full p-space-sm rounded-xl bg-surface-tint-blue flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                      <Icon name="cloud" className="text-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-bold">VEMTAP Master Cloud Vault</span>
                      <span className="font-caption text-caption text-primary">Single Source of Truth (Abuja Central)</span>
                    </div>
                  </div>
                  <Icon name="verified" className="text-primary text-[20px]" />
                </div>

                <div className="flex items-center justify-center my-0 text-primary">
                  <svg className="w-full h-8 text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 380 32">
                    <path
                      className="opacity-40"
                      d="M 190 0 L 190 32 M 190 16 L 60 16 L 60 32 M 190 16 L 320 16 L 320 32"
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      strokeWidth="2"
                    />
                    <circle cx="190" cy="16" fill="currentColor" r="3" />
                    <circle cx="60" cy="32" fill="currentColor" r="3" />
                    <circle cx="190" cy="32" fill="currentColor" r="3" />
                    <circle cx="320" cy="32" fill="currentColor" r="3" />
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-space-xs text-center">
                  {NODES.map((node) => (
                    <div
                      key={node.name}
                      className="p-space-xs rounded-lg bg-surface-subtle flex flex-col items-center gap-1 hover:bg-surface-tint-blue transition-colors"
                    >
                      <Icon name="store" className={`text-[18px] ${node.primary ? 'text-primary' : 'text-badge-discount-text'}`} />
                      <span className="font-label-sm text-label-sm text-text-primary font-bold leading-tight">{node.name}</span>
                      <span className="font-caption text-caption text-text-tertiary">{node.meta}</span>
                      <span
                        className={`text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded-full ${
                          node.primary ? 'text-primary bg-surface-tint-blue' : 'text-badge-discount-text bg-badge-discount-bg'
                        }`}
                      >
                        {node.latency}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-space-xs flex flex-wrap items-center justify-between gap-1 font-caption text-caption text-text-secondary bg-surface-container-low p-space-xs rounded-lg">
                  {SYNC_DOMAINS.map((domain) => (
                    <span key={domain} className="flex items-center gap-1">
                      <Icon name="check" className="text-[14px] text-primary" />
                      <span>{domain}</span>
                    </span>
                  ))}
                </div>

                <p className="font-caption text-caption text-text-tertiary mt-space-sm text-center">
                  Encrypted with 256-Bit Mutual TLS • Local Cache fallback active for offline resilience
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MerchantPortalChrome>
  );
}
