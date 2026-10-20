import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { ErrorState, LoadingRows } from './QueryStates';
import { SwitchRow } from './FormPrimitives';
import {
  promotionCampaignsService,
  type BudgetMode,
  type EligibleAsset,
  type FundingSource,
  type LaunchedPromotion,
  type SavePromotionInput,
  type SponsoredCampaignOptions,
} from '../../services/promotionCampaignsService';
import { segmentsService } from '../../services/segmentsService';
import { withMock } from '../../services/mock';
import { SAVED_SEGMENTS } from '../../scripts/campaigns/campaignsData';
import { formatNaira } from '../../utils/format';

const STEPS = ['Objective', 'Content', 'Audience', 'Schedule', 'Budget', 'Review'] as const;

const OBJECTIVES = [
  { id: 'customers', title: 'Get More Customers', body: 'Attract first-time local visitors and grow your customer base.', icon: 'group_add', badge: 'Popular' },
  { id: 'deal', title: 'Promote a Deal', body: 'Push your best vouchers and limited-time passes.', icon: 'local_offer', badge: 'Fast conversions' },
  { id: 'visibility', title: 'Increase Visibility', body: 'More impressions, profile visits and storefront saves.', icon: 'auto_awesome' },
  { id: 'products', title: 'Promote Products', body: 'Spotlight signature dishes or high-margin items.', icon: 'receipt' },
  { id: 'orders', title: 'Drive Orders', body: 'Boost dine-in, takeaway and Public POS orders.', icon: 'receipt_long' },
  { id: 'visits', title: 'Increase Visits', body: 'Bring nearby footfall during slow hours or weekends.', icon: 'pin_drop' },
] as const;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Draft {
  name: string;
  objective: string;
  assets: EligibleAsset[];
  strategy: 'nearby' | 'segments';
  radiusKm: number;
  segmentIds: string[];
  cohorts: string[];
  durationDays: number;
  instantLaunch: boolean;
  startAt: string;
  dayparting: boolean;
  windows: string[];
  weekdays: number[];
  autoRenew: boolean;
  budgetMode: BudgetMode;
  amount: number;
  funding: FundingSource;
}

const initialDraft = (): Draft => ({
  name: '',
  objective: '',
  assets: [],
  strategy: 'nearby',
  radiusKm: 3,
  segmentIds: [],
  cohorts: [],
  durationDays: 7,
  instantLaunch: true,
  startAt: '',
  dayparting: false,
  windows: [],
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  autoRenew: false,
  budgetMode: 'total',
  amount: 25_000,
  funding: 'wallet',
});

const totalBudget = (d: Draft) => (d.budgetMode === 'total' ? d.amount : d.amount * d.durationDays);

const toInput = (d: Draft): SavePromotionInput => ({
  name: d.name.trim() || `${OBJECTIVES.find((o) => o.id === d.objective)?.title ?? 'Campaign'} · ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`,
  objective: d.objective || undefined,
  assets: d.assets.map((a) => ({ type: a.type, id: a.id })),
  audience:
    d.strategy === 'nearby'
      ? { strategy: 'nearby', radiusKm: d.radiusKm, cohorts: d.cohorts.length ? d.cohorts : undefined }
      : { strategy: 'segments', segmentIds: d.segmentIds },
  schedule: {
    durationDays: d.durationDays,
    instantLaunch: d.instantLaunch,
    startAt: !d.instantLaunch && d.startAt ? new Date(d.startAt).toISOString() : undefined,
    dayparting: d.dayparting,
    windows: d.dayparting ? d.windows : undefined,
    weekdays: d.weekdays,
    autoRenew: d.autoRenew,
  },
  budgetMode: d.budgetMode,
  budget: d.budgetMode === 'total' ? d.amount : undefined,
  dailyBudget: d.budgetMode === 'daily' ? d.amount : undefined,
});

// ---------------------------------------------------------------------------

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-9 px-space-sm rounded-full font-label-md text-label-md border transition-colors ${
        selected ? 'bg-surface-tint-blue border-primary/40 text-primary font-semibold' : 'bg-surface-canvas border-border-subtle text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-space-sm">
      <div className="flex flex-col">
        <h3 className="font-heading-sm text-heading-sm text-text-primary">{title}</h3>
        {hint ? <span className="font-caption text-caption text-text-secondary">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Stepper({ step, onSelect, maxReached }: { step: number; onSelect: (index: number) => void; maxReached: number }) {
  return (
    <nav aria-label="Campaign steps">
      <ol className="flex gap-space-2xs">
        {STEPS.map((label, index) => {
          const reachable = index <= maxReached;
          const active = index === step;
          return (
            <li key={label} className="flex-1 min-w-0">
              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                onClick={() => onSelect(index)}
                className="w-full flex flex-col gap-1 text-left disabled:cursor-not-allowed"
              >
                <span className={`h-1.5 rounded-full ${index <= step ? 'bg-primary-container' : 'bg-surface-container'}`} />
                <span
                  className={`hidden sm:block font-label-sm text-label-sm truncate ${
                    active ? 'text-primary font-semibold' : reachable ? 'text-text-secondary' : 'text-text-tertiary'
                  }`}
                >
                  {index + 1}. {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <span className="sm:hidden font-label-sm text-label-sm text-text-secondary mt-1 block">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </span>
    </nav>
  );
}

function ForecastCard({ draft }: { draft: Draft }) {
  const input = {
    budget: draft.budgetMode === 'total' ? draft.amount : undefined,
    dailyBudget: draft.budgetMode === 'daily' ? draft.amount : undefined,
    durationDays: draft.durationDays,
    radiusKm: draft.strategy === 'nearby' ? draft.radiusKm : undefined,
  };
  const forecast = useQuery({
    queryKey: ['promotion-forecast', input],
    queryFn: () => promotionCampaignsService.forecast(input),
    enabled: draft.amount > 0,
    placeholderData: (previous) => previous,
  });
  const data = forecast.data;
  return (
    <div className="rounded-xl bg-surface-tint-blue p-space-md flex flex-col gap-space-xs" aria-live="polite">
      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold">
        <Icon name="insights" className="text-[16px]" /> Estimated results
      </span>
      {data ? (
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col">
            <span className="font-caption text-caption text-text-secondary">People reached</span>
            <span className="font-heading-sm text-heading-sm text-text-primary">
              {data.reachMin.toLocaleString()}–{data.reachMax.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-text-secondary">Expected claims</span>
            <span className="font-heading-sm text-heading-sm text-text-primary">
              {data.claimsMin}–{data.claimsMax}
            </span>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="font-caption text-caption text-text-secondary">
              {formatNaira(Number(data.dailyPace))} / day over {data.durationDays} days
              {data.audienceCapped ? ' · audience is small for this budget — widen the radius' : ''}
            </span>
          </div>
        </div>
      ) : forecast.isError ? (
        <span className="font-caption text-caption text-red-600">Could not estimate results right now.</span>
      ) : (
        <span className="font-caption text-caption text-text-secondary">Calculating…</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function WizardBody({ options, onExit, onDone }: { options: SponsoredCampaignOptions; onExit: () => void; onDone: () => void }) {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [promotionId, setPromotionId] = useState<string | null>(null);
  const [result, setResult] = useState<{ kind: 'live' | 'scheduled' | 'draft' | 'checkout'; launched?: LaunchedPromotion } | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (draft.amount < options.minBudget) set('amount', Math.max(options.minBudget, options.budgetTiers[1]?.amount ?? options.minBudget));
    // Only on first load of the options.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.minBudget]);

  const assets = useQuery({ queryKey: ['promotion-eligible-assets'], queryFn: promotionCampaignsService.eligibleAssets });
  const segments = useQuery({
    queryKey: ['segments', 'list'],
    queryFn: () =>
      withMock(
        () => segmentsService.list(),
        () => SAVED_SEGMENTS.map((s) => ({ id: s.key, name: s.label, type: 'dynamic' as const })),
      ),
    enabled: step === 2,
  });

  const save = useMutation({
    mutationFn: async () => {
      const input = toInput(draft);
      const saved = promotionId ? await promotionCampaignsService.update(promotionId, input) : await promotionCampaignsService.create(input);
      setPromotionId(saved.id);
      return saved;
    },
  });

  const launch = useMutation({
    mutationFn: async () => {
      const saved = await save.mutateAsync();
      return promotionCampaignsService.launch(saved.id, draft.funding);
    },
    onSuccess: (launched) => {
      if (launched.checkout?.authorizationUrl) {
        window.open(launched.checkout.authorizationUrl, '_blank', 'noopener');
        setResult({ kind: 'checkout', launched });
      } else {
        setResult({ kind: launched.status === 'Active' ? 'live' : 'scheduled', launched });
      }
    },
  });

  const budget = totalBudget(draft);
  const minTotal = options.minBudget;
  const issues: string[] = useMemo(() => {
    switch (step) {
      case 0:
        return draft.objective ? [] : ['Choose what this campaign should achieve.'];
      case 1:
        return draft.assets.length ? [] : ['Pick at least one deal, product or your profile to feature.'];
      case 2:
        return draft.strategy === 'segments' && !draft.segmentIds.length ? ['Choose at least one segment, or target nearby customers.'] : [];
      case 3: {
        const list: string[] = [];
        if (!draft.weekdays.length) list.push('Run on at least one day of the week.');
        if (draft.dayparting && !draft.windows.length) list.push('Pick at least one time window, or turn dayparting off.');
        if (!draft.instantLaunch && (!draft.startAt || new Date(draft.startAt).getTime() < Date.now()))
          list.push('Choose a start date and time in the future.');
        return list;
      }
      case 4:
        return budget < minTotal ? [`The total budget must be at least ${formatNaira(minTotal)}.`] : [];
      default:
        return [];
    }
  }, [step, draft, budget, minTotal]);

  const goTo = (index: number) => {
    setStep(index);
    setMaxReached((current) => Math.max(current, index));
  };

  if (result) {
    const copy = {
      live: { icon: 'rocket_launch', title: 'Campaign launched!', body: 'It is live in VemTap feeds now. Track results in Marketing & Growth.' },
      scheduled: { icon: 'event_available', title: 'Campaign scheduled', body: 'It goes live at the start time you chose.' },
      draft: { icon: 'save', title: 'Campaign saved as a draft', body: 'Pick it up any time from Marketing & Growth.' },
      checkout: { icon: 'credit_card', title: 'Finish payment to go live', body: 'We opened Paystack in a new tab. The campaign launches as soon as the top-up is paid.' },
    }[result.kind];
    return (
      <div className="flex flex-col items-center text-center gap-space-md py-space-2xl max-w-md mx-auto">
        <span className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
          <Icon name={copy.icon} className="text-[32px]" />
        </span>
        <h2 className="font-heading-md text-heading-md text-text-primary">{copy.title}</h2>
        <p className="font-body-md text-body-md text-text-secondary">{copy.body}</p>
        <button type="button" onClick={onDone} className="h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-md text-label-md">
          Back to Marketing & Growth
        </button>
      </div>
    );
  }

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  const objective = OBJECTIVES.find((o) => o.id === draft.objective);

  return (
    <div className="flex flex-col gap-space-lg max-w-4xl">
      <Stepper step={step} onSelect={goTo} maxReached={maxReached} />

      {step === 0 ? (
        <Section title="What do you want this campaign to achieve?" hint="Objectives tune delivery and placement across VemTap discovery feeds.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm" role="radiogroup">
            {OBJECTIVES.map((o) => {
              const selected = draft.objective === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => set('objective', o.id)}
                  className={`flex flex-col gap-space-xs p-space-md rounded-xl text-left border transition-colors ${
                    selected ? 'bg-surface-tint-blue border-primary/50 ring-2 ring-primary-container/20' : 'bg-surface-canvas border-border-subtle hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                      <Icon name={o.icon} className="text-[20px]" />
                    </span>
                    {'badge' in o ? (
                      <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-semibold">{o.badge}</span>
                    ) : null}
                  </div>
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{o.title}</span>
                  <span className="font-caption text-caption text-text-secondary">{o.body}</span>
                </button>
              );
            })}
          </div>
        </Section>
      ) : null}

      {step === 1 ? (
        <Section title="Pick what to feature" hint="Use what you already have on VemTap — no need to create new content.">
          {assets.isLoading ? (
            <LoadingRows rows={3} />
          ) : assets.isError ? (
            <ErrorState title="Could not load your listings" error={assets.error} onRetry={() => assets.refetch()} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {(assets.data ?? []).map((asset) => {
                const selected = draft.assets.some((a) => a.id === asset.id && a.type === asset.type);
                return (
                  <button
                    key={`${asset.type}-${asset.id}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      set('assets', selected ? draft.assets.filter((a) => !(a.id === asset.id && a.type === asset.type)) : [...draft.assets, asset])
                    }
                    className={`flex items-center gap-space-sm p-space-sm rounded-xl text-left border ${
                      selected ? 'bg-surface-tint-blue border-primary/50' : 'bg-surface-canvas border-border-subtle hover:border-primary/30'
                    }`}
                  >
                    <Icon
                      name={selected ? 'check_box' : 'check_box_outline_blank'}
                      className={`text-[22px] ${selected ? 'text-primary' : 'text-text-tertiary'}`}
                    />
                    <span className="flex flex-col flex-1 min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-medium truncate">{asset.title}</span>
                      <span className="font-caption text-caption text-text-secondary capitalize">
                        {asset.type}
                        {asset.price ? ` · ${formatNaira(Number(asset.price))}` : ''}
                        {asset.priorClaims ? ` · ${asset.priorClaims} claims` : ''}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <span className="font-caption text-caption text-text-secondary">
            {draft.assets.length} {draft.assets.length === 1 ? 'item' : 'items'} selected
          </span>
        </Section>
      ) : null}

      {step === 2 ? (
        <Section title="Who should see it?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm" role="radiogroup">
            {(
              [
                { id: 'nearby', title: 'Nearby customers', body: 'People within a radius of your branches', icon: 'near_me' },
                { id: 'segments', title: 'Your segments', body: 'Customers in segments you have built', icon: 'groups' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={draft.strategy === s.id}
                onClick={() => set('strategy', s.id)}
                className={`flex items-start gap-space-sm p-space-md rounded-xl text-left border ${
                  draft.strategy === s.id ? 'bg-surface-tint-blue border-primary/50' : 'bg-surface-canvas border-border-subtle'
                }`}
              >
                <Icon name={s.icon} className="text-[22px] text-primary" />
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{s.title}</span>
                  <span className="font-caption text-caption text-text-secondary">{s.body}</span>
                </span>
              </button>
            ))}
          </div>
          {draft.strategy === 'nearby' ? (
            <>
              <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Radius</span>
              <div className="flex flex-wrap gap-space-xs">
                {options.radiusKm.map((km) => (
                  <Chip key={km} selected={draft.radiusKm === km} onClick={() => set('radiusKm', km)}>
                    {km} km
                  </Chip>
                ))}
              </div>
              {options.cohorts?.length ? (
                <>
                  <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Focus on (optional)</span>
                  <div className="flex flex-wrap gap-space-xs">
                    {options.cohorts.map((c) => (
                      <Chip key={c.id} selected={draft.cohorts.includes(c.id)} onClick={() => set('cohorts', toggle(draft.cohorts, c.id))}>
                        {c.label}
                      </Chip>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : segments.isLoading ? (
            <LoadingRows rows={2} />
          ) : segments.isError ? (
            <ErrorState title="Could not load segments" error={segments.error} onRetry={() => segments.refetch()} />
          ) : (
            <div className="flex flex-wrap gap-space-xs">
              {(segments.data ?? []).map((segment) => (
                <Chip key={segment.id} selected={draft.segmentIds.includes(segment.id)} onClick={() => set('segmentIds', toggle(draft.segmentIds, segment.id))}>
                  {segment.name}
                  {typeof segment.size === 'number' ? ` · ${segment.size}` : ''}
                </Chip>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {step === 3 ? (
        <Section title="When should it run?">
          <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Duration</span>
          <div className="flex flex-wrap gap-space-xs">
            {options.durationsDays.map((days) => (
              <Chip key={days} selected={draft.durationDays === days} onClick={() => set('durationDays', days)}>
                {days} days
              </Chip>
            ))}
          </div>
          <SwitchRow title="Start as soon as it launches" checked={draft.instantLaunch} onChange={(next) => set('instantLaunch', next)} />
          {!draft.instantLaunch ? (
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="font-label-sm text-label-sm text-text-secondary">Start date & time</span>
              <input
                type="datetime-local"
                value={draft.startAt}
                onChange={(event) => set('startAt', event.target.value)}
                className="h-11 px-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md"
              />
            </label>
          ) : null}
          <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Days of the week</span>
          <div className="flex flex-wrap gap-space-xs">
            {WEEKDAYS.map((label, dow) => (
              <Chip key={label} selected={draft.weekdays.includes(dow)} onClick={() => set('weekdays', toggle(draft.weekdays, dow).sort())}>
                {label}
              </Chip>
            ))}
          </div>
          <SwitchRow
            title="Only show at certain times (dayparting)"
            body="Concentrate spend on your busiest or quietest hours"
            checked={draft.dayparting}
            onChange={(next) => set('dayparting', next)}
          />
          {draft.dayparting ? (
            <div className="flex flex-wrap gap-space-xs">
              {options.daypartWindows.map((w) => (
                <Chip key={w.id} selected={draft.windows.includes(w.id)} onClick={() => set('windows', toggle(draft.windows, w.id))}>
                  {w.label} · {w.start}–{w.end}
                </Chip>
              ))}
            </div>
          ) : null}
          <SwitchRow title="Renew automatically when it ends" checked={draft.autoRenew} onChange={(next) => set('autoRenew', next)} />
        </Section>
      ) : null}

      {step === 4 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-space-lg items-start">
          <Section title="Set your budget" hint={`Minimum ${formatNaira(minTotal)} in total.`}>
            <div className="flex gap-1 p-1 rounded-lg bg-surface-container-low w-fit" role="radiogroup" aria-label="Budget type">
              {(['total', 'daily'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={draft.budgetMode === mode}
                  onClick={() => set('budgetMode', mode)}
                  className={`h-8 px-space-sm rounded-md font-label-sm text-label-sm ${
                    draft.budgetMode === mode ? 'bg-surface-canvas text-primary shadow-sm font-semibold' : 'text-text-secondary'
                  }`}
                >
                  {mode === 'total' ? 'Total budget' : 'Daily budget'}
                </button>
              ))}
            </div>
            {draft.budgetMode === 'total' ? (
              <div className="flex flex-wrap gap-space-xs">
                {options.budgetTiers.map((tier) => (
                  <Chip key={tier.id} selected={draft.amount === tier.amount} onClick={() => set('amount', tier.amount)}>
                    {tier.label} · {formatNaira(tier.amount)}
                  </Chip>
                ))}
              </div>
            ) : null}
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="font-label-sm text-label-sm text-text-secondary">
                {draft.budgetMode === 'total' ? 'Total amount (₦)' : 'Amount per day (₦)'}
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={500}
                value={draft.amount || ''}
                onChange={(event) => set('amount', Number(event.target.value) || 0)}
                className="h-11 px-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md"
              />
            </label>
            <span className="font-body-md text-body-md text-text-secondary">
              Total spend: <strong className="text-text-primary">{formatNaira(budget)}</strong> over {draft.durationDays} days
            </span>
          </Section>
          <ForecastCard draft={draft} />
        </div>
      ) : null}

      {step === 5 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-space-lg items-start">
          <Section title="Review your campaign">
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-secondary">Campaign name</span>
              <input
                value={draft.name}
                maxLength={80}
                placeholder={toInput({ ...draft, name: '' }).name}
                onChange={(event) => set('name', event.target.value)}
                className="h-11 px-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md"
              />
            </label>
            <dl className="rounded-xl bg-surface-canvas border border-border-subtle divide-y divide-border-subtle">
              {[
                { label: 'Objective', value: objective?.title ?? '—', step: 0 },
                { label: 'Featuring', value: draft.assets.map((a) => a.title).join(', ') || '—', step: 1 },
                {
                  label: 'Audience',
                  value: draft.strategy === 'nearby' ? `${draft.radiusKm} km around your branches` : `${draft.segmentIds.length} segment(s)`,
                  step: 2,
                },
                {
                  label: 'Schedule',
                  value: `${draft.durationDays} days · ${draft.instantLaunch ? 'starts on launch' : `from ${new Date(draft.startAt).toLocaleString('en-NG')}`}${
                    draft.dayparting ? ` · ${draft.windows.length} time window(s)` : ' · all day'
                  }`,
                  step: 3,
                },
                { label: 'Budget', value: `${formatNaira(budget)}${draft.budgetMode === 'daily' ? ` (${formatNaira(draft.amount)} / day)` : ''}`, step: 4 },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-space-sm p-space-sm">
                  <dt className="font-label-sm text-label-sm text-text-secondary w-24 shrink-0">{row.label}</dt>
                  <dd className="flex-1 font-body-md text-body-md text-text-primary">{row.value}</dd>
                  <button type="button" onClick={() => goTo(row.step)} className="font-label-sm text-label-sm text-primary hover:underline shrink-0">
                    Edit
                  </button>
                </div>
              ))}
            </dl>
            <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Pay with</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm" role="radiogroup">
              {(
                [
                  { id: 'wallet', title: 'Ad wallet', body: 'Reserve the budget from your wallet balance', icon: 'account_balance_wallet' },
                  { id: 'card', title: 'Card', body: 'Pay any shortfall by card through Paystack', icon: 'credit_card' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={draft.funding === f.id}
                  onClick={() => set('funding', f.id)}
                  className={`flex items-start gap-space-sm p-space-sm rounded-xl text-left border ${
                    draft.funding === f.id ? 'bg-surface-tint-blue border-primary/50' : 'bg-surface-canvas border-border-subtle'
                  }`}
                >
                  <Icon name={f.icon} className="text-[22px] text-primary" />
                  <span className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">{f.title}</span>
                    <span className="font-caption text-caption text-text-secondary">{f.body}</span>
                  </span>
                </button>
              ))}
            </div>
          </Section>
          <ForecastCard draft={draft} />
        </div>
      ) : null}

      {issues.length ? (
        <ul className="rounded-lg bg-tertiary-fixed/60 text-on-tertiary-fixed-variant p-space-sm flex flex-col gap-1 font-caption text-caption" role="status">
          {issues.map((issue) => (
            <li key={issue} className="flex items-center gap-1">
              <Icon name="info" className="text-[14px]" /> {issue}
            </li>
          ))}
        </ul>
      ) : null}
      {save.isError || launch.isError ? (
        <span className="font-caption text-caption text-red-600" role="alert">
          {((launch.error ?? save.error) as Error).message}
        </span>
      ) : null}

      <div className="sticky bottom-0 lg:bottom-4 z-10 rounded-xl bg-surface-canvas/95 backdrop-blur border border-border-subtle shadow-lg p-space-sm flex flex-wrap items-center gap-space-xs justify-between">
        <div className="flex gap-space-xs">
          <button
            type="button"
            onClick={() => (step === 0 ? onExit() : goTo(step - 1))}
            className="h-10 px-space-md rounded-lg bg-surface-container text-text-primary font-label-md text-label-md"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <button
            type="button"
            disabled={save.isPending || launch.isPending || !draft.objective}
            onClick={() => save.mutate(undefined, { onSuccess: () => setResult({ kind: 'draft' }) })}
            className="h-10 px-space-md rounded-lg text-text-secondary font-label-md text-label-md hover:text-text-primary disabled:opacity-50"
          >
            Save draft
          </button>
        </div>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={issues.length > 0}
            onClick={() => goTo(step + 1)}
            className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
          >
            Continue to {STEPS[step + 1]} <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        ) : (
          <button
            type="button"
            disabled={launch.isPending || budget < minTotal}
            onClick={() => launch.mutate()}
            className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Icon name="rocket_launch" className="text-[18px]" />
            {launch.isPending ? 'Launching…' : `Launch campaign (${formatNaira(budget)})`}
          </button>
        )}
      </div>
    </div>
  );
}

/** Six-step Create Campaign wizard for sponsored promotions (`/promotions`). */
export function CampaignWizard({ onExit, onDone }: { onExit: () => void; onDone: () => void }) {
  const options = useQuery({ queryKey: ['promotion-options'], queryFn: promotionCampaignsService.options, staleTime: 10 * 60_000 });
  if (options.isLoading) return <LoadingRows rows={4} label="Loading campaign options" />;
  if (options.isError || !options.data)
    return <ErrorState title="Could not load campaign options" error={options.error} onRetry={() => options.refetch()} />;
  return <WizardBody options={options.data} onExit={onExit} onDone={onDone} />;
}
