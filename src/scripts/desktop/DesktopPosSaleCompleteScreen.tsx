import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { computeTotals, formatNaira, type PosTerminalLine } from './posTerminalData';
import { formatReceiptText } from '../posCartData';
import { usePosSettings } from '../../context/PosSettingsContext';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

interface DesktopPosSaleCompleteScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  cart: PosTerminalLine[];
  customer: string | null;
  /** Loyalty points awarded during the sale — only shown when customer details were added. */
  awardedPoints: number;
  onNewSale: () => void;
  onOpenOrders: () => void;
}

function TicketTeeth() {
  return (
    <div className="flex justify-between px-1">
      {Array.from({ length: 34 }).map((_, index) => (
        <span key={index} className="w-3 h-3 rounded-full bg-surface shrink-0" />
      ))}
    </div>
  );
}

function useChime() {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const play = () => {
    if (muted) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = audioRef.current ?? new Ctx();
      audioRef.current = ctx;
      const now = ctx.currentTime;
      const notes = [880, 1174.66];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + i * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.16 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 0.34);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.16);
        osc.stop(now + i * 0.16 + 0.36);
      });
    } catch {
      // Audio may be blocked by the browser before user interaction — safe to ignore.
    }
  };

  useEffect(() => {
    const id = window.setTimeout(play, 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { muted, setMuted, play };
}

export function DesktopPosSaleCompleteScreen({
  onNav,
  cart,
  customer,
  awardedPoints,
  onNewSale,
  onOpenOrders,
}: DesktopPosSaleCompleteScreenProps) {
  const {
    taxMode,
    taxRate,
    taxLabel,
    loyaltyEnabled,
    autoPrintReceipt,
    businessName,
    businessAddress,
    businessPhone,
    receiptHeader,
    receiptFooter,
    showBusinessLogo,
  } = usePosSettings();
  const { branch } = useBusinessBranch();
  const totals = useMemo(() => computeTotals(cart, taxMode, taxRate / 100), [cart, taxMode, taxRate]);
  const { muted, setMuted, play } = useChime();
  const [phone, setPhone] = useState('+234 803 219 8831');
  const [email, setEmail] = useState('michael.james@email.com');
  const [flash, setFlash] = useState<string | null>(null);

  const receiptNo = 'RC-10842';

  const flashMessage = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 2600);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        onNewSale();
      } else if (event.key.toLowerCase() === 'p' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        flashMessage('Re-printing last thermal receipt…');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNewSale]);

  useEffect(() => {
    // Auto-print receipt — controlled from POS Settings.
    if (autoPrintReceipt) flashMessage('Receipt printed on Epson TM-T20 [USB/001]');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PosTerminalChrome activeNav="register" onNav={onNav}>
      {/* Success Confirmation Banner */}
      <section className="w-full py-space-md">
        <div className="w-full bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-14 h-14 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
              <Icon name="check_circle" filled className="text-badge-discount-text text-[34px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                  Sale Completed Successfully
                </span>
                <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  Payment Settled
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 mt-1 text-text-secondary font-caption text-caption">
                <span className="font-medium text-text-primary flex items-center gap-1">
                  <Icon name="receipt_long" className="text-[15px] text-primary" />
                  Receipt #{receiptNo}
                </span>
                <span className="text-outline-variant">•</span>
                <span>Ticket #TK-108 • Table 04</span>
                <span className="text-outline-variant">•</span>
                <span>13:42:47 WAT • Emeka Okafor • Till #01</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-sm w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="block font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
                Amount Collected
              </span>
              <span className="font-display-hero text-display-hero text-badge-discount-text leading-none tracking-tight">
                {formatNaira(totals.total)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMuted((prev) => !prev)}
              title={muted ? 'Unmute confirmation chime' : 'Mute confirmation chime'}
              className="w-11 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-secondary flex items-center justify-center transition-colors"
            >
              <Icon name={muted ? 'volume_off' : 'volume_up'} className="text-[20px]" />
            </button>
          </div>
        </div>
      </section>

      {/* Receipt Studio Workspace */}
      <section className="w-full pb-space-lg">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* LEFT — Thermal Receipt Preview */}
          <div className="xl:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-2">
                  <Icon name="receipt" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Thermal Receipt Preview</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary uppercase font-medium">
                  80mm • Auto-Cut
                </span>
              </div>

              <div className="mx-auto w-full max-w-sm">
                <TicketTeeth />
                <div className="bg-surface-canvas shadow-md px-space-md py-space-md font-mono text-[12px] leading-relaxed text-text-primary">
                  {/* Receipt head */}
                  {receiptHeader && (
                    <div className="text-center text-[11px] italic text-text-secondary">
                      {formatReceiptText(receiptHeader, businessName)}
                    </div>
                  )}
                  <div className="text-center flex flex-col gap-0.5">
                    {showBusinessLogo && <Logo variant="mark" alt={businessName} className="h-7 w-auto mx-auto" />}
                    <span className="font-heading-sm text-heading-sm font-bold tracking-widest">{businessName}</span>
                    <span className="text-[11px] text-text-secondary">{branch.name}</span>
                    <span className="text-[11px] text-text-secondary">{businessAddress}</span>
                    <span className="text-[11px] text-text-secondary">TIN 09876512-0001 • POS-NG-ABJ-004</span>
                  </div>

                  <div className="my-3 border-t border-dashed border-outline-variant" />

                  <div className="flex justify-between">
                    <span>Receipt</span>
                    <span className="font-bold">#{receiptNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ticket</span>
                    <span className="font-bold">#TK-108</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier</span>
                    <span className="font-bold">Emeka Okafor</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="font-bold">12/10/2026 13:42 WAT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patron</span>
                    <span className="font-bold">{customer ?? 'Michael James'}</span>
                  </div>

                  <div className="my-3 border-t border-dashed border-outline-variant" />

                  {/* Items */}
                  <div className="flex flex-col gap-2">
                    {cart.length === 0 ? (
                      <span className="text-text-secondary">No items</span>
                    ) : (
                      cart.map((line) => (
                        <div key={line.id} className="flex flex-col">
                          <div className="flex justify-between font-bold">
                            <span>
                              {line.qty}× {line.name}
                            </span>
                            <span>{formatNaira(line.unit * line.qty)}</span>
                          </div>
                          <span className="text-[10px] text-text-secondary pl-3">{line.mods}</span>
                          {line.promo ? (
                            <div className="flex justify-between pl-3 text-[11px] text-badge-discount-text">
                              <span>Promo rebate</span>
                              <span>-{formatNaira(line.promo * line.qty)}</span>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="my-3 border-t border-dashed border-outline-variant" />

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatNaira(totals.gross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount / Rebate</span>
                    <span>-{formatNaira(totals.discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                    {taxLabel} ({taxRate}% FIRS{taxMode === 'inclusive' ? ' · included' : ''})
                  </span>
                    <span>{formatNaira(totals.vat)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[14px] mt-1">
                    <span>TOTAL</span>
                    <span>{formatNaira(totals.total)}</span>
                  </div>

                  <div className="my-3 border-t border-dashed border-outline-variant" />

                  <div className="flex justify-between">
                    <span>Tender</span>
                    <span className="font-bold">Cash</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Received</span>
                    <span>{formatNaira(30000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span>{formatNaira(30000 - totals.total)}</span>
                  </div>

                  <div className="my-3 border-t border-dashed border-outline-variant" />

                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-[11px] text-text-secondary">
                      {!loyaltyEnabled ? (
                        'Loyalty earning is off in POS Settings'
                      ) : customer ? (
                        <>
                          Loyalty points earned by <strong className="text-text-primary">{customer}</strong>:{' '}
                          <strong className="text-text-primary">{awardedPoints.toLocaleString()} pts</strong>
                        </>
                      ) : (
                        'Walk-in sale — no loyalty points attached'
                      )}
                    </span>
                    {/* Stylised barcode */}
                    <div className="flex items-end gap-[2px] h-10 my-1">
                      {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2].map(
                        (width, index) => (
                          <span
                            key={index}
                            className="bg-text-primary inline-block"
                            style={{ width: `${width}px`, height: index % 3 === 0 ? '100%' : '82%' }}
                          />
                        ),
                      )}
                    </div>
                    <span className="text-[10px] tracking-widest text-text-secondary">
                      RC10842·TK108·POSNGABJ004
                    </span>
                    {receiptFooter && (
                      <span className="text-[11px] text-text-secondary mt-1">
                        {formatReceiptText(receiptFooter, businessName)}
                      </span>
                    )}
                    {businessPhone && <span className="text-[10px] text-text-secondary">{businessPhone}</span>}
                    <span className="text-[10px] text-text-tertiary">
                      Fiscalised • FIRS / NDPR Compliant • v2.4
                    </span>
                  </div>
                </div>
                <TicketTeeth />
              </div>
            </div>
          </div>

          {/* RIGHT — Dispatch & Next Actions */}
          <div className="xl:col-span-5 flex flex-col gap-space-lg">
            {/* Sale summary metrics */}
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex flex-col">
                <span className="font-caption text-caption text-text-tertiary uppercase font-semibold">
                  Items Sold
                </span>
                <span className="font-heading-md text-heading-md font-bold text-text-primary mt-1">
                  {totals.itemCount}
                </span>
                <span className="font-caption text-caption text-text-secondary">across {cart.length} lines</span>
              </div>
              <div className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex flex-col">
                <span className="font-caption text-caption text-text-tertiary uppercase font-semibold">
                  Turnaround
                </span>
                <span className="font-heading-md text-heading-md font-bold text-text-primary mt-1">8m 42s</span>
                <span className="font-caption text-caption text-badge-discount-text">Under 12m target</span>
              </div>
            </div>

            {/* Print & Fiscal Dispatch */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Dispatch &amp; Records</h3>
                <span className="font-caption text-caption text-text-tertiary">Sunmi V2 • Port 9100</span>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  onClick={() => flashMessage('Printing full thermal receipt…')}
                  className="p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low text-left flex flex-col gap-1.5 shadow-sm transition-colors"
                >
                  <Icon name="print" className="text-primary text-[22px]" />
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Print Thermal
                  </span>
                  <span className="font-caption text-caption text-text-secondary">Full 80mm slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => flashMessage('Printing quick slip…')}
                  className="p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low text-left flex flex-col gap-1.5 shadow-sm transition-colors"
                >
                  <Icon name="receipt" className="text-primary text-[22px]" />
                  <span className="font-label-md text-label-md font-semibold text-text-primary">Quick Slip</span>
                  <span className="font-caption text-caption text-text-secondary">Compact order copy</span>
                </button>
                <button
                  type="button"
                  onClick={() => flashMessage('E-receipt dispatched to web portal…')}
                  className="p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low text-left flex flex-col gap-1.5 shadow-sm transition-colors"
                >
                  <Icon name="language" className="text-primary text-[22px]" />
                  <span className="font-label-md text-label-md font-semibold text-text-primary">Web E-Receipt</span>
                  <span className="font-caption text-caption text-text-secondary">Shareable portal link</span>
                </button>
                <button
                  type="button"
                  onClick={() => flashMessage('Fiscal PDF generated for FIRS filing…')}
                  className="p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-low text-left flex flex-col gap-1.5 shadow-sm transition-colors"
                >
                  <Icon name="picture_as_pdf" className="text-primary text-[22px]" />
                  <span className="font-label-md text-label-md font-semibold text-text-primary">Fiscal PDF</span>
                  <span className="font-caption text-caption text-text-secondary">FIRS-ready VAT doc</span>
                </button>
              </div>

              {/* SMS resend */}
              <div className="bg-surface-subtle rounded-lg p-space-sm flex flex-col gap-2">
                <label
                  htmlFor="receipt-phone"
                  className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary"
                >
                  Resend via WhatsApp / SMS
                </label>
                <div className="flex items-center gap-space-xs">
                  <div className="relative flex-1">
                    <Icon
                      name="sms"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]"
                    />
                    <input
                      id="receipt-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-canvas text-text-primary font-label-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => flashMessage(`Digital slip resent to ${phone}`)}
                    className="h-11 px-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold transition-colors shrink-0"
                  >
                    Resend
                  </button>
                </div>
                <div className="relative">
                  <Icon
                    name="mail"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-canvas text-text-primary font-label-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Next Actions */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
              <button
                type="button"
                onClick={onNewSale}
                className="w-full h-14 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary font-bold shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-all flex items-center justify-between px-space-lg"
              >
                <div className="flex items-center gap-2">
                  <Icon name="add_shopping_cart" className="text-[22px]" />
                  <span>Start New Sale</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-on-primary font-mono">F1</kbd>
              </button>
              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  onClick={() => flashMessage('Re-printing last thermal receipt…')}
                  className="h-11 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-button-secondary text-button-secondary font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Icon name="print" className="text-[18px]" />
                  <span>Reprint [P]</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenOrders}
                  className="h-11 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-button-secondary text-button-secondary font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Icon name="list_alt" className="text-[18px]" />
                  <span>Shift Orders</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1 font-caption text-caption text-text-tertiary">
                <Icon name="cloud_done" className="text-[15px] text-badge-discount-text" />
                <span>Ledgered to mesh node #WUSE2-01 • Hash #9A24C</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transient action toast */}
      {flash ? (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-full shadow-lg flex items-center gap-2">
            <Icon name="info" className="text-[18px] text-primary-fixed" />
            <span className="font-label-md text-label-md">{flash}</span>
          </div>
        </div>
      ) : null}

      {/* Trigger chime replay button floating */}
      <button
        type="button"
        onClick={play}
        className="fixed bottom-20 right-6 z-40 w-12 h-12 rounded-full bg-surface-canvas shadow-lg text-primary flex items-center justify-center hover:bg-surface-container transition-colors"
        title="Replay confirmation chime"
      >
        <Icon name="notifications_active" className="text-[22px]" />
      </button>
    </PosTerminalChrome>
  );
}
