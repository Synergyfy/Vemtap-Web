import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { hubCardChips, useHubModuleCounts } from '../../hooks/business/useHubModuleCounts';
import { useOffers } from '../../hooks/business/useOffers';
import { hasApiConfig } from '../../services/api/client';
import type { HubModuleKey } from '../BusinessHubHomeScreen';

interface DesktopBusinessHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBoost: (item: string) => void;
  onPreviewStorefront: () => void;
  onOpenModule: (module: HubModuleKey) => void;
}

interface HubModule {
  key: HubModuleKey;
  icon: string;
  filled?: boolean;
  iconBox: string;
  title: string;
  desc: string;
  chips: Array<{ label: string; chipClass: string }>;
}

const HUB_MODULES: HubModule[] = [
  {
    key: 'deals',
    icon: 'sell',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Deals & Promotions',
    desc: 'Create and manage customer-facing offers',
    chips: [
      { label: '3 Active', chipClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold' },
      { label: '1 Scheduled', chipClass: 'bg-surface-container-low text-text-secondary' },
    ],
  },
  {
    key: 'catalog',
    icon: 'inventory_2',
    iconBox: 'bg-surface-container-high text-primary',
    title: 'Products & Services',
    desc: 'Manage your central catalogue & branch inventory',
    chips: [
      { label: '42 Items • 8 Services', chipClass: 'bg-surface-container-low text-text-secondary font-medium' },
    ],
  },
  {
    key: 'customers',
    icon: 'groups',
    iconBox: 'bg-surface-tint-blue text-primary',
    title: 'Customers CRM',
    desc: 'Manage customer relations, history & loyalty',
    chips: [{ label: '482 Customers', chipClass: 'bg-surface-container-low text-text-secondary font-medium' }],
  },
  {
    key: 'loyalty',
    icon: 'stars',
    filled: true,
    iconBox: 'bg-surface-container-high text-primary',
    title: 'Loyalty Programme',
    desc: 'Configure points, rewards & customer tiers',
    chips: [{ label: 'Active • 3 Rewards', chipClass: 'bg-surface-tint-blue text-primary font-semibold' }],
  },
  {
    key: 'locations',
    icon: 'location_on',
    iconBox: 'bg-surface-container-high text-primary',
    title: 'Locations & Branches',
    desc: 'Manage branches and where the business operates',
    chips: [
      { label: '3 Branches (2 Active)', chipClass: 'bg-surface-container-low text-text-secondary font-medium' },
    ],
  },
  {
    key: 'staff',
    icon: 'badge',
    iconBox: 'bg-surface-container-high text-primary',
    title: 'Staff & Team Access',
    desc: 'Manage employee accounts and role permissions',
    chips: [{ label: '6 Staff • 3 Roles', chipClass: 'bg-surface-container-low text-text-secondary font-medium' }],
  },
  {
    key: 'profile',
    icon: 'storefront',
    iconBox: 'bg-surface-tint-blue text-primary',
    title: 'Business Profile',
    desc: 'Manage how your business appears to customers',
    chips: [{ label: 'Verified', chipClass: 'bg-badge-discount-bg text-badge-discount-text font-semibold' }],
  },
  {
    key: 'referrals',
    icon: 'group_add',
    iconBox: 'bg-surface-tint-blue text-primary',
    title: 'Referrals',
    desc: 'Invite other businesses and earn referral rewards',
    chips: [{ label: 'Programme preview', chipClass: 'bg-surface-container-low text-text-secondary font-medium' }],
  },
];

const BOOST_ITEM = 'Weekend Prime Lunch Combo';

export function DesktopBusinessHubScreen({
  onNav,
  onBoost,
  onPreviewStorefront,
  onOpenModule,
}: DesktopBusinessHubScreenProps) {
  const { branch, branches, switchTo } = useBusinessBranch();
  const hubCounts = useHubModuleCounts();
  const live = hasApiConfig();
  const offers = useOffers();
  // Live: promote the branch's first active deal; none → the card invites creating one.
  const boostItem = live
    ? (offers.data ?? []).find((offer) => offer.status === 'active')?.name ?? null
    : BOOST_ITEM;
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <BusinessPortalChrome activeNav="overview" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg">
        {/* Eyebrow, title, supporting sentence & storefront action */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-sm py-1 rounded-full shadow-sm">
                <Icon name="verified" filled className="text-[15px]" />
                <span className="font-caption text-caption font-semibold tracking-tight">
                  {live
                    ? `${hubCounts.verification === 'Not verified' ? 'Business' : 'Verified Business'} • ${branches.length} ${branches.length === 1 ? 'Branch' : 'Branches'}`
                    : 'Verified Business • 3 Branches Active'}
                </span>
              </span>
              <button
                type="button"
                title="Branch architecture guide"
                onClick={() => showToast('Branch architecture guide opened')}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-low text-primary hover:bg-surface-tint-blue transition-all"
              >
                <Icon name="help_outline" className="text-[18px]" />
              </button>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Business</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Manage your business, locations, catalogue and customers.
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              onClick={onPreviewStorefront}
              className="flex items-center gap-space-xs px-space-lg h-[46px] rounded-xl bg-primary-container text-on-primary hover:opacity-90 transition-opacity font-button-primary text-button-primary shadow-md"
            >
              <span>Preview Storefront</span>
              <Icon name="open_in_new" className="text-[18px]" />
            </button>
          </div>
        </section>

        {/* Branch pill carousel */}
        <div className="w-full flex items-center gap-space-xs overflow-x-auto pb-space-2xs">
          {branches.map((pillBranch) => {
            const active = pillBranch.key === branch.key;
            return (
              <button
                key={pillBranch.key}
                type="button"
                onClick={() => switchTo(pillBranch.key)}
                className={`shrink-0 flex items-center gap-space-2xs px-space-md h-9 rounded-full font-label-md text-label-md transition-all ${
                  active
                    ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                    : 'bg-surface-container-low text-text-secondary hover:bg-surface-container-high'
                }`}
              >
                {active && <Icon name="location_on" filled className="text-[16px]" />}
                <span>{pillBranch.shortName} Branch</span>
                {active && <Icon name="expand_more" className="text-[14px]" />}
              </button>
            );
          })}
        </div>

        {/* Quick stat mosaic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          <div className="xl:col-span-2 flex items-center gap-space-sm p-space-md rounded-xl bg-surface-canvas shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
              <Icon name="trending_up" className="text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary truncate">Sync Status</span>
              <span className="font-label-md text-label-md font-semibold text-text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                Live to {branches.length} {branches.length === 1 ? 'Site' : 'Sites'}
              </span>
            </div>
          </div>
          <div className="xl:col-span-2 flex items-center gap-space-sm p-space-md rounded-xl bg-surface-canvas shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <Icon name="bolt" className="text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary truncate">Catalogue Hub</span>
              <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                {live ? (hubCounts.catalog ?? '—') : '50 Live Entities'}
              </span>
            </div>
          </div>
        </div>

        {/* Management module card grid */}
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between gap-space-sm flex-wrap">
            <div className="flex items-center gap-space-xs">
              <Icon name="grid_view" className="text-primary text-[20px]" />
              <h2 className="font-heading-md text-heading-md text-text-primary">Management Modules</h2>
            </div>
            <span className="font-caption text-caption text-text-tertiary">{live ? `${branches.length} ${branches.length === 1 ? 'branch' : 'branches'} synchronized` : '7 modules • 3 branches synchronized'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {HUB_MODULES.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => onOpenModule(card.key)}
                className="group bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden text-left"
              >
                <div className="p-space-lg flex flex-col gap-space-md">
                  <div className="flex items-start justify-between gap-space-xs">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${card.iconBox}`}
                    >
                      <Icon name={card.icon} filled={card.filled} className="text-[24px]" />
                    </div>
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {hubCardChips(card.key, card.chips, hubCounts).map((chip) => (
                        <span
                          className={`px-space-xs py-0.5 rounded-full font-caption text-caption ${chip.chipClass}`}
                          key={chip.label}
                        >
                          {chip.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{card.desc}</p>
                  </div>
                </div>
                <div className="px-space-lg py-space-sm bg-surface-subtle flex items-center justify-end group-hover:bg-surface-tint-blue transition-colors">
                  <span className="font-button-secondary text-button-secondary text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open module</span>
                    <Icon name="arrow_forward" className="text-[18px]" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Boost promo band */}
        <section className="rounded-2xl p-space-md sm:p-space-lg bg-surface-tint-blue border border-border-subtle shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-sm min-w-0">
            <div className="w-11 h-11 rounded-xl bg-surface-canvas text-primary flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="bolt" className="text-[22px]" filled />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                Boost Campaign
              </span>
              <h2 className="font-heading-md text-heading-md text-text-primary">
                {live ? 'Reach nearby customers in one tap' : 'Reach 3,500 nearby customers in one tap'}
              </h2>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                {boostItem ? (
                  <>
                    Push <strong className="font-semibold text-text-primary">{boostItem}</strong> to shoppers inside
                    your {live ? `${branch.name} geofence` : 'Wuse II geofence before the weekend lunch rush'}.
                  </>
                ) : (
                  'Publish a deal first, then boost it to shoppers around your branch.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (boostItem ? onBoost(boostItem) : onOpenModule('deals'))}
            className="shrink-0 flex items-center justify-center gap-space-xs px-space-lg h-[46px] rounded-xl bg-primary-container text-on-primary hover:opacity-90 transition-opacity font-button-primary text-button-primary shadow-md"
          >
            <Icon name="trending_up" className="text-[20px]" />
            <span>{boostItem ? `Boost ${boostItem}` : 'Create a deal'}</span>
          </button>
        </section>

        {/* Ecosystem / architecture card */}
        <section className="relative overflow-hidden p-space-md rounded-xl bg-gradient-to-br from-surface-tint-blue via-surface-container-lowest to-surface-container-low shadow-sm border border-border-subtle">
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
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-margin">
          <div className="bg-surface-canvas border border-border-subtle text-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
