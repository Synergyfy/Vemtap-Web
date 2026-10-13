import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface SupportScreenProps {
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

export function SupportScreen({ onBack, onOpenHelp }: SupportScreenProps) {
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
    <AppScreen surface="bg-surface">
      <header className="sticky top-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-border-subtle">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="text-heading-sm font-heading-sm text-text-primary tracking-tight truncate">
              Contact Support
            </h1>
          </div>
        </div>
      </header>

      <main className="flex flex-col px-margin pt-space-md pb-24 gap-space-lg">
        <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-start gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="headset_mic" className="text-[22px] text-on-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-label-md font-label-md text-text-primary font-semibold">
              VEMTAP Support Concierge
            </p>
            <p className="text-caption font-caption text-text-secondary mt-0.5">
              Typically replies within 10 minutes during Mon&ndash;Sat, 8AM&ndash;8PM WAT.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            What&apos;s this about?
          </h2>
          <div className="grid grid-cols-2 gap-space-xs">
            {TOPICS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTopic(item.id)}
                className={`flex items-center gap-space-sm p-space-sm rounded-xl border transition-colors text-left ${
                  topic === item.id
                    ? 'border-primary bg-surface-tint-blue'
                    : 'border-border-subtle bg-surface-container-lowest hover:border-outline-variant'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    topic === item.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary'
                  }`}
                >
                  <Icon name={item.icon} className="text-[18px]" filled={topic === item.id} />
                </div>
                <span className="text-label-sm font-label-sm text-text-primary truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
              Your message
            </h2>
            <span className="text-caption font-caption text-text-secondary">Optional attachments coming soon</span>
          </div>
          <textarea
            className="w-full rounded-xl border border-border-subtle bg-surface-subtle text-on-surface placeholder:text-text-tertiary focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md p-space-md min-h-[140px]"
            placeholder="Describe the issue or feedback. Include order IDs or deal names if relevant."
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </section>

        <button
          type="button"
          disabled={!canSend}
          onClick={() => {
            setMessage('');
            showToast('Message sent. We\u2019ll reply in-app shortly.');
          }}
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-semibold text-button-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-transform shadow-sm"
        >
          <Icon name="send" className="text-[18px]" />
          <span>Send Message</span>
        </button>

        {onOpenHelp && (
          <button
            type="button"
            onClick={onOpenHelp}
            className="w-full h-11 rounded-xl bg-surface-container-lowest border border-border-subtle text-label-md font-label-md text-text-primary font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
          >
            <Icon name="help" className="text-[18px] text-primary" />
            <span>Browse Help Centre first</span>
          </button>
        )}

        <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            Other ways to reach us
          </h2>
          <a
            className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle active:scale-[0.99] transition-transform"
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-9 h-9 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                <Icon name="chat" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-label-md font-label-md text-text-primary truncate">WhatsApp Desk</span>
                <span className="text-caption font-caption text-text-secondary truncate">Fastest outside chat hours</span>
              </div>
            </div>
            <Icon name="arrow_forward_ios" className="text-text-tertiary text-[18px] shrink-0" />
          </a>
          <a
            className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle active:scale-[0.99] transition-transform"
            href="mailto:support@vemtap.com"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="mail" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-label-md font-label-md text-text-primary truncate">Email</span>
                <span className="text-caption font-caption text-text-secondary truncate">support@vemtap.com</span>
              </div>
            </div>
            <Icon name="arrow_forward_ios" className="text-text-tertiary text-[18px] shrink-0" />
          </a>
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
