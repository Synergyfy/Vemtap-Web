import { useEffect, useMemo, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessSegmentCreateScreenProps {
  onBack: () => void;
  onSaved: () => void;
}

const PRODUCT_CHIPS = [
  { key: 'ribeye', label: 'Woodfire Ribeye (250g)' },
  { key: 'fries', label: 'Truffle Parmesan Fries' },
  { key: 'mojito', label: 'Passionfruit Mojito' },
];

const RECENCY_OPTIONS = [30, 60, 90];

const DEAL_OPTIONS = [
  { key: 'weekend-glow', label: 'Weekend Glow & Steak Feast (Active)' },
  { key: 'prime-lunch', label: 'Prime Lunch Combo (20% OFF)' },
  { key: 'bogo-cocktails', label: 'Late Night Cocktails BOGO' },
];

export function BusinessSegmentCreateScreen({ onBack, onSaved }: BusinessSegmentCreateScreenProps) {
  const [name, setName] = useState('Weekend Dinner Patrons');
  const [memo, setMemo] = useState(
    "Targeting guests who ordered dry-aged steaks and claimed weekend specials.",
  );
  const [chkClaimedDeal, setChkClaimedDeal] = useState(true);
  const [dealKey, setDealKey] = useState('weekend-glow');
  const [chkSavedDeal, setChkSavedDeal] = useState(false);
  const [chkProduct, setChkProduct] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['ribeye']);
  const [chkHighSpend, setChkHighSpend] = useState(false);
  const [chkBranch, setChkBranch] = useState(true);
  const [wuseSelected, setWuseSelected] = useState(true);
  const [maitamaSelected, setMaitamaSelected] = useState(false);
  const [chkDistrict, setChkDistrict] = useState(false);
  const [chkRecency, setChkRecency] = useState(true);
  const [recency, setRecency] = useState(60);
  const [chkChat, setChkChat] = useState(false);
  const [chkLoyalty, setChkLoyalty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  const { total, pushCount, dmCount } = useMemo(() => {
    let base = 85;
    if (chkClaimedDeal) base += 45;
    if (chkSavedDeal) base += 32;
    if (chkProduct) base += 28;
    if (chkHighSpend) base += 19;
    if (chkBranch) base += 16;
    if (chkDistrict) base += 24;
    if (chkRecency) base += 10;
    if (chkChat) base += 14;
    if (chkLoyalty) base += 22;
    const computed = Math.max(12, base);
    return {
      total: computed,
      pushCount: Math.round(computed * 0.91),
      dmCount: Math.round(computed * 0.77),
    };
  }, [
    chkClaimedDeal,
    chkSavedDeal,
    chkProduct,
    chkHighSpend,
    chkBranch,
    chkDistrict,
    chkRecency,
    chkChat,
    chkLoyalty,
  ]);

  const toggleProduct = (key: string) => {
    setSelectedProducts((prev) =>
      prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key],
    );
  };

  const resetCriteria = () => {
    setChkClaimedDeal(false);
    setChkSavedDeal(false);
    setChkProduct(false);
    setSelectedProducts([]);
    setChkHighSpend(false);
    setChkBranch(false);
    setWuseSelected(false);
    setMaitamaSelected(false);
    setChkDistrict(false);
    setChkRecency(false);
    setChkChat(false);
    setChkLoyalty(false);
    showToast('All filters cleared');
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Segment name is required');
      return;
    }
    setSaving(true);
    const timer = window.setTimeout(() => {
      showToast(`Created '${name.trim()}' (${total} diners)!`);
      onSaved();
    }, 750);
    timers.current.push(timer);
  };

  const filterRow = (
    checked: boolean,
    onToggle: () => void,
    title: string,
    subtitle: string,
    children?: React.ReactNode,
  ) => (
    <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-subtle">
      <button className="flex items-start gap-space-xs cursor-pointer select-none text-left w-full" type="button" onClick={onToggle}>
        <div
          className={`w-5 h-5 mt-0.5 rounded shrink-0 flex items-center justify-center transition-colors ${
            checked ? 'bg-primary-container' : 'bg-surface-canvas border border-outline-variant'
          }`}
        >
          {checked && <Icon name="check" className="text-on-primary text-[14px]" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-medium">{title}</span>
          <span className="font-caption text-caption text-text-secondary">{subtitle}</span>
        </div>
      </button>
      {checked && children && <div className="pl-7 pt-1">{children}</div>}
    </div>
  );

  return (
    <AppScreen surface="bg-surface">
      <header className="sticky top-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back or close"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="close" className="text-[24px]" />
            </button>
            <h1 className="text-heading-sm font-heading-sm text-text-primary tracking-tight truncate">
              Create Custom Segment
            </h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Help or Information"
              className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container transition-colors"
              type="button"
              onClick={() => showToast('Segments update automatically from CRM & POS data')}
            >
              <Icon name="help_outline" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-md pb-space-sm flex flex-col gap-space-xs">
          <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant">
            <Icon name="storefront" className="text-[16px] text-primary" filled />
            <span className="font-caption text-caption tracking-wide uppercase font-semibold">
              Urban Grill & Bistro
            </span>
          </div>
          <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">Create Custom Segment</h2>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Build a targeted audience based on factual dining habits, deal redemptions, and branch location data.
          </p>
        </div>

        <div className="px-margin mb-space-md">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-2xs mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  <span className="font-caption text-caption text-text-secondary font-medium tracking-wide uppercase">
                    Real-Time Cohort Sizing
                  </span>
                </div>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-heading-md text-heading-md text-primary tracking-tight font-bold">{total}</span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold">verified diners</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                <Icon name="groups" className="text-[24px]" />
              </div>
            </div>
            <div className="mt-space-sm pt-space-sm grid grid-cols-2 gap-space-xs">
              <div className="bg-surface-canvas rounded-lg p-space-xs flex flex-col shadow-sm">
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="font-caption text-caption">Push & Feeds</span>
                  <Icon name="notifications_active" className="text-[14px] text-badge-discount-text" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{pushCount}</span>
                  <span className="font-caption text-caption text-text-secondary">({Math.round((pushCount / total) * 100)}%)</span>
                </div>
              </div>
              <div className="bg-surface-canvas rounded-lg p-space-xs flex flex-col shadow-sm">
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="font-caption text-caption">Direct SMS / DM</span>
                  <Icon name="chat" className="text-[14px] text-primary" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{dmCount}</span>
                  <span className="font-caption text-caption text-text-secondary">({Math.round((dmCount / total) * 100)}%)</span>
                </div>
              </div>
            </div>
            <div className="mt-space-xs flex items-center gap-space-2xs text-text-secondary">
              <Icon name="verified" className="text-[15px] text-outline" />
              <span className="font-caption text-caption">POS receipts & member data across Wuse II & Maitama.</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-lg px-margin">
          <div className="flex flex-col gap-space-xs">
            <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
              1. Identification & Purpose
            </span>
            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-label-md text-label-md text-text-primary font-medium flex items-center justify-between"
                  htmlFor="segment-name"
                >
                  Segment Name
                  <span className="text-error font-caption text-caption">*Required</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-11 px-space-md bg-surface-subtle text-text-primary font-body-md text-body-md rounded-xl outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] transition-all"
                    id="segment-name"
                    placeholder="e.g., Cocktail Night Regulars"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <Icon
                    name="edit"
                    className="absolute right-space-md text-outline text-[20px] pointer-events-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-label-md text-label-md text-text-primary font-medium flex items-center justify-between"
                  htmlFor="segment-memo"
                >
                  Staff Memo / Description
                  <span className="font-caption text-caption text-text-tertiary">Optional</span>
                </label>
                <textarea
                  className="w-full p-space-md bg-surface-subtle text-text-primary font-body-md text-body-md rounded-xl outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] transition-all resize-none"
                  id="segment-memo"
                  placeholder="e.g., High-affinity patrons targeted for Friday Chef's Table roll-out."
                  rows={2}
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                2. Target Criteria Builder
              </span>
              <button
                className="font-caption text-caption text-primary hover:underline font-medium"
                type="button"
                onClick={resetCriteria}
              >
                Clear All Filters
              </button>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs text-text-primary">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="local_offer" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-semibold">Deal & Offer Redemptions</h3>
                  <p className="font-caption text-caption text-text-secondary">Historical coupon activations</p>
                </div>
              </div>
              {filterRow(
                chkClaimedDeal,
                () => setChkClaimedDeal((prev) => !prev),
                'Claimed a specific promotional deal',
                'VEMTAP verified barcode or in-app code redemption',
                <select
                  className="w-full h-11 px-space-sm bg-surface-canvas text-text-primary font-label-sm text-label-sm rounded-lg outline-none cursor-pointer shadow-sm"
                  value={dealKey}
                  onChange={(event) => setDealKey(event.target.value)}
                >
                  {DEAL_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>,
              )}
              {filterRow(
                chkSavedDeal,
                () => setChkSavedDeal((prev) => !prev),
                'Saved deal to wallet but did not redeem',
                'High purchase intent needing an extra incentive',
              )}
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs text-text-primary">
                <div className="w-8 h-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                  <Icon name="restaurant_menu" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-semibold">Menu Item Affinity</h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Item-level line items verified by synced POS
                  </p>
                </div>
              </div>
              {filterRow(
                chkProduct,
                () => setChkProduct((prev) => !prev),
                'Ordered specific signature dishes',
                'Dine-in or pre-ordered takeout tickets',
                <div className="flex flex-wrap gap-1.5">
                  {PRODUCT_CHIPS.map((chip) => {
                    const active = selectedProducts.includes(chip.key);
                    return (
                      <button
                        className={`px-space-sm py-1.5 rounded-full font-caption text-caption font-medium transition-colors ${
                          active
                            ? 'bg-surface-tint-blue text-primary shadow-sm'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                        key={chip.key}
                        type="button"
                        onClick={() => toggleProduct(chip.key)}
                      >
                        {chip.label}
                        {active ? ' ✓' : ''}
                      </button>
                    );
                  })}
                </div>,
              )}
              {filterRow(
                chkHighSpend,
                () => setChkHighSpend((prev) => !prev),
                'High average ticket spend (> ₦20,000)',
                'Calculated over past 90 days of dining receipts',
              )}
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs text-text-primary">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <Icon name="location_on" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-semibold">Location & Branch Footprint</h3>
                  <p className="font-caption text-caption text-text-secondary">Physical dining check-ins and orders</p>
                </div>
              </div>
              {filterRow(
                chkBranch,
                () => setChkBranch((prev) => !prev),
                'Dined at specific branch',
                'Check-in at table QR or verified point of sale',
                <div className="flex flex-col gap-2">
                  <button
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-canvas shadow-sm cursor-pointer w-full"
                    type="button"
                    onClick={() => setWuseSelected((prev) => !prev)}
                  >
                    <div className="flex items-center gap-space-xs">
                      <Icon name="store" className="text-primary text-[18px]" />
                      <span className="font-label-sm text-label-sm text-text-primary font-medium">Wuse II Flagship</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        wuseSelected ? 'bg-primary-container' : 'border border-outline-variant'
                      }`}
                    >
                      {wuseSelected && <Icon name="check" className="text-on-primary text-[12px]" />}
                    </div>
                  </button>
                  <button
                    className={`flex items-center justify-between p-2 rounded-lg bg-surface-canvas shadow-sm cursor-pointer w-full ${
                      maitamaSelected ? '' : 'opacity-80'
                    }`}
                    type="button"
                    onClick={() => setMaitamaSelected((prev) => !prev)}
                  >
                    <div className="flex items-center gap-space-xs">
                      <Icon name="store" className={`text-[18px] ${maitamaSelected ? 'text-primary' : 'text-outline'}`} />
                      <span className="font-label-sm text-label-sm text-text-primary font-medium">
                        Maitama Heights Lounge
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        maitamaSelected ? 'bg-primary-container' : 'border border-outline-variant'
                      }`}
                    >
                      {maitamaSelected && <Icon name="check" className="text-on-primary text-[12px]" />}
                    </div>
                  </button>
                </div>,
              )}
              {filterRow(
                chkDistrict,
                () => setChkDistrict((prev) => !prev),
                'Customers residing within district cluster',
                'Derived from verified delivery & default radius',
              )}
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs text-text-primary">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-secondary-container">
                  <Icon name="history" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-semibold">Visit Recency & Engagement</h3>
                  <p className="font-caption text-caption text-text-secondary">Re-engagement and win-back timing</p>
                </div>
              </div>
              {filterRow(
                chkRecency,
                () => setChkRecency((prev) => !prev),
                'Has not visited or ordered recently',
                'Dormancy lapsed threshold',
                <div className="grid grid-cols-3 gap-1.5">
                  {RECENCY_OPTIONS.map((days) => {
                    const active = recency === days;
                    return (
                      <button
                        className={`h-9 rounded-lg font-caption text-caption transition-all ${
                          active
                            ? 'bg-primary text-on-primary font-semibold shadow-sm'
                            : 'bg-surface-canvas text-text-secondary font-medium shadow-sm'
                        }`}
                        key={days}
                        type="button"
                        onClick={() => setRecency(days)}
                      >
                        {days}+ days
                      </button>
                    );
                  })}
                </div>,
              )}
              {filterRow(
                chkChat,
                () => setChkChat((prev) => !prev),
                'Interacted via Table QR / Chat in 14 days',
                'Active service questions or instant order notes',
              )}
              {filterRow(
                chkLoyalty,
                () => setChkLoyalty((prev) => !prev),
                'Loyalty members with >500 unspent points',
                'Motivate redemption before expiration date',
              )}
            </div>
          </div>

          <div className="rounded-xl p-space-md bg-surface-subtle shadow-sm flex items-start gap-space-sm">
            <div className="w-9 h-9 rounded-full bg-badge-discount-bg text-badge-discount-text shrink-0 flex items-center justify-center">
              <Icon name="verified_user" className="text-[20px]" filled />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-label-md text-label-md text-text-primary font-semibold">
                Strict NDPR & Anti-Spam Guardrail
              </span>
              <p className="font-caption text-caption text-text-secondary leading-normal">
                VEMTAP automatically excludes diners who opted out of commercial alerts or received a promotional
                message in the last 48 hours to protect merchant sender reputation and eliminate customer fatigue.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-surface-canvas/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin py-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+12px)] z-40">
        <div className="max-w-md mx-auto flex flex-col gap-space-xs">
          <button
            className={`w-full h-11 text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-all ${
              saving ? 'bg-badge-discount-text' : 'bg-primary-container'
            }`}
            type="button"
            onClick={handleSave}
          >
            <span>{saving ? `Created '${name.trim()}' (${total} diners)!` : `Save & Review Segment (${total} Diners)`}</span>
            <Icon name={saving ? 'check_circle' : 'arrow_forward'} className="text-[20px]" />
          </button>
          <button
            className="w-full h-11 flex items-center justify-center font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary transition-colors"
            type="button"
            onClick={onBack}
          >
            Cancel & Discard
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
