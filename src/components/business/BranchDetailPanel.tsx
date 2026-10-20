import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ErrorState, LoadingRows } from './QueryStates';
import { SaveBar, SettingsSection, TextField } from './FormPrimitives';
import { branchService, type UpdateBranchInput } from '../../services/branchService';
import { useBranchMutations } from '../../hooks/business/useBranchesAndTeam';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';

type Form = Required<Pick<UpdateBranchInput, 'name' | 'address' | 'city' | 'state' | 'phone' | 'officialEmail' | 'about'>>;

const EMPTY: Form = { name: '', address: '', city: '', state: '', phone: '', officialEmail: '', about: '' };

/** One branch's details (`GET /branches/:id`), editable with `PATCH /branches/:id`. */
export function BranchDetailPanel({ branchId }: { branchId: string }) {
  const branch = useQuery({ queryKey: ['branches', branchId], queryFn: () => branchService.get(branchId) });
  const { update } = useBranchMutations();
  const [saved, setSaved] = useState<Form>(EMPTY);
  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!branch.data) return;
    const next: Form = {
      name: branch.data.name ?? '',
      address: branch.data.address ?? '',
      city: branch.data.city ?? '',
      state: branch.data.state ?? '',
      phone: branch.data.phone ?? '',
      officialEmail: branch.data.officialEmail ?? '',
      about: branch.data.about ?? '',
    };
    setSaved(next);
    setForm(next);
  }, [branch.data]);

  if (branch.isLoading) return <LoadingRows rows={3} label="Loading branch" />;
  if (branch.isError || !branch.data) return <ErrorState title="Could not load this branch" error={branch.error} onRetry={() => branch.refetch()} />;

  const changes = (Object.keys(form) as (keyof Form)[]).reduce<UpdateBranchInput>((acc, key) => {
    if (form[key].trim() !== saved[key].trim()) acc[key] = form[key].trim();
    return acc;
  }, {});
  const set = (key: keyof Form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const error = update.isError ? planErrorMessage(update.error) ?? apiErrorMessage(update.error) : null;

  return (
    <div className="flex flex-col gap-space-lg max-w-3xl">
      <SettingsSection title="Branch details" icon="storefront">
        <TextField id="bd-name" label="Branch name" value={form.name} onChange={set('name')} />
        <TextField id="bd-address" label="Street address" value={form.address} onChange={set('address')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <TextField id="bd-city" label="City" value={form.city} onChange={set('city')} />
          <TextField id="bd-state" label="State" value={form.state} onChange={set('state')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <TextField id="bd-phone" label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
          <TextField id="bd-email" label="Email" type="email" value={form.officialEmail} onChange={set('officialEmail')} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bd-about" className="font-label-sm text-label-sm text-text-secondary">
            About this branch
          </label>
          <textarea
            id="bd-about"
            rows={3}
            value={form.about}
            onChange={(event) => set('about')(event.target.value)}
            className="w-full p-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          />
        </div>
        {branch.data.uniqueCode ? (
          <span className="font-caption text-caption text-text-tertiary">
            Branch code <span className="font-mono">{branch.data.uniqueCode}</span>
          </span>
        ) : null}
      </SettingsSection>
      <SaveBar
        label="Save branch"
        dirty={Object.keys(changes).length > 0}
        saving={update.isPending}
        saved={update.isSuccess}
        error={error}
        onSave={() => update.mutate({ id: branchId, input: changes })}
        onReset={() => setForm(saved)}
      />
    </div>
  );
}
