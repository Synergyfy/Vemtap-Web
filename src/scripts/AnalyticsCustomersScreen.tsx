import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { AnalyticsHeader, AnalyticsSection, type AnalyticsTabKey } from '../components/AnalyticsChrome';

interface AnalyticsCustomersScreenProps {
  onAnalyticsTab: (tab: AnalyticsTabKey) => void;
  onOpenFilter: () => void;
  onOpenExport: () => void;
  onTab: (tab: BusinessTabKey) => void;
}

const METRICS = [
  { label: 'Total Customers', value: '1,482', sub: '+218 this period', icon: 'group', iconClass: 'text-primary' },
  { label: 'Active Buyers', value: '512', sub: '34.6% of base', icon: 'shopping_bag', iconClass: 'text-secondary' },
  { label: 'New This Period', value: '218', sub: '+14.7% vs last', icon: 'person_add', iconClass: 'text-primary' },
  { label: 'Returning', value: '294', sub: '68.2% retention', icon: 'replay', iconClass: 'text-tertiary' },
];

const GROWTH_WEEKS = [
  { week: 'W1', fresh: 48, repeat: 62 },
  { week: 'W2', fresh: 56, repeat: 70 },
  { week: 'W3', fresh: 52, repeat: 78 },
  { week: 'W4', fresh: 62, repeat: 84 },
];

const TOUCHPOINTS = [
  { label: 'Menu QR Scans', value: '867', icon: 'qr_code_scanner' },
  { label: 'Profile Views', value: '14,280', icon: 'visibility' },
  { label: 'Deal Claims', value: '184', icon: 'confirmation_number' },
  { label: 'Completed Orders', value: '512', icon: 'receipt_long' },
  { label: 'Direct Messages', value: '94', icon: 'chat_bubble' },
  { label: 'Loyalty Points Used', value: '18,450', icon: 'stars' },
];

const CHANNELS = [
  { name: 'In-Store QR & POS', pct: 44, count: '652 customers', bar: 'bg-primary' },
  { name: 'Deals & Vouchers', pct: 28, count: '415 customers', bar: 'bg-badge-discount-text' },
  { name: 'Direct Storefront', pct: 16, count: '237 customers', bar: 'bg-secondary' },
  { name: 'Social Profile Link', pct: 8, count: '119 customers', bar: 'bg-tertiary' },
  { name: 'Referral Codes', pct: 4, count: '59 customers', bar: 'bg-surface-tint-blue' },
];

const SEGMENTS = [
  {
    icon: 'stars',
    iconClass: 'bg-tertiary-fixed text-tertiary',
    title: 'VIP Patrons (Top 5%)',
    meta: '92 patrons • ₦150k+ lifetime spend',
    badge: '₦13.8M rev',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    width: '88%',
    bar: 'bg-tertiary',
  },
  {
    icon: 'restaurant',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Regular Diners',
    meta: '482 patrons • 3–5 visits/month',
    badge: '26.1%',
    badgeClass: 'bg-primary-container text-on-primary-container',
    width: '62%',
    bar: 'bg-primary-container',
  },
  {
    icon: 'local_activity',
    iconClass: 'bg-surface-container text-secondary',
    title: 'Deal Explorers',
    meta: '640 patrons • 1–2 visits (voucher led)',
    badge: '34.7%',
    badgeClass: 'bg-surface-container-low text-text-secondary',
    width: '35%',
    bar: 'bg-secondary',
  },
  {
    icon: 'hourglass_empty',
    iconClass: 'bg-surface-container-high text-text-secondary',
    title: 'At Risk (60+ days quiet)',
    meta: '186 patrons • previously active',
    badge: '12.6%',
    badgeClass: 'bg-surface-container-low text-text-tertiary',
    width: '19%',
    bar: 'bg-text-tertiary',
  },
];

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-md ${className}`}>
      {children}
    </div>
  );
}

export function AnalyticsCustomersScreen({
  onAnalyticsTab,
  onOpenFilter,
  onOpenExport,
  onTab,
}: AnalyticsCustomersScreenProps) {
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
      <AnalyticsHeader active="customers" onTab={onAnalyticsTab} onOpenFilter={onOpenFilter} onOpenExport={onOpenExport} />

      <div className="flex flex-col gap-space-xl px-margin pt-space-sm pb-28">
        {/* Welcome strip */}
        <div className="flex items-center justify-between gap-space-xs bg-surface-container-low rounded-2xl px-space-sm py-space-xs">
          <div className="flex items-center gap-space-xs min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <Icon name="group" className="text-on-primary-container text-[16px]" />
            </div>
            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
              Customer intelligence
            </span>
          </div>
          <span className="flex items-center gap-1 font-caption text-caption font-semibold text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            Live CRM Sync
          </span>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-space-xs">
          {METRICS.map((item) => (
            <Card key={item.label}>
              <div className={`flex items-center gap-1 ${item.iconClass}`}>
                <Icon name={item.icon} className="text-[15px]" />
                <span className="font-caption text-caption font-semibold">{item.label}</span>
              </div>
              <div className="font-heading-md text-heading-md text-text-primary font-bold mt-1">{item.value}</div>
              <span className="font-caption text-caption text-text-tertiary">{item.sub}</span>
            </Card>
          ))}
        </div>

        {/* Inactive strip */}
        <Card className="flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-text-secondary">
              <Icon name="notifications_paused" className="text-[17px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface font-semibold">186 inactive customers</span>
              <span className="font-caption text-caption text-text-secondary">No visit in 60+ days</span>
            </div>
          </div>
          <button
            className="h-10 px-space-sm rounded-xl bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold shrink-0 active:scale-95 transition-transform"
            type="button"
            onClick={() => showToast('Re-engagement campaign queued for 186 customers')}
          >
            Re-engage
          </button>
        </Card>

        {/* Growth trend */}
        <AnalyticsSection title="Growth Trend" meta="New vs returning customers by week">
          <Card>
            <div className="flex items-end justify-between gap-space-sm h-32">
              {GROWTH_WEEKS.map((week) => (
                <div className="flex-1 flex flex-col items-center gap-1" key={week.week}>
                  <div className="w-full flex items-end justify-center gap-1 h-24">
                    <div className="w-3 rounded-t-md bg-primary" style={{ height: `${week.fresh}%` }} />
                    <div className="w-3 rounded-t-md bg-secondary" style={{ height: `${week.repeat}%` }} />
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{week.week}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-space-sm mt-space-xs pt-space-xs border-t border-border-subtle">
              <span className="flex items-center gap-1 font-caption text-caption text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary" />
                New
              </span>
              <span className="flex items-center gap-1 font-caption text-caption text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Returning
              </span>
            </div>
            <div className="mt-space-xs bg-surface-container-low rounded-xl px-space-sm py-space-xs font-caption text-caption text-text-secondary">
              <span className="text-text-primary font-semibold">W4 peak:</span> 62 new + 84 returning — your best week yet.
            </div>
          </Card>
        </AnalyticsSection>

        {/* Engagement touchpoints */}
        <AnalyticsSection title="Engagement Touchpoints" meta="Actions logged against customer profiles">
          <div className="grid grid-cols-2 gap-space-xs">
            {TOUCHPOINTS.map((item) => (
              <button
                className="bg-surface-canvas border border-border-subtle rounded-xl p-space-sm flex flex-col items-start gap-1 text-left active:scale-95 transition-transform"
                key={item.label}
                type="button"
                onClick={() => showToast(`${item.label}: ${item.value}`)}
              >
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name={item.icon} className="text-[16px]" />
                </div>
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{item.value}</span>
                <span className="font-caption text-caption text-text-secondary">{item.label}</span>
              </button>
            ))}
          </div>
        </AnalyticsSection>

        {/* Inbound channels */}
        <AnalyticsSection title="Inbound Channels" meta="How customers first found you">
          <Card>
            <div className="h-3 rounded-full overflow-hidden flex bg-surface-container-low mb-space-sm">
              {CHANNELS.map((channel) => (
                <div className={`h-full ${channel.bar}`} key={channel.name} style={{ width: `${channel.pct}%` }} />
              ))}
            </div>
            <div className="flex flex-col">
              {CHANNELS.map((channel, index) => (
                <div
                  className={`flex items-center justify-between gap-space-xs py-space-xs ${
                    index > 0 ? 'border-t border-border-subtle' : ''
                  }`}
                  key={channel.name}
                >
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${channel.bar}`} />
                    <span className="font-label-sm text-label-sm text-on-surface truncate">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <span className="font-caption text-caption text-text-tertiary">{channel.count}</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold w-9 text-right">
                      {channel.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </AnalyticsSection>

        {/* Retention */}
        <AnalyticsSection title="Retention & Frequency" meta="Repeat behaviour across the base">
          <Card>
            <div className="grid grid-cols-3 gap-space-xs text-center">
              <div className="flex flex-col gap-0.5">
                <span className="font-heading-md text-heading-md text-text-primary font-bold">218</span>
                <span className="font-caption text-caption text-text-secondary">Repeat buyers</span>
              </div>
              <div className="flex flex-col gap-0.5 border-x border-border-subtle">
                <span className="font-heading-md text-heading-md text-text-primary font-bold">68.2%</span>
                <span className="font-caption text-caption text-text-secondary">Retention</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading-md text-heading-md text-text-primary font-bold">2.4</span>
                <span className="font-caption text-caption text-text-secondary">Visits / month</span>
              </div>
            </div>
            <div className="mt-space-sm h-2 rounded-full bg-surface-container-low overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '68.2%' }} />
            </div>
            <p className="font-caption text-caption text-text-secondary mt-space-xs leading-relaxed">
              Customers acquired through deals return 1.7× more often than walk-ins within 30 days.
            </p>
          </Card>
        </AnalyticsSection>

        {/* Segments */}
        <AnalyticsSection title="Customer Segments" meta="Automatically classified profiles">
          <div className="flex flex-col gap-space-xs">
            {SEGMENTS.map((segment) => (
              <Card key={segment.title}>
                <div className="flex items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${segment.iconClass}`}>
                      <Icon name={segment.icon} className="text-[17px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-body-lg text-body-lg font-semibold text-on-surface truncate">
                        {segment.title}
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">{segment.meta}</span>
                    </div>
                  </div>
                  <span
                    className={`font-caption text-caption font-semibold px-2 py-0.5 rounded-full shrink-0 ${segment.badgeClass}`}
                  >
                    {segment.badge}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden mt-space-sm">
                  <div className={`h-full rounded-full ${segment.bar}`} style={{ width: segment.width }} />
                </div>
              </Card>
            ))}
          </div>
        </AnalyticsSection>

        {/* CRM handoff */}
        <Card className="bg-gradient-to-br from-surface-tint-blue to-surface-canvas border-primary/20">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <Icon name="hub" className="text-[19px]" />
            </div>
            <div className="flex flex-col min-w-0 gap-1">
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">Segment in your CRM</span>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Push these groups into messaging, loyalty tiers and deal targeting from the customers hub.
              </p>
            </div>
          </div>
          <button
            className="w-full h-11 mt-space-sm rounded-xl bg-primary text-on-primary font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
            type="button"
            onClick={() => onTab('business')}
          >
            <Icon name="contacts" className="text-[18px]" />
            <span>Open Customer Hub</span>
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
