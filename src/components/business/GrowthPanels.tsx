import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { RadioCard, SettingsSection, SwitchRow, TextField } from './FormPrimitives';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { sponsoredCampaignsService, type CampaignKind, type SponsoredCampaign } from '../../services/sponsoredCampaignsService';
import { adWalletService } from '../../services/adWalletService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { formatNaira, formatRelativeTime } from '../../utils/format';

const growthKeys = {
  all: ['growth'] as const,
  campaigns: (kind: CampaignKind) => [...growthKeys.all, 'campaigns', kind] as const,
  summary: (kind: CampaignKind) => [...growthKeys.all, 'summary', kind] as const,
  wallet: () => [...growthKeys.all, 'wallet'] as const,
};

const naira = (value?: number | string | null) => formatNaira(Number(value) || 0);
const errorText = (error: unknown, fallback?: string) => planErrorMessage(error) ?? apiErrorMessage(error, fallback);

function useWallet() {
  return useQuery({ queryKey: growthKeys.wallet(), queryFn: adWalletService.getSummary });
}

// ---------------------------------------------------------------------------
// Campaigns & boosts
// ---------------------------------------------------------------------------

const STATUS_TONE: Record<string, string> = {
  Active: 'bg-badge-discount-bg text-badge-discount-text',
  Pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Paused: 'bg-surface-container text-text-secondary',
  Draft: 'bg-surface-tint-blue text-primary',
  Ended: 'bg-surface-container text-text-tertiary',
};

function CampaignRow({ kind, campaign, onOpenMetrics }: { kind: CampaignKind; campaign: SponsoredCampaign; onOpenMetrics?: (kind: CampaignKind, id: string) => void }) {
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<'end' | 'delete' | null>(null);
  const action = useMutation({
    mutationFn: (step: 'launch' | 'pause' | 'resume' | 'end' | 'delete') =>
      step === 'delete' ? sponsoredCampaignsService.remove(kind, campaign.id) : sponsoredCampaignsService[step](kind, campaign.id),
    onSuccess: () => {
      setConfirm(null);
      void queryClient.invalidateQueries({ queryKey: growthKeys.all });
    },
  });
  const budget = Number(campaign.budget) || 0;
  const spent = Number(campaign.spent) || 0;
  const status = campaign.status;
  const busy = action.isPending;
  const button = 'h-8 px-space-sm rounded-lg font-label-sm text-label-sm disabled:opacity-50';

  return (
    <li className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex flex-col gap-space-xs">
      <div className="flex items-start gap-space-sm">
        <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
          <Icon name={kind === 'boost' ? 'rocket_launch' : 'campaign'} className="text-[20px]" />
        </span>
        <span className="flex flex-col flex-1 min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{campaign.name}</span>
          <span className="font-caption text-caption text-text-secondary truncate">
            {kind === 'boost' ? 'Boost' : 'Campaign'}
            {campaign.schedule?.durationDays ? ` · ${campaign.schedule.durationDays} days` : ''}
            {campaign.audience?.radiusKm ? ` · ${campaign.audience.radiusKm} km` : ''}
            {campaign.createdAt ? ` · created ${formatRelativeTime(campaign.createdAt)}` : ''}
          </span>
        </span>
        <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shrink-0 ${STATUS_TONE[status] ?? STATUS_TONE.Draft}`}>
          {campaign.awaitingPayment ? 'Awaiting payment' : status}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
        {[
          { label: 'Spent', value: `${naira(spent)} / ${naira(budget)}` },
          { label: 'Views', value: String(campaign.impressions ?? 0) },
          { label: 'Taps', value: String(campaign.clicks ?? 0) },
          { label: 'Claims', value: String(campaign.conversions ?? 0) },
        ].map((stat) => (
          <span key={stat.label} className="rounded-lg bg-surface-subtle px-space-sm py-space-xs flex flex-col">
            <span className="font-caption text-caption text-text-secondary">{stat.label}</span>
            <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">{stat.value}</span>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-space-xs">
        {status === 'Draft' ? (
          <button type="button" disabled={busy} onClick={() => action.mutate('launch')} className={`${button} bg-primary-container text-on-primary`}>
            Launch from wallet
          </button>
        ) : null}
        {status === 'Active' ? (
          <button type="button" disabled={busy} onClick={() => action.mutate('pause')} className={`${button} bg-surface-container`}>
            Pause
          </button>
        ) : null}
        {status === 'Paused' ? (
          <button type="button" disabled={busy} onClick={() => action.mutate('resume')} className={`${button} bg-primary-container text-on-primary`}>
            Resume
          </button>
        ) : null}
        {onOpenMetrics && status !== 'Draft' ? (
          <button type="button" onClick={() => onOpenMetrics(kind, campaign.id)} className={`${button} text-primary hover:bg-surface-tint-blue`}>
            Metrics
          </button>
        ) : null}
        {confirm ? (
          <span className="ml-auto flex items-center gap-space-xs">
            <span className="font-caption text-caption text-text-secondary">{confirm === 'end' ? 'Unspent budget goes back to the wallet.' : 'Delete this draft?'}</span>
            <button type="button" disabled={busy} onClick={() => action.mutate(confirm)} className={`${button} bg-error text-on-error`}>
              {confirm === 'end' ? 'End now' : 'Delete'}
            </button>
            <button type="button" onClick={() => setConfirm(null)} className={button}>
              Cancel
            </button>
          </span>
        ) : status === 'Draft' ? (
          <button type="button" onClick={() => setConfirm('delete')} className={`${button} text-red-600 ml-auto`}>
            Delete
          </button>
        ) : status === 'Active' || status === 'Paused' ? (
          <button type="button" onClick={() => setConfirm('end')} className={`${button} text-red-600 ml-auto`}>
            End
          </button>
        ) : null}
      </div>
      {action.isError ? <span className="font-caption text-caption text-red-600">{errorText(action.error)}</span> : null}
    </li>
  );
}

/** Live boosts and sponsored campaigns with their lifecycle actions. */
export function CampaignsPanel({
  onBoost,
  onCreateCampaign,
  onOpenWallet,
  onOpenMetrics,
}: {
  onBoost: () => void;
  onCreateCampaign: () => void;
  onOpenWallet: () => void;
  onOpenMetrics?: (kind: CampaignKind, id: string) => void;
}) {
  const [kind, setKind] = useState<CampaignKind>('boost');
  const campaigns = useQuery({ queryKey: growthKeys.campaigns(kind), queryFn: () => sponsoredCampaignsService.list(kind) });
  const boostSummary = useQuery({ queryKey: growthKeys.summary('boost'), queryFn: () => sponsoredCampaignsService.summary('boost') });
  const promoSummary = useQuery({ queryKey: growthKeys.summary('promotion'), queryFn: () => sponsoredCampaignsService.summary('promotion') });
  const wallet = useWallet();
  const b = boostSummary.data;
  const p = promoSummary.data;
  const sum = (key: 'live' | 'audienceReached' | 'claims') => (b && p ? String(b[key] + p[key]) : '—');

  return (
    <div className="flex flex-col gap-space-lg max-w-5xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
        <button type="button" onClick={onOpenWallet} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col text-left hover:border-primary/40">
          <span className="font-label-sm text-label-sm text-text-secondary">Wallet balance</span>
          <span className="font-heading-md text-heading-md text-text-primary font-semibold">{wallet.data ? naira(wallet.data.spendable) : '—'}</span>
        </button>
        {[
          { label: 'Live now', value: sum('live') },
          { label: 'People reached', value: sum('audienceReached') },
          { label: 'Claims', value: sum('claims') },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <FilterChips<CampaignKind>
          value={kind}
          onChange={setKind}
          options={[
            { key: 'boost', label: 'Boosts', count: b ? b.live + b.drafts + b.paused : undefined },
            { key: 'promotion', label: 'Campaigns', count: p ? p.live + p.drafts + p.paused : undefined },
          ]}
        />
        <div className="flex gap-space-xs">
          <button type="button" onClick={onCreateCampaign} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
            New campaign
          </button>
          <button type="button" onClick={onBoost} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1">
            <Icon name="rocket_launch" className="text-[18px]" /> Boost
          </button>
        </div>
      </div>
      {campaigns.isLoading ? (
        <LoadingRows rows={3} label="Loading campaigns" />
      ) : campaigns.isError ? (
        <ErrorState title="Could not load campaigns" error={campaigns.error} onRetry={() => campaigns.refetch()} />
      ) : !campaigns.data?.length ? (
        <EmptyState
          icon={kind === 'boost' ? 'rocket_launch' : 'campaign'}
          title={kind === 'boost' ? 'No boosts yet' : 'No campaigns yet'}
          body={kind === 'boost' ? 'Push one deal, product or your profile to nearby customers.' : 'Run a multi-step campaign to a segment or area.'}
        />
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {campaigns.data.map((campaign) => (
            <CampaignRow key={campaign.id} kind={kind} campaign={campaign} onOpenMetrics={onOpenMetrics} />
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick boost
// ---------------------------------------------------------------------------

/** One-screen boost: asset, goal, reach, duration and budget, with a live forecast. */
export function QuickBoostPanel({ onDone, onOpenWallet }: { onDone: () => void; onOpenWallet: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const options = useQuery({ queryKey: [...growthKeys.all, 'boost-options'], queryFn: sponsoredCampaignsService.options, staleTime: 10 * 60_000 });
  const assets = useQuery({ queryKey: [...growthKeys.all, 'boost-assets'], queryFn: sponsoredCampaignsService.eligibleAssets });
  const wallet = useWallet();
  const [assetKey, setAssetKey] = useState('');
  const [goalId, setGoalId] = useState('');
  const [radiusKm, setRadiusKm] = useState(3);
  const [durationDays, setDurationDays] = useState(7);
  const [budget, setBudget] = useState('10000');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assetKey && assets.data?.[0]) setAssetKey(`${assets.data[0].type}:${assets.data[0].id}`);
  }, [assets.data, assetKey]);
  useEffect(() => {
    if (!goalId && options.data?.goals?.[0]) setGoalId(options.data.goals[0].id);
  }, [options.data, goalId]);

  const amount = Number(budget.replace(/[^0-9]/g, '')) || 0;
  const minBudget = options.data?.minBudget ?? 2000;
  const forecastInput = { budget: amount, durationDays, radiusKm };
  const [forecastKey, setForecastKey] = useState(JSON.stringify(forecastInput));
  useEffect(() => {
    const id = window.setTimeout(() => setForecastKey(JSON.stringify(forecastInput)), 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, durationDays, radiusKm]);
  const forecast = useQuery({
    queryKey: [...growthKeys.all, 'forecast', forecastKey],
    queryFn: () => sponsoredCampaignsService.forecast(JSON.parse(forecastKey)),
    enabled: amount >= minBudget,
  });

  const asset = assets.data?.find((a) => `${a.type}:${a.id}` === assetKey);
  const save = useMutation({
    mutationFn: async (launch: boolean) => {
      if (!asset) throw new Error('Pick what to boost.');
      const draft = await sponsoredCampaignsService.createBoost({
        name: `Boost · ${asset.title}`.slice(0, 120),
        goalId: goalId || undefined,
        assets: [{ type: asset.type, id: asset.id }],
        audience: { strategy: 'nearby', radiusKm },
        schedule: { durationDays, instantLaunch: true },
        budgetMode: 'total',
        budget: amount,
        branchId: activeBranchId,
      });
      if (launch) {
        try {
          await sponsoredCampaignsService.launch('boost', draft.id, 'wallet');
        } catch (e) {
          // The draft is kept so the owner can launch it after topping up.
          throw Object.assign(e instanceof Error ? e : new Error(String(e)), { draftSaved: true });
        }
      }
      return draft;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: growthKeys.all });
      onDone();
    },
    onError: (e) => {
      void queryClient.invalidateQueries({ queryKey: growthKeys.all });
      const saved = (e as { draftSaved?: boolean }).draftSaved ? ' The boost was saved as a draft.' : '';
      setError(`${errorText(e, 'Could not create the boost.')}${saved}`);
    },
  });

  const submit = (launch: boolean) => {
    if (!asset) return setError('Pick what to boost.');
    if (amount < minBudget) return setError(`The minimum budget is ${naira(minBudget)}.`);
    setError(null);
    save.mutate(launch);
  };

  if (options.isLoading || assets.isLoading) return <LoadingRows rows={4} label="Loading boost options" />;
  if (options.isError || assets.isError)
    return <ErrorState title="Could not load boost options" error={options.error ?? assets.error} onRetry={() => (options.isError ? options.refetch() : assets.refetch())} />;

  const spendable = Number(wallet.data?.spendable) || 0;
  const short = wallet.data && amount > spendable;
  const f = forecast.data;
  const chip = (selected: boolean) =>
    `h-9 px-space-sm rounded-lg font-label-md text-label-md border ${selected ? 'bg-surface-tint-blue border-primary/40 text-primary' : 'bg-surface-subtle border-transparent text-text-primary'}`;

  return (
    <div className="flex flex-col gap-space-md max-w-3xl">
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
          {error}
        </p>
      ) : null}
      <SettingsSection title="What to boost" icon="rocket_launch">
        {!assets.data?.length ? (
          <EmptyState icon="inventory_2" title="Nothing to boost yet" body="Add a product, service or deal first." />
        ) : (
          <div role="radiogroup" aria-label="What to boost" className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            {assets.data.map((a) => (
              <RadioCard
                key={`${a.type}:${a.id}`}
                title={a.title}
                body={a.type === 'profile' ? 'Your business profile' : `${a.type[0].toUpperCase()}${a.type.slice(1)}${a.price ? ` · ${naira(a.price)}` : ''}`}
                selected={assetKey === `${a.type}:${a.id}`}
                onSelect={() => setAssetKey(`${a.type}:${a.id}`)}
              />
            ))}
          </div>
        )}
      </SettingsSection>
      {options.data?.goals?.length ? (
        <SettingsSection title="Goal" icon="flag">
          <div role="radiogroup" aria-label="Goal" className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            {options.data.goals.map((goal) => (
              <RadioCard key={goal.id} title={goal.label} selected={goalId === goal.id} onSelect={() => setGoalId(goal.id)} />
            ))}
          </div>
        </SettingsSection>
      ) : null}
      <SettingsSection title="Reach and budget" icon="near_me">
        <div className="flex flex-col gap-space-2xs">
          <span className="font-label-md text-label-md text-text-primary">Distance from your branch</span>
          <div className="flex flex-wrap gap-space-xs">
            {(options.data?.radiusKm ?? [1, 3, 5, 10]).map((km) => (
              <button key={km} type="button" aria-pressed={radiusKm === km} onClick={() => setRadiusKm(km)} className={chip(radiusKm === km)}>
                {km} km
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-space-2xs">
          <span className="font-label-md text-label-md text-text-primary">Run for</span>
          <div className="flex flex-wrap gap-space-xs">
            {(options.data?.durationsDays ?? [3, 7, 14]).map((days) => (
              <button key={days} type="button" aria-pressed={durationDays === days} onClick={() => setDurationDays(days)} className={chip(durationDays === days)}>
                {days} days
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-space-2xs">
          <TextField id="boost-budget" label="Total budget (₦)" inputMode="numeric" value={budget} onChange={setBudget} hint={`Minimum ${naira(minBudget)}`} />
          <div className="flex flex-wrap gap-space-xs">
            {(options.data?.budgetTiers ?? []).map((tier) => (
              <button key={tier.id} type="button" onClick={() => setBudget(String(tier.amount))} className={chip(amount === tier.amount)}>
                {naira(tier.amount)} · {tier.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-surface-tint-blue p-space-sm flex flex-col gap-1 font-label-sm text-label-sm text-primary" aria-live="polite">
          {amount < minBudget ? (
            <span>Set at least {naira(minBudget)} to see a forecast.</span>
          ) : f ? (
            <>
              <span className="font-semibold">
                {f.reachMin.toLocaleString('en-NG')}–{f.reachMax.toLocaleString('en-NG')} people · {f.claimsMin}–{f.claimsMax} claims
              </span>
              <span className="text-text-secondary">
                About {naira(f.dailyPace)} a day{f.isEstimate ? ' · estimate' : ''}
              </span>
            </>
          ) : forecast.isError ? (
            <span>Could not estimate reach right now.</span>
          ) : (
            <span>Estimating…</span>
          )}
        </div>
      </SettingsSection>
      <div className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex flex-col sm:flex-row sm:items-center gap-space-sm justify-between">
        <span className="font-caption text-caption text-text-secondary">
          Wallet: {wallet.data ? naira(spendable) : '—'} available
          {short ? (
            <>
              {' · '}
              <button type="button" onClick={onOpenWallet} className="text-primary font-semibold underline">
                Top up {naira(amount - spendable)}
              </button>
            </>
          ) : null}
        </span>
        <div className="flex gap-space-xs">
          <button type="button" disabled={save.isPending} onClick={() => submit(false)} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md disabled:opacity-50">
            Save draft
          </button>
          <button type="button" disabled={save.isPending} onClick={() => submit(true)} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50">
            {save.isPending ? 'Working…' : 'Launch boost'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ad wallet
// ---------------------------------------------------------------------------

function TopUpSection() {
  const queryClient = useQueryClient();
  const prepacks = useQuery({ queryKey: [...growthKeys.all, 'prepacks'], queryFn: adWalletService.getPrepacks, staleTime: 10 * 60_000 });
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const topUp = useMutation({
    mutationFn: (prepackId: string) => adWalletService.topUp({ prepackId, callbackUrl: window.location.href }),
    onSuccess: (checkout) => {
      setPending(checkout.reference);
      setNotice(null);
      if (checkout.authorizationUrl) window.open(checkout.authorizationUrl, '_blank', 'noopener');
    },
  });
  const confirm = useMutation({
    mutationFn: (reference: string) => adWalletService.confirmTopUp(reference),
    onSuccess: (result) => {
      if (result.status === 'completed') {
        setPending(null);
        setNotice('Payment received — your wallet has been topped up.');
        void queryClient.invalidateQueries({ queryKey: growthKeys.all });
      } else setNotice('We have not seen the payment yet. Finish it in the Paystack tab, then check again.');
    },
  });

  return (
    <SettingsSection title="Top up" icon="add_card">
      {prepacks.isLoading ? (
        <LoadingRows rows={1} label="Loading top-up packs" />
      ) : prepacks.isError ? (
        <ErrorState title="Could not load top-up packs" error={prepacks.error} onRetry={() => prepacks.refetch()} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
          {(prepacks.data ?? []).map((pack) => (
            <button
              key={pack.id}
              type="button"
              disabled={topUp.isPending}
              onClick={() => topUp.mutate(pack.id)}
              className="rounded-lg border border-border-subtle bg-surface-subtle hover:border-primary/40 p-space-sm flex flex-col text-left disabled:opacity-60"
            >
              <span className="font-label-md text-label-md text-text-primary font-semibold">{naira(pack.amount)}</span>
              <span className="font-caption text-caption text-badge-discount-text">+{naira(pack.bonus)} bonus</span>
              {pack.tier ? <span className="font-caption text-caption text-text-secondary">{pack.tier}</span> : null}
            </button>
          ))}
        </div>
      )}
      {pending ? (
        <div className="rounded-lg bg-surface-tint-blue p-space-sm flex flex-wrap items-center justify-between gap-space-xs">
          <span className="font-caption text-caption text-primary">Paystack opened in a new tab. Come back here once you have paid.</span>
          <button type="button" disabled={confirm.isPending} onClick={() => confirm.mutate(pending)} className="h-9 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm">
            {confirm.isPending ? 'Checking…' : "I've paid"}
          </button>
        </div>
      ) : null}
      {notice ? <span className="font-caption text-caption text-text-secondary">{notice}</span> : null}
      {topUp.isError ? <span className="font-caption text-caption text-red-600">{errorText(topUp.error, 'Could not start the payment.')}</span> : null}
      {confirm.isError ? <span className="font-caption text-caption text-red-600">{errorText(confirm.error)}</span> : null}
    </SettingsSection>
  );
}

function AutoReloadSection() {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const current = wallet.data?.autoReload;
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState('5000');
  const [amount, setAmount] = useState('25000');
  useEffect(() => {
    if (!current) return;
    setEnabled(current.enabled);
    setThreshold(String(Number(current.threshold) || 5000));
    setAmount(String(Number(current.amount) || 25000));
  }, [current]);
  const save = useMutation({
    mutationFn: () => adWalletService.setAutoReload({ enabled, threshold: Number(threshold) || 0, amount: Number(amount) || 0 }),
    onSuccess: (next) => queryClient.setQueryData(growthKeys.wallet(), next),
  });

  return (
    <SettingsSection title="Auto-reload" icon="autorenew">
      {!wallet.data?.card ? (
        <p className="font-caption text-caption text-text-secondary">Pay for a top-up with a saved card first; auto-reload charges that card.</p>
      ) : (
        <>
          <SwitchRow title="Reload automatically" body={`Charges your ${wallet.data.card.brand ?? 'card'} ending ${wallet.data.card.last4 ?? '••••'}.`} checked={enabled} onChange={setEnabled} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <TextField id="reload-threshold" label="When balance drops below (₦)" inputMode="numeric" value={threshold} onChange={setThreshold} disabled={!enabled} />
            <TextField id="reload-amount" label="Add (₦)" inputMode="numeric" value={amount} onChange={setAmount} disabled={!enabled} />
          </div>
          <button type="button" disabled={save.isPending} onClick={() => save.mutate()} className="self-end h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50">
            {save.isPending ? 'Saving…' : save.isSuccess ? 'Saved' : 'Save'}
          </button>
          {current?.lastError ? <span className="font-caption text-caption text-red-600">Last reload failed: {current.lastError}</span> : null}
          {save.isError ? <span className="font-caption text-caption text-red-600">{errorText(save.error)}</span> : null}
        </>
      )}
    </SettingsSection>
  );
}

function LedgerSection() {
  const [tab, setTab] = useState<'transactions' | 'invoices'>('transactions');
  const transactions = useQuery({ queryKey: [...growthKeys.all, 'transactions'], queryFn: () => adWalletService.getTransactions({ limit: 20 }) });
  const invoices = useQuery({ queryKey: [...growthKeys.all, 'invoices'], queryFn: () => adWalletService.getInvoices({ limit: 20 }), enabled: tab === 'invoices' });
  const query = tab === 'transactions' ? transactions : invoices;

  return (
    <SettingsSection title="History" icon="receipt_long">
      <FilterChips<'transactions' | 'invoices'>
        value={tab}
        onChange={setTab}
        options={[
          { key: 'transactions', label: 'Transactions' },
          { key: 'invoices', label: 'Invoices' },
        ]}
      />
      {query.isLoading ? (
        <LoadingRows rows={2} label={`Loading ${tab}`} />
      ) : query.isError ? (
        <ErrorState title={`Could not load ${tab}`} error={query.error} onRetry={() => query.refetch()} />
      ) : tab === 'transactions' ? (
        !transactions.data?.length ? (
          <EmptyState icon="receipt_long" title="No transactions yet" body="Top-ups, boost spend and refunds show up here." />
        ) : (
          <ul className="flex flex-col divide-y divide-border-subtle">
            {transactions.data.map((t) => {
              const debit = t.direction === 'debit';
              return (
                <li key={t.id} className="py-space-xs flex items-center justify-between gap-space-sm">
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary truncate capitalize">{t.description ?? t.type}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {[t.reference, formatRelativeTime(t.createdAt)].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className={`font-label-md text-label-md font-semibold shrink-0 ${debit ? 'text-text-primary' : 'text-badge-discount-text'}`}>
                    {debit ? '−' : '+'}
                    {naira(Math.abs(Number(t.amount)))}
                  </span>
                </li>
              );
            })}
          </ul>
        )
      ) : !invoices.data?.length ? (
        <EmptyState icon="description" title="No invoices yet" body="Every paid top-up and campaign gets an invoice." />
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {invoices.data.map((invoice) => (
            <li key={invoice.id} className="py-space-xs flex items-center justify-between gap-space-sm">
              <span className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary truncate">{invoice.invoiceNo ?? invoice.id.slice(0, 8).toUpperCase()}</span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {[invoice.campaign?.name, new Date(invoice.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }), invoice.status]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <span className="font-label-md text-label-md text-text-primary font-semibold shrink-0">{naira(invoice.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </SettingsSection>
  );
}

/** Live ad wallet: balance, top-up, auto-reload and history. */
export function WalletPanel() {
  const wallet = useWallet();
  const w = wallet.data;

  return (
    <div className="flex flex-col gap-space-lg max-w-4xl">
      {wallet.isError ? (
        <ErrorState title="Could not load your wallet" error={wallet.error} onRetry={() => wallet.refetch()} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          {[
            { label: 'Available to spend', value: w ? naira(w.spendable) : '—' },
            { label: 'Reserved for live boosts', value: w ? naira(w.reserved) : '—' },
            { label: 'Total balance', value: w ? naira(w.balance) : '—' },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
              <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
            </div>
          ))}
        </div>
      )}
      {w?.walletRef ? <span className="font-caption text-caption text-text-secondary -mt-space-sm">Wallet reference {w.walletRef}</span> : null}
      <TopUpSection />
      <AutoReloadSection />
      <LedgerSection />
    </div>
  );
}
