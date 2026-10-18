import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { MessagesAttachmentButton } from './MessagesAttachmentButton';
import { MessagesChatActions } from './MessagesChatActions';
import { MessagesShareAttachmentModal } from './MessagesShareAttachmentModal';
import { MessagesSelectRecipientModal } from './MessagesSelectRecipientModal';

export type MessagesWorkspaceView =
  | 'order-context'
  | 'compose'
  | 'booking'
  | 'deal'
  | 'search';

interface DesktopBusinessMessagesOrderContextScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onView: (view: MessagesWorkspaceView) => void;
  /** Opens the customer's full CRM profile (Customers page) from the chat header menu. */
  onViewCustomerProfile?: (name: string) => void;
}

type ConvFilter = 'all' | 'unread' | 'orders' | 'bookings' | 'deals';

interface OrderConv {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread: number;
  status: string;
  statusTone: string;
  tags: string[];
  channel: ConvFilter;
  online: boolean;
  prep: boolean;
}

const CONVS: OrderConv[] = [
  {
    id: 'c1',
    name: 'Michael James',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkg9vSBZAqdcLqsKrI-vPk5IMlaP3d1iZTqQnDtmvgIQObdVyWAGgfUGsmdu6Wgv334gudx8U_w1HiwnJGk4wMObTNTqv90-nXlFDH0vgZ3oUb8o-d26kai20qTZW3bisdAjssax58TYaZ64OP4IfGZtYyzHXeL6nmGWI4ohAtRjsswr_9SJdFQZuTOPYOnsm_R9t4pfEQvu5z5-NmuH8xHrH0QxA2sSXlsP6BSsazWFJTqJuKGrHW_g',
    preview: 'Perfect — can I get extra pepper sauce?',
    time: '2 min',
    unread: 2,
    status: 'Active Prep',
    statusTone: 'bg-badge-discount-bg text-badge-discount-text',
    tags: ['Order #VG-94021', 'VIP'],
    channel: 'orders',
    online: true,
    prep: true,
  },
  {
    id: 'c2',
    name: 'Sarah Adams',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB-Xjt2yU9KoW80OqiT5QTHaJF_VRXqkLOMz6gTp2nbol94ih89z50F6yQaAogksU1ejODmqd9RLuHgfJSYliJpthg2Wz5IQNBkzlNe-PIPHaNvlkEgz4V-uu9bQ30CjyqOQHlKR_b3EWXf-MEuLkDv43_3mXLjeMx9ABjik0st2w8NDP0QKiY2K-MCdNAPguYBjF9PjTvdyjEnhRwBE8mgF239kTIlXgKwUES6Zk3',
    preview: 'Is the Truffle Fries deal still available?',
    time: '8 min',
    unread: 0,
    status: 'Deal Active',
    statusTone: 'bg-surface-tint-blue text-primary',
    tags: ['Deal #VT-48F261'],
    channel: 'deals',
    online: true,
    prep: false,
  },
  {
    id: 'c3',
    name: 'Amina Bello',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvPDiI1HY_kmgTwi-eVu0GLT8lvuFgOzG95QeQsUfatbuVmwj7kwKYeDUbbtr4EETbCZ_ejNMg6uBgyFxG_cn1uFJdwfCGTLAbCrZmd_GUlKdL8a97NwwfSIniiMVcdGRdWhM-IaPabMr2rOnyZ2RBo-cuPE43VbYg3vbAj21b0Y3a8_2y8n0mHkISpOptF2Uwtd6MA-LOZ_IaShQ2R67xbK2Cpn-xuuNmgk7LHQwT',
    preview: 'On my way for pickup now.',
    time: '15 min',
    unread: 1,
    status: 'Pickup ETA 12m',
    statusTone: 'bg-badge-discount-bg text-badge-discount-text',
    tags: ['Order #VG-93998'],
    channel: 'orders',
    online: false,
    prep: false,
  },
  {
    id: 'c4',
    name: 'Dr. Chidi Okafor',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_QV6uRZyyO54NZ_xP-h2bJ8ASlYYKyHrhcifuXhWq8-8e8k7vVjQp92ikYv3cH5MH1U3mE-cqvqgIrgvoTD-_3v0kflAwqqy8Epu7Gxy7JGLPfKzbysfHasIYlfBSpqOZTvvLMf7DdGcoLZHsJdXHYXPoe6YzKvM1VfQBm0hKUBoocqfb1jEx0XIwvHG3Cu3MbVVrfoRPKvM2x6jDPEgCeLL7VDkEoBDmTl5tggWL',
    preview: 'Private dining for 8 at 7:30 PM.',
    time: '1 hr',
    unread: 0,
    status: 'Booking BK-77402',
    statusTone: 'bg-surface-tint-blue text-primary',
    tags: ['Booking', 'Corporate'],
    channel: 'bookings',
    online: false,
    prep: false,
  },
];

const FILTERS: Array<{ key: ConvFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'orders', label: 'Orders' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'deals', label: 'Deals' },
];

const DOSSIER_NOTES = [
  { label: 'Preferred station', value: 'Grill Station', icon: 'kitchen' },
  { label: 'Last visit', value: 'Oct 8, 2025', icon: 'history' },
  { label: 'Favorite item', value: 'Truffle Fries', icon: 'restaurant' },
  { label: 'Allergies', value: 'None on file', icon: 'health_and_safety' },
];

export function DesktopBusinessMessagesOrderContextScreen({ onNav, onView, onViewCustomerProfile }: DesktopBusinessMessagesOrderContextScreenProps) {
  const [selectedId, setSelectedId] = useState('c1');
  const [filter, setFilter] = useState<ConvFilter>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [showRecipient, setShowRecipient] = useState(false);
  const [extraMessages, setExtraMessages] = useState<Array<{ id: string; text: string; time: string }>>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [muted, setMuted] = useState(false);
  const [transferred, setTransferred] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close the message-filter menu on outside click or Escape.
  useEffect(() => {
    if (!settingsOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setSettingsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [settingsOpen]);

  /** A conversation stays unread until it is marked read from the filters menu. */
  const unreadOf = (c: OrderConv) => (readIds.has(c.id) ? 0 : c.unread);

  const filtered = CONVS.filter((c) => {
    if (filter === 'unread' && unreadOf(c) === 0) return false;
    if (filter === 'orders' && c.channel !== 'orders') return false;
    if (filter === 'bookings' && c.channel !== 'bookings') return false;
    if (filter === 'deals' && c.channel !== 'deals') return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.preview.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = CONVS.find((c) => c.id === selectedId) ?? CONVS[0];

  const send = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setExtraMessages((prev) => [...prev, { id: `m${Date.now()}`, text: trimmed, time: 'Just now' }]);
    setDraft('');
    window.setTimeout(() => streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' }), 50);
  };

  /** Start a chat from the recipient picker without leaving this inbox. */
  const startChatWith = (name: string) => {
    if (!name) return;
    const match = CONVS.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) {
      setFilter('all');
      setSearch('');
      setSelectedId(match.id);
    }
  };

  return (
    <BusinessPortalChrome activeNav="messages" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-md border-b border-border bg-surface flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Inbox &amp; Direct Messaging</h1>
            <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
              Order Sync Active
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <span>Avg response: 1m 42s</span>

            {/* Settings / filters — opens a working menu for this inbox */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                aria-label="Message filters"
                aria-haspopup="menu"
                aria-expanded={settingsOpen}
                title="Filters & settings"
                onClick={() => setSettingsOpen((open) => !open)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  settingsOpen ? 'border-primary text-primary bg-surface-tint-blue' : 'border-border text-on-surface-variant hover:bg-surface-subtle'
                }`}
              >
                <Icon name="tune" className="text-[18px]" />
              </button>
              {settingsOpen && (
                <div
                  role="menu"
                  aria-label="Inbox filters"
                  className="absolute right-0 top-full mt-space-xs z-40 w-64 py-space-xs bg-surface-canvas rounded-xl shadow-[0_12px_32px_-8px_rgba(13,37,76,0.18)] border border-border-subtle flex flex-col"
                >
                  <div className="px-space-sm py-space-2xs">
                    <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Show conversations</span>
                  </div>
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      role="menuitemradio"
                      aria-checked={filter === f.key}
                      onClick={() => setFilter(f.key)}
                      className="flex items-center justify-between gap-space-sm px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors text-left"
                    >
                      <span>{f.label}</span>
                      {filter === f.key && <Icon name="check" className="text-[16px] text-primary" />}
                    </button>
                  ))}
                  <div className="h-px bg-border-subtle my-space-2xs" />
                  <button
                    type="button"
                    onClick={() => setReadIds(new Set(CONVS.map((c) => c.id)))}
                    className="flex items-center gap-space-sm px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors text-left"
                  >
                    <Icon name="done_all" className="text-[18px]" />
                    <span>Mark all as read</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="flex items-center gap-space-sm px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors text-left"
                  >
                    <Icon name={muted ? 'notifications_off' : 'notifications'} className="text-[18px]" />
                    <span>{muted ? 'Unmute notifications' : 'Mute notifications'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Compose — starts a new message on this page (tooltip explains the flow) */}
            <button
              type="button"
              title="Compose a new message: pick a customer or staff member, then chat with their order, booking and deal context attached."
              onClick={() => setShowRecipient(true)}
              className="h-9 px-space-sm rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 flex items-center gap-space-2xs shadow-sm"
            >
              <Icon name="edit" className="text-[16px]" />
              Compose
            </button>

            {/* Search — focuses the search box in the conversation list */}
            <button
              type="button"
              title="Search conversations"
              onClick={() => searchInputRef.current?.focus()}
              className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs"
            >
              <Icon name="search" className="text-[16px]" />
              Search
            </button>
          </div>
        </div>

        <div className="w-full py-space-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md" style={{ height: 'calc(100vh - 140px)', minHeight: '680px' }}>
            <aside className="lg:col-span-4 xl:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border space-y-space-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Conversations</h2>
                  <span className="px-space-2xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">8 Live</span>
                </div>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search inbox…"
                    aria-label="Search inbox"
                    className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface-subtle font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
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
                {filtered.map((c) => {
                  const active = c.id === selectedId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left p-space-sm flex gap-space-sm transition-colors ${active ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'}`}
                    >
                      <span className="relative shrink-0">
                        <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        {c.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-badge-discount-text border-2 border-surface" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-space-xs">
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">{c.name}</span>
                          <span className="font-caption text-caption text-text-tertiary shrink-0">{c.time}</span>
                        </span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant truncate">{c.preview}</span>
                        <span className="flex flex-wrap items-center gap-1 mt-1">
                          <span className={`px-space-2xs py-space-2xs rounded font-caption text-caption ${c.statusTone}`}>{c.status}</span>
                          {c.tags.map((t) => (
                            <span key={t} className="px-space-2xs py-space-2xs rounded bg-surface-subtle font-caption text-caption text-on-surface-variant">{t}</span>
                          ))}
                        </span>
                      </span>
                      {unreadOf(c) > 0 && (
                        <span className="w-5 h-5 bg-error text-on-error rounded-full font-caption text-caption flex items-center justify-center font-semibold shrink-0 self-center">{unreadOf(c)}</span>
                      )}
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="p-space-md font-body-md text-body-md text-on-surface-variant text-center">No conversations match.</div>
                )}
              </div>
              <div className="p-space-xs border-t border-border flex items-center justify-between font-caption text-caption text-text-tertiary">
                <span className="flex items-center gap-space-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                  Socket connected (Cluster LAG-01)
                </span>
                <button type="button" className="flex items-center gap-space-2xs text-primary hover:underline">
                  <Icon name="refresh" className="text-[14px]" />
                  Refresh
                </button>
              </div>
            </aside>

            <section className="lg:col-span-8 xl:col-span-6 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-md border-b border-border flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="relative">
                    <img src={selected.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    {selected.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-badge-discount-text border-2 border-surface" />}
                  </span>
                  <div className="min-w-0">
                    <div className="font-heading-sm text-heading-sm text-on-surface truncate">{selected.name}</div>
                    <div className="flex items-center gap-space-2xs font-caption text-caption text-on-surface-variant">
                      <span className="px-space-2xs rounded bg-badge-discount-bg text-badge-discount-text font-semibold">Loyal VIP</span>
                      <span>Online now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <MessagesChatActions
                    customerName={selected.name}
                    onViewProfile={() => onViewCustomerProfile?.(selected.name)}
                    onSearch={() => searchInputRef.current?.focus()}
                  />
                </div>
              </div>

              <div className="px-space-md py-space-xs border-b border-border bg-surface-tint-blue/40 flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="receipt_long" className="text-[16px] text-primary shrink-0" />
                  <span className="font-label-sm text-label-sm text-on-surface truncate">
                    <span className="text-primary font-semibold">ORDER ATTACHED</span>
                    <span className="text-on-surface-variant"> · </span>
                    #VG-94021
                    <span className="text-on-surface-variant"> · Pickup 9:45 AM · </span>
                    <span className="font-semibold">₦31,000</span>
                  </span>
                </div>
                <button type="button" onClick={() => onNav('orders')} className="font-label-sm text-label-sm text-primary hover:underline shrink-0">
                  View Full Order Ticket
                </button>
              </div>

              <div ref={streamRef} className="flex-1 overflow-y-auto p-space-md space-y-space-sm bg-surface-subtle/30">
                <div className="flex justify-center">
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface border border-border font-caption text-caption text-text-tertiary">Today · Oct 11, 2025</span>
                </div>

                <div className="flex gap-space-xs justify-start">
                  <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border text-on-surface">
                      <p className="font-body-md text-body-md whitespace-pre-wrap">Hi! I just placed order #VG-94021 — Truffle Fries Combo with extra sauce. Can you confirm it&apos;s in the kitchen?</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center gap-1">9:32 AM</div>
                  </div>
                </div>

                <div className="flex gap-space-xs justify-end">
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                      <p className="font-body-md text-body-md whitespace-pre-wrap">Confirmed, Michael! Order #VG-94021 is at the Grill Station. Pickup window is 9:40–9:50 AM.</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                      9:34 AM
                      <Icon name="done_all" className="text-[14px] text-primary" filled />
                      Delivered &amp; Seen
                    </div>
                  </div>
                </div>

                <div className="flex gap-space-xs justify-start">
                  <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border text-on-surface">
                      <p className="font-body-md text-body-md whitespace-pre-wrap">Perfect — can I get extra pepper sauce? Also, is the Add-on discount still active?</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1">9:36 AM</div>
                  </div>
                </div>

                {extraMessages.map((m) => (
                  <div key={m.id} className="flex gap-space-xs justify-end">
                    <div className="max-w-[75%]">
                      <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                        <p className="font-body-md text-body-md whitespace-pre-wrap">{m.text}</p>
                      </div>
                      <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                        {m.time}
                        <Icon name="done_all" className="text-[14px] text-primary" filled />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-space-xs justify-start">
                  <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                  <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="font-body-sm text-body-sm text-on-surface-variant ml-1">Customer is viewing active order progress screen</span>
                  </div>
                </div>
              </div>

              <div className="p-space-sm border-t border-border space-y-space-xs">
                <div className="flex flex-wrap gap-space-2xs">
                  {['Yes — extra sauce added, free of charge', 'Order is ready for pickup', 'Your rider departs in 5 minutes'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDraft(r)}
                      className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-tint-blue hover:text-primary transition-colors"
                    >
                      <Icon name="bolt" className="text-[12px] text-primary" filled />
                      {r}
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
              </div>
            </section>

            {/* Customer dossier: only fits beside the thread from `xl` up — below that
                the full CRM profile opens from the chat header / dossier shortcut. */}
            <aside className="hidden xl:flex lg:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Customer Dossier</h2>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border">
                <div className="p-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <img src={selected.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div className="min-w-0">
                      <div className="font-heading-sm text-heading-sm text-on-surface truncate">{selected.name}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Top 5% Spender</div>
                    </div>
                  </div>
                  <div className="mt-space-sm space-y-space-2xs font-body-sm text-body-sm text-on-surface-variant">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="call" className="text-[14px] text-primary" />
                      +234 803 221 7788
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <Icon name="mail" className="text-[14px] text-primary" />
                      michael.james@email.com
                    </div>
                  </div>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Lifetime Engagement</div>
                  <div className="grid grid-cols-2 gap-space-xs">
                    {[
                      { label: 'Visits', value: '14' },
                      { label: 'Orders', value: '11' },
                      { label: 'Deals', value: '4' },
                      { label: 'Tap Points', value: '2,450' },
                    ].map((s) => (
                      <div key={s.label} className="p-space-xs rounded-xl bg-surface-subtle border border-border">
                        <div className="font-caption text-caption text-on-surface-variant">{s.label}</div>
                        <div className="font-heading-sm text-heading-sm text-on-surface">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Relationship Telemetry</div>
                  <div className="space-y-space-2xs font-body-sm text-body-sm">
                    {[
                      { label: 'Avg order value', value: '₦2,818' },
                      { label: 'Visit frequency', value: '2.4× / month' },
                      { label: 'Deal redemption rate', value: '36%' },
                      { label: 'Response rate', value: '92%' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center justify-between">
                        <span className="text-on-surface-variant">{r.label}</span>
                        <span className="text-on-surface font-medium">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-space-sm">
                    <div className="flex items-center justify-between font-label-sm text-label-sm mb-space-2xs">
                      <span className="text-on-surface-variant">VIP Tier progress</span>
                      <span className="text-primary font-semibold">82%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: '82%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Preferred items</div>
                  <div className="flex flex-wrap gap-space-2xs">
                    {['Truffle Fries', 'Grilled Wings', 'Sparkling Water'].map((p) => (
                      <span key={p} className="px-space-xs py-space-2xs rounded-full bg-surface-subtle border border-border font-caption text-caption text-on-surface-variant">{p}</span>
                    ))}
                  </div>
                  <div className="mt-space-sm flex items-center gap-space-xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text w-fit">
                    <Icon name="verified" className="text-[14px]" filled />
                    <span className="font-caption text-caption font-semibold">Tap-Pass verified</span>
                  </div>
                </div>

                <div className="p-space-sm">
                  <button type="button" onClick={() => onViewCustomerProfile?.(selected.name)} className="w-full h-11 rounded-xl border border-primary text-primary font-label-sm text-label-sm hover:bg-surface-tint-blue flex items-center justify-center gap-space-2xs">
                    <Icon name="person" className="text-[16px]" />
                    View Full Customer CRM Profile
                  </button>
                </div>

                <div className="p-space-sm">
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Merchant Notes</span>
                    <button type="button" className="font-label-sm text-label-sm text-primary hover:underline">Edit</button>
                  </div>
                  <ul className="space-y-space-2xs">
                    {DOSSIER_NOTES.map((n) => (
                      <li key={n.label} className="flex items-start gap-space-xs font-body-sm text-body-sm">
                        <Icon name={n.icon} className="text-[14px] text-text-tertiary mt-0.5 shrink-0" />
                        <span>
                          <span className="text-on-surface-variant">{n.label}: </span>
                          <span className="text-on-surface font-medium">{n.value}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Staff backup — moved here from the old compose screen */}
                <div className="p-space-sm">
                  <div className="rounded-xl border border-primary/30 bg-surface-tint-blue/50 p-space-sm flex items-start gap-space-xs">
                    <Icon name="support_agent" className="text-[18px] text-primary shrink-0 mt-0.5" filled />
                    <div>
                      <div className="font-label-sm text-label-sm text-on-surface font-semibold">Need Staff Backup?</div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Transfer this conversation to Floor Manager or Kitchen Lead with full context.</p>
                      <button
                        type="button"
                        onClick={() => setTransferred(true)}
                        disabled={transferred}
                        className="mt-space-2xs h-9 px-space-sm rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 disabled:opacity-70 disabled:hover:opacity-70"
                      >
                        {transferred ? 'Transferred ✓' : 'Transfer Call'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-space-xs border-t border-border flex items-center gap-space-xs">
                <button type="button" onClick={() => setShowRecipient(true)} className="flex-1 h-10 rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center justify-center gap-space-2xs">
                  <Icon name="person_add" className="text-[16px]" />
                  New Chat
                </button>
                <button type="button" onClick={() => onView('booking')} className="flex-1 h-10 rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center justify-center gap-space-2xs">
                  <Icon name="event" className="text-[16px]" />
                  Booking
                </button>
                <button type="button" onClick={() => onView('deal')} className="flex-1 h-10 rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center justify-center gap-space-2xs">
                  <Icon name="local_offer" className="text-[16px]" />
                  Deal
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showRecipient && (
        <MessagesSelectRecipientModal
          onClose={() => setShowRecipient(false)}
          onStartChat={startChatWith}
        />
      )}
    </BusinessPortalChrome>
  );
}
