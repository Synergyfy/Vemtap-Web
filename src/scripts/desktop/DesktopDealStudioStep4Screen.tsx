import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { getActiveVariants } from '../productVariants';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';
import { dealDurationLabel } from './desktopDealStudio';
import {
  DEAL_TYPE_OPTIONS,
  DEFAULT_BUNDLE_CATALOG,
  claimLimitLabel,
  dealTypeTitle,
  describeComboRules,
  formatFlashValidity,
  resolveDealPricing,
  validateDealConfiguration,
} from '../deals/dealStudioShared';
import {
  DEAL_PUBLICATION_COPY,
  publishDeal,
  type DealPublicationResult,
} from '../deals/dealPublication';

interface DesktopDealStudioStep4ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onBack: () => void;
  onEditOffer: () => void;
  onEditRules: () => void;
  onEditLocations: () => void;
  onPublish: () => void;
  onAnalytics: () => void;
  onSaveDraft: () => void;
  onNav?: (key: string) => void;
}

const SHOWCASE_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIDbVLmuz5V80aoA7UySCRNnywXaqopQlvjH8hejoFvdo-v2c_jZiSelr-kE1L6BB2hp5RlB1Rv7NNwMGW8y0vX934t6xlstTsBMcIBGTrM0P9q-xOj171VJVDVVDxBt3GpcCUbPTz0hQi6J77qOTonBLDPopUs9ls55WsIVigHo2oANgMGZIbTArM60PBBXxyre_x2wVIsPIBBUS14WHfgAtda5G7TR1cKBkZSQmW7ggUFiPP8B_dgg',
    alt: 'A sizzling, freshly carved woodfire aged ribeye steak garnished with rosemary butter on a slate platter in a modern steakhouse setting. Ambient warm cinematic restaurant lighting, deep rich mahogany tones, gourmet food photography.',
  },
];

const RADAR_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7S-mYAqNQ-XH6O1qbIjVx69tV_1v1DRQhorX_74sSryZ8lxDqOMnv1IuF-d1vBQBFYJ5gaF_cpThIZzkDp65C7tkGIlR3003sMKiBzaJjeZurqt2ZJnFtLSLex6-y2kVrkeYVgyxTl7hcL5EKH6o9xzINKwi-CGYdYhFMB1HdokjE6p5a95udQj-vzkqTC-M4k9AR28olACl_jQz2-X91MrwHW9z8LPBpwdF8VwkQ3gP8XbfCpgV2Yw',
    alt: '',
  },
];

const DAY_ORDER: Array<{ key: keyof DealStudioDraft['days']; label: string }> = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const BRANCH_ROWS: Array<{ key: keyof DealStudioDraft['branches']; label: string }> = [
  { key: 'wuseII', label: 'Wuse II Flagship' },
  { key: 'garkiII', label: 'Garki II Branch' },
  { key: 'maitama', label: 'Maitama Heights' },
];

const TO_NUMBER = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const FORMAT_AMOUNT = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function DesktopDealStudioStep4Screen({
  draft,
  studio,
  onBack,
  onEditOffer,
  onEditRules,
  onEditLocations,
  onPublish,
  onAnalytics,
  onSaveDraft,
  onNav,
}: DesktopDealStudioStep4ScreenProps) {
  const [showModal, setShowModal] = useState(false);
  const [publication, setPublication] = useState<DealPublicationResult | null>(null);

  const activeVariants = getActiveVariants(draft);
  const variantPriceSource =
    activeVariants.find((variant) => variant.name === 'Regular')?.price ?? activeVariants[0]?.price ?? draft.basePrice;
  const parsedVariantPrice = TO_NUMBER(variantPriceSource);
  const basePrice = parsedVariantPrice > 0 ? parsedVariantPrice : TO_NUMBER(draft.basePrice);
  const discount = studio.discountPct;
  const bundleCatalog = [{ id: 'current', name: draft.title, price: basePrice }, ...DEFAULT_BUNDLE_CATALOG];
  const pricing = resolveDealPricing(studio, basePrice, bundleCatalog);
  const dealPrice = pricing.dealPrice;
  const savings = pricing.savings;
  const savingsPct = pricing.savingsPct;
  const strategyTitle = dealTypeTitle(studio.strategy);
  const strategyIcon = DEAL_TYPE_OPTIONS.find((option) => option.id === studio.strategy)?.icon ?? 'percent';
  const comboRules = studio.strategy === 'combo' ? describeComboRules(studio.combo, basePrice, bundleCatalog) : [];

  // Everything that must hold before the deal can be published: pricing rules
  // plus the operational requirements the storefront/customers rely on.
  const readinessErrors: string[] = [
    ...validateDealConfiguration(studio, basePrice, bundleCatalog),
    ...(studio.vouchers <= 0 ? ['Set the total promotional quantity to at least 1.'] : []),
    ...(studio.claimSteps.length === 0 ? ['Add at least one “how to claim” instruction.'] : []),
    ...(studio.terms.length === 0 ? ['Add at least one term & condition.'] : []),
    ...(Object.values(studio.branches).every((value) => !value) ? ['Select at least one participating branch.'] : []),
    ...(Object.values(studio.days).every((value) => !value) ? ['Select at least one redemption day.'] : []),
  ];
  const canPublish = readinessErrors.length === 0;

  const handlePublish = () => {
    if (!canPublish) return;
    // The status here is whatever the service returns — not an assumption.
    setPublication(publishDeal({ dealTitle: draft.title, studio }));
    setShowModal(true);
  };
  const strategyDetail =
    studio.strategy === 'fixed'
      ? `Fixed Amount Off (₦${FORMAT_AMOUNT(studio.fixed.amountOff)} off${
          studio.fixed.minSpend > 0 ? ` • min spend ₦${FORMAT_AMOUNT(studio.fixed.minSpend)}` : ''
        })`
      : studio.strategy === 'tiered'
        ? `Tiered / Flash Happy Hour (${studio.flash.discountPct}% off in window)`
        : studio.strategy === 'combo'
          ? (comboRules[0] ?? 'Combo & Bundle Deal')
          : `Percentage Discount (${discount}% Off)`;
  const activeBranches = BRANCH_ROWS.filter((branch) => studio.branches[branch.key]);
  const activeDays = DAY_ORDER.filter((day) => studio.days[day.key]);
  const dayIndices = activeDays.map((day) => DAY_ORDER.findIndex((entry) => entry.key === day.key));
  const contiguous =
    activeDays.length > 1 && dayIndices.every((value, index) => index === 0 || value === dayIndices[index - 1] + 1);
  const daysLabel =
    activeDays.length === 0
      ? 'No Eligible Days'
      : contiguous
        ? `${activeDays[0].label} – ${activeDays[activeDays.length - 1].label}`
        : activeDays.map((day) => day.label).join(', ');

  const claimLimit = claimLimitLabel(studio);
  const giftingPrivileges = !studio.gifting ? 'Not Allowed' : studio.otpVerify ? 'Allowed with OTP' : 'Allowed';

  const inner = (
    <>
      <div className="w-full max-w-7xl mx-auto px-space-xl py-space-xl flex flex-col gap-space-2xl">
        <div className="flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
              <span className="hover:text-primary transition-colors cursor-pointer">Catalog Workflow</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="hover:text-primary transition-colors cursor-pointer">Deal Studio</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-on-surface font-semibold">Step 4 of 4: Final Review &amp; Launch</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text">
              <Icon name="verified" className="text-[16px]" />
              <span className="font-caption text-caption font-semibold tracking-wide uppercase">Ready to Publish</span>
            </div>
          </div>
          <div className="flex flex-col gap-space-2xs">
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-primary-container rounded-full transition-all duration-700 ease-out" style={{ width: '100%' }} />
            </div>
            <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
              <span className="font-medium text-primary">100% Complete</span>
              <span>Automated Pre-Flight Check: Passed</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
            <div className="max-w-2xl">
              <h1 className="font-heading-lg text-heading-lg text-on-surface tracking-tight">
                Deal Configured &amp; Verified!
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs">
                Review all terms, rules, pricing, and audience reach before publishing live to local members.
              </p>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={onBack}
                className="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-space-2xs"
              >
                <Icon name="arrow_back" className="text-[18px]" />
                <span>Back to Step 3</span>
              </button>
              <button
                type="button"
                className="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-space-2xs"
              >
                <Icon name="preview" className="text-[18px]" />
                <span>Customer Mobile Preview</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-lg transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-primary">
                  <Icon name="restaurant" className="text-[20px]" />
                  <span className="font-heading-sm text-heading-sm text-on-surface">Offer Showcase</span>
                </div>
                <button
                  type="button"
                  onClick={onEditOffer}
                  className="px-space-sm py-space-2xs rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm hover:bg-secondary-fixed transition-colors flex items-center gap-space-2xs"
                >
                  <Icon name="edit" className="text-[16px]" />
                  <span>Edit Offer</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-space-lg">
                <div className="relative w-full sm:w-48 h-36 rounded-lg overflow-hidden bg-surface-container shrink-0">
                  <img className="w-full h-full object-cover" alt={SHOWCASE_IMAGES[0].alt} src={SHOWCASE_IMAGES[0].src} />
                  <div className="absolute top-space-xs left-space-xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-space-2xs shadow-sm">
                    <Icon name="local_offer" className="text-[14px]" />
                    <span>{savingsPct}% OFF</span>
                  </div>
                </div>
                <div className="flex flex-col justify-between flex-1 gap-space-sm">
                  <div className="flex flex-col gap-space-2xs">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-caption text-caption flex items-center gap-space-2xs">
                        <Icon name="sync" className="text-[14px] text-badge-discount-text" />
                        <span>Auto-Synced</span>
                      </span>
                      <span className="px-space-xs py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-caption text-caption font-semibold flex items-center gap-space-2xs">
                        <Icon name={strategyIcon} className="text-[14px]" />
                        <span>{strategyTitle}</span>
                      </span>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm text-on-surface">
                      {studio.strategy === 'percentage'
                        ? `${discount}% Off ${draft.title}`
                        : `${strategyTitle}: ${draft.title}`}
                    </h3>
                    <p className="font-caption text-caption text-on-surface-variant line-clamp-2">
                      {studio.strategy === 'tiered'
                        ? `Validity: ${formatFlashValidity(studio.flash)} • ${studio.flash.days}, ${studio.flash.window}`
                        : studio.strategy === 'combo'
                          ? (comboRules[1] ?? comboRules[0] ?? '')
                          : `${strategyDetail} — Prime 45-day dry-aged Black Angus cut served with truffle chimichurri and flame-roasted bone marrow mash.`}
                    </p>
                  </div>
                  <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-wrap items-baseline justify-between gap-space-xs">
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-caption text-caption text-on-surface-variant">Member Pay:</span>
                      <span className="font-heading-md text-heading-md text-primary font-bold">
                        ₦{FORMAT_AMOUNT(dealPrice)}
                      </span>
                      <span className="font-label-sm text-label-sm text-text-tertiary line-through">
                        ₦{FORMAT_AMOUNT(pricing.originalTotal)}
                      </span>
                    </div>
                    <span className="font-caption text-caption font-semibold text-badge-discount-text">
                      Save ₦{FORMAT_AMOUNT(Math.max(savings, 0))} ({savingsPct}% Off)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-lg transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-primary">
                  <Icon name="tune" className="text-[20px]" />
                  <span className="font-heading-sm text-heading-sm text-on-surface">Limits, Rules &amp; Gifting</span>
                </div>
                <button
                  type="button"
                  onClick={onEditRules}
                  className="px-space-sm py-space-2xs rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm hover:bg-secondary-fixed transition-colors flex items-center gap-space-2xs"
                >
                  <Icon name="edit" className="text-[16px]" />
                  <span>Edit Rules</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="p-space-md rounded-xl bg-surface-subtle flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                    <Icon name="inventory_2" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-on-surface-variant">Quantity Limit</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {studio.vouchers} Total Units
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text flex items-center gap-space-2xs mt-0.5">
                      <Icon name="lock" className="text-[12px]" /> Total promotional stock
                    </span>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                    <Icon name="person_check" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-on-surface-variant">Claim Limit</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">{claimLimit}</span>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                      Fair-share community rule applied
                    </span>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                    <Icon name="shopping_cart" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-on-surface-variant">Max Per Order</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {studio.maxUnitsPerOrder} Units
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                      Per single order or redemption
                    </span>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                    <Icon name="card_giftcard" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-on-surface-variant">Gifting Privileges</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {giftingPrivileges}
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                      Recipient verified via mobile token
                    </span>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                    <Icon name="schedule" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-on-surface-variant">Advance Notice</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      1 Hour Prep / Booking
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                      Protects kitchen capacity
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <span className="font-caption text-caption text-on-surface-variant">Redemption Modes:</span>
                {studio.dineIn && (
                  <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    <Icon name="table_restaurant" className="text-[14px]" /> Dine-In Enabled
                  </div>
                )}
                {studio.pickup && (
                  <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    <Icon name="shopping_bag" className="text-[14px]" /> Pickup Enabled
                  </div>
                )}
                <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-caption text-caption">
                  <Icon name="block" className="text-[14px]" /> Delivery Not Allowed
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-lg transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-primary">
                  <Icon name="storefront" className="text-[20px]" />
                  <span className="font-heading-sm text-heading-sm text-on-surface">Branches &amp; Schedule</span>
                </div>
                <button
                  type="button"
                  onClick={onEditLocations}
                  className="px-space-sm py-space-2xs rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm hover:bg-secondary-fixed transition-colors flex items-center gap-space-2xs"
                >
                  <Icon name="edit" className="text-[16px]" />
                  <span>Edit Locations</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-xs">
                  <span className="font-caption text-caption text-on-surface-variant font-medium">
                    Eligible Merchant Hubs
                  </span>
                  <div className="flex flex-col gap-space-xs mt-space-2xs">
                    {activeBranches.map((branch) => (
                      <div key={branch.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <Icon name="pin_drop" className="text-[18px] text-primary" />
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            {branch.label}
                          </span>
                        </div>
                        <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-xs">
                  <span className="font-caption text-caption text-on-surface-variant font-medium">
                    Redemption Window
                  </span>
                  <div className="flex flex-col gap-space-2xs mt-space-2xs">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="calendar_month" className="text-[18px] text-on-surface-variant" />
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        {studio.duration === 'forever'
                          ? 'Always On — No Fixed Expiry'
                          : `Oct 19 – Nov 2, 2025 (${dealDurationLabel(studio.duration)})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <Icon name="alarm" className="text-[18px] text-on-surface-variant" />
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        {daysLabel} •{' '}
                        {studio.redeemAllDay
                          ? 'All Day (24 Hours)'
                          : `${studio.redeemStart} – ${studio.redeemEnd}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-lg">
              <div className="flex items-center gap-space-xs text-primary">
                <Icon name="assignment_turned_in" className="text-[20px]" />
                <span className="font-heading-sm text-heading-sm text-on-surface">
                  Terms &amp; Redemption Steps Audit
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div className="flex flex-col gap-space-sm">
                  <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-space-2xs">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    How Member Claims (Customer Flow)
                  </span>
                  <ol className="flex flex-col gap-space-sm pl-space-2xs">
                    {studio.claimSteps.length === 0 && (
                      <li className="font-body-md text-body-md text-error">
                        No claim instructions yet — add them in “How to Claim”.
                      </li>
                    )}
                    {studio.claimSteps.map((step, index) => (
                      <li
                        key={`${index}-${step}`}
                        className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant"
                      >
                        <span className="font-semibold text-primary font-caption text-caption px-space-xs py-space-2xs rounded-full bg-surface-tint-blue shrink-0">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-space-2xs">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    Enforced Merchant Terms
                  </span>
                  <ul className="flex flex-col gap-space-sm">
                    {studio.terms.length === 0 && (
                      <li className="font-body-md text-body-md text-error">
                        No terms yet — add them in “Terms &amp; Conditions”.
                      </li>
                    )}
                    {studio.terms.map((term, index) => (
                      <li
                        key={`${index}-${term}`}
                        className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant"
                      >
                        <Icon name="check_circle" className="text-[18px] text-badge-discount-text shrink-0 mt-0.5" />
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="rounded-xl bg-surface-container-lowest shadow-md p-space-lg flex flex-col gap-space-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-primary">
                  <Icon name="radar" className="text-[20px]" />
                  <span className="font-heading-sm text-heading-sm text-on-surface">Audience Reach &amp; Forecast</span>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Live Algorithm
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-tint-blue to-surface-container p-space-lg flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-secondary font-semibold uppercase tracking-wider">
                    Estimated Instant Reach
                  </span>
                  <Icon name="sensors" className="text-[24px] text-primary" />
                </div>
                <div className="flex items-baseline gap-space-2xs">
                  <span className="font-display-hero text-display-hero text-on-surface font-extrabold tracking-tight">
                    ~1,420
                  </span>
                  <span className="font-heading-sm text-heading-sm text-primary font-semibold">verified foodies</span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mt-space-2xs">
                  Active VEMTAP users within a <strong>3.5 km radius</strong> of your 2 registered locations will
                  receive an alert upon live launch.
                </p>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                  <span>Geo-Targeting Coverage (3.5 km Radar)</span>
                  <span className="font-semibold text-primary">Wuse II + Garki II</span>
                </div>
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${RADAR_IMAGES[0].src}')` }}
                  />
                  <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping absolute" />
                    <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center shadow-lg">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary ring-2 ring-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-1/3 right-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 animate-ping absolute" />
                    <div className="w-7 h-7 rounded-full bg-primary/40 flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-space-xs left-space-xs px-space-xs py-space-2xs rounded-lg bg-inverse-surface/85 backdrop-blur text-inverse-on-surface font-caption text-caption flex items-center gap-space-2xs">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    <span>Signal Broadcast Ready</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <div className="flex items-start gap-space-sm">
                  <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Icon name="push_pin" className="text-[16px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Pinned Placement Guaranteed
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Featured at the top of the Apo &amp; Wuse local discovery feed for 72 hours.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-space-sm">
                  <div className="w-7 h-7 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0 mt-0.5">
                    <Icon name="payments" className="text-[16px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      0% Commission Guarantee
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      100% of customer pay price (₦{FORMAT_AMOUNT(dealPrice)}) settles directly to your account. No
                      hidden cuts.
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-space-sm pt-space-md">
                {!canPublish && (
                  <div className="rounded-xl bg-error/5 border border-error/20 p-space-sm flex flex-col gap-space-2xs">
                    <span className="font-label-sm text-label-sm text-error font-semibold flex items-center gap-space-2xs">
                      <Icon name="error" className="text-[16px]" />
                      Complete these before publishing
                    </span>
                    <ul className="flex flex-col gap-1">
                      {readinessErrors.map((error) => (
                        <li key={error} className="font-caption text-caption text-error flex items-start gap-space-2xs">
                          <span className="mt-1 w-1 h-1 rounded-full bg-error shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!canPublish}
                  className={`w-full h-14 rounded-xl font-button-primary text-button-primary shadow-lg flex items-center justify-center gap-space-xs text-center transition-all ${
                    canPublish
                      ? 'bg-primary-container text-on-primary shadow-primary-container/25 hover:bg-primary active:scale-[0.99] cursor-pointer'
                      : 'bg-surface-container-high text-text-tertiary shadow-none cursor-not-allowed'
                  }`}
                >
                  <span>Publish Deal to Nearby Feeds</span>
                  <span className="text-lg">{canPublish ? '🔥 🚀' : '🔒'}</span>
                </button>
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="w-full h-11 rounded-xl bg-surface-subtle text-on-surface-variant font-button-secondary text-button-secondary hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center gap-space-2xs"
                >
                  <Icon name="bookmark_border" className="text-[18px]" />
                  <span>Save Deal as Draft</span>
                </button>
                <p className="font-caption text-caption text-text-tertiary text-center px-space-xs mt-space-2xs leading-relaxed">
                  You can pause redemption, adjust quotas, or cancel this offer at any time from your Merchant Business
                  Hub.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-high/40 p-space-md flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <Icon name="verified_user" className="text-primary text-[24px]" />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    Pre-Activation Assurance
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    NDPR compliant customer token routing
                  </span>
                </div>
              </div>
              <button type="button" className="font-label-sm text-label-sm text-primary hover:underline font-semibold">
                Policy Guide
              </button>
            </div>
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
              <span>Back to Step 3: Branch Availability</span>
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
              onClick={handlePublish}
              disabled={!canPublish}
              className={`px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg flex items-center justify-center gap-space-xs transition-all ${
                canPublish
                  ? 'bg-primary hover:bg-primary-container text-on-primary shadow-primary/20 cursor-pointer'
                  : 'bg-surface-container-high text-text-tertiary shadow-none cursor-not-allowed opacity-50'
              }`}
            >
              <span>Publish Deal to Nearby Feeds</span>
              <span className="text-lg">{canPublish ? '🔥 🚀' : '🔒'}</span>
            </button>
          </div>
        </div>
      </div>

      {showModal && publication && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-space-md"
          onClick={() => setShowModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-space-xl shadow-2xl flex flex-col items-center text-center gap-space-lg transform transition-all"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${DEAL_PUBLICATION_COPY[publication.status].tone}`}
            >
              <Icon name={DEAL_PUBLICATION_COPY[publication.status].icon} className="text-[36px]" />
            </div>
            <div className="flex flex-col gap-space-2xs">
              <h3 className="font-heading-md text-heading-md text-on-surface font-bold">
                {DEAL_PUBLICATION_COPY[publication.status].title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{publication.message}</p>
              <p className="font-caption text-caption text-text-tertiary mt-space-2xs">
                Status: {publication.status} • Ref {publication.reference}
              </p>
            </div>
            <div className="w-full flex flex-col gap-space-xs">
              <button
                type="button"
                onClick={onAnalytics}
                className="w-full h-12 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary-container transition-colors"
              >
                Go to Real-Time Analytics
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onPublish();
                }}
                className="w-full h-11 rounded-xl bg-surface-subtle text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (onNav) {
    return (
      <MerchantShell activeNav="business-deals" onNav={onNav}>
        {inner}
      </MerchantShell>
    );
  }
  return (
    <BusinessSetupChrome activeNav="deals">
      {inner}
    </BusinessSetupChrome>
  );
}
