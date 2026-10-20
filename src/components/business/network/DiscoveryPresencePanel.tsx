import { Icon } from '../../ui/Icon';
import { ErrorState, LoadingRows } from '../QueryStates';
import { SwitchRow } from '../FormPrimitives';
import { Card, ProgressBar } from './NetworkShared';
import { useDiscoveryPresence, useUpdateDiscoverySettings } from '../../../hooks/business/useBusinessNetwork';
import type { DiscoveryPresence, DiscoverySettings } from '../../../services/businessNetworkService';
import { formatNaira } from '../../../utils/format';

const CHECK_LABEL: Record<string, string> = {
  logo: 'Logo uploaded',
  cover: 'Cover image',
  description: 'Business description',
  category: 'Category set',
  hours: 'Opening hours',
  location: 'Location pinned',
  catalogue: 'Catalogue items',
  liveDeal: 'A live deal',
  verified: 'Business verified',
  discoverable: 'Discovery enabled',
};

const SETTING_COPY: { key: keyof DiscoverySettings; title: string; body: string }[] = [
  { key: 'joinDiscoveryNetwork', title: 'Show me in discovery', body: 'Appear in the consumer discovery feed and nearby search' },
  { key: 'receivePartnerRequests', title: 'Partner requests', body: 'Let nearby businesses invite you to cross-promotions' },
  { key: 'allowPromotions', title: 'Network promotions', body: 'Include your deals in VemTap-run area campaigns' },
  { key: 'pushNotifications', title: 'Push notifications', body: 'Alerts when your listing gets traction' },
  { key: 'smsAlerts', title: 'SMS alerts', body: 'Text messages for important discovery updates' },
  { key: 'emailSummary', title: 'Weekly email summary', body: 'Visits, claims and saves every Monday' },
];

function topDealLabel(deal: NonNullable<DiscoveryPresence['card']['topDeal']>) {
  if (deal.pricingType === 'percentage' && deal.discountValue) return `${deal.discountValue}% off`;
  if (deal.discountValue) return `${formatNaira(deal.discountValue)} off`;
  if (deal.price) return formatNaira(deal.price);
  return 'Live deal';
}

function FeedCardPreview({ card }: { card: DiscoveryPresence['card'] }) {
  return (
    <div className="rounded-xl overflow-hidden bg-surface-canvas shadow-md border border-border-subtle max-w-sm">
      <div className="h-32 bg-gradient-to-br from-primary-container to-surface-tint-blue relative">
        {card.coverImage ? <img src={card.coverImage} alt="" className="w-full h-full object-cover" /> : null}
        {card.topDeal ? (
          <span className="absolute top-space-xs left-space-xs px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-semibold">
            {topDealLabel(card.topDeal)}
          </span>
        ) : null}
      </div>
      <div className="p-space-sm flex flex-col gap-1">
        <span className="font-heading-sm text-heading-sm text-text-primary">{card.name ?? 'Your business'}</span>
        <span className="font-caption text-caption text-text-secondary">
          {[card.category, card.locality].filter(Boolean).join(' · ')}
        </span>
        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-text-primary">
          <Icon name="star" filled className="text-[14px] text-amber-500" />
          {card.rating?.toFixed(1) ?? '—'} <span className="text-text-tertiary">({card.reviews})</span>
        </span>
        {card.topDeal?.name ? <span className="font-caption text-caption text-primary truncate">{card.topDeal.name}</span> : null}
      </div>
    </div>
  );
}

/** How the business appears in consumer discovery, and the switches that control it. */
export function DiscoveryPresencePanel() {
  const presence = useDiscoveryPresence();
  const update = useUpdateDiscoverySettings(presence.data?.branch.id);

  if (presence.isLoading) return <LoadingRows rows={4} label="Loading discovery presence" />;
  if (presence.isError || !presence.data)
    return <ErrorState title="Could not load discovery presence" error={presence.error} onRetry={() => presence.refetch()} />;

  const data = presence.data;
  const checks = Object.entries(data.health.checks);
  const delta = data.engagement.previous ? (data.engagement.current - data.engagement.previous) / data.engagement.previous : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
      <div className="flex flex-col gap-space-lg">
        <Card title="What customers see">
          <FeedCardPreview card={data.card} />
        </Card>

        <Card title="Profile health">
          <div className="flex items-end gap-space-xs">
            <span className="font-heading-lg text-heading-lg text-text-primary font-bold">{data.health.score}</span>
            <span className="font-label-md text-label-md text-text-secondary pb-1">/ 100</span>
          </div>
          <ProgressBar value={data.health.score / 100} />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            {checks.map(([key, done]) => (
              <li key={key} className="flex items-center gap-space-xs font-body-md text-body-md">
                <Icon
                  name={done ? 'check_circle' : 'radio_button_unchecked'}
                  filled={done}
                  className={`text-[18px] ${done ? 'text-badge-discount-text' : 'text-text-tertiary'}`}
                />
                <span className={done ? 'text-text-primary' : 'text-text-secondary'}>{CHECK_LABEL[key] ?? key}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-col gap-space-lg">
        <div className="grid grid-cols-2 gap-space-sm">
          <Card>
            <span className="font-label-sm text-label-sm text-text-secondary">Engagement (7 days)</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{data.engagement.current}</span>
            <span className={`font-caption text-caption ${delta >= 0 ? 'text-badge-discount-text' : 'text-red-600'}`}>
              {delta >= 0 ? '+' : ''}
              {Math.round(delta * 100)}% vs previous week
            </span>
          </Card>
          <Card>
            <span className="font-label-sm text-label-sm text-text-secondary">Indexed</span>
            <span className="font-body-md text-body-md text-text-primary">{data.index.catalogueItems} items</span>
            <span className="font-body-md text-body-md text-text-primary">{data.index.liveDeals} live deals</span>
            <span className="font-body-md text-body-md text-text-primary">{data.index.bookableServices} bookable services</span>
          </Card>
        </div>

        <Card title="Discovery zones">
          <ul className="flex flex-col gap-space-xs">
            {data.zones.map((zone) => (
              <li key={zone.id} className="flex items-center justify-between gap-space-xs">
                <span className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate">{zone.name}</span>
                  <span className="font-caption text-caption text-text-tertiary truncate">{zone.area}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${
                    zone.active ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
                  }`}
                >
                  {zone.active ? 'Active' : 'Inactive'}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Discovery settings">
          {SETTING_COPY.map((setting) => (
            <SwitchRow
              key={setting.key}
              title={setting.title}
              body={setting.body}
              checked={data.settings[setting.key]}
              onChange={(next) => update.mutate({ [setting.key]: next })}
            />
          ))}
          {update.isError ? <span className="font-caption text-caption text-red-600">{update.error.message}</span> : null}
          <span className="font-caption text-caption text-text-tertiary">Only the business owner can change these settings.</span>
        </Card>
      </div>
    </div>
  );
}
