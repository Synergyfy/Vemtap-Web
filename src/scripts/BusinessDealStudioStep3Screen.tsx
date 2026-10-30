import { useState } from 'react';
import { useDealBranches } from '../hooks/business/useDealStudioLive';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { DealStudioDraft } from './dealStudio';
import { DEAL_DURATIONS, dealDurationLabel } from './dealStudio';
import type { ProductDraft } from './productDraft';

interface BusinessDealStudioStep3ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const BRANCH_OPTIONS: Array<{ key: keyof DealStudioDraft['branches']; name: string; address: string }> = [
  { key: 'wuseII', name: 'Wuse II Flagship', address: 'Aminu Kano Crescent, Abuja' },
  { key: 'garkiII', name: 'Garki II Branch', address: 'Tafawa Balewa Way, Abuja' },
  { key: 'maitama', name: 'Maitama Heights', address: 'Plot 702 Aguiyi Ironsi St, Maitama District, Abuja' },
];

const DAY_OPTIONS: Array<{ key: keyof DealStudioDraft['days']; label: string }> = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
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

const SUGGESTED_TERMS = ['Valid ID required', 'One per table', 'Not valid on public holidays'];
/** Live: suggestions that fit any kind of business. */
const LIVE_SUGGESTED_TERMS = ['Valid ID required', 'One per customer per visit', 'While stocks last'];

interface BranchRow {
  rowKey: string;
  name: string;
  address: string;
  disabled?: boolean;
  checked: boolean;
  onToggle: () => void;
}

export function BusinessDealStudioStep3Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessDealStudioStep3ScreenProps) {
  const [claimOpen, setClaimOpen] = useState(true);
  const [termsOpen, setTermsOpen] = useState(true);
  const [daysOpen, setDaysOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [newTerm, setNewTerm] = useState('');

  // Live: the business's own branches (only those selling the item can be picked); demo keeps the samples.
  const dealBranches = useDealBranches(studio);
  const live = dealBranches.live;
  const branchOptions: BranchRow[] = live
    ? dealBranches.options.map((option) => ({
        rowKey: option.id,
        name: option.name,
        address: option.sellsItem ? option.area || 'No address on file' : 'Item not sold at this branch yet',
        disabled: !option.sellsItem,
        checked: dealBranches.selectedIds.includes(option.id),
        onToggle: () => onStudioChange(dealBranches.toggle(option.id)),
      }))
    : BRANCH_OPTIONS.map((branch) => ({
        rowKey: branch.key,
        name: branch.name,
        address: branch.address,
        checked: studio.branches[branch.key],
        onToggle: () => toggleBranch(branch.key),
      }));
  const selectableCount = branchOptions.filter((branch) => !branch.disabled).length;
  const selectedBranchCount = live ? dealBranches.selectedIds.length : Object.values(studio.branches).filter(Boolean).length;
  const suggestedTerms = live ? LIVE_SUGGESTED_TERMS : SUGGESTED_TERMS;

  const selectedDays = DAY_OPTIONS.filter((day) => studio.days[day.key]);
  const everyDay = selectedDays.length === DAY_OPTIONS.length;
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

  const applyDayPreset = (preset: 'all' | 'weekdays' | 'weekends') => {
    if (preset === 'all')
      onStudioChange({ days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true } });
    else if (preset === 'weekdays')
      onStudioChange({ days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } });
    else onStudioChange({ days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: true, sun: true } });
  };

  const toggleBranch = (key: keyof DealStudioDraft['branches']) =>
    onStudioChange({ branches: { ...studio.branches, [key]: !studio.branches[key] } });

  const toggleDay = (key: keyof DealStudioDraft['days']) =>
    onStudioChange({ days: { ...studio.days, [key]: !studio.days[key] } });

  const setClaimStep = (index: number, value: string) =>
    onStudioChange({ claimSteps: studio.claimSteps.map((step, position) => (position === index ? value : step)) });

  const removeClaimStep = (index: number) =>
    onStudioChange({ claimSteps: studio.claimSteps.filter((_, position) => position !== index) });

  const removeTerm = (index: number) =>
    onStudioChange({ terms: studio.terms.filter((_, position) => position !== index) });

  const addTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    onStudioChange({ terms: [...studio.terms, trimmed] });
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-space-xs text-on-surface hover:text-primary active:scale-95 transition-transform"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider leading-none mb-0.5">
                VEMTAP Merchant
              </span>
              <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate max-w-[170px]">
                Schedule &amp; Terms
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Save Draft"
              className="min-w-[44px] min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-transform"
              type="button"
              onClick={onSaveDraft}
            >
              Save
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(6,108,244,0.25)]">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-md pb-space-sm bg-surface">
          <div className="flex items-center justify-between mb-space-2xs">
            <span className="font-label-sm text-label-sm text-primary font-semibold">
              Step 3 of 4: Branches &amp; Schedule
            </span>
            <span className="font-label-sm text-label-sm text-text-secondary">75% complete</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full w-3/4 transition-all duration-500 ease-out" />
          </div>
          <p className="font-body-md text-body-md text-text-secondary mt-space-sm">
            Select which branch locations honor this voucher and set eligible days and redemption hours.
          </p>
        </div>

        <div className="flex flex-col gap-space-lg px-margin pt-space-xs pb-space-2xl">
          <div className="flex flex-col bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden transition-all">
            <button
              className="list-none cursor-pointer flex items-center justify-between p-space-sm hover:bg-surface-subtle transition-colors select-none w-full text-left"
              type="button"
              onClick={() => setClaimOpen((open) => !open)}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">How to Claim Steps</h2>
                  <span className="font-caption text-caption bg-surface-tint-blue text-primary font-semibold px-2 py-0.5 rounded-full">
                    Customer Guide
                  </span>
                  <span className="font-caption text-caption text-text-tertiary ml-1">
                    {studio.claimSteps.length} steps
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Step-by-step voucher redemption flow shown to diners.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95">
                <Icon name={claimOpen ? 'remove' : 'add'} className="text-[20px]" />
              </div>
            </button>
            {claimOpen && (
              <div className="p-space-sm pt-0 flex flex-col gap-space-sm border-t border-border-subtle mt-space-xs pt-space-sm">
                <div className="flex flex-col gap-space-xs">
                  {studio.claimSteps.map((step, index) => (
                    <div
                      key={`${index}-${step.slice(0, 12)}`}
                      className="flex items-start gap-space-xs p-space-sm bg-surface-subtle rounded-xl border border-border-subtle transition-all"
                    >
                      <span className="text-text-tertiary cursor-grab pt-1 shrink-0" title="Drag to reorder">
                        <Icon name="drag_indicator" className="text-[20px]" />
                      </span>
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <input
                          aria-label={`Claim step ${index + 1}`}
                          className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                          type="text"
                          value={step}
                          onChange={(event) => setClaimStep(index, event.target.value)}
                        />
                      </div>
                      <button
                        aria-label="Delete step"
                        className="text-text-tertiary hover:text-error transition-colors p-1 shrink-0"
                        type="button"
                        onClick={() => removeClaimStep(index)}
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-2.5 px-space-md border border-dashed border-outline-variant hover:border-primary text-primary font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1.5 bg-surface hover:bg-surface-tint-blue transition-colors active:scale-[0.99]"
                  type="button"
                  onClick={() => onStudioChange({ claimSteps: [...studio.claimSteps, ''] })}
                >
                  <Icon name="add_circle" className="text-[18px]" />
                  <span>Add Claim Step</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden transition-all">
            <button
              className="list-none cursor-pointer flex items-center justify-between p-space-sm hover:bg-surface-subtle transition-colors select-none w-full text-left"
              type="button"
              onClick={() => setTermsOpen((open) => !open)}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Terms &amp; Conditions Rules</h2>
                  <span className="font-caption text-caption text-text-secondary ml-1">Auto-formatted</span>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Clear redemption limits and restaurant policies.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95">
                <Icon name={termsOpen ? 'remove' : 'add'} className="text-[20px]" />
              </div>
            </button>
            {termsOpen && (
              <div className="p-space-sm pt-0 flex flex-col gap-space-sm border-t border-border-subtle mt-space-xs pt-space-sm">
                <div className="flex flex-col gap-space-xs">
                  {studio.terms.map((term, index) => (
                    <div
                      key={`${index}-${term.slice(0, 12)}`}
                      className="flex items-center justify-between gap-space-xs p-space-sm bg-surface-subtle rounded-xl border border-border-subtle transition-all"
                    >
                      <div className="flex items-start gap-space-xs flex-grow">
                        <Icon name="check_circle" className="text-primary text-[18px] mt-0.5 shrink-0" />
                        <span className="font-body-md text-body-md text-on-surface">{term}</span>
                      </div>
                      <button
                        aria-label="Remove rule"
                        className="text-text-tertiary hover:text-error transition-colors p-1 shrink-0"
                        type="button"
                        onClick={() => removeTerm(index)}
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="font-caption text-caption text-text-tertiary font-medium">
                    Quick-add suggested rules:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTerms.map((term) => (
                      <button
                        key={term}
                        className="font-caption text-caption bg-surface-container hover:bg-surface-tint-blue text-text-secondary hover:text-primary px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                        type="button"
                        onClick={() => addTerm(term)}
                      >
                        <Icon name="add" className="text-[14px]" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-space-xs mt-space-2xs">
                  <div className="flex-grow bg-surface rounded-xl shadow-sm px-space-sm py-2.5 flex items-center gap-2 border border-border-subtle focus-within:border-primary transition-colors">
                    <Icon name="edit_note" className="text-text-tertiary text-[18px]" />
                    <input
                      aria-label="New term"
                      className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none placeholder:text-text-tertiary"
                      placeholder="Type a new term or policy note..."
                      type="text"
                      value={newTerm}
                      onChange={(event) => setNewTerm(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          addTerm(newTerm);
                          setNewTerm('');
                        }
                      }}
                    />
                  </div>
                  <button
                    className="h-11 px-space-md bg-surface-tint-blue hover:bg-primary-fixed text-primary font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1 shrink-0 transition-colors shadow-sm active:scale-95"
                    type="button"
                    onClick={() => {
                      addTerm(newTerm);
                      setNewTerm('');
                    }}
                  >
                    <Icon name="add" className="text-[18px]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col bg-surface-canvas rounded-xl shadow-sm border border-border-subtle p-space-sm gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Participating Branches</h2>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  {live
                    ? 'Pick where customers can redeem this deal. Each branch gets its own copy.'
                    : 'Toggle merchant outlets enabled for voucher code redemption.'}
                </p>
              </div>
              <button
                className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1 shrink-0"
                type="button"
                onClick={() => {
                  const allSelected = selectedBranchCount === selectableCount;
                  if (live) {
                    // "Clear" keeps the current branch: a deal needs at least one.
                    const sellable = dealBranches.options.filter((option) => option.sellsItem).map((option) => option.id);
                    onStudioChange({ branchIds: allSelected ? sellable.slice(0, 1) : sellable });
                    return;
                  }
                  onStudioChange({
                    branches: {
                      wuseII: !allSelected,
                      garkiII: !allSelected,
                      maitama: !allSelected,
                    },
                  });
                }}
              >
                <Icon name="add_location_alt" className="text-[16px]" />
                <span>{selectedBranchCount === selectableCount ? 'Clear All' : 'Select All'}</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-xs">
              {branchOptions.map((branch) => {
                const isActive = branch.checked;
                return (
                  <label
                    key={branch.rowKey}
                    className={`flex items-center justify-between p-space-sm rounded-xl transition-all ${
                      branch.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    } ${isActive ? 'bg-surface-tint-blue' : 'bg-surface-subtle'}`}
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-surface-canvas text-primary flex items-center justify-center shrink-0 shadow-sm">
                        <Icon name="storefront" className="text-[18px]" />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-label-md text-label-md font-semibold truncate ${
                              isActive ? 'text-text-primary' : 'text-text-secondary'
                            }`}
                          >
                            {branch.name}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-caption text-caption truncate ${
                            isActive ? 'text-text-secondary' : 'text-text-tertiary'
                          }`}
                        >
                          {branch.address}
                        </span>
                      </div>
                    </div>
                    <input
                      aria-label={branch.name}
                      className="w-5 h-5 rounded accent-primary cursor-pointer shrink-0"
                      type="checkbox"
                      checked={isActive}
                      disabled={branch.disabled}
                      onChange={branch.onToggle}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col bg-surface-canvas rounded-xl shadow-sm border border-border-subtle p-space-sm gap-space-sm">
            <div className="flex flex-col">
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Redemption Schedule</h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Select eligible days and set the active redemption window.
              </p>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md font-semibold text-on-surface">Eligible Days</span>
              <button
                type="button"
                aria-expanded={daysOpen}
                onClick={() => setDaysOpen((open) => !open)}
                className="w-full flex items-center justify-between gap-space-xs p-space-sm rounded-xl bg-surface-subtle border border-border-subtle hover:border-border-active transition-colors text-left select-none"
              >
                <span className="flex items-center gap-space-2xs min-w-0">
                  <Icon name="calendar_month" className="text-primary text-[18px] shrink-0" />
                  <span className="font-label-md text-label-md text-text-primary font-medium truncate">
                    {daysSummary}
                  </span>
                </span>
                <Icon
                  name={daysOpen ? 'expand_less' : 'expand_more'}
                  className="text-text-tertiary text-[20px] shrink-0"
                />
              </button>
              {daysOpen && (
                <div className="flex flex-col gap-space-2xs p-space-sm rounded-xl bg-surface-subtle border border-border-subtle">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {DAY_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyDayPreset(preset.id)}
                        className="font-caption text-caption bg-surface-canvas hover:bg-surface-tint-blue text-text-secondary hover:text-primary px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 border border-border-subtle"
                      >
                        <Icon name="bolt" className="text-[13px]" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col divide-y divide-border-subtle">
                    {DAY_OPTIONS.map((day) => (
                      <label key={day.key} className="flex items-center justify-between py-1.5 cursor-pointer">
                        <span className="font-label-sm text-label-sm text-text-primary font-medium">
                          {day.label}
                        </span>
                        <input
                          aria-label={day.label}
                          className="w-5 h-5 rounded accent-primary cursor-pointer"
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
                    className="self-end px-space-md py-1.5 rounded-xl bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold hover:bg-primary-fixed transition-colors active:scale-95"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col">
                <div className="flex items-center justify-between gap-space-xs">
                  <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                    Redeem Hours
                    <span title="The daily time window when customers can walk in, scan and redeem this deal.">
                      <Icon name="info" className="text-[13px] text-text-tertiary" />
                    </span>
                  </span>
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
                  <span className="font-label-md text-label-md text-text-primary font-semibold mt-1">
                    Open all day — redeemable any time
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1">
                    <label className="flex flex-col min-w-0 flex-1">
                      <span className="font-caption text-caption text-text-tertiary mb-0.5">From</span>
                      <select
                        aria-label="Redeem from time"
                        className="w-full bg-surface-canvas rounded-lg px-1.5 py-1.5 font-label-md text-label-md text-text-primary font-semibold border border-border-subtle focus:border-primary outline-none transition-colors cursor-pointer"
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
                      <span className="font-caption text-caption text-text-tertiary mb-0.5">To</span>
                      <select
                        aria-label="Redeem to time"
                        className="w-full bg-surface-canvas rounded-lg px-1.5 py-1.5 font-label-md text-label-md text-text-primary font-semibold border border-border-subtle focus:border-primary outline-none transition-colors cursor-pointer"
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
              </div>
              <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col">
                <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                  Duration
                  <span title="Set how long the deal stays redeemable after a customer unlocks it.">
                    <Icon name="info" className="text-[13px] text-text-tertiary" />
                  </span>
                </span>
                <button
                  type="button"
                  aria-expanded={durationOpen}
                  onClick={() => setDurationOpen((open) => !open)}
                  className="mt-1 flex items-center justify-between gap-space-2xs w-full bg-surface-canvas rounded-lg px-space-sm py-1.5 border border-border-subtle hover:border-border-active transition-colors text-left select-none"
                >
                  <span className="flex items-center gap-space-2xs min-w-0">
                    <Icon name="hourglass_top" className="text-primary text-[16px] shrink-0" />
                    <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                      {dealDurationLabel(studio.duration)}
                    </span>
                  </span>
                  <Icon
                    name={durationOpen ? 'expand_less' : 'expand_more'}
                    className="text-text-tertiary text-[18px] shrink-0"
                  />
                </button>
                {durationOpen && (
                  <div className="mt-1 rounded-lg bg-surface-canvas border border-border-subtle shadow-sm overflow-hidden">
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
                          className={`w-full flex items-center justify-between gap-space-xs px-space-sm py-1.5 text-left transition-colors ${
                            isActive ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'
                          }`}
                        >
                          <span className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                              {option.label}
                            </span>
                            <span className="font-caption text-caption text-text-tertiary">{option.hint}</span>
                          </span>
                          {isActive && <Icon name="check" className="text-primary text-[16px] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin py-space-sm pb-safe flex items-center justify-between gap-space-sm">
        <button
          className="h-[52px] px-space-md rounded-xl font-button-secondary text-button-secondary text-text-secondary bg-surface-subtle active:scale-95 transition-transform flex items-center justify-center"
          type="button"
          onClick={onBack}
        >
          Back to Step 2
        </button>
        <button
          className="h-[52px] flex-1 bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
          type="button"
          onClick={onNext}
        >
          <span>Review &amp; Launch Deal</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
      </div>
    </AppScreen>
  );
}
