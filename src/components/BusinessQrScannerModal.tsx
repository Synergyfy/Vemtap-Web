import { useRef, useState } from 'react';
import { Icon } from './ui/Icon';
import { SCANNER_MESSAGE, useQrScanner, vemtapPath } from '../hooks/useQrScanner';
import { useBusinessOrders } from '../hooks/business/useBusinessOrders';
import { claimsService } from '../services/claimsService';
import type { BusinessOrder } from '../services/businessOrdersService';
import { orderItemsSummary, orderPaymentLabel, orderRef, orderStatusLabel, orderTotalLabel, personName } from '../scripts/ordersLive';

interface BusinessQrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
}

type Result = { kind: 'order'; order: BusinessOrder } | { kind: 'voucher'; code: string; redeemed: boolean };

const CLAIM_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOT_RECOGNISED = "That isn't a VEMTAP code. Try another one.";

/** A customer's order QR holds the order id; staff may also type the short reference. */
const findOrder = (orders: BusinessOrder[], value: string) => {
  const ref = value.replace(/^#/, '').toUpperCase();
  return orders.find((order) => order.id === value || order.id.slice(0, 8).toUpperCase() === ref);
};

function ScannerBody({ onClose, onOpenOrders }: Omit<BusinessQrScannerModalProps, 'open'>) {
  const orders = useBusinessOrders().data ?? [];
  const [code, setCode] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const open = (value: string, typed: boolean) => {
    const text = value.trim();
    if (!text) return;
    setNotice(null);
    if (/^https?:\/\//i.test(text)) {
      const path = vemtapPath(text);
      if (path) window.location.assign(path);
      else reject();
      return;
    }
    const order = findOrder(orders, text);
    if (order) setResult({ kind: 'order', order });
    else if (CLAIM_ID.test(text)) window.location.assign(`/my/claimed-deal/${encodeURIComponent(text)}`);
    else if (typed) setResult({ kind: 'voucher', code: text, redeemed: false });
    else reject();
  };

  const scanner = useQrScanner((value) => open(value, false));
  const active = scanner.status === 'scanning';

  const reject = () => {
    setNotice(NOT_RECOGNISED);
    void scanner.start();
  };

  const scanAnother = () => {
    setResult(null);
    setCode('');
    setNotice(null);
    void scanner.start();
  };

  const redeem = async (voucherCode: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await claimsService.redeemVoucher(voucherCode);
      setResult({ kind: 'voucher', code: voucherCode, redeemed: true });
    } catch (failure) {
      setNotice(failure instanceof Error && failure.message ? failure.message : "This voucher couldn't be redeemed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (!scanner.supported) setNotice("This browser can't read QR codes from photos. Type the code instead.");
      else if (!(await scanner.scanImage(file))) setNotice('No QR code found in that photo.');
    } catch {
      setNotice("That photo couldn't be read.");
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const details: [string, string][] =
    result?.kind === 'order'
      ? [
          ['Order', orderRef(result.order)],
          ['Customer', personName(result.order.customer)],
          ['Items', orderItemsSummary(result.order)],
          ['Total', orderTotalLabel(result.order)],
          ['Payment', orderPaymentLabel(result.order)],
          ['Status', orderStatusLabel(result.order)],
        ]
      : [];

  return (
    <div className="relative w-full max-w-[460px] max-h-[92vh] bg-surface-canvas rounded-2xl shadow-2xl overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-label="Customer QR Scanner">
      <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm bg-surface-container-low shrink-0">
        <div className="flex items-center gap-space-xs min-w-0">
          <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
            <Icon name="qr_code_scanner" className="text-[20px]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface">Customer QR Scanner</h2>
            <p className="font-caption text-caption text-text-secondary truncate">Scan a voucher or order code</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close scanner" className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container active:scale-95 transition-all">
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <div className="p-space-md overflow-y-auto flex flex-col gap-space-sm">
        <div className={result ? 'hidden' : 'flex flex-col gap-space-sm'}>
          <div className="relative w-full h-[220px] rounded-2xl bg-inverse-surface overflow-hidden flex items-center justify-center">
            <video ref={scanner.videoRef} muted playsInline aria-label="Camera preview" className={`absolute inset-0 w-full h-full object-cover ${active ? '' : 'hidden'}`} />
            <div className="relative w-36 h-36 rounded-2xl border-2 border-inverse-on-surface/30 flex items-center justify-center">
              {!active && <Icon name="qr_code_scanner" className="text-[44px] text-inverse-on-surface/30" />}
            </div>
            {scanner.torchAvailable && active && (
              <button
                type="button"
                onClick={() => void scanner.toggleTorch()}
                aria-label="Toggle torch"
                className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center bg-inverse-surface/70 text-inverse-on-surface"
              >
                <Icon name={scanner.torchOn ? 'flashlight_on' : 'flashlight_off'} className="text-[18px]" />
              </button>
            )}
          </div>
          <p className="font-caption text-caption text-text-secondary text-center">
            {active ? "Align the customer's code inside the frame." : SCANNER_MESSAGE[scanner.status]}
          </p>

          <div className="flex items-center gap-space-2xs">
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') open(code, true);
              }}
              placeholder="Type a voucher code or order number"
              aria-label="Voucher code or order number"
              className="flex-1 min-w-0 h-10 px-space-sm rounded-xl border border-border bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-text-tertiary outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => open(code, true)}
              disabled={!code.trim()}
              className="h-10 px-space-sm rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50 active:scale-95 transition-all shrink-0"
            >
              Open
            </button>
          </div>
          <button type="button" onClick={() => fileInput.current?.click()} className="self-center inline-flex items-center gap-1 font-label-md text-label-md text-primary">
            <Icon name="photo_library" className="text-[16px]" />
            <span>Scan from a photo</span>
          </button>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(event) => void pickImage(event.target.files?.[0])} />
        </div>

        {result?.kind === 'order' && (
          <div className="rounded-xl bg-surface-container-low divide-y divide-border">
            {details.map(([label, value]) => (
              <div key={label} className="px-space-sm py-space-xs flex items-center justify-between gap-space-sm font-caption text-caption">
                <span className="text-text-secondary">{label}</span>
                <span className="text-on-surface font-semibold text-right truncate">{value}</span>
              </div>
            ))}
          </div>
        )}

        {result?.kind === 'voucher' && (
          <div className="rounded-xl bg-surface-container-low p-space-sm text-center">
            <p className="font-caption text-caption text-text-secondary">{result.redeemed ? 'Voucher redeemed' : 'Redeem this voucher code?'}</p>
            <p className="font-label-md text-label-md font-semibold text-on-surface break-all">{result.code}</p>
          </div>
        )}

        {notice && <p className="font-caption text-caption text-error text-center" role="alert">{notice}</p>}

        {result && (
          <div className="flex flex-col gap-space-xs">
            {result.kind === 'order' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold active:scale-[0.99] transition-all"
              >
                Open Orders
              </button>
            )}
            {result.kind === 'voucher' && !result.redeemed && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void redeem(result.code)}
                className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50 active:scale-[0.99] transition-all"
              >
                {busy ? 'Redeeming…' : 'Redeem Voucher'}
              </button>
            )}
            <button type="button" onClick={scanAnother} className="w-full h-10 rounded-xl bg-surface-container-low text-text-secondary font-label-md text-label-md active:scale-[0.99] transition-all">
              Scan Another Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Reads customers' voucher and order codes at the counter, on desktop and mobile. */
export function BusinessQrScannerModal({ open, onClose, onOpenOrders }: BusinessQrScannerModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-space-sm bg-scrim/70"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <ScannerBody onClose={onClose} onOpenOrders={onOpenOrders} />
    </div>
  );
}
