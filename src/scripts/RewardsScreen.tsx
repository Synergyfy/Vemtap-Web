import { useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface RewardsScreenProps {
  onBack: () => void;
}

type RewardTab = 'available' | 'redeemed' | 'history';

interface Reward {
  id: string;
  image: string;
  alt: string;
  tag: string;
  metaIcon: string;
  meta: string;
  title: string;
  desc: string;
  cost: number;
  balanceAfter: number;
  redeemName: string;
  locked?: boolean;
}

const REWARDS: Reward[] = [
  {
    id: 'dining',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBr0uBE1l9KtcqjX7GaTPNp9BiooBnIdCpko3yjiLMnEISEbvg4lnWLH9XMidBrGreyozGSp0V6EhIKrdwSIGZcb2Zdv6FRk8QTteo30CQEeL3FD7C6VbL5rDpwGYwBncvUT436l46KQ71jS4v_wGswhnxYd_aRTkxtFkDc-sJWxjUrUccQEsjL677D9pI0FGrYN43PWpBP_xZ7PeN7i1923QaWrNrJWWYr69iPsTYs1ylHvcQRnvaWig',
    alt: 'A mouthwatering gourmet plated meal at a lively upscale dining restaurant, warm golden lighting, elegant modern ambiance',
    tag: 'FOOD',
    metaIcon: 'storefront',
    meta: 'Valid across all partner eateries',
    title: '₦2,500 Off Dining',
    desc: 'Instant checkout deduction',
    cost: 500,
    balanceAfter: 950,
    redeemName: '₦2,500 Off Any Dining Deal',
  },
  {
    id: 'spa',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABMpzQZIU2VY3qJZFsgNS4hIromPht2XpzoBTNVOYiNycD2vrJaQjpTasKvdhJNsaCw2Hxfmx0KqFhppvWIoJ3cJ7k30aYuC6685-fWTrs8EIoEIB1ZH6P8R9Tvf43KE92fykL1vAS2njtFHIUEXz_Rs6qOOtJejjk0VQ3CcA-zTpq32VbGWZaqroABU-FIR4hn-E2SGYVFlnUepT2-uvK00kUuGw5zR2jnUHPU3TQ7FNEAeUvqiD2cg',
    alt: 'A serene luxury wellness salon setting showing organic botanical hair treatment oils, calm neutral colors, warm daylight',
    tag: 'WELLNESS',
    metaIcon: 'spa',
    meta: 'Glow & Serenity Spa',
    title: 'Hair Treatment Add-On',
    desc: 'Complementary ritual with any wash',
    cost: 800,
    balanceAfter: 650,
    redeemName: 'Free Hair Treatment Add-On',
  },
  {
    id: 'style',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYpkHZeERUGSGbfkjgDbK3rmEFUfBO6MNTWf3dWwTdTnJ0JRdnQfNHLx9rq3ZYxyWvv0NCTI3yklD-rtNWYPP0lZ6Vg5a86WUnn1CWA0e7aQB2biL4Wq81OgJhY9nNSLQb8Am6WJ8kNbwpLz7f93qoUkHJipbzvf1sKqyC6-_pZV1Aec_1MzerNf2I4Rsmgw_zaKcjdZ_20NMI6v3dqBQSKt0Bypmyvp8g_jT9x3qW-WZO4S5Su0YOSQ',
    alt: 'High-end sneaker boutique display featuring curated designer streetwear shoes, clean architectural lighting and concrete shelves',
    tag: 'STYLE',
    metaIcon: 'checkroom',
    meta: 'Sole District Apparel',
    title: '₦5,000 Off Sneakers',
    desc: 'Applicable on in-store footwear',
    cost: 1200,
    balanceAfter: 250,
    redeemName: '₦5,000 Off Fashion & Sneakers',
  },
  {
    id: 'vip',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQvp5wxdoabBe0F-PyAz4kh-zUp0CKKwENMSxpZtAFRrT4qBKLffwybrYRAgNHxjrAU7t9NPy07QWiZunpiKrxWakuBbSd_TeNlUK9Y3t2SE-TxV0-o0t2uV-b28EmVhHNvZk1NLwaj4BEhSUxL7VUaatZjNfwfixcN3wXNrOfwCkpClMGauB9Ay6YDWQJPg22Tmqzae0pH6rmaoY7ufXVvtuJUaXzDcwTRDxo-NFVCiFCY-YrzHAyPA',
    alt: 'Exclusive moody fine-dining chef table with bespoke wine pairings and sommelier glasses under ambient warm spotlights',
    tag: 'VIP',
    metaIcon: 'wine_bar',
    meta: 'Private Cellar & Lounge',
    title: 'VIP Tasting Experience',
    desc: 'Multi-course curated preview for two',
    cost: 2500,
    balanceAfter: 0,
    redeemName: 'VIP Tasting Experience',
    locked: true,
  },
];

interface LedgerEntry {
  icon: string;
  iconClass: string;
  title: string;
  time: string;
  amount: string;
  positive: boolean;
  meta: string;
}

const LEDGER: LedgerEntry[] = [
  {
    icon: 'add',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Completed Order at Urban Grill',
    time: 'Oct 15, 2024 • 14:22',
    amount: '+150 pts',
    positive: true,
    meta: '₦15,000 spend',
  },
  {
    icon: 'rate_review',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Verified Review for Glow & Serenity',
    time: 'Oct 12, 2024 • 18:05',
    amount: '+200 pts',
    positive: true,
    meta: 'Community boost',
  },
  {
    icon: 'shopping_bag',
    iconClass: 'bg-error-container text-error',
    title: 'Redeemed ₦2,500 Dining Voucher',
    time: 'Oct 04, 2024 • 11:30',
    amount: '-500 pts',
    positive: false,
    meta: 'Voucher applied',
  },
  {
    icon: 'celebration',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Welcome Bonus & Profile Sync',
    time: 'Sept 28, 2024 • 09:12',
    amount: '+100 pts',
    positive: true,
    meta: 'New account',
  },
];

const TABS: Array<{ key: RewardTab; label: string }> = [
  { key: 'available', label: 'Available Rewards' },
  { key: 'redeemed', label: 'Redeemed' },
  { key: 'history', label: 'Points Log' },
];

const EARN_ITEMS: Array<{ icon: string; title: string; body: string }> = [
  {
    icon: 'shopping_cart',
    title: 'Pay with VEMTAP In-Store',
    body: 'Earn 10 points for every ₦1,000 spent at verified partner locations.',
  },
  {
    icon: 'reviews',
    title: 'Leave Verified Reviews',
    body: 'Share your photo and review within 48 hours for +200 bonus points.',
  },
  {
    icon: 'group_add',
    title: 'Invite Fellow Explorers',
    body: 'Gift ₦1,000 to a friend and receive +300 points on their first tap.',
  },
];

function LedgerList(): ReactNode {
  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-xs flex flex-col space-y-1">
      {LEDGER.map((entry) => (
        <div
          key={entry.title}
          className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-subtle transition-colors"
        >
          <div className="flex items-center gap-space-sm min-w-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${entry.iconClass}`}
            >
              <Icon name={entry.icon} className="text-[20px]" />
            </div>
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{entry.title}</p>
              <p className="font-caption text-caption text-text-secondary">{entry.time}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 pl-space-xs">
            <span
              className={`font-label-md text-label-md font-bold ${entry.positive ? 'text-badge-discount-text' : 'text-error'}`}
            >
              {entry.amount}
            </span>
            <p className="font-caption text-caption text-text-tertiary">{entry.meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RewardsScreen({ onBack }: RewardsScreenProps) {
  const [tab, setTab] = useState<RewardTab>('available');
  const [earnOpen, setEarnOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2500);
  };

  const handleRedeem = (rewardName: string, ptsCost: number) => {
    showToast(`Redeemed: ${rewardName} (${ptsCost} pts)`);
    window.setTimeout(() => setTab('redeemed'), 900);
  };

  const copyPasscode = () => {
    navigator.clipboard?.writeText('VEM-9284-OCT').catch(() => undefined);
    showToast('Passcode copied to clipboard!');
  };

  const available = REWARDS.filter((reward) => !reward.locked);

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs flex-1 min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate pr-space-xs">Rewards &amp; Loyalty</h1>
          </div>
          <div className="flex items-center gap-space-xs pr-space-xs shrink-0">
            <button
              aria-label="More options"
              type="button"
              onClick={() => showToast('Points history refreshes every 24 hours')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin pb-10 pt-space-md gap-space-lg">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-container to-surface-tint p-space-lg text-on-primary shadow-lg">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-black/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col space-y-space-md">
            <div className="flex items-center gap-space-2xs">
              <Icon name="stars" className="text-[20px] text-on-primary/80" />
              <span className="font-label-sm text-label-sm text-on-primary/80 tracking-wide uppercase">
                Available Balance
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-display-hero-mobile text-display-hero-mobile font-bold tracking-tight">1,450</span>
                <span className="font-heading-sm text-heading-sm text-on-primary/90 font-medium">VEM Points</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="font-caption text-caption text-on-primary/75">Equivalent redemption power:</span>
                <span className="font-label-sm text-label-sm text-on-primary font-semibold bg-white/15 px-1.5 py-0.5 rounded">
                  ~ ₦7,250 credit
                </span>
              </div>
            </div>
            <div className="pt-space-2xs">
              <button
                type="button"
                onClick={() => setEarnOpen(true)}
                className="w-full flex items-center justify-center gap-space-xs py-3 px-space-md rounded-lg bg-white text-primary font-button-primary text-button-primary shadow-sm active:scale-[0.99] transition-transform"
              >
                <Icon name="lightbulb" className="text-[18px]" />
                <span>How to Earn Points</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex p-1 rounded-xl bg-surface-container-high">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex-1 py-2 text-center rounded-lg font-label-md text-label-md transition-all ${
                tab === item.key
                  ? 'bg-surface shadow-sm text-primary font-semibold'
                  : 'text-on-surface-variant'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'available' && (
          <section className="flex flex-col space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Redeem Your Points</h2>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption text-on-surface-variant font-medium">
                  {available.length} ready
                </span>
              </div>
              <span className="font-caption text-caption text-text-tertiary">Tap to claim</span>
            </div>

            <div className="flex flex-col space-y-space-sm">
              {REWARDS.map((reward) => (
                <div
                  key={reward.id}
                  className={`flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-sm ${
                    reward.locked ? 'opacity-80 relative overflow-hidden' : ''
                  }`}
                >
                  <div className="flex gap-space-sm">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                      <img
                        className={`w-full h-full object-cover ${reward.locked ? 'grayscale' : ''}`}
                        src={reward.image}
                        data-alt={reward.alt}
                        alt={reward.alt}
                      />
                      {reward.locked ? (
                        <div className="absolute inset-0 bg-inverse-surface/40 flex items-center justify-center">
                          <Icon name="lock" className="text-on-primary text-[24px]" />
                        </div>
                      ) : (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                          {reward.tag}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div
                          className={`flex items-center gap-1 font-caption text-caption ${
                            reward.locked ? 'text-on-surface-variant' : 'text-text-secondary'
                          }`}
                        >
                          <Icon name={reward.metaIcon} className="text-[14px]" />
                          <span className="truncate">{reward.meta}</span>
                        </div>
                        <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate mt-0.5">
                          {reward.title}
                        </h3>
                        <p
                          className={`font-caption text-caption mt-0.5 ${reward.locked ? 'text-text-secondary' : 'text-on-surface-variant'}`}
                        >
                          {reward.desc}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1 font-label-sm text-label-sm font-semibold ${
                          reward.locked ? 'text-on-surface-variant' : 'text-primary'
                        }`}
                      >
                        <Icon name="toll" className="text-[16px]" filled={!reward.locked} />
                        <span>{reward.cost.toLocaleString()} VEM pts</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-space-2xs gap-space-xs">
                    {reward.locked ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-caption text-caption text-tertiary font-medium">
                          <Icon name="lock_clock" className="text-[14px]" />
                          <span>Need 1,050 more pts</span>
                        </span>
                        <button
                          type="button"
                          disabled
                          className="h-10 px-4 rounded-lg bg-surface-container-highest text-on-surface-variant font-button-secondary text-button-secondary font-medium cursor-not-allowed"
                        >
                          Locked
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-caption text-caption text-text-tertiary">
                          Balance after: {reward.balanceAfter} pts
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRedeem(reward.redeemName, reward.cost)}
                          className="h-10 px-5 rounded-lg bg-primary text-on-primary font-button-secondary text-button-secondary font-medium active:scale-[0.98] transition-transform flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Redeem Now</span>
                          <Icon name="arrow_forward" className="text-[16px]" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'redeemed' && (
          <section className="flex flex-col space-y-space-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Vouchers Ready for Use</h2>
              <span className="font-caption text-caption text-primary font-medium">1 Active Voucher</span>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-space-sm">
              <div className="flex items-center justify-between pb-space-xs gap-space-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="restaurant" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-heading-sm text-heading-sm text-on-surface truncate">₦2,500 Dining Voucher</h4>
                    <span className="font-caption text-caption text-text-secondary">Redeemed on Oct 04, 2024</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                  Active
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between gap-space-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">Passcode</span>
                  <span className="font-heading-sm text-heading-sm text-text-primary tracking-widest font-mono truncate">
                    VEM-9284-OCT
                  </span>
                </div>
                <button
                  aria-label="Copy voucher code"
                  type="button"
                  onClick={copyPasscode}
                  className="p-2 rounded-lg bg-surface text-primary hover:bg-surface-container-low transition-colors shrink-0"
                >
                  <Icon name="content_copy" className="text-[18px]" />
                </button>
              </div>
              <p className="font-caption text-caption text-text-secondary flex items-center gap-1">
                <Icon name="timer" className="text-[14px] text-badge-discount-text" />
                <span>Expires in 28 days • Present at cashier prior to bill settlement</span>
              </p>
            </div>
          </section>
        )}

        {tab === 'history' && (
          <section className="flex flex-col space-y-space-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Full Activity Ledger</h2>
              <span className="font-caption text-caption text-text-tertiary">Past 60 days</span>
            </div>
            <LedgerList />
          </section>
        )}

        {tab !== 'history' && (
          <section className="flex flex-col space-y-space-sm pt-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="receipt_long" className="text-[20px] text-secondary" />
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Recent Points Activity</h2>
              </div>
              <button
                type="button"
                onClick={() => setTab('history')}
                className="font-label-sm text-label-sm text-primary font-semibold"
              >
                View All
              </button>
            </div>
            <LedgerList />
          </section>
        )}

        <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm">
          <Icon name="info" className="text-secondary text-[20px] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col space-y-1">
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
              Reward Policy &amp; Point Expiry
            </span>
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              Points remain valid for 12 months from issuance. Terms, partner participation, and redemption rules
              apply.
            </p>
          </div>
        </div>
      </main>

      {earnOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setEarnOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-surface rounded-t-2xl p-space-lg shadow-2xl flex flex-col space-y-space-md pb-safe">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Icon name="workspace_premium" className="text-[18px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">How to Earn VEM Points</h3>
              </div>
              <button
                aria-label="Close"
                type="button"
                onClick={() => setEarnOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <div className="flex flex-col space-y-space-sm">
              {EARN_ITEMS.map((item) => (
                <div key={item.title} className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
                  <Icon name={item.icon} className="text-primary text-[22px] mt-0.5" />
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">{item.title}</p>
                    <p className="font-caption text-caption text-text-secondary">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setEarnOpen(false)}
              className="w-full py-3 rounded-lg bg-primary text-on-primary font-button-primary text-button-primary shadow-md active:scale-[0.99] transition-transform"
            >
              Got It, Let's Earn!
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full shadow-lg font-label-md text-label-md flex items-center gap-2 transition-all duration-300">
          <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
