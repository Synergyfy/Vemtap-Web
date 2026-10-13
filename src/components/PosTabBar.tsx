import { Icon } from './ui/Icon';

export type PosTabKey = 'register' | 'orders' | 'customers' | 'products' | 'drawer' | 'ledger' | 'more';

export interface PosTabItem {
  key: PosTabKey;
  icon: string;
  label: string;
}

export const POS_NAV_MAIN: PosTabItem[] = [
  { key: 'register', icon: 'point_of_sale', label: 'Register' },
  { key: 'orders', icon: 'receipt_long', label: 'Orders' },
  { key: 'customers', icon: 'group', label: 'Customers' },
  { key: 'ledger', icon: 'account_balance_wallet', label: 'Ledger' },
  { key: 'more', icon: 'more_horiz', label: 'More' },
];

export const POS_NAV_STOCK: PosTabItem[] = [
  { key: 'register', icon: 'point_of_sale', label: 'Register' },
  { key: 'orders', icon: 'receipt_long', label: 'Orders' },
  { key: 'products', icon: 'inventory_2', label: 'Products' },
  { key: 'drawer', icon: 'payments', label: 'Drawer' },
  { key: 'more', icon: 'more_horiz', label: 'More' },
];

interface PosTabBarProps {
  items: PosTabItem[];
  active: PosTabKey;
  onSelect: (key: PosTabKey) => void;
}

export function PosTabBar({ items, active, onSelect }: PosTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-16 px-space-xs">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelect(item.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                isActive ? 'bg-surface-tint-blue text-primary mx-1 rounded-xl py-1' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={item.icon} className="text-[21px]" filled={isActive} />
              <span className="font-caption text-caption leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
