import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessCfdHeader } from './BusinessCfdHeader';

interface BusinessPosDisplayPayScreenProps {
  onBack: () => void;
  onSplit: () => void;
  onPaid: () => void;
}

const CARD_NETWORKS = ['Mastercard', 'VISA', 'Verve', 'Apple Pay', 'G Pay'];

export function BusinessPosDisplayPayScreen({ onBack, onSplit, onPaid }: BusinessPosDisplayPayScreenProps) {
  const [seconds, setSeconds] = useState(105);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSeconds((current) => (current <= 1 ? 120 : current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const timerLabel = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const copyAccount = () => {
    navigator.clipboard?.writeText('9042817290').catch(() => undefined);
    setCopied(true);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppScreen>
      <BusinessCfdHeader title="Tap And QR Pay" onBack={onBack} />

      <div className="flex flex-col w-full px-margin pb-space-2xl gap-space-sm pt-space-xs">
        {/* Store strip */}
        <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-space-sm py-space-xs shadow-sm gap-space-xs">
          <div className="flex items-center gap-space-xs min-w-0">
            <div className="w-7 h-7 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
              <Icon name="restaurant" className="text-[16px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold leading-tight truncate">
                Urban Grill &amp; Bistro
              </span>
              <span className="font-caption text-caption text-text-secondary truncate">Victoria Island · Terminal #01</span>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs bg-surface-container px-space-xs py-space-2xs rounded-full shrink-0">
            <Icon name="verified_user" filled className="text-primary text-[14px]" />
            <span className="font-caption text-caption text-primary font-semibold">256-bit Secure</span>
          </div>
        </div>

        {/* Amount due */}
        <div className="relative overflow-hidden bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col items-center text-center">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-surface-tint-blue rounded-full pointer-events-none opacity-60" />
          <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
            Total Amount Due
          </span>
          <div className="flex items-baseline gap-space-2xs mt-0.5">
            <span className="font-heading-md text-heading-md text-on-surface font-bold">₦27,628</span>
            <span className="font-label-sm text-label-sm text-text-secondary font-medium">.00</span>
          </div>
          <div className="flex items-center gap-space-xs mt-space-2xs">
            <span className="font-caption text-caption text-text-secondary bg-surface-subtle px-space-xs py-0.5 rounded-md">3 Items</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="font-caption text-caption text-primary font-medium bg-surface-tint-blue px-space-xs py-0.5 rounded-md">
              Order #TK-108
            </span>
          </div>
        </div>

        {/* Scan to pay */}
        <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-space-xs">
            <div className="flex items-center gap-space-2xs">
              <Icon name="qr_code_scanner" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Scan to Pay</span>
            </div>
            <div className="flex items-center gap-space-2xs bg-surface-tint-blue px-space-xs py-space-2xs rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="font-caption text-caption text-primary font-medium">{timerLabel}</span>
            </div>
          </div>
          <div className="relative p-space-sm bg-surface-subtle rounded-xl flex items-center justify-center my-space-2xs w-full">
            <div className="absolute top-2 left-2 w-4 h-4 rounded-tl-sm bg-primary/40" />
            <div className="absolute top-2 right-2 w-4 h-4 rounded-tr-sm bg-primary/40" />
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-bl-sm bg-primary/40" />
            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-br-sm bg-primary/40" />
            <div className="absolute inset-x-8 top-6 h-0.5 bg-primary shadow-md opacity-80 animate-pulse" />
            <div className="relative w-40 h-40 bg-surface-canvas p-space-xs rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-full h-full text-on-surface" fill="currentColor" viewBox="0 0 100 100" aria-hidden="true">
                <rect height="26" rx="2" width="26" x="5" y="5" />
                <rect fill="#FFFFFF" height="18" rx="1" width="18" x="9" y="9" />
                <rect height="10" rx="1" width="10" x="13" y="13" />
                <rect height="26" rx="2" width="26" x="69" y="5" />
                <rect fill="#FFFFFF" height="18" rx="1" width="18" x="73" y="9" />
                <rect height="10" rx="1" width="10" x="77" y="13" />
                <rect height="26" rx="2" width="26" x="5" y="69" />
                <rect fill="#FFFFFF" height="18" rx="1" width="18" x="9" y="73" />
                <rect height="10" rx="1" width="10" x="13" y="77" />
                <rect height="6" width="6" x="36" y="7" />
                <rect height="6" width="6" x="46" y="7" />
                <rect height="6" width="6" x="56" y="7" />
                <rect height="8" width="8" x="36" y="17" />
                <rect height="6" width="6" x="52" y="19" />
                <rect height="6" width="8" x="10" y="37" />
                <rect height="8" width="6" x="22" y="37" />
                <rect height="8" width="8" x="34" y="34" />
                <rect height="6" width="6" x="46" y="38" />
                <rect height="8" width="8" x="60" y="35" />
                <rect height="6" width="8" x="72" y="38" />
                <rect height="8" width="6" x="86" y="36" />
                <rect height="8" width="8" x="8" y="50" />
                <rect height="6" width="6" x="22" y="52" />
                <rect height="6" width="10" x="68" y="50" />
                <rect height="8" width="8" x="82" y="52" />
                <rect height="8" width="6" x="36" y="68" />
                <rect height="6" width="8" x="46" y="74" />
                <rect height="8" width="8" x="58" y="70" />
                <rect height="8" width="8" x="70" y="68" />
                <rect height="6" width="6" x="84" y="72" />
                <rect height="8" width="8" x="38" y="84" />
                <rect height="6" width="6" x="52" y="86" />
                <rect height="8" width="6" x="64" y="82" />
                <rect height="6" width="8" x="76" y="84" />
                <rect height="8" width="6" x="88" y="84" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Icon name="bolt" className="text-on-primary text-[18px]" />
                </div>
              </div>
            </div>
          </div>
          <p className="font-label-sm text-label-sm text-text-secondary text-center mt-space-xs">
            Open <strong className="text-on-surface">VEMTAP</strong> or any Banking App (NIBSS NQR / Interswitch)
          </p>
        </div>

        {/* Tap card */}
        <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="flex items-center gap-space-2xs mb-space-xs self-start">
            <Icon name="contactless" className="text-primary text-[20px]" />
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">Or Tap Card / Phone Here</span>
          </div>
          <div className="relative w-24 h-24 my-space-2xs flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-surface-tint-blue flex items-center justify-center shadow-inner">
              <Icon name="sensors" filled className="text-primary text-[32px]" />
            </div>
          </div>
          <span className="font-caption text-caption text-text-secondary mb-space-sm text-center">
            Hold chip, smart card or device against bottom reader
          </span>
          <div className="flex flex-wrap items-center justify-center gap-space-xs w-full bg-surface-subtle py-space-xs px-space-sm rounded-lg">
            {CARD_NETWORKS.map((network) => (
              <span
                className="font-caption text-caption font-semibold text-text-primary px-space-xs py-0.5 bg-surface-canvas rounded shadow-sm"
                key={network}
              >
                {network}
              </span>
            ))}
          </div>
        </div>

        {/* Bank transfer */}
        <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <Icon name="account_balance" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Direct Till Bank Transfer</span>
            </div>
            <span className="font-caption text-caption text-badge-discount-text font-medium bg-badge-discount-bg px-space-xs py-0.5 rounded-full">
              Instant Confirmation
            </span>
          </div>
          <div className="bg-surface-canvas rounded-lg p-space-xs flex items-center justify-between shadow-sm gap-space-xs">
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary">Stanbic IBTC / Moniepoint</span>
              <span className="font-heading-sm text-heading-sm text-on-surface font-bold tracking-wider">9042 817 290</span>
              <span className="font-caption text-caption text-text-secondary font-medium truncate">
                Urban Grill &amp; Bistro Till 01
              </span>
            </div>
            <button
              className={`flex flex-col items-center justify-center p-space-xs rounded-lg transition-colors shrink-0 ${
                copied ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-tint-blue text-primary hover:bg-surface-container'
              }`}
              type="button"
              onClick={copyAccount}
            >
              <Icon name={copied ? 'check' : 'content_copy'} className="text-[18px]" />
              <span className="font-caption text-caption font-semibold mt-0.5">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Loyalty prompt */}
        <div className="flex items-center gap-space-xs bg-badge-discount-bg rounded-xl p-space-sm shadow-sm">
          <div className="w-9 h-9 rounded-full bg-badge-discount-text/10 flex items-center justify-center text-badge-discount-text shrink-0">
            <Icon name="stars" filled className="text-[20px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-2xs">
              <span className="font-label-sm text-label-sm text-badge-discount-text font-bold">+276 VEMTAP Points</span>
              <span className="font-caption text-caption text-badge-discount-text font-medium bg-surface-canvas px-1 rounded">
                Earn
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary leading-tight">
              Automatically added to linked phone number or card profile upon completion.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <button
              className="flex-1 py-space-xs px-space-sm rounded-xl bg-surface-canvas shadow-sm text-text-secondary font-label-sm text-label-sm flex items-center justify-center gap-space-2xs hover:bg-surface-subtle transition-colors"
              type="button"
              onClick={onSplit}
            >
              <Icon name="call_split" className="text-[16px]" />
              <span>Need Split Bill? Tell Cashier</span>
            </button>
            <button
              className="py-space-xs px-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-space-2xs hover:bg-surface-container-highest transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="close" className="text-[16px]" />
              <span>Change</span>
            </button>
          </div>
          <button
            className="w-full h-11 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all"
            type="button"
            onClick={onPaid}
          >
            <span>Confirm Payment Received (₦27,628)</span>
            <Icon name="arrow_forward" className="text-[17px]" />
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
