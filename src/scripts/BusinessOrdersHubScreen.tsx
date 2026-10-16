import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';

import { BusinessModeHeader } from './BusinessModeHeader';

interface BusinessOrdersHubScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onSwitchBookings: () => void;
  onOpenOrder: () => void;
}

type StatusChipKey = 'all' | 'new' | 'processing' | 'ready' | 'completed' | 'cancelled';

const STATUS_CHIPS: { key: StatusChipKey; label: string; pulse?: boolean }[] = [
  { key: 'all', label: 'All (24)' },
  { key: 'new', label: 'New (3)', pulse: true },
  { key: 'processing', label: 'Processing (2)' },
  { key: 'ready', label: 'Ready (1)' },
  { key: 'completed', label: 'Completed (18)' },
  { key: 'cancelled', label: 'Cancelled (1)' },
];

interface OrderRow {
  id: string;
  badgeLabel: string;
  badgeClass: string;
  badgeIcon?: string;
  badgeSpin?: boolean;
  badgeFill?: boolean;
  typeChip: string;
  typeChipClass: string;
  borderClass: string;
  customer: string;
  customerClass: string;
  items: string;
  price: string;
  time: string;
  timeClass: string;
  ping?: boolean;
  paymentIcon: string;
  paymentText: string;
  paymentChipClass: string;
  paymentIconClass?: string;
  action?: { label: string; icon: string; buttonClass?: string; textClass?: string };
}

const ORDER_ROWS: OrderRow[] = [
  {
    id: '#VG-94021',
    badgeLabel: 'New',
    badgeClass: 'bg-primary-container text-on-primary',
    typeChip: 'Pickup',
    typeChipClass: 'bg-surface-container text-secondary',
    borderClass: 'border-primary',
    customer: 'Amina Bello',
    customerClass: 'text-text-primary font-semibold',
    items: '3 items (Ribeye Steak + 2)',
    price: '₦34,500',
    time: '4m ago',
    timeClass: 'text-primary font-semibold',
    ping: true,
    paymentIcon: 'credit_card',
    paymentIconClass: 'text-primary',
    paymentText: 'POS Terminal • Pay at Counter',
    paymentChipClass: 'bg-surface-container-high text-on-surface-variant',
    action: { label: 'Accept', icon: 'check', buttonClass: 'bg-primary-container text-on-primary' },
  },
  {
    id: '#POS-1049',
    badgeLabel: 'POS',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    typeChip: 'Table 04',
    typeChipClass: 'bg-surface-tint-blue text-primary',
    borderClass: 'border-secondary-container',
    customer: 'Walk-In Guest',
    customerClass: 'text-text-primary font-semibold',
    items: '2 items (Lunch Combo + 1)',
    price: '₦11,200',
    time: '7m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentIcon: 'point_of_sale',
    paymentText: 'POS / Card • Settle at Table',
    paymentChipClass: 'bg-surface-container-highest text-secondary',
    action: { label: 'Kitchen', icon: 'skillet', buttonClass: 'bg-surface-container text-on-surface' },
  },
  {
    id: '#VG-93988',
    badgeLabel: 'Processing',
    badgeClass: 'bg-surface-tint-blue text-primary',
    badgeIcon: 'progress_activity',
    badgeSpin: true,
    typeChip: 'Delivery',
    typeChipClass: 'bg-surface-container text-secondary',
    borderClass: 'border-surface-tint-blue',
    customer: 'Tunde Bakare',
    customerClass: 'text-text-primary font-semibold',
    items: '2 items (Burger Duo + 1)',
    price: '₦18,200',
    time: '28m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentIcon: 'account_balance',
    paymentText: 'Bank Transfer • Verified',
    paymentChipClass: 'bg-badge-discount-bg text-badge-discount-text',
    action: { label: 'Ready', icon: 'chevron_right', textClass: 'text-primary' },
  },
  {
    id: '#VG-93910',
    badgeLabel: 'Ready',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    badgeIcon: 'check_circle',
    badgeFill: true,
    typeChip: 'Pickup',
    typeChipClass: 'bg-surface-container text-secondary',
    borderClass: 'border-badge-discount-text',
    customer: 'Zainab Ahmed',
    customerClass: 'text-text-primary font-semibold',
    items: '1 item • Packed at Counter',
    price: '₦9,600',
    time: '40m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentIcon: 'payments',
    paymentIconClass: 'text-badge-discount-text',
    paymentText: 'Cash • Pay on Delivery',
    paymentChipClass: 'bg-surface-container-high text-on-surface-variant',
    action: { label: 'Handover', icon: 'chevron_right', textClass: 'text-badge-discount-text' },
  },
  {
    id: '#POS-1048',
    badgeLabel: 'Completed',
    badgeClass: 'bg-surface-container text-text-secondary',
    typeChip: 'Takeaway',
    typeChipClass: 'bg-surface-container-low text-secondary',
    borderClass: '',
    customer: 'David O.',
    customerClass: 'text-text-primary font-medium',
    items: '3 items (Jollof Fiesta Box + 2)',
    price: '₦14,800',
    time: '1:15 PM',
    timeClass: 'text-text-tertiary font-medium',
    paymentIcon: 'credit_card',
    paymentText: 'POS at Counter • Collected',
    paymentChipClass: 'bg-surface-container-low text-text-secondary',
  },
  {
    id: '#VG-93870',
    badgeLabel: 'Completed',
    badgeClass: 'bg-surface-container text-text-secondary',
    typeChip: 'Pickup',
    typeChipClass: 'bg-surface-container-low text-secondary',
    borderClass: '',
    customer: 'Samuel A.',
    customerClass: 'text-text-primary font-medium',
    items: '1 item (Spicy Wings Platter)',
    price: '₦6,500',
    time: '12:40 PM',
    timeClass: 'text-text-tertiary font-medium',
    paymentIcon: 'account_balance',
    paymentText: 'Direct Bank Transfer • Verified',
    paymentChipClass: 'bg-badge-discount-bg text-badge-discount-text',
  },
];

export function BusinessOrdersHubScreen({
  onTab,
  onSwitchBookings,
  onOpenOrder,
}: BusinessOrdersHubScreenProps) {
  const [statusChip, setStatusChip] = useState<StatusChipKey>('new');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <AppScreen>
      <BusinessModeHeader title="Orders" />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Header Controls & Context */}
        <div className="bg-surface/95 backdrop-blur-md px-margin pt-space-xs pb-space-sm flex flex-col gap-space-sm shadow-[0_4px_12px_-4px_rgba(20,27,43,0.03)]">
          {/* Quick Actions */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-space-2xs">
              <button
                aria-label="Search orders"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface transition-transform active:scale-95"
                type="button"
                onClick={() => showToast('Search orders coming soon')}
              >
                <Icon name="search" className="text-[20px]" />
              </button>
              <button
                aria-label="Filter orders"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface transition-transform active:scale-95 relative"
                type="button"
                onClick={() => showToast('Filters: payment type, branch, time range')}
              >
                <Icon name="tune" className="text-[20px]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container" />
              </button>
            </div>
          </div>
          {/* Switcher: Orders vs Bookings */}
          <div className="p-1 bg-surface-container-high rounded-xl flex items-center gap-1">
            <button
              className="flex-1 py-2 rounded-lg bg-surface-container-lowest text-primary-container font-button-primary text-button-primary shadow-sm flex items-center justify-center gap-space-xs transition-all"
              type="button"
            >
              <span>Orders</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                8
              </span>
            </button>
            <button
              className="flex-1 py-2 rounded-lg text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs transition-all"
              type="button"
              onClick={onSwitchBookings}
            >
              <span>Bookings</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-medium">
                3
              </span>
            </button>
          </div>
          {/* Status Chips Bar */}
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5 -mx-margin px-margin">
            {STATUS_CHIPS.map((chip) => {
              const active = chip.key === statusChip;
              return (
                <button
                  className={`shrink-0 h-9 px-3.5 rounded-full font-label-md text-label-md active:scale-95 transition-all ${
                    active
                      ? 'bg-surface-tint-blue text-primary flex items-center gap-1.5 shadow-sm'
                      : 'bg-surface-container-low text-text-secondary'
                  }`}
                  key={chip.key}
                  type="button"
                  onClick={() => setStatusChip(chip.key)}
                >
                  {active && chip.pulse && <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Scrollable Body Content */}
        <div className="px-margin pt-space-md pb-space-xl flex flex-col gap-space-md">
          {/* Action Required Alert Strip */}
          <button
            className="bg-surface-tint-blue rounded-xl p-space-xs flex items-center justify-between text-left"
            type="button"
            onClick={onOpenOrder}
          >
            <div className="flex items-center gap-space-xs min-w-0">
              <Icon name="touch_app" className="text-primary text-[18px] shrink-0" />
              <span className="font-caption text-caption text-primary font-medium truncate">
                Tap an order to view details, accept or decline
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold shrink-0">
              3 to action
            </span>
          </button>

          {/* Compact Orders Feed */}
          <div className="flex flex-col gap-space-2xs">
            {ORDER_ROWS.map((row) => (
              <button
                className={`w-full flex items-center gap-space-xs px-3 py-3 rounded-xl bg-surface-container-lowest shadow-sm active:scale-[0.99] transition-transform text-left ${
                  row.borderClass ? `border-l-4 ${row.borderClass}` : ''
                } ${row.badgeLabel === 'Completed' ? 'opacity-75' : ''}`}
                key={row.id}
                type="button"
                onClick={onOpenOrder}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${row.ping ? 'bg-primary-container animate-pulse' : 'bg-surface-container-highest'}`} />
                <span className="font-label-md text-label-md font-bold text-on-surface tracking-tight shrink-0">
                  {row.id}
                </span>
                <span className="font-caption text-caption text-text-secondary truncate flex-1 min-w-0">
                  {row.customer} • {row.items}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${row.badgeClass}`}
                >
                  {row.badgeLabel}
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface shrink-0">
                  {row.price}
                </span>
                <Icon name="chevron_right" className="text-text-tertiary text-[18px] shrink-0" />
              </button>
            ))}
          </div>
          <div className="h-4" />
        </div>
      </div>
      <BusinessTabBar onTab={onTab} />
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
