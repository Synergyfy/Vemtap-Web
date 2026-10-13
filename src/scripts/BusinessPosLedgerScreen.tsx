import { useEffect, useMemo, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosTabBar, POS_NAV_MAIN, type PosTabKey } from '../components/PosTabBar';
import { naira } from './catalogueData';

interface BusinessPosLedgerScreenProps {
  onNav: (key: PosTabKey) => void;
  onOpenOrder: () => void;
}

type StatusKey = 'all' | 'completed' | 'pending' | 'refunded' | 'failed';

const STATUS_TABS: { key: StatusKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'failed', label: 'Failed' },
];

const STATUS_CHIP: Record<Exclude<StatusKey, 'all'>, string> = {
  completed: 'bg-badge-discount-bg text-badge-discount-text',
  pending: 'bg-secondary-fixed text-on-secondary-fixed',
  refunded: 'bg-surface-container text-text-secondary',
  failed: 'bg-error-container text-on-error-container',
};

interface TxRecord {
  id: string;
  time: string;
  customer: string;
  method: string;
  amount: number;
  status: Exclude<StatusKey, 'all'>;
  items: string;
  sync: string;
  synced: boolean;
}

const TRANSACTIONS: TxRecord[] = [
  {
    id: 'TX-94021',
    time: '12:41 PM',
    customer: 'Michael James',
    method: 'Card ····4821',
    amount: 27251,
    status: 'completed',
    items: '3 items · Ribeye, Burger, Wedges',
    sync: 'Synced',
    synced: true,
  },
  {
    id: 'TX-94020',
    time: '12:33 PM',
    customer: 'Walk-in guest',
    method: 'Cash',
    amount: 8400,
    status: 'completed',
    items: '2 items · Jollof & Prawns, Chapman',
    sync: 'Synced',
    synced: true,
  },
  {
    id: 'TX-94019',
    time: '12:26 PM',
    customer: 'Adaeze Nwosu',
    method: 'VEMTAP QR',
    amount: 15750,
    status: 'pending',
    items: '2 items · Lamb Chops, Zobo Fizz',
    sync: 'Queued offline · 1 retry',
    synced: false,
  },
  {
    id: 'TX-94018',
    time: '12:12 PM',
    customer: 'Zainab Bello',
    method: 'Card ····1109',
    amount: 4200,
    status: 'refunded',
    items: '1 item · Crispy Buttermilk Chicken',
    sync: 'Refund posted to card',
    synced: true,
  },
  {
    id: 'TX-94017',
    time: '11:58 AM',
    customer: 'Walk-in guest',
    method: 'Bank Transfer',
    amount: 6300,
    status: 'failed',
    items: '2 items · Brisket, Garden Salad',
    sync: 'Transfer not confirmed',
    synced: false,
  },
];

export function BusinessPosLedgerScreen({ onNav, onOpenOrder }: BusinessPosLedgerScreenProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusKey>('all');
  const [detail, setDetail] = useState<TxRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRANSACTIONS.filter((tx) => {
      const matchesStatus = status === 'all' || tx.status === status;
      const matchesQuery =
        !q || tx.id.toLowerCase().includes(q) || tx.customer.toLowerCase().includes(q) || tx.method.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const gross = TRANSACTIONS.filter((tx) => tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="px-margin pt-space-xs pb-space-2xs flex items-center justify-between gap-space-xs">
          <span className="h-7 px-space-xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold flex items-center gap-1 min-w-0">
            <Icon name="storefront" className="text-[13px]" />
            <span className="truncate">Wuse II · Till 01</span>
          </span>
          <span className="h-7 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
            <span>Synced</span>
          </span>
          <button
            type="button"
            aria-label="Sync ledger"
            onClick={() => showToast('Ledger re-synced · no conflicts')}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Icon name="sync" className="text-text-secondary text-[16px]" />
          </button>
        </div>
        <div className="px-margin pb-space-xs flex flex-col">
          <span className="font-heading-sm text-heading-sm text-on-surface leading-tight">Transactions &amp; Ledger</span>
          <span className="font-caption text-caption text-text-secondary">Shift #2 · opened 11:04 AM by Emeka O.</span>
        </div>
      </header>

      <div className="flex flex-col pb-24">
        {/* Till strip */}
        <div className="px-margin pt-space-2xs">
          <div className="bg-surface-canvas rounded-xl px-space-xs py-space-2xs shadow-sm flex items-center justify-between gap-space-xs">
            <span className="flex items-center gap-space-2xs min-w-0">
              <Icon name="point_of_sale" className="text-primary text-[15px]" />
              <span className="font-caption text-caption text-text-secondary truncate">Till 01 · Drawer float ₦45,000</span>
            </span>
            <span className="font-caption text-caption text-on-surface shrink-0">42 tickets</span>
          </div>
        </div>

        {/* Search + chips */}
        <div className="px-margin pt-space-xs">
          <div className="h-11 bg-surface-container rounded-xl px-space-xs flex items-center gap-space-2xs border border-transparent focus-within:border-border-active transition-colors">
            <Icon name="search" className="text-text-secondary text-[18px]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticket, guest or method…"
              autoComplete="off"
              inputMode="search"
              className="flex-1 min-w-0 bg-transparent outline-none font-label-sm text-label-sm text-on-surface placeholder:text-text-tertiary"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-text-secondary">
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
        </div>
        <div className="px-margin pt-space-2xs flex gap-space-2xs overflow-x-auto no-scrollbar pb-space-2xs">
          {[
            { icon: 'today', label: 'Today' },
            { icon: 'schedule', label: 'Shift #2' },
            { icon: 'filter_alt', label: 'Method' },
            { icon: 'download', label: 'Export CSV' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => showToast(`${chip.label} filter applied to ledger`)}
              className="h-9 px-space-xs rounded-full bg-surface-canvas border border-border-subtle font-label-sm text-label-sm text-on-surface flex items-center gap-1 whitespace-nowrap shrink-0 active:scale-95 transition-transform"
            >
              <Icon name={chip.icon} className="text-primary text-[14px]" />
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* KPI ribbon */}
        <div className="px-margin pt-space-2xs">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs">
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wide">Gross takings</span>
              <span className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight">{naira(gross)}</span>
              <span className="font-caption text-caption text-badge-discount-text">+8% vs yesterday</span>
            </div>
            <div className="flex gap-space-2xs shrink-0">
              <div className="bg-surface-container-low rounded-xl px-space-xs py-1.5 flex flex-col items-center min-w-[64px]">
                <span className="font-label-md text-label-md text-on-surface font-bold">42</span>
                <span className="font-caption text-caption text-text-secondary">Tickets</span>
              </div>
              <div className="bg-surface-container-low rounded-xl px-space-xs py-1.5 flex flex-col items-center min-w-[64px]">
                <span className="font-label-md text-label-md text-on-surface font-bold">1</span>
                <span className="font-caption text-caption text-text-secondary">Void</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="px-margin pt-space-sm flex gap-space-2xs overflow-x-auto no-scrollbar pb-space-2xs">
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.key;
            const count =
              tab.key === 'all' ? TRANSACTIONS.length : TRANSACTIONS.filter((tx) => tx.status === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatus(tab.key)}
                className={`h-9 px-space-xs rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-transform ${
                  isActive ? 'bg-primary text-on-primary' : 'bg-surface-canvas border border-border-subtle text-on-surface'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Transaction cards */}
        <div className="px-margin pt-space-2xs flex flex-col gap-space-2xs">
          {rows.map((tx) => (
            <button
              key={tx.id}
              type="button"
              onClick={() => setDetail(tx)}
              className="w-full bg-surface-canvas rounded-2xl p-space-xs shadow-sm flex items-center justify-between gap-space-xs text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-space-xs min-w-0 flex-1">
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.status === 'completed'
                      ? 'bg-badge-discount-bg text-badge-discount-text'
                      : tx.status === 'failed'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container text-text-secondary'
                  }`}
                >
                  <Icon
                    name={tx.status === 'completed' ? 'receipt_long' : tx.status === 'refunded' ? 'replay' : tx.status === 'failed' ? 'error' : 'pending'}
                    className="text-[18px]"
                  />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                    {tx.id} · {tx.customer}
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {tx.time} · {tx.method}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`h-4 px-1.5 rounded-full font-caption text-caption font-semibold ${STATUS_CHIP[tx.status]}`}>
                      {tx.status[0].toUpperCase() + tx.status.slice(1)}
                    </span>
                    <span className={`font-caption text-caption ${tx.synced ? 'text-text-tertiary' : 'text-badge-discount-text'}`}>
                      {tx.sync}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="font-label-md text-label-md text-on-surface font-bold">{naira(tx.amount)}</span>
                <span className="font-caption text-caption text-text-secondary">View</span>
              </div>
            </button>
          ))}
          {rows.length === 0 && (
            <div className="flex flex-col items-center text-center gap-space-xs py-space-md">
              <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="search_off" className="text-text-secondary text-[22px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">No matching transactions</span>
              <span className="font-caption text-caption text-text-secondary max-w-[250px]">
                Try a different status tab or clear the search to see the full shift ledger.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detail sheet */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button type="button" aria-label="Dismiss" className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative w-full max-w-[430px] bg-surface rounded-t-3xl px-margin pt-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-[0_-8px_32px_rgba(0,0,0,0.18)] flex flex-col gap-space-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex flex-col min-w-0">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold truncate">Ticket {detail.id}</span>
                <span className="font-caption text-caption text-text-secondary">
                  {detail.time} · {detail.customer}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDetail(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0"
              >
                <Icon name="close" className="text-text-secondary text-[16px]" />
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl px-space-xs py-space-2xs flex flex-col gap-space-2xs">
              <div className="flex justify-between">
                <span className="font-caption text-caption text-text-secondary">Tender</span>
                <span className="font-caption text-caption text-on-surface">{detail.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-caption text-caption text-text-secondary">Basket</span>
                <span className="font-caption text-caption text-on-surface text-right">{detail.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-caption text-caption text-text-secondary">Status</span>
                <span className={`h-4 px-1.5 rounded-full font-caption text-caption font-semibold ${STATUS_CHIP[detail.status]}`}>
                  {detail.status[0].toUpperCase() + detail.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border-subtle pt-space-2xs">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Total</span>
                <span className="font-label-md text-label-md text-primary font-bold">{naira(detail.amount)}</span>
              </div>
            </div>

            <div className="flex gap-space-2xs">
              <button
                type="button"
                onClick={() => showToast('Receipt reprinted on 80mm thermal printer')}
                className="flex-1 h-10 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <Icon name="print" className="text-[15px]" />
                <span>Reprint</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Receipt emailed to the guest')}
                className="flex-1 h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <Icon name="mail" className="text-text-secondary text-[15px]" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDetail(null);
                  onOpenOrder();
                }}
                className="flex-1 h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <Icon name="open_in_new" className="text-text-secondary text-[15px]" />
                <span>Open</span>
              </button>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              {detail.sync} · ledger entries are immutable after shift close.
            </span>
          </div>
        </div>
      )}

      <PosTabBar items={POS_NAV_MAIN} active="ledger" onSelect={onNav} />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
