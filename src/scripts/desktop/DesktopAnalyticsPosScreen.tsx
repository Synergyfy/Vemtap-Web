import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { AnalyticsShell } from './AnalyticsShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { AnalyticsTabKey } from '../../components/AnalyticsChrome';
import { PUBLIC_IMAGES } from '../publicPosData';

interface DesktopAnalyticsPosScreenProps {
  onNav?: (key: BusinessPortalNavKey) => void;
  onAnalyticsTab: (tab: AnalyticsTabKey) => void;
  onOpenFilter: () => void;
  onOpenExport: () => void;
  onOpenCatalog: () => void;
  onOpenSync: () => void;
}

const DOMAIN_TABS: Array<{ key: AnalyticsTabKey; label: string; icon: string }> = [
  { key: 'business', label: 'Business', icon: 'query_stats' },
  { key: 'customers', label: 'Customers', icon: 'group' },
  { key: 'deals', label: 'Deals', icon: 'local_offer' },
  { key: 'locations', label: 'Locations', icon: 'pin_drop' },
  { key: 'pos', label: 'POS', icon: 'point_of_sale' },
];

const SALES = [
  { label: 'Gross Sales', value: '₦3,480,250', sub: 'Wuse + Maitama tills', icon: 'point_of_sale' },
  { label: 'Transactions', value: '480', sub: 'Avg 16 / day', icon: 'receipt_long' },
  { label: 'Avg Order Value', value: '₦7,250', sub: '+₦410 vs last', icon: 'shopping_cart' },
  { label: 'Items Sold', value: '1,240', sub: '2.6 items / ticket', icon: 'inventory_2' },
  { label: 'Tips & Service', value: '₦14,800', sub: '3.1% of sales', icon: 'volunteer_activism' },
  { label: 'Net After Voids', value: '+₦320,000', sub: '12 voided tickets', icon: 'calculate' },
];

const CADENCES = ['Daily', 'Weekly', 'Monthly'] as const;

const HOURS = [
  { hour: '10a', pct: 18 },
  { hour: '11a', pct: 34 },
  { hour: '12p', pct: 72 },
  { hour: '1p', pct: 88 },
  { hour: '2p', pct: 46 },
  { hour: '3p', pct: 24 },
  { hour: '4p', pct: 30 },
  { hour: '5p', pct: 52 },
  { hour: '6p', pct: 78 },
  { hour: '7p', pct: 100 },
  { hour: '8p', pct: 84 },
  { hour: '9p', pct: 40 },
];

const TENDERS = [
  { name: 'Card (Verve / Visa)', pct: 42, amount: '₦1,461,705', bar: 'bg-primary' },
  { name: 'Bank Transfer', pct: 36, amount: '₦1,252,890', bar: 'bg-secondary' },
  { name: 'Cash', pct: 14, amount: '₦487,235', bar: 'bg-tertiary' },
  { name: 'VEMTAP Voucher', pct: 8, amount: '₦278,420', bar: 'bg-badge-discount-text' },
];

const TOP_ITEMS = [
  { rank: 1, name: 'Prime Ribeye Steak', qty: '248 sold', amount: '₦1,240,000', image: PUBLIC_IMAGES.ribeye },
  { rank: 2, name: 'Signature Smash Burgers', qty: '310 sold', amount: '₦840,000', image: PUBLIC_IMAGES.burger },
  { rank: 3, name: 'Loaded House Wings', qty: '186 sold', amount: '₦558,000', image: PUBLIC_IMAGES.wings },
  { rank: 4, name: 'Craft House Cocktails', qty: '190 sold', amount: '₦520,000', icon: 'local_bar' },
  { rank: 5, name: 'Truffle Fries Side', qty: '264 sold', amount: '₦264,000', icon: 'fastfood' },
];

const STAFF = [
  { name: 'Amaka O.', till: 'Till #01', tickets: '212', sales: '₦1,540,200', pct: 82, bar: 'bg-primary' },
  { name: 'Tunde K.', till: 'Till #02', tickets: '186', sales: '₦1,286,450', pct: 68, bar: 'bg-secondary' },
  { name: 'Blessing E.', till: 'Till #03', tickets: '82', sales: '₦653,600', pct: 34, bar: 'bg-tertiary' },
];

const SYNC_STATS = [
  { value: '18', label: 'Queued' },
  { value: '2s', label: 'Sync rate' },
  { value: '99.9%', label: 'Uptime' },
  { value: '0', label: 'Conflicts' },
];

function Panel({
  title,
  meta,
  action,
  children,
  className = '',
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-lg shadow-sm ${className}`}>
      <div className="flex items-end justify-between gap-space-sm mb-space-md">
        <div className="flex flex-col min-w-0">
          <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">{title}</h2>
          {meta && <div className="font-caption text-caption text-text-secondary mt-0.5">{meta}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function DesktopAnalyticsPosScreen({
  onNav,
  onAnalyticsTab,
  onOpenFilter,
  onOpenExport,
  onOpenCatalog,
  onOpenSync,
}: DesktopAnalyticsPosScreenProps) {
  const [domainTab, setDomainTab] = useState<AnalyticsTabKey>('pos');
  const [cadence, setCadence] = useState<(typeof CADENCES)[number]>('Daily');
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

  const handleTab = (tab: AnalyticsTabKey) => {
    setDomainTab(tab);
    onAnalyticsTab(tab);
  };

  return (
    <AnalyticsShell activeNav="analytics" onNav={onNav}>
      <div className="flex flex-col w-full pb-space-3xl">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-lg pb-space-xs">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm"
          >
            <span className="hover:text-primary transition-colors cursor-pointer">Business Hub</span>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="hover:text-primary transition-colors cursor-pointer">Analytics &amp; Intelligence</span>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-on-surface font-semibold">POS Terminals</span>
          </nav>
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span>Wuse #01 · #02</span>
          </div>
        </div>

        {/* Page Title & Action Cluster */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mt-space-xs mb-space-lg">
          <div className="space-y-space-2xs max-w-3xl">
            <div className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
              Till Intelligence
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              POS Terminals &amp; Till Analytics
            </h1>
            <p className="font-body-md text-body-md text-text-secondary">
              Per-till sales, hourly rhythms, tender mix, and cashier audit.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              className="flex items-center gap-space-2xs bg-surface-container-lowest px-space-sm py-2 rounded-xl font-button-secondary text-button-secondary text-on-surface shadow-sm hover:bg-surface-tint-blue hover:text-primary transition-all"
              type="button"
              onClick={onOpenFilter}
            >
              <Icon name="tune" className="text-[18px]" />
              <span>Filter</span>
            </button>
            <button
              className="flex items-center gap-space-2xs bg-surface-container-lowest px-space-sm py-2 rounded-xl font-button-secondary text-button-secondary text-on-surface shadow-sm hover:bg-surface-tint-blue hover:text-primary transition-all"
              type="button"
              onClick={onOpenExport}
            >
              <Icon name="ios_share" className="text-[18px]" />
              <span>Export</span>
            </button>
            <button
              className="flex items-center gap-space-2xs bg-surface-container px-space-sm py-2 rounded-xl font-button-secondary text-button-secondary text-primary hover:bg-surface-container-high transition-colors"
              type="button"
              onClick={onOpenSync}
            >
              <Icon name="sync" className="text-[18px]" />
              <span>Sync Log</span>
            </button>
            <button
              className="flex items-center gap-space-2xs px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.3)] hover:bg-surface-tint transition-all active:scale-[0.98]"
              type="button"
              onClick={onOpenCatalog}
            >
              <Icon name="point_of_sale" className="text-[18px]" />
              <span>Open Catalog</span>
            </button>
          </div>
        </div>

        {/* Domain Navigation Tabs */}
        <div className="flex items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl mb-space-xl overflow-x-auto">
          {DOMAIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-current={domainTab === tab.key ? 'page' : undefined}
              onClick={() => handleTab(tab.key)}
              className={
                domainTab === tab.key
                  ? 'flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-bold shadow-sm whitespace-nowrap'
                  : 'flex items-center gap-space-xs px-space-md py-2 rounded-lg text-text-secondary hover:text-on-surface font-label-md text-label-md font-medium transition-colors whitespace-nowrap'
              }
            >
              <Icon name={tab.icon} className="text-[18px]" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Live Sync Pulse Bar */}
        <div className="flex items-center justify-between gap-space-xs bg-surface-container-low rounded-2xl px-space-sm py-space-xs mb-space-lg">
          <div className="flex items-center gap-space-xs min-w-0">
            <div className="w-8 h-8 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
              <Icon name="sync" className="text-badge-discount-text text-[16px]" />
            </div>
            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
              Till Cloud Live Sync
            </span>
          </div>
          <span className="font-caption text-caption text-text-secondary shrink-0">Wuse #01 · #02</span>
        </div>

        {/* Sales Metric Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          {SALES.map((item, index) => (
            <div
              key={item.label}
              className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-lg shadow-sm flex flex-col justify-between ${
                index >= 4 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-semibold truncate">
                  {item.label}
                </span>
                <span className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                  <Icon name={item.icon} className="text-[18px]" />
                </span>
              </div>
              <div className="mt-space-sm">
                <div className="font-heading-md text-heading-md text-text-primary font-bold">{item.value}</div>
                <span className="font-caption text-caption text-text-tertiary">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Asymmetric Dashboard Grid (7 cols left, 5 cols right on lg screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Hourly Rhythms & Payment Tender */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Hourly Rhythms */}
            <Panel title="Hourly Rhythms" meta={`Peak window · ${cadence.toLowerCase()} cadence`}>
              <div className="flex gap-space-2xs bg-surface-container-low rounded-xl p-1 mb-space-sm">
                {CADENCES.map((item) => (
                  <button
                    aria-pressed={cadence === item}
                    className={`h-7 flex-1 rounded-lg font-label-sm text-label-sm transition-colors ${
                      cadence === item
                        ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                        : 'text-text-secondary hover:text-on-surface'
                    }`}
                    key={item}
                    type="button"
                    onClick={() => setCadence(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mb-space-sm">
                <div className="bg-badge-discount-bg rounded-xl px-space-sm py-1.5">
                  <div className="font-label-md text-label-md text-badge-discount-text font-bold">₦684k</div>
                  <span className="font-caption text-caption text-badge-discount-text">Lunch peak · 1 PM</span>
                </div>
                <div className="bg-surface-tint-blue rounded-xl px-space-sm py-1.5">
                  <div className="font-label-md text-label-md text-primary font-bold">₦812k</div>
                  <span className="font-caption text-caption text-primary">Dinner peak · 7 PM</span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-space-2xs h-28">
                {HOURS.map((item) => (
                  <div className="flex-1 flex flex-col items-center gap-1" key={item.hour}>
                    <div className="w-full flex items-end justify-center h-20">
                      <div
                        className={`w-full rounded-t-sm ${
                          item.pct === 100 ? 'bg-primary' : item.pct >= 70 ? 'bg-primary/55' : 'bg-primary/25'
                        }`}
                        style={{ height: `${item.pct}%` }}
                      />
                    </div>
                    <span className="font-caption text-caption text-text-tertiary">{item.hour}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-space-xs pt-space-xs border-t border-border-subtle">
                <span className="font-caption text-caption text-text-secondary">Busiest hour</span>
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">7–8 PM · 96 tickets</span>
              </div>
            </Panel>

            {/* Payment Tender Breakdown */}
            <Panel title="Payment Tender Breakdown" meta="₦3,480,250 settled across 4 methods">
              <div className="h-3 rounded-full overflow-hidden flex bg-surface-container-low mb-space-sm">
                {TENDERS.map((tender) => (
                  <div className={`h-full ${tender.bar}`} key={tender.name} style={{ width: `${tender.pct}%` }} />
                ))}
              </div>
              <div className="flex flex-col">
                {TENDERS.map((tender, index) => (
                  <div
                    className={`flex items-center justify-between gap-space-xs py-space-xs ${
                      index > 0 ? 'border-t border-border-subtle' : ''
                    }`}
                    key={tender.name}
                  >
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tender.bar}`} />
                      <span className="font-label-sm text-label-sm text-on-surface truncate">{tender.name}</span>
                    </div>
                    <div className="flex items-center gap-space-xs shrink-0">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">{tender.amount}</span>
                      <span className="font-caption text-caption text-text-tertiary w-9 text-right">
                        {tender.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* RIGHT COLUMN: Top Items & Staff Audit */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Top POS Items */}
            <Panel
              title="Top POS Items"
              meta="By net sales this period"
              action={
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1 hover:underline shrink-0"
                  type="button"
                  onClick={onOpenCatalog}
                >
                  <span>Edit recipes</span>
                  <Icon name="arrow_forward" className="text-[14px]" />
                </button>
              }
            >
              <div className="flex flex-col">
                {TOP_ITEMS.map((item, index) => (
                  <button
                    className={`flex items-center gap-space-sm py-space-xs text-left hover:bg-surface-container-low/40 transition-colors ${
                      index > 0 ? 'border-t border-border-subtle' : ''
                    }`}
                    key={item.name}
                    type="button"
                    onClick={() => showToast(`${item.name} — ${item.qty}`)}
                  >
                    <span className="w-5 font-label-md text-label-md text-text-tertiary font-bold text-center shrink-0">
                      {item.rank}
                    </span>
                    {item.image ? (
                      <img alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" src={item.image} />
                    ) : (
                      <span className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0 text-primary">
                        <Icon name={item.icon ?? 'restaurant'} className="text-[18px]" />
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block font-label-sm text-label-sm text-on-surface font-semibold truncate">
                        {item.name}
                      </span>
                      <span className="block font-caption text-caption text-text-tertiary">{item.qty}</span>
                    </span>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold shrink-0">
                      {item.amount}
                    </span>
                  </button>
                ))}
              </div>
              <button
                className="w-full h-10 mt-space-sm rounded-xl border border-border-subtle bg-surface-container-low font-label-sm text-label-sm text-primary font-semibold flex items-center justify-center gap-space-2xs hover:bg-surface-tint-blue transition-all active:scale-95"
                type="button"
                onClick={onOpenCatalog}
              >
                <span>Open catalogue &amp; recipes</span>
                <Icon name="arrow_forward" className="text-[15px]" />
              </button>
            </Panel>

            {/* Staff Cashier Audit */}
            <Panel title="Staff Cashier Audit" meta="Per-till performance & PIN tracking">
              <div className="flex flex-col gap-space-sm">
                {STAFF.map((person) => (
                  <div className="flex flex-col gap-1" key={person.name}>
                    <div className="flex items-center justify-between gap-space-xs">
                      <div className="flex items-center gap-space-xs min-w-0">
                        <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                          {person.name}
                        </span>
                        <span className="font-caption text-caption text-text-tertiary shrink-0">{person.till}</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold shrink-0">
                        {person.sales}
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden flex-1">
                        <div className={`h-full rounded-full ${person.bar}`} style={{ width: `${person.pct}%` }} />
                      </div>
                      <span className="font-caption text-caption text-text-tertiary shrink-0">
                        {person.tickets} tickets
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-space-2xs bg-surface-tint-blue rounded-xl px-space-sm py-space-xs mt-space-sm">
                <Icon name="admin_panel_settings" className="text-primary text-[15px] shrink-0" />
                <span className="font-caption text-caption text-on-surface">
                  Manager PIN override used twice this week — review in permissions.
                </span>
              </div>
            </Panel>
          </div>
        </div>

        {/* Offline Resilience & Sync */}
        <div className="mt-space-lg rounded-2xl bg-gradient-to-br from-surface-tint-blue to-surface-canvas border border-primary/20 p-space-lg shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="flex items-start gap-space-sm max-w-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Icon name="cloud_done" className="text-[19px]" />
              </div>
              <div className="flex flex-col min-w-0 gap-1">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                  Offline Resilience &amp; Sync
                </span>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Tickets queue locally when the till drops offline, then reconcile with the cloud ledger.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm shrink-0">
              <div className="grid grid-cols-4 gap-space-xs">
                {SYNC_STATS.map((item) => (
                  <div
                    className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 px-space-sm text-center"
                    key={item.label}
                  >
                    <div className="font-label-md text-label-md text-text-primary font-bold">{item.value}</div>
                    <span className="font-caption text-caption text-text-tertiary">{item.label}</span>
                  </div>
                ))}
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-all hover:bg-surface-tint"
                type="button"
                onClick={onOpenSync}
              >
                <Icon name="sync" className="text-[18px]" />
                <span>Open Sync Log</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm">
          <div className="bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-space-md py-space-xs rounded-full shadow-lg flex items-center gap-space-2xs">
            <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AnalyticsShell>
  );
}
