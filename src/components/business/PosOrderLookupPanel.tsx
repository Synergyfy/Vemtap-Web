import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, LoadingRows } from './QueryStates';
import { OrderRow } from './OrdersPanel';
import { businessOrderKeys, useBusinessOrders } from '../../hooks/business/useBusinessOrders';
import { businessOrdersService, type BusinessOrder } from '../../services/businessOrdersService';

type Mode = 'ref' | 'customer';

const MODES: { key: Mode; label: string; icon: string; placeholder: string; hint: string }[] = [
  { key: 'ref', label: 'Order # or QR', icon: 'qr_code_scanner', placeholder: 'e.g. #A708AA38', hint: 'The number on the customer’s receipt, or paste the scanned QR value.' },
  { key: 'customer', label: 'Customer', icon: 'person_search', placeholder: 'Name or last 4 digits of phone', hint: 'Matches the customer’s name or the end of their phone number.' },
];

const OPEN = ['new', 'processing', 'ready'];
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const digits = (value?: string | null) => (value ?? '').replace(/\D/g, '');

function matchOrders(orders: BusinessOrder[], mode: Mode, raw: string): BusinessOrder[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  if (mode === 'ref') {
    const full = q.match(UUID)?.[0];
    if (full) return orders.filter((o) => o.id.toLowerCase() === full || o.trackingToken?.toLowerCase() === full);
    const ref = q.replace(/^#/, '').replace(/[^0-9a-f]/g, '');
    return ref.length >= 4 ? orders.filter((o) => o.id.toLowerCase().startsWith(ref)) : [];
  }
  const tail = digits(q);
  return orders.filter((o) => {
    const name = [o.customer?.firstName, o.customer?.lastName].filter(Boolean).join(' ').toLowerCase();
    return (tail.length >= 4 && digits(o.customer?.phone).endsWith(tail)) || (!tail && name.includes(q));
  });
}

/**
 * Cashier lookup for online orders at the active branch: find by receipt
 * number, QR value or customer, then move the order along. Reading never
 * changes an order; only the action buttons do.
 */
export function PosOrderLookupPanel() {
  const orders = useBusinessOrders();
  const [mode, setMode] = useState<Mode>('ref');
  const [input, setInput] = useState('');
  const [searched, setSearched] = useState('');
  const active = MODES.find((m) => m.key === mode) ?? MODES[0];

  const list = orders.data ?? [];
  const matches = searched ? matchOrders(list, mode, searched) : [];
  // A full id that is older than the latest 100 orders is fetched directly.
  const fullId = mode === 'ref' ? searched.match(UUID)?.[0] : undefined;
  const direct = useQuery({
    queryKey: [...businessOrderKeys.all, 'one', fullId ?? ''],
    queryFn: () => businessOrdersService.order(fullId as string),
    enabled: Boolean(fullId) && orders.isSuccess && matches.length === 0,
    retry: false,
  });
  const results = matches.length ? matches : direct.data ? [direct.data] : [];
  const lookingUp = Boolean(fullId) && direct.isFetching;
  const openOrders = list.filter((o) => OPEN.includes(o.status ?? 'new'));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSearched(input.trim());
  };

  return (
    <div className="flex flex-col gap-space-lg max-w-3xl">
      <form onSubmit={submit} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-sm">
        <div role="tablist" aria-label="Look up by" className="flex gap-space-xs">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={mode === m.key}
              onClick={() => {
                setMode(m.key);
                setSearched('');
              }}
              className={`h-10 px-space-sm rounded-lg inline-flex items-center gap-1 font-label-md text-label-md ${
                mode === m.key ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-primary'
              }`}
            >
              <Icon name={m.icon} className="text-[18px]" /> {m.label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1">
          <span className="sr-only">{active.label}</span>
          <div className="flex gap-space-xs">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={active.placeholder}
              autoFocus
              className="flex-1 min-w-0 h-11 rounded-lg border border-border-subtle bg-surface-canvas px-space-sm font-body-md text-body-md"
            />
            <button type="submit" disabled={!input.trim()} className="h-11 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50">
              Look up
            </button>
          </div>
          <span className="font-caption text-caption text-text-secondary">{active.hint}</span>
        </label>
      </form>

      {orders.isLoading ? <LoadingRows rows={3} label="Loading orders" /> : null}
      {orders.isError ? <ErrorState title="Could not load orders" error={orders.error} onRetry={() => orders.refetch()} /> : null}

      {searched && orders.isSuccess ? (
        <section className="flex flex-col gap-space-xs" aria-live="polite">
          <h2 className="font-label-md text-label-md text-text-primary font-semibold">Results for “{searched}”</h2>
          {lookingUp ? (
            <LoadingRows rows={1} label="Looking up order" />
          ) : results.length ? (
            <ul className="flex flex-col gap-space-sm">
              {results.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </ul>
          ) : (
            <EmptyState icon="search_off" title="No matching order" body="Check the number with the customer, or search by their name or phone instead." />
          )}
        </section>
      ) : null}

      {orders.isSuccess ? (
        <section className="flex flex-col gap-space-xs">
          <h2 className="font-label-md text-label-md text-text-primary font-semibold">Open orders ({openOrders.length})</h2>
          {openOrders.length ? (
            <ul className="flex flex-col gap-space-sm">
              {openOrders.slice(0, 10).map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </ul>
          ) : (
            <span className="font-body-md text-body-md text-text-secondary">No open orders at this branch right now.</span>
          )}
        </section>
      ) : null}
    </div>
  );
}
