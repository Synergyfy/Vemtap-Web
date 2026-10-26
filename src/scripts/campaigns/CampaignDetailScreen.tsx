import { Icon } from '../../components/ui/Icon';
import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { messageCampaignsService } from '../../services/messageCampaignsService';
import { CampaignStatusBadge } from '../../components/campaigns/CampaignStatusBadge';
import { CampaignShell } from './CampaignShell';
import type { BusinessTabKey } from '../../components/BusinessTabBar';
import {
  BUSINESS_NAME,
  CAMPAIGN_TIMEZONE,
  analyseSms,
  estimateSmsCost,
  formatDateTime,
  formatNaira,
  formatNumber,
  renderPersonalisation,
  type CampaignChannel,
  type CampaignHistoryEntry,
  type CampaignRecord,
} from './campaignsData';

export interface CampaignDetailScreenProps {
  campaign: CampaignRecord;
  isDesktop: boolean;
  onNav: (key: string) => void;
  onTab: (tab: BusinessTabKey) => void;
  onBack: () => void;
  onEditDraft: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCancelScheduled: (id: string) => void;
  /** Shown right after a campaign was scheduled or queued from the builder. */
  banner?: string | null;
}

/**
 * Screen 3 — one reusable detail view for both channels: content, audience,
 * schedule, delivery and engagement numbers (only where the data exists) and
 * the campaign activity timeline.
 */
export function CampaignDetailScreen({
  campaign,
  isDesktop,
  onNav,
  onTab,
  onBack,
  onEditDraft,
  onDuplicate,
  onCancelScheduled,
  banner,
}: CampaignDetailScreenProps) {
  const live = hasApiConfig();
  const sentOrSending = campaign.status === 'sent' || campaign.status === 'sending';
  // Live: delivery counts come from the server (message statuses + tracked clicks).
  const liveStats = useQuery({
    queryKey: ['campaign-stats', campaign.id],
    queryFn: () => messageCampaignsService.stats(campaign.id),
    enabled: live && sentOrSending,
    refetchInterval: 60_000,
  });
  const stats = liveStats.data
    ? {
        queued: liveStats.data.queued + liveStats.data.sent + liveStats.data.failed,
        sent: liveStats.data.sent,
        delivered: liveStats.data.delivered,
        failed: liveStats.data.failed,
        clicked: liveStats.data.clicks,
        bounced: undefined,
        opened: undefined,
      }
    : campaign.stats;
  const channel: CampaignChannel = campaign.channel;
  const segments = analyseSms(campaign.smsBody ?? '');
  const cost = estimateSmsCost(segments.segments, campaign.recipientCount);
  const desktopHeader = (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
      <div className="flex flex-col gap-space-2xs max-w-3xl">
        <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
          Messages · {channel === 'sms' ? 'SMS' : 'Email'} · Results
        </span>
        <div className="flex flex-wrap items-center gap-space-sm">
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            {campaign.name || 'Untitled campaign'}
          </h1>
          <CampaignStatusBadge status={campaign.status} />
        </div>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{timelineCaption(campaign)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-space-xs">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-space-md rounded-xl border border-border-subtle bg-surface-canvas font-button-secondary text-button-secondary text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs transition-colors"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Campaigns</span>
        </button>
        {campaign.status === 'draft' && (
          <button
            type="button"
            onClick={() => onEditDraft(campaign.id)}
            className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
          >
            <Icon name="edit" className="text-[18px]" />
            <span>Edit draft</span>
          </button>
        )}
        {campaign.status === 'scheduled' && (
          <button
            type="button"
            onClick={() => onCancelScheduled(campaign.id)}
            className="h-11 px-space-md rounded-xl border border-error text-on-error font-button-secondary text-button-secondary hover:bg-error-container/40 flex items-center gap-space-2xs transition-colors"
          >
            <Icon name="event_busy" className="text-[18px]" />
            <span>Cancel scheduled send</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDuplicate(campaign.id)}
          className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
        >
          <Icon name="content_copy" className="text-[18px]" />
          <span>Duplicate campaign</span>
        </button>
      </div>
    </section>
  );

  return (
    <CampaignShell
      channel={channel}
      isDesktop={isDesktop}
      onNav={onNav}
      onTab={onTab}
      onBack={onBack}
      mobileTitle={campaign.name || 'Campaign'}
      desktopHeader={desktopHeader}
    >
      <div className="flex flex-col gap-space-lg px-space-md md:px-0 py-space-md md:py-0">
        {/* Mobile heading */}
        <div className="flex flex-col gap-space-2xs md:hidden">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
              {channel === 'sms' ? 'SMS campaign' : 'Email campaign'}
            </span>
            <CampaignStatusBadge status={campaign.status} size="sm" />
          </div>
          <p className="font-body-md text-body-md text-text-secondary">{timelineCaption(campaign)}</p>
        </div>

        {banner && (
          <p className="flex items-start gap-space-2xs rounded-xl bg-badge-discount-bg px-space-md py-space-sm font-label-md text-label-md text-badge-discount-text">
            <Icon name="check_circle" className="text-[18px] shrink-0 mt-0.5" />
            {banner}
          </p>
        )}

        {campaign.simulatedSend && !live && (
          <p className="flex items-start gap-space-2xs rounded-xl bg-surface-tint-blue px-space-md py-space-sm font-caption text-caption text-text-secondary leading-relaxed">
            <Icon name="info" className="text-primary text-[16px] shrink-0 mt-0.5" />
            This campaign was queued locally for demonstration. Nothing left your device, and sent, delivered, opened or
            clicked numbers will only appear once an SMS or email provider reports them.
          </p>
        )}

        {/* Key numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
          <Fact icon="groups" label="Eligible recipients" value={formatNumber(campaign.recipientCount)} />
          <Fact icon="block" label="Excluded" value={formatNumber(campaign.excludedCount)} />
          {channel === 'sms' ? (
            <>
              <Fact icon="content_cut" label="Segments / recipient" value={formatNumber(Math.max(segments.segments, 1))} />
              <Fact
                icon="payments"
                label="Estimated cost"
                value={cost ? `${formatNumber(cost.credits)} credits` : 'Unavailable'}
                note={cost ? `about ${formatNaira(cost.naira)} · demo estimate` : 'No pricing data'}
              />
            </>
          ) : (
            <>
              <Fact icon="schedule" label="Scheduled" value={campaign.scheduledAt ? formatDateTime(campaign.scheduledAt) : 'Not scheduled'} note={campaign.scheduledAt ? CAMPAIGN_TIMEZONE.long : undefined} />
              <Fact icon="event" label="Created" value={formatDateTime(campaign.createdAt)} />
            </>
          )}
        </div>

        {/* Delivery / engagement */}
        {stats ? (
          <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg">
            <h2 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">
              {channel === 'sms' ? 'Delivery' : 'Delivery & engagement'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <Metric label="Queued" value={stats.queued} icon="cell_tower" missing="Held in this demo" />
              <Metric label="Sent" value={stats.sent} icon={channel === 'sms' ? 'sms' : 'mail'} missing="Awaiting provider" />
              <Metric label="Delivered" value={stats.delivered} icon="done_all" missing="Awaiting provider" />
              {channel === 'sms' ? (
                <Metric label="Failed" value={stats.failed} icon="error" missing="None reported" />
              ) : (
                <>
                  <Metric label="Bounced" value={stats.bounced} icon="alternate_email" missing="None reported" />
                  <Metric label="Opened" value={stats.opened} icon="mark_email_read" missing="Awaiting provider" />
                  <Metric label="Clicked" value={stats.clicked} icon="mouse" missing="Awaiting provider" />
                  <Metric label="Failed" value={stats.failed} icon="error" missing="None reported" />
                </>
              )}
            </div>
            <p className="font-caption text-caption text-text-tertiary mt-space-sm">
              Queued means the campaign was accepted for sending, sent means the provider confirmed hand-off, and delivered
              means the recipient carrier or inbox confirmed receipt. Numbers appear only when reported.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg flex items-start gap-space-sm">
            <Icon name="hourglass_empty" className="text-text-tertiary text-[22px] shrink-0" />
            <div className="flex flex-col">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">No delivery data yet</h2>
              <p className="font-body-md text-body-md text-text-secondary">
                {campaign.status === 'draft'
                  ? 'This campaign has not been sent. Open it as a draft to finish and send it.'
                  : campaign.status === 'scheduled'
                    ? `Scheduled for ${formatDateTime(campaign.scheduledAt ?? Date.now())}. Delivery numbers appear after the send.`
                    : 'Your messaging provider has not reported any events for this campaign yet.'}
              </p>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
          {/* Audience */}
          <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg flex flex-col gap-space-sm">
            <h2 className="font-heading-sm text-heading-sm text-text-primary">Audience</h2>
            <div className="flex items-center gap-space-sm rounded-xl bg-surface-subtle p-space-sm">
              <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="groups" className="text-[20px]" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary font-semibold">{campaign.audienceLabel}</span>
                <span className="font-caption text-caption text-text-secondary">
                  {formatNumber(campaign.recipientCount)} eligible · {formatNumber(campaign.excludedCount)} excluded
                </span>
              </div>
            </div>
            {campaign.exclusionBreakdown.length > 0 && (
              <div className="flex flex-wrap gap-space-2xs">
                {campaign.exclusionBreakdown.map((entry) => (
                  <span
                    key={entry.reason}
                    className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-error-container/60 font-caption text-caption text-on-error"
                  >
                    <span className="font-semibold">{formatNumber(entry.count)}</span>
                    {entry.label}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Content */}
          <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg flex flex-col gap-space-sm">
            <h2 className="font-heading-sm text-heading-sm text-text-primary">Message</h2>
            {channel === 'sms' ? (
              <>
                <div className="rounded-2xl bg-on-surface p-space-sm">
                  <div className="rounded-xl bg-white px-space-sm py-space-2xs">
                    <p className="font-body-md text-body-md text-text-primary whitespace-pre-wrap break-words leading-snug">
                      {renderPersonalisation(campaign.smsBody ?? '').trim() || 'No message content.'}
                    </p>
                  </div>
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  {formatNumber(segments.characters)} characters · {segments.encoding} encoding ·{' '}
                  {formatNumber(Math.max(segments.segments, 1))} segment
                  {segments.segments === 1 ? '' : 's'} per recipient
                </p>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-border-subtle overflow-hidden">
                  <div className="px-space-sm py-space-2xs bg-surface-subtle border-b border-border-subtle">
                    <p className="font-label-sm text-label-sm text-text-primary font-semibold break-words">
                      {renderPersonalisation(campaign.emailSubject ?? '') || 'No subject'}
                    </p>
                    {(campaign.emailPreheader ?? '').trim() && (
                      <p className="font-caption text-caption text-text-secondary break-words">{campaign.emailPreheader}</p>
                    )}
                    <p className="font-caption text-caption text-text-tertiary mt-0.5">
                      From {campaign.senderName || BUSINESS_NAME} &lt;{campaign.senderEmail || 'not configured'}&gt;
                    </p>
                  </div>
                  <div className="px-space-sm py-space-sm font-body-md text-body-md text-text-primary whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                    {renderPersonalisation(campaign.emailBody ?? '') || 'No content yet.'}
                  </div>
                  <div className="px-space-sm py-space-2xs border-t border-border-subtle">
                    <p className="font-caption text-caption text-text-tertiary">
                      Unsubscribe link is added automatically by your email provider.
                    </p>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {/* Timeline */}
        <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg">
          <h2 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">Activity</h2>
          <ol className="flex flex-col">
            {[...campaign.history]
              .sort((a, b) => b.at - a.at)
              .map((entry, index) => (
                <TimelineRow key={`${entry.at}-${index}`} entry={entry} isLast={index === campaign.history.length - 1} />
              ))}
          </ol>
        </section>

        {/* Mobile actions */}
        <div className="flex flex-col gap-space-xs md:hidden pb-space-md">
          {campaign.status === 'draft' && (
            <button
              type="button"
              onClick={() => onEditDraft(campaign.id)}
              className="h-12 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
            >
              <Icon name="edit" className="text-[18px]" />
              <span>Edit draft</span>
            </button>
          )}
          {campaign.status === 'scheduled' && (
            <button
              type="button"
              onClick={() => onCancelScheduled(campaign.id)}
              className="h-12 rounded-xl border border-error text-on-error font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs"
            >
              <Icon name="event_busy" className="text-[18px]" />
              <span>Cancel scheduled send</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onDuplicate(campaign.id)}
            className="h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
          >
            <Icon name="content_copy" className="text-[18px]" />
            <span>Duplicate campaign</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="h-12 rounded-xl border border-border-subtle bg-surface-canvas font-button-secondary text-button-secondary text-on-surface-variant flex items-center justify-center gap-space-2xs"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to campaigns</span>
          </button>
        </div>
      </div>
    </CampaignShell>
  );
}

function timelineCaption(campaign: CampaignRecord): string {
  if (campaign.status === 'scheduled' && campaign.scheduledAt) return `Scheduled for ${formatDateTime(campaign.scheduledAt)}`;
  if (campaign.sentAt) return `Sent ${formatDateTime(campaign.sentAt)}`;
  if (campaign.status === 'paused') return `Paused ${formatDateTime(campaign.updatedAt)}`;
  return `Draft created ${formatDateTime(campaign.createdAt)}`;
}

const HISTORY_ICONS: Record<CampaignHistoryEntry['kind'], string> = {
  created: 'edit_note',
  edited: 'edit',
  saved: 'draft',
  scheduled: 'schedule',
  cancelled: 'event_busy',
  queued: 'cell_tower',
  sent: 'check_circle',
  failed: 'error',
  duplicated: 'content_copy',
};

function TimelineRow({ entry, isLast }: { entry: CampaignHistoryEntry; isLast: boolean }) {
  return (
    <li className="flex items-start gap-space-sm">
      <div className="flex flex-col items-center shrink-0">
        <span className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
          <Icon name={HISTORY_ICONS[entry.kind]} className="text-[16px]" />
        </span>
        {!isLast && <span className="w-px flex-1 bg-border-subtle my-1" />}
      </div>
      <div className="flex flex-col min-w-0 pb-space-sm">
        <span className="font-label-md text-label-md text-text-primary font-medium">{entry.label}</span>
        <span className="font-caption text-caption text-text-secondary">{formatDateTime(entry.at)}</span>
      </div>
    </li>
  );
}

function Fact({ icon, label, value, note }: { icon: string; label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-2xs">
      <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
        <Icon name={icon} className="text-[20px]" />
      </span>
      <span className="font-heading-sm text-heading-sm text-text-primary font-bold leading-tight mt-1 break-words">{value}</span>
      <span className="font-label-sm text-label-sm text-text-secondary">{label}</span>
      {note && <span className="font-caption text-caption text-text-tertiary">{note}</span>}
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  missing,
}: {
  label: string;
  value?: number;
  icon: string;
  missing: string;
}) {
  return (
    <div className="rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-space-2xs">
      <span className="flex items-center gap-1 font-caption text-caption text-text-secondary">
        <Icon name={icon} className="text-[15px]" />
        {label}
      </span>
      {value === undefined ? (
        <>
          <span className="font-label-md text-label-md text-text-tertiary font-semibold">—</span>
          <span className="font-caption text-caption text-text-tertiary">{missing}</span>
        </>
      ) : (
        <span className="font-label-md text-label-md text-text-primary font-semibold">{formatNumber(value)}</span>
      )}
    </div>
  );
}
