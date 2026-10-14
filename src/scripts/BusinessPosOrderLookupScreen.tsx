import { useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useOrders, type SubmittedOrder } from '../context/OrdersContext';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  formatOrderTime,
  isPaymentCleared,
  nextFulfillmentActions,
  orderStatusLabel,
  type OrderNextAction,
} from './orderData';

interface BusinessPosOrderLookupScreenProps {
  onBack: () => void;
}

type LookupMode = 'qr' | 'order-number' | 'phone';

const MODES: { key: LookupMode; label: string; icon: string; hint: string }[] = [
  { key: 'qr', label: 'QR Code', icon: 'qr_code_scanner', hint: 'Scan the collection code or paste its value' },
  { key: 'order-number', label: 'Order #', icon: 'tag', hint: 'e.g. UG-10231 (with or without the #)' },
  { key: 'phone', label: 'Phone', icon: 'phone_iphone', hint: 'Customer name or last 4 digits of their number' },
];

const money = (value: number) => `₦${value.toLocaleString('en-US')}`;

/**
 * BUG-016: Cashier order lookup. Retrieval is idempotent — the same query
 * always resolves to the same order and looking one up never mutates it.
 * Payment may only be marked via `markPaid` (the "Payment Verified" action).
 */
export function BusinessPosOrderLookupScreen({ onBack }: BusinessPosOrderLookupScreenProps) {
  const orders = useOrders();
  const [mode, setMode] = useState<LookupMode>('qr');
  const [input, setInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const query = input.trim();

  // Idempotent retrieval: ref first (tolerant match), then customer identity.
  const order: SubmittedOrder | null = useMemo(() => {
    if (!query) return null;
    const pick = (found: SubmittedOrder | SubmittedOrder[] | null | undefined): SubmittedOrder | null =>
      Array.isArray(found) ? found[0] ?? null : found ?? null;
    if (mode === 'phone') return pick(orders.findByCustomer(query));
    return pick(orders.findByRef(query)) ?? pick(orders.findByCustomer(query));
  }, [query, mode, orders]);

  const handleLookup = () => {
    if (!query) return;
    setSearched(true);
    if (!order) showToast(`No order matches “${query}”`);
  };

  const handleScan = () => {
    // Simulated scanner: reads the newest open order's collection code.
    const open = orders.orders.find((item) => item.status !== 'completed' && item.status !== 'cancelled');
    if (!open) {
      showToast('No open order code to scan');
      return;
    }
    setInput(open.ref);
    setMode('qr');
    setSearched(true);
    showToast(`Scanned ${open.ref}`);
  };

  const applyAction = (action: OrderNextAction) => {
    if (!order) return;
    if (action.status === 'paid') {
      // BUG-015/016: only markPaid may set verified — this is the cashier's affirmation.
      const ok = orders.markPaid(order.ref);
      showToast(ok ? `Payment verified • ${order.ref} is now Paid` : 'Could not verify payment — try again');
      return;
    }
    const ok = orders.setStatus(order.ref, action.status);
    showToast(ok ? `${order.ref} → ${action.label}` : 'Could not update this order');
  };

  const activeMode = MODES.find((item) => item.key === mode) ?? MODES[0];

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-space-sm px-margin py-space-xs">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="p-space-2xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center -ml-space-2xs"
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Find Customer Order</h1>
            <span className="font-caption text-caption text-text-tertiary">
              QR scan • order number • phone — safe to repeat
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin py-space-sm pb-space-xl gap-space-md">
        <div className="flex gap-space-xs">
          {MODES.map((item) => {
            const selected = item.key === mode;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setMode(item.key);
                  setSearched(false);
                }}
                className={`flex-1 h-10 rounded-xl font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-colors ${
                  selected ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-text-secondary'
                }`}
              >
                <Icon name={item.icon} className="text-[16px]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs text-text-secondary">
            <Icon name={activeMode.icon} className="text-[18px] text-primary" />
            <span className="font-caption text-caption">{activeMode.hint}</span>
          </div>
          <div className="flex gap-space-xs">
            <input
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setSearched(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleLookup();
              }}
              placeholder={mode === 'phone' ? 'e.g. 0192 or Zainab' : 'UG-10231'}
              className="flex-1 h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm font-mono text-body-md text-text-primary placeholder:text-text-tertiary placeholder:font-sans focus:outline-none focus:border-primary"
              aria-label={activeMode.hint}
            />
            {mode === 'qr' && (
              <button
                type="button"
                onClick={handleScan}
                className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                aria-label="Simulate QR scan"
              >
                <Icon name="qr_code_scanner" className="text-[22px]" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={!query}
            className={`h-11 rounded-xl font-button-secondary text-button-secondary font-semibold transition-transform ${
              query ? 'bg-primary text-on-primary active:scale-[0.98]' : 'bg-surface-container text-text-tertiary'
            }`}
          >
            Look up order
          </button>
        </section>

        {searched && !order && (
          <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-sm">
            <Icon name="search_off" className="text-text-secondary text-[22px] shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              No order matches <span className="font-semibold text-text-primary">“{query}”</span>. Check the reference,
              or try the customer&apos;s phone number. Looking up never creates or changes an order — search again
              safely.
            </p>
          </div>
        )}

        {order && (
          <>
            <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="receipt_long" className="text-primary text-[20px] shrink-0" />
                  <span className="font-mono font-label-md text-label-md text-text-primary font-semibold truncate">
                    #{order.ref}
                  </span>
                </div>
                <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold shrink-0">
                  {orderStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-space-sm">
                <span className="font-caption text-caption text-text-secondary">
                  {order.customerName}
                  {order.customerPhone ? ` • ${order.customerPhone}` : ''}
                </span>
                <span className="font-caption text-caption text-text-tertiary">
                  {order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'} • {formatOrderTime(order.submittedAt)}
                </span>
              </div>
              <div className="h-[1px] bg-surface-container" />
              <ul className="flex flex-col gap-space-2xs">
                {order.lines.map((line) => (
                  <li key={`${line.id}-${line.name}`} className="flex items-start justify-between gap-space-sm">
                    <span className="font-caption text-caption text-text-primary">
                      {line.qty}× {line.name}
                    </span>
                    <span className="font-caption text-caption text-text-secondary shrink-0">
                      {money(line.price * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="h-[1px] bg-surface-container" />
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-bold text-text-primary">Total</span>
                <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{money(order.total)}</span>
              </div>
              <div className="flex items-center justify-between gap-space-sm">
                <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                  <Icon name="credit_card" className="text-[14px] text-primary" />
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </span>
                <span
                  className={`font-label-sm text-label-sm font-semibold ${
                    isPaymentCleared(order.paymentStatus) ? 'text-badge-discount-text' : 'text-error'
                  }`}
                >
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  {order.paymentRef ? ` • ${order.paymentRef}` : ''}
                </span>
              </div>
            </section>

            {!isPaymentCleared(order.paymentStatus) && (
              <div className="bg-badge-discount-bg rounded-xl p-space-sm flex items-start gap-space-sm">
                <Icon name="gpp_maybe" className="text-badge-discount-text text-[20px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Payment not verified — only mark paid after you have seen the tender (transfer credit or POS
                  approval). The order stays {orderStatusLabel(order.status)} until then.
                </p>
              </div>
            )}

            {nextFulfillmentActions(order).length > 0 && (
              <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
                <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider mb-space-2xs">
                  Permitted Actions
                </h2>
                {nextFulfillmentActions(order).map((action) => (
                  <button
                    key={action.status + action.label}
                    type="button"
                    onClick={() => applyAction(action)}
                    className={`h-12 rounded-xl font-button-secondary text-button-secondary font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${
                      action.tone === 'primary'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : action.tone === 'danger'
                          ? 'bg-error-container text-error'
                          : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    <Icon
                      name={
                        action.status === 'paid'
                          ? 'verified'
                          : action.tone === 'danger'
                            ? 'cancel'
                            : action.status === 'completed'
                              ? 'handshake'
                              : 'arrow_forward'
                      }
                      className="text-[18px]"
                    />
                    <span>{action.label}</span>
                  </button>
                ))}
              </section>
            )}

            {nextFulfillmentActions(order).length === 0 && (
              <div className="bg-surface-container-low rounded-xl p-space-sm flex items-center gap-space-xs">
                <Icon name="info" className="text-text-secondary text-[18px]" />
                <p className="font-caption text-caption text-text-secondary">
                  No further actions — this order is {orderStatusLabel(order.status).toLowerCase()}.
                </p>
              </div>
            )}
          </>
        )}

        <p className="font-caption text-caption text-text-tertiary text-center px-space-md">
          Retrieval is idempotent: searching the same QR, number or phone always returns the same order and never
          changes it. Payments are only marked verified here.
        </p>
      </main>

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full shadow-lg font-label-md text-label-md flex items-center gap-2 transition-all duration-300">
          <Icon name="check_circle" className="text-[18px] text-badge-discount-text" filled />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
