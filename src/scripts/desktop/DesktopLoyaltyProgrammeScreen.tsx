import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { EnterpriseShell } from './EnterpriseShell';

interface DesktopLoyaltyProgrammeScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onOpenRewards?: () => void;
}

const EARNING_RULES = [
  {
    icon: 'payments',
    iconBox: 'bg-surface-tint-blue text-primary',
    title: 'Points on Purchases (Spend)',
    badge: 'Base Formula',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    formula: '1 Point per ₦100 Spent',
    formulaClass: 'text-primary',
    note: 'Qualifying basket min. spend: ₦500 • Excludes VAT/Service charge',
  },
  {
    icon: 'pin_drop',
    iconBox: 'bg-secondary-container text-on-secondary-container',
    title: 'Check-in / Walk-in (Visit)',
    badge: 'Footfall Engine',
    badgeClass: 'bg-surface-container text-on-surface-variant',
    formula: '+50 Bonus Points per Visit',
    formulaClass: 'text-secondary',
    note: 'Requires on-premise NFC Tap or QR • Max 1 check-in per 12 hours',
  },
  {
    icon: 'local_offer',
    iconBox: 'bg-tertiary-fixed text-on-tertiary-fixed',
    title: 'Deal Claim Bonus (Deals)',
    badge: 'Conversion Boost',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    formula: '+25 Points per redeemed deal',
    formulaClass: 'text-tertiary',
    note: 'Applies to all active promotional deals configured in Catalog',
  },
  {
    icon: 'cake',
    iconBox: 'bg-surface-container-high text-primary',
    title: 'Birthday Surprise Bonus',
    badge: 'Delight Trigger',
    badgeClass: 'bg-surface-tint-blue text-primary',
    formula: '+200 Points on customer birthday week',
    formulaClass: 'text-text-primary',
    note: 'Auto-credited 3 days prior; valid for 14 calendar days',
  },
];

const BAR_WIDTHS = ['w-1', 'w-2', 'w-0.5', 'w-1.5', 'w-3', 'w-1', 'w-0.5', 'w-2', 'w-1.5', 'w-1', 'w-2.5', 'w-0.5', 'w-1', 'w-2', 'w-1.5'];

export function DesktopLoyaltyProgrammeScreen({ onNav, onOpenRewards }: DesktopLoyaltyProgrammeScreenProps) {
  const [enabled, setEnabled] = useState(true);
  const [ruleToggles, setRuleToggles] = useState<boolean[]>([true, true, true, true]);
  const [branchScope, setBranchScope] = useState<'all' | 'selected'>('all');
  const [expiryNotice, setExpiryNotice] = useState(true);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    window.setTimeout(() => {
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 2200);
    }, 900);
  };

  const toggleRule = (index: number) => {
    setRuleToggles((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <EnterpriseShell activeNav="business-loyalty" onNav={onNav}>
      <section className="w-full bg-surface-canvas shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-space-xl pb-space-lg">
        <div className="flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption">
              <button
                type="button"
                className="hover:text-primary transition-colors flex items-center gap-1"
                onClick={() => onNav('overview')}
              >
                <Icon name="storefront" className="text-[15px]" />
                Business Hub
              </button>
              <Icon name="chevron_right" className="text-[13px] text-text-tertiary" />
              <span className="hover:text-primary transition-colors cursor-pointer">Loyalty &amp; Rewards</span>
              <Icon name="chevron_right" className="text-[13px] text-text-tertiary" />
              <span className="text-text-primary font-medium">Programme Configuration</span>
            </nav>
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                Live Sync Active
              </div>
              <span className="text-text-tertiary font-caption text-caption hidden sm:inline">•</span>
              <span className="text-text-secondary font-caption text-caption hidden sm:inline">
                Auto-committing to Wuse II Terminal Core
              </span>
            </div>
          </div>

          {/* Header — stacks until `xl` so it fits iPad Pro 13 */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-2xs max-w-2xl min-w-0">
              <div className="flex flex-wrap items-center gap-space-2xs sm:gap-space-xs">
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                  Loyalty Programme Configuration
                </h1>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  v3.4 Ruleset
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Configure customer points accrual formulas, reward conversion rates, branch eligibility, and automated
                expiration policies across all unified POS channels.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm shrink-0">
              <button
                type="button"
                className="h-[46px] px-space-md rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary hover:bg-surface-container transition-all flex items-center gap-space-2xs shadow-sm"
                onClick={() => setPassModalOpen(true)}
              >
                <Icon name="smartphone" className="text-[18px] text-primary" />
                <span>Preview Customer Pass →</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={`h-[46px] px-space-lg rounded-xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] hover:bg-primary transition-all flex items-center gap-space-2xs ${
                  saveState === 'saved'
                    ? 'bg-badge-discount-text text-on-primary'
                    : `bg-primary-container text-on-primary ${saveState === 'saving' ? 'opacity-90' : ''}`
                }`}
              >
                {saveState === 'saving' ? (
                  <>
                    <Icon name="refresh" className="text-[19px] animate-spin" />
                    <span>Saving Policies...</span>
                  </>
                ) : saveState === 'saved' ? (
                  <>
                    <Icon name="check_circle" className="text-[19px]" />
                    <span>Settings Saved!</span>
                  </>
                ) : (
                  <>
                    <Icon name="save" className="text-[19px]" />
                    <span>Save Programme Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-space-xs mt-space-xs pt-space-xs overflow-x-auto">
            <button
              type="button"
              className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold flex items-center gap-space-2xs shadow-sm"
            >
              <Icon name="tune" className="text-[18px]" />
              Programme Configuration
            </button>
            <button
              type="button"
              onClick={onOpenRewards}
              className="px-space-md py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors flex items-center gap-space-2xs"
            >
              <Icon name="card_giftcard" className="text-[18px]" />
              Rewards Catalog
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-[11px] font-semibold">
                3 Active
              </span>
            </button>
            <button
              type="button"
              className="px-space-md py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-label-md text-label-md transition-colors flex items-center gap-space-2xs"
            >
              <Icon name="receipt_long" className="text-[18px]" />
              Activity &amp; Points Ledger
            </button>
          </div>
        </div>
      </section>

      <div className="w-full py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-surface-tint-blue opacity-50 blur-2xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md shrink-0">
                    <Icon name="loyalty" className="text-[32px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Customer Club ID #NG-8842
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                        Active • Live to Customers
                      </span>
                    </div>
                    <h2 className="font-heading-md text-heading-md text-text-primary mt-0.5">
                      VEMTAP Bites &amp; Perks Club
                    </h2>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 self-start sm:self-auto">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={enabled}
                    onChange={() => setEnabled((v) => !v)}
                  />
                  <div className="w-14 h-8 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-canvas after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-surface-canvas after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-container shadow-inner" />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-md">
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-2xs">
                  <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                    <Icon name="groups" className="text-[16px] text-primary" />
                    Active Enrolled Members
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-heading-lg text-heading-lg text-text-primary tracking-tight">1,420</span>
                    <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center">
                      <Icon name="trending_up" className="text-[14px]" />
                      +14% this month
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">
                    389 joined via NFC Table Tap in last 7 days
                  </span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-2xs">
                  <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                    <Icon name="cached" className="text-[16px] text-badge-discount-text" />
                    Patron Return Rate
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-heading-lg text-heading-lg text-text-primary tracking-tight">84%</span>
                    <span className="px-space-2xs py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-[11px] font-semibold">
                      Top Tier Loyalty
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">
                    Benchmark: 42% for F&amp;B Abuja Metro
                  </span>
                </div>
              </div>
              <div className="mt-space-md p-space-sm rounded-lg bg-surface-tint-blue flex items-start gap-space-xs">
                <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Points accrue automatically on customer checkouts, walk-ins, and deal redemptions at all connected
                  POS terminals and QR scans. Zero cashier calculation required.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Points Earning Rules</h3>
                  <span className="font-caption text-caption text-text-secondary">
                    Active computation logic applied whenever customer identity is validated
                  </span>
                </div>
                <span className="font-caption text-caption text-text-tertiary">
                  {ruleToggles.filter(Boolean).length} of 4 Rules Active
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {EARNING_RULES.map((rule, index) => (
                  <div
                    key={rule.title}
                    className="bg-surface-canvas rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-space-md">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${rule.iconBox}`}
                      >
                        <Icon name={rule.icon} className="text-[24px]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-md text-label-md font-semibold text-text-primary">{rule.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-caption text-[11px] font-semibold ${rule.badgeClass}`}
                          >
                            {rule.badge}
                          </span>
                        </div>
                        <p className={`font-heading-sm text-heading-sm font-bold ${rule.formulaClass}`}>
                          {rule.formula}
                        </p>
                        <span className="font-caption text-caption text-text-secondary">{rule.note}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-md self-end sm:self-auto shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={ruleToggles[index]}
                          onChange={() => toggleRule(index)}
                        />
                        <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-canvas after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-canvas after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
                      </label>
                      <button
                        type="button"
                        className="px-space-sm py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Icon name="edit" className="text-[15px]" />
                        Edit Rule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full py-3.5 rounded-xl bg-surface-canvas hover:bg-surface-subtle text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs transition-colors shadow-sm"
              >
                <Icon name="add_circle" className="text-[20px]" />
                + Add Custom Earning Rule (e.g. VIP Tiers, Rainday Double Points)
              </button>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Eligible Participating Branches</h3>
                <span className="font-caption text-caption text-text-secondary">
                  Determine which store locations process point accrual and pass validation
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <label className="p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container-high transition-colors flex items-start gap-space-md cursor-pointer">
                  <input
                    type="radio"
                    name="branch_scope"
                    className="mt-1 text-primary focus:ring-0 shrink-0"
                    checked={branchScope === 'all'}
                    onChange={() => setBranchScope('all')}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      All Locations (Current &amp; future)
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Points can be earned and redeemed across all branches automatically with unified ledger
                      consolidation.
                    </span>
                  </div>
                </label>
                <label className="p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container-high transition-colors flex items-start gap-space-md cursor-pointer">
                  <input
                    type="radio"
                    name="branch_scope"
                    className="mt-1 text-primary focus:ring-0 shrink-0"
                    checked={branchScope === 'selected'}
                    onChange={() => setBranchScope('selected')}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Selected Locations Only
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Specify participating branches manually. Excluded stores will display a non-participating note on
                      passes.
                    </span>
                  </div>
                </label>
              </div>
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                  Active Connected Outlets (3 Registered)
                </span>
                <div className="flex flex-wrap items-center gap-space-xs">
                  <div className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                    <Icon name="store" className="text-[16px]" />
                    Wuse II Branch (Flagship)
                    <span className="ml-1 w-2 h-2 rounded-full bg-badge-discount-text" />
                  </div>
                  <div className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                    <Icon name="store" className="text-[16px]" />
                    Victoria Island Branch, Lagos
                    <span className="ml-1 w-2 h-2 rounded-full bg-badge-discount-text" />
                  </div>
                  <div className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-container text-text-secondary font-caption text-caption font-medium">
                    <Icon name="construction" className="text-[16px] text-text-tertiary" />
                    Garki Branch (Paused - Renovation)
                    <span className="ml-1 w-2 h-2 rounded-full bg-tertiary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-xl">
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                  <Icon name="security" className="text-[18px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Expiry &amp; Retention Safeguards</h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Mitigate unredeemed liability without hurting patron loyalty
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Points Expiration Schedule
                  </label>
                  <div className="relative">
                    <select
                      defaultValue="12 Months from Last Activity"
                      className="w-full h-[48px] px-space-md pr-10 rounded-xl bg-surface-subtle text-text-primary font-label-md text-label-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option>12 Months from Last Activity</option>
                      <option>6 Months from Last Activity</option>
                      <option>Never (Perpetual Balances)</option>
                    </select>
                    <Icon
                      name="expand_more"
                      className="absolute right-3 top-3.5 text-text-secondary pointer-events-none text-[20px]"
                    />
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">
                    Activity includes: any check-in, purchase, or deal claim.
                  </span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-start justify-between gap-space-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary flex items-center gap-1">
                      <Icon name="campaign" className="text-[16px] text-badge-discount-text" />
                      Automated Expiry Push &amp; WhatsApp
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Send automated WhatsApp &amp; Push reminder 14 days before points lapse to prompt emergency visits.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={expiryNotice}
                      onChange={() => setExpiryNotice((v) => !v)}
                    />
                    <div className="w-10 h-5 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-canvas after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-canvas after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="p-space-sm rounded-xl bg-surface-subtle flex flex-col gap-1">
                    <span className="font-caption text-caption text-text-tertiary font-medium">Max Accrual Cap</span>
                    <span className="font-label-md text-label-md font-bold text-text-primary">5,000 Pts / Txn</span>
                    <span className="font-caption text-[11px] text-text-secondary">Safety anti-fraud limit</span>
                  </div>
                  <div className="p-space-sm rounded-xl bg-surface-subtle flex flex-col gap-1">
                    <span className="font-caption text-caption text-text-tertiary font-medium">Redemption Ratio</span>
                    <span className="font-label-md text-label-md font-bold text-primary">1 Pt = ₦1.00 Credit</span>
                    <span className="font-caption text-[11px] text-text-secondary">Direct bill offset</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-2xs">
                  <Icon name="preview" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Live Patron Pass Preview</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-[11px] font-semibold">
                  Apple &amp; Google Wallet Ready
                </span>
              </div>
              <div className="w-full max-w-[340px] mx-auto bg-surface-dim p-3 rounded-[36px] shadow-xl">
                <div className="w-full bg-surface-canvas rounded-[28px] overflow-hidden p-space-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between text-text-primary font-caption text-[11px] px-1">
                    <span className="font-bold">9:41</span>
                    <div className="w-16 h-3.5 bg-text-primary rounded-full mx-auto" />
                    <div className="flex items-center gap-1">
                      <Icon name="signal_cellular_alt" className="text-[13px]" />
                      <Icon name="wifi" className="text-[13px]" />
                      <Icon name="battery_full" className="text-[13px]" />
                    </div>
                  </div>
                  <div className="w-full rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary p-space-md flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[190px]">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-surface-canvas/10 blur-xl pointer-events-none" />
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-space-xs">
                        <div className="w-8 h-8 rounded-full bg-surface-canvas/20 backdrop-blur-md flex items-center justify-center font-bold text-on-primary text-caption">
                          UG
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm font-bold leading-tight">
                            Urban Grill &amp; Bistro
                          </span>
                          <span className="font-caption text-[11px] opacity-80">Wuse II • Gold Patron Tier</span>
                        </div>
                      </div>
                      <Icon name="contactless" className="text-on-primary/80 text-[20px]" />
                    </div>
                    <div className="flex flex-col my-space-xs">
                      <span className="font-caption text-[11px] uppercase tracking-wider text-on-primary/75">
                        Available Balance
                      </span>
                      <div className="flex items-baseline gap-space-2xs">
                        <span className="font-display-hero text-display-hero font-bold tracking-tight text-on-primary">
                          2,450
                        </span>
                        <span className="font-label-md text-label-md font-medium text-on-primary/90">pts</span>
                      </div>
                      <span className="font-caption text-[11px] text-badge-discount-bg font-medium">
                        ≈ ₦2,450 Dining Credit Available
                      </span>
                    </div>
                    <div className="flex items-end justify-between pt-space-xs border-t border-on-primary/15">
                      <div className="flex flex-col">
                        <span className="font-caption text-[10px] uppercase text-on-primary/60">Member Patron</span>
                        <span className="font-label-sm text-label-sm font-semibold tracking-wide text-on-primary">
                          Michael James
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-caption text-[11px] bg-surface-canvas/20 px-2 py-0.5 rounded-full font-semibold">
                        <span>VEMTAP TAP</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-space-sm rounded-xl bg-surface-subtle flex flex-col items-center gap-1.5 text-center">
                    <span className="font-caption text-[11px] text-text-tertiary">
                      Tap terminal or present barcode to cashier
                    </span>
                    <div className="w-48 h-10 flex items-center justify-center gap-1 py-1">
                      {BAR_WIDTHS.map((width, index) => (
                        <span key={index} className={`${width} h-8 bg-text-primary rounded-[1px]`} />
                      ))}
                    </div>
                    <span className="font-caption text-[11px] font-mono text-text-secondary tracking-widest">
                      #8842-1099-2450
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPassModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Full Pass Experience</span>
                    <Icon name="open_in_new" className="text-[16px]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Financial &amp; Balance Sheet Impact</h3>
                <Icon name="account_balance" className="text-text-tertiary text-[18px]" />
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="p-space-md rounded-xl bg-surface-subtle flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Total Outstanding Liability</span>
                    <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦142,500</span>
                    <span className="font-caption text-[11px] text-text-tertiary">
                      142,500 unredeemed active points
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                    <Icon name="account_balance_wallet" className="text-[20px]" />
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-tint-blue flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Loyalty Patron Revenue</span>
                    <div className="flex items-baseline gap-space-2xs">
                      <span className="font-heading-sm text-heading-sm text-primary font-bold">₦1,240,000</span>
                      <span className="font-caption text-[11px] text-badge-discount-text font-bold">+22% MoM</span>
                    </div>
                    <span className="font-caption text-[11px] text-text-secondary">
                      8.7x ROI vs. loyalty liability
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                    <Icon name="payments" className="text-[20px]" />
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-2xs">
                  <div className="flex items-center justify-between text-caption font-caption">
                    <span className="text-text-secondary">Points Redemption Cycle Velocity</span>
                    <span className="font-bold text-text-primary">68% Active Cycle</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full bg-badge-discount-text rounded-full" style={{ width: '68%' }} />
                  </div>
                  <div className="flex items-center justify-between font-caption text-[11px] text-text-tertiary">
                    <span>Healthy velocity target: 60-75%</span>
                    <span className="text-badge-discount-text font-medium">Optimal Velocity</span>
                  </div>
                </div>
              </div>
              <div className="pt-space-xs flex items-center gap-space-2xs text-text-tertiary font-caption text-[11px]">
                <Icon name="shield_person" className="text-[14px]" />
                <span>Accruals strictly reconciled every 24 hours under Nigerian IFRS SME Standards.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {passModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-text-primary/40 backdrop:backdrop-blur-sm flex items-center justify-center p-space-md"
          onClick={() => setPassModalOpen(false)}
        >
          <div
            className="bg-surface-canvas rounded-2xl p-space-lg flex flex-col gap-space-md border border-border-subtle/30 shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle">
              <div className="flex items-center gap-space-2xs">
                <Icon name="contactless" className="text-primary text-[22px]" />
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Customer Pass Simulation</h3>
              </div>
              <button
                type="button"
                aria-label="Close preview"
                className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors"
                onClick={() => setPassModalOpen(false)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-space-md py-space-sm text-center">
              <div className="w-full rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary p-space-lg flex flex-col justify-between shadow-xl min-h-[220px]">
                <div className="flex items-center justify-between">
                  <span className="font-heading-sm text-heading-sm">Urban Grill &amp; Bistro</span>
                  <span className="px-2 py-1 rounded bg-surface-canvas/20 font-caption text-[11px] font-bold">
                    GOLD CLUB
                  </span>
                </div>
                <div className="my-space-md">
                  <span className="font-caption text-caption opacity-80 uppercase tracking-widest">Points Balance</span>
                  <p className="font-display-hero text-display-hero font-bold tracking-tight">2,450 PTS</p>
                  <span className="font-caption text-caption text-badge-discount-bg font-semibold">
                    ₦2,450.00 Redeemable Credit
                  </span>
                </div>
                <div className="flex items-center justify-between text-caption border-t border-on-primary/20 pt-space-xs">
                  <span>Michael James</span>
                  <span className="font-mono">#8842-1099</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary max-w-xs">
                This digital pass is auto-synced across Google Wallet, Apple Wallet, and the native VEMTAP Consumer App.
              </p>
            </div>
            <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-border-subtle">
              <button
                type="button"
                className="px-space-md py-2.5 rounded-xl bg-surface-subtle text-text-primary font-label-md text-label-md font-medium hover:bg-surface-container"
                onClick={() => setPassModalOpen(false)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="px-space-md py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary shadow-sm flex items-center gap-1"
              >
                <Icon name="share" className="text-[16px]" />
                Share Pass Link
              </button>
            </div>
          </div>
        </div>
      )}
    </EnterpriseShell>
  );
}
