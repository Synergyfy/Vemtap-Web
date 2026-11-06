import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { MobileAccountMenu, MobileLocationMenu, MobileNotificationBell } from '../components/BusinessHeaderMenus';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { hubCardChips, useHubModuleCounts } from '../hooks/business/useHubModuleCounts';
import { hasApiConfig } from '../services/api/client';
import { useBusinessOfferings } from '../context/BusinessOfferingsContext';
import { useBusinessFeatures } from '../context/BusinessFeaturesContext';
import type { FeatureId } from './businessFeatures';

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
  const { branch, branches } = useBusinessBranch();
  const hubCounts = useHubModuleCounts();
  const { offerings, mode } = useBusinessOfferings();
  const { features } = useBusinessFeatures();

  // Cards for tools the business has switched off are dropped (Business Profile
  // is always available).
  const CARD_FEATURE: Partial<Record<HubModuleKey, FeatureId>> = {
    deals: 'deals',
    customers: 'customers',
    loyalty: 'loyalty',
    staff: 'staff',
    locations: 'locations',
    referrals: 'referrals',
  };
  const visibleCards = MENU_CARDS.filter((card) => {
    // The catalogue card covers Products *and* Services — at least one of the
    // two always stays on, so this card never disappears.
    if (card.key === 'catalog') return Boolean(features.products || features.services);
    const feature = CARD_FEATURE[card.key];
    return feature === undefined || Boolean(features[feature]);
  });

  const menuCards = visibleCards.map((card) => {
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
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Business</span>
              <h1 className="font-label-md text-label-md font-bold text-on-surface truncate max-w-[160px]">
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
        <div className="flex flex-col pt-space-sm pb-space-xs">
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-1.5 bg-badge-discount-bg text-badge-discount-text px-2.5 py-0.5 rounded-full shadow-xs">
              <Icon name="verified" filled className="text-[13px]" />
              <span className="font-caption text-caption font-semibold tracking-tight">
                {hasApiConfig()
                  ? `${hubCounts.verification === 'Not verified' ? 'Business' : 'Verified Business'} • ${branches.length} ${branches.length === 1 ? 'Branch' : 'Branches'}`
                  : 'Verified Business • 3 Branches Active'}
              </span>
            </div>
            <button
              className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-container text-primary hover:bg-surface-tint-blue transition-all active:scale-95"
              type="button"
              onClick={() => showToast('Branch architecture guide opened')}
            >
              <Icon name="help_outline" className="text-[16px]" />
            </button>
          </div>
          <div className="mt-space-xs">
            <h1 className="font-label-md text-label-md font-bold text-text-primary tracking-tight">Business Hub</h1>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              Manage your business, locations, catalogue and customers.
            </p>
          </div>
        </div>

        {/* Quick Stat Mosaic */}
        <div className="grid grid-cols-2 gap-space-xs my-space-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0">
              <Icon name="trending_up" className="text-[18px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary truncate">Sync Status</span>
              <span className="font-label-sm text-label-sm font-semibold text-text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                Live to 3 Sites
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary-container shrink-0">
              <Icon name="bolt" className="text-[18px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary truncate">Catalogue Hub</span>
              <span className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                50 Live Entities
              </span>
            </div>
          </div>
        </div>

        {/* Enable Services Banner */}
        {!offerings.hasServices && (
          <div className="mt-space-xs p-2.5 rounded-xl bg-gradient-to-r from-surface-tint-blue/80 via-surface-container-lowest to-surface-canvas border border-primary/20 flex items-center justify-between gap-2.5 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                <Icon name="content_cut" className="text-[16px]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-label-sm text-label-sm font-semibold text-text-primary">Enable Services</h3>
                <p className="font-caption text-caption text-text-secondary line-clamp-1">
                  Also provide services? Turn this on in your business profile.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenModule('profile')}
              className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shrink-0 hover:bg-primary-container active:scale-95 transition-all shadow-xs"
            >
              Turn On
            </button>
          </div>
        )}

        {/* Enable Products Banner */}
        {!offerings.hasProducts && (
          <div className="mt-space-xs p-2.5 rounded-xl bg-gradient-to-r from-surface-tint-blue/80 via-surface-container-lowest to-surface-canvas border border-primary/20 flex items-center justify-between gap-2.5 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                <Icon name="inventory_2" className="text-[16px]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-label-sm text-label-sm font-semibold text-text-primary">Enable Products</h3>
                <p className="font-caption text-caption text-text-secondary line-clamp-1">
                  Also sell products? Turn this on in your business profile.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenModule('profile')}
              className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shrink-0 hover:bg-primary-container active:scale-95 transition-all shadow-xs"
            >
              Turn On
            </button>
          </div>
        )}

        {/* Management Menu Cards — PalmPay / OPay compact density matching /business/more */}
        <div className="mt-space-sm flex flex-col gap-2">
          <div className="px-1 flex items-center justify-between">
            <span className="font-label-md text-label-md text-text-primary font-semibold tracking-wide uppercase truncate">
              Business Management
            </span>
            <span className="font-caption text-caption text-text-tertiary">
              {menuCards.length} Tools
            </span>
          </div>
          <div className="rounded-2xl bg-surface-canvas shadow-sm divide-y divide-border-subtle overflow-hidden flex flex-col">
            {menuCards.map((card) => (
              <button
                className="w-full flex items-center gap-space-sm p-space-md text-left hover:bg-surface-subtle active:bg-surface-container-low transition-colors"
                key={card.key}
                type="button"
                onClick={() => onOpenModule(card.key)}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBox}`}
                >
                  <Icon name={card.icon} filled={card.filled} className="text-[20px]" />
                </span>
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                      {card.title}
                    </span>
                    {hubCardChips(card.key, card.chips, hubCounts).map((chip) => (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${chip.chipClass}`}
                        key={chip.label}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate mt-0.5">
                    {card.desc}
                  </span>
                </span>
                <Icon name="chevron_right" className="text-[18px] text-outline-variant shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Ecosystem Card */}
        <div className="relative overflow-hidden mt-space-md p-3 rounded-xl bg-gradient-to-br from-surface-tint-blue via-surface-container-lowest to-surface-container-low shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary/5 pointer-events-none" />
          <div className="flex items-start gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Icon name="hub" className="text-[18px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                Centralized Multi-Location System
              </span>
              <p className="font-caption text-caption text-text-secondary mt-0.5 leading-relaxed">
                <strong className="font-semibold text-text-primary">Locations</strong> is the single source of truth.
                Products, deals, loyalty rules, and staff automatically link across branches without duplicate data.
              </p>
              <div className="mt-2 flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
                <span>Explore Architecture Sync</span>
                <Icon name="arrow_forward" className="text-[14px]" />
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
