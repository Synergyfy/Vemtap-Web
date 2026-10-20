import { useState } from 'react';
import { FilterMenu } from '../../components/FilterMenu';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { AnalyticsShell } from './AnalyticsShell';
import { downloadCsv } from '../../utils/exportCsv';

interface DesktopAnalyticsLocationsScreenProps {
  onNav?: (key: BusinessPortalNavKey) => void;
}

const PILL_TABS = ['Business', 'Customers', 'Deals', 'Locations (Active)', 'POS Registers', 'Staff Shifts'];

const SHARE_LEGEND: Array<{ dot: string; name: string; amount: string; share: string }> = [
  { dot: 'bg-primary', name: 'Wuse II', amount: '₦2,620,000', share: '54.0% share' },
  { dot: 'bg-primary-container', name: 'Maitama', amount: '₦1,710,000', share: '35.2% share' },
  { dot: 'bg-secondary-container', name: 'Garki Area 11', amount: '₦520,000', share: '10.8% share' },
];

export function DesktopAnalyticsLocationsScreen({ onNav }: DesktopAnalyticsLocationsScreenProps) {
  // Branch keys line up with the three scorecards in the Performance Matrix.
  const [branchFilter, setBranchFilter] = useState('');

  const branchChoices = [
    { value: '', label: 'All branches' },
    { value: 'wuse', label: 'Wuse II Flagship' },
    { value: 'maitama', label: 'Maitama Heights' },
    { value: 'garki', label: 'Garki Area 11' },
  ];

  const showBranch = (key: string) => branchFilter === '' || branchFilter === key;

  return (
    <AnalyticsShell activeNav="analytics" onNav={onNav}>
      {/* Sub-header Breadcrumb & Action Toolbar */}
      <section className="w-full pt-space-md pb-space-lg">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-md">
          {/* Breadcrumb & Title Cluster */}
          <div className="flex flex-col gap-space-2xs min-w-0">
            <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption uppercase tracking-wider">
              <span className="hover:text-primary cursor-pointer transition-colors">Business Hub</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="hover:text-primary cursor-pointer transition-colors">Analytics &amp; Intelligence</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-primary font-semibold">Branch Network Pulse</span>
            </div>
            <div className="flex items-baseline gap-space-sm flex-wrap">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Locations &amp; Branch Comparison Analytics
              </h1>
              <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                Live Territory Sync
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary max-w-3xl">
              Multi-outlet gross sales, footfall saturation, ticket sizes, and regional margin opportunities across
              Abuja &amp; Lagos.
            </p>
          </div>

          {/* Context Controls / Primary CTAs */}
          <div className="flex items-center flex-wrap gap-space-xs self-start xl:self-center">
            {/* Date Selector Pill */}
            <div className="flex items-center gap-space-2xs px-space-sm py-2 rounded-xl bg-surface-container-lowest shadow-sm text-on-surface cursor-pointer hover:bg-surface-container-low transition-colors">
              <Icon name="calendar_today" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm font-semibold">Last 30 Days</span>
              <Icon name="expand_more" className="text-text-tertiary text-[16px]" />
            </div>
            {/* Branch Comparison Matrix Modal Button */}
            {/* Filters the Performance Matrix scorecards below by branch. */}
            <FilterMenu
              align="right"
              buttonClassName="flex items-center gap-space-2xs px-space-sm py-2 rounded-xl bg-surface-container-lowest shadow-sm text-on-surface font-button-secondary text-button-secondary hover:bg-surface-tint-blue hover:text-primary transition-all"
              choices={branchChoices}
              icon="view_column"
              iconClassName="text-[18px]"
              label="Matrix Filter"
              onChange={setBranchFilter}
              title="Show scorecard for"
              value={branchFilter}
            />
            {/* Manage Branch Pricing CTA */}
            <button
              className="flex items-center gap-space-2xs px-space-sm py-2 rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary hover:bg-primary-fixed transition-colors"
              type="button"
            >
              <Icon name="tune" className="text-[18px]" />
              <span>Manage Pricing Matrix</span>
            </button>
            {/* Export Report CTA (Primary Brand) */}
            <button
              className="flex items-center gap-space-2xs px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.3)] hover:bg-surface-tint transition-all active:scale-[0.98]"
              type="button"
              onClick={() => {
                downloadCsv(
                  'vemtap_location_analytics',
                  ['Branch', 'Revenue', 'Share'],
                  SHARE_LEGEND.map((branch) => [branch.name, branch.amount, branch.share]),
                );
              }}
            >
              <Icon name="download" className="text-[18px]" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Analytics Domain Pill Tabs */}
        <div className="flex items-center gap-space-2xs overflow-x-auto pb-space-2xs scrollbar-none">
          {PILL_TABS.map((tab) =>
            tab === 'Locations (Active)' ? (
              <button
                key={tab}
                type="button"
                className="px-space-md py-2 rounded-full font-button-secondary text-button-secondary bg-surface-tint-blue text-primary shadow-sm flex items-center gap-space-2xs"
              >
                <Icon name="location_on" className="text-[16px]" />
                <span>{tab}</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              </button>
            ) : (
              <button
                key={tab}
                type="button"
                className="px-space-md py-2 rounded-full font-label-md text-label-md text-text-secondary hover:bg-surface-container-low transition-colors"
              >
                {tab}
              </button>
            )
          )}
        </div>
      </section>

      {/* Main Grid Analytics Dashboard (nested main in mockup converted to div) */}
      <div className="w-full pb-space-3xl flex flex-col gap-space-xl">
        {/* Top Row: Highlight Cards + Live Network Pulse Metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Top Revenue Driver Hero Card */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-surface-tint-blue/70 pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex flex-col gap-space-xs z-10">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary">
                  Top Revenue Driver
                </span>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                  54% of Gross
                </span>
              </div>
              <h2 className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight">Wuse II Flagship</h2>
              <div className="flex items-baseline gap-space-xs mt-space-2xs">
                <span className="font-display-hero text-display-hero font-bold text-primary tracking-tight">₦2,620,000</span>
                <span className="font-label-sm text-label-sm text-badge-discount-text flex items-center font-semibold">
                  <Icon name="trending_up" className="text-[16px]" /> +14.2%
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                Anchor store dominating central Abuja trade territory. Consistent daytime velocity and high-volume
                weekend dining.
              </p>
            </div>
            <div className="pt-space-md mt-space-md z-10 flex items-center justify-between bg-surface-subtle/80 rounded-xl p-space-sm">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Total Volume</span>
                <span className="font-label-md text-label-md font-bold text-on-surface">780 Orders</span>
              </div>
              <div className="h-6 w-px bg-surface-container" />
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Table Turnover</span>
                <span className="font-label-md text-label-md font-bold text-on-surface">4.8x / day</span>
              </div>
              <div className="h-6 w-px bg-surface-container" />
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">AOV</span>
                <span className="font-label-md text-label-md font-bold text-primary">₦3,358</span>
              </div>
            </div>
          </div>

          {/* Combined Footfall & Tap Conversion Card */}
          <div className="lg:col-span-3 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary">
                  Network Footfall
                </span>
                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <Icon name="contactless" className="text-[18px]" />
                </div>
              </div>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-hero text-display-hero font-bold text-on-surface tracking-tight">3,420</span>
                <span className="font-caption text-caption text-badge-discount-text font-bold">+8.3%</span>
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Validated NFC/QR check-ins across 3 active branch terminals in Abuja Urban Core.
              </p>
            </div>

            {/* Micro Sparkline SVG Visualization */}
            <div className="w-full pt-space-md">
              <div className="flex items-center justify-between font-caption text-caption text-text-tertiary mb-1">
                <span>Weekday Baseline</span>
                <span className="text-on-surface font-semibold">114 taps/day avg</span>
              </div>
              <svg className="w-full h-12 text-primary" fill="none" viewBox="0 0 280 48">
                <defs>
                  <linearGradient id="footfallGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#066CF4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#066CF4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,38 C30,36 50,22 80,26 C110,30 130,12 160,18 C190,24 220,6 250,10 C265,12 275,4 280,4 L280,48 L0,48 Z"
                  fill="url(#footfallGrad)"
                />
                <path
                  d="M0,38 C30,36 50,22 80,26 C110,30 130,12 160,18 C190,24 220,6 250,10 C265,12 275,4 280,4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          {/* Comparative Metrics Bar / Revenue Distribution Stack */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-tertiary">
                  Network Gross Share
                </span>
                <span className="font-heading-sm text-heading-sm font-bold text-on-surface">₦4,850,000 Combined</span>
              </div>
              <span className="font-caption text-caption text-text-secondary bg-surface-container-low px-space-xs py-1 rounded-full">
                3 active hubs
              </span>
            </div>

            {/* Multi-segment Horizontal Proportion Bar */}
            <div className="w-full flex flex-col gap-space-xs my-space-sm">
              <div className="w-full h-4 rounded-full bg-surface-container overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-primary transition-all duration-500 hover:opacity-90"
                  style={{ width: '54%' }}
                  title="Wuse II: 54%"
                />
                <div
                  className="h-full bg-primary-container transition-all duration-500 hover:opacity-90"
                  style={{ width: '35.2%' }}
                  title="Maitama: 35.2%"
                />
                <div
                  className="h-full bg-secondary-container transition-all duration-500 hover:opacity-90"
                  style={{ width: '10.8%' }}
                  title="Garki Area 11: 10.8%"
                />
              </div>
              <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
                <span>₦0</span>
                <span className="font-medium text-on-surface">Network Benchmark Target: ₦6,000,000</span>
                <span>80.8% of Target</span>
              </div>
            </div>

            {/* Branch Legend Breakdowns */}
            <div className="grid grid-cols-3 gap-space-2xs pt-space-xs">
              {SHARE_LEGEND.map((branch) => (
                <div key={branch.name} className="flex flex-col p-space-xs rounded-xl bg-surface-container-low/60">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${branch.dot}`} />
                    <span className="font-label-sm text-label-sm font-semibold truncate text-on-surface">{branch.name}</span>
                  </div>
                  <span className="font-label-md text-label-md font-bold text-on-surface mt-1">{branch.amount}</span>
                  <span className="font-caption text-caption text-text-tertiary">{branch.share}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid Section: Detailed Branch Scorecards (Asymmetric 3-Card Array) */}
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading-md text-heading-md font-bold text-on-surface tracking-tight">
                Performance Matrix by Location
              </h2>
              <p className="font-body-md text-body-md text-text-secondary">
                Direct correlation between customer travel radius, ticket values, and operational seating density.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-space-xs font-caption text-caption text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" /> Fully Operational
              </span>
              <span className="flex items-center gap-1 ml-space-sm">
                <span className="w-2 h-2 rounded-full bg-tertiary" /> Partial Capacity
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
            {/* Scorecard 1: Wuse II Flagship */}
            {showBranch('wuse') && (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                {/* Card Head with Banner Tag */}
                <div className="p-space-lg pb-space-md bg-gradient-to-b from-surface-tint-blue/50 to-transparent">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-2xs">
                        <span className="px-space-xs py-0.5 rounded bg-primary text-on-primary font-caption text-caption font-bold uppercase tracking-wider">
                          Top Grossing
                        </span>
                        <span className="font-caption text-caption text-text-tertiary">Hub #01</span>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface mt-space-2xs">
                        Wuse II Flagship
                      </h3>
                      <span className="font-caption text-caption text-text-secondary">Adetokunbo Ademola Crescent, Abuja</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon name="storefront" className="text-[24px]" />
                    </div>
                  </div>
                  {/* Main Gross Metric Box */}
                  <div className="mt-space-md bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                    <span className="font-caption text-caption text-text-tertiary">Monthly Gross Revenue</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-heading-lg text-heading-lg font-bold text-on-surface">₦2,620,000</span>
                      <span className="font-label-sm text-label-sm font-semibold text-primary">780 tickets</span>
                    </div>
                  </div>
                </div>

                {/* Granular Breakdown Rows */}
                <div className="px-space-lg py-space-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="receipt_long" className="text-text-tertiary text-[18px]" />
                      <span>Average Order Value</span>
                    </div>
                    <span className="font-label-md text-label-md font-bold text-on-surface">₦3,358</span>
                  </div>
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="table_bar" className="text-text-tertiary text-[18px]" />
                      <span>Peak Seating Occupancy</span>
                    </div>
                    <div className="flex items-center gap-space-2xs">
                      <div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
                        <div className="h-full bg-badge-discount-text" style={{ width: '89%' }} />
                      </div>
                      <span className="font-label-md text-label-md font-bold text-on-surface">89%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="radar" className="text-text-tertiary text-[18px]" />
                      <span>Catchment Draw Radius</span>
                    </div>
                    <span className="font-label-md text-label-md font-semibold text-primary">4.2 km (Dense Urban)</span>
                  </div>
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="schedule" className="text-text-tertiary text-[18px]" />
                      <span>Peak Ordering Window</span>
                    </div>
                    <span className="font-label-md text-label-md font-medium text-on-surface">1:30 PM – 4:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-space-lg pt-space-xs">
                <button
                  className="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-tint-blue hover:text-primary font-button-secondary text-button-secondary text-on-surface transition-colors flex items-center justify-center gap-1"
                  type="button"
                >
                  <span>View Wuse Terminal Stream</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>
            </div>
            )}

            {/* Scorecard 2: Maitama Heights */}
            {showBranch('maitama') && (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow relative">
              {/* Spotlight Accent Border-free highlight */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary to-primary-container" />
              <div>
                {/* Card Head */}
                <div className="p-space-lg pb-space-md bg-gradient-to-b from-surface-tint-blue/40 to-transparent">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-2xs">
                        <span className="px-space-xs py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-bold uppercase tracking-wider">
                          Growing Fast
                        </span>
                        <span className="font-caption text-caption text-text-tertiary">Hub #02</span>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface mt-space-2xs">
                        Maitama Heights
                      </h3>
                      <span className="font-caption text-caption text-text-secondary">Gana Street Commercial Terrace, Abuja</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
                      <Icon name="domain" className="text-[24px]" />
                    </div>
                  </div>
                  {/* Main Gross Metric Box */}
                  <div className="mt-space-md bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                    <span className="font-caption text-caption text-text-tertiary">Monthly Gross Revenue</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-heading-lg text-heading-lg font-bold text-on-surface">₦1,710,000</span>
                      <span className="font-label-sm text-label-sm font-semibold text-badge-discount-text">440 high-tier</span>
                    </div>
                  </div>
                </div>

                {/* Granular Breakdown Rows */}
                <div className="px-space-lg py-space-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="receipt_long" className="text-text-tertiary text-[18px]" />
                      <span>Average Order Value</span>
                    </div>
                    <div className="flex items-center gap-space-2xs">
                      <span className="font-label-md text-label-md font-bold text-on-surface">₦3,886</span>
                      <span className="font-caption text-caption text-badge-discount-text font-semibold">+15.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="table_bar" className="text-text-tertiary text-[18px]" />
                      <span>Peak Seating Occupancy</span>
                    </div>
                    <div className="flex items-center gap-space-2xs">
                      <div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '74%' }} />
                      </div>
                      <span className="font-label-md text-label-md font-bold text-on-surface">74%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="radar" className="text-text-tertiary text-[18px]" />
                      <span>Customer Reach</span>
                    </div>
                    <span className="font-label-md text-label-md font-semibold text-primary">6.8 km (Wide Draw)</span>
                  </div>
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="local_fire_department" className="text-text-tertiary text-[18px]" />
                      <span>Premium Item Affinity</span>
                    </div>
                    <span className="font-label-md text-label-md font-medium text-badge-discount-text">
                      68% Signature Platters
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action with High Intent Color */}
              <div className="p-space-lg pt-space-xs">
                <button
                  className="w-full py-2.5 rounded-xl bg-primary text-on-primary hover:bg-surface-tint font-button-secondary text-button-secondary shadow-sm transition-all flex items-center justify-center gap-1"
                  type="button"
                >
                  <span>Optimize Maitama Margins</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>
            </div>
            )}

            {/* Scorecard 3: Garki Area 11 */}
            {showBranch('garki') && (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                {/* Card Head */}
                <div className="p-space-lg pb-space-md bg-gradient-to-b from-surface-container-low to-transparent">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-2xs">
                        <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-tertiary font-caption text-caption font-bold uppercase tracking-wider">
                          Renovating
                        </span>
                        <span className="font-caption text-caption text-text-tertiary">Hub #03</span>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface mt-space-2xs">
                        Garki Area 11
                      </h3>
                      <span className="font-caption text-caption text-text-secondary">Ahmadu Bello Way Concourse, Abuja</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary shrink-0">
                      <Icon name="handyman" className="text-[24px]" />
                    </div>
                  </div>
                  {/* Main Gross Metric Box */}
                  <div className="mt-space-md bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                    <span className="font-caption text-caption text-text-tertiary">Monthly Gross Revenue</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-heading-lg text-heading-lg font-bold text-on-surface">₦520,000</span>
                      <span className="font-label-sm text-label-sm font-semibold text-text-secondary">200 pickup</span>
                    </div>
                  </div>
                </div>

                {/* Granular Breakdown Rows */}
                <div className="px-space-lg py-space-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="receipt_long" className="text-text-tertiary text-[18px]" />
                      <span>Average Order Value</span>
                    </div>
                    <span className="font-label-md text-label-md font-bold text-on-surface">₦2,600</span>
                  </div>
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="table_bar" className="text-text-tertiary text-[18px]" />
                      <span>Dine-In Availability</span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-caption text-caption font-bold">
                      Closed (Kitchen Revamp)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-space-xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md">
                      <Icon name="radar" className="text-text-tertiary text-[18px]" />
                      <span>Effective Reach</span>
                    </div>
                    <span className="font-label-md text-label-md font-semibold text-text-secondary">
                      2.1 km (Hyper-local Takeout)
                    </span>
                  </div>
                  {/* Note Alert Box */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low text-text-secondary font-caption text-caption flex items-start gap-space-xs mt-space-2xs">
                    <Icon name="info" className="text-tertiary text-[18px] shrink-0" />
                    <span>
                      Kitchen upgrade in progress. Seating capacity reduced to 0%. Transitioning fully to takeaway &amp;
                      app presells through next Tuesday.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-space-lg pt-space-xs">
                <button
                  className="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container font-button-secondary text-button-secondary text-on-surface transition-colors flex items-center justify-center gap-1"
                  type="button"
                >
                  <span>View Renovation Timeline</span>
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* Bottom Section: Catchment Map & Geographic Draw Studio + Strategic Opportunity Card */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
          {/* Interactive Catchment Map Container */}
          <div className="xl:col-span-8 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                    Abuja Central Matrix &amp; Catchment Draw
                  </h3>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Physical retail influence perimeter by client tap velocity.
                </p>
              </div>
              {/* Radius Legend Pills */}
              <div className="flex items-center gap-space-2xs">
                <span className="px-space-xs py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Wuse II (4.2 km)
                </span>
                <span className="px-space-xs py-1 rounded-full bg-surface-container-high text-on-secondary-container font-caption text-caption font-semibold">
                  Maitama (6.8 km)
                </span>
                <span className="px-space-xs py-1 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
                  Garki (2.1 km)
                </span>
              </div>
            </div>

            {/* Google Map Container with data-location pipeline */}
            <div className="relative w-full h-[360px] rounded-xl overflow-hidden shadow-inner bg-surface-container">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAS8MIkfUXCowqMrBNzXwBLe7zGD-oQ6X0K54ExvTYe0U0BpWPecEka0C2be430vjIyMdVEmEyJRz69cXHqu4NmZ-7j9PzsdpId9gjkr6PfjEPfUD7M7_DDAaz_RxSuvIbrDHBLQnors-4rNdkRr31qxkcnMPhbMcjqYdcHPUw7-8xotoA1Ulp7gNhNINiP53m80W12rkbkh0lSJomJF0HGgdvg7vW5TWtJnlTp3KADaiCDNaWTiPcdLA')",
                }}
              />
              {/* Tactical HUD Overlay within map */}
              <div className="absolute top-4 left-4 p-space-sm rounded-xl bg-surface/90 backdrop-blur-md shadow-md max-w-xs flex flex-col gap-1 pointer-events-none">
                <span className="font-caption text-caption font-bold text-on-surface">Cross-Branch Migration</span>
                <p className="font-caption text-caption text-text-secondary">
                  21.4% of Maitama weekend patrons previously checked into Wuse II during weekday lunch hours.
                </p>
              </div>
              {/* Floating Map Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1 shadow-md rounded-xl overflow-hidden">
                <button
                  className="w-9 h-9 bg-surface hover:bg-surface-container-low flex items-center justify-center text-on-surface transition-colors"
                  type="button"
                  aria-label="Zoom in"
                >
                  <Icon name="add" className="text-[20px]" />
                </button>
                <button
                  className="w-9 h-9 bg-surface hover:bg-surface-container-low flex items-center justify-center text-on-surface transition-colors"
                  type="button"
                  aria-label="Zoom out"
                >
                  <Icon name="remove" className="text-[20px]" />
                </button>
                <button
                  className="w-9 h-9 bg-surface hover:bg-surface-container-low flex items-center justify-center text-primary transition-colors"
                  type="button"
                  aria-label="Recenter map"
                >
                  <Icon name="my_location" className="text-[18px]" />
                </button>
              </div>
            </div>

            {/* Footnote meta bar */}
            <div className="flex items-center justify-between pt-space-md text-text-tertiary font-caption text-caption">
              <span>Lat/Lon Cluster: 9.0765° N, 7.3986° E (Abuja FCT Central Business)</span>
              <button type="button" className="flex items-center gap-1 text-primary cursor-pointer hover:underline">
                <span>Expand Full Geo Analytics</span>
                <Icon name="open_in_new" className="text-[14px]" />
              </button>
            </div>
          </div>

          {/* Branch Margin Opportunity Insight Banner / Decision Studio */}
          <div className="xl:col-span-4 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
            {/* Ambient decorative tint orb */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-badge-discount-bg pointer-events-none" />
            <div className="flex flex-col gap-space-md z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                    <Icon name="auto_awesome" className="text-[20px]" />
                  </div>
                  <span className="font-label-md text-label-md font-bold text-on-surface">Intelligence Advisory</span>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                  High Impact
                </span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <h4 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                  Branch Margin Opportunity Detected
                </h4>
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-xs">
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                    Maitama Heights patrons exhibit a{' '}
                    <span className="font-bold text-primary">+15.7% spend willingness</span>.
                  </p>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    Recommend activating branch-specific tier pricing (
                    <span className="font-semibold text-badge-discount-text">+10% margin tolerance</span>) for exclusive
                    combos without impacting customer sentiment.
                  </p>
                </div>
              </div>

              {/* Expected Financial Lift Simulation */}
              <div className="grid grid-cols-2 gap-space-xs">
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary">Projected Lift</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-badge-discount-text mt-0.5">
                    +₦171,000
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">per monthly cycle</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary">Churn Probability</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-primary mt-0.5">&lt; 1.2%</span>
                  <span className="font-caption text-caption text-text-tertiary">negligible impact</span>
                </div>
              </div>
            </div>

            {/* Strategy Trigger CTA */}
            <div className="pt-space-lg z-10 flex flex-col gap-space-2xs">
              <button
                className="w-full py-3 rounded-xl bg-primary hover:bg-surface-tint text-on-primary font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.3)] transition-all flex items-center justify-center gap-space-xs active:scale-[0.98]"
                type="button"
              >
                <span>Configure Maitama Pricing</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <span className="font-caption text-caption text-center text-text-tertiary mt-1">
                Modifies POS register unit pricing for Gana Street location only.
              </span>
            </div>
          </div>
        </section>
      </div>
    </AnalyticsShell>
  );
}
