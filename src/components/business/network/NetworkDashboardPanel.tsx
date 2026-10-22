import { useState } from 'react';
import { Icon } from '../../ui/Icon';
import { ErrorState, LoadingRows } from '../QueryStates';
import { Card, InviteBusinessDialog, ProgressBar, ReferralRow } from './NetworkShared';
import { useNetworkSummary } from '../../../hooks/business/useBusinessNetwork';
import type { NetworkSummary } from '../../../services/businessNetworkService';

export interface NetworkNav {
  onOpenReferrals: () => void;
  onOpenReferral: (id: string) => void;
  onOpenMilestones: () => void;
  onOpenDiscovery: () => void;
}

const HOW_IT_WORKS = [
  { icon: 'share', title: 'Share your code', body: 'Send your referral link or QR to businesses you know.' },
  { icon: 'how_to_reg', title: 'They join & verify', body: 'A referral counts once the business passes verification.' },
  { icon: 'military_tech', title: 'Climb the ladder', body: 'Unlock discovery placement, credits and co-marketing perks.' },
];

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-sm flex flex-col gap-1">
      <span className="font-label-sm text-label-sm text-text-secondary">{label}</span>
      <span className="font-heading-md text-heading-md text-text-primary font-semibold">{value}</span>
      {hint ? <span className="font-caption text-caption text-text-tertiary">{hint}</span> : null}
    </div>
  );
}

function IntroHero({ onInvite }: { onInvite: () => void }) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-primary via-primary-container to-surface-tint-blue text-on-primary p-space-lg lg:p-space-xl flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-xs max-w-xl">
        <span className="inline-flex items-center gap-1 w-fit px-space-xs py-1 rounded-full bg-white/15 font-label-sm text-label-sm">
          <Icon name="diversity_3" className="text-[16px]" /> VemTap Business Network
        </span>
        <h2 className="font-heading-lg text-heading-lg">Grow the local network, grow your reach</h2>
        <p className="font-body-md text-body-md text-primary-fixed">
          Invite businesses near you. Every verified referral moves you up the milestone ladder.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        {HOW_IT_WORKS.map((step) => (
          <div key={step.title} className="rounded-xl bg-white/10 p-space-sm flex flex-col gap-1">
            <Icon name={step.icon} className="text-[22px]" />
            <span className="font-label-md text-label-md font-semibold">{step.title}</span>
            <span className="font-caption text-caption text-primary-fixed">{step.body}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onInvite}
        className="w-fit h-11 px-space-lg rounded-xl bg-surface-canvas text-primary font-button-primary text-button-primary inline-flex items-center gap-space-xs"
      >
        <Icon name="person_add" className="text-[20px]" /> Invite your first business
      </button>
    </section>
  );
}

function Dashboard({ summary, nav, onInvite }: { summary: NetworkSummary; nav: NetworkNav; onInvite: () => void }) {
  const delta = summary.joined.current - summary.joined.previous;
  const kmRadius = Math.round(summary.nearby.radiusMeters / 1000);

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
        <StatTile label="Total referrals" value={String(summary.counts.total)} />
        <StatTile label="Verified" value={String(summary.counts.verified)} hint={`${summary.counts.pending} in review`} />
        <StatTile
          label="Joined (30 days)"
          value={String(summary.joined.current)}
          hint={delta === 0 ? 'Same as last period' : `${delta > 0 ? '+' : ''}${delta} vs previous 30 days`}
        />
        <StatTile label="Conversion" value={`${Math.round(summary.conversionRate * 100)}%`} hint="Referrals that got verified" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-space-lg items-start">
        <div className="flex flex-col gap-space-lg min-w-0">
          <Card
            title="Milestone progress"
            action={
              <button type="button" onClick={nav.onOpenMilestones} className="font-label-md text-label-md text-primary hover:underline">
                All milestones
              </button>
            }
          >
            <div className="flex items-center gap-space-sm">
              <span className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
                <Icon name="military_tech" filled className="text-[26px]" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary">Current tier</span>
                <span className="font-heading-sm text-heading-sm text-text-primary">{summary.current?.name ?? 'No tier yet'}</span>
              </div>
            </div>
            {summary.next ? (
              <div className="flex flex-col gap-space-2xs">
                <ProgressBar value={summary.next.progress} />
                <span className="font-caption text-caption text-text-secondary">
                  {summary.next.remaining} more verified {summary.next.remaining === 1 ? 'referral' : 'referrals'} to reach {summary.next.name}
                </span>
              </div>
            ) : (
              <span className="font-caption text-caption text-badge-discount-text">Top tier reached — thank you for building the network.</span>
            )}
          </Card>

          <Card
            title="Recent referrals"
            action={
              <button type="button" onClick={nav.onOpenReferrals} className="font-label-md text-label-md text-primary hover:underline">
                View all
              </button>
            }
          >
            <div className="flex flex-col -mx-space-sm">
              {summary.recent.map((referral) => (
                <ReferralRow key={referral.id} referral={referral} onOpen={nav.onOpenReferral} />
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-space-lg">
          <Card title="Your referral code">
            <span className="font-heading-lg text-heading-lg tracking-widest font-mono text-text-primary">{summary.referralCode}</span>
            <button
              type="button"
              onClick={onInvite}
              className="h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center justify-center gap-space-xs"
            >
              <Icon name="person_add" className="text-[18px]" /> Invite a business
            </button>
          </Card>

          <Card title="Nearby merchants">
            <span className="font-caption text-caption text-text-secondary">
              {summary.nearby.total} VemTap businesses within {kmRadius} km of your main branch
            </span>
            <ul className="flex flex-col gap-space-xs">
              {summary.nearby.merchants.map((merchant) => (
                <li key={merchant.branchId} className="flex items-center justify-between gap-space-xs">
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary truncate">{merchant.businessName ?? merchant.name}</span>
                    <span className="font-caption text-caption text-text-tertiary truncate">{merchant.category ?? merchant.name}</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-text-secondary shrink-0">
                    {merchant.distanceMeters < 1000 ? `${merchant.distanceMeters} m` : `${(merchant.distanceMeters / 1000).toFixed(1)} km`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <button
            type="button"
            onClick={nav.onOpenDiscovery}
            className="flex items-center gap-space-sm p-space-md rounded-xl bg-surface-tint-blue text-left hover:bg-surface-container-low"
          >
            <Icon name="travel_explore" className="text-[22px] text-primary" />
            <span className="flex flex-col flex-1">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Discovery presence</span>
              <span className="font-caption text-caption text-text-secondary">How customers find you in the discovery feed</span>
            </span>
            <Icon name="chevron_right" className="text-[20px] text-text-tertiary" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Business Network home: intro when nothing has happened yet, the live dashboard after. */
export function NetworkDashboardPanel({ nav }: { nav: NetworkNav }) {
  const summary = useNetworkSummary();
  const [inviteOpen, setInviteOpen] = useState(false);

  if (summary.isLoading) return <LoadingRows rows={4} label="Loading your network" />;
  if (summary.isError || !summary.data)
    return <ErrorState title="Could not load your network" error={summary.error} onRetry={() => summary.refetch()} />;

  const data = summary.data;
  return (
    <>
      {data.counts.total === 0 ? (
        <IntroHero onInvite={() => setInviteOpen(true)} />
      ) : (
        <Dashboard summary={data} nav={nav} onInvite={() => setInviteOpen(true)} />
      )}
      <InviteBusinessDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        referralCode={data.referralCode}
        referralLink={data.referralLink}
      />
    </>
  );
}
