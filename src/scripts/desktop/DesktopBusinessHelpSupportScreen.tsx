import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../../components/ui/Icon';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { supportService, type SupportTicket } from '../../services/supportService';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessHelpSupportScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

interface Faq {
  id: string;
  question: string;
  answer: ReactNode;
  keywords: string;
}

/**
 * Merchant-focused FAQs — the public consumer help centre (routes 'help' /
 * 'support') covers shoppers, not account holders.
 */
const FAQS: Faq[] = [
  {
    id: 'hf1',
    question: 'How do payouts and settlement work?',
    keywords: 'payout settlement bank transfer money gtbank',
    answer: (
      <div className="pt-space-2xs flex flex-col gap-space-2xs">
        <p>
          Card and transfer takings settle to your linked account <strong className="text-text-primary">T+1 by 10:00
          WAT</strong> on business days. Settlement status is shown under Payouts in your notifications feed.
        </p>
        <p>Need a different settlement account? Update it from Business Profile → Bank &amp; Settlement.</p>
      </div>
    ),
  },
  {
    id: 'hf2',
    question: 'A customer paid but the order never appeared at the till',
    keywords: 'missing order payment till pos sync offline',
    answer: (
      <div className="pt-space-2xs flex flex-col gap-space-2xs">
        <p>
          Check <strong className="text-text-primary">POS → Offline &amp; Sync</strong> first — offline orders replay
          automatically once the terminal reconnects.
        </p>
        <p>If it is still missing after 5 minutes, start a support chat with the order number and we will trace it.</p>
      </div>
    ),
  },
  {
    id: 'hf3',
    question: 'How do I update my CAC or director verification details?',
    keywords: 'verification cac kyc director update tier',
    answer: (
      <p>
        Open <strong className="text-text-primary">More → Verification</strong> and choose &quot;Update Verification
        Information&quot;. Re-submitted documents are reviewed within 2 business days and your Tier badge updates
        automatically.
      </p>
    ),
  },
  {
    id: 'hf4',
    question: 'How do I change my transaction PIN?',
    keywords: 'pin change security transaction passcode',
    answer: (
      <p>
        Go to <strong className="text-text-primary">More → Business Settings → Security</strong> and pick
        &quot;Change transaction PIN&quot;. You will need your current PIN and an OTP sent to your business email.
      </p>
    ),
  },
  {
    id: 'hf5',
    question: 'How do I exercise my NDPR data rights?',
    keywords: 'ndpr ndpa privacy data export delete rectify gdpr rights',
    answer: (
      <div className="pt-space-2xs flex flex-col gap-space-2xs">
        <p>
          All NDPR rights live in <strong className="text-text-primary">More → Business Settings → Privacy &amp; NDPR</strong>:
          export your archive, rectify records, restrict processing or request deletion.
        </p>
        <p>Data subject requests are acknowledged within 72 hours as required by the NDPR.</p>
      </div>
    ),
  },
  {
    id: 'hf6',
    question: 'Can I remove my business and close the account?',
    keywords: 'delete account close purge remove deactivate',
    answer: (
      <p>
        Yes. <strong className="text-text-primary">More → Business Settings → Danger zone → Delete business account</strong>.
        Deletion is permanent: deals, vouchers, customer records and payout history are purged after the verification
        step.
      </p>
    ),
  },
];

const CHANNELS: {
  id: string;
  icon: string;
  iconClass: string;
  title: string;
  meta: string;
  desc: string;
  action: string;
}[] = [
  {
    id: 'chat',
    icon: 'support_agent',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Live merchant chat',
    meta: 'Mon–Sat · 8:00–22:00 WAT',
    desc: 'Median first reply under 4 minutes.',
    action: 'Start chat',
  },
  {
    id: 'whatsapp',
    icon: 'forum',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'WhatsApp Business',
    meta: '+234 700 VEMTAP',
    desc: 'Send screenshots and terminal error codes.',
    action: 'Open chat',
  },
  {
    id: 'email',
    icon: 'mail',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    title: 'Email desk',
    meta: 'merchants@vemtap.com',
    desc: 'Best for documents, invoices and NDPR requests.',
    action: 'Compose',
  },
  {
    id: 'phone',
    icon: 'call',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Phone support',
    meta: '0800-VEMTAP (toll free)',
    desc: 'Urgent till-down or payout issues only.',
    action: 'Call now',
  },
];

const TOPICS = [
  'Orders & POS',
  'Payouts & settlement',
  'Storefront & QR codes',
  'Verification & NDPR',
  'Subscription & billing',
  'Something else',
];


/**
 * Dashboard Help & Support — reached from More → Help & Support and the header
 * help button. Merchant support inside the business portal chrome; the public
 * consumer help centre stays on routes 'help' / 'support'.
 */
export function DesktopBusinessHelpSupportScreen({ onNav }: DesktopBusinessHelpSupportScreenProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Live Chat Drawer State
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'support'; text: string; time: string }>>([
    {
      sender: 'support',
      text: 'Hello! Welcome to Vemtap Merchant Support Desk (Abuja Hub). How can we assist you with your business account or terminals today?',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Submitted tickets state
  const [submittedTickets, setSubmittedTickets] = useState<Array<{ id: string; topic: string; message: string; date: string; status: string }>>([
    {
      id: 'VT-741920',
      topic: 'Payouts & settlement',
      message: 'Settlement confirmation for Oct 15 POS batch takings.',
      date: 'Yesterday, 4:15 PM',
      status: 'Resolved',
    },
  ]);

  const showToast = (messageText: string) => {
    setToast(messageText);
    window.setTimeout(() => setToast((current) => (current === messageText ? null : current)), 3000);
  };

  // Live: the account's real tickets (`GET /support/tickets`); new ones go to `POST /support/tickets`.
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const ticketsQuery = useQuery({ queryKey: ['support', 'tickets'], queryFn: supportService.tickets, enabled: live });
  const createTicket = useMutation({
    mutationFn: supportService.createTicket,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] }),
  });
  const ticketStatus = (ticket: SupportTicket) =>
    String(ticket.status)
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (letter) => letter.toUpperCase());
  const ticketDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';
  const ticketRows = live
    ? (ticketsQuery.data ?? []).map((ticket) => ({
        id: ticket.id.slice(0, 8).toUpperCase(),
        topic: ticket.category || ticket.subject,
        message: ticket.subject,
        date: ticketDate(ticket.createdAt),
        status: ticketStatus(ticket),
      }))
    : submittedTickets;

  const needle = query.trim().toLowerCase();
  const faqs = needle
    ? FAQS.filter((faq) => faq.question.toLowerCase().includes(needle) || faq.keywords.includes(needle))
    : FAQS;

  const toggleFaq = (id: string) =>
    setExpanded((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));

  const handleChannelClick = (channelId: string) => {
    switch (channelId) {
      case 'chat':
        setShowChatModal(true);
        break;
      case 'whatsapp':
        window.open('https://wa.me/2347000836827?text=Hello%20Vemtap%20Merchant%20Support%2C%20I%20need%20assistance%20with%20my%20business%20account.', '_blank');
        showToast('Opening WhatsApp Business (+234 700 VEMTAP)...');
        break;
      case 'email':
        window.location.href = 'mailto:merchants@vemtap.com?subject=Merchant%20Support%20Request%20-%20Urban%20Grill&body=Hello%20Vemtap%20Team%2C%0A%0AI%20need%20assistance%20with%3A%0A';
        showToast('Opening email client for merchants@vemtap.com...');
        break;
      case 'phone':
        window.location.href = 'tel:0800836827';
        showToast('Dialing Vemtap Toll-Free Support (0800-VEMTAP)...');
        break;
      default:
        showToast('Connecting you to support...');
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setChatInput('');

    if (live) {
      // Live: the automated support bot answers; it offers a human hand-off when unsure.
      supportService
        .queryBot({ query: userMsg, context: 'Business Help & Support' })
        .then((reply) => {
          const body = (reply ?? {}) as { content?: unknown; message?: unknown };
          const text =
            (typeof body.content === 'string' && body.content) ||
            (typeof body.message === 'string' && body.message) ||
            'Support is unavailable right now — please open a ticket below.';
          setChatMessages((prev) => [...prev, { sender: 'support', text, time: 'Just now' }]);
        })
        .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not reach support.')));
      return;
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'support',
          text: `Thank you for your message. An agent has received your query regarding "${userMsg.slice(0, 35)}${userMsg.length > 35 ? '...' : ''}" and will follow up immediately.`,
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  const submitTicket = () => {
    if (message.trim().length < 10) {
      showToast('Add a little more detail (at least 10 characters)');
      return;
    }
    if (live) {
      const body = message.trim();
      createTicket.mutate(
        { subject: body.length > 80 ? `${body.slice(0, 77)}…` : body, category: topic, message: body },
        {
          onSuccess: (ticket) => {
            setMessage('');
            showToast(`Ticket ${ticket.id.slice(0, 8).toUpperCase()} created — our team will respond via email.`);
          },
          onError: (error) => showToast(apiErrorMessage(error, 'Could not create your ticket.')),
        },
      );
      return;
    }
    const id = `VT-${Math.floor(100000 + Math.random() * 899999)}`;
    const newTicket = {
      id,
      topic,
      message: message.trim(),
      date: 'Just now',
      status: 'Open · Under Review',
    };
    setSubmittedTickets((prev) => [newTicket, ...prev]);
    setMessage('');
    showToast(`Ticket ${id} created successfully! Our team will respond via email.`);
  };

  return (
    <BusinessPortalChrome activeNav="more-support" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg relative">
        <section className="flex flex-col gap-space-2xs max-w-3xl">
          <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
            More · Account
          </span>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Help &amp; Support</h1>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Merchant help desk for your business account — search merchant guides, reach the team, or open a ticket
            that stays attached to your dashboard.
          </p>
        </section>

        <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-md flex flex-col md:flex-row md:items-center gap-space-sm">
          <div className="flex items-center gap-space-sm flex-1 h-12 px-space-sm rounded-xl bg-surface-subtle border border-border-subtle focus-within:border-primary transition-colors">
            <Icon name="search" className="text-[20px] text-text-tertiary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search merchant guides — payouts, PIN, verification…"
              className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-text-tertiary"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                title="Clear search"
                className="text-text-tertiary hover:text-on-surface"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-space-2xs px-space-sm h-12 rounded-xl bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold shrink-0">
            <Icon name="verified_user" className="text-[16px]" />
            <span>All systems operational</span>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-lg">
          {CHANNELS.map((channel) => (
            <div
              key={channel.id}
              className="rounded-2xl bg-surface-canvas shadow-sm p-space-lg flex flex-col gap-space-sm hover:shadow-md transition-shadow"
            >
              <span className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${channel.iconClass}`}>
                <Icon name={channel.icon} className="text-[22px]" />
              </span>
              <div className="flex flex-col gap-space-2xs">
                <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">{channel.title}</h2>
                <span className="font-label-sm text-label-sm text-primary font-semibold">{channel.meta}</span>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">{channel.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => handleChannelClick(channel.id)}
                className="mt-auto h-10 px-space-sm rounded-xl bg-surface-container text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98]"
              >
                <span>{channel.action}</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          ))}
        </section>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-start">
          <div className="lg:col-span-2 flex flex-col gap-space-sm">
            <section className="rounded-2xl bg-surface-canvas shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-space-sm px-space-lg py-space-md border-b border-border-subtle">
                <div className="flex items-center gap-space-sm">
                  <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="help_outline" className="text-[20px]" />
                  </span>
                  <div className="flex flex-col">
                    <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                      Merchant guides &amp; FAQs
                    </h2>
                    <span className="font-caption text-caption text-text-secondary">
                      {faqs.length} of {FAQS.length} articles
                    </span>
                  </div>
                </div>
              </div>

              {faqs.length === 0 ? (
                <div className="p-space-xl flex flex-col items-center gap-space-sm text-center">
                  <Icon name="search_off" className="text-[26px] text-text-tertiary" />
                  <p className="font-label-md text-label-md text-on-surface font-semibold">No matching guides</p>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Nothing matched “{query}”. Open a ticket below and we will answer directly.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {faqs.map((faq) => {
                    const open = expanded.includes(faq.id);
                    return (
                      <div key={faq.id}>
                        <button
                          type="button"
                          onClick={() => toggleFaq(faq.id)}
                          aria-expanded={open}
                          className="w-full flex items-center justify-between gap-space-sm px-space-lg py-space-md text-left hover:bg-surface-subtle transition-colors"
                        >
                          <span className="font-label-md text-label-md text-on-surface font-semibold">{faq.question}</span>
                          <Icon
                            name="expand_more"
                            className={`text-[20px] text-text-tertiary shrink-0 transition-transform ${
                              open ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {open && (
                          <div className="px-space-lg pb-space-md font-body-md text-body-md text-text-secondary leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>


          <aside className="w-full flex flex-col gap-space-lg lg:sticky lg:top-24">
            <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-lg flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <Icon name="contact_mail" className="text-[20px]" />
                </span>
                <div className="flex flex-col">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Open a ticket</h2>
                  <span className="font-caption text-caption text-text-secondary">Replies land in your email</span>
                </div>
              </div>

              <label className="flex flex-col gap-space-2xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Topic</span>
                <select
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="h-11 px-space-sm rounded-xl bg-surface-subtle border border-border-subtle font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                >
                  {TOPICS.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-space-2xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-semibold">What happened?</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  placeholder="Include order numbers, terminal IDs or error codes where possible."
                  className="px-space-sm py-space-sm rounded-xl bg-surface-subtle border border-border-subtle font-body-md text-body-md text-on-surface placeholder:text-text-tertiary outline-none focus:border-primary transition-colors resize-none"
                />
              </label>

              <button
                type="button"
                onClick={submitTicket}
                className="h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-sm active:scale-[0.98] transition-transform"
              >
                <span>Submit ticket</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>

              <p className="font-caption text-caption text-text-tertiary leading-relaxed">
                Urgent till-down? Use Live merchant chat for the fastest response.
              </p>

              {/* Recent Active Tickets */}
              {ticketRows.length > 0 && (
                <div className="mt-space-md pt-space-md border-t border-border-subtle flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Your Support Tickets ({ticketRows.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {ticketRows.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">{t.id}</span>
                          <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-semibold text-[10px]">
                            {t.status}
                          </span>
                        </div>
                        <span className="text-text-primary font-medium line-clamp-1">{t.topic}</span>
                        <span className="text-text-tertiary text-[11px]">{t.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-surface-tint-blue p-space-md flex items-start gap-space-sm">
              <Icon name="bolt" className="text-primary text-[20px] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Before you write…</span>
                <button
                  type="button"
                  onClick={() => onNav('more-notifications')}
                  className="text-left font-caption text-caption text-primary hover:underline"
                >
                  Check Notifications for known incidents →
                </button>
                <button
                  type="button"
                  onClick={() => onNav('more-verification')}
                  className="text-left font-caption text-caption text-primary hover:underline"
                >
                  Check Verification status for document requests →
                </button>
              </div>
            </section>
          </aside>
        </div>

        {/* Live Merchant Support Chat Modal */}
        {showChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-canvas border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[560px]">
              {/* Header */}
              <div className="p-4 bg-surface-container border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
                      VT
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface-canvas" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                      Vemtap Merchant Desk
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        Live Agent
                      </span>
                    </h3>
                    <p className="text-xs text-text-secondary">Chidinma · Typical reply &lt; 2 mins</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-canvas flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-canvas">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-primary-container text-white rounded-br-none shadow-md'
                          : 'bg-surface-container border border-border-subtle text-text-primary rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`block text-[10px] mt-1 text-right ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-text-tertiary'
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 bg-surface-subtle border-t border-border-subtle flex gap-1.5 overflow-x-auto no-scrollbar">
                {['Payout inquiry', 'POS till issue', 'Update KYC', 'Storefront QR'].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setChatInput(prompt);
                    }}
                    className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-[11px] text-text-secondary hover:text-primary whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChatMessage} className="p-3 bg-surface-container border-t border-border-subtle flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message to merchant support..."
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-canvas border border-border-subtle text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:opacity-95 transition-opacity"
                >
                  <Icon name="send" className="text-[18px]" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-margin">
          <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-space-2xs max-w-[90vw]">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" filled />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
