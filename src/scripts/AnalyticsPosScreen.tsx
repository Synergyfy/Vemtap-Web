import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { AnalyticsHeader, AnalyticsSection, type AnalyticsTabKey } from '../components/AnalyticsChrome';
import { PUBLIC_IMAGES } from './publicPosData';

interface AnalyticsPosScreenProps {
  onAnalyticsTab: (tab: AnalyticsTabKey) => void;
  onOpenFilter: () => void;
  onOpenExport: () => void;
  onTab: (tab: BusinessTabKey) => void;
  onOpenCatalog: () => void;
  onOpenSync: () => void;
}

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

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-md ${className}`}>
      {children}
    </div>
  );
}

export function AnalyticsPosScreen({
  onAnalyticsTab,
  onOpenFilter,
  onOpenExport,
  onTab,
  onOpenCatalog,
  onOpenSync,
}: AnalyticsPosScreenProps) {
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

  return (
    <AppScreen>
      <AnalyticsHeader active="pos" onTab={onAnalyticsTab} onOpenFilter={onOpenFilter} onOpenExport={onOpenExport} />

      <div className="flex flex-col gap-space-xl px-margin pt-space-sm pb-28">
        {/* Pulse bar */}
        <div className="flex items-center justify-between gap-space-xs bg-surface-container-low rounded-2xl px-space-sm py-space-xs">
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

        {/* Sales grid */}
        <div className="grid grid-cols-2 gap-space-xs">
          {SALES.map((item) => (
            <Card key={item.label}>
              <div className="flex items-center gap-1 text-primary">
                <Icon name={item.icon} className="text-[15px]" />
                <span className="font-caption text-caption text-text-secondary font-semibold truncate">
                  {item.label}
                </span>
              </div>
              <div className="font-heading-sm text-heading-sm text-text-primary font-bold mt-1">{item.value}</div>
              <span className="font-caption text-caption text-text-tertiary">{item.sub}</span>
            </Card>
          ))}
        </div>

        {/* Hourly rhythms */}
        <AnalyticsSection title="Hourly Rhythms" meta={`Peak window · ${cadence.toLowerCase()} cadence`}>
          <Card>
            <div className="flex gap-space-2xs bg-surface-container-low rounded-xl p-1 mb-space-sm">
              {CADENCES.map((item) => (
                <button
                  aria-pressed={cadence === item}
                  className={`h-7 flex-1 rounded-lg font-label-sm text-label-sm transition-colors ${
                    cadence === item ? 'bg-surface-canvas text-primary font-semibold shadow-sm' : 'text-text-secondary'
                  }`}
                  key={item}
                  type="button"
                  onClick={() => setCadence(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-space-xs mb-space-sm">
              <div className="bg-badge-discount-bg rounded-xl px-space-xs py-1.5">
                <div className="font-label-md text-label-md text-badge-discount-text font-bold">₦684k</div>
                <span className="font-caption text-caption text-badge-discount-text">Lunch peak · 1 PM</span>
              </div>
              <div className="bg-surface-tint-blue rounded-xl px-space-xs py-1.5">
                <div className="font-label-md text-label-md text-primary font-bold">₦812k</div>
                <span className="font-caption text-caption text-primary">Dinner peak · 7 PM</span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-[3px] h-28">
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
          </Card>
        </AnalyticsSection>

        {/* Payment tender */}
        <AnalyticsSection title="Payment Tender Breakdown" meta="₦3,480,250 settled across 4 methods">
          <Card>
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
                    <span className="font-caption text-caption text-text-tertiary w-9 text-right">{tender.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </AnalyticsSection>

        {/* Top items */}
        <AnalyticsSection
          title="Top POS Items"
          meta="By net sales this period"
          action={
            <button
              className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1"
              type="button"
              onClick={onOpenCatalog}
            >
              <span>Edit recipes</span>
              <Icon name="arrow_forward" className="text-[14px]" />
            </button>
          }
        >
          <Card>
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
              className="w-full h-10 mt-space-sm rounded-xl border border-border-subtle bg-surface-container-low font-label-sm text-label-sm text-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
              type="button"
              onClick={onOpenCatalog}
            >
              <span>Open catalogue &amp; recipes</span>
              <Icon name="arrow_forward" className="text-[15px]" />
            </button>
          </Card>
        </AnalyticsSection>

        {/* Staff audit */}
        <AnalyticsSection title="Staff Cashier Audit" meta="Per-till performance & PIN tracking">
          <Card>
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
          </Card>
        </AnalyticsSection>

        {/* Offline resilience */}
        <Card className="bg-gradient-to-br from-surface-tint-blue to-surface-canvas border-primary/20">
          <div className="flex items-start gap-space-sm">
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
          <div className="grid grid-cols-4 gap-space-xs mt-space-sm">
            {[
              { value: '18', label: 'Queued' },
              { value: '2s', label: 'Sync rate' },
              { value: '99.9%', label: 'Uptime' },
              { value: '0', label: 'Conflicts' },
            ].map((item) => (
              <div className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 text-center" key={item.label}>
                <div className="font-label-md text-label-md text-text-primary font-bold">{item.value}</div>
                <span className="font-caption text-caption text-text-tertiary">{item.label}</span>
              </div>
            ))}
          </div>
          <button
            className="w-full h-11 mt-space-sm rounded-xl bg-primary text-on-primary font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
            type="button"
            onClick={onOpenSync}
          >
            <Icon name="sync" className="text-[18px]" />
            <span>Open Sync Log</span>
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
