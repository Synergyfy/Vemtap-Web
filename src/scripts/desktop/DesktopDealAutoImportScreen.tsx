import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { getActiveVariants } from '../productVariants';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';

interface DesktopDealAutoImportScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onPublish: () => void;
  onCancel: () => void;
}

const FEED_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrkYFOHrZELDHmMpUjrGPu6_OJoDYXCTM0VzcyY_12eNNmV_2ttYp6j6Yb4TryWLhhIbTM_D-FeOE3yu6L4Bm7nAmWACqBXL9Xje3y4dUsjC8gHWN40cXRwvqr5QCs4OWW1tKEEQZMkD_zAo9doLJyD891Q_0Q36Coo5vurvdrByh8zYwO9lLwqX1w4p90aMSC_DhKQMA1yLWu3wDA3CKnDpW5lcdIp8krJOk3GLPGrjNIOzIicTwWng',
    alt: 'A mouthwatering Woodfire Aged Ribeye Steak sizzling on an artisan wooden carving board with roasted garlic and fresh rosemary herbs. Dramatic warm restaurant ambient lighting, rich dark tones, shallow depth of field, premium gastronomic styling.',
  },
];

const PRESETS = [15, 20, 25, 30, 40];

const OUTLET_BRANCHES: Array<{ key: keyof DealStudioDraft['branches']; name: string; address: string; note: string }> = [
  {
    key: 'wuseII',
    name: 'Wuse II Flagship Branch',
    address: 'Plot 104 Aminu Kano Cres, Wuse 2, Abuja',
    note: 'High Traffic • Pos sync ok',
  },
  {
    key: 'garkiII',
    name: 'Garki II Express Grill',
    address: 'Area 11, Muhammadu Buhari Way, Garki',
    note: 'Fast Turnover • Pos sync ok',
  },
];

const DAY_CHIPS: Array<{ key: keyof DealStudioDraft['days']; label: string; offLabel: string }> = [
  { key: 'mon', label: 'Mon', offLabel: 'Mon (Off)' },
  { key: 'tue', label: 'Tue', offLabel: 'Tue (Off)' },
  { key: 'wed', label: 'Wed', offLabel: 'Wed (Off)' },
  { key: 'thu', label: 'Thu', offLabel: 'Thu (Off)' },
  { key: 'fri', label: 'Fri', offLabel: 'Fri (Off)' },
  { key: 'sat', label: 'Sat', offLabel: 'Sat (Off-peak only)' },
  { key: 'sun', label: 'Sun', offLabel: 'Sun (Disabled)' },
];

const DEFAULT_TERMS =
  'Show voucher QR code to host before ordering. Dine-in only. Valid strictly from 12:00 PM to 5:00 PM Monday through Friday. Cannot be stacked with existing weekend happy hour deals.';

const STRATEGY_TABS: Array<{ id: string; icon: string; label: string }> = [
  { id: 'pct', icon: 'percent', label: 'Percentage Off' },
  { id: 'fixed', icon: 'payments', label: 'Fixed ₦ Off' },
  { id: 'combo', icon: 'layers', label: 'Combo Bundle' },
];

const TO_NUMBER = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const FORMAT_AMOUNT = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function DesktopDealAutoImportScreen({
  draft,
  studio,
  onStudioChange,
  onPublish,
  onCancel,
}: DesktopDealAutoImportScreenProps) {
  const [activeTab, setActiveTab] = useState('pct');
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'live'>('idle');
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const activeVariants = getActiveVariants(draft);
  const variantPriceSource =
    activeVariants.find((variant) => variant.name === 'Regular')?.price ?? activeVariants[0]?.price ?? draft.basePrice;
  const parsedVariantPrice = TO_NUMBER(variantPriceSource);
  const basePrice = parsedVariantPrice > 0 ? parsedVariantPrice : TO_NUMBER(draft.basePrice);
  const discount = studio.discountPct;
  const dealPrice = Math.round(basePrice * (1 - discount / 100));
  const savings = basePrice - dealPrice;
  const activeOutlets = OUTLET_BRANCHES.filter((branch) => studio.branches[branch.key]).length;

  const setDiscount = (value: number) => {
    onStudioChange({ discountPct: Math.min(60, Math.max(5, value)) });
  };

  const adjustVouchers = (delta: number) => {
    onStudioChange({ vouchers: Math.min(500, Math.max(10, studio.vouchers + delta)) });
  };

  const handlePublish = () => {
    if (publishState !== 'idle') return;
    setPublishState('publishing');
    timers.current.push(window.setTimeout(() => setPublishState('live'), 1000));
    timers.current.push(window.setTimeout(() => onPublish(), 2200));
  };

  return (
    <BusinessSetupChrome activeNav="deals">
      <div className="w-full bg-surface-container-high text-on-surface py-space-xs px-space-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-xs text-caption font-caption">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-label-sm text-label-sm text-primary">Catalog Auto-Sync Active</span>
            <span className="text-outline">/</span>
            <span className="text-on-surface-variant font-label-md text-label-md">
              Imported source: <strong className="text-on-surface font-semibold">{draft.title}</strong>
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="bg-surface-canvas text-secondary px-space-xs py-space-2xs rounded text-caption font-caption shadow-sm">
              Catalog Base: ₦{FORMAT_AMOUNT(basePrice)}
            </span>
            <span className="text-on-surface-variant hidden md:inline">• Details &amp; photography pre-populated</span>
          </div>
        </div>
      </div>

      <div className="w-full px-space-xl pt-space-lg pb-space-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="inline-flex items-center gap-space-xs px-space-xs py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption mb-space-2xs font-semibold">
              <Icon name="auto_awesome" className="text-[14px]" />
              <span>SMART DEAL GENERATOR</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-on-surface tracking-tight">
              Product Deal Preview — Auto-Imported
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs max-w-2xl">
              Adjust your discount, voucher quantity, and redemption terms. We pre-filled everything directly from
              your catalog inventory.
            </p>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-canvas p-space-2xs rounded-xl shadow-sm">
            <Icon name="bolt" className="text-primary text-[20px] ml-space-xs" />
            <span className="font-label-sm text-label-sm text-on-surface font-medium pr-space-xs">
              Fast 60-Sec Activation
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-space-xl pb-space-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <section className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary font-heading-sm text-heading-sm">
                    %
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-on-surface">Discount Strategy</h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Determine member savings and margin tier
                    </p>
                  </div>
                </div>
                <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-space-xs py-space-2xs rounded-full font-medium">
                  Recommended: {discount}%
                </span>
              </div>
              <div className="bg-surface-container-low p-space-2xs rounded-lg flex gap-space-2xs mt-space-sm">
                {STRATEGY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-space-xs px-space-sm rounded-md font-label-md text-label-md transition-all flex items-center justify-center gap-space-2xs ${
                      activeTab === tab.id
                        ? 'bg-surface-canvas text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Icon name={tab.icon} className="text-[16px]" />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mt-space-md">
                <label className="block font-label-sm text-label-sm text-text-secondary mb-space-2xs">
                  Quick Margin Presets
                </label>
                <div className="grid grid-cols-5 gap-space-xs">
                  {PRESETS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDiscount(value)}
                      className={`py-space-xs rounded-lg font-label-md text-label-md transition ${
                        value === discount
                          ? 'bg-primary text-on-primary font-semibold shadow-sm'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                      }`}
                    >
                      {value === 20 ? '20% OFF' : `${value}%`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-space-md">
                <div className="flex justify-between items-center mb-space-2xs">
                  <span className="font-label-sm text-label-sm text-text-secondary">Custom Rate Adjuster</span>
                  <span className="font-heading-sm text-heading-sm text-primary font-bold">{discount}%</span>
                </div>
                <input
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                  max={60}
                  min={5}
                  step={1}
                  type="range"
                  value={discount}
                  onChange={(event) => setDiscount(Number(event.target.value))}
                />
              </div>
              <div className="mt-space-lg bg-surface-container-low rounded-xl p-space-md shadow-inner">
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                    Pricing Breakdown
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant flex items-center gap-space-2xs">
                    <Icon name="calculate" className="text-[14px]" />
                    Automated calculation
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-space-sm items-center">
                  <div className="bg-surface-canvas p-space-xs rounded-lg shadow-sm">
                    <span className="block font-caption text-caption text-text-secondary">Regular Menu</span>
                    <span className="font-heading-sm text-heading-sm text-text-secondary line-through">
                      ₦{FORMAT_AMOUNT(basePrice)}
                    </span>
                  </div>
                  <div className="bg-surface-canvas p-space-xs rounded-lg shadow-sm">
                    <span className="block font-caption text-caption text-primary font-semibold">Deal Price</span>
                    <span className="font-heading-md text-heading-md text-primary font-bold">
                      ₦{FORMAT_AMOUNT(dealPrice)}
                    </span>
                  </div>
                  <div className="bg-badge-discount-bg p-space-xs rounded-lg shadow-sm">
                    <span className="block font-caption text-caption text-badge-discount-text font-semibold">
                      Diner Saves
                    </span>
                    <span className="font-heading-sm text-heading-sm text-badge-discount-text font-bold">
                      ₦{FORMAT_AMOUNT(savings)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-space-xs pb-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="timer" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Limits &amp; Scarcity Settings</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Control kitchen load, table turnarounds, and redemption caps
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-sm">
                <div className="bg-surface-subtle p-space-md rounded-xl">
                  <label className="block font-label-md text-label-md text-on-surface font-semibold mb-space-2xs">
                    Quantity Limit
                  </label>
                  <span className="block font-caption text-caption text-text-secondary mb-space-2xs">
                    Total promotional stock available for this deal
                  </span>
                  <div className="flex items-center gap-space-xs mt-space-2xs">
                    <button
                      type="button"
                      aria-label="Decrease vouchers"
                      onClick={() => adjustVouchers(-5)}
                      className="w-10 h-10 rounded-lg bg-surface-canvas hover:bg-surface-container flex items-center justify-center text-on-surface shadow-sm font-bold text-heading-sm select-none"
                    >
                      −
                    </button>
                    <div className="flex-1 bg-surface-canvas rounded-lg h-10 flex items-center justify-center font-heading-sm text-heading-sm text-on-surface shadow-inner">
                      {studio.vouchers}
                    </div>
                    <button
                      type="button"
                      aria-label="Increase vouchers"
                      onClick={() => adjustVouchers(5)}
                      className="w-10 h-10 rounded-lg bg-surface-canvas hover:bg-surface-container flex items-center justify-center text-on-surface shadow-sm font-bold text-heading-sm select-none"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-space-2xs mt-space-xs text-text-secondary font-caption text-caption">
                    <Icon name="notifications_active" className="text-[16px] text-tertiary" />
                    <span>Push alert triggers at 80% claimed</span>
                  </div>
                </div>
                <div className="bg-surface-subtle p-space-md rounded-xl flex flex-col justify-between">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface font-semibold mb-space-2xs">
                      Anti-Abuse Safeguards
                    </label>
                    <div className="space-y-space-xs mt-space-2xs">
                      <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface">
                        <span className="text-text-secondary">Customer Claim Cap:</span>
                        <span className="font-semibold px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface">
                          {studio.claimOnce
                            ? '1 per diner'
                            : studio.unlimitedClaims
                              ? 'unlimited per diner'
                              : `${studio.maxClaims} per diner`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface">
                        <span className="text-text-secondary">Voucher Validity:</span>
                        <span className="font-semibold px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface">
                          14 Days from tap
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-caption font-caption text-badge-discount-text flex items-center gap-space-2xs mt-space-xs">
                    <Icon name="verified" className="text-[14px]" /> Fraud protection enabled
                  </span>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="flex items-center justify-between mb-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Eligible Redemption Days
                  </label>
                  <span className="font-caption text-caption text-text-secondary">
                    Lunch Window: 12:00 PM — 5:00 PM
                  </span>
                </div>
                <div className="flex flex-wrap gap-space-xs">
                  {DAY_CHIPS.map((day) => {
                    const active = studio.days[day.key];
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => onStudioChange({ days: { ...studio.days, [day.key]: !studio.days[day.key] } })}
                        className={`px-space-sm py-space-xs rounded-full font-label-sm text-label-sm ${
                          active
                            ? 'bg-surface-tint-blue text-primary font-semibold'
                            : 'bg-surface-subtle text-text-tertiary'
                        }`}
                      >
                        {active ? day.label : day.offLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="storefront" className="text-[20px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-on-surface">Participating Outlets</h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Select locations honoring this deal voucher
                    </p>
                  </div>
                </div>
                <span className="font-caption text-caption text-primary font-medium">
                  {activeOutlets} Branches Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-xs">
                {OUTLET_BRANCHES.map((branch) => (
                  <label
                    key={branch.key}
                    className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-low transition cursor-pointer"
                  >
                    <input
                      className="mt-1 w-4 h-4 accent-primary rounded cursor-pointer"
                      type="checkbox"
                      checked={studio.branches[branch.key]}
                      onChange={(event) =>
                        onStudioChange({ branches: { ...studio.branches, [branch.key]: event.target.checked } })
                      }
                    />
                    <div className="min-w-0">
                      <div className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        {branch.name}
                      </div>
                      <div className="font-caption text-caption text-text-secondary truncate">{branch.address}</div>
                      <span className="inline-block mt-space-2xs text-[11px] font-caption bg-surface-container-high text-on-surface px-space-2xs py-0.5 rounded">
                        {branch.note}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-space-xs pb-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="gavel" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">
                    Redemption Terms &amp; Policy
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Directly exposed inside the customer voucher screen
                  </p>
                </div>
              </div>
              <div className="mt-space-sm">
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                  className="w-full bg-surface-subtle text-on-surface p-space-sm rounded-xl font-body-md text-body-md focus:outline-none focus:bg-surface-canvas focus:ring-2 focus:ring-primary shadow-inner"
                />
                <div className="flex items-center justify-between mt-space-2xs font-caption text-caption text-text-secondary">
                  <span>Standard local restaurant safety clause applied</span>
                  <span>184 / 300 characters</span>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg sticky top-20">
            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <Icon name="devices" className="text-primary text-[20px]" />
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Live Consumer Feed Simulation
                </span>
              </div>
              <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-space-xs py-space-2xs rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                Real-time Sync
              </span>
            </div>

            <div className="bg-surface-subtle p-space-md rounded-2xl shadow-md">
              <div className="max-w-[340px] mx-auto bg-surface-canvas rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.01]">
                <div className="relative w-full h-48 bg-surface-dim overflow-hidden">
                  <img className="w-full h-full object-cover" alt={FEED_IMAGES[0].alt} src={FEED_IMAGES[0].src} />
                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm flex items-center gap-1">
                      <Icon name="local_offer" className="text-[13px]" />
                      {discount}% OFF
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-inverse-surface/80 text-inverse-on-surface text-[10px] font-caption backdrop-blur">
                      Limited to {studio.vouchers}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-canvas/90 backdrop-blur flex items-center justify-center text-error shadow-sm">
                    <Icon name="favorite" className="text-[18px]" />
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-inverse-surface/85 backdrop-blur text-inverse-on-surface text-[11px] font-caption flex items-center gap-1">
                    <Icon name="location_on" className="text-[12px] text-primary-fixed-dim" />
                    <span>0.4 mi away • Wuse II</span>
                  </div>
                </div>
                <div className="p-space-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                      The Smokehouse Abuja
                    </span>
                    <div className="flex items-center gap-0.5 text-tertiary-container font-caption text-caption font-bold">
                      <Icon name="star" className="text-[14px]" filled />
                      <span>4.9 (420+)</span>
                    </div>
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface truncate">{draft.title}</h3>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 line-clamp-1">
                    350g Prime cut with truffle butter &amp; garlic glaze
                  </p>
                  <div className="flex items-baseline justify-between mt-space-sm pt-space-xs">
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-heading-md text-heading-md text-primary font-bold">
                        ₦{FORMAT_AMOUNT(dealPrice)}
                      </span>
                      <span className="font-label-sm text-label-sm text-text-tertiary line-through">
                        ₦{FORMAT_AMOUNT(basePrice)}
                      </span>
                    </div>
                    <span className="font-caption text-caption text-badge-discount-text font-semibold bg-badge-discount-bg px-2 py-0.5 rounded">
                      Save ₦{FORMAT_AMOUNT(savings)}
                    </span>
                  </div>
                  <div className="mt-space-md">
                    <div className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md">
                      <span>Claim Voucher</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="radar" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Target Audience Reach</h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Instant proximity distribution upon publishing
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-md rounded-xl">
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-caption text-caption text-on-surface-variant font-medium">
                    Estimated Immediate Notification Reach
                  </span>
                  <span className="font-heading-sm text-heading-sm text-primary font-bold">1,420 Foodies</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '78%' }} />
                </div>
                <div className="grid grid-cols-2 gap-space-xs mt-space-sm pt-space-xs font-caption text-caption text-text-secondary">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
                    <span>
                      Radius: <strong>3.5 miles</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
                    <span>Active Dine-in Seekers</span>
                  </div>
                </div>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-space-sm">
                Push notifications sent to <strong>1,420 registered foodies</strong> within 3.5 miles upon launch.
                Expect initial claims within 4–9 minutes.
              </p>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishState !== 'idle'}
                className={`w-full h-14 rounded-xl font-button-primary text-button-primary shadow-lg flex items-center justify-center gap-space-xs transition-all active:scale-[0.99] font-bold ${
                  publishState === 'live'
                    ? 'bg-badge-discount-text text-on-primary'
                    : 'bg-primary hover:bg-primary-container text-on-primary shadow-primary/25'
                } ${publishState === 'publishing' ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                {publishState === 'idle' && (
                  <>
                    <span>Publish Deal to Nearby Feeds 🔥</span>
                    <Icon name="arrow_forward" className="text-[20px]" />
                  </>
                )}
                {publishState === 'publishing' && (
                  <>
                    <Icon name="sync" className="text-[20px] animate-spin" />
                    <span>Publishing to 1,420 foodies...</span>
                  </>
                )}
                {publishState === 'live' && (
                  <>
                    <Icon name="check_circle" className="text-[20px]" />
                    <span>Live On Feeds!</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-space-xs text-center text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary transition-colors"
              >
                Cancel &amp; Keep Regular Product Only
              </button>
              <div className="text-center font-caption text-caption text-outline mt-space-2xs">
                Free promotion under current VEMTAP Starter Merchant quota
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Cancel &amp; Keep Regular Product Only</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishState !== 'idle'}
              className={`px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg flex items-center justify-center gap-space-xs transition-all active:scale-[0.99] font-bold ${
                publishState === 'live'
                  ? 'bg-badge-discount-text text-on-primary'
                  : 'bg-primary hover:bg-primary-container text-on-primary shadow-primary/25'
              } ${publishState === 'publishing' ? 'opacity-90 cursor-not-allowed' : ''}`}
            >
              {publishState === 'idle' && (
                <>
                  <span>Publish Deal to Nearby Feeds 🔥</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              )}
              {publishState === 'publishing' && (
                <>
                  <Icon name="sync" className="text-[20px] animate-spin" />
                  <span>Publishing to 1,420 foodies...</span>
                </>
              )}
              {publishState === 'live' && (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Live On Feeds!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
