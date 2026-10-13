import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopScanScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onOpenTableMenu: () => void;
}

export function DesktopScanScreen({ onNav, onBack, onOpenTableMenu }: DesktopScanScreenProps) {
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
            <span className="text-text-primary font-semibold">Scan QR</span>
          </nav>

          <div className="mb-8 max-w-3xl">
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">Scan QR</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Point your camera at a merchant QR code to open the table menu or redeem a saved voucher instantly —
              even offline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            <section className="w-full rounded-2xl bg-text-primary shadow-xl overflow-hidden">
              <div className="flex items-center justify-end px-space-md py-space-sm border-b border-on-primary/10">
                <button
                  aria-label="Torch"
                  className="w-10 h-10 flex items-center justify-center rounded-full text-on-primary hover:bg-on-primary/10 transition-colors"
                  type="button"
                  onClick={() => showToast('Torch toggled')}
                >
                  <Icon name="flashlight_on" className="text-[22px]" />
                </button>
              </div>

              <div className="p-space-lg lg:p-space-2xl flex flex-col items-center gap-space-lg">
                <div className="relative w-full max-w-md aspect-square">
                  <div className="absolute inset-0 rounded-3xl border-2 border-on-primary/20" />
                  <div className="absolute top-0 left-0 w-14 h-14 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-14 h-14 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-14 h-14 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
                  <div className="absolute bottom-0 right-0 w-14 h-14 border-b-4 border-r-4 border-primary rounded-br-3xl" />
                  <div className="absolute inset-x-6 top-1/2 h-0.5 bg-primary animate-pulse rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="qr_code_scanner" className="text-[96px] text-on-primary/15" />
                  </div>
                </div>
              </div>
            </section>

            <aside className="w-full flex flex-col gap-space-sm lg:sticky lg:top-24">
              <section className="rounded-xl bg-surface-container-lowest border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="qr_code_scanner" className="text-[20px]" />
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Point at a merchant QR</h2>
                </div>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  Align the code inside the frame. We&apos;ll open the table menu or redeem your voucher instantly.
                </p>
              </section>

              <section className="rounded-xl bg-surface-container-lowest border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-xs">
                <button
                  type="button"
                  onClick={onOpenTableMenu}
                  className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md"
                >
                  <Icon name="restaurant_menu" className="text-[18px]" />
                  <span>Open Table Menu (Table 04)</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Pick a code from your gallery')}
                  className="w-full h-11 rounded-xl bg-surface-container-high text-text-primary font-button-primary text-button-primary flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
                >
                  <Icon name="photo_library" className="text-[18px]" />
                  <span>Choose from gallery</span>
                </button>
                <p className="font-caption text-caption text-text-tertiary text-center leading-relaxed pt-space-2xs">
                  Camera access is requested on first use. Scanning works offline for saved vouchers.
                </p>
              </section>
            </aside>
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
