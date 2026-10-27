import { useEffect, useRef, useState } from 'react';
import { FilterMenu } from '../../components/FilterMenu';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import type { BoostTabKey } from '../../components/BoostTabBar';
import { adWalletService } from '../../services';
import { apiErrorMessage } from '../../services/errorMessages';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { useLiveWallet } from '../walletLive';
import type { AdWalletSummary, AdWalletTransaction } from '../../services/types';
import { downloadCsv } from '../../utils/exportCsv';
import { printKvTable, printReport } from '../../utils/printReport';

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

const DEFAULT_WALLET_SUMMARY: AdWalletSummary = {
  balance: 25000,
  reserved: 14350,
  spendable: 10650,
  walletRef: 'VEM-WAL-709',
  virtualAccount: {
    bank: 'Wema Bank',
    number: '9940284411',
  },
};

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const toLedgerEntry = (transaction: AdWalletTransaction) => {
  const amount = transaction.direction === 'debit' ? -Math.abs(Number(transaction.amount)) : Number(transaction.amount);
  const status = transaction.status ?? (transaction.direction === 'debit' ? 'debited' : 'credited');
  const sign = amount >= 0 ? '+' : '-';
  const amountLabel = `${sign}${formatCurrency(Math.abs(amount))}`;
  return {
    key: transaction.id,
    icon: transaction.type === 'topup' ? 'credit_card' : transaction.type === 'refund' ? 'replay' : 'campaign',
    iconBox:
      transaction.type === 'topup'
        ? 'bg-badge-discount-bg text-badge-discount-text'
        : transaction.type === 'refund'
          ? 'bg-surface-tint-blue text-primary'
          : 'bg-surface-container-high text-tertiary',
    title: transaction.type === 'topup' ? 'Wallet Top-Up via Card' : transaction.type === 'refund' ? 'Refund Unspent Budget' : 'Campaign Spend',
    date: new Date(transaction.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    ref: transaction.reference ?? status,
    amount: amountLabel,
    amountClass: amount >= 0 ? 'text-badge-discount-text' : 'text-text-primary',
    status,
    statusClass: status === 'completed' || status === 'credited' ? 'text-badge-discount-text' : 'text-secondary',
    refClass: undefined as string | undefined,
  };
};

export function DesktopBoostWalletScreen({ onNav, onBack, onTab }: DesktopBoostWalletScreenProps) {
  const [pack, setPack] = useState('25k');
  const [autoReload, setAutoReload] = useState(true);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [entryStatus, setEntryStatus] = useState('');
  const wallet = useLiveWallet((message) => showToast(message));
  const live = wallet.live;
  const business = useMyBusiness();
  const merchant = business.data?.name ?? '—';
  const walletSummary: AdWalletSummary = live
    ? (wallet.summary ?? { balance: 0, reserved: 0, spendable: 0 })
    : DEFAULT_WALLET_SUMMARY;
  const money = (value: number) => (live && !wallet.summary ? '—' : formatCurrency(value));
  const ledger = live ? wallet.transactions.map(toLedgerEntry) : LEDGER;
  const autoReloadOn = live ? wallet.autoReloadOn : autoReload;
  const walletRef = live ? (walletSummary.walletRef ?? '—') : 'VEM-WAL-709';
  const packs = live
    ? TOP_UP_PACKS.map((entry) => (entry.custom ? entry : { ...entry, bonus: wallet.bonusFor(entry.amount) || '—' }))
    : TOP_UP_PACKS;
  const timers = useRef<number[]>([]);

  const statusChoices = [
    { value: '', label: 'All entries' },
    ...Array.from(new Set(ledger.map((entry) => entry.status))).map((status) => ({
      value: status,
      label: status,
    })),
  ];

  const visibleLedger =
    entryStatus === '' ? ledger : ledger.filter((entry) => entry.status === entryStatus);

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

  const accountNumber = live
    ? (walletSummary.virtualAccount?.number ?? '—')
    : (walletSummary.virtualAccount?.number ?? DEFAULT_WALLET_SUMMARY.virtualAccount?.number ?? '9940284411');
  /** September VAT invoice — real PDF (print → save) + CSV ledger attachment. */
  const downloadVatInvoice = () => {
    const vatRows = ledger.map((entry) => [entry.date, entry.title, entry.ref, entry.amount, entry.status]);
    downloadCsv(
      live ? 'vemtap-boost-wallet-ledger.csv' : 'vemtap-boost-vat-september.csv',
      ['Date', 'Description', 'Reference', 'Amount', 'Status'],
      vatRows,
    );
    printReport(
      live ? 'VEMTAP Boost Wallet — Transaction Statement' : 'VEMTAP Boost Wallet — VAT Invoice (September)',
      `${printKvTable(
        'Merchant',
        live
          ? [['Registered name', merchant], ['Wallet ref', walletRef]]
          : [
              ['Registered name', 'Gourmet Bites Bistro'],
              ['TIN', 'TIN-8894102-NG'],
              ['NDPR status', 'Active'],
              ['FIRS verification', 'Verified'],
            ],
      )}
       ${
         live
           ? ''
           : printKvTable('VAT summary', [
               ['Billing period', 'September 1 – 30, 2026'],
               ['Standard rated spend', '₦382,000.00'],
               ['VAT @ 7.5%', '₦28,650.00'],
               ['Total charged', '₦410,650.00'],
             ])
       }
       ${printKvTable('Wallet transactions', vatRows.map((row) => [`${row[0]} — ${row[1]}`, `${row[3]} (${row[4]}) · ${row[2]}`]))}
       <p class="foot">A CSV copy of the transaction ledger downloaded alongside this invoice.</p>`,
    );
    showToast(live ? 'Wallet statement + CSV ledger downloaded' : 'September VAT invoice + CSV ledger downloaded');
  };

  /** Historical VAT archive — CSV of prior periods. */
  const openVatArchive = () => {
    if (live) {
      adWalletService
        .getInvoices({ limit: 100 })
        .then((invoices) => {
          downloadCsv(
            'vemtap-boost-invoices.csv',
            ['Date', 'Invoice', 'Campaign', 'Amount', 'Status'],
            invoices.map((invoice) => [
              new Date(invoice.date).toLocaleDateString('en-GB'),
              invoice.invoiceNo ?? invoice.id,
              invoice.campaign?.name ?? '—',
              formatCurrency(Number(invoice.amount) || 0),
              invoice.status,
            ]),
          );
          showToast(`${invoices.length} invoice${invoices.length === 1 ? '' : 's'} downloaded as CSV`);
        })
        .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not load your invoices.')));
      return;
    }
    downloadCsv(
      'vemtap-boost-vat-archive.csv',
      ['Period', 'Standard rated spend', 'VAT @ 7.5%', 'Total charged', 'Status'],
      [
        ['August 2026', '₦341,500.00', '₦25,612.50', '₦367,112.50', 'Filed'],
        ['July 2026', '₦298,200.00', '₦22,365.00', '₦320,565.00', 'Filed'],
        ['June 2026', '₦276,900.00', '₦20,767.50', '₦297,667.50', 'Filed'],
        ['May 2026', '₦254,300.00', '₦19,072.50', '₦273,372.50', 'Filed'],
      ],
    );
    showToast('Historical VAT archive downloaded as CSV');
  };

  /** Full wallet statement history — CSV ledger + print-ready PDF statement. */
  const openStatementHistory = () => {
    downloadCsv(
      'boost-wallet-statement-history.csv',
      ['Date', 'Description', 'Reference', 'Amount', 'Status'],
      ledger.map((entry) => [entry.date, entry.title, entry.ref, entry.amount, entry.status]),
    );
    printReport(
      `Boost Wallet Statement History — ${walletRef}`,
      `${printKvTable('Wallet', [
        ['Wallet ref', walletRef],
        ['Merchant', live ? merchant : 'Gourmet Bites Bistro'],
        ['Protection', 'Tier-1 Escrow Protected'],
      ])}
       ${printKvTable(
         'Transactions',
         ledger.map((entry) => [`${entry.date} — ${entry.title}`, `${entry.amount} • ${entry.status} • ${entry.ref}`]),
       )}
       <p class="foot">A CSV copy of this statement downloaded alongside the PDF.</p>`,
    );
    showToast('Statement history downloaded (CSV + PDF)');
  };

  const copyAccount = () => {
    if (live && !walletSummary.virtualAccount?.number) {
      showToast('Bank transfer top-ups are coming soon. Top up by card for now.');
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(accountNumber).catch(() => undefined);
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
    if (live) {
      const prepack = wallet.prepacks.find((entry) => Number(entry.amount) === selected.amount);
      wallet.topUp.mutate(prepack ? { prepackId: prepack.id } : { amount: selected.amount });
      return;
    }
    showToast(`Top-up of ₦${selected.amount.toLocaleString('en-US')} initiated`);
  };

  const bentoMetrics = [
    {
      key: 'balance',
      label: 'Available Balance',
      icon: 'account_balance_wallet',
      value: live ? money(walletSummary.balance) : '₦25,000.00',
      delta: undefined,
      note: 'Available Advertising Balance',
    },
    {
      key: 'reserved',
      label: 'Reserved Boosts',
      icon: 'lock_clock',
      value: live ? money(walletSummary.reserved) : '₦14,350.00',
      delta: undefined,
      note: 'Locked for scheduled & running boosts',
    },
    {
      key: 'spendable',
      label: 'Net Spendable',
      icon: 'bolt',
      value: live ? money(walletSummary.spendable) : '₦10,650.00',
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
                Ref: {walletRef}
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
              onClick={openStatementHistory}
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
                  <span className="font-caption text-caption text-on-primary/80">Ref: {walletRef}</span>
                </div>
                <div className="mt-4">
                  <p className="font-label-md text-label-md text-on-primary/80 font-medium">
                    Available Advertising Balance
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-heading-lg text-heading-lg font-bold tracking-tight">
                      {money(walletSummary.balance)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-sm mt-5 pt-4 bg-surface-canvas/10 rounded-xl p-space-sm backdrop-blur-sm">
                  <div>
                    <div className="flex items-center gap-1 text-on-primary/75 font-caption text-caption">
                      <Icon className="text-[14px]" name="lock_clock" />
                      <span>Reserved Boosts</span>
                    </div>
                    <p className="font-heading-sm text-heading-sm font-semibold mt-0.5 text-on-primary">
                      {money(walletSummary.reserved)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-on-primary/75 font-caption text-caption">
                      <Icon className="text-[14px]" name="bolt" />
                      <span>Net Spendable</span>
                    </div>
                    <p className="font-heading-sm text-heading-sm font-semibold mt-0.5 text-badge-discount-bg">
                      {money(walletSummary.spendable)}
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
                    onClick={openVatArchive}
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
                {packs.map((entry) => {
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
                      <p className="font-caption text-caption text-text-secondary">
                        {walletSummary.virtualAccount?.bank ?? (live ? '—' : 'Wema Bank')} • VEMTAP Advertising
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-heading-sm text-heading-sm font-semibold tracking-wider text-text-primary">
                          {accountNumber}
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
                autoReloadOn ? '' : 'opacity-70'
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
                        {autoReloadOn ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary mt-1">
                      Automatically reload{' '}
                      <span className="font-semibold text-text-primary">
                        {live ? formatCurrency(wallet.autoReloadAmount).replace(/\.00$/, '') : '₦10,000'}
                      </span>{' '}
                      whenever wallet balance drops below{' '}
                      <span className="font-semibold text-text-primary">
                        {live ? formatCurrency(wallet.autoReloadThreshold).replace(/\.00$/, '') : '₦3,000'}
                      </span>
                      .
                    </p>
                  </div>
                </div>
                <button
                  aria-label="Toggle auto-reload"
                  aria-pressed={autoReloadOn}
                  className={`w-12 h-7 rounded-full relative shrink-0 mt-1 transition-colors ${
                    autoReloadOn ? 'bg-primary-container' : 'bg-surface-container-highest'
                  }`}
                  type="button"
                  onClick={() => (live ? wallet.autoReload.mutate(!autoReloadOn) : setAutoReload((value) => !value))}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-surface-canvas rounded-full shadow-md transition-transform ${
                      autoReloadOn ? 'left-[22px]' : 'left-0.5'
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
                <FilterMenu
                  align="right"
                  buttonClassName="font-button-secondary text-button-secondary text-primary font-medium flex items-center gap-0.5 shrink-0"
                  choices={statusChoices}
                  icon="tune"
                  iconClassName="text-[16px]"
                  label="Filter"
                  onChange={setEntryStatus}
                  title="Filter by entry status"
                  value={entryStatus}
                />
              </div>

              <div className="flex flex-col gap-space-2xs">
                {visibleLedger.map((entry) => (
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
                {visibleLedger.length === 0 && (
                  <div className="py-space-md text-center font-caption text-caption text-text-secondary">
                    No {entryStatus.toLowerCase()} entries in this period.
                  </div>
                )}
              </div>

              <button
                className="w-full py-3 rounded-xl bg-surface-container-low text-secondary font-button-secondary text-button-secondary hover:bg-surface-container transition-colors text-center"
                type="button"
                onClick={() => (live ? openStatementHistory() : showToast('Complete transaction ledger opened'))}
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
                  {live ? '—' : 'FIRS Verified'}
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
                    {live ? '—' : 'TIN-8894102-NG'}
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
                  onClick={downloadVatInvoice}
                >
                  <Icon className="text-[18px] text-primary" name="download" />
                  <span>September VAT</span>
                </button>
                <button
                  className="p-2.5 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
                  type="button"
                  onClick={openVatArchive}
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
