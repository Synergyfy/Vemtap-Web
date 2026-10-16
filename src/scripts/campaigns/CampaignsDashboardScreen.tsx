import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { CampaignStatusBadge } from '../../components/campaigns/CampaignStatusBadge';
import { useCampaigns } from '../../context/CampaignsContext';
import { CampaignShell } from './CampaignShell';
import type { BusinessTabKey } from '../../components/BusinessTabBar';
import {
  CHANNEL_META,
  STATUS_FILTERS,
  formatDateTime,
  formatNumber,
  matchesStatusFilter,
  relativeWhen,
  type CampaignChannel,
  type CampaignRecord,
  type StatusFilterKey,
} from './campaignsData';

interface CampaignsDashboardScreenProps {
  channel: CampaignChannel;
  isDesktop: boolean;
  onNav: (key: string) => void;
  onTab: (tab: BusinessTabKey) => void;
  onCreate: () => void;
  onOpenCampaign: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCancelScheduled: (id: string) => void;
  onDeleteDraft: (id: string) => void;
}

/**
 * Screen 1 — one dashboard per channel (SMS / Email) with drafts, scheduled,
 * queued and completed campaigns, search, status filters and row actions.
 */
export function CampaignsDashboardScreen({
  channel,
  isDesktop,
  onNav,
  onTab,
  onCreate,
  onOpenCampaign,
  onDuplicate,
  onCancelScheduled,
  onDeleteDraft,
}: CampaignsDashboardScreenProps) {
  const { listForChannel } = useCampaigns();
  const campaigns = listForChannel(channel);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilterKey>('all');

  useEffect(() => {
    setFilter('all');
    setQuery('');
  }, [channel]);

  const counts = useMemo(() => {
    const base = { draft: 0, scheduled: 0, sending: 0, sent: 0, attention: 0 };
    for (const campaign of campaigns) {
      if (campaign.status === 'draft') base.draft += 1;
      else if (campaign.status === 'scheduled') base.scheduled += 1;
      else if (campaign.status === 'sending') base.sending += 1;
      else if (campaign.status === 'sent') base.sent += 1;
      else base.attention += 1;
    }
    return base;
  }, [campaigns]);

  const totals = useMemo(() => {
    let delivered = 0;
    let queued = 0;
    let opened = 0;
    let clicked = 0;
    let bounced = 0;
    let failed = 0;
    let hasStats = false;
    for (const campaign of campaigns) {
      if (!campaign.stats) continue;
      hasStats = true;
      queued += campaign.stats.queued;
      delivered += campaign.stats.delivered ?? 0;
      opened += campaign.stats.opened ?? 0;
      clicked += campaign.stats.clicked ?? 0;
      bounced += campaign.stats.bounced ?? 0;
      failed += campaign.stats.failed ?? 0;
    }
    return { delivered, queued, opened, clicked, bounced, failed, hasStats };
  }, [campaigns]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      if (!matchesStatusFilter(campaign.status, filter)) return false;
      if (!needle) return true;
      return (
        campaign.name.toLowerCase().includes(needle) ||
        campaign.audienceLabel.toLowerCase().includes(needle) ||
        (campaign.emailSubject ?? campaign.smsBody ?? '').toLowerCase().includes(needle)
      );
    });
  }, [campaigns, query, filter]);

  const meta = CHANNEL_META[channel];
  const currency = channel === 'sms' ? 'SMS' : 'Email';

  const header = (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
      <div className="flex flex-col gap-space-2xs max-w-3xl">
        <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
          Messages · {currency}
        </span>
        <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{meta.label}</h1>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{meta.description}</p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="shrink-0 h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
      >
        <Icon name="add_circle" className="text-[20px]" />
        <span>Create Campaign</span>
      </button>
    </section>
  );

  return (
    <CampaignShell
      channel={channel}
      isDesktop={isDesktop}
      onNav={onNav}
      onTab={onTab}
      onBack={() => onNav('messages')}
      mobileTitle={meta.label}
      showSubNav
      showTabBar
      desktopHeader={header}
    >
      <div className="flex flex-col gap-space-lg px-space-md md:px-0 py-space-md md:py-0">
        {/* Mobile intro + create */}
        <div className="flex flex-col gap-space-sm md:hidden">
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{meta.description}</p>
          <button
            type="button"
            onClick={onCreate}
            className="h-12 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
          >
            <Icon name="add_circle" className="text-[20px]" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Demonstration notice */}
        <p className="flex items-start gap-space-2xs rounded-xl bg-surface-tint-blue px-space-md py-space-sm font-caption text-caption text-text-secondary leading-relaxed">
          <Icon name="science" className="text-primary text-[16px] shrink-0 mt-0.5" />
          Campaigns are stored in this browser. A connected SMS or email provider is required for real sending, scheduling
          and delivery reports.
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
          <SummaryCard icon="edit_note" label="Drafts" value={counts.draft} tone="neutral" />
          <SummaryCard icon="schedule" label="Scheduled" value={counts.scheduled} tone="blue" />
          <SummaryCard icon={channel === 'sms' ? 'sms' : 'mail'} label="Sent" value={counts.sent} tone="green" />
          <SummaryCard
            icon="done_all"
            label="Delivered"
            value={totals.delivered}
            tone="green"
            note={totals.hasStats ? 'From provider events' : 'No delivery data yet'}
          />
        </div>

        {/* Channel metrics — only when the data actually holds them. */}
        {totals.hasStats && (
          <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg">
            <h2 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">
              {channel === 'sms' ? 'Delivery summary' : 'Engagement summary'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <Metric label="Queued" value={formatNumber(totals.queued)} icon="cell_tower" />
              <Metric
                label="Delivered"
                value={formatNumber(totals.delivered)}
                icon="done_all"
                note={totals.queued ? `${Math.round((totals.delivered / totals.queued) * 100)}% of queued` : undefined}
              />
              {channel === 'email' ? (
                <>
                  <Metric
                    label="Opened"
                    value={formatNumber(totals.opened)}
                    icon="mark_email_read"
                    note={totals.delivered ? `${Math.round((totals.opened / totals.delivered) * 100)}% open rate` : undefined}
                  />
                  <Metric
                    label="Clicked"
                    value={formatNumber(totals.clicked)}
                    icon="mouse"
                    note={totals.delivered ? `${Math.round((totals.clicked / totals.delivered) * 100)}% click rate` : undefined}
                  />
                </>
              ) : (
                <>
                  <Metric
                    label="Failed"
                    value={formatNumber(totals.failed)}
                    icon="error"
                    note={totals.queued ? `${Math.round((totals.failed / totals.queued) * 100)}% of queued` : undefined}
                  />
                  <Metric label="Campaigns sent" value={formatNumber(counts.sent)} icon="campaign" />
                </>
              )}
            </div>
            <p className="font-caption text-caption text-text-tertiary mt-space-sm">
              Delivery and engagement numbers come from your messaging provider. This demo shows sample events for seeded
              campaigns only — nothing is counted twice.
            </p>
          </section>
        )}

        {/* Search + filters */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs bg-surface-canvas px-space-md py-2.5 rounded-xl shadow-sm">
            <Icon name="search" className="text-text-secondary text-[20px]" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${currency.toLowerCase()} campaigns…`}
              aria-label="Search campaigns"
              className="bg-transparent flex-1 min-w-0 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="w-7 h-7 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map((entry) => {
              const active = entry.key === filter;
              return (
                <button
                  key={entry.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(entry.key)}
                  className={`flex shrink-0 items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                    active ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
                  }`}
                >
                  {entry.label}
                  <span className={`font-caption text-caption ${active ? 'opacity-80' : 'text-text-tertiary'}`}>
                    {filterCount(campaigns, entry.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campaign list */}
        {visible.length === 0 ? (
          <EmptyCampaignState filtered={campaigns.length > 0} channel={channel} onCreate={onCreate} />
        ) : isDesktop ? (
          <DesktopCampaignTable
            channel={channel}
            campaigns={visible}
            onOpen={onOpenCampaign}
            onDuplicate={onDuplicate}
            onCancelScheduled={onCancelScheduled}
            onDeleteDraft={onDeleteDraft}
          />
        ) : (
          <div className="flex flex-col gap-space-sm">
            {visible.map((campaign) => (
              <MobileCampaignCard
                key={campaign.id}
                campaign={campaign}
                onOpen={() => onOpenCampaign(campaign.id)}
                onDuplicate={() => onDuplicate(campaign.id)}
                onCancelScheduled={() => onCancelScheduled(campaign.id)}
                onDeleteDraft={() => onDeleteDraft(campaign.id)}
              />
            ))}
          </div>
        )}
      </div>
    </CampaignShell>
  );
}

function filterCount(campaigns: CampaignRecord[], key: StatusFilterKey): number {
  return campaigns.filter((campaign) => matchesStatusFilter(campaign.status, key)).length;
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
  note,
}: {
  icon: string;
  label: string;
  value: number;
  tone: 'neutral' | 'blue' | 'green';
  note?: string;
}) {
  const toneClass =
    tone === 'blue' ? 'bg-surface-tint-blue text-primary' : tone === 'green' ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-subtle text-text-secondary';
  return (
    <div className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-2xs">
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneClass}`}>
        <Icon name={icon} className="text-[20px]" />
      </span>
      <span className="font-heading-md text-heading-md text-text-primary font-bold leading-tight mt-1">
        {formatNumber(value)}
      </span>
      <span className="font-label-sm text-label-sm text-text-secondary">{label}</span>
      {note && <span className="font-caption text-caption text-text-tertiary">{note}</span>}
    </div>
  );
}

function Metric({ label, value, icon, note }: { label: string; value: string; icon: string; note?: string }) {
  return (
    <div className="rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-space-2xs">
      <span className="flex items-center gap-1 font-caption text-caption text-text-secondary">
        <Icon name={icon} className="text-[15px]" />
        {label}
      </span>
      <span className="font-label-md text-label-md text-text-primary font-semibold">{value}</span>
      {note && <span className="font-caption text-caption text-text-tertiary">{note}</span>}
    </div>
  );
}

/** Compact results summary used in both the table and the mobile cards. */
function resultsSummary(campaign: CampaignRecord): string {
  const stats = campaign.stats;
  if (campaign.status === 'draft') return `Updated ${relativeWhen(campaign.updatedAt)}`;
  if (campaign.status === 'scheduled' && campaign.scheduledAt) return `Sends ${relativeWhen(campaign.scheduledAt)}`;
  if (!stats) return campaign.status === 'sending' ? 'Queued — awaiting provider' : 'No results yet';
  const parts: string[] = [];
  parts.push(`${formatNumber(stats.queued)} queued`);
  if (stats.sent !== undefined) parts.push(`${formatNumber(stats.sent)} sent`);
  if (stats.delivered !== undefined) parts.push(`${formatNumber(stats.delivered)} delivered`);
  if (stats.opened !== undefined) parts.push(`${formatNumber(stats.opened)} opened`);
  if (stats.clicked !== undefined) parts.push(`${formatNumber(stats.clicked)} clicked`);
  if (stats.failed !== undefined && stats.failed > 0) parts.push(`${formatNumber(stats.failed)} failed`);
  return parts.join(' · ');
}

function whenLabel(campaign: CampaignRecord): string {
  if (campaign.status === 'scheduled' && campaign.scheduledAt) return formatDateTime(campaign.scheduledAt);
  if (campaign.sentAt) return formatDateTime(campaign.sentAt);
  return formatDateTime(campaign.createdAt);
}

interface MenuAction {
  key: string;
  label: string;
  icon: string;
  onSelect: () => void;
  danger?: boolean;
}

function RowMenu({ actions, align = 'right' }: { actions: MenuAction[]; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Campaign actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-on-surface transition-colors"
      >
        <Icon name="more_vert" className="text-[20px]" />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-40 mt-1 w-56 rounded-xl bg-surface-canvas border border-border-subtle shadow-xl overflow-hidden ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {actions.map((action) => (
            <button
              key={action.key}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              className={`w-full flex items-center gap-space-sm px-space-sm py-2.5 text-left font-label-md text-label-md hover:bg-surface-subtle transition-colors ${
                action.danger ? 'text-on-error' : 'text-on-surface'
              }`}
            >
              <Icon name={action.icon} className="text-[18px]" />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ListHandlers {
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCancelScheduled: (id: string) => void;
  onDeleteDraft: (id: string) => void;
}

function actionsFor(campaign: CampaignRecord, handlers: ListHandlers): MenuAction[] {
  const actions: MenuAction[] = [{ key: 'view', label: 'View results', icon: 'visibility', onSelect: () => handlers.onOpen(campaign.id) }];
  if (campaign.status === 'draft') {
    actions.push({ key: 'edit', label: 'Edit draft', icon: 'edit', onSelect: () => handlers.onOpen(campaign.id) });
  }
  actions.push({ key: 'duplicate', label: 'Duplicate campaign', icon: 'content_copy', onSelect: () => handlers.onDuplicate(campaign.id) });
  if (campaign.status === 'scheduled') {
    actions.push({
      key: 'cancel',
      label: 'Cancel scheduled send',
      icon: 'event_busy',
      onSelect: () => handlers.onCancelScheduled(campaign.id),
    });
  }
  if (campaign.status === 'draft') {
    actions.push({
      key: 'delete',
      label: 'Delete draft',
      icon: 'delete',
      danger: true,
      onSelect: () => handlers.onDeleteDraft(campaign.id),
    });
  }
  return actions;
}

function DesktopCampaignTable({
  channel,
  campaigns,
  ...handlers
}: { channel: CampaignChannel; campaigns: CampaignRecord[] } & ListHandlers) {
  return (
    <div className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-subtle/60">
              {['Campaign', 'Status', 'Audience', 'Recipients', 'When', 'Results', ''].map((column, index) => (
                <th
                  key={column || index}
                  className="px-space-md py-space-sm font-label-sm text-label-sm text-text-secondary font-semibold whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="hover:bg-surface-subtle/60 cursor-pointer transition-colors"
                onClick={() => handlers.onOpen(campaign.id)}
              >
                <td className="px-space-md py-space-sm max-w-[280px]">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name={channel === 'sms' ? 'sms' : 'mail'} className="text-[18px]" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {campaign.name || 'Untitled campaign'}
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        {channel === 'sms'
                          ? (campaign.smsBody ?? '').replace(/\n/g, ' ').slice(0, 70)
                          : (campaign.emailSubject ?? 'No subject yet')}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-space-md py-space-sm">
                  <CampaignStatusBadge status={campaign.status} size="sm" />
                </td>
                <td className="px-space-md py-space-sm font-label-sm text-label-sm text-text-secondary whitespace-nowrap">
                  {campaign.audienceLabel}
                </td>
                <td className="px-space-md py-space-sm font-label-sm text-label-sm text-text-primary font-semibold whitespace-nowrap">
                  {formatNumber(campaign.recipientCount)}
                </td>
                <td className="px-space-md py-space-sm font-label-sm text-label-sm text-text-secondary whitespace-nowrap">
                  {whenLabel(campaign)}
                </td>
                <td className="px-space-md py-space-sm font-caption text-caption text-text-secondary min-w-[220px]">
                  {resultsSummary(campaign)}
                </td>
                <td className="px-space-md py-space-sm" onClick={(event) => event.stopPropagation()}>
                  <RowMenu actions={actionsFor(campaign, handlers)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobileCampaignCard({ campaign, ...handlers }: { campaign: CampaignRecord } & ListHandlers) {
  return (
    <article className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle overflow-hidden">
      <button type="button" onClick={() => handlers.onOpen(campaign.id)} className="w-full text-left p-space-sm">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-start gap-space-sm min-w-0">
            <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name={campaign.channel === 'sms' ? 'sms' : 'mail'} className="text-[18px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <h2 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                {campaign.name || 'Untitled campaign'}
              </h2>
              <span className="font-caption text-caption text-text-secondary line-clamp-2">
                {campaign.channel === 'sms'
                  ? (campaign.smsBody ?? '').replace(/\n/g, ' ')
                  : (campaign.emailSubject ?? 'No subject yet')}
              </span>
            </div>
          </div>
          <CampaignStatusBadge status={campaign.status} size="sm" />
        </div>

        <div className="mt-space-sm grid grid-cols-2 gap-space-2xs">
          <Cell label="Recipients" value={formatNumber(campaign.recipientCount)} />
          <Cell label="Audience" value={campaign.audienceLabel} truncate />
          <Cell label="When" value={whenLabel(campaign)} />
          <Cell label="Results" value={resultsSummary(campaign)} truncate />
        </div>
      </button>
      <div className="flex items-center justify-end px-space-xs py-space-2xs border-t border-border-subtle">
        <RowMenu actions={actionsFor(campaign, handlers)} />
      </div>
    </article>
  );
}

function Cell({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex flex-col rounded-lg bg-surface-subtle px-space-sm py-1.5 min-w-0">
      <span className="font-caption text-caption text-text-secondary">{label}</span>
      <span className={`font-label-sm text-label-sm text-text-primary font-medium ${truncate ? 'truncate' : ''}`}>{value}</span>
    </div>
  );
}

function EmptyCampaignState({
  filtered,
  channel,
  onCreate,
}: {
  filtered: boolean;
  channel: CampaignChannel;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle px-space-lg py-space-2xl flex flex-col items-center gap-space-sm text-center">
      <span className="w-14 h-14 rounded-2xl bg-surface-tint-blue text-primary flex items-center justify-center">
        <Icon name={filtered ? 'search_off' : channel === 'sms' ? 'sms' : 'mail'} className="text-[28px]" />
      </span>
      <h2 className="font-heading-sm text-heading-sm text-text-primary">
        {filtered ? 'No campaigns match your filters' : `No ${channel === 'sms' ? 'SMS' : 'email'} campaigns yet`}
      </h2>
      <p className="font-body-md text-body-md text-text-secondary max-w-md">
        {filtered
          ? 'Try a different status filter or clear the search to see every campaign.'
          : 'Create your first campaign to reach customers who have opted in — pick an audience, write the message and send now or schedule it.'}
      </p>
      {!filtered && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-space-xs h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
        >
          <Icon name="add_circle" className="text-[20px]" />
          <span>Create Campaign</span>
        </button>
      )}
    </div>
  );
}
