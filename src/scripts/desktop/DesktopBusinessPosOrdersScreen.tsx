import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { printKvTable, printReport } from '../../utils/printReport';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { money } from '../../services/posService';
import { usePosSales } from '../../hooks/business/usePos';
import { useBusinessOrders } from '../../hooks/business/useBusinessOrders';
import { methodLabel, naira, saleItemsLine, setSelectedSaleId, timeLabel, useLivePos } from '../posLive';

const isToday = (iso?: string | null) => Boolean(iso) && new Date(iso as string).toDateString() === new Date().toDateString();

interface DesktopBusinessPosOrdersScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  activeNav?: string;
  /** Live: opens the POS transaction detail for the sale picked. */
  onOpenSale?: () => void;
}

type PosFilter = 'all' | 'online' | 'pos';

const FILTERS: Array<{ key: PosFilter; label: string; count: number }> = [
  { key: 'all', label: 'All', count: 12 },
  { key: 'online', label: 'Online', count: 5 },
  { key: 'pos', label: 'POS', count: 7 },
];

const RECENT = [
  { id: '#POS-1047', time: '11:42 AM', channel: 'POS', total: '₦6,800.00', method: 'Cash' },
  { id: '#POS-1046', time: '11:18 AM', channel: 'POS', total: '₦19,400.00', method: 'Transfer' },
  { id: '#POS-1045', time: '10:41 AM', channel: 'POS', total: '₦8,900.00', method: 'Card ****8821' },
];

export function DesktopBusinessPosOrdersScreen({
  onNav,
  activeNav = 'pos-transactions',
  onOpenSale,
}: DesktopBusinessPosOrdersScreenProps) {
  const [filter, setFilter] = useState<PosFilter>('pos');
  const [shiftState, setShiftState] = useState<'open' | 'closing' | 'printed'>('open');
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };
  // Live: today's till sales, the open register and its Z-report figures.
  const live = hasApiConfig();
  const [search, setSearch] = useState('');
  const pos = useLivePos();
  const sales = usePosSales({ limit: 100, search: search.trim() || undefined });
  const storeOrders = useBusinessOrders();
  const todaySales = (sales.data?.data ?? []).filter((sale) => isToday(sale.createdAt));
  const paidSales = todaySales.filter((sale) => sale.status !== 'refunded');
  const onlineToday = (storeOrders.data ?? []).filter((order) => isToday(order.createdAt) && !order.payment?.posSaleId).length;
  const sum = (pick: (sale: (typeof todaySales)[number]) => unknown) => paidSales.reduce((total, sale) => total + money(pick(sale) as number), 0);
  const gross = sum((sale) => sale.subtotal ?? sale.total);
  const discounts = sum((sale) => sale.discountAmount);
  const vat = sum((sale) => sale.tax);
  const net = sum((sale) => sale.total);
  const z = pos.zReport;
  const openingFloat = money(z?.openingCash ?? pos.session?.openingCash);
  const expectedCash = money(z?.expectedCash ?? pos.session?.expectedCash);
  const sessionSales = money(z?.totalSales ?? pos.session?.totalSales);
  const electronic = Math.max(0, sessionSales - money(z?.cashSales));
  const filters = live
    ? [
        { key: 'all' as const, label: 'All', count: onlineToday + todaySales.length },
        { key: 'online' as const, label: 'Online', count: onlineToday },
        { key: 'pos' as const, label: 'POS', count: todaySales.length },
      ]
    : FILTERS;
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);
  const drawer = (value: number) => (pos.isOpen ? naira(value) : '—');
  const openSale = (id: string) => {
    setSelectedSaleId(id);
    if (onOpenSale) onOpenSale();
    else onNav('pos-transactions');
  };
  const syncLive = () => {
    setSyncing(true);
    Promise.all([sales.refetch(), storeOrders.refetch()]).finally(() => {
      setSyncing(false);
      showToast('Sales refreshed');
    });
  };
  const openTill = () => {
    if (!live || pos.isOpen) {
      onNav('pos');
      return;
    }
    pos
      .openOnTill()
      .then(() => showToast('Register open — you can start selling'))
      .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not open the register.')));
  };
  const cashOut = () => {
    if (!pos.isOpen) {
      showToast('Open the register first.');
      return;
    }
    const entered = window.prompt('Cash out of the drawer (₦)');
    const amount = Number((entered ?? '').replace(/[^\d.]/g, ''));
    if (!amount) return;
    pos.mutations.cashDrop.mutate(
      { amount, reason: 'Cash out' },
      {
        onSuccess: () => showToast(`${naira(amount)} recorded as cash out`),
        onError: (error) => showToast(apiErrorMessage(error, 'Could not record the cash out.')),
      },
    );
  };
  const closeShiftLive = () => {
    if (!pos.isOpen) {
      showToast('No register is open.');
      return;
    }
    if (!window.confirm(`Close the register on ${pos.tillName} and end this shift?`)) return;
    setShiftState('closing');
    pos.mutations.closeRegister.mutate(
      {},
      {
        onSuccess: (session) => {
          setShiftState('printed');
          printReport(
            'Z-Report — Shift Close',
            `${printKvTable('Shift', [
              ['Date', new Date().toLocaleDateString('en-NG')],
              ['Till', `${pos.tillName} (${pos.branchName})`],
              ['Cashier', pos.cashierName],
            ])}
             ${printKvTable(
               'Transactions',
               todaySales.map((sale) => [`#${sale.receiptNumber} • ${timeLabel(sale.createdAt)}`, `${naira(money(sale.total))} • ${methodLabel(sale.paymentMethod)} • POS`]),
             )}
             ${printKvTable('Totals', [
               ['Transactions', `${session.transactionCount ?? todaySales.length}`],
               ...pos.breakdown.map((row) => [row.label, naira(row.amount)] as [string, string]),
               ['Gross takings', naira(money(session.totalSales))],
               ['Expected cash in drawer', naira(money(session.expectedCash))],
             ])}
             <p class="foot">Z-Report generated at shift close. Retain for reconciliation.</p>`,
          );
          showToast('Z-Report printed — shift closed');
        },
        onError: (error) => {
          setShiftState('open');
          showToast(apiErrorMessage(error, 'Could not close the register.'));
        },
      },
    );
  };

  const closeShift = () => {
    if (live) {
      closeShiftLive();
      return;
    }
    setShiftState('closing');
    window.setTimeout(() => {
      setShiftState('printed');
      printReport(
        'Z-Report — Shift Close',
        `${printKvTable('Shift', [
          ['Date', new Date().toLocaleDateString('en-NG')],
          ['Till', 'Till 01 (Wuse II)'],
          ['Cashier', 'Tunde Bakare'],
        ])}
         ${printKvTable(
           'Transactions',
           RECENT.map((row) => [`${row.id} • ${row.time}`, `${row.total} • ${row.method} • ${row.channel}`]),
         )}
         ${printKvTable('Totals', [
          ['Transactions', `${RECENT.length}`],
          ['Card', '₦28,300.00'],
          ['Transfer', '₦19,400.00'],
          ['Cash', '₦6,800.00'],
          ['Gross takings', '₦54,500.00'],
          ['Expected cash in drawer', '₦6,800.00'],
        ])}
         <p class="foot">Z-Report generated at shift close. Retain for reconciliation.</p>`,
      );
      showToast('Z-Report printed — shift closed');
    }, 1500);
  };

  return (
    <BusinessPortalChrome activeNav={activeNav} onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-lg">
          <div className="flex flex-wrap items-center gap-space-sm">
            {/* Branch/location lives in the header only — no duplicate control here. */}
            <div className="flex items-center bg-surface-subtle rounded-xl p-space-2xs">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`px-space-sm py-space-2xs rounded-lg font-label-sm text-label-sm transition-colors ${
                    filter === f.key ? 'bg-surface text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f.label} <span className="text-text-tertiary">({f.count})</span>
                </button>
              ))}
            </div>
            <div className="flex-1 min-w-48 relative hidden md:block">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
              <input
                type="search"
                placeholder="Search POS transactions…"
                value={live ? search : undefined}
                onChange={live ? (event) => setSearch(event.target.value) : undefined}
                className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </div>
            <button type="button" className="px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="calendar_today" className="text-[16px]" />
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                if (live) {
                  syncLive();
                  return;
                }
                setSyncing(true);
                window.setTimeout(() => {
                  setSyncing(false);
                  showToast('Terminal synced');
                }, 1200);
              }}
              className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium"
            >
              <Icon name="sync" className={`text-[14px] ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Synced'}
            </button>
          </div>

          <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-md flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-lg">
              <div className="flex items-center gap-space-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${!live || pos.isOpen ? 'bg-badge-discount-text' : 'bg-outline'}`} />
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {v(pos.isOpen ? `${pos.tillName} — OPEN` : 'No register open', 'Terminal 01 — ONLINE')}
                </span>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Today's POS</div>
                <div className="font-heading-md text-heading-md text-on-surface">{v(naira(pos.todaySales), '₦142,500.00')}</div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Transactions</div>
                <div className="font-heading-md text-heading-md text-on-surface">{v(pos.todayCount, 12)}</div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">vs yesterday</div>
                <div className="font-heading-md text-heading-md text-badge-discount-text">{v('—', '+18.4%')}</div>
              </div>
              {!live && (
                <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-surface-subtle text-on-surface-variant font-label-sm text-label-sm">
                  <Icon name="lan" className="text-[14px]" />
                  Mesh node stable
                </div>
              )}
            </div>
            <button type="button" onClick={() => onNav('pos')} className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm flex items-center gap-space-xs">
              <Icon name="point_of_sale" className="text-[18px]" />
              Launch POS Register
            </button>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            <div className="xl:col-span-8 space-y-space-lg">
              <section className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="px-space-md py-space-sm border-b border-border flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">POS Ledger</h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{live
                    ? filter === 'pos'
                      ? `${todaySales.length} POS sales`
                      : filter === 'online'
                        ? `${onlineToday} Online orders`
                        : `${onlineToday + todaySales.length} transactions`
                    : filter === 'pos'
                      ? '7 POS sales'
                      : filter === 'online'
                        ? '5 Online orders'
                        : '12 transactions'}</span>
                </div>

                {!live && filter !== 'online' && (
                  <article className="p-space-md border-b border-border space-y-space-sm">
                    <div className="flex flex-wrap items-start justify-between gap-space-sm">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="font-heading-sm text-heading-sm text-on-surface">#POS-1049</span>
                        <span className="px-space-2xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">COMPLETED</span>
                        <span className="px-space-2xs py-space-2xs rounded-full bg-surface-subtle text-on-surface-variant font-caption text-caption">Dine-in • Table 7</span>
                        <span className="font-body-sm text-body-sm text-text-tertiary">12:22 PM</span>
                      </div>
                      <div className="text-right">
                        <div className="font-heading-sm text-heading-sm text-on-surface">₦11,200.00</div>
                        <div className="font-label-sm text-label-sm text-badge-discount-text">Card ****4412</div>
                      </div>
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Jollof Rice Platter ×1, Chapman ×2</div>
                    <div className="flex justify-between font-body-md text-body-md">
                      <span className="text-on-surface-variant">NFC Voucher discount</span>
                      <span className="text-badge-discount-text">− ₦2,400.00</span>
                    </div>
                    <div className="flex justify-between font-label-md text-label-md font-semibold border-t border-border pt-space-xs">
                      <span className="text-on-surface">Total</span>
                      <span className="text-on-surface">₦9,600.00</span>
                    </div>
                    <div className="flex flex-wrap gap-space-sm pt-space-2xs">
                      <button type="button" onClick={() => onNav('pos')} className="px-space-sm py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue">View in Register</button>
                      <button type="button" onClick={() => showToast('Receipt reprinted')} className="px-space-sm py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle">Reprint</button>
                      <button type="button" onClick={() => showToast('KOT sent to kitchen')} className="px-space-sm py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle">Send KOT</button>
                    </div>
                  </article>
                )}

                {!live && filter !== 'online' && (
                  <article className="p-space-md border-b border-border space-y-space-xs opacity-80">
                    <div className="flex flex-wrap items-start justify-between gap-space-sm">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="font-heading-sm text-heading-sm text-on-surface">#POS-1048</span>
                        <span className="px-space-2xs py-space-2xs rounded-full bg-surface-subtle text-on-surface-variant font-caption text-caption font-semibold">COMPLETED</span>
                        <span className="font-body-sm text-body-sm text-text-tertiary">11:56 AM</span>
                      </div>
                      <div className="font-heading-sm text-heading-sm text-on-surface">₦14,800.00</div>
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Grilled Chicken Platter ×2, Malt ×1 — Cash drawer</div>
                  </article>
                )}

                {(filter === 'all' || filter === 'pos') && (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-subtle border-b border-border">
                        <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant">Txn</th>
                        <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant">Time</th>
                        <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant">Channel</th>
                        <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant">Method</th>
                        <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {live &&
                        todaySales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-surface-subtle/50 cursor-pointer" onClick={() => openSale(sale.id)} title={saleItemsLine(sale)}>
                            <td className="px-space-md py-space-sm font-label-md text-label-md text-on-surface">#{sale.receiptNumber}</td>
                            <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">{timeLabel(sale.createdAt)}</td>
                            <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">
                              POS • {sale.orderType === 'takeaway' ? 'Takeaway' : 'Dine-in'}
                            </td>
                            <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">{methodLabel(sale.paymentMethod)}</td>
                            <td className="px-space-md py-space-sm font-label-md text-label-md text-on-surface text-right">{naira(money(sale.total))}</td>
                          </tr>
                        ))}
                      {live && !todaySales.length && (
                        <tr>
                          <td colSpan={5} className="px-space-md py-space-md font-body-md text-body-md text-on-surface-variant text-center">
                            {sales.isLoading ? 'Loading sales…' : 'No in-store sales yet today.'}
                          </td>
                        </tr>
                      )}
                      {!live && RECENT.map((r) => (
                        <tr key={r.id} className="hover:bg-surface-subtle/50">
                          <td className="px-space-md py-space-sm font-label-md text-label-md text-on-surface">{r.id}</td>
                          <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">{r.time}</td>
                          <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">{r.channel}</td>
                          <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">{r.method}</td>
                          <td className="px-space-md py-space-sm font-label-md text-label-md text-on-surface text-right">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {filter === 'online' && (
                  <div className="p-space-md font-body-md text-body-md text-on-surface-variant">
                    Online orders appear here when routed from the Orders Hub.{' '}
                    <button type="button" onClick={() => onNav('orders')} className="text-primary hover:underline">
                      Open Orders Hub →
                    </button>
                  </div>
                )}
              </section>
            </div>

            <div className="xl:col-span-4 space-y-space-lg">
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg space-y-space-sm">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Cash Drawer</h2>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Opening float</span>
                  <span className="text-on-surface">{v(drawer(openingFloat), '₦20,000.00')}</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Cash in drawer</span>
                  <span className="text-on-surface">{v(drawer(expectedCash), '₦58,500.00')}</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Electronic</span>
                  <span className="text-on-surface">{v(drawer(electronic), '₦84,000.00')}</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md font-semibold border-t border-border pt-space-xs">
                  <span className="text-on-surface">Net expected</span>
                  <span className="text-primary">{v(drawer(expectedCash), '₦83,500.00')}</span>
                </div>
                <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                  <button type="button" onClick={() => showToast(live ? 'Cash in is coming soon' : 'Cash-in drawer opened')} className="py-space-xs rounded-xl border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle">
                    Cash In
                  </button>
                  <button type="button" onClick={() => (live ? cashOut() : showToast('Cash-out drawer opened'))} className="py-space-xs rounded-xl border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle">
                    Cash Out
                  </button>
                </div>
                <button type="button" onClick={openTill} className="w-full mt-space-xs h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90">
                  {live && pos.isOpen ? 'Go to Till' : 'Open Till'}
                </button>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg space-y-space-sm">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Z-Report</h2>
                <div className="space-y-space-2xs font-body-md text-body-md">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Gross sales</span>
                    <span className="text-on-surface">{v(naira(gross), '₦144,900.00')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Discounts</span>
                    <span className="text-badge-discount-text">− {v(naira(discounts), '₦2,400.00')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">VAT collected</span>
                    <span className="text-on-surface">+ {v(naira(vat), '₦0.00')}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-space-xs">
                    <span className="text-on-surface">Net</span>
                    <span className="text-primary">{v(naira(net), '₦142,500.00')}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeShift}
                  disabled={shiftState !== 'open' || (live && !pos.isOpen)}
                  className="w-full mt-space-xs h-11 rounded-xl border border-border font-label-md text-label-md text-on-surface hover:bg-surface-subtle disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-space-xs"
                >
                  {shiftState === 'closing' ? (
                    <>
                      <Icon name="sync" className="text-[18px] animate-spin" />
                      Printing…
                    </>
                  ) : shiftState === 'printed' ? (
                    <>
                      <Icon name="check_circle" filled className="text-[18px] text-badge-discount-text" />
                      Shift Closed — Z-Report Printed
                    </>
                  ) : (
                    'Close Shift'
                  )}
                </button>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <div className="flex items-center gap-space-xs mb-space-sm">
                  <Icon name="cloud_done" className="text-[18px] text-badge-discount-text" />
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Edge Buffer Health</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {live
                    ? pos.offline.queue.length
                      ? `${pos.offline.queue.length} sale${pos.offline.queue.length === 1 ? '' : 's'} queued offline — they sync when the connection returns.`
                      : 'Offline queue empty — all sales are synced.'
                    : 'Offline queue empty. Last mesh heartbeat 12 seconds ago — all transactions are synced to the cloud ledger.'}
                </p>
              </section>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-on-surface-inverse px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
            <Icon name="check_circle" filled className="text-[18px] text-badge-discount-text" />
            {toast}
          </div>
        )}
      </div>
    </BusinessPortalChrome>
  );
}
