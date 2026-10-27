import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { hasApiConfig } from '../services/api/client';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { presetDays, setAnalyticsFilter, useAnalyticsFilter } from './analyticsLive';

interface AnalyticsFilterScreenProps {
  onBack: () => void;
}

const DATE_PRESETS = ['Today', '7 Days', '30 Days', '90 Days', 'This Year', 'Custom'] as const;

const LOCATIONS = [
  { key: 'all', label: 'All Locations', meta: '3 outlets' },
  { key: 'wuse', label: 'Wuse Branch', meta: 'Wuse District' },
  { key: 'maitama', label: 'Maitama Heights', meta: 'Maitama District' },
  { key: 'garki', label: 'Garki Express', meta: 'Garki District' },
] as const;

const CONTEXT_TABS = [
  { key: 'deals', label: 'Deals', icon: 'local_offer' },
  { key: 'pos', label: 'POS', icon: 'point_of_sale' },
  { key: 'customers', label: 'Customers', icon: 'group' },
] as const;

const DEAL_STATUSES = ['Active', 'Scheduled', 'Expired', 'Draft'];
const CHANNELS = ['QR & POS', 'Storefront', 'Deals', 'Referral'];
const SETTLEMENTS = ['Card', 'Transfer', 'Cash', 'Voucher'];
const TILLS = ['Till #01', 'Till #02', 'Till #03', 'Mobile'];
const COHORTS = ['New customers', 'Returning', 'At risk', 'VIP'];

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-space-sm">
      <span className="font-label-md text-label-md text-text-secondary font-semibold px-space-2xs">{title}</span>
      {children}
    </div>
  );
}

function ChipRow({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-space-2xs">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            aria-pressed={active}
            className={`h-8 px-space-sm rounded-full font-label-sm text-label-sm transition-all active:scale-95 flex items-center gap-space-2xs ${
              active ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container-low text-text-secondary'
            }`}
            key={option}
            type="button"
            onClick={() => onToggle(option)}
          >
            {active && <Icon name="check" className="text-[13px]" />}
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

export function AnalyticsFilterScreen({ onBack }: AnalyticsFilterScreenProps) {
  const live = hasApiConfig();
  const filter = useAnalyticsFilter();
  const { branches, isLive } = useBusinessBranch();
  const [preset, setPreset] = useState<string>(filter.preset);
  const [location, setLocation] = useState<string>(filter.branchId ?? 'all');
  const [tab, setTab] = useState<string>('deals');
  const [dealStatuses, setDealStatuses] = useState<string[]>(['Active']);
  const [channels, setChannels] = useState<string[]>(['QR & POS', 'Storefront']);
  const [settlements, setSettlements] = useState<string[]>(['Card', 'Transfer']);
  const [tills, setTills] = useState<string[]>(['Till #01', 'Till #02']);
  const [cohort, setCohort] = useState<string>('all');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const applyTimer = useRef<number | null>(null);
  const revertTimer = useRef<number | null>(null);

  // Live businesses pick from their real branches; a configured business that
  // has not added any branch yet can only scope to "All". Sample branch keys
  // must never reach branch-scoped APIs (see BusinessBranchContext).
  const locationOptions = isLive
    ? [
        { key: 'all', label: 'All Locations', meta: `${branches.length} outlets` },
        // The provider only reports isLive when every branch carries an id.
        ...branches.filter((branch) => branch.id).map((branch) => ({
          key: branch.id as string,
          label: branch.name,
          meta: branch.area || (branch.isMainBranch ? 'Main branch' : 'Outlet'),
        })),
      ]
    : live
      ? [{ key: 'all', label: 'All Locations', meta: 'No branches yet' }]
      : LOCATIONS;

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (applyTimer.current !== null) window.clearTimeout(applyTimer.current);
      if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const toggleIn = (setter: (value: string[]) => void, current: string[], value: string) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const reset = () => {
    setPreset('30 Days');
    setLocation('all');
    setDealStatuses(['Active']);
    setChannels(['QR & POS', 'Storefront']);
    setSettlements(['Card', 'Transfer']);
    setTills(['Till #01', 'Till #02']);
    setCohort('all');
    setAnalyticsFilter({ preset: '30 Days', days: 30, branchId: null });
    showToast('Filters reset to defaults');
  };

  const apply = () => {
    if (applying || applied) return;
    setApplying(true);
    applyTimer.current = window.setTimeout(() => {
      setApplying(false);
      setApplied(true);
      // Persist the scope the analytics screens read: the preset and branch
      // drive every module's query (and the export's range) from here on.
      setAnalyticsFilter({ preset, days: presetDays(preset), branchId: location === 'all' ? null : location });
      showToast('Filters applied across analytics');
      revertTimer.current = window.setTimeout(() => setApplied(false), 2400);
    }, 900);
  };

  const applyLabel = applying ? 'Applying…' : applied ? 'Filters Applied' : 'Apply Filters';

  return (
    <AppScreen>
      {/* Stack header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <button
            aria-label="Close analytics filters"
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="close" className="text-[22px]" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Filters</span>
            <span className="font-caption text-caption text-text-secondary">Analytics scope</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-space-xl px-margin pt-space-sm pb-32">
        {/* Scope banner */}
        <div className="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-2xl px-space-sm py-space-xs">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name="tune" className="text-[16px]" />
            </span>
            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
              Analytics Scope
            </span>
          </div>
          <span className="flex items-center gap-1 font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            Live Active
          </span>
        </div>

        {/* Date range */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-2xs px-space-2xs">
            <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Preset Date Range</h2>
          </div>
          <div className="flex flex-wrap gap-space-2xs">
            {DATE_PRESETS.map((item) => {
              const active = preset === item;
              return (
                <button
                  aria-pressed={active}
                  className={`h-9 px-space-sm rounded-full font-label-sm text-label-sm transition-all active:scale-95 ${
                    active
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container-low text-text-secondary'
                  }`}
                  key={item}
                  type="button"
                  onClick={() => setPreset(item)}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="bg-surface-canvas rounded-2xl border border-border-subtle p-space-sm">
            <div className="flex items-center justify-between gap-space-xs mb-space-xs">
              <span className="font-label-md text-label-md text-text-secondary font-semibold">Custom Range</span>
              <Icon name="date_range" className="text-text-tertiary text-[17px]" />
            </div>
            <div className="grid grid-cols-2 gap-space-xs">
              <div className="bg-surface-container-low rounded-xl px-space-xs py-space-xs">
                <span className="block font-caption text-caption text-text-tertiary">Start</span>
                <span className="block font-label-sm text-label-sm text-text-primary font-semibold">{live ? '—' : 'Sep 10, 2026'}</span>
              </div>
              <div className="bg-surface-container-low rounded-xl px-space-xs py-space-xs">
                <span className="block font-caption text-caption text-text-tertiary">End</span>
                <span className="block font-label-sm text-label-sm text-text-primary font-semibold">{live ? '—' : 'Oct 10, 2026'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Locations */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-2xs px-space-2xs">
            <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Locations</h2>
          </div>
          <div className="bg-surface-canvas rounded-2xl border border-border-subtle overflow-hidden">
            {locationOptions.map((item, index) => {
              const active = location === item.key;
              return (
                <button
                  aria-pressed={active}
                  className={`w-full text-left px-space-sm py-space-xs flex items-center justify-between gap-space-sm hover:bg-surface-container-low/40 transition-colors ${
                    index > 0 ? 'border-t border-border-subtle' : ''
                  }`}
                  key={item.key}
                  type="button"
                  onClick={() => setLocation(item.key)}
                >
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                      {item.label}
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">{item.meta}</span>
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
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

        {/* Contextual filters */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-2xs px-space-2xs">
            <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Contextual Filters</h2>
          </div>
          <div className="flex gap-space-2xs bg-surface-container-low rounded-xl p-1">
            {CONTEXT_TABS.map((item) => {
              const active = tab === item.key;
              return (
                <button
                  aria-pressed={active}
                  className={`h-8 flex-1 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-space-2xs transition-colors ${
                    active ? 'bg-surface-canvas text-primary font-semibold shadow-sm' : 'text-text-secondary'
                  }`}
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                >
                  <Icon name={item.icon} className="text-[15px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-surface-canvas rounded-2xl border border-border-subtle p-space-sm flex flex-col gap-space-md">
            {tab === 'deals' && (
              <>
                <Panel title="Deal status">
                  <ChipRow
                    options={DEAL_STATUSES}
                    selected={dealStatuses}
                    onToggle={(value) => toggleIn(setDealStatuses, dealStatuses, value)}
                  />
                </Panel>
                <Panel title="Promotion type">
                  <div className="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-xl px-space-sm py-space-xs">
                    <span className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-surface">
                      <Icon name="local_offer" className="text-primary text-[15px]" />
                      All promotions
                    </span>
                    <Icon name="expand_more" className="text-text-tertiary text-[17px]" />
                  </div>
                </Panel>
              </>
            )}

            {tab === 'pos' && (
              <>
                <Panel title="Discovery channel">
                  <ChipRow
                    options={CHANNELS}
                    selected={channels}
                    onToggle={(value) => toggleIn(setChannels, channels, value)}
                  />
                </Panel>
                <Panel title="Settlement channel">
                  <ChipRow
                    options={SETTLEMENTS}
                    selected={settlements}
                    onToggle={(value) => toggleIn(setSettlements, settlements, value)}
                  />
                </Panel>
                <Panel title="Till selection">
                  <div className="grid grid-cols-2 gap-space-xs">
                    {TILLS.map((till) => {
                      const active = tills.includes(till);
                      return (
                        <button
                          aria-pressed={active}
                          className={`h-10 rounded-xl border font-label-sm text-label-sm flex items-center justify-center gap-space-2xs transition-all active:scale-95 ${
                            active
                              ? 'border-primary bg-surface-tint-blue/50 text-primary font-semibold'
                              : 'border-border-subtle bg-surface-container-low text-text-secondary'
                          }`}
                          key={till}
                          type="button"
                          onClick={() => toggleIn(setTills, tills, till)}
                        >
                          {active && <Icon name="check" className="text-[14px]" />}
                          <span>{till}</span>
                        </button>
                      );
                    })}
                  </div>
                </Panel>
              </>
            )}

            {tab === 'customers' && (
              <Panel title="Customer cohort">
                <div className="flex flex-col gap-space-2xs">
                  {[{ key: 'all', label: 'All cohorts', meta: '1,482 profiles' }, ...COHORTS.map((label) => ({ key: label, label, meta: '' }))].map(
                    (item) => {
                      const active = cohort === item.key;
                      return (
                        <button
                          aria-pressed={active}
                          className="w-full text-left flex items-center justify-between gap-space-sm px-space-xs py-space-xs rounded-xl hover:bg-surface-container-low/40 transition-colors"
                          key={item.key}
                          type="button"
                          onClick={() => setCohort(item.key)}
                        >
                          <span className="flex flex-col min-w-0">
                            <span className="font-label-sm text-label-sm text-on-surface font-semibold">{item.label}</span>
                            {item.meta && (
                              <span className="font-caption text-caption text-text-tertiary">{item.meta}</span>
                            )}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              active ? 'border-primary bg-primary' : 'border-outline-variant'
                            }`}
                          >
                            {active && <Icon name="check" className="text-on-primary text-[13px]" />}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </Panel>
            )}
          </div>
        </section>

        <p className="font-caption text-caption text-text-tertiary leading-relaxed px-space-2xs">
          Applied filters persist across Business, Customers, Deals, Locations and POS analytics views.
        </p>
      </div>

      {/* Fixed action dock */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface-canvas/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-margin pt-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+12px)] flex gap-space-sm">
        <button
          className="w-1/3 h-11 rounded-xl border border-border-subtle bg-surface-container-low font-button-secondary font-semibold text-text-secondary flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
          type="button"
          onClick={reset}
        >
          <Icon name="restart_alt" className="text-[17px]" />
          <span>Reset</span>
        </button>
        <button
          className={`flex-1 h-11 rounded-xl font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-all ${
            applied
              ? 'bg-badge-discount-bg text-badge-discount-text'
              : applying
                ? 'bg-primary/70 text-on-primary'
                : 'bg-primary text-on-primary'
          }`}
          disabled={applying}
          type="button"
          onClick={apply}
        >
          {applying ? (
            <Icon name="progress_activity" className="text-[17px] animate-spin" />
          ) : (
            <Icon name={applied ? 'check_circle' : 'done_all'} className="text-[17px]" />
          )}
          <span>{applyLabel}</span>
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-32px)]">
          <div className="bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-space-md py-space-xs rounded-full shadow-lg flex items-center gap-space-2xs whitespace-nowrap">
            <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
