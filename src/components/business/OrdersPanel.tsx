import { useState } from 'react';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { useBusinessBookings, useBusinessOrders, useOrderStatusMutations } from '../../hooks/business/useBusinessOrders';
import type { BookingStatus, BusinessBooking, BusinessOrder, OrderStatus } from '../../services/businessOrdersService';
import { toPrice } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatNaira, formatRelativeTime } from '../../utils/format';

export type OrdersView = 'orders' | 'bookings';

const personName = (p?: { firstName?: string | null; lastName?: string | null; phone?: string | null } | null) =>
  [p?.firstName, p?.lastName].filter(Boolean).join(' ') || p?.phone || 'Walk-in guest';

const ORDER_TONE: Record<string, string> = {
  new: 'bg-primary-container text-on-primary',
  processing: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  ready: 'bg-surface-tint-blue text-primary',
  completed: 'bg-badge-discount-bg text-badge-discount-text',
};
const ORDER_LABEL: Record<string, string> = {
  new: 'New',
  processing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  refunded: 'Refunded',
  partial_refund: 'Part refunded',
};

/** The next step for each open order status, plus how to stop it. */
const ORDER_NEXT: Record<string, { label: string; status: OrderStatus }[]> = {
  new: [
    { label: 'Accept', status: 'processing' },
    { label: 'Reject', status: 'rejected' },
  ],
  processing: [
    { label: 'Mark ready', status: 'ready' },
    { label: 'Cancel', status: 'cancelled' },
  ],
  ready: [{ label: 'Complete', status: 'completed' }],
};

const BOOKING_NEXT: Record<string, { label: string; status: BookingStatus }[]> = {
  booked: [
    { label: 'Confirm', status: 'confirmed' },
    { label: 'Cancel', status: 'cancelled' },
  ],
  confirmed: [
    { label: 'Mark done', status: 'completed' },
    { label: 'Cancel', status: 'cancelled' },
  ],
};

const OPEN_ORDER = ['new', 'processing', 'ready'];
const OPEN_BOOKING = ['booked', 'confirmed'];

function ActionButtons<S extends string>({
  actions,
  busy,
  onAction,
}: {
  actions: { label: string; status: S }[];
  busy: boolean;
  onAction: (status: S) => void;
}) {
  return (
    <div className="flex flex-wrap gap-space-xs">
      {actions.map((action, index) => (
        <button
          key={action.status}
          type="button"
          disabled={busy}
          onClick={() => onAction(action.status)}
          className={`h-9 px-space-sm rounded-lg font-label-md text-label-md disabled:opacity-50 ${
            index === 0 ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-primary'
          }`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export function OrderRow({ order }: { order: BusinessOrder }) {
  const { order: mutate } = useOrderStatusMutations();
  const [error, setError] = useState<string | null>(null);
  const status = order.status ?? 'new';
  const total = toPrice(order.totalAmount ?? undefined);
  const lines = (order.items ?? []).map((line) => `${line.quantity ?? 1}× ${line.item?.name ?? 'Item'}`).join(', ');

  return (
    <li className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-xs">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold">
            #{order.id.slice(0, 8).toUpperCase()} · {personName(order.customer)}
          </span>
          <span className="font-caption text-caption text-text-secondary truncate">{lines || 'No items'}</span>
          <span className="font-caption text-caption text-text-tertiary">
            {formatRelativeTime(order.createdAt)}
            {order.tableNumber ? ` · Table ${order.tableNumber}` : ''}
            {order.notes ? ` · “${order.notes}”` : ''}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${ORDER_TONE[status] ?? 'bg-surface-container text-text-secondary'}`}>
            {ORDER_LABEL[status] ?? status}
          </span>
          <span className="font-label-md text-label-md text-text-primary font-semibold">{total !== undefined ? formatNaira(total) : '—'}</span>
        </div>
      </div>
      {ORDER_NEXT[status] ? (
        <ActionButtons
          actions={ORDER_NEXT[status]}
          busy={mutate.isPending}
          onAction={(next) => mutate.mutate({ id: order.id, status: next }, { onError: (e) => setError(apiErrorMessage(e)), onSuccess: () => setError(null) })}
        />
      ) : null}
      {error ? <span className="font-caption text-caption text-red-600">{error}</span> : null}
    </li>
  );
}

function BookingRow({ booking }: { booking: BusinessBooking }) {
  const { booking: mutate } = useOrderStatusMutations();
  const [error, setError] = useState<string | null>(null);
  const status = booking.status ?? 'booked';
  const when = new Date(`${booking.date}T${booking.time.length === 5 ? booking.time : '00:00'}:00`);

  return (
    <li className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-xs">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold">{booking.itemName ?? 'Booking'}</span>
          <span className="font-caption text-caption text-text-secondary">
            {personName(booking.customer)}
            {booking.customer?.phone ? ` · ${booking.customer.phone}` : ''}
          </span>
          <span className="font-caption text-caption text-text-tertiary">
            {Number.isNaN(when.getTime()) ? `${booking.date} ${booking.time}` : when.toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
            {booking.durationMinutes ? ` · ${booking.durationMinutes} min` : ''}
            {booking.reference ? ` · ${booking.reference}` : ''}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold bg-surface-container text-text-primary capitalize shrink-0">{status}</span>
      </div>
      {booking.notes ? <span className="font-caption text-caption text-text-secondary">“{booking.notes}”</span> : null}
      {BOOKING_NEXT[status] ? (
        <ActionButtons
          actions={BOOKING_NEXT[status]}
          busy={mutate.isPending}
          onAction={(next) => mutate.mutate({ id: booking.id, status: next }, { onError: (e) => setError(apiErrorMessage(e)), onSuccess: () => setError(null) })}
        />
      ) : null}
      {error ? <span className="font-caption text-caption text-red-600">{error}</span> : null}
    </li>
  );
}

/** Live orders and bookings at the active branch, with status actions. */
export function OrdersPanel({ initialView = 'orders' }: { initialView?: OrdersView }) {
  const [view, setView] = useState<OrdersView>(initialView);
  const [scope, setScope] = useState<'open' | 'all'>('open');
  const orders = useBusinessOrders();
  const bookings = useBusinessBookings();
  const query = view === 'orders' ? orders : bookings;

  const orderRows = (orders.data ?? []).filter((o) => scope === 'all' || OPEN_ORDER.includes(o.status ?? 'new'));
  const bookingRows = (bookings.data ?? [])
    .filter((b) => scope === 'all' || OPEN_BOOKING.includes(b.status ?? 'booked'))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const openOrders = (orders.data ?? []).filter((o) => OPEN_ORDER.includes(o.status ?? 'new')).length;
  const openBookings = (bookings.data ?? []).filter((b) => OPEN_BOOKING.includes(b.status ?? 'booked')).length;

  return (
    <div className="flex flex-col gap-space-md max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <FilterChips<OrdersView>
          value={view}
          onChange={setView}
          options={[
            { key: 'orders', label: 'Orders', count: openOrders },
            { key: 'bookings', label: 'Bookings', count: openBookings },
          ]}
        />
        <FilterChips<'open' | 'all'>
          value={scope}
          onChange={setScope}
          options={[
            { key: 'open', label: 'Open' },
            { key: 'all', label: 'All' },
          ]}
        />
      </div>
      {query.isLoading ? (
        <LoadingRows rows={3} label={`Loading ${view}`} />
      ) : query.isError ? (
        <ErrorState title={`Could not load ${view}`} error={query.error} onRetry={() => query.refetch()} />
      ) : view === 'orders' ? (
        orderRows.length ? (
          <ul className="flex flex-col gap-space-sm">
            {orderRows.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ul>
        ) : (
          <EmptyState icon="receipt_long" title={scope === 'open' ? 'No open orders' : 'No orders yet'} body="New storefront and table orders appear here automatically." />
        )
      ) : bookingRows.length ? (
        <ul className="flex flex-col gap-space-sm">
          {bookingRows.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </ul>
      ) : (
        <EmptyState icon="calendar_month" title={scope === 'open' ? 'No upcoming bookings' : 'No bookings yet'} body="Bookings for your services appear here." />
      )}
    </div>
  );
}
