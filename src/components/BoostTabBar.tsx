import { Icon } from './ui/Icon';

export type BoostTabKey = 'overview' | 'boost' | 'metrics' | 'wallet';

export interface BoostTabBarProps {
  active?: BoostTabKey;
  onTab: (tab: BoostTabKey) => void;
}

const TABS: { key: BoostTabKey; icon: string; label: string }[] = [
  { key: 'overview', icon: 'dashboard', label: 'Overview' },
  { key: 'boost', icon: 'bolt', label: 'Boost' },
  { key: 'metrics', icon: 'insights', label: 'Metrics' },
  { key: 'wallet', icon: 'account_balance_wallet', label: 'Wallet' },
];

export function BoostTabBar({ active = 'overview', onTab }: BoostTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-margin">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-space-2xs min-w-[56px] min-h-[44px] transition-colors ${
                isActive ? 'text-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              key={tab.key}
              type="button"
              onClick={() => onTab(tab.key)}
            >
              <Icon className="text-[24px]" filled={isActive} name={tab.icon} />
              <span className="font-caption text-caption leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
