import { Icon } from './ui/Icon';

export type BusinessTabKey = 'overview' | 'orders' | 'messages' | 'business' | 'more';

export interface BusinessTabBarProps {
  active?: BusinessTabKey;
  onTab: (tab: BusinessTabKey) => void;
}

const TABS: { key: BusinessTabKey; icon: string; label: string; badge?: string; badgeClass?: string }[] = [
  { key: 'overview', icon: 'dashboard', label: 'Overview' },
  { key: 'orders', icon: 'receipt_long', label: 'Orders', badge: '3', badgeClass: 'bg-primary-container text-on-primary' },
  {
    key: 'messages',
    icon: 'chat_bubble',
    label: 'Messages',
    badge: '2',
    badgeClass: 'bg-tertiary-container text-on-tertiary',
  },
  { key: 'business', icon: 'storefront', label: 'Business' },
  { key: 'more', icon: 'more_horiz', label: 'More' },
];

export function BusinessTabBar({ active = 'orders', onTab }: BusinessTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-20 px-space-xs">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTab(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-space-2xs min-h-[48px] transition-colors ${
                isActive ? 'text-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon name={tab.icon} className="text-[24px]" filled={isActive} />
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ${tab.badgeClass}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="font-caption text-caption leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
