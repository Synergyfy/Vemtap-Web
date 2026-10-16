import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { DealStudioDraft } from './dealStudio';
import { getActiveVariants } from './productVariants';
import type { ProductDraft } from './productDraft';

interface BusinessDealAutoImportScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onPublish: () => void;
  onCancel: () => void;
}

const SNAPSHOT_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2uDo5eLKW4jePgD5pyK5gOx2GGMNvPvsVuNNXZlAtg6Ko_Ht1GJJPBJI9SNYE_92XbeC73CKcuZyD7Popmr8X7zu1DxY0cfzDEZ8xc8FxCmWco_cP7WWnadzuVNk7a6-gThopPTGgBjyk6B5uJeXRqDoBb5pnzs63jbUSuPcVf_htk4j8g-PFuaDe5qtmxgPpCfNk1YqenzY8ynz5aaJH2OdgnUyTwIuSDKw4to2xMsRbiHI4mOvgNQ',
  alt: 'A sizzling, succulent medium-rare woodfire aged ribeye steak garnished with fresh rosemary sprigs and roasted garlic cloves served on a rustic dark slate board in a high-end restaurant atmosphere with warm golden lighting',
};

const FEED_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrkYFOHrZELDHmMpUjrGPu6_OJoDYXCTM0VzcyY_12eNNmV_2ttYp6j6Yb4TryWLhhIbTM_D-FeOE3yu6L4Bm7nAmWACqBXL9Xje3y4dUsjC8gHWN40cXRwvqr5QCs4OWW1tKEEQZMkD_zAo9doLJyD891Q_0Q36Coo5vurvdrByh8zYwO9lLwqX1w4p90aMSC_DhKQMA1yLWu3wDA3CKnDpW5lcdIp8krJOk3GLPGrjNIOzIicTwWng',
  alt: 'A mouthwatering Woodfire Aged Ribeye Steak sizzling on an artisan wooden carving board with roasted garlic and fresh rosemary herbs. Dramatic warm restaurant ambient lighting, rich dark tones, shallow depth of field, premium gastronomic styling.',
};

const PRESETS = [15, 20, 25, 30, 40];

const MODE_TABS = [
  { id: 'percentage' as const, label: '% Percentage' },
  { id: 'fixed' as const, label: 'Fixed ₦ Off' },
  { id: 'combo' as const, label: 'Combo Bundle' },
];

const DAY_OPTIONS: Array<{ key: keyof DealStudioDraft['days']; label: string }> = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const BRANCH_OPTIONS: Array<{ key: 'wuseII' | 'garkiII'; name: string; address: string }> = [
  { key: 'wuseII', name: 'Wuse II Branch', address: 'Aminu Kano Cres, Abuja' },
  { key: 'garkiII', name: 'Garki II Branch', address: 'Ladoke Akintola Blvd, Abuja' },
];

const DEFAULT_TERMS =
  'Show voucher code before ordering. Dine-in only. Valid from 12:00 PM - 5:00 PM on eligible redemption days.';

const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function BusinessDealAutoImportScreen({
  draft,
  studio,
  onStudioChange,
  onPublish,
  onCancel,
}: BusinessDealAutoImportScreenProps) {
  const [mode, setMode] = useState<'percentage' | 'fixed' | 'combo'>('percentage');
  const [terms, setTerms] = useState(DEFAULT_TERMS);
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

  const activeVariants = getActiveVariants(draft);
  const regularVariant = activeVariants.find((variant) => variant.name === 'Regular') ?? activeVariants[0];
  const baseAmount = parseAmount(regularVariant?.price ?? draft.basePrice);
  const pct = studio.discountPct;
  const savings = Math.round((baseAmount * pct) / 100);
  const dealAmount = baseAmount - savings;
  const activeStoreCount = BRANCH_OPTIONS.filter((branch) => studio.branches[branch.key]).length;

  const applyPct = (value: number) => onStudioChange({ discountPct: value });

  const handleInput = (raw: string) => {
    let num = parseInt(raw, 10);
    if (Number.isNaN(num)) num = 5;
    if (num > 80) num = 80;
    if (num < 5) num = 5;
    applyPct(num);
  };

  const handlePublish = () => {
    if (publishState !== 'idle') return;
    setPublishState('publishing');
    successTimer.current = window.setTimeout(() => setPublishState('success'), 1200);
    doneTimer.current = window.setTimeout(() => onPublish(), 2700);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onCancel}
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1 truncate px-space-xs">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
              Step 2 of 4
            </span>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Product Deal Preview</h1>
          </div>
          <div className="flex items-center gap-space-xs -mr-2">
            <button
              aria-label="Save draft"
              className="h-11 min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-all"
              type="button"
            >
              Draft
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-36">
        <div className="px-margin pt-space-md pb-space-xs">
          <div className="bg-surface-tint-blue rounded-xl p-space-md shadow-sm">
            <div className="flex items-center gap-space-xs mb-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary">
                <Icon name="bolt" className="text-[14px]" />
              </span>
              <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide">
                Auto-Imported from “{draft.title}”
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary leading-snug">
              Adjust your discount, voucher quantity, and redemption terms. We pre-filled everything directly from
              your catalog!
            </p>
          </div>
        </div>

        <div className="px-margin flex flex-col gap-space-lg mt-space-sm">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center gap-space-md">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <img className="w-full h-full object-cover" alt={SNAPSHOT_IMAGE.alt} src={SNAPSHOT_IMAGE.src} />
                <div className="absolute bottom-1 right-1 bg-surface/90 rounded px-1 py-0.5 shadow-sm">
                  <Icon name="sync" className="text-primary text-[12px] block" />
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                  <Icon name="check_circle" className="text-[14px]" />
                  Details Auto-Synced
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate mt-0.5">{draft.title}</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-caption text-caption text-text-tertiary">Catalog Base:</span>
                  <span className="font-label-md text-label-md text-text-secondary line-through">
                    ₦{formatAmount(baseAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Discount Strategy</h3>
              <span className="font-caption text-caption text-primary bg-surface-tint-blue px-2 py-0.5 rounded-full font-medium">
                Smart Calculator
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-xl">
              {MODE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`py-2 px-1 text-center rounded-lg font-label-sm text-label-sm font-medium transition-all truncate ${
                    mode === tab.id
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                  onClick={() => setMode(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESETS.map((preset) => {
                const isActive = preset === pct;
                return (
                  <button
                    key={preset}
                    className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap active:scale-95 transition-all ${
                      isActive
                        ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                        : 'bg-surface-container-low text-text-secondary'
                    }`}
                    type="button"
                    onClick={() => applyPct(preset)}
                  >
                    {isActive ? `${preset}% OFF` : `${preset}%`}
                  </button>
                );
              })}
            </div>
            <div className="bg-surface-subtle p-space-sm rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="discount-input">
                  Custom Discount Rate
                </label>
                <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1 rounded-lg shadow-sm">
                  <input
                    className="w-12 text-right font-heading-sm text-heading-sm text-text-primary bg-transparent focus:outline-none"
                    id="discount-input"
                    max={80}
                    min={5}
                    type="number"
                    value={pct}
                    onChange={(event) => handleInput(event.target.value)}
                  />
                  <span className="font-heading-sm text-heading-sm text-primary font-bold">%</span>
                </div>
              </div>
              <input
                aria-label="Discount slider"
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                id="discount-slider"
                max={75}
                min={5}
                type="range"
                value={Math.min(75, Math.max(5, pct))}
                onChange={(event) => applyPct(Number(event.target.value))}
              />
            </div>
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2">
              <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm">
                <span>Regular Catalog Price</span>
                <span className="text-text-primary font-medium">₦{formatAmount(baseAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm">
                <span>Deal Member Price</span>
                <span className="font-heading-sm text-heading-sm text-primary font-bold">
                  ₦{formatAmount(dealAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-caption text-caption text-text-secondary">Diner Incentive</span>
                <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-2.5 py-1 rounded-full font-bold">
                  Customer Saves ₦{formatAmount(savings)} ({pct}%)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Limits &amp; Scarcity</h3>
                <span className="font-caption text-caption text-text-tertiary">
                  Foster customer FOMO &amp; prevent overflow
                </span>
              </div>
              <Icon name="timer" className="text-primary text-[22px]" />
            </div>
            <div className="flex items-center justify-between bg-surface-subtle p-space-sm rounded-xl">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Quantity Limit
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Total promotional stock • App alerts when 80% claimed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Decrease vouchers"
                  className="w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-text-primary active:scale-95 transition-all"
                  type="button"
                  onClick={() =>
                    onStudioChange({ vouchers: Math.max(10, Math.min(500, studio.vouchers - 5)) })
                  }
                >
                  <Icon name="remove" className="text-[16px]" />
                </button>
                <span className="w-12 text-center font-heading-sm text-heading-sm text-primary font-bold">
                  {studio.vouchers}
                </span>
                <button
                  aria-label="Increase vouchers"
                  className="w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-text-primary active:scale-95 transition-all"
                  type="button"
                  onClick={() =>
                    onStudioChange({ vouchers: Math.max(10, Math.min(500, studio.vouchers + 5)) })
                  }
                >
                  <Icon name="add" className="text-[16px]" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="bg-surface-subtle p-space-sm rounded-xl flex flex-col gap-1">
                <span className="font-caption text-caption text-text-secondary">Claims / Customer</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Icon name="person" className="text-primary text-[18px]" />
                  <span className="font-label-md text-label-md font-semibold text-text-primary">1 per person</span>
                </div>
              </div>
              <div className="bg-surface-subtle p-space-sm rounded-xl flex flex-col gap-1">
                <span className="font-caption text-caption text-text-secondary">Validity Window</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Icon name="calendar_today" className="text-primary text-[18px]" />
                  <span className="font-label-md text-label-md font-semibold text-text-primary">14 Days Claim</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                  Valid Redemption Days
                </span>
                <button
                  className="font-caption text-caption text-primary font-semibold"
                  type="button"
                  onClick={() =>
                    onStudioChange({
                      days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
                    })
                  }
                >
                  Lunch Hours Only (12-5pm)
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {DAY_OPTIONS.map((day) => {
                  const isActive = studio.days[day.key];
                  return (
                    <button
                      key={day.key}
                      className={`h-10 rounded-xl font-label-sm text-label-sm font-bold transition-all ${
                        isActive
                          ? 'bg-surface-tint-blue text-primary shadow-sm'
                          : 'bg-surface-container-low text-text-tertiary'
                      }`}
                      type="button"
                      onClick={() =>
                        onStudioChange({ days: { ...studio.days, [day.key]: !studio.days[day.key] } })
                      }
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Participating Locations</h3>
              <span className="font-caption text-caption text-badge-discount-text font-medium">
                {activeStoreCount} Active Stores
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-1">
              {BRANCH_OPTIONS.map((branch) => (
                <label
                  key={branch.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle cursor-pointer hover:bg-surface-container-low transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                      <Icon name="storefront" className="text-[18px]" />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{branch.name}</span>
                      <span className="font-caption text-caption text-text-secondary">{branch.address}</span>
                    </div>
                  </div>
                  <input
                    aria-label={branch.name}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                    type="checkbox"
                    checked={studio.branches[branch.key]}
                    onChange={(event) =>
                      onStudioChange({ branches: { ...studio.branches, [branch.key]: event.target.checked } })
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center gap-1.5">
              <Icon name="description" className="text-primary text-[18px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Terms &amp; Claim Notes</h3>
            </div>
            <p className="font-caption text-caption text-text-tertiary">
              Pre-composed from your restaurant dining policy:
            </p>
            <div className="relative mt-2">
              <textarea
                aria-label="Terms and claim notes"
                className="w-full bg-surface-subtle text-text-primary p-3 rounded-xl font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest shadow-inner resize-none"
                rows={3}
                value={terms}
                onChange={(event) => setTerms(event.target.value)}
              />
            </div>
          </div>

          <div className="bg-surface-subtle p-space-md rounded-2xl shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between mb-space-2xs">
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
            <div className="max-w-[340px] mx-auto w-full bg-surface-canvas rounded-2xl overflow-hidden shadow-lg">
              <div className="relative w-full h-48 bg-surface-dim overflow-hidden">
                <img className="w-full h-full object-cover" alt={FEED_IMAGE.alt} src={FEED_IMAGE.src} />
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm flex items-center gap-1">
                    <Icon name="local_offer" className="text-[13px]" />
                    {pct}% OFF
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
                      ₦{formatAmount(dealAmount)}
                    </span>
                    <span className="font-label-sm text-label-sm text-text-tertiary line-through">
                      ₦{formatAmount(baseAmount)}
                    </span>
                  </div>
                  <span className="font-caption text-caption text-badge-discount-text font-semibold bg-badge-discount-bg px-2 py-0.5 rounded">
                    Save ₦{formatAmount(savings)}
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

          <div className="flex items-center justify-center gap-2 py-2">
            <Icon name="verified" className="text-badge-discount-text text-[18px]" />
            <span className="font-caption text-caption text-text-secondary">
              Push notifications sent to 1,420 foodies within 3.5 miles
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/90 backdrop-blur-xl px-margin py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex flex-col gap-2">
        <button
          className={`w-full h-[52px] rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-90 ${
            publishState === 'success'
              ? 'bg-badge-discount-text text-on-primary'
              : 'bg-primary text-on-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)]'
          }`}
          type="button"
          disabled={publishState !== 'idle'}
          onClick={handlePublish}
        >
          {publishState === 'idle' && (
            <>
              <span>Publish Deal to Nearby Feeds</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </>
          )}
          {publishState === 'publishing' && (
            <>
              <Icon name="progress_activity" className="text-[20px] animate-spin" />
              <span>Broadcasting Live...</span>
            </>
          )}
          {publishState === 'success' && (
            <>
              <Icon name="check_circle" className="text-[20px]" />
              <span>Deal Live &amp; Blasted! 🚀</span>
            </>
          )}
        </button>
        <button
          className="w-full h-9 flex items-center justify-center font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary active:scale-95 transition-all"
          type="button"
          onClick={onCancel}
        >
          Cancel &amp; Keep Regular Product Only
        </button>
      </div>
    </AppScreen>
  );
}
