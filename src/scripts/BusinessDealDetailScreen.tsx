import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessDealDetailScreenProps {
  onBack: () => void;
  onBoost: () => void;
  onEditAssignment: () => void;
  /** Opens the deal studio so the whole deal can be edited. */
  onEditDeal?: () => void;
}

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA1_Z0LwG2JcNNG3mNfDG_T1MIlMoIFbHIhdxxbnnyI-PuSix_NRMDEwlU5rLq-mBlfWYXU5wHpbbsf74yYS_P98kOJVchxXXydUr1CF_smRk0LVgK5jqGX6Viv2lUD-0Od8WTAIWUTueL3ptTJsRMvohWrqzMPKkw4K-ptvDBtCy1i9Qqb16pUgfUdX0wbDH-36nLUw9ctdKYEudfKPAb5hLXEAWmj_aw6Fkc1e3Oj79qrMQYeVgh5rw';
const HERO_ALT =
  'Gourmet prime Angus ribeye steak sizzling on a rustic dark slate board with rosemary sprigs, sea salt crystals, and a cold iced passionfruit cocktail garnished with mint in an upscale bistro setting with moody cinematic warm lighting.';
const RIBEYE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBWkXAPtK1q1vO4NHMZVNriHUzoV2GLucpM3GshzR3Vf-uh7fye7AabcbOBPfpUMpIQAmsX8F3vHGeoOYtaXss8aCUHw__XIX2JbEBAaKoZ1Gn32EVdEwS6ebqICoUXJC7oGOc0T3Spb_ezioWqn1G9iIq_doyDKNDcVHnOQb1-e1mawA8tM6QPdQ8bG9h_Yw94fiUPe476uiGcKjDqOvhBlzOsguXC5lMlGvSrESEJDNfChL2YITwv0';
const MOJITO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC30TOLTYVASe7u5wL3wVhAqPwIQ3byMvBrZ8Ys7pQAzMoqHjIwmv7rMqALEG_pNTocrM4bXwsXsJzUa6yxkqyhbHUffOpsQ5YtKkZQtmb1mSUmbawwRywAK6kDfEK4G127mLEBkoYw1C5aj-JtY6Z93FwFxEty4elS4_ny678PDHXXHF3sffNv5FjgxuTAQQf45miBGY9Ezgtw08Nfx76YPy6HcvHi4I2Skf-EnX_5be3dfkFMrp6hwQ';

const BRANCH_AVAILABILITY = [
    { name: 'Wuse II Flagship', sub: 'Adetokunbo Ademola Crescent', price: '₦9,600', available: true },
    { name: 'Maitama Heights', sub: 'Location Adjusted Surcharge', price: '₦10,200', available: true },
    { name: 'Garki Express Hub', sub: 'Takeout only branch · Excluded', price: 'Unavailable', available: false },
];

export function BusinessDealDetailScreen({
  onBack,
  onBoost,
  onEditAssignment,
  onEditDeal,
}: BusinessDealDetailScreenProps) {
  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-xs flex items-center justify-between gap-space-2xs">
          <button
            aria-label="Go back"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface hover:text-primary"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <h1 className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate flex-1 text-center">
            Deal Details
          </h1>
          <div className="flex items-center gap-space-2xs shrink-0">
            <button
              aria-label="More actions"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              type="button"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 px-margin pt-space-md pb-40 space-y-space-md">
        {/* Hero */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-sm bg-surface-container-low">
          <div className="w-full h-52 relative flex flex-col justify-between p-space-md">
            <img alt={HERO_ALT} className="absolute inset-0 w-full h-full object-cover" src={HERO_IMG} />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-transparent" />
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                Active · Live on Feeds
              </span>
              <span className="inline-flex items-center px-space-xs py-1 rounded-full bg-surface-canvas/90 text-primary font-label-sm text-label-sm shadow-sm backdrop-blur-sm">
                20% OFF
              </span>
            </div>
            <div className="relative z-10 space-y-space-2xs">
              <p className="font-label-sm text-label-sm text-surface-container-highest tracking-wide uppercase">
                Urban Grill & Bistro · Food & Dining
              </p>
              <h2 className="font-heading-md text-heading-md text-surface-canvas leading-tight">
                Weekend Prime Lunch Combo
              </h2>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full space-y-space-xs">
          <button
            className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-between px-space-md shadow-md active:scale-[0.99] transition-transform"
            type="button"
            onClick={onBoost}
          >
            <div className="flex items-center gap-space-xs">
              <Icon name="rocket_launch" className="text-[20px]" />
              <span>Boost Deal</span>
            </div>
            <span className="font-caption text-caption bg-surface-canvas/20 px-space-xs py-0.5 rounded-full text-on-primary truncate max-w-[170px]">
              Up to 5x more claims in Wuse
            </span>
          </button>
          <div className="grid grid-cols-3 gap-space-xs">
            <button
              className="h-11 rounded-lg bg-surface-container-high text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1 active:bg-surface-variant transition-colors"
              type="button"
            >
              <Icon name="pause_circle" className="text-[18px]" />
              <span>Pause</span>
            </button>
            <button
              className="h-11 rounded-lg bg-surface-container-high text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1 active:bg-surface-variant transition-colors"
              type="button"
              onClick={onEditDeal}
            >
              <Icon name="edit" className="text-[18px]" />
              <span>Edit</span>
            </button>
            <button
              className="h-11 rounded-lg bg-error-container text-on-error-container font-button-secondary text-button-secondary flex items-center justify-center gap-1 active:opacity-90 transition-opacity"
              type="button"
            >
              <Icon name="cancel" className="text-[18px]" />
              <span>End</span>
            </button>
          </div>
        </div>

        {/* Pricing & Settlement */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
              <Icon name="payments" className="text-primary text-[20px]" />
              Pricing & Settlement
            </h3>
            <span className="font-caption text-caption px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-medium">
              Fixed Retail
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
            <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between">
              <span className="font-caption text-caption text-text-secondary">Original Price</span>
              <span className="font-heading-sm text-heading-sm text-text-secondary line-through mt-0.5">₦12,000</span>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-tint-blue flex flex-col justify-between">
              <span className="font-caption text-caption text-primary">Deal Price</span>
              <span className="font-heading-sm text-heading-sm text-primary font-bold mt-0.5">₦9,600</span>
            </div>
            <div className="p-space-xs rounded-lg bg-badge-discount-bg flex flex-col justify-between">
              <span className="font-caption text-caption text-badge-discount-text">Customer Savings</span>
              <span className="font-heading-sm text-heading-sm text-badge-discount-text font-semibold mt-0.5">
                20% (-₦2,400)
              </span>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between">
              <span className="font-caption text-caption text-text-secondary">Platform Fee</span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-semibold mt-0.5">0% (Direct)</span>
            </div>
          </div>
          <p className="font-caption text-caption text-text-tertiary flex items-center gap-1">
            <Icon name="verified" className="text-[14px]" />
            Settlement deposited directly to merchant account upon POS redemption.
          </p>
        </section>

        {/* Redemption & Velocity */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
                <Icon name="analytics" className="text-primary text-[20px]" />
                Redemption & Velocity
              </h3>
              <span className="font-caption text-caption text-text-secondary">Oct 12 – Oct 20, 2024 · Ends in 3 days</span>
            </div>
            <span className="font-label-sm text-label-sm px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold shrink-0">
              3 Days Left
            </span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container-low space-y-space-xs">
            <div className="flex items-center justify-between font-label-md text-label-md">
              <span className="text-text-secondary">Redemption Rate</span>
              <span className="text-primary font-semibold">69.5%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-variant overflow-hidden flex">
              <div className="h-full bg-primary-container" style={{ width: '69.5%' }} />
              <div className="h-full bg-secondary-fixed-dim" style={{ width: '30.5%' }} />
            </div>
            <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
              <span>89 Redeemed at POS</span>
              <span>39 Active / Unclaimed</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-space-xs">
            <div className="p-space-sm rounded-lg bg-surface-subtle">
              <span className="font-caption text-caption text-text-secondary block">Total Claimed</span>
              <span className="font-heading-md text-heading-md text-text-primary mt-1 block">128</span>
              <span className="font-caption text-caption text-badge-discount-text flex items-center gap-0.5 mt-0.5">
                <Icon name="trending_up" className="text-[13px]" /> +14 today
              </span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-subtle">
              <span className="font-caption text-caption text-text-secondary block">Revenue Generated</span>
              <span className="font-heading-md text-heading-md text-primary mt-1 block">₦854,400</span>
              <span className="font-caption text-caption text-text-tertiary block mt-0.5">Gross GMV</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-high/60">
            <Icon name="schedule" className="text-secondary text-[20px]" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-primary font-medium">Redemption Window</span>
              <span className="font-caption text-caption text-text-secondary">Monday – Sunday · 12:00 PM – 5:00 PM</span>
            </div>
          </div>
        </section>

        {/* Catalog & Cap Limits */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
              <Icon name="restaurant_menu" className="text-primary text-[20px]" />
              Catalog & Cap Limits
            </h3>
            <span className="font-caption text-caption text-text-secondary">2 Items Bundled</span>
          </div>
          <div className="space-y-space-xs">
            {[
              { img: RIBEYE_IMG, name: 'Woodfire Ribeye 250g', sub: 'Main · Kitchen Grill Section' },
              { img: MOJITO_IMG, name: 'Passionfruit House Mojito', sub: 'Beverage · Craft Bar Stand' },
            ].map((bundled) => (
              <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-subtle" key={bundled.name}>
                <div className="flex items-center gap-space-xs min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 bg-surface-container bg-cover bg-center"
                    style={{ backgroundImage: `url('${bundled.img}')` }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-medium truncate">
                      {bundled.name}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">{bundled.sub}</span>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-semibold shrink-0">Qty 1</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-tint-blue">
            <div className="flex items-center gap-space-2xs text-primary">
              <Icon name="inventory_2" className="text-[18px]" />
              <span className="font-label-sm text-label-sm font-medium">Daily Kitchen Reservation</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-semibold">45 covers/day</span>
          </div>
        </section>

        {/* Branch Availability */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
              <Icon name="store" className="text-primary text-[20px]" />
              Branch Availability
            </h3>
            <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
              2 of 3 branches
            </span>
          </div>
          <div className="space-y-space-xs">
            {BRANCH_AVAILABILITY.map((branch) => (
              <div
                className={`flex items-center justify-between p-space-xs rounded-lg ${
                  branch.available ? 'bg-surface-subtle' : 'bg-surface-container-low opacity-60'
                }`}
                key={branch.name}
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon
                    name={branch.available ? 'check_circle' : 'block'}
                    className={branch.available ? 'text-badge-discount-text text-[20px]' : 'text-outline text-[20px]'}
                  />
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-label-md text-label-md font-medium truncate ${
                        branch.available ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {branch.name}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">{branch.sub}</span>
                  </div>
                </div>
                <span
                  className={`font-label-md text-label-md shrink-0 ${
                    branch.available ? 'text-text-primary font-semibold' : 'text-text-tertiary font-caption text-caption'
                  }`}
                >
                  {branch.price}
                </span>
              </div>
            ))}
          </div>
          <button
            className="w-full text-left font-button-secondary text-button-secondary text-primary flex items-center justify-between pt-1"
            type="button"
            onClick={onEditAssignment}
          >
            <span>Edit Location Assignment & Pricing</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </section>

        {/* Customer Facing Copy */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
          <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
            <Icon name="visibility" className="text-primary text-[20px]" />
            Customer Facing Copy
          </h3>
          <div className="space-y-space-2xs">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Description
            </span>
            <p className="font-body-md text-body-md text-text-primary p-space-xs rounded-lg bg-surface-subtle">
              Indulge in our signature 250g woodfire grilled prime Angus ribeye paired with freshly muddled house
              passionfruit mojito. Exclusive VEMTAP weekend diners perk.
            </p>
          </div>
          <div className="space-y-space-2xs">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Terms & Conditions
            </span>
            <p className="font-caption text-caption text-text-secondary p-space-xs rounded-lg bg-surface-subtle leading-relaxed">
              Valid for dine-in only. One voucher per table/visit. Not combinable with happy hour promotions. Show
              active QR code to server before requesting bill.
            </p>
          </div>
          <div className="space-y-space-2xs">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Claim Flow Instructions
            </span>
            <div className="p-space-xs rounded-lg bg-surface-subtle space-y-1 font-caption text-caption text-text-secondary">
              {[
                'Present digital voucher QR on arrival.',
                'Staff verifies on Till 01.',
                'Discount automatically deducted from POS final check.',
              ].map((step, index) => (
                <div className="flex items-start gap-space-xs" key={step}>
                  <span className="w-4 h-4 rounded-full bg-surface-variant text-on-surface font-semibold flex items-center justify-center shrink-0 font-caption text-[10px]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-md px-margin py-space-xs pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex flex-col gap-space-2xs">
        <button
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-md active:scale-[0.99] transition-transform"
          type="button"
          onClick={onBoost}
        >
          <Icon name="rocket_launch" className="text-[20px]" />
          <span>Boost Deal (Reach +5,000 Diners)</span>
        </button>
        <button
          className="w-full h-10 rounded-lg text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1 active:bg-surface-tint-blue transition-colors"
          type="button"
        >
          <span>Preview Customer Deal View</span>
          <Icon name="north_east" className="text-[16px]" />
        </button>
      </div>
    </AppScreen>
  );
}
