import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { AnalyticsShell } from './AnalyticsShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopAnalyticsExportScreenProps {
  onNav?: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
}

const FORMATS = [
  {
    key: 'csv',
    icon: 'table_chart',
    title: 'CSV Dataset',
    desc: 'Row-level data for spreadsheets and BI tools. Best for pivots.',
    meta: '240 KB · 512 rows',
  },
  {
    key: 'pdf',
    icon: 'picture_as_pdf',
    title: 'PDF Summary',
    desc: 'Formatted report with charts, headers and footnotes.',
    meta: '8 pages · 1.4 MB',
  },
] as const;

const MODULES = [
  { key: 'sales', label: 'Revenue & Sales', desc: 'Orders, tender splits, refunds' },
  { key: 'customers', label: 'Customer Metrics', desc: 'Cohorts, retention, segments' },
  { key: 'deals', label: 'Deals & Vouchers', desc: 'Claims, redemptions, campaign ROI' },
  { key: 'locations', label: 'Location Performance', desc: 'Branch share, discovery, heatmap' },
  { key: 'inventory', label: 'Inventory & Items', desc: 'Units sold, stock movement, 86d items' },
  { key: 'staff', label: 'Staff & Shifts', desc: 'Cashier totals, PIN overrides (Manager only)' },
] as const;

const DELIVERY = [
  { key: 'download', icon: 'download', label: 'Download now' },
  { key: 'email', icon: 'mail', label: 'Email link' },
  { key: 'slack', icon: 'send_to_mobile', label: 'Share to device' },
] as const;

type ExportState = 'idle' | 'loading' | 'done';

function ScopeRow({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  return (
    <div
      className={`px-space-sm py-space-xs flex items-center justify-between gap-space-xs ${
        first ? '' : 'border-t border-border-subtle'
      }`}
    >
      <span className="font-caption text-caption text-text-secondary">{label}</span>
      <span className="font-label-sm text-label-sm text-text-primary font-semibold text-right">{value}</span>
    </div>
  );
}

export function DesktopAnalyticsExportScreen({ onNav, onBack }: DesktopAnalyticsExportScreenProps) {
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [checked, setChecked] = useState<Record<string, boolean>>({
    sales: true,
    customers: true,
    deals: true,
    locations: true,
    inventory: true,
    staff: false,
  });
  const [delivery, setDelivery] = useState<string>('download');
  const [state, setState] = useState<ExportState>('idle');
  const stateTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      if (stateTimer.current !== null) window.clearTimeout(stateTimer.current);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const selectedCount = MODULES.filter((module) => checked[module.key]).length;
  const allSelected = selectedCount === MODULES.length;

  const toggleAll = () => {
    const next = !allSelected;
    setChecked(Object.fromEntries(MODULES.map((module) => [module.key, next])));
  };

  const generate = () => {
    if (state !== 'idle' || selectedCount === 0) return;
    setState('loading');
    stateTimer.current = window.setTimeout(() => {
      setState('done');
      resetTimer.current = window.setTimeout(() => setState('idle'), 2600);
    }, 1400);
  };

  const buttonLabel =
    state === 'loading' ? 'Generating file…' : state === 'done' ? 'Report Dispatched!' : 'Generate Analytics Report';

  const runButtonClass =
    state === 'done'
      ? 'bg-badge-discount-bg text-badge-discount-text'
      : state === 'loading'
        ? 'bg-primary/70 text-on-primary'
        : selectedCount === 0
          ? 'bg-surface-container-high text-text-tertiary'
          : 'bg-primary text-on-primary hover:bg-primary-container shadow-md hover:shadow-lg';

  const formatLabel = format === 'pdf' ? 'PDF Summary' : 'CSV Dataset';
  const deliveryLabel = DELIVERY.find((item) => item.key === delivery)?.label ?? 'Download now';

  return (
    <AnalyticsShell activeNav="analytics" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        {/* Back link + compliance ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Analytics</span>
          </button>
          <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
            <Icon name="verified_user" className="text-[14px]" />
            <span>NDPR Compliant • Files expire after 24 hours</span>
          </span>
        </div>

        {/* Page header: eyebrow, title, supporting sentence, right-side action cluster */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
              Export Center • VEMTAP Intelligence
            </span>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Export Report</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Configure the snapshot scope, pick a format, choose the report modules and delivery method, then generate
              a compliance-safe file for spreadsheets, BI tools or stakeholders.
            </p>
          </div>

          <div className="flex items-center gap-space-xs flex-shrink-0">
            <span className="hidden sm:inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
              <Icon name="check_circle" className="text-[14px]" />
              <span>
                {selectedCount} of {MODULES.length} modules ready
              </span>
            </span>
            <button
              type="button"
              disabled={state !== 'idle' || selectedCount === 0}
              onClick={generate}
              className={`h-[42px] px-space-md rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-2xs transition-all active:scale-[0.98] disabled:cursor-not-allowed ${runButtonClass}`}
            >
              {state === 'loading' && <Icon name="progress_activity" className="text-[18px] animate-spin" />}
              {state === 'done' && <Icon name="check_circle" className="text-[18px]" />}
              {state === 'idle' && <Icon name="file_download" className="text-[18px]" />}
              <span>{buttonLabel}</span>
            </button>
          </div>
        </section>

        {/* Configuration (left) + sticky export summary (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-lg items-start">
          {/* LEFT: format / modules / delivery configuration */}
          <div className="flex flex-col gap-space-lg min-w-0">
            {/* Export Format */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <Icon name="import_export" className="text-primary text-[18px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Export Format</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                {FORMATS.map((item) => {
                  const active = format === item.key;
                  return (
                    <button
                      aria-pressed={active}
                      className={`relative w-full text-left rounded-xl border p-space-sm flex items-start gap-space-sm transition-all hover:shadow-sm active:scale-[0.99] ${
                        active
                          ? 'border-primary bg-surface-tint-blue/50 shadow-sm'
                          : 'border-border-subtle bg-surface-canvas'
                      }`}
                      key={item.key}
                      type="button"
                      onClick={() => setFormat(item.key)}
                    >
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-text-secondary'
                        }`}
                      >
                        <Icon name={item.icon} className="text-[18px]" />
                      </span>
                      <span className="flex-1 min-w-0 flex flex-col gap-0.5 pr-8">
                        <span className="font-body-lg text-body-lg font-semibold text-on-surface">{item.title}</span>
                        <span className="font-caption text-caption text-text-secondary leading-relaxed">
                          {item.desc}
                        </span>
                        <span className="font-caption text-caption text-text-tertiary">{item.meta}</span>
                      </span>
                      <span
                        className={`absolute right-space-sm top-space-sm w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          active ? 'border-primary bg-primary' : 'border-outline-variant'
                        }`}
                      >
                        {active && <Icon name="check" className="text-on-primary text-[13px]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Report Modules */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="dashboard" className="text-primary text-[18px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Report Modules</h2>
                  <span className="font-caption text-caption text-text-secondary shrink-0">
                    {selectedCount} of {MODULES.length}
                  </span>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold shrink-0 hover:underline"
                  type="button"
                  onClick={toggleAll}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border border-border-subtle rounded-xl overflow-hidden">
                {MODULES.map((module, index) => {
                  const active = checked[module.key];
                  return (
                    <button
                      aria-pressed={active}
                      className={`w-full text-left px-space-sm py-space-xs flex items-center gap-space-sm hover:bg-surface-container-low/40 transition-colors ${
                        index > 0 ? 'border-t border-border-subtle' : ''
                      }`}
                      key={module.key}
                      type="button"
                      onClick={() => setChecked((current) => ({ ...current, [module.key]: !current[module.key] }))}
                    >
                      <span
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          active ? 'border-primary bg-primary' : 'border-outline-variant bg-surface-canvas'
                        }`}
                      >
                        {active && <Icon name="check" className="text-on-primary text-[13px]" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-label-sm text-label-sm text-on-surface font-semibold truncate">
                          {module.label}
                        </span>
                        <span className="block font-caption text-caption text-text-tertiary truncate">
                          {module.desc}
                        </span>
                      </span>
                      <span className="font-caption text-caption text-text-tertiary shrink-0">
                        {active ? 'Included' : 'Skipped'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Delivery Method */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <Icon name="send" className="text-primary text-[18px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Delivery Method</h2>
              </div>
              <div className="grid grid-cols-3 gap-space-sm">
                {DELIVERY.map((item) => {
                  const active = delivery === item.key;
                  return (
                    <button
                      aria-pressed={active}
                      className={`h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm active:scale-95 ${
                        active
                          ? 'border-primary bg-surface-tint-blue/50 text-primary'
                          : 'border-border-subtle bg-surface-canvas text-text-secondary'
                      }`}
                      key={item.key}
                      type="button"
                      onClick={() => setDelivery(item.key)}
                    >
                      <Icon name={item.icon} className="text-[18px]" />
                      <span className="font-caption text-caption font-semibold text-center leading-none">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT: sticky export summary + run export */}
          <aside className="flex flex-col gap-space-lg self-start lg:sticky lg:top-24 w-full">
            {/* Scope snapshot */}
            <div className="bg-surface-canvas rounded-xl border border-border-subtle overflow-hidden shadow-sm">
              <div className="px-space-sm py-space-xs bg-surface-container-low flex items-center gap-space-2xs">
                <Icon name="task" className="text-primary text-[15px]" />
                <span className="font-label-md text-label-md text-on-surface font-semibold">Report Scope</span>
              </div>
              <ScopeRow first label="Timeframe" value="Sep 10 – Oct 10, 2026" />
              <ScopeRow label="Branch filter" value="All Locations (3)" />
              <ScopeRow label="Estimated volume" value="512 orders · 1,482 customers" />
            </div>

            {/* Export summary + run export */}
            <div className="bg-surface-canvas rounded-xl border border-border-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-xs">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Export Summary</h2>
                  <p className="font-caption text-caption text-text-secondary">Review before generating</p>
                </div>
                <Icon name="summarize" className="text-text-tertiary text-[20px]" />
              </div>

              <div className="border border-border-subtle rounded-xl overflow-hidden">
                <ScopeRow first label="Format" value={formatLabel} />
                <ScopeRow
                  label="Modules"
                  value={`${selectedCount} of ${MODULES.length} selected`}
                />
                <ScopeRow label="Delivery" value={deliveryLabel} />
              </div>

              <button
                className={`w-full h-11 rounded-xl font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-all disabled:cursor-not-allowed ${runButtonClass}`}
                disabled={state !== 'idle' || selectedCount === 0}
                type="button"
                onClick={generate}
              >
                {state === 'loading' && <Icon name="progress_activity" className="text-[18px] animate-spin" />}
                {state === 'done' && <Icon name="check_circle" className="text-[18px]" />}
                {state === 'idle' && <Icon name="file_download" className="text-[18px]" />}
                <span>{buttonLabel}</span>
              </button>

              {/* Progress / state indicator */}
              <div className="flex items-start gap-space-2xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    state === 'done'
                      ? 'bg-badge-discount-text animate-pulse'
                      : state === 'loading'
                        ? 'bg-primary animate-pulse'
                        : 'bg-outline-variant'
                  }`}
                />
                <span
                  className={`font-caption text-caption leading-relaxed ${
                    state === 'done'
                      ? 'text-badge-discount-text font-semibold'
                      : state === 'loading'
                        ? 'text-primary font-semibold'
                        : 'text-text-tertiary'
                  }`}
                >
                  {state === 'done'
                    ? 'Report Dispatched! Delivered via your selected method.'
                    : state === 'loading'
                      ? 'Packaging modules and encrypting payload…'
                      : 'Idle — ready to generate when you are.'}
                </span>
              </div>

              <div className="flex items-start gap-space-2xs pt-space-xs border-t border-border-subtle">
                <Icon name="lock" className="text-text-tertiary text-[14px] mt-0.5 shrink-0" />
                <p className="font-caption text-caption text-text-tertiary leading-relaxed">
                  NDPR compliant — exports expire after 24 hours and never include card BIN or PIN data.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AnalyticsShell>
  );
}
