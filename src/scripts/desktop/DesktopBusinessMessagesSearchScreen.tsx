import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { MessagesSelectRecipientModal } from './MessagesSelectRecipientModal';
import type { MessagesWorkspaceView } from './DesktopBusinessMessagesOrderContextScreen';

interface DesktopBusinessMessagesSearchScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onView: (view: MessagesWorkspaceView) => void;
}

type SearchTab = 'conversations' | 'orders' | 'bookings' | 'deals';

interface SearchResult {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  snippet: string;
  time: string;
  unread?: number;
  badge: string;
  tab: SearchTab;
  paidVia?: string;
}

const RESULTS: SearchResult[] = [
  {
    id: 'r1',
    name: 'Michael James',
    initials: 'MJ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkg9vSBZAqdcLqsKrI-vPk5IMlaP3d1iZTqQnDtmvgIQObdVyWAGgfUGsmdu6Wgv334gudx8U_w1HiwnJGk4wMObTNTqv90-nXlFDH0vgZ3oUb8o-d26kai20qTZW3bisdAjssax58TYaZ64OP4IfGZtYyzHXeL6nmGWI4ohAtRjsswr_9SJdFQZuTOPYOnsm_R9t4pfEQvu5z5-NmuH8xHrH0QxA2sSXlsP6BSsazWFJTqJuKGrHW_g',
    snippet: 'Order #VG-94021 is at the Grill Station. Pickup window is 9:40–9:50 AM.',
    time: '2 min',
    badge: 'Order #VG-94021',
    tab: 'orders',
    paidVia: 'Paid via Card',
  },
  {
    id: 'r2',
    name: 'Amina Bello',
    initials: 'AB',
    snippet: 'On my way for pickup — order #VG-94021 reference sent to rider.',
    time: '15 min',
    unread: 1,
    badge: 'Order #VG-94021',
    tab: 'orders',
    paidVia: 'Paid via Transfer',
  },
  {
    id: 'r3',
    name: 'Ibrahim Garba',
    initials: 'IG',
    snippet: 'Was my order #VG-94021 included in the lunch promo?',
    time: '1 hr',
    badge: 'Order #VG-94021',
    tab: 'orders',
  },
];

const TABS: Array<{ key: SearchTab; label: string }> = [
  { key: 'conversations', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'deals', label: 'Deals' },
];

const TAB_COUNTS: Record<SearchTab, number> = {
  conversations: 3,
  orders: 3,
  bookings: 0,
  deals: 0,
};

export function DesktopBusinessMessagesSearchScreen({ onNav, onView }: DesktopBusinessMessagesSearchScreenProps) {
  const [query, setQuery] = useState('Order #VG');
  const [tab, setTab] = useState<SearchTab>('conversations');
  const [selectedId, setSelectedId] = useState('r1');
  const [showRecipient, setShowRecipient] = useState(false);
  const [zeroQuery, setZeroQuery] = useState('xyz123');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace('#', '');
    if (!q) return RESULTS;
    return RESULTS.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.snippet.toLowerCase().includes(q) ||
      r.badge.toLowerCase().replace('#', '').includes(q)
    );
  }, [query]);

  const selected = results.find((r) => r.id === selectedId) ?? results[0] ?? RESULTS[0];
  const noResults = query.trim().length > 0 && results.length === 0;

  return (
    <BusinessPortalChrome activeNav="messages" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-md border-b border-border bg-surface flex flex-wrap items-center justify-between gap-space-md">
          <div className="min-w-0">
            <div className="font-label-sm text-label-sm text-text-tertiary">Customer Conversations / Live POS Sync</div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Search &amp; Filtered Results</h1>
              <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                Realtime Gateway · Synced
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button type="button" onClick={() => onView('order-context')} className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="inbox" className="text-[16px]" />
              Inbox
            </button>
            <button type="button" onClick={() => setShowRecipient(true)} className="h-9 px-space-sm rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 flex items-center gap-space-2xs shadow-sm">
              <Icon name="edit" className="text-[16px]" />
              New Message
            </button>
          </div>
        </div>

        <div className="w-full py-space-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md" style={{ height: 'calc(100vh - 140px)', minHeight: '680px' }}>
            <aside className="lg:col-span-4 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border space-y-space-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Search Inbox</h2>
                  <span className="px-space-2xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">POS Sync</span>
                </div>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search order #, booking #, name…"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-primary/40 bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
                  {query && (
                    <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle">
                      <Icon name="close" className="text-[16px]" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-space-2xs">
                  {TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm border transition-colors ${
                        tab === t.key ? 'bg-surface-tint-blue border-primary text-primary font-semibold' : 'bg-surface border-border text-on-surface-variant hover:bg-surface-subtle'
                      }`}
                    >
                      {t.label} ({TAB_COUNTS[t.key]})
                    </button>
                  ))}
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">
                  {noResults ? 'No conversations found' : `Found ${results.length} conversation${results.length === 1 ? '' : 's'}`}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {!noResults && results.map((r) => {
                  const active = r.id === selectedId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className={`w-full text-left p-space-sm flex gap-space-sm transition-colors ${active ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'}`}
                    >
                      {r.avatar ? (
                        <img src={r.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-label-md text-label-md shrink-0">{r.initials}</span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-space-xs">
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">{r.name}</span>
                          <span className="font-caption text-caption text-text-tertiary shrink-0">{r.time}</span>
                        </span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{r.snippet}</span>
                        <span className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="px-space-2xs py-space-2xs rounded bg-primary-container text-on-primary-container font-caption text-caption font-semibold">{r.badge}</span>
                          {r.paidVia && (
                            <span className="px-space-2xs py-space-2xs rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption">{r.paidVia}</span>
                          )}
                        </span>
                      </span>
                      {r.unread ? (
                        <span className="w-5 h-5 bg-error text-on-error rounded-full font-caption text-caption flex items-center justify-center font-semibold shrink-0 self-center">{r.unread}</span>
                      ) : null}
                    </button>
                  );
                })}
                {noResults && (
                  <div className="p-space-md text-center space-y-space-xs">
                    <Icon name="search_off" className="text-[32px] text-text-tertiary" />
                    <p className="font-body-md text-body-md text-on-surface-variant">No conversations match “{query}”.</p>
                    <button type="button" onClick={() => { setQuery('Order #VG'); setTab('conversations'); }} className="font-label-sm text-label-sm text-primary hover:underline">Reset search</button>
                  </div>
                )}
              </div>

              <div className="p-space-xs border-t border-border grid grid-cols-2 gap-space-2xs font-caption text-caption text-text-tertiary">
                <span>↑↓ Navigate</span>
                <span className="text-right">Enter · Open</span>
                <span>Esc · Clear</span>
                <span className="text-right">Cmd+K · Focus</span>
              </div>
            </aside>

            <section className="lg:col-span-8 flex flex-col gap-space-md min-h-0">
              <div className="bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden" style={{ flex: '1 1 0', minHeight: '320px' }}>
                <div className="p-space-sm border-b border-border flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm min-w-0">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-label-md text-label-md">{selected.initials}</span>
                    )}
                    <div className="min-w-0">
                      <div className="font-heading-sm text-heading-sm text-on-surface truncate">{selected.name}</div>
                      <div className="font-caption text-caption text-on-surface-variant truncate">{selected.badge} · Matched conversation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <button type="button" className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
                      <Icon name="print" className="text-[16px]" />
                      Print Slip
                    </button>
                    <button type="button" className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
                      <Icon name="local_shipping" className="text-[16px]" />
                      Curbside Handover
                    </button>
                  </div>
                </div>

                <div className="px-space-sm py-space-2xs border-b border-border bg-surface-tint-blue/40 flex items-center gap-space-xs">
                  <Icon name="manage_search" className="text-[16px] text-primary" filled />
                  <span className="font-label-sm text-label-sm text-on-surface">
                    Matched Query: <span className="text-primary font-semibold">Order #VG-94021</span>
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-space-md space-y-space-sm bg-surface-subtle/30">
                  <div className="flex gap-space-xs justify-start">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-caption text-caption self-end">{selected.initials}</span>
                    )}
                    <div className="max-w-[75%]">
                      <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border text-on-surface">
                        <p className="font-body-md text-body-md">{selected.snippet}</p>
                      </div>
                      <div className="font-caption text-caption text-text-tertiary mt-1">{selected.time}</div>
                    </div>
                  </div>
                  <div className="flex gap-space-xs justify-end">
                    <div className="max-w-[75%]">
                      <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                        <p className="font-body-md text-body-md">Hi {selected.name.split(' ')[0]} — I found order #VG-94021. It&apos;s paid and at the Grill Station now. Pickup runs 9:40–9:50 AM.</p>
                      </div>
                      <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                        Just now
                        <Icon name="done_all" className="text-[14px] text-primary" filled />
                        Delivered
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-space-sm border-t border-border flex items-end gap-space-xs">
                  <div className="flex items-center gap-space-2xs">
                    {[
                      { icon: 'image', label: 'Image' },
                      { icon: 'receipt_long', label: 'Receipt' },
                      { icon: 'local_offer', label: 'Deal' },
                    ].map((a) => (
                      <button key={a.icon} type="button" aria-label={a.label} className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface">
                        <Icon name={a.icon} className="text-[18px]" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder={`Reply to ${selected.name}…`}
                    className="flex-1 h-11 px-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
                  <button type="button" className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm flex items-center gap-space-2xs">
                    <Icon name="send" className="text-[18px]" />
                    Send
                  </button>
                </div>
              </div>

              <div className="bg-surface rounded-2xl shadow-sm border border-border p-space-md" style={{ flex: '0 0 auto' }}>
                <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-sm">Search Zero-State Preview</div>
                <div className="flex items-start gap-space-md">
                  <span className="w-14 h-14 rounded-2xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 shadow-sm">
                    <Icon name="search_off" className="text-[28px]" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading-sm text-heading-sm text-on-surface">No conversations found for “{zeroQuery}”</div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Try an order number, booking code, phone number or customer name.</p>
                    <div className="flex flex-wrap gap-space-2xs mt-space-xs">
                      {['VG-94021', 'BK-77402', '+234 803', 'Sarah Adams'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { setZeroQuery(s); setQuery(s); }}
                          className="px-space-xs py-space-2xs rounded-full border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-tint-blue hover:text-primary transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-space-md mt-space-sm font-label-sm text-label-sm">
                      <button type="button" className="text-primary hover:underline">Force re-index</button>
                      <button type="button" className="text-primary hover:underline">Check Archived</button>
                      <button type="button" className="text-primary hover:underline">Help Center</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
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
