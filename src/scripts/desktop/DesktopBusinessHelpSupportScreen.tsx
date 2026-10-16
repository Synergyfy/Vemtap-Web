import { useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
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

  const showToast = (messageText: string) => {
    setToast(messageText);
    window.setTimeout(() => setToast((current) => (current === messageText ? null : current)), 2600);
  };

  const needle = query.trim().toLowerCase();
  const faqs = needle
    ? FAQS.filter((faq) => faq.question.toLowerCase().includes(needle) || faq.keywords.includes(needle))
    : FAQS;

  const toggleFaq = (id: string) =>
    setExpanded((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));

  const submitTicket = () => {
    if (message.trim().length < 10) {
      showToast('Add a little more detail (at least 10 characters)');
      return;
    }
    const id = `VT-${Math.floor(100000 + Math.random() * 899999)}`;
    setMessage('');
    showToast(`Ticket ${id} submitted — we reply by email`);
  };

  return (
    <BusinessPortalChrome activeNav="more-support" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg">
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
              className="rounded-2xl bg-surface-canvas shadow-sm p-space-lg flex flex-col gap-space-sm"
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
                onClick={() => showToast(`${channel.action} — connecting you to the merchant desk…`)}
                className="mt-auto h-10 px-space-sm rounded-xl bg-surface-container text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs hover:bg-surface-container-high transition-colors"
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
