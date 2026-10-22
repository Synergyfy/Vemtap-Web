import { LiveAvailabilityStep } from '../components/business/LiveItemSteps';
import { hasApiConfig } from '../services/api/client';
import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { resolveServiceSector, getServiceSectorPreset } from './serviceClassification';
import type { ServiceDraft } from './serviceDraft';
import { PRESET_POLICIES, type ServicePolicy } from './serviceStudioShared';

interface BusinessAddServiceStep3ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

interface OutletCard {
  key: 'maitama' | 'wuseII';
  name: string;
  badge?: string;
  address: string;
  rooms: string;
}

const OUTLETS: OutletCard[] = [
  {
    key: 'maitama',
    name: 'Maitama Heights Studio',
    badge: 'Flagship',
    address: 'Plot 14 Amazon Street, Maitama',
    rooms: '3 Treatment Rooms Active',
  },
  {
    key: 'wuseII',
    name: 'Wuse II Sanctuary',
    address: 'Plot 1428 Adetokunbo Ademola Cres',
    rooms: '2 Treatment Rooms Active',
  },
];

const LEAD_OPTIONS = ['Same day (2 hrs)', '12 hrs ahead', '24 hrs ahead'];
const HORIZON_OPTIONS = ['14 days', '30 days in advance', '60 days'];

function DemoBusinessAddServiceStep3Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessAddServiceStep3ScreenProps) {
  const lead = draft.leadNotice ?? LEAD_OPTIONS[0];
  const horizon = draft.bookingHorizon ?? HORIZON_OPTIONS[1];
  const capacity = draft.concurrentBookings ?? 2;

  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const [addingCustomPolicy, setAddingCustomPolicy] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const policies: ServicePolicy[] =
    draft.policies && draft.policies.length > 0 ? draft.policies : PRESET_POLICIES;

  const handleStartEditPolicy = (policy: ServicePolicy) => {
    setEditingPolicyId(policy.id);
    setEditTitle(policy.title);
    setEditBody(policy.body);
  };

  const handleSavePolicyEdit = (id: string) => {
    const updated = policies.map((p) =>
      p.id === id ? { ...p, title: editTitle.trim(), body: editBody.trim() } : p
    );
    onDraftChange({ policies: updated });
    setEditingPolicyId(null);
  };

  const handleDeletePolicy = (id: string) => {
    const updated = policies.filter((p) => p.id !== id);
    onDraftChange({ policies: updated });
  };

  const handleAddCustomPolicy = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const newPolicy: ServicePolicy = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      preset: false,
      removable: true,
    };
    onDraftChange({ policies: [...policies, newPolicy] });
    setNewTitle('');
    setNewBody('');
    setAddingCustomPolicy(false);
  };

  const handleRestorePresets = () => {
    onDraftChange({ policies: [...PRESET_POLICIES] });
  };

  // Suggested policies derived from inherited business classification
  const sector = resolveServiceSector([draft.primaryCategory], [draft.subCategory]);
  const preset = getServiceSectorPreset(sector);

  const allSelected = draft.branches.maitama && draft.branches.wuseII;

  const toggleAll = () => {
    onDraftChange({
      branches: { ...draft.branches, maitama: !allSelected, wuseII: !allSelected },
    });
  };

  const toggleOutlet = (key: 'maitama' | 'wuseII') => {
    onDraftChange({ branches: { ...draft.branches, [key]: !draft.branches[key] } });
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1 truncate px-space-xs">
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">
              {'Add Service   Step 3: Branch Availability & Appointment Rules'}
            </h1>
          </div>
          <div className="flex items-center gap-space-xs -mr-2">
            <button
              aria-label="Save draft"
              className="h-11 min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-all"
              type="button"
              onClick={onSaveDraft}
            >
              Draft
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-md pb-space-sm flex flex-col gap-space-xs bg-surface-container-low">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Step 3 of 4: Availability &amp; Rules
            </span>
            <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary">
              75% Complete
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: '75%' }}
            />
          </div>
          <p className="font-caption text-caption text-text-secondary mt-1">
            Select which branches offer this service and set booking schedule windows.
          </p>
        </div>

        <div className="flex flex-col gap-space-xl px-margin pt-space-lg">
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon name="storefront" className="text-primary text-[20px]" />
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Available Outlets &amp; Studios</h2>
              </div>
              <button
                className="font-label-sm text-label-sm text-primary font-semibold hover:opacity-80 active:scale-95 transition-all"
                type="button"
                onClick={toggleAll}
              >
                {allSelected ? 'Deselect all' : 'Select all (2 active)'}
              </button>
            </div>
            <div className="flex flex-col gap-space-sm">
              {OUTLETS.map((outlet) => {
                const checked = draft.branches[outlet.key];
                return (
                  <div
                    key={outlet.key}
                    className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] flex flex-col gap-space-sm transition-all"
                  >
                    <div className="flex items-start gap-space-sm">
                      <label className="relative flex items-center justify-center cursor-pointer mt-0.5">
                        <input
                          checked={checked}
                          className="peer sr-only"
                          type="checkbox"
                          onChange={() => toggleOutlet(outlet.key)}
                        />
                        <div className="w-5 h-5 rounded-lg bg-surface-container flex items-center justify-center peer-checked:bg-primary text-transparent peer-checked:text-on-primary transition-all shadow-sm">
                          <Icon className="text-[16px] font-bold" name="check" />
                        </div>
                      </label>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-body-md text-body-md font-semibold text-text-primary truncate">
                            {outlet.name}
                          </h3>
                          {outlet.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold">
                              {outlet.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                          {outlet.address}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                          <span className="font-caption text-caption font-medium text-badge-discount-text">
                            {outlet.rooms}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-space-xs flex justify-end">
                      <button
                        className="font-button-secondary text-button-secondary text-primary hover:opacity-80 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-surface-tint-blue active:scale-95 transition-all"
                        type="button"
                      >
                        <Icon name="edit_calendar" className="text-[16px]" />
                        <span>Edit Location Schedule</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="bg-surface-subtle/80 rounded-xl p-space-md shadow-none flex items-start gap-space-sm opacity-70">
                <div className="w-5 h-5 rounded-lg bg-surface-container-high flex items-center justify-center text-text-tertiary mt-0.5">
                  <Icon name="lock" className="text-[14px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-body-md text-body-md font-semibold text-text-secondary truncate">
                      Garki Branch
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
                      Opening June
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary truncate mt-0.5">
                    Area 11 Commercial District, Garki
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-1.5">
              <Icon name="payments" className="text-primary text-[20px]" />
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Branch Pricing Mode</h2>
            </div>
            <div className="flex flex-col gap-space-xs">
              <label className="bg-surface-container-lowest p-space-md rounded-xl flex items-start gap-space-sm cursor-pointer shadow-[0_2px_8px_rgba(13,37,76,0.03)] hover:bg-surface-tint-blue/30 transition-all">
                <input
                  checked={draft.pricingMode === 'universal'}
                  className="peer sr-only"
                  name="pricing_mode"
                  type="radio"
                  onChange={() => onDraftChange({ pricingMode: 'universal' })}
                />
                <div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center peer-checked:bg-primary text-transparent peer-checked:text-on-primary mt-0.5 shadow-sm transition-all">
                  <span className="w-2 h-2 rounded-full bg-on-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-body-md font-semibold text-text-primary">
                    Universal Session Price
                  </p>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Uniform ₦16,000 baseline across all active Abuja studios.
                  </p>
                </div>
              </label>
              <label className="bg-surface-container-lowest p-space-md rounded-xl flex items-start gap-space-sm cursor-pointer shadow-[0_2px_8px_rgba(13,37,76,0.03)] hover:bg-surface-tint-blue/30 transition-all">
                <input
                  checked={draft.pricingMode === 'tiered'}
                  className="peer sr-only"
                  name="pricing_mode"
                  type="radio"
                  onChange={() => onDraftChange({ pricingMode: 'tiered' })}
                />
                <div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center peer-checked:bg-primary text-transparent peer-checked:text-on-primary mt-0.5 shadow-sm transition-all">
                  <span className="w-2 h-2 rounded-full bg-on-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-body-md font-semibold text-text-primary">
                    Tiered Branch Pricing
                  </p>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Customize per studio (e.g. Maitama VIP suites premium or rent differentials).
                  </p>
                </div>
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-space-md">
            <div className="flex items-center gap-1.5">
              <Icon name="tune" className="text-primary text-[20px]" />
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Booking Schedule &amp; Slot Rules</h2>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-space-xs shadow-[0_2px_8px_rgba(13,37,76,0.03)]">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-text-primary">
                  Minimum Lead Notice
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Earliest time before appointment a guest can book online.
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                {LEAD_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={`px-3 py-2 rounded-full font-label-sm text-label-sm font-medium transition-all whitespace-nowrap ${
                      lead === option
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                    }`}
                    type="button"
                    onClick={() => onDraftChange({ leadNotice: option })}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-space-xs shadow-[0_2px_8px_rgba(13,37,76,0.03)]">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-text-primary">
                  Maximum Booking Horizon
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  How far into the future reservations are unlocked.
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                {HORIZON_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={`px-3 py-2 rounded-full font-label-sm text-label-sm font-medium transition-all whitespace-nowrap ${
                      horizon === option
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                    }`}
                    type="button"
                    onClick={() => onDraftChange({ bookingHorizon: option })}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl flex items-center justify-between gap-space-sm shadow-[0_2px_8px_rgba(13,37,76,0.03)]">
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-label-md text-label-md font-semibold text-text-primary">
                  Concurrent Bookings
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Simultaneous client capacity per time window.
                </span>
              </div>
              <div className="flex items-center gap-2 bg-surface-subtle p-1 rounded-xl">
                <button
                  aria-label="Decrease concurrent bookings"
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-all shadow-sm"
                  type="button"
                  onClick={() => onDraftChange({ concurrentBookings: Math.max(1, capacity - 1) })}
                >
                  <Icon name="remove" className="text-[18px]" />
                </button>
                <div className="px-2 flex items-center justify-center min-w-[54px]">
                  <span className="font-heading-sm text-heading-sm font-bold text-primary">{capacity}</span>
                  <span className="font-caption text-caption text-text-secondary ml-1">slots</span>
                </div>
                <button
                  aria-label="Increase concurrent bookings"
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-all shadow-sm"
                  type="button"
                  onClick={() => onDraftChange({ concurrentBookings: Math.min(12, capacity + 1) })}
                >
                  <Icon name="add" className="text-[18px]" />
                </button>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Icon name="verified_user" className="text-primary text-[20px]" />
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Policies &amp; Automation</h2>
                <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary">
                  {preset.label} Presets
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestorePresets}
                  className="font-caption text-caption font-semibold px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-text-secondary transition-colors"
                >
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => setAddingCustomPolicy(true)}
                  className="font-caption text-caption font-semibold px-2.5 py-1 rounded-full bg-surface-tint-blue hover:bg-primary-container text-primary hover:text-on-primary transition-colors flex items-center gap-1"
                >
                  <Icon name="add" className="text-[14px]" />
                  <span>Custom Policy</span>
                </button>
              </div>
            </div>

            {/* Add Custom Policy Form */}
            {addingCustomPolicy && (
              <div className="p-space-sm rounded-xl border border-primary/20 bg-surface-container-lowest space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Add Custom Policy
                  </span>
                  <button
                    type="button"
                    onClick={() => setAddingCustomPolicy(false)}
                    className="text-text-tertiary hover:text-text-secondary"
                  >
                    <Icon name="close" className="text-[18px]" />
                  </button>
                </div>
                <div>
                  <label className="block font-caption text-caption text-text-secondary mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Deposit Required, Dress Code..."
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-subtle border border-outline/20 font-body-sm text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-caption text-caption text-text-secondary mb-1">Terms</label>
                  <textarea
                    rows={2}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Specify conditions and rules..."
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-subtle border border-outline/20 font-body-sm text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAddingCustomPolicy(false)}
                    className="px-3 py-1 rounded-lg text-text-secondary hover:bg-surface-container font-label-sm text-label-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomPolicy}
                    disabled={!newTitle.trim() || !newBody.trim()}
                    className="px-3.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-md shadow-[0_2px_8px_rgba(13,37,76,0.03)]">
              {policies.map((policy) => {
                const isEditing = editingPolicyId === policy.id;
                const isLocked = Boolean(policy.locked || policy.removable === false);

                return (
                  <div
                    key={policy.id}
                    className="flex flex-col gap-2 p-2.5 rounded-xl bg-surface-subtle transition-all"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg bg-surface-canvas border border-outline/20 font-label-md text-label-md font-semibold text-text-primary"
                        />
                        <textarea
                          rows={2}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg bg-surface-canvas border border-outline/20 font-body-sm text-body-sm text-text-primary resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPolicyId(null)}
                            className="px-2.5 py-1 rounded-lg text-text-secondary hover:bg-surface-container font-label-sm text-label-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSavePolicyEdit(policy.id)}
                            className="px-3 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-space-sm">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isLocked
                              ? 'bg-surface-container text-text-secondary'
                              : 'bg-surface-container text-primary'
                          }`}
                        >
                          <Icon name={isLocked ? 'lock' : 'verified_user'} className="text-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <p className="font-label-md text-label-md font-semibold text-text-primary">
                                {policy.title}
                              </p>
                              {isLocked ? (
                                <span className="text-[10px] font-bold uppercase text-text-secondary bg-surface-container px-1 rounded">
                                  Locked
                                </span>
                              ) : policy.preset ? (
                                <span className="text-[10px] font-bold uppercase text-badge-discount-text bg-badge-discount-bg px-1 rounded">
                                  Preset
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase text-primary bg-surface-tint-blue px-1 rounded">
                                  Custom
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditPolicy(policy)}
                                className="p-1 text-text-secondary hover:text-primary transition-colors"
                              >
                                <Icon name="edit" className="text-[16px]" />
                              </button>
                              {!isLocked && (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePolicy(policy.id)}
                                  className="p-1 text-text-secondary hover:text-error transition-colors"
                                >
                                  <Icon name="delete" className="text-[16px]" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="font-caption text-caption text-text-secondary mt-0.5">
                            {policy.body}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="bg-surface-tint-blue p-space-sm rounded-xl flex items-start gap-space-xs mt-1">
                <Icon className="text-primary text-[20px] shrink-0 mt-0.5" filled name="sms" />
                <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
                  <strong className="font-semibold text-primary">Automated WhatsApp Concierge:</strong> Reminders are
                  automatically triggered 24 hours and 2 hours prior to the session.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/90 backdrop-blur-xl px-margin py-3 pb-safe shadow-[0_-4px_20px_rgba(17,24,39,0.06)]">
        <div className="flex items-center gap-space-sm max-w-lg mx-auto">
          <button
            className="h-[52px] px-space-md rounded-2xl bg-surface-container text-text-primary font-button-secondary text-button-secondary font-medium hover:bg-surface-container-high active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            Back
          </button>
          <button
            className="h-[52px] flex-1 rounded-2xl bg-primary text-on-primary font-button-primary text-button-primary font-semibold flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:bg-primary-container active:scale-[0.98] transition-all"
            type="button"
            onClick={onNext}
          >
            <span>Review &amp; Publish</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
        </div>
      </div>
    </AppScreen>
  );
}

/** Live: the business's real branches and item; demo keeps the designed screen. */
export function BusinessAddServiceStep3Screen(props: BusinessAddServiceStep3ScreenProps) {
  if (!hasApiConfig()) return <DemoBusinessAddServiceStep3Screen {...props} />;
  return (
    <BusinessSubScreen title="Where it sells" onBack={props.onBack}>
      <LiveAvailabilityStep
        item={{
    kind: 'service',
    title: props.draft.title,
    image: /^https?:\/\//.test(props.draft.image) ? props.draft.image : undefined,
    category: props.draft.subCategory,
    description: props.draft.description,
    price: props.draft.standardPrice || props.draft.basePrice,
    was: props.draft.comparePrice,
    details: [['Duration', `${props.draft.durationMins} mins`]],
  }}
        selected={props.draft.locations ?? []}
        onChange={(ids) => props.onDraftChange({ locations: ids })}
        onBack={props.onBack}
        onNext={props.onNext}
        nextLabel="Review & publish"
      />
    </BusinessSubScreen>
  );
}
