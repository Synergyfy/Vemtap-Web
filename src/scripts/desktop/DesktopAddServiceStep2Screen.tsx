import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ServiceDraft } from './desktopServiceDraft';

interface DesktopAddServiceStep2ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const DURATION_PILLS: Array<{ mins: number; hint: string }> = [
  { mins: 30, hint: 'Quick Express' },
  { mins: 45, hint: 'Targeted' },
  { mins: 60, hint: 'Standard' },
  { mins: 90, hint: 'Deep Ritual' },
];

const TIER_BADGES: Array<{ label: string; className: string }> = [
  { label: 'Default Tier', className: 'bg-surface-container text-primary' },
];

/** First tier is the default; the rest show the real upcharge over the base price. */
const tierBadge = (index: number, price: number, base: number) => {
  if (index < TIER_BADGES.length) return TIER_BADGES[index];
  const upcharge = base > 0 && price > base ? Math.round(((price - base) / base) * 100) : 0;
  return upcharge > 0
    ? { label: `+${upcharge}% Upcharge`, className: 'bg-badge-discount-bg text-badge-discount-text' }
    : { label: `Tier ${index + 1}`, className: 'bg-surface-container text-primary' };
};

const toNumber = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatWhole = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;

const formatDigits = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? Number(digits).toLocaleString('en-US') : '';
};

export function DesktopAddServiceStep2Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onNav,
}: DesktopAddServiceStep2ScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [calendarSync, setCalendarSync] = useState(true);
  const [whatsappPing, setWhatsappPing] = useState(true);

  const base = toNumber(draft.basePrice);
  const compare = toNumber(draft.comparePrice);
  const saving = compare - base;
  const savingPercent = compare > 0 ? Math.round((saving / compare) * 100) : 0;
  const averageTier =
    draft.tiers.length > 0
      ? draft.tiers.reduce((sum, tier) => sum + toNumber(tier.price), 0) / draft.tiers.length
      : base;

  const removeTier = (id: string) => {
    onDraftChange({ tiers: draft.tiers.filter((tier) => tier.id !== id) });
  };

  const addTier = () => {
    onDraftChange({
      tiers: [
        ...draft.tiers,
        {
          id: `tier-${Date.now()}`,
          name: 'New Tier',
          duration: '60 mins',
          price: '0',
          note: 'Custom Add-on Slot',
        },
      ],
    });
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-xl">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-caption text-caption text-text-secondary">
                <span className="hover:text-primary transition-colors cursor-pointer">Catalog Workflow</span>
                <span className="text-text-tertiary">/</span>
                <span className="text-on-surface font-medium">Step 3 of 4: Offerings &amp; Catalog Setup</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-on-surface">
                Step 2 of 4: Duration, Pricing &amp; Tiers
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-button-secondary text-button-secondary transition-all flex items-center gap-2"
              >
                <Icon name="visibility" className="text-[18px]" />
                <span>Preview Client View</span>
              </button>
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary-container h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: '50%' }}
            />
          </div>
          <div className="flex justify-between items-center text-caption font-caption text-text-secondary px-0.5">
            <span className="font-medium text-primary flex items-center gap-1">
              <Icon name="check_circle" className="text-[16px]" /> 1. Basic Info &amp; Photos
            </span>
            <span className="font-semibold text-primary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-container inline-block" /> 2. Duration, Pricing &amp;
              Tiers (Current)
            </span>
            <span className="text-text-tertiary">3. Branch Allocation &amp; Staff</span>
            <span className="text-text-tertiary">4. Publish &amp; Launch</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="payments" className="text-[22px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-on-surface">Base Session Price</h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Standard client admission rate displayed as baseline before add-ons
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Live in Naira (NGN)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-secondary" htmlFor="base-price-input">
                    Base Price *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-label-md text-label-md font-semibold text-text-tertiary">
                      ₦
                    </span>
                    <input
                      id="base-price-input"
                      type="text"
                      value={draft.basePrice}
                      onChange={(event) => onDraftChange({ basePrice: formatDigits(event.target.value) })}
                      className="w-full pl-9 pr-14 py-3 bg-surface-subtle focus:bg-surface-canvas rounded-xl font-body-md text-body-md text-on-surface font-semibold focus:outline-none transition-all shadow-inner"
                    />
                    <span className="absolute right-4 font-caption text-caption text-text-tertiary font-medium">NGN</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-secondary" htmlFor="standard-price-input">
                    Standard Price
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-label-md text-label-md font-semibold text-text-tertiary">
                      ₦
                    </span>
                    <input
                      id="standard-price-input"
                      type="text"
                      value={draft.standardPrice}
                      onChange={(event) => onDraftChange({ standardPrice: formatDigits(event.target.value) })}
                      className="w-full pl-9 pr-14 py-3 bg-surface-subtle focus:bg-surface-canvas rounded-xl font-body-md text-body-md text-on-surface font-semibold focus:outline-none transition-all shadow-inner"
                    />
                    <span className="absolute right-4 font-caption text-caption text-text-tertiary font-medium">NGN</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-text-secondary" htmlFor="compare-price-input">
                      Compare-at Price
                    </label>
                    <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
                      <Icon name="trending_down" className="text-[14px]" />
                      Save {formatWhole(saving)} ({savingPercent}% OFF)
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-label-md text-label-md font-semibold text-text-tertiary">
                      ₦
                    </span>
                    <input
                      id="compare-price-input"
                      type="text"
                      value={draft.comparePrice}
                      onChange={(event) => onDraftChange({ comparePrice: formatDigits(event.target.value) })}
                      className="w-full pl-9 pr-14 py-3 bg-surface-subtle focus:bg-surface-canvas rounded-xl font-body-md text-body-md text-text-secondary line-through focus:outline-none transition-all shadow-inner"
                    />
                    <span className="absolute right-4 font-caption text-caption text-text-tertiary font-medium">NGN</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-surface-tint-blue text-primary">
                <Icon name="info" className="text-[18px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-on-surface">
                  A struck-through compare-at price improves booking conversion by up to{' '}
                  <strong>26%</strong> across Lagos &amp; Abuja urban salon appointments on VEMTAP.
                </p>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="schedule" className="text-[22px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-on-surface">
                      Service Duration &amp; Turnaround Buffer
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Allocate hands-on treatment time and room turnover buffers
                    </p>
                  </div>
                </div>
              </div>
              <label className="block font-label-md text-label-md text-text-secondary mb-2.5">
                Standard Treatment Length
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {DURATION_PILLS.map((pill) => {
                  const active = draft.durationMins === pill.mins;
                  return (
                    <button
                      key={pill.mins}
                      type="button"
                      onClick={() => onDraftChange({ durationMins: pill.mins })}
                      className={`py-3 px-4 rounded-xl font-label-md text-label-md transition-all flex flex-col items-center justify-center ${
                        active
                          ? 'text-on-primary bg-primary-container shadow-md'
                          : 'text-text-secondary bg-surface-subtle hover:bg-surface-container'
                      }`}
                    >
                      <span className="font-semibold">{pill.mins} mins</span>
                      <span
                        className={`font-caption text-caption ${
                          active ? 'text-on-primary/80' : 'text-text-tertiary'
                        }`}
                      >
                        {pill.hint}
                        {active ? ' (Selected)' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="p-4 rounded-xl bg-surface-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                    <Icon name="cleaning_services" className="text-[20px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        {draft.bufferMins} mins turnaround buffer
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-caption text-caption font-medium">
                        Automatic
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary">
                      Auto-reserves sanitation, room change &amp; therapist breathers between clients.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="layers" className="text-[22px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading-sm text-heading-sm text-on-surface">
                        Service Tiers &amp; Add-ons Matrix
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        Active ({draft.tiers.length} options)
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary">
                      Enable clients to upgrade directly in their booking journey
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-label-sm text-text-secondary">Tier Selector Active</span>
                  <button
                    type="button"
                    onClick={() => onDraftChange({ tiersEnabled: !draft.tiersEnabled })}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${
                      draft.tiersEnabled ? 'bg-primary-container' : 'bg-surface-container-high'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-surface-canvas shadow transform transition-transform ${
                        draft.tiersEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="p-3 bg-surface-subtle rounded-xl mb-4 flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-secondary">
                  Option Group Name: <strong className="text-on-surface">Treatment Depth / Tier</strong>
                </span>
                <button type="button" className="font-caption text-caption text-primary hover:underline font-medium">
                  Rename Option Group
                </button>
              </div>
              <div className="flex flex-col gap-3 mb-4">
                {draft.tiers.map((tier, index) => {
                  const badge = tierBadge(index, toNumber(tier.price), base);
                  return (
                    <div
                      key={tier.id}
                      className="p-4 rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          name="drag_indicator"
                          className="text-text-tertiary cursor-grab active:cursor-grabbing text-[20px]"
                        />
                        <div className="w-8 h-8 rounded-lg bg-surface-canvas flex items-center justify-center font-label-md text-label-md font-bold text-primary shadow-sm">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-md text-label-md font-bold text-on-surface">{tier.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded font-caption text-caption font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary">
                            {tier.duration} session • {tier.note}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pl-7 md:pl-0">
                        <div className="text-right">
                          <span className="font-label-md text-label-md font-bold text-on-surface">₦{tier.price}</span>
                          <div className="font-caption text-caption text-text-secondary">1 client / slot</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1.5 text-text-secondary hover:text-primary rounded-lg transition-colors"
                          >
                            <Icon name="edit" className="text-[20px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTier(tier.id)}
                            className="p-1.5 text-text-secondary hover:text-error rounded-lg transition-colors"
                          >
                            <Icon name="delete" className="text-[20px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={addTier}
                className="w-full py-3.5 px-4 rounded-xl bg-surface-tint-blue hover:bg-surface-container text-primary font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-2"
              >
                <Icon name="add_circle" className="text-[20px]" />
                <span>Add Another Tier or Custom Add-on</span>
              </button>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="calendar_month" className="text-[22px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-on-surface">Online Booking &amp; Slot Engine</h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Define customer-facing availability across weekly operating hours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">
                    Active Calendar Sync
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalendarSync((prev) => !prev)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${
                      calendarSync ? 'bg-primary-container' : 'bg-surface-container-high'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-surface-canvas shadow transform transition-transform ${
                        calendarSync ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-high/60">
                <div className="flex items-center gap-2.5">
                  <Icon name="event_busy" className="text-secondary text-[20px]" />
                  <div>
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface block">
                      Public Holidays &amp; Blockout Dates
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Nigerian National Holidays automatically synced
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-surface-canvas hover:bg-surface-subtle text-on-surface font-label-sm text-label-sm font-medium shadow-sm transition-all"
                >
                  Manage Exclusions
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-surface-canvas rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                      <Icon name="chat" className="text-[20px]" />
                    </div>
                    <div>
                      <span className="font-label-md text-label-md font-bold text-on-surface block">
                        Instant WhatsApp Pings
                      </span>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        Send automated instant WhatsApp ping to confirm high-value visits &amp; reduce no-shows.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-caption text-caption font-semibold text-badge-discount-text">
                      {whatsappPing ? 'Automation Enabled' : 'Automation Paused'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWhatsappPing((prev) => !prev)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
                        whatsappPing ? 'bg-badge-discount-text' : 'bg-surface-container-high'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-surface-canvas shadow transform transition-transform ${
                          whatsappPing ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="bg-surface-tint-blue rounded-2xl p-5 shadow-sm flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                    <Icon name="verified_user" className="text-[20px]" />
                  </div>
                  <div>
                    <span className="font-label-md text-label-md font-bold text-primary block">
                      Zero-Upfront Payout Guarantee
                    </span>
                    <p className="font-caption text-caption text-on-surface mt-1 leading-snug">
                      Customers pay directly at your salon after treatment. VEMTAP never holds your payout or charges
                      gateway checkout cuts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="analytics" className="text-primary text-[20px]" />
                  <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider">
                    Session Economics
                  </h3>
                </div>
                <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container text-primary font-medium">
                  Abuja Benchmarks
                </span>
              </div>
              <div className="mb-5 pb-5 bg-surface-subtle rounded-xl p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-caption text-caption text-text-secondary">Average Session Price</span>
                  <span className="font-display-sm text-display-sm font-bold text-on-surface">
                    {formatWhole(averageTier)}
                  </span>
                </div>
                <span className="font-caption text-caption text-text-tertiary mt-1 flex items-center gap-1">
                  <Icon name="check_circle" className="text-[14px] text-badge-discount-text" />
                  {draft.tiers.length > 0
                    ? 'Averaged across your tier prices'
                    : 'Matches your base session price'}
                </span>
              </div>
              <div className="flex items-center justify-between text-body-md font-body-md mb-5 pb-5 border-b border-border-subtle/60">
                <span className="text-text-secondary font-label-md text-label-md">VEMTAP Platform Fee</span>
                <span className="font-bold text-primary">₦0.00 (Zero Gateway Fee)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-tint-blue text-on-surface">
                <div className="flex items-start gap-2.5">
                  <Icon name="insights" className="text-primary text-[18px] shrink-0 mt-0.5" />
                  <p className="font-caption text-caption">
                    <strong>Abuja Market Insight:</strong> Offering 3 tiered options increases average booking value by{' '}
                    <strong>38%</strong> compared to single fixed-rate services.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-text-secondary">
                  <Icon name="support_agent" className="text-[18px]" />
                </div>
                <div>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface block">
                    Need pricing help?
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Chat with our Abuja salon partner desk
                  </span>
                </div>
              </div>
              <Icon name="chevron_right" className="text-text-tertiary text-[18px]" />
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
              <span>Back to Step 1: Basics &amp; Media</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              <span>Continue to Branch Availability</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
