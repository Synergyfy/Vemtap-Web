import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface BusinessLoyaltyRewardsScreenProps {
  onBack: () => void;
}

type StatusTab = 'active' | 'draft' | 'archived';

interface Reward {
  key: string;
  name: string;
  cost: string;
  desc: string;
  branches: string;
  expiry: string;
  redeemed: string;
  status: StatusTab;
}

const REWARDS: Reward[] = [
  {
    key: 'appetiser',
    name: 'Free Appetiser',
    cost: '500',
    desc: 'Any starter from the classics menu',
    branches: 'All branches',
    expiry: 'Redeem by Dec 31',
    redeemed: '86 redeemed',
    status: 'active',
  },
  {
    key: 'voucher',
    name: '₦5,000 Dining Voucher',
    cost: '1,200',
    desc: 'Applies to bills above ₦15,000',
    branches: 'Wuse 2, Maitama',
    expiry: 'Redeem by Nov 30',
    redeemed: '41 redeemed',
    status: 'active',
  },
  {
    key: 'dessert',
    name: 'Complimentary Dessert',
    cost: '650',
    desc: 'Chef selection, dine-in only',
    branches: 'All branches',
    expiry: 'No expiry set',
    redeemed: '23 redeemed',
    status: 'active',
  },
  {
    key: 'brunch',
    name: 'Sunday Brunch for Two',
    cost: '2,400',
    desc: 'Two mains plus a shared dessert',
    branches: 'Lekki Phase 1',
    expiry: 'Draft — not published',
    redeemed: '—',
    status: 'draft',
  },
  {
    key: 'jollof',
    name: 'Free Jollof Upgrade',
    cost: '300',
    desc: 'Retired after the summer menu',
    branches: 'All branches',
    expiry: 'Archived Sep 2026',
    redeemed: '152 redeemed',
    status: 'archived',
  },
];

const SAFEGUARDS: { key: string; label: string; desc: string; enabled: boolean }[] = [
  { key: 'limit', label: 'One redemption per member per day', desc: 'Stops repeat claiming at the counter', enabled: true },
  { key: 'stock', label: 'Monthly reward stock cap', desc: 'Automatically pauses once the cap is hit', enabled: true },
  { key: 'staff', label: 'Staff approval for high-value rewards', desc: 'Manager sign-off above 1,000 points', enabled: false },
  { key: 'branch', label: 'Block cross-branch redemptions', desc: 'Points earned at a branch stay at that branch', enabled: false },
];

const REDEMPTIONS: { member: string; reward: string; points: string; branch: string; when: string }[] = [
  { member: 'Michael James', reward: 'Free Appetiser', points: '500', branch: 'Wuse 2', when: 'Today, 9:26 AM' },
  { member: 'Sarah Adams', reward: '₦5,000 Dining Voucher', points: '1,200', branch: 'Maitama', when: 'Today, 8:41 AM' },
  { member: 'Tunde Bello', reward: '₦5,000 Dining Voucher', points: '1,200', branch: 'Wuse 2', when: 'Oct 07, 6:55 PM' },
  { member: 'Dr. Chidi Okafor', reward: 'Complimentary Dessert', points: '650', branch: 'Maitama', when: 'Oct 06, 2:18 PM' },
];

export function BusinessLoyaltyRewardsScreen({ onBack }: BusinessLoyaltyRewardsScreenProps) {
  const [tab, setTab] = useState<StatusTab>('active');
  const [safeguards, setSafeguards] = useState(SAFEGUARDS);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalCost, setModalCost] = useState('500');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

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

  const toggleSafeguard = (key: string) => {
    setSafeguards((current) =>
      current.map((safeguard) => (safeguard.key === key ? { ...safeguard, enabled: !safeguard.enabled } : safeguard)),
    );
  };

  const visibleRewards = REWARDS.filter((reward) => reward.status === tab);

  const openCreate = () => {
    setModalName('');
    setModalCost('500');
    setModal('create');
  };

  const openEdit = (reward: Reward) => {
    setModalName(reward.name);
    setModalCost(reward.cost.replace(/,/g, ''));
    setModal('edit');
  };

  const saveModal = () => {
    const label = modal === 'create' ? 'Reward created' : `${modalName || 'Reward'} rules updated`;
    setModal(null);
    showToast(label);
  };

  return (
    <AppScreen>
      <ScreenHeader
        title="Rewards & Rules"
        onBack={onBack}
        trailing={
          <button
            aria-label="Create reward"
            className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center active:scale-95 transition-transform"
            type="button"
            onClick={openCreate}
          >
            <Icon name="add" className="text-[20px]" />
          </button>
        }
      />

      <div className="flex flex-col w-full flex-1 pb-28">
        {/* Segmented status */}
        <section className="px-margin pt-space-sm">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-container-low">
            {([
              { key: 'active', label: 'Active' },
              { key: 'draft', label: 'Draft' },
              { key: 'archived', label: 'Archived' },
            ] as { key: StatusTab; label: string }[]).map((option) => {
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
                  onClick={() => setTab(option.key)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Reward cards */}
        <section className="px-margin pt-space-sm flex flex-col gap-space-sm">
          {visibleRewards.map((reward) => (
            <article className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs" key={reward.key}>
              <div className="flex items-start justify-between gap-space-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-label-md text-label-md font-semibold text-text-primary truncate">{reward.name}</h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                      {reward.cost} pts
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">{reward.desc}</p>
                </div>
                <span className="font-caption text-caption text-text-tertiary shrink-0">{reward.redeemed}</span>
              </div>

              <div className="grid grid-cols-2 gap-space-xs">
                <div className="rounded-lg bg-surface-container-low p-1.5">
                  <p className="font-caption text-caption text-text-tertiary">Valid at</p>
                  <p className="font-label-sm text-label-sm text-text-primary truncate">{reward.branches}</p>
                </div>
                <div className="rounded-lg bg-surface-container-low p-1.5">
                  <p className="font-caption text-caption text-text-tertiary">Window</p>
                  <p className="font-label-sm text-label-sm text-text-primary truncate">{reward.expiry}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-xs">
                <button
                  className="h-9 rounded-xl bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-all"
                  type="button"
                  onClick={() => openEdit(reward)}
                >
                  <Icon name="tune" className="text-[15px]" />
                  <span>Edit Rules</span>
                </button>
                <button
                  className="h-9 rounded-xl bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-all"
                  type="button"
                  onClick={() =>
                    showToast(
                      reward.status === 'archived'
                        ? `${reward.name} restored to drafts`
                        : `${reward.name} paused`,
                    )
                  }
                >
                  <Icon name={reward.status === 'archived' ? 'restart_alt' : 'pause'} className="text-[15px]" />
                  <span>{reward.status === 'archived' ? 'Restore' : 'Pause'}</span>
                </button>
              </div>
            </article>
          ))}

          {visibleRewards.length === 0 && (
            <div className="py-space-lg flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-surface-container-high text-primary flex items-center justify-center mb-space-xs">
                <Icon name="redeem" className="text-[26px]" />
              </div>
              <h4 className="font-label-md text-label-md font-semibold text-text-primary">No {tab} rewards</h4>
              <p className="font-label-sm text-label-sm text-text-secondary max-w-xs mt-1">
                {tab === 'draft'
                  ? 'Rewards you are still working on will appear here.'
                  : tab === 'archived'
                    ? 'Retired rewards stay here for your records.'
                    : 'Create your first reward to start delighting members.'}
              </p>
            </div>
          )}
        </section>

        {/* Safeguards */}
        <section className="px-margin pt-space-md">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm">
            <div className="flex items-center gap-space-xs">
              <span className="w-7 h-7 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                <Icon name="verified_user" className="text-[15px]" />
              </span>
              <div className="min-w-0">
                <h3 className="font-label-md text-label-md text-text-primary font-semibold">Redemption Safeguards</h3>
                <p className="font-caption text-caption text-text-secondary">Protect your points budget</p>
              </div>
            </div>
            <div className="mt-space-xs divide-y divide-border-subtle">
              {safeguards.map((safeguard) => (
                <button
                  className="w-full flex items-center justify-between gap-space-xs py-2 px-1.5 text-left"
                  key={safeguard.key}
                  type="button"
                  onClick={() => toggleSafeguard(safeguard.key)}
                >
                  <span className="min-w-0">
                    <span className="font-label-sm text-label-sm text-text-primary block truncate">{safeguard.label}</span>
                    <span className="font-caption text-caption text-text-tertiary block truncate">{safeguard.desc}</span>
                  </span>
                  <span
                    className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${
                      safeguard.enabled ? 'bg-primary-container' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        safeguard.enabled ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent redemptions */}
        <section className="px-margin pt-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-text-primary font-semibold">Recent Member Redemptions</h3>
            <button className="font-caption text-caption text-primary font-semibold" type="button" onClick={() => showToast('Opening full redemption ledger…')}>
              See all
            </button>
          </div>
          <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm mt-space-xs divide-y divide-border-subtle">
            {REDEMPTIONS.map((item) => (
              <div className="flex items-center justify-between gap-space-xs py-2 px-1.5" key={`${item.member}-${item.when}`}>
                <div className="min-w-0">
                  <p className="font-label-sm text-label-sm text-text-primary truncate">{item.member}</p>
                  <p className="font-caption text-caption text-text-tertiary truncate">
                    {item.reward} · {item.branch} · {item.when}
                  </p>
                </div>
                <span className="font-caption text-caption font-semibold text-tertiary shrink-0">-{item.points} pts</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky dock */}
      <div className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin py-space-xs pb-safe">
        <div className="grid grid-cols-2 gap-space-xs">
          <button
            className="h-11 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-all"
            type="button"
            onClick={() => openEdit(visibleRewards[0] ?? REWARDS[0])}
          >
            <Icon name="tune" className="text-[16px]" />
            <span>Edit Rules</span>
          </button>
          <button
            className="h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
            type="button"
            onClick={openCreate}
          >
            <Icon name="add" className="text-[17px]" />
            <span>Create Reward</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setModal(null)}>
          <div
            className="w-full max-w-[430px] bg-surface-canvas rounded-t-3xl p-space-md flex flex-col gap-space-sm shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                {modal === 'create' ? 'Create Reward' : 'Edit Reward Rules'}
              </h3>
              <button
                className="w-8 h-8 rounded-full bg-surface-container-low text-text-secondary flex items-center justify-center"
                type="button"
                onClick={() => setModal(null)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <label className="flex flex-col gap-1">
              <span className="font-caption text-caption text-text-secondary">Reward name</span>
              <input
                className="h-10 px-space-sm rounded-xl bg-surface-container-low text-text-primary font-label-sm text-label-sm placeholder:text-text-tertiary outline-none focus:bg-surface-canvas border border-border-subtle"
                placeholder="e.g. Free Dessert"
                type="text"
                value={modalName}
                onChange={(event) => setModalName(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-caption text-caption text-text-secondary">Points required</span>
              <input
                className="h-10 px-space-sm rounded-xl bg-surface-container-low text-text-primary font-label-sm text-label-sm placeholder:text-text-tertiary outline-none focus:bg-surface-canvas border border-border-subtle"
                type="text"
                inputMode="numeric"
                value={modalCost}
                onChange={(event) => setModalCost(event.target.value.replace(/[^\d]/g, ''))}
              />
            </label>

            <div className="rounded-xl bg-surface-container-low p-space-xs">
              <p className="font-caption text-caption text-text-secondary">Member sees</p>
              <p className="font-label-sm text-label-sm text-text-primary mt-0.5">
                Redeem {(Number(modalCost) || 0).toLocaleString('en-US')} points for {modalName.trim() || 'this reward'}.
              </p>
            </div>

            <button
              className="h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              type="button"
              onClick={saveModal}
            >
              <Icon name="check" className="text-[17px]" />
              <span>{modal === 'create' ? 'Create Reward' : 'Save Rules'}</span>
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
