import { Icon } from './ui/Icon';

export type MobileTabKey = 'home' | 'deals' | 'discover' | 'saved' | 'account';

export interface MobileTabBarProps {
  active: MobileTabKey;
  onTab: (tab: MobileTabKey) => void;
}

const TABS: { key: MobileTabKey; icon: string; label: string }[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'deals', icon: 'local_offer', label: 'Deals' },
  { key: 'discover', icon: 'explore', label: 'Business' },
  { key: 'account', icon: 'account_circle', label: 'Account' },
];

export function MobileTabBar({ active, onTab }: MobileTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_10px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-space-xs flex items-center justify-around">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTab(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
                isActive
                  ? 'text-primary-container font-semibold'
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <Icon name={tab.icon} className="text-[24px]" filled={isActive} />
              <span className="font-caption text-caption text-[11px] leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
