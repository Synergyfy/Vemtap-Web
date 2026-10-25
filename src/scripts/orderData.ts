export type FulfillmentMode = 'pickup' | 'delivery';

export interface OrderLine {
  id: string;
  productId?: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  options?: string;
  instructions?: string;
}

export interface OrderSummary {
  ref: string;
  lines: OrderLine[];
  subtotal: number;
  savings: number;
  deliveryFee: number;
  total: number;
  fulfillment: FulfillmentMode;
}

export const VOUCHER_CODE = 'VT-48F261';
export const VOUCHER_RATE = 0.2;
export const DELIVERY_FEE = 1000;
export const SERVICE_FEE = 0;

export const MERCHANT_NAME = 'Local dining partner';
export const MERCHANT_PHONE_DISPLAY = '+234 802 345 6789';
export const MERCHANT_PHONE_TEL = '+2348023456789';
export const MERCHANT_ADDRESS = 'Your local branch';
export const MERCHANT_LOCATION_SUBLINE = 'Available at your nearby branch';

export const MERCHANT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCA8_kMmN6cnVSKGg_FDIm2SzH9HmOHSLTtjZyaZwJWLCj2BHLOAcN6uGA-S-zEwlWFysUhzXoYUu0jeKXAYCupeyY00C-kLrF2n8NObPQMutWhfbBLfZx4Vh8gmU4sEWUIc8SyHTYKkdEVFamZLfN-R8wHGIMBAbWGuSAAY76R6eT6pCMme_X7T3tIL6nUZHfOzG1R8AlYqxsCZ8oa2oSfmEulVSGSL0kw3gcv7AjkQKzyMF06cbCDKw';

export const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAzhZzFT3Gry5iHdZCpEQvkukGdJ_7K69oNSRrJGyum-Zc_a6VShzga5YmUHmQeWy0p3AyHsh0T6wZCEMRNpagbgjvaWNEFOV_yaEb4-moOELk0PVDthraM4eokB9PReJcbzcjOswMTrA7TTOea_LgJdFfl9vOihjwfyo8k8IF0o15t4i2QRZGrONyOxQd_-Gfowx_WEbO_KQwrol9aRmcMVbunpciSq6vXr3_6Tr3ZwM8-ayUxMud8rg';

export const newOrderRef = (taken: readonly string[] = []): string => {
  const blocked = new Set(taken.map((ref) => ref.trim().toUpperCase()));
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = `UG-${Math.floor(10000 + Math.random() * 89999)}`;
    if (!blocked.has(candidate.toUpperCase())) return candidate;
  }
  // Practically unreachable, but never hand out a colliding reference.
  return `UG-${String(Date.now()).slice(-5)}`;
};

/**
 * Order lifecycle (register §10). Submission, payment and fulfillment are
 * deliberately separate statuses: a merchant receiving an order is not the
 * same as a payment being verified, which is not the same as goods handed over.
 */
export type OrderStatus =
  | 'submitted'
  | 'payment-pending'
  | 'paid'
  | 'confirmed'
  | 'processing'
  | 'ready-for-collection'
  | 'completed'
  | 'cancelled'
  | 'refunded';

/**
 * How the customer chose to settle, and whether that settlement is verified.
 * `not-required` = pay at the counter (cash/POS on collection) — the merchant
 * records the tender. Online methods start `pending` and may only become
 * `verified` once a server-side verification callback confirms them.
 */
export type PaymentMethod = 'pay-at-counter' | 'card' | 'transfer' | 'wallet';

export type PaymentStatus = 'not-required' | 'pending' | 'verified' | 'failed' | 'refunded';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  'pay-at-counter': 'Pay at counter (cash / POS)',
  card: 'Card',
  transfer: 'Bank transfer',
  wallet: 'VEMTAP wallet',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  'not-required': 'Pay at counter',
  pending: 'Payment pending',
  verified: 'Payment verified',
  failed: 'Payment failed',
  refunded: 'Payment refunded',
};

export interface OrderStatusMeta {
  key: OrderStatus;
  label: string;
  tone: 'new' | 'progress' | 'ready' | 'done' | 'cancelled';
}

export const ORDER_STATUSES: readonly OrderStatusMeta[] = [
  { key: 'submitted', label: 'Submitted', tone: 'new' },
  { key: 'payment-pending', label: 'Payment Pending', tone: 'new' },
  { key: 'paid', label: 'Paid', tone: 'progress' },
  { key: 'confirmed', label: 'Confirmed', tone: 'progress' },
  { key: 'processing', label: 'Processing', tone: 'progress' },
  { key: 'ready-for-collection', label: 'Ready for Collection', tone: 'ready' },
  { key: 'completed', label: 'Completed', tone: 'done' },
  { key: 'cancelled', label: 'Cancelled', tone: 'cancelled' },
  { key: 'refunded', label: 'Refunded', tone: 'cancelled' },
];

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((meta) => meta.key === status)?.label ?? status;
}

/** The next actions a cashier is permitted to take, in order. */
export interface OrderNextAction {
  label: string;
  status: OrderStatus;
  tone: 'primary' | 'quiet' | 'danger';
}

/**
 * Status -> permitted next actions. Derived on the client so the cashier UI
 * never offers an illegal transition; the server must re-validate each one.
 */
export function nextFulfillmentActions(order: {
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
}): OrderNextAction[] {
  const payAtCounter = (order.paymentMethod ?? 'pay-at-counter') === 'pay-at-counter';
  switch (order.status) {
    case 'submitted':
      return payAtCounter
        ? [
            { label: 'Mark Paid (tender received)', status: 'paid', tone: 'primary' },
            { label: 'Cancel Order', status: 'cancelled', tone: 'danger' },
          ]
        : [
            { label: 'Hold for Payment', status: 'payment-pending', tone: 'quiet' },
            { label: 'Cancel Order', status: 'cancelled', tone: 'danger' },
          ];
    case 'payment-pending':
      return [
        { label: 'Payment Verified — Mark Paid', status: 'paid', tone: 'primary' },
        { label: 'Cancel Order', status: 'cancelled', tone: 'danger' },
      ];
    case 'paid':
    case 'confirmed':
      return [
        { label: 'Start Processing', status: 'processing', tone: 'primary' },
        { label: 'Cancel & Refund', status: 'refunded', tone: 'danger' },
      ];
    case 'processing':
      return [
        { label: 'Mark Ready for Collection', status: 'ready-for-collection', tone: 'primary' },
        { label: 'Cancel & Refund', status: 'refunded', tone: 'danger' },
      ];
    case 'ready-for-collection':
      return [
        { label: 'Hand Over — Complete', status: 'completed', tone: 'primary' },
        { label: 'Cancel & Refund', status: 'refunded', tone: 'danger' },
      ];
    default:
      return [];
  }
}

/** True once payment verification has succeeded (or was never required). */
export function isPaymentCleared(status: PaymentStatus | undefined): boolean {
  return status === 'verified' || status === 'not-required' || status === undefined;
}

export const estimateReadyBy = (minutes = 25) =>
  new Date(Date.now() + minutes * 60_000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

/** Customer-facing 4-step timeline states, aligned with `ORDER_STEPS` labels. */
export type OrderStepState = 'done' | 'current' | 'todo';

/**
 * Maps a status onto the customer timeline [Received, Processing, Ready,
 * Completed]. Payment-pending stops at step 1 — an unpaid order is not yet
 * "in the kitchen".
 */
export function orderTimeline(status: OrderStatus): OrderStepState[] {
  switch (status) {
    case 'payment-pending':
      return ['current', 'todo', 'todo', 'todo'];
    case 'submitted':
    case 'paid':
    case 'confirmed':
    case 'processing':
      return ['done', 'current', 'todo', 'todo'];
    case 'ready-for-collection':
      return ['done', 'done', 'current', 'todo'];
    case 'completed':
      return ['done', 'done', 'done', 'done'];
    default:
      return ['current', 'todo', 'todo', 'todo'];
  }
}

export function isActiveOrderStatus(status: OrderStatus): boolean {
  return status !== 'completed' && status !== 'cancelled' && status !== 'refunded';
}

export function formatOrderTime(ms: number): string {
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
