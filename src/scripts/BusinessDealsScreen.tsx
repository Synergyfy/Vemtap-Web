import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { DealsPanel } from '../components/business/DealsPanel';
import { hasApiConfig } from '../services/api/client';
import { BusinessHubHeader } from './BusinessHubHeader';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { MobileAccountMenu, MobileNotificationBell } from '../components/BusinessHeaderMenus';

interface BusinessDealsScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onBoost: (itemName?: string) => void;
  onOpenDeal: () => void;
  onCreateDeal: () => void;
}

const BRANCH_OPTIONS = ['All Locations (3)', 'Wuse Branch', 'Victoria Island', 'Maitama Suite'];

const DEAL_TABS = [
  { key: 'active', label: 'Active (6)', icon: 'local_fire_department' },
  { key: 'scheduled', label: 'Scheduled (2)' },
  { key: 'expired', label: 'Expired (14)' },
  { key: 'drafts', label: 'Drafts (3)' },
];

interface DealCard {
  key: string;
  name: string;
  category: string;
  price: string;
  compare: string;
  img: string;
  alt: string;
  discountBadge: string;
  extraBadge?: string;
  extraBadgeClass?: string;
  scheduleLine: { icon: string; text: string };
  claimsLine: string;
  branchIcon: string;
  branchLine: string;
  metric?: { title: string; sub?: string; rate: string; barClass: string; progress: number } | null;
  boostBanner?: { title: string; sub: string; timeLeft: string };
  primaryAction: { label: string; icon: string; btnClass: string; iconClass: string };
}
const DEALS: DealCard[] = [
  {
    key: 'lunch-combo',
    name: 'Weekend Prime Lunch Combo',
    category: 'Urban Grill & Bistro · Combo',
    price: '₦9,600',
    compare: '₦12,000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7UD2KjuS73wFW5QtFqeO8fRDUFgc_lnbHptwAnJk5BAUua-CSZwIIbuoGevwysSzZR_3IxtQX8ushW2t--EtWpoOqS3VmsToACnG1W1aocbJ1vgz87fyokns3PhEuL22vbrWZmYo9ipWUjGVeqiq9MAM4Y5woyf3byq6CQmZEkzrRpvzNrTYRPsfpnK8FtDJT3HL-dWjvoF9DXE44Jw0349e1F5T_VHx1kQdAA7eycG34Zln0qyRiyA',
    alt: 'Close up gourmet food photography of a juicy woodfire grilled prime ribeye steak cooked to medium rare perfection with charred grill marks, sea salt crystals, fresh rosemary butter melt, alongside an artisan icy hibiscus craft mocktail on dark slate table in warm ambient restaurant light',
    discountBadge: '20% OFF',
    extraBadge: 'High Demand',
    extraBadgeClass: 'bg-tertiary-container/90 text-on-tertiary-container',
    scheduleLine: { icon: 'schedule', text: 'Ends Sunday (Oct 20)' },
    claimsLine: '128 claims · 89 redeemed',
    branchIcon: 'storefront',
    branchLine: 'Wuse II, Garki & Maitama (All 3 branches)',
    metric: { title: 'Redemption Rate: 70%', sub: '39 vouchers unredeemed', rate: '70%', barClass: 'bg-primary', progress: 70 },
    primaryAction: { label: 'Boost Deal', icon: 'rocket_launch', btnClass: 'bg-tertiary-fixed text-on-tertiary-fixed', iconClass: 'text-tertiary' },
  },
  {
    key: 'smash-burger',
    name: '2-for-1 Smash Burger Thursday',
    category: 'Burger Bar Specials',
    price: '₦6,500',
    compare: '₦13,000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD89G-6IAWUjd_WIPzaJh4c-vL1GrMInTxfmhu_9j6HkvzZJoj0-lu5uBUb42mMcfHkGH-_Z-S0Lvb2pQ7DGdraW749rnRVQEvON45sMnakBnpi9qZrp-63lVs7ABl2hBjaIBDEmirC6iFT5IJn5DOOKAnnGiRLDQF4VZyt_cPY0ytWwG1OiuMs8vi_MI_lt681Bi0aZZQU1npUoeM9RJS350uF97yYR_eLh5QjhI8rtrAaHUzuWiFnfg',
    alt: 'Appetizing food photo of two smash burgers with lacy crispy edges, melted American cheese cascades, caramelized onions, house pickles and brioche buns on parchment paper inside a modern neon-lit diner aesthetic',
    discountBadge: '50% BOGO',
    extraBadge: 'Boost Active (+2.4k Views)',
    extraBadgeClass: 'bg-primary-container text-on-primary-container',
    scheduleLine: { icon: 'event_available', text: 'Oct 17 – Nov 17, 2024' },
    claimsLine: '412 claims',
    branchIcon: 'pin_drop',
    branchLine: 'Wuse II Branch only',
    boostBanner: {
      title: 'Rocket Boost Running',
      sub: 'Generating 4x more nearby customer clicks',
      timeLeft: '2d left',
    },
    primaryAction: { label: 'Boost Stats', icon: 'query_stats', btnClass: 'bg-primary-fixed text-on-primary-fixed', iconClass: 'text-on-primary-fixed' },
  },
  {
    key: 'chill-pass',
    name: 'After-Work Chill Pass',
    category: 'Craft Bar & Bites',
    price: '₦4,200',
    compare: '₦5,400',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3FoLQSsac2lKvRt0mQPCK6XLunud0l6ONuxlUPOkRKoP9It0qjuQ5pKiUDQ7RqOZ3b_iOcfK5S3f6IQ9GDt9l9rqyLHi8MhxLU_1VBAUpaneoWNaBs4Iytza8XZPdr1dDknC6d731y7WB6MCqY9ka1IksAmguIeKyi8DAGcG8-OUvOdVISoQHp7M1mD2C4Zx3j_WY1tSsLUYkKrBCKROHA2RJ-DDX4wryDh6VO_Kv9Cbu4hL3mpz_og',
    alt: 'Atmospheric gastropub shot showcasing golden crispy truffle parmesan fries garnished with fresh micro parsley alongside a cold condensation-covered craft beer glass freshly poured from tap, moody amber lounge backdrop',
    discountBadge: '22% OFF',
    extraBadge: 'Active',
    extraBadgeClass: 'bg-surface-canvas/90 text-on-surface',
    scheduleLine: { icon: 'schedule', text: 'Weekdays · 4:00 PM – 7:00 PM' },
    claimsLine: '78 claims',
    branchIcon: 'storefront',
    branchLine: 'Maitama, Wuse II (2 branches)',
    primaryAction: { label: 'Boost Deal', icon: 'rocket_launch', btnClass: 'bg-tertiary-fixed text-on-tertiary-fixed', iconClass: 'text-tertiary' },
  },
];

export function BusinessDealsScreen({ onTab, onBoost, onOpenDeal, onCreateDeal }: BusinessDealsScreenProps) {
  const [branch, setBranch] = useState('All Locations (3)');
  const [branchOpen, setBranchOpen] = useState(false);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsDeal, setActionsDeal] = useState<DealCard | null>(null);
  const [paused, setPaused] = useState<Record<string, boolean>>({});

  const visibleDeals = DEALS.filter(
    (deal) => search.trim() === '' || deal.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // Live: real deals at the active branch; the designed list below is the demo.
  if (hasApiConfig()) {
    return (
      <AppScreen>
        <BusinessHubHeader />
        <div className="flex flex-col w-full flex-1 px-margin pt-space-sm pb-28 gap-space-md">
          <h1 className="font-heading-md text-heading-md text-text-primary">Deals</h1>
          <DealsPanel onCreate={onCreateDeal} onBoost={onBoost} />
        </div>
        <BusinessTabBar active="business" onTab={onTab} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      {/* Header with branch selector */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center min-w-0 flex-1">
            <div className="relative">
              {branchOpen && <div className="fixed inset-0 z-30" onClick={() => setBranchOpen(false)} />}
              <button
                className="min-h-[44px] px-space-xs flex items-center gap-space-2xs text-left max-w-full rounded-lg"
                type="button"
                onClick={() => setBranchOpen((open) => !open)}
              >
                <Icon name="storefront" className="text-primary text-[20px] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-secondary truncate">Branch Selector</span>
                  <div className="flex items-center gap-space-2xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{branch}</span>
                    <Icon
                      name="expand_more"
                      className={`text-on-surface-variant text-[16px] shrink-0 transition-transform ${branchOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              </button>
              {branchOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-surface-canvas rounded-xl shadow-xl p-1.5 z-40 flex flex-col">
                  {BRANCH_OPTIONS.map((option) => (
                    <button
                      className={`w-full text-left px-3 py-2 rounded-lg font-label-sm text-label-sm flex items-center justify-between transition-colors ${
                        option === branch
                          ? 'bg-surface-tint-blue text-primary font-semibold'
                          : 'text-on-surface hover:bg-surface-subtle'
                      }`}
                      key={option}
                      type="button"
                      onClick={() => {
                        setBranch(option);
                        setBranchOpen(false);
                      }}
                    >
                      <span>{option}</span>
                      {option === branch && <Icon name="check" className="text-[16px]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Search"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface"
              type="button"
            >
              <Icon name="search" className="text-[22px]" />
            </button>
            <MobileNotificationBell />
            <MobileAccountMenu />
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-28">
        <div className="px-margin pt-space-md flex flex-col gap-space-sm">
          {/* Heading + New Deal */}
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex flex-col min-w-0">
              <span className="font-heading-md text-heading-md text-on-surface font-semibold tracking-tight">
                Campaigns & Deals
              </span>
              <span className="font-caption text-caption text-text-secondary">
                Track claims, boost discovery, manage reach
              </span>
            </div>
            <button
              className="h-10 px-space-md rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold shadow-sm flex items-center gap-space-2xs active:scale-95 transition-transform shrink-0"
              type="button"
              onClick={onCreateDeal}
            >
              <Icon name="add" className="text-[18px]" />
              <span>New Deal</span>
            </button>
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-space-xs">
            <div className="flex-1 flex items-center bg-surface-container-low px-space-sm py-2.5 rounded-xl text-on-surface shadow-sm">
              <Icon name="search" className="text-text-tertiary text-[20px] mr-space-2xs" />
              <input
                className="w-full bg-transparent border-0 outline-none font-body-md text-body-md text-on-surface placeholder:text-text-tertiary"
                placeholder="Search deals or branches..."
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <button
              className="h-11 px-space-sm bg-surface-container-low rounded-xl text-on-surface flex items-center gap-space-2xs shadow-sm shrink-0"
              type="button"
            >
              <Icon name="tune" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm font-semibold">Filter</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar py-space-2xs -mx-margin px-margin">
            {DEAL_TABS.map((dealTab) => {
              const active = tab === dealTab.key;
              return (
                <button
                  className={`h-9 px-space-md rounded-full font-label-md text-label-md flex items-center gap-space-2xs shrink-0 transition-all ${
                    active
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'bg-surface-container-low text-text-secondary font-medium hover:text-on-surface'
                  }`}
                  key={dealTab.key}
                  type="button"
                  onClick={() => setTab(dealTab.key)}
                >
                  {dealTab.icon && <Icon name={dealTab.icon} className="text-[16px]" />}
                  <span>{dealTab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Pulse Card */}
        <div className="px-margin mt-space-sm">
          <div className="bg-gradient-to-br from-primary-fixed/50 via-surface-container-low to-surface-container p-space-md rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-2xs">
                <Icon name="monitoring" className="text-primary text-[18px]" />
                <span className="font-label-sm text-label-sm font-semibold text-primary">Live Pulse · 3 Branches</span>
              </div>
              <span className="font-caption text-caption text-text-secondary bg-surface-canvas/80 px-2 py-0.5 rounded-full">
                Synced just now
              </span>
            </div>
            <div className="grid grid-cols-3 gap-space-2xs pt-space-xs">
              <div className="flex flex-col">
                <span className="font-heading-sm text-heading-sm font-bold text-on-surface">6</span>
                <span className="font-caption text-caption text-text-secondary">Active Deals</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading-sm text-heading-sm font-bold text-on-surface">1,480</span>
                <span className="font-caption text-caption text-text-secondary">Total Claims</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading-sm text-heading-sm font-bold text-badge-discount-text">₦1.8M</span>
                <span className="font-caption text-caption text-text-secondary">Gross Claimed</span>
              </div>
            </div>
            <div className="w-full bg-surface-canvas/60 h-1.5 rounded-full mt-space-sm overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '76%' }} />
            </div>
            <div className="flex items-center justify-between mt-space-2xs text-text-secondary">
              <span className="font-caption text-caption">Daily redemption target: 76% achieved</span>
              <span className="font-caption text-caption font-semibold text-primary">+18% vs last wk</span>
            </div>
          </div>
        </div>

        {/* Deals List */}
        <div className="px-margin flex flex-col gap-space-md mt-space-md">
          {visibleDeals.map((deal) => (
            <div
              className="bg-surface-canvas rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all cursor-pointer active:scale-[0.99]"
              key={deal.key}
              onClick={() => onOpenDeal()}
            >
              {/* Media Header */}
              <div className="relative w-full h-44 bg-surface-container-highest overflow-hidden">
                <img alt={deal.alt} className="w-full h-full object-cover" src={deal.img} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                <div className="absolute top-3 left-3 flex items-center gap-space-2xs flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold tracking-tight shadow-sm">
                    {deal.discountBadge}
                  </span>
                  {deal.extraBadge && (
                    <span
                      className={`px-2.5 py-1 rounded-full font-caption text-caption font-semibold flex items-center gap-1 shadow-sm ${
                        deal.extraBadgeClass ?? ''
                      }`}
                    >
                      {deal.key === 'lunch-combo' && <Icon name="local_fire_department" className="text-[14px]" />}
                      {deal.key === 'smash-burger' && <Icon name="bolt" className="text-[14px]" />}
                      {deal.key === 'chill-pass' && (
                        <Icon name="check_circle" className="text-[14px] text-badge-discount-text" />
                      )}
                      {deal.extraBadge}
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    aria-label="Deal options"
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActionsDeal(deal);
                      setActionsOpen(true);
                    }}
                  >
                    <Icon name="more_vert" className="text-[20px]" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-space-2xs font-caption text-caption">
                    <Icon name={deal.scheduleLine.icon} className="text-[16px] text-badge-discount-bg" />
                    <span>{deal.scheduleLine.text}</span>
                  </div>
                  <span className="font-caption text-caption bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-medium">
                    {deal.claimsLine}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-space-md flex flex-col gap-space-xs">
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex flex-col min-w-0">
                    <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                      {deal.category}
                    </span>
                    <span className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate">
                      {deal.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-heading-sm text-heading-sm text-primary font-bold">{deal.price}</span>
                    <span className="font-caption text-caption text-text-tertiary line-through">{deal.compare}</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-2xs text-text-secondary">
                  <Icon name={deal.branchIcon} className="text-[16px] text-primary" />
                  <span className="font-label-sm text-label-sm truncate">{deal.branchLine}</span>
                </div>

                {deal.metric && (
                  <div className="bg-surface-subtle p-space-xs rounded-xl flex items-center justify-between mt-space-2xs">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                        <Icon name="redeem" className="text-[18px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                          {deal.metric.title}
                        </span>
                        <span className="font-caption text-caption text-text-secondary truncate">
                          {deal.metric.sub}
                        </span>
                      </div>
                    </div>
                    <Icon name="chevron_right" className="text-text-tertiary text-[18px] shrink-0" />
                  </div>
                )}

                {deal.boostBanner && (
                  <div className="bg-surface-tint-blue/80 p-space-xs rounded-xl flex items-center justify-between mt-space-2xs">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <Icon name="trending_up" className="text-primary text-[20px] shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-sm text-label-sm font-semibold text-primary">
                          {deal.boostBanner.title}
                        </span>
                        <span className="font-caption text-caption text-text-secondary truncate">
                          {deal.boostBanner.sub}
                        </span>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm font-bold text-primary shrink-0">
                      {deal.boostBanner.timeLeft}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-space-xs pt-space-xs">
                  <button
                    className={`flex-1 h-11 font-button-secondary text-button-secondary font-semibold rounded-xl flex items-center justify-center gap-space-2xs active:scale-95 transition-transform shadow-sm ${deal.primaryAction.btnClass}`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onBoost(deal.name);
                    }}
                  >
                    <Icon name={deal.primaryAction.icon} className={`text-[18px] ${deal.primaryAction.iconClass}`} />
                    <span>{deal.primaryAction.label}</span>
                  </button>
                  <button
                    className="h-11 px-space-md bg-surface-container-low text-on-surface font-button-secondary text-button-secondary font-medium rounded-xl hover:bg-surface-container active:scale-95 transition-transform"
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Edit
                  </button>
                  <button
                    className="h-11 px-space-md bg-surface-container-low rounded-xl font-button-secondary text-button-secondary font-medium hover:bg-surface-container active:scale-95 transition-transform"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setPaused((current) => ({ ...current, [deal.key]: !current[deal.key] }));
                    }}
                  >
                    <span className={paused[deal.key] ? 'text-primary font-semibold' : 'text-on-surface-variant'}>
                      {paused[deal.key] ? 'Resume' : 'Pause'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Create Deal */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 flex flex-col items-center pointer-events-none">
        <button
          className="pointer-events-auto w-full h-[52px] bg-primary-container text-on-primary-container font-button-primary text-button-primary rounded-2xl flex items-center justify-center gap-space-xs shadow-lg active:scale-[0.98] transition-transform"
          type="button"
          onClick={onCreateDeal}
        >
          <Icon name="add_circle" className="text-[22px]" />
          <span>Create New Deal</span>
        </button>
      </div>

      {/* Deal Actions Modal */}
      {actionsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setActionsOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-surface-canvas rounded-t-3xl p-space-lg flex flex-col gap-space-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-1 bg-border-subtle rounded-full mx-auto mb-space-2xs" />
            <div className="flex items-center justify-between pb-space-2xs">
              <span className="font-heading-sm text-heading-sm font-semibold text-on-surface">Deal Actions</span>
              <button
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary"
                type="button"
                onClick={() => setActionsOpen(false)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <button
              className="flex items-center gap-space-sm p-space-xs rounded-xl hover:bg-surface-container-low text-left"
              type="button"
              onClick={() => {
                setActionsOpen(false);
                onBoost(actionsDeal?.name);
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
                <Icon name="rocket_launch" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md font-semibold text-on-surface">VEMTAP Boost Surge</span>
                <span className="font-caption text-caption text-text-secondary">
                  Reach 5,000+ local consumers immediately
                </span>
              </div>
            </button>
            <button
              className="flex items-center gap-space-sm p-space-xs rounded-xl hover:bg-surface-container-low text-left"
              type="button"
              onClick={() => setActionsOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container-low text-on-surface flex items-center justify-center shrink-0">
                <Icon name="content_copy" className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Duplicate Campaign</span>
                <span className="font-caption text-caption text-text-secondary">
                  Replicate pricing and visual assets
                </span>
              </div>
            </button>
            <button
              className="flex items-center gap-space-sm p-space-xs rounded-xl hover:bg-surface-container-low text-left"
              type="button"
              onClick={() => setActionsOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container-low text-on-surface flex items-center justify-center shrink-0">
                <Icon name="share" className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Share Direct Link</span>
                <span className="font-caption text-caption text-text-secondary">
                  Send via WhatsApp, Instagram or SMS
                </span>
              </div>
            </button>
            <button
              className="flex items-center gap-space-sm p-space-xs rounded-xl hover:bg-error-container/20 text-left"
              type="button"
              onClick={() => setActionsOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <Icon name="stop_circle" className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-error">End Deal Permanently</span>
                <span className="font-caption text-caption text-text-secondary">Close voucher generation now</span>
              </div>
            </button>
          </div>
        </div>
      )}

      <BusinessTabBar active="business" onTab={onTab} />
    </AppScreen>
  );
}
