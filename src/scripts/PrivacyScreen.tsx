import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface PrivacyScreenProps {
  onBack: () => void;
  onOpenTerms?: () => void;
}

interface ToggleRow {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const TOGGLES: ToggleRow[] = [
  {
    id: 'location',
    icon: 'location_on',
    title: 'Location Services',
    desc: 'Used to surface nearby merchants and deals.',
  },
  {
    id: 'personalisation',
    icon: 'tune',
    title: 'Personalised Recommendations',
    desc: 'Tailor deal feeds based on your claims and visits.',
  },
  {
    id: 'analytics',
    icon: 'insights',
    title: 'Usage Analytics',
    desc: 'Anonymous metrics that help improve VEMTAP.',
  },
  {
    id: 'marketing',
    icon: 'campaign',
    title: 'Marketing Notifications',
    desc: 'Occasional promos from VEMTAP (not from merchants).',
  },
];

const CONSENTS = [
  {
    id: 'ndpr',
    title: 'NDPR Data Processing',
    desc: 'We process your data in line with the Nigeria Data Protection Regulation. You may export or request deletion at any time.',
  },
  {
    id: 'retention',
    title: 'Data Retention',
    desc: 'Claim history is kept for 24 months for receipts and support. Deleted accounts are purged within 30 days.',
  },
  {
    id: 'sharing',
    title: 'Sharing with Merchants',
    desc: 'Merchants only see the minimum needed to honour a voucher: name, claim code, and party size if booked.',
  },
];

export function PrivacyScreen({ onBack, onOpenTerms }: PrivacyScreenProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    location: true,
    personalisation: true,
    analytics: true,
    marketing: false,
  });
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

  const toggle = (id: string, title: string) => {
    setEnabled((prev) => {
      const next = !prev[id];
      showToast(title + (next ? ' enabled' : ' disabled'));
      return { ...prev, [id]: next };
    });
  };

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
              Privacy &amp; NDPR Data
            </h1>
          </div>
        </div>
      </header>

      <main className="flex flex-col px-margin pt-space-md pb-24 gap-space-lg">
        <section className="rounded-xl bg-surface-tint-blue p-space-md flex items-start gap-space-sm">
          <Icon name="verified_user" className="text-[22px] text-primary shrink-0" filled />
          <div className="flex flex-col min-w-0">
            <p className="text-label-md font-label-md text-text-primary font-semibold">Your data, your control</p>
            <p className="text-caption font-caption text-text-secondary mt-0.5">
              Manage consents, tracking, and security options under Nigeria&apos;s Data Protection Regulation.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            Tracking controls
          </h2>
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            {TOGGLES.map((row, index) => (
              <div
                key={row.id}
                className={`flex items-center justify-between gap-space-sm p-space-md ${
                  index > 0 ? 'border-t border-border-subtle' : ''
                }`}
              >
                <div className="flex items-start gap-space-sm min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <Icon name={row.icon} className="text-[18px] text-text-secondary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-label-md font-label-md text-text-primary font-semibold">{row.title}</span>
                    <span className="text-caption font-caption text-text-secondary mt-0.5">{row.desc}</span>
                  </div>
                </div>
                <button
                  aria-label={'Toggle ' + row.title}
                  aria-pressed={enabled[row.id]}
                  type="button"
                  onClick={() => toggle(row.id, row.title)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    enabled[row.id] ? 'bg-primary justify-end' : 'bg-surface-container justify-start'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      enabled[row.id] ? '' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            How we handle your data
          </h2>
          {CONSENTS.map((item) => (
            <div key={item.id} className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <p className="text-label-md font-label-md text-text-primary font-semibold">{item.title}</p>
              <p className="text-body-md font-body-md text-text-secondary mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-space-xs">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            Your rights
          </h2>
          <button
            type="button"
            onClick={() => showToast('Data export requested. Check your email within 48 hours.')}
            className="w-full flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm active:scale-[0.99] transition-transform text-left"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <Icon name="download" className="text-[20px] text-primary shrink-0" />
              <span className="text-label-md font-label-md text-text-primary font-semibold">Export my data</span>
            </div>
            <Icon name="arrow_forward_ios" className="text-text-tertiary text-[16px] shrink-0" />
          </button>
          <button
            type="button"
            onClick={() => showToast('Account deletion requires confirmation in Settings.')}
            className="w-full flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm active:scale-[0.99] transition-transform text-left"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <Icon name="delete_outline" className="text-[20px] text-error shrink-0" />
              <span className="text-label-md font-label-md text-text-primary font-semibold">Request account deletion</span>
            </div>
            <Icon name="arrow_forward_ios" className="text-text-tertiary text-[16px] shrink-0" />
          </button>
          {onOpenTerms && (
            <button
              type="button"
              onClick={onOpenTerms}
              className="w-full flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm active:scale-[0.99] transition-transform text-left"
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <Icon name="description" className="text-[20px] text-text-secondary shrink-0" />
                <span className="text-label-md font-label-md text-text-primary font-semibold">
                  Read full Terms &amp; Privacy Policy
                </span>
              </div>
              <Icon name="arrow_forward_ios" className="text-text-tertiary text-[16px] shrink-0" />
            </button>
          )}
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
