import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { AnalyticsHeader, AnalyticsSection, type AnalyticsTabKey } from '../components/AnalyticsChrome';
import { apiErrorMessage } from '../services/errorMessages';
import { locationsView, periodLabel, useLiveAnalytics } from './analyticsLive';

interface AnalyticsLocationsScreenProps {
  onAnalyticsTab: (tab: AnalyticsTabKey) => void;
  onOpenFilter: () => void;
  onOpenExport: () => void;
  onTab: (tab: BusinessTabKey) => void;
  onManageLocations: () => void;
}

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB9K58gWmbAb58VXZy4xMSbE5PEWxY4s7m6dZuUabBIXz_qYODSyUi9nfWJ-c4ayqPl4kG3rAmddwfbO6g1ENULAMQBwY2BfMp5zgaQjINXGBh6xvOOV1XGOLxiozR_PkvuiGiHeUfYlCHMmzLvfrcxldcA6sSP48joWS251K3bX3Kn4WNtLRUl5HJGoV4UtwC9hfuj1hZS-V_f0k2svAngITS_-9I9Gc2ec7cpbMIbifqQtnS-FIer4Q';

const BRANCH_FILTERS = ['All', 'Wuse', 'Maitama', 'Garki'];

const BRANCHES = [
  {
    name: 'Wuse Branch',
    status: 'Wuse District',
    statusIcon: 'location_on',
    revenue: '₦2,340,000',
    share: 64,
    orders: '248',
    aov: '₦9,435',
    views: '6,120',
    shareClass: 'text-primary',
    bar: 'bg-primary',
  },
  {
    name: 'Maitama Heights',
    status: 'Maitama District',
    statusIcon: 'apartment',
    revenue: '₦1,760,000',
    share: 28,
    orders: '186',
    aov: '₦9,462',
    views: '4,840',
    shareClass: 'text-secondary',
    bar: 'bg-secondary',
  },
  {
    name: 'Garki Express',
    status: 'Garki District',
    statusIcon: 'electric_moped',
    revenue: '₦750,000',
    share: 8,
    orders: '78',
    aov: '₦9,615',
    views: '3,320',
    shareClass: 'text-tertiary',
    bar: 'bg-tertiary',
  },
];

const HEAT_WEEK = [
  { day: 'Mon', pct: 34 },
  { day: 'Tue', pct: 41 },
  { day: 'Wed', pct: 46 },
  { day: 'Thu', pct: 58 },
  { day: 'Fri', pct: 82 },
  { day: 'Sat', pct: 100 },
  { day: 'Sun', pct: 74 },
];

const DISCOVERY = [
  { label: 'In-store QR & POS', wuse: '44%', maitama: '38%', width: '44%' },
  { label: 'Direct storefront', wuse: '26%', maitama: '31%', width: '31%' },
  { label: 'Deals & vouchers', wuse: '18%', maitama: '22%', width: '22%' },
  { label: 'Social & referral', wuse: '12%', maitama: '9%', width: '12%' },
];

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-md ${className}`}>
      {children}
    </div>
  );
}

export function AnalyticsLocationsScreen({
  onAnalyticsTab,
  onOpenFilter,
  onOpenExport,
  onTab,
  onManageLocations,
}: AnalyticsLocationsScreenProps) {
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const { live, filter: period, data, error } = useLiveAnalytics('locations');
  useEffect(() => {
    if (error) showToast(apiErrorMessage(error, 'Could not load location analytics.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const view = locationsView(data);
  const pills = live ? view.pills : BRANCH_FILTERS;
  const branches = live ? view.branches : BRANCHES;
  const visibleBranches = filter === 'All' ? branches : branches.filter((branch) => branch.name.startsWith(filter));
  const heatWeek = live ? view.heatmap : HEAT_WEEK;

  return (
    <AppScreen>
      <AnalyticsHeader active="locations" onTab={onAnalyticsTab} onOpenFilter={onOpenFilter} onOpenExport={onOpenExport} />

      <div className="flex flex-col gap-space-xl px-margin pt-space-sm pb-28">
        {/* Matrix header */}
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight font-semibold">
              Locations Matrix
            </span>
            <span className="font-caption text-caption text-text-secondary mt-0.5">
              Branch revenue, share &amp; discovery
            </span>
          </div>
          <span className="flex items-center gap-1 font-caption text-caption font-semibold px-2 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            {live ? `${view.liveBranches} Live Syncing` : '3 Live Syncing'}
          </span>
        </div>

        {/* Branch pills */}
        <div className="flex gap-space-2xs overflow-x-auto no-scrollbar -mx-margin px-margin">
          {pills.map((name) => (
            <button
              aria-pressed={filter === name}
              className={`h-8 px-space-md rounded-full font-label-sm text-label-sm whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                filter === name
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container-low text-text-secondary'
              }`}
              key={name}
              type="button"
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Aggregate banner */}
        <Card className="bg-gradient-to-br from-surface-tint-blue to-surface-canvas border-primary/15">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-text-secondary">Network Revenue</span>
              <span className="font-heading-md text-heading-md text-text-primary font-bold">
                {live ? view.network.revenue : '₦4,850,000'}
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary shrink-0">
              {live ? periodLabel(period) : 'Last 30 days'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-space-xs mt-space-sm">
            <div className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 text-center">
              <div className="font-label-md text-label-md text-text-primary font-bold">
                {live ? view.network.outlets : '3'}
              </div>
              <span className="font-caption text-caption text-text-tertiary">Outlets</span>
            </div>
            <div className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 text-center">
              <div className="font-label-md text-label-md text-text-primary font-bold">
                {live ? view.network.orders : '512'}
              </div>
              <span className="font-caption text-caption text-text-tertiary">Orders</span>
            </div>
            <div className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 text-center">
              <div className="font-label-md text-label-md text-text-primary font-bold">
                {live ? view.network.views : '14,280'}
              </div>
              <span className="font-caption text-caption text-text-tertiary">Views</span>
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex mt-space-sm bg-surface-container-low">
            {(live ? view.segments : [
              { width: '64%', legend: 'Wuse 64%', dot: 'bg-primary' },
              { width: '28%', legend: 'Maitama 28%', dot: 'bg-secondary' },
              { width: '8%', legend: 'Garki 8%', dot: 'bg-tertiary' },
            ]).map((segment) => (
              <div className={`h-full ${segment.dot}`} key={segment.legend} style={{ width: segment.width }} />
            ))}
          </div>
          <div className="flex items-center gap-space-sm mt-space-xs flex-wrap">
            {(live ? view.segments : [
              { width: '64%', legend: 'Wuse 64%', dot: 'bg-primary' },
              { width: '28%', legend: 'Maitama 28%', dot: 'bg-secondary' },
              { width: '8%', legend: 'Garki 8%', dot: 'bg-tertiary' },
            ]).map((segment) => (
              <span className="flex items-center gap-1 font-caption text-caption text-text-secondary" key={segment.legend}>
                <span className={`w-2 h-2 rounded-full ${segment.dot}`} />
                {segment.legend}
              </span>
            ))}
          </div>
        </Card>

        {/* Branch scorecards */}
        <AnalyticsSection
          title="Branch Scorecards"
          meta={`${visibleBranches.length} of ${branches.length} outlets shown`}
        >
          <div className="flex flex-col gap-space-sm">
            {visibleBranches.map((branch) => (
              <Card key={branch.name}>
                <div className="flex items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name={branch.statusIcon} className="text-[17px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-body-lg text-body-lg font-semibold text-on-surface truncate">
                        {branch.name}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">{branch.status}</span>
                    </div>
                  </div>
                  <span
                    className={`font-label-sm text-label-sm font-semibold shrink-0 ${branch.shareClass}`}
                  >
                    {branch.share}% share
                  </span>
                </div>

                <div className="flex items-end justify-between gap-space-sm mt-space-sm">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Revenue</span>
                    <span className="font-heading-md text-heading-md text-text-primary font-bold">
                      {branch.revenue}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-space-xs mt-space-sm">
                  <div className="bg-surface-container-low rounded-lg py-1.5 text-center">
                    <div className="font-label-md text-label-md text-text-primary font-bold">{branch.orders}</div>
                    <span className="font-caption text-caption text-text-tertiary">Orders</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg py-1.5 text-center">
                    <div className="font-label-md text-label-md text-text-primary font-bold">{branch.aov}</div>
                    <span className="font-caption text-caption text-text-tertiary">Avg order</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg py-1.5 text-center">
                    <div className="font-label-md text-label-md text-text-primary font-bold">{branch.views}</div>
                    <span className="font-caption text-caption text-text-tertiary">Views</span>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-surface-container-low overflow-hidden mt-space-sm">
                  <div className={`h-full rounded-full ${branch.bar}`} style={{ width: `${branch.share}%` }} />
                </div>
              </Card>
            ))}
          </div>
        </AnalyticsSection>

        {/* Discovery channels */}
        <AnalyticsSection title="Discovery Channel Matrix" meta="How each district finds you">
          <Card>
            <div className="flex items-center justify-between font-caption text-caption text-text-secondary pb-space-xs">
              <span>Channel</span>
              <div className="flex items-center gap-space-sm">
                <span className="w-14 text-right">Wuse</span>
                <span className="w-14 text-right">Maitama</span>
              </div>
            </div>
            <div className="flex flex-col">
              {DISCOVERY.map((row, index) => (
                <div
                  className={`py-space-xs ${index > 0 ? 'border-t border-border-subtle' : ''}`}
                  key={row.label}
                >
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface truncate">{row.label}</span>
                    <div className="flex items-center gap-space-sm shrink-0">
                      <span className="w-14 text-right font-label-sm text-label-sm text-primary font-semibold">
                        {row.wuse}
                      </span>
                      <span className="w-14 text-right font-label-sm text-label-sm text-secondary font-semibold">
                        {row.maitama}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: row.width }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-space-2xs bg-surface-tint-blue rounded-xl px-space-sm py-space-xs mt-space-sm">
              <Icon name="insights" className="text-primary text-[15px] shrink-0" />
              <span className="font-caption text-caption text-on-surface">
                Wuse leads on QR scans; Maitama drives more direct storefront visits.
              </span>
            </div>
          </Card>
        </AnalyticsSection>

        {/* Peak times */}
        <AnalyticsSection title="Peak Times & Heatmap" meta="Order volume by weekday">
          <Card>
            <div className="grid grid-cols-2 gap-space-xs mb-space-sm">
              <div className="bg-surface-container-low rounded-xl p-space-xs">
                <div className="flex items-center gap-1 text-primary">
                  <Icon name="wb_sunny" className="text-[15px]" />
                  <span className="font-caption text-caption font-semibold">Lunch rush</span>
                </div>
                <div className="font-label-md text-label-md text-text-primary font-bold">12–2 PM</div>
                <span className="font-caption text-caption text-text-tertiary">
                  {live ? `${view.lunchShare}% of day activity` : '32% of day orders'}
                </span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-xs">
                <div className="flex items-center gap-1 text-tertiary">
                  <Icon name="nightlight" className="text-[15px]" />
                  <span className="font-caption text-caption font-semibold">Dinner rush</span>
                </div>
                <div className="font-label-md text-label-md text-text-primary font-bold">6–9 PM</div>
                <span className="font-caption text-caption text-text-tertiary">
                  {live ? `${view.dinnerShare}% of day activity` : '48% of day orders'}
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-space-2xs h-28">
              {heatWeek.map((item) => (
                <div className="flex-1 flex flex-col items-center gap-1" key={item.day}>
                  <div className="w-full flex items-end justify-center h-20">
                    <div
                      className={`w-full max-w-[24px] rounded-t-md ${
                        item.pct === 100 ? 'bg-primary' : item.pct >= 74 ? 'bg-primary/55' : 'bg-primary/30'
                      }`}
                      style={{ height: `${item.pct}%` }}
                    />
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{item.day}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-space-2xs bg-badge-discount-bg rounded-xl px-space-sm py-space-xs mt-space-sm">
              <Icon name="bolt" className="text-badge-discount-text text-[15px] shrink-0" />
              <span className="font-caption text-caption text-badge-discount-text font-semibold">
                Off-peak window Tue–Thu 2–5 PM — promote combo deals to fill tables.
              </span>
            </div>

            <button
              className="w-full h-11 mt-space-sm rounded-xl bg-surface-tint-blue text-primary font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
              type="button"
              onClick={() => showToast('Peak-time promotion draft opened')}
            >
              <Icon name="campaign" className="text-[18px]" />
              <span>Boost Off-Peak Hours</span>
            </button>
          </Card>
        </AnalyticsSection>

        {/* Geofence radar */}
        <AnalyticsSection title="Live Geofence Radar" meta="Discovery pings around your outlets">
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              <img alt="Map of nearby discovery activity" className="w-full h-44 object-cover" src={MAP_IMAGE} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-canvas/85 via-transparent to-transparent" />
              <span className="absolute top-space-sm left-space-sm flex items-center gap-1 font-caption text-caption font-semibold px-2 py-1 rounded-full bg-surface-canvas/95 text-text-primary shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                27 pings today
              </span>
              <div className="absolute bottom-space-sm left-space-sm right-space-sm flex items-center justify-between gap-space-xs">
                <span className="font-caption text-caption text-text-secondary">1.2 km discovery radius</span>
                <span className="font-caption text-caption text-text-primary font-semibold">Wuse central</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-space-xs p-space-md pt-0">
              {[
                { value: '14', label: 'QR scans' },
                { value: '8', label: 'Storefront' },
                { value: '5', label: 'Deal claims' },
              ].map((item) => (
                <div className="bg-surface-container-low rounded-lg py-1.5 text-center" key={item.label}>
                  <div className="font-label-md text-label-md text-text-primary font-bold">{item.value}</div>
                  <span className="font-caption text-caption text-text-tertiary">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </AnalyticsSection>

        {/* Handoff */}
        <Card className="bg-gradient-to-br from-surface-tint-blue to-surface-canvas border-primary/20">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <Icon name="map" className="text-[19px]" />
            </div>
            <div className="flex flex-col min-w-0 gap-1">
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">Manage Locations</span>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Update outlet hours, service areas, geofence radius and per-branch pricing from the locations hub.
              </p>
            </div>
          </div>
          <button
            className="w-full h-11 mt-space-sm rounded-xl bg-primary text-on-primary font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
            type="button"
            onClick={onManageLocations}
          >
            <Icon name="location_on" className="text-[18px]" />
            <span>Manage Locations</span>
          </button>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-32px)]">
          <div className="bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-space-md py-space-xs rounded-full shadow-lg flex items-center gap-space-2xs whitespace-nowrap">
            <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      <BusinessTabBar active="more" onTab={onTab} />
    </AppScreen>
  );
}
