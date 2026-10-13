import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { DealStudioDraft } from './dealStudio';
import { dealDurationLabel } from './dealStudio';
import type { ProductDraft } from './productDraft';

interface BusinessDealStudioStep4ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onBack: () => void;
  onEditOffer: () => void;
  onEditRules: () => void;
  onEditLocations: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
}

const HERO_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3zk8H_VVFT_7YsSAEfRslYg_o-9CPBE1oNObjdBBoEPq726Ajh14wQjrdHZDIfHquWuYaJ57IRfi4ewZAuR-wK6ryANgZTN0vJdXrIsxml-SdNyMr2K19Q3D5NBNGa8CeOSQFmZpQYt4uMfS4DsdwSTUNtLubw9qloAP_2NiIn_4cUBRWqXURxptZWQtGsP09QHtSNJhj0KaNJj81tJjRQ3D_CFHMRSXK7Nc6nMqb',
  alt: 'A juicy, charcoal-grilled woodfire aged ribeye steak served on a rustic dark slate board with melted rosemary herb butter, coarse sea salt flakes, and tender roasted baby tomatoes. Warm ambient restaurant lighting with rich deep tones and high-end culinary photography.',
};

const MAP_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWtUvHLIcbqcTqjm7Kx_93XfJ_fHBLr7QmFDcmIVAABkhYXEXSspRFsRgxjOCsEPgtYtQ28EK0yQWUuVXy5cy5za0PMZF5WAMIYnKg4gw9ML3glWMn4EmyvyEKGpnzxU1zKRS-akWkk7GGyVGMoHdo6JfOJCYzajOjjnX5icjnTygV1VVPm4zhcxadKg-Z1UkVG8YxFNpXvGKsTQ0TXoPvgNbl96fMziRslo72aL1M',
  alt: 'Map coverage zone around Wuse 2, Abuja, Nigeria',
};

const BRANCH_DETAILS: Array<{ key: keyof DealStudioDraft['branches']; name: string; address: string }> = [
  { key: 'wuseII', name: 'Wuse II Flagship', address: 'Aminu Kano Crescent, Abuja' },
  { key: 'garkiII', name: 'Garki II Branch', address: 'Tafawa Balewa Way, Abuja' },
  { key: 'maitama', name: 'Maitama Heights', address: 'Plot 702 Aguiyi Ironsi St, Maitama District, Abuja' },
];

const DAY_ORDER: Array<keyof DealStudioDraft['days']> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const DAY_LABELS: Record<keyof DealStudioDraft['days'], string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function BusinessDealStudioStep4Screen({
  draft,
  studio,
  onBack,
  onEditOffer,
  onEditRules,
  onEditLocations,
  onPublish,
  onSaveDraft,
}: BusinessDealStudioStep4ScreenProps) {
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'success'>('idle');
  const successTimer = useRef<number | null>(null);
  const doneTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (successTimer.current !== null) window.clearTimeout(successTimer.current);
      if (doneTimer.current !== null) window.clearTimeout(doneTimer.current);
    },
    [],
  );

  const regularVariant = draft.variants.find((variant) => variant.name === 'Regular') ?? draft.variants[0];
  const baseAmount = parseAmount(regularVariant?.price ?? draft.basePrice);
  const pct = studio.discountPct;
  const savings = Math.round((baseAmount * pct) / 100);
  const dealAmount = baseAmount - savings;
  const activeBranches = BRANCH_DETAILS.filter((branch) => studio.branches[branch.key]);
  const activeDayKeys = DAY_ORDER.filter((key) => studio.days[key]);
  const weekdayCount = (['mon', 'tue', 'wed', 'thu', 'fri'] as Array<keyof DealStudioDraft['days']>).filter(
    (key) => studio.days[key],
  ).length;
  const dayLabel =
    weekdayCount === 5 && !studio.days.sat && !studio.days.sun
      ? 'Mon – Fri'
      : activeDayKeys.map((key) => DAY_LABELS[key]).join(', ');

  const handlePublish = () => {
    if (publishState !== 'idle') return;
    setPublishState('publishing');
    successTimer.current = window.setTimeout(() => setPublishState('success'), 1200);
    doneTimer.current = window.setTimeout(() => onPublish(), 2700);
  };

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
                Review &amp; Launch
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

      <div className="flex flex-col w-full px-margin pb-48 space-y-space-md">
        <section className="flex flex-col gap-space-xs mt-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <span className="font-label-sm text-label-sm text-text-secondary">Step 4 of 4</span>
              <span className="w-1 h-1 rounded-full bg-text-tertiary" />
              <span className="font-label-sm text-label-sm font-semibold text-text-primary">Final Review</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <Icon name="check_circle" className="text-[14px]" filled />
              <span className="font-label-sm text-label-sm font-semibold">Ready to Publish</span>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full w-full rounded-full bg-primary-container transition-all duration-500" />
          </div>
        </section>

        <section className="rounded-xl p-space-md bg-surface-tint-blue shadow-sm flex items-start gap-space-sm">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="celebration" className="text-primary text-[20px]" filled />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="font-heading-sm text-heading-sm text-text-primary leading-snug">🎉 Deal configured &amp; verified!</p>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Review all terms, rules, and audience reach before publishing live to local members.
            </p>
          </div>
        </section>

        <article className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider">
              Offer Showcase
            </span>
            <button
              className="font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant flex items-center gap-0.5"
              type="button"
              onClick={onEditOffer}
            >
              Edit
              <Icon name="edit" className="text-[16px]" />
            </button>
          </div>
          <div className="flex gap-space-sm items-start">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container">
              <img className="w-full h-full object-cover" alt={HERO_IMAGE.alt} src={HERO_IMAGE.src} />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shadow-sm">
                {pct}% OFF
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption text-text-secondary font-medium">
                  Auto-Synced
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue font-caption text-caption text-primary font-medium">
                  Flash Deal
                </span>
              </div>
              <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                {pct}% Off {draft.title}
              </h2>
              <p className="font-body-md text-body-md text-text-secondary line-clamp-1 mt-0.5">
                Signature dry-aged prime beef cut with truffle glaze.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-space-xs">
            <div className="flex items-baseline justify-between">
              <span className="font-body-md text-body-md text-text-secondary">Original Price</span>
              <span className="font-body-md text-body-md text-text-tertiary line-through">
                ₦{formatAmount(baseAmount)}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex flex-col">
                <span className="font-heading-sm text-heading-sm font-semibold text-text-primary">
                  Member Pay Price
                </span>
                <span className="font-caption text-caption text-badge-discount-text font-medium">
                  Instant savings of ₦{formatAmount(savings)}
                </span>
              </div>
              <span className="font-heading-lg text-heading-lg font-bold text-primary">
                ₦{formatAmount(dealAmount)}
              </span>
            </div>
            <div className="mt-2 pt-2 flex items-center justify-between bg-surface-canvas rounded-lg px-space-sm py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon name="percent" className="text-primary text-[18px]" />
                <span className="font-label-sm text-label-sm text-text-primary">
                  Percentage Discount ({pct}% Off)
                </span>
              </div>
              <Icon name="verified" className="text-text-tertiary text-[16px]" />
            </div>
          </div>
        </article>

        <article className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="tune" className="text-secondary text-[20px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Limits, Rules &amp; Gifting</h3>
            </div>
            <button
              className="font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant flex items-center gap-0.5"
              type="button"
              onClick={onEditRules}
            >
              Edit
              <Icon name="edit" className="text-[16px]" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-space-xs mt-1">
            <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col">
              <span className="font-caption text-caption text-text-secondary">Available Vouchers</span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-semibold mt-0.5">
                {studio.vouchers} Vouchers
              </span>
              <span className="font-caption text-caption text-text-tertiary mt-0.5">Inventory locked</span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col">
              <span className="font-caption text-caption text-text-secondary">Claim Limit</span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-semibold mt-0.5">
                {studio.claimOnce ? '1 Per Customer' : `${studio.maxClaims} Per Customer`}
              </span>
              <span className="font-caption text-caption text-text-tertiary mt-0.5">Fair-share rule</span>
            </div>
          </div>
          <div className="flex flex-col space-y-2.5 mt-2">
            {studio.gifting && (
              <div className="flex items-start gap-space-xs">
                <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="card_giftcard" className="text-primary text-[16px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-medium">Gifting Allowed</span>
                  <span className="font-caption text-caption text-text-secondary">
                    Friends &amp; family can receive voucher via SMS/WhatsApp
                    {studio.otpVerify ? ' with one-time OTP claim verification.' : '.'}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-space-xs">
              <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="restaurant" className="text-secondary text-[16px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary font-medium">Order Types</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full font-medium ${
                      studio.dineIn
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : 'bg-surface-container text-text-tertiary'
                    }`}
                  >
                    <Icon name={studio.dineIn ? 'check' : 'close'} className="text-[13px]" /> Dine-In
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full font-medium ${
                      studio.pickup
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : 'bg-surface-container text-text-tertiary'
                    }`}
                  >
                    <Icon name={studio.pickup ? 'check' : 'close'} className="text-[13px]" /> Pickup
                  </span>
                  <span className="inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container text-text-tertiary font-medium">
                    <Icon name="close" className="text-[13px]" /> Delivery
                  </span>
                </div>
              </div>
            </div>
            {studio.reservation && (
              <div className="flex items-start gap-space-xs">
                <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="hourglass_top" className="text-secondary text-[16px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-medium">Advance Notice</span>
                  <span className="font-caption text-caption text-text-secondary">
                    1 hour advance table or prep reservation required prior to redemption.
                  </span>
                </div>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="store" className="text-secondary text-[20px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Branches &amp; Schedule</h3>
            </div>
            <button
              className="font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant flex items-center gap-0.5"
              type="button"
              onClick={onEditLocations}
            >
              Edit
              <Icon name="edit" className="text-[16px]" />
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            {activeBranches.map((branch) => (
              <div
                key={branch.key}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle"
              >
                <div className="flex items-center gap-2.5">
                  <Icon name="location_on" className="text-primary text-[18px]" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-medium text-text-primary">{branch.name}</span>
                    <span className="font-caption text-caption text-text-secondary">{branch.address}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Active
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-space-xs">
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-caption text-caption text-text-secondary">Redeem Hours</span>
              <span className="font-label-md text-label-md text-text-primary font-semibold mt-1">{dayLabel}</span>
              <span className="font-caption text-caption text-primary font-medium">
                {studio.redeemAllDay ? 'All Day (24 Hours)' : `${studio.redeemStart} – ${studio.redeemEnd}`}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-caption text-caption text-text-secondary">Duration</span>
              <span className="font-label-md text-label-md text-text-primary font-semibold mt-1">
                {studio.duration === 'forever' ? 'Always On' : `${dealDurationLabel(studio.duration)} Window`}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                {studio.duration === 'forever' ? 'No fixed end date' : 'Oct 19 – Nov 2, 2024'}
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="radar" className="text-primary text-[20px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Audience Reach &amp; Forecast</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
              Hyperlocal Live
            </span>
          </div>
          <div className="p-space-sm rounded-xl bg-surface-tint-blue flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(6,108,244,0.3)]">
              <Icon name="notifications_active" className="text-on-primary text-[24px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="font-heading-lg text-heading-lg font-bold text-text-primary">~1,420</span>
                <span className="font-label-sm text-label-sm text-primary font-medium">foodies</span>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-snug">
                Within 3.5km of your {activeBranches.length} locations will receive a tap broadcast upon publish.
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2.5">
              <Icon name="push_pin" className="text-primary text-[18px]" />
              <span className="font-body-md text-body-md text-text-primary">
                Pinned to top of <strong className="font-semibold">Apo/Wuse</strong> local deals feed
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="verified_user" className="text-badge-discount-text text-[18px]" />
              <span className="font-body-md text-body-md text-text-primary">
                <strong className="font-semibold text-badge-discount-text">0% Commission:</strong> Customers pay ₦
                {formatAmount(dealAmount)} directly to you.
              </span>
            </div>
          </div>
          <div
            className="w-full h-28 rounded-xl bg-cover bg-center relative overflow-hidden shadow-inner"
            data-location="Wuse 2, Abuja, Nigeria"
            style={{ backgroundImage: `url('${MAP_IMAGE.src}')` }}
            role="img"
            aria-label={MAP_IMAGE.alt}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-transparent to-transparent flex items-end p-2.5">
              <div className="flex items-center gap-1.5 text-on-primary font-caption text-caption">
                <Icon name="my_location" className="text-[14px]" />
                <span>Coverage Zone: 3.5km Radius Active</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pt-space-xs pb-safe flex flex-col gap-space-xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          className={`w-full h-[54px] rounded-xl font-button-primary text-button-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-90 ${
            publishState === 'success'
              ? 'bg-badge-discount-text text-on-primary'
              : 'bg-primary-container text-on-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)]'
          }`}
          type="button"
          disabled={publishState !== 'idle'}
          onClick={handlePublish}
        >
          {publishState === 'idle' && <span>Publish Deal to Nearby Feeds 🔥 🚀</span>}
          {publishState === 'publishing' && (
            <>
              <Icon name="progress_activity" className="text-[20px] animate-spin" />
              <span>Broadcasting to Abuja Feeds...</span>
            </>
          )}
          {publishState === 'success' && (
            <>
              <Icon name="check_circle" className="text-[22px]" />
              <span>Published Successfully! 🎉</span>
            </>
          )}
        </button>
        <div className="grid grid-cols-2 gap-space-xs">
          <button
            className="w-full h-11 rounded-xl bg-surface-subtle text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary active:scale-[0.98] transition-transform flex items-center justify-center gap-space-2xs"
            type="button"
            onClick={onSaveDraft}
          >
            <Icon name="bookmark_border" className="text-[16px]" />
            <span>Save Deal as Draft</span>
          </button>
          <button
            className="w-full h-11 rounded-xl bg-surface-subtle text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary active:scale-[0.98] transition-transform flex items-center justify-center gap-space-2xs"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Step 3</span>
          </button>
        </div>
        <p className="font-caption text-caption text-text-tertiary text-center px-space-md">
          You can pause, edit quotas, or end this deal at any time from your Business Hub.
        </p>
      </div>
    </AppScreen>
  );
}
