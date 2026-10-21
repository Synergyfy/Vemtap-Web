import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { useBusinessQr } from '../../hooks/business/useBusinessQr';

interface DesktopBusinessQrScreenProps {
  onContinue: () => void;
}

const STOREFRONT_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUGGVIpCUSLqlt98cYR2Kj4otzS8A3jD9Vd49iHIZtmCuwg4JGt-4xGDXcojgKA7EfwP1g5KJ0yYc1PRhhvAuGjCLOlJl4js18SWfuqEJ1Q3-FEe7NSHInPrWL7DLC5sjJ1MNdzp1mrBu1raKFe_ejXJNDv0e9DM4_Z5qzXep91UsXwqUUivw-Y93_K6ZB5RC56jEnIMVWa6y-ISWWPJ9F1CiZVFJwVNNYiRrkOAJ2b0-FuFZZ9lbJ_A',
    alt: 'A warm, vibrant scene inside a modern rustic smokehouse and grill restaurant in Abuja with ambient warm glowing Edison lamps, exposed dark wood brick tables, and sizzling artisan grilled dishes arranged beautifully.',
  },
];

const BUSINESS_LINK = 'vemtap.com/biz/urban-grill';
const BUSINESS_URL = 'https://vemtap.com/biz/urban-grill';

export function DesktopBusinessQrScreen({ onContinue }: DesktopBusinessQrScreenProps) {
  const [copied, setCopied] = useState(false);
  const [presenting, setPresenting] = useState(false);
  // Live: this business's own link, QR and details; demo keeps the sample.
  const qr = useBusinessQr();
  const businessLink = qr.link ?? BUSINESS_LINK;
  const businessUrl = qr.url ?? BUSINESS_URL;
  const businessName = qr.live ? qr.name ?? 'Your business' : 'Urban Grill & Bistro';
  const businessTagline = qr.live ? qr.category ?? 'Your storefront on VEMTAP' : 'Artisan Smokehouse & Grill';
  const businessArea = qr.live ? qr.area ?? 'Your branch' : 'Maitama / Wuse II, Abuja • Counter Pass #01';
  const coverImage = qr.live && qr.cover ? { src: qr.cover, alt: `${businessName} storefront` } : STOREFRONT_IMAGES[0];
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(businessUrl).catch(() => undefined);
    setCopied(true);
    timers.current.push(window.setTimeout(() => setCopied(false), 2000));
  };

  const handlePresent = () => {
    if (presenting) return;
    setPresenting(true);
    timers.current.push(window.setTimeout(() => setPresenting(false), 1800));
  };

  return (
    <BusinessSetupChrome activeNav="deals">
      <div className="relative w-full overflow-hidden px-space-xl py-space-2xl">
        <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-surface-container-high opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-secondary-fixed opacity-50 blur-3xl" />
        <div className="mx-auto max-w-7xl flex flex-col gap-space-2xl relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
            <div className="flex flex-col gap-space-xs max-w-3xl">
              <div className="inline-flex items-center gap-space-xs w-fit px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption uppercase tracking-wider font-semibold">
                <Icon name="check_circle" className="text-[16px]" />
                <span>Business Setup Complete</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Your VEMTAP Business QR is Ready
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary">
                Display this at your cashier counter, table stands, or entrance so customers can instantly tap, claim
                deals, and join your store.
              </p>
            </div>
            <div className="flex items-center gap-space-md shrink-0">
              <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container-low shadow-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-label-sm text-label-sm text-text-secondary">Smart Pass Live &amp; Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-7 flex flex-col gap-space-xl">
              <div className="group relative rounded-3xl bg-surface-container-lowest p-space-xl shadow-xl transition-all duration-300">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-primary-fixed/20 pointer-events-none" />
                <div className="relative flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between pb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-heading-sm text-heading-sm text-primary font-bold tracking-tight">
                        VEMTAP PASS
                      </span>
                      <span className="px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                        OFFICIAL STORE FRONT
                      </span>
                    </div>
                    <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold tracking-wide">
                      <Icon name="nfc" className="text-[15px] text-primary" />
                      <span>NFC + QR ENABLED</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-space-xl bg-surface-subtle p-space-lg rounded-2xl">
                    <div className="relative p-space-md bg-surface-container-lowest rounded-2xl shadow-md flex items-center justify-center shrink-0">
                      <div className="relative w-52 h-52 flex items-center justify-center bg-surface-canvas p-space-xs rounded-xl">
                        {qr.qrImage ? (
                          <img src={qr.qrImage} alt={`QR code for ${businessName}`} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
                        ) : (
                        <svg className="w-full h-full text-on-background fill-current" viewBox="0 0 160 160">
                          <rect height="46" rx="8" width="46" x="0" y="0" />
                          <rect fill="white" height="30" rx="4" width="30" x="8" y="8" />
                          <rect height="18" rx="2" width="18" x="14" y="14" />
                          <rect height="46" rx="8" width="46" x="114" y="0" />
                          <rect fill="white" height="30" rx="4" width="30" x="122" y="8" />
                          <rect height="18" rx="2" width="18" x="128" y="14" />
                          <rect height="46" rx="8" width="46" x="0" y="114" />
                          <rect fill="white" height="30" rx="4" width="30" x="8" y="122" />
                          <rect height="18" rx="2" width="18" x="14" y="128" />
                          <rect height="10" rx="2" width="10" x="56" y="10" />
                          <rect height="10" rx="2" width="10" x="74" y="10" />
                          <rect height="10" rx="2" width="10" x="92" y="10" />
                          <rect height="28" rx="2" width="10" x="56" y="28" />
                          <rect height="10" rx="2" width="10" x="74" y="36" />
                          <rect height="18" rx="2" width="10" x="92" y="28" />
                          <rect height="10" rx="2" width="10" x="10" y="56" />
                          <rect height="10" rx="2" width="18" x="28" y="56" />
                          <rect height="10" rx="2" width="28" x="10" y="74" />
                          <rect height="10" rx="2" width="10" x="28" y="92" />
                          <rect height="10" rx="2" width="10" x="114" y="56" />
                          <rect height="10" rx="2" width="18" x="132" y="56" />
                          <rect height="10" rx="2" width="28" x="122" y="74" />
                          <rect height="10" rx="2" width="10" x="142" y="92" />
                          <rect height="20" rx="2" width="10" x="56" y="114" />
                          <rect height="10" rx="2" width="28" x="74" y="124" />
                          <rect height="10" rx="2" width="18" x="114" y="114" />
                          <rect height="20" rx="2" width="10" x="142" y="124" />
                          <rect height="10" rx="2" width="10" x="124" y="138" />
                          <rect height="10" rx="2" width="28" x="56" y="142" />
                        </svg>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Icon name="bolt" className="text-on-primary text-[24px]" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-space-xs flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-space-xs text-badge-discount-text font-label-sm text-label-sm">
                        <Icon name="verified" className="text-[18px]" />
                        <span>Verified Merchant Profile</span>
                      </div>
                      <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{businessName}</h2>
                      <p className="font-body-md text-body-md text-text-secondary">{businessTagline}</p>
                      <div className="flex items-center justify-center sm:justify-start gap-space-2xs text-text-secondary font-caption text-caption pt-space-xs">
                        <Icon name="location_on" className="text-[16px] text-tertiary" />
                        <span>{businessArea}</span>
                      </div>
                      <div className="pt-space-sm flex items-center justify-center sm:justify-start gap-space-xs">
                        <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded bg-surface-container text-on-surface-variant font-caption text-caption">
                          <Icon name="tap_and_play" className="text-[14px]" /> Tap phone to open
                        </span>
                        <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded bg-surface-container text-on-surface-variant font-caption text-caption">
                          <Icon name="qr_code_scanner" className="text-[14px]" /> Camera scan
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-space-sm p-space-xs pl-space-md rounded-xl bg-surface-container-low shadow-sm">
                    <div className="flex items-center gap-space-xs truncate">
                      <Icon name="link" className="text-primary text-[20px]" />
                      <span className="font-label-md text-label-md text-text-primary truncate">{businessLink}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-space-md py-space-xs rounded-lg bg-surface-canvas hover:bg-surface-subtle text-primary font-button-secondary text-button-secondary shadow-sm transition-all flex items-center gap-space-2xs"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <button
                  type="button"
                  onClick={handlePresent}
                  className="h-14 px-space-md rounded-2xl bg-surface-canvas hover:bg-surface-subtle text-text-primary font-button-primary text-button-primary shadow-sm hover:shadow transition-all flex items-center justify-center gap-space-xs"
                >
                  <Icon name="fullscreen" className="text-primary text-[22px]" />
                  <span>{presenting ? 'Opening Kiosk Mode...' : 'Present Fullscreen'}</span>
                </button>
                <button
                  type="button"
                  onClick={qr.live ? qr.downloadKit : undefined}
                  disabled={qr.downloading}
                  className="h-14 px-space-md rounded-2xl bg-surface-tint-blue hover:bg-secondary-fixed text-primary font-button-primary text-button-primary shadow-sm hover:shadow transition-all flex items-center justify-center gap-space-xs disabled:opacity-60"
                >
                  <Icon name="download" className="text-primary text-[22px]" />
                  <span>{qr.downloading ? 'Preparing your kit…' : qr.kitError ? 'Download failed — try again' : 'Download Kit (PDF)'}</span>
                </button>
              </div>

              <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                <div className="flex items-start gap-space-sm">
                  <div className="p-space-xs rounded-xl bg-surface-canvas text-primary shadow-sm mt-0.5">
                    <Icon name="local_shipping" className="text-[24px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Print-Ready Standard Deliverables
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Pre-scaled designs for acrylic table tents, window decals &amp; counter stands.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-space-2xs text-primary font-button-secondary text-button-secondary hover:underline shrink-0"
                >
                  <span>Order Printed Kits</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>

              <div className="p-space-md rounded-xl bg-surface-subtle flex items-center gap-space-sm shadow-sm">
                <Icon name="info" className="text-text-tertiary text-[20px]" />
                <p className="font-caption text-caption text-text-secondary">
                  <span className="font-semibold text-text-primary">Where to access this later:</span> Find,
                  regenerate, or customize table-specific NFC codes anytime under{' '}
                  <span className="text-primary font-medium">More → QR &amp; Storefront Discovery</span>.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-space-xl">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="visibility" className="text-primary text-[20px]" />
                    <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                      What Customers See
                    </span>
                  </div>
                  <span className="px-space-xs py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold">
                    Instant Web View
                  </span>
                </div>
                <div className="relative w-full max-w-sm mx-auto rounded-[36px] bg-inverse-surface p-space-xs shadow-2xl">
                  <div className="w-full rounded-[30px] bg-surface-canvas overflow-hidden flex flex-col shadow-inner">
                    <div className="h-6 w-full bg-surface-canvas flex items-center justify-between px-space-md pt-space-2xs">
                      <span className="font-caption text-caption text-text-secondary font-medium">9:41</span>
                      <div className="w-16 h-3 bg-inverse-surface/10 rounded-full mx-auto" />
                      <div className="flex items-center gap-space-2xs">
                        <Icon name="signal_cellular_4_bar" className="text-[12px] text-text-secondary" />
                        <Icon name="battery_full" className="text-[12px] text-text-secondary" />
                      </div>
                    </div>
                    <div className="px-space-md py-space-2xs bg-surface-subtle flex items-center gap-space-xs text-text-tertiary">
                      <Icon name="lock" className="text-[14px]" />
                      <span className="font-caption text-caption truncate text-text-secondary">{businessLink}</span>
                    </div>
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        alt={coverImage.alt}
                        src={coverImage.src}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/20 to-transparent" />
                      <div className="absolute top-space-xs left-space-xs px-space-xs py-space-2xs rounded-full bg-surface-canvas/90 backdrop-blur-sm flex items-center gap-space-2xs shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                        <span className="font-caption text-caption font-semibold text-text-primary">Open Now</span>
                      </div>
                      <div className="absolute bottom-space-xs left-space-md right-space-md text-on-primary">
                        <span className="font-caption text-caption tracking-wider uppercase opacity-90">
                          Instant Store Pass
                        </span>
                        <h3 className="font-heading-sm text-heading-sm font-bold text-on-primary leading-tight">{businessName}</h3>
                        <p className="font-caption text-caption text-on-primary opacity-80">{qr.live ? businessArea : 'Wuse II, Abuja • 0.1 mi away'}</p>
                      </div>
                    </div>
                    <div className="p-space-md flex flex-col gap-space-md bg-surface">
                      <div className="p-space-sm rounded-2xl bg-badge-discount-bg flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-space-xs">
                          <div className="w-10 h-10 rounded-xl bg-badge-discount-text text-on-primary flex items-center justify-center font-bold">
                            <Icon name="percent" className="text-[22px]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm font-bold text-badge-discount-text">
                              {qr.live ? 'Your live deals' : '20% Off Prime Lunch Combo'}
                            </span>
                            <span className="font-caption text-caption text-text-secondary">
                              One-tap redemption at checkout
                            </span>
                          </div>
                        </div>
                        <Icon name="arrow_forward_ios" className="text-badge-discount-text text-[20px]" />
                      </div>
                      <div className="p-space-sm rounded-2xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                            <Icon name="stars" className="text-[18px]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                              Welcome Reward
                            </span>
                            <span className="font-caption text-caption text-text-secondary">
                              Tap to collect +100 Loyalty Points
                            </span>
                          </div>
                        </div>
                        <span className="px-space-xs py-space-2xs rounded-lg bg-primary text-on-primary font-caption text-caption font-semibold">
                          Claim
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
                        <div className="p-space-xs rounded-xl bg-surface-canvas shadow-sm flex items-center gap-space-2xs">
                          <Icon name="restaurant_menu" className="text-primary text-[18px]" />
                          <span className="font-caption text-caption font-medium text-text-primary">Live Menu</span>
                        </div>
                        <div className="p-space-xs rounded-xl bg-surface-canvas shadow-sm flex items-center gap-space-2xs">
                          <Icon name="wifi" className="text-tertiary text-[18px]" />
                          <span className="font-caption text-caption font-medium text-text-primary">Guest WiFi</span>
                        </div>
                      </div>
                      <div className="pt-space-xs pb-space-2xs">
                        <div className="h-10 w-full rounded-xl bg-primary flex items-center justify-center text-on-primary font-button-secondary text-button-secondary shadow-md">
                          Join VIP Club &amp; Pay Fast
                        </div>
                      </div>
                    </div>
                    <div className="h-4 w-full bg-surface flex items-center justify-center pb-space-xs">
                      <div className="w-24 h-1 bg-on-background/20 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-space-2xs text-text-secondary text-center px-space-md">
                  <Icon name="check" className="text-badge-discount-text text-[18px]" />
                  <span className="font-caption text-caption">
                    No app download required. Works instantly on Safari, Chrome &amp; camera scans.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-space-md pt-space-md">
                <button
                  type="button"
                  onClick={onContinue}
                  className="w-full h-14 rounded-2xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-space-xs group"
                >
                  <span>Continue to Business Dashboard</span>
                  <Icon
                    name="arrow_forward"
                    className="text-[20px] transition-transform group-hover:translate-x-1"
                  />
                </button>
                <div className="flex items-center justify-center gap-space-md">
                  <button
                    type="button"
                    className="inline-flex items-center gap-space-2xs text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors"
                  >
                    <Icon name="chat" className="text-[18px] text-badge-discount-text" />
                    <span>Share link via WhatsApp</span>
                  </button>
                  <span className="text-text-tertiary">•</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-space-2xs text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors"
                  >
                    <Icon name="share" className="text-[18px]" />
                    <span>Socials &amp; Bio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
