import { useState } from 'react';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ServiceDraft } from './desktopServiceDraft';
import { resolveServiceSector, getServiceSectorPreset } from '../serviceClassification';
import { PRESET_POLICIES, type ServicePolicy } from '../serviceStudioShared';

interface DesktopAddServiceStep3ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const LEAD_OPTIONS = ['Same day (2 hrs)', '12 hrs ahead', '24 hrs ahead'];
const HORIZON_OPTIONS = ['14 days', '30 days in advance', '60 days'];

export function DesktopAddServiceStep3Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
}: DesktopAddServiceStep3ScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const leadNotice = draft.leadNotice ?? 'Same day (2 hrs)';
  const horizon = draft.bookingHorizon ?? '30 days in advance';
  const concurrent = draft.concurrentBookings ?? 2;

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

  // Sector and suggested policies derived from the inherited business classification
  const sector = resolveServiceSector([draft.primaryCategory], [draft.subCategory]);
  const preset = getServiceSectorPreset(sector);

  // The business's real branches; the choice is kept in `locations` (branch ids).
  const { branches: liveBranches } = useBusinessBranch();
  const branchCards = liveBranches
    .filter((branch) => branch.id)
    .map((branch) => ({
      key: branch.id as string,
      name: branch.name,
      badge: branch.isMainBranch ? 'Main' : 'Branch',
      badgeClass: branch.isMainBranch
        ? 'bg-primary-fixed text-on-primary-fixed-variant'
        : 'bg-surface-container text-text-secondary',
      address: branch.area || 'No address on file',
    }));
  const selectedBranches = branchCards.filter((branch) => draft.locations.includes(branch.key));
  const isBranchOn = (key: string) => draft.locations.includes(key);

  const toggleBranch = (key: string, checked: boolean) => {
    onDraftChange({
      locations: checked ? [...new Set([...draft.locations, key])] : draft.locations.filter((id) => id !== key),
    });
  };

  const selectAllActive = () => {
    onDraftChange({ locations: branchCards.map((branch) => branch.key) });
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
                Choose your branches, set booking concurrency, and establish client arrival policies.
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
          <div className="lg:col-span-12 flex flex-col gap-6">
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
                  Select all ({branchCards.length} active)
                </button>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                {branchCards.length === 0 && (
                  <p className="p-4 rounded-xl bg-surface-subtle font-caption text-caption text-text-secondary">
                    No branches yet — add your business locations in your business profile, then they will appear here
                    for this service.
                  </p>
                )}
                {branchCards.map((branch) => {
                  const checked = isBranchOn(branch.key);
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
                    One price across all selected branches. Prevents consumer friction and simplifies multi-location
                    billing.
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
                    Customize pricing per branch or location. Requires manual tier setup.
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
                        onClick={() => onDraftChange({ leadNotice: option })}
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
                        onClick={() => onDraftChange({ bookingHorizon: option })}
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
                      onClick={() => onDraftChange({ concurrentBookings: Math.max(1, concurrent - 1) })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors"
                    >
                      <Icon name="remove" className="text-[18px]" />
                    </button>
                    <span className="font-heading-sm text-heading-sm font-bold text-text-primary min-w-[28px] text-center">
                      {concurrent}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDraftChange({ concurrentBookings: concurrent + 1 })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors"
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Policies &amp; Automation</h2>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Operational standards and booking rules tailored for your {preset.label} service.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestorePresets}
                    className="font-caption text-caption font-semibold px-3 py-1.5 rounded-full bg-surface-subtle hover:bg-surface-container text-text-secondary transition-colors"
                  >
                    Restore Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingCustomPolicy(true)}
                    className="font-caption text-caption font-semibold px-3 py-1.5 rounded-full bg-surface-tint-blue hover:bg-primary-container text-primary hover:text-on-primary transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="add" className="text-[14px]" />
                    <span>Add Custom Policy</span>
                  </button>
                </div>
              </div>

              {/* Add Custom Policy Form */}
              {addingCustomPolicy && (
                <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-surface-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Add Custom Service Policy
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
                    <label className="block font-caption text-caption text-text-secondary mb-1">Policy Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Deposit Required, Dress Code..."
                      className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-outline/20 font-body-sm text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block font-caption text-caption text-text-secondary mb-1">Policy Terms</label>
                    <textarea
                      rows={2}
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      placeholder="Specify terms, deadlines, and customer obligations..."
                      className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-outline/20 font-body-sm text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAddingCustomPolicy(false)}
                      className="px-3 py-1.5 rounded-lg text-text-secondary hover:bg-surface-container font-label-sm text-label-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomPolicy}
                      disabled={!newTitle.trim() || !newBody.trim()}
                      className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary disabled:opacity-50 transition-colors"
                    >
                      Add Policy
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 mt-5">
                {policies.map((policy) => {
                  const isEditing = editingPolicyId === policy.id;
                  const isLocked = Boolean(policy.locked || policy.removable === false);

                  return (
                    <div
                      key={policy.id}
                      className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-subtle transition-all"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-surface-canvas border border-outline/20 font-label-md text-label-md font-semibold text-text-primary"
                          />
                          <textarea
                            rows={2}
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-outline/20 font-body-sm text-body-sm text-text-primary resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingPolicyId(null)}
                              className="px-3 py-1 rounded-lg text-text-secondary hover:bg-surface-container font-label-sm text-label-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSavePolicyEdit(policy.id)}
                              className="px-3 py-1 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isLocked
                                ? 'bg-surface-container text-text-secondary'
                                : 'bg-surface-container text-primary'
                            }`}
                          >
                            <Icon name={isLocked ? 'lock' : 'verified_user'} className="text-[20px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                                  {policy.title}
                                </h4>
                                {isLocked ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-container text-text-secondary font-bold uppercase">
                                    Locked / Platform
                                  </span>
                                ) : policy.preset ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-badge-discount-bg text-badge-discount-text font-bold uppercase">
                                    Preset
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-tint-blue text-primary font-bold uppercase">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditPolicy(policy)}
                                  className="p-1 text-text-secondary hover:text-primary rounded transition-colors"
                                  title="Edit Policy"
                                >
                                  <Icon name="edit" className="text-[16px]" />
                                </button>
                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePolicy(policy.id)}
                                    className="p-1 text-text-secondary hover:text-error rounded transition-colors"
                                    title="Delete Policy"
                                  >
                                    <Icon name="delete" className="text-[16px]" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="font-caption text-caption text-text-secondary mt-1">{policy.body}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-badge-discount-bg text-badge-discount-text">
                    <Icon name="whatsapp" className="text-[20px]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                          Automated WhatsApp Concierge
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-badge-discount-bg text-badge-discount-text font-bold uppercase">
                          Active
                        </span>
                      </div>
                      <span className="font-caption text-caption font-semibold text-primary">
                        T-24h &amp; T-2h
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Appointment reminders with geo-pin navigation links automatically triggered 24 hours and 2 hours prior to the session.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  Selected Branches
                </h3>
                <span className="font-caption text-caption text-text-secondary">{selectedBranches.length} selected</span>
              </div>
              <div className="space-y-4">
                {selectedBranches.length === 0 && (
                  <p className="p-3.5 rounded-xl bg-surface-subtle font-caption text-caption text-text-secondary">
                    Select branches above to see them here.
                  </p>
                )}
                {selectedBranches.map((branch) => (
                  <div key={branch.key} className="p-3.5 rounded-xl bg-surface-subtle">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary-container" />
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        {branch.name}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-1">{branch.address}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-caption text-caption font-semibold text-text-primary">
                      Concurrent Bookings Per Slot
                    </span>
                    <span className="font-caption text-caption text-primary font-medium">{concurrent}</span>
                  </div>
                  <p className="p-3 rounded-xl bg-surface-subtle font-caption text-caption text-text-secondary">
                    The same number of clients can be booked in each open slot across the selected branches.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Step 2: Duration &amp; Pricing</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              <span>Review &amp; Publish Service</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
