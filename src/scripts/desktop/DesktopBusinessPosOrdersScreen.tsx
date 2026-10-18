import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { printKvTable, printReport } from '../../utils/printReport';

interface DesktopBusinessPosOrdersScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  activeNav?: string;
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
}: DesktopBusinessPosOrdersScreenProps) {
  const [filter, setFilter] = useState<PosFilter>('pos');
  const [shiftState, setShiftState] = useState<'open' | 'closing' | 'printed'>('open');
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const closeShift = () => {
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
              {FILTERS.map((f) => (
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
                className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </div>
            <button type="button" className="px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="calendar_today" className="text-[16px]" />
              Today
            </button>
            <button
              type="button"
              onClick={() => { setSyncing(true); window.setTimeout(() => { setSyncing(false); showToast('Terminal synced'); }, 1200); }}
              className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium"
            >
              <Icon name="sync" className={`text-[14px] ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Synced'}
            </button>
          </div>

          <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-md flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-lg">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                <span className="font-label-md text-label-md text-on-surface font-semibold">Terminal 01 — ONLINE</span>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Today's POS</div>
                <div className="font-heading-md text-heading-md text-on-surface">₦142,500.00</div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Transactions</div>
                <div className="font-heading-md text-heading-md text-on-surface">12</div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">vs yesterday</div>
                <div className="font-heading-md text-heading-md text-badge-discount-text">+18.4%</div>
              </div>
              <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-surface-subtle text-on-surface-variant font-label-sm text-label-sm">
                <Icon name="lan" className="text-[14px]" />
                Mesh node stable
              </div>
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
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{filter === 'pos' ? '7 POS sales' : filter === 'online' ? '5 Online orders' : '12 transactions'}</span>
                </div>

                {filter !== 'online' && (
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

                {filter !== 'online' && (
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
                      {RECENT.map((r) => (
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
                  <span className="text-on-surface">₦20,000.00</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Cash in drawer</span>
                  <span className="text-on-surface">₦58,500.00</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Electronic</span>
                  <span className="text-on-surface">₦84,000.00</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md font-semibold border-t border-border pt-space-xs">
                  <span className="text-on-surface">Net expected</span>
                  <span className="text-primary">₦83,500.00</span>
                </div>
                <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                  <button type="button" onClick={() => showToast('Cash-in drawer opened')} className="py-space-xs rounded-xl border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle">
                    Cash In
                  </button>
                  <button type="button" onClick={() => showToast('Cash-out drawer opened')} className="py-space-xs rounded-xl border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle">
                    Cash Out
                  </button>
                </div>
                <button type="button" onClick={() => onNav('pos')} className="w-full mt-space-xs h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90">
                  Open Till
                </button>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg space-y-space-sm">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Z-Report</h2>
                <div className="space-y-space-2xs font-body-md text-body-md">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Gross sales</span>
                    <span className="text-on-surface">₦144,900.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Discounts</span>
                    <span className="text-badge-discount-text">− ₦2,400.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">VAT collected</span>
                    <span className="text-on-surface">+ ₦0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-space-xs">
                    <span className="text-on-surface">Net</span>
                    <span className="text-primary">₦142,500.00</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeShift}
                  disabled={shiftState !== 'open'}
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
                  Offline queue empty. Last mesh heartbeat 12 seconds ago — all transactions are synced to the cloud ledger.
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
