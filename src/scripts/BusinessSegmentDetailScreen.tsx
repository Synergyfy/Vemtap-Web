import { useEffect } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PUBLIC_IMAGES } from './publicPosData';
import type { SegmentRef } from './BusinessSegmentsHubScreen';

interface BusinessSegmentDetailScreenProps {
  onBack: () => void;
  onUseSegment: (segment: SegmentRef) => void;
  onEditRules: () => void;
}

const RETURNING_REF: SegmentRef = {
  name: 'Returning Customers',
  count: '294',
  meta: '68.2% repeat interaction rate',
  desc: 'Interacted or placed 2+ orders at Urban Grill & Bistro in the trailing 90 days.',
};

const TAGS = ['Repeat Diners', '68.2% Repeat Rate', 'Avg. Basket ₦11,200', 'Last Visit: 6d ago'];

const STAT_CARDS: { label: string; value: string; sub: string; icon: string; iconClass: string }[] = [
  {
    label: 'Total Spend',
    value: '₦3,280,000',
    sub: 'Trailing 90 days',
    icon: 'payments',
    iconClass: 'text-primary',
  },
  {
    label: 'Avg. Basket',
    value: '₦11,200',
    sub: 'Per verified visit',
    icon: 'shopping_bag',
    iconClass: 'text-secondary',
  },
  {
    label: 'Visit Frequency',
    value: '2.4x',
    sub: 'Per diner / month',
    icon: 'event_repeat',
    iconClass: 'text-tertiary',
  },
];

const BRANCH_SPLIT = [
  { name: 'Wuse II Flagship', pct: 64, barClass: 'bg-primary' },
  { name: 'Maitama Heights Lounge', pct: 36, barClass: 'bg-secondary' },
];

const REACHABILITY = [
  { label: 'Push & Feed Notifications', pct: 90, count: '264', barClass: 'bg-primary' },
  { label: 'In-App Chat', pct: 67, count: '197', barClass: 'bg-secondary' },
  { label: 'Direct SMS / DM', pct: 48, count: '141', barClass: 'bg-tertiary' },
];

const FAVORITES = [
  { name: 'Woodfire Ribeye (250g)', orders: '312 orders', img: PUBLIC_IMAGES.ribeye },
  { name: 'Classic Smash Burger', orders: '268 orders', img: PUBLIC_IMAGES.burger },
  { name: 'Truffle Parmesan Fries', orders: '241 orders', img: PUBLIC_IMAGES.fries },
];

const PATRONS = [
  { name: 'Amaka O.', visits: '8 visits', spend: '₦128,400', initial: 'A' },
  { name: 'Tunde A.', visits: '6 visits', spend: '₦96,200', initial: 'T' },
  { name: 'Zainab M.', visits: '5 visits', spend: '₦74,600', initial: 'Z' },
];

export function BusinessSegmentDetailScreen({ onBack, onUseSegment, onEditRules }: BusinessSegmentDetailScreenProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AppScreen surface="bg-surface">
      <header className="sticky top-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-caption font-caption text-text-tertiary leading-none">Customer Segments</span>
              <h1 className="text-heading-sm font-heading-sm text-text-primary tracking-tight truncate">
                Segment Audience Details
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Help or Information"
              className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container transition-colors"
              type="button"
              onClick={onEditRules}
            >
              <Icon name="help_outline" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-md pb-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption uppercase tracking-wider font-semibold">
              Cohort Snapshot
            </span>
            <span className="text-caption font-caption text-text-tertiary">Sync: Continuous • 3m ago</span>
          </div>
          <h2 className="text-heading-md font-heading-md text-text-primary tracking-tight">Returning Customers</h2>
          <div className="flex items-baseline gap-space-2xs">
            <span className="text-heading-md font-heading-md text-primary font-bold">294</span>
            <span className="text-label-md font-label-md text-text-secondary">verified diners</span>
          </div>
          <p className="text-body-md font-body-md text-text-secondary leading-relaxed">
            Customers who have interacted or ordered from Urban Grill & Bistro 2 or more times in the trailing 90
            days.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-space-2xs">
            {TAGS.map((tag) => (
              <span
                className="px-space-xs py-1 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption font-medium"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="px-margin mb-space-md grid grid-cols-3 gap-space-xs">
          {STAT_CARDS.map((stat) => (
            <div className="rounded-xl bg-surface-canvas p-space-xs shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-1" key={stat.label}>
              <div className="flex items-center justify-between">
                <span className="text-caption font-caption text-text-secondary">{stat.label}</span>
                <Icon name={stat.icon} className={`text-[16px] ${stat.iconClass}`} />
              </div>
              <span className="text-heading-sm font-heading-sm text-text-primary font-bold tracking-tight truncate">
                {stat.value}
              </span>
              <span className="text-caption font-caption text-text-tertiary truncate">{stat.sub}</span>
            </div>
          ))}
        </div>

        <div className="px-margin mb-space-md">
          <div className="rounded-xl bg-surface-canvas p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-label-md font-label-md font-semibold text-text-primary">Branch Footprint Split</h3>
              <span className="text-caption font-caption text-text-tertiary">POS verified</span>
            </div>
            {BRANCH_SPLIT.map((branch) => (
              <div className="flex flex-col gap-1" key={branch.name}>
                <div className="flex items-center justify-between font-caption text-caption">
                  <span className="text-text-secondary">{branch.name}</span>
                  <span className="text-text-primary font-semibold">{branch.pct}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className={`${branch.barClass} h-full rounded-full`} style={{ width: `${branch.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-margin mb-space-md">
          <div className="rounded-xl bg-surface-canvas p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-label-md font-label-md font-semibold text-text-primary">Reachability</h3>
              <span className="text-caption font-caption text-text-tertiary">Consent checked</span>
            </div>
            {REACHABILITY.map((reach) => (
              <div className="flex flex-col gap-1" key={reach.label}>
                <div className="flex items-center justify-between font-caption text-caption">
                  <span className="text-text-secondary">{reach.label}</span>
                  <span className="text-text-primary font-semibold">
                    {reach.count} <span className="text-text-tertiary font-normal">({reach.pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className={`${reach.barClass} h-full rounded-full`} style={{ width: `${reach.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-margin mb-space-md">
          <div className="flex items-center justify-between mb-space-xs">
            <h3 className="text-label-md font-label-md font-semibold text-text-primary">Top Favorite Items</h3>
            <span className="text-caption font-caption text-text-tertiary">POS line items</span>
          </div>
          <div className="flex flex-col gap-space-xs">
            {FAVORITES.map((item) => (
              <div
                className="rounded-xl bg-surface-canvas p-space-xs shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex items-center gap-space-sm"
                key={item.name}
              >
                <img alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" src={item.img} />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-label-md font-label-md text-text-primary font-semibold truncate">
                    {item.name}
                  </span>
                  <span className="text-caption font-caption text-text-secondary">{item.orders}</span>
                </div>
                <Icon name="chevron_right" className="text-text-tertiary text-[20px] shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="px-margin mb-space-md">
          <div className="flex items-center justify-between mb-space-xs">
            <h3 className="text-label-md font-label-md font-semibold text-text-primary">Sample Patrons</h3>
            <span className="text-caption font-caption text-text-tertiary">Top 3 of 294</span>
          </div>
          <div className="flex flex-col gap-space-xs">
            {PATRONS.map((patron) => (
              <div
                className="rounded-xl bg-surface-canvas p-space-sm shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex items-center gap-space-sm"
                key={patron.name}
              >
                <div className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <span className="text-label-md font-label-md font-bold">{patron.initial}</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-label-md font-label-md text-text-primary font-semibold truncate">
                    {patron.name}
                  </span>
                  <span className="text-caption font-caption text-text-secondary">{patron.visits}</span>
                </div>
                <span className="text-label-md font-label-md text-text-primary font-semibold shrink-0">
                  {patron.spend}
                </span>
              </div>
            ))}
          </div>
          <p className="text-caption font-caption text-text-tertiary pt-space-xs">
            Sample of highest-value diners. Full profile list available in Customer CRM.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-surface-canvas/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin py-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+12px)] z-40">
        <div className="max-w-md mx-auto flex items-center gap-space-xs">
          <button
            className="flex-1 h-11 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary font-medium active:scale-[0.98] transition-transform flex items-center justify-center gap-space-2xs"
            type="button"
            onClick={onEditRules}
          >
            <Icon name="tune" className="text-[18px]" />
            <span>Edit Rules</span>
          </button>
          <button
            className="flex-[1.4] h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-space-xs"
            type="button"
            onClick={() => onUseSegment(RETURNING_REF)}
          >
            <span>Use This Segment</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
