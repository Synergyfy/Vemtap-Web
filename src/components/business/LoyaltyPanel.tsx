import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, LoadingRows } from './QueryStates';
import { RadioCard, SaveBar, SettingsSection, SwitchRow, TextField } from './FormPrimitives';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { loyaltyService, type LoyaltyReward, type LoyaltyRules, type RewardCategory } from '../../services/loyaltyService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { formatRelativeTime } from '../../utils/format';

const loyaltyKeys = {
  all: ['loyalty'] as const,
  rules: () => [...loyaltyKeys.all, 'rules'] as const,
  stats: (branchId?: string) => [...loyaltyKeys.all, 'stats', branchId ?? 'all'] as const,
  rewards: (branchId?: string) => [...loyaltyKeys.all, 'rewards', branchId ?? 'none'] as const,
  logs: (branchId?: string) => [...loyaltyKeys.all, 'logs', branchId ?? 'all'] as const,
};

const NUMBER_FIELDS: { key: keyof LoyaltyRules; label: string; hint?: string }[] = [
  { key: 'spendingBaseAmount', label: 'For every (₦)', hint: 'Spend that earns the points below' },
  { key: 'spendingBasePoints', label: 'Customers earn (points)' },
  { key: 'visitPoints', label: 'Points per visit' },
  { key: 'visitCooldownHours', label: 'Hours between visit awards' },
  { key: 'firstVisitBonus', label: 'First visit bonus' },
  { key: 'birthdayBonus', label: 'Birthday bonus' },
  { key: 'referralBonus', label: 'Referral bonus' },
];

const CATEGORY_LABEL: Record<RewardCategory, string> = {
  custom_discount: 'Discount',
  free_product: 'Free product',
  service_upgrade: 'Upgrade',
  tangible_gifts: 'Gift',
};

/** Business-wide earning rules (the row the backend keeps without a branch). */
function RulesEditor() {
  const queryClient = useQueryClient();
  const rules = useQuery({ queryKey: loyaltyKeys.rules(), queryFn: () => loyaltyService.rules() });
  const [form, setForm] = useState<LoyaltyRules | null>(null);
  useEffect(() => {
    if (rules.data) setForm(rules.data);
  }, [rules.data]);

  const save = useMutation({
    mutationFn: (patch: Partial<LoyaltyRules>) => loyaltyService.updateRules(patch),
    onSuccess: (next) => queryClient.setQueryData(loyaltyKeys.rules(), next),
  });

  if (rules.isLoading || (!form && !rules.isError)) return <LoadingRows rows={2} label="Loading earning rules" />;
  if (rules.isError || !form || !rules.data) return <ErrorState title="Could not load earning rules" error={rules.error} onRetry={() => rules.refetch()} />;

  const base = rules.data;
  const patch = (Object.keys(form) as (keyof LoyaltyRules)[]).reduce<Partial<LoyaltyRules>>((acc, key) => {
    if (key in base && form[key] !== base[key] && ['ruleType', 'isActive', ...NUMBER_FIELDS.map((f) => f.key)].includes(key)) {
      (acc as Record<string, unknown>)[key] = form[key];
    }
    return acc;
  }, {});
  const dirty = Object.keys(patch).length > 0;
  const set = <K extends keyof LoyaltyRules>(key: K, value: LoyaltyRules[K]) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  const invalid = (form.spendingBaseAmount < 1 || form.spendingBasePoints < 1) && form.ruleType !== 'visit';
  const showSpend = form.ruleType !== 'visit';
  const showVisit = form.ruleType !== 'spending';

  return (
    <SettingsSection title="Earning rules" icon="tune">
      <SwitchRow title="Loyalty programme on" body="Customers earn points at every branch." checked={form.isActive} onChange={(v) => set('isActive', v)} />
      <div role="radiogroup" aria-label="How points are earned" className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
        <RadioCard title="Spend" body="Points for money spent" selected={form.ruleType === 'spending'} onSelect={() => set('ruleType', 'spending')} />
        <RadioCard title="Visits" body="Points per check-in" selected={form.ruleType === 'visit'} onSelect={() => set('ruleType', 'visit')} />
        <RadioCard title="Both" body="Spend and visits" selected={form.ruleType === 'hybrid'} onSelect={() => set('ruleType', 'hybrid')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        {NUMBER_FIELDS.filter((f) => (f.key.startsWith('spending') ? showSpend : f.key.startsWith('visit') ? showVisit : true)).map((field) => (
          <TextField
            key={field.key}
            id={`rule-${field.key}`}
            label={field.label}
            hint={field.hint}
            inputMode="numeric"
            value={String(form[field.key])}
            onChange={(v) => set(field.key, (Number(v.replace(/[^0-9]/g, '')) || 0) as never)}
          />
        ))}
      </div>
      <SaveBar
        label="Save rules"
        note={invalid ? 'Spend rate needs at least ₦1 and 1 point.' : 'Applies to every branch.'}
        dirty={dirty && !invalid}
        saving={save.isPending}
        saved={save.isSuccess}
        error={save.isError ? apiErrorMessage(save.error, 'Could not save the rules.') : null}
        onSave={() => save.mutate(patch)}
        onReset={() => setForm(base)}
      />
    </SettingsSection>
  );
}

function RewardForm({ branchId, onDone }: { branchId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [category, setCategory] = useState<RewardCategory>('free_product');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState(() => new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: loyaltyService.createReward,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: loyaltyKeys.all });
      onDone();
    },
    onError: (e) => setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not create the reward.')),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const pointsRequired = Number(points);
    if (!name.trim()) return setError('Give the reward a name.');
    if (!(pointsRequired >= 1)) return setError('Set how many points it costs.');
    if (!expiry) return setError('Pick an expiry date.');
    setError(null);
    create.mutate({
      name: name.trim(),
      description: description.trim() || name.trim(),
      pointsRequired: Math.round(pointsRequired),
      category,
      branchId,
      totalQuantity: Number(quantity) > 0 ? Math.round(Number(quantity)) : -1,
      expiryDate: expiry,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-xl bg-surface-canvas border border-primary/30 p-space-md flex flex-col gap-space-sm">
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
          {error}
        </p>
      ) : null}
      <TextField id="reward-name" label="Reward" value={name} onChange={setName} placeholder="e.g. Free small chops" />
      <TextField id="reward-description" label="Description" value={description} onChange={setDescription} />
      <div role="radiogroup" aria-label="Reward type" className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
        {(Object.keys(CATEGORY_LABEL) as RewardCategory[]).map((key) => (
          <RadioCard key={key} title={CATEGORY_LABEL[key]} selected={category === key} onSelect={() => setCategory(key)} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        <TextField id="reward-points" label="Points needed" inputMode="numeric" value={points} onChange={setPoints} />
        <TextField id="reward-qty" label="Quantity" hint="Leave empty for unlimited" inputMode="numeric" value={quantity} onChange={setQuantity} />
        <TextField id="reward-expiry" label="Expires" type="date" value={expiry} onChange={setExpiry} />
      </div>
      <div className="flex gap-space-xs justify-end">
        <button type="button" onClick={onDone} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
          Cancel
        </button>
        <button type="submit" disabled={create.isPending} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60">
          {create.isPending ? 'Creating…' : 'Create reward'}
        </button>
      </div>
    </form>
  );
}

function RewardRow({ reward }: { reward: LoyaltyReward }) {
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: loyaltyKeys.all });
  const toggle = useMutation({ mutationFn: () => loyaltyService.updateReward(reward.id, { isActive: !(reward.isActive ?? true) }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: () => loyaltyService.removeReward(reward.id), onSuccess: refresh });
  const active = reward.isActive ?? true;
  const expired = Boolean(reward.expiryDate && new Date(reward.expiryDate).getTime() < Date.now());
  const stock =
    reward.totalQuantity === -1 || reward.totalQuantity == null ? 'Unlimited' : `${reward.remainingQuantity ?? reward.totalQuantity} of ${reward.totalQuantity} left`;
  const error = toggle.error ?? remove.error;

  return (
    <li className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex flex-col gap-space-xs">
      <div className="flex items-center gap-space-sm">
        <span className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shrink-0">
          <Icon name="redeem" className="text-[20px]" />
        </span>
        <span className="flex flex-col flex-1 min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{reward.name}</span>
          <span className="font-caption text-caption text-text-secondary truncate">
            {CATEGORY_LABEL[reward.category] ?? reward.category} · {stock}
            {reward.expiryDate ? ` · ${expired ? 'expired' : 'until'} ${new Date(reward.expiryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}` : ''}
          </span>
        </span>
        <span className="flex flex-col items-end shrink-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold">{reward.pointsRequired} pts</span>
          <span className={`font-caption text-[11px] font-semibold ${active && !expired ? 'text-badge-discount-text' : 'text-text-tertiary'}`}>
            {expired ? 'Expired' : active ? 'Live' : 'Paused'}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-space-xs">
        <button type="button" disabled={toggle.isPending} onClick={() => toggle.mutate()} className="h-8 px-space-sm rounded-lg bg-surface-container font-label-sm text-label-sm disabled:opacity-50">
          {active ? 'Pause' : 'Resume'}
        </button>
        {confirm ? (
          <>
            <button type="button" disabled={remove.isPending} onClick={() => remove.mutate()} className="h-8 px-space-sm rounded-lg bg-error text-on-error font-label-sm text-label-sm">
              Delete
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="h-8 px-space-sm font-label-sm text-label-sm">
              Cancel
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="h-8 px-space-sm rounded-lg text-red-600 font-label-sm text-label-sm ml-auto">
            Delete
          </button>
        )}
      </div>
      {error ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(error)}</span> : null}
    </li>
  );
}

function RewardsSection() {
  const { activeBranchId } = useBusinessBranch();
  const rewards = useQuery({
    queryKey: loyaltyKeys.rewards(activeBranchId),
    queryFn: () => loyaltyService.rewards(activeBranchId as string),
    enabled: Boolean(activeBranchId),
  });
  const [adding, setAdding] = useState(false);

  return (
    <SettingsSection title="Rewards at this branch" icon="redeem">
      {!activeBranchId ? (
        <EmptyState icon="store" title="Choose a branch" body="Rewards belong to one branch." />
      ) : (
        <>
          {adding ? (
            <RewardForm branchId={activeBranchId} onDone={() => setAdding(false)} />
          ) : (
            <button type="button" onClick={() => setAdding(true)} className="self-start h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1">
              <Icon name="add" className="text-[18px]" /> New reward
            </button>
          )}
          {rewards.isLoading ? (
            <LoadingRows rows={2} label="Loading rewards" />
          ) : rewards.isError ? (
            <ErrorState title="Could not load rewards" error={rewards.error} onRetry={() => rewards.refetch()} />
          ) : !rewards.data?.length ? (
            <EmptyState icon="redeem" title="No rewards yet" body="Give customers something to spend their points on." />
          ) : (
            <ul className="flex flex-col gap-space-xs">
              {rewards.data.map((reward) => (
                <RewardRow key={reward.id} reward={reward} />
              ))}
            </ul>
          )}
        </>
      )}
    </SettingsSection>
  );
}

function ActivitySection() {
  const { activeBranchId } = useBusinessBranch();
  const business = useMyBusiness();
  const businessId = business.data?.id;
  const logs = useQuery({
    queryKey: loyaltyKeys.logs(activeBranchId),
    queryFn: () => loyaltyService.logs(businessId as string, activeBranchId),
    enabled: Boolean(businessId),
  });

  return (
    <SettingsSection title="Recent points activity" icon="history">
      {logs.isLoading || business.isLoading ? (
        <LoadingRows rows={2} label="Loading activity" />
      ) : logs.isError ? (
        <ErrorState title="Could not load activity" error={logs.error} onRetry={() => logs.refetch()} />
      ) : !logs.data?.length ? (
        <EmptyState icon="history" title="No points activity yet" body="Earned and redeemed points show up here." />
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {logs.data.map((log) => {
            const amount = Math.abs(Number(log.amount) || 0);
            const spent = /redeem|spent/i.test(log.type);
            const who = [log.customer?.firstName, log.customer?.lastName].filter(Boolean).join(' ') || 'Customer';
            return (
              <li key={log.id} className="py-space-xs flex items-center justify-between gap-space-sm">
                <span className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate">{who}</span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {[log.reason, log.branch?.name, formatRelativeTime(log.createdAt)].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className={`font-label-md text-label-md font-semibold shrink-0 ${spent ? 'text-text-secondary' : 'text-badge-discount-text'}`}>
                  {spent ? '−' : '+'}
                  {amount} pts
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SettingsSection>
  );
}

/** Live loyalty programme: headline stats, earning rules, branch rewards and recent activity. */
export function LoyaltyPanel() {
  const { activeBranchId } = useBusinessBranch();
  const stats = useQuery({ queryKey: loyaltyKeys.stats(activeBranchId), queryFn: () => loyaltyService.stats(activeBranchId) });
  const tiles = (stats.data?.stats ?? []).filter((s) => s.label).slice(0, 4);

  return (
    <div className="flex flex-col gap-space-lg max-w-4xl">
      {stats.isError ? (
        <ErrorState title="Could not load loyalty stats" error={stats.error} onRetry={() => stats.refetch()} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
          {(tiles.length ? tiles : [{ label: 'Members' }, { label: 'Points issued' }, { label: 'Redemptions' }, { label: 'Active rewards' }]).map((tile) => (
            <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
              <span className="font-heading-md text-heading-md text-text-primary font-semibold">{'value' in tile && tile.value ? tile.value : '—'}</span>
            </div>
          ))}
        </div>
      )}
      <RulesEditor />
      <RewardsSection />
      <ActivitySection />
    </div>
  );
}
