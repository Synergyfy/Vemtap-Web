import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHeader } from './BusinessHubHeader';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { useMyBusiness } from '../hooks/business/useMyBusiness';
import {
  useLoyaltyLogs,
  useLoyaltyMutations,
  useLoyaltyRewards,
  useLoyaltyRules,
  useLoyaltyStats,
} from '../hooks/business/useLoyalty';
import {
  DEFAULT_BONUS,
  earnsOnSpend,
  earnsOnVisit,
  logEntry,
  rewardStatus,
  ruleTypeFor,
  spendRuleLabel,
  statValue,
} from './loyaltyLive';

interface BusinessLoyaltyScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenRewards: () => void;
}

type LoyaltyTab = 'programme' | 'rewards' | 'activity';

const TABS: { key: LoyaltyTab; label: string }[] = [
  { key: 'programme', label: 'Programme' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'activity', label: 'Activity' },
];

const EARNING_RULES: { key: string; label: string; desc: string; enabled: boolean }[] = [
  { key: 'spend', label: '₦1 spent = 1 point', desc: 'Earned on every settled order', enabled: true },
  { key: 'birthday', label: '2x birthday points', desc: 'Auto-applied during the member birthday week', enabled: true },
  { key: 'review', label: '+100 points for reviews', desc: 'Awarded once per verified review', enabled: false },
  { key: 'referral', label: '+250 points for referrals', desc: 'When a referred guest makes a first order', enabled: true },
];

const EXPIRY_OPTIONS = ['Never expires', '6 months after earning', '12 months after earning', 'End of calendar year'];

const ACTIVITY: { member: string; delta: string; positive: boolean; reason: string; date: string }[] = [
  { member: 'Michael James', delta: '+240', positive: true, reason: 'Order #VG-94021', date: 'Today, 9:26 AM' },
  { member: 'Sarah Adams', delta: '-500', positive: false, reason: 'Redeemed free appetiser', date: 'Today, 8:41 AM' },
  { member: 'Halima Yusuf', delta: '+100', positive: true, reason: 'Verified review bonus', date: 'Yesterday, 5:02 PM' },
  { member: 'Dr. Chidi Okafor', delta: '+480', positive: true, reason: 'Table booking spend', date: 'Yesterday, 1:19 PM' },
  { member: 'Tunde Bello', delta: '-1,200', positive: false, reason: 'Redeemed ₦5,000 voucher', date: 'Oct 07, 6:55 PM' },
];

export function BusinessLoyaltyScreen({ onTab, onOpenRewards }: BusinessLoyaltyScreenProps) {
  const [tab, setTab] = useState<LoyaltyTab>('programme');
  const [active, setActive] = useState(true);
  const [rules, setRules] = useState(EARNING_RULES);
  const [branchMode, setBranchMode] = useState<'all' | 'selected'>('all');
  const [expiry, setExpiry] = useState(EXPIRY_OPTIONS[1]);
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const live = hasApiConfig();
  const business = useMyBusiness();
  const liveRules = useLoyaltyRules();
  const stats = useLoyaltyStats();
  const logs = useLoyaltyLogs();
  const rewards = useLoyaltyRewards();
  const { updateRules } = useLoyaltyMutations();
  // Live: which earning rules are on, edited here and saved together.
  const [draft, setDraft] = useState<Record<string, boolean> | null>(null);
  const loadError = liveRules.error ?? stats.error ?? logs.error;

  useEffect(() => {
    const data = liveRules.data;
    if (!data) return;
    setActive(data.isActive);
    setDraft({
      spend: earnsOnSpend(data),
      visit: earnsOnVisit(data),
      birthday: data.birthdayBonus > 0,
      referral: data.referralBonus > 0,
    });
  }, [liveRules.data]);

  useEffect(() => {
    if (loadError) showToast(apiErrorMessage(loadError, 'Could not load your loyalty programme.'));
  }, [loadError]);

  const data = liveRules.data;
  const shownRules =
    live && data
      ? [
          { key: 'spend', label: spendRuleLabel(data), desc: 'Earned on every settled order', enabled: draft?.spend ?? false },
          {
            key: 'birthday',
            label: `+${(data.birthdayBonus || DEFAULT_BONUS.birthdayBonus).toLocaleString('en-US')} birthday points`,
            desc: 'Credited during the member birthday week',
            enabled: draft?.birthday ?? false,
          },
          {
            key: 'visit',
            label: `+${data.visitPoints} points per visit`,
            desc: `Once every ${data.visitCooldownHours} hours per member`,
            enabled: draft?.visit ?? false,
          },
          {
            key: 'referral',
            label: `+${(data.referralBonus || DEFAULT_BONUS.referralBonus).toLocaleString('en-US')} points for referrals`,
            desc: 'When a referred guest makes a first order',
            enabled: draft?.referral ?? false,
          },
        ]
      : live
        ? []
        : rules;
  const firstReward = (rewards.data ?? []).find((reward) => rewardStatus(reward) === 'active');
  const activity = live ? (logs.data ?? []).slice(0, 5).map(logEntry) : ACTIVITY;

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const toggleRule = (key: string) => {
    if (live) {
      setDraft((current) => (current ? { ...current, [key]: !current[key] } : current));
      return;
    }
    setRules((current) => current.map((rule) => (rule.key === key ? { ...rule, enabled: !rule.enabled } : rule)));
  };

  const handleTab = (key: LoyaltyTab) => {
    if (key === 'rewards') {
      onOpenRewards();
      return;
    }
    setTab(key);
  };

  const save = () => {
    if (saving !== 'idle') return;
    if (live) {
      if (!data || !draft) return;
      const ruleType = ruleTypeFor(draft.spend, draft.visit);
      if (!ruleType) {
        showToast('Keep points on spend or visits switched on.');
        return;
      }
      setSaving('saving');
      updateRules.mutate(
        {
          ruleType,
          birthdayBonus: draft.birthday ? data.birthdayBonus || DEFAULT_BONUS.birthdayBonus : 0,
          referralBonus: draft.referral ? data.referralBonus || DEFAULT_BONUS.referralBonus : 0,
        },
        {
          onSuccess: () => {
            setSaving('saved');
            window.setTimeout(() => {
              setSaving('idle');
              showToast('Loyalty settings saved');
            }, 800);
          },
          onError: (error) => {
            setSaving('idle');
            showToast(apiErrorMessage(error, 'Could not save your loyalty settings.'));
          },
        },
      );
      return;
    }
    setSaving('saving');
    window.setTimeout(() => setSaving('saved'), 800);
    window.setTimeout(() => {
      setSaving('idle');
      showToast('Loyalty settings saved');
    }, 1600);
  };

  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Page header */}
        <section className="px-margin pt-space-md pb-space-xs bg-surface-canvas shadow-sm">
          <div className="flex items-start justify-between gap-space-xs">
            <div className="min-w-0">
              <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Loyalty Programme</h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Points rules, branch scope, and member rewards
              </p>
            </div>
          </div>

          {/* Segmented control */}
          <div className="mt-space-sm grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-container-low">
            {TABS.map((option) => {
              const isActive = option.key === tab;
              return (
                <button
                  className={`h-8 rounded-lg font-label-sm text-label-sm transition-all ${
                    isActive
                      ? 'bg-surface-canvas text-primary shadow-sm font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  key={option.key}
                  type="button"
                  onClick={() => handleTab(option.key)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {tab === 'programme' ? (
          <>
            {/* Master status */}
            <section className="px-margin pt-space-sm">
              <div className="rounded-2xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs bg-gradient-to-r from-surface-tint-blue to-surface-container-low">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <Icon name="loyalty" className="text-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-label-sm text-label-sm text-text-primary font-semibold">
                      Tap &amp; Earn is {active ? 'Active' : 'Paused'}
                    </p>
                    <p className="font-caption text-caption text-text-secondary truncate">
                      {active ? 'Members are earning points right now' : 'No points are being awarded'}
                    </p>
                  </div>
                </div>
                <button
                  aria-pressed={active}
                  className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${
                    active ? 'bg-primary-container' : 'bg-surface-container-highest'
                  }`}
                  type="button"
                  onClick={() => {
                    if (live) {
                      updateRules.mutate(
                        { isActive: !active },
                        {
                          onSuccess: () => showToast(active ? 'Programme paused' : 'Programme activated'),
                          onError: (error) => showToast(apiErrorMessage(error, 'Could not update the programme.')),
                        },
                      );
                      return;
                    }
                    setActive((current) => !current);
                    showToast(active ? 'Programme paused' : 'Programme activated');
                  }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                    style={{ left: active ? '22px' : '2px' }}
                  />
                </button>
              </div>
            </section>

            {/* Earning rules */}
            <section className="px-margin pt-space-md">
              <h3 className="font-label-md text-label-md text-text-primary font-semibold">Points Earning Rules</h3>
              <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm mt-space-xs divide-y divide-border-subtle">
                {shownRules.map((rule) => (
                  <button
                    className="w-full flex items-center justify-between gap-space-xs py-2 px-1.5 text-left"
                    key={rule.key}
                    type="button"
                    onClick={() => toggleRule(rule.key)}
                  >
                    <span className="min-w-0">
                      <span className="font-label-sm text-label-sm text-text-primary block truncate">{rule.label}</span>
                      <span className="font-caption text-caption text-text-tertiary block truncate">{rule.desc}</span>
                    </span>
                    <span
                      className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${
                        rule.enabled ? 'bg-primary-container' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                          rule.enabled ? 'left-4' : 'left-0.5'
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Participating branches */}
            <section className="px-margin pt-space-md">
              <h3 className="font-label-md text-label-md text-text-primary font-semibold">Participating branches</h3>
              <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm mt-space-xs flex flex-col">
                {[
                  { key: 'all', label: 'All branches', desc: 'Every location earns and redeems points' },
                  { key: 'selected', label: 'Only selected branches', desc: 'Choose where the programme runs' },
                ].map((option) => {
                  const isActive = branchMode === option.key;
                  return (
                    <button
                      className="flex items-center gap-space-xs py-2 px-1.5 text-left"
                      key={option.key}
                      type="button"
                      onClick={() => {
                        if (live && option.key === 'selected') {
                          showToast('Choosing branches for loyalty is coming soon.');
                          return;
                        }
                        setBranchMode(option.key as 'all' | 'selected');
                      }}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isActive ? 'border-primary' : 'border-outline-variant'
                        }`}
                      >
                        {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </span>
                      <span className="min-w-0">
                        <span className="font-label-sm text-label-sm text-text-primary block">{option.label}</span>
                        <span className="font-caption text-caption text-text-tertiary block truncate">{option.desc}</span>
                      </span>
                    </button>
                  );
                })}
                {branchMode === 'selected' && (
                  <div className="flex flex-wrap gap-1.5 px-1.5 pb-1.5 pt-1">
                    {['Wuse 2', 'Maitama', 'Lekki Phase 1'].map((branch, index) => (
                      <span
                        className={`inline-flex items-center gap-1 px-2 h-7 rounded-full font-caption text-caption ${
                          index < 2 ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-text-secondary'
                        }`}
                        key={branch}
                      >
                        <Icon name="location_on" className="text-[12px]" />
                        {branch}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Expiry */}
            <section className="px-margin pt-space-md">
              <h3 className="font-label-md text-label-md text-text-primary font-semibold">Points expiry</h3>
              <div className="relative mt-space-xs">
                <select
                  className="w-full h-11 px-space-sm pr-9 rounded-xl bg-surface-canvas border border-border-subtle text-text-primary font-label-sm text-label-sm outline-none focus:border-primary appearance-none"
                  value={live ? EXPIRY_OPTIONS[0] : expiry}
                  onChange={(event) => {
                    if (live) {
                      showToast('Points expiry is coming soon. Points never expire for now.');
                      return;
                    }
                    setExpiry(event.target.value);
                  }}
                >
                  {EXPIRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Icon
                  name="keyboard_arrow_down"
                  className="text-[18px] text-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
              <p className="font-caption text-caption text-text-tertiary mt-1">
                Members get a reminder 14 days before their points expire.
              </p>
            </section>

            {/* Preview strip */}
            <section className="px-margin pt-space-md">
              <div className="rounded-2xl p-space-sm bg-gradient-to-r from-primary to-surface-tint text-on-primary shadow-md">
                <div className="flex items-center gap-1.5">
                  <Icon name="visibility" className="text-[15px]" />
                  <span className="font-caption text-caption font-semibold uppercase tracking-wide">Member preview</span>
                </div>
                <p className="font-label-sm text-label-sm mt-1 leading-relaxed">
                  {live ? (
                    <>
                      {data && draft?.spend
                        ? `Earn ${spendRuleLabel(data).replace(' = ', ' gets ')} at ${business.data?.name ?? 'your business'}.`
                        : `Earn points at ${business.data?.name ?? 'your business'}.`}{' '}
                      {firstReward
                        ? `Redeem ${firstReward.pointsRequired.toLocaleString('en-US')} points for ${firstReward.name}.`
                        : 'Add a reward so members have something to redeem.'}{' '}
                      Points never expire.
                    </>
                  ) : (
                    <>
                      Earn 1 point for every ₦1 spent at Urban Grill Bistro. Redeem 500 points for a free appetiser — points{' '}
                      {expiry.toLowerCase()}.
                    </>
                  )}
                </p>
              </div>
            </section>

            {/* Save */}
            <section className="px-margin pt-space-md pb-space-md">
              <button
                className={`w-full h-11 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-all ${
                  saving === 'saved'
                    ? 'bg-badge-discount-bg text-badge-discount-text'
                    : 'bg-primary-container text-on-primary shadow-md active:scale-95'
                }`}
                type="button"
                onClick={save}
              >
                <Icon name={saving === 'saved' ? 'check_circle' : 'save'} className="text-[17px]" />
                <span>
                  {saving === 'saving' ? 'Saving…' : saving === 'saved' ? 'Saved' : 'Save Loyalty Settings'}
                </span>
              </button>
            </section>
          </>
        ) : (
          /* Activity tab */
          <>
            <section className="px-margin pt-space-sm grid grid-cols-3 gap-space-xs">
              {(live
                ? [
                    { label: 'Points issued', value: statValue(stats.data, 'Points Issued') },
                    { label: 'Rewards redeemed', value: statValue(stats.data, 'Rewards Redeemed') },
                    { label: 'Members', value: statValue(stats.data, 'Total Customers') },
                  ]
                : [
                    { label: 'Points issued', value: '18,420' },
                    { label: 'Points redeemed', value: '6,150' },
                    { label: 'Active members', value: '312' },
                  ]
              ).map((metric) => (
                <div className="bg-surface-canvas rounded-xl p-space-xs shadow-sm" key={metric.label}>
                  <p className="font-heading-sm text-heading-sm text-text-primary leading-none">{metric.value}</p>
                  <p className="font-caption text-caption text-text-secondary mt-1">{metric.label}</p>
                </div>
              ))}
            </section>

            <section className="px-margin pt-space-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-label-md text-label-md text-text-primary font-semibold">Recent point activity</h3>
                <span className="font-caption text-caption text-text-tertiary">{live ? 'Latest' : 'Last 48 hours'}</span>
              </div>
              <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm divide-y divide-border-subtle">
                {activity.map((item) => (
                  <div className="flex items-center justify-between gap-space-xs py-2 px-1.5" key={`${item.member}-${item.date}`}>
                    <div className="min-w-0">
                      <p className="font-label-sm text-label-sm text-text-primary truncate">{item.member}</p>
                      <p className="font-caption text-caption text-text-tertiary truncate">
                        {item.reason} · {item.date}
                      </p>
                    </div>
                    <span
                      className={`font-label-sm text-label-sm font-semibold shrink-0 ${
                        item.positive ? 'text-badge-discount-text' : 'text-tertiary'
                      }`}
                    >
                      {item.delta} pts
                    </span>
                  </div>
                ))}
              </div>
              <button
                className="h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5"
                type="button"
                onClick={() => showToast(live ? 'The full loyalty ledger is coming soon.' : 'Full loyalty ledger opening…')}
              >
                <Icon name="receipt_long" className="text-[15px]" />
                <span>View full ledger</span>
              </button>
            </section>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      <BusinessTabBar active="business" onTab={onTab} />
    </AppScreen>
  );
}
