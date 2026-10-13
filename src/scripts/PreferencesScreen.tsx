import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface PreferencesScreenProps {
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

export function PreferencesScreen({ onBack }: PreferencesScreenProps) {
  const [language, setLanguage] = useState('en');
  const [appearance, setAppearance] = useState('system');
  const [currency, setCurrency] = useState('ngn');
  const [haptics, setHaptics] = useState(true);
  const [compact, setCompact] = useState(false);
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
              App Preferences
            </h1>
          </div>
        </div>
      </header>

      <main className="flex flex-col px-margin pt-space-md pb-24 gap-space-lg">
        <section className="flex flex-col gap-space-xs">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            Language
          </h2>
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            {LANGUAGES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setLanguage(item.id);
                  showToast('Language set to ' + item.label);
                }}
                className={`w-full flex items-center justify-between p-space-md text-left ${
                  index > 0 ? 'border-t border-border-subtle' : ''
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-label-md font-label-md text-text-primary font-semibold">{item.native}</span>
                  <span className="text-caption font-caption text-text-secondary mt-0.5">{item.label}</span>
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

        <section className="flex flex-col gap-space-xs">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            Appearance
          </h2>
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
                    : 'border-border-subtle bg-surface-container-lowest hover:border-outline-variant'
                }`}
              >
                <Icon
                  name={item.icon}
                  className={'text-[22px] ' + (appearance === item.id ? 'text-primary' : 'text-text-secondary')}
                  filled={appearance === item.id}
                />
                <span className="text-caption font-caption text-text-primary font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            Display currency
          </h2>
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            {CURRENCY.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrency(item.id);
                  showToast('Currency set to ' + item.code);
                }}
                className={`w-full flex items-center justify-between p-space-md text-left ${
                  index > 0 ? 'border-t border-border-subtle' : ''
                }`}
              >
                <span className="text-label-md font-label-md text-text-primary font-semibold">{item.label}</span>
                {currency === item.id ? (
                  <Icon name="check_circle" className="text-[20px] text-primary" filled />
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-border-subtle shrink-0" />
                )}
              </button>
            ))}
          </div>
          <p className="text-caption font-caption text-text-secondary px-space-2xs">
            Merchant prices remain in Naira; other currencies are display-only estimates.
          </p>
        </section>

        <section className="flex flex-col gap-space-xs">
          <h2 className="text-label-md font-label-md text-text-primary font-bold uppercase tracking-wider">
            Behaviour
          </h2>
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-space-sm p-space-md">
              <div className="flex flex-col min-w-0">
                <span className="text-label-md font-label-md text-text-primary font-semibold">Haptic feedback</span>
                <span className="text-caption font-caption text-text-secondary mt-0.5">
                  Light taps on claims and checkouts.
                </span>
              </div>
              <button
                aria-label="Toggle haptic feedback"
                aria-pressed={haptics}
                type="button"
                onClick={() => {
                  setHaptics((prev) => !prev);
                  showToast(haptics ? 'Haptics disabled' : 'Haptics enabled');
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                  haptics ? 'bg-primary justify-end' : 'bg-surface-container justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-space-sm p-space-md border-t border-border-subtle">
              <div className="flex flex-col min-w-0">
                <span className="text-label-md font-label-md text-text-primary font-semibold">Compact deal cards</span>
                <span className="text-caption font-caption text-text-secondary mt-0.5">
                  Fit more offers on screen at once.
                </span>
              </div>
              <button
                aria-label="Toggle compact deal cards"
                aria-pressed={compact}
                type="button"
                onClick={() => {
                  setCompact((prev) => !prev);
                  showToast(compact ? 'Compact mode off' : 'Compact mode on');
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                  compact ? 'bg-primary justify-end' : 'bg-surface-container justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>
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
