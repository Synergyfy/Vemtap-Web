import { useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessMessagesScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

type ConvFilter = 'all' | 'unread' | 'orders' | 'bookings' | 'general';

interface Message {
  id: string;
  from: 'customer' | 'merchant';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread: number;
  tags: string[];
  channel: ConvFilter | 'general';
  phone: string;
  orders: string;
  lifetime: string;
  messages: Message[];
}

const CONVERSATIONS: Conversation[] = [];

const FILTERS: Array<{ key: ConvFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'orders', label: 'Orders' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'general', label: 'General' },
];

const SMART_REPLIES = ['Yes, it is!', 'Reserved — see you soon', 'On its way', 'Table for 2 confirmed'];

export function DesktopBusinessMessagesScreen({ onNav }: DesktopBusinessMessagesScreenProps) {
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState<ConvFilter>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [extraMessages, setExtraMessages] = useState<Record<string, Message[]>>({});
  const [typing, setTyping] = useState(true);
  const streamRef = useRef<HTMLDivElement>(null);

  const selected = CONVERSATIONS.find((c) => c.id === selectedId) ?? null;
  const allMessages = selected ? [...selected.messages, ...(extraMessages[selected.id] ?? [])] : [];

  const filtered = CONVERSATIONS.filter((c) => {
    if (filter === 'unread' && c.unread === 0) return false;
    if (filter === 'orders' && c.channel !== 'orders') return false;
    if (filter === 'bookings' && c.channel !== 'bookings') return false;
    if (filter === 'general' && c.channel !== 'general') return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.preview.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!selected || !trimmed) return;
    const msg: Message = { id: `m${Date.now()}`, from: 'merchant', text: trimmed, time: 'Just now' };
    setExtraMessages((prev) => ({ ...prev, [selected.id]: [...(prev[selected.id] ?? []), msg] }));
    setDraft('');
    setTyping(false);
    window.setTimeout(() => streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' }), 50);
  };

  return (
    <BusinessPortalChrome activeNav="messages" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-md border-b border-border bg-surface flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Messages</h1>
            <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
              WebSocket Live
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <span>Avg reply: 1.4 min</span>
            <span>·</span>
            <span>2 unread</span>
          </div>
        </div>

        <div className="w-full py-space-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md" style={{ height: 'calc(100vh - 140px)', minHeight: '520px' }}>
            <aside className="lg:col-span-4 xl:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border space-y-space-xs">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search conversations…"
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
                {filtered.length > 0 ? (
                  filtered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedId(c.id); setTyping(c.id === 'c1'); }}
                      className={`w-full text-left p-space-sm flex gap-space-sm transition-colors ${
                        c.id === selectedId ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-space-xs">
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">{c.name}</span>
                          <span className="font-caption text-caption text-text-tertiary shrink-0">{c.time}</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{c.preview}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.tags.map((t) => (
                            <span key={t} className="px-space-2xs py-space-2xs rounded bg-surface-subtle font-caption text-caption text-on-surface-variant">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 bg-error text-on-error rounded-full font-caption text-caption flex items-center justify-center font-semibold shrink-0 self-center">
                          {c.unread}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-space-md font-body-md text-body-md text-on-surface-variant text-center">
                    No live conversations yet.
                  </div>
                )}
              </div>
              <div className="p-space-sm border-t border-border">
                <button type="button" className="w-full h-11 rounded-xl border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue flex items-center justify-center gap-space-2xs">
                  <Icon name="edit" className="text-[16px]" />
                  New Customer Message
                </button>
              </div>
            </aside>

            {selected ? (
              <section className="lg:col-span-8 xl:col-span-9 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
                <div className="p-space-md border-b border-border flex flex-wrap items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <img src={selected.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <div className="font-heading-sm text-heading-sm text-on-surface truncate">{selected.name}</div>
                      <div className="flex flex-wrap items-center gap-space-2xs">
                        {selected.tags.map((t) => (
                          <span key={t} className="px-space-2xs rounded bg-surface-subtle font-caption text-caption text-on-surface-variant">{t}</span>
                        ))}
                        <span className="font-caption text-caption text-text-tertiary">{selected.phone} • {selected.orders}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button type="button" aria-label="Call" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle">
                      <Icon name="call" className="text-[18px]" />
                    </button>
                    <button type="button" aria-label="Profile" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle">
                      <Icon name="person" className="text-[18px]" />
                    </button>
                  </div>
                </div>

                <div className="px-space-md py-space-xs border-b border-border bg-surface-tint-blue/40 flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="local_offer" className="text-[16px] text-primary" />
                    <span className="font-label-sm text-label-sm text-on-surface">
                      Attached deal: <span className="text-primary font-semibold">#VT-48F261 — Lunch Combo</span>
                    </span>
                  </div>
                  <button type="button" onClick={() => onNav('deals')} className="font-label-sm text-label-sm text-primary hover:underline">
                    View deal
                  </button>
                </div>

                <div ref={streamRef} className="flex-1 overflow-y-auto p-space-md space-y-space-sm bg-surface-subtle/30">
                  {allMessages.map((m) => (
                    <div key={m.id} className={`flex ${m.from === 'merchant' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] px-space-sm py-space-xs rounded-2xl ${
                          m.from === 'merchant'
                            ? 'bg-primary text-on-primary rounded-br-md'
                            : 'bg-surface border border-border text-on-surface rounded-bl-md'
                        }`}
                      >
                        <p className="font-body-md text-body-md whitespace-pre-wrap">{m.text}</p>
                        <div className={`font-caption text-caption mt-1 ${m.from === 'merchant' ? 'text-on-primary/70' : 'text-text-tertiary'}`}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="px-space-sm py-space-xs rounded-2xl bg-surface border border-border rounded-bl-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="font-body-sm text-body-sm text-on-surface-variant ml-1">{selected.name} is typing…</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-space-sm border-t border-border space-y-space-xs">
                  <div className="flex flex-wrap gap-space-2xs">
                    {SMART_REPLIES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setDraft(r)}
                        className="px-space-xs py-space-2xs rounded-full border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-tint-blue hover:text-primary transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-space-xs">
                    <div className="flex items-center gap-space-2xs">
                      {[
                        { icon: 'image', label: 'Image' },
                        { icon: 'description', label: 'File' },
                        { icon: 'receipt_long', label: 'Invoice' },
                        { icon: 'redeem', label: 'Voucher' },
                      ].map((a) => (
                        <button key={a.icon} type="button" aria-label={a.label} className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface">
                          <Icon name={a.icon} className="text-[18px]" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(draft); } }}
                      placeholder={`Message ${selected.name}…`}
                      className="flex-1 h-11 px-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => sendMessage(draft)}
                      disabled={!draft.trim()}
                      className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-space-2xs"
                    >
                      <Icon name="send" className="text-[18px]" />
                      Send
                    </button>
                  </div>
                  <div className="font-caption text-caption text-text-tertiary text-right">Enter to send • Shift+Enter for new line</div>
                </div>
              </section>
            ) : (
              <section className="lg:col-span-8 xl:col-span-9 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
                <div className="flex flex-1 items-center justify-center p-space-xl">
                  <div className="max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-space-sm rounded-full bg-surface-tint-blue flex items-center justify-center">
                      <Icon name="chat" className="text-primary text-[30px]" />
                    </div>
                    <h2 className="font-heading-md text-heading-md text-on-surface">No live conversations yet</h2>
                    <p className="mt-space-xs font-body-md text-body-md text-text-secondary">
                      Customer chat threads and order conversations will appear here when the backend starts returning live data.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </BusinessPortalChrome>
  );
}
