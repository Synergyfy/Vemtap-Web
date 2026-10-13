import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopPrivacyScreenProps {
  onNav: (key: DesktopNavKey) => void;
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

export function DesktopPrivacyScreen({ onNav, onBack, onOpenTerms }: DesktopPrivacyScreenProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    location: true,
    personalisation: true,
    analytics: true,
    marketing: false,
  });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (text: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const toggle = (id: string, title: string) => {
    setEnabled((prev) => {
      const next = !prev[id];
      showToast(title + (next ? ' enabled' : ' disabled'));
      return { ...prev, [id]: next };
    });
  };

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
            <span className="text-text-primary font-semibold">Privacy &amp; NDPR Data</span>
          </nav>

          <div className="mb-8 max-w-3xl">
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              Privacy &amp; NDPR Data
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Control what you share, review how your data is handled, and exercise your NDPR rights from a single
              dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            <aside className="w-full flex flex-col gap-6 lg:sticky lg:top-24">
              <section className="rounded-xl bg-surface-tint-blue p-space-md flex items-start gap-space-sm">
                <Icon name="verified_user" className="text-[22px] text-primary shrink-0" filled />
                <div className="flex flex-col min-w-0">
                  <p className="font-label-md text-label-md text-text-primary font-semibold">Your data, your control</p>
                  <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                    Manage consents, tracking, and security options under Nigeria&apos;s Data Protection Regulation.
                  </p>
                </div>
              </section>

              <section className="flex flex-col gap-space-xs">
                <h2 className="font-label-md text-label-md text-text-primary font-bold uppercase tracking-wider">
                  Your rights
                </h2>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => showToast('Data export requested. Check your email within 48 hours.')}
                    className="w-full flex items-center justify-between gap-2 p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:bg-surface-subtle active:scale-[0.99] transition-all text-left"
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <Icon name="download" className="text-[20px] text-primary shrink-0" />
                      <span className="font-label-md text-label-md text-text-primary font-semibold">Export my data</span>
                    </div>
                    <Icon name="arrow_forward_ios" className="text-text-tertiary text-[16px] shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Account deletion requires confirmation in Settings.')}
                    className="w-full flex items-center justify-between gap-2 p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:bg-surface-subtle active:scale-[0.99] transition-all text-left"
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <Icon name="delete_outline" className="text-[20px] text-error shrink-0" />
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        Request account deletion
                      </span>
                    </div>
                    <Icon name="arrow_forward_ios" className="text-text-tertiary text-[16px] shrink-0" />
                  </button>
                  {onOpenTerms && (
                    <button
                      type="button"
                      onClick={onOpenTerms}
                      className="w-full flex items-center justify-between gap-2 p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:bg-surface-subtle active:scale-[0.99] transition-all text-left"
                    >
                      <div className="flex items-center gap-space-sm min-w-0">
                        <Icon name="description" className="text-[20px] text-text-secondary shrink-0" />
                        <span className="font-label-md text-label-md text-text-primary font-semibold">
                          Read full Terms &amp; Privacy Policy
                        </span>
                      </div>
                      <Icon name="arrow_forward_ios" className="text-text-tertiary text-[16px] shrink-0" />
                    </button>
                  )}
                </div>
              </section>
            </aside>

            <div className="w-full flex flex-col gap-8">
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-label-md text-label-md text-text-primary font-bold uppercase tracking-wider">
                    Tracking controls
                  </h2>
                  <span className="font-caption text-caption text-text-tertiary">
                    {Object.values(enabled).filter(Boolean).length} of {TOGGLES.length} enabled
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TOGGLES.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-start justify-between gap-space-sm"
                    >
                      <div className="flex items-start gap-space-sm min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                          <Icon name={row.icon} className="text-[18px] text-text-secondary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-text-primary font-semibold">
                            {row.title}
                          </span>
                          <span className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                            {row.desc}
                          </span>
                        </div>
                      </div>
                      <button
                        aria-label={'Toggle ' + row.title}
                        aria-pressed={enabled[row.id]}
                        type="button"
                        onClick={() => toggle(row.id, row.title)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                          enabled[row.id] ? 'bg-primary justify-end' : 'bg-surface-container-high justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="font-label-md text-label-md text-text-primary font-bold uppercase tracking-wider">
                  How we handle your data
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CONSENTS.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-1"
                    >
                      <p className="font-label-md text-label-md text-text-primary font-semibold">{item.title}</p>
                      <p className="font-body-md text-body-md text-text-secondary mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-surface-tint-blue text-text-primary border border-border-subtle px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
              <Icon name="check_circle" filled className="text-[18px] text-badge-discount-text" />
              <span>{toast}</span>
            </div>
          )}
        </div>
      </div>
    </DesktopPage>
  );
}
