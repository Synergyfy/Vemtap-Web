import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessCfdHeader } from './BusinessCfdHeader';

interface BusinessPosDisplayOrderScreenProps {
  onBack: () => void;
  onProceed: () => void;
  onSplit: () => void;
}

const ORDER_ITEMS = [
  { name: 'Woodfire Ribeye 250g', meta: 'Medium rare, peppercorn sauce', price: '₦16,000' },
  { name: 'Double Smash Burger', meta: 'Extra pickles, house sauce', price: '₦6,500' },
  { name: 'Truffle Parm Fries', meta: 'Aioli bowl, parsley flake', price: '₦3,200' },
  { name: 'Passionfruit Mojito', meta: 'Fresh mint, crushed ice', price: '₦3,500' },
];

const SUMMARY = [
  { label: 'Subtotal', value: '₦29,200', tone: 'text-text-secondary', valueTone: 'text-on-surface' },
  { label: 'VEMTAP Member Deal', value: '-₦1,572', tone: 'text-badge-discount-text', valueTone: 'text-badge-discount-text' },
  { label: 'VAT (7.5%)', value: '₦2,072', tone: 'text-text-secondary', valueTone: 'text-on-surface' },
];

const PAYMENT_BADGES = [
  { icon: 'contactless', label: 'Card Tap' },
  { icon: 'phone_android', label: 'VEMTAP Pay' },
  { icon: 'account_balance_wallet', label: 'Apple / Google Pay' },
  { icon: 'account_balance', label: 'Bank Transfer' },
];

export function BusinessPosDisplayOrderScreen({ onBack, onProceed, onSplit }: BusinessPosDisplayOrderScreenProps) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const copyTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const copyAccount = () => {
    navigator.clipboard?.writeText('1018492041').catch(() => undefined);
    setCopied(true);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <AppScreen>
      <BusinessCfdHeader title="Live Order Ring Up" onBack={onBack} />

      <div className="flex flex-col w-full pb-space-2xl">
        {/* Merchant banner */}
        <div className="px-margin pt-space-sm pb-space-xs">
          <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="relative w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                <Icon name="restaurant" className="text-primary text-[20px]" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Icon name="verified" filled className="text-on-primary text-[12px]" />
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <span className="font-label-sm text-label-sm text-on-surface truncate font-semibold">Urban Grill &amp; Bistro</span>
                  <Icon name="check_circle" filled className="text-primary text-[15px]" />
                </div>
                <span className="font-caption text-caption text-text-secondary truncate">Wuse Branch · Till 01 · Counter</span>
              </div>
            </div>
            <div className="bg-surface-tint-blue px-space-xs py-space-2xs rounded-full flex items-center gap-space-2xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption text-primary font-semibold">Active Order</span>
            </div>
          </div>
        </div>

        {/* VIP banner */}
        <div className="px-margin mb-space-sm">
          <div className="bg-surface-container-high rounded-xl p-space-sm flex items-center justify-between shadow-sm gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <Icon name="stars" filled className="text-on-primary-fixed text-[18px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface truncate">Hello Michael James 👋</span>
                <span className="font-caption text-caption text-text-secondary">VIP Member · 2,450 points available</span>
              </div>
            </div>
            <button
              className="bg-surface-canvas text-primary font-caption text-caption px-space-xs py-space-2xs rounded-full shadow-sm flex items-center gap-space-2xs shrink-0 active:scale-95 transition-transform"
              type="button"
              onClick={() => showToast('Perk picker opened for Michael')}
            >
              <Icon name="redeem" className="text-[14px]" />
              <span>Use Perks</span>
            </button>
          </div>
        </div>

        {/* Live bill */}
        <div className="px-margin mb-space-sm">
          <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-2xs">
                <Icon name="receipt_long" className="text-primary text-[18px]" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Live Bill</span>
              </div>
              <span className="font-caption text-caption text-text-secondary bg-surface-container px-space-xs py-0.5 rounded-full font-medium">
                4 Items Rung
              </span>
            </div>
            <div className="flex flex-col">
              {ORDER_ITEMS.map((item, index) => (
                <div key={item.name}>
                  <div className="flex items-start justify-between gap-space-xs py-space-2xs">
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface truncate">{item.name}</span>
                      <span className="font-caption text-caption text-text-secondary truncate">{item.meta}</span>
                      <span className="font-caption text-caption text-primary font-medium mt-0.5">Qty: 1</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface shrink-0 font-semibold">{item.price}</span>
                  </div>
                  {index < ORDER_ITEMS.length - 1 && <div className="h-px bg-surface-container-high w-full" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings banner */}
        <div className="px-margin mb-space-sm">
          <div className="bg-badge-discount-bg rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-8 h-8 rounded-full bg-badge-discount-text/10 flex items-center justify-center shrink-0">
                <Icon name="local_activity" filled className="text-badge-discount-text text-[18px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold truncate">
                  VEMTAP Prime Lunch Applied
                </span>
                <span className="font-caption text-caption text-badge-discount-text">Member instant savings active 🎉</span>
              </div>
            </div>
            <span className="font-heading-sm text-heading-sm text-badge-discount-text font-bold shrink-0">-₦1,572</span>
          </div>
        </div>

        {/* Totals */}
        <div className="px-margin mb-space-sm">
          <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col gap-space-2xs">
            {SUMMARY.map((row) => (
              <div className={`flex justify-between items-center ${row.tone}`} key={row.label}>
                <span className="font-body-md text-body-md">{row.label}</span>
                <span className={`font-label-sm text-label-sm font-semibold ${row.valueTone}`}>{row.value}</span>
              </div>
            ))}
            <div className="h-px bg-surface-container-high w-full my-0.5" />
            <div className="flex justify-between items-end pt-space-2xs">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Total Payable
                </span>
                <span className="font-caption text-caption text-primary font-medium">Receipt via VEMTAP</span>
              </div>
              <span className="font-heading-md text-heading-md text-primary font-bold tracking-tight">₦29,700</span>
            </div>
          </div>
        </div>

        {/* Scan to pay */}
        <div className="px-margin mb-space-sm">
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary/10 text-primary px-space-xs py-space-2xs rounded-full font-caption text-caption font-semibold mb-space-xs flex items-center gap-space-2xs">
              <Icon name="qr_code_scanner" className="text-[14px]" />
              <span>Instant Scan to Pay &amp; Earn</span>
            </div>
            <h2 className="font-label-md text-label-md text-on-surface font-bold mb-0.5">Scan with VEMTAP App</h2>
            <p className="font-caption text-caption text-text-secondary max-w-xs mb-space-sm">
              Point your camera or VEMTAP scanner to confirm ₦29,700 and automatically collect +297 loyalty points.
            </p>
            <div className="bg-surface-canvas p-space-sm rounded-xl shadow-md flex flex-col items-center mb-space-sm">
              <div className="w-40 h-40 bg-surface-canvas rounded-lg flex items-center justify-center relative overflow-hidden">
                <svg className="w-36 h-36 text-on-surface" fill="currentColor" viewBox="0 0 200 200" aria-hidden="true">
                  <rect fill="currentColor" height="55" rx="10" width="55" x="10" y="10" />
                  <rect fill="#FFFFFF" height="35" rx="6" width="35" x="20" y="20" />
                  <rect fill="currentColor" height="19" rx="3" width="19" x="28" y="28" />
                  <rect fill="currentColor" height="55" rx="10" width="55" x="135" y="10" />
                  <rect fill="#FFFFFF" height="35" rx="6" width="35" x="145" y="20" />
                  <rect fill="currentColor" height="19" rx="3" width="19" x="153" y="28" />
                  <rect fill="currentColor" height="55" rx="10" width="55" x="10" y="135" />
                  <rect fill="#FFFFFF" height="35" rx="6" width="35" x="20" y="145" />
                  <rect fill="currentColor" height="19" rx="3" width="19" x="28" y="153" />
                  <rect fill="currentColor" height="12" rx="2" width="12" x="75" y="15" />
                  <rect fill="currentColor" height="24" rx="2" width="12" x="95" y="25" />
                  <rect fill="currentColor" height="12" rx="2" width="12" x="115" y="15" />
                  <rect fill="currentColor" height="12" rx="2" width="24" x="75" y="45" />
                  <rect fill="currentColor" height="20" rx="2" width="12" x="115" y="45" />
                  <rect fill="currentColor" height="22" rx="2" width="12" x="15" y="75" />
                  <rect fill="currentColor" height="12" rx="2" width="22" x="35" y="85" />
                  <rect fill="currentColor" height="12" rx="2" width="12" x="75" y="75" />
                  <rect fill="currentColor" height="12" rx="2" width="18" x="115" y="75" />
                  <rect fill="currentColor" height="24" rx="2" width="12" x="145" y="75" />
                  <rect fill="currentColor" height="12" rx="2" width="15" x="175" y="85" />
                  <rect fill="currentColor" height="12" rx="2" width="22" x="15" y="110" />
                  <rect fill="currentColor" height="18" rx="2" width="14" x="45" y="105" />
                  <rect fill="currentColor" height="25" rx="2" width="18" x="75" y="110" />
                  <rect fill="currentColor" height="12" rx="2" width="20" x="105" y="100" />
                  <rect fill="currentColor" height="15" rx="2" width="15" x="135" y="110" />
                  <rect fill="currentColor" height="12" rx="2" width="25" x="160" y="110" />
                  <rect fill="currentColor" height="15" rx="2" width="15" x="75" y="145" />
                  <rect fill="currentColor" height="12" rx="2" width="20" x="100" y="140" />
                  <rect fill="currentColor" height="25" rx="2" width="15" x="130" y="145" />
                  <rect fill="currentColor" height="15" rx="2" width="15" x="155" y="135" />
                  <rect fill="currentColor" height="15" rx="2" width="15" x="175" y="145" />
                  <rect fill="currentColor" height="15" rx="2" width="24" x="75" y="170" />
                  <rect fill="currentColor" height="20" rx="2" width="12" x="110" y="165" />
                  <rect fill="currentColor" height="15" rx="2" width="30" x="155" y="170" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center shadow-lg border-2 border-surface-canvas">
                    <Icon name="contactless" className="text-on-primary text-[18px]" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-2xs mt-space-xs text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="font-caption text-caption font-medium">Auto-refreshes in 45s</span>
              </div>
            </div>

            {/* Bank transfer */}
            <div className="w-full bg-surface-container rounded-lg p-space-xs mb-space-xs text-left flex items-center justify-between gap-space-xs">
              <div className="flex flex-col min-w-0">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Direct Bank Transfer
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                  Zenith Bank · 1018492041
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">Urban Grill Ltd (Auto-matched)</span>
              </div>
              <button
                className={`px-space-xs py-space-2xs rounded-lg font-caption text-caption shadow-sm flex items-center gap-1 shrink-0 active:scale-95 transition-transform ${
                  copied ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-canvas text-primary'
                }`}
                type="button"
                onClick={copyAccount}
              >
                <Icon name={copied ? 'check' : 'content_copy'} className="text-[14px]" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Payment badges */}
            <div className="w-full flex items-center justify-center flex-wrap gap-space-xs">
              {PAYMENT_BADGES.map((badge) => (
                <div
                  className="flex items-center gap-space-2xs bg-surface-canvas px-space-xs py-space-2xs rounded-full shadow-sm"
                  key={badge.label}
                >
                  <Icon name={badge.icon} className="text-primary text-[14px]" />
                  <span className="font-caption text-caption text-on-surface font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-margin flex flex-col gap-space-xs">
          <button
            className="w-full h-11 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all"
            type="button"
            onClick={onProceed}
          >
            <span>Proceed to Tip &amp; Payment</span>
            <Icon name="arrow_forward" className="text-[17px]" />
          </button>
          <button
            className="w-full h-10 bg-surface-container-low text-text-primary rounded-xl font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs transition-colors"
            type="button"
            onClick={onSplit}
          >
            <Icon name="call_split" className="text-text-secondary text-[16px]" />
            <span>Need Split Bill? Tell Cashier</span>
          </button>
          <div className="flex items-center justify-center gap-space-2xs text-text-tertiary pt-space-2xs">
            <Icon name="verified_user" className="text-primary text-[15px]" />
            <span className="font-caption text-caption">End-to-End Encrypted Terminal</span>
          </div>
          <p className="font-caption text-caption text-text-tertiary text-center">
            Thank you for dining with us! Receipts dispatched instantly via SMS &amp; VEMTAP.
          </p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
