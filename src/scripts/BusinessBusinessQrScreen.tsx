import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBusinessQr } from '../hooks/business/useBusinessQr';

const QR_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9LSZ0igpV-CzTdKx1j3WTuqqk8z-z4zHbkTwlWq_Us36LF0sXWxrMC9drNESSSdhIOk60Y_blTQOZWSN-Qe-ptseWhVCz3tdDvzmd5QVtkBrWoLKHqpU-r_KceD4kqRqrtoPKE8EIO97exb7M41GPwNBM8JW7ClSzY6-bOtBv0awBILMrgU2-sudicSDAZN7lyGO8LRmo8iLeqeqVPxjp3ZFG9_PZbP53VjS8hQcBMiawormtvD1OMA',
  alt: 'A warm and inviting gourmet smoked brisket platter garnished with fresh rosemary and sea salt, shot at eye level in natural ambient daylight inside a modern boutique restaurant setting with soft background blur',
};

const BUSINESS_LINK = 'https://vemtap.com/biz/urban-grill';

export function BusinessBusinessQrScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const copyTimer = useRef<number | null>(null);
  // Live: this business's own link, QR and details; demo keeps the sample.
  const qr = useBusinessQr();
  const businessUrl = qr.url ?? BUSINESS_LINK;
  const businessLink = qr.link ?? 'vemtap.com/biz/urban-grill';
  const businessName = qr.live ? qr.name ?? 'Your business' : 'Urban Grill & Bistro';
  const businessArea = qr.live ? [qr.category, qr.area].filter(Boolean).join(' • ') || 'Your storefront on VEMTAP' : 'Artisan Smokehouse & Grill • Maitama, Abuja';
  const coverImage = qr.live && qr.cover ? { src: qr.cover, alt: `${businessName} storefront` } : QR_IMAGE;

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(businessUrl).catch(() => {});
    setCopied(true);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <button
            aria-label="Go back"
            className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high transition-colors"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <div className="flex-1 text-center px-space-xs">
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Business Qr</h1>
          </div>
          <div className="flex items-center gap-space-xs -mr-space-xs">
            <button
              aria-label="Share QR code"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high transition-colors"
              type="button"
              onClick={() => showToast('Business QR link copied to clipboard')}
            >
              <Icon name="share" className="text-[22px]" />
            </button>
            <button
              aria-label="Merchant support"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high transition-colors"
              type="button"
              onClick={() => showToast('Support chat opening…')}
            >
              <Icon name="help_outline" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full px-margin pb-space-3xl">
        <div className="pt-space-md pb-space-sm flex flex-col items-start">
          <div className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-container-high text-primary mb-space-sm shadow-sm">
            <Icon name="check_circle" className="text-[16px]" />
            <span className="font-label-sm text-label-sm font-semibold">Business Setup Complete</span>
          </div>
          <h2 className="font-heading-sm text-heading-sm text-on-surface tracking-tight mb-space-2xs">
            Your VEMTAP Business QR is ready
          </h2>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Display this at your cashier counter, table stands, or entrance so customers can instantly tap, claim
            deals, and join your store.
          </p>
        </div>

        <div className="my-space-xs flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
              <Icon name="print" className="text-[16px]" />
            </span>
            <p className="font-caption text-caption text-on-surface-variant truncate">
              Print-ready standard:{' '}
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Table Tent &amp; A5 Acrylic</span>
            </p>
          </div>
          <span className="font-label-sm text-label-sm text-primary font-semibold shrink-0 cursor-pointer">
            Order Kits →
          </span>
        </div>

        <div className="mt-space-sm mb-space-md w-full rounded-2xl bg-surface-canvas shadow-xl p-space-lg flex flex-col items-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-surface-tint-blue blur-xl pointer-events-none" />
          <div className="w-full flex items-center justify-between pb-space-md mb-space-md">
            <div className="flex items-center gap-space-2xs bg-surface-tint-blue px-space-xs py-1 rounded-full">
              <div className="w-4 h-4 rounded-full bg-primary-container flex items-center justify-center">
                <span className="font-caption text-[10px] text-on-primary font-bold">V</span>
              </div>
              <span className="font-caption text-caption text-primary tracking-wider uppercase font-semibold">
                VEMTAP PASS
              </span>
            </div>
            <div className="flex items-center gap-1 text-text-tertiary">
              <Icon name="sensors" className="text-[14px]" />
              <span className="font-caption text-caption tracking-wider uppercase font-medium">NFC + QR ENABLED</span>
            </div>
          </div>
          <div className="relative w-56 h-56 bg-surface-container-lowest rounded-xl p-space-sm flex items-center justify-center shadow-md">
            {qr.qrImage ? (
              <img src={qr.qrImage} alt={`QR code for ${businessName}`} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
            ) : (
            <svg className="w-full h-full text-on-surface" fill="currentColor" viewBox="0 0 160 160">
              <rect height="40" rx="6" width="40" x="10" y="10" />
              <rect fill="#FFFFFF" height="28" rx="3" width="28" x="16" y="16" />
              <rect height="16" rx="2" width="16" x="22" y="22" />
              <rect height="40" rx="6" width="40" x="110" y="10" />
              <rect fill="#FFFFFF" height="28" rx="3" width="28" x="116" y="16" />
              <rect height="16" rx="2" width="16" x="122" y="22" />
              <rect height="40" rx="6" width="40" x="10" y="110" />
              <rect fill="#FFFFFF" height="28" rx="3" width="28" x="16" y="116" />
              <rect height="16" rx="2" width="16" x="22" y="122" />
              <rect height="6" rx="1" width="6" x="56" y="12" />
              <rect height="6" rx="1" width="6" x="66" y="12" />
              <rect height="6" rx="1" width="6" x="76" y="12" />
              <rect height="6" rx="1" width="6" x="88" y="12" />
              <rect height="6" rx="1" width="6" x="98" y="12" />
              <rect height="6" rx="1" width="6" x="12" y="56" />
              <rect height="6" rx="1" width="6" x="24" y="56" />
              <rect height="6" rx="1" width="6" x="36" y="56" />
              <rect height="6" rx="1" width="6" x="12" y="68" />
              <rect height="6" rx="1" width="6" x="24" y="68" />
              <rect height="6" rx="1" width="6" x="36" y="68" />
              <rect height="6" rx="1" width="6" x="12" y="80" />
              <rect height="6" rx="1" width="6" x="24" y="80" />
              <rect height="6" rx="1" width="6" x="36" y="80" />
              <rect height="6" rx="1" width="6" x="56" y="24" />
              <rect height="6" rx="1" width="6" x="76" y="24" />
              <rect height="6" rx="1" width="6" x="98" y="24" />
              <rect height="6" rx="1" width="6" x="56" y="36" />
              <rect height="6" rx="1" width="6" x="66" y="36" />
              <rect height="6" rx="1" width="6" x="88" y="36" />
              <rect height="6" rx="1" width="6" x="122" y="56" />
              <rect height="6" rx="1" width="6" x="142" y="56" />
              <rect height="6" rx="1" width="6" x="112" y="68" />
              <rect height="6" rx="1" width="6" x="132" y="68" />
              <rect height="6" rx="1" width="6" x="122" y="80" />
              <rect height="6" rx="1" width="6" x="142" y="80" />
              <rect height="6" rx="1" width="6" x="56" y="112" />
              <rect height="6" rx="1" width="6" x="66" y="112" />
              <rect height="6" rx="1" width="6" x="88" y="112" />
              <rect height="6" rx="1" width="6" x="98" y="112" />
              <rect height="6" rx="1" width="6" x="122" y="112" />
              <rect height="6" rx="1" width="6" x="142" y="112" />
              <rect height="6" rx="1" width="6" x="56" y="124" />
              <rect height="6" rx="1" width="6" x="76" y="124" />
              <rect height="6" rx="1" width="6" x="112" y="124" />
              <rect height="6" rx="1" width="6" x="132" y="124" />
              <rect height="6" rx="1" width="6" x="66" y="136" />
              <rect height="6" rx="1" width="6" x="88" y="136" />
              <rect height="6" rx="1" width="6" x="122" y="136" />
              <rect height="6" rx="1" width="6" x="142" y="136" />
              <rect height="6" rx="1" width="6" x="56" y="144" />
              <rect height="6" rx="1" width="6" x="98" y="144" />
              <rect height="6" rx="1" width="6" x="112" y="144" />
            </svg>
            )}
            <div className="absolute inset-0 m-auto w-12 h-12 rounded-xl bg-surface-canvas shadow-lg flex items-center justify-center p-1">
              <div className="w-full h-full bg-primary-container rounded-lg flex items-center justify-center">
                <Icon name="electric_bolt" className="text-on-primary text-[24px]" />
              </div>
            </div>
          </div>
          <div className="mt-space-md text-center flex flex-col items-center w-full">
            <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">{businessName}</h3>
            <p className="font-caption text-caption text-text-secondary mt-space-2xs">{businessArea}</p>
            <button
              className="mt-space-sm inline-flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container active:scale-95 transition cursor-pointer"
              type="button"
              onClick={handleCopy}
            >
              <Icon name="link" className="text-[15px] text-primary" />
              <span className="font-label-sm text-label-sm text-on-surface font-medium">{businessLink}</span>
              <Icon
                name={copied ? 'check' : 'content_copy'}
                className={`text-[15px] ml-space-2xs ${copied ? 'text-badge-discount-text' : 'text-text-tertiary'}`}
              />
            </button>
            <span
              className={`font-caption text-caption text-badge-discount-text mt-1 transition-opacity ${
                copied ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Link copied to clipboard!
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-sm mb-space-lg w-full">
            <button
              className="h-12 px-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface flex items-center justify-center gap-space-xs font-label-md text-label-md transition active:scale-[0.98]"
              type="button"
            >
              <Icon name="fullscreen" className="text-[18px]" />
              <span>Present Fullscreen</span>
            </button>
            <button
              className="h-12 px-space-sm rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center gap-space-xs font-label-md text-label-md font-semibold transition active:scale-[0.98] shadow-sm disabled:opacity-60"
              type="button"
              onClick={qr.live ? qr.downloadKit : undefined}
              disabled={qr.downloading}
            >
              <Icon name="download" className="text-[18px]" />
              <span>{qr.downloading ? 'Preparing…' : qr.kitError ? 'Try again' : 'Download Kit'}</span>
            </button>
          </div>
          <div className="mt-space-xs mb-space-lg w-full">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-2xs">
                <Icon name="visibility" className="text-[18px] text-primary" />
                <h4 className="font-label-md text-label-md text-on-surface font-semibold">What Customers See</h4>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                Instant Web View
              </span>
            </div>
            <div className="w-full bg-surface-canvas rounded-2xl shadow-md overflow-hidden transition-all duration-300">
              <div className="relative h-28 w-full overflow-hidden">
                <img className="w-full h-full object-cover" alt={coverImage.alt} src={coverImage.src} />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-space-xs left-space-sm right-space-sm flex items-center justify-between text-on-primary">
                  <div>
                    <span className="font-label-sm text-label-sm font-semibold block leading-tight">{businessName}</span>
                    <span className="font-caption text-caption opacity-90">{qr.live ? 'Open on VEMTAP' : 'Open • Maitama, Abuja'}</span>
                  </div>
                  <div className="px-space-2xs py-0.5 rounded bg-surface-canvas/20 backdrop-blur-md text-on-primary font-caption text-[11px] font-semibold flex items-center gap-1">
                    <Icon name="bolt" className="text-[12px]" /> Instant Pass
                  </div>
                </div>
              </div>
              <div className="p-space-md flex flex-col gap-space-xs">
                <div className="p-space-sm rounded-xl bg-badge-discount-bg flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-8 h-8 rounded-full bg-badge-discount-text/10 flex items-center justify-center text-badge-discount-text">
                      <Icon name="local_fire_department" className="text-[18px]" />
                    </span>
                    <div>
                      <p className="font-label-sm text-label-sm text-badge-discount-text font-semibold">
                        {qr.live ? 'Your live deals' : '20% Off Prime Lunch Combo'}
                      </p>
                      <p className="font-caption text-caption text-text-secondary">
                        One-tap redemption at checkout
                      </p>
                    </div>
                  </div>
                  <Icon name="arrow_forward_ios" className="text-[18px] text-badge-discount-text" />
                </div>
                <div className="flex items-center justify-between px-space-xs py-space-2xs">
                  <div className="flex items-center gap-space-2xs text-text-secondary">
                    <Icon name="stars" className="text-[16px] text-primary" />
                    <span className="font-caption text-caption">Earn 100 Welcome Tap Points</span>
                  </div>
                  <div className="flex items-center gap-space-2xs text-text-secondary">
                    <Icon name="restaurant_menu" className="text-[16px] text-primary" />
                    <span className="font-caption text-caption">Digital Menu</span>
                  </div>
                </div>
                <div className="pt-space-2xs flex items-center justify-center gap-space-2xs text-text-tertiary">
                  <Icon name="bolt" className="text-[14px]" />
                  <span className="font-caption text-caption">
                    Customers do not need to download an app to scan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-space-md rounded-2xl bg-surface-container-high flex items-start gap-space-sm mb-space-xl">
          <div className="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="lightbulb" className="text-[18px] text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-label-sm text-label-sm text-on-surface font-semibold">Where to access this later</p>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              Find or customize desk-specific codes under{' '}
              <span className="font-medium text-on-surface">More → Business Management → QR &amp; Entry</span>. You can
              generate custom table codes anytime.
            </p>
          </div>
        </div>

        <div className="w-full mb-space-md rounded-2xl bg-surface-canvas border border-border-subtle p-space-md shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center shrink-0">
              <Icon name="group_add" className="text-[22px] text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-space-2xs mb-0.5">
                <span className="px-space-2xs py-0.5 rounded bg-primary/10 text-primary font-caption text-[11px] font-semibold uppercase tracking-wider">
                  Referral Perk
                </span>
              </div>
              <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                Grow with the VEMTAP Business Network
              </h4>
              <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                Know other businesses around you? Refer them to VEMTAP and unlock network benefits as your network
                grows.
              </p>
            </div>
          </div>
          <div className="mt-space-sm flex items-center justify-center w-full">
            <button
              className="h-8 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center transition active:scale-95"
              type="button"
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="mt-auto pt-space-md flex flex-col items-center gap-space-sm">
          <button
            className="w-full h-11 rounded-2xl bg-primary-container hover:bg-primary text-on-primary flex items-center justify-center gap-space-xs font-button-primary text-button-primary shadow-lg shadow-primary-container/25 active:scale-[0.98] transition"
            type="button"
            onClick={onContinue}
          >
            <span>Continue to Business Dashboard</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <button
            className="h-11 px-space-md rounded-full text-text-secondary hover:text-on-surface flex items-center gap-space-2xs font-button-secondary text-button-secondary transition active:scale-95"
            type="button"
            onClick={() => showToast('Share link copied — paste in WhatsApp or socials')}
          >
            <Icon name="share" className="text-[18px] text-primary" />
            <span>Share digital link via WhatsApp or socials</span>
          </button>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
