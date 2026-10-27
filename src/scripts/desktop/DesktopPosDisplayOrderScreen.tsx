import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { CheckoutHubShell } from './CheckoutHubShell';
import { naira, useLiveDisplay } from '../posLive';

const ORDER_ITEMS: Array<{ qty: string; name: string; mods: string; price: string }> = [
  { qty: '1×', name: 'Woodfire Ribeye 250g', mods: 'Medium rare · peppercorn sauce', price: '₦16,000' },
  { qty: '1×', name: 'Double Smash Burger', mods: 'Extra pickles · house sauce', price: '₦6,500' },
  { qty: '1×', name: 'Truffle Parm Fries', mods: 'Aioli bowl · parsley flake', price: '₦3,200' },
  { qty: '1×', name: 'Passionfruit Mojito', mods: 'Fresh mint · crushed ice', price: '₦3,500' },
];

const TENDER_METHODS: Array<{ icon: string; label: string }> = [
  { icon: 'contactless', label: 'Card Tap / NFC' },
  { icon: 'phone_iphone', label: 'VEMTAP Pay' },
  { icon: 'wallet', label: 'Apple / Google Pay' },
  { icon: 'payments', label: 'Bank Transfer' },
];

const QR_RECTS: Array<{ x: number; y: number; w: number; h: number; fill?: 'white' }> = [
  { x: 5, y: 5, w: 26, h: 26 },
  { x: 9, y: 9, w: 18, h: 18, fill: 'white' },
  { x: 13, y: 13, w: 10, h: 10 },
  { x: 69, y: 5, w: 26, h: 26 },
  { x: 73, y: 9, w: 18, h: 18, fill: 'white' },
  { x: 77, y: 13, w: 10, h: 10 },
  { x: 5, y: 69, w: 26, h: 26 },
  { x: 9, y: 73, w: 18, h: 18, fill: 'white' },
  { x: 13, y: 77, w: 10, h: 10 },
  { x: 36, y: 8, w: 5, h: 5 },
  { x: 45, y: 8, w: 8, h: 5 },
  { x: 57, y: 8, w: 6, h: 5 },
  { x: 36, y: 17, w: 10, h: 4 },
  { x: 50, y: 17, w: 12, h: 4 },
  { x: 36, y: 25, w: 6, h: 6 },
  { x: 46, y: 25, w: 6, h: 6 },
  { x: 56, y: 25, w: 7, h: 6 },
  { x: 8, y: 36, w: 6, h: 7 },
  { x: 18, y: 36, w: 8, h: 7 },
  { x: 30, y: 36, w: 5, h: 7 },
  { x: 8, y: 47, w: 10, h: 5 },
  { x: 22, y: 47, w: 13, h: 5 },
  { x: 8, y: 56, w: 8, h: 7 },
  { x: 20, y: 56, w: 15, h: 7 },
  { x: 68, y: 36, w: 7, h: 8 },
  { x: 79, y: 36, w: 12, h: 8 },
  { x: 68, y: 48, w: 14, h: 6 },
  { x: 86, y: 48, w: 5, h: 6 },
  { x: 68, y: 58, w: 9, h: 6 },
  { x: 81, y: 58, w: 10, h: 6 },
  { x: 36, y: 68, w: 7, h: 6 },
  { x: 47, y: 68, w: 14, h: 6 },
  { x: 36, y: 78, w: 10, h: 6 },
  { x: 50, y: 78, w: 12, h: 6 },
  { x: 36, y: 88, w: 16, h: 6 },
  { x: 56, y: 88, w: 7, h: 6 },
  { x: 68, y: 68, w: 6, h: 12 },
  { x: 78, y: 68, w: 8, h: 8 },
  { x: 89, y: 68, w: 5, h: 12 },
  { x: 68, y: 84, w: 12, h: 10 },
  { x: 84, y: 84, w: 10, h: 10 },
];

export function DesktopPosDisplayOrderScreen() {
  const [refresh, setRefresh] = useState(42);
  const [copied, setCopied] = useState(false);
  const [perksApplied, setPerksApplied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((value) => (value <= 1 ? 45 : value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!perksApplied) return;
    const timeout = setTimeout(() => setPerksApplied(false), 2500);
    return () => clearTimeout(timeout);
  }, [perksApplied]);

  const display = useLiveDisplay();
  const live = display.live;
  const items = live
    ? (display.ticket?.lines ?? []).map((line) => ({ qty: `${line.quantity}×`, name: line.name, mods: `${naira(line.unitPrice)} each`, price: naira(line.lineTotal) }))
    : ORDER_ITEMS;
  const ticket = display.ticket;
  const money = (value: number | undefined, demo: string) => (live ? naira(value ?? 0) : demo);
  const accountNumber = live ? (display.transfer?.accountNumber ?? '') : '1018492041';

  const handleCopy = () => {
    if (!accountNumber) return;
    navigator.clipboard?.writeText(accountNumber);
    setCopied(true);
  };

  return (
    <CheckoutHubShell>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-md">
        {/* Top CFD Operational HUD Banner */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
              <Icon name="restaurant" className="text-[28px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{live ? display.venueName : 'Urban Grill & Bistro'}</span>
                <Icon name="verified" className="text-primary text-[18px]" filled />
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-text-secondary font-label-sm text-label-sm font-medium">
                  {live ? display.whereLine : 'Till 01 · Wuse II'}
                </span>
              </div>
              <span className="font-caption text-caption text-text-tertiary">
                Customer-Facing Display Terminal #CFD-ABJ-89
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
              <span>CFD Active · Live Synced</span>
            </div>
            <div className="flex items-center gap-space-sm pl-space-sm bg-surface-container-low rounded-full py-1 pr-1">
              <div className="flex items-center gap-space-2xs text-text-primary">
                <span className="font-label-md text-label-md font-semibold">Hello {live ? (display.customerName ?? 'there') : 'Michael J.'} 👋</span>
                <span className="text-text-tertiary">·</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
                  {live ? (display.customerName ? 'Member' : 'Guest') : 'VIP Member'}
                </span>
                <span className="font-caption text-caption text-text-secondary ml-1">
                  <strong className="text-text-primary">{live ? '—' : '2,450'}</strong> pts
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPerksApplied(true)}
                className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm font-medium transition-all active:scale-95 shadow-sm ${
                  perksApplied ? 'bg-badge-discount-text text-on-primary' : 'bg-primary text-on-primary hover:bg-primary-container'
                }`}
              >
                {perksApplied ? 'Points Applied!' : 'Use Perks'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Split Columns Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Live Order Breakdown (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            {/* Order Header Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <Icon name="receipt_long" className="text-primary text-[22px]" />
                  <span className="font-heading-md text-heading-md text-text-primary font-bold">Live Bill</span>
                </div>
                <span className="px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
                  4 Items Rung
                </span>
              </div>

              {/* Items Stream */}
              <div className="flex flex-col gap-space-sm">
                {items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="p-space-sm rounded-xl bg-surface-subtle flex items-start justify-between gap-space-sm hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-space-sm min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm font-bold text-text-primary shrink-0 mt-0.5">
                        {item.qty}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                          {item.name}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{item.mods}</span>
                      </div>
                    </div>
                    <span className="font-label-md text-label-md text-text-primary font-bold whitespace-nowrap">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promotion Savings Tag */}
              <div className="mt-space-md p-space-sm rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="celebration" className="text-[20px]" />
                  <span className="font-label-sm text-label-sm font-semibold">{live ? (display.discount ? 'Discount applied 🎉' : 'No discount on this ticket') : 'VEMTAP Prime Lunch Active 🎉'}</span>
                </div>
                <span className="font-label-md text-label-md font-bold">{live ? `-${naira(display.discount)}` : '-₦1,572'}</span>
              </div>

              {/* Accounting Breakdown */}
              <div className="mt-space-md pt-space-xs flex flex-col gap-space-xs">
                <div className="flex justify-between items-center text-text-secondary font-label-sm text-label-sm">
                  <span>Subtotal</span>
                  <span className="text-text-primary font-medium">{money(ticket?.subtotal, '₦29,200')}</span>
                </div>
                <div className="flex justify-between items-center text-badge-discount-text font-label-sm text-label-sm">
                  <span>Member Deal Savings</span>
                  <span className="font-medium">{live ? `-${naira(display.discount)}` : '-₦1,572'}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary font-label-sm text-label-sm">
                  <span>{live ? (display.summary[display.summary.length - 1]?.label ?? 'Tax') : 'VAT (7.5%)'}</span>
                  <span className="text-text-primary font-medium">{money(ticket?.tax, '₦2,072')}</span>
                </div>
              </div>

              {/* Massive Total Payable Deck */}
              <div className="mt-space-md p-space-md rounded-xl bg-primary text-on-primary flex items-center justify-between shadow-lg">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-surface-container-high uppercase tracking-wider font-semibold">
                    Total Payable
                  </span>
                  <span className="font-caption text-caption text-primary-fixed-dim">
                    All taxes &amp; discounts included
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display-hero text-display-hero font-bold tracking-tight">{money(display.total, '₦29,700')}</span>
                </div>
              </div>
            </div>

            {/* Ambient Mini Guarantee Strip */}
            <div className="bg-surface-container-low rounded-xl px-space-md py-space-sm flex items-center gap-space-sm text-text-secondary">
              <Icon name="verified_user" className="text-primary text-[20px]" />
              <span className="font-caption text-caption leading-tight">
                Instant digital receipt dispatched to your registered phone (+234 ••• ••• 4192) upon settlement.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Payment Terminal Deck & QR (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            {/* Seamless Instant Pay QR Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold mb-space-sm">
                <Icon name="bolt" className="text-[16px]" />
                <span>Earn +297 Instant Points with VEMTAP App</span>
              </div>
              <span className="font-heading-md text-heading-md text-text-primary font-bold">
                Scan with VEMTAP App to Pay
              </span>
              <p className="font-caption text-caption text-text-secondary mt-1 max-w-sm">
                Aim phone camera or tap inside your VEMTAP wallet for one-touch biometric authorization.
              </p>

              {/* Dynamic QR Container */}
              <div className="relative my-space-md p-space-md bg-surface-canvas rounded-2xl shadow-xl flex items-center justify-center">
                {/* Simulated High-Precision QR Canvas SVG */}
                <svg className="w-48 h-48 text-text-primary" fill="currentColor" viewBox="0 0 100 100">
                  {QR_RECTS.map((rect, index) => (
                    <rect
                      key={index}
                      fill={rect.fill === 'white' ? 'white' : 'currentColor'}
                      x={rect.x}
                      y={rect.y}
                      width={rect.w}
                      height={rect.h}
                      rx={rect.w === 26 ? 3 : rect.w === 18 ? 2 : rect.w === 10 && rect.h === 10 ? 1 : 0}
                    />
                  ))}
                </svg>
                {/* Center Brand Lightning Glyph */}
                <div className="absolute inset-0 m-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-md">
                  <Icon name="bolt" className="text-[24px]" filled />
                </div>
              </div>

              <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption">
                <Icon name="sync" className="text-[16px] animate-spin" />
                <span>
                  Auto-refreshes in <strong className="text-text-secondary">{refresh}s</strong>
                </span>
              </div>

              {/* Direct Bank Transfer Block */}
              <div className="w-full mt-space-md p-space-sm rounded-xl bg-surface-subtle flex flex-col md:flex-row items-center justify-between gap-space-sm text-left">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="account_balance" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm font-bold text-text-primary">
                      {live
                        ? display.transfer?.accountNumber
                          ? `${display.transfer.bankName ?? 'Bank'} · ${display.transfer.accountNumber}`
                          : 'Not set up'
                        : 'Zenith Bank · 1018492041'}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {live ? (display.transfer?.accountName ?? '—') : 'Urban Grill Ltd (Auto-matched)'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`w-full md:w-auto px-space-md py-1.5 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 shrink-0 ${
                    copied
                      ? 'bg-badge-discount-bg text-badge-discount-text'
                      : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                  }`}
                >
                  <Icon name={copied ? 'done' : 'content_copy'} className="text-[16px]" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Alternate Quick Tender Options Strip */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
              <span className="font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider mb-1">
                Other Counter Tender Methods
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs">
                {TENDER_METHODS.map((method) => (
                  <button
                    key={method.label}
                    type="button"
                    className="flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-tint-blue text-text-primary hover:text-primary transition-all active:scale-95 group"
                  >
                    <Icon name={method.icon} className="text-[24px] text-text-secondary group-hover:text-primary" />
                    <span className="font-label-sm text-label-sm font-semibold mt-1">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Encrypted Terminal Footer Pill */}
            <div className="px-space-md py-space-xs flex items-center justify-center gap-space-xs text-text-tertiary text-center">
              <Icon name="lock" className="text-[16px] text-primary" />
              <span className="font-caption text-caption">
                End-to-End Encrypted Terminal · Receipts dispatched instantly via SMS &amp; VEMTAP.
              </span>
            </div>
          </div>
        </div>
      </div>
    </CheckoutHubShell>
  );
}
