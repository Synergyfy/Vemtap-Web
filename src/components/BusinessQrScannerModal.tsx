import { useState, useRef, useEffect } from 'react';
import { Icon } from './ui/Icon';

export interface ScannedQrData {
  code: string;
  type: 'deal' | 'order' | 'loyalty' | 'table' | 'url' | 'other';
  title: string;
  subtitle: string;
  details?: { label: string; value: string }[];
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;
}

interface BusinessQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrder?: () => void;
  onOpenDeals?: () => void;
  onOpenLoyalty?: () => void;
}

const PRESET_CODES: { label: string; icon: string; code: string; type: string }[] = [
  { label: '20% Lunch Deal Voucher', icon: 'local_offer', code: 'CLM-98214-DEAL', type: 'Deal' },
  { label: 'Order Pickup #VG-94021', icon: 'inventory_2', code: 'ORDER-VG-94021-PICKUP', type: 'Order' },
  { label: 'Loyalty: Amina Bello', icon: 'stars', code: 'CUST-4029-LOYALTY', type: 'Rewards' },
  { label: 'Table 04 Digital QR', icon: 'table_restaurant', code: 'TABLE-04-QR', type: 'Table' },
];

export function BusinessQrScannerModal({
  isOpen,
  onClose,
  onOpenOrder,
  onOpenDeals,
  onOpenLoyalty,
}: BusinessQrScannerModalProps) {
  const [inputCode, setInputCode] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedQrData | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setScannedResult(null);
      setInputCode('');
      setTorchOn(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const parseAndHandleCode = (code: string) => {
    const raw = code.trim();
    if (!raw) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const lower = raw.toLowerCase();

      if (lower.includes('deal') || lower.includes('clm') || lower.includes('voucher')) {
        setScannedResult({
          code: raw,
          type: 'deal',
          title: '20% Off Lunch Deal Voucher',
          subtitle: 'Valid Customer Deal Voucher • Verified',
          details: [
            { label: 'Voucher Code', value: raw },
            { label: 'Discount', value: '20% Off Total Bill' },
            { label: 'Customer', value: 'Amina Bello (0803 456 7890)' },
            { label: 'Status', value: 'Active • Ready to Redeem' },
          ],
          actionLabel: 'Redeem Voucher in Deals',
          actionIcon: 'check_circle',
          onAction: () => {
            onClose();
            if (onOpenDeals) onOpenDeals();
          },
        });
      } else if (lower.includes('order') || lower.includes('vg-') || lower.includes('pos-')) {
        setScannedResult({
          code: raw,
          type: 'order',
          title: 'Order Pickup #VG-94021',
          subtitle: 'Customer Ready for Counter Handover',
          details: [
            { label: 'Order ID', value: '#VG-94021' },
            { label: 'Customer', value: 'Amina Bello' },
            { label: 'Items', value: '3 items (Ribeye Steak + 2)' },
            { label: 'Payment', value: '₦34,500 • POS Terminal (Paid)' },
          ],
          actionLabel: 'Open Order Details & Handover',
          actionIcon: 'shopping_bag',
          onAction: () => {
            onClose();
            if (onOpenOrder) onOpenOrder();
          },
        });
      } else if (lower.includes('cust') || lower.includes('loyal') || lower.includes('reward')) {
        setScannedResult({
          code: raw,
          type: 'loyalty',
          title: 'Loyalty Member: Amina Bello',
          subtitle: 'Gold Tier Customer • 450 Points Balance',
          details: [
            { label: 'Membership ID', value: '#CUST-4029' },
            { label: 'Current Tier', value: 'Gold Member' },
            { label: 'Points Balance', value: '450 Vemtap Points' },
            { label: 'Available Perk', value: '₦1,000 Off Next Order' },
          ],
          actionLabel: 'Open Customer Loyalty Profile',
          actionIcon: 'stars',
          onAction: () => {
            onClose();
            if (onOpenLoyalty) onOpenLoyalty();
          },
        });
      } else if (lower.includes('table')) {
        setScannedResult({
          code: raw,
          type: 'table',
          title: 'Table 04 Digital Station QR',
          subtitle: 'Indoor Dining Room • 4 Seats',
          details: [
            { label: 'Table Station', value: 'Table 04' },
            { label: 'Active Cart', value: '2 items pending (₦11,200)' },
            { label: 'Staff Assigned', value: 'Till 01 Cashier' },
          ],
          actionLabel: 'Open Table Order at POS',
          actionIcon: 'restaurant',
          onAction: () => {
            onClose();
            if (onOpenOrder) onOpenOrder();
          },
        });
      } else {
        setScannedResult({
          code: raw,
          type: 'other',
          title: 'Scanned QR Code',
          subtitle: 'Decoded Content',
          details: [{ label: 'Raw Payload', value: raw }],
          actionLabel: 'Copy Scanned Content',
          actionIcon: 'content_copy',
          onAction: () => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(raw);
              showToast('Copied to clipboard');
            }
          },
        });
      }
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('Scanning image from gallery...');
      setTimeout(() => {
        parseAndHandleCode('CLM-98214-DEAL');
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Scanner Dialog Content */}
      <div className="relative w-full max-w-[460px] bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
              <Icon name="qr_code_scanner" className="text-[18px]" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-on-surface">Customer QR Scanner</h2>
              <p className="text-[10px] text-text-tertiary">Scan deals, vouchers, orders, or loyalty QR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all"
            aria-label="Close scanner"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-3.5">
          {/* If Result Decoded */}
          {scannedResult ? (
            <div className="flex flex-col gap-3 animate-in zoom-in-95 duration-200">
              {/* Result Header Badge */}
              <div className="p-3 rounded-xl bg-surface-tint-blue/30 border border-primary/20 flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <Icon
                    name={
                      scannedResult.type === 'deal'
                        ? 'local_offer'
                        : scannedResult.type === 'order'
                        ? 'inventory_2'
                        : scannedResult.type === 'loyalty'
                        ? 'stars'
                        : scannedResult.type === 'table'
                        ? 'table_restaurant'
                        : 'qr_code_2'
                    }
                    className="text-[20px]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary text-white">
                      {scannedResult.type} QR
                    </span>
                    <span className="text-[10px] text-badge-discount-text font-bold">Verified Valid</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-on-surface mt-0.5 truncate">
                    {scannedResult.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary truncate">{scannedResult.subtitle}</p>
                </div>
              </div>

              {/* Decoded Details List */}
              {scannedResult.details && (
                <div className="rounded-xl border border-border bg-surface-container-lowest divide-y divide-border/60">
                  {scannedResult.details.map((item, idx) => (
                    <div key={idx} className="px-3 py-2 flex items-center justify-between text-[11px] gap-2">
                      <span className="text-text-tertiary font-medium">{item.label}</span>
                      <span className="text-on-surface font-semibold text-right truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                {scannedResult.actionLabel && (
                  <button
                    type="button"
                    onClick={scannedResult.onAction}
                    className="w-full h-10 rounded-xl bg-primary text-white text-[12px] font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-primary/95 active:scale-[0.99] transition-all"
                  >
                    {scannedResult.actionIcon && <Icon name={scannedResult.actionIcon} className="text-[16px]" />}
                    <span>{scannedResult.actionLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setScannedResult(null);
                    setInputCode('');
                  }}
                  className="w-full h-9 rounded-xl border border-border bg-surface text-text-secondary hover:text-on-surface text-[11px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all"
                >
                  <Icon name="refresh" className="text-[15px]" />
                  <span>Scan Another Code</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Camera Viewfinder Box */}
              <div className="relative w-full aspect-video sm:aspect-square max-h-[220px] rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                {/* Viewfinder Target Frame */}
                <div className="relative w-36 h-36 border border-white/20 rounded-2xl flex items-center justify-center">
                  {/* Four Corner Marks */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-sm" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-sm" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-sm" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-sm" />

                  {/* Animated Laser Pulse Line */}
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-primary animate-pulse shadow-[0_0_8px_#2563eb]" />

                  {/* Central Icon */}
                  <Icon name="qr_code_scanner" className="text-[44px] text-white/20" />
                </div>

                {/* Torch Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setTorchOn((v) => !v);
                    showToast(torchOn ? 'Torch turned off' : 'Torch turned on');
                  }}
                  className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                    torchOn ? 'bg-amber-500 text-black shadow-md' : 'bg-white/15 hover:bg-white/25'
                  }`}
                  aria-label="Toggle flashlight"
                >
                  <Icon name={torchOn ? 'flashlight_on' : 'flashlight_off'} className="text-[16px]" />
                </button>

                {/* Status indicator */}
                <div className="absolute bottom-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white/80 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                  <span>Camera Active • Align QR inside frame</span>
                </div>
              </div>

              {/* Quick Input Bar */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Icon
                    name="keyboard"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-text-tertiary"
                  />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') parseAndHandleCode(inputCode);
                    }}
                    placeholder="Enter or paste customer QR code..."
                    className="w-full h-8 pl-8 pr-2.5 rounded-xl border border-border bg-surface-container-lowest text-[11px] text-on-surface placeholder:text-text-tertiary focus:outline-hidden focus:border-primary transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => parseAndHandleCode(inputCode)}
                  disabled={!inputCode.trim() || isProcessing}
                  className="h-8 px-3 rounded-xl bg-primary text-white text-[11px] font-bold disabled:opacity-50 hover:bg-primary/95 active:scale-95 transition-all shrink-0"
                >
                  {isProcessing ? 'Opening...' : 'Open QR'}
                </button>
              </div>

              {/* Presets & Simulator */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                    Quick Scan Simulation
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-primary font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Icon name="photo_library" className="text-[12px]" />
                    <span>Scan photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_CODES.map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => parseAndHandleCode(preset.code)}
                      className="p-2 rounded-xl border border-border bg-surface-container-lowest hover:bg-surface-container active:scale-[0.98] transition-all text-left flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon name={preset.icon} className="text-[14px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-on-surface truncate leading-tight">
                          {preset.label}
                        </p>
                        <span className="text-[9px] text-text-tertiary font-mono">{preset.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-60 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2 text-[11px] font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

