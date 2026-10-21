import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FilterMenu } from '../../components/FilterMenu';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { messageService, type MessageThread } from '../../services/messageService';

interface DesktopMessagesScreenProps {
  onNav: (key: DesktopNavKey) => void;
  initialThread?: string;
}

interface ThreadStrip {
  icon: string;
  title: string;
  chip: string;
  price: string;
  items: string;
  cta: string;
  nav: DesktopNavKey;
}

interface MerchantDossierData {
  category: string;
  email: string;
  engagement: {
    visits: string;
    orders: string;
    deals: string;
    points: string;
  };
  telemetry: {
    avgReply: string;
    hours: string;
    dealRedemption: string;
    tier: string;
    progress: number;
  };
  popularItems: string[];
  notes: Array<{ icon: string; label: string; value: string }>;
}

interface Thread {
  id: string;
  name: string;
  verified: boolean;
  time: string;
  tag: string;
  tagClass: string;
  tagIcon: string;
  preview: string;
  avatar: string;
  alt: string;
  unread: boolean;
  target?: DesktopNavKey;
  location: string;
  replies: string;
  status: string;
  statusTone: string;
  callLabel: string;
  phone: string;
  whatsapp: string;
  voucher?: string;
  booking?: string;
  notice?: string;
  strip?: ThreadStrip;
  dossier: MerchantDossierData;
}

interface ChatMessage {
  id: string | number;
  sender: 'merchant' | 'you';
  author: string;
  time: string;
  body: string;
  badge?: string;
  avatar?: string;
  avatarAlt?: string;
  delivered?: boolean;
}

const SMART_REPLIES = ['Yes, please!', 'On my way now', 'Can I change my time?', 'Table for 2 confirmed'];

const emptyDossier = (): MerchantDossierData => ({
  category: 'Business messaging',
  email: 'support@vemtap.com',
  engagement: { visits: '0', orders: '0', deals: '0', points: '0' },
  telemetry: { avgReply: '—', hours: '—', dealRedemption: 'Pending API sync', tier: 'Member', progress: 0 },
  popularItems: ['No data yet'],
  notes: [{ icon: 'info', label: 'Status', value: 'Waiting for backend thread data' }],
});

const mapThreadToDesktopThread = (thread: MessageThread): Thread => ({
  id: thread.id,
  name: thread.name,
  verified: thread.verified,
  time: thread.time,
  tag: thread.tag,
  tagClass: thread.tagClass,
  tagIcon: thread.tagIcon,
  preview: thread.preview,
  avatar: thread.avatar ?? '',
  alt: thread.alt ?? thread.name,
  unread: thread.unread,
  location: thread.location ?? 'Location pending',
  replies: '—',
  status: thread.status ?? 'Active',
  statusTone: 'bg-surface-container text-on-surface-variant font-medium',
  callLabel: 'Call',
  phone: thread.phone ?? '+0000000000',
  whatsapp: thread.phone ?? '+0000000000',
  dossier: emptyDossier(),
  strip: thread.deal
    ? {
        icon: 'local_offer',
        title: thread.deal.title,
        chip: `Code ${thread.deal.code}`,
        price: '—',
        items: thread.deal.title,
        cta: 'View deal',
        nav: 'my-deals',
      }
    : undefined,
});

const mapMessages = (thread: MessageThread): ChatMessage[] =>
  (thread.messages ?? []).map((message, index) => ({
    id: message.id ?? `msg-${index}`,
    sender: message.sender === 'you' ? 'you' : 'merchant',
    author: message.author,
    time: message.time,
    body: message.body,
    badge: message.badge,
    avatar: message.avatar,
    avatarAlt: message.avatarAlt,
    delivered: message.delivered ?? message.sender === 'you',
  }));

function nowTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function threadInitials(name: string): string {
  const words = name.split(' ').filter((word) => word.length > 2 && word !== 'And');
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function DesktopMessagesScreen({ onNav, initialThread }: DesktopMessagesScreenProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState(initialThread ?? '');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadThreads = async () => {
      try {
        const nextThreads = await messageService.listThreads();
        if (!isMounted) return;

        const mapped = nextThreads.map((thread) => mapThreadToDesktopThread(thread));
        setThreads(mapped);
        if (mapped.length > 0) {
          const fallbackId = initialThread && mapped.some((thread) => thread.id === initialThread)
            ? initialThread
            : mapped[0].id;
          setSelectedId(fallbackId);
        }
      } catch {
        if (isMounted) {
          setThreads([]);
          setSelectedId('');
        }
      }
    };

    loadThreads();
    return () => {
      isMounted = false;
    };
  }, [initialThread]);

  useEffect(() => {
    if (!selectedId) return;

    let isMounted = true;

    const loadSelectedThread = async () => {
      try {
        const nextThread = await messageService.getThread(selectedId);
        if (!isMounted || !nextThread) return;
        setThreads((current) => {
          const next = current.length > 0 ? current : [mapThreadToDesktopThread(nextThread)];
          const exists = next.some((thread) => thread.id === selectedId);
          if (exists) {
            return next.map((thread) => (thread.id === selectedId ? mapThreadToDesktopThread(nextThread) : thread));
          }
          return [...next, mapThreadToDesktopThread(nextThread)];
        });
        setTyping(false);
      } catch {
        if (isMounted) setTyping(false);
      }
    };

    loadSelectedThread();
    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const [messageStore, setMessageStore] = useState<Record<string, ChatMessage[]>>({});

  useEffect(() => {
    if (!selectedId) return;

    let isMounted = true;

    const loadSelectedMessages = async () => {
      try {
        const nextThread = await messageService.getThread(selectedId);
        if (!isMounted) return;

        setMessageStore((current) => ({
          ...current,
          [selectedId]: nextThread ? mapMessages(nextThread) : current[selectedId] ?? [],
        }));
      } catch {
        if (isMounted) {
          setMessageStore((current) => ({
            ...current,
            [selectedId]: current[selectedId] ?? [],
          }));
        }
      }
    };

    loadSelectedMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const selected = threads.find((thread) => thread.id === selectedId) ?? null;
  const messages = selectedId ? (messageStore[selectedId] ?? []) : [];

  const isUnread = (t: Thread) => t.unread && !readIds.includes(t.id);
  const unreadCount = threads.filter(isUnread).length;

  const filteredThreads = threads.filter((t) => {
    if (filter === 'unread' && !isUnread(t)) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.preview.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleSelectThread = (id: string) => {
    setSelectedId(id);
    setTyping(false);
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
    setDraft('');
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !selectedId) return;

    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      sender: 'you',
      author: 'You',
      time: nowTime(),
      body: trimmed,
      delivered: true,
    };

    setMessageStore((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }));
    setDraft('');
    setTyping(false);

    try {
      await messageService.sendReply(selectedId, trimmed);
    } catch {
      setMessageStore((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), { ...msg, id: `m${Date.now()}-retry`, body: `${msg.body} (pending sync)` }],
      }));
    }

    window.setTimeout(() => streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' }), 50);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(draft);
  };

  const quickAttach = (kind: 'voucher' | 'booking' | 'location') => {
    if (kind === 'voucher') {
      void sendMessage(selected?.voucher ? `Attached Deal Pass ${selected.voucher} for this order.` : 'Attached active deal voucher for redemption.');
      return;
    }
    if (kind === 'booking') {
      void sendMessage(selected?.booking ? `Booking reference ${selected.booking} shared with you.` : 'I would like to reference my upcoming reservation.');
      return;
    }
    void sendMessage('Location pin shared: Apo, Abuja (Within 2 km).');
  };

  if (!selected) {
    return (
      <DesktopPage withHeader withFooter onNav={onNav} activeNav="messages" withCustomerRail>
        <div className="w-full bg-background p-space-xl">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-space-lg text-center shadow-sm">
            <Icon name="forum" className="mx-auto mb-space-sm text-[42px] text-text-tertiary" />
            <h1 className="font-heading-lg text-heading-lg text-on-surface">No messages yet</h1>
            <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
              Start a chat from any business profile and your conversations will appear here.
            </p>
            <button
              type="button"
              onClick={() => onNav('discover')}
              className="mt-space-md inline-flex items-center justify-center rounded-full bg-primary px-space-md py-2.5 text-label-md font-semibold text-on-primary shadow-sm transition-opacity hover:opacity-90"
            >
              Browse businesses
            </button>
          </div>
        </div>
      </DesktopPage>
    );
  }

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="messages" withCustomerRail>
      <div className="w-full bg-background">
        {/* Top Header Bar — matches DesktopBusinessMessagesOrderContextScreen */}
        <div className="w-full py-space-md border-b border-border bg-surface flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Inbox &amp; Direct Messaging</h1>
            <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
              Merchant Sync Active
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <span>Avg response: ~5 min</span>
            {/* Mirrors the unread state so the header control filters the inbox too. */}
            <FilterMenu
              align="right"
              ariaLabel="Message filters"
              buttonClassName="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle transition-colors"
              choices={[
                { value: 'all', label: 'All messages' },
                { value: 'unread', label: 'Unread only' },
              ]}
              icon="tune"
              iconClassName="text-[18px]"
              label={null}
              onChange={(next) => setFilter(next as 'all' | 'unread')}
              title="Filter messages"
              value={filter}
            />
            <button
              type="button"
              onClick={() => onNav('discover')}
              className="h-9 px-space-sm rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 flex items-center gap-space-2xs shadow-sm transition-colors"
            >
              <Icon name="edit" className="text-[16px]" />
              New Chat
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('inbox-search-input')?.focus()}
              className="h-9 px-space-sm rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs transition-colors"
            >
              <Icon name="search" className="text-[16px]" />
              Search
            </button>
          </div>
        </div>

        {/* 3-Column Workspace — matches Business Desktop Messaging 3-column Layout */}
        <div className="w-full py-space-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md" style={{ height: 'calc(100vh - 140px)', minHeight: '680px' }}>
            
            {/* Column 1 (lg:col-span-3): Conversations List */}
            <aside className="lg:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border space-y-space-xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Conversations</h2>
                  <span className="px-space-2xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    {threads.length} Live
                  </span>
                </div>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
                  <input
                    id="inbox-search-input"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search inbox…"
                    className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface-subtle font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
                </div>
                {/* Consumer only has All and Unread per specification */}
                <div className="flex flex-wrap gap-space-2xs">
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm border transition-colors ${
                      filter === 'all'
                        ? 'bg-surface-tint-blue border-primary text-primary font-semibold'
                        : 'bg-surface border-border text-on-surface-variant hover:bg-surface-subtle'
                    }`}
                  >
                    All ({threads.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('unread')}
                    className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm border transition-colors ${
                      filter === 'unread'
                        ? 'bg-surface-tint-blue border-primary text-primary font-semibold'
                        : 'bg-surface border-border text-on-surface-variant hover:bg-surface-subtle'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Thread Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {filteredThreads.map((t) => {
                  const active = t.id === selectedId;
                  const unread = isUnread(t);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectThread(t.id)}
                      className={`w-full text-left p-space-sm flex gap-space-sm transition-colors ${
                        active ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <span className="relative shrink-0">
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.alt} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold flex items-center justify-center">
                            {threadInitials(t.name)}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-badge-discount-text border-2 border-surface" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-space-xs">
                          <span className="font-label-md text-label-md text-on-surface font-medium truncate flex items-center gap-1">
                            {t.name}
                            {t.verified && <Icon name="verified" className="text-primary text-[14px] shrink-0" />}
                          </span>
                          <span className={`font-caption text-caption shrink-0 ${unread ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
                            {t.time}
                          </span>
                        </span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant truncate">{t.preview}</span>
                        <span className="flex flex-wrap items-center gap-1 mt-1">
                          <span className={`px-space-2xs py-space-2xs rounded font-caption text-caption ${t.statusTone}`}>
                            {t.status.split('•')[0]?.trim() || 'Active'}
                          </span>
                          <span className="px-space-2xs py-space-2xs rounded bg-surface-subtle font-caption text-caption text-on-surface-variant truncate">
                            {t.tag}
                          </span>
                        </span>
                      </span>
                      {unread && (
                        <span className="w-5 h-5 bg-error text-on-error rounded-full font-caption text-caption flex items-center justify-center font-semibold shrink-0 self-center">
                          1
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredThreads.length === 0 && (
                  <div className="p-space-md font-body-md text-body-md text-on-surface-variant text-center">
                    No conversations match.
                  </div>
                )}
              </div>

              {/* Socket Status Bottom */}
              <div className="p-space-xs border-t border-border flex items-center justify-between font-caption text-caption text-text-tertiary">
                <span className="flex items-center gap-space-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                  Socket connected (Cluster APO-01)
                </span>
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="flex items-center gap-space-2xs text-primary hover:underline"
                >
                  <Icon name="refresh" className="text-[14px]" />
                  Refresh
                </button>
              </div>
            </aside>

            {/* Column 2 (lg:col-span-6): Active Conversation & Composer */}
            <section className="lg:col-span-6 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-space-md border-b border-border flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="relative shrink-0">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt={selected.alt} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold flex items-center justify-center">
                        {threadInitials(selected.name)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-badge-discount-text border-2 border-surface" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-heading-sm text-heading-sm text-on-surface truncate flex items-center gap-1.5">
                      <span>{selected.name}</span>
                      {selected.verified && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                          <Icon name="verified" className="text-[12px]" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-space-2xs font-caption text-caption text-on-surface-variant">
                      <span className="px-space-2xs rounded bg-badge-discount-bg text-badge-discount-text font-semibold">
                        Online now
                      </span>
                      <span>{selected.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-space-xs">
                  <a
                    href={`tel:${selected.phone}`}
                    aria-label="Call"
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle transition-colors"
                  >
                    <Icon name="call" className="text-[18px]" />
                  </a>
                  {selected.target && (
                    <button
                      type="button"
                      aria-label="Storefront"
                      onClick={() => onNav(selected.target!)}
                      className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle transition-colors"
                      title="Storefront Profile"
                    >
                      <Icon name="storefront" className="text-[18px]" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="More options"
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle transition-colors"
                  >
                    <Icon name="more_vert" className="text-[18px]" />
                  </button>
                </div>
              </div>

              {/* Context / Attached deal or order strip */}
              {selected.strip ? (
                <div className="px-space-md py-space-xs border-b border-border bg-surface-tint-blue/40 flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <Icon name={selected.strip.icon} className="text-[16px] text-primary shrink-0" />
                    <span className="font-label-sm text-label-sm text-on-surface truncate">
                      <span className="text-primary font-semibold uppercase">{selected.strip.title}</span>
                      <span className="text-on-surface-variant"> · </span>
                      {selected.strip.chip}
                      <span className="text-on-surface-variant"> · </span>
                      <span className="font-semibold">{selected.strip.price}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNav(selected.strip!.nav)}
                    className="font-label-sm text-label-sm text-primary hover:underline shrink-0"
                  >
                    {selected.strip.cta}
                  </button>
                </div>
              ) : selected.voucher ? (
                <div className="px-space-md py-space-xs border-b border-border bg-surface-tint-blue/40 flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <Icon name="local_offer" className="text-[16px] text-primary shrink-0" />
                    <span className="font-label-sm text-label-sm text-on-surface truncate">
                      <span className="text-primary font-semibold">DEAL PASS ATTACHED</span>
                      <span className="text-on-surface-variant"> · </span>
                      #{selected.voucher}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNav('my-deals')}
                    className="font-label-sm text-label-sm text-primary hover:underline shrink-0"
                  >
                    View Voucher
                  </button>
                </div>
              ) : null}

              {/* Message Stream */}
              <div ref={streamRef} className="flex-1 overflow-y-auto p-space-md space-y-space-sm bg-surface-subtle/30">
                <div className="flex justify-center">
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface border border-border font-caption text-caption text-text-tertiary">
                    Today · Oct 11, 2026
                  </span>
                </div>

                {messages.map((m) => {
                  const isYou = m.sender === 'you';
                  return isYou ? (
                    <div key={m.id} className="flex gap-space-xs justify-end">
                      <div className="max-w-[75%]">
                        <div className="px-space-sm py-space-xs rounded-2xl rounded-br-md bg-primary text-on-primary">
                          <p className="font-body-md text-body-md whitespace-pre-wrap">{m.body}</p>
                        </div>
                        <div className="font-caption text-caption text-text-tertiary mt-1 flex items-center justify-end gap-1">
                          {m.time}
                          {m.delivered && (
                            <>
                              <Icon name="done_all" className="text-[14px] text-primary" filled />
                              <span>Delivered</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-space-xs justify-start">
                      {selected.avatar ? (
                        <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold flex items-center justify-center self-end">
                          {threadInitials(selected.name)}
                        </div>
                      )}
                      <div className="max-w-[75%]">
                        <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border text-on-surface">
                          {m.badge && (
                            <div className="flex items-center gap-1 mb-1">
                              <span className="font-caption text-caption font-semibold text-text-secondary">{m.author}</span>
                              <span className="px-1.5 py-0.2 rounded bg-surface-subtle font-caption text-[10px] font-bold">
                                {m.badge}
                              </span>
                            </div>
                          )}
                          <p className="font-body-md text-body-md whitespace-pre-wrap">{m.body}</p>
                        </div>
                        <div className="font-caption text-caption text-text-tertiary mt-1">{m.time}</div>
                      </div>
                    </div>
                  );
                })}

                {typing && (
                  <div className="flex gap-space-xs justify-start">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full object-cover self-end" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold flex items-center justify-center self-end">
                        {threadInitials(selected.name)}
                      </div>
                    )}
                    <div className="px-space-sm py-space-xs rounded-2xl rounded-bl-md bg-surface border border-border flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="font-body-sm text-body-sm text-on-surface-variant ml-1">
                        {selected.name} staff is active
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Composer Deck */}
              <div className="p-space-sm border-t border-border space-y-space-xs">
                {/* Smart Replies */}
                <div className="flex flex-wrap gap-space-2xs">
                  {SMART_REPLIES.map((r) => (
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

                {/* Input area */}
                <form onSubmit={handleSubmit} className="flex items-end gap-space-xs">
                  <div className="flex items-center gap-space-2xs">
                    <button
                      type="button"
                      aria-label="Attach Voucher"
                      onClick={() => quickAttach('voucher')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors"
                      title="Attach Voucher"
                    >
                      <Icon name="redeem" className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      aria-label="Reference Booking"
                      onClick={() => quickAttach('booking')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors"
                      title="Reference Booking"
                    >
                      <Icon name="receipt_long" className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      aria-label="Share Location"
                      onClick={() => quickAttach('location')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors"
                      title="Share Location"
                    >
                      <Icon name="near_me" className="text-[18px]" />
                    </button>
                  </div>
                  <textarea
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(draft);
                      }
                    }}
                    placeholder={`Message ${selected.name}…`}
                    className="flex-1 px-space-sm py-space-xs rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-space-2xs transition-all"
                  >
                    <Icon name="send" className="text-[18px]" />
                    Send
                  </button>
                </form>
                <div className="font-caption text-caption text-text-tertiary text-right">
                  Enter to send • Shift+Enter for new line
                </div>
              </div>
            </section>

            {/* Column 3 (lg:col-span-3): Merchant Dossier / Business Profile Column — mirrors Customer Dossier */}
            <aside className="lg:col-span-3 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
              <div className="p-space-sm border-b border-border">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Merchant Dossier</h2>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {/* Profile card */}
                <div className="p-space-sm">
                  <div className="flex items-center gap-space-sm">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt={selected.alt} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold flex items-center justify-center">
                        {threadInitials(selected.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-heading-sm text-heading-sm text-on-surface truncate flex items-center gap-1">
                        <span>{selected.name}</span>
                        {selected.verified && (
                          <Icon name="verified" className="text-primary text-[15px] shrink-0" />
                        )}
                      </div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant truncate">
                        {selected.dossier.category}
                      </div>
                    </div>
                  </div>

                  {/* Contact items */}
                  <div className="mt-space-sm space-y-space-2xs font-body-sm text-body-sm text-on-surface-variant">
                    <div className="flex items-center gap-space-xs truncate">
                      <Icon name="call" className="text-[14px] text-primary shrink-0" />
                      <a href={`tel:${selected.phone}`} className="hover:underline">
                        {selected.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-space-xs truncate">
                      <Icon name="mail" className="text-[14px] text-primary shrink-0" />
                      <span>{selected.dossier.email}</span>
                    </div>
                    <div className="flex items-center gap-space-xs truncate">
                      <Icon name="location_on" className="text-[14px] text-primary shrink-0" />
                      <span>{selected.location}</span>
                    </div>
                  </div>
                </div>

                {/* Your Engagement with Merchant */}
                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                    Your Engagement
                  </div>
                  <div className="grid grid-cols-2 gap-space-xs">
                    {[
                      { label: 'Visits', value: selected.dossier.engagement.visits },
                      { label: 'Orders', value: selected.dossier.engagement.orders },
                      { label: 'Deals Used', value: selected.dossier.engagement.deals },
                      { label: 'Tap Points', value: selected.dossier.engagement.points },
                    ].map((s) => (
                      <div key={s.label} className="p-space-xs rounded-xl bg-surface-subtle border border-border">
                        <div className="font-caption text-caption text-on-surface-variant">{s.label}</div>
                        <div className="font-heading-sm text-heading-sm text-on-surface">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relationship Telemetry */}
                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                    Merchant Telemetry
                  </div>
                  <div className="space-y-space-2xs font-body-sm text-body-sm">
                    {[
                      { label: 'Avg response time', value: selected.dossier.telemetry.avgReply },
                      { label: 'Operating hours', value: selected.dossier.telemetry.hours },
                      { label: 'Deal redemption', value: selected.dossier.telemetry.dealRedemption },
                      { label: 'Patron tier', value: selected.dossier.telemetry.tier },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center justify-between">
                        <span className="text-on-surface-variant">{r.label}</span>
                        <span className="text-on-surface font-medium">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-space-sm">
                    <div className="flex items-center justify-between font-label-sm text-label-sm mb-space-2xs">
                      <span className="text-on-surface-variant">Tier Progress</span>
                      <span className="text-primary font-semibold">{selected.dossier.telemetry.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${selected.dossier.telemetry.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Popular / Signature Items */}
                <div className="p-space-sm">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">
                    Popular Items
                  </div>
                  <div className="flex flex-wrap gap-space-2xs">
                    {selected.dossier.popularItems.map((item) => (
                      <span
                        key={item}
                        className="px-space-xs py-space-2xs rounded-full bg-surface-subtle border border-border font-caption text-caption text-on-surface-variant"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-space-sm flex items-center gap-space-xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text w-fit">
                    <Icon name="verified" className="text-[14px]" filled />
                    <span className="font-caption text-caption font-semibold">VEMTAP Tap-Pass verified</span>
                  </div>
                </div>

                {/* Storefront button */}
                <div className="p-space-sm">
                  <button
                    type="button"
                    onClick={() => onNav(selected.target ?? 'discover')}
                    className="w-full h-11 rounded-xl border border-primary text-primary font-label-sm text-label-sm hover:bg-surface-tint-blue flex items-center justify-center gap-space-2xs transition-colors"
                  >
                    <Icon name="storefront" className="text-[16px]" />
                    View Storefront &amp; Menu
                  </button>
                </div>

                {/* Notes and Policies */}
                <div className="p-space-sm">
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Merchant Information</span>
                  </div>
                  <ul className="space-y-space-2xs">
                    {selected.dossier.notes.map((n) => (
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
              </div>

              {/* Bottom Quick Actions */}
              <div className="p-space-xs border-t border-border flex items-center gap-space-xs">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex-1 h-10 rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center justify-center gap-space-2xs transition-colors"
                >
                  <Icon name="call" className="text-[16px]" />
                  Call
                </a>
                <button
                  type="button"
                  onClick={() => onNav('my-deals')}
                  className="flex-1 h-10 rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center justify-center gap-space-2xs transition-colors"
                >
                  <Icon name="local_offer" className="text-[16px]" />
                  Deals
                </button>
                <button
                  type="button"
                  onClick={() => onNav(selected.target ?? 'discover')}
                  className="flex-1 h-10 rounded-xl border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-subtle flex items-center justify-center gap-space-2xs transition-colors"
                >
                  <Icon name="storefront" className="text-[16px]" />
                  Menu
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
