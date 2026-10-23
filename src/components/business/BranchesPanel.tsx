import { useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, LoadingRows } from './QueryStates';
import { TextField } from './FormPrimitives';
import { useBranches, useBranchMutations } from '../../hooks/business/useBranchesAndTeam';
import type { Branch } from '../../services/branchService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { downloadCsv } from '../../utils/exportCsv';

const place = (b: Branch) => [b.address, b.city, b.state].filter(Boolean).join(', ');

function AddBranchForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { create } = useBranchMutations();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return setError('Give the branch a name, e.g. "Lekki Branch".');
    setError(null);
    create.mutate(
      {
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        phone: phone.trim() || undefined,
      },
      {
        onSuccess: onDone,
        onError: (e) => setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not add the branch.')),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-xl bg-surface-canvas border border-primary/30 shadow-sm p-space-md flex flex-col gap-space-sm">
      <h3 className="font-heading-sm text-heading-sm text-text-primary">Add a branch</h3>
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
          {error}
        </p>
      ) : null}
      <TextField id="branch-name" label="Branch name" value={name} onChange={setName} placeholder="e.g. Lekki Branch" />
      <TextField id="branch-address" label="Street address" value={address} onChange={setAddress} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        <TextField id="branch-city" label="City" value={city} onChange={setCity} />
        <TextField id="branch-state" label="State" value={state} onChange={setState} />
        <TextField id="branch-phone" label="Phone" type="tel" value={phone} onChange={setPhone} />
      </div>
      <div className="flex gap-space-xs justify-end">
        <button type="button" onClick={onCancel} className="h-10 px-space-md rounded-lg bg-surface-container text-text-primary font-label-md text-label-md">
          Cancel
        </button>
        <button type="submit" disabled={create.isPending} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60">
          {create.isPending ? 'Adding…' : 'Add branch'}
        </button>
      </div>
    </form>
  );
}

function BranchCard({ branch, onOpen }: { branch: Branch; onOpen?: (id: string) => void }) {
  const { update } = useBranchMutations();
  const [error, setError] = useState<string | null>(null);
  const active = branch.isActive !== false;
  const run = (input: Parameters<typeof update.mutate>[0]['input']) =>
    update.mutate({ id: branch.id, input }, { onError: (e) => setError(planErrorMessage(e) ?? apiErrorMessage(e)), onSuccess: () => setError(null) });

  return (
    <article className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-sm">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-space-xs flex-wrap">
            <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{branch.name}</h3>
            {branch.isMainBranch ? (
              <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-[11px] font-semibold">Main</span>
            ) : null}
            <span
              className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${
                active ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
              }`}
            >
              {active ? 'Active' : 'Paused'}
            </span>
          </div>
          <span className="font-caption text-caption text-text-secondary truncate">{place(branch) || 'No address yet'}</span>
        </div>
        {branch.uniqueCode ? <span className="font-mono font-caption text-caption text-text-tertiary shrink-0">{branch.uniqueCode}</span> : null}
      </div>
      <div className="flex flex-wrap gap-space-md font-caption text-caption text-text-secondary">
        <span className="inline-flex items-center gap-1">
          <Icon name="call" className="text-[14px]" /> {branch.phone || '—'}
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="mail" className="text-[14px]" /> {branch.officialEmail || '—'}
        </span>
      </div>
      {error ? <span className="font-caption text-caption text-red-600">{error}</span> : null}
      <div className="flex flex-wrap gap-space-xs pt-space-2xs border-t border-border-subtle">
        {onOpen ? (
          <button type="button" onClick={() => onOpen(branch.id)} className="h-9 px-space-sm rounded-lg bg-surface-container text-text-primary font-label-md text-label-md">
            View details
          </button>
        ) : null}
        {!branch.isMainBranch ? (
          <button
            type="button"
            disabled={update.isPending}
            onClick={() => run({ isMainBranch: true })}
            className="h-9 px-space-sm rounded-lg text-primary font-label-md text-label-md hover:bg-surface-tint-blue disabled:opacity-50"
          >
            Make main branch
          </button>
        ) : null}
        <button
          type="button"
          disabled={update.isPending}
          onClick={() => run({ isActive: !active })}
          className="h-9 px-space-sm rounded-lg text-text-secondary font-label-md text-label-md hover:bg-surface-container disabled:opacity-50 ml-auto"
        >
          {active ? 'Pause branch' : 'Reactivate'}
        </button>
      </div>
    </article>
  );
}

/** Live branches: real counts and rows, add / pause / make-main, CSV export. */
export function BranchesPanel({ onOpenBranch, startAdding = false }: { onOpenBranch?: (id: string) => void; startAdding?: boolean }) {
  const branches = useBranches();
  const [adding, setAdding] = useState(startAdding);

  if (branches.isLoading) return <LoadingRows rows={3} label="Loading branches" />;
  if (branches.isError) return <ErrorState title="Could not load branches" error={branches.error} onRetry={() => branches.refetch()} />;

  const rows = branches.data ?? [];
  const active = rows.filter((b) => b.isActive !== false).length;

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-3 gap-space-sm max-w-xl">
        {[
          { label: 'Locations', value: rows.length },
          { label: 'Active', value: active },
          { label: 'Paused', value: rows.length - active },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <h2 className="font-heading-sm text-heading-sm text-text-primary">Your branches</h2>
        <div className="flex gap-space-xs">
          <button
            type="button"
            disabled={!rows.length}
            onClick={() =>
              downloadCsv(
                'branches',
                ['Branch', 'Code', 'Address', 'City', 'State', 'Phone', 'Email', 'Main', 'Status'],
                rows.map((b) => [b.name, b.uniqueCode ?? '', b.address ?? '', b.city ?? '', b.state ?? '', b.phone ?? '', b.officialEmail ?? '', b.isMainBranch ? 'Yes' : 'No', b.isActive !== false ? 'Active' : 'Paused']),
              )
            }
            className="h-10 px-space-sm rounded-lg bg-surface-container text-text-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Icon name="download" className="text-[18px]" /> Export
          </button>
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1"
            >
              <Icon name="add" className="text-[18px]" /> Add branch
            </button>
          ) : null}
        </div>
      </div>

      {adding ? <AddBranchForm onDone={() => setAdding(false)} onCancel={() => setAdding(false)} /> : null}

      {!rows.length ? (
        <EmptyState icon="storefront" title="No branches yet" body="Add your first location so customers can find you." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">
          {rows.map((branch) => (
            <BranchCard key={branch.id} branch={branch} onOpen={onOpenBranch} />
          ))}
        </div>
      )}
    </div>
  );
}
