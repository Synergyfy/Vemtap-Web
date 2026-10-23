import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { ErrorState, LoadingRows } from './QueryStates';
import { usePosTills } from '../../hooks/business/usePos';
import { usePosDisplayState } from '../../hooks/business/usePosDisplay';
import { posService, type PosDisplayTicket, type PosTipOption } from '../../services/posService';
import { formatNaira } from '../../utils/format';

const TILL_KEY = 'vemtap_pos_display_till';
/** How long the thank-you screen stays up before the display goes idle. */
const THANKS_MS = 6000;

const readTill = () => {
  try {
    return localStorage.getItem(TILL_KEY);
  } catch {
    return null;
  }
};

const writeTill = (tillId: string | null) => {
  try {
    if (tillId) localStorage.setItem(TILL_KEY, tillId);
    else localStorage.removeItem(TILL_KEY);
  } catch {
    // The choice just won't survive a reload.
  }
};

type Stage = { kind: 'live' } | { kind: 'tip'; saleId: string | null; ticket: PosDisplayTicket | null; options: PosTipOption[] } | { kind: 'thanks' };

function TillPicker({ onPick, onExit }: { onPick: (tillId: string) => void; onExit: () => void }) {
  const tills = usePosTills();
  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-space-lg">
      <div className="w-full max-w-md rounded-2xl bg-surface-canvas border border-border-subtle shadow-sm p-space-lg flex flex-col gap-space-md">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading-md text-heading-md text-text-primary">Customer display</h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Choose the till this screen faces. It shows that till’s ticket to the customer and collects their tip and rating.
          </p>
        </div>
        {tills.isLoading ? <LoadingRows rows={2} label="Loading tills" /> : null}
        {tills.isError ? <ErrorState title="Could not load tills" error={tills.error} onRetry={() => tills.refetch()} /> : null}
        {tills.data?.length === 0 ? (
          <p className="font-body-md text-body-md text-text-secondary">This branch has no tills yet. Add one in POS settings.</p>
        ) : null}
        <ul className="flex flex-col gap-space-xs">
          {tills.data?.map((till) => (
            <li key={till.id}>
              <button
                type="button"
                onClick={() => onPick(till.id)}
                className="w-full h-12 px-space-md rounded-xl border border-border-subtle hover:border-primary/40 flex items-center justify-between font-label-md text-label-md text-text-primary"
              >
                <span>{till.name}</span>
                <Icon name="chevron_right" className="text-[20px] text-text-tertiary" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onExit} className="self-start font-label-sm text-label-sm text-primary">
          Back to POS
        </button>
      </div>
    </div>
  );
}

function TicketView({ ticket, taxLabel }: { ticket: PosDisplayTicket; taxLabel: string }) {
  const rows = [
    { label: 'Subtotal', value: ticket.subtotal },
    { label: 'Discount', value: -ticket.discountAmount },
    { label: taxLabel, value: ticket.tax },
    { label: 'Service charge', value: ticket.serviceCharge },
    { label: 'Packaging', value: ticket.packagingFee },
  ].filter((row) => row.value !== 0 || row.label === 'Subtotal');
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-space-md">
      <ul className="flex-1 min-h-0 overflow-y-auto flex flex-col divide-y divide-border-subtle rounded-2xl bg-surface-canvas border border-border-subtle">
        {ticket.lines.map((line, index) => (
          <li key={`${line.name}-${index}`} className="flex items-center justify-between gap-space-md px-space-lg py-space-md">
            <span className="font-heading-sm text-heading-sm text-text-primary">
              <span className="text-text-secondary">{line.quantity}×</span> {line.name}
            </span>
            <span className="font-heading-sm text-heading-sm text-text-primary tabular-nums">{formatNaira(line.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="rounded-2xl bg-surface-canvas border border-border-subtle px-space-lg py-space-md flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between font-body-lg text-body-lg text-text-secondary">
            <dt>{row.label}</dt>
            <dd className="tabular-nums">{row.value < 0 ? `−${formatNaira(-row.value)}` : formatNaira(row.value)}</dd>
          </div>
        ))}
        <div className="flex justify-between pt-space-xs mt-space-xs border-t border-border-subtle">
          <dt className="font-heading-md text-heading-md text-text-primary">Total</dt>
          <dd className="font-heading-lg text-heading-lg text-primary tabular-nums">{formatNaira(ticket.total)}</dd>
        </div>
      </dl>
    </div>
  );
}

function TipView({ tillId, stage, onDone }: { tillId: string; stage: Extract<Stage, { kind: 'tip' }>; onDone: () => void }) {
  const [tip, setTip] = useState(0);
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);

  const submit = async (tipAmount: number) => {
    setSending(true);
    try {
      await posService.displayTipRating(tillId, { saleId: stage.saleId ?? undefined, tipAmount, rating: rating || undefined });
    } catch {
      // The sale is already paid; a lost tip/rating should not trap the customer here.
    }
    onDone();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-space-lg text-center">
      <span className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
        <Icon name="check" className="text-[32px]" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading-lg text-heading-lg text-text-primary">Payment received</h2>
        {stage.ticket ? <p className="font-body-lg text-body-lg text-text-secondary">{formatNaira(stage.ticket.total)} · thank you!</p> : null}
      </div>

      <div className="flex flex-col gap-space-xs items-center">
        <p className="font-label-md text-label-md text-text-primary font-semibold">How was your visit?</p>
        <div className="flex gap-space-xs" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => setRating(value)}>
              <Icon name="star" className={`text-[40px] ${value <= rating ? 'text-amber-500' : 'text-border-subtle'}`} />
            </button>
          ))}
        </div>
      </div>

      {stage.options.length ? (
        <div className="flex flex-col gap-space-xs items-center">
          <p className="font-label-md text-label-md text-text-primary font-semibold">Add a tip?</p>
          <div className="flex flex-wrap justify-center gap-space-xs">
            {stage.options.map((option) => (
              <button
                key={option.percent}
                type="button"
                aria-pressed={tip === option.amount}
                onClick={() => setTip(option.amount)}
                className={`min-w-[96px] h-16 px-space-md rounded-xl border flex flex-col items-center justify-center ${
                  tip === option.amount ? 'border-primary bg-surface-tint-blue text-primary' : 'border-border-subtle text-text-primary'
                }`}
              >
                <span className="font-heading-sm text-heading-sm">{option.percent}%</span>
                <span className="font-caption text-caption">{formatNaira(option.amount)}</span>
              </button>
            ))}
            <button
              type="button"
              aria-pressed={tip === 0}
              onClick={() => setTip(0)}
              className={`min-w-[96px] h-16 px-space-md rounded-xl border font-label-md text-label-md ${tip === 0 ? 'border-primary bg-surface-tint-blue text-primary' : 'border-border-subtle text-text-primary'}`}
            >
              No tip
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={sending}
        onClick={() => void submit(tip)}
        className="h-14 px-space-xl rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary disabled:opacity-60"
      >
        {sending ? 'Sending…' : 'Done'}
      </button>
    </div>
  );
}

/**
 * The customer-facing screen for one till. It runs on a second screen signed
 * in with a staff account, shows the till's ticket as it is rung up, then asks
 * for a tip and rating once the sale is paid.
 */
export function PosDisplayPanel({ onExit }: { onExit: () => void }) {
  const [tillId, setTillId] = useState<string | null>(readTill);
  const [stage, setStage] = useState<Stage>({ kind: 'live' });
  const [menuOpen, setMenuOpen] = useState(false);

  const display = usePosDisplayState(tillId, (saleId) => {
    // Keep the ticket the customer just paid for; the server has already cleared it.
    const current = display.data;
    setStage({ kind: 'tip', saleId, ticket: current?.ticket ?? null, options: current?.tipOptions ?? [] });
  });

  useEffect(() => {
    if (stage.kind !== 'thanks') return;
    const timer = window.setTimeout(() => setStage({ kind: 'live' }), THANKS_MS);
    return () => window.clearTimeout(timer);
  }, [stage.kind]);

  const pick = (next: string | null) => {
    writeTill(next);
    setTillId(next);
    setStage({ kind: 'live' });
    setMenuOpen(false);
  };

  if (!tillId) return <TillPicker onPick={pick} onExit={onExit} />;

  const data = display.data;
  const ticket = data?.ticket;

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col p-space-lg gap-space-lg">
      <header className="flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm min-w-0">
          {data?.venue.logo ? <img src={data.venue.logo} alt="" className="w-12 h-12 rounded-xl object-cover" /> : null}
          <div className="flex flex-col min-w-0">
            <span className="font-heading-md text-heading-md text-text-primary truncate">{data?.venue.name ?? 'Welcome'}</span>
            {data?.venue.branchName ? <span className="font-body-md text-body-md text-text-secondary truncate">{data.venue.branchName}</span> : null}
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Display settings"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="w-10 h-10 rounded-full text-text-tertiary hover:bg-surface-container flex items-center justify-center"
          >
            <Icon name="more_vert" className="text-[20px]" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-11 z-10 w-56 rounded-xl bg-surface-canvas border border-border-subtle shadow-lg p-space-2xs flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void document.documentElement.requestFullscreen?.().catch(() => undefined);
                }}
                className="h-10 px-space-sm rounded-lg text-left font-label-md text-label-md hover:bg-surface-subtle"
              >
                Full screen
              </button>
              <button type="button" onClick={() => pick(null)} className="h-10 px-space-sm rounded-lg text-left font-label-md text-label-md hover:bg-surface-subtle">
                Change till ({data?.till.name ?? '…'})
              </button>
              <button type="button" onClick={onExit} className="h-10 px-space-sm rounded-lg text-left font-label-md text-label-md text-red-600 hover:bg-surface-subtle">
                Exit customer display
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {display.isLoading ? <LoadingRows rows={3} label="Loading display" /> : null}
      {display.isError ? <ErrorState title="Could not load this till" error={display.error} onRetry={() => display.refetch()} /> : null}

      {data && stage.kind === 'tip' ? <TipView tillId={tillId} stage={stage} onDone={() => setStage({ kind: 'thanks' })} /> : null}

      {data && stage.kind === 'thanks' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-space-sm text-center">
          <Icon name="favorite" className="text-[48px] text-primary" />
          <h2 className="font-heading-lg text-heading-lg text-text-primary">Thank you for visiting!</h2>
        </div>
      ) : null}

      {data && stage.kind === 'live' ? (
        ticket && ticket.lines.length ? (
          <TicketView ticket={ticket} taxLabel={data.taxLabel} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-space-sm text-center">
            <Icon name="storefront" className="text-[48px] text-primary" />
            <h2 className="font-heading-lg text-heading-lg text-text-primary">Welcome{data.venue.name ? ` to ${data.venue.name}` : ''}</h2>
            <p className="font-body-lg text-body-lg text-text-secondary">Your order will appear here.</p>
          </div>
        )
      ) : null}
    </div>
  );
}
