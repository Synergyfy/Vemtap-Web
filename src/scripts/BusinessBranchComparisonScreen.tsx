import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { downloadCsv } from '../utils/exportCsv';

interface BusinessBranchComparisonScreenProps {
  onBack: () => void;
}

type MetricKey = 'revenue' | 'tickets' | 'retention';

const METRICS: Record<MetricKey, { label: string; values: string[]; widths: string[] }> = {
  revenue: {
    label: 'Revenue',
    values: ['₦2,620,000', '₦1,710,000', '₦520,000'],
    widths: ['100%', '65%', '20%'],
  },
  tickets: {
    label: 'Tickets',
    values: ['780 tx', '440 tx', '200 tx'],
    widths: ['100%', '56%', '25%'],
  },
  retention: {
    label: 'Retention',
    values: ['68% ret.', '79% ret.', '41% ret.'],
    widths: ['82%', '94%', '48%'],
  },
};

const BRANCH_BARS = [
  { name: 'Wuse II Flagship', dot: 'bg-primary', bar: 'bg-primary' },
  { name: 'Maitama Heights', dot: 'bg-secondary-container', bar: 'bg-secondary' },
  { name: 'Garki Area 11', dot: 'bg-surface-container-highest', bar: 'bg-outline-variant' },
];

const SCORECARDS = [
  {
    name: 'Wuse II Flagship',
    address: 'Aminu Kano Cresc, Abuja',
    icon: 'storefront',
    iconClass: 'bg-surface-tint-blue text-primary',
    badge: 'Top Grossing',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    verified: true,
    sales: '₦2,620,000',
    salesMeta: '780 completed orders',
    aovLabel: 'Average Order Value',
    aov: '₦3,358',
    aovClass: 'text-text-primary',
    aovMeta: 'Standard basket index',
    aovMetaClass: 'text-text-tertiary',
    occupancy: '89% Occupancy',
    radius: '4.2km draw radius',
    notice: null as string | null,
  },
  {
    name: 'Maitama Heights',
    address: 'Gana Street, Maitama',
    icon: 'villa',
    iconClass: 'bg-surface-container text-secondary',
    badge: 'Growing Fast',
    badgeClass: 'bg-surface-tint-blue text-primary',
    verified: false,
    sales: '₦1,710,000',
    salesMeta: '440 high-tier tickets',
    aovLabel: 'Highest Basket (AOV)',
    aov: '₦3,886',
    aovClass: 'text-primary',
    aovMeta: '+15.7% network avg',
    aovMetaClass: 'text-badge-discount-text',
    occupancy: '74% Occupancy',
    radius: '6.8km customer reach',
    notice: null as string | null,
  },
  {
    name: 'Garki Area 11',
    address: 'Near Area 11 Mall, Garki',
    icon: 'store',
    iconClass: 'bg-surface-container-high text-text-secondary',
    badge: 'Renovating',
    badgeClass: 'bg-surface-container-highest text-on-surface-variant',
    verified: false,
    sales: '₦520,000',
    salesMeta: '200 pickup tickets',
    aovLabel: 'Average Order Value',
    aov: '₦2,600',
    aovClass: 'text-text-primary',
    aovMeta: 'Limited counter menu',
    aovMetaClass: 'text-text-tertiary',
    occupancy: 'Counter only',
    radius: '2.1km hyperlocal draw',
    notice: 'Kitchen upgrade in progress. Limited dine-in throughput.',
  },
];

const SUB_STRIP = [
  { key: 'business', label: 'Business' },
  { key: 'customers', label: 'Customers' },
  { key: 'deals', label: 'Deals' },
  { key: 'locations', label: 'Locations' },
  { key: 'pos', label: 'POS & Registers' },
];

export function BusinessBranchComparisonScreen({ onBack }: BusinessBranchComparisonScreenProps) {
  const [metric, setMetric] = useState<MetricKey>('revenue');
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

  const active = METRICS[metric];

  return (
    <AppScreen>
      <ScreenHeader
        title="Branch Comparison"
        onBack={onBack}
        trailing={
          <button
            aria-label="Export detailed metrics"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
            type="button"
            onClick={() => {
              downloadCsv(
                'vemtap_branch_comparison',
                ['Branch', 'Sales', 'Orders', 'Avg Order Value', 'Occupancy', 'Draw Radius'],
                SCORECARDS.map((card) => [card.name, card.sales, card.salesMeta, card.aov, card.occupancy, card.radius]),
              );
              showToast('Branch metrics export downloaded');
            }}
          >
            <Icon name="download" className="text-[19px]" />
          </button>
        }
      />

      <div className="flex flex-col w-full flex-1 pb-10">
        {/* Sub-strip */}
        <div className="w-full bg-surface-canvas shadow-sm px-margin py-space-xs sticky top-0 z-30">
          <div className="flex items-center space-x-space-xs overflow-x-auto no-scrollbar py-space-2xs">
            {SUB_STRIP.map((item) => {
              const isActive = item.key === 'locations';
              return (
                <button
                  className={`px-space-md py-space-2xs rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors flex items-center gap-space-2xs ${
                    isActive
                      ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                  key={item.key}
                  type="button"
                  onClick={() => (isActive ? undefined : showToast(`${item.label} view is loading…`))}
                >
                  {isActive && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-margin pt-space-sm pb-space-2xl space-y-space-md">
          {/* Network pulse */}
          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider block">
                  Live Intelligence
                </span>
                <p className="font-heading-sm text-heading-sm text-text-primary">Branch Network Pulse</p>
              </div>
              <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-1.5" />3 Outlets Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="bg-surface-subtle p-space-xs rounded-lg">
                <div className="flex items-center space-x-1 text-text-secondary mb-1">
                  <Icon name="emoji_events" className="text-[15px] text-primary" />
                  <span className="font-caption text-caption">Top Revenue Driver</span>
                </div>
                <p className="font-label-sm text-label-sm font-semibold text-text-primary truncate">Wuse II Flagship</p>
                <span className="inline-block mt-0.5 font-caption text-caption text-badge-discount-text font-medium bg-badge-discount-bg px-1.5 py-0.5 rounded">
                  54% of Network Gross
                </span>
              </div>
              <div className="bg-surface-subtle p-space-xs rounded-lg">
                <div className="flex items-center space-x-1 text-text-secondary mb-1">
                  <Icon name="groups" className="text-[15px] text-secondary" />
                  <span className="font-caption text-caption">Combined Footfall</span>
                </div>
                <p className="font-heading-sm text-heading-sm font-bold text-text-primary">3,420</p>
                <span className="font-caption text-caption text-text-secondary">Unique validated taps</span>
              </div>
            </div>
          </div>

          {/* Comparative metrics */}
          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-label-md text-label-md text-text-primary font-semibold">Comparative Metrics</h2>
                <p className="font-caption text-caption text-text-secondary">Gross sales, ticket conversion &amp; retention</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="equalizer" className="text-[17px] text-primary" />
              </div>
            </div>
            <div className="flex rounded-lg bg-surface-container p-0.5">
              {(Object.keys(METRICS) as MetricKey[]).map((key) => (
                <button
                  className={`flex-1 py-1.5 rounded-lg font-label-sm text-label-sm transition-all ${
                    metric === key ? 'bg-surface-canvas text-primary font-semibold shadow-sm' : 'text-text-secondary'
                  }`}
                  key={key}
                  type="button"
                  onClick={() => setMetric(key)}
                >
                  {METRICS[key].label}
                </button>
              ))}
            </div>
            <div className="space-y-space-sm pt-space-xs">
              {BRANCH_BARS.map((branch, index) => (
                <div className="space-y-1" key={branch.name}>
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="font-semibold text-text-primary flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${branch.dot}`} />
                      {branch.name}
                    </span>
                    <span className="font-semibold text-text-primary">{active.values[index]}</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
                    <div
                      className={`${branch.bar} h-full rounded-full transition-all duration-500`}
                      style={{ width: active.widths[index] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scorecards */}
          <div className="space-y-space-sm">
            <div className="flex items-center justify-between px-space-2xs">
              <h2 className="font-label-md text-label-md text-text-primary font-semibold">Branch Scorecards</h2>
              <span className="font-caption text-caption text-text-secondary">Updated 12m ago</span>
            </div>
            {SCORECARDS.map((card) => (
              <div
                className={`bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm ${
                  card.name === 'Garki Area 11' ? 'opacity-95' : ''
                }`}
                key={card.name}
              >
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex items-center space-x-space-xs min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconClass}`}>
                      <Icon name={card.icon} className="text-[20px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-label-sm text-label-sm font-bold text-text-primary truncate">{card.name}</h3>
                        {card.verified && <Icon name="verified" className="text-[14px] text-primary" filled />}
                      </div>
                      <p className="font-caption text-caption text-text-secondary truncate">{card.address}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${card.badgeClass}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
                  <div className="bg-surface-subtle p-space-xs rounded-lg">
                    <span className="font-caption text-caption text-text-secondary">Gross Sales</span>
                    <p className="font-label-sm text-label-sm font-bold text-text-primary mt-0.5">{card.sales}</p>
                    <span className="font-caption text-caption text-text-tertiary">{card.salesMeta}</span>
                  </div>
                  <div className="bg-surface-subtle p-space-xs rounded-lg">
                    <span className="font-caption text-caption text-text-secondary">{card.aovLabel}</span>
                    <p className={`font-label-sm text-label-sm font-bold mt-0.5 ${card.aovClass}`}>{card.aov}</p>
                    <span className={`font-caption text-caption ${card.aovMetaClass}`}>{card.aovMeta}</span>
                  </div>
                </div>
                {card.notice ? (
                  <div className="bg-error-container/30 p-space-xs rounded-lg flex items-center space-x-2">
                    <Icon name="construction" className="text-[16px] text-error shrink-0" />
                    <p className="font-caption text-caption text-on-error-container font-medium">{card.notice}</p>
                  </div>
                ) : (
                  <div className="bg-surface-container-low rounded-lg p-space-xs flex items-center justify-between text-on-surface">
                    <div className="flex items-center space-x-1.5">
                      <Icon name="table_restaurant" className="text-[16px] text-primary" />
                      <span className="font-label-sm text-label-sm font-medium">{card.occupancy}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-text-secondary font-caption text-caption">
                      <Icon name="near_me" className="text-[14px] text-primary" />
                      <span>{card.radius}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Catchment */}
          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-label-md text-label-md text-text-primary font-semibold">Catchment &amp; Customer Draw</h2>
                <p className="font-caption text-caption text-text-secondary">Geographic range where shoppers travel from</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="radar" className="text-[17px]" />
              </div>
            </div>
            <div
              className="w-full h-32 bg-cover bg-center rounded-lg relative overflow-hidden flex items-end p-space-xs"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(238,245,255,0.9), rgba(233,237,255,0.9)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=60')",
              }}
            >
              <div className="w-full bg-surface-canvas/90 backdrop-blur-md rounded-md p-space-xs flex justify-between items-center shadow-sm">
                <span className="font-caption text-caption text-text-primary font-semibold flex items-center gap-1">
                  <Icon name="pin_drop" className="text-[15px] text-primary" />
                  Abuja Central Matrix
                </span>
                <span className="font-caption text-caption text-text-secondary">3 geo-polygons mapped</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-space-xs text-center">
              {[
                { label: 'Wuse II', value: '4.2 km', tone: 'text-text-primary', tag: 'Urban Core', tagClass: 'text-badge-discount-text' },
                { label: 'Maitama', value: '6.8 km', tone: 'text-primary', tag: 'Wide Draw', tagClass: 'text-badge-discount-text' },
                { label: 'Garki', value: '2.1 km', tone: 'text-text-primary', tag: 'Hyperlocal', tagClass: 'text-text-tertiary' },
              ].map((item) => (
                <div className="p-space-xs rounded-lg bg-surface-subtle" key={item.label}>
                  <span className="font-caption text-caption text-text-secondary block">{item.label}</span>
                  <span className={`font-label-sm text-label-sm font-bold ${item.tone}`}>{item.value}</span>
                  <span className={`font-caption text-caption block ${item.tagClass}`}>{item.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insight */}
          <div className="bg-gradient-to-br from-surface-tint-blue via-surface-container-low to-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-xs">
            <div className="flex items-start space-x-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-on-primary">
                <Icon name="lightbulb" className="text-[16px]" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-label-sm text-label-sm font-bold text-text-primary">Branch Margin Opportunity</h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Maitama Heights patrons exhibit a <strong className="text-text-primary">+15.7% spend willingness</strong>.
                  We recommend activating branch-specific tier pricing for exclusive combos.
                </p>
              </div>
            </div>
            <div className="pt-space-2xs">
              <button
                className="w-full py-space-xs px-space-md rounded-lg bg-surface-canvas text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
                type="button"
                onClick={() => showToast('Opening Maitama pricing configurator…')}
              >
                <span>Configure Maitama Pricing</span>
                <Icon name="chevron_right" className="text-[15px]" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-space-xs pt-space-xs">
            <button
              className="w-full h-12 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md font-semibold shadow-md flex items-center justify-center gap-space-xs active:scale-[0.99] transition-transform"
              type="button"
              onClick={() => showToast('Opening branch pricing matrix…')}
            >
              <Icon name="assignment" className="text-[18px]" />
              <span>Manage Branch Pricing Matrix</span>
            </button>
            <button
              className="w-full h-11 bg-surface-canvas text-text-primary rounded-xl font-label-sm text-label-sm font-semibold shadow-sm flex items-center justify-center gap-space-xs transition-colors"
              type="button"
              onClick={() => {
                const rows: string[][] = [];
                (Object.keys(METRICS) as MetricKey[]).forEach((key) => {
                  METRICS[key].values.forEach((value, index) => {
                    rows.push([BRANCH_BARS[index].name, METRICS[key].label, value]);
                  });
                });
                downloadCsv('vemtap_branch_performance', ['Branch', 'Metric', 'Value'], rows);
                showToast('Branch performance report downloaded');
              }}
            >
              <Icon name="file_download" className="text-text-secondary text-[17px]" />
              <span>Export Branch Performance Report</span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
