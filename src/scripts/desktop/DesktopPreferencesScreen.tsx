import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopPreferencesScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

const LANGUAGES = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'ha', label: 'Hausa', native: 'Hausa' },
  { id: 'yo', label: 'Yoruba', native: 'Yoruba' },
  { id: 'ig', label: 'Igbo', native: 'Igbo' },
];

const APPEARANCE = [
  { id: 'system', label: 'System default', icon: 'settings_suggest' },
  { id: 'light', label: 'Light', icon: 'light_mode' },
  { id: 'dark', label: 'Dark', icon: 'dark_mode' },
];

const CURRENCY = [
  { id: 'ngn', label: 'Nigerian Naira (₦)', code: 'NGN' },
  { id: 'usd', label: 'US Dollar ($)', code: 'USD' },
  { id: 'gbp', label: 'British Pound (£)', code: 'GBP' },
];

const BEHAVIOUR = [
  {
    id: 'haptics',
    title: 'Haptic feedback',
    desc: 'Light taps on claims and checkouts.',
    onLabel: 'Haptics enabled',
    offLabel: 'Haptics disabled',
  },
  {
    id: 'compact',
    title: 'Compact deal cards',
    desc: 'Fit more offers on screen at once.',
    onLabel: 'Compact mode on',
    offLabel: 'Compact mode off',
  },
];

export function DesktopPreferencesScreen({ onNav, onBack }: DesktopPreferencesScreenProps) {
  const [language, setLanguage] = useState('en');
  const [appearance, setAppearance] = useState('system');
  const [currency, setCurrency] = useState('ngn');
  const [toggles, setToggles] = useState<Record<string, boolean>>({ haptics: true, compact: false });
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

  const toggleBehaviour = (id: string) => {
    setToggles((prev) => {
      const next = !prev[id];
      const meta = BEHAVIOUR.find((item) => item.id === id);
      if (meta) showToast(next ? meta.onLabel : meta.offLabel);
      return { ...prev, [id]: next };
    });
  };

  const sectionTitle = 'font-label-md text-label-md text-text-primary font-bold uppercase tracking-wider';

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
            <span className="text-text-primary font-semibold">App Preferences</span>
          </nav>

          <div className="mb-8 max-w-3xl">
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">App Preferences</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Tune language, appearance, display currency, and feedback so VEMTAP reads and responds the way you like
              it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <section className="flex flex-col gap-3">
              <h2 className={sectionTitle}>Language</h2>
              <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
                {LANGUAGES.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLanguage(item.id);
                      showToast('Language set to ' + item.label);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-space-md text-left hover:bg-surface-subtle transition-colors ${
                      index > 0 ? 'border-t border-border-subtle' : ''
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{item.native}</span>
                      <span className="font-caption text-caption text-text-secondary mt-0.5">{item.label}</span>
                    </div>
                    {language === item.id ? (
                      <Icon name="check_circle" className="text-[20px] text-primary" filled />
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-border-subtle shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className={sectionTitle}>Appearance</h2>
              <div className="grid grid-cols-3 gap-space-xs">
                {APPEARANCE.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAppearance(item.id);
                      showToast('Appearance: ' + item.label);
                    }}
                    className={`flex flex-col items-center gap-space-2xs p-space-sm rounded-xl border transition-colors ${
                      appearance === item.id
                        ? 'border-primary bg-surface-tint-blue'
                        : 'border-border-subtle bg-surface-container-lowest hover:border-text-tertiary'
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      className={'text-[22px] ' + (appearance === item.id ? 'text-primary' : 'text-text-secondary')}
                      filled={appearance === item.id}
                    />
                    <span className="font-caption text-caption text-text-primary font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className={sectionTitle}>Display currency</h2>
              <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
                {CURRENCY.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrency(item.id);
                      showToast('Currency set to ' + item.code);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-space-md text-left hover:bg-surface-subtle transition-colors ${
                      index > 0 ? 'border-t border-border-subtle' : ''
                    }`}
                  >
                    <span className="font-label-md text-label-md text-text-primary font-semibold">{item.label}</span>
                    {currency === item.id ? (
                      <Icon name="check_circle" className="text-[20px] text-primary" filled />
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-border-subtle shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Merchant prices remain in Naira; other currencies are display-only estimates.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className={sectionTitle}>Behaviour</h2>
              <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
                {BEHAVIOUR.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-space-sm p-space-md ${
                      index > 0 ? 'border-t border-border-subtle' : ''
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{item.title}</span>
                      <span className="font-caption text-caption text-text-secondary mt-1">{item.desc}</span>
                    </div>
                    <button
                      aria-label={'Toggle ' + item.title}
                      aria-pressed={toggles[item.id]}
                      type="button"
                      onClick={() => toggleBehaviour(item.id)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                        toggles[item.id] ? 'bg-primary justify-end' : 'bg-surface-container-high justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
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
