import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { EnterpriseShell } from './EnterpriseShell';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import type { LoyaltyReward } from '../../services/loyaltyService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import {
  useLoyaltyLogs,
  useLoyaltyMutations,
  useLoyaltyRewards,
  useLoyaltyStats,
} from '../../hooks/business/useLoyalty';
import {
  REWARD_CATEGORY_LABEL,
  isRedemption,
  logEntry,
  pointsLabel,
  rewardRedeemedLabel,
  rewardStatus,
  rewardStockLabel,
  rewardWindowLabel,
  statChange,
  statValue,
  type RewardStatus,
} from '../loyaltyLive';

interface DesktopLoyaltyRewardsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onOpenProgramme?: () => void;
}

interface RewardCard {
  title: string;
  kind: string;
  kindClass: string;
  costLabel: string;
  cost: string;
  image: string;
  imageAlt: string;
  locationIcon: string;
  locationClass: string;
  location: string;
  stockIcon: string;
  stockClass: string;
  stock: string;
  description: string;
  metricIcon: string;
  metricValue: string;
  metricNote: string;
  metricTag: string;
  metricTagClass: string;
  /** Live: the reward this card shows, and whether it runs, is paused or has ended. */
  live?: LoyaltyReward;
  status?: RewardStatus;
}

const STATUS_LABEL: Record<RewardStatus, string> = { active: 'Active', draft: 'Paused', archived: 'Ended' };

/** A live reward in the card shape, styled like the sample cards. */
function liveRewardCard(reward: LoyaltyReward, branchName: string): RewardCard {
  const status = rewardStatus(reward);
  return {
    ...REWARD_CARDS[0],
    title: reward.name,
    kind: REWARD_CATEGORY_LABEL[reward.category] ?? 'Reward',
    costLabel: 'Points to redeem',
    cost: `${pointsLabel(reward.pointsRequired)} Pts`,
    image: reward.coverImage ?? '',
    imageAlt: reward.name,
    location: branchName,
    stockIcon: reward.totalQuantity != null && reward.totalQuantity >= 0 ? 'inventory_2' : 'all_inclusive',
    stock: rewardStockLabel(reward),
    description: reward.description || '—',
    metricIcon: 'redeem',
    metricValue: rewardRedeemedLabel(reward),
    metricNote: rewardWindowLabel(reward),
    metricTag: STATUS_LABEL[status],
    metricTagClass:
      status === 'active' ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-on-surface-variant',
    live: reward,
    status,
  };
}

const REWARD_CARDS: RewardCard[] = [
  {
    title: '₦2,500 Dining Voucher',
    kind: 'Voucher',
    kindClass: 'bg-surface-canvas/90 backdrop-blur text-text-primary font-medium',
    costLabel: 'Immediate Deduct',
    cost: '500 Pts',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YC_0xUX-QplenKykKwKzJn5gZpuibwbBKc3qbtMqLsx3WANYoIqNm3FzbACdfBGXsESCQXa_8ytM3LWaKipJ-wOjdcsD61uOAHtYNa3QKA8IVzxVxpJWU_rfOd_b_KH5FUuo3D_vgE0QKGDBV1HuiifeqgesX3x-QvI8jhp1E3oIA9qscGQrCS26iznbjwFIIfxFWsuAiNnFPs_Pe0vVuqj-THNzVFd_mfKs6ULBy7vbfA_u25u7TA',
    imageAlt:
      'Happy modern Nigerian patrons dining in an ambient upscale restaurant in Abuja, elegant food presentation with sizzling jollof rice platters, warm mood lighting and cheerful hospitality atmosphere in brand tones of deep navy and gold.',
    locationIcon: 'store',
    locationClass: 'text-primary',
    location: 'All Branches (Wuse & VI)',
    stockIcon: 'all_inclusive',
    stockClass: 'text-badge-discount-text',
    stock: 'Unlimited Stock',
    description:
      'Valid as direct deduction off total food and beverages on any dine-in bill exceeding ₦5,000 threshold.',
    metricIcon: 'trending_up',
    metricValue: '48 redemptions',
    metricNote: 'Logged this current month',
    metricTag: '98% Satisfaction',
    metricTagClass: 'bg-badge-discount-bg text-badge-discount-text',
  },
  {
    title: 'Artisan Chef Dessert',
    kind: 'Kitchen Treat',
    kindClass: 'bg-surface-canvas/90 backdrop-blur text-text-primary font-medium',
    costLabel: 'Complimentary Dish',
    cost: '350 Pts',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8SiRJGlk6DeU8in3uedTzGptOecdNUWVouYFojBg8Fb_Yc57hJb3hWAgGpgaUQIWseQuDWuwn0n7jjpxJQ6rczLoddGq4GFAC6S4D1GOetXuIuextX9FTEx4Td35RdG9C4fXctmnYFZe_giXrm4AeLcUrHmlk7iNdd63QqR58JTAEJux6sv_hdBS_XvGRMIqWpRVmDkBa8pK1QZbFgGTVD81Iyf6dMElSLteFA1ekWL3LZIrVNwn9ZQ',
    imageAlt:
      'Gourmet decadent chocolate lava cake with warm melting center, artisanal vanilla bean gelato, fresh wild berry compote drizzle and edible gold leaf garnish on clean white porcelain plate in contemporary Abuja fine-dining bistro.',
    locationIcon: 'pin_drop',
    locationClass: 'text-tertiary',
    location: 'Wuse II Branch Only',
    stockIcon: 'inventory_2',
    stockClass: 'text-tertiary-container',
    stock: '25 Daily Cap',
    description:
      'Signature molten lava cake or seasonal sorbet awarded complimentary alongside any main course order.',
    metricIcon: 'bakery_dining',
    metricValue: '19 claimed this week',
    metricNote: 'Kitchen inventory synced',
    metricTag: 'Fast Mover',
    metricTagClass: 'bg-surface-container text-on-surface-variant',
  },
  {
    title: 'VIP Table & Mocktail',
    kind: 'VIP Tier',
    kindClass: 'bg-primary-fixed text-on-primary-fixed font-semibold',
    costLabel: 'Experience & Beverage',
    cost: '800 Pts',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBuNkWKBSyQDgVXv0YL99m4_eEXyBmsW2SrrgmRdLLuhqKy_oLLBWmG3oLL0l-J51xCQQnH2Yg48g2o2ZpfTwm91F6US6t2p_vV6eLkVwpp19dppRlth6UD7J7dCvGdJPiqjNqUQOxGq3z6OefzDjy-NrZwwi9vyXnoNH-ArkYqb64qVlfN7893JebagOx5XVBzsW2OnYRejEqevs2TRUQoYE63044RTfpy8ibuxkp0LhMsHZveQMRnnQ',
    imageAlt:
      'Reserved premium booth table setting in an upscale cosmopolitan lounge, featuring artisanal handcrafted mocktail pitchers with citrus slices, fresh mint, elegant glassware and VIP reserved golden brass acrylic sign.',
    locationIcon: 'domain',
    locationClass: 'text-primary',
    location: 'All Branches',
    stockIcon: 'calendar_month',
    stockClass: 'text-primary',
    stock: 'Fri – Sun Exclusive',
    description:
      'Skip weekend reservation waitlist plus a free 1.5L handcrafted signature mocktail carafe on arrival.',
    metricIcon: 'wine_bar',
    metricValue: '12 VIP claims',
    metricNote: 'Logged this current month',
    metricTag: 'High Retention',
    metricTagClass: 'bg-primary-fixed text-on-primary-fixed',
  },
];

const SAFEGUARDS = [
  {
    title: 'Single Perk per Table Visit',
    body: 'One reward voucher redemption per registered customer per 6-hour dining session.',
  },
  {
    title: 'Mandatory Staff 2FA / QR Scan',
    body: 'Must be verified by staff scanning customer QR or typing dynamic 6-digit OTP code at checkout.',
  },
  {
    title: 'Discount Stacking Blocker',
    body: 'Cannot be combined with greater than 30% happy-hour flash discount campaigns.',
  },
  {
    title: 'Minimum Spend Gate',
    body: 'Minimum bill subtotal ₦5,000 required to apply any monetary dining bill credit perks.',
  },
];

const AUDIT_ROWS = [
  {
    initials: 'MJ',
    avatarClass: 'bg-surface-container text-on-surface-variant',
    name: 'Michael James',
    tier: 'Gold Patron',
    tierClass: 'bg-surface-container text-on-surface-variant',
    entry: "Redeemed 350 pts for Complimentary Chef's Artisan Dessert",
    entryClass: 'text-text-secondary',
    time: 'Today, 11:20 AM',
    meta: 'Wuse II Branch • POS-Terminal 02',
    statusIcon: 'check_circle',
    statusClass: 'text-badge-discount-text',
  },
  {
    initials: 'SA',
    avatarClass: 'bg-primary-fixed text-on-primary-fixed',
    name: 'Sarah Adams',
    tier: 'Silver Patron',
    tierClass: 'bg-surface-tint-blue text-primary',
    entry: '+75 pts earned on ₦7,500 order',
    entryClass: 'text-badge-discount-text font-medium',
    time: 'Today, 10:45 AM',
    meta: 'Wuse II Branch • Cashier Musa D.',
    statusIcon: 'stars',
    statusClass: 'text-primary',
  },
  {
    initials: 'CO',
    avatarClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    name: 'Dr. Chidi Okafor',
    tier: 'VIP Platinum',
    tierClass: 'bg-secondary-container text-on-secondary-container font-semibold',
    entry: 'Redeemed 500 pts for ₦2,500 Dining Voucher',
    entryClass: 'text-text-secondary',
    time: 'Yesterday, 8:15 PM',
    meta: 'Wuse II Branch • Table 14 QR',
    statusIcon: 'check_circle',
    statusClass: 'text-badge-discount-text',
  },
];

type StatusTab = 'active' | 'draft' | 'archived';

const STATUS_TABS: Array<{ key: StatusTab; label: string; count: string }> = [
  { key: 'active', label: 'Active', count: '3' },
  { key: 'draft', label: 'Draft', count: '1' },
  { key: 'archived', label: 'Archived', count: '2' },
];

export function DesktopLoyaltyRewardsScreen({ onNav, onOpenProgramme }: DesktopLoyaltyRewardsScreenProps) {
  const [statusTab, setStatusTab] = useState<StatusTab>('active');
  const [toast, setToast] = useState<string | null>(null);

  const live = hasApiConfig();
  const { branch } = useBusinessBranch();
  const rewards = useLoyaltyRewards();
  const logs = useLoyaltyLogs();
  const stats = useLoyaltyStats();
  const { updateReward } = useLoyaltyMutations();
  const loadError = rewards.error ?? logs.error ?? stats.error;
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (loadError) showToast(apiErrorMessage(loadError, 'Could not load your rewards.'));
  }, [loadError]);

  const liveCards = (rewards.data ?? []).map((reward) => liveRewardCard(reward, branch.name));
  const cards = live ? liveCards.filter((card) => card.status === statusTab) : REWARD_CARDS;
  const tabCount = (key: StatusTab, sample: string) =>
    live ? String(liveCards.filter((card) => card.status === key).length) : sample;

  const auditRows = live
    ? (logs.data ?? []).slice(0, 5).map((log, index) => {
        const entry = logEntry(log);
        return {
          ...AUDIT_ROWS[isRedemption(log) ? 0 : 1],
          initials: entry.member
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join(''),
          name: entry.member,
          tier: entry.positive ? 'Earned' : 'Redeemed',
          entry: `${entry.delta} pts · ${entry.reason}`,
          time: entry.date,
          meta: entry.branch || '—',
          key: `${log.id}-${index}`,
        };
      })
    : AUDIT_ROWS.map((row) => ({ ...row, key: row.name }));

  const comingSoon = (what: string) => () => showToast(`${what} on desktop is coming soon.`);

  const togglePause = (card: RewardCard) => {
    if (!card.live) return;
    if (card.status === 'archived') {
      showToast('This reward has ended. Create a new one to bring it back.');
      return;
    }
    const resume = card.status === 'draft';
    updateReward.mutate(
      { id: card.live.id, isActive: resume },
      {
        onSuccess: () => showToast(`${card.title} ${resume ? 'resumed' : 'paused'}`),
        onError: (error) => showToast(apiErrorMessage(error, 'Could not update the reward.')),
      },
    );
  };

  return (
    <EnterpriseShell activeNav="business-loyalty" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-xl">
        <div className="flex flex-col gap-space-md">
          <nav className="flex items-center gap-space-2xs text-text-tertiary font-label-sm text-label-sm">
            <button
              type="button"
              className="hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => onNav('overview')}
            >
              <Icon name="storefront" className="text-[16px]" />
              <span>Business Hub</span>
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button
              type="button"
              className="hover:text-primary transition-colors"
              onClick={onOpenProgramme}
            >
              Loyalty &amp; Rewards
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-semibold">Rewards Catalog</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="flex flex-col gap-1 max-w-3xl">
              <div className="flex items-center gap-space-xs flex-wrap">
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                  Loyalty Rewards &amp; Rules Catalog
                </h1>
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  Tier 1 Rules Live
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Configure claimable customer perks, voucher discounts, dining treats, and points redemption thresholds
                across your enterprise branches.
              </p>
            </div>
            <div className="flex items-center gap-space-xs flex-wrap shrink-0">
              <button
                type="button"
                onClick={onOpenProgramme}
                className="h-11 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-space-2xs transition-all active:scale-[0.98]"
              >
                <Icon name="tune" className="text-[18px]" />
                <span>Configure Global Policies</span>
              </button>
              <button
                type="button"
                className="h-11 px-space-md rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md font-semibold flex items-center gap-space-2xs shadow-md transition-all active:scale-[0.98]"
                onClick={live ? comingSoon('Creating rewards') : undefined}
              >
                <Icon name="add_circle" className="text-[20px]" />
                <span>+ Create New Reward</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pt-space-xs">
            <div className="flex items-center gap-1 p-1 bg-surface-container-high rounded-xl w-fit">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key)}
                  className={
                    statusTab === tab.key
                      ? 'px-space-md py-1.5 rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm flex items-center gap-space-2xs transition-all'
                      : 'px-space-md py-1.5 rounded-lg text-text-secondary hover:text-text-primary font-label-md text-label-md flex items-center gap-space-2xs transition-colors'
                  }
                >
                  <span>{tab.label}</span>
                  <span
                    className={
                      statusTab === tab.key
                        ? 'px-1.5 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed text-caption font-semibold'
                        : 'px-1.5 py-0.2 rounded-full bg-surface-container text-text-secondary text-caption font-semibold'
                    }
                  >
                    {tabCount(tab.key, tab.count)}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-space-md text-text-secondary font-caption text-caption">
              <span className="flex items-center gap-1">
                <Icon name="verified" className="text-badge-discount-text text-[16px]" />
                {v(`${branch.name} rewards`, 'POS Token Sync: Active')}
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:flex items-center gap-1">
                <Icon name="schedule" className="text-primary text-[16px]" />
                {v('Live', 'Next automated cycle in 6d')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {cards.map((card) => (
            <div
              key={card.live?.id ?? card.title}
              className="bg-surface-canvas rounded-xl shadow-md overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-200"
            >
              <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                {card.image && (
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={card.imageAlt}
                    src={card.image}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-text-primary/70 via-transparent to-transparent" />
                <div className="absolute top-space-xs left-space-xs flex items-center gap-1.5">
                  <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                    {card.status ? STATUS_LABEL[card.status] : 'Active'}
                  </span>
                  <span
                    className={`px-space-xs py-0.5 rounded-full font-caption text-caption ${card.kindClass}`}
                  >
                    {card.kind}
                  </span>
                </div>
                <div className="absolute bottom-space-xs left-space-sm right-space-sm flex items-end justify-between text-on-primary">
                  <div>
                    <span className="font-caption text-caption text-surface-container-highest uppercase tracking-wider font-semibold">
                      {card.costLabel}
                    </span>
                    <p className="font-heading-sm text-heading-sm leading-tight text-surface-canvas font-bold">
                      {card.title}
                    </p>
                  </div>
                  <div className="bg-surface-canvas/95 backdrop-blur px-space-xs py-1 rounded-lg text-primary text-right shrink-0">
                    <span className="font-label-sm text-label-sm font-bold flex items-center gap-0.5">
                      <Icon name="stars" className="text-[16px] text-tertiary-container" /> {card.cost}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-space-md flex flex-col gap-space-md flex-1 justify-between">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm">
                    <span className="flex items-center gap-1">
                      <Icon name={card.locationIcon} className={`text-[18px] ${card.locationClass}`} />
                      {card.location}
                    </span>
                    <span className={`${card.stockClass} font-semibold flex items-center gap-1`}>
                      <Icon name={card.stockIcon} className="text-[16px]" />
                      {card.stock}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary line-clamp-2">{card.description}</p>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-surface-tint-blue flex items-center justify-center text-primary">
                      <Icon name={card.metricIcon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                        {card.metricValue}
                      </span>
                      <span className="font-caption text-caption text-text-tertiary">{card.metricNote}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-caption text-caption font-semibold ${card.metricTagClass}`}
                  >
                    {card.metricTag}
                  </span>
                </div>
                <div className="pt-space-xs flex items-center gap-space-xs">
                  <button
                    type="button"
                    className="flex-1 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                    onClick={live ? comingSoon('Editing rewards') : undefined}
                  >
                    <Icon name="edit" className="text-[16px]" />
                    Edit Rules
                  </button>
                  <button
                    type="button"
                    className="h-9 px-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary font-label-sm text-label-sm transition-colors"
                    onClick={() => togglePause(card)}
                  >
                    {card.status === 'draft' ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    type="button"
                    aria-label="More reward options"
                    className="h-9 w-9 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary flex items-center justify-center transition-colors"
                  >
                    <Icon name="more_vert" className="text-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                    <Icon name="verified_user" className="text-[24px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight">
                      Redemption Safeguards &amp; Fraud Protection
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Enforced system-wide across all POS registers, mobile staff tablets, and customer apps.
                    </p>
                  </div>
                </div>
                <span className="px-space-xs py-1 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0 w-fit">
                  {v('Coming soon', 'Active Protection Engine')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-2xs">
                {SAFEGUARDS.map((item) => (
                  <div
                    key={item.title}
                    className="p-space-sm rounded-xl bg-surface-subtle flex items-start gap-space-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0 mt-0.5">
                      <Icon name="check" className="text-[16px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{item.title}</span>
                      <span className="font-body-md text-body-md text-text-secondary">{item.body}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-space-xs flex items-center justify-between">
                <span className="font-caption text-caption text-text-tertiary">
                  {v('—', 'Policy hash: #RED-POL-2025-v4 • Updated yesterday by Musa Danladi')}
                </span>
                <button
                  type="button"
                  onClick={onOpenProgramme}
                  className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Edit Global Loyalty Redemption Policies</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-2xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="receipt_long" className="text-[24px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Recent Member Redemptions Audit Feed
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Real-time ledger events synchronized with cashiers across terminals.
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 font-caption text-caption text-text-tertiary">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                  Live Synced
                </span>
              </div>
              <div className="flex flex-col gap-space-xs">
                {auditRows.map((row) => (
                  <div
                    key={row.key}
                    className="p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md font-bold ${row.avatarClass}`}
                      >
                        {row.initials}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-md text-label-md text-text-primary font-semibold">{row.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-caption text-caption ${row.tierClass}`}
                          >
                            {row.tier}
                          </span>
                        </div>
                        <span className={`font-caption text-caption ${row.entryClass}`}>{row.entry}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-md pl-12 sm:pl-0">
                      <div className="flex flex-col sm:text-right">
                        <span className="font-label-sm text-label-sm text-text-primary font-medium">{row.time}</span>
                        <span className="font-caption text-caption text-text-tertiary">{row.meta}</span>
                      </div>
                      <Icon name={row.statusIcon} className={`${row.statusClass} text-[20px]`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-space-xs flex items-center justify-end">
                <button
                  type="button"
                  className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1"
                  onClick={live ? comingSoon('The full loyalty ledger') : undefined}
                >
                  <span>View Complete Loyalty Ledger (Activity Tab)</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-lg relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-10 h-10 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                    <Icon name="insights" className="text-[24px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight">
                      Programme Health
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">Real-time reward telemetry</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
              </div>

              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-xs">
                <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm">
                  <span>Active Claim Velocity</span>
                  <span className="text-badge-discount-text font-bold flex items-center gap-0.5">
                    <Icon name="arrow_upward" className="text-[16px]" /> {v(statChange(stats.data, 'Rewards Redeemed') || '—', '+18% MoM')}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-hero text-display-hero text-text-primary tracking-tight">{v(statValue(stats.data, 'Rewards Redeemed'), '79')}</span>
                  <span className="font-body-md text-body-md text-text-secondary">{v('rewards redeemed', 'claims this month')}</span>
                </div>
                <div className="pt-2">
                  <svg className="w-full h-10 text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 200 40">
                    <path
                      d="M0 32 L30 28 L60 30 L90 20 L120 24 L150 14 L180 16 L200 6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M0 32 L30 28 L60 30 L90 20 L120 24 L150 14 L180 16 L200 6 L200 40 L0 40 Z"
                      fill="currentColor"
                      fillOpacity="0.08"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-xs">
                <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm">
                  <span>Average Visit Interval</span>
                  <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold">
                    {v('—', '2.6x Faster')}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading-lg text-heading-lg text-text-primary">{v('—', '11 Days')}</span>
                  <span className="font-caption text-caption text-text-tertiary">between visits</span>
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between font-caption text-caption text-text-secondary">
                    <span>Loyalty Members</span>
                    <span className="font-semibold text-text-primary">{v('—', '11d')}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: v('0%', '38%') }} />
                  </div>
                  <div className="flex justify-between font-caption text-caption text-text-tertiary pt-1">
                    <span>Non-Loyalty Patrons</span>
                    <span>{v('—', '29d')}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full bg-text-tertiary rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-subtle flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-label-sm text-label-sm text-text-secondary">Point Burnout Rate</span>
                  <span className="font-heading-md text-heading-md text-text-primary">{v('—', '74%')}</span>
                  <span className="font-caption text-caption text-text-tertiary">Redeemed within 90 days</span>
                </div>
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-tertiary-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={v('0, 100', '74, 100')}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute text-caption font-bold text-text-primary">{v('—', '74%')}</span>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="verified" className="text-[24px]" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-bold leading-tight">
                      {v('Verification score', '100% Verification Score')}
                    </span>
                    <span className="font-caption text-caption opacity-90">
                      {v('Coming soon', 'All vouchers validated via POS QR code')}
                    </span>
                  </div>
                </div>
                <span className="font-heading-sm text-heading-sm font-bold">{v('—', '10/10')}</span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-subtle flex items-start gap-space-xs">
                <Icon name="lightbulb" className="text-primary text-[18px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary">
                  Perks with threshold costs between{' '}
                  <strong className="text-text-primary">300 – 500 points</strong> have the highest redemption rate
                  (4.2x) in metropolitan Abuja locations.
                </p>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-md p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <Icon name="help_center" className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">Reward Rule Docs</span>
                  <span className="font-caption text-caption text-text-tertiary">Learn how to configure tiers</span>
                </div>
              </div>
              <button
                type="button"
                className="h-8 px-space-xs rounded-lg bg-surface-subtle hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold transition-colors"
              >
                Read Guide
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-on-surface-inverse px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
          {toast}
        </div>
      )}
    </EnterpriseShell>
  );
}
