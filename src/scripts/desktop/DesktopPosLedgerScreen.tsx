import { useEffect, useMemo, useState } from 'react';
import { FilterMenu } from '../../components/FilterMenu';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { downloadCsv } from '../../utils/exportCsv';
import { printKvTable, printReport } from '../../utils/printReport';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { naira, setSelectedSaleId, timeLabel, useLivePos, usePosLedger } from '../posLive';

const LIVE_TENDER: Record<string, TenderType> = { cash: 'Cash', card: 'POS Card', transfer: 'Transfer', split: 'Split' };
const LIVE_BARS = ['bg-primary-container', 'bg-badge-discount-text', 'bg-secondary', 'bg-tertiary'];


interface DesktopPosLedgerScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onOpenOrder: () => void;
}

type TxnStatus = 'settled' | 'refunded' | 'voided' | 'parked';
type TenderType = 'Cash' | 'POS Card' | 'Transfer' | 'VEMTAP QR' | 'Split';

interface TxnRow {
  id: string;
  /** API sale id (live); null while a sale is queued offline. */
  saleId?: string | null;
  time: string;
  receipt: string;
  ticket: string;
  type: string;
  customer: string;
  items: number;
  tender: TenderType;
  amount: number;
  status: TxnStatus;
}

const STATUS_META: Record<TxnStatus, { label: string; className: string; dot: string }> = {
  settled: { label: 'Settled', className: 'bg-badge-discount-bg text-badge-discount-text', dot: 'bg-badge-discount-text' },
  refunded: { label: 'Refunded', className: 'bg-tertiary-fixed text-tertiary', dot: 'bg-tertiary' },
  voided: { label: 'Voided', className: 'bg-error-container text-error', dot: 'bg-error' },
  parked: { label: 'Parked', className: 'bg-surface-container-high text-text-secondary', dot: 'bg-text-secondary' },
};

const TENDER_META: Record<TenderType, { icon: string; tone: string }> = {
  Cash: { icon: 'payments', tone: 'text-badge-discount-text' },
  'POS Card': { icon: 'credit_card', tone: 'text-primary' },
  Transfer: { icon: 'account_balance', tone: 'text-secondary' },
  'VEMTAP QR': { icon: 'qr_code_scanner', tone: 'text-tertiary-container' },
  Split: { icon: 'call_split', tone: 'text-primary' },
};

const DEMO_TXNS: TxnRow[] = [
  { id: 't1', time: '13:42', receipt: 'RC-10842', ticket: 'TK-108', type: 'Dine-In', customer: 'Michael James', items: 3, tender: 'Cash', amount: 27251, status: 'settled' },
  { id: 't2', time: '13:36', receipt: 'RC-10841', ticket: 'TK-107', type: 'Takeaway', customer: 'Walk-in', items: 2, tender: 'POS Card', amount: 13475, status: 'settled' },
  { id: 't3', time: '13:28', receipt: 'RC-10840', ticket: 'TK-106', type: 'Dine-In', customer: 'Fatima Bello', items: 5, tender: 'VEMTAP QR', amount: 41800, status: 'settled' },
  { id: 't4', time: '13:15', receipt: 'RC-10839', ticket: 'TK-105', type: 'Bar Tab', customer: 'Chidi Nwosu', items: 4, tender: 'Split', amount: 23600, status: 'settled' },
  { id: 't5', time: '13:04', receipt: 'RC-10838', ticket: 'TK-104', type: 'Dine-In', customer: 'Walk-in', items: 1, tender: 'Cash', amount: 2200, status: 'refunded' },
  { id: 't6', time: '12:58', receipt: 'RC-10837', ticket: 'TK-103', type: 'Delivery', customer: 'Aisha Sani', items: 6, tender: 'Transfer', amount: 52350, status: 'settled' },
  { id: 't7', time: '12:47', receipt: 'RC-10836', ticket: 'TK-102', type: 'Dine-In', customer: 'Walk-in', items: 3, tender: 'POS Card', amount: 18975, status: 'settled' },
  { id: 't8', time: '12:40', receipt: 'RC-10835', ticket: 'TK-101', type: 'Takeaway', customer: 'Walk-in', items: 2, tender: 'Cash', amount: 9600, status: 'voided' },
  { id: 't9', time: '12:31', receipt: 'RC-10834', ticket: 'TK-100', type: 'Dine-In', customer: 'Tunde Adeyemi', items: 8, tender: 'POS Card', amount: 74200, status: 'settled' },
  { id: 't10', time: '12:22', receipt: 'RC-10833', ticket: 'TK-099', type: 'Bar Tab', customer: 'Walk-in', items: 3, tender: 'VEMTAP QR', amount: 14750, status: 'settled' },
  { id: 't11', time: '12:10', receipt: 'RC-10832', ticket: 'TK-098', type: 'Delivery', customer: 'Grace Obi', items: 4, tender: 'Transfer', amount: 31200, status: 'settled' },
  { id: 't12', time: '12:02', receipt: 'RC-10831', ticket: 'TK-097', type: 'Dine-In', customer: 'Walk-in', items: 2, tender: 'Cash', amount: 8350, status: 'parked' },
];

const DEMO_TENDER_SPLIT = [
  { label: 'POS Card / NFC', value: 214000, pct: 62.4, txns: 94, bar: 'bg-primary-container', dot: 'bg-primary-container' },
  { label: 'Cash Tender', value: 92400, pct: 26.9, txns: 36, bar: 'bg-badge-discount-text', dot: 'bg-badge-discount-text' },
  { label: 'VEMTAP Direct QR / NIP', value: 36450, pct: 10.7, txns: 12, bar: 'bg-secondary', dot: 'bg-secondary' },
];

const RANGES = [
  { key: 'shift', label: 'This Shift' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: '7 Days' },
] as const;

function Barcode({ value }: { value: string }) {
  // Deterministic pseudo-barcode derived from the value so the SVG renders consistently.
  const bars = useMemo(() => {
    const widths: number[] = [];
    for (let i = 0; i < value.length; i += 1) {
      const code = value.charCodeAt(i);
      widths.push((code % 3) + 1, ((code >> 2) % 2) + 1);
    }
    return widths;
  }, [value]);

  let x = 0;
  const rects = bars.map((width, index) => {
    const rect = { key: index, x, width: width * 2, fill: index % 2 === 0 };
    x += width * 2 + 2;
    return rect;
  });
  const totalWidth = x;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${totalWidth} 64`}
        className="h-14 w-full max-w-xs text-text-primary"
        role="img"
        aria-label={`Shift barcode ${value}`}
      >
        {rects.map((rect) => (
          <rect key={rect.key} x={rect.x} y={0} width={rect.width} height={64} fill={rect.fill ? 'currentColor' : 'transparent'} />
        ))}
      </svg>
      <span className="font-mono text-[11px] tracking-[0.3em] text-text-secondary">{value}</span>
    </div>
  );
}

export function DesktopPosLedgerScreen({ onNav, onOpenOrder }: DesktopPosLedgerScreenProps) {
  const [range, setRange] = useState<'shift' | 'today' | 'week'>('shift');
  const [statusFilter, setStatusFilter] = useState<TxnStatus | ''>('');
  const [toast, setToast] = useState<string | null>(null);
  const live = hasApiConfig();
  const pos = useLivePos();
  // Live: "This Shift" is the open register session; the wider ranges show the branch's latest sales.
  const ledger = usePosLedger(100, range !== 'shift');
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };
  useEffect(() => {
    if (live && ledger.error) showToast(apiErrorMessage(ledger.error, 'Could not load the ledger.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledger.error]);
  const TXNS: TxnRow[] = live
    ? ledger.rows.map((row, index) => ({
        id: row.saleId ?? `queued-${index}`,
        saleId: row.saleId,
        time: timeLabel(row.at),
        receipt: row.ref,
        ticket: row.synced ? '—' : 'Offline',
        type: row.orderType,
        customer: row.customer,
        items: row.itemCount,
        tender: LIVE_TENDER[row.methodKey] ?? 'Cash',
        amount: row.amount,
        status: row.status === 'completed' ? 'settled' : row.status === 'pending' ? 'parked' : 'refunded',
      }))
    : DEMO_TXNS;
  const TENDER_SPLIT = live
    ? pos.breakdown.map((row, index) => ({
        label: row.label,
        value: row.amount,
        pct: row.share,
        txns: ledger.rows.filter((entry) => entry.methodKey === row.method).length,
        bar: LIVE_BARS[index % LIVE_BARS.length],
        dot: LIVE_BARS[index % LIVE_BARS.length],
      }))
    : DEMO_TENDER_SPLIT;
  const openTxn = (txn: TxnRow) => {
    if (live && !txn.saleId) {
      showToast('This sale is still on this device — it opens once it syncs.');
      return;
    }
    setSelectedSaleId(txn.saleId ?? null);
    onOpenOrder();
  };
  const z = pos.zReport;
  const zNum = (value: unknown) => (value == null ? null : Number(value) || 0);
  const cardTotal = zNum(z?.paymentBreakdown?.card);
  const transferTotal = zNum(z?.paymentBreakdown?.transfer);

  // Statuses are pulled from the metadata table, so the menu can never offer a
  // status the ledger does not actually render.
  const statusChoices = [
    { value: '', label: 'All statuses' },
    ...(Object.keys(STATUS_META) as TxnStatus[]).map((key) => ({
      value: key,
      label: STATUS_META[key].label,
    })),
  ];

  const visibleTxns =
    statusFilter === '' ? TXNS : TXNS.filter((txn) => txn.status === statusFilter);

  const rangeLabel = RANGES.find((item) => item.key === range)?.label ?? 'Current Shift';

  const money = (value: number) => `₦${value.toLocaleString('en-US')}`;

  const exportLedger = () => {
    downloadCsv(
      `pos-ledger-${range}.csv`,
      ['Time', 'Receipt', 'Ticket', 'Type', 'Customer', 'Items', 'Tender', 'Amount', 'Status'],
      TXNS.map((txn) => [
        txn.time,
        txn.receipt,
        txn.ticket,
        txn.type,
        txn.customer,
        txn.items,
        txn.tender,
        txn.amount,
        STATUS_META[txn.status].label,
      ]),
    );
  };

  const printZReport = () => {
    printReport(
      `Z-Report — ${rangeLabel}`,
      `${printKvTable('Shift', [
        ['Range', rangeLabel],
        ['Date', new Date().toLocaleDateString('en-NG')],
        ['Till', live ? (pos.isOpen ? `${pos.tillName} (${pos.branchName})` : '—') : 'Till 01 (Wuse II)'],
      ])}
       ${printKvTable(
         'Summary',
         summary.map((item) => [item.label, `${item.value} — ${item.meta}`] as [string, string]),
       )}
       ${printKvTable(
         'Tender split',
         TENDER_SPLIT.map((item) => [item.label, `${money(item.value)} • ${item.pct}% • ${item.txns} txns`] as [string, string]),
       )}
       ${printKvTable('Transactions', TXNS.map((txn) => [`${txn.time} ${txn.receipt}`, `${txn.customer} • ${money(txn.amount)} • ${txn.tender} • ${STATUS_META[txn.status].label}`] as [string, string]))}
       <p class="foot">Z-Report generated for reconciliation. Net realized ${live ? naira(ledger.gross) : '₦309,450'}.</p>`,
    );
  };

  const summary = useMemo(
    () => live ? [
      { label: 'Gross Shift Volume', value: naira(ledger.gross), meta: `${ledger.tickets} tickets`, icon: 'trending_up', tone: 'text-primary' },
      { label: 'Transactions', value: String(ledger.tickets), meta: `${ledger.refunds} refunds`, icon: 'receipt_long', tone: 'text-text-primary' },
      { label: 'Average Ticket', value: naira(ledger.tickets ? Math.round(ledger.gross / Math.max(1, ledger.tickets - ledger.refunds)) : 0), meta: 'per sale', icon: 'analytics', tone: 'text-badge-discount-text' },
      { label: 'VAT Collected (7.5%)', value: '—', meta: 'FIRS remittance', icon: 'account_balance', tone: 'text-text-primary' },
      { label: 'Discounts Applied', value: '—', meta: 'loyalty perks', icon: 'loyalty', tone: 'text-tertiary' },
      { label: 'Tips Collected', value: '—', meta: 'Payout queue', icon: 'volunteer_activism', tone: 'text-badge-discount-text' },
    ] : [
      { label: 'Gross Shift Volume', value: '₦342,850', meta: 'Net realized ₦309,450', icon: 'trending_up', tone: 'text-primary' },
      { label: 'Transactions', value: '142', meta: '0 voids • 0 returns', icon: 'receipt_long', tone: 'text-text-primary' },
      { label: 'Average Ticket', value: '₦2,414', meta: '+4.2% vs yesterday', icon: 'analytics', tone: 'text-badge-discount-text' },
      { label: 'VAT Collected (7.5%)', value: '₦21,594', meta: 'FIRS remittance', icon: 'account_balance', tone: 'text-text-primary' },
      { label: 'Discounts Applied', value: '₦18,200', meta: '18 loyalty perks', icon: 'loyalty', tone: 'text-tertiary' },
      { label: 'Tips Collected', value: '₦9,650', meta: 'Payout queue', icon: 'volunteer_activism', tone: 'text-badge-discount-text' },
    ],
    [live, ledger.gross, ledger.tickets, ledger.refunds],
  );

  const totalSettled = TENDER_SPLIT.reduce((sum, row) => sum + row.value, 0);

  return (
    <PosTerminalChrome activeNav="ledger" onNav={onNav}>
      {/* Sub-header toolbar */}
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="w-full py-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Icon name="receipt_long" className="text-primary text-[24px]" />
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Transactions &amp; Shift Ledger
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                100% Audit Match
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              {live
                ? pos.session
                  ? `Shift #${pos.session.id.slice(0, 6).toUpperCase()} • ${pos.cashierName} • ${pos.tillName} • Opened ${timeLabel(pos.session.openedAt)}`
                  : `No open shift • ${pos.cashierName}`
                : 'Shift #SH-4092 • Emeka Okafor • Till #01 • Opened 08:30 AM WAT'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="flex items-center p-1 rounded-lg bg-surface">
              {RANGES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRange(item.key)}
                  className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-colors ${
                    range === item.key
                      ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={exportLedger}
              className="h-11 px-space-md rounded-lg bg-surface-tint-blue text-primary font-button-secondary text-button-secondary font-semibold flex items-center gap-1.5 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="download" className="text-[18px]" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={printZReport}
              className="h-11 px-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icon name="summarize" className="text-[18px]" />
              <span>Print Z-Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* Summary metric grid */}
      <section className="w-full py-space-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
          {summary.map((item) => (
            <div key={item.label} className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-tertiary uppercase font-semibold tracking-wider">
                  {item.label}
                </span>
                <Icon name={item.icon} className={`text-[18px] ${item.tone}`} />
              </div>
              <span className={`font-heading-md text-heading-md font-bold mt-1 ${item.tone}`}>{item.value}</span>
              <span className="font-caption text-caption text-text-secondary">{item.meta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tender split + shift settlement ledger */}
      <section className="w-full pb-space-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Tender split */}
          <div className="lg:col-span-5 bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Tender Distribution</h2>
              <span className="font-caption text-caption text-text-tertiary">₦{totalSettled.toLocaleString('en-NG')} settled</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden bg-surface-container flex">
              {TENDER_SPLIT.map((row) => (
                <div key={row.label} className={`h-full ${row.bar}`} style={{ width: `${row.pct}%` }} />
              ))}
            </div>
            <div className="flex flex-col gap-space-sm">
              {TENDER_SPLIT.map((row) => (
                <div key={row.label} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle">
                  <div className="flex items-center gap-space-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">{row.label}</span>
                      <span className="font-caption text-caption text-text-tertiary">{row.txns} transactions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-md text-label-md font-bold text-text-primary">
                      ₦{row.value.toLocaleString('en-NG')}
                    </span>
                    <span className="block font-caption text-caption text-text-secondary">{row.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shift settlement / Z-report */}
          <div className="lg:col-span-7 bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Shift Settlement Ledger</h2>
                <span className="font-caption text-caption text-text-secondary">
                  Drawer reconciliation &amp; Z-report snapshot
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <Icon name="verified" className="text-[14px]" />
                Balanced
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col gap-2">
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">
                  Cash Drawer
                </span>
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-text-secondary">Opening Float</span>
                  <span className="font-semibold text-text-primary">{live ? naira(zNum(z?.openingCash)) : '₦50,000'}</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-text-secondary">Cash Sales</span>
                  <span className="font-semibold text-text-primary">{live ? naira(zNum(z?.cashSales)) : '₦92,400'}</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-text-secondary">Tips (Cash)</span>
                  <span className="font-semibold text-text-primary">{live ? '—' : '₦4,250'}</span>
                </div>
                <div className="h-px bg-surface-container my-0.5" />
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-text-secondary font-semibold">Expected Drawer</span>
                  <span className="font-bold text-badge-discount-text">{live ? naira(zNum(z?.expectedCash)) : '₦146,650'}</span>
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col gap-2">
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">
                  Settlement
                </span>
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-text-secondary">Card Batches</span>
                  <span className="font-semibold text-text-primary">{live ? naira(cardTotal) : '₦214,000'}</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-text-secondary">Instant Transfers</span>
                  <span className="font-semibold text-text-primary">{live ? naira(transferTotal) : '₦36,450'}</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-text-secondary">VAT Owed</span>
                  <span className="font-semibold text-text-primary">{live ? '—' : '₦21,594'}</span>
                </div>
                <div className="h-px bg-surface-container my-0.5" />
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-text-secondary font-semibold">Net Remittance</span>
                  <span className="font-bold text-primary">{live ? naira(zNum(z?.totalSales)) : '₦309,450'}</span>
                </div>
              </div>
            </div>

            <div className="p-space-md rounded-lg bg-surface-subtle flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">
                  Shift Ledger Seal
                </span>
                <span className="font-label-sm text-label-sm text-text-primary font-mono">
                  {live ? (pos.session ? `SESSION #${pos.session.id.slice(0, 8).toUpperCase()}` : '—') : 'NODE #WUSE2-01 · HASH #9A24C'}
                </span>
                <span className="font-caption text-caption text-text-tertiary">
                  {live ? `${ledger.tickets} tickets ledgered • ${pos.offline.pendingCount} waiting to sync` : '142 tickets ledgered • 18ms sync latency'}
                </span>
              </div>
              <Barcode value={live ? (pos.session?.id.slice(0, 18).toUpperCase() ?? 'NO-SHIFT') : 'SH4092-342850-004'} />
            </div>
          </div>
        </div>
      </section>

      {/* Transactions table */}
      <section className="w-full pb-space-lg">
        <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden">
          <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container">
            <div className="flex items-center gap-2">
              <Icon name="history" className="text-primary text-[20px]" />
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Shift Transactions</h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption font-semibold">
                {visibleTxns.length} shown
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <FilterMenu
                align="right"
                buttonClassName="px-space-sm py-2 rounded-lg bg-surface hover:bg-surface-container-high text-text-secondary font-caption text-caption font-semibold transition-colors flex items-center gap-1.5"
                choices={statusChoices}
                icon="filter_list"
                iconClassName="text-[16px]"
                label="Filter"
                onChange={(next) => setStatusFilter(next as TxnStatus | '')}
                title="Filter by payment status"
                value={statusFilter}
              />
              <button
                type="button"
                className="px-space-sm py-2 rounded-lg bg-surface hover:bg-surface-container-high text-text-secondary font-caption text-caption font-semibold transition-colors flex items-center gap-1.5"
              >
                <Icon name="sort" className="text-[16px]" />
                Newest
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px] text-left">
              <thead>
                <tr className="bg-surface text-text-tertiary font-caption text-caption uppercase tracking-wider">
                  <th className="px-space-md py-3 font-semibold">Time</th>
                  <th className="px-space-md py-3 font-semibold">Receipt / Ticket</th>
                  <th className="px-space-md py-3 font-semibold">Type</th>
                  <th className="px-space-md py-3 font-semibold">Customer</th>
                  <th className="px-space-md py-3 font-semibold">Items</th>
                  <th className="px-space-md py-3 font-semibold">Tender</th>
                  <th className="px-space-md py-3 font-semibold text-right">Amount</th>
                  <th className="px-space-md py-3 font-semibold">Status</th>
                  <th className="px-space-md py-3 font-semibold text-right">Detail</th>
                </tr>
              </thead>
              <tbody>
                {visibleTxns.map((txn) => {
                  const status = STATUS_META[txn.status];
                  const tender = TENDER_META[txn.tender];
                  return (
                    <tr key={txn.id} className="border-t border-surface-container hover:bg-surface transition-colors">
                      <td className="px-space-md py-3 font-mono font-label-sm text-label-sm text-text-secondary">{txn.time}</td>
                      <td className="px-space-md py-3">
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md font-semibold text-text-primary">{txn.receipt}</span>
                          <span className="font-caption text-caption text-text-tertiary">{txn.ticket}</span>
                        </div>
                      </td>
                      <td className="px-space-md py-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-text-secondary font-caption text-caption font-medium">
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-space-md py-3 font-label-md text-label-md text-text-primary">{txn.customer}</td>
                      <td className="px-space-md py-3 font-label-md text-label-md text-text-secondary">{txn.items}</td>
                      <td className="px-space-md py-3">
                        <span className="inline-flex items-center gap-1.5 font-label-md text-label-md text-text-primary">
                          <Icon name={tender.icon} className={`text-[16px] ${tender.tone}`} />
                          {txn.tender}
                        </span>
                      </td>
                      <td className="px-space-md py-3 text-right font-label-md text-label-md font-bold text-text-primary">
                        ₦{txn.amount.toLocaleString('en-NG')}
                      </td>
                      <td className="px-space-md py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold ${status.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-space-md py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openTxn(txn)}
                          className="inline-flex items-center gap-1 font-caption text-caption font-semibold text-primary hover:text-primary-container transition-colors"
                        >
                          <span>Open</span>
                          <Icon name="chevron_right" className="text-[16px]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-space-md py-space-sm bg-surface flex flex-wrap items-center justify-between gap-space-sm">
            <span className="font-caption text-caption text-text-secondary">
              Showing 12 of 142 shift transactions • Auto-refreshed 6s ago
            </span>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-surface-canvas shadow-sm text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <span className="font-caption text-caption font-semibold text-text-primary">Page 1 of 12</span>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-surface-canvas shadow-sm text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              >
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-on-surface-inverse px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
          {toast}
        </div>
      )}
    </PosTerminalChrome>
  );
}
