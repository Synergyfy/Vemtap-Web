import { useRef, useState } from 'react';
import { FilterMenu } from '../../components/FilterMenu';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { MessagesAttachmentButton } from './MessagesAttachmentButton';
import { MessagesChatActions } from './MessagesChatActions';
import { MessagesShareAttachmentModal } from './MessagesShareAttachmentModal';
import { MessagesSelectRecipientModal } from './MessagesSelectRecipientModal';
import type { MessagesWorkspaceView } from './DesktopBusinessMessagesOrderContextScreen';

interface DesktopBusinessMessagesBookingScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onView: (view: MessagesWorkspaceView) => void;
  /** Opens the customer's full CRM profile (Customers page) from the chat header menu. */
  onViewCustomerProfile?: (name: string) => void;
}

type ThreadFilter = 'all' | 'bookings' | 'orders' | 'deals';

interface GuestThread {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  preview: string;
  time: string;
  unread: number;
  badge?: string;
  channel: ThreadFilter;
}

const THREADS: GuestThread[] = [
  {
    id: 't1',
    name: 'Dr. Chidi Okafor',
    initials: 'CO',
    preview: 'Table 08/09 merge confirmed — see you at 7:30.',
    time: '9:18 AM',
    unread: 1,
    badge: 'BK-77402',
    channel: 'bookings',
  },
  {
    id: 't2',
    name: 'Michael James',
    initials: 'MJ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkg9vSBZAqdcLqsKrI-vPk5IMlaP3d1iZTqQnDtmvgIQObdVyWAGgfUGsmdu6Wgv334gudx8U_w1HiwnJGk4wMObTNTqv90-nXlFDH0vgZ3oUb8o-d26kai20qTZW3bisdAjssax58TYaZ64OP4IfGZtYyzHXeL6nmGWI4ohAtRjsswr_9SJdFQZuTOPYOnsm_R9t4pfEQvu5z5-NmuH8xHrH0QxA2sSXlsP6BSsazWFJTqJuKGrHW_g',
    preview: 'Is the 2019 Cabernet still by the glass?',
    time: '9:02 AM',
    unread: 0,
    badge: 'VG-94021',
    channel: 'orders',
  },
  {
    id: 't3',
    name: 'Sarah Adams',
    initials: 'SA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB-Xjt2yU9KoW80OqiT5QTHaJF_VRXqkLOMz6gTp2nbol94ih89z50F6yQaAogksU1ejODmqd9RLuHgfJSYliJpthg2Wz5IQNBkzlNe-PIPHaNvlkEgz4V-uu9bQ30CjyqOQHlKR_b3EWXf-MEuLkDv43_3mXLjeMx9ABjik0st2w8NDP0QKiY2K-MCdNAPguYBjF9PjTvdyjEnhRwBE8mgF239kTIlXgKwUES6Zk3',
    preview: 'Deal still active for tonight?',
    time: '8:44 AM',
    unread: 2,
    badge: 'VT-48F261',
    channel: 'deals',
  },
  {
    id: 't4',
    name: 'Amina Bello',
    initials: 'AB',
    preview: 'Pickup in 10 minutes — thanks!',
    time: 'Yesterday',
    unread: 0,
    badge: 'VG-93998',
    channel: 'orders',
  },
  {
    id: 't5',
    name: 'Zainab Musa',
    initials: 'ZM',
    preview: 'Birthday table for 4 still good?',
    time: 'Yesterday',
    unread: 0,
    badge: 'BK-2201',
    channel: 'bookings',
  },
];

const FILTERS: Array<{ key: ThreadFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'orders', label: 'Orders' },
  { key: 'deals', label: 'Deals' },
];

const QUICK_ACTIONS = [
  { icon: 'event', label: 'Reschedule Booking', view: null },
  { icon: 'swap_horiz', label: 'Merge Tables 08/09', view: null },
  { icon: 'receipt_long', label: 'Push POS Receipt', view: null },
  { icon: 'loyalty', label: 'Send Tap Points', view: null },
] as const;

export function DesktopBusinessMessagesBookingScreen({ onNav, onView, onViewCustomerProfile }: DesktopBusinessMessagesBookingScreenProps) {
  const [selectedId, setSelectedId] = useState('t1');
  const [filter, setFilter] = useState<ThreadFilter>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [extraMessages, setExtraMessages] = useState<Array<{ id: string; text: string; time: string }>>([]);
  const [chime, setChime] = useState(true);
  const [showRecipient, setShowRecipient] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  const filtered = THREADS.filter((t) => {
    if (filter !== 'all' && t.channel !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.preview.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = THREADS.find((t) => t.id === selectedId) ?? THREADS[0];

  const send = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setExtraMessages((prev) => [...prev, { id: `m${Date.now()}`, text: trimmed, time: 'Just now' }]);
    setDraft('');
    window.setTimeout(() => streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' }), 50);
  };

  return (
    <BusinessPortalChrome activeNav="messages" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-md border-b border-border bg-surface flex flex-wrap items-center justify-between gap-space-md">
          <div className="min-w-0">
            <div className="font-label-sm text-label-sm text-text-tertiary">Messages / Booking Continuity</div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Booking &amp; Multi-Context Continuity</h1>
              <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                POS Terminal #02 Connected
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              aria-label={chime ? 'Mute chime' : 'Enable chime'}
              onClick={() => setChime((v) => !v)}
              className={`h-9 px-space-sm rounded-xl border font-label-sm text-label-sm flex items-center gap-space-2xs transition-colors ${
                chime ? 'border-primary bg-surface-tint-blue text-primary font-semibold' : 'border-border text-on-surface-variant hover:bg-surface-subtle'
              }`}
            >
              <Icon name={chime ? 'notifications_active' : 'notifications_off'} className="text-[16px]" filled={chime} />
              Chime
            </button>
            <button type="button" onClick={() => setShowRecipient(true)} className="h-9 px-space-sm rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 flex items-center gap-space-2xs shadow-sm">
              <Icon name="edit" className="text-[16px]" />
              New Message
            </button>
            <button type="button" onClick={() => onView('search')} className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="search" className="text-[16px]" />
              Search
            </button>
            <button type="button" onClick={() => onView('compose')} className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="drafts" className="text-[16px]" />
              Compose
            </button>
          </div>
        </div>

        <div className="w-full py-space-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md" style={{ height: 'calc(100vh - 140px)', minHeight: '720px' }}>
            <aside className="lg:col-span-4 xl:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border space-y-space-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Guest Inquiries</h2>
                  <span className="px-space-2xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">5 Active</span>
                </div>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search guests…"
                    className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface-subtle font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
                  {/* Mirrors the chip row below so the header control filters too. */}
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <FilterMenu
                      align="right"
                      ariaLabel="Filter threads"
                      buttonClassName="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle"
                      choices={FILTERS.map((f) => ({ value: f.key, label: f.label }))}
                      icon="tune"
                      iconClassName="text-[16px]"
                      label={null}
                      onChange={(next) => setFilter(next as ThreadFilter)}
                      title="Filter threads"
                      value={filter}
                    />
                  </span>
                </div>
                <div className="flex flex-wrap gap-space-2xs">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm border transition-colors ${
                        filter === f.key ? 'bg-surface-tint-blue border-primary text-primary font-semibold' : 'bg-surface border-border text-on-surface-variant hover:bg-surface-subtle'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {filtered.map((t) => {
                  const active = t.id === selectedId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={`w-full text-left p-space-sm flex gap-space-sm transition-colors ${active ? 'bg-surface-tint-blue shadow-[inset_3px_0_0_0_#0055c4]' : 'hover:bg-surface-subtle'}`}
                    >
                      {t.avatar ? (
                        <img src={t.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-label-md text-label-md shrink-0">{t.initials}</span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-space-xs">
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">{t.name}</span>
                          <span className="font-caption text-caption text-text-tertiary shrink-0">{t.time}</span>
                        </span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant truncate">{t.preview}</span>
                        {t.badge && (
                          <span className="inline-block mt-1 px-space-2xs py-space-2xs rounded bg-surface-subtle font-caption text-caption text-on-surface-variant">#{t.badge}</span>
                        )}
                      </span>
                      {t.unread > 0 && (
                        <span className="w-5 h-5 bg-error text-on-error rounded-full font-caption text-caption flex items-center justify-center font-semibold shrink-0 self-center">{t.unread}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-space-xs border-t border-border flex items-center justify-between font-caption text-caption text-text-tertiary">
                <span className="flex items-center gap-space-2xs"><span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" /> Realtime Gateway</span>
                <span>Cluster LAG-01</span>
              </div>
            </aside>

            <section className="lg:col-span-8 xl:col-span-6 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="px-space-sm py-space-2xs border-b border-border bg-surface-subtle/50 flex items-center justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Synced with POS &amp; Table Floor Master</span>
                <button type="button" className="flex items-center gap-space-2xs font-label-sm text-label-sm text-primary hover:underline">
                  <Icon name="sync" className="text-[14px]" />
                  Force Refresh
                </button>
              </div>

              <div className="p-space-md border-b border-border flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  {selected.avatar ? (
                    <img src={selected.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-label-md text-label-md">{selected.initials}</span>
                  )}
                  <div className="min-w-0">
                    <div className="font-heading-sm text-heading-sm text-on-surface truncate">{selected.name}</div>
                    <div className="font-caption text-caption text-on-surface-variant">Booking host · Multi-context thread</div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <MessagesChatActions
                    customerName={selected.name}
                    onViewProfile={() => onViewCustomerProfile?.(selected.name)}
                    onSearch={() => onView('search')}
                  />
                </div>
              </div>

              <div className="px-space-md py-space-xs border-b border-border bg-surface-tint-blue/40 flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="event" className="text-[16px] text-primary shrink-0" filled />
                  <span className="font-label-sm text-label-sm text-on-surface truncate">
                    Pinned booking <span className="text-primary font-semibold">#BK-77402</span>
                    <span className="text-on-surface-variant"> · Host note: anniversary dinner, quiet corner</span>
                  </span>
                </div>
                <button type="button" className="font-label-sm text-label-sm text-primary hover:underline shrink-0">POS Synced</button>
              </div>

              <div ref={streamRef} className="flex-1 overflow-y-auto p-space-md space-y-space-sm bg-surface-subtle/30">
                <div className="flex justify-center">
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface border border-border font-caption text-caption text-text-tertiary">Previous Context: Product Inquiry • Oct 10</span>
                </div>

                <div className="flex gap-space-xs justify-start">
                  {selected.avatar ? (
                    <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-caption text-caption self-end">{selected.initials}</span>
                  )}
                  <div className="max-w-[75%]">
                    <div className="rounded-2xl rounded-bl-md border border-border bg-surface overflow-hidden">
                      <div className="flex gap-space-sm p-space-sm">
                        <img
                          src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=200&fit=crop"
                          alt="Wine bottle"
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div>
                          <div className="font-label-md text-label-md text-on-surface">Reserve Cabernet Sauvignon 2019</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">By the glass · ₦6,800</div>
                          <div className="font-caption text-caption text-badge-discount-text font-semibold mt-0.5">In stock · 14 bottles</div>
                        </div>
                      </div>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1">Oct 10, 6:12 PM</div>
                  </div>
                </div>

                <div className="flex gap-space-xs justify-end">
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                      <p className="font-body-md text-body-md">Absolutely — we still have the 2019 by the glass. Would you like me to hold a bottle for your Friday table?</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                      Oct 10, 6:14 PM
                      <Icon name="done_all" className="text-[14px] text-primary" filled />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface border border-border font-caption text-caption text-text-tertiary">TODAY · Oct 11, 2025</span>
                </div>

                <div className="flex gap-space-xs justify-start">
                  {selected.avatar ? (
                    <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-caption text-caption self-end">{selected.initials}</span>
                  )}
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border text-on-surface">
                      <p className="font-body-md text-body-md">Perfect. Also — can we merge tables 08 and 09 for our party of 8 this Friday at 7:30 PM?</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1">9:14 AM</div>
                  </div>
                </div>

                <div className="flex gap-space-xs justify-end">
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                      <p className="font-body-md text-body-md">Done — Tables 08 &amp; 09 are merged for #BK-77402. Anniversary note added to the floor plan. Pre-order the tasting menu?</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                      9:16 AM
                      <Icon name="done_all" className="text-[14px] text-primary" filled />
                      <span className="px-space-2xs rounded bg-badge-discount-bg text-badge-discount-text font-semibold">Item Pre-linked</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-space-xs justify-start">
                  {selected.avatar ? (
                    <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-caption text-caption self-end">{selected.initials}</span>
                  )}
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border text-on-surface">
                      <p className="font-body-md text-body-md">Yes please — send the tasting menu and we&apos;ll pre-select. See you Friday!</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1">9:18 AM</div>
                  </div>
                </div>

                {extraMessages.map((m) => (
                  <div key={m.id} className="flex gap-space-xs justify-end">
                    <div className="max-w-[75%]">
                      <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                        <p className="font-body-md text-body-md">{m.text}</p>
                      </div>
                      <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                        {m.time}
                        <Icon name="done_all" className="text-[14px] text-primary" filled />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-space-sm border-t border-border space-y-space-xs">
                <div className="flex flex-wrap gap-space-2xs">
                  {QUICK_ACTIONS.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => { if (a.label.includes('Reschedule')) setDraft('I can move your booking — which new time works best?'); }}
                      className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-tint-blue hover:text-primary transition-colors"
                    >
                      <Icon name={a.icon} className="text-[12px] text-primary" />
                      {a.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-end gap-space-xs">
                  <MessagesAttachmentButton
                    renderModal={(close) => <MessagesShareAttachmentModal onClose={close} />}
                  />
                  <textarea
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={`Message ${selected.name}…`}
                    className="flex-1 px-space-sm py-space-xs rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
                  />
                  <button
                    type="button"
                    onClick={send}
                    disabled={!draft.trim()}
                    className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-space-2xs"
                  >
                    <Icon name="send" className="text-[18px]" />
                    Send
                  </button>
                </div>
                <div className="font-caption text-caption text-text-tertiary text-right">Press Enter to send • Shift+Enter for new line · Live on Diner App</div>
              </div>
            </section>

            <aside className="hidden xl:flex lg:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border flex items-center justify-between">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Reservation Dossier</h2>
                <span className="px-space-2xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">CONFIRMED</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Party Configuration</div>
                  <div className="grid grid-cols-2 gap-space-xs">
                    <div className="p-space-xs rounded-xl bg-surface-subtle border border-border">
                      <div className="font-caption text-caption text-on-surface-variant">Guests</div>
                      <div className="font-heading-sm text-heading-sm text-on-surface">8</div>
                    </div>
                    <div className="p-space-xs rounded-xl bg-surface-subtle border border-border">
                      <div className="font-caption text-caption text-on-surface-variant">Host</div>
                      <div className="font-heading-sm text-heading-sm text-on-surface">Dr. O.</div>
                    </div>
                  </div>
                  <div className="mt-space-xs rounded-xl border border-border bg-surface-subtle/50 p-space-xs">
                    <div className="font-caption text-caption text-on-surface-variant mb-space-2xs">Floor plan · Table 08/09 merge</div>
                    <svg viewBox="0 0 200 80" className="w-full h-16" aria-hidden="true">
                      <rect x="10" y="15" width="70" height="50" rx="6" fill="#EEF5FF" stroke="#0055c4" strokeWidth="1.5" />
                      <rect x="85" y="15" width="70" height="50" rx="6" fill="#EEF5FF" stroke="#0055c4" strokeWidth="1.5" />
                      <text x="45" y="44" textAnchor="middle" fontSize="11" fill="#0055c4" fontWeight="600">08</text>
                      <text x="120" y="44" textAnchor="middle" fontSize="11" fill="#0055c4" fontWeight="600">09</text>
                      <circle cx="185" cy="40" r="8" fill="#066cf4" />
                      <text x="185" y="44" textAnchor="middle" fontSize="8" fill="#fff">H</text>
                    </svg>
                  </div>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Schedule &amp; Arrival</div>
                  <div className="space-y-space-2xs font-body-sm text-body-sm">
                    {[
                      { label: 'Date', value: 'Fri, Oct 17, 2025' },
                      { label: 'Time', value: '7:30 PM' },
                      { label: 'ETA', value: '7:20 PM (early)' },
                      { label: 'Duration', value: '2h 30m est.' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center justify-between">
                        <span className="text-on-surface-variant">{r.label}</span>
                        <span className="text-on-surface font-medium">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Pre-Ordered Items</div>
                  <ul className="space-y-space-2xs font-body-sm text-body-sm">
                    <li className="flex items-center justify-between">
                      <span className="text-on-surface">Tasting Menu × 8</span>
                      <span className="text-on-surface-variant">₦48,000</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-on-surface">Cabernet 2019 × 2</span>
                      <span className="text-on-surface-variant">₦13,600</span>
                    </li>
                  </ul>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Special Instructions</div>
                  <div className="rounded-xl border border-primary/30 bg-surface-tint-blue/50 p-space-xs font-body-sm text-body-sm text-on-surface">
                    Anniversary dinner — quiet corner, no shellfish, invoice to firm. Cake at dessert service.
                  </div>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Diner Lifetime Value</div>
                  <div className="font-heading-md text-heading-md text-on-surface">₦680,500</div>
                  <div className="font-caption text-caption text-badge-discount-text font-semibold">0.0% no-show rate</div>
                </div>
              </div>

              <div className="p-space-xs border-t border-border grid grid-cols-3 gap-space-2xs">
                <button type="button" className="h-10 rounded-lg border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle">Reschedule</button>
                <button type="button" className="h-10 rounded-lg border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle">Print Card</button>
                <button type="button" className="h-10 rounded-lg border border-error/40 text-error font-label-sm text-label-sm hover:bg-error/10">Cancel</button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showRecipient && (
        <MessagesSelectRecipientModal
          onClose={() => setShowRecipient(false)}
          onStartChat={() => onView('compose')}
        />
      )}
    </BusinessPortalChrome>
  );
}
