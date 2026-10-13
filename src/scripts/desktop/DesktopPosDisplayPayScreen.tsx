import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { CheckoutHubShell } from './CheckoutHubShell';

interface DesktopPosDisplayPayScreenProps {
  onSplit?: () => void;
}

const QR_FINDERS: Array<{ x: number; y: number }> = [
  { x: 10, y: 10 },
  { x: 140, y: 10 },
  { x: 10, y: 140 },
];

const QR_DOTS: Array<{ x: number; y: number; w: number; h: number }> = [
  { x: 70, y: 15, w: 10, h: 10 },
  { x: 90, y: 15, w: 10, h: 25 },
  { x: 110, y: 20, w: 18, h: 10 },
  { x: 70, y: 35, w: 12, h: 12 },
  { x: 115, y: 40, w: 10, h: 18 },
  { x: 20, y: 70, w: 15, h: 10 },
  { x: 45, y: 70, w: 15, h: 12 },
  { x: 20, y: 90, w: 25, h: 10 },
  { x: 50, y: 92, w: 15, h: 25 },
  { x: 20, y: 110, w: 18, h: 15 },
  { x: 145, y: 70, w: 20, h: 10 },
  { x: 175, y: 70, w: 15, h: 20 },
  { x: 140, y: 95, w: 12, h: 20 },
  { x: 160, y: 98, w: 25, h: 10 },
  { x: 140, y: 125, w: 20, h: 10 },
  { x: 70, y: 145, w: 12, h: 18 },
  { x: 90, y: 140, w: 20, h: 10 },
  { x: 118, y: 145, w: 12, h: 12 },
  { x: 70, y: 170, w: 22, h: 15 },
  { x: 100, y: 165, w: 15, h: 20 },
  { x: 125, y: 165, w: 20, h: 10 },
  { x: 155, y: 150, w: 15, h: 15 },
  { x: 175, y: 155, w: 15, h: 30 },
  { x: 68, y: 68, w: 14, h: 14 },
  { x: 118, y: 68, w: 14, h: 14 },
  { x: 68, y: 118, w: 14, h: 14 },
  { x: 118, y: 118, w: 14, h: 14 },
];

const PAYMENT_SCHEMES: Array<{ label: string; icon?: string; dot?: string; textClass: string }> = [
  { label: 'Mastercard', dot: 'bg-error', textClass: 'text-text-primary' },
  { label: 'VISA', icon: 'credit_card', textClass: 'text-primary' },
  { label: 'Verve', icon: 'verified', textClass: 'text-badge-discount-text' },
  { label: 'Apple Pay', icon: 'phone_iphone', textClass: 'text-text-primary' },
  { label: 'Google Pay', icon: 'contactless', textClass: 'text-text-secondary' },
];

const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
};

export function DesktopPosDisplayPayScreen({ onSplit }: DesktopPosDisplayPayScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(102);
  const [copied, setCopied] = useState(false);
  const [tapVisible, setTapVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((value) => (value <= 0 ? 0 : value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!tapVisible) return;
    const timeout = setTimeout(() => setTapVisible(false), 2500);
    return () => clearTimeout(timeout);
  }, [tapVisible]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleCopy = () => {
    navigator.clipboard?.writeText('9042817290');
    setCopied(true);
  };

  return (
    <CheckoutHubShell>
      <div className="max-w-7xl mx-auto w-full px-margin py-space-md flex flex-col gap-space-lg">
        {/* Top Hero Merchant & Due Banner */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md md:p-space-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full pointer-events-none blur-2xl" />

          {/* Merchant Info */}
          <div className="flex items-center gap-space-md relative z-10">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 shadow-sm">
              <img
                className="w-full h-full object-cover"
                alt="High-end upscale bistro restaurant emblem modern typography urban grill and bistro wood and stone warm amber and slate blue ambient restaurant lighting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMp3Y82-h-j9T67fTuLjDkSeMjEDtIRwi9uHWTT6-EYIZDzJuiX6jmdCdmAGd1kzNT5Slk3HuLKisx98HqttuCM9S3ZUUFhWXOhhB5DHivIXbWW7GSBwKUGXdVWtKNR73MOTkXjRgibkz9mKAXulCJ2JbSvdTaumo6aCuIME9DqZPMT_XYy-ACcPZDZYm85HHwFPjefCijPzrwaDpoWitH7f18jINxv4DuIcIe24PYkxm_ec1EqcNhuw"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs flex-wrap">
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight font-bold">
                  Urban Grill &amp; Bistro
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
                  <Icon name="verified" className="text-[15px]" filled />
                  Verified Merchant
                </span>
              </div>
              <div className="flex items-center gap-space-xs text-text-secondary font-label-md text-label-md mt-1">
                <Icon name="location_on" className="text-text-tertiary text-[17px]" />
                <span>Victoria Island • Terminal #01</span>
                <span className="text-text-tertiary">•</span>
                <span className="text-text-secondary">Cashier: Amaka O.</span>
              </div>
            </div>
          </div>

          {/* Live Connectivity & Total Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md w-full lg:w-auto relative z-10 justify-between lg:justify-end">
            <div className="flex flex-col items-start sm:items-end">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold mb-1 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                Online • 256-bit Secure
              </div>
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                Order Reference: #TK-108 • 3 Items
              </span>
            </div>
            <div className="bg-primary-container text-on-primary-container px-space-lg py-space-sm rounded-xl shadow-md flex flex-col items-start sm:items-end min-w-[220px]">
              <span className="font-caption text-caption opacity-90 uppercase tracking-widest font-medium">
                Total Amount Due
              </span>
              <div className="font-display-hero text-display-hero font-bold tracking-tight leading-none mt-1">
                ₦27,628.00
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Split POS Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg w-full">
          {/* LEFT COLUMN: Scan to Pay & Direct QR / Dynamic Bank Transfer */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col justify-between h-full relative">
              <div>
                {/* Section Header & Countdown */}
                <div className="flex items-center justify-between pb-space-md">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                      <Icon name="qr_code_scanner" className="text-[24px]" />
                    </div>
                    <div>
                      <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Scan to Pay</h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Compatible with all Nigerian Banking &amp; Fintech Apps
                      </p>
                    </div>
                  </div>
                  {/* Real-time Countdown Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-container text-error font-label-sm text-label-sm font-semibold">
                    <Icon name="timer" className="text-[16px] animate-spin" />
                    <span>{secondsLeft > 0 ? formatTime(secondsLeft) : '00:00 (Expired)'}</span>
                  </div>
                </div>

                {/* Scannable Dynamic QR Box */}
                <div className="flex flex-col items-center justify-center my-space-xs p-space-md bg-surface-subtle rounded-xl">
                  <div className="relative p-space-md bg-surface-canvas rounded-xl shadow-md flex items-center justify-center">
                    {/* SVG High Contrast QR Simulation */}
                    <svg className="w-52 h-52 text-text-primary" fill="none" viewBox="0 0 200 200">
                      {QR_FINDERS.map((finder) => (
                        <g key={`${finder.x}-${finder.y}`}>
                          <rect fill="currentColor" x={finder.x} y={finder.y} width="50" height="50" rx="6" />
                          <rect fill="#FFFFFF" x={finder.x + 8} y={finder.y + 8} width="34" height="34" rx="3" />
                          <rect fill="currentColor" x={finder.x + 15} y={finder.y + 15} width="20" height="20" rx="2" />
                        </g>
                      ))}
                      <g fill="currentColor">
                        {QR_DOTS.map((dot, index) => (
                          <rect key={index} x={dot.x} y={dot.y} width={dot.w} height={dot.h} rx="2" />
                        ))}
                      </g>
                    </svg>
                    {/* Center Bolt / VEMTAP Emblem Badge */}
                    <div className="absolute inset-0 m-auto w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-md">
                      <Icon name="bolt" className="text-[26px]" />
                    </div>
                  </div>

                  {/* Rail Support Subtitle */}
                  <div className="text-center mt-space-sm px-space-xs">
                    <p className="font-label-md text-label-md font-semibold text-text-primary">
                      Open VEMTAP or any Banking App
                    </p>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Universal NIBSS NQR • Interswitch Pay • Barter • Chipper
                    </p>
                  </div>
                </div>

                {/* Fallback Till Bank Transfer Container */}
                <div className="bg-surface-subtle p-space-md rounded-xl mt-space-md">
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                      Direct Till Bank Transfer (Instant Credit)
                    </span>
                    <span className="font-caption text-caption text-primary font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                      Fast Polling Active
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    <div className="bg-surface-canvas p-space-sm rounded-lg shadow-sm flex flex-col justify-center">
                      <span className="font-caption text-caption text-text-tertiary">Designated Bank</span>
                      <span className="font-heading-sm text-heading-sm font-semibold text-text-primary">
                        Stanbic IBTC / Moniepoint
                      </span>
                    </div>
                    <div className="bg-surface-canvas p-space-sm rounded-lg shadow-sm flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-text-tertiary">Virtual Account Number</span>
                        <span className="font-heading-sm text-heading-sm font-bold tracking-wider text-text-primary">
                          9042 817 290
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Icon name={copied ? 'done' : 'content_copy'} className="text-[16px]" />
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-space-xs flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                    <Icon name="verified_user" className="text-primary text-[16px]" />
                    <span>
                      Beneficiary:{' '}
                      <strong className="text-text-primary font-medium">Urban Grill &amp; Bistro Till 01</strong> •
                      Auto-matches in 4 seconds
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-space-md text-center">
                <span className="font-caption text-caption text-text-tertiary">
                  Transaction Session ID:{' '}
                  <strong className="text-text-secondary font-mono font-medium">VT-NG-VI-202505-8849</strong>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tap Card / Phone & Loyalty Credit & Actions */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col justify-between h-full relative overflow-hidden">
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between pb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                      <Icon name="contactless" className="text-[24px]" />
                    </div>
                    <div>
                      <h2 className="font-heading-md text-heading-md font-bold text-text-primary">
                        Or Tap Card / Phone Here
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Instant Contactless NFC Reader (EMV Level 2)
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                    NFC Ready
                  </span>
                </div>

                {/* Pulsing Contactless Wave Target Zone */}
                <button
                  type="button"
                  onClick={() => setTapVisible(true)}
                  className="relative my-space-md py-space-xl px-space-md bg-surface-subtle rounded-xl flex flex-col items-center justify-center overflow-hidden min-h-[260px] text-center cursor-pointer group w-full"
                >
                  {/* Ambient Concentric Ripple Waves */}
                  <span className="absolute w-60 h-60 rounded-full bg-primary/10 animate-ping opacity-40 pointer-events-none" />
                  <span className="absolute w-44 h-44 rounded-full bg-primary/15 animate-pulse opacity-50 pointer-events-none" />
                  {/* Center Contactless Disc */}
                  <span className="relative z-10 w-28 h-28 rounded-full bg-primary-container text-on-primary-container shadow-xl flex items-center justify-center transform transition-transform group-hover:scale-105 duration-300">
                    <Icon name="contactless" className="text-[62px]" />
                  </span>
                  {/* Interactive prompt text */}
                  <span className="relative z-10 mt-space-md flex flex-col">
                    <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                      Hold chip, smart card or device against reader
                    </span>
                    <span className="font-body-md text-body-md text-text-secondary mt-1">
                      Keep device steady within 4cm of reader surface
                    </span>
                  </span>
                  {/* Live Tap Status Indicator Toast inside card */}
                  <span
                    className={`${
                      tapVisible ? 'flex' : 'hidden'
                    } absolute bottom-3 z-20 px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-lg items-center gap-2`}
                  >
                    <Icon name="sensors" className="text-[16px]" />
                    Card Detected • Processing securely...
                  </span>
                </button>

                {/* Accepted Payment Rails Badges */}
                <div className="flex flex-col gap-space-xs mt-space-sm">
                  <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-medium">
                    Supported Payment Schemes
                  </span>
                  <div className="flex items-center gap-space-xs flex-wrap">
                    {PAYMENT_SCHEMES.map((scheme) => (
                      <span
                        key={scheme.label}
                        className={`px-3 py-1.5 rounded-lg bg-surface-canvas shadow-sm font-label-md text-label-md font-bold flex items-center gap-1.5 ${scheme.textClass}`}
                      >
                        {scheme.dot && <span className={`w-3.5 h-3.5 rounded-full inline-block ${scheme.dot}`} />}
                        {scheme.icon && <Icon name={scheme.icon} className="text-[18px]" />}
                        {scheme.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* VEMTAP Points Reward Badge */}
                <div className="mt-space-md p-space-md rounded-xl bg-badge-discount-bg text-text-primary flex items-start gap-space-sm shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-badge-discount-text text-on-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Icon name="stars" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-bold text-badge-discount-text">
                      +276 VEMTAP Points Earned with this purchase
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-0.5">
                      Automatically added to your linked phone number or card profile upon completion. Redeemable at
                      over 450+ verified VI &amp; Lekki partners.
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Customer Action Deck */}
              <div className="mt-space-lg pt-space-md flex flex-col sm:flex-row items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => {
                    onSplit?.();
                  }}
                  className="w-full sm:w-1/2 h-[52px] rounded-xl bg-surface-tint-blue text-primary font-button-primary text-button-primary font-semibold flex items-center justify-center gap-2 hover:bg-secondary-container transition-all active:scale-[0.98] shadow-sm"
                >
                  <Icon name="call_split" className="text-[20px]" />
                  Need Split Bill? Tell Cashier
                </button>
                <button
                  type="button"
                  onClick={() => setToast('Tender choice signaled to Terminal #01 checkout operator.')}
                  className="w-full sm:w-1/2 h-[52px] rounded-xl bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary font-semibold flex items-center justify-center gap-2 hover:bg-surface-container hover:text-text-primary transition-all active:scale-[0.98] shadow-sm"
                >
                  <Icon name="swap_horiz" className="text-[20px]" />✕ Change Tender Method
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Bottom Status Pill */}
        <div className="w-full py-space-xs flex items-center justify-between text-text-tertiary font-caption text-caption px-space-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
            <span>VEMTAP Verified CFD Terminal #01 • End-to-End Encrypted Hardware Tokenization</span>
          </div>
          <div className="flex items-center gap-4">
            <span>PCI-DSS Validated</span>
            <span>Firmware v4.9.12-PRO</span>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </CheckoutHubShell>
  );
}
