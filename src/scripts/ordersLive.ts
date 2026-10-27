import type { BookingStatus, BusinessBooking, BusinessOrder, OrderStatus } from '../services/businessOrdersService';
import { parsePrice, formatNaira } from '../utils/format';

/**
 * Display values for live orders and bookings, shared by the orders screens so
 * each one maps a real order into its own row shape the same way.
 */

type PersonLike = { firstName?: string | null; lastName?: string | null; phone?: string | null } | null | undefined;

export const personName = (person: PersonLike) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(' ') || person?.phone || 'Walk-In Guest';

/** "#4F2A9C1B": the order's short reference. */
export const orderRef = (order: BusinessOrder) => `#${order.id.slice(0, 8).toUpperCase()}`;

export const orderStatus = (order: BusinessOrder) => (order.status ?? 'new') as OrderStatus;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  new: 'New',
  processing: 'Processing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  refunded: 'Refunded',
  partial_refund: 'Part refunded',
};

export const orderStatusLabel = (order: BusinessOrder) => ORDER_STATUS_LABEL[orderStatus(order)] ?? orderStatus(order);

/** Closed orders (cancelled, rejected, refunded) sit with the cancelled chip. */
export const orderChip = (order: BusinessOrder) => {
  const status = orderStatus(order);
  return ['cancelled', 'rejected', 'refunded', 'partial_refund'].includes(status) ? 'cancelled' : status;
};

export const isOpenOrder = (order: BusinessOrder) => ['new', 'processing', 'ready'].includes(orderStatus(order));

export const orderTotal = (order: BusinessOrder) => parsePrice(order.totalAmount);

export const orderTotalLabel = (order: BusinessOrder) => formatNaira(orderTotal(order));

const lines = (order: BusinessOrder) => (order.items ?? []).filter((line) => line.quantity !== 0);

export const orderQuantity = (order: BusinessOrder) =>
  lines(order).reduce((sum, line) => sum + (line.quantity ?? 1), 0);

/** "3 items (Ribeye Steak + 2)" */
export const orderItemsSummary = (order: BusinessOrder) => {
  const all = lines(order);
  if (!all.length) return 'No items';
  const count = orderQuantity(order);
  const first = all[0].item?.name ?? all[0].offer?.title ?? 'Item';
  const rest = all.length - 1;
  return `${count} item${count === 1 ? '' : 's'} (${first}${rest ? ` + ${rest}` : ''})`;
};

/** "Table 04", "Store QR" or "Pickup": how the order reached the business. */
export const orderTypeLabel = (order: BusinessOrder) => {
  if (order.tableNumber) return `Table ${order.tableNumber}`;
  if (order.source === 'pos') return 'POS';
  if (order.source) return 'Store QR';
  return 'Pickup';
};

const PAYMENT_LABEL: Record<string, string> = {
  unpaid: 'Unpaid • Pay at Counter',
  'partially-paid': 'Part paid • Balance at Counter',
  'paid-in-store': 'Paid in store',
  'paid-pos': 'Paid via POS',
  refunded: 'Refunded',
};

export const orderPaymentLabel = (order: BusinessOrder) =>
  PAYMENT_LABEL[order.paymentStatus ?? 'unpaid'] ?? order.paymentStatus ?? 'Unpaid';

export const isOrderPaid = (order: BusinessOrder) => ['paid-in-store', 'paid-pos'].includes(order.paymentStatus ?? '');

/** "1:45 PM" for a timeline step. */
export const clockTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }) : '';

/** The next step for each open order status, plus how to stop it. */
export const ORDER_NEXT: Record<string, { label: string; status: OrderStatus }[]> = {
  new: [
    { label: 'Accept', status: 'processing' },
    { label: 'Reject', status: 'rejected' },
  ],
  processing: [
    { label: 'Ready', status: 'ready' },
    { label: 'Cancel', status: 'cancelled' },
  ],
  ready: [{ label: 'Complete', status: 'completed' }],
};

export const bookingStatus = (booking: BusinessBooking) => (booking.status ?? 'booked') as BookingStatus;

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  booked: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const BOOKING_NEXT: Record<string, { label: string; status: BookingStatus }[]> = {
  booked: [
    { label: 'Confirm', status: 'confirmed' },
    { label: 'Cancel', status: 'cancelled' },
  ],
  confirmed: [
    { label: 'Mark done', status: 'completed' },
    { label: 'Cancel', status: 'cancelled' },
  ],
};

export const bookingDate = (booking: BusinessBooking) =>
  new Date(`${booking.date}T${/^\d{2}:\d{2}/.test(booking.time) ? booking.time.slice(0, 5) : '00:00'}:00`);

/** "2:30 PM" */
export const bookingTimeLabel = (booking: BusinessBooking) => {
  const when = bookingDate(booking);
  return Number.isNaN(when.getTime())
    ? booking.time
    : when.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
};

/** "Mon 20 Oct" */
export const bookingDayLabel = (booking: BusinessBooking) => {
  const when = bookingDate(booking);
  return Number.isNaN(when.getTime())
    ? booking.date
    : when.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const isBookingToday = (booking: BusinessBooking, now = new Date()) =>
  bookingDate(booking).toDateString() === now.toDateString();

export const durationLabel = (minutes?: number | null) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours} hr${hours === 1 ? '' : 's'}`;
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'G';
