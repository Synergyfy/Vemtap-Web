import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';

interface DesktopDealStudioStep2ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const PREVIEW_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHbHbfpDC_BUvPRfeEG2ZHxLuhxNv98AX4njEJXNhHWl6_48EZH-1k_YJdSsok9-uKSLQWDjkthbaJdV-8rvzFP43uJvtwQqH8n4RpCQFsFkkszITKvnWzj3RIgJaIBvhwiXeA8PzLw-kL0v05eLlPq7fSOmJFIaTvB3JFM2250OkBJ7AstY59B8Zqs6G4RYNbNkksPFOhD1x6ul8wFdrUhe0dKP964gIsXMmyMnE8UrWzo6PtSEzDcQ',
    alt: 'A warm modern restaurant interior with elegant wooden dining tables, ambient lighting, and artful culinary plating ready for dining guests in a vibrant urban bistro.',
  },
];

const STEPS: Array<{ label: string; state: 'done' | 'active' | 'pending' }> = [
  { label: '1. Discount Strategy', state: 'done' },
  { label: '2. Limits & Rules', state: 'active' },
  { label: '3. Branch Availability', state: 'pending' },
  { label: '4. Review & Launch', state: 'pending' },
];

function StudioToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-primary' : 'bg-surface-container-highest'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-surface-canvas transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function DesktopDealStudioStep2Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: DesktopDealStudioStep2ScreenProps) {
  const adjustVouchers = (delta: number) => {
    const next = Math.min(1000, Math.max(5, studio.vouchers + delta));
    onStudioChange({ vouchers: next });
  };

  const adjustUnitsPerOrder = (delta: number) => {
    onStudioChange({ maxUnitsPerOrder: Math.min(50, Math.max(1, studio.maxUnitsPerOrder + delta)) });
  };

  const adjustClaims = (delta: number) => {
    onStudioChange({ maxClaims: Math.min(30, Math.max(1, studio.maxClaims + delta)) });
  };

  return (
    <BusinessSetupChrome activeNav="deals">
      <div className="w-full bg-surface-container-lowest px-space-xl py-space-lg shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs text-secondary font-caption text-caption">
              <span>Catalog Workflow</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Deal Studio</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-primary font-semibold">Step 2 of 4: Limits &amp; Customer Rules</span>
            </div>
            <div className="flex items-center gap-space-md mt-space-2xs">
              {STEPS.map((item, index) => (
                <div key={item.label} className="contents">
                  <div
                    className={`flex items-center gap-space-xs ${
                      item.state === 'pending' ? 'text-text-tertiary' : ''
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-caption text-caption font-bold ${
                        item.state === 'done'
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : item.state === 'active'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high'
                      }`}
                    >
                      {item.state === 'done' ? <Icon name="check" className="text-[15px]" /> : index + 1}
                    </span>
                    <span
                      className={`font-label-sm text-label-sm ${
                        item.state === 'active'
                          ? 'text-primary font-semibold'
                          : item.state === 'done'
                            ? 'text-on-surface'
                            : ''
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <span
                      className={`w-8 h-0.5 ${
                        item.state === 'done' ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-space-md bg-surface-subtle p-space-xs rounded-xl">
            <div className="flex flex-col text-right">
              <span className="font-caption text-caption text-text-secondary">Studio Completion</span>
              <span className="font-label-md text-label-md text-primary font-bold">50% Completed</span>
            </div>
            <div className="w-20 bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-1/2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-space-xl pt-space-xl pb-space-md">
        <div className="flex flex-col gap-space-2xs">
          <div className="inline-flex items-center gap-space-2xs text-primary font-caption text-caption uppercase tracking-wider font-semibold">
            <Icon name="tune" className="text-[16px]" />
            Parametric Deal Governance
          </div>
          <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
            Voucher Limits, Gifting &amp; Customer Rules
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Define voucher availability, redemption frequency, and viral customer gifting options to safeguard
            restaurant margins while accelerating local diners.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-space-xl pb-space-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="confirmation_number" className="text-[22px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                      Voucher Scarcity &amp; Allocation
                    </h3>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Set caps on maximum inventory allocated for this promotion
                    </p>
                  </div>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                  Capacity Control
                </span>
              </div>
              <div className="bg-surface-subtle p-space-md rounded-xl flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface font-semibold block">
                      Quantity Limit
                    </label>
                    <span className="font-caption text-caption text-text-secondary">
                      Total promotional stock released across all digital channels
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      aria-label="Decrease quantity limit"
                      onClick={() => adjustVouchers(-5)}
                      className="w-10 h-10 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
                    >
                      <Icon name="remove" className="text-[20px]" />
                    </button>
                    <input
                      className="w-16 h-10 text-center font-heading-sm text-heading-sm font-bold bg-surface-canvas rounded-lg text-primary focus:outline-none"
                      max={1000}
                      min={5}
                      type="number"
                      value={studio.vouchers}
                      onChange={(event) => onStudioChange({ vouchers: Number(event.target.value) })}
                    />
                    <button
                      type="button"
                      aria-label="Increase quantity limit"
                      onClick={() => adjustVouchers(5)}
                      className="w-10 h-10 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
                    >
                      <Icon name="add" className="text-[20px]" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface font-semibold block">
                      Max Units per Order
                    </label>
                    <span className="font-caption text-caption text-text-secondary">
                      How many units one customer may redeem in a single order
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      aria-label="Decrease max units per order"
                      onClick={() => adjustUnitsPerOrder(-1)}
                      className="w-10 h-10 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
                    >
                      <Icon name="remove" className="text-[20px]" />
                    </button>
                    <span className="w-16 h-10 text-center leading-10 font-heading-sm text-heading-sm font-bold bg-surface-canvas rounded-lg text-primary">
                      {studio.maxUnitsPerOrder}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase max units per order"
                      onClick={() => adjustUnitsPerOrder(1)}
                      className="w-10 h-10 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
                    >
                      <Icon name="add" className="text-[20px]" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-tertiary-fixed text-on-tertiary-fixed">
                <Icon name="local_fire_department" className="text-[18px]" />
                <span className="font-caption text-caption font-medium">
                  Vouchers will automatically show 'Almost Gone' badge at 80% claimed (≥
                  {Math.round(studio.vouchers * 0.8)} claimed).
                </span>
              </div>
              <div className="flex items-center justify-between pt-space-xs">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-medium">
                    Auto-pause when sold out
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Instantly freezes redemption passes to prevent overbooking during peak dining
                  </span>
                </div>
                <StudioToggle
                  checked={studio.autoPause}
                  onChange={(value) => onStudioChange({ autoPause: value })}
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="fingerprint" className="text-[22px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                      Customer Claim Restrictions
                    </h3>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Prevent budget abuse by recurring diners
                    </p>
                  </div>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
                  Fraud Shield
                </span>
              </div>
              <label
                className={`cursor-pointer p-space-md rounded-xl flex items-start gap-space-md transition-all ${
                  studio.claimOnce ? 'bg-surface-tint-blue' : 'bg-surface-subtle hover:bg-surface-container-low'
                }`}
              >
                <input
                  checked={studio.claimOnce}
                  onChange={() => onStudioChange({ claimOnce: true })}
                  className="mt-1 w-4 h-4 text-primary accent-primary"
                  name="claim_restriction"
                  type="radio"
                  value="single"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span
                      className={`font-label-md text-label-md font-bold ${
                        studio.claimOnce ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      Only Once per Customer
                    </span>
                    <span className="bg-primary text-on-primary px-space-xs py-space-2xs rounded-full font-caption text-caption font-semibold">
                      Recommended
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs text-left">
                    Restricts verification to 1 voucher per registered phone &amp; NDPR-hash ID. Highest impact for
                    unique new customer acquisition.
                  </p>
                </div>
              </label>
              <label
                className={`cursor-pointer p-space-md rounded-xl flex items-start gap-space-md transition-all w-full ${
                  studio.claimOnce ? 'bg-surface-subtle hover:bg-surface-container-low' : 'bg-surface-tint-blue'
                }`}
              >
                <input
                  checked={!studio.claimOnce}
                  onChange={() => onStudioChange({ claimOnce: false })}
                  className="mt-1 w-4 h-4 text-primary accent-primary"
                  name="claim_restriction"
                  type="radio"
                  value="multi"
                />
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-label-md text-label-md font-semibold ${
                        studio.claimOnce ? 'text-on-surface' : 'text-primary font-bold'
                      }`}
                    >
                      Allow Multiple Claims (Reusable)
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-space-2xs text-left">
                    Encourages repeat footfall among regulars with cooldown intervals between billings.
                  </p>
                  {!studio.claimOnce && (
                    <div className="flex flex-col gap-space-xs mt-space-sm">
                      <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-canvas">
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            Max claims per customer
                          </span>
                          <span className="font-caption text-caption text-text-secondary">
                            How many times one customer may claim this deal
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-space-xs ${
                            studio.unlimitedClaims ? 'opacity-40 pointer-events-none' : ''
                          }`}
                        >
                          <button
                            type="button"
                            aria-label="Decrease max claims"
                            onClick={() => adjustClaims(-1)}
                            className="w-9 h-9 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
                          >
                            <Icon name="remove" className="text-[18px]" />
                          </button>
                          <span className="w-14 text-center font-label-md text-label-md font-bold text-on-surface">
                            {studio.maxClaims} / month
                          </span>
                          <button
                            type="button"
                            aria-label="Increase max claims"
                            onClick={() => adjustClaims(1)}
                            className="w-9 h-9 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
                          >
                            <Icon name="add" className="text-[18px]" />
                          </button>
                        </div>
                      </div>
                      <label className="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-canvas cursor-pointer select-none">
                        <input
                          className="w-4 h-4 rounded text-primary accent-primary"
                          type="checkbox"
                          checked={studio.unlimitedClaims}
                          onChange={(event) => onStudioChange({ unlimitedClaims: event.target.checked })}
                        />
                        <span className="font-body-md text-body-md text-on-surface">
                          Allow unlimited claims (no per-customer cap)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="featured_seasonal_and_gifts" className="text-[22px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                      Gifting &amp; Social Sharing
                    </h3>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Harness diner peer groups for organic viral reach
                    </p>
                  </div>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Viral Loop
                </span>
              </div>
              <div className="flex items-start justify-between p-space-md rounded-xl bg-surface-subtle">
                <div className="flex flex-col pr-space-md">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Accept Gifting to Friends &amp; Family
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs">
                    Allows verified diners to gift voucher link via WhatsApp, SMS, or Telegram. Recipient claims in
                    their own name.
                  </p>
                </div>
                <StudioToggle checked={studio.gifting} onChange={(value) => onStudioChange({ gifting: value })} />
              </div>
              <div className="flex items-center gap-space-sm pl-space-md">
                <input
                  id="verify-recipient"
                  className="w-4 h-4 rounded text-primary accent-primary"
                  type="checkbox"
                  checked={studio.otpVerify}
                  onChange={(event) => onStudioChange({ otpVerify: event.target.checked })}
                />
                <label
                  htmlFor="verify-recipient"
                  className="font-body-md text-body-md text-on-surface cursor-pointer select-none"
                >
                  Require recipient phone/email OTP verification before code unlock
                </label>
              </div>
              <div className="flex items-start justify-between p-space-md rounded-xl bg-surface-subtle">
                <div className="flex flex-col pr-space-md">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Allow Social Sharing Bonus
                    </span>
                    <Icon name="share" className="text-primary text-[18px]" />
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                    Enables native share sheet with tracked referral code. If friends visit, merchant issues ₦500
                    bonus credit automatically.
                  </p>
                </div>
                <StudioToggle
                  checked={studio.socialBonus}
                  onChange={(value) => onStudioChange({ socialBonus: value })}
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="storefront" className="text-[22px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                      Channel &amp; Fulfillment Factors
                    </h3>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Define where customer redemption applies
                    </p>
                  </div>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-on-surface font-caption text-caption">
                  Service Floor
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <label
                  className={`cursor-pointer p-space-md rounded-xl flex items-center gap-space-sm select-none transition-colors ${
                    studio.dineIn ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                  }`}
                >
                  <input
                    className="w-4 h-4 rounded text-primary accent-primary"
                    type="checkbox"
                    checked={studio.dineIn}
                    onChange={(event) => onStudioChange({ dineIn: event.target.checked })}
                  />
                  <div className="flex flex-col text-left">
                    <span
                      className={`font-label-md text-label-md font-bold ${
                        studio.dineIn ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      Accept Dine-In Walk-Ins
                    </span>
                    <span className="font-caption text-caption text-secondary">Table QR scan at billing</span>
                  </div>
                </label>
                <label
                  className={`cursor-pointer p-space-md rounded-xl flex items-center gap-space-sm select-none transition-colors ${
                    studio.pickup ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                  }`}
                >
                  <input
                    className="w-4 h-4 rounded text-primary accent-primary"
                    type="checkbox"
                    checked={studio.pickup}
                    onChange={(event) => onStudioChange({ pickup: event.target.checked })}
                  />
                  <div className="flex flex-col text-left">
                    <span
                      className={`font-label-md text-label-md font-bold ${
                        studio.pickup ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      Accept Takeout / Pickup
                    </span>
                    <span className="font-caption text-caption text-secondary">Counter voucher validation</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-subtle opacity-70">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Third-Party Courier Deliveries
                    </span>
                    <span className="bg-error-container text-on-error-container px-space-xs py-space-2xs rounded font-caption text-caption font-bold">
                      Excluded
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary">
                    Dine-in and direct collection only (protects POS ticket margin)
                  </span>
                </div>
                <button
                  type="button"
                  disabled
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-container-highest cursor-not-allowed"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-surface-canvas translate-x-1" />
                </button>
              </div>
              <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-subtle">
                <div className="flex flex-col pr-space-md">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Advance Reservation Required
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Guests must phone or reserve table at least 1 hour prior to arrival
                  </span>
                </div>
                <StudioToggle
                  checked={studio.reservation}
                  onChange={(value) => onStudioChange({ reservation: value })}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-2xs">
                  <Icon name="visibility" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                    Live Diner App Preview
                  </h3>
                </div>
                <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold px-space-xs py-space-2xs rounded-full">
                  Mobile Synced
                </span>
              </div>
              <p className="font-caption text-caption text-on-surface-variant">
                Here is precisely how your limits, restrictions, and badges will appear on consumer search results and
                detail screens:
              </p>
              <div className="bg-surface rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div
                  className="relative h-44 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${PREVIEW_IMAGES[0].src}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/20" />
                  <div className="absolute top-space-sm left-space-sm flex flex-wrap gap-space-2xs">
                    <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold px-space-xs py-space-2xs rounded-full shadow-sm">
                      20% Off Weekend Dinner
                    </span>
                    <span className="bg-tertiary-container text-on-tertiary-container font-caption text-caption font-bold px-space-xs py-space-2xs rounded-full shadow-sm flex items-center gap-1">
                      <Icon name="bolt" className="text-[13px]" />
                      <span>{studio.vouchers} Left</span>
                    </span>
                  </div>
                  <div className="absolute top-space-sm right-space-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-canvas/90 backdrop-blur flex items-center justify-center text-primary shadow-sm">
                      <Icon name="share" className="text-[18px]" />
                    </div>
                  </div>
                  <div className="absolute bottom-space-sm left-space-sm right-space-sm flex items-end justify-between">
                    <div>
                      <h4 className="font-label-md text-label-md text-surface-canvas font-bold">
                        The Obsidian Grill &amp; Lounge
                      </h4>
                      <div className="flex items-center gap-space-2xs text-surface-container-low font-caption text-caption">
                        <Icon name="location_on" className="text-[14px]" />
                        <span>Victoria Island • 0.6 km</span>
                      </div>
                    </div>
                    <span className="bg-surface-canvas text-primary font-caption text-caption font-bold px-space-xs py-space-2xs rounded-lg">
                      ★ 4.9 (1.2k)
                    </span>
                  </div>
                </div>
                <div className="p-space-md flex flex-col gap-space-sm bg-surface-canvas">
                  <div className="flex flex-wrap items-center gap-space-2xs font-caption text-caption">
                    <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface font-medium flex items-center gap-1">
                      <Icon name="person" className="text-[14px]" />{' '}
                      {studio.claimOnce
                        ? '1 Per Diner'
                        : studio.unlimitedClaims
                          ? 'Unlimited Per Diner'
                          : `${studio.maxClaims} Per Diner`}
                    </span>
                    <span className="px-space-xs py-space-2xs rounded bg-surface-subtle text-secondary font-medium">
                      Max {studio.maxUnitsPerOrder} per Order
                    </span>
                    <span className="px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-medium flex items-center gap-1">
                      <Icon name="payments" className="text-[14px]" /> Min Spend ₦5,000
                    </span>
                    <span className="px-space-xs py-space-2xs rounded bg-surface-subtle text-secondary font-medium">
                      Dine-In &amp; Pickup
                    </span>
                    <span className="px-space-xs py-space-2xs rounded bg-surface-subtle text-secondary font-medium">
                      Reservation Req.
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-space-2xs">
                    <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                      <Icon name="card_giftcard" className="text-[16px] text-badge-discount-text" />
                      <span>Giftable via WhatsApp link</span>
                    </div>
                    <button
                      type="button"
                      className="bg-primary-container text-on-primary px-space-md py-space-2xs rounded-lg font-button-secondary text-button-secondary hover:bg-primary transition-all"
                    >
                      Claim Deal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs text-tertiary">
                <Icon name="trending_up" className="text-[22px]" />
                <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                  Urgency &amp; Conversion Velocity
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="bg-surface-subtle p-space-md rounded-xl flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Claim Velocity Lift</span>
                  <span className="font-heading-lg text-heading-lg font-bold text-primary">+2.8×</span>
                  <span className="font-caption text-caption text-on-surface-variant mt-space-2xs">
                    When voucher counts display ≤ 50 remaining
                  </span>
                </div>
                <div className="bg-surface-subtle p-space-md rounded-xl flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Abuse Prevention</span>
                  <span className="font-heading-lg text-heading-lg font-bold text-badge-discount-text">99.4%</span>
                  <span className="font-caption text-caption text-on-surface-variant mt-space-2xs">
                    Cryptographic token validation per handset
                  </span>
                </div>
              </div>
              <div className="bg-surface-subtle p-space-md rounded-xl flex flex-col gap-space-2xs">
                <div className="flex items-center justify-between text-on-surface font-caption text-caption">
                  <span className="font-semibold">Voucher Redemption Velocity Curve</span>
                  <span className="text-primary font-bold">Optimized Range</span>
                </div>
                <svg
                  className="w-full h-16 text-primary"
                  fill="none"
                  viewBox="0 0 300 60"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 50 Q 75 48, 150 32 T 300 8"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                  <path d="M0 50 Q 75 48, 150 32 T 300 8 L 300 60 L 0 60 Z" fill="currentColor" fillOpacity="0.08" />
                  <circle cx="150" cy="32" fill="currentColor" r="4" />
                  <circle cx="300" cy="8" fill="#a13900" r="4" />
                </svg>
                <div className="flex justify-between text-text-tertiary font-caption text-caption">
                  <span>Day 1: Released</span>
                  <span>80% Cap Triggered</span>
                  <span className="text-tertiary font-bold">Sold Out</span>
                </div>
              </div>
              <div className="flex items-start gap-space-xs p-space-xs bg-surface-tint-blue rounded-lg text-primary">
                <Icon name="verified_user" className="text-[18px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption">
                  Single-use claims generate unique dynamic QR barcodes refreshed every 30 seconds to block fraudulent
                  multi-device screenshot exploitation.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-high rounded-xl p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-heading-sm text-heading-sm font-bold">
                  A+
                </div>
                <div>
                  <span className="font-label-md text-label-md text-on-surface font-bold block">
                    Deal Strength Score
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Optimal balance of viral gifting and revenue safety
                  </span>
                </div>
              </div>
              <Icon name="workspace_premium" className="text-primary text-[24px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-space-xl py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Step 1: Strategy</span>
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
            <div className="hidden md:flex flex-col text-right">
              <span className="font-caption text-caption text-badge-discount-text font-bold">✓ Rules Validated</span>
              <span className="font-caption text-caption text-text-secondary">Ready for Branch Allocation</span>
            </div>
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
    </BusinessSetupChrome>
  );
}
