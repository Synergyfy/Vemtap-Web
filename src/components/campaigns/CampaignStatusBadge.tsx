import { Icon } from '../ui/Icon';
import { STATUS_META, type CampaignStatus } from '../../scripts/campaigns/campaignsData';

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  size?: 'sm' | 'md';
}

/** Shared status pill for campaign rows, cards and the detail header. */
export function CampaignStatusBadge({ status, size = 'md' }: CampaignStatusBadgeProps) {
  const meta = STATUS_META[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-2.5 py-1 text-label-sm';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-label-md font-semibold whitespace-nowrap ${padding} ${meta.badgeClass}`}
    >
      <Icon name={meta.icon} className={size === 'sm' ? 'text-[13px]' : 'text-[15px]'} />
      {meta.label}
    </span>
  );
}

/** Small dot + label used where a full pill is too heavy (history, tables). */
export function CampaignStatusDot({ status }: { status: CampaignStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-text-secondary whitespace-nowrap">
      <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
}
