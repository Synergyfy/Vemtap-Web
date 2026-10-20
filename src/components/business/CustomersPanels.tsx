import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { SettingsSection } from './FormPrimitives';
import { useBusinessCustomers, useCustomerDossier, useSaveCustomerNote } from '../../hooks/business/useBusinessCustomers';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { businessCustomersService, type CustomerSegment, type CustomerSort } from '../../services/businessCustomersService';
import { toPrice } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { downloadBase64 } from '../../utils/exportCsv';
import { useInboxMutations } from '../../hooks/business/useInbox';
import { formatNaira, formatRelativeTime } from '../../utils/format';

const SEGMENT_TONE: Record<string, string> = {
  frequent: 'bg-badge-discount-bg text-badge-discount-text',
  returning: 'bg-surface-tint-blue text-primary',
  new: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  inactive: 'bg-surface-container text-text-secondary',
  occasional: 'bg-surface-container text-text-primary',
};

const money = (value: number | string | null | undefined) => formatNaira(toPrice(value ?? undefined) ?? 0);

/** Live customer directory (`/business-customers`) for the active branch. */
export function CustomersPanel({ onOpenCustomer }: { onOpenCustomer: (userId: string) => void }) {
  const { activeBranchId } = useBusinessBranch();
  const [segment, setSegment] = useState<CustomerSegment>('all');
  const [sort, setSort] = useState<CustomerSort>('recent');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Search after a short pause instead of on every keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => setTerm(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const query = { segment, sort, search: term || undefined, branchId: activeBranchId, limit: 50 };
  const customers = useBusinessCustomers(query);
  const counts = customers.data?.meta.segmentCounts;
  const insight = customers.data?.meta.insight;

  const exportCsv = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const file = await businessCustomersService.export({ segment, sort, search: term || undefined, branchId: activeBranchId });
      downloadBase64(file.filename, file.mimeType, file.contentBase64);
    } catch (e) {
      setExportError(apiErrorMessage(e, 'Could not export customers.'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-lg">
      {insight ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
          {[
            { label: 'Customers', value: String(insight.customers) },
            { label: 'Frequent', value: String(insight.frequentCustomers) },
            { label: 'Spend from frequent', value: `${Math.round(insight.frequentSpendShare * 100)}%` },
            { label: 'Dormant', value: String(insight.dormant) },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
              <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
        <FilterChips<CustomerSegment>
          value={segment}
          onChange={setSegment}
          options={(['all', 'frequent', 'returning', 'new', 'inactive'] as const).map((key) => ({
            key,
            label: key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1),
            count: counts?.[key],
          }))}
        />
        <div className="flex items-center gap-space-xs">
          <label className="relative flex items-center flex-1 lg:w-64">
            <Icon name="search" className="absolute left-3 text-[18px] text-text-tertiary pointer-events-none" />
            <input
              type="search"
              aria-label="Search customers"
              placeholder="Name, email or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md"
            />
          </label>
          <select
            aria-label="Sort customers"
            value={sort}
            onChange={(event) => setSort(event.target.value as CustomerSort)}
            className="h-10 px-space-xs rounded-lg bg-surface-container-lowest border border-border-subtle font-label-md text-label-md"
          >
            <option value="recent">Recent</option>
            <option value="spend">Top spend</option>
            <option value="visits">Most visits</option>
            <option value="name">Name</option>
          </select>
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={exporting}
            className="h-10 px-space-sm rounded-lg bg-surface-container font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Icon name="download" className="text-[18px]" /> <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export'}</span>
          </button>
        </div>
      </div>
      {exportError ? <span className="font-caption text-caption text-red-600">{exportError}</span> : null}

      {customers.isLoading ? (
        <LoadingRows rows={4} label="Loading customers" />
      ) : customers.isError ? (
        <ErrorState title="Could not load customers" error={customers.error} onRetry={() => customers.refetch()} />
      ) : !customers.data?.data.length ? (
        <EmptyState icon="group" title="No customers here yet" body="Customers appear once they visit, order, book, claim a deal or chat with you." />
      ) : (
        <ul className="flex flex-col gap-space-xs">
          {customers.data.data.map((c) => (
            <li key={c.userId}>
              <button
                type="button"
                onClick={() => onOpenCustomer(c.userId)}
                className="w-full flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-canvas border border-border-subtle hover:border-primary/40 text-left"
              >
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-label-md text-label-md font-semibold shrink-0">
                    {(c.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{c.name ?? c.email ?? c.phone ?? 'Customer'}</span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {c.visits} visits · {c.orders} orders · {c.claims} claims{c.lastSeenAt ? ` · seen ${formatRelativeTime(c.lastSeenAt)}` : ''}
                  </span>
                </span>
                <span className="flex flex-col items-end shrink-0 gap-1">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{money(c.spend)}</span>
                  <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold capitalize ${SEGMENT_TONE[c.segment] ?? SEGMENT_TONE.occasional}`}>{c.segment}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NoteEditor({ userId, note, tags }: { userId: string; note: string; tags: string[] }) {
  const save = useSaveCustomerNote(userId);
  const [draft, setDraft] = useState(note);
  const [tagText, setTagText] = useState(tags.join(', '));
  const tagKey = tags.join(', ');
  // Reset when the saved note changes (compare tags by value — the array is new each render).
  useEffect(() => {
    setDraft(note);
    setTagText(tagKey);
  }, [note, tagKey]);
  const parsedTags = tagText.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10);
  const dirty = draft !== note || parsedTags.join(',') !== tags.join(',');

  return (
    <SettingsSection title="Private note" icon="sticky_note_2">
      <textarea
        aria-label="Note about this customer"
        rows={3}
        maxLength={2000}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Preferences, allergies, how they like to be greeted…"
        className="w-full p-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md"
      />
      <input
        aria-label="Tags"
        value={tagText}
        onChange={(event) => setTagText(event.target.value)}
        placeholder="Tags, separated by commas (e.g. vip, vegetarian)"
        className="w-full h-10 px-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md"
      />
      <div className="flex items-center justify-between gap-space-sm">
        <span className={`font-caption text-caption ${save.isError ? 'text-red-600' : 'text-text-tertiary'}`}>
          {save.isError ? apiErrorMessage(save.error) : save.isSuccess && !dirty ? 'Saved' : 'Only your team sees this.'}
        </span>
        <button
          type="button"
          disabled={!dirty || save.isPending || (!draft.trim() && !parsedTags.length)}
          onClick={() => save.mutate({ note: draft.trim() || undefined, tags: parsedTags })}
          className="h-9 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
        >
          {save.isPending ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </SettingsSection>
  );
}

/** One customer's history with this business and the team's private note. */
/** Opens (or reuses) the in-app thread with this customer, then hands its id on. */
function MessageButton({ userId, onMessage }: { userId: string; onMessage: (threadId: string) => void }) {
  const { startThread } = useInboxMutations();
  return (
    <span className="flex flex-col items-end gap-1 shrink-0">
      <button
        type="button"
        disabled={startThread.isPending}
        onClick={() => startThread.mutate(userId, { onSuccess: (thread) => onMessage(thread.id) })}
        className="h-9 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
      >
        <Icon name="chat" className="text-[18px]" /> Message
      </button>
      {startThread.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(startThread.error)}</span> : null}
    </span>
  );
}

export function CustomerDossierPanel({ userId, onMessage }: { userId: string; onMessage?: (threadId: string) => void }) {
  const dossier = useCustomerDossier(userId);
  if (dossier.isLoading) return <LoadingRows rows={4} label="Loading customer" />;
  if (dossier.isError || !dossier.data) return <ErrorState title="Could not load this customer" error={dossier.error} onRetry={() => dossier.refetch()} />;
  const c = dossier.data;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-space-lg items-start">
      <div className="flex flex-col gap-space-lg min-w-0">
        <section className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex items-center gap-space-md">
          <span className="w-14 h-14 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-heading-md text-heading-md">
            {(c.name ?? '?').charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-heading-sm text-heading-sm text-text-primary truncate">{c.name ?? 'Customer'}</span>
            <span className="font-caption text-caption text-text-secondary truncate">{[c.email, c.phone].filter(Boolean).join(' · ') || '—'}</span>
            <span className="font-caption text-caption text-text-tertiary">
              {c.memberSince ? `Customer since ${new Date(c.memberSince).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}` : ''}
              {c.preferredBranch ? ` · usually at ${c.preferredBranch.name}` : ''}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold capitalize ${SEGMENT_TONE[c.segment] ?? SEGMENT_TONE.occasional}`}>{c.segment}</span>
          {onMessage ? <MessageButton userId={userId} onMessage={onMessage} /> : null}
        </section>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
          {[
            { label: 'Total spend', value: money(c.spend) },
            { label: 'Average order', value: c.metrics ? money(c.metrics.averageOrder) : '—' },
            { label: 'Visits / month', value: c.metrics ? c.metrics.visitsPerMonth.toFixed(1) : '—' },
            { label: 'Points', value: String(c.pointsBalance ?? 0) },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">{tile.value}</span>
            </div>
          ))}
        </div>

        <SettingsSection title="Recent purchases" icon="receipt_long">
          {c.recentPurchases?.length ? (
            <ul className="flex flex-col divide-y divide-border-subtle">
              {c.recentPurchases.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-space-sm py-space-xs">
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary">{p.kind === 'pos' ? 'In-store sale' : 'Order'} {p.reference ? `· ${p.reference}` : ''}</span>
                    <span className="font-caption text-caption text-text-secondary">
                      {formatRelativeTime(p.at)}
                      {p.branchName ? ` · ${p.branchName}` : ''}
                      {p.paymentMethod ? ` · ${p.paymentMethod}` : ''}
                    </span>
                  </span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{money(p.total)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="font-caption text-caption text-text-secondary">No purchases yet.</span>
          )}
        </SettingsSection>

        <SettingsSection title="Deal claims" icon="local_offer">
          {c.recentClaims?.length ? (
            <ul className="flex flex-col divide-y divide-border-subtle">
              {c.recentClaims.map((claim) => (
                <li key={claim.id} className="flex items-center justify-between gap-space-sm py-space-xs">
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary truncate">{claim.offerName}</span>
                    <span className="font-caption text-caption text-text-secondary">
                      {formatRelativeTime(claim.claimedAt)}
                      {claim.claimCode ? ` · ${claim.claimCode}` : ''}
                    </span>
                  </span>
                  <span className="font-label-sm text-label-sm text-text-secondary capitalize">{claim.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="font-caption text-caption text-text-secondary">No deals claimed yet.</span>
          )}
        </SettingsSection>
      </div>

      <div className="flex flex-col gap-space-lg">
        <NoteEditor userId={userId} note={c.note?.note ?? ''} tags={c.note?.tags ?? []} />
        <SettingsSection title="Loyalty points" icon="stars">
          {c.loyaltyLedger?.length ? (
            <ul className="flex flex-col gap-1">
              {c.loyaltyLedger.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between font-caption text-caption">
                  <span className="text-text-secondary truncate">{entry.reason}</span>
                  <span className={entry.points >= 0 ? 'text-badge-discount-text font-semibold' : 'text-red-600 font-semibold'}>
                    {entry.points >= 0 ? '+' : ''}
                    {entry.points}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="font-caption text-caption text-text-secondary">No points activity yet.</span>
          )}
        </SettingsSection>
      </div>
    </div>
  );
}
