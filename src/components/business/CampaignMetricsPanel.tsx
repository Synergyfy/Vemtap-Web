import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, LoadingRows } from './QueryStates';
import { SettingsSection } from './FormPrimitives';
import { BarChart } from './BarChart';
import { sponsoredCampaignsService, type CampaignKind } from '../../services/sponsoredCampaignsService';
import { formatNaira } from '../../utils/format';

const n = (value?: number | string | null) => Number(value) || 0;
const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;

function Metrics({ kind, id }: { kind: CampaignKind; id: string }) {
  const stats = useQuery({ queryKey: ['growth', 'stats', kind, id], queryFn: () => sponsoredCampaignsService.stats(kind, id), refetchInterval: 60_000 });
  if (stats.isLoading) return <LoadingRows rows={4} label="Loading metrics" />;
  if (stats.isError || !stats.data) return <ErrorState title="Could not load metrics" error={stats.error} onRetry={() => stats.refetch()} />;
  const s = stats.data;
  const k = s.kpis;
  const spent = n(k.spent);
  const claims = s.funnel.find((f) => f.id === 'claims')?.value ?? k.redemptions;
  const costPerClaim = claims ? spent / claims : null;
  const roas = k.returnOnSpend === null || k.returnOnSpend === undefined ? null : n(k.returnOnSpend);
  const maxFunnel = Math.max(1, ...s.funnel.map((f) => f.value));
  const rhythm = s.rhythm.map((r) => ({ key: String(r.hour), label: hourLabel(r.hour), value: r.claims }));
  const series = s.series.map((p) => ({
    key: p.date,
    label: new Date(`${p.date}T00:00:00`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
    value: n(p.spend),
  }));
  const claimSeries = s.series.map((p) => ({ key: p.date, label: series.find((x) => x.key === p.date)?.label ?? p.date, value: p.claims }));

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-xs">
        <div className="flex items-baseline justify-between gap-space-sm">
          <span className="font-label-md text-label-md text-text-secondary">Budget used</span>
          <span className="font-label-md text-label-md text-text-primary">
            {formatNaira(spent)} of {formatNaira(n(k.budget))} · {formatNaira(n(k.left))} left
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface-container-low overflow-hidden" aria-label={`${Math.round(k.percentConsumed)}% of budget used`}>
          <div className="h-full rounded-full bg-primary-container" style={{ width: `${Math.min(100, Math.max(0, k.percentConsumed))}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
        {[
          { label: 'People reached', value: k.reach.toLocaleString('en-NG') },
          { label: 'Redemptions', value: k.redemptions.toLocaleString('en-NG') },
          { label: 'Revenue', value: formatNaira(n(k.grossRevenue)) },
          { label: 'Return on spend', value: roas === null ? '—' : `${roas.toFixed(1)}×` },
          { label: 'Cost per claim', value: costPerClaim === null ? '—' : formatNaira(costPerClaim) },
          { label: 'Area benchmark', value: s.benchmark ? `${formatNaira(n(s.benchmark.costPerClaim))} / claim` : '—' },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
          </div>
        ))}
      </div>

      <SettingsSection title="Funnel" icon="filter_alt">
        <ul className="flex flex-col gap-space-xs">
          {s.funnel.map((step) => (
            <li key={step.id} className="flex flex-col gap-1">
              <span className="flex justify-between font-label-md text-label-md">
                <span className="text-text-primary">{step.label}</span>
                <span className="text-text-secondary">{step.value.toLocaleString('en-NG')}</span>
              </span>
              <span className="h-2 rounded-full bg-surface-container-low overflow-hidden">
                <span className="block h-full rounded-full bg-primary-container" style={{ width: `${(step.value / maxFunnel) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </SettingsSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        <SettingsSection title="Spend per day" icon="payments">
          {series.some((p) => p.value > 0) ? (
            <BarChart data={series} format={(v) => formatNaira(v)} ariaLabel="Spend per day" labelEvery={Math.max(1, Math.ceil(series.length / 7))} />
          ) : (
            <span className="font-caption text-caption text-text-secondary">No spend yet.</span>
          )}
        </SettingsSection>
        <SettingsSection title="Claims per day" icon="bar_chart">
          {claimSeries.some((p) => p.value > 0) ? (
            <BarChart data={claimSeries} format={(v) => `${v} claims`} ariaLabel="Claims per day" labelEvery={Math.max(1, Math.ceil(claimSeries.length / 7))} />
          ) : (
            <span className="font-caption text-caption text-text-secondary">No claims yet.</span>
          )}
        </SettingsSection>
      </div>

      <SettingsSection title="When people claim" icon="schedule">
        {rhythm.some((p) => p.value > 0) ? (
          <BarChart data={rhythm} format={(v) => `${v} claims`} ariaLabel="Claims by hour of day" labelEvery={3} />
        ) : (
          <span className="font-caption text-caption text-text-secondary">Claim times show here once people start claiming.</span>
        )}
      </SettingsSection>

      {s.byBranch.length ? (
        <SettingsSection title="Claims by branch" icon="store">
          <ul className="flex flex-col divide-y divide-border-subtle">
            {s.byBranch.map((b) => (
              <li key={b.branchId} className="py-space-xs flex justify-between font-label-md text-label-md">
                <span className="text-text-primary">{b.name}</span>
                <span className="text-text-secondary">{b.claims}</span>
              </li>
            ))}
          </ul>
        </SettingsSection>
      ) : null}

      {s.previous ? (
        <SettingsSection title={`Compared with “${s.previous.name}”`} icon="compare_arrows">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
            {[
              { label: 'Reach', now: k.reach, before: s.previous.reach, fmt: (v: number) => v.toLocaleString('en-NG') },
              { label: 'Claims', now: claims, before: s.previous.claims, fmt: (v: number) => v.toLocaleString('en-NG') },
              { label: 'Redemptions', now: k.redemptions, before: s.previous.redemptions, fmt: (v: number) => v.toLocaleString('en-NG') },
              { label: 'Spent', now: spent, before: n(s.previous.spent), fmt: (v: number) => formatNaira(v) },
            ].map((row) => (
              <div key={row.label} className="rounded-lg bg-surface-subtle px-space-sm py-space-xs flex flex-col">
                <span className="font-caption text-caption text-text-secondary">{row.label}</span>
                <span className="font-label-md text-label-md text-text-primary font-semibold">{row.fmt(row.now)}</span>
                <span className="font-caption text-caption text-text-tertiary">was {row.fmt(row.before)}</span>
              </div>
            ))}
          </div>
        </SettingsSection>
      ) : null}
    </div>
  );
}

/** Live results for one boost or sponsored campaign. */
export function CampaignMetricsPanel({ initial }: { initial?: { kind: CampaignKind; id: string } | null }) {
  const boosts = useQuery({ queryKey: ['growth', 'campaigns', 'boost'], queryFn: () => sponsoredCampaignsService.list('boost') });
  const promos = useQuery({ queryKey: ['growth', 'campaigns', 'promotion'], queryFn: () => sponsoredCampaignsService.list('promotion') });
  // Only launched campaigns have results.
  const options = useMemo(
    () => [
      ...(boosts.data ?? []).map((c) => ({ kind: 'boost' as const, c })),
      ...(promos.data ?? []).map((c) => ({ kind: 'promotion' as const, c })),
    ].filter(({ c }) => c.status !== 'Draft'),
    [boosts.data, promos.data],
  );
  const [selected, setSelected] = useState<string>(initial ? `${initial.kind}:${initial.id}` : '');
  useEffect(() => {
    if (!selected && options[0]) setSelected(`${options[0].kind}:${options[0].c.id}`);
  }, [options, selected]);

  if (boosts.isLoading || promos.isLoading) return <LoadingRows rows={3} label="Loading campaigns" />;
  if (boosts.isError) return <ErrorState title="Could not load campaigns" error={boosts.error} onRetry={() => boosts.refetch()} />;
  if (!options.length)
    return <EmptyState icon="insights" title="No results yet" body="Launch a boost or campaign and its reach, claims and spend show up here." />;
  const [kind, id] = selected.split(':') as [CampaignKind, string];

  return (
    <div className="flex flex-col gap-space-md max-w-5xl">
      <label className="flex flex-col gap-1 max-w-md">
        <span className="font-label-md text-label-md text-text-primary">Campaign</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="h-11 rounded-lg border border-border-subtle bg-surface-canvas px-space-sm font-body-md text-body-md"
        >
          {options.map(({ kind: k, c }) => (
            <option key={`${k}:${c.id}`} value={`${k}:${c.id}`}>
              {c.name} · {k === 'boost' ? 'Boost' : 'Campaign'} · {c.status}
            </option>
          ))}
        </select>
      </label>
      {id ? <Metrics key={selected} kind={kind} id={id} /> : null}
    </div>
  );
}
