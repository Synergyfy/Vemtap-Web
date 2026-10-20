import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, LoadingRows } from './QueryStates';
import { SettingsSection, TextField } from './FormPrimitives';
import { useHeldSales, usePosBranchSummary, usePosMutations, usePosTills, useRegisterStatus, useZReport } from '../../hooks/business/usePos';
import { ticketStore } from '../../hooks/business/usePosTicket';
import { usePosOffline } from '../../context/PosOfflineContext';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { money, personName, type HeldSale, type ZReport } from '../../services/posService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatNaira, formatRelativeTime } from '../../utils/format';

const naira = (value?: number | string | null) => formatNaira(money(value));
const amount = (value: string) => Number(value.replace(/[^0-9.]/g, '')) || 0;
const clock = (iso?: string | null) => (iso ? new Date(iso).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }) : '—');

function ZReportCard({ report }: { report: ZReport }) {
  const variance = report.variance === null || report.variance === undefined ? null : money(report.variance);
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-subtle p-space-sm flex flex-col gap-1 font-body-md text-body-md">
      <span className="font-label-md text-label-md text-text-primary font-semibold">
        Last shift · {new Date(report.openedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} {clock(report.openedAt)} – {clock(report.closedAt)}
      </span>
      {[
        ['Opening cash', naira(report.openingCash)],
        ['Sales', `${naira(report.totalSales)} · ${report.transactionCount ?? 0} sales`],
        ['Cash sales', naira(report.cashSales)],
        ['Cash drops', `−${naira(report.cashDrops)}`],
        ['Expected in drawer', naira(report.expectedCash)],
        ['Counted', report.countedCash === null || report.countedCash === undefined ? '—' : naira(report.countedCash)],
        ...Object.entries(report.paymentBreakdown ?? {}).map(([method, value]) => [`· ${method}`, naira(value)]),
      ].map(([label, value]) => (
        <span key={label} className="flex justify-between text-text-secondary">
          <span className="capitalize">{label}</span>
          <span>{value}</span>
        </span>
      ))}
      {variance !== null ? (
        <span className={`flex justify-between font-semibold ${variance === 0 ? 'text-badge-discount-text' : 'text-red-600'}`}>
          <span>Variance</span>
          <span>
            {variance > 0 ? '+' : ''}
            {formatNaira(variance)}
          </span>
        </span>
      ) : null}
    </div>
  );
}

function RegisterCard() {
  const { activeBranchId } = useBusinessBranch();
  const register = useRegisterStatus();
  const tills = usePosTills();
  const { openRegister, closeRegister, cashDrop, createTill } = usePosMutations();
  const [tillId, setTillId] = useState('');
  const [openingCash, setOpeningCash] = useState('');
  const [mode, setMode] = useState<'idle' | 'drop' | 'close'>('idle');
  const [dropAmount, setDropAmount] = useState('');
  const [dropReason, setDropReason] = useState('');
  const [counted, setCounted] = useState('');
  const isClosed = register.data ? !register.data.isOpen : false;
  // When closed, the backend's Z-report is the most recent shift.
  const zReport = useZReport(isClosed);
  const error = openRegister.error ?? closeRegister.error ?? cashDrop.error ?? createTill.error;
  const session = register.data?.session;

  if (register.isLoading) return <LoadingRows rows={2} label="Loading register" />;
  if (register.isError) return <ErrorState title="Could not load the register" error={register.error} onRetry={() => register.refetch()} />;

  if (!register.data?.isOpen || !session) {
    const tillList = tills.data ?? [];
    return (
      <SettingsSection title="Register closed" icon="point_of_sale">
        {zReport.data?.closedAt ? <ZReportCard report={zReport.data} /> : null}
        <p className="font-body-md text-body-md text-text-secondary">Open the register to start a shift. Sales then count towards it and the cash drawer.</p>
        {tillList.length ? (
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-text-primary">Till</span>
            <select
              value={tillId}
              onChange={(e) => setTillId(e.target.value)}
              className="h-11 rounded-lg border border-border-subtle bg-surface-canvas px-space-sm font-body-md text-body-md"
            >
              <option value="">No specific till</option>
              {tillList.map((t) => (
                <option key={t.id} value={t.id} disabled={Boolean(t.occupant)}>
                  {t.name} ({t.code}){t.occupant ? ` · in use by ${t.occupant.cashierName ?? 'someone'}` : ''}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <button
            type="button"
            disabled={!activeBranchId || createTill.isPending}
            onClick={() => activeBranchId && createTill.mutate({ branchId: activeBranchId, name: 'Front counter' })}
            className="self-start inline-flex items-center gap-1 font-label-md text-label-md text-primary"
          >
            <Icon name="add" className="text-[18px]" /> {createTill.isPending ? 'Adding till…' : 'Add a till (optional)'}
          </button>
        )}
        <TextField id="opening-cash" label="Cash in drawer now (₦)" inputMode="numeric" value={openingCash} onChange={setOpeningCash} placeholder="0" />
        <button
          type="button"
          disabled={openRegister.isPending}
          onClick={() => openRegister.mutate({ openingCash: amount(openingCash), tillId: tillId || undefined })}
          className="h-12 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
        >
          {openRegister.isPending ? 'Opening…' : 'Open register'}
        </button>
        {error ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(error)}</span> : null}
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title={`Register open${session.till?.name ? ` · ${session.till.name}` : ''}`} icon="point_of_sale">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
        {[
          { label: 'Opened', value: `${clock(session.openedAt)}` },
          { label: 'Opening cash', value: naira(session.openingCash) },
          { label: 'Sales this shift', value: `${naira(session.totalSales)}` },
          { label: 'Expected cash', value: naira(session.expectedCash) },
        ].map((tile) => (
          <div key={tile.label} className="rounded-lg bg-surface-subtle px-space-sm py-space-xs flex flex-col">
            <span className="font-caption text-caption text-text-secondary">{tile.label}</span>
            <span className="font-label-md text-label-md text-text-primary font-semibold">{tile.value}</span>
          </div>
        ))}
      </div>
      <span className="font-caption text-caption text-text-secondary">{session.transactionCount ?? 0} sales since {formatRelativeTime(session.openedAt)}</span>
      {mode === 'drop' ? (
        <div className="flex flex-col gap-space-xs rounded-lg border border-border-subtle p-space-sm">
          <div className="grid grid-cols-2 gap-space-xs">
            <TextField id="drop-amount" label="Amount removed (₦)" inputMode="numeric" value={dropAmount} onChange={setDropAmount} />
            <TextField id="drop-reason" label="Reason" value={dropReason} onChange={setDropReason} placeholder="Bank deposit" />
          </div>
          <div className="flex gap-space-xs justify-end">
            <button type="button" onClick={() => setMode('idle')} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
              Cancel
            </button>
            <button
              type="button"
              disabled={cashDrop.isPending || amount(dropAmount) <= 0 || !dropReason.trim()}
              onClick={() =>
                cashDrop.mutate({ amount: amount(dropAmount), reason: dropReason.trim() }, { onSuccess: () => (setMode('idle'), setDropAmount(''), setDropReason('')) })
              }
              className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
            >
              Record cash drop
            </button>
          </div>
        </div>
      ) : mode === 'close' ? (
        <div className="flex flex-col gap-space-xs rounded-lg border border-border-subtle p-space-sm">
          <TextField id="counted-cash" label="Cash counted in drawer (₦)" inputMode="numeric" value={counted} onChange={setCounted} hint={`Expected ${naira(session.expectedCash)}`} />
          {counted ? (
            <span className={`font-label-md text-label-md ${amount(counted) === money(session.expectedCash) ? 'text-badge-discount-text' : 'text-red-600'}`}>
              {amount(counted) === money(session.expectedCash)
                ? 'Drawer balances'
                : `${amount(counted) > money(session.expectedCash) ? 'Over' : 'Short'} by ${formatNaira(Math.abs(amount(counted) - money(session.expectedCash)))}`}
            </span>
          ) : null}
          <div className="flex gap-space-xs justify-end">
            <button type="button" onClick={() => setMode('idle')} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
              Cancel
            </button>
            <button
              type="button"
              disabled={closeRegister.isPending || counted === ''}
              onClick={() =>
                closeRegister.mutate({ countedCash: amount(counted) }, { onSuccess: () => (setMode('idle'), setCounted('')) })
              }
              className="h-10 px-space-md rounded-lg bg-error text-on-error font-label-md text-label-md disabled:opacity-50"
            >
              {closeRegister.isPending ? 'Closing…' : 'Close register'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-space-xs">
          <button type="button" onClick={() => setMode('drop')} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md inline-flex items-center gap-1">
            <Icon name="savings" className="text-[18px]" /> Cash drop
          </button>
          <button type="button" onClick={() => setMode('close')} className="h-10 px-space-md rounded-lg bg-surface-container text-red-600 font-label-md text-label-md inline-flex items-center gap-1">
            <Icon name="lock" className="text-[18px]" /> Close register
          </button>
        </div>
      )}
      {error ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(error)}</span> : null}
    </SettingsSection>
  );
}

function HeldTickets({ onResume }: { onResume: () => void }) {
  const held = useHeldSales();
  const { deleteHeldSale } = usePosMutations();
  const resume = (sale: HeldSale) => {
    ticketStore.load({
      lines: (sale.items ?? []).map((i) => ({ productId: i.productId, name: i.productName ?? 'Item', unitPrice: money(i.unitPrice), quantity: i.quantity, stock: null })),
      customer: sale.customer?.id ? { id: sale.customer.id, name: personName(sale.customer) } : null,
      orderType: sale.orderType ?? 'dine_in',
      cartDiscount: money(sale.discountAmount),
      note: sale.note ?? '',
      heldSaleId: sale.id,
    });
    onResume();
  };

  return (
    <SettingsSection title="Held tickets" icon="pause_circle">
      {held.isLoading ? (
        <LoadingRows rows={1} label="Loading held tickets" />
      ) : !held.data?.length ? (
        <span className="font-caption text-caption text-text-secondary">No tickets on hold. Use Hold on the register to park a sale.</span>
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {held.data.map((sale) => (
            <li key={sale.id} className="py-space-xs flex items-center gap-space-sm">
              <span className="flex flex-col flex-1 min-w-0">
                <span className="font-label-md text-label-md text-text-primary truncate">
                  {sale.note || personName(sale.customer, `${(sale.items ?? []).length} items`)}
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {(sale.items ?? []).map((i) => `${i.quantity}× ${i.productName}`).join(', ')} · held {formatRelativeTime(sale.heldAt)}
                </span>
              </span>
              <span className="font-label-md text-label-md font-semibold shrink-0">{naira(sale.total)}</span>
              <button type="button" onClick={() => resume(sale)} className="h-9 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm shrink-0">
                Resume
              </button>
              <button type="button" aria-label="Discard held ticket" onClick={() => deleteHeldSale.mutate(sale.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-600 shrink-0">
                <Icon name="delete" className="text-[18px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </SettingsSection>
  );
}

function OfflineQueue() {
  const offline = usePosOffline();
  const pending = offline.queue.filter((o) => !o.syncedAt);
  if (offline.isOnline && !pending.length) return null;
  return (
    <SettingsSection title="Offline sales" icon="cloud_sync">
      <span className={`font-label-md text-label-md ${offline.isOnline ? 'text-text-primary' : 'text-red-600'}`}>{offline.statusLabel}</span>
      <ul className="flex flex-col divide-y divide-border-subtle">
        {pending.map((o) => (
          <li key={o.id} className="py-space-xs flex items-center justify-between gap-space-sm">
            <span className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md truncate">
                {o.ref} · {o.tender}
              </span>
              <span className={`font-caption text-caption truncate ${o.syncError ? 'text-red-600' : 'text-text-secondary'}`}>{o.syncError ?? o.items}</span>
            </span>
            <span className="font-label-md text-label-md shrink-0">{formatNaira(o.total)}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={!offline.isOnline || offline.isSyncing || !pending.length}
        onClick={() => void offline.syncNow()}
        className="self-start h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
      >
        {offline.isSyncing ? 'Syncing…' : 'Sync now'}
      </button>
    </SettingsSection>
  );
}

/** Live POS home: today at this branch, the register shift, held tickets and offline sync. */
export function PosHomePanel({ onNewSale, onOpen }: { onNewSale: () => void; onOpen: (target: 'ledger' | 'kitchen' | 'stock') => void }) {
  const { activeBranchId } = useBusinessBranch();
  const summary = usePosBranchSummary();
  const today = summary.data?.find((b) => b.branchId === activeBranchId);

  return (
    <div className="flex flex-col gap-space-lg max-w-4xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
        {[
          { label: 'Sales today', value: today ? naira(today.todaySales) : '—' },
          { label: 'Transactions', value: today ? String(today.todayTransactions ?? 0) : '—' },
          { label: 'Tills', value: today ? String(today.tillCount ?? 0) : '—' },
          { label: 'Open shifts', value: today ? String(today.openSessions ?? 0) : '—' },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
        <button type="button" onClick={onNewSale} className="h-20 rounded-xl bg-primary-container text-on-primary flex flex-col items-center justify-center gap-1 font-label-md text-label-md">
          <Icon name="add_shopping_cart" className="text-[26px]" /> New sale
        </button>
        {(
          [
            { key: 'ledger', label: 'Sales ledger', icon: 'receipt_long' },
            { key: 'kitchen', label: 'Kitchen', icon: 'skillet' },
            { key: 'stock', label: 'Stock', icon: 'inventory_2' },
          ] as const
        ).map((link) => (
          <button
            key={link.key}
            type="button"
            onClick={() => onOpen(link.key)}
            className="h-20 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col items-center justify-center gap-1 font-label-md text-label-md hover:border-primary/40"
          >
            <Icon name={link.icon} className="text-[24px] text-primary" /> {link.label}
          </button>
        ))}
      </div>
      <OfflineQueue />
      <RegisterCard />
      <HeldTickets onResume={onNewSale} />
      {!activeBranchId ? <EmptyState icon="store" title="Choose a branch" body="The POS runs per branch." /> : null}
    </div>
  );
}
