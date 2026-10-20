import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { PosReceipt, printSaleReceipt } from './PosReceipt';
import { useCatalogueItems } from '../../hooks/business/useCatalogueItems';
import { usePosCustomers, usePosMutations, useRegisterStatus } from '../../hooks/business/usePos';
import { ticketCount, ticketStore, ticketSubtotal, usePosTicket, type Ticket } from '../../hooks/business/usePosTicket';
import { usePosOffline } from '../../context/PosOfflineContext';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { money, personName, posService, type NewSaleInput, type PosPaymentMethod, type PosSale } from '../../services/posService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatNaira } from '../../utils/format';

const naira = (value?: number | string | null) => formatNaira(money(value));
const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23eef2ff'/></svg>";

/** A sale that never reached the server (offline or network failure). */
const isNetworkError = (error: unknown) => error instanceof TypeError || (typeof navigator !== 'undefined' && navigator.onLine === false);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

function ProductGrid({ items, ticket }: { items: CatalogueItem[]; ticket: Ticket }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category?.name).filter(Boolean) as string[])).sort(), [items]);
  const q = search.trim().toLowerCase();
  const visible = items.filter(
    (i) => (category === 'all' || i.category?.name === category) && (!q || `${i.name} ${i.sku ?? ''}`.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-space-sm min-w-0">
      <label className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products or SKU"
          aria-label="Search products"
          className="w-full h-11 pl-9 pr-space-sm rounded-lg bg-surface-canvas border border-border-subtle font-body-md text-body-md"
        />
      </label>
      {categories.length ? (
        <div className="overflow-x-auto -mx-1 px-1">
          <FilterChips<string> value={category} onChange={setCategory} options={[{ key: 'all', label: 'All' }, ...categories.map((c) => ({ key: c, label: c }))]} />
        </div>
      ) : null}
      {!visible.length ? (
        <EmptyState icon="inventory_2" title={items.length ? 'No matching products' : 'Nothing to sell yet'} body={items.length ? 'Try another search.' : 'Add live products or services to your catalogue first.'} />
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-space-xs">
          {visible.map((item) => {
            const price = toPrice(item.price ?? undefined) ?? 0;
            const stock = item.itemType === 'service' ? null : item.stockQuantity ?? null;
            const inTicket = ticket.lines.find((l) => l.productId === item.id)?.quantity ?? 0;
            const soldOut = stock !== null && stock - inTicket <= 0;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => ticketStore.addLine({ productId: item.id, name: item.name, unitPrice: price, stock })}
                  className={`relative w-full text-left rounded-xl border bg-surface-canvas overflow-hidden flex flex-col transition-colors disabled:opacity-50 ${
                    inTicket ? 'border-primary' : 'border-border-subtle hover:border-primary/40'
                  }`}
                >
                  <img src={item.mainImage || PLACEHOLDER} alt="" className="w-full aspect-[4/3] object-cover bg-surface-subtle" />
                  {inTicket ? (
                    <span className="absolute top-1.5 right-1.5 min-w-6 h-6 px-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center justify-center">
                      {inTicket}
                    </span>
                  ) : null}
                  <span className="p-space-xs flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold line-clamp-2">{item.name}</span>
                    <span className="flex items-center justify-between gap-1">
                      <span className="font-label-md text-label-md text-primary">{formatNaira(price)}</span>
                      <span className={`font-caption text-[11px] ${soldOut ? 'text-red-600' : 'text-text-tertiary'}`}>
                        {stock === null ? (item.itemType === 'service' ? 'Service' : '') : soldOut ? 'Sold out' : `${stock - inTicket} left`}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ticket
// ---------------------------------------------------------------------------

function CustomerPicker({ ticket }: { ticket: Ticket }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);
  const customers = usePosCustomers(open ? debounced : '__closed__');

  if (ticket.customer) {
    return (
      <div className="flex items-center justify-between gap-space-xs rounded-lg bg-surface-tint-blue px-space-sm py-space-xs">
        <span className="inline-flex items-center gap-1 font-label-md text-label-md text-primary min-w-0">
          <Icon name="person" className="text-[18px]" />
          <span className="truncate">{ticket.customer.name}</span>
        </span>
        <button type="button" onClick={() => ticketStore.patch({ customer: null })} aria-label="Remove customer" className="text-text-tertiary hover:text-red-600">
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-10 rounded-lg border border-dashed border-border-subtle font-label-md text-label-md text-text-secondary inline-flex items-center justify-center gap-1 hover:border-primary/40">
        <Icon name="person_add" className="text-[18px]" /> Add customer for loyalty points
      </button>
    );
  }
  return (
    <div className="rounded-lg border border-border-subtle p-space-xs flex flex-col gap-space-xs">
      <input
        autoFocus
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Name, phone or email"
        aria-label="Find customer"
        className="h-10 px-space-sm rounded-lg bg-surface-subtle font-body-md text-body-md"
      />
      {customers.isLoading ? (
        <span className="font-caption text-caption text-text-secondary px-1">Searching…</span>
      ) : !customers.data?.length ? (
        <span className="font-caption text-caption text-text-secondary px-1">No customers found.</span>
      ) : (
        <ul className="flex flex-col max-h-48 overflow-y-auto">
          {customers.data.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  ticketStore.patch({ customer: { id: c.id, name: personName(c) } });
                  setOpen(false);
                  setSearch('');
                }}
                className="w-full text-left px-space-xs py-1.5 rounded-md hover:bg-surface-subtle flex justify-between gap-space-xs"
              >
                <span className="font-label-md text-label-md text-text-primary truncate">{personName(c)}</span>
                <span className="font-caption text-caption text-text-tertiary shrink-0">{c.pointsBalance ?? 0} pts</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => setOpen(false)} className="self-end font-label-sm text-label-sm text-text-secondary">
        Cancel
      </button>
    </div>
  );
}

/** Server totals for the ticket, refreshed shortly after it stops changing. */
function useTicketQuote(ticket: Ticket) {
  const key = JSON.stringify({ l: ticket.lines.map((l) => [l.productId, l.quantity, l.unitPrice]), d: ticket.cartDiscount, o: ticket.orderType });
  const [debounced, setDebounced] = useState(key);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(key), 350);
    return () => window.clearTimeout(id);
  }, [key]);
  return useQuery({
    queryKey: ['pos', 'quote', debounced],
    queryFn: () =>
      posService.quote({
        lines: ticket.lines.map((l) => ({ id: l.productId, name: l.name, quantity: l.quantity, unitPrice: l.unitPrice })),
        discountAmount: ticket.cartDiscount || undefined,
        orderType: ticket.orderType,
      }),
    enabled: ticket.lines.length > 0 && debounced === key,
    placeholderData: (prev) => prev,
    retry: false,
  });
}

function TicketPanel({ ticket, total, quoteError, onCharge }: { ticket: Ticket; total: number; quoteError: boolean; onCharge: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const { holdSale } = usePosMutations();
  const quote = useTicketQuote(ticket);
  const q = quote.data;
  const subtotal = ticketSubtotal(ticket);

  const hold = () => {
    if (!activeBranchId) return;
    holdSale.mutate(
      {
        branchId: activeBranchId,
        customerId: ticket.customer?.id,
        note: ticket.note || undefined,
        discountAmount: ticket.cartDiscount || undefined,
        orderType: ticket.orderType,
        items: ticket.lines.map((l) => ({ productId: l.productId, productName: l.name, unitPrice: l.unitPrice, quantity: l.quantity, totalPrice: l.unitPrice * l.quantity })),
      },
      { onSuccess: () => ticketStore.clear() },
    );
  };

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-heading-sm text-heading-sm text-text-primary">Current sale</h2>
        <div role="radiogroup" aria-label="Order type" className="flex gap-1 p-1 rounded-lg bg-surface-container-low">
          {(['dine_in', 'takeaway'] as const).map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={ticket.orderType === type}
              onClick={() => ticketStore.patch({ orderType: type })}
              className={`h-8 px-space-sm rounded-md font-label-sm text-label-sm ${ticket.orderType === type ? 'bg-surface-canvas text-primary shadow-sm font-semibold' : 'text-text-secondary'}`}
            >
              {type === 'dine_in' ? 'Dine-in' : 'Takeaway'}
            </button>
          ))}
        </div>
      </div>
      <CustomerPicker ticket={ticket} />
      {!ticket.lines.length ? (
        <p className="font-caption text-caption text-text-secondary text-center py-space-lg">Tap products to add them to the sale.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {ticket.lines.map((line) => {
            const atLimit = line.stock !== null && line.quantity >= line.stock;
            return (
              <li key={line.productId} className="py-space-xs flex items-center gap-space-xs">
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate">{line.name}</span>
                  <span className="font-caption text-caption text-text-secondary">{formatNaira(line.unitPrice)} each</span>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <button type="button" aria-label={`Fewer ${line.name}`} onClick={() => ticketStore.setQuantity(line.productId, line.quantity - 1)} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                    <Icon name={line.quantity === 1 ? 'delete' : 'remove'} className="text-[16px]" />
                  </button>
                  <span className="w-7 text-center font-label-md text-label-md">{line.quantity}</span>
                  <button type="button" aria-label={`More ${line.name}`} disabled={atLimit} onClick={() => ticketStore.setQuantity(line.productId, line.quantity + 1)} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center disabled:opacity-40">
                    <Icon name="add" className="text-[16px]" />
                  </button>
                </span>
                <span className="w-20 text-right font-label-md text-label-md text-text-primary shrink-0">{formatNaira(line.unitPrice * line.quantity)}</span>
              </li>
            );
          })}
        </ul>
      )}
      {ticket.lines.length ? (
        <>
          <div className="grid grid-cols-2 gap-space-xs">
            <label className="flex flex-col gap-1">
              <span className="font-caption text-caption text-text-secondary">Discount (₦)</span>
              <input
                inputMode="numeric"
                value={ticket.cartDiscount ? String(ticket.cartDiscount) : ''}
                onChange={(e) => ticketStore.patch({ cartDiscount: Math.min(subtotal, Number(e.target.value.replace(/[^0-9]/g, '')) || 0) })}
                placeholder="0"
                className="h-10 px-space-sm rounded-lg border border-border-subtle bg-surface-canvas font-body-md text-body-md"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-caption text-caption text-text-secondary">Note</span>
              <input
                value={ticket.note}
                onChange={(e) => ticketStore.patch({ note: e.target.value.slice(0, 200) })}
                placeholder="Table 4, no onions…"
                className="h-10 px-space-sm rounded-lg border border-border-subtle bg-surface-canvas font-body-md text-body-md"
              />
            </label>
          </div>
          <div className="flex flex-col gap-0.5 font-body-md text-body-md">
            <span className="flex justify-between text-text-secondary">
              <span>Subtotal · {ticketCount(ticket)} items</span>
              <span>{naira(q?.subtotal ?? subtotal)}</span>
            </span>
            {money(q?.discountAmount ?? ticket.cartDiscount) ? (
              <span className="flex justify-between text-text-secondary">
                <span>Discount</span>
                <span>−{naira(q?.discountAmount ?? ticket.cartDiscount)}</span>
              </span>
            ) : null}
            {money(q?.tax) ? (
              <span className="flex justify-between text-text-secondary">
                <span>Tax</span>
                <span>{naira(q?.tax)}</span>
              </span>
            ) : null}
            {money(q?.serviceCharge) ? (
              <span className="flex justify-between text-text-secondary">
                <span>Service charge</span>
                <span>{naira(q?.serviceCharge)}</span>
              </span>
            ) : null}
            {money(q?.packagingFee) ? (
              <span className="flex justify-between text-text-secondary">
                <span>Packaging</span>
                <span>{naira(q?.packagingFee)}</span>
              </span>
            ) : null}
            <span className="flex justify-between font-semibold text-text-primary text-[18px] pt-1">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </span>
            {quoteError ? <span className="font-caption text-caption text-text-tertiary">Taxes and charges are confirmed at payment.</span> : null}
          </div>
          {holdSale.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(holdSale.error)}</span> : null}
          <div className="grid grid-cols-[auto_auto_1fr] gap-space-xs">
            <button type="button" onClick={() => ticketStore.clear()} className="h-12 px-space-sm rounded-xl bg-surface-container font-label-md text-label-md">
              Clear
            </button>
            <button type="button" disabled={holdSale.isPending} onClick={hold} className="h-12 px-space-sm rounded-xl bg-surface-container font-label-md text-label-md disabled:opacity-50">
              {holdSale.isPending ? 'Holding…' : 'Hold'}
            </button>
            <button type="button" onClick={onCharge} className="h-12 rounded-xl bg-primary-container text-on-primary font-heading-sm text-[16px] font-semibold">
              Charge {formatNaira(total)}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

const METHODS: { key: PosPaymentMethod; label: string; icon: string }[] = [
  { key: 'cash', label: 'Cash', icon: 'payments' },
  { key: 'card', label: 'Card', icon: 'credit_card' },
  { key: 'transfer', label: 'Transfer', icon: 'account_balance' },
  { key: 'split', label: 'Split', icon: 'call_split' },
];

/** Round-up notes a customer is likely to hand over for a cash total. */
const cashSuggestions = (total: number) => {
  const ups = [500, 1000, 5000].map((step) => Math.ceil(total / step) * step);
  return Array.from(new Set([total, ...ups])).filter((v) => v >= total).slice(0, 4);
};

function PaymentStep({ ticket, total, onBack, onDone }: { ticket: Ticket; total: number; onBack: () => void; onDone: (sale: PosSale | null) => void }) {
  const { activeBranchId } = useBusinessBranch();
  const { completeSale, deleteHeldSale } = usePosMutations();
  const offline = usePosOffline();
  const [method, setMethod] = useState<PosPaymentMethod>('cash');
  const [tendered, setTendered] = useState(String(Math.ceil(total)));
  const [split, setSplit] = useState<{ method: Exclude<PosPaymentMethod, 'split'>; amount: string }[]>([
    { method: 'cash', amount: String(Math.ceil(total / 2)) },
    { method: 'card', amount: String(total - Math.ceil(total / 2)) },
  ]);
  const [error, setError] = useState<string | null>(null);

  const cash = Number(tendered.replace(/[^0-9.]/g, '')) || 0;
  const splitSum = split.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const change = method === 'cash' ? Math.max(0, cash - total) : 0;
  const shortBy = method === 'cash' ? total - cash : method === 'split' ? total - splitSum : 0;
  const canPay = shortBy <= 0.009 && (method !== 'split' || Math.abs(splitSum - total) < 0.01);

  const pay = () => {
    if (!activeBranchId) return setError('Choose a branch first.');
    setError(null);
    const amountPaid = method === 'cash' ? cash : total;
    const body: NewSaleInput = {
      branchId: activeBranchId,
      items: ticket.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      payment: {
        method,
        amountPaid,
        change: method === 'cash' ? change : undefined,
        splitDetails: method === 'split' ? split.map((p) => ({ method: p.method, amount: Number(p.amount) || 0 })) : undefined,
      },
      cartDiscountAmount: ticket.cartDiscount || undefined,
      customerId: ticket.customer?.id,
      notes: ticket.note || undefined,
      orderType: ticket.orderType,
      clientRef: crypto.randomUUID(),
      orderedAt: new Date().toISOString(),
    };
    completeSale.mutate(body, {
      onSuccess: (sale) => {
        if (ticket.heldSaleId) deleteHeldSale.mutate(ticket.heldSaleId);
        onDone(sale);
      },
      onError: (e) => {
        if (isNetworkError(e)) {
          // Keep selling through an outage: the sale syncs when we're back online.
          offline.enqueue({
            ref: `OFF-${body.clientRef!.slice(0, 6).toUpperCase()}`,
            total,
            tender: METHODS.find((m) => m.key === method)?.label ?? method,
            items: ticket.lines.map((l) => `${l.quantity}× ${l.name}`).join(', '),
            payload: body,
          });
          onDone(null);
        } else setError(apiErrorMessage(e, 'Could not complete the sale.'));
      },
    });
  };

  return (
    <div className="flex flex-col gap-space-md max-w-xl mx-auto w-full">
      <button type="button" onClick={onBack} className="self-start inline-flex items-center gap-1 font-label-md text-label-md text-primary">
        <Icon name="arrow_back" className="text-[18px]" /> Back to sale
      </button>
      <div className="rounded-xl bg-surface-tint-blue p-space-md flex flex-col items-center">
        <span className="font-label-md text-label-md text-text-secondary">Amount due</span>
        <span className="font-heading-lg text-[34px] font-bold text-text-primary">{formatNaira(total)}</span>
        <span className="font-caption text-caption text-text-secondary">
          {ticketCount(ticket)} items{ticket.customer ? ` · ${ticket.customer.name}` : ''}
        </span>
      </div>
      <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-4 gap-space-xs">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            role="radio"
            aria-checked={method === m.key}
            onClick={() => setMethod(m.key)}
            className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-0.5 font-label-md text-label-md ${
              method === m.key ? 'bg-surface-tint-blue border-primary text-primary' : 'bg-surface-canvas border-border-subtle text-text-primary'
            }`}
          >
            <Icon name={m.icon} className="text-[22px]" />
            {m.label}
          </button>
        ))}
      </div>
      {method === 'cash' ? (
        <div className="flex flex-col gap-space-xs">
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-text-primary">Cash received (₦)</span>
            <input
              inputMode="decimal"
              value={tendered}
              onChange={(e) => setTendered(e.target.value)}
              className="h-12 px-space-sm rounded-lg border border-border-subtle bg-surface-canvas font-heading-sm text-heading-sm"
            />
          </label>
          <div className="flex flex-wrap gap-space-xs">
            {cashSuggestions(total).map((amount) => (
              <button key={amount} type="button" onClick={() => setTendered(String(amount))} className="h-9 px-space-sm rounded-lg bg-surface-container font-label-md text-label-md">
                {amount === total ? 'Exact' : formatNaira(amount)}
              </button>
            ))}
          </div>
          <span className={`font-heading-sm text-heading-sm ${shortBy > 0 ? 'text-red-600' : 'text-badge-discount-text'}`}>
            {shortBy > 0 ? `${formatNaira(shortBy)} short` : `Change ${formatNaira(change)}`}
          </span>
        </div>
      ) : method === 'split' ? (
        <div className="flex flex-col gap-space-xs">
          {split.map((part, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr] gap-space-xs">
              <select
                value={part.method}
                onChange={(e) => setSplit((prev) => prev.map((p, i) => (i === index ? { ...p, method: e.target.value as typeof p.method } : p)))}
                aria-label={`Payment ${index + 1} method`}
                className="h-11 rounded-lg border border-border-subtle bg-surface-canvas px-space-sm font-body-md text-body-md"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
              <input
                inputMode="decimal"
                aria-label={`Payment ${index + 1} amount`}
                value={part.amount}
                onChange={(e) => setSplit((prev) => prev.map((p, i) => (i === index ? { ...p, amount: e.target.value } : p)))}
                className="h-11 px-space-sm rounded-lg border border-border-subtle bg-surface-canvas font-body-md text-body-md"
              />
            </div>
          ))}
          <span className={`font-caption text-caption ${Math.abs(splitSum - total) < 0.01 ? 'text-badge-discount-text' : 'text-red-600'}`}>
            {formatNaira(splitSum)} of {formatNaira(total)}
            {Math.abs(splitSum - total) >= 0.01 ? ` · ${splitSum > total ? 'over' : 'short'} by ${formatNaira(Math.abs(total - splitSum))}` : ' · balanced'}
          </span>
        </div>
      ) : (
        <p className="font-body-md text-body-md text-text-secondary">
          {method === 'card' ? 'Take the card payment on your terminal, then confirm here.' : 'Confirm once the transfer shows in your account.'}
        </p>
      )}
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
          {error}
        </p>
      ) : null}
      {!offline.isOnline ? <span className="font-caption text-caption text-text-secondary">You're offline — this sale will be saved and synced automatically.</span> : null}
      <button
        type="button"
        disabled={!canPay || completeSale.isPending}
        onClick={pay}
        className="h-14 rounded-xl bg-primary-container text-on-primary font-heading-sm text-[17px] font-semibold disabled:opacity-50"
      >
        {completeSale.isPending ? 'Completing…' : `Complete sale · ${formatNaira(total)}`}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

/** Live POS register: ring up a ticket from the branch catalogue, take payment, print the receipt. */
export function PosRegisterPanel({ onOpenHome }: { onOpenHome: () => void }) {
  const ticket = usePosTicket();
  const products = useCatalogueItems('product');
  const services = useCatalogueItems('service');
  const register = useRegisterStatus();
  const quote = useTicketQuote(ticket);
  const [step, setStep] = useState<'sell' | 'pay' | 'done'>('sell');
  const [sale, setSale] = useState<PosSale | null>(null);
  const [mobileTicket, setMobileTicket] = useState(false);

  const items = useMemo(
    () => [...(products.data ?? []), ...(services.data ?? [])].filter((i) => i.status === 'active' || i.status === 'published'),
    [products.data, services.data],
  );
  const subtotal = ticketSubtotal(ticket);
  // The server's total when we have it for this exact ticket; otherwise our own estimate.
  const total = quote.data && !quote.isPlaceholderData ? money(quote.data.total) : Math.max(0, subtotal - ticket.cartDiscount);

  if (step === 'pay') {
    return (
      <PaymentStep
        ticket={ticket}
        total={total}
        onBack={() => setStep('sell')}
        onDone={(done) => {
          setSale(done);
          ticketStore.clear();
          setStep('done');
        }}
      />
    );
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col gap-space-md max-w-md mx-auto w-full">
        <div className="flex flex-col items-center text-center gap-1">
          <span className="w-14 h-14 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
            <Icon name={sale ? 'check' : 'cloud_off'} className="text-[30px]" />
          </span>
          <span className="font-heading-md text-heading-md text-text-primary">{sale ? 'Sale complete' : 'Saved offline'}</span>
          {!sale ? <span className="font-body-md text-body-md text-text-secondary">It will sync to your account as soon as you're back online.</span> : null}
        </div>
        {sale ? <PosReceipt sale={sale} /> : null}
        <div className="grid grid-cols-2 gap-space-xs">
          {sale ? (
            <button type="button" onClick={() => printSaleReceipt(sale)} className="h-12 rounded-xl bg-surface-container font-label-md text-label-md inline-flex items-center justify-center gap-1">
              <Icon name="print" className="text-[18px]" /> Print receipt
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => {
              setSale(null);
              setStep('sell');
            }}
            className="h-12 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md"
          >
            New sale
          </button>
        </div>
      </div>
    );
  }

  const ticketView = (
    <TicketPanel
      ticket={ticket}
      total={total}
      quoteError={quote.isError}
      onCharge={() => {
        setMobileTicket(false);
        setStep('pay');
      }}
    />
  );

  return (
    <div className="flex flex-col gap-space-sm">
      {register.data && !register.data.isOpen ? (
        <div className="rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant px-space-sm py-space-xs flex flex-wrap items-center justify-between gap-space-xs font-label-sm text-label-sm">
          <span>No register is open — sales won't count towards a shift.</span>
          <button type="button" onClick={onOpenHome} className="underline font-semibold">
            Open register
          </button>
        </div>
      ) : null}
      {products.isLoading || services.isLoading ? (
        <LoadingRows rows={4} label="Loading products" />
      ) : products.isError ? (
        <ErrorState title="Could not load products" error={products.error} onRetry={() => products.refetch()} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-space-md items-start">
          <div className={mobileTicket ? 'hidden lg:block' : ''}>
            <ProductGrid items={items} ticket={ticket} />
          </div>
          <aside className={`${mobileTicket ? '' : 'hidden'} lg:block lg:sticky lg:top-24 rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md`}>
            {mobileTicket ? (
              <button type="button" onClick={() => setMobileTicket(false)} className="lg:hidden mb-space-xs inline-flex items-center gap-1 font-label-md text-label-md text-primary">
                <Icon name="arrow_back" className="text-[18px]" /> Products
              </button>
            ) : null}
            {ticketView}
          </aside>
        </div>
      )}
      {!mobileTicket && ticket.lines.length ? (
        <button
          type="button"
          onClick={() => setMobileTicket(true)}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] h-14 rounded-xl bg-primary-container text-on-primary shadow-lg px-space-md flex items-center justify-between font-label-md text-label-md z-40"
        >
          <span>View sale · {ticketCount(ticket)} items</span>
          <span className="font-semibold">{formatNaira(total)}</span>
        </button>
      ) : null}
    </div>
  );
}
