import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessPosOfflineCheckoutScreenProps {
  onBack: () => void;
  onOpenQueue: () => void;
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

export function BusinessPosOfflineCheckoutScreen({ onBack, onOpenQueue }: BusinessPosOfflineCheckoutScreenProps) {
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

  const completeSale = () => {
    if (saleState !== 'idle') return;
    setSaleState('saving');
    saleTimer.current = window.setTimeout(() => {
      setSaleState('saved');
      showToast('Ticket queued for local SQLite buffer');
    }, 1200);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="bg-tertiary-fixed text-on-tertiary-fixed px-margin py-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Icon name="cloud_off" className="text-[15px] text-tertiary" />
            <span className="font-caption text-caption font-semibold uppercase tracking-wider text-tertiary">
              Offline Mode Active
            </span>
          </span>
          <span className="font-caption text-caption text-on-tertiary-fixed-variant">Cached Ledger: 14 Txs</span>
        </div>
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-variant/50 transition-colors shrink-0"
            >
              <Icon name="arrow_back" className="text-[23px]" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">
                Offline Checkout Terminal
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="font-caption text-caption text-text-secondary truncate">Cashier #08: Alex R.</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant shrink-0" />
                <span className="font-caption text-caption text-primary font-medium">Reg 02</span>
              </div>
            </div>
          </div>
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </span>
        </div>
      </header>

      <div className="flex flex-col pb-8">
        {/* Persistent offline warning banner */}
        <div className="bg-tertiary-fixed text-on-tertiary-fixed p-space-md shadow-sm">
          <div className="flex items-start gap-space-xs">
            <span className="w-8 h-8 rounded-full bg-tertiary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="cloud_off" filled className="text-[19px] text-tertiary" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-space-xs mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-heading-sm text-heading-sm text-on-tertiary-fixed font-bold leading-none">
                    Offline Mode Active
                  </span>
                  <span className="inline-flex items-center gap-1 bg-surface-canvas/90 text-tertiary font-caption text-caption px-2 py-0.5 rounded-full font-medium shadow-sm">
                    <Icon name="lock" className="text-[12px]" />
                    <span>SQLite AES-256</span>
                  </span>
                </div>
                <span className="bg-tertiary text-on-tertiary font-caption text-caption px-2 py-0.5 rounded-full font-medium shrink-0">
                  5 queued sales
                </span>
              </div>
              <p className="font-caption text-caption text-on-tertiary-fixed-variant leading-relaxed">
                Sales are stored encrypted on Till #01. Automatic cloud reconciliation fires the second network returns.
              </p>
            </div>
          </div>
        </div>

        <div className="p-margin flex flex-col gap-space-md">
          {/* Terminal context bar */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between gap-space-xs">
              <span className="flex items-center gap-1.5 min-w-0">
                <Icon name="storefront" className="text-primary text-[17px] shrink-0" />
                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                  Wuse Branch (Flagship)
                </span>
              </span>
              <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container font-caption text-caption px-2 py-0.5 rounded-full font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                <span>No Internet (Offline)</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-space-xs font-caption text-caption text-text-secondary pt-1">
              <span className="truncate">Till #01 • Cashier: Emeka Okafor</span>
              <span className="text-tertiary font-medium shrink-0">Buffer Cap: 5 / 500 Txs</span>
            </div>
          </div>

          {/* Search & local cache */}
          <div className="flex flex-col gap-space-2xs">
            <div className="relative flex items-center">
              <Icon name="search" className="absolute left-3.5 text-text-tertiary text-[19px]" />
              <input
                type="text"
                placeholder="Search 142 cached items or SKU..."
                autoComplete="off"
                className="w-full h-11 pl-11 pr-12 rounded-xl bg-surface-container-lowest font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-colors shadow-sm"
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
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-badge-discount-text min-w-0">
                <Icon name="check_circle" className="text-[15px] shrink-0" />
                <span className="font-caption text-caption font-medium truncate">Local Menu Cache Ready (14:15)</span>
              </span>
              <button
                type="button"
                onClick={() => showToast('Re-indexed 142 cached items')}
                className="font-caption text-caption text-primary shrink-0"
              >
                Re-index
              </button>
            </div>
          </div>

          {/* Active offline cart & ticket */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-surface-container-low p-space-md flex flex-col gap-space-2xs">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-label-md text-label-md font-bold text-text-primary truncate">
                    LOC-TXN-402-005
                  </span>
                  <span className="bg-secondary-container text-on-secondary-container font-caption text-caption px-1.5 py-0.5 rounded shrink-0">
                    STANDALONE
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary shrink-0">Today, 03:12 PM</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-caption text-caption text-text-secondary">
                <span>Cashier: Emeka O. (#VT-STAFF-09)</span>
                <span>•</span>
                <span>Branch ID: LOC-001</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-space-xs bg-surface-canvas p-2.5 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0">
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
              {TICKET_LINES.map((line) => (
                <div key={line.name} className="flex items-center justify-between gap-space-xs py-1">
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
                <span>Subtotal (3 items)</span>
                <span>₦29,500.00</span>
              </div>
              <div className="flex justify-between font-caption text-caption text-text-secondary">
                <span>VAT (7.5% Local Statutory)</span>
                <span>₦2,212.50</span>
              </div>
              <div className="flex justify-between items-center font-heading-sm text-heading-sm text-text-primary font-bold pt-2 mt-1 bg-surface-container-lowest/50 px-2 py-1.5 rounded-lg">
                <span>Total Due</span>
                <span className="text-primary font-heading-md text-heading-md">₦31,712.50</span>
              </div>
            </div>
          </div>

          {/* Offline tender selection */}
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between px-1 gap-space-xs">
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">Offline Tender Method</span>
              <span className="font-caption text-caption text-tertiary flex items-center gap-1 shrink-0">
                <Icon name="bolt" className="text-[13px]" />
                <span>Immediate Kick</span>
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary px-1 -mt-1">
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
                          isActive ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'
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
                      <Icon name="chevron_right" className="text-outline text-[19px] shrink-0" />
                    ) : (
                      <span className="font-caption text-caption text-primary font-semibold shrink-0">Select</span>
                    )}
                  </button>

                  {isActive && option.key === 'cash' && (
                    <div className="bg-surface-canvas rounded-lg p-2.5 flex items-center justify-between mt-1 shadow-sm">
                      <div>
                        <span className="font-caption text-caption text-text-secondary block">Amount Tendered</span>
                        <span className="font-label-md text-label-md font-bold text-text-primary">₦35,000.00</span>
                      </div>
                      <div className="text-right">
                        <span className="font-caption text-caption text-text-secondary block">Cash Change Due</span>
                        <span className="font-label-md text-label-md font-bold text-badge-discount-text">₦3,287.50</span>
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
                    <div className="bg-surface-canvas rounded-lg p-2.5 flex items-center justify-between mt-1 shadow-sm">
                      <div>
                        <span className="font-caption text-caption text-text-secondary block">House Tab Limit</span>
                        <span className="font-label-md text-label-md font-bold text-text-primary">₦100,000.00</span>
                      </div>
                      <span className="font-caption text-caption text-tertiary font-medium">0.0% used</span>
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
                <strong className="text-on-surface font-semibold">'** OFFLINE SALE **'</strong> on the thermal ticket. It
                sits in queue until this device re-establishes WAN handshake.
              </p>
            </div>
          </div>

          {/* Bottom actions deck */}
          <div className="flex flex-col gap-space-xs">
            <button
              type="button"
              onClick={completeSale}
              disabled={saleState !== 'idle'}
              className={`w-full h-11 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] ${
                saleState === 'saved'
                  ? 'bg-badge-discount-text text-white'
                  : 'bg-primary-container text-on-primary disabled:opacity-90'
              }`}
            >
              {saleState === 'idle' && (
                <>
                  <span>Complete Offline Sale (₦31,712.50)</span>
                  <Icon name="arrow_forward" className="text-[19px]" />
                </>
              )}
              {saleState === 'saving' && (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Printing &amp; Storing Locally…</span>
                </>
              )}
              {saleState === 'saved' && (
                <>
                  <Icon name="check_circle" className="text-[19px]" />
                  <span>Saved to SQLite #LOC-TXN-402-005</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onOpenQueue}
              className="w-full h-11 flex items-center justify-center gap-1.5 font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name="inventory_2" className="text-[17px]" />
              <span>View 5 Buffered Transactions in Local Queue</span>
            </button>
          </div>
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
