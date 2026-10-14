import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ServiceDraft } from './desktopServiceDraft';

interface DesktopAddServiceStep3ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const CATCHMENT_MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBSK1y_9zAiRozMbCaA4Wjgb1T0kN4BBvvJDULSHdT_WNtDeLtIcCTfUZwExO_S_mmtVSXv4SrpYzHUbxgq-CEMX1ZlJ5K1_wRhkuIJcG_C11OxBHORAZSozVrWPzbTuECYqW8cZUr7FQE7lqbjQjiU_S5PAY9G7GUcdOeGmx5jzG-l5BZfjm-3aa8TEyNSWYW_3CuWTgsUbqfEpyCu1TlKP_3aVdPQ9e4YLZGi0m4kgQoIS7-VYOKb3A';

const CATCHMENT_MAP_LABEL = 'Maitama and Wuse II, Abuja, Nigeria';

const BRANCHES: Array<{
  key: 'maitama' | 'wuseII' | 'garki';
  name: string;
  badge: string;
  badgeClass: string;
  address: string;
  rooms: string;
  hours: string;
  locked?: boolean;
  lockedNote: string;
}> = [
  {
    key: 'maitama',
    name: 'Maitama Heights Studio (Flagship)',
    badge: 'Flagship',
    badgeClass: 'bg-primary-fixed text-on-primary-fixed-variant',
    address: 'Plot 14 Amazon Street, Maitama, Abuja',
    rooms: '3 Treatment Rooms Active',
    hours: 'Mon – Sun, 09:00 - 20:00',
    lockedNote: '',
  },
  {
    key: 'wuseII',
    name: 'Wuse II Sanctuary',
    badge: 'Open Now',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    address: 'Plot 1428 Adetokunbo Ademola Cres, Wuse II, Abuja',
    rooms: '2 Treatment Rooms Active',
    hours: 'Tue – Sun, 10:00 - 21:00',
    lockedNote: '',
  },
  {
    key: 'garki',
    name: 'Garki Branch (Opening June)',
    badge: 'Coming Soon',
    badgeClass: 'bg-surface-container-highest text-on-surface-variant',
    address: 'Area 11 Commercial District, Garki, Abuja',
    rooms: '',
    hours: '',
    locked: true,
    lockedNote: 'Hardware installation & facility inspection in progress',
  },
];

const LEAD_OPTIONS = ['Same day (2 hrs)', '12 hrs ahead', '24 hrs ahead'];
const HORIZON_OPTIONS = ['14 days', '30 days in advance', '60 days'];

const PEAK_BARS: Array<{ x: number; y: number; height: number; className: string }> = [
  { x: 5, y: 50, height: 20, className: 'fill-surface-container-highest' },
  { x: 35, y: 42, height: 28, className: 'fill-surface-container-highest' },
  { x: 65, y: 30, height: 40, className: 'fill-secondary-container' },
  { x: 95, y: 18, height: 52, className: 'fill-primary' },
  { x: 125, y: 10, height: 60, className: 'fill-primary' },
  { x: 155, y: 8, height: 62, className: 'fill-primary-container' },
  { x: 185, y: 14, height: 56, className: 'fill-primary' },
  { x: 215, y: 24, height: 46, className: 'fill-secondary-container' },
  { x: 245, y: 38, height: 32, className: 'fill-surface-container-highest' },
  { x: 275, y: 48, height: 22, className: 'fill-surface-container-highest' },
];

const POLICIES: Array<{
  icon: string;
  iconClass: string;
  title: string;
  badge: string;
  badgeClass: string;
  body: string;
}> = [
  {
    icon: 'event_repeat',
    iconClass: 'bg-surface-container text-primary',
    title: 'Free Cancellation Cutoff',
    badge: '2 Hours Prior',
    badgeClass: 'text-badge-discount-text',
    body: 'Complimentary cancellation up to 2 hours before scheduled session start. Late drops charge 50% reservation fee.',
  },
  {
    icon: 'schedule',
    iconClass: 'bg-surface-container text-primary',
    title: 'Late Arrival Grace Window',
    badge: '15 Minutes',
    badgeClass: 'text-text-primary',
    body: '15 minutes buffer window maintained before the appointment slot is auto-released to nearby walk-in waitlists.',
  },
  {
    icon: 'chat',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Automated WhatsApp Concierge',
    badge: 'T-24h & T-2h',
    badgeClass: 'text-primary',
    body: 'Reminders with geo-pin navigation links automatically triggered 24 hours and 2 hours prior to the session.',
  },
];

export function DesktopAddServiceStep3Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
}: DesktopAddServiceStep3ScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [leadNotice, setLeadNotice] = useState('Same day (2 hrs)');
  const [horizon, setHorizon] = useState('30 days in advance');
  const [concurrent, setConcurrent] = useState(2);

  const toggleBranch = (key: 'maitama' | 'wuseII' | 'garki', checked: boolean) => {
    if (key === 'garki') return;
    onDraftChange({ branches: { ...draft.branches, [key]: checked } });
  };

  const selectAllActive = () => {
    onDraftChange({ branches: { ...draft.branches, maitama: true, wuseII: true } });
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-xl">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 font-caption text-caption text-text-tertiary">
              <span>Catalog Workflow</span>
              <span>/</span>
              <span className="text-text-secondary font-medium">Step 3 of 4: Offerings &amp; Catalog Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-caption text-caption text-text-secondary">Next:</span>
              <span className="font-caption text-caption font-semibold text-primary">Review &amp; Launch</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm mb-2">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <span>Step 3 of 4</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight font-bold">
                Branch Availability &amp; Booking Rules
              </h1>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                Designate target Abuja locations, set room concurrency, and establish client arrival policies.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 min-w-[200px]">
              <div className="flex items-center justify-between w-full font-label-sm text-label-sm">
                <span className="text-text-secondary font-medium">Catalog Setup Progress</span>
                <span className="font-semibold text-primary">75%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-500"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">
                    Available Outlets &amp; Studios
                  </h2>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Toggle facilities eligible to execute this service treatment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={selectAllActive}
                  className="font-label-md text-label-md text-primary font-semibold hover:underline"
                >
                  Select all (2 active)
                </button>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                {BRANCHES.map((branch) => {
                  const checked = draft.branches[branch.key];
                  if (branch.locked) {
                    return (
                      <div
                        key={branch.key}
                        className="p-4 rounded-xl bg-surface-subtle opacity-70 cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <input
                              className="w-5 h-5 rounded text-text-tertiary cursor-not-allowed mt-0.5"
                              disabled
                              type="checkbox"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-label-md text-label-md font-semibold text-text-secondary">
                                  {branch.name}
                                </h3>
                                <span
                                  className={`px-2 py-0.5 rounded-full font-caption text-caption font-medium ${branch.badgeClass}`}
                                >
                                  {branch.badge}
                                </span>
                              </div>
                              <p className="font-caption text-caption text-text-tertiary mt-0.5">{branch.address}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Icon name="lock" className="text-[16px] text-text-tertiary" />
                                <span className="font-caption text-caption text-text-tertiary">
                                  {branch.lockedNote}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="font-caption text-caption text-text-tertiary self-center">Inactive</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={branch.key}
                      className={`p-4 rounded-xl transition-all ${checked ? 'bg-surface-tint-blue' : 'bg-surface-subtle'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <label className="relative flex items-center justify-center mt-0.5 cursor-pointer">
                            <input
                              checked={checked}
                              onChange={(event) => toggleBranch(branch.key, event.target.checked)}
                              className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary-container"
                              type="checkbox"
                            />
                          </label>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                                {branch.name}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${branch.badgeClass}`}
                              >
                                {branch.badge}
                              </span>
                            </div>
                            <p className="font-caption text-caption text-text-secondary mt-0.5">{branch.address}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                              <span className="font-caption text-caption font-medium text-badge-discount-text">
                                {branch.rooms}
                              </span>
                              <span className="text-text-tertiary font-caption text-caption">•</span>
                              <span className="font-caption text-caption text-text-secondary">{branch.hours}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-canvas text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors shadow-sm"
                        >
                          Edit Location Schedule
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Branch Pricing Strategy</h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Determine whether treatment tariffs stay unified or adjust per metropolitan node.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <label
                  className={`relative p-4 rounded-xl cursor-pointer flex flex-col justify-between transition-all ${
                    draft.pricingMode === 'universal'
                      ? 'bg-surface-tint-blue'
                      : 'bg-surface-subtle hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        checked={draft.pricingMode === 'universal'}
                        onChange={() => onDraftChange({ pricingMode: 'universal' })}
                        className="w-4 h-4 text-primary accent-primary-container"
                        name="pricing_mode"
                        type="radio"
                      />
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        Universal Session Price
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-canvas text-primary font-caption text-caption font-semibold">
                      Recommended
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-2">
                    Uniform <strong className="text-text-primary">₦16,000</strong> baseline across all active Abuja
                    studios. Prevents consumer friction and simplified multi-location billing.
                  </p>
                </label>
                <label
                  className={`relative p-4 rounded-xl cursor-pointer flex flex-col justify-between transition-all ${
                    draft.pricingMode === 'tiered'
                      ? 'bg-surface-tint-blue'
                      : 'bg-surface-subtle hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        checked={draft.pricingMode === 'tiered'}
                        onChange={() => onDraftChange({ pricingMode: 'tiered' })}
                        className="w-4 h-4 text-primary accent-primary-container"
                        name="pricing_mode"
                        type="radio"
                      />
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        Tiered Branch Pricing
                      </span>
                    </div>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-2">
                    Customize per studio (e.g. Maitama VIP suites surcharge or localized rent differentials). Requires
                    manual tier setup.
                  </p>
                </label>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">
                Booking Schedule &amp; Slot Rules
              </h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Fine-tune calendar availability, pacing, and walk-in lead safeguards.
              </p>
              <div className="space-y-6 mt-5">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="font-label-md text-label-md font-semibold text-text-primary">
                      Minimum Lead Notice
                    </label>
                    <span className="font-caption text-caption text-text-tertiary">
                      Earliest time before appointment a guest can book online
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LEAD_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLeadNotice(option)}
                        className={
                          leadNotice === option
                            ? 'px-4 py-2 rounded-full font-label-sm text-label-sm font-semibold bg-surface-tint-blue text-primary shadow-sm'
                            : 'px-4 py-2 rounded-full font-label-sm text-label-sm font-medium bg-surface-subtle text-text-secondary hover:bg-surface-container-high transition-colors'
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="font-label-md text-label-md font-semibold text-text-primary">
                      Maximum Booking Horizon
                    </label>
                    <span className="font-caption text-caption text-text-tertiary">
                      How far into future clients can secure reservation slots
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HORIZON_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setHorizon(option)}
                        className={
                          horizon === option
                            ? 'px-4 py-2 rounded-full font-label-sm text-label-sm font-semibold bg-surface-tint-blue text-primary shadow-sm'
                            : 'px-4 py-2 rounded-full font-label-sm text-label-sm font-medium bg-surface-subtle text-text-secondary hover:bg-surface-container-high transition-colors'
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Concurrent Bookings Limit
                    </span>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Simultaneous client capacity permitted within an identical 45-min time window.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-canvas rounded-lg px-2 py-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setConcurrent((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors"
                    >
                      <Icon name="remove" className="text-[18px]" />
                    </button>
                    <span className="font-heading-sm text-heading-sm font-bold text-text-primary min-w-[28px] text-center">
                      {concurrent}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConcurrent((prev) => prev + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors"
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Policies &amp; Automation</h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Enforce operational compliance and pre-appointment client notifications.
              </p>
              <div className="space-y-4 mt-5">
                {POLICIES.map((policy) => (
                  <div key={policy.title} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${policy.iconClass}`}
                    >
                      <Icon name={policy.icon} className="text-[20px]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-label-md text-label-md font-semibold text-text-primary">{policy.title}</h4>
                          {policy.title === 'Automated WhatsApp Concierge' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-badge-discount-bg text-badge-discount-text font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <span className={`font-caption text-caption font-semibold ${policy.badgeClass}`}>
                          {policy.badge}
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">{policy.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  Studio Capacity &amp; Room Matrix
                </h3>
                <span className="font-caption text-caption text-text-secondary">5 Rooms Live</span>
              </div>
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-surface-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary-container" />
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        Maitama Heights Studio
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary font-medium">3 Allocated</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-surface-canvas text-center shadow-xs">
                      <span className="font-caption text-caption block font-bold text-text-primary">Room 1</span>
                      <span className="text-[11px] text-badge-discount-text font-medium">Ready</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-canvas text-center shadow-xs">
                      <span className="font-caption text-caption block font-bold text-text-primary">Room 2</span>
                      <span className="text-[11px] text-badge-discount-text font-medium">Ready</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-canvas text-center shadow-xs">
                      <span className="font-caption text-caption block font-bold text-text-primary">Room 3</span>
                      <span className="text-[11px] text-primary font-medium">VIP Spa</span>
                    </div>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        Wuse II Sanctuary
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary font-medium">2 Allocated</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-surface-canvas text-center shadow-xs">
                      <span className="font-caption text-caption block font-bold text-text-primary">Suite A</span>
                      <span className="text-[11px] text-badge-discount-text font-medium">Hydrotherapy</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-canvas text-center shadow-xs">
                      <span className="font-caption text-caption block font-bold text-text-primary">Suite B</span>
                      <span className="text-[11px] text-badge-discount-text font-medium">Ready</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-caption text-caption font-semibold text-text-primary">
                      Peak Booking Demand Distribution
                    </span>
                    <span className="font-caption text-caption text-primary font-medium">
                      1:00 PM – 5:00 PM Peak
                    </span>
                  </div>
                  <div className="w-full bg-surface-subtle p-3 rounded-xl">
                    <svg
                      className="w-full h-16 text-primary-container"
                      preserveAspectRatio="none"
                      viewBox="0 0 320 70"
                    >
                      {PEAK_BARS.map((bar) => (
                        <rect
                          key={bar.x}
                          className={bar.className}
                          height={bar.height}
                          rx="3"
                          width="22"
                          x={bar.x}
                          y={bar.y}
                        />
                      ))}
                    </svg>
                    <div className="flex justify-between font-caption text-caption text-text-tertiary px-1 pt-1">
                      <span>9 AM</span>
                      <span>12 PM</span>
                      <span className="text-primary font-semibold">3 PM</span>
                      <span>6 PM</span>
                      <span>8 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">
                    Hyperlocal Catchment Radius
                  </h3>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    3.5 km primary delivery &amp; appointment envelope
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="radar" className="text-[18px]" />
                </div>
              </div>
              <div
                role="img"
                aria-label={CATCHMENT_MAP_LABEL}
                className="w-full h-44 bg-cover bg-center relative overflow-hidden flex items-end p-3 shadow-inner"
                style={{ backgroundImage: `url('${CATCHMENT_MAP_IMAGE}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/30 to-transparent" />
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text ring-4 ring-badge-discount-text/30 animate-pulse" />
                    <span className="font-label-sm text-label-sm font-semibold text-inverse-on-surface">
                      Abuja Central Zone
                    </span>
                  </div>
                  <span className="font-caption text-caption font-bold px-2.5 py-1 rounded-full bg-surface-canvas/90 text-primary backdrop-blur-md">
                    ~34,000 Seekers
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-1">
                <div className="p-3 rounded-xl bg-surface-subtle">
                  <span className="font-caption text-caption text-text-secondary block">Maitama Radii</span>
                  <span className="font-label-md text-label-md font-bold text-text-primary">19,400 active apps</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-subtle">
                  <span className="font-caption text-caption text-text-secondary block">Wuse II Radii</span>
                  <span className="font-label-md text-label-md font-bold text-text-primary">14,600 active apps</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-3">
              <button
                type="button"
                onClick={onNext}
                className="w-full h-13 py-3.5 px-6 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary font-semibold flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] hover:bg-primary active:scale-[0.99] transition-all"
              >
                <span>Review &amp; Publish Service</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onBack}
                  className="font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
                >
                  <Icon name="arrow_back" className="text-[18px]" />
                  <span>Back to Step 2: Duration &amp; Pricing</span>
                </button>
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="font-label-sm text-label-sm text-text-tertiary hover:text-primary transition-colors"
                >
                  Save Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
