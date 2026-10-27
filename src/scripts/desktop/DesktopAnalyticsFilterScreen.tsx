import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { AnalyticsShell } from './AnalyticsShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { hasApiConfig } from '../../services/api/client';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { presetDays, setAnalyticsFilter, useAnalyticsFilter } from '../analyticsLive';

interface DesktopAnalyticsFilterScreenProps {
  onNav?: (key: BusinessPortalNavKey) => void;
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

function PreviewTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-subtle border border-border-subtle rounded-xl px-space-sm py-space-xs flex flex-col gap-0.5 min-w-0">
      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider truncate">{label}</span>
      <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">{value}</span>
    </div>
  );
}

export function DesktopAnalyticsFilterScreen({ onNav, onBack }: DesktopAnalyticsFilterScreenProps) {
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

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (applyTimer.current !== null) window.clearTimeout(applyTimer.current);
      if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
    };
  }, []);

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

  const applyButtonClass = applied
    ? 'bg-badge-discount-bg text-badge-discount-text'
    : applying
      ? 'bg-primary/70 text-on-primary'
      : 'bg-primary text-on-primary hover:bg-primary-container shadow-md hover:shadow-lg';

  const locationLabel = locationOptions.find((item) => item.key === location)?.label ?? 'All Locations';
  const activeTabLabel = CONTEXT_TABS.find((item) => item.key === tab)?.label ?? 'Deals';
  const contextFacetCount = dealStatuses.length + channels.length + settlements.length + tills.length;

  type AppliedFilter = { id: string; group: string; label: string; onRemove: () => void };

  const appliedFilters: AppliedFilter[] = [];
  if (preset !== '30 Days') {
    appliedFilters.push({ id: 'preset', group: 'Date', label: preset, onRemove: () => setPreset('30 Days') });
  }
  if (location !== 'all') {
    appliedFilters.push({ id: 'location', group: 'Location', label: locationLabel, onRemove: () => setLocation('all') });
  }
  dealStatuses.forEach((value) =>
    appliedFilters.push({
      id: `deal|${value}`,
      group: 'Deal status',
      label: value,
      onRemove: () => setDealStatuses((current) => current.filter((item) => item !== value)),
    }),
  );
  channels.forEach((value) =>
    appliedFilters.push({
      id: `channel|${value}`,
      group: 'Discovery',
      label: value,
      onRemove: () => setChannels((current) => current.filter((item) => item !== value)),
    }),
  );
  settlements.forEach((value) =>
    appliedFilters.push({
      id: `settlement|${value}`,
      group: 'Settlement',
      label: value,
      onRemove: () => setSettlements((current) => current.filter((item) => item !== value)),
    }),
  );
  tills.forEach((value) =>
    appliedFilters.push({
      id: `till|${value}`,
      group: 'Till',
      label: value,
      onRemove: () => setTills((current) => current.filter((item) => item !== value)),
    }),
  );
  if (cohort !== 'all') {
    appliedFilters.push({ id: 'cohort', group: 'Cohort', label: cohort, onRemove: () => setCohort('all') });
  }

  const removeFilter = (filter: AppliedFilter) => {
    filter.onRemove();
    showToast(`Removed ${filter.group} filter: ${filter.label}`);
  };

  return (
    <AnalyticsShell activeNav="analytics" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        {/* Back link */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Analytics</span>
          </button>
          <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
            <Icon name="tune" className="text-[14px]" />
            <span>
              {appliedFilters.length} active {appliedFilters.length === 1 ? 'filter' : 'filters'}
            </span>
          </span>
        </div>

        {/* Page header: eyebrow, title, supporting sentence, right-side action cluster */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
              Analytics Scope • Filters
            </span>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Analytics Filters</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Narrow the analytics workspace by date range, location and contextual facets — one scope shared by every
              Business, Customers, Deals, Locations and POS view.
            </p>
          </div>

          <div className="flex items-center gap-space-xs flex-shrink-0">
            <button
              className="h-[42px] px-space-md rounded-xl border border-border-subtle bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs hover:bg-surface-container transition-colors active:scale-95"
              type="button"
              onClick={reset}
            >
              <Icon name="restart_alt" className="text-[17px]" />
              <span>Reset</span>
            </button>
            <button
              className={`h-[42px] px-space-md rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-2xs transition-all active:scale-[0.98] disabled:cursor-not-allowed ${applyButtonClass}`}
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
        </section>

        {/* Sticky facet sidebar (left) + contextual filters & live preview (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-space-lg items-start">
          {/* LEFT: filter groups sidebar */}
          <aside className="flex flex-col gap-space-md self-start w-full lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-space-2xs">
            {/* Scope banner */}
            <div className="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-xl px-space-sm py-space-xs">
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
            <section className="bg-surface-canvas rounded-xl border border-border-subtle p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-xs">
                <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                  Preset Date Range
                </h2>
                <Icon name="date_range" className="text-text-tertiary text-[17px]" />
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
                          : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
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

              <div className="bg-surface-subtle border border-border-subtle rounded-xl p-space-sm">
                <div className="flex items-center justify-between gap-space-xs mb-space-xs">
                  <span className="font-label-md text-label-md text-text-secondary font-semibold">Custom Range</span>
                  <Icon name="date_range" className="text-text-tertiary text-[17px]" />
                </div>
                <div className="grid grid-cols-2 gap-space-xs">
                  <div className="bg-surface-container-low rounded-lg px-space-xs py-space-xs">
                    <span className="block font-caption text-caption text-text-tertiary">Start</span>
                    <span className="block font-label-sm text-label-sm text-text-primary font-semibold">
                      Sep 10, 2026
                    </span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg px-space-xs py-space-xs">
                    <span className="block font-caption text-caption text-text-tertiary">End</span>
                    <span className="block font-label-sm text-label-sm text-text-primary font-semibold">
                      Oct 10, 2026
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Locations */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <Icon name="pin_drop" className="text-primary text-[17px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Locations</h2>
              </div>
              <div className="border border-border-subtle rounded-xl overflow-hidden">
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
          </aside>

          {/* RIGHT: contextual filters + live applied-filters preview */}
          <div className="flex flex-col gap-space-lg min-w-0">
            {/* Contextual filters */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <Icon name="filter_alt" className="text-primary text-[18px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                  Contextual Filters
                </h2>
              </div>

              <div className="flex gap-space-2xs bg-surface-container-low rounded-xl p-1">
                {CONTEXT_TABS.map((item) => {
                  const active = tab === item.key;
                  return (
                    <button
                      aria-pressed={active}
                      className={`h-9 flex-1 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-space-2xs transition-colors ${
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

              <div className="bg-surface-subtle border border-border-subtle rounded-xl p-space-md flex flex-col gap-space-md">
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
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
                      {[
                        { key: 'all', label: 'All cohorts', meta: '1,482 profiles' },
                        ...COHORTS.map((label) => ({ key: label, label, meta: '' })),
                      ].map((item) => {
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
                              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                                {item.label}
                              </span>
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
                      })}
                    </div>
                  </Panel>
                )}
              </div>
            </section>

            {/* Applied filters + live results preview */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                    Applied Filters &amp; Live Preview
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Updates instantly across every analytics view
                  </p>
                </div>
                <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>
                    {appliedFilters.length} active {appliedFilters.length === 1 ? 'filter' : 'filters'}
                  </span>
                </span>
              </div>

              {appliedFilters.length === 0 ? (
                <div className="flex items-center gap-space-sm p-space-md rounded-xl bg-surface-subtle border border-dashed border-border-subtle">
                  <span className="w-9 h-9 rounded-xl bg-surface-container-low text-text-tertiary flex items-center justify-center shrink-0">
                    <Icon name="filter_alt_off" className="text-[18px]" />
                  </span>
                  <div>
                    <div className="font-label-md text-label-md font-semibold text-on-surface">
                      No filters beyond defaults
                    </div>
                    <div className="font-caption text-caption text-text-secondary">
                      Every analytics view is showing its full default scope.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-space-2xs">
                  {appliedFilters.map((filter) => (
                    <button
                      aria-label={`Remove ${filter.group} filter ${filter.label}`}
                      className="h-8 pl-space-sm pr-space-xs rounded-full bg-surface-container-low font-label-sm text-label-sm flex items-center gap-space-2xs hover:bg-surface-container transition-colors active:scale-95"
                      key={filter.id}
                      type="button"
                      onClick={() => removeFilter(filter)}
                    >
                      <span className="text-text-tertiary font-medium">{filter.group}</span>
                      <span className="text-on-surface font-semibold">{filter.label}</span>
                      <Icon name="close" className="text-[14px] text-text-tertiary" />
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-xs pt-space-xs border-t border-border-subtle">
                <PreviewTile label="Timeframe" value={preset === 'Custom' ? 'Sep 10 – Oct 10, 2026' : preset} />
                <PreviewTile label="Outlets" value={locationLabel} />
                <PreviewTile label="Context view" value={activeTabLabel} />
                <PreviewTile label="Context facets" value={`${contextFacetCount} selected`} />
              </div>
            </section>

            <p className="font-caption text-caption text-text-tertiary leading-relaxed px-space-2xs">
              Applied filters persist across Business, Customers, Deals, Locations and POS analytics views.
            </p>
          </div>
        </div>
      </div>

      {/* Inline toast (replaces window.alert) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-[calc(100%-48px)]">
          <div className="bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-space-md py-space-xs rounded-full shadow-lg flex items-center gap-space-2xs whitespace-nowrap">
            <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AnalyticsShell>
  );
}
