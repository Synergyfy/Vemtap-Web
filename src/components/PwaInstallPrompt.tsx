import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  // Sheets and dialogs share the banner's layer; it steps aside while one is open
  // so it never covers their actions (e.g. "Apply Location & Radius").
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isVisible) return undefined;
    const update = () => setDialogOpen(Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    // Check if already running as installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user has previously permanently dismissed or installed
    const isDismissed = localStorage.getItem('vemtap_pwa_dismissed');
    const isInstalled = localStorage.getItem('vemtap_pwa_installed');
    if (isDismissed || isInstalled) {
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // Listen for Chrome/Edge/Android beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For first-time users on desktop/mobile (including iOS where beforeinstallprompt doesn't fire),
    // display the prompt after a brief 1.5s delay for smooth entrance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem('vemtap_pwa_installed', 'true');
          setIsVisible(false);
        }
      } catch {
        // Fallback or cancelled
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIosGuide(true);
    } else {
      // Fallback for desktop browsers without prompt support or already triggered
      alert(
        'To install VEMTAP on this device, click the Install App icon (⊕) in your browser address bar or select "Install VEMTAP" from your browser settings menu.'
      );
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Mark as dismissed so we don't annoy the user
    try {
      localStorage.setItem('vemtap_pwa_dismissed', 'true');
    } catch {
      // storage unavailable
    }
  };

  if (!isVisible || dialogOpen) return null;

  return (
    <>
      {/* =========================================================================
          DESKTOP POPUP — LEFT CORNER (lg:flex)
          ========================================================================= */}
      <aside
        aria-label="Install VEMTAP Application"
        className="hidden lg:flex fixed bottom-6 left-6 z-50 flex-col w-[350px] bg-surface-canvas/98 backdrop-blur-xl border border-border-subtle rounded-2xl p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      >
        {/* Header & Close Button */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
              <Icon name="install_desktop" className="text-[24px]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-title-sm text-title-sm text-on-surface font-bold tracking-tight">
                  Install VEMTAP
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-[9px] font-bold tracking-wider uppercase">
                  App
                </span>
              </div>
              <p className="font-body-xs text-body-xs text-text-tertiary">
                Unified Business & Orders Hub
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close installation prompt"
            className="text-text-tertiary hover:text-on-surface p-1 rounded-lg hover:bg-surface-subtle transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="py-2 space-y-1.5 border-y border-border-subtle/80 my-1">
          <div className="flex items-center gap-2 text-text-secondary font-body-xs text-[11.5px]">
            <Icon name="bolt" className="text-badge-discount-text text-[15px] shrink-0" />
            <span>Instant 1-click desktop launch &amp; offline mode</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary font-body-xs text-[11.5px]">
            <Icon name="notifications_active" className="text-primary text-[15px] shrink-0" />
            <span>Real-time sound alerts for new incoming orders</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary font-body-xs text-[11.5px]">
            <Icon name="fullscreen" className="text-text-secondary text-[15px] shrink-0" />
            <span>Distraction-free full screen POS &amp; dashboard</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm active:scale-98"
          >
            <Icon name="download" className="text-[18px]" />
            <span>Install App</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2.5 rounded-xl text-text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-sm text-label-sm font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE BANNER — BOTTOM DRAWER (lg:hidden)
          ========================================================================= */}
      <aside
        aria-label="Install VEMTAP on mobile"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 p-4 pb-6 bg-surface-canvas/98 backdrop-blur-xl border-t border-border-subtle shadow-2xl rounded-t-2xl animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
              <Icon name="install_mobile" className="text-[26px]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-title-sm text-title-sm text-on-surface font-bold">
                  Add VEMTAP to Home Screen
                </span>
              </div>
              <p className="font-body-xs text-body-xs text-text-secondary">
                Fast order alerts, offline POS &amp; 1-tap ordering
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="text-text-tertiary hover:text-on-surface p-1 rounded-lg"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* iOS Specific Quick Guide */}
        {showIosGuide && (
          <div className="mb-3 p-3 rounded-xl bg-surface-tint-blue border border-primary/20 text-on-surface text-[12px] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <Icon name="ios_share" className="text-[16px]" />
              <span>How to install on iOS Safari:</span>
            </div>
            <p className="text-text-secondary">
              1. Tap the <strong className="text-on-surface">Share</strong> icon at the bottom of
              Safari.
            </p>
            <p className="text-text-secondary">
              2. Scroll down and tap <strong className="text-on-surface">'Add to Home Screen'</strong>.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm active:scale-98"
          >
            <Icon name={isIOS ? 'ios_share' : 'download'} className="text-[18px]" />
            <span>{isIOS ? 'Install Instructions' : 'Install App'}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="py-3 px-4 rounded-xl text-text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-sm text-label-sm font-medium"
          >
            Not Now
          </button>
        </div>
      </aside>
    </>
  );
}
