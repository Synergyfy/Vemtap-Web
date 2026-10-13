import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopSupportScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onOpenHelp?: () => void;
}

const TOPICS = [
  { id: 'deals', icon: 'local_offer', label: 'Deals & Claims' },
  { id: 'orders', icon: 'shopping_bag', label: 'Orders & Delivery' },
  { id: 'bookings', icon: 'calendar_today', label: 'Bookings' },
  { id: 'account', icon: 'person', label: 'Account & Login' },
  { id: 'payments', icon: 'account_balance', label: 'Payments' },
  { id: 'other', icon: 'help', label: 'Something Else' },
];

const CHANNELS: Array<{ href: string; icon: string; iconClass: string; label: string; sub: string }> = [
  {
    href: 'https://wa.me/2348000000000',
    icon: 'chat',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    label: 'WhatsApp Desk',
    sub: 'Fastest outside chat hours',
  },
  {
    href: 'mailto:support@vemtap.com',
    icon: 'mail',
    iconClass: 'bg-surface-tint-blue text-primary',
    label: 'Email',
    sub: 'support@vemtap.com',
  },
];

export function DesktopSupportScreen({ onNav, onBack, onOpenHelp }: DesktopSupportScreenProps) {
  const [topic, setTopic] = useState('deals');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const showToast = (text: string) => {
    setToast(text);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  const canSend = message.trim().length > 0;

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-2 font-label-sm text-label-sm text-text-tertiary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              Account
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-semibold">Contact Support</span>
          </nav>

          <div className="mb-8 max-w-3xl">
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              Contact Support
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Tell us what happened and the VEMTAP Support Concierge will get back to you — deals, orders, bookings,
              payments, or anything else about your account.
            </p>
          </div>

          <section className="rounded-xl bg-surface-container-lowest border border-border-subtle p-space-md shadow-sm flex items-start gap-space-sm mb-8">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Icon name="headset_mic" className="text-[22px] text-on-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-label-md text-label-md text-text-primary font-semibold">
                VEMTAP Support Concierge
              </p>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Typically replies within 10 minutes during Mon&ndash;Sat, 8AM&ndash;8PM WAT.
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            <aside className="w-full flex flex-col gap-space-md lg:sticky lg:top-24">
              <section className="flex flex-col gap-space-xs">
                <h2 className="font-label-md text-label-md text-text-primary font-bold uppercase tracking-wider">
                  What&apos;s this about?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-space-xs">
                  {TOPICS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTopic(item.id)}
                      className={`flex items-center gap-space-sm p-space-sm rounded-xl border transition-colors text-left ${
                        topic === item.id
                          ? 'border-primary bg-surface-tint-blue'
                          : 'border-border-subtle bg-surface-container-lowest hover:border-text-tertiary'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          topic === item.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-text-secondary'
                        }`}
                      >
                        <Icon name={item.icon} className="text-[18px]" filled={topic === item.id} />
                      </div>
                      <span className="font-label-sm text-label-sm text-text-primary truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            </aside>

            <div className="w-full flex flex-col gap-space-lg">
              <section className="rounded-xl bg-surface-container-lowest border border-border-subtle p-space-md shadow-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between gap-space-sm">
                  <h2 className="font-label-md text-label-md text-text-primary font-bold uppercase tracking-wider">
                    Your message
                  </h2>
                  <span className="font-caption text-caption text-text-secondary">Optional attachments coming soon</span>
                </div>
                <textarea
                  className="w-full rounded-xl border border-border-subtle bg-surface-subtle text-text-primary placeholder:text-text-tertiary focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md p-space-md min-h-[200px]"
                  placeholder="Describe the issue or feedback. Include order IDs or deal names if relevant."
                  rows={7}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-space-2xs">
                  <button
                    type="button"
                    disabled={!canSend}
                    onClick={() => {
                      setMessage('');
                      showToast('Message sent. We\u2019ll reply in-app shortly.');
                    }}
                    className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-opacity shadow-sm"
                  >
                    <Icon name="send" className="text-[18px]" />
                    <span>Send Message</span>
                  </button>

                  {onOpenHelp && (
                    <button
                      type="button"
                      onClick={onOpenHelp}
                      className="h-11 px-space-lg rounded-xl bg-surface-container-lowest border border-border-subtle font-label-md text-label-md text-text-primary font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
                    >
                      <Icon name="help" className="text-[18px] text-primary" />
                      <span>Browse Help Centre first</span>
                    </button>
                  )}
                </div>
              </section>

              <section className="rounded-xl bg-surface-container-lowest border border-border-subtle p-space-md shadow-sm flex flex-col gap-space-sm">
                <h2 className="font-label-md text-label-md text-text-primary font-bold uppercase tracking-wider">
                  Other ways to reach us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                  {CHANNELS.map((channel) => (
                    <a
                      key={channel.label}
                      className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors"
                      href={channel.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${channel.iconClass}`}
                        >
                          <Icon name={channel.icon} className="text-[20px]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-text-primary truncate">
                            {channel.label}
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate">{channel.sub}</span>
                        </div>
                      </div>
                      <Icon name="arrow_forward_ios" className="text-text-tertiary text-[18px] shrink-0" />
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-surface-container-lowest border border-border-subtle text-text-primary px-space-md py-2.5 font-label-md text-label-md shadow-lg">
          {toast}
        </div>
      )}
    </DesktopPage>
  );
}
