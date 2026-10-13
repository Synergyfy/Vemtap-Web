import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { DealStudioDraft } from './dealStudio';
import type { ProductDraft } from './productDraft';

interface BusinessDealStudioStep2ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const PREVIEW_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkfprK4b3z0fbDUF86XnoJYvvLLdI4sdfnLRFeCwVkN4wApWoEhS2XTTFal_a2bM8WIdPbkZM8KhTHNVZM2OshTBG6UR322ToSvO7qJtciL-Eo-6qN-bbjiDuORpAmjYUFfv93JVxCUmkc7OR0spZOzFsvYmbJOAcLnQG07xX1bVa1m7xpGp57t5wgl8TIUts7BamIGd-dkJmGqUX0v2mBrUsATT8qeJqWtQ_8qSbp',
  alt: 'Close up photograph of mouthwatering Nigerian party jollof rice garnished with fried plantains, succulent grilled chicken, and fresh parsley in an ambient high-end restaurant setting with warm directional spotlighting.',
};

function Toggle({
  checked,
  small = false,
  onChange,
}: {
  checked: boolean;
  small?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        aria-label="Toggle setting"
        className="sr-only peer"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div
        className={`${
          small ? 'w-10 h-6 peer-checked:after:translate-x-full peer-checked:after:top-[2px] peer-checked:after:left-[2px] after:h-5 after:w-5' : 'w-12 h-7 peer-checked:after:translate-x-full peer-checked:after:top-[2px] peer-checked:after:left-[3px] after:h-6 after:w-6'
        } bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:border-white after:content-[''] after:absolute after:bg-surface-canvas after:rounded-full after:transition-all peer-checked:bg-primary-container`}
      />
    </label>
  );
}

export function BusinessDealStudioStep2Screen({
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessDealStudioStep2ScreenProps) {
  const clampVouchers = (value: number) => Math.max(5, Math.min(500, value));

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
                Media &amp; Creative
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
        <div className="px-margin pt-space-md pb-space-xs flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide uppercase">
              Step 2 of 4: Limits &amp; Customer Rules
            </span>
            <span className="font-label-sm text-label-sm text-text-secondary">50% Complete</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div className="h-full bg-primary-container rounded-full w-1/2 transition-all duration-300" />
          </div>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Define voucher availability, claim restrictions, and customer gifting options.
          </p>
        </div>

        <div className="flex flex-col px-margin gap-space-lg mt-space-sm mb-space-3xl">
          <section className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="confirmation_number" className="text-[20px]" filled />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Voucher Scarcity &amp; Allocation</h2>
                <span className="font-caption text-caption text-text-secondary">
                  Inventory controls and urgency indicators
                </span>
              </div>
            </div>
            <div className="bg-surface-subtle p-space-sm rounded-lg flex flex-col gap-space-xs mt-1">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary">Total Available Vouchers</span>
                <div className="flex items-center bg-surface-container-lowest rounded-lg p-1 shadow-sm">
                  <button
                    aria-label="Decrease vouchers"
                    className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform rounded-md"
                    type="button"
                    onClick={() => onStudioChange({ vouchers: clampVouchers(studio.vouchers - 5) })}
                  >
                    <Icon name="remove" className="text-[20px]" />
                  </button>
                  <span className="font-button-primary text-button-primary text-text-primary px-3 min-w-[48px] text-center">
                    {studio.vouchers}
                  </span>
                  <button
                    aria-label="Increase vouchers"
                    className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform rounded-md"
                    type="button"
                    onClick={() => onStudioChange({ vouchers: clampVouchers(studio.vouchers + 5) })}
                  >
                    <Icon name="add" className="text-[20px]" />
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-1.5 mt-1 text-badge-discount-text">
                <Icon name="bolt" className="text-[16px] mt-0.5" />
                <p className="font-caption text-caption">
                  Vouchers will automatically show ‘Almost Gone’ badge at 80% claimed.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-2xs">
              <div className="flex flex-col pr-space-sm">
                <span className="font-label-md text-label-md text-text-primary">Auto-pause when sold out</span>
                <span className="font-caption text-caption text-text-secondary">
                  Prevent overbooking during peak dining hours
                </span>
              </div>
              <Toggle checked={studio.autoPause} onChange={(next) => onStudioChange({ autoPause: next })} />
            </div>
          </section>

          <section className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="verified_user" className="text-[20px]" filled />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Customer Claim Restrictions</h2>
                <span className="font-caption text-caption text-text-secondary">
                  Redemption eligibility and frequency
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs mt-1">
              <label
                className={`flex flex-col p-space-sm rounded-lg cursor-pointer transition-colors ${
                  studio.claimOnce ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                }`}
                onClick={() => onStudioChange({ claimOnce: true })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <input
                      aria-label="Only once per customer"
                      className="w-4 h-4 text-primary-container focus:ring-0"
                      name="claim_frequency"
                      type="radio"
                      checked={studio.claimOnce}
                      readOnly
                    />
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Only Once per Customer
                    </span>
                  </div>
                  <span className="font-caption text-caption bg-badge-discount-bg text-badge-discount-text px-2 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary pl-6 mt-1">
                  Prevents single customers from exhausting your promotional budget; recommended for new customer
                  acquisition.
                </p>
              </label>
              <label
                className={`flex flex-col p-space-sm rounded-lg cursor-pointer transition-colors ${
                  !studio.claimOnce ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                }`}
                onClick={() => onStudioChange({ claimOnce: false })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <input
                      aria-label="Allow multiple claims"
                      className="w-4 h-4 text-primary-container focus:ring-0"
                      name="claim_frequency"
                      type="radio"
                      checked={!studio.claimOnce}
                      readOnly
                    />
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Allow Multiple Claims (Reusable)
                    </span>
                  </div>
                </div>
                <div className="pl-6 mt-space-xs flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Max claims per patron</span>
                  <div className="flex items-center bg-surface-container-lowest rounded-lg p-1 shadow-sm">
                    <button
                      aria-label="Decrease claims"
                      className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform rounded-md"
                      type="button"
                      onClick={() => onStudioChange({ maxClaims: Math.max(1, studio.maxClaims - 1) })}
                    >
                      <Icon name="remove" className="text-[16px]" />
                    </button>
                    <span className="font-caption text-caption font-semibold text-text-primary px-2">
                      {studio.maxClaims} / month
                    </span>
                    <button
                      aria-label="Increase claims"
                      className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform rounded-md"
                      type="button"
                      onClick={() => onStudioChange({ maxClaims: Math.min(30, studio.maxClaims + 1) })}
                    >
                      <Icon name="add" className="text-[16px]" />
                    </button>
                  </div>
                </div>
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="share" className="text-[20px]" filled />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Gifting &amp; Social Sharing</h2>
                <span className="font-caption text-caption text-text-secondary">
                  Viral referral triggers and guest-to-guest transfer
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs bg-surface-subtle p-space-sm rounded-lg mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="featured_seasonal_and_gifts" className="text-primary text-[20px]" />
                  <span className="font-label-md text-label-md text-text-primary font-medium">
                    Accept Gifting to Friends &amp; Family
                  </span>
                </div>
                <Toggle checked={studio.gifting} onChange={(next) => onStudioChange({ gifting: next })} />
              </div>
              <p className="font-caption text-caption text-text-secondary pl-7">
                Allows verified diners to gift this voucher code to friends via WhatsApp or SMS. Recipient claims in
                their own name.
              </p>
              <label className="flex items-center gap-space-xs pl-7 mt-space-2xs cursor-pointer">
                <input
                  className="w-4 h-4 rounded text-primary-container focus:ring-0"
                  type="checkbox"
                  checked={studio.otpVerify}
                  onChange={(event) => onStudioChange({ otpVerify: event.target.checked })}
                />
                <span className="font-caption text-caption text-text-primary">
                  Require recipient email/phone verification before claim
                </span>
              </label>
            </div>
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle">
              <div className="flex items-center gap-space-xs">
                <Icon name="campaign" className="text-primary text-[20px]" />
                <div className="flex flex-col pr-space-sm">
                  <span className="font-label-md text-label-md text-text-primary font-medium">
                    Allow Social Sharing Bonus
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Enables native share sheet with tracked referral link
                  </span>
                </div>
              </div>
              <Toggle checked={studio.socialBonus} onChange={(next) => onStudioChange({ socialBonus: next })} />
            </div>
          </section>

          <section className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="rule" className="text-[20px]" filled />
              </div>
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">
                  Other Accept / Reject Factors
                </h2>
                <span className="font-caption text-caption text-text-secondary">
                  Order channel fulfillment guidelines
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs mt-1">
              <label className="flex items-center justify-between p-space-sm bg-surface-subtle rounded-lg cursor-pointer">
                <div className="flex items-center gap-space-xs">
                  <Icon name="restaurant" className="text-text-secondary text-[20px]" />
                  <span className="font-label-md text-label-md text-text-primary">Accept Dine-In Walk-Ins</span>
                </div>
                <div className="flex items-center gap-2">
                  {studio.dineIn && (
                    <span className="font-caption text-caption text-badge-discount-text font-semibold">Active</span>
                  )}
                  <input
                    className="w-4 h-4 text-primary-container focus:ring-0 rounded"
                    type="checkbox"
                    checked={studio.dineIn}
                    onChange={(event) => onStudioChange({ dineIn: event.target.checked })}
                  />
                </div>
              </label>
              <label className="flex items-center justify-between p-space-sm bg-surface-subtle rounded-lg cursor-pointer">
                <div className="flex items-center gap-space-xs">
                  <Icon name="takeout_dining" className="text-text-secondary text-[20px]" />
                  <span className="font-label-md text-label-md text-text-primary">Accept Takeout / Pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  {studio.pickup && (
                    <span className="font-caption text-caption text-badge-discount-text font-semibold">Active</span>
                  )}
                  <input
                    className="w-4 h-4 text-primary-container focus:ring-0 rounded"
                    type="checkbox"
                    checked={studio.pickup}
                    onChange={(event) => onStudioChange({ pickup: event.target.checked })}
                  />
                </div>
              </label>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg opacity-75">
                <div className="flex items-center gap-space-xs">
                  <Icon name="moped" className="text-text-tertiary text-[20px]" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-secondary">
                      Third-Party Courier Deliveries
                    </span>
                    <span className="font-caption text-caption text-error">
                      Rejected (Dine-In &amp; Pickup Only)
                    </span>
                  </div>
                </div>
                <div className="w-10 h-6 bg-surface-container-highest rounded-full flex items-center p-0.5 cursor-not-allowed">
                  <div className="bg-outline-variant w-5 h-5 rounded-full" />
                </div>
              </div>
              <div className="flex flex-col p-space-sm bg-surface-subtle rounded-lg gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="calendar_clock" className="text-text-secondary text-[20px]" />
                    <span className="font-label-md text-label-md text-text-primary">
                      Advance Reservation Required
                    </span>
                  </div>
                  <Toggle
                    checked={studio.reservation}
                    small
                    onChange={(next) => onStudioChange({ reservation: next })}
                  />
                </div>
                <p className="font-caption text-caption text-text-secondary pl-7">
                  Guests must call or book at least 1 hour prior to arrival.
                </p>
              </div>
            </div>
          </section>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                Live Customer Badge Preview
              </span>
              <Icon name="visibility" className="text-primary text-[18px]" />
            </div>
            <div className="relative overflow-hidden rounded-lg bg-surface-container p-space-sm flex items-center gap-space-sm">
              <img
                className="w-16 h-16 rounded-lg object-cover shadow-sm"
                alt={PREVIEW_IMAGE.alt}
                src={PREVIEW_IMAGE.src}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold px-2 py-0.5 rounded-full">
                    {studio.vouchers} Left
                  </span>
                  <span className="bg-surface-canvas text-primary font-caption text-caption font-medium px-2 py-0.5 rounded-full shadow-sm">
                    {studio.claimOnce ? '1 Per Diner' : `${studio.maxClaims} Per Diner`}
                  </span>
                </div>
                <span className="font-heading-sm text-heading-sm text-text-primary truncate mt-1">
                  {studio.discountPct}% Off Weekend Dining
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Min spend ₦5,000 • Dine-in &amp; Pickup
                </span>
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
          Back to Step 1
        </button>
        <button
          className="h-[52px] flex-1 bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
          type="button"
          onClick={onNext}
        >
          <span>Continue to Branch Availability</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
      </div>
    </AppScreen>
  );
}
