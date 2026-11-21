import { useState } from 'react';
import { useDealBranches } from '../../hooks/business/useDealStudioLive';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';
import { DEAL_DURATIONS, dealDurationLabel } from './desktopDealStudio';

interface DesktopDealStudioStep3ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: string) => void;
}

const DAYS: Array<{ key: keyof DealStudioDraft['days']; label: string; offLabel: string }> = [
  { key: 'mon', label: 'Mon', offLabel: 'Mon (off)' },
  { key: 'tue', label: 'Tue', offLabel: 'Tue (off)' },
  { key: 'wed', label: 'Wed', offLabel: 'Wed (off)' },
  { key: 'thu', label: 'Thu', offLabel: 'Thu (off)' },
  { key: 'fri', label: 'Fri', offLabel: 'Fri (off)' },
  { key: 'sat', label: 'Sat', offLabel: 'Sat (off)' },
  { key: 'sun', label: 'Sun', offLabel: 'Sun (off)' },
];

const DAY_PRESETS: Array<{ id: 'all' | 'weekdays' | 'weekends'; label: string }> = [
  { id: 'all', label: 'Every Day' },
  { id: 'weekdays', label: 'Weekdays (Mon – Fri)' },
  { id: 'weekends', label: 'Weekends (Sat – Sun)' },
];

const HOUR_OPTIONS = [
  '12:00 AM',
  '1:00 AM',
  '2:00 AM',
  '3:00 AM',
  '4:00 AM',
  '5:00 AM',
  '6:00 AM',
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
  '11:00 PM',
];

const SUGGESTED_CLAUSES = ['Valid ID required', 'One per customer per visit', 'Not valid on public holidays', 'While stocks last'];

interface BranchRow {
  rowKey: string;
  name: string;
  address: string;
  badge: string;
  disabled?: boolean;
  note?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

export function DesktopDealStudioStep3Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
}: DesktopDealStudioStep3ScreenProps) {
  const [stepsOpen, setStepsOpen] = useState(true);
  const [termsOpen, setTermsOpen] = useState(true);
  const [daysOpen, setDaysOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [draftStep, setDraftStep] = useState('');
  const [editingTerm, setEditingTerm] = useState<number | null>(null);
  const [draftTerm, setDraftTerm] = useState('');
  const [addingStep, setAddingStep] = useState(false);
  const [newStep, setNewStep] = useState('');
  const [newTerm, setNewTerm] = useState('');

  // The business's own branches — only those selling the item can be picked.
  const dealBranches = useDealBranches(studio);
  const branchList: BranchRow[] = dealBranches.options.map((option) => ({
    rowKey: option.id,
    name: option.name,
    address: option.area || 'No address on file',
    badge: !option.sellsItem
      ? 'Item not sold here'
      : option.id === dealBranches.activeBranchId
        ? 'Current branch'
        : 'Your branch',
    disabled: !option.sellsItem,
    note: option.sellsItem ? undefined : 'Add this item to the branch in your catalogue to include it.',
    checked: dealBranches.selectedIds.includes(option.id),
    onToggle: () => onStudioChange(dealBranches.toggle(option.id)),
  }));
  const selectedBranches = dealBranches.selectedIds.length;

  const selectedDays = DAYS.filter((day) => studio.days[day.key]);
  const everyDay = selectedDays.length === DAYS.length;
  const weekdaysOnly = selectedDays.length === 5 && !studio.days.sat && !studio.days.sun;
  const weekendsOnly = selectedDays.length === 2 && studio.days.sat && studio.days.sun;
  const daysSummary =
    selectedDays.length === 0
      ? 'No days selected'
      : everyDay
        ? 'Every Day'
        : weekdaysOnly
          ? 'Weekdays (Mon – Fri)'
          : weekendsOnly
            ? 'Weekends (Sat – Sun)'
            : selectedDays.map((day) => day.label).join(', ');

  const toggleDay = (key: keyof DealStudioDraft['days']) => {
    onStudioChange({ days: { ...studio.days, [key]: !studio.days[key] } });
  };

  const applyDayPreset = (preset: 'all' | 'weekdays' | 'weekends') => {
    if (preset === 'all')
      onStudioChange({ days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true } });
    else if (preset === 'weekdays')
      onStudioChange({ days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } });
    else onStudioChange({ days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: true, sun: true } });
  };

  const removeStep = (index: number) => {
    onStudioChange({ claimSteps: studio.claimSteps.filter((_, position) => position !== index) });
  };

  const commitStepEdit = (index: number) => {
    const value = draftStep.trim();
    if (value.length > 0) {
      onStudioChange({ claimSteps: studio.claimSteps.map((step, position) => (position === index ? value : step)) });
    }
    setEditingStep(null);
    setDraftStep('');
  };

  const addStep = () => {
    const value = newStep.trim();
    if (value.length > 0) {
      onStudioChange({ claimSteps: [...studio.claimSteps, value] });
    }
    setNewStep('');
    setAddingStep(false);
  };

  const removeTerm = (index: number) => {
    onStudioChange({ terms: studio.terms.filter((_, position) => position !== index) });
  };

  const commitTermEdit = (index: number) => {
    const value = draftTerm.trim();
    if (value.length > 0) {
      onStudioChange({ terms: studio.terms.map((term, position) => (position === index ? value : term)) });
    }
    setEditingTerm(null);
    setDraftTerm('');
  };

  const addTerm = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      onStudioChange({ terms: [...studio.terms, trimmed] });
    }
  };

  const inner = (
    <>
      <div className="w-full bg-surface-canvas shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] py-space-md px-space-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm text-text-secondary font-label-sm text-label-sm">
            <span className="hover:text-primary transition-colors cursor-pointer">Catalog Workflow</span>
            <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
            <span className="hover:text-primary transition-colors cursor-pointer">Deal Studio</span>
            <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
            <span className="text-primary font-semibold">Step 3 of 4: Branches, Schedule &amp; Redemption</span>
          </div>
          <div className="flex items-center gap-space-md min-w-[280px]">
            <div className="flex-1 flex flex-col gap-space-2xs">
              <div className="flex justify-between items-center font-caption text-caption">
                <span className="text-on-surface-variant font-medium">Progress</span>
                <span className="text-primary font-bold">75% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full w-3/4 transition-all duration-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 pl-space-xs">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="w-6 h-2 rounded-full bg-primary-container" />
              <span className="w-2 h-2 rounded-full bg-surface-container-highest" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-space-xl py-space-xl">
        <div className="mb-space-xl">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-tint-blue text-primary rounded-full mb-space-xs">
            <Icon name="storefront" className="text-[16px]" />
            <span className="font-caption text-caption font-semibold uppercase tracking-wider">
              Targeting &amp; Operations
            </span>
          </div>
          <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
            Participating Branches &amp; Redemption Terms
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Designate eligible locations, active redemption hours, customer claim steps, and your own policies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            <section className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold flex items-center gap-space-xs">
                    <span>Participating Branches</span>
                    <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                      {selectedBranches} Selected
                    </span>
                  </h2>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Pick the branches where customers can redeem this deal. Each branch gets its own copy.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-space-sm">
                {branchList.length === 0 && (
                  <p className="font-body-md text-body-md text-text-secondary">
                    No branches yet — add your business locations in your business profile.
                  </p>
                )}
                {branchList.map((branch) => {
                  const active = branch.checked;
                  return (
                    <label
                      key={branch.rowKey}
                      className={`group relative flex items-start gap-space-md p-space-md rounded-xl transition-all ${
                        branch.disabled
                          ? 'bg-surface-subtle cursor-not-allowed opacity-75'
                          : 'bg-surface-tint-blue cursor-pointer hover:shadow-sm'
                      }`}
                    >
                      <input
                        className={`mt-1 w-5 h-5 accent-primary rounded ${
                          branch.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        }`}
                        type="checkbox"
                        disabled={branch.disabled}
                        checked={active}
                        onChange={(event) => branch.onToggle(event.target.checked)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-space-xs">
                          <span
                            className={`font-label-md text-label-md font-semibold ${
                              branch.disabled ? 'text-text-secondary' : 'text-on-surface'
                            }`}
                          >
                            {branch.name}
                          </span>
                          <span
                            className={`px-space-xs py-space-2xs rounded-full font-caption text-caption font-semibold ${
                              branch.disabled
                                ? 'bg-surface-container text-on-surface-variant'
                                : 'bg-badge-discount-bg text-badge-discount-text'
                            }`}
                          >
                            {branch.badge}
                          </span>
                        </div>
                        <p
                          className={`font-caption text-caption mt-0.5 ${
                            branch.disabled ? 'text-text-tertiary' : 'text-text-secondary'
                          }`}
                        >
                          {branch.address}
                        </p>
                        {branch.note && (
                          <span className="inline-block mt-space-xs font-caption text-caption text-tertiary">
                            {branch.note}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg">
              <div className="mb-space-md">
                <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                  Redemption Schedule &amp; Time Window
                </h2>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Define when customers are permitted to scan and claim their deals in-store.
                </p>
              </div>
              <div className="mb-space-lg relative">
                <label className="block font-label-md text-label-md font-semibold text-on-surface mb-space-xs">
                  Eligible Days
                </label>
                <button
                  type="button"
                  aria-expanded={daysOpen}
                  onClick={() => setDaysOpen((open) => !open)}
                  className="w-full sm:w-96 flex items-center justify-between gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-subtle border border-border-subtle hover:border-border-active transition-colors text-left select-none"
                >
                  <span className="flex items-center gap-space-2xs min-w-0">
                    <Icon name="calendar_month" className="text-primary text-[18px] shrink-0" />
                    <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                      {daysSummary}
                    </span>
                  </span>
                  <Icon
                    name={daysOpen ? 'expand_less' : 'expand_more'}
                    className="text-outline-variant text-[20px] shrink-0"
                  />
                </button>
                {daysOpen && (
                  <div className="absolute z-30 left-0 right-0 sm:right-auto sm:w-96 mt-space-2xs p-space-sm bg-surface-canvas rounded-xl border border-border-subtle shadow-lg flex flex-col gap-space-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {DAY_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyDayPreset(preset.id)}
                          className="font-caption text-caption bg-surface-subtle hover:bg-surface-tint-blue text-text-secondary hover:text-primary px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 border border-border-subtle"
                        >
                          <Icon name="bolt" className="text-[13px]" />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      {DAYS.map((day) => (
                        <label
                          key={day.key}
                          className="flex items-center justify-between py-1 cursor-pointer select-none"
                        >
                          <span className="font-label-sm text-label-sm text-on-surface font-medium">{day.label}</span>
                          <input
                            aria-label={day.label}
                            className="w-4 h-4 rounded accent-primary cursor-pointer"
                            type="checkbox"
                            checked={studio.days[day.key]}
                            onChange={() => toggleDay(day.key)}
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDaysOpen(false)}
                      className="self-end px-space-sm py-1 rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold hover:bg-primary-fixed transition-colors active:scale-95"
                    >
                      Done
                    </button>
                  </div>
                )}
                <p className="font-caption text-caption text-badge-discount-text font-medium mt-space-2xs flex items-center gap-1">
                  <Icon name="event_available" className="text-[15px]" />
                  Active {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} weekly (Peak Lunch
                  Rotation)
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="p-space-md bg-surface-subtle rounded-xl relative">
                  <div className="flex items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-semibold">
                      <Icon name="schedule" className="text-[18px]" />
                      <span>Active Hours</span>
                      <span title="The daily time window when customers can walk in, scan and redeem this deal.">
                        <Icon name="info" className="text-[14px] text-outline-variant" />
                      </span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                      <span className="font-caption text-caption text-text-secondary">All day (24 hrs)</span>
                      <input
                        aria-label="Redeem all day"
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                        type="checkbox"
                        checked={studio.redeemAllDay}
                        onChange={(event) => onStudioChange({ redeemAllDay: event.target.checked })}
                      />
                    </label>
                  </div>
                  {studio.redeemAllDay ? (
                    <div className="mt-space-xs font-label-md text-label-md text-on-surface font-bold">
                      Open all day — redeemable any time
                    </div>
                  ) : (
                    <div className="flex items-end gap-space-2xs mt-space-xs">
                      <label className="flex flex-col min-w-0 flex-1">
                        <span className="font-caption text-caption text-text-secondary mb-space-2xs">From</span>
                        <select
                          aria-label="Redeem from time"
                          className="w-full bg-surface-canvas rounded-lg px-space-2xs py-space-2xs font-label-md text-label-md text-on-surface font-bold border border-border-subtle focus:border-primary outline-none transition-colors cursor-pointer"
                          value={studio.redeemStart}
                          onChange={(event) => onStudioChange({ redeemStart: event.target.value })}
                        >
                          {HOUR_OPTIONS.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col min-w-0 flex-1">
                        <span className="font-caption text-caption text-text-secondary mb-space-2xs">To</span>
                        <select
                          aria-label="Redeem to time"
                          className="w-full bg-surface-canvas rounded-lg px-space-2xs py-space-2xs font-label-md text-label-md text-on-surface font-bold border border-border-subtle focus:border-primary outline-none transition-colors cursor-pointer"
                          value={studio.redeemEnd}
                          onChange={(event) => onStudioChange({ redeemEnd: event.target.value })}
                        >
                          {HOUR_OPTIONS.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                  <div className="font-caption text-caption text-text-secondary mt-space-2xs flex items-center gap-1">
                    <Icon name="info" className="text-[13px] text-outline-variant" />
                    <span>Times shown in West Africa Time (WAT)</span>
                  </div>
                </div>
                <div className="p-space-md bg-surface-subtle rounded-xl">
                  <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-semibold mb-space-xs">
                    <Icon name="hourglass_top" className="text-[18px]" />
                    <span>Deal Validity Duration</span>
                    <span title="Set how long the deal stays redeemable after a customer unlocks it.">
                      <Icon name="info" className="text-[14px] text-outline-variant" />
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      aria-expanded={durationOpen}
                      onClick={() => setDurationOpen((open) => !open)}
                      className="w-full flex items-center justify-between gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-canvas border border-border-subtle hover:border-border-active transition-colors text-left select-none"
                    >
                      <span className="flex items-center gap-space-2xs min-w-0">
                        <Icon name="event" className="text-primary text-[16px] shrink-0" />
                        <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                          {dealDurationLabel(studio.duration)}
                        </span>
                      </span>
                      <Icon
                        name={durationOpen ? 'expand_less' : 'expand_more'}
                        className="text-outline-variant text-[18px] shrink-0"
                      />
                    </button>
                    {durationOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-space-2xs rounded-lg bg-surface-canvas border border-border-subtle shadow-lg overflow-hidden">
                        {DEAL_DURATIONS.map((option) => {
                          const isActive = studio.duration === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                onStudioChange({ duration: option.id });
                                setDurationOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-space-xs px-space-sm py-space-2xs text-left transition-colors ${
                                isActive ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'
                              }`}
                            >
                              <span className="flex flex-col">
                                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                                  {option.label}
                                </span>
                                <span className="font-caption text-caption text-text-secondary">{option.hint}</span>
                              </span>
                              {isActive && <Icon name="check" className="text-primary text-[16px] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="font-caption text-caption text-text-secondary mt-space-2xs">
                    {studio.duration === 'forever'
                      ? 'Always active until you pause or delete it'
                      : `Expires after ${dealDurationLabel(studio.duration).toLowerCase()} from customer unlock`}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] overflow-hidden">
              <div
                className="p-space-lg flex items-center justify-between cursor-pointer select-none"
                onClick={() => setStepsOpen((open) => !open)}
              >
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                      How to Claim Steps
                    </h2>
                    <span className="px-space-xs py-space-2xs rounded-full bg-surface-container font-caption text-caption font-semibold text-on-surface-variant">
                      {studio.claimSteps.length} Steps
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Exact customer journey presented inside the consumer app pass card.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <Icon name={stepsOpen ? 'expand_less' : 'expand_more'} className="text-[20px]" />
                </button>
              </div>
              {stepsOpen && (
                <div className="px-space-lg pb-space-lg flex flex-col gap-space-sm">
                  {studio.claimSteps.map((step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="flex items-center gap-space-sm p-space-md bg-surface-subtle rounded-xl group hover:bg-surface-container-low transition-colors"
                    >
                      <Icon name="drag_indicator" className="text-outline-variant cursor-grab text-[20px]" />
                      <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0">
                        {index + 1}
                      </div>
                      {editingStep === index ? (
                        <input
                          autoFocus
                          type="text"
                          value={draftStep}
                          onChange={(event) => setDraftStep(event.target.value)}
                          onBlur={() => commitStepEdit(index)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') commitStepEdit(index);
                            if (event.key === 'Escape') setEditingStep(null);
                          }}
                          className="flex-1 font-body-md text-body-md text-on-surface bg-surface-canvas rounded-lg px-space-xs py-space-2xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      ) : (
                        <div className="flex-1 font-body-md text-body-md text-on-surface">{step}</div>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Edit Step"
                          onClick={() => {
                            setEditingStep(index);
                            setDraftStep(step);
                          }}
                          className="p-1 rounded text-text-secondary hover:text-primary transition-colors"
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          title="Remove Step"
                          onClick={() => removeStep(index)}
                          className="p-1 rounded text-text-secondary hover:text-error transition-colors"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {addingStep ? (
                    <div className="flex items-center gap-space-xs mt-space-xs">
                      <input
                        autoFocus
                        type="text"
                        value={newStep}
                        placeholder="Describe the next claim step..."
                        onChange={(event) => setNewStep(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') addStep();
                        }}
                        className="flex-1 h-[46px] px-space-md rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md outline-none focus:bg-surface-canvas shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={addStep}
                        className="h-[46px] px-space-lg rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-surface-tint transition-colors shrink-0 flex items-center gap-1"
                      >
                        <Icon name="add" className="text-[18px]" />
                        <span>Add</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingStep(true)}
                      className="mt-space-xs inline-flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors self-start"
                    >
                      <Icon name="add_circle" className="text-[18px]" />
                      <span>+ Add Claim Step</span>
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] overflow-hidden">
              <div
                className="p-space-lg flex items-center justify-between cursor-pointer select-none"
                onClick={() => setTermsOpen((open) => !open)}
              >
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                      Terms &amp; Conditions Rules
                    </h2>
                    <span className="px-space-xs py-space-2xs rounded-full bg-surface-container font-caption text-caption font-semibold text-on-surface-variant">
                      {studio.terms.length} Rules Active
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Enforceable merchant restrictions displayed before unlock.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <Icon name={termsOpen ? 'expand_less' : 'expand_more'} className="text-[20px]" />
                </button>
              </div>
              {termsOpen && (
                <div className="px-space-lg pb-space-lg flex flex-col gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    {studio.terms.map((term, index) => (
                      <div key={`${term}-${index}`} className="flex items-start gap-space-sm p-space-sm bg-surface rounded-lg">
                        <Icon name="verified" className="text-primary text-[18px] mt-0.5" />
                        {editingTerm === index ? (
                          <input
                            autoFocus
                            type="text"
                            aria-label={`Term ${index + 1}`}
                            value={draftTerm}
                            onChange={(event) => setDraftTerm(event.target.value)}
                            onBlur={() => commitTermEdit(index)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') commitTermEdit(index);
                              if (event.key === 'Escape') setEditingTerm(null);
                            }}
                            className="flex-1 font-body-md text-body-md text-on-surface bg-surface-canvas rounded-lg px-space-xs py-space-2xs outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        ) : (
                          <span className="flex-1 font-body-md text-body-md text-on-surface">{term}</span>
                        )}
                        <button
                          type="button"
                          title="Edit Term"
                          onClick={() => {
                            setEditingTerm(index);
                            setDraftTerm(term);
                          }}
                          className="text-text-tertiary hover:text-primary transition-colors"
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTerm(index)}
                          className="text-text-tertiary hover:text-error transition-colors"
                        >
                          <Icon name="close" className="text-[18px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <span className="block font-caption text-caption text-text-secondary uppercase tracking-wider mb-space-xs font-semibold">
                      Suggested Standard Clauses
                    </span>
                    <div className="flex flex-wrap gap-space-xs">
                      {SUGGESTED_CLAUSES.map((clause) => (
                        <button
                          key={clause}
                          type="button"
                          onClick={() => addTerm(clause)}
                          className="px-space-sm py-space-2xs rounded-full bg-surface-subtle text-on-surface-variant hover:bg-surface-tint-blue hover:text-primary transition-colors font-caption text-caption font-medium flex items-center gap-1"
                        >
                          <Icon name="add" className="text-[14px]" />
                          <span>{clause}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs pt-space-xs">
                    <input
                      type="text"
                      value={newTerm}
                      placeholder="Type a new term or policy note..."
                      onChange={(event) => setNewTerm(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          addTerm(newTerm);
                          setNewTerm('');
                        }
                      }}
                      className="flex-1 h-[46px] px-space-md rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md outline-none focus:bg-surface-canvas shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addTerm(newTerm);
                        setNewTerm('');
                      }}
                      className="h-[46px] px-space-lg rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-surface-tint transition-colors shrink-0 flex items-center gap-1"
                    >
                      <Icon name="add" className="text-[18px]" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-xl">
              <section className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Where &amp; When Customers Redeem</h2>
                  <Icon name="event_available" className="text-primary text-[20px]" />
                </div>
                <div className="flex flex-col gap-space-xs">
                  {dealBranches.selected.length === 0 && (
                    <p className="p-space-sm rounded-lg bg-surface-subtle font-caption text-caption text-text-secondary">
                      No participating branches selected yet.
                    </p>
                  )}
                  {dealBranches.selected.map((branch) => (
                    <div key={branch.id} className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-subtle">
                      <Icon name="pin_drop" className="text-[18px] text-primary mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-label-md text-label-md text-on-surface font-semibold">{branch.name}</div>
                        <div className="font-caption text-caption text-text-secondary">
                          {branch.area || 'No address on file'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-space-xs font-body-md text-body-md text-on-surface-variant">
                  <Icon name="alarm" className="text-[18px]" />
                  <span>
                    {daysSummary} • {studio.redeemAllDay ? 'All day' : `${studio.redeemStart} – ${studio.redeemEnd}`}
                  </span>
                </div>
                <div className="flex items-center gap-space-xs font-body-md text-body-md text-on-surface-variant">
                  <Icon name="calendar_month" className="text-[18px]" />
                  <span>{dealDurationLabel(studio.duration)}</span>
                </div>
              </section>

          </div>
        </div>

      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Step 2: Limits &amp; Rules</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onNext}
              className="px-space-xl py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-space-xs"
            >
              <span>Review &amp; Launch Deal</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  if (onNav) {
    return (
      <MerchantShell activeNav="business-deals" onNav={onNav}>
        {inner}
      </MerchantShell>
    );
  }
  return (
    <BusinessSetupChrome activeNav="deals">
      {inner}
    </BusinessSetupChrome>
  );
}
