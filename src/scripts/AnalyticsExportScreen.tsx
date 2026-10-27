import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { runExportCenter } from '../utils/exportCenter';
import { downloadBase64 } from '../utils/exportCsv';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { businessAnalyticsService, type ExportModule } from '../services/businessAnalyticsService';
import { analyticsRange } from '../hooks/business/useBusinessAnalytics';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { periodLabel, useAnalyticsFilter } from './analyticsLive';

interface AnalyticsExportScreenProps {
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

/**
 * The screen's module keys vs the backend's report sections: sales/inventory
 * both draw on `overview` (top items cover units sold), and staff spans the
 * POS cashier table plus the supervisor audit log.
 */
const MODULE_SECTIONS: Record<string, ExportModule[]> = {
  sales: ['overview'],
  customers: ['customers'],
  deals: ['deals'],
  locations: ['locations'],
  inventory: ['overview'],
  staff: ['pos', 'audit'],
};

const toSections = (keys: string[]) => [...new Set(keys.flatMap((key) => MODULE_SECTIONS[key] ?? []))];

function Row({
  children,
  className = '',
  first = false,
}: {
  children: ReactNode;
  className?: string;
  first?: boolean;
}) {
  return (
    <div className={`px-space-sm py-space-xs ${first ? '' : 'border-t border-border-subtle'} ${className}`}>
      {children}
    </div>
  );
}

export function AnalyticsExportScreen({ onBack }: AnalyticsExportScreenProps) {
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
  const [toast, setToast] = useState<string | null>(null);
  const stateTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  const live = hasApiConfig();
  const filter = useAnalyticsFilter();
  const { branches } = useBusinessBranch();
  const branchLabel = filter.branchId
    ? (branches.find((branch) => branch.id === filter.branchId)?.name ?? 'All locations')
    : 'All locations';

  useEffect(
    () => () => {
      if (stateTimer.current !== null) window.clearTimeout(stateTimer.current);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const selectedCount = MODULES.filter((module) => checked[module.key]).length;
  const allSelected = selectedCount === MODULES.length;

  const toggleAll = () => {
    const next = !allSelected;
    setChecked(Object.fromEntries(MODULES.map((module) => [module.key, next])));
  };

  const selectedKeys = MODULES.filter((module) => checked[module.key]).map((module) => module.key as string);

  const generate = () => {
    if (state !== 'idle' || selectedCount === 0) return;
    setState('loading');

    if (!live) {
      stateTimer.current = window.setTimeout(() => {
        runExportCenter({
          format,
          selectedKeys,
          timeframe: 'Sep 10 – Oct 10, 2026',
          branchFilter: 'All Locations (3)',
        });
        setState('done');
        resetTimer.current = window.setTimeout(() => setState('idle'), 2600);
      }, 1400);
      return;
    }

    businessAnalyticsService
      .export({
        format,
        modules: toSections(selectedKeys),
        ...analyticsRange(filter.days),
        branchId: filter.branchId ?? undefined,
      })
      .then((file) => {
        downloadBase64(file.filename, file.mimeType, file.contentBase64);
        setState('done');
        resetTimer.current = window.setTimeout(() => setState('idle'), 2600);
      })
      .catch((error: unknown) => {
        showToast(apiErrorMessage(error, 'Could not generate the report.'));
        setState('idle');
      });
  };

  const buttonLabel =
    state === 'loading' ? 'Generating file…' : state === 'done' ? 'Report Dispatched!' : 'Generate Analytics Report';

  return (
    <AppScreen>
      {/* Stack header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <button
            aria-label="Close export report"
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="close" className="text-[22px]" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Export Report</span>
            <span className="font-caption text-caption text-text-secondary">VEMTAP Intelligence</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-space-xl px-margin pt-space-sm pb-10">
        {/* Scope snapshot */}
        <section className="flex flex-col gap-space-sm">
          <div className="bg-surface-canvas rounded-2xl border border-border-subtle overflow-hidden">
            <div className="px-space-sm py-space-xs bg-surface-container-low flex items-center gap-space-2xs">
              <Icon name="task" className="text-primary text-[15px]" />
              <span className="font-label-md text-label-md text-on-surface font-semibold">Report Scope</span>
            </div>
            <Row first>
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-caption text-caption text-text-secondary">Timeframe</span>
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                  {live ? periodLabel(filter) : 'Sep 10 – Oct 10, 2026'}
                </span>
              </div>
            </Row>
            <Row>
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-caption text-caption text-text-secondary">Branch filter</span>
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                  {live ? branchLabel : 'All Locations (3)'}
                </span>
              </div>
            </Row>
            <div className="px-space-sm py-space-xs border-t border-border-subtle flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary">Estimated volume</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                {live ? `${selectedCount} of ${MODULES.length} modules` : '512 orders · 1,482 customers'}
              </span>
            </div>
          </div>
        </section>

        {/* Format */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-2xs px-space-2xs">
            <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Export Format</h2>
          </div>
          <div className="flex flex-col gap-space-xs">
            {FORMATS.map((item) => {
              const active = format === item.key;
              return (
                <button
                  aria-pressed={active}
                  className={`relative w-full text-left rounded-2xl border p-space-sm flex items-start gap-space-sm transition-all active:scale-[0.99] ${
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
                    <span className="font-caption text-caption text-text-secondary leading-relaxed">{item.desc}</span>
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

        {/* Modules */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between gap-space-xs px-space-2xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Report Modules</h2>
              <span className="font-caption text-caption text-text-secondary shrink-0">
                {selectedCount} of {MODULES.length}
              </span>
            </div>
            <button
              className="font-label-sm text-label-sm text-primary font-semibold shrink-0"
              type="button"
              onClick={toggleAll}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="bg-surface-canvas rounded-2xl border border-border-subtle overflow-hidden">
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
                    <span className="block font-caption text-caption text-text-tertiary truncate">{module.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Delivery */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-2xs px-space-2xs">
            <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Delivery Method</h2>
          </div>
          <div className="flex gap-space-xs">
            {DELIVERY.map((item) => {
              const active = delivery === item.key;
              return (
                <button
                  aria-pressed={active}
                  className={`flex-1 h-11 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
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

        {/* Generate */}
        <section className="flex flex-col gap-space-sm">
          <button
            className={`w-full h-11 rounded-xl font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-all ${
              state === 'done'
                ? 'bg-badge-discount-bg text-badge-discount-text'
                : state === 'loading'
                  ? 'bg-primary/70 text-on-primary'
                  : selectedCount === 0
                    ? 'bg-surface-container-high text-text-tertiary'
                    : 'bg-primary text-on-primary'
            }`}
            disabled={state !== 'idle' || selectedCount === 0}
            type="button"
            onClick={generate}
          >
            {state === 'loading' && <Icon name="progress_activity" className="text-[18px] animate-spin" />}
            {state === 'done' && <Icon name="check_circle" className="text-[18px]" />}
            {state === 'idle' && <Icon name="file_download" className="text-[18px]" />}
            <span>{buttonLabel}</span>
          </button>
          <div className="flex items-start gap-space-2xs px-space-2xs">
            <Icon name="lock" className="text-text-tertiary text-[14px] mt-0.5 shrink-0" />
            <p className="font-caption text-caption text-text-tertiary leading-relaxed">
              NDPR compliant — exports expire after 24 hours and never include card BIN or PIN data.
            </p>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-32px)]">
          <div className="bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-space-md py-space-xs rounded-full shadow-lg flex items-center gap-space-2xs whitespace-nowrap">
            <Icon name="error" className="text-[16px] text-badge-discount-text" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
