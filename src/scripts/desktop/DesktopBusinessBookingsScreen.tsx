import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessBookingsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onOpenOrders?: () => void;
}

type FilterTab = 'all' | 'upcoming' | 'in-house' | 'completed' | 'no-show';

const DATE_STRIP = [
  { day: 'Today', date: 'Sat 11', slots: '5 bookings', active: true },
  { day: 'Sun', date: '12 Oct', slots: '2 bookings' },
  { day: 'Mon', date: '13 Oct', slots: '4 bookings' },
  { day: 'Tue', date: '14 Oct', slots: '3 bookings' },
  { day: 'Wed', date: '15 Oct', slots: '6 bookings' },
];

const FILTERS: Array<{ key: FilterTab; label: string; count: number }> = [
  { key: 'all', label: 'All', count: 5 },
  { key: 'upcoming', label: 'Upcoming', count: 4 },
  { key: 'in-house', label: 'In-house', count: 1 },
  { key: 'completed', label: 'Completed', count: 0 },
  { key: 'no-show', label: 'No-show', count: 0 },
];

const BOOKINGS = [
  {
    id: 'BK-2201',
    guest: 'Zainab Musa',
    party: 4,
    time: '2:15 PM',
    date: 'Today',
    table: 'VIP Table 2',
    notes: 'Birthday — cake at dessert',
    status: 'upcoming' as const,
    source: 'VEMTAP App',
    phone: '+234 806 112 3344',
    actions: ['check-in', 'voucher'],
  },
  {
    id: 'BK-2202',
    guest: 'Samuel Okafor',
    party: 2,
    time: '4:00 PM',
    date: 'Today',
    table: 'Window 5',
    notes: 'Anniversary',
    status: 'upcoming' as const,
    source: 'Phone',
    phone: '+234 803 998 2210',
    actions: ['check-in'],
  },
  {
    id: 'BK-2203',
    guest: 'Halima Yusuf',
    party: 6,
    time: '5:15 PM',
    date: 'Today',
    table: 'Booth B',
    notes: 'Prefers quiet corner',
    status: 'upcoming' as const,
    source: 'VEMTAP App',
    phone: '+234 812 445 0091',
    actions: ['check-in', 'sms'],
  },
  {
    id: 'BK-2204',
    guest: 'Emeka Nwosu',
    party: 3,
    time: '6:30 PM',
    date: 'Today',
    table: 'Terrace 1',
    notes: 'Outdoor seating',
    status: 'upcoming' as const,
    source: 'Walk-in',
    phone: '+234 701 220 4455',
    actions: ['check-in'],
  },
  {
    id: 'BK-2205',
    guest: 'Dr. Chidi Eze',
    party: 8,
    time: '7:30 PM',
    date: 'Today',
    table: 'Private Dining',
    notes: 'Corporate dinner — invoice later',
    status: 'upcoming' as const,
    source: 'VEMTAP App',
    phone: '+234 809 331 7788',
    actions: ['seat', 'check-in'],
  },
];

const SLOTS = [
  { time: '12 PM', bookings: 1, tables: 2 },
  { time: '1 PM', bookings: 0, tables: 0 },
  { time: '2 PM', bookings: 1, tables: 1 },
  { time: '3 PM', bookings: 0, tables: 0 },
  { time: '4 PM', bookings: 1, tables: 1 },
  { time: '5 PM', bookings: 1, tables: 2 },
  { time: '6 PM', bookings: 1, tables: 3 },
  { time: '7 PM', bookings: 1, tables: 4 },
];

const STAFF = [
  { name: 'Tunde A.', role: 'Host', status: 'On floor', color: 'text-badge-discount-text' },
  { name: 'Blessing K.', role: 'Server — Booth B', status: 'Seating', color: 'text-primary' },
  { name: 'Chef Ibrahim', role: 'Kitchen', status: 'Prepping', color: 'text-on-surface-variant' },
];

export function DesktopBusinessBookingsScreen({ onNav, onOpenOrders }: DesktopBusinessBookingsScreenProps) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<Record<string, boolean>>({});
  const [seated, setSeated] = useState<Record<string, boolean>>({});
  const [chimeOn, setChimeOn] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const filtered = BOOKINGS.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search && !b.guest.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <BusinessPortalChrome activeNav="orders-bookings" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-sm">
              <button type="button" className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle">
                <Icon name="store" className="text-[16px] text-primary" />
                Wuse II Branch
                <Icon name="expand_more" className="text-[14px]" />
              </button>
              <div className="flex items-center bg-surface-subtle rounded-xl p-space-2xs">
                <button type="button" onClick={onOpenOrders} className="px-space-sm py-space-2xs rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface">
                  Orders
                </button>
                <button type="button" className="px-space-sm py-space-2xs rounded-lg bg-surface text-primary font-label-sm text-label-sm font-semibold shadow-sm">
                  Bookings
                </button>
              </div>
              <button type="button" className="px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle flex items-center gap-space-2xs">
                <Icon name="calendar_month" className="text-[16px]" />
                Full Calendar
              </button>
            </div>
            <button
              type="button"
              onClick={() => setManualOpen(true)}
              className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm flex items-center gap-space-xs"
            >
              <Icon name="add" className="text-[18px]" />
              New Manual Booking
            </button>
          </div>

          <div className="flex items-center gap-space-sm overflow-x-auto pb-space-2xs">
            {DATE_STRIP.map((d) => (
              <button
                key={d.date}
                type="button"
                className={`flex-shrink-0 px-space-md py-space-xs rounded-xl border text-left transition-colors ${
                  d.active ? 'border-primary bg-surface-tint-blue' : 'border-border bg-surface hover:bg-surface-subtle'
                }`}
              >
                <div className={`font-label-md text-label-md ${d.active ? 'text-primary font-semibold' : 'text-on-surface'}`}>{d.day}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">{d.date}</div>
                <div className={`font-caption text-caption ${d.active ? 'text-primary' : 'text-text-tertiary'}`}>{d.slots}</div>
              </button>
            ))}
            <span className="flex-shrink-0 flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm ml-space-sm">
              <Icon name="sync" className="text-[14px]" />
              Live POS Sync
            </span>
          </div>

          <section className="rounded-2xl p-space-md bg-gradient-to-r from-primary to-primary-container text-on-primary flex flex-wrap items-center justify-between gap-space-md shadow-sm">
            <div className="flex items-center gap-space-md">
              <Icon name="event_available" filled className="text-[28px]" />
              <div>
                <div className="font-heading-sm text-heading-sm">5 Bookings Today</div>
                <div className="font-body-sm text-body-sm text-on-primary/90">Next seating in 35 minutes — Zainab Musa (Party of 4)</div>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={() => setChimeOn((v) => !v)}
                className={`flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm ${
                  chimeOn ? 'bg-surface text-primary' : 'bg-on-primary/20 text-on-primary'
                }`}
              >
                <Icon name={chimeOn ? 'notifications_active' : 'notifications_off'} className="text-[14px]" />
                Chime {chimeOn ? 'On' : 'Off'}
              </button>
              <button type="button" className="px-space-sm py-space-2xs rounded-full bg-surface text-primary font-label-sm text-label-sm font-semibold">
                Focus Next Client
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            <div className="xl:col-span-8 space-y-space-lg">
              <div className="flex flex-wrap items-center gap-space-sm">
                <div className="flex items-center gap-space-xs bg-surface-subtle rounded-xl p-space-2xs">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className={`px-space-sm py-space-2xs rounded-lg font-label-sm text-label-sm transition-colors ${
                        filter === f.key ? 'bg-surface text-on-surface font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {f.label} <span className="text-text-tertiary">({f.count})</span>
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-w-48 relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search guest or booking ID…"
                    className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <section className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border bg-surface-subtle">
                        <th className="px-space-md py-space-sm font-label-sm text-label-sm text-on-surface-variant">Guest</th>
                        <th className="px-space-md py-space-sm font-label-sm text-label-sm text-on-surface-variant">Time</th>
                        <th className="px-space-md py-space-sm font-label-sm text-label-sm text-on-surface-variant">Party</th>
                        <th className="px-space-md py-space-sm font-label-sm text-label-sm text-on-surface-variant">Table</th>
                        <th className="px-space-md py-space-sm font-label-sm text-label-sm text-on-surface-variant">Notes</th>
                        <th className="px-space-md py-space-sm font-label-sm text-label-sm text-on-surface-variant">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-subtle/50">
                          <td className="px-space-md py-space-sm">
                            <div className="font-label-md text-label-md text-on-surface font-medium">{b.guest}</div>
                            <div className="font-caption text-caption text-text-tertiary">{b.id} • {b.source}</div>
                          </td>
                          <td className="px-space-md py-space-sm font-body-md text-body-md text-on-surface">{b.time}</td>
                          <td className="px-space-md py-space-sm font-body-md text-body-md text-on-surface">{b.party}</td>
                          <td className="px-space-md py-space-sm font-body-md text-body-md text-on-surface">{b.table}</td>
                          <td className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant max-w-40 truncate">{b.notes}</td>
                          <td className="px-space-md py-space-sm">
                            <div className="flex flex-wrap items-center gap-space-2xs">
                              {b.actions.includes('check-in') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCheckedIn((s) => ({ ...s, [b.id]: true }));
                                    showToast(`${b.guest} checked in`);
                                  }}
                                  disabled={checkedIn[b.id]}
                                  className={`px-space-xs py-space-2xs rounded-lg font-label-sm text-label-sm transition-colors ${
                                    checkedIn[b.id]
                                      ? 'bg-badge-discount-bg text-badge-discount-text cursor-default'
                                      : 'bg-primary text-on-primary hover:opacity-90'
                                  }`}
                                >
                                  {checkedIn[b.id] ? 'Checked In' : 'Check-In'}
                                </button>
                              )}
                              {b.actions.includes('seat') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSeated((s) => ({ ...s, [b.id]: true }));
                                    showToast(`Party of ${b.party} seated at ${b.table}`);
                                  }}
                                  disabled={seated[b.id]}
                                  className={`px-space-xs py-space-2xs rounded-lg font-label-sm text-label-sm transition-colors ${
                                    seated[b.id]
                                      ? 'bg-badge-discount-bg text-badge-discount-text cursor-default'
                                      : 'bg-primary text-on-primary hover:opacity-90'
                                  }`}
                                >
                                  {seated[b.id] ? 'Seated' : 'Seat Party'}
                                </button>
                              )}
                              {b.actions.includes('voucher') && (
                                <button
                                  type="button"
                                  onClick={() => setVoucherOpen(true)}
                                  className="px-space-xs py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue"
                                >
                                  View Voucher
                                </button>
                              )}
                              {b.actions.includes('sms') && (
                                <button
                                  type="button"
                                  onClick={() => showToast(`SMS sent to ${b.phone}`)}
                                  className="px-space-xs py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue"
                                >
                                  SMS
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-space-md py-space-xl text-center font-body-md text-body-md text-on-surface-variant">
                            No bookings match this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-space-md py-space-sm border-t border-border flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Showing {filtered.length} of {BOOKINGS.length} bookings</span>
                  <span>Tables seated: 2 / 14</span>
                </div>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-md">Hourly Slot Heatmap</h2>
                <div className="grid grid-cols-8 gap-space-xs">
                  {SLOTS.map((s) => {
                    const intensity = s.bookings === 0 ? 'bg-surface-subtle' : s.tables >= 3 ? 'bg-primary text-on-primary' : s.tables >= 2 ? 'bg-primary/60 text-on-primary' : 'bg-primary/25 text-on-surface';
                    return (
                      <div key={s.time} className={`rounded-xl p-space-xs text-center ${intensity}`}>
                        <div className="font-label-sm text-label-sm font-semibold">{s.time}</div>
                        <div className="font-caption text-caption">{s.bookings} bkgs</div>
                        <div className="font-caption text-caption opacity-80">{s.tables} tables</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="xl:col-span-4 space-y-space-lg">
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-md">Staff On Duty</h2>
                <div className="space-y-space-sm">
                  {STAFF.map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-space-sm rounded-xl bg-surface-subtle">
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-medium">{s.name}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{s.role}</div>
                      </div>
                      <span className={`font-label-sm text-label-sm font-medium ${s.color}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <div className="flex items-center gap-space-xs mb-space-sm">
                  <Icon name="verified" filled className="text-[18px] text-badge-discount-text" />
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Zero Commission</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Bookings taken here settle straight to your wallet — VEMTAP never takes a cut of your table revenue.
                </p>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg space-y-space-sm">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Integrations</h2>
                {[
                  { icon: 'upload_file', label: 'Import CSV', meta: 'Bulk load reservations' },
                  { icon: 'event', label: 'Google Calendar', meta: 'Two-way sync' },
                  { icon: 'description', label: 'Print Runsheet', meta: 'Daily shift sheet' },
                ].map((i) => (
                  <button key={i.label} type="button" className="w-full flex items-center gap-space-sm p-space-sm rounded-xl border border-border hover:bg-surface-subtle text-left">
                    <Icon name={i.icon} className="text-[20px] text-primary" />
                    <div>
                      <div className="font-label-md text-label-md text-on-surface">{i.label}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{i.meta}</div>
                    </div>
                  </button>
                ))}
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg text-center space-y-space-sm">
                <Icon name="qr_code_2" className="text-[48px] text-on-surface mx-auto" />
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Reception QR</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Guests scan to self check-in. Prints to host tablet automatically.
                </p>
                <button type="button" onClick={() => showToast('QR poster sent to printer')} className="w-full py-space-xs rounded-xl border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue">
                  Print QR Poster
                </button>
              </section>
            </div>
          </div>
        </div>

        {voucherOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-space-md" onClick={() => setVoucherOpen(false)}>
            <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-space-lg space-y-space-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading-md text-heading-md text-on-surface">Birthday Voucher</h2>
                <button type="button" aria-label="Close" onClick={() => setVoucherOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle">
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
              <div className="p-space-md rounded-xl border-2 border-dashed border-primary bg-surface-tint-blue/30 text-center space-y-space-2xs">
                <div className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Zainab Musa • BK-2201</div>
                <div className="font-heading-lg text-heading-lg text-primary">FREE Dessert</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Valid today only • Party of 4</div>
                <div className="font-mono text-body-md text-on-surface pt-space-xs">VT-VCH-77291</div>
              </div>
              <button type="button" onClick={() => { setVoucherOpen(false); showToast('Voucher redeemed'); }} className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md">
                Redeem Voucher
              </button>
            </div>
          </div>
        )}

        {manualOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-space-md" onClick={() => setManualOpen(false)}>
            <div className="bg-surface rounded-2xl shadow-xl max-w-lg w-full p-space-lg space-y-space-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading-md text-heading-md text-on-surface">New Manual Booking</h2>
                <button type="button" aria-label="Close" onClick={() => setManualOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-subtle">
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                {[
                  { label: 'Guest name', placeholder: 'Full name', span: true },
                  { label: 'Phone', placeholder: '+234…' },
                  { label: 'Party size', placeholder: '2' },
                  { label: 'Date', placeholder: 'Sat 11 Oct' },
                  { label: 'Time', placeholder: '7:00 PM' },
                  { label: 'Table preference', placeholder: 'Any', span: true },
                  { label: 'Notes', placeholder: 'Occasion, allergies…', span: true },
                ].map((f) => (
                  <label key={f.label} className={`space-y-space-2xs ${f.span ? 'col-span-2' : ''}`}>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{f.label}</span>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      className="w-full h-11 px-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                    />
                  </label>
                ))}
              </div>
              <div className="flex gap-space-sm">
                <button type="button" onClick={() => setManualOpen(false)} className="flex-1 h-11 rounded-xl border border-border font-label-md text-label-md text-on-surface hover:bg-surface-subtle">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { setManualOpen(false); showToast('Manual booking created'); }}
                  className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90"
                >
                  Create Booking
                </button>
              </div>
            </div>
          </div>
        )}

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
