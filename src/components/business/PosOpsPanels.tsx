import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { SettingsSection, SwitchRow, TextField } from './FormPrimitives';
import { PosReceipt, printSaleReceipt } from './PosReceipt';
import { useKitchenStream, usePosMutations, usePosSale, usePosSales, useStaffPins } from '../../hooks/business/usePos';
import { useCatalogueItems } from '../../hooks/business/useCatalogueItems';
import { money, personName, type KitchenStatus, type PosPaymentMethod, type PosSaleStatus } from '../../services/posService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatNaira, formatRelativeTime } from '../../utils/format';

const naira = (value?: number | string | null) => formatNaira(money(value));
const METHOD_LABEL: Record<string, string> = { cash: 'Cash', card: 'Card', transfer: 'Transfer', split: 'Split' };
const STATUS_TONE: Record<string, string> = {
  completed: 'bg-badge-discount-bg text-badge-discount-text',
  refunded: 'bg-error-container text-on-error-container',
  partial_refund: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
};
const STATUS_LABEL: Record<string, string> = { completed: 'Paid', refunded: 'Refunded', partial_refund: 'Part refunded' };

// ---------------------------------------------------------------------------
// Sales ledger
// ---------------------------------------------------------------------------

function SaleDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const sale = usePosSale(id);
  const { refundSale } = usePosMutations();
  const [refunding, setRefunding] = useState(false);
  const [reason, setReason] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  if (sale.isLoading) return <LoadingRows rows={4} label="Loading sale" />;
  if (sale.isError || !sale.data) return <ErrorState title="Could not load this sale" error={sale.error} onRetry={() => sale.refetch()} />;
  const s = sale.data;
  const refundable = (s.items ?? []).map((i) => ({ ...i, left: i.quantity - (i.refundedQuantity ?? 0) })).filter((i) => i.left > 0);
  const picked = Object.entries(quantities).filter(([, q]) => q > 0);
  const fullRefund = refundable.every((i) => (quantities[i.id] ?? 0) === i.left);

  const submit = () => {
    refundSale.mutate(
      {
        id: s.id,
        status: fullRefund ? 'refunded' : 'partial_refund',
        reason: reason.trim() || undefined,
        refundItems: fullRefund ? undefined : picked.map(([saleItemId, quantity]) => ({ saleItemId, quantity })),
      },
      {
        onSuccess: () => {
          setRefunding(false);
          setQuantities({});
          setReason('');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-space-md max-w-xl">
      <button type="button" onClick={onBack} className="self-start inline-flex items-center gap-1 font-label-md text-label-md text-primary">
        <Icon name="arrow_back" className="text-[18px]" /> All sales
      </button>
      <PosReceipt sale={s} />
      <div className="flex flex-wrap gap-space-xs">
        <button type="button" onClick={() => printSaleReceipt(s)} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md inline-flex items-center gap-1">
          <Icon name="print" className="text-[18px]" /> Reprint
        </button>
        {refundable.length && !refunding ? (
          <button
            type="button"
            onClick={() => {
              setRefunding(true);
              setQuantities(Object.fromEntries(refundable.map((i) => [i.id, i.left])));
            }}
            className="h-10 px-space-md rounded-lg bg-surface-container text-red-600 font-label-md text-label-md inline-flex items-center gap-1"
          >
            <Icon name="undo" className="text-[18px]" /> Refund
          </button>
        ) : null}
      </div>
      {refunding ? (
        <SettingsSection title="Refund" icon="undo">
          <span className="font-caption text-caption text-text-secondary">Choose how many of each item come back. Stock is returned to the shelf.</span>
          <ul className="flex flex-col divide-y divide-border-subtle">
            {refundable.map((item) => (
              <li key={item.id} className="py-space-xs flex items-center gap-space-sm">
                <span className="flex-1 min-w-0 font-label-md text-label-md truncate">{item.productName}</span>
                <span className="flex items-center gap-1">
                  <button type="button" aria-label={`Refund fewer ${item.productName}`} onClick={() => setQuantities((q) => ({ ...q, [item.id]: Math.max(0, (q[item.id] ?? 0) - 1) }))} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                    <Icon name="remove" className="text-[16px]" />
                  </button>
                  <span className="w-12 text-center font-label-md text-label-md">
                    {quantities[item.id] ?? 0}/{item.left}
                  </span>
                  <button type="button" aria-label={`Refund more ${item.productName}`} onClick={() => setQuantities((q) => ({ ...q, [item.id]: Math.min(item.left, (q[item.id] ?? 0) + 1) }))} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                    <Icon name="add" className="text-[16px]" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <TextField id="refund-reason" label="Reason" value={reason} onChange={setReason} placeholder="Wrong item, customer changed mind…" />
          {refundSale.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(refundSale.error, 'Could not refund this sale.')}</span> : null}
          <div className="flex gap-space-xs justify-end">
            <button type="button" onClick={() => setRefunding(false)} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
              Cancel
            </button>
            <button
              type="button"
              disabled={!picked.length || refundSale.isPending}
              onClick={submit}
              className="h-10 px-space-md rounded-lg bg-error text-on-error font-label-md text-label-md disabled:opacity-50"
            >
              {refundSale.isPending ? 'Refunding…' : fullRefund ? 'Refund whole sale' : 'Refund selected'}
            </button>
          </div>
        </SettingsSection>
      ) : null}
    </div>
  );
}

/** Live sales ledger for the active branch, with receipts and refunds. */
export function PosLedgerPanel({ initialSaleId }: { initialSaleId?: string | null }) {
  const [status, setStatus] = useState<PosSaleStatus | 'all'>('all');
  const [method, setMethod] = useState<PosPaymentMethod | ''>('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(initialSaleId ?? null);
  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [search]);
  const sales = usePosSales({ page, limit: 20, status: status === 'all' ? undefined : status, paymentMethod: method || undefined, search: debounced || undefined });

  if (openId) return <SaleDetail id={openId} onBack={() => setOpenId(null)} />;
  const meta = sales.data?.meta;

  return (
    <div className="flex flex-col gap-space-md max-w-5xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
        {[
          { label: 'Gross sales', value: meta ? naira(meta.grossTotal) : '—' },
          { label: 'Cash', value: meta ? naira(meta.byMethod?.cash) : '—' },
          { label: 'Card', value: meta ? naira(meta.byMethod?.card) : '—' },
          { label: 'Transfer', value: meta ? naira(meta.byMethod?.transfer) : '—' },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-space-sm justify-between">
        <FilterChips<PosSaleStatus | 'all'>
          value={status}
          onChange={(next) => {
            setStatus(next);
            setPage(1);
          }}
          options={[
            { key: 'all', label: 'All' },
            { key: 'completed', label: 'Paid', count: meta?.counts?.completed },
            { key: 'partial_refund', label: 'Part refunded', count: meta?.counts?.partial_refund },
            { key: 'refunded', label: 'Refunded', count: meta?.counts?.refunded },
          ]}
        />
        <div className="flex gap-space-xs">
          <select
            aria-label="Payment method"
            value={method}
            onChange={(e) => {
              setMethod(e.target.value as PosPaymentMethod | '');
              setPage(1);
            }}
            className="h-10 rounded-lg border border-border-subtle bg-surface-canvas px-space-sm font-body-md text-body-md"
          >
            <option value="">All methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Transfer</option>
            <option value="split">Split</option>
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Receipt # or customer"
            aria-label="Search sales"
            className="h-10 w-48 px-space-sm rounded-lg border border-border-subtle bg-surface-canvas font-body-md text-body-md"
          />
        </div>
      </div>
      {sales.isLoading ? (
        <LoadingRows rows={4} label="Loading sales" />
      ) : sales.isError ? (
        <ErrorState title="Could not load sales" error={sales.error} onRetry={() => sales.refetch()} />
      ) : !sales.data?.data.length ? (
        <EmptyState icon="receipt_long" title="No sales here" body="Completed POS sales show up in this ledger." />
      ) : (
        <>
          <ul className="flex flex-col gap-space-xs">
            {sales.data.data.map((sale) => (
              <li key={sale.id}>
                <button type="button" onClick={() => setOpenId(sale.id)} className="w-full text-left rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex items-center gap-space-sm hover:border-primary/40">
                  <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="receipt" className="text-[20px]" />
                  </span>
                  <span className="flex flex-col flex-1 min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                      {sale.receiptNumber} · {personName(sale.customer, sale.customerName ?? 'Walk-in')}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {sale.itemCount ?? (sale.items ?? []).length} items · {METHOD_LABEL[sale.paymentMethod] ?? sale.paymentMethod} · {formatRelativeTime(sale.createdAt)}
                      {sale.cashierName ? ` · ${sale.cashierName}` : ''}
                    </span>
                  </span>
                  <span className="flex flex-col items-end shrink-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">{naira(sale.total)}</span>
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${STATUS_TONE[sale.status] ?? STATUS_TONE.completed}`}>
                      {STATUS_LABEL[sale.status] ?? sale.status}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-9 px-space-sm rounded-lg bg-surface-container font-label-sm text-label-sm disabled:opacity-40">
              Previous
            </button>
            <span className="font-caption text-caption text-text-secondary">
              Page {page}
              {sales.data.total ? ` · ${sales.data.total} sales` : ''}
            </span>
            <button type="button" disabled={!sales.data.hasNextPage} onClick={() => setPage((p) => p + 1)} className="h-9 px-space-sm rounded-lg bg-surface-container font-label-sm text-label-sm disabled:opacity-40">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kitchen
// ---------------------------------------------------------------------------

const KITCHEN_COLUMNS: { key: KitchenStatus; label: string; next?: { status: KitchenStatus; label: string } }[] = [
  { key: 'new', label: 'New', next: { status: 'processing', label: 'Start' } },
  { key: 'processing', label: 'Preparing', next: { status: 'ready', label: 'Ready' } },
  { key: 'ready', label: 'Ready', next: { status: 'completed', label: 'Served' } },
];

/** Live kitchen board: open storefront and table orders moving new → preparing → ready. */
export function PosKitchenPanel() {
  const stream = useKitchenStream();
  const { setKitchenStatus } = usePosMutations();
  if (stream.isLoading) return <LoadingRows rows={3} label="Loading kitchen orders" />;
  if (stream.isError) return <ErrorState title="Could not load kitchen orders" error={stream.error} onRetry={() => stream.refetch()} />;
  const orders = stream.data?.data ?? [];

  return (
    <div className="flex flex-col gap-space-md">
      <span className="font-caption text-caption text-text-secondary">
        Refreshes every 15 seconds
        {stream.data?.averagePrepMinutes ? ` · average prep ${Math.round(stream.data.averagePrepMinutes)} min` : ''}
      </span>
      {setKitchenStatus.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(setKitchenStatus.error)}</span> : null}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-start">
        {KITCHEN_COLUMNS.map((column) => {
          const rows = orders.filter((o) => o.status === column.key);
          return (
            <section key={column.key} className="rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-space-xs min-h-40">
              <h3 className="font-label-md text-label-md text-text-primary font-semibold flex justify-between">
                {column.label} <span className="text-text-secondary">{rows.length}</span>
              </h3>
              {!rows.length ? <span className="font-caption text-caption text-text-tertiary py-space-sm text-center">Nothing here</span> : null}
              {rows.map((order) => (
                <article key={order.id} className="rounded-lg bg-surface-canvas border border-border-subtle p-space-sm flex flex-col gap-1">
                  <span className="flex items-center justify-between gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold">
                      {order.reference}
                      {order.tableNumber ? ` · Table ${order.tableNumber}` : ''}
                    </span>
                    <span className={`font-caption text-[11px] ${(order.elapsedMinutes ?? 0) > 20 ? 'text-red-600 font-semibold' : 'text-text-tertiary'}`}>
                      {order.elapsedMinutes ?? 0} min
                    </span>
                  </span>
                  <ul className="font-body-md text-body-md">
                    {(order.lines ?? []).map((line, i) => (
                      <li key={i}>
                        {line.quantity}× {line.name}
                      </li>
                    ))}
                  </ul>
                  {order.notes ? <span className="font-caption text-caption text-text-secondary">“{order.notes}”</span> : null}
                  <span className="flex items-center justify-between gap-space-xs pt-1">
                    <span className="font-caption text-caption text-text-secondary">
                      {order.guestName ?? 'Guest'} · {order.paid ? 'Paid' : `Unpaid ${naira(order.totalAmount)}`}
                    </span>
                    {column.next ? (
                      <button
                        type="button"
                        disabled={setKitchenStatus.isPending}
                        onClick={() => setKitchenStatus.mutate({ id: order.id, status: column.next!.status })}
                        className="h-8 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm disabled:opacity-50"
                      >
                        {column.next.label}
                      </button>
                    ) : null}
                  </span>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stock
// ---------------------------------------------------------------------------

/** Live stock levels with a quick count adjustment per product. */
export function PosStockPanel() {
  const products = useCatalogueItems('product');
  const { adjustStock } = usePosMutations();
  const [editing, setEditing] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  if (products.isLoading) return <LoadingRows rows={4} label="Loading stock" />;
  if (products.isError) return <ErrorState title="Could not load products" error={products.error} onRetry={() => products.refetch()} />;
  const rows = (products.data ?? []).filter((p) => {
    const stock = p.stockQuantity;
    if (filter === 'out') return stock === 0;
    if (filter === 'low') return stock !== null && stock !== undefined && p.minStock !== null && p.minStock !== undefined && stock <= p.minStock;
    return true;
  });

  return (
    <div className="flex flex-col gap-space-md max-w-4xl">
      <FilterChips<'all' | 'low' | 'out'>
        value={filter}
        onChange={setFilter}
        options={[
          { key: 'all', label: 'All products' },
          { key: 'low', label: 'Low stock' },
          { key: 'out', label: 'Out of stock' },
        ]}
      />
      {!rows.length ? (
        <EmptyState icon="inventory_2" title="Nothing here" body="Products with tracked stock show up in this list." />
      ) : (
        <ul className="flex flex-col gap-space-xs">
          {rows.map((p) => {
            const stock = p.stockQuantity;
            const low = stock !== null && stock !== undefined && p.minStock !== null && p.minStock !== undefined && stock <= p.minStock;
            return (
              <li key={p.id} className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="flex flex-col flex-1 min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{p.name}</span>
                    <span className="font-caption text-caption text-text-secondary">{[p.sku, p.category?.name].filter(Boolean).join(' · ') || '—'}</span>
                  </span>
                  <span className={`font-label-md text-label-md font-semibold shrink-0 ${stock === 0 || low ? 'text-red-600' : 'text-text-primary'}`}>
                    {stock === null || stock === undefined ? 'Not tracked' : `${stock} in stock`}
                  </span>
                  {editing !== p.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p.id);
                        setQuantity(stock === null || stock === undefined ? '' : String(stock));
                        setReason('');
                      }}
                      className="h-9 px-space-sm rounded-lg bg-surface-container font-label-sm text-label-sm shrink-0"
                    >
                      Count
                    </button>
                  ) : null}
                </div>
                {editing === p.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-space-xs items-end">
                    <TextField id={`stock-${p.id}`} label="Units on hand" inputMode="numeric" value={quantity} onChange={setQuantity} />
                    <TextField id={`reason-${p.id}`} label="Reason" value={reason} onChange={setReason} placeholder="Stock count, delivery, damage…" />
                    <span className="flex gap-space-xs">
                      <button type="button" onClick={() => setEditing(null)} className="h-11 px-space-sm rounded-lg bg-surface-container font-label-md text-label-md">
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={adjustStock.isPending || quantity === ''}
                        onClick={() =>
                          adjustStock.mutate(
                            { productId: p.id, quantity: Math.max(0, Math.round(Number(quantity) || 0)), reason: reason.trim() || undefined },
                            { onSuccess: () => setEditing(null) },
                          )
                        }
                        className="h-11 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
                      >
                        Save
                      </button>
                    </span>
                    {adjustStock.isError ? <span className="font-caption text-caption text-red-600 sm:col-span-3">{apiErrorMessage(adjustStock.error)}</span> : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Staff PINs
// ---------------------------------------------------------------------------

/** Who can sign in to the till, and who can approve voids and refunds. */
export function PosStaffPinsPanel() {
  const pins = useStaffPins();
  const { setStaffPin, removeStaffPin } = usePosMutations();
  const [editing, setEditing] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [supervisor, setSupervisor] = useState(false);
  const error = setStaffPin.error ?? removeStaffPin.error;

  return (
    <SettingsSection title="Staff PINs" icon="pin">
      <span className="font-caption text-caption text-text-secondary">Each cashier unlocks the till with their own PIN. Supervisors can approve voids, refunds and big discounts.</span>
      {pins.isLoading ? (
        <LoadingRows rows={2} label="Loading staff" />
      ) : pins.isError ? (
        <ErrorState title="Could not load staff PINs" error={pins.error} onRetry={() => pins.refetch()} />
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {(pins.data ?? []).map((row) => (
            <li key={row.userId} className="py-space-xs flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{row.name ?? 'Staff member'}</span>
                  <span className="font-caption text-caption text-text-secondary">
                    {[row.role, row.hasPin ? 'PIN set' : 'No PIN', row.isSupervisor ? 'Supervisor' : null, row.lockedUntil ? `Locked until ${new Date(row.lockedUntil).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(row.userId);
                    setPin('');
                    setSupervisor(Boolean(row.isSupervisor));
                  }}
                  className="h-9 px-space-sm rounded-lg bg-surface-container font-label-sm text-label-sm"
                >
                  {row.hasPin ? 'Change' : 'Set PIN'}
                </button>
                {row.hasPin ? (
                  <button type="button" onClick={() => removeStaffPin.mutate(row.userId)} aria-label={`Remove ${row.name}'s PIN`} className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-600">
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                ) : null}
              </div>
              {editing === row.userId ? (
                <div className="flex flex-col gap-space-xs rounded-lg border border-border-subtle p-space-sm">
                  <TextField id={`pin-${row.userId}`} label="New PIN (4–6 digits)" type="password" inputMode="numeric" value={pin} onChange={(v) => setPin(v.replace(/\D/g, '').slice(0, 6))} />
                  <SwitchRow title="Supervisor" body="Can approve voids, refunds and overrides." checked={supervisor} onChange={setSupervisor} />
                  <div className="flex gap-space-xs justify-end">
                    <button type="button" onClick={() => setEditing(null)} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={pin.length < 4 || setStaffPin.isPending}
                      onClick={() => setStaffPin.mutate({ userId: row.userId, pin, isSupervisor: supervisor }, { onSuccess: () => setEditing(null) })}
                      className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
                    >
                      Save PIN
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {error ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(error)}</span> : null}
    </SettingsSection>
  );
}
