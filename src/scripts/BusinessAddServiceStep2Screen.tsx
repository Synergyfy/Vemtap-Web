import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { ServiceDraft } from './serviceDraft';

interface BusinessAddServiceStep2ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

const parseNaira = (value: string) => parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function BusinessAddServiceStep2Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessAddServiceStep2ScreenProps) {
  const base = parseNaira(draft.basePrice);
  const compare = parseNaira(draft.comparePrice);
  const savings = compare - base;
  const percentOff = compare > 0 ? Math.round((savings / compare) * 100) : 0;

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
          note: '1 client / slot',
        },
      ],
    });
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
              {'Add Service   Step 2: Duration Pricing & Staff/Tiers'}
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
        <div className="px-margin pt-space-md pb-space-sm bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                Step 2 of 4
              </span>
            </div>
            <span className="font-caption text-caption bg-surface-tint-blue text-primary px-2.5 py-1 rounded-full font-semibold">
              50% Completed
            </span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mb-space-sm">
            <div
              className="bg-primary-container h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: '50%' }}
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-heading-md text-heading-md text-text-primary">Duration &amp; Pricing</h2>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              Define treatment duration, session pricing, tiered options, and specialist rates.
            </p>
          </div>
        </div>

        <div className="px-margin flex flex-col gap-space-lg mt-space-md">
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="payments" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Base Session Price</h3>
                  <p className="font-caption text-caption text-text-secondary">Standard one-on-one booking rate</p>
                </div>
              </div>
              <span className="font-caption text-caption bg-surface-container-low text-primary px-2 py-0.5 rounded font-medium">
                Required
              </span>
            </div>
            <div className="grid grid-cols-1 gap-space-sm">
              <div>
                <label className="font-label-sm text-label-sm text-text-primary font-medium mb-1.5 block" htmlFor="service-base-price">
                  Standard Base Price
                </label>
                <div className="flex items-center bg-surface-container-low rounded-xl px-space-md h-[52px]">
                  <span className="font-heading-sm text-heading-sm text-text-secondary mr-2 font-bold">₦</span>
                  <input
                    className="w-full bg-transparent font-heading-lg text-heading-lg text-text-primary font-bold focus:outline-none"
                    id="service-base-price"
                    inputMode="numeric"
                    placeholder="0"
                    type="text"
                    value={draft.basePrice}
                    onChange={(event) => onDraftChange({ basePrice: event.target.value })}
                  />
                  <span className="font-caption text-caption text-badge-discount-text font-medium bg-badge-discount-bg px-2 py-1 rounded-lg">
                    NGN
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="service-compare-price">
                    Compare-at Price <span className="font-caption text-caption text-text-tertiary">(Optional)</span>
                  </label>
                  {savings > 0 && (
                    <span className="font-caption text-caption text-badge-discount-text font-semibold bg-badge-discount-bg px-2 py-0.5 rounded-full">
                      Save ₦{formatAmount(savings)} ({percentOff}% OFF)
                    </span>
                  )}
                </div>
                <div className="flex items-center bg-surface-container-low rounded-xl px-space-md h-[52px]">
                  <span className="font-body-md text-body-md text-text-tertiary mr-2">₦</span>
                  <input
                    className="w-full bg-transparent font-body-lg text-body-lg text-text-secondary line-through focus:outline-none"
                    id="service-compare-price"
                    inputMode="numeric"
                    placeholder="Optional original value"
                    type="text"
                    value={draft.comparePrice}
                    onChange={(event) => onDraftChange({ comparePrice: event.target.value })}
                  />
                  <Icon name="local_offer" className="text-text-tertiary text-[20px]" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-text-primary font-medium">Service Duration</label>
                <span className="font-caption text-caption text-text-secondary">Client service window</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {DURATION_OPTIONS.map((minutes) => {
                  const isActive = draft.durationMins === minutes;
                  return (
                    <button
                      key={minutes}
                      className={`h-9 rounded-full font-label-md text-label-md whitespace-nowrap active:scale-95 transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'px-4 bg-primary text-on-primary shadow-sm'
                          : 'px-3.5 bg-surface-container-low text-text-secondary'
                      }`}
                      type="button"
                      onClick={() => onDraftChange({ durationMins: minutes })}
                    >
                      {isActive && <Icon name="check" className="text-[16px]" />} {minutes} mins
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low mt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <Icon name="sanitizer" className="text-[18px]" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      {draft.bufferMins} mins turnaround buffer
                    </span>
                    <Icon name="info" className="text-text-tertiary text-[16px]" />
                  </div>
                  <span className="font-caption text-caption text-text-secondary">
                    Auto-reserves sanitation time between clients
                  </span>
                </div>
              </div>
              <button
                className="text-primary font-label-sm text-label-sm font-semibold hover:underline"
                type="button"
              >
                Change
              </button>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Service Tiers &amp; Add-ons</h3>
                  <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-2 py-0.5 rounded-full font-bold">
                    {draft.tiers.length} active
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary">Upsell customized packages &amp; add-ons</p>
              </div>
              <button
                aria-checked={draft.tiersEnabled}
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors focus:outline-none ${
                  draft.tiersEnabled ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
                id="tier-toggle"
                role="switch"
                type="button"
                onClick={() => onDraftChange({ tiersEnabled: !draft.tiersEnabled })}
              >
                <span
                  className={`w-6 h-6 rounded-full bg-surface shadow-md transform transition-transform ${
                    draft.tiersEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {draft.tiersEnabled && (
              <>
                <div className="flex items-center justify-between bg-surface-container-low px-space-sm py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-caption text-caption text-text-secondary font-medium">Option Group:</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                      Treatment Depth / Tier
                    </span>
                  </div>
                  <button
                    className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-0.5"
                    type="button"
                  >
                    <Icon name="edit" className="text-[16px]" /> Edit
                  </button>
                </div>
                <div className="flex flex-col gap-space-sm">
                  {draft.tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md text-label-md text-text-primary font-semibold">{tier.name}</span>
                          <span className="bg-surface-tint-blue text-primary font-caption text-caption px-2 py-0.5 rounded-full">
                            {tier.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-label-md text-label-md text-primary font-bold">₦{tier.price}</span>
                          <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                            <Icon name="person" className="text-[14px]" /> {tier.note}
                          </span>
                        </div>
                      </div>
                      <button
                        aria-label={`Remove ${tier.name}`}
                        className="w-9 h-9 rounded-full bg-surface-container-highest/60 flex items-center justify-center text-text-tertiary hover:text-error transition-colors"
                        type="button"
                        onClick={() => removeTier(tier.id)}
                      >
                        <Icon name="delete" className="text-[20px]" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full h-12 rounded-xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  type="button"
                  onClick={addTier}
                >
                  <Icon name="add_circle" className="text-[20px]" /> Add Another Tier or Add-on
                </button>
              </>
            )}
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="calendar_month" className="text-[20px]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Online Appointment Booking</h3>
                    <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-2 py-0.5 rounded-full font-bold">
                      Live Sync
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    Allow clients to book slots directly via VEMTAP live calendar
                  </p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <div className="w-11 h-6 bg-primary rounded-full transition-colors relative">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-on-primary rounded-full shadow-md" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption">
              <Icon name="info" className="text-primary text-[16px]" />
              <span>
                {draft.durationMins} mins appointment slots ({draft.bufferMins} mins cleanup buffer auto-added)
              </span>
            </div>

            <button
              className="w-full py-2 px-space-sm rounded-lg bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high/50 active:scale-[0.98] transition-all"
              type="button"
            >
              <Icon name="event_busy" className="text-[18px]" /> Customize Specific Dates &amp; Blockouts
            </button>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-start gap-3 p-space-md rounded-xl bg-surface-tint-blue">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="verified_user" className="text-[18px]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-primary font-bold">
                  VEMTAP Zero-Upfront Guarantee
                </span>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Customers pay directly at your salon after treatment. VEMTAP never holds your payout or charges
                  gateway checkout cuts.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
              <div className="flex flex-col pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    Advance consultation confirmation
                  </span>
                  <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-1.5 py-0.2 rounded font-medium">
                    WhatsApp
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary">
                  Send automated instant WhatsApp ping to confirm high-value visits
                </span>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <div className="w-11 h-6 bg-primary rounded-full transition-colors relative">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-on-primary rounded-full shadow-md" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/90 backdrop-blur-xl px-margin pt-3 pb-safe shadow-[0_-8px_24px_rgba(17,24,39,0.06)] flex flex-col items-center gap-2">
        <button
          className="w-full h-[52px] rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-all"
          type="button"
          onClick={onNext}
        >
          <span>Continue to Branch Availability</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
        <button
          className="h-10 px-4 text-text-secondary font-button-secondary text-button-secondary hover:text-text-primary active:scale-[0.95] transition-all"
          type="button"
          onClick={onBack}
        >
          Back to Step 1
        </button>
      </div>
    </AppScreen>
  );
}
