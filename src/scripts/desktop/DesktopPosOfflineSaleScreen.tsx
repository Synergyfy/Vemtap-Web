import { useEffect, useRef, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { naira, useLivePos } from '../posLive';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosOfflineSaleScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
}

type TenderKey = 'cash' | 'external' | 'tab';
type SaleState = 'idle' | 'saving' | 'saved';

const TICKET_LINES = [
  { qty: 1, name: 'Woodfire Ribeye Steak (250g)', meta: '₦16,000 • Verified local cache price', amount: '₦16,000.00' },
  { qty: 1, name: 'Double Smash Burger & Fries', meta: '₦6,500 • Standard offline price', amount: '₦6,500.00' },
  { qty: 2, name: 'Passionfruit Mojito', meta: '₦3,500 ea • Bar offline tariff', amount: '₦7,000.00' },
];

const TENDERS: { key: TenderKey; icon: string; title: string; meta: string }[] = [
  { key: 'cash', icon: 'payments', title: 'Cash Tender', meta: 'Automatic drawer relay trigger' },
  { key: 'external', icon: 'credit_card', title: 'External POS Terminal', meta: 'Moniepoint, OPay or Stanbic RRN fallback' },
  { key: 'tab', icon: 'receipt_long', title: 'Offline House Tab', meta: 'Pre-approved regular buffer credit limit' },
];

interface SaleCtaProps {
  state: SaleState;
  onClick: () => void;
  className: string;
}

function SaleCta({ state, onClick, className }: SaleCtaProps) {
  const live = hasApiConfig();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== 'idle'}
      className={`rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] ${
        state === 'saved'
          ? 'bg-badge-discount-text text-on-primary'
          : 'bg-primary-container text-on-primary disabled:opacity-90'
      } ${className}`}
    >
      {state === 'idle' && (
        <>
          <span>{live ? 'Complete Offline Sale' : 'Complete Offline Sale (₦31,712.50)'}</span>
          <Icon name="arrow_forward" className="text-[19px]" />
        </>
      )}
      {state === 'saving' && (
        <>
          <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
          <span>Printing &amp; Storing Locally…</span>
        </>
      )}
      {state === 'saved' && (
        <>
          <Icon name="check_circle" className="text-[19px]" />
          <span>Saved to SQLite #LOC-TXN-402-005</span>
        </>
      )}
    </button>
  );
}

export function DesktopPosOfflineSaleScreen({ onNav }: DesktopPosOfflineSaleScreenProps) {
  const [tender, setTender] = useState<TenderKey>('cash');
  const [saleState, setSaleState] = useState<SaleState>('idle');
  const [rrn, setRrn] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const saleTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (saleTimer.current !== null) window.clearTimeout(saleTimer.current);
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const live = hasApiConfig();
  const pos = useLivePos();
  const queuedCount = live ? pos.offline.pendingCount : 5;
  const tillLabel = live ? (pos.isOpen ? pos.tillName : 'this till') : 'Till #01';
  // Live: the ticket card shows the latest sale queued on this device while offline.
  const lastQueued = live ? ([...pos.offline.queue].sort((a, b) => b.takenAt - a.takenAt)[0] ?? null) : null;
  const queuedTime = lastQueued
    ? new Date(lastQueued.takenAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    : '—';
  const lastTotal = lastQueued ? naira(lastQueued.total) : '—';

  const completeSale = () => {
    if (live) {
      // The register queues sales on this device by itself while offline.
      showToast('Ring this sale up on the register — offline sales queue on this device automatically');
      return;
    }
    if (saleState !== 'idle') return;
    setSaleState('saving');
    saleTimer.current = window.setTimeout(() => {
      setSaleState('saved');
      showToast('Ticket queued for local SQLite buffer');
    }, 1200);
  };

  return (
    <PosTerminalChrome onNav={onNav} activeNav="register">
      {/* Offline status strip */}
      <div className="py-space-xs bg-error-container text-on-error-container">
        <div className="w-full flex flex-wrap items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <Icon name="cloud_off" className="text-[16px]" />
            <span className="font-label-md text-label-md font-semibold">Offline Mode Active</span>
            <span className="opacity-60">|</span>
            <span className="font-body-md text-body-md">Cached Ledger: {live ? queuedCount : 14} Txs</span>
          </div>
          <div className="flex items-center gap-space-xs font-caption text-caption uppercase tracking-wider font-semibold">
            <Icon name="lock" className="text-[14px]" />
            <span>SQLite AES-256 Local Buffer</span>
          </div>
        </div>
      </div>

      <div className="py-space-lg flex flex-col gap-space-xl">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <Icon name="cloud_off" className="text-[14px]" />
              <span>Offline Mode Active</span>
              <span>•</span>
              <span>{live ? tillLabel : 'Station POS-NG-ABJ-004'}</span>
              <span>•</span>
              <span>Cached Ledger: {live ? queuedCount : 14} Txs</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Offline Checkout Terminal</h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              {live ? `Cashier: ${pos.cashierName} • ${tillLabel}` : 'Cashier #08: Alex R. • Reg 02'} — every ticket is written to the encrypted on-device SQLite buffer and
              reconciles with VEMTAP Cloud the second network returns.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={() => showToast(`Local queue holds ${queuedCount} buffered transactions pending sync`)}
              className="inline-flex items-center gap-space-xs px-space-md py-3 rounded-xl bg-surface-container-high text-on-surface font-button-secondary text-button-secondary hover:bg-surface-subtle transition-colors"
            >
              <Icon name="inventory_2" className="text-[18px]" />
              <span>View Local Queue ({queuedCount})</span>
            </button>
            <SaleCta state={saleState} onClick={completeSale} className="px-space-lg py-3" />
          </div>
        </div>

        {/* Persistent offline warning banner */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-border-subtle flex items-start gap-space-md">
          <span className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
            <Icon name="cloud_off" filled className="text-[20px]" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-2xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold leading-none">
                  Offline Mode Active
                </span>
                <span className="inline-flex items-center gap-1 bg-surface-tint-blue text-primary font-caption text-caption px-2 py-0.5 rounded-full font-medium shadow-sm">
                  <Icon name="lock" className="text-[12px]" />
                  <span>SQLite AES-256</span>
                </span>
              </div>
              <span className="bg-error-container text-on-error-container font-caption text-caption px-2 py-0.5 rounded-full font-medium shrink-0">
                {queuedCount} queued sales
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Sales are stored encrypted on {tillLabel}. Automatic cloud reconciliation fires the second network returns.
            </p>
          </div>
        </div>

        {/* Metrics Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Metric 1: Terminal context */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Terminal Context
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">
                  {live ? pos.branchName : 'Wuse Branch (Flagship)'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="storefront" className="text-[20px]" />
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-text-secondary mt-space-md">
              {live ? `${tillLabel} • Cashier: ${pos.cashierName}` : 'Till #01 • Cashier: Emeka Okafor'}
            </span>
          </div>

          {/* Metric 2: Network status */}
          <div className="p-space-lg rounded-xl bg-error-container text-on-error-container shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider opacity-80">Network Status</span>
                <span className="font-heading-sm text-heading-sm mt-space-2xs font-semibold">No Internet (Offline)</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-canvas/60 flex items-center justify-center text-error">
                <Icon name="cloud_off" className="text-[20px]" />
              </div>
            </div>
            <span className="font-label-sm text-label-sm mt-space-md opacity-90">
              SQLite AES-256 encrypted on-device storage
            </span>
          </div>

          {/* Metric 3: Local buffer capacity */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Local Buffer
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">Buffer Cap</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary">
                <Icon name="inventory_2" className="text-[20px]" />
              </div>
            </div>
            <div className="mt-space-md">
              <span className="font-display-hero text-display-hero text-on-surface leading-none">{queuedCount} / 500</span>
              <div className="mt-space-2xs flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-secondary">Txs buffered</span>
                <span className="font-caption text-caption text-primary font-medium">{queuedCount} queued sales</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Total due */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">Ticket Total</span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">Total Due</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                <Icon name="payments" className="text-[20px]" />
              </div>
            </div>
            <div className="mt-space-md">
              <span className="font-display-hero text-display-hero text-primary leading-none">{live ? lastTotal : '₦31,712.50'}</span>
              <div className="mt-space-2xs flex items-center justify-between text-text-tertiary font-caption text-caption">
                <span>{live ? `Last offline sale ${queuedTime}` : 'Subtotal ₦29,500.00'}</span>
                <span>{live ? (lastQueued?.tender ?? '') : 'VAT (7.5%) ₦2,212.50'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column: Search cache & offline ticket */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Search & local cache */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-2xs">
              <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                Local Catalog Lookup
              </span>
              <div className="relative flex items-center">
                <Icon name="search" className="absolute left-3.5 text-text-tertiary text-[19px]" />
                <input
                  type="text"
                  placeholder={live ? 'Search cached items or SKU...' : 'Search 142 cached items or SKU...'}
                  autoComplete="off"
                  className="w-full h-11 pl-11 pr-12 rounded-xl bg-surface-container-low font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-colors shadow-sm"
                />
                <button
                  type="button"
                  aria-label="Scan barcode"
                  onClick={() => showToast('Barcode scanner ready (device cache)')}
                  className="absolute right-2 w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary active:scale-95 transition-transform"
                >
                  <Icon name="barcode_scanner" className="text-[19px]" />
                </button>
              </div>
              <div className="flex items-center justify-between px-1 pt-space-2xs">
                <span className="flex items-center gap-1.5 text-badge-discount-text min-w-0">
                  <Icon name="check_circle" className="text-[15px] shrink-0" />
                  <span className="font-caption text-caption font-medium truncate">{live ? 'Menu cached on this device' : 'Local Menu Cache Ready (14:15)'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => showToast(live ? 'Menu cache refreshed' : 'Re-indexed 142 cached items')}
                  className="font-caption text-caption text-primary shrink-0"
                >
                  Re-index
                </button>
              </div>
            </div>

            {/* Active offline cart & ticket */}
            <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
              <div className="bg-surface-container-low p-space-md flex flex-col gap-space-2xs">
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-label-md text-label-md font-bold text-text-primary truncate">
                      {live ? (lastQueued?.ref ?? 'No offline sale yet') : 'LOC-TXN-402-005'}
                    </span>
                    <span className="bg-surface-tint-blue text-primary font-caption text-caption px-1.5 py-0.5 rounded shrink-0">
                      STANDALONE
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary shrink-0">{live ? queuedTime : 'Today, 03:12 PM'}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-caption text-caption text-text-secondary">
                  <span>{live ? `Cashier: ${pos.cashierName}` : 'Cashier: Emeka O. (#VT-STAFF-09)'}</span>
                  <span>•</span>
                  <span>{live ? pos.branchName : 'Branch ID: LOC-001'}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-space-xs bg-surface-canvas p-2.5 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-text-secondary shrink-0">
                      <Icon name="person" className="text-[15px]" />
                    </span>
                    <div className="truncate">
                      <span className="font-label-sm text-label-sm text-text-primary block font-medium truncate">
                        Guest Walk-in
                      </span>
                      <span className="font-caption text-caption text-text-secondary block truncate">
                        Offline patron indexing ready
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Patron attach queued until network returns')}
                    className="px-2.5 py-1 rounded-md bg-surface-tint-blue text-primary font-caption text-caption font-semibold active:scale-95 transition-transform shrink-0"
                  >
                    Attach Patron
                  </button>
                </div>
              </div>

              {/* Cart lines */}
              <div className="p-space-md flex flex-col">
                {live && (
                  <span className="font-label-md text-label-md text-text-primary font-medium py-1.5">
                    {lastQueued ? lastQueued.items || '—' : 'Sales rung up on the register while offline queue here.'}
                  </span>
                )}
                {!live && TICKET_LINES.map((line) => (
                  <div key={line.name} className="flex items-center justify-between gap-space-xs py-1.5">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="w-6 h-6 rounded-md bg-surface-container-low text-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0">
                        {line.qty}×
                      </span>
                      <div className="truncate">
                        <span className="font-label-md text-label-md text-text-primary font-medium block truncate">
                          {line.name}
                        </span>
                        <span className="font-caption text-caption text-text-secondary block truncate">{line.meta}</span>
                      </div>
                    </div>
                    <span className="font-label-md text-label-md font-semibold text-text-primary shrink-0">
                      {line.amount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financials */}
              <div className="bg-surface-subtle p-space-md flex flex-col gap-1.5">
                <div className="flex justify-between font-caption text-caption text-text-secondary">
                  <span>{live ? 'Tender' : 'Subtotal (3 items)'}</span>
                  <span>{live ? (lastQueued?.tender ?? '—') : '₦29,500.00'}</span>
                </div>
                {!live && (
                  <div className="flex justify-between font-caption text-caption text-text-secondary">
                    <span>VAT (7.5% Local Statutory)</span>
                    <span>₦2,212.50</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-heading-sm text-heading-sm text-text-primary font-bold pt-2 mt-1 bg-surface-container-lowest/50 px-2 py-1.5 rounded-lg">
                  <span>Total Due</span>
                  <span className="text-primary font-heading-md text-heading-md">{live ? lastTotal : '₦31,712.50'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tender, guarantee & actions */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Offline tender selection */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">Offline Tender Method</span>
                <span className="font-caption text-caption text-primary flex items-center gap-1 shrink-0">
                  <Icon name="bolt" className="text-[13px]" />
                  <span>Immediate Kick</span>
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary -mt-space-2xs">
                Logged immediately to local hardware register; print command sends via ESC/POS USB.
              </p>

              {TENDERS.map((option) => {
                const isActive = tender === option.key;
                return (
                  <div
                    key={option.key}
                    className={`rounded-xl p-space-md shadow-sm flex flex-col gap-space-2xs ${
                      isActive ? 'bg-surface-tint-blue' : 'bg-surface-container-lowest'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setTender(option.key)}
                      className="flex items-center justify-between gap-space-xs w-full text-left"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary'
                          }`}
                        >
                          <Icon name={option.icon} className="text-[17px]" />
                        </span>
                        <span className="flex flex-col min-w-0">
                          <span
                            className={`font-label-md text-label-md text-text-primary block truncate ${
                              isActive ? 'font-bold' : 'font-semibold'
                            }`}
                          >
                            {option.title}
                          </span>
                          <span
                            className={`font-caption text-caption block truncate ${
                              isActive ? 'text-primary font-medium' : 'text-text-secondary'
                            }`}
                          >
                            {option.meta}
                          </span>
                        </span>
                      </span>
                      {isActive ? (
                        <Icon name="check_circle" filled className="text-primary text-[19px] shrink-0" />
                      ) : option.key === 'tab' ? (
                        <Icon name="chevron_right" className="text-text-tertiary text-[19px] shrink-0" />
                      ) : (
                        <span className="font-caption text-caption text-primary font-semibold shrink-0">Select</span>
                      )}
                    </button>

                    {isActive && option.key === 'cash' && (
                      <div className="bg-surface-canvas rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-space-xs mt-1 shadow-sm">
                        <div>
                          <span className="font-caption text-caption text-text-secondary block">Amount Tendered</span>
                          <span className="font-label-md text-label-md font-bold text-text-primary">{live ? '—' : '₦35,000.00'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-caption text-caption text-text-secondary block">Cash Change Due</span>
                          <span className="font-label-md text-label-md font-bold text-badge-discount-text">
                            {live ? '—' : '₦3,287.50'}
                          </span>
                        </div>
                      </div>
                    )}

                    {isActive && option.key === 'external' && (
                      <div className="bg-surface-canvas rounded-lg p-2.5 flex items-center gap-space-xs mt-1 shadow-sm">
                        <div className="flex-1 min-w-0">
                          <span className="font-caption text-caption text-text-secondary block mb-1">
                            Terminal reference (RRN)
                          </span>
                          <input
                            value={rrn}
                            onChange={(e) => setRrn(e.target.value)}
                            placeholder="e.g. 99402194"
                            inputMode="numeric"
                            className="w-full h-9 rounded-md bg-surface-container-low px-2.5 font-label-sm text-label-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {isActive && option.key === 'tab' && (
                      <div className="bg-surface-canvas rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-space-xs mt-1 shadow-sm">
                        <div>
                          <span className="font-caption text-caption text-text-secondary block">House Tab Limit</span>
                          <span className="font-label-md text-label-md font-bold text-text-primary">{live ? '—' : '₦100,000.00'}</span>
                        </div>
                        <span className="font-caption text-caption text-text-tertiary font-medium">{live ? '—' : '0.0% used'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cryptographic receipt guarantee */}
            <div className="bg-surface-container-high rounded-xl p-space-md shadow-sm flex gap-space-xs">
              <Icon name="verified_user" className="text-on-surface-variant text-[21px] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  Offline Cryptographic Receipt Guarantee
                </span>
                <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                  This sale will receive a local SHA-256 seal and print{' '}
                  <strong className="text-on-surface font-semibold">'** OFFLINE SALE **'</strong> on the thermal ticket.
                  It sits in queue until this device re-establishes WAN handshake.
                </p>
              </div>
            </div>

            {/* Bottom actions deck */}
            <div className="flex flex-col gap-space-xs">
              <SaleCta state={saleState} onClick={completeSale} className="w-full py-3" />
              <button
                type="button"
                onClick={() => showToast(`Local queue holds ${queuedCount} buffered transactions pending sync`)}
                className="w-full py-3 flex items-center justify-center gap-1.5 font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon name="inventory_2" className="text-[17px]" />
                <span>View {queuedCount} Buffered Transactions in Local Queue</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
