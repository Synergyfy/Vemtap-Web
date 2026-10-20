import { HowItWorks } from './HowItWorks';
import { ReferralCodeCard } from './ReferralCodeCard';
import { ReferralShareRow } from './ReferralShareRow';
import { ReferralStatGrid } from './ReferralStatGrid';
import { useReferralIdentity } from '../../hooks/useReferralIdentity';
import { CUSTOMER_HOW_IT_WORKS, REFERRAL_REWARDS_DISCLAIMER } from '../../scripts/referralData';
import { Icon } from '../ui/Icon';

const POINT_STATS = [
  { id: 'points', label: 'Available points', value: '0', icon: 'stars' },
  { id: 'referrals', label: 'Total successful referrals', value: '0', icon: 'how_to_reg' },
  { id: 'businesses', label: 'Businesses referred', value: '0', icon: 'storefront' },
  { id: 'consumers', label: 'Consumers referred', value: '0', icon: 'group' },
  { id: 'earned', label: 'Total points earned', value: '0', icon: 'trending_up' },
  { id: 'redeemed', label: 'Redeemed rewards', value: '0', icon: 'redeem' },
];

function EmptyPanel({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-xl flex flex-col items-center gap-space-xs text-center">
      <span className="w-12 h-12 rounded-full bg-surface-subtle text-text-tertiary flex items-center justify-center">
        <Icon name={icon} className="text-[24px]" />
      </span>
      <p className="font-label-md text-label-md text-text-primary font-semibold">{title}</p>
      <p className="font-caption text-caption text-text-secondary max-w-sm leading-relaxed">{message}</p>
    </section>
  );
}

/**
 * Body of the customer "Referrals & Rewards" page, shared by the mobile and
 * desktop shells.
 *
 * Points, rewards and challenges are all rendered as empty states — the
 * programme has no backend yet, so no balance, business or offer is invented.
 */
export function CustomerReferralsContent() {
  const identity = useReferralIdentity();

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-2xs">
        <h2 className="font-heading-md text-heading-md text-text-primary font-semibold tracking-tight">
          Referrals & Rewards
        </h2>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          Bring businesses and friends onto VEMTAP. Qualifying referrals may earn Points when the programme launches.
        </p>
      </div>

      <ReferralStatGrid
        columns={6}
        stats={POINT_STATS}
        note="Points aren’t live yet, so every tile starts at zero. Your balance and referral history appear here once the programme launches."
      />

      {/* Invite a business */}
      <ReferralCodeCard
        audience="business"
        /* This is a customer inviting a business, so the viewer is still a
           customer — they must see customer benefits, not business ones. */
        accountType="customer"
        code={identity.code}
        link={identity.link}
        title="Invite a business"
        description="Know a business that should be on VEMTAP? Send them your link — it helps local customers find them through deals, menus and offers."
      />

      {/* Invite friends */}
      <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="w-8 h-8 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
            <Icon name="group_add" className="text-[18px]" />
          </span>
          <h3 className="font-label-md text-label-md text-text-primary font-semibold">Invite friends</h3>
        </div>
        <p className="font-caption text-caption text-text-secondary leading-relaxed">
          Invite friends to discover local businesses and deals around them. They join with the same link — no separate
          code needed.
        </p>

        <div className="rounded-xl bg-surface-subtle border border-border-subtle px-space-sm py-space-xs flex items-center gap-space-2xs">
          <Icon name="link" className="text-[15px] text-text-tertiary shrink-0" />
          <span className="font-caption text-caption text-text-secondary truncate" title={identity.link}>
            {identity.link}
          </span>
        </div>

        <ReferralShareRow audience="customer" layout="inline" link={identity.link} showNativeShare />
      </section>

      <HowItWorks disclaimer={REFERRAL_REWARDS_DISCLAIMER} steps={CUSTOMER_HOW_IT_WORKS} />

      <EmptyPanel
        icon="redeem"
        message="Rewards will appear here when the programme launches, including participating-business discounts and the points each one needs."
        title="No rewards available yet"
      />

      <EmptyPanel
        icon="emoji_events"
        message="Referral challenges are coming soon. Campaigns, leaderboards and prizes will show up here."
        title="Referral challenges coming soon"
      />
    </div>
  );
}
