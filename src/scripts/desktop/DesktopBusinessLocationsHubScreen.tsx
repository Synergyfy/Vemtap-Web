import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessLocationsHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onAddBranch?: () => void;
  onOpenBranch?: () => void;
}

interface BranchCardData {
  id: string;
  index: string;
  indexClass: string;
  tag1: string;
  tag1Class: string;
  tag2: string;
  tag2Class: string;
  openLabel: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  geofence: string;
  metrics: Array<{ label: string; value: string; valueClass: string }>;
  registerLabel: string;
  mapImage: string;
  mapLocation: string;
  mapBadge: string;
  mapCaption: string;
  beaconSize: string;
}

const LIVE_BRANCHES: BranchCardData[] = [
  {
    id: 'wuse',
    index: 'BRANCH #01',
    indexClass: 'text-primary',
    tag1: 'Flagship Outlet',
    tag1Class: 'bg-primary-fixed text-on-primary-fixed',
    tag2: 'Primary Node',
    tag2Class: 'bg-surface-tint-blue text-primary',
    openLabel: 'Open Now • Closes 9:00 PM WAT',
    name: 'Wuse Branch',
    address: 'Plot 12 Adetokunbo Ademola Crescent, Wuse II, Abuja, FCT',
    manager: 'John Peter',
    phone: '+234 803 219 8831',
    geofence: '300m Geofence Active',
    metrics: [
      { label: 'Products', value: '42 Items', valueClass: 'text-on-surface' },
      { label: 'Services', value: '8 Available', valueClass: 'text-on-surface' },
      { label: 'Active Deals', value: '3 Flash Deals', valueClass: 'text-badge-discount-text' },
      { label: 'POS Hardware', value: '4 Terminals', valueClass: 'text-primary' },
    ],
    registerLabel: 'View Branch Register & Terminals',
    mapImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPCdVWPhgVT0KKvEBzw0zIiwNjLmEqcOkVf4N-MKxIw0X8XvFyCRQww3t0V2lWdAZeTGs-baMC1D86AlRBdQdTp35V6bfIJYtTaBla1rsg2TulHoYpdgRs4r-AOhDQEHR9KJb0DWVAJl-31yoH6df0-BH5NP5kycx2MhW2XQqb3-0c4RHf_dt_AndUby5Rz3Dbc_06fIXYqafo-8UAYGQnJlptNlFFliyK5PGDxnPEMr4ljQyBZceopQ',
    mapLocation: 'Adetokunbo Ademola Crescent, Wuse II, Abuja',
    mapBadge: 'Wuse II Commercial Radius',
    mapCaption: 'Customers within 300m receive instant lockscreen deal notifications.',
    beaconSize: 'w-24 h-24',
  },
  {
    id: 'vi',
    index: 'BRANCH #02',
    indexClass: 'text-secondary',
    tag1: 'Coastal Cluster',
    tag1Class: 'bg-secondary-fixed text-on-secondary-fixed',
    tag2: 'Lagos Node',
    tag2Class: 'bg-surface-container text-text-secondary',
    openLabel: 'Open Now • Closes 10:30 PM WAT',
    name: 'Victoria Island Branch',
    address: '8B Adeola Odeku Street, Victoria Island, Lagos Island, Lagos',
    manager: 'Folake Adebayo',
    phone: '+234 812 443 0912',
    geofence: '500m Coastal Beacon Active',
    metrics: [
      { label: 'Products', value: '36 Items', valueClass: 'text-on-surface' },
      { label: 'Services', value: '6 Available', valueClass: 'text-on-surface' },
      { label: 'Active Deals', value: '2 Happy Hours', valueClass: 'text-badge-discount-text' },
      { label: 'POS Hardware', value: '3 Synced', valueClass: 'text-primary' },
    ],
    registerLabel: 'View Branch Register',
    mapImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCFkA00W2W_pFwH0_WDPGniUHZsXYPYAiIuPd18fouM6Hxrtei1BRwf7Fa1wJxaiJ8yY6VUb26A4XIGLoF40sCY5mIp5dM06hRnMtsj6NzfkR4l8PrlmwnpJWECyXMydAdvYlfEwtadlhJa8rB4SOYAnRrEjidk2VNrvqqUpuwXcqTSnDfQ2sj_U27UW3W0aXhVUAmBsUuGXIgtSK9Jqk8hBpFGqbGiruHmg1_ylxnT7qC-HK1tVyuEPg',
    mapLocation: 'Adeola Odeku Street, Victoria Island, Lagos',
    mapBadge: 'VI Adeola Odeku Strip',
    mapCaption: 'Expanded 500m geofence covering high foot-traffic financial boulevard.',
    beaconSize: 'w-28 h-28',
  },
];

export function DesktopBusinessLocationsHubScreen({
  onNav,
  onAddBranch,
  onOpenBranch,
}: DesktopBusinessLocationsHubScreenProps) {
  return (
    <MerchantShell activeNav="business-locations" onNav={onNav}>
      <div className="flex flex-col gap-space-2xs mb-space-lg">
        <div className="flex items-center gap-space-2xs text-text-secondary font-label-sm text-label-sm">
          <button
            type="button"
            onClick={() => onNav('overview')}
            className="hover:text-primary cursor-pointer transition-colors"
          >
            Business Hub
          </button>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-primary font-semibold">Locations & Branches</span>
        </div>
        {/* Header — stacks until `xl` so it fits iPad Pro 13 */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mt-space-2xs">
          <div className="min-w-0">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Locations &amp; Branch Network Management
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs max-w-3xl">
              Manage physical store outlets, localized operating hours, local inventory pools, and geofence beacon
              visibility across Nigeria.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              className="flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm"
            >
              <Icon name="file_download" className="text-[18px] text-text-secondary" />
              <span>Export Directory (CSV)</span>
            </button>
            <button
              type="button"
              onClick={onAddBranch}
              className="flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-md text-label-md transition-all shadow-md hover:shadow-lg"
            >
              <Icon name="add_location_alt" className="text-[18px]" />
              <span>+ Add New Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace focus bar */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm mb-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed">
            <Icon name="storefront" className="text-[26px]" />
          </div>
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-caption text-caption text-badge-discount-text font-semibold uppercase tracking-wider bg-badge-discount-bg px-space-2xs py-0.5 rounded">
                Active Workspace Focus
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-caption text-caption text-text-secondary">Abuja Capital Metro</span>
            </div>
            <p className="font-heading-sm text-heading-sm text-on-surface mt-0.5">
              Wuse Branch #01 — Flagship (Abuja, FCT)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            className="flex items-center gap-space-sm px-space-md py-space-xs rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
          >
            <Icon name="swap_horiz" className="text-[18px] text-primary" />
            <span>Switch Operating View</span>
            <Icon name="expand_more" className="text-[18px] text-text-secondary" />
          </button>
          <button
            type="button"
            title="Branch Network Map Configuration"
            className="p-space-xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-on-surface transition-colors"
          >
            <Icon name="tune" className="text-[20px]" />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-2xl">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Active Locations</span>
            <span className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
              <Icon name="domain" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-heading-lg text-heading-lg text-on-surface font-bold">2 Live</span>
              <span className="font-caption text-caption text-text-tertiary">/ 3 total</span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error inline-block" />
              1 Outlet Paused / Under Renovation
            </p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '66.6%' }} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Regional Clusters</span>
            <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <Icon name="hub" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-heading-lg text-heading-lg text-on-surface font-bold">2 Zones</span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">Abuja FCT (2) • Lagos Island (1)</p>
          </div>
          <div className="flex items-center gap-1 mt-space-md">
            <span className="px-space-xs py-0.5 rounded text-[11px] font-medium bg-surface-container text-secondary">
              FCT Zone A
            </span>
            <span className="px-space-xs py-0.5 rounded text-[11px] font-medium bg-surface-container text-secondary">
              Lagos SW
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Total Network SKUs</span>
            <span className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <Icon name="inventory_2" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-heading-lg text-heading-lg text-on-surface font-bold">70 SKUs</span>
              <span className="font-caption text-caption text-badge-discount-text font-medium">Synced</span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">Decentralized Stock Distribution</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-tertiary mt-space-md">
            <span>42 Wuse</span>
            <span>36 VI</span>
            <span>0 Garki</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Footfall Velocity</span>
            <span className="w-8 h-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
              <Icon name="trending_up" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-heading-lg text-heading-lg text-on-surface font-bold">8,420</span>
              <span className="font-caption text-caption text-badge-discount-text font-semibold">+14% MoM</span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">
              Monthly consumer walk-ins verified
            </p>
          </div>
          <div className="w-full mt-space-md">
            <svg className="w-full h-4 text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path
                d="M0 16 Q 25 18, 40 10 T 70 8 T 100 2"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-space-md">
        <div className="flex items-center gap-space-sm">
          <h2 className="font-heading-sm text-heading-sm text-on-surface">Store Locations & Geofences</h2>
          <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-text-secondary font-label-sm text-label-sm">
            3 Registered
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1"
          >
            <Icon name="grid_view" className="text-[16px]" />
            <span>Detailed View</span>
          </button>
          <button
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-transparent text-text-secondary hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1 transition-colors"
          >
            <Icon name="map" className="text-[16px]" />
            <span>Unified Map</span>
          </button>
        </div>
      </div>

      {/* Branch cards */}
      <div className="flex flex-col gap-space-lg mb-space-2xl">
        {LIVE_BRANCHES.map((branch) => (
          <div
            key={branch.id}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex flex-col xl:flex-row items-start justify-between gap-space-lg">
              <div className="flex-1 w-full min-w-0">
                <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
                  <span className={`font-label-sm text-label-sm font-bold tracking-wide ${branch.indexClass}`}>
                    {branch.index}
                  </span>
                  <span className="text-text-tertiary">•</span>
                  <span
                    className={`px-space-xs py-0.5 rounded font-caption text-caption font-semibold ${branch.tag1Class}`}
                  >
                    {branch.tag1}
                  </span>
                  <span
                    className={`px-space-xs py-0.5 rounded font-caption text-caption font-semibold ${branch.tag2Class}`}
                  >
                    {branch.tag2}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                    {branch.openLabel}
                  </span>
                </div>
                <h3 className="font-heading-md text-heading-md text-on-surface font-bold">{branch.name}</h3>
                <div className="flex items-center gap-space-2xs text-text-secondary font-body-md text-body-md mt-space-2xs">
                  <Icon name="location_on" className="text-[18px] text-text-tertiary" />
                  <span className="truncate">{branch.address}</span>
                </div>
                <div className="flex flex-wrap items-center gap-space-md mt-space-sm py-space-xs px-space-sm bg-surface-container-low rounded-lg text-text-secondary font-label-sm text-label-sm">
                  <div className="flex items-center gap-1.5">
                    <Icon name="person" className="text-[16px] text-primary" />
                    <span>
                      Manager: <strong className="text-on-surface">{branch.manager}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="call" className="text-[16px] text-text-tertiary" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto text-primary font-medium">
                    <Icon name="radar" className="text-[16px]" />
                    <span>{branch.geofence}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mt-space-md pt-space-md bg-surface-subtle p-space-sm rounded-xl">
                  {branch.metrics.map((metric) => (
                    <div key={metric.label}>
                      <p className="font-caption text-caption text-text-secondary">{metric.label}</p>
                      <p
                        className={`font-heading-sm text-heading-sm font-bold mt-0.5 ${metric.valueClass}`}
                      >
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-space-xs mt-space-lg">
                  <button
                    type="button"
                    onClick={onOpenBranch}
                    className="px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="edit_note" className="text-[18px]" />
                    <span>Edit Branch Details</span>
                  </button>
                  <button
                    type="button"
                    className="px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="point_of_sale" className="text-[18px]" />
                    <span>{branch.registerLabel}</span>
                  </button>
                  <button
                    type="button"
                    className="px-space-md py-space-xs rounded-xl bg-surface-tint-blue hover:bg-primary-fixed text-primary font-label-md text-label-md transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="settings_input_antenna" className="text-[18px]" />
                    <span>Manage Geofence</span>
                  </button>
                </div>
              </div>
              <div className="w-full xl:w-80 shrink-0 flex flex-col gap-space-xs">
                <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-inner group">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    data-location={branch.mapLocation}
                    style={{ backgroundImage: `url('${branch.mapImage}')` }}
                  />
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none flex items-center justify-center">
                    <div
                      className={`${branch.beaconSize} rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/40 animate-pulse`}
                    >
                      <span className="w-3 h-3 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-surface-canvas/90 backdrop-blur-md px-space-xs py-1 rounded text-on-surface font-caption text-caption font-semibold flex items-center gap-1">
                    <Icon name="gps_fixed" className="text-primary text-[14px]" />
                    <span>{branch.mapBadge}</span>
                  </div>
                </div>
                <p className="font-caption text-caption text-text-tertiary text-center">{branch.mapCaption}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Garki — paused branch */}
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden opacity-90">
          <div className="flex flex-col xl:flex-row items-start justify-between gap-space-lg">
            <div className="flex-1 w-full min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
                <span className="font-label-sm text-label-sm font-bold text-text-tertiary tracking-wide">BRANCH #03</span>
                <span className="text-text-tertiary">•</span>
                <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-caption text-caption font-semibold">
                  Under Renovation
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-text-secondary font-caption text-caption font-semibold">
                  Garki Cluster
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption font-medium">
                  <span className="w-2 h-2 rounded-full bg-text-tertiary" />
                  Paused From Discovery Feeds
                </span>
              </div>
              <h3 className="font-heading-md text-heading-md text-on-surface font-bold">Garki Branch</h3>
              <div className="flex items-center gap-space-2xs text-text-secondary font-body-md text-body-md mt-space-2xs">
                <Icon name="location_on" className="text-[18px] text-text-tertiary" />
                <span className="truncate">Shop 14 Area 11 Shopping Arcade, Garki II, Abuja</span>
              </div>
              <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-text-secondary shrink-0">
                    <Icon name="construction" className="text-[20px]" />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">
                      Scheduled Facility Refurbishment & Fiber Link Setup
                    </p>
                    <p className="font-caption text-caption text-text-secondary">
                      Expected consumer reopening: <strong className="text-on-surface">Q2 2025</strong>. Inventory and
                      beacons are held offline.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <button
                    type="button"
                    className="px-space-md py-space-xs rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm"
                  >
                    Reactivate Location
                  </button>
                  <button
                    type="button"
                    className="px-space-md py-space-xs rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
                  >
                    View Setup Tasks
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full xl:w-80 shrink-0 flex flex-col gap-space-xs">
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface-container-high flex flex-col items-center justify-center p-space-md text-center">
                <Icon name="domain_disabled" className="text-[32px] text-text-tertiary mb-1" />
                <p className="font-label-sm text-label-sm font-semibold text-text-secondary">
                  Area 11 Arcade Geofence Paused
                </p>
                <p className="font-caption text-caption text-text-tertiary mt-0.5">
                  Zero customer broadcast traffic active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture card */}
      <div className="rounded-xl bg-surface-container-low p-space-lg shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-md max-w-4xl">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
              <Icon name="sync_alt" className="text-[24px]" />
            </div>
            <div>
              <h4 className="font-heading-sm text-heading-sm text-on-surface">
                Centralized Multi-Branch Operating Architecture
              </h4>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                VEMTAP synchronizes real-time terminal transactions, customer walk-in redemptions, and localized stock
                reservations across all nationwide branches. Product alterations made in catalog automatically trigger
                localized safety stock levels per outlet.
              </p>
              <div className="flex flex-wrap items-center gap-space-md mt-space-sm text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-1">
                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                  Sub-second POS Heartbeat
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                  Decentralized Tax Invoicing (FIRS & LIRS)
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                  Isolated Cashier Drawer Permissions
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-space-xs shrink-0">
            <button
              type="button"
              className="w-full sm:w-auto px-space-md py-space-xs rounded-xl bg-surface-canvas hover:bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm transition-colors text-center"
            >
              Network Logs
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-space-md py-space-xs rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-sm transition-colors text-center"
            >
              Global Sync Settings
            </button>
          </div>
        </div>
      </div>
    </MerchantShell>
  );
}
