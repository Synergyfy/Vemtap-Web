import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import type { BoostTabKey } from '../../components/BoostTabBar';

interface DesktopBoostMetricsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
  onTab: (key: BoostTabKey) => void;
}

const MODULE_TABS: { key: BoostTabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'boost', label: 'Boost Studio' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'wallet', label: 'Wallet' },
];

interface PulseCard {
  key: string;
  label: string;
  icon: string;
  iconBox: string;
  value: string;
  valueSuffix?: string;
  sub: string;
  subClass?: string;
  progress?: { pct: number; label: string; right: string; rightClass: string };
  box?: { label: string; value: string };
  trend?: string;
  chip?: string;
}

const KPIS: PulseCard[] = [
  {
    key: 'spend',
    label: 'Total Spend',
    icon: 'payments',
    iconBox: 'bg-surface-container text-primary',
    value: '₦12,450',
    sub: 'Budget: ₦20,000',
    progress: {
      pct: 62,
      label: '62% consumed',
      right: '₦7,550 left',
      rightClass: 'text-badge-discount-text font-medium',
    },
  },
  {
    key: 'redemptions',
    label: 'Redemptions',
    icon: 'point_of_sale',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
    value: '64',
    valueSuffix: 'Diners',
    sub: 'POS Verified',
    subClass: 'text-badge-discount-text font-medium',
    box: { label: 'Gross Revenue', value: '₦614,400' },
  },
  {
    key: 'reach',
    label: 'Total Reach',
    icon: 'groups',
    iconBox: 'bg-surface-tint-blue text-primary',
    value: '10,840',
    sub: 'Unique Diners',
    trend: '+14.2% vs previous run',
  },
  {
    key: 'cost',
    label: 'Cost / Claim',
    icon: 'price_check',
    iconBox: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    value: '₦194.50',
    sub: 'Local Avg: ₦280',
    chip: '30% Cheaper',
  },
];

const FUNNEL_STAGES = [
  { label: 'Feed Impressions', value: '10,840', pct: '100%', width: 100, bar: 'bg-primary-container', dot: 'bg-primary-container', indent: '' },
  { label: 'Card Taps & Views', value: '4,920', pct: '45.4%', width: 45.4, bar: 'bg-primary', icon: 'arrow_forward', indent: 'pl-2' },
  { label: 'Saves & Shares', value: '1,210', pct: '11.2%', width: 11.2, bar: 'bg-secondary', icon: 'bookmark', indent: 'pl-4' },
  { label: 'Vouchers Claimed', value: '186', pct: '1.7%', width: 5.8, bar: 'bg-tertiary-container', icon: 'confirmation_number', iconClass: 'text-tertiary-container', indent: 'pl-6' },
];

const RHYTHM = [
  { label: 'Fri AM', views: 40, claims: 15 },
  { label: 'Fri PM', views: 65, claims: 38 },
  { label: 'Sat 1:30', views: 95, claims: 85, peak: true },
  { label: 'Sat PM', views: 55, claims: 30 },
  { label: 'Sun PM', views: 70, claims: 45 },
  { label: 'Sun Eve', views: 35, claims: 20 },
];

const CLUSTERS = [
  {
    key: 'wuse',
    name: 'Wuse II',
    meta: '(Admiralty / Aminu Kano)',
    pct: 58,
    bar: 'bg-primary',
    dot: 'bg-primary',
    diners: '37 in-store diners',
    note: 'High Foot-Traffic Core',
    noteClass: 'text-badge-discount-text font-medium',
    noteIcon: 'store',
  },
  {
    key: 'maitama',
    name: 'Maitama Heights',
    meta: undefined,
    pct: 28,
    bar: 'bg-secondary',
    dot: 'bg-secondary',
    diners: '18 in-store diners',
    note: 'Higher average ticket value',
  },
  {
    key: 'cbd',
    name: 'Central Business District',
    meta: undefined,
    pct: 14,
    bar: 'bg-surface-tint',
    dot: 'bg-surface-tint',
    diners: '9 in-store diners',
    note: 'Weekday corporate lunch traction',
  },
];

export function DesktopBoostMetricsScreen({ onNav, onBack, onTab }: DesktopBoostMetricsScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  return (
    <BusinessPortalChrome activeNav="overview" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        {/* Back link + Boost module tabs (desktop replacement for the mobile tab bar) */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Boost Hub</span>
          </button>
          <div className="flex items-center gap-space-2xs bg-surface-container p-space-2xs rounded-xl">
            {MODULE_TABS.map((tab) => {
              const active = tab.key === 'metrics';
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onTab(tab.key)}
                  className={`px-space-sm py-1.5 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-medium tracking-wide uppercase">
                Campaign Analytics • Deep-Dive
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="font-caption text-caption text-text-tertiary">ID: #BST-8842</span>
              <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                20% OFF
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Boost Performance</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Active Campaign • Gourmet Bites Bistro
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              onClick={() => showToast('Report export options opened')}
              className="px-space-lg h-[46px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
            >
              <Icon name="ios_share" className="text-[20px]" />
              <span>Share / Export Report</span>
            </button>
          </div>
        </section>

        {/* Campaign identity card */}
        <section className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                <Icon className="text-[14px]" name="local_offer" /> 20% OFF
              </span>
              <span className="font-caption text-caption text-text-tertiary">ID: #BST-8842</span>
            </div>
            <h2 className="font-heading-md text-heading-md text-text-primary">Prime Lunch Combo</h2>
            <p className="font-body-md text-body-md text-text-secondary">Active Campaign • Gourmet Bites Bistro</p>
          </div>
          <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center gap-space-xs lg:max-w-md">
            <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </div>
            <p className="font-label-sm text-label-sm text-primary font-medium tracking-tight">
              Campaign Active • Day 3 of 5 • Ending in 2 days (Oct 23)
            </p>
          </div>
        </section>

        {/* Executive pulse bento */}
        <section className="flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <Icon name="monitoring" className="text-primary text-[20px]" />
              <h2 className="font-heading-md text-heading-md text-text-primary">Executive Pulse</h2>
            </div>
            <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
              <Icon className="text-[14px]" name="sync" /> Real-Time POS Sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {KPIS.map((kpi) => (
              <div
                className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col justify-between gap-space-sm"
                key={kpi.key}
              >
                <div className="flex flex-col gap-space-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary">{kpi.label}</span>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${kpi.iconBox}`}>
                      <Icon className="text-[16px]" name={kpi.icon} />
                    </span>
                  </div>
                  <div className="font-heading-md text-heading-md text-text-primary">
                    {kpi.value}{' '}
                    {kpi.valueSuffix && (
                      <span className="font-body-md text-body-md text-text-secondary">{kpi.valueSuffix}</span>
                    )}
                  </div>
                  <div className={`font-caption text-caption ${kpi.subClass ?? 'text-text-tertiary'}`}>{kpi.sub}</div>
                </div>

                {kpi.progress && (
                  <div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-container h-full rounded-full transition-all duration-700"
                        style={{ width: `${kpi.progress.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-caption text-caption text-text-secondary">{kpi.progress.label}</span>
                      <span className={`font-caption text-caption ${kpi.progress.rightClass}`}>
                        {kpi.progress.right}
                      </span>
                    </div>
                  </div>
                )}

                {kpi.box && (
                  <div className="bg-surface-container-low p-space-xs rounded-lg">
                    <span className="font-caption text-caption text-text-secondary block">{kpi.box.label}</span>
                    <span className="font-label-md text-label-md text-text-primary font-bold">{kpi.box.value}</span>
                  </div>
                )}

                {kpi.trend && (
                  <div className="flex items-center gap-1 text-badge-discount-text font-caption text-caption">
                    <Icon className="text-[14px]" name="trending_up" />
                    <span>{kpi.trend}</span>
                  </div>
                )}

                {kpi.chip && (
                  <div className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                    <Icon className="text-[14px]" name="verified_user" /> {kpi.chip}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Conversion funnel */}
          <section className="lg:col-span-7 bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Conversion Funnel</h2>
                <p className="font-caption text-caption text-text-secondary">End-to-end diner acquisition journey</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary">
                <Icon className="text-[18px]" name="filter_center_focus" />
              </span>
            </div>

            <div className="space-y-space-md">
              {FUNNEL_STAGES.map((stage) => (
                <div className={`space-y-1 ${stage.indent}`} key={stage.label}>
                  <div className="flex justify-between items-center text-label-sm font-label-sm gap-2">
                    <span className="text-text-primary flex items-center gap-1.5 font-medium min-w-0">
                      {stage.icon ? (
                        <Icon className={`text-[14px] ${stage.iconClass ?? 'text-text-tertiary'}`} name={stage.icon} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-primary-container shrink-0" />
                      )}
                      <span className="truncate">{stage.label}</span>
                    </span>
                    <span className="text-text-primary font-semibold shrink-0">
                      {stage.value}{' '}
                      <span className="font-caption text-caption text-text-tertiary font-normal">({stage.pct})</span>
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stage.bar}`} style={{ width: `${stage.width}%` }} />
                  </div>
                </div>
              ))}

              {/* POS climax stage */}
              <div className="space-y-1.5 pl-6 pt-2">
                <div className="bg-surface-tint-blue rounded-xl p-space-md">
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <span className="font-label-md text-label-md font-semibold flex items-center gap-1.5 text-primary min-w-0">
                      <Icon className="text-[18px] shrink-0" name="verified" />
                      <span className="truncate">Verified POS Visits</span>
                    </span>
                    <span className="text-primary font-heading-sm text-heading-sm font-bold shrink-0">
                      64 Redemptions
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-badge-discount-text h-full rounded-full" style={{ width: '34.4%' }} />
                  </div>
                  <div className="flex items-center justify-between text-caption font-caption text-badge-discount-text font-medium gap-2">
                    <span>34.4% of claimed digital vouchers walked into your bistro!</span>
                    <Icon className="text-[16px] shrink-0" name="celebration" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-md p-space-sm bg-surface-subtle rounded-xl flex items-start gap-2.5">
              <Icon className="text-[18px] text-text-secondary mt-0.5 shrink-0" name="qr_code_scanner" />
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                <span className="font-semibold text-text-primary">Strict Factual Attribution:</span> Verified via
                real-time cashier barcode scanner on Till #01 &amp; #02. No simulated projections.
              </p>
            </div>
          </section>

          {/* Traction rhythm */}
          <section className="lg:col-span-5 bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Traction Rhythm</h2>
                <p className="font-caption text-caption text-text-secondary">Impressions vs. Redemptions</p>
              </div>
              <div className="flex items-center gap-2 font-caption text-caption">
                <span className="flex items-center gap-1 text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" /> Views
                </span>
                <span className="flex items-center gap-1 text-primary font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Claims
                </span>
              </div>
            </div>

            <div className="w-full h-44 flex items-end justify-between gap-2 pt-4 pb-2 px-1">
              {RHYTHM.map((slot) => (
                <div
                  className={`flex-1 flex flex-col items-center gap-1 h-full justify-end ${
                    slot.peak ? 'bg-surface-tint-blue rounded-lg py-1 px-0.5' : ''
                  }`}
                  key={slot.label}
                >
                  {slot.peak && (
                    <span className="bg-primary text-on-primary font-caption text-caption px-1.5 py-0.5 rounded text-[10px] font-bold">
                      PEAK
                    </span>
                  )}
                  <div className={`w-full flex items-end justify-center gap-1 ${slot.peak ? 'h-20' : 'h-24'}`}>
                    <div
                      className={`${slot.peak ? 'w-3 bg-primary-fixed-dim' : 'w-2.5 bg-surface-container-highest'} rounded-t-sm`}
                      style={{ height: `${slot.views}%` }}
                    />
                    <div className="w-3 bg-primary rounded-t-sm" style={{ height: `${slot.claims}%` }} />
                  </div>
                  <span
                    className={`font-caption text-caption ${slot.peak ? 'text-primary font-bold' : 'text-text-tertiary'}`}
                  >
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-space-md bg-surface-subtle p-space-sm rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon className="text-[18px]" name="restaurant" />
                </span>
                <div className="min-w-0">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary block truncate">
                    Peak Velocity: Saturday 1:30 PM
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    28 redemptions during the weekend lunch rush
                  </span>
                </div>
              </div>
              <span className="font-label-md text-label-md font-bold text-primary shrink-0">43.7%</span>
            </div>
          </section>

          {/* Geofence breakdown */}
          <section className="lg:col-span-7 bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Geofence Breakdown</h2>
                <p className="font-caption text-caption text-text-secondary">Top performing postal clusters in Abuja</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <Icon className="text-[18px]" name="distance" />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
              {CLUSTERS.map((cluster) => (
                <div className="bg-surface-subtle p-space-sm rounded-xl" key={cluster.key}>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${cluster.dot}`} />
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {cluster.name}
                      </span>
                    </div>
                    <span className="font-label-md text-label-md text-text-primary font-bold shrink-0">
                      {cluster.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-1.5">
                    <div className={`h-full rounded-full ${cluster.bar}`} style={{ width: `${cluster.pct}%` }} />
                  </div>
                  <div className="flex flex-col gap-1 text-caption font-caption text-text-secondary">
                    {cluster.meta && <span className="text-text-tertiary">{cluster.meta}</span>}
                    <span>{cluster.diners}</span>
                    <span className={`flex items-center gap-0.5 ${cluster.noteClass ?? 'text-text-secondary'}`}>
                      {cluster.noteIcon && <Icon className="text-[12px]" name={cluster.noteIcon} />}
                      {cluster.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* In-flight optimization */}
          <section className="lg:col-span-5 bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
            <h2 className="font-heading-sm text-heading-sm text-text-primary mb-space-2xs">
              In-Flight Optimization
            </h2>
            <p className="font-caption text-caption text-text-secondary mb-space-md">
              Adjust budget, pause pacing, or settle remaining funds.
            </p>
            <div className="flex flex-col gap-space-sm">
              <button
                className="h-11 w-full bg-primary-container text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
                type="button"
                onClick={() => showToast('₦10,000 added — campaign extended by 2 days')}
              >
                <Icon className="text-[20px]" name="bolt" />
                <span>Add ₦10,000 Budget • Extend 2 Days</span>
              </button>
              <button
                className="h-11 w-full bg-surface-container-low text-text-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container active:scale-[0.98] transition-all"
                type="button"
                onClick={() => showToast('Campaign pacing paused')}
              >
                <Icon className="text-[18px]" name="pause_circle" />
                <span>Pause Campaign Pacing</span>
              </button>
              <div className="pt-space-sm text-center">
                <button
                  className="font-caption text-caption text-error hover:underline inline-flex items-center gap-1 active:opacity-75 transition-opacity"
                  type="button"
                  onClick={() => showToast('Campaign ended — ₦7,550 refunded to your Boost Wallet')}
                >
                  <Icon className="text-[15px]" name="cancel" />
                  <span>End Campaign &amp; Refund Unspent ₦7,550 to Wallet</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-xl font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon className="text-badge-discount-text text-[18px]" name="check_circle" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
