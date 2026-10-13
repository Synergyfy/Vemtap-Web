import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { DesktopBusinessBookingsScreen } from './DesktopBusinessBookingsScreen';
import { DesktopBusinessOrderDetailScreen } from './DesktopBusinessOrderDetailScreen';

interface DesktopBusinessOrdersScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  initialView?: 'orders' | 'bookings';
}

type FilterChip = 'all' | 'new' | 'preparing' | 'ready' | 'completed';

const ORDERS = [
  {
    id: '#VG-94021',
    status: 'new' as const,
    statusLabel: 'NEW',
    channel: 'Pickup',
    time: '12:14 PM',
    customer: 'Amina Bello',
    items: 'Woodfire Ribeye ×2, Truffle Fries ×1, Mint Lemonade ×2',
    total: '₦34,500.00',
    payment: 'Paid online',
    paid: true,
    urgent: true,
  },
  {
    id: '#POS-1049',
    status: 'preparing' as const,
    statusLabel: 'IN KITCHEN',
    channel: 'Dine-in • Table 7',
    time: '12:22 PM',
    customer: 'Walk-in (POS)',
    items: 'Jollof Rice Platter ×1, Chapman ×2',
    total: '₦11,200.00',
    payment: 'Card ****4412',
    paid: true,
  },
  {
    id: '#VG-93988',
    status: 'preparing' as const,
    statusLabel: 'PREPARING',
    channel: 'Delivery • GIG',
    time: '11:48 AM',
    customer: 'Tunde Balogun',
    items: 'Grilled Chicken Wrap ×2, Sweet Potato Fries ×1',
    total: '₦18,200.00',
    payment: 'Paid online',
    paid: true,
    progress: 75,
  },
  {
    id: '#VG-93910',
    status: 'ready' as const,
    statusLabel: 'READY',
    channel: 'Pickup',
    time: '11:30 AM',
    customer: 'Chiamaka Obi',
    items: 'Brunch Burger ×1, Cold Brew ×1',
    total: '₦9,600.00',
    payment: 'Pay at pickup',
    paid: false,
  },
];

const COMPLETED = [
  { id: '#VG-93871', time: '10:55 AM', channel: 'Pickup', total: '₦12,400.00', customer: 'Seyi Adeleke' },
  { id: '#POS-1045', time: '10:41 AM', channel: 'Dine-in', total: '₦8,900.00', customer: 'Walk-in' },
  { id: '#VG-93860', time: '10:12 AM', channel: 'Delivery', total: '₦22,100.00', customer: 'Fatima Bello' },
];

const FILTERS: Array<{ key: FilterChip; label: string; count: number }> = [
  { key: 'all', label: 'All', count: 7 },
  { key: 'new', label: 'New', count: 3 },
  { key: 'preparing', label: 'Preparing', count: 2 },
  { key: 'ready', label: 'Ready', count: 1 },
  { key: 'completed', label: 'Completed', count: 18 },
];

export function DesktopBusinessOrdersScreen({ onNav, initialView = 'orders' }: DesktopBusinessOrdersScreenProps) {
  const [view, setView] = useState<'orders' | 'bookings' | 'detail'>(initialView === 'bookings' ? 'bookings' : 'orders');
  const [tab, setTab] = useState<'orders' | 'bookings'>(initialView === 'bookings' ? 'bookings' : 'orders');
  const [filter, setFilter] = useState<FilterChip>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [branchOpen, setBranchOpen] = useState(false);
  const [attentionSilenced, setAttentionSilenced] = useState(false);
  const [acceptedAll, setAcceptedAll] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'new' | 'accepted'>('new');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  if (view === 'bookings') {
    return <DesktopBusinessBookingsScreen onNav={onNav} onOpenOrders={() => { setView('orders'); setTab('orders'); }} />;
  }

  if (view === 'detail') {
    return (
      <DesktopBusinessOrderDetailScreen
        onNav={onNav}
        onBack={() => setView('orders')}
        orderStatus={orderStatus === 'accepted' ? 'accepted' : 'new'}
        onAccept={() => { setOrderStatus('accepted'); showToast('Order #VG-94021 accepted — sent to kitchen'); }}
        onDecline={() => showToast('Decline flow opened for #VG-94021')}
      />
    );
  }

  const visibleOrders = ORDERS.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return false;
    if (filter === 'new') return o.status === 'new';
    if (filter === 'preparing') return o.status === 'preparing';
    if (filter === 'ready') return o.status === 'ready';
    return true;
  });

  return (
    <BusinessPortalChrome activeNav="orders" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-lg">
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative">
              <button
                type="button"
                onClick={() => setBranchOpen((v) => !v)}
                className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle"
              >
                <Icon name="store" className="text-[16px] text-primary" />
                Wuse II Branch
                <Icon name="expand_more" className="text-[14px]" />
              </button>
              {branchOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-surface border border-border rounded-xl shadow-lg py-2 z-20">
                  <button type="button" className="w-full px-3 py-2 text-left hover:bg-surface-subtle text-on-surface font-body-md text-body-md flex items-center justify-between">
                    Wuse II Branch <Icon name="check" filled className="text-[16px] text-primary" />
                  </button>
                  <button type="button" className="w-full px-3 py-2 text-left hover:bg-surface-subtle text-on-surface-variant font-body-md text-body-md">Maitama Branch</button>
                </div>
              )}
            </div>
            <button type="button" className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle">
              <Icon name="calendar_today" className="text-[16px] text-on-surface-variant" />
              Today, 11 Oct
            </button>
            <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
              <Icon name="restaurant" className="text-[14px]" />
              Kitchen KDS Online
            </span>
            <div className="flex-1 min-w-48 relative hidden md:block">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
              <input
                type="search"
                placeholder="Search orders…  ⌘K"
                className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </div>
            <button type="button" className="px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="receipt_long" className="text-[16px]" />
              Daily Batch Slip
            </button>
            <button type="button" onClick={() => onNav('pos')} className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm flex items-center gap-space-xs">
              <Icon name="add" className="text-[18px]" />
              New POS Order
            </button>
          </div>

          {!attentionSilenced && (
            <section className="rounded-2xl p-space-md bg-gradient-to-r from-error/10 to-surface-tint-blue border border-error/20 flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <Icon name="crisis_alert" className="text-[24px] text-error" />
                <div>
                  <div className="font-heading-sm text-heading-sm text-on-surface">3 orders need attention</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">2 unread messages • 1 unaccepted order in the next 15 minutes</div>
                </div>
              </div>
              <div className="flex items-center gap-space-sm">
                <button type="button" onClick={() => setAttentionSilenced(true)} className="px-space-sm py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface">
                  Silence
                </button>
                <button
                  type="button"
                  onClick={() => { setAcceptedAll(true); setOrderStatus('accepted'); showToast('All pending orders accepted'); }}
                  className="px-space-sm py-space-2xs rounded-lg bg-error text-on-error font-label-sm text-label-sm font-semibold hover:opacity-90"
                >
                  Accept All
                </button>
              </div>
            </section>
          )}

          {acceptedAll && (
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-xl bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm">
              <Icon name="check_circle" filled className="text-[16px]" />
              All pending orders accepted — kitchen has been notified.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center bg-surface-subtle rounded-xl p-space-2xs">
              <button
                type="button"
                onClick={() => { setTab('orders'); setView('orders'); }}
                className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors ${
                  tab === 'orders' ? 'bg-surface text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Orders
              </button>
              <button
                type="button"
                onClick={() => { setTab('bookings'); setView('bookings'); }}
                className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors ${
                  tab === 'bookings' ? 'bg-surface text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Bookings
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSortNewest((v) => !v)}
              className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-subtle"
            >
              <Icon name="swap_vert" className="text-[16px]" />
              {sortNewest ? 'Newest first' : 'Oldest first'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm border transition-colors ${
                  filter === f.key
                    ? 'bg-surface-tint-blue border-primary text-primary font-semibold'
                    : 'bg-surface border-border text-on-surface-variant hover:bg-surface-subtle'
                }`}
              >
                {f.label}
                <span className="ml-1 text-text-tertiary">({f.count})</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            <div className="xl:col-span-8 space-y-space-sm">
              {visibleOrders.map((o) => (
                <article key={o.id} className="bg-surface rounded-2xl shadow-sm border border-border p-space-md space-y-space-sm">
                  <div className="flex flex-wrap items-start justify-between gap-space-sm">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-heading-sm text-heading-sm text-on-surface">{o.id}</span>
                      <span
                        className={`px-space-2xs py-space-2xs rounded-full font-caption text-caption font-semibold ${
                          o.status === 'new'
                            ? 'bg-surface-tint-blue text-primary'
                            : o.status === 'ready'
                              ? 'bg-badge-discount-bg text-badge-discount-text'
                              : 'bg-surface-subtle text-on-surface-variant'
                        }`}
                      >
                        {orderStatus === 'accepted' && o.status === 'new' ? 'ACCEPTED — COOKING' : o.statusLabel}
                      </span>
                      <span className="px-space-2xs py-space-2xs rounded-full bg-surface-subtle text-on-surface-variant font-caption text-caption">{o.channel}</span>
                      <span className="font-body-sm text-body-sm text-text-tertiary">{o.time}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-heading-sm text-heading-sm text-on-surface">{o.total}</div>
                      <div className={`font-label-sm text-label-sm ${o.paid ? 'text-badge-discount-text' : 'text-on-surface-variant'}`}>{o.payment}</div>
                    </div>
                  </div>
                  <div className="font-body-md text-body-md text-on-surface-variant">{o.customer}</div>
                  <div className="font-body-sm text-body-sm text-text-tertiary">{o.items}</div>
                  {typeof o.progress === 'number' && (
                    <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${o.progress}%` }} />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-space-sm pt-space-2xs border-t border-border">
                    <button
                      type="button"
                      onClick={() => { setOrderStatus(o.id === '#VG-94021' ? orderStatus : 'accepted'); setView('detail'); }}
                      className="px-space-sm py-space-2xs rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90"
                    >
                      View
                    </button>
                    {o.status === 'new' && (
                      <button
                        type="button"
                        onClick={() => { setOrderStatus('accepted'); showToast(`${o.id} accepted`); }}
                        className="px-space-sm py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle"
                      >
                        Accept
                      </button>
                    )}
                    {o.status === 'preparing' && (
                      <button type="button" onClick={() => showToast(`${o.id} marked ready`)} className="px-space-sm py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle">
                        Mark Ready
                      </button>
                    )}
                    {o.status === 'ready' && (
                      <button type="button" onClick={() => showToast(`${o.id} handed off`)} className="px-space-sm py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle">
                        Handed Off
                      </button>
                    )}
                    <button type="button" onClick={() => onNav('messages')} className="px-space-sm py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue">
                      Message
                    </button>
                  </div>
                </article>
              ))}

              <section className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden mt-space-md">
                <div className="px-space-md py-space-sm border-b border-border flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Completed Orders</h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">18 today</span>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-subtle border-b border-border">
                      <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant">Order</th>
                      <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant">Time</th>
                      <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant">Channel</th>
                      <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant">Customer</th>
                      <th className="px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {COMPLETED.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-subtle/50">
                        <td className="px-space-md py-space-sm font-label-md text-label-md text-on-surface">{c.id}</td>
                        <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">{c.time}</td>
                        <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">{c.channel}</td>
                        <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">{c.customer}</td>
                        <td className="px-space-md py-space-sm font-label-md text-label-md text-on-surface text-right">{c.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>

            <div className="xl:col-span-4 space-y-space-lg">
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg space-y-space-sm">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Live Metrics</h2>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Today's sales</span>
                  <span className="text-on-surface font-semibold">₦94,600</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Avg kitchen velocity</span>
                  <span className="text-on-surface">18 min / 72% on-time</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Channel split</span>
                  <span className="text-on-surface">58% Online / 42% POS</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Prep stations</span>
                  <span className="text-on-surface">Grill, Fryer, Bar — all online</span>
                </div>
                <button type="button" className="w-full mt-space-xs py-space-xs rounded-xl border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue flex items-center justify-center gap-space-2xs">
                  <Icon name="download" className="text-[16px]" />
                  Download Shift Slip
                </button>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <div className="flex items-center gap-space-xs mb-space-sm">
                  <Icon name="verified" filled className="text-[18px] text-badge-discount-text" />
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Zero-Fee Settlement</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Every completed order settles instantly to your VEMTAP wallet — no commission, no waiting period.
                </p>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-sm">Staff On Duty</h2>
                <div className="space-y-space-xs">
                  {[
                    { name: 'Chef Ibrahim', role: 'Kitchen lead', status: 'Active' },
                    { name: 'Tunde A.', role: 'Front of house', status: 'Active' },
                    { name: 'Blessing K.', role: 'Server', status: 'Break' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-space-xs rounded-lg bg-surface-subtle">
                      <div>
                        <div className="font-label-md text-label-md text-on-surface">{s.name}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{s.role}</div>
                      </div>
                      <span className={`font-label-sm text-label-sm ${s.status === 'Active' ? 'text-badge-discount-text' : 'text-on-surface-variant'}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
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
