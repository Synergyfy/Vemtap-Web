import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
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
}

const MAP_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABS6J6aCf6BOdbKD5Zn86NMf3Q7G3V3Pn-Jyoi8YHmK_n2CqhfHUYunlhDcrDoufgdV78xQMC7p-QPzi_ZPvwvNNIKhmfRwn18Vynz-T3snXNoyWwr5l2DRPHmBY99CzJaN8gz6mptHriUXiJHTwIwu9L6FdNePgRxMOBxR2NLRab5-AtlS2Xi2YrrfjkNv2cjUpE7qmTBWqdhUTqU-dawWsBAceLjSB4gnZP-IZiKRcY9To8CwzmpSQ',
    alt: '',
  },
];

const BRANCHES: Array<{
  key: keyof DealStudioDraft['branches'];
  name: string;
  address: string;
  badge: string;
  hardware: Array<{ icon: string; label: string }>;
  disabled?: boolean;
  note?: string;
}> = [
  {
    key: 'wuseII',
    name: 'Wuse II Flagship Studio',
    address: 'Plot 1428 Adetokunbo Ademola Cres, Wuse II, Abuja',
    badge: 'Active Outlet',
    hardware: [
      { icon: 'fiber_manual_record', label: 'POS Linked' },
      { icon: 'sensors', label: 'NFC Tap Pod Active' },
    ],
  },
  {
    key: 'garkiII',
    name: 'Garki II Branch',
    address: 'Suite 4B, Garki Mall, Area 11, Garki, Abuja',
    badge: 'Active Outlet',
    hardware: [
      { icon: 'fiber_manual_record', label: 'POS Linked' },
      { icon: 'qr_code_scanner', label: 'QR Camera Stand' },
    ],
  },
  {
    key: 'maitama',
    name: 'Maitama Heights',
    address: 'Plot 702 Aguiyi Ironsi St, Maitama District, Abuja',
    badge: 'Coming Soon - Inactive',
    hardware: [],
    disabled: true,
    note: 'Site installation scheduled for Nov 28',
  },
];

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

const SUGGESTED_CLAUSES = ['Valid ID required', 'One per table', 'Not valid on public holidays', 'Subject to seating capacity'];

const HEATMAP_ROWS: Array<{ time: string; cells: Array<{ label: string; tone: string }> }> = [
  {
    time: '12 PM',
    cells: [
      { label: 'M', tone: 'bg-secondary-fixed text-on-secondary-fixed' },
      { label: 'M', tone: 'bg-secondary-fixed text-on-secondary-fixed' },
      { label: 'H', tone: 'bg-primary-fixed-dim text-on-primary-fixed font-bold' },
      { label: 'H', tone: 'bg-primary-fixed-dim text-on-primary-fixed font-bold' },
      { label: 'Peak', tone: 'bg-primary text-on-primary font-bold' },
    ],
  },
  {
    time: '02 PM',
    cells: [
      { label: 'Peak', tone: 'bg-primary-container text-on-primary font-bold' },
      { label: 'Peak', tone: 'bg-primary-container text-on-primary font-bold' },
      { label: 'Peak', tone: 'bg-primary text-on-primary font-bold' },
      { label: 'Peak', tone: 'bg-primary-container text-on-primary font-bold' },
      { label: 'Peak', tone: 'bg-primary text-on-primary font-bold' },
    ],
  },
  {
    time: '04 PM',
    cells: [
      { label: 'Low', tone: 'bg-surface-container text-text-secondary' },
      { label: 'M', tone: 'bg-secondary-fixed text-on-secondary-fixed' },
      { label: 'M', tone: 'bg-secondary-fixed text-on-secondary-fixed' },
      { label: 'H', tone: 'bg-primary-fixed-dim text-on-primary-fixed font-medium' },
      { label: 'H', tone: 'bg-primary-fixed-dim text-on-primary-fixed font-medium' },
    ],
  },
];

export function DesktopDealStudioStep3Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: DesktopDealStudioStep3ScreenProps) {
  const [stepsOpen, setStepsOpen] = useState(true);
  const [termsOpen, setTermsOpen] = useState(true);
  const [daysOpen, setDaysOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [draftStep, setDraftStep] = useState('');
  const [addingStep, setAddingStep] = useState(false);
  const [newStep, setNewStep] = useState('');
  const [newTerm, setNewTerm] = useState('');

  const selectedBranches = BRANCHES.filter((branch) => studio.branches[branch.key]).length;

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

  const addTerm = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      onStudioChange({ terms: [...studio.terms, trimmed] });
    }
  };

  return (
    <BusinessSetupChrome activeNav="deals">
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
            Designate eligible locations, active redemption hours, customer claim steps, and custom restaurant
            policies.
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
                    Toggle merchant outlets enabled for voucher code redemption.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1"
                >
                  <Icon name="add_location_alt" className="text-[16px]" />
                  <span>Manage Outlets</span>
                </button>
              </div>
              <div className="flex flex-col gap-space-sm">
                {BRANCHES.map((branch) => {
                  const active = studio.branches[branch.key];
                  return (
                    <label
                      key={branch.key}
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
                        onChange={(event) =>
                          onStudioChange({ branches: { ...studio.branches, [branch.key]: event.target.checked } })
                        }
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
                        {branch.hardware.length > 0 ? (
                          <div className="flex items-center gap-space-md mt-space-xs font-caption text-caption text-on-surface-variant">
                            {branch.hardware.map((item) => (
                              <span key={item.label} className="flex items-center gap-1">
                                <Icon
                                  name={item.icon}
                                  className={`text-[15px] ${
                                    item.icon === 'fiber_manual_record' ? 'text-badge-discount-text' : ''
                                  }`}
                                />
                                {item.label}
                              </span>
                            ))}
                          </div>
                        ) : (
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
                        <span className="flex-1 font-body-md text-body-md text-on-surface">{term}</span>
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
            <section className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                    Weekly Live Slot Matrix
                  </h2>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Projected customer influx during active windows.
                  </p>
                </div>
                <Icon name="calendar_view_week" className="text-primary text-[20px]" />
              </div>
              <div className="bg-surface-subtle rounded-xl p-space-md">
                <div className="grid grid-cols-6 gap-1 text-center font-caption text-caption font-semibold text-text-secondary mb-2">
                  <div>Time</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                </div>
                <div className="space-y-1.5 font-caption text-caption">
                  {HEATMAP_ROWS.map((row) => (
                    <div key={row.time} className="grid grid-cols-6 gap-1 items-center">
                      <span className="text-text-tertiary">{row.time}</span>
                      {row.cells.map((cell, index) => (
                        <div key={`${cell.label}-${index}`} className={`h-7 rounded flex items-center justify-center ${cell.tone}`}>
                          {cell.label}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-space-md pt-space-xs text-text-secondary font-caption text-caption">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-surface-container" /> Low Flow
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-secondary-fixed" /> Moderate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-primary-fixed-dim" /> High
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-primary-container" /> Peak Demand
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <div className="flex items-center gap-space-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                    <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Catchment Radar</h2>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    3.5 km geofence radius around enabled studios.
                  </p>
                </div>
                <span className="px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                  Dynamic Radius
                </span>
              </div>
              <div
                className="relative w-full h-56 rounded-xl overflow-hidden shadow-sm bg-cover bg-center"
                style={{ backgroundImage: `url('${MAP_IMAGES[0].src}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex flex-col justify-end p-space-md text-on-primary">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-caption text-caption uppercase tracking-wider text-primary-fixed font-bold">
                        Coverage Zones
                      </span>
                      <div className="font-label-md text-label-md font-bold">Wuse II • Garki II • Area 11</div>
                    </div>
                    <div className="px-space-xs py-1 rounded bg-inverse-surface/80 text-on-primary font-caption text-caption font-bold backdrop-blur">
                      3.5 km Geofence
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 animate-ping absolute" />
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg text-on-primary">
                    <Icon name="store" className="text-[16px]" />
                  </div>
                </div>
                <div className="absolute top-2/3 right-1/4 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary-container/20 animate-ping absolute" />
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg text-on-primary">
                    <Icon name="store" className="text-[16px]" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-space-sm mt-space-md">
                <div className="p-space-md bg-surface-subtle rounded-xl">
                  <div className="font-caption text-caption text-text-secondary">Audience In Reach</div>
                  <div className="font-heading-md text-heading-md font-bold text-on-surface mt-1">~34,000</div>
                  <div className="font-caption text-caption text-badge-discount-text font-medium mt-0.5 flex items-center gap-1">
                    <Icon name="trending_up" className="text-[14px]" />
                    <span>Active local seekers</span>
                  </div>
                </div>
                <div className="p-space-md bg-surface-subtle rounded-xl">
                  <div className="font-caption text-caption text-text-secondary">Maitama / Wuse Apps</div>
                  <div className="font-heading-md text-heading-md font-bold text-primary mt-1">19,400</div>
                  <div className="font-caption text-caption text-text-secondary mt-0.5 flex items-center gap-1">
                    <Icon name="smartphone" className="text-[14px]" />
                    <span>Push ready in range</span>
                  </div>
                </div>
              </div>
              <div className="mt-space-md p-space-sm bg-badge-discount-bg text-badge-discount-text rounded-xl flex items-center gap-space-sm font-caption text-caption">
                <Icon name="verified_user" className="text-[18px]" />
                <span>
                  All {selectedBranches} selected branches pass high-speed NFC &amp; QR camera validation checks.
                </span>
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
    </BusinessSetupChrome>
  );
}
