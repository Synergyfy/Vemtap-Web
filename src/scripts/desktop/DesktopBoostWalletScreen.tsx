import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import type { BoostTabKey } from '../../components/BoostTabBar';

interface DesktopBoostWalletScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
  onTab: (key: BoostTabKey) => void;
}

const MODULE_TABS: { key: BoostTabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'boost', label: 'Boost Studio' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'wallet', label: 'Wallet' },
];

interface TopUpPack {
  key: string;
  amount: number;
  short: string;
  amountLabel: string;
  bonus: string;
  iconBoxClass: string;
  iconClass?: string;
  badge?: string;
  badgeClass?: string;
  custom?: boolean;
}

const TOP_UP_PACKS: TopUpPack[] = [
  {
    key: '10k',
    amount: 10000,
    short: '₦10k',
    amountLabel: '₦10,000 Top-Up',
    bonus: '₦500 bonus ad credit',
    iconBoxClass: 'bg-surface-container-low text-primary',
  },
  {
    key: '25k',
    amount: 25000,
    short: '₦25k',
    amountLabel: '₦25,000 Top-Up',
    bonus: '₦2,000 bonus credit (+8%)',
    iconBoxClass: 'bg-primary text-on-primary shadow-sm',
    badge: 'Popular',
    badgeClass: 'bg-primary-container text-on-primary',
  },
  {
    key: '50k',
    amount: 50000,
    short: '₦50k',
    amountLabel: '₦50,000 Top-Up',
    bonus: '₦5,000 bonus credit (+10%)',
    iconBoxClass: 'bg-surface-container-low text-tertiary-container',
    badge: 'Growth Tier',
    badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    key: 'custom',
    amount: 0,
    short: '',
    amountLabel: 'Custom Top-Up Amount',
    bonus: 'Minimum ₦2,000 • Flexible spend',
    iconBoxClass: 'bg-surface-container text-secondary',
    custom: true,
  },
];

const LEDGER = [
  {
    key: 'bst-9042',
    icon: 'campaign',
    iconBox: 'bg-surface-container-high text-tertiary',
    title: 'Prime Lunch Combo Boost (5 Days)',
    date: 'Oct 18, 2024',
    ref: '#BST-9042',
    refClass: 'text-secondary font-medium',
    amount: '-₦20,000.00',
    amountClass: 'text-text-primary',
    status: 'Dedicated',
    statusClass: 'text-secondary',
  },
  {
    key: 'topup-card',
    icon: 'credit_card',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Wallet Top-Up via Card',
    date: 'Oct 18, 2024',
    ref: 'Mastercard (...4291)',
    amount: '+₦30,000.00',
    amountClass: 'text-badge-discount-text',
    status: 'Completed',
    statusClass: 'text-badge-discount-text',
  },
  {
    key: 'refund',
    icon: 'replay',
    iconBox: 'bg-surface-tint-blue text-primary',
    title: 'Refund Unspent Budget',
    date: 'Oct 12, 2024',
    ref: 'Dessert Boost',
    amount: '+₦3,200.00',
    amountClass: 'text-primary',
    status: 'Credited back',
    statusClass: 'text-secondary',
  },
  {
    key: 'bst-8831',
    icon: 'stars',
    iconBox: 'bg-surface-container-high text-tertiary',
    title: 'Weekend Profile Spotlight',
    date: 'Oct 08, 2024',
    ref: '#BST-8831',
    refClass: 'text-secondary font-medium',
    amount: '-₦15,000.00',
    amountClass: 'text-text-primary',
    status: 'Completed',
    statusClass: 'text-secondary',
  },
];

export function DesktopBoostWalletScreen({ onNav, onBack, onTab }: DesktopBoostWalletScreenProps) {
  const [pack, setPack] = useState('25k');
  const [autoReload, setAutoReload] = useState(true);
  const [copied, setCopied] = useState(false);
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

  const copyAccount = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText('9940284411').catch(() => undefined);
    }
    setCopied(true);
    showToast('Account number copied');
    const timer = window.setTimeout(() => setCopied(false), 2200);
    timers.current.push(timer);
  };

  const startTopUp = () => {
    const selected = TOP_UP_PACKS.find((entry) => entry.key === pack);
    if (!selected) return;
    if (selected.custom) {
      showToast('Enter a custom top-up amount to continue');
      return;
    }
    showToast(`Top-up of ₦${selected.amount.toLocaleString('en-US')} initiated`);
  };

  const bentoMetrics = [
    {
      key: 'balance',
      label: 'Available Balance',
      icon: 'account_balance_wallet',
      value: '₦25,000.00',
      delta: undefined,
      note: 'Available Advertising Balance',
    },
    {
      key: 'reserved',
      label: 'Reserved Boosts',
      icon: 'lock_clock',
      value: '₦14,350.00',
      delta: undefined,
      note: 'Locked for scheduled & running boosts',
    },
    {
      key: 'spendable',
      label: 'Net Spendable',
      icon: 'bolt',
      value: '₦10,650.00',
      delta: 'Ready to deploy',
      note: 'Instant ad liquidity across all branches',
    },
    {
      key: 'bonus',
      label: 'Top-Up Bonus',
      icon: 'add_card',
      value: 'Up to +10%',
      delta: undefined,
      note: '₦500 – ₦5,000 bonus ad credit per pack',
    },
  ];

  return (
    <BusinessPortalChrome activeNav="more-marketing" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        {/* Back link + Boost module tabs (desktop replacement for the mobile tab bar) */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Boost Hub</span>
          </button>
          <div className="flex items-center gap-space-2xs bg-surface-container p-space-2xs rounded-xl">
            {MODULE_TABS.map((tab) => {
              const active = tab.key === 'wallet';
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onTab(tab.key)}
                  className={`px-space-sm py-1.5 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-medium tracking-wide uppercase">
                Instant Ad Liquidity Engine
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="font-caption text-caption text-text-tertiary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text inline-block" />
                Ref: VEM-WAL-709
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Boost Wallet &amp; Billing</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Tier-1 Escrow Protected ad balance with instant top-ups, bonus credits, and a complete billing ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              onClick={() => showToast('Statement history opened')}
              className="h-[46px] px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-xs shadow-sm"
            >
              <Icon name="receipt_long" className="text-[18px] text-secondary" />
              <span>Statement History</span>
            </button>
            <button
              type="button"
              onClick={startTopUp}
              className="px-space-lg h-[46px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
            >
              <Icon name="add_circle" filled className="text-[20px]" />
              <span>Top Up (1-Tap)</span>
            </button>
          </div>
        </section>

        {/* Metric bento */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {bentoMetrics.map((metric) => (
            <div
              key={metric.key}
              className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-secondary">{metric.label}</span>
                <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name={metric.icon} className="text-[18px]" />
                </span>
              </div>
              <div className="flex items-baseline gap-space-xs flex-wrap">
                <span className="font-heading-md text-heading-md text-text-primary font-bold">{metric.value}</span>
                {metric.delta && (
                  <span className="font-caption text-caption text-badge-discount-text font-semibold">{metric.delta}</span>
                )}
              </div>
              <span className="font-caption text-caption text-text-tertiary">{metric.note}</span>
            </div>
          ))}
        </section>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-lg items-start">
          {/* Funding workspace */}
          <div className="flex flex-col gap-space-lg">
            {/* Hero balance card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-container to-surface-tint p-space-lg text-on-primary shadow-xl">
              <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-surface-canvas/10 blur-2xl pointer-events-none" />
              <div className="absolute right-6 top-6 text-on-primary/15 pointer-events-none">
                <Icon className="text-[100px] leading-none" filled name="security" />
              </div>
              <div className="relative z-10 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-canvas/15 backdrop-blur-md">
                    <Icon className="text-[16px] text-badge-discount-bg" name="shield" />
                    <span className="font-label-sm text-label-sm tracking-wide uppercase font-semibold">
                      Tier-1 Escrow Protected
                    </span>
                  </div>
                  <span className="font-caption text-caption text-on-primary/80">Ref: VEM-WAL-709</span>
                </div>
                <div className="mt-4">
                  <p className="font-label-md text-label-md text-on-primary/80 font-medium">
                    Available Advertising Balance
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-heading-lg text-heading-lg font-bold tracking-tight">₦25,000.00</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-sm mt-5 pt-4 bg-surface-canvas/10 rounded-xl p-space-sm backdrop-blur-sm">
                  <div>
                    <div className="flex items-center gap-1 text-on-primary/75 font-caption text-caption">
                      <Icon className="text-[14px]" name="lock_clock" />
                      <span>Reserved Boosts</span>
                    </div>
                    <p className="font-heading-sm text-heading-sm font-semibold mt-0.5 text-on-primary">₦14,350.00</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-on-primary/75 font-caption text-caption">
                      <Icon className="text-[14px]" name="bolt" />
                      <span>Net Spendable</span>
                    </div>
                    <p className="font-heading-sm text-heading-sm font-semibold mt-0.5 text-badge-discount-bg">
                      ₦10,650.00
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-space-sm mt-5">
                  <button
                    className="flex-1 h-11 rounded-xl bg-surface-canvas text-primary font-button-primary text-button-primary shadow-md flex items-center justify-center gap-1.5 hover:bg-surface-subtle active:scale-[0.98] transition-all"
                    type="button"
                    onClick={startTopUp}
                  >
                    <Icon className="text-[20px]" filled name="add_circle" />
                    <span>Top Up (1-Tap)</span>
                  </button>
                  <button
                    className="h-11 px-4 rounded-xl bg-surface-canvas/20 text-on-primary font-button-secondary text-button-secondary backdrop-blur-md flex items-center justify-center gap-1.5 hover:bg-surface-canvas/30 active:scale-[0.98] transition-all"
                    type="button"
                    onClick={() => showToast('VAT invoice download started')}
                  >
                    <Icon className="text-[18px]" name="description" />
                    <span>Tax Invoices</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick top-up packs */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-sm flex-wrap">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Quick Top-Up Pre-packs</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Instant bonus ad credits applied automatically
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Up to +10%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                {TOP_UP_PACKS.map((entry) => {
                  const active = pack === entry.key;
                  return (
                    <button
                      className={`w-full text-left p-3.5 rounded-xl shadow-sm flex items-center justify-between gap-2 hover:scale-[0.99] transition-all ${
                        active ? 'bg-surface-tint-blue' : 'bg-surface-container-lowest'
                      }`}
                      key={entry.key}
                      type="button"
                      onClick={() => setPack(entry.key)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-label-md text-label-md shrink-0 ${entry.iconBoxClass}`}
                        >
                          {entry.custom ? <Icon className="text-[20px]" name="edit_note" /> : entry.short}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-button-secondary text-button-secondary text-text-primary font-semibold">
                              {entry.amountLabel}
                            </span>
                            {entry.badge && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${entry.badgeClass}`}
                              >
                                {entry.badge}
                              </span>
                            )}
                          </div>
                          <div
                            className={`font-caption text-caption font-medium flex items-center gap-1 ${
                              entry.custom ? 'text-text-tertiary' : 'text-badge-discount-text'
                            }`}
                          >
                            {!entry.custom && <Icon className="text-[13px]" name="add" />}
                            {entry.bonus}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary text-on-primary' : 'border-2 border-outline-variant'
                        }`}
                      >
                        {active ? <Icon className="text-[14px]" filled name="check" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Virtual account */}
              <div className="mt-space-2xs rounded-xl bg-surface-container-low p-space-md">
                <div className="flex items-center justify-between pb-2 gap-2">
                  <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
                    Dedicated Instant Virtual Account
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-0.5 shrink-0">
                    <Icon className="text-[14px]" name="bolt" /> Instant Settled
                  </span>
                </div>
                <div className="bg-surface-canvas rounded-lg p-space-sm shadow-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold text-caption shrink-0">
                      WEMA
                    </div>
                    <div className="min-w-0">
                      <p className="font-caption text-caption text-text-secondary">Wema Bank • VEMTAP Advertising</p>
                      <div className="flex items-center gap-2">
                        <span className="font-heading-sm text-heading-sm font-semibold tracking-wider text-text-primary">
                          9940284411
                        </span>
                        <button
                          aria-label="Copy Account Number"
                          className="text-primary hover:opacity-80 active:scale-90 transition-transform"
                          type="button"
                          onClick={copyAccount}
                        >
                          <Icon className="text-[18px]" name="content_copy" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {copied && (
                    <span className="text-caption font-label-sm text-badge-discount-text font-medium bg-badge-discount-bg px-2 py-1 rounded shrink-0">
                      Copied!
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3 pt-2 text-text-secondary font-caption text-caption gap-2">
                  <span className="flex items-center gap-1.5">
                    <Icon className="text-[15px] text-primary" name="credit_card" />
                    Debit Card (Mastercard / Visa / Verve)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon className="text-[15px] text-secondary" name="point_of_sale" />
                    POS Till Settlement
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-reload guard */}
            <div
              className={`rounded-2xl bg-surface-container-lowest p-space-md shadow-sm transition-opacity ${
                autoReload ? '' : 'opacity-70'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="text-[22px]" name="sync" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">Auto-Reload Safety Guard</h3>
                      <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        {autoReload ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary mt-1">
                      Automatically reload <span className="font-semibold text-text-primary">₦10,000</span> whenever
                      wallet balance drops below <span className="font-semibold text-text-primary">₦3,000</span>.
                    </p>
                  </div>
                </div>
                <button
                  aria-label="Toggle auto-reload"
                  aria-pressed={autoReload}
                  className={`w-12 h-7 rounded-full relative shrink-0 mt-1 transition-colors ${
                    autoReload ? 'bg-primary-container' : 'bg-surface-container-highest'
                  }`}
                  type="button"
                  onClick={() => setAutoReload((value) => !value)}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-surface-canvas rounded-full shadow-md transition-transform ${
                      autoReload ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-3.5 pt-3 bg-surface-tint-blue rounded-xl p-space-sm flex items-start gap-2.5">
                <Icon className="text-primary text-[18px] shrink-0 mt-0.5" name="verified_user" />
                <p className="font-caption text-caption text-text-primary leading-relaxed">
                  Guarantees your highest-performing weekend lunch &amp; dinner rush boosts remain uninterrupted even
                  during high volume conversions.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-space-lg">
            {/* Billing history */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-sm">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Billing &amp; Transaction History</h2>
                  <p className="font-caption text-caption text-text-secondary">Recent wallet activity &amp; allocations</p>
                </div>
                <button
                  className="font-button-secondary text-button-secondary text-primary font-medium flex items-center gap-0.5 shrink-0"
                  type="button"
                  onClick={() => showToast('Ledger filters opened')}
                >
                  <span>Filter</span>
                  <Icon className="text-[16px]" name="tune" />
                </button>
              </div>

              <div className="flex flex-col gap-space-2xs">
                {LEDGER.map((entry) => (
                  <div
                    className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-3"
                    key={entry.key}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${entry.iconBox}`}>
                        <Icon className="text-[20px]" name={entry.icon} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-label-sm text-label-sm text-text-primary font-semibold leading-tight truncate">
                          {entry.title}
                        </div>
                        <div className="font-caption text-caption text-text-secondary mt-0.5 flex items-center gap-1.5 truncate">
                          <span>{entry.date}</span>
                          <span>•</span>
                          <span className={entry.refClass ?? ''}>{entry.ref}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-button-primary text-button-primary font-bold ${entry.amountClass}`}>
                        {entry.amount}
                      </div>
                      <span className={`font-caption text-caption font-medium block ${entry.statusClass}`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-3 rounded-xl bg-surface-container-low text-secondary font-button-secondary text-button-secondary hover:bg-surface-container transition-colors text-center"
                type="button"
                onClick={() => showToast('Complete transaction ledger opened')}
              >
                View Complete Transaction Ledger
              </button>
            </div>

            {/* NDPR & tax compliance */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="text-secondary text-[22px] shrink-0" name="policy" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">NDPR &amp; Tax Compliance</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[11px] font-semibold shrink-0">
                  FIRS Verified
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Registered Federal Tax Identification Number:
              </p>
              <div className="mt-space-xs p-space-sm rounded-xl bg-surface-subtle flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider block">
                    Registered Merchant TIN
                  </span>
                  <span className="font-heading-sm text-heading-sm font-semibold tracking-wider text-text-primary">
                    TIN-8894102-NG
                  </span>
                </div>
                <div className="flex items-center gap-1 text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                  <Icon className="text-[16px]" name="check_circle" />
                  <span>Active NDPR</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-space-sm mt-3 pt-space-2xs">
                <button
                  className="p-2.5 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
                  type="button"
                  onClick={() => showToast('September VAT invoice downloaded')}
                >
                  <Icon className="text-[18px] text-primary" name="download" />
                  <span>September VAT</span>
                </button>
                <button
                  className="p-2.5 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
                  type="button"
                  onClick={() => showToast('Historical VAT archive opened')}
                >
                  <Icon className="text-[18px] text-primary" name="calendar_month" />
                  <span>Historical VAT</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-xl font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon className="text-badge-discount-text text-[18px]" name="check_circle" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
