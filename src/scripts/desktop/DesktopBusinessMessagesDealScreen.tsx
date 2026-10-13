import { useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { MessagesShareAttachmentModal } from './MessagesShareAttachmentModal';
import { MessagesSelectRecipientModal } from './MessagesSelectRecipientModal';
import type { MessagesWorkspaceView } from './DesktopBusinessMessagesOrderContextScreen';

interface DesktopBusinessMessagesDealScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onView: (view: MessagesWorkspaceView) => void;
}

type DealFilter = 'deal' | 'unread' | 'dinein';

interface DealConv {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  preview: string;
  time: string;
  unread: number;
  tag: string;
  channel: DealFilter | 'general';
}

const CONVS: DealConv[] = [
  {
    id: 'c1',
    name: 'Sarah Adams',
    initials: 'SA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB-Xjt2yU9KoW80OqiT5QTHaJF_VRXqkLOMz6gTp2nbol94ih89z50F6yQaAogksU1ejODmqd9RLuHgfJSYliJpthg2Wz5IQNBkzlNe-PIPHaNvlkEgz4V-uu9bQ30CjyqOQHlKR_b3EWXf-MEuLkDv43_3mXLjeMx9ABjik0st2w8NDP0QKiY2K-MCdNAPguYBjF9PjTvdyjEnhRwBE8mgF239kTIlXgKwUES6Zk3',
    preview: 'Yes please — table for 2 at 8 PM!',
    time: '2 min',
    unread: 1,
    tag: 'Deal Active',
    channel: 'deal',
  },
  {
    id: 'c2',
    name: 'Michael James',
    initials: 'MJ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkg9vSBZAqdcLqsKrI-vPk5IMlaP3d1iZTqQnDtmvgIQObdVyWAGgfUGsmdu6Wgv334gudx8U_w1HiwnJGk4wMObTNTqv90-nXlFDH0vgZ3oUb8o-d26kai20qTZW3bisdAjssax58TYaZ64OP4IfGZtYyzHXeL6nmGWI4ohAtRjsswr_9SJdFQZuTOPYOnsm_R9t4pfEQvu5z5-NmuH8xHrH0QxA2sSXlsP6BSsazWFJTqJuKGrHW_g',
    preview: 'Claimed the Truffle Fries deal.',
    time: '18 min',
    unread: 0,
    tag: 'Dine-In Pending',
    channel: 'dinein',
  },
  {
    id: 'c3',
    name: 'Amina Bello',
    initials: 'AB',
    preview: 'Can I stack the deal with Tap Points?',
    time: '1 hr',
    unread: 1,
    tag: 'Unread',
    channel: 'unread',
  },
  {
    id: 'c4',
    name: 'Tunde Balogun',
    initials: 'TB',
    preview: 'Deal still valid for delivery?',
    time: '3 hr',
    unread: 0,
    tag: 'General',
    channel: 'general',
  },
  {
    id: 'c5',
    name: 'Zainab Musa',
    initials: 'ZM',
    preview: 'Thanks for the birthday discount!',
    time: 'Yesterday',
    unread: 0,
    tag: 'Deal Active',
    channel: 'deal',
  },
];

const FILTERS: Array<{ key: DealFilter; label: string }> = [
  { key: 'deal', label: 'Deal Active (6)' },
  { key: 'unread', label: 'Unread (2)' },
  { key: 'dinein', label: 'Dine-In Pending' },
];

const DEAL_HISTORY = [
  { id: 'VT-48F261', label: 'Truffle Fries Combo', date: 'Today' },
  { id: 'VT-47A112', label: 'Grill Night 2-for-1', date: 'Sep 28' },
  { id: 'VT-45C880', label: 'Lunch Express ₦2,500', date: 'Sep 14' },
];

const TABLES = ['T-01', 'T-04', 'T-07', 'BOOTH-B2'];

export function DesktopBusinessMessagesDealScreen({ onNav, onView }: DesktopBusinessMessagesDealScreenProps) {
  const [selectedId, setSelectedId] = useState('c1');
  const [filter, setFilter] = useState<DealFilter>('deal');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [assignedTable, setAssignedTable] = useState<string | null>(null);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showRecipient, setShowRecipient] = useState(false);
  const [extraMessages, setExtraMessages] = useState<Array<{ id: string; text: string; time: string }>>([]);
  const streamRef = useRef<HTMLDivElement>(null);

  const filtered = CONVS.filter((c) => {
    if (filter === 'unread' && c.unread === 0) return false;
    if (filter === 'deal' && c.channel !== 'deal') return false;
    if (filter === 'dinein' && c.channel !== 'dinein') return false;
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

  return (
    <BusinessPortalChrome activeNav="messages" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-md border-b border-border bg-surface flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Customer Conversations</h1>
            <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
              Live Realtime Sync
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <span>18 Active Chats</span>
            <button type="button" className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="tune" className="text-[16px]" />
              Filter
            </button>
            <button type="button" onClick={() => onView('compose')} className="h-9 px-space-sm rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 flex items-center gap-space-2xs shadow-sm">
              <Icon name="campaign" className="text-[16px]" filled />
              Broadcast Deal Update
            </button>
          </div>
        </div>

        <div className="w-full py-space-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md" style={{ height: 'calc(100vh - 13.5rem)', minHeight: '640px' }}>
            <aside className="lg:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
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
                {filtered.map((c) => {
                  const active = c.id === selectedId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left p-space-sm flex gap-space-sm transition-colors ${active ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'}`}
                    >
                      {c.avatar ? (
                        <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-label-md text-label-md shrink-0">{c.initials}</span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-space-xs">
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate">{c.name}</span>
                          <span className="font-caption text-caption text-text-tertiary shrink-0">{c.time}</span>
                        </span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant truncate">{c.preview}</span>
                        <span className="inline-block mt-1 px-space-2xs py-space-2xs rounded bg-surface-subtle font-caption text-caption text-on-surface-variant">{c.tag}</span>
                      </span>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 bg-error text-on-error rounded-full font-caption text-caption flex items-center justify-center font-semibold shrink-0 self-center">{c.unread}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-space-xs border-t border-border font-caption text-caption text-text-tertiary">Urban Grill • Front Desk Agent #04 · v3.8</div>
            </aside>

            <section className="lg:col-span-6 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-md border-b border-border flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  {selected.avatar ? (
                    <img src={selected.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-label-md text-label-md">{selected.initials}</span>
                  )}
                  <div className="min-w-0">
                    <div className="font-heading-sm text-heading-sm text-on-surface truncate">{selected.name}</div>
                    <div className="font-caption text-caption text-badge-discount-text font-semibold">Deal Active · #VT-48F261</div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button type="button" aria-label="Call" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle">
                    <Icon name="call" className="text-[18px]" />
                  </button>
                  <button type="button" aria-label="More" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle">
                    <Icon name="more_vert" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="px-space-md py-space-xs border-b border-border bg-surface-tint-blue/40">
                <div className="flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <Icon name="local_offer" className="text-[16px] text-primary shrink-0" filled />
                    <span className="font-label-sm text-label-sm text-on-surface truncate">
                      <span className="text-primary font-semibold">DEAL CONTEXT</span>
                      <span className="text-on-surface-variant"> · #VT-48F261 · Truffle Fries Combo</span>
                    </span>
                  </div>
                  <button type="button" onClick={() => onNav('deals')} className="font-label-sm text-label-sm text-primary hover:underline shrink-0">View Deal</button>
                </div>
                <div className="mt-space-2xs flex items-center gap-space-xs p-space-xs rounded-xl bg-surface border border-border">
                  <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <Icon name="local_offer" className="text-[16px]" filled />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-label-sm text-label-sm text-on-surface truncate">Truffle Fries Combo · 2-for-1</div>
                    <div className="font-caption text-caption text-on-surface-variant">
                      <span className="font-semibold text-on-surface">₦9,600</span>
                      <span className="line-through text-text-tertiary ml-1">₦12,000</span>
                      <span className="ml-1">· Claimed in App</span>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={streamRef} className="flex-1 overflow-y-auto p-space-md space-y-space-sm bg-surface-subtle/30">
                <div className="flex gap-space-xs justify-start">
                  {selected.avatar ? (
                    <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-surface-subtle text-on-surface-variant flex items-center justify-center font-caption text-caption self-end">{selected.initials}</span>
                  )}
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border text-on-surface">
                      <p className="font-body-md text-body-md">Hi! I claimed the Truffle Fries Combo deal — is it available for dine-in tonight?</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1">7:58 PM</div>
                  </div>
                </div>

                <div className="flex gap-space-xs justify-end">
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                      <p className="font-body-md text-body-md">Hey Sarah! Yes — the combo is live for dine-in until close. Want me to reserve a table for 2?</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                      8:00 PM
                      <Icon name="done_all" className="text-[14px] text-primary" filled />
                      Delivered
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
                      <p className="font-body-md text-body-md">Yes please — table for 2 at 8 PM! Can we also get the deal on the app so we earn Tap Points?</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1">8:02 PM</div>
                  </div>
                </div>

                <div className="flex gap-space-xs justify-end">
                  <div className="max-w-[75%]">
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                      <p className="font-body-md text-body-md">Absolutely — Tap Points stack with this deal. Table T-04 is held for you. See you shortly!</p>
                    </div>
                    <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                      8:03 PM
                      <Icon name="done_all" className="text-[14px] text-primary" filled />
                      <span className="px-space-2xs rounded bg-badge-discount-bg text-badge-discount-text font-semibold">Deal Pre-linked</span>
                    </div>
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
                  {['Send Deal Reminder', 'Confirm Table T-04', 'Attach POS Receipt', 'Push Loyalty Points'].map((r) => (
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
                  <div className="flex items-center gap-space-2xs">
                    {[
                      { icon: 'image', label: 'Image' },
                      { icon: 'attach_file', label: 'Attach' },
                      { icon: 'bolt', label: 'Smart Reply', filled: true },
                      { icon: 'local_offer', label: 'Deal', filled: true },
                    ].map((a) => (
                      <button key={a.icon} type="button" aria-label={a.label} onClick={() => setShowAttachment(true)} className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface">
                        <Icon name={a.icon} className="text-[18px]" filled={a.filled} />
                      </button>
                    ))}
                  </div>
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
                    className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md hover:opacity-90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-space-2xs"
                  >
                    <Icon name="send" className="text-[18px]" />
                    Send
                  </button>
                </div>
                <div className="font-caption text-caption text-text-tertiary">End-to-end encrypted · Realtime deal sync active</div>
              </div>
            </section>

            <aside className="lg:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Campaign Metrics</h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                <div className="p-space-sm">
                  <div className="flex items-center justify-between font-label-sm text-label-sm mb-space-2xs">
                    <span className="text-on-surface-variant">Claimed / Quota</span>
                    <span className="text-primary font-semibold">62%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-subtle overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: '62%' }} />
                  </div>
                  <div className="mt-space-xs grid grid-cols-3 gap-space-2xs text-center">
                    {[
                      { label: 'Views', value: '142' },
                      { label: 'Claims', value: '38' },
                      { label: 'Redeemed', value: '62%' },
                    ].map((s) => (
                      <div key={s.label} className="p-space-2xs rounded-lg bg-surface-subtle border border-border">
                        <div className="font-caption text-caption text-on-surface-variant">{s.label}</div>
                        <div className="font-label-md text-label-md text-on-surface font-semibold">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <svg viewBox="0 0 200 40" className="w-full h-10 mt-space-xs" aria-hidden="true">
                    <polyline
                      fill="none"
                      stroke="#0055c4"
                      strokeWidth="2"
                      points="0,32 20,28 40,30 60,22 80,24 100,16 120,18 140,10 160,14 180,8 200,12"
                    />
                    <polyline
                      fill="rgba(6,108,244,0.12)"
                      stroke="none"
                      points="0,40 0,32 20,28 40,30 60,22 80,24 100,16 120,18 140,10 160,14 180,8 200,12 200,40"
                    />
                  </svg>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Customer Dossier · {selected.name}</div>
                  <ul className="space-y-space-2xs font-body-sm text-body-sm">
                    {DEAL_HISTORY.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-space-xs">
                        <span className="min-w-0">
                          <span className="block text-on-surface truncate">{d.label}</span>
                          <span className="block font-caption text-caption text-text-tertiary">#{d.id} · {d.date}</span>
                        </span>
                        <Icon name="chevron_right" className="text-[16px] text-text-tertiary shrink-0" />
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="mt-space-sm w-full h-11 rounded-xl border border-primary text-primary font-label-sm text-label-sm hover:bg-surface-tint-blue flex items-center justify-center gap-space-2xs">
                    <Icon name="person" className="text-[16px]" />
                    View Full Guest CRM Profile
                  </button>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Table Assignment</div>
                  <div className="grid grid-cols-2 gap-space-xs">
                    {TABLES.map((t) => {
                      const active = assignedTable === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAssignedTable(t)}
                          className={`h-11 rounded-xl border font-label-sm text-label-sm transition-colors ${
                            active ? 'border-primary bg-surface-tint-blue text-primary font-semibold' : 'border-border text-on-surface-variant hover:bg-surface-subtle'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {assignedTable && (
                    <button
                      type="button"
                      className="mt-space-xs w-full h-11 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 shadow-sm"
                    >
                      Assign {assignedTable === 'BOOTH-B2' ? 'Booth B-2' : assignedTable} for {selected.name.split(' ')[0]} (4 Guests)
                    </button>
                  )}
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
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showAttachment && <MessagesShareAttachmentModal onClose={() => setShowAttachment(false)} />}
      {showRecipient && (
        <MessagesSelectRecipientModal
          onClose={() => setShowRecipient(false)}
          onStartChat={() => onView('compose')}
        />
      )}
    </BusinessPortalChrome>
  );
}
