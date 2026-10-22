import { Icon } from '../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../desktop/DesktopModal';
import { SheetShell } from '../sheets/SheetShell';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { hasApiConfig } from '../../services/api/client';
import {
  CAMPAIGN_TIMEZONE,
  formatDateTime,
  formatNumber,
  type CampaignChannel,
} from '../../scripts/campaigns/campaignsData';
import type { SendMode } from './ScheduleControls';

export interface CampaignConfirmDialogProps {
  open: boolean;
  channel: CampaignChannel;
  campaignName: string;
  audienceLabel: string;
  recipientCount: number;
  excludedCount: number;
  sendMode: SendMode;
  scheduledAt?: number;
  /** SMS segments per recipient, shown when the message splits. */
  segments?: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Final confirmation before a campaign leaves the builder. The action is
 * explicitly disabled while submitting so a double click cannot queue twice.
 */
export function CampaignConfirmDialog(props: CampaignConfirmDialogProps) {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopConfirmDialog {...props} /> : <SheetConfirmDialog {...props} />;
}

function summaryRows(props: CampaignConfirmDialogProps): Array<{ icon: string; label: string; value: string }> {
  const rows = [
    { icon: props.channel === 'sms' ? 'sms' : 'mail', label: 'Channel', value: props.channel === 'sms' ? 'SMS campaign' : 'Email campaign' },
    { icon: 'groups', label: 'Audience', value: props.audienceLabel },
    { icon: 'how_to_reg', label: 'Eligible recipients', value: formatNumber(props.recipientCount) },
    { icon: 'block', label: 'Excluded', value: `${formatNumber(props.excludedCount)} contacts will not be sent to` },
  ];
  if (props.segments && props.segments > 1) {
    rows.push({
      icon: 'content_cut',
      label: 'Message length',
      value: `${props.segments} SMS segments per recipient`,
    });
  }
  if (props.sendMode === 'schedule' && props.scheduledAt) {
    rows.push({ icon: 'schedule', label: 'Scheduled for', value: formatDateTime(props.scheduledAt) });
    rows.push({ icon: 'public', label: 'Timezone', value: CAMPAIGN_TIMEZONE.long });
  } else {
    rows.push({ icon: 'bolt', label: 'Timing', value: hasApiConfig() ? 'Sent immediately after confirmation' : 'Queued immediately after confirmation' });
  }
  return rows;
}

function ConfirmBody(props: CampaignConfirmDialogProps & { onHeaderClose: () => void }) {
  return (
    <>
      <div className="p-space-md sm:p-space-xl space-y-space-md overflow-y-auto">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col gap-space-2xs">
            <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
              {props.channel === 'sms' ? 'Confirm SMS campaign' : 'Confirm email campaign'}
            </span>
            <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">
              {props.campaignName || 'Untitled campaign'}
            </h3>
          </div>
          <ModalCloseButton onClose={props.onHeaderClose} label="Close confirmation" />
        </div>

        <dl className="flex flex-col divide-y divide-border-subtle rounded-xl bg-surface-subtle overflow-hidden">
          {summaryRows(props).map((row) => (
            <div key={row.label} className="flex items-start gap-space-sm px-space-md py-space-sm">
              <Icon name={row.icon} className="text-primary text-[18px] shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <dt className="font-caption text-caption text-text-secondary">{row.label}</dt>
                <dd className="font-label-md text-label-md text-text-primary font-medium">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <p className="flex items-start gap-space-2xs rounded-lg bg-surface-tint-blue p-space-sm font-caption text-caption text-text-secondary leading-relaxed">
          <Icon name="info" className="text-primary text-[16px] shrink-0 mt-0.5" />
          {hasApiConfig()
            ? `Messages go out through VEMTAP and use this business’s ${props.channel === 'sms' ? 'SMS' : 'email'} credits. Customers who opted out of ${props.channel === 'sms' ? 'SMS' : 'email'} are skipped.`
            : 'This demo queues the campaign locally — no SMS or email provider is connected, so nothing leaves your device and delivery cannot be confirmed.'}
        </p>

        <div className="flex flex-col gap-space-xs">
          <button
            type="button"
            disabled={props.submitting}
            onClick={props.onConfirm}
            className="w-full h-[52px] rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all disabled:opacity-60 disabled:active:scale-100"
          >
            <Icon name={props.sendMode === 'schedule' ? 'schedule' : 'send'} className="text-[20px]" />
            {props.submitting
              ? 'Working…'
              : props.sendMode === 'schedule'
                ? 'Confirm schedule'
                : `${hasApiConfig() ? 'Send to' : 'Queue for'} ${formatNumber(props.recipientCount)} recipients`}
          </button>
          <button
            type="button"
            disabled={props.submitting}
            onClick={props.onCancel}
            className="w-full h-11 text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary transition-colors"
          >
            Go back and edit
          </button>
        </div>
      </div>
    </>
  );
}

function DesktopConfirmDialog(props: CampaignConfirmDialogProps) {
  return (
    <DesktopModal open={props.open} onClose={props.submitting ? () => undefined : props.onCancel} maxWidth="max-w-[560px]">
      <ConfirmBody {...props} onHeaderClose={props.onCancel} />
    </DesktopModal>
  );
}

function SheetConfirmDialog(props: CampaignConfirmDialogProps) {
  return (
    <SheetShell open={props.open} onClose={props.submitting ? () => undefined : props.onCancel}>
      <div className="pt-2 pb-1 flex justify-center">
        <span className="h-1 w-10 rounded-full bg-border" />
      </div>
      <ConfirmBody {...props} onHeaderClose={props.onCancel} />
    </SheetShell>
  );
}
