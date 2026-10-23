import { money, personName, type PosSale } from '../../services/posService';
import { formatNaira } from '../../utils/format';
import { printReport } from '../../utils/printReport';

const naira = (value?: number | string | null) => formatNaira(money(value));
const METHOD_LABEL: Record<string, string> = { cash: 'Cash', card: 'Card', transfer: 'Bank transfer', split: 'Split' };
const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

const totalsRows = (sale: PosSale): [string, string][] =>
  [
    ['Subtotal', naira(sale.subtotal)],
    money(sale.discountAmount) ? ['Discount', `−${naira(sale.discountAmount)}`] : null,
    money(sale.tax) ? [sale.receipt?.taxLabel || 'Tax', naira(sale.tax)] : null,
    money(sale.serviceCharge) ? ['Service charge', naira(sale.serviceCharge)] : null,
    money(sale.packagingFee) ? ['Packaging', naira(sale.packagingFee)] : null,
    money(sale.tipAmount) ? ['Tip', naira(sale.tipAmount)] : null,
  ].filter(Boolean) as [string, string][];

/** Opens the browser print dialog with a till-style receipt. */
export function printSaleReceipt(sale: PosSale) {
  const r = sale.receipt;
  const lines = (sale.items ?? [])
    .map((i) => `<tr><td>${i.quantity}× ${escape(i.productName ?? 'Item')}</td><td style="text-align:right">${naira(i.totalPrice)}</td></tr>`)
    .join('');
  const totals = totalsRows(sale)
    .map(([k, v]) => `<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`)
    .join('');
  printReport(
    `Receipt ${sale.receiptNumber}`,
    `<div style="max-width:300px;margin:0 auto;font-family:monospace;font-size:12px">
      <h2 style="text-align:center;margin:0">${escape(r?.businessName ?? sale.branch?.name ?? 'Receipt')}</h2>
      ${r?.header ? `<p style="text-align:center">${escape(r.header)}</p>` : ''}
      <p style="text-align:center">${escape([r?.address ?? sale.branch?.address, r?.phone].filter(Boolean).join(' · '))}</p>
      <p>${escape(sale.receiptNumber)} · ${sale.createdAt ? new Date(sale.createdAt).toLocaleString('en-NG') : ''}</p>
      <table style="width:100%">${lines}</table><hr/>
      <table style="width:100%">${totals}
        <tr><td><b>Total</b></td><td style="text-align:right"><b>${naira(sale.total)}</b></td></tr>
        <tr><td>Paid (${METHOD_LABEL[sale.paymentMethod] ?? sale.paymentMethod})</td><td style="text-align:right">${naira(sale.amountPaid)}</td></tr>
        ${money(sale.change) ? `<tr><td>Change</td><td style="text-align:right">${naira(sale.change)}</td></tr>` : ''}
      </table>
      ${r?.tin ? `<p>TIN ${escape(r.tin)}</p>` : ''}
      ${r?.footer ? `<p style="text-align:center">${escape(r.footer)}</p>` : ''}
    </div>`,
  );
}

/** On-screen receipt for a completed (or refunded) sale. */
export function PosReceipt({ sale }: { sale: PosSale }) {
  return (
    <div className="rounded-xl bg-surface-canvas border border-border-subtle p-space-md flex flex-col gap-space-sm font-body-md text-body-md">
      <div className="flex flex-col items-center text-center">
        <span className="font-heading-sm text-heading-sm text-text-primary">{sale.receipt?.businessName ?? sale.branch?.name ?? 'Receipt'}</span>
        <span className="font-caption text-caption text-text-secondary">
          {sale.receiptNumber} · {sale.createdAt ? new Date(sale.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
        </span>
        <span className="font-caption text-caption text-text-secondary">
          {[sale.cashierName ? `Served by ${sale.cashierName}` : null, sale.customer || sale.customerName ? personName(sale.customer, sale.customerName ?? undefined) : null]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      <ul className="flex flex-col gap-1 border-y border-dashed border-border-subtle py-space-xs">
        {(sale.items ?? []).map((item) => (
          <li key={item.id} className="flex justify-between gap-space-sm">
            <span className="min-w-0">
              {item.quantity}× {item.productName ?? 'Item'}
              {item.refundedQuantity ? <span className="text-red-600 font-caption text-caption"> · {item.refundedQuantity} refunded</span> : null}
            </span>
            <span className="shrink-0">{naira(item.totalPrice)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-0.5">
        {totalsRows(sale).map(([label, value]) => (
          <span key={label} className="flex justify-between text-text-secondary">
            <span>{label}</span>
            <span>{value}</span>
          </span>
        ))}
        <span className="flex justify-between font-semibold text-text-primary text-[18px] pt-1">
          <span>Total</span>
          <span>{naira(sale.total)}</span>
        </span>
        <span className="flex justify-between text-text-secondary">
          <span>Paid · {METHOD_LABEL[sale.paymentMethod] ?? sale.paymentMethod}</span>
          <span>{naira(sale.amountPaid)}</span>
        </span>
        {money(sale.change) ? (
          <span className="flex justify-between text-text-secondary">
            <span>Change</span>
            <span>{naira(sale.change)}</span>
          </span>
        ) : null}
        {(sale.splitPayments ?? []).map((s, i) => (
          <span key={i} className="flex justify-between font-caption text-caption text-text-tertiary">
            <span>· {METHOD_LABEL[s.method] ?? s.method}</span>
            <span>{naira(s.amount)}</span>
          </span>
        ))}
        {sale.pointsEarned ? <span className="font-caption text-caption text-badge-discount-text pt-1">+{sale.pointsEarned} loyalty points earned</span> : null}
      </div>
    </div>
  );
}
