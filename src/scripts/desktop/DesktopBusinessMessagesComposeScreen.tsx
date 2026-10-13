import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { MessagesShareAttachmentModal } from './MessagesShareAttachmentModal';
import type { MessagesWorkspaceView } from './DesktopBusinessMessagesOrderContextScreen';

interface DesktopBusinessMessagesComposeScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onView: (view: MessagesWorkspaceView) => void;
}

type InboxFilter = 'all' | 'unread' | 'bookings';

interface InboxConv {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  preview: string;
  time: string;
  unread: number;
  tags: string[];
  channel: InboxFilter;
}

const INBOX: InboxConv[] = [
  {
    id: 'c1',
    name: 'Dr. Chidi Okafor',
    initials: 'CO',
    preview: 'Private dining for 8 — invoice to the firm.',
    time: '9:14 AM',
    unread: 2,
    tags: ['Booking BK-77402', 'Corporate'],
    channel: 'bookings',
  },
  {
    id: 'c2',
    name: 'Michael James',
    initials: 'MJ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkg9vSBZAqdcLqsKrI-vPk5IMlaP3d1iZTqQnDtmvgIQObdVyWAGgfUGsmdu6Wgv334gudx8U_w1HiwnJGk4wMObTNTqv90-nXlFDH0vgZ3oUb8o-d26kai20qTZW3bisdAjssax58TYaZ64OP4IfGZtYyzHXeL6nmGWI4ohAtRjsswr_9SJdFQZuTOPYOnsm_R9t4pfEQvu5z5-NmuH8xHrH0QxA2sSXlsP6BSsazWFJTqJuKGrHW_g',
    preview: 'Extra sauce confirmed — thanks!',
    time: '9:36 AM',
    unread: 0,
    tags: ['Order #VG-94021'],
    channel: 'all',
  },
  {
    id: 'c3',
    name: 'Sarah Adams',
    initials: 'SA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB-Xjt2yU9KoW80OqiT5QTHaJF_VRXqkLOMz6gTp2nbol94ih89z50F6yQaAogksU1ejODmqd9RLuHgfJSYliJpthg2Wz5IQNBkzlNe-PIPHaNvlkEgz4V-uu9bQ30CjyqOQHlKR_b3EWXf-MEuLkDv43_3mXLjeMx9ABjik0st2w8NDP0QKiY2K-MCdNAPguYBjF9PjTvdyjEnhRwBE8mgF239kTIlXgKwUES6Zk3',
    preview: 'Deal still available tonight?',
    time: '8:52 AM',
    unread: 1,
    tags: ['Deal #VT-48F261'],
    channel: 'unread',
  },
  {
    id: 'c4',
    name: 'Amina Bello',
    initials: 'AB',
    preview: 'On my way for pickup.',
    time: 'Yesterday',
    unread: 0,
    tags: ['Order #VG-93998'],
    channel: 'all',
  },
];

const TEMPLATES = [
  { id: 't1', icon: 'celebration', title: 'Birthday Greeting', body: 'Happy birthday from all of us at The Oak & Cellar! Your table is ready whenever you are.' },
  { id: 't2', icon: 'confirmation_number', title: 'Booking Confirmed', body: 'Your reservation is confirmed. We look forward to hosting you.' },
  { id: 't3', icon: 'local_offer', title: 'Deal Reminder', body: 'Your favorite deal is live again this week — tap to claim before it ends.' },
  { id: 't4', icon: 'schedule', title: 'Order Delay Notice', body: 'We are slightly behind on prep — your order will be ready in about 10 extra minutes. Sorry for the wait!' },
];

const ADDONS = [
  { id: 'a1', icon: 'local_offer', label: 'Attach Deal #VT-48F261' },
  { id: 'a2', icon: 'receipt_long', label: 'Attach Order #VG-94021' },
  { id: 'a3', icon: 'event', label: 'Attach Booking #BK-77402' },
];

export function DesktopBusinessMessagesComposeScreen({ onNav, onView }: DesktopBusinessMessagesComposeScreenProps) {
  const [selectedId, setSelectedId] = useState('c1');
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(
    'Dear Dr. Okafor, thank you for confirming your private dining request for 8 guests at 7:30 PM this Friday. Table 09 has been reserved, and our sommelier will prepare a curated pairing menu upon your arrival.'
  );
  const [charCount, setCharCount] = useState(184);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [attachedContext, setAttachedContext] = useState('BK-77402');
  const [activeAddons, setActiveAddons] = useState<string[]>(['a1']);
  const [showContextPicker, setShowContextPicker] = useState(false);

  const filtered = INBOX.filter((c) => {
    if (filter === 'unread' && c.unread === 0) return false;
    if (filter === 'bookings' && c.channel !== 'bookings') return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.preview.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = INBOX.find((c) => c.id === selectedId) ?? INBOX[0];
  const overLimit = charCount > 550;

  const updateDraft = (value: string) => {
    setDraft(value);
    setCharCount(value.length);
  };

  const toggleAddon = (id: string) => {
    setActiveAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const sendMessage = () => {
    if (!draft.trim() || sending || sent) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
      window.setTimeout(() => setSent(false), 1400);
    }, 900);
  };

  return (
    <BusinessPortalChrome activeNav="messages" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-md border-b border-border bg-surface flex flex-wrap items-center justify-between gap-space-md">
          <div className="min-w-0">
            <div className="font-label-sm text-label-sm text-text-tertiary">Messages / Direct Client Channels</div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Compose &amp; Attach Business Context</h1>
              <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                Realtime Sync
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button type="button" className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="list_alt" className="text-[16px]" />
              Message Logs
            </button>
            <button type="button" className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="tune" className="text-[16px]" />
              Channel Settings
            </button>
            <button type="button" onClick={() => onView('order-context')} className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="inbox" className="text-[16px]" />
              Inbox
            </button>
          </div>
        </div>

        <div className="w-full py-space-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md" style={{ height: 'calc(100vh - 160px)', minHeight: '680px' }}>
            <aside className="lg:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border space-y-space-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Client Inboxes</h2>
                  <span className="px-space-2xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">14 Open</span>
                </div>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search client inboxes…"
                    className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface-subtle font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-wrap gap-space-2xs">
                  {([
                    { key: 'all' as InboxFilter, label: 'All' },
                    { key: 'unread' as InboxFilter, label: 'Unread' },
                    { key: 'bookings' as InboxFilter, label: 'Bookings' },
                  ]).map((f) => (
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
                      className={`w-full text-left p-space-sm flex gap-space-sm transition-colors ${active ? 'bg-surface-tint-blue border-l-4 border-primary' : 'hover:bg-surface-subtle border-l-4 border-transparent'}`}
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
                        <span className="flex flex-wrap gap-1 mt-1">
                          {c.tags.map((t) => (
                            <span key={t} className="px-space-2xs py-space-2xs rounded bg-surface-subtle font-caption text-caption text-on-surface-variant">{t}</span>
                          ))}
                        </span>
                      </span>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 bg-error text-on-error rounded-full font-caption text-caption flex items-center justify-center font-semibold shrink-0 self-center">{c.unread}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-space-xs border-t border-border flex items-center justify-between font-caption text-caption text-text-tertiary">
                <span>Realtime Gateway · v2.4</span>
                <span className="flex items-center gap-space-2xs"><span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" /> Synced</span>
              </div>
            </aside>

            <section className="lg:col-span-5 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border space-y-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">To:</span>
                  <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-surface-tint-blue border border-primary/20">
                    <Icon name="verified" className="text-[14px] text-primary" filled />
                    <span className="font-label-sm text-label-sm text-on-surface">{selected.name}</span>
                    <button type="button" aria-label="Clear recipient" className="w-4 h-4 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error">
                      <Icon name="close" className="text-[12px]" />
                    </button>
                  </span>
                  <span className="px-space-2xs py-space-2xs rounded-full bg-surface-subtle font-caption text-caption text-on-surface-variant">Direct Client Channel</span>
                </div>
                <div className="relative rounded-xl border border-border bg-surface-subtle/50 p-space-xs flex items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                      <Icon name="event" className="text-[16px]" filled />
                    </span>
                    <div className="min-w-0">
                      <div className="font-label-sm text-label-sm text-on-surface truncate">
                        Confirmed Booking <span className="text-primary font-semibold">#{attachedContext}</span>
                      </div>
                      <div className="font-caption text-caption text-on-surface-variant">Fri 7:30 PM · Party of 8 · Table 09</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowContextPicker((v) => !v)}
                    className="font-label-sm text-label-sm text-primary hover:underline shrink-0"
                  >
                    Change Context
                  </button>
                  {showContextPicker && (
                    <div className="absolute top-full left-0 right-0 mt-space-2xs z-10 bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                      {['BK-77402', 'VG-94021', 'VT-48F261'].map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setAttachedContext(id); setShowContextPicker(false); }}
                          className="w-full text-left px-space-sm py-space-xs font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle"
                        >
                          {id.startsWith('BK') ? `Booking #${id}` : id.startsWith('VG') ? `Order #${id}` : `Deal #${id}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-space-2xs">
                  {ADDONS.map((a) => {
                    const active = activeAddons.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAddon(a.id)}
                        className={`flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full border font-label-sm text-label-sm transition-colors ${
                          active ? 'border-primary bg-surface-tint-blue text-primary font-semibold' : 'border-border text-on-surface-variant hover:bg-surface-subtle'
                        }`}
                      >
                        <Icon name={a.icon} className="text-[12px]" />
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-space-sm border-b border-border">
                <div className="flex items-center justify-between mb-space-xs">
                  <div className="flex items-center gap-space-2xs font-label-sm text-label-sm text-primary font-semibold">
                    <Icon name="auto_awesome" className="text-[14px]" filled />
                    VEMTAP Smart Draft
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button type="button" onClick={() => updateDraft('')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-error">Clear</button>
                    <button type="button" onClick={() => updateDraft('Dear guest, we are delighted to confirm your upcoming reservation. Our team is preparing everything for a memorable visit.')} className="font-label-sm text-label-sm text-primary hover:underline">Regenerate</button>
                  </div>
                </div>
                <textarea
                  rows={5}
                  value={draft}
                  onChange={(e) => updateDraft(e.target.value)}
                  className="w-full px-space-sm py-space-xs rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
                  placeholder="Write your message or let Smart Draft assist…"
                />
                <div className={`mt-space-2xs font-caption text-caption text-right ${overLimit ? 'text-error font-semibold' : 'text-text-tertiary'}`}>
                  {charCount} / 600
                </div>
              </div>

              <div className="p-space-sm border-b border-border">
                <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Preset Restaurant Templates</div>
                <div className="grid grid-cols-2 gap-space-xs">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateDraft(t.body)}
                      className="flex items-start gap-space-xs p-space-xs rounded-xl border border-border bg-surface text-left hover:bg-surface-subtle transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                        <Icon name={t.icon} className="text-[16px]" filled />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-label-sm text-label-sm text-on-surface">{t.title}</span>
                        <span className="block font-caption text-caption text-on-surface-variant truncate">{t.body}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto p-space-sm border-t border-border space-y-space-xs">
                <div className="flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 font-heading-sm text-heading-sm">O</span>
                    <div className="min-w-0">
                      <div className="font-label-sm text-label-sm text-on-surface truncate">The Oak &amp; Cellar</div>
                      <div className="font-caption text-caption text-on-surface-variant">Urban Grill · Front Desk Agent #04</div>
                    </div>
                  </div>
                  <button type="button" className="font-label-sm text-label-sm text-primary hover:underline shrink-0">Change Signer</button>
                </div>
                <div className="flex items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-2xs">
                    {[
                      { icon: 'image', label: 'Image' },
                      { icon: 'description', label: 'File' },
                      { icon: 'local_offer', label: 'Deal' },
                      { icon: 'receipt_long', label: 'Receipt' },
                    ].map((a) => (
                      <button key={a.icon} type="button" aria-label={a.label} onClick={() => setShowAttachment(true)} className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface">
                        <Icon name={a.icon} className="text-[18px]" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button type="button" className="h-11 px-space-md rounded-xl border border-border font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle">
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={!draft.trim() || sending || sent}
                      className={`h-11 px-space-md rounded-xl font-label-md text-label-md shadow-sm flex items-center gap-space-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        sent ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary text-on-primary hover:opacity-90'
                      }`}
                    >
                      {sent ? (
                        <>
                          <Icon name="check_circle" className="text-[18px]" filled />
                          Message Sent!
                        </>
                      ) : sending ? (
                        <>
                          <Icon name="progress_activity" className="text-[18px] animate-spin" />
                          Sending Context…
                        </>
                      ) : (
                        <>
                          <Icon name="send" className="text-[18px]" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="lg:col-span-4 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Customer Summary</h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                <div className="p-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm">CO</span>
                    <div>
                      <div className="font-heading-sm text-heading-sm text-on-surface">Dr. Chidi Okafor</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Corporate Account · Top 10% Spender</div>
                    </div>
                  </div>
                  <div className="mt-space-sm grid grid-cols-4 gap-space-2xs text-center">
                    {[
                      { label: 'Visits', value: '8' },
                      { label: 'Orders', value: '6' },
                      { label: 'Deals', value: '2' },
                      { label: 'Points', value: '1,280' },
                    ].map((s) => (
                      <div key={s.label} className="p-space-2xs rounded-lg bg-surface-subtle border border-border">
                        <div className="font-caption text-caption text-on-surface-variant">{s.label}</div>
                        <div className="font-label-md text-label-md text-on-surface font-semibold">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-space-sm space-y-space-xs font-body-sm text-body-sm">
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="flex items-center gap-space-2xs text-on-surface-variant"><Icon name="call" className="text-[14px] text-primary" /> +234 809 445 1122</span>
                    <button type="button" className="font-label-sm text-label-sm text-primary hover:underline">Call POS</button>
                  </div>
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="flex items-center gap-space-2xs text-on-surface-variant min-w-0 truncate"><Icon name="mail" className="text-[14px] text-primary shrink-0" /> chidi.okafor@firm.ng</span>
                    <button type="button" className="font-label-sm text-label-sm text-primary hover:underline shrink-0">Copy</button>
                  </div>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Hospitality Notes</div>
                  <ul className="space-y-space-xs">
                    {[
                      { icon: 'wine_bar', text: 'Prefers quiet corner seating' },
                      { icon: 'restaurant', text: 'No shellfish — kitchen aware' },
                      { icon: 'payments', text: 'Invoice to firm account, not personal card' },
                    ].map((n) => (
                      <li key={n.text} className="flex items-start gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <Icon name={n.icon} className="text-[14px] text-text-tertiary mt-0.5 shrink-0" />
                        {n.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Last known location</div>
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img
                      src="https://maps.googleapis.com/maps/api/staticmap?center=Wuse+II,+Abuja&zoom=15&size=400x160&key=AIzaSyDAEhEXg9l7Yx3kQ9W2mN5vC8pR1tT4uA0"
                      alt="Map preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="p-space-xs bg-surface-subtle font-caption text-caption text-on-surface-variant">Wuse II, Abuja · Last ping 8:40 PM</div>
                  </div>
                </div>

                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Recent transactions</div>
                  <table className="w-full font-body-sm text-body-sm">
                    <tbody className="divide-y divide-border">
                      {[
                        { id: 'TX-8841', amount: '₦42,000', date: 'Oct 4' },
                        { id: 'TX-8712', amount: '₦18,500', date: 'Sep 22' },
                      ].map((t) => (
                        <tr key={t.id}>
                          <td className="py-space-2xs text-on-surface">{t.id}</td>
                          <td className="py-space-2xs text-on-surface-variant text-right">{t.date}</td>
                          <td className="py-space-2xs text-on-surface font-medium text-right pl-space-xs">{t.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-space-sm">
                  <div className="rounded-xl border border-primary/30 bg-surface-tint-blue/50 p-space-sm flex items-start gap-space-xs">
                    <Icon name="support_agent" className="text-[18px] text-primary shrink-0 mt-0.5" filled />
                    <div>
                      <div className="font-label-sm text-label-sm text-on-surface font-semibold">Need Staff Backup?</div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Transfer this conversation to Floor Manager or Kitchen Lead with full context.</p>
                      <button type="button" className="mt-space-2xs h-9 px-space-sm rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90">
                        Transfer Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showAttachment && <MessagesShareAttachmentModal onClose={() => setShowAttachment(false)} />}
    </BusinessPortalChrome>
  );
}
