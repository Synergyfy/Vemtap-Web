import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { useOrders, type SubmittedOrder } from '../../context/OrdersContext';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  formatOrderTime,
  isPaymentCleared,
  nextFulfillmentActions,
  orderStatusLabel,
  type OrderNextAction,
} from '../orderData';

interface DesktopPosOrderLookupScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onBack: () => void;
}

type LookupMode = 'qr' | 'order-number' | 'phone';

const MODES: { key: LookupMode; label: string; icon: string; hint: string }[] = [
  { key: 'qr', label: 'QR Code', icon: 'qr_code_scanner', hint: 'Scan the collection code or paste its value' },
  { key: 'order-number', label: 'Order #', icon: 'tag', hint: 'e.g. UG-10231 (with or without the #)' },
  { key: 'phone', label: 'Phone', icon: 'phone_iphone', hint: 'Customer name or last 4 digits of their number' },
];

const money = (value: number) => `₦${value.toLocaleString('en-US')}`;

/** BUG-016 (desktop): idempotent cashier order lookup + verified-payment actions. */
export function DesktopPosOrderLookupScreen({ onNav, onBack }: DesktopPosOrderLookupScreenProps) {
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
      const ok = orders.markPaid(order.ref);
      showToast(ok ? `Payment verified • ${order.ref} is now Paid` : 'Could not verify payment — try again');
      return;
    }
    const ok = orders.setStatus(order.ref, action.status);
    showToast(ok ? `${order.ref} → ${action.label}` : 'Could not update this order');
  };

  const activeMode = MODES.find((item) => item.key === mode) ?? MODES[0];

  return (
    <PosTerminalChrome activeNav="orders" onNav={onNav}>
      <div className="w-full bg-surface-canvas min-h-[calc(100vh-64px)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Find Customer Order
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                QR scan • order number • phone — retrieval is idempotent and never mutates the order.
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary shadow-sm hover:bg-surface transition-all"
              onClick={onBack}
              type="button"
            >
              <Icon name="arrow_back" className="text-[20px] text-text-secondary" />
              <span>Back</span>
            </button>
          </div>

          <section className="bg-surface-canvas rounded-2xl shadow-md p-6 flex flex-col gap-4">
            <div className="flex gap-2">
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
                    className={`flex-1 h-11 rounded-xl font-label-sm text-label-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      selected
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[16px]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Icon name={activeMode.icon} className="text-[18px] text-primary" />
              <span className="font-caption text-caption">{activeMode.hint}</span>
            </div>
            <div className="flex gap-3">
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
                className="flex-1 h-12 rounded-xl border border-outline-variant bg-surface-canvas px-4 font-mono text-body-md text-text-primary placeholder:text-text-tertiary placeholder:font-sans focus:outline-none focus:border-primary"
                aria-label={activeMode.hint}
              />
              {mode === 'qr' && (
                <button
                  type="button"
                  onClick={handleScan}
                  className="w-12 h-12 rounded-xl bg-surface-subtle text-primary flex items-center justify-center shrink-0 hover:bg-surface-tint-blue transition-colors"
                  aria-label="Simulate QR scan"
                >
                  <Icon name="qr_code_scanner" className="text-[22px]" />
                </button>
              )}
              <button
                type="button"
                onClick={handleLookup}
                disabled={!query}
                className={`h-12 px-6 rounded-xl font-button-secondary text-button-secondary font-semibold transition-all ${
                  query ? 'bg-primary text-on-primary shadow-sm hover:opacity-95' : 'bg-surface-subtle text-text-tertiary'
                }`}
              >
                Look up
              </button>
            </div>
          </section>

          {searched && !order && (
            <div className="bg-surface-subtle rounded-2xl p-6 flex items-start gap-3">
              <Icon name="search_off" className="text-text-secondary text-[24px] shrink-0 mt-0.5" />
              <p className="font-body-md text-body-md text-text-secondary">
                No order matches <span className="font-semibold text-text-primary">“{query}”</span>. Check the
                reference, or try the customer&apos;s phone number. Looking up never creates or changes an order.
              </p>
            </div>
          )}

          {order && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-surface-canvas rounded-2xl shadow-md p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-label-md text-label-md text-text-primary font-semibold">
                    #{order.ref}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                    {orderStatusLabel(order.status)}
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  {order.customerName}
                  {order.customerPhone ? ` • ${order.customerPhone}` : ''} •{' '}
                  {order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'} • {formatOrderTime(order.submittedAt)}
                </p>
                <div className="h-px bg-border-subtle" />
                <ul className="flex flex-col gap-2">
                  {order.lines.map((line) => (
                    <li key={`${line.id}-${line.name}`} className="flex items-start justify-between gap-4">
                      <span className="font-body-md text-body-md text-text-primary">
                        {line.qty}× {line.name}
                      </span>
                      <span className="font-body-md text-body-md text-text-secondary shrink-0">
                        {money(line.price * line.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="h-px bg-border-subtle" />
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-bold text-text-primary">Total</span>
                  <span className="font-heading-lg text-heading-lg font-bold text-text-primary">
                    {money(order.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
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

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6 flex flex-col gap-3">
                <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                  Permitted Actions
                </h2>
                {!isPaymentCleared(order.paymentStatus) && (
                  <div className="flex items-start gap-2 rounded-xl bg-badge-discount-bg p-3">
                    <Icon name="gpp_maybe" className="text-badge-discount-text text-[18px] shrink-0 mt-0.5" />
                    <p className="font-caption text-caption text-text-secondary leading-relaxed">
                      Payment not verified — only mark paid after you have seen the tender. The order stays{' '}
                      {orderStatusLabel(order.status)} until then.
                    </p>
                  </div>
                )}
                {nextFulfillmentActions(order).length > 0 ? (
                  nextFulfillmentActions(order).map((action) => (
                    <button
                      key={action.status + action.label}
                      type="button"
                      onClick={() => applyAction(action)}
                      className={`h-12 rounded-xl font-button-secondary text-button-secondary font-semibold flex items-center justify-center gap-2 transition-all ${
                        action.tone === 'primary'
                          ? 'bg-primary text-on-primary shadow-sm hover:opacity-95'
                          : action.tone === 'danger'
                            ? 'bg-error-container text-error hover:bg-error-container/60'
                            : 'bg-surface-subtle text-text-secondary hover:bg-surface-container-high'
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
                  ))
                ) : (
                  <p className="font-body-md text-body-md text-text-secondary">
                    No further actions — this order is {orderStatusLabel(order.status).toLowerCase()}.
                  </p>
                )}
              </section>
            </div>
          )}

          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-2xl flex items-center gap-space-sm">
              <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
              <span className="font-label-md text-label-md">{toast}</span>
            </div>
          )}
        </div>
      </div>
    </PosTerminalChrome>
  );
}
