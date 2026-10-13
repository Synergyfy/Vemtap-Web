import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome } from './BusinessPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { SegmentRef } from '../BusinessSegmentsHubScreen';

interface DesktopSegmentDetailScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
  onUseSegment: (segment: SegmentRef) => void;
  onEditRules: () => void;
}

const IMG_BASE = 'https://lh3.googleusercontent.com/aida-public/';

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
  {
    name: 'Woodfire Ribeye (250g)',
    orders: '312 orders',
    img: `${IMG_BASE}AB6AXuDZB1h8Ab7AbFgQ2KgfXRi_I26mmE-4QT5IOrODTo2uzdvVuOhZ-XQeY8MN_-mKWJbrNtNQh3FMPz0fEFScD1rWTK2I9ltmCUStrda7ZNZT6Ri5wnXUxIe_hdJZOIGbsmKexXVBDEoW8xaUSVcSR1zoXKqQxAhl5TZhgNtObBXQhAULmTt_C5Vp7k_SG0tWnPJ9UwTYwHWrl0mx5JCIlLI9Ro0gw73WSGWnQBn6oOreiB_pLrHtZRfeUw`,
  },
  {
    name: 'Classic Smash Burger',
    orders: '268 orders',
    img: `${IMG_BASE}AB6AXuAPh2Yfv4cEH6W4GBnJXQQbwtYk7V-UQw9RsKq1urBy0VQ0YGVd7alx6TVtPnXmq7ujUBYaQmwY3NdgpQzOX5TpoyKyo6up-F9WGSu5EpIOy7Iu6ttC6YIvVv4U1TepnoYdLM8kJtgPeQgm8W8dWKY0ndANZSPpeuun-1VfdzuSwWcCy6P2S19fDn3oex816PloCYAFRjObYpugLG-R9bWLsUruHBLt3UbomnwxKzZp7paXjWIxVJyJmQ`,
  },
  {
    name: 'Truffle Parmesan Fries',
    orders: '241 orders',
    img: `${IMG_BASE}AB6AXuDKxfXFkJzKs-TiwEbhoCFk3sd8rnHdshIlDoRLDvOenaMXkIU3vjfiHUe8_qNoELvNc6nt9rcVNh0aVjLKx7au85skwZIrfUu715YrDZrtSRn3kqh5TDVjlmeRJu1JJU4aBnKjRituLLjWjfbDFLBPfCSL2C1SX6cXqd71KcvR95DRdP_xIw3pdJIQ0pUIxYiGs62FD7FIX-iG42gq7pxUcOkhtt_JMtKAk5zWNouCpp7MfOgNqf37sw`,
  },
];

const PATRONS = [
  { name: 'Amaka O.', visits: '8 visits', spend: '₦128,400', initial: 'A' },
  { name: 'Tunde A.', visits: '6 visits', spend: '₦96,200', initial: 'T' },
  { name: 'Zainab M.', visits: '5 visits', spend: '₦74,600', initial: 'Z' },
];

export function DesktopSegmentDetailScreen({
  onNav,
  onBack,
  onUseSegment,
  onEditRules,
}: DesktopSegmentDetailScreenProps) {
  return (
    <BusinessPortalChrome activeNav="customers" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm flex-wrap">
            <button type="button" className="hover:text-primary transition-colors" onClick={() => onNav('customers')}>
              Customers
            </button>
            <Icon name="chevron_right" className="text-outline text-[16px]" />
            <button type="button" className="hover:text-primary transition-colors" onClick={onBack}>
              Customer Segments
            </button>
            <Icon name="chevron_right" className="text-outline text-[16px]" />
            <span className="text-text-primary font-semibold">Segment Audience Details</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-space-2xs text-text-secondary hover:text-primary transition-colors font-label-md text-label-md w-fit"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Customer Segments</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption uppercase tracking-wider font-semibold">
                Cohort Snapshot
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="text-caption font-caption text-text-tertiary">Sync: Continuous • 3m ago</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Returning Customers</h1>
            <div className="flex items-baseline gap-space-2xs">
              <span className="text-heading-md font-heading-md text-primary font-bold">294</span>
              <span className="text-label-md font-label-md text-text-secondary">verified diners</span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Customers who have interacted or ordered from Urban Grill &amp; Bistro 2 or more times in the trailing 90
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
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              onClick={onEditRules}
              className="px-space-md h-[46px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-xs shadow-sm"
            >
              <Icon name="tune" className="text-[18px] text-secondary" />
              <span>Edit Rules</span>
            </button>
            <button
              type="button"
              onClick={() => onUseSegment(RETURNING_REF)}
              className="px-space-lg h-[46px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
            >
              <span>Use This Segment</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {STAT_CARDS.map((stat) => (
            <div
              className="rounded-xl bg-surface-canvas p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-1 hover:shadow-md transition-shadow"
              key={stat.label}
            >
              <div className="flex items-center justify-between">
                <span className="text-caption font-caption text-text-secondary uppercase tracking-wider font-semibold">
                  {stat.label}
                </span>
                <Icon name={stat.icon} className={`text-[16px] ${stat.iconClass}`} />
              </div>
              <span className="text-heading-sm font-heading-sm text-text-primary font-bold tracking-tight truncate">
                {stat.value}
              </span>
              <span className="text-caption font-caption text-text-tertiary truncate">{stat.sub}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-lg items-start">
          <div className="flex flex-col gap-space-lg min-w-0">
            <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                  Branch Footprint Split
                </h2>
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

            <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Reachability</h2>
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

            <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
              <div className="flex items-center justify-between mb-space-2xs">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Top Favorite Items</h2>
                <span className="text-caption font-caption text-text-tertiary">POS line items</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                {FAVORITES.map((item) => (
                  <div
                    className="rounded-xl bg-surface-subtle p-space-xs flex items-center gap-space-sm"
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
          </div>

          <div className="flex flex-col gap-space-lg min-w-0 lg:sticky lg:top-20">
            <div className="rounded-xl bg-surface-canvas p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
              <div className="flex items-center justify-between mb-space-2xs">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Sample Patrons</h2>
                <span className="text-caption font-caption text-text-tertiary">Top 3 of 294</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                {PATRONS.map((patron) => (
                  <div
                    className="rounded-xl bg-surface-subtle p-space-sm flex items-center gap-space-sm"
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

            <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <Icon name="tune" className="text-primary text-[20px]" />
                <h3 className="font-label-md text-label-md text-text-primary font-semibold">Cohort Rules</h3>
              </div>
              <p className="text-caption font-caption text-text-secondary leading-relaxed">
                {RETURNING_REF.desc}
              </p>
              <button
                className="h-11 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary font-medium transition-colors flex items-center justify-center gap-space-2xs"
                type="button"
                onClick={onEditRules}
              >
                <Icon name="tune" className="text-[18px]" />
                <span>Edit Rules</span>
              </button>
              <button
                className="h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] transition-all flex items-center justify-center gap-space-xs"
                type="button"
                onClick={() => onUseSegment(RETURNING_REF)}
              >
                <span>Use This Segment</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>

            <div className="rounded-xl bg-surface-canvas p-space-md shadow-sm flex items-start gap-space-sm">
              <div className="w-7 h-7 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="help_outline" className="text-[18px]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-label-sm font-label-sm font-semibold text-text-primary">Need a tweak?</h3>
                <p className="text-caption font-caption text-text-secondary leading-relaxed">
                  Adjust visit windows, spend thresholds, or branch filters to sharpen this cohort, then re-sync the
                  audience across campaigns and messaging.
                </p>
                <button
                  className="inline-flex items-center gap-1 text-label-sm font-label-sm text-primary font-semibold hover:underline w-fit pt-space-2xs"
                  type="button"
                  onClick={onEditRules}
                >
                  <span>Open Rules Builder</span>
                  <Icon name="north_east" className="text-[16px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BusinessPortalChrome>
  );
}
