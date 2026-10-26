import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { MobileAccountMenu, MobileLocationMenu, MobileNotificationBell } from '../components/BusinessHeaderMenus';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { useBusinessOfferings } from '../context/BusinessOfferingsContext';

export type HubModuleKey = 'deals' | 'catalog' | 'services' | 'customers' | 'loyalty' | 'locations' | 'staff' | 'profile' | 'referrals';

interface BusinessHubHomeScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenModule: (module: HubModuleKey) => void;
}

// Order mirrors the desktop Business dropdown — keep both lists in sync.
const MENU_CARDS: {
  key: HubModuleKey;
  icon: string;
  filled?: boolean;
  iconBox: string;
  title: string;
  desc: string;
  chips: { label: string; chipClass: string }[];
}[] = [
  {
    key: 'catalog',
    icon: 'inventory_2',
    iconBox: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    title: 'Products & Services',
    desc: 'Manage your central catalogue & branch inventory',
    chips: [{ label: '42 Items • 8 Services', chipClass: 'bg-surface-container text-on-secondary-container font-medium' }],
  },
  {
    key: 'deals',
    icon: 'sell',
    iconBox: 'bg-tertiary-fixed text-tertiary',
    title: 'Deals & Promotions',
    desc: 'Create and manage customer-facing offers',
    chips: [
      { label: '3 Active', chipClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold' },
      { label: '1 Scheduled', chipClass: 'bg-surface-container text-text-secondary' },
    ],
  },
  {
    key: 'customers',
    icon: 'groups',
    iconBox: 'bg-surface-tint-blue text-primary-container',
    title: 'Customers CRM',
    desc: 'Manage customer relations, history & loyalty',
    chips: [{ label: '482 Customers', chipClass: 'bg-surface-container text-on-secondary-container font-medium' }],
  },
  {
    key: 'loyalty',
    icon: 'stars',
    filled: true,
    iconBox: 'bg-surface-container-high text-primary',
    title: 'Loyalty & Rewards',
    desc: 'Configure points, rewards & customer tiers',
    chips: [{ label: 'Active • 3 Rewards', chipClass: 'bg-surface-tint-blue text-primary font-semibold' }],
  },
  {
    key: 'staff',
    icon: 'badge',
    iconBox: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    title: 'Staff & Permissions',
    desc: 'Manage employee accounts and role permissions',
    chips: [{ label: '6 Staff • 3 Roles', chipClass: 'bg-surface-container text-on-secondary-container font-medium' }],
  },
  {
    key: 'locations',
    icon: 'location_on',
    iconBox: 'bg-surface-container-high text-primary',
    title: 'Locations & Branches',
    desc: 'Manage branches and where the business operates',
    chips: [{ label: '3 Branches (2 Active)', chipClass: 'bg-surface-container text-on-secondary-container font-medium' }],
  },
  {
    key: 'profile',
    icon: 'storefront',
    iconBox: 'bg-surface-tint-blue text-primary-container',
    title: 'Business Profile',
    desc: 'Manage how your business appears to customers',
    chips: [{ label: 'Verified', chipClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold' }],
  },
  {
    key: 'referrals',
    icon: 'group_add',
    iconBox: 'bg-surface-tint-blue text-primary-container',
    title: 'Referrals',
    desc: 'Invite other businesses and earn referral rewards',
    chips: [{ label: 'Programme preview', chipClass: 'bg-surface-container text-text-secondary' }],
  },
];

export function BusinessHubHomeScreen({ onTab, onOpenModule }: BusinessHubHomeScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  // Branch switching lives only in the header's MobileLocationMenu.
  const { branch } = useBusinessBranch();
  const { offerings, mode } = useBusinessOfferings();

  const menuCards = MENU_CARDS.map((card) => {
    if (card.key === 'catalog') {
      if (mode === 'products') {
        return {
          ...card,
          title: 'My Products',
          desc: 'Manage your product catalogue, stock & prices',
          icon: 'inventory_2',
          chips: [{ label: '42 Products in Stock', chipClass: 'bg-surface-container text-on-secondary-container font-medium' }],
        };
      }
      if (mode === 'services') {
        return {
          ...card,
          title: 'My Services',
          desc: 'Manage your service menu, pricing & booking rules',
          icon: 'content_cut',
          chips: [{ label: '8 Services Active', chipClass: 'bg-surface-container text-on-secondary-container font-medium' }],
        };
      }
    }
    if (card.key === 'deals') {
      if (mode === 'products') {
        return {
          ...card,
          title: 'Product Deals',
          desc: 'Create product-specific discounts & combo deals',
          chips: [
            { label: '3 Active Deals', chipClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold' },
            { label: '1 Scheduled', chipClass: 'bg-surface-container text-text-secondary' },
          ],
        };
      }
      if (mode === 'services') {
        return {
          ...card,
          title: 'Service Deals',
          desc: 'Create service packages, discounts & special offers',
          chips: [
            { label: '2 Active Deals', chipClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold' },
            { label: '1 Scheduled', chipClass: 'bg-surface-container text-text-secondary' },
          ],
        };
      }
    }
    return card;
  });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <AppScreen>
      {/* Header — the persistent location switcher lives beside the bell. */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Business</span>
              <h1 className="font-label-md text-label-md font-semibold text-on-surface truncate max-w-[160px]">
                {branch.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <MobileLocationMenu />
            <MobileNotificationBell />
            <MobileAccountMenu />
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 px-margin pb-28">
        {/* Welcome Area */}
        <div className="flex flex-col pt-space-md pb-space-sm">
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-sm py-1 rounded-full shadow-sm">
              <Icon name="verified" filled className="text-[15px]" />
              <span className="font-caption text-caption font-semibold tracking-tight">
                Verified Business • 3 Branches Active
              </span>
            </div>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-primary hover:bg-surface-tint-blue transition-all active:scale-95"
              type="button"
              onClick={() => showToast('Branch architecture guide opened')}
            >
              <Icon name="help_outline" className="text-[18px]" />
            </button>
          </div>
          <div className="mt-space-sm">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Business</h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              Manage your business, locations, catalogue and customers.
            </p>
          </div>
        </div>

        {/* Quick Stat Mosaic */}
        <div className="grid grid-cols-2 gap-space-xs my-space-xs">
          <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0">
              <Icon name="trending_up" className="text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary truncate">Sync Status</span>
              <span className="font-label-md text-label-md font-semibold text-text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                Live to 3 Sites
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary-container shrink-0">
              <Icon name="bolt" className="text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary truncate">Catalogue Hub</span>
              <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                50 Live Entities
              </span>
            </div>
          </div>
        </div>

        {/* Enable Services Banner */}
        {!offerings.hasServices && (
          <div className="mt-space-sm p-space-md rounded-xl bg-gradient-to-r from-surface-tint-blue/80 via-surface-container-lowest to-surface-canvas border border-primary/20 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="content_cut" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Enable Services</h3>
                <p className="font-body-md text-body-md text-text-secondary line-clamp-1">
                  Also provide services? Turn this on in your business profile.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenModule('profile')}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shrink-0 hover:bg-primary-container active:scale-95 transition-all shadow-sm"
            >
              Turn On
            </button>
          </div>
        )}

        {/* Enable Products Banner */}
        {!offerings.hasProducts && (
          <div className="mt-space-sm p-space-md rounded-xl bg-gradient-to-r from-surface-tint-blue/80 via-surface-container-lowest to-surface-canvas border border-primary/20 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="inventory_2" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Enable Products</h3>
                <p className="font-body-md text-body-md text-text-secondary line-clamp-1">
                  Also sell products? Turn this on in your business profile.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenModule('profile')}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shrink-0 hover:bg-primary-container active:scale-95 transition-all shadow-sm"
            >
              Turn On
            </button>
          </div>
        )}

        {/* Management Menu Cards */}
        <div className="flex flex-col gap-space-xs mt-space-sm">
          {menuCards.map((card) => (
            <button
              className="group relative flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm active:scale-[0.99] transition-all hover:shadow-md w-full text-left"
              key={card.key}
              type="button"
              onClick={() => onOpenModule(card.key)}
            >
              <div className="flex items-center gap-space-md min-w-0 pr-space-xs">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${card.iconBox}`}
                >
                  <Icon name={card.icon} filled={card.filled} className="text-[24px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading-sm text-heading-sm text-text-primary truncate">{card.title}</span>
                  <span className="font-body-md text-body-md text-text-secondary mt-0.5 line-clamp-1">{card.desc}</span>
                  <div className="mt-1 flex items-center gap-1">
                    {card.chips.map((chip) => (
                      <span
                        className={`px-space-xs py-0.5 rounded-full font-caption text-caption ${chip.chipClass}`}
                        key={chip.label}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center text-text-tertiary group-hover:text-primary transition-colors shrink-0">
                <Icon name="chevron_right" className="text-[22px]" />
              </div>
            </button>
          ))}
        </div>

        {/* Ecosystem Card */}
        <div className="relative overflow-hidden mt-space-lg p-space-md rounded-xl bg-gradient-to-br from-surface-tint-blue via-surface-container-lowest to-surface-container-low shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-primary/5 pointer-events-none" />
          <div className="flex items-start gap-space-sm relative z-10">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Icon name="hub" className="text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading-sm text-heading-sm text-text-primary">
                Centralized Multi-Location System
              </span>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                <strong className="font-semibold text-text-primary">Locations</strong> is the single source of truth.
                Your products, deals, loyalty rules, and staff automatically link to your branches without duplicate
                data.
              </p>
              <div className="mt-space-sm flex items-center gap-space-2xs text-primary font-label-md text-label-md font-semibold">
                <span>Explore Architecture Sync</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BusinessTabBar active="business" onTab={onTab} />

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
