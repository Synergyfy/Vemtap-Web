import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome } from './BusinessPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import type { SegmentSummary } from '../../services/types';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { percentOf, rulesFromCriteria, useLiveSegmentRules } from '../segmentsLive';

interface DesktopSegmentCreateScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
  onSaved: () => void;
  /** Live: the saved segment whose rules are being edited; null creates one. */
  editing?: SegmentSummary | null;
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

export function DesktopSegmentCreateScreen({ onNav, onBack, onSaved, editing }: DesktopSegmentCreateScreenProps) {
  const live = hasApiConfig();
  // Live forms start blank, or from the segment being edited.
  const start = rulesFromCriteria(editing?.criteria);
  const [name, setName] = useState(live ? (editing?.name ?? '') : 'Weekend Dinner Patrons');
  const [memo, setMemo] = useState(
    live ? (editing?.description ?? '') : "Targeting guests who ordered dry-aged steaks and claimed weekend specials.",
  );
  const [chkClaimedDeal, setChkClaimedDeal] = useState(live ? start.flags.claimedDeal : true);
  const [dealKey, setDealKey] = useState('weekend-glow');
  const [chkSavedDeal, setChkSavedDeal] = useState(live ? start.flags.savedDeal : false);
  const [chkProduct, setChkProduct] = useState(live ? start.flags.product : true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['ribeye']);
  const [chkHighSpend, setChkHighSpend] = useState(live ? start.flags.highSpend : false);
  const [chkBranch, setChkBranch] = useState(live ? start.flags.branch : true);
  const [wuseSelected, setWuseSelected] = useState(true);
  const [maitamaSelected, setMaitamaSelected] = useState(false);
  const [chkDistrict, setChkDistrict] = useState(false);
  const [chkRecency, setChkRecency] = useState(live ? start.flags.recency : true);
  const [recency, setRecency] = useState(start.recencyDays);
  const [chkChat, setChkChat] = useState(live ? start.flags.chat : false);
  const [chkLoyalty, setChkLoyalty] = useState(live ? start.flags.loyalty : false);
  const rules = useLiveSegmentRules(
    editing,
    {
      claimedDeal: chkClaimedDeal,
      savedDeal: chkSavedDeal,
      product: chkProduct,
      highSpend: chkHighSpend,
      branch: chkBranch,
      district: chkDistrict,
      recency: chkRecency,
      chat: chkChat,
      loyalty: chkLoyalty,
    },
    recency,
  );
  const business = useMyBusiness();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

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

  const sample = useMemo(() => {
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

  const { total, pushCount, dmCount } = live
    ? { total: rules.reach?.size ?? 0, pushCount: rules.reach?.reachableByPush ?? 0, dmCount: rules.reach?.reachableBySms ?? 0 }
    : sample;

  useEffect(() => {
    const error = rules.optionsError ?? rules.reachError;
    if (error) showToast(apiErrorMessage(error, 'Could not load the segment builder.'));
  }, [rules.optionsError, rules.reachError]);

  const dealOptions = live ? (rules.options?.deals ?? []).map((deal) => ({ key: deal.id, label: deal.name })) : DEAL_OPTIONS;
  const productChips = live
    ? (rules.options?.menuItems ?? []).map((item) => ({ key: item.id, label: item.name }))
    : PRODUCT_CHIPS;
  const pickedProducts = live ? rules.itemIds : selectedProducts;
  const branchCount = rules.options?.branches.length ?? 0;
  const dataNote = live
    ? `Customer data across ${branchCount} branch${branchCount === 1 ? '' : 'es'}.`
    : 'POS receipts & member data across Wuse II & Maitama.';

  const toggleDistrict = () => {
    if (live) {
      showToast('District targeting is coming soon.');
      return;
    }
    setChkDistrict((prev) => !prev);
  };

  const deleteSegment = () => {
    if (!editing || !window.confirm(`Delete the segment "${editing.name}"?`)) return;
    rules
      .remove()
      .then(() => onSaved())
      .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not delete the segment.')));
  };

  const toggleProduct = (key: string) => {
    if (live) {
      rules.toggleItem(key);
      return;
    }
    setSelectedProducts((prev) => (prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]));
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
    rules.clearPicks();
    showToast('All filters cleared');
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Segment name is required');
      return;
    }
    if (live) {
      rules
        .save(name, memo)
        .then(() => {
          setSaving(true);
          showToast(`${editing ? 'Updated' : 'Created'} '${name.trim()}' (${total} diners)!`);
          onSaved();
        })
        .catch((error: unknown) =>
          showToast(planErrorMessage(error) ?? apiErrorMessage(error, 'Could not save the segment.')),
        );
      return;
    }
    setSaving(true);
    const timer = window.setTimeout(() => {
      showToast(`Created '${name.trim()}' (${total} diners)!`);
      onSaved();
    }, 750);
    timers.current.push(timer);
  };

  const activeRuleCount =
    (chkClaimedDeal ? 1 : 0) +
    (chkSavedDeal ? 1 : 0) +
    (chkProduct ? 1 : 0) +
    (chkHighSpend ? 1 : 0) +
    (chkBranch ? 1 : 0) +
    (chkDistrict ? 1 : 0) +
    (chkRecency ? 1 : 0) +
    (chkChat ? 1 : 0) +
    (chkLoyalty ? 1 : 0);

  const filterRow = (checked: boolean, onToggle: () => void, title: string, subtitle: string, children?: ReactNode) => (
    <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-subtle">
      <button
        className="flex items-start gap-space-xs cursor-pointer select-none text-left w-full"
        type="button"
        onClick={onToggle}
      >
        <div
          className={`w-5 h-5 mt-0.5 rounded shrink-0 flex items-center justify-center transition-colors ${
            checked ? 'bg-primary-container' : 'bg-surface-canvas border border-border-subtle'
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
    <BusinessPortalChrome activeNav="customers" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm flex-wrap">
            <button type="button" className="hover:text-primary transition-colors" onClick={() => onNav('customers')}>
              Customers
            </button>
            <Icon name="chevron_right" className="text-outline text-[16px]" />
            <button type="button" className="hover:text-primary transition-colors" onClick={onBack}>
              Customer Segments
            </button>
            <Icon name="chevron_right" className="text-outline text-[16px]" />
            <span className="text-text-primary font-semibold">{editing ? 'Edit Segment' : 'Create Custom Segment'}</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-space-2xs text-text-secondary hover:text-primary transition-colors font-label-md text-label-md w-fit"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Customer Segments</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                <Icon name="storefront" className="text-[16px] text-primary" filled />
                <span className="font-caption text-caption tracking-wide uppercase font-semibold">
                  {live ? business.data?.name || '—' : 'Urban Grill & Bistro'}
                </span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="text-caption font-caption text-text-tertiary">
                Segments update automatically from CRM &amp; POS data
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              {editing ? 'Edit Segment' : 'Create Custom Segment'}
            </h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Build a targeted audience based on factual dining habits, deal redemptions, and branch location data.
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              onClick={() => showToast('Segments update automatically from CRM & POS data')}
              className="px-space-md h-[46px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-xs shadow-sm"
            >
              <Icon name="help_outline" className="text-[18px] text-secondary" />
              <span>How It Works</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-space-lg h-[46px] rounded-xl text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs ${
                saving ? 'bg-badge-discount-text' : 'bg-primary hover:bg-primary-container'
              }`}
            >
              <span>{saving ? `Created '${name.trim()}' (${total} diners)!` : `Save & Review Segment (${total} Diners)`}</span>
              <Icon name={saving ? 'check_circle' : 'arrow_forward'} className="text-[20px]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="md:col-span-1 relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-sm flex flex-col justify-between">
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
            <div className="mt-space-xs flex items-center gap-space-2xs text-text-secondary">
              <Icon name="verified" className="text-[15px] text-outline" />
              <span className="font-caption text-caption">
                {dataNote}
              </span>
            </div>
          </div>
          <div className="md:col-span-1 bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col justify-between">
            <div className="bg-surface-canvas rounded-lg flex flex-col">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="font-caption text-caption uppercase tracking-wider font-semibold">Push &amp; Feeds</span>
                <Icon name="notifications_active" className="text-[14px] text-badge-discount-text" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{pushCount}</span>
                <span className="font-caption text-caption text-text-secondary">
                  ({percentOf(pushCount, total)}%)
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1 mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${percentOf(pushCount, total)}%` }} />
              </div>
            </div>
          </div>
          <div className="md:col-span-1 bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col justify-between">
            <div className="bg-surface-canvas rounded-lg flex flex-col">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="font-caption text-caption uppercase tracking-wider font-semibold">Direct SMS / DM</span>
                <Icon name="chat" className="text-[14px] text-primary" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{dmCount}</span>
                <span className="font-caption text-caption text-text-secondary">
                  ({percentOf(dmCount, total)}%)
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1 mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${percentOf(dmCount, total)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-space-lg items-start">
          <div className="flex flex-col gap-space-lg min-w-0">
            <div className="flex flex-col gap-space-xs">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                1. Identification &amp; Purpose
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
                    <Icon name="edit" className="absolute right-space-md text-outline text-[20px] pointer-events-none" />
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
                    rows={3}
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
                    <h3 className="font-label-md text-label-md font-semibold">Deal &amp; Offer Redemptions</h3>
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
                    value={live ? rules.dealId : dealKey}
                    onChange={(event) => (live ? rules.setDealId(event.target.value) : setDealKey(event.target.value))}
                  >
                    {live && !dealOptions.length && <option value="">No deals yet</option>}
                    {dealOptions.map((option) => (
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
                    {live && !productChips.length && (
                      <span className="font-caption text-caption text-text-secondary">No catalogue items yet</span>
                    )}
                    {productChips.map((chip) => {
                      const active = pickedProducts.includes(chip.key);
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
                    <h3 className="font-label-md text-label-md font-semibold">Location &amp; Branch Footprint</h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Physical dining check-ins and orders
                    </p>
                  </div>
                </div>
                {filterRow(
                  chkBranch,
                  () => setChkBranch((prev) => !prev),
                  'Dined at specific branch',
                  'Check-in at table QR or verified point of sale',
                  <div className="flex flex-col gap-2">
                    {live && (rules.options?.branches ?? []).map((branch) => {
                      const selected = rules.branchIds.includes(branch.id);
                      return (
                        <button
                          className={`flex items-center justify-between p-2 rounded-lg bg-surface-canvas shadow-sm cursor-pointer w-full ${
                            selected ? '' : 'opacity-80'
                          }`}
                          key={branch.id}
                          type="button"
                          onClick={() => rules.toggleBranch(branch.id)}
                        >
                          <div className="flex items-center gap-space-xs">
                            <Icon name="store" className={`text-[18px] ${selected ? 'text-primary' : 'text-outline'}`} />
                            <span className="font-label-sm text-label-sm text-text-primary font-medium">{branch.name}</span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                              selected ? 'bg-primary-container' : 'border border-border-subtle'
                            }`}
                          >
                            {selected && <Icon name="check" className="text-on-primary text-[12px]" />}
                          </div>
                        </button>
                      );
                    })}
                    {!live && (
                    <>
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
                          wuseSelected ? 'bg-primary-container' : 'border border-border-subtle'
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
                          maitamaSelected ? 'bg-primary-container' : 'border border-border-subtle'
                        }`}
                      >
                        {maitamaSelected && <Icon name="check" className="text-on-primary text-[12px]" />}
                      </div>
                    </button>
                    </>
                    )}
                  </div>,
                )}
                {filterRow(
                  chkDistrict,
                  toggleDistrict,
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
                    <h3 className="font-label-md text-label-md font-semibold">Visit Recency &amp; Engagement</h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Re-engagement and win-back timing
                    </p>
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
                  Strict NDPR &amp; Anti-Spam Guardrail
                </span>
                <p className="font-caption text-caption text-text-secondary leading-normal">
                  VEMTAP automatically excludes diners who opted out of commercial alerts or received a promotional
                  message in the last 48 hours to protect merchant sender reputation and eliminate customer fatigue.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-space-md min-w-0 lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                  <span className="font-label-md text-label-md text-text-primary font-semibold">Live Preview</span>
                </div>
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                  {activeRuleCount} Active Rule{activeRuleCount === 1 ? '' : 's'}
                </span>
              </div>

              <div className="p-space-sm rounded-xl bg-surface-tint-blue flex flex-col gap-space-2xs">
                <span className="font-caption text-caption text-text-secondary font-medium uppercase tracking-wider">
                  Matched Audience
                </span>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-display-hero text-display-hero text-primary font-bold leading-none">
                    {total}
                  </span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold">verified diners</span>
                </div>
                <span className="font-caption text-caption text-text-secondary">
                  {percentOf(pushCount, total)}% reachable via Push &amp; Feeds •{' '}
                  {percentOf(dmCount, total)}% via Direct SMS / DM
                </span>
              </div>

              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">Staff Memo</span>
                <p className="font-caption text-caption text-text-primary bg-surface-subtle rounded-lg p-space-xs leading-relaxed">
                  {memo.trim() || 'No staff memo recorded for this cohort yet.'}
                </p>
              </div>

              <div className="flex flex-col gap-space-2xs pt-space-xs border-t border-border-subtle">
                <div className="flex items-center justify-between pt-space-xs">
                  <span className="font-caption text-caption text-text-secondary">Push &amp; Feeds</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">{pushCount}</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percentOf(pushCount, total)}%` }} />
                </div>
                <div className="flex items-center justify-between pt-space-xs">
                  <span className="font-caption text-caption text-text-secondary">Direct SMS / DM</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">{dmCount}</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${percentOf(dmCount, total)}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-space-2xs text-text-secondary bg-surface-container-low rounded-lg p-space-xs">
                <Icon name="verified" className="text-[15px] text-outline" />
                <span className="font-caption text-caption">{dataNote}</span>
              </div>

              <div className="flex flex-col gap-space-xs">
                <button
                  className={`w-full h-11 text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] transition-all ${
                    saving ? 'bg-badge-discount-text' : 'bg-primary hover:bg-primary-container'
                  }`}
                  type="button"
                  onClick={handleSave}
                >
                  <span>
                    {saving ? `Created '${name.trim()}' (${total} diners)!` : `Save & Review Segment (${total} Diners)`}
                  </span>
                  <Icon name={saving ? 'check_circle' : 'arrow_forward'} className="text-[20px]" />
                </button>
                <button
                  className="w-full h-11 flex items-center justify-center font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary transition-colors"
                  type="button"
                  onClick={editing ? deleteSegment : onBack}
                >
                  {editing ? 'Delete Segment' : 'Cancel & Discard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface font-label-md text-label-md shadow-xl flex items-center gap-2">
          <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
          <span className="truncate">{toast}</span>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
