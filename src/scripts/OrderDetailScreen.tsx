import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { NO_IMAGE } from '../utils/homeOffer';
import { Icon } from '../components/ui/Icon';
import { OrderQrArt } from '../components/ui/OrderQrArt';
import { useOrders } from '../context/OrdersContext';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  formatOrderTime,
  isPaymentCleared,
  orderStatusLabel,
  orderTimeline,
} from './orderData';
import { printKvTable, printReport } from '../utils/printReport';

interface OrderDetailScreenProps {
  /** BUG-015: the ref of the order opened from the Orders list. */
  orderRef?: string;
  onBack: () => void;
  /** Opens the chat with this branch. */
  onChat: (branchId?: string) => void;
  onReorder: () => void;
  onSupport: () => void;
}

const FULFILLMENT_LABELS = { pickup: 'Pickup', delivery: 'Delivery' } as const;

const money = (value: number) => `₦${value.toLocaleString('en-US')}`;

export function OrderDetailScreen({ orderRef, onBack, onChat, onReorder, onSupport }: OrderDetailScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const orders = useOrders();

  // BUG-015: read the real order by ref (falling back to the most recent one).
  const order = (orderRef ? orders.byRef(orderRef) : undefined) ?? orders.latest ?? orders.orders[0] ?? null;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
  };

  const copyValue = (value: string, label: string) => {
    navigator.clipboard?.writeText(value).catch(() => undefined);
    setCopied(value);
    showToast(`${label} copied: ${value}`);
    window.setTimeout(() => setCopied((current) => (current === value ? null : current)), 2000);
  };

  if (!order) {
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
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Order Details</h1>
          </div>
        </header>
        <main className="px-margin py-space-xl flex flex-col items-center gap-space-sm text-center">
          <Icon name="receipt_long" className="text-[40px] text-text-tertiary" />
          <p className="font-body-md text-body-md text-text-secondary">No order found.</p>
          <button
            type="button"
            onClick={onBack}
            className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold"
          >
            Back to Orders
          </button>
        </main>
      </AppScreen>
    );
  }

  const directionsUrl =
    order.merchantLatitude != null && order.merchantLongitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${order.merchantLatitude},${order.merchantLongitude}`
      : order.merchantAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.merchantAddress)}`
        : null;

  const timeline = orderTimeline(order.status);
  const paymentCleared = isPaymentCleared(order.paymentStatus);
  const readyByLabel = order.readyByLabel ?? 'Shortly';

  const steps = [
    { label: 'Order Received', meta: formatOrderTime(order.submittedAt) },
    {
      label: order.status === 'payment-pending' ? 'Awaiting Payment' : 'In the Kitchen',
      meta: order.status === 'payment-pending' ? 'Payment not verified yet' : `${order.merchantName} is on it`,
    },
    { label: 'Ready for Pickup', meta: `Estimated by ${readyByLabel}` },
    { label: order.fulfillment === 'delivery' ? 'Delivered' : 'Picked Up', meta: 'Show your code at the counter' },
  ];

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
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Order Details</h1>
            <span className="font-mono font-caption text-caption text-text-tertiary">
              #{order.ref} • {order.merchantName}
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin py-space-sm pb-space-xl gap-space-md">
        <section className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
          <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="restaurant" className="text-[22px]" filled />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="font-label-md text-label-md font-bold text-tertiary">
                {orderStatusLabel(order.status)}
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary mt-0.5">
              {order.status === 'ready-for-collection' ? (
                <>
                  Ready now • <span className="font-semibold text-text-primary">Show your code at the counter</span>
                </>
              ) : order.status === 'completed' ? (
                'Completed — thanks for ordering!'
              ) : order.status === 'cancelled' ? (
                'This order was cancelled.'
              ) : order.status === 'refunded' ? (
                'This order was cancelled and refunded.'
              ) : (
                <>
                  Estimated ready by <span className="font-semibold text-text-primary">{readyByLabel}</span> •{' '}
                  {FULFILLMENT_LABELS[order.fulfillment]}
                </>
              )}
            </p>
          </div>
        </section>

        {!paymentCleared && (
          <section className="bg-badge-discount-bg rounded-xl p-space-sm flex items-start gap-space-sm">
            <Icon name="schedule" className="text-badge-discount-text text-[20px] shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              Payment not verified yet — {order.merchantName} has not confirmed your{' '}
              {PAYMENT_METHOD_LABELS[order.paymentMethod].toLowerCase()} payment. Your order stays{' '}
              <span className="font-semibold text-text-primary">{orderStatusLabel(order.status)}</span> until they do.
            </p>
          </section>
        )}

        {/* BUG-015: the collection QR lives on the order itself and can be reopened any time. */}
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center gap-space-sm">
          <div className="w-full flex items-center justify-between">
            <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Collection Code
            </h2>
            <span className="font-mono font-caption text-caption text-text-tertiary">{order.ref}</span>
          </div>
          <div className="bg-white rounded-xl p-space-sm">
            <OrderQrArt value={order.ref} size={168} />
          </div>
          <p className="font-caption text-caption text-text-secondary text-center">
            Show this code at the counter. Reopen it anytime from Orders → {order.ref}.
          </p>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider mb-space-sm">
            Order Progress
          </h2>
          <ol className="flex flex-col">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const state = timeline[index] ?? 'todo';
              const done = state === 'done';
              const current = state === 'current';
              return (
                <li key={step.label} className="flex gap-space-sm">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-primary text-on-primary'
                          : current
                            ? 'bg-primary/10 text-primary ring-2 ring-primary'
                            : 'bg-surface-container-high text-text-tertiary'
                      }`}
                    >
                      <Icon
                        name={done ? 'check' : current ? 'restaurant' : 'radio_button_unchecked'}
                        filled={done || current}
                        className="text-[15px]"
                      />
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 flex-1 min-h-6 my-1 ${done ? 'bg-primary' : 'bg-outline-variant/50'}`} />
                    )}
                  </div>
                  <div className={`pb-space-sm ${isLast ? '' : 'pb-md'}`}>
                    <span
                      className={`font-label-md text-label-md font-semibold block ${
                        done || current ? 'text-text-primary' : 'text-text-tertiary'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">{step.meta}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="relative shrink-0">
              <img
                className="w-12 h-12 rounded-full object-cover shadow-sm"
                alt={order.merchantName}
                src={order.merchantLogo || NO_IMAGE}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{order.merchantName}</h2>
              </div>
              <span className="font-caption text-caption text-text-secondary truncate">
{order.merchantAddress}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-space-xs">
            {order.merchantPhone ? (
<a
 href={`tel:${order.merchantPhone}`}
              className="h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="call" className="text-[16px]" />
              <span>Call</span>
            </a>
) : null}
            <button
              type="button"
              onClick={() => onChat(order.merchantId)}
              className="h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="chat" className="text-[16px]" />
              <span>Chat</span>
            </button>
            {directionsUrl ? (
<a
 href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="near_me" className="text-[16px]" />
              <span>Directions</span>
            </a>
) : null}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">Order Summary</h2>
          <ul className="flex flex-col gap-space-sm">
            {order.lines.map((line) => (
              <li key={`${line.id}-${line.name}`} className="flex items-start justify-between gap-space-sm">
                <div className="min-w-0">
                  <span className="font-body-md text-body-md text-text-primary block truncate">
                    {line.qty}× {line.name}
                  </span>
                  <span className="font-caption text-caption text-text-tertiary truncate block">
                    {line.instructions || line.options || line.name}
                  </span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-text-primary shrink-0">
                  {money(line.price * line.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-outline-variant/40 pt-space-xs flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-text-secondary">Subtotal</span>
              <span className="font-body-md text-body-md text-text-primary">{money(order.subtotal)}</span>
            </div>
            {order.savings > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-text-secondary flex items-center gap-1">
                  <Icon name="confirmation_number" className="text-[15px] text-badge-discount-text" />
                  Deal savings
                </span>
                <span className="font-body-md text-body-md text-badge-discount-text font-semibold">
                  −{money(order.savings)}
                </span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-text-secondary">Delivery fee</span>
                <span className="font-body-md text-body-md text-text-primary">{money(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/40">
              <span className="font-label-md text-label-md font-bold text-text-primary">Total</span>
              <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{money(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider mb-space-xs">
            Transaction Details
          </h2>
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-caption text-caption text-text-secondary">Payment</span>
              <span className="font-label-sm text-label-sm text-text-primary font-medium flex items-center gap-1">
                <Icon name="credit_card" className="text-[15px] text-badge-discount-text" />
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </span>
            </div>
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-caption text-caption text-text-secondary">Status</span>
              <span
                className={`font-label-sm text-label-sm font-medium ${
                  paymentCleared ? 'text-badge-discount-text' : 'text-error'
                }`}
              >
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                {order.paymentRef ? ` • ${order.paymentRef}` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-caption text-caption text-text-secondary">Placed</span>
              <span className="font-label-sm text-label-sm text-text-primary font-medium">
                {formatOrderTime(order.submittedAt)} WAT
              </span>
            </div>
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-caption text-caption text-text-secondary">Reference</span>
              <button
                type="button"
                onClick={() => copyValue(order.ref, 'Order reference')}
                className="flex items-center gap-1 font-mono font-label-sm text-label-sm text-primary font-semibold hover:underline"
              >
                <span>#{order.ref}</span>
                <Icon name={copied === order.ref ? 'check' : 'content_copy'} className="text-[15px]" />
              </button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          {order.merchantPhone ? (
<a
 href={`tel:${order.merchantPhone}`}
            className="h-12 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
          >
            <Icon name="call" className="text-[19px]" />
            <span>Call Business</span>
          </a>
) : null}
          <button
            type="button"
            onClick={onReorder}
            className="h-12 rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
          >
            <Icon name="refresh" className="text-[19px]" />
            <span>Reorder These Items</span>
          </button>
          <button
            type="button"
            onClick={() => {
              printReport(
                `Receipt — Order #${order.ref}`,
                `${printKvTable('Order summary', [
                  ['Order ref', order.ref],
                  ['Merchant', order.merchantName],
                  ['Placed', `${formatOrderTime(order.submittedAt)} WAT`],
                  ['Fulfillment', FULFILLMENT_LABELS[order.fulfillment]],
                  ['Payment', `${PAYMENT_STATUS_LABELS[order.paymentStatus]} · ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`]
                ])}
                 <h2>Items</h2>
                 <table class="kv"><tbody>
                   ${order.lines
                     .map(
                       (line) =>
                         `<tr><td>${line.qty} × ${line.name}${line.options ? ` (${line.options})` : ''}</td><td>${money(line.price * line.qty)}</td></tr>`
                     )
                     .join('')}
                   <tr class="total"><td>Total</td><td>${money(order.total)}</td></tr>
                 </tbody></table>
                 <p class="foot">Vemtap receipt — proof of order.</p>`
              );
              showToast('Receipt opened — save it as PDF from the print dialog');
            }}
            className="h-12 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
          >
            <Icon name="download" className="text-[19px]" />
            <span>Download PDF Receipt</span>
          </button>
          <button
            type="button"
            onClick={onSupport}
            className="h-11 text-error font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:underline"
          >
            <Icon name="report" className="text-[17px]" />
            <span>Report an Issue with this Order</span>
          </button>
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
