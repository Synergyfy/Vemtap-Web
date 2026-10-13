import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHeader } from './BusinessHubHeader';
import { useIsDesktop } from '../hooks/useIsDesktop';

interface BusinessCustomersScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onMessage: (name: string) => void;
  onViewProfile?: (name: string) => void;
  onOpenAnalytics?: () => void;
}

type CrmFilterKey = 'all' | 'frequent' | 'returning' | 'new' | 'inactive';

const CRM_FILTERS: { key: CrmFilterKey; label: string; count: string; icon?: string }[] = [
  { key: 'all', label: 'All', count: '482' },
  { key: 'frequent', label: 'Frequent', count: '76', icon: 'stars' },
  { key: 'returning', label: 'Returning', count: '124' },
  { key: 'new', label: 'New', count: '38' },
  { key: 'inactive', label: 'Inactive', count: '42' },
];

interface CustomerRow {
  key: string;
  name: string;
  img: string;
  alt: string;
  verified?: boolean;
  tierIcon: string;
  tierLabel: string;
  tierClass: string;
  contact: string;
  activityLine: { leading: string; segments: { text: string; class?: string }[] };
  activityTag?: string;
  historyIcon: string;
  historyParts: { text: string; strong: string; strongClass: string }[];
  category: string;
}

const CUSTOMERS: CustomerRow[] = [
  {
    key: 'michael',
    name: 'Michael James',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa7q3nBZJ3uGvSGMu7L_jvAlVz0h4s1o_oxGwOETe8GdszBG8lIQpy--nM9G1EqUCc3qWrjo6dU7lvQtchrLsSmRh3S6sJsZe_1GQKiAc4DXpahE5sq4zs8w-8mQA1PwDNfuhk3BOfWWhg4---m8PwyD_npCqz0RMYF9LC-dyuKaGnJ44B1_XTCHf555T53022Y9r0Xg97JOxMTv_qBICVRSujl4GARLHePoZnha9rjPTj9w2lS2JZ5Q',
    alt: 'A distinguished Nigerian gentleman in his early 40s wearing a modern navy linen blazer and smiling warmly in natural daylight, high resolution editorial portrait with soft blue studio lighting.',
    verified: true,
    tierIcon: 'diamond',
    tierLabel: 'Frequent Patron • VIP Tier',
    tierClass: 'bg-surface-tint-blue text-primary',
    contact: '+234 803 219 8831',
    activityLine: {
      leading: '14 Visits',
      segments: [
        { text: '11 Orders', class: '' },
        { text: '4 Deals Claimed', class: 'text-badge-discount-text font-medium' },
      ],
    },
    activityTag: 'Top 5% Spender',
    historyIcon: 'schedule',
    historyParts: [
      { text: 'First visited: ', strong: 'Jun 12, 2024', strongClass: 'text-text-primary font-medium' },
      { text: 'Last order: ', strong: 'Today, 9:24 AM (Order #VG-94021)', strongClass: 'text-primary font-medium' },
    ],
    category: 'frequent',
  },
  {
    key: 'sarah',
    name: 'Sarah Adams',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9MFxVPnXVp7i8k6sa3Dou2u5GhYILQh3hnwFQR4R2mnTHSCpQllITlpKvF9eATWP4dZUb9Y0zbniuQfjXGsfGlx8tQGMxA0pgITwjhF2LLarj6XpWLLxVYGSg1zEJ7aJEUtuJIxi2vq6mt7Dj8Bo8jI66IAjGYQBTE6Yo05xFkYVeGI8-6KzI8vSM9kSEH_ADpdUmsK5Qt4XhycBL_hkJHXOUE3kJ7ujYaLxTRW1-Xc9mtf_9Bk3Vgw',
    alt: 'Young professional West African woman with braided hair wearing a stylish mustard yellow top and pearl earrings, soft natural window light, warm welcoming expression, cinematic bokeh.',
    verified: true,
    tierIcon: 'local_fire_department',
    tierLabel: 'Frequent • Deal Enthusiast',
    tierClass: 'bg-surface-tint-blue text-primary',
    contact: '+234 812 443 0912',
    activityLine: {
      leading: '8 Visits',
      segments: [
        { text: '6 Orders', class: '' },
        { text: '5 Deals Claimed', class: 'text-badge-discount-text font-semibold' },
      ],
    },
    historyIcon: 'forum',
    historyParts: [
      { text: 'First: ', strong: 'Aug 04, 2024', strongClass: 'text-text-primary font-medium' },
      { text: 'Last inquiry: ', strong: 'Today, 10:42 AM (20% Lunch Deal)', strongClass: 'text-primary font-medium' },
    ],
    category: 'frequent',
  },
  {
    key: 'chidi',
    name: 'Dr. Chidi Okafor',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp5xj4pR3MVJ7OYqKn1fJ6vVDwf_L0oMA9-wAYBIBQMuZSAnKG0sPo_FYYYrLNAv3IxIuWDWvYOjbUuPzMdLMGFKkJLJzg2ksm0traOeWPNuh-UG1tL8UoSstDJYSH8CvPE4FxGiuqeg1zy9HXz6jMvVvCo5P6swnaa9NmFmfLomgTmYyijBKYD3DYUrKBEzfgrs71aHV7ZSNRCMviW4oaq0JQS_zeRoP5D5pcHjjl7DKSVm3ol9CzBQ',
    alt: 'Distinguished mature Nigerian physician in tailored medical collar coat with wire-frame glasses, warm ambient office bookshelf backdrop, approachable friendly demeanor, high fidelity photography.',
    tierIcon: 'table_bar',
    tierLabel: 'Returning • Table Reservations',
    tierClass: 'bg-surface-container text-text-secondary',
    contact: '+234 802 771 9044',
    activityLine: {
      leading: '6 Visits',
      segments: [
        { text: '4 Bookings', class: 'text-primary font-semibold' },
        { text: '2 Orders', class: '' },
      ],
    },
    historyIcon: 'event_seat',
    historyParts: [
      { text: 'Last visit: ', strong: 'Yesterday (Booking #BK-77402 - 6 Guests)', strongClass: 'text-text-primary font-medium' },
    ],
    category: 'returning',
  },
  {
    key: 'halima',
    name: 'Halima Yusuf',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVDErdmGimrUsLNSBOwwjQcpG3nmkdA0vzHtEukrM5H3_JlRCWbK1V6LxlePdBedXWpW6FB1pUepP0c3GfxmrWh8qsr5plzzhuIGpL8uPd_Z1N0yduDnqOpyIgUjFQhYp7QLbTXUI4_Gt0WshQKTaViHUSvo_SaSA_w6TfxyJofs7xqifsqRQyfdpwHh_tCKfEgz0t9ZUZeQGsMeq5C9Az66iRHawiKLKCGgj6C8ufiwqTdWqwQrg7qA',
    alt: 'Energetic young Nigerian creative professional in stylish hijab in dusty rose fabric, softly smiling at camera in an open air terrace cafe setting, crisp focus, cheerful daytime illumination.',
    tierIcon: 'fiber_new',
    tierLabel: 'New Customer',
    tierClass: 'bg-badge-discount-bg text-badge-discount-text',
    contact: 'First discovery voucher activated',
    activityLine: {
      leading: '1 Visit',
      segments: [{ text: '1 Deal Claimed', class: 'text-badge-discount-text font-medium' }],
    },
    historyIcon: 'person_add',
    historyParts: [
      { text: 'First joined: ', strong: 'Oct 14, 2024 (via VEMTAP Instant QR)', strongClass: 'text-text-primary font-medium' },
    ],
    category: 'new',
  },
];

const activityMeta = (customer: CustomerRow) =>
  [customer.activityLine.leading, ...customer.activityLine.segments.map((segment) => segment.text)].join(' · ');

const lastActivity = (customer: CustomerRow) =>
  customer.historyParts[customer.historyParts.length - 1]?.strong ?? '';

export function BusinessCustomersScreen({ onTab, onMessage, onViewProfile, onOpenAnalytics }: BusinessCustomersScreenProps) {
  const isDesktop = useIsDesktop();
  const [filter, setFilter] = useState<CrmFilterKey>('frequent');
  const [search, setSearch] = useState('');
  const [drawerCustomer, setDrawerCustomer] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const visibleCustomers = CUSTOMERS.filter((customer) => {
    const matchesFilter = filter === 'all' || customer.category === filter;
    const matchesQuery =
      search.trim() === '' || customer.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const openCustomer = (customer: CustomerRow) => {
    if (onViewProfile) {
      onViewProfile(customer.name);
      return;
    }
    setDrawerCustomer(customer.name);
  };

  const drawer = drawerCustomer ? CUSTOMERS.find((customer) => customer.name === drawerCustomer) : undefined;

  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Page Header Context */}
        <section className="px-margin pt-space-md pb-space-sm bg-surface-canvas shadow-sm">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Customers</h2>
              <span className="inline-flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-surface-container-high text-primary font-caption text-caption">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary">
              Customer relationships, visit history, and direct engagement
            </p>
          </div>
          <div className="mt-space-sm relative">
            <div className="absolute inset-y-0 left-0 pl-space-sm flex items-center pointer-events-none text-text-tertiary">
              <Icon name="search" className="text-[18px]" />
            </div>
            <input
              className="w-full h-11 pl-10 pr-9 bg-surface-container-low rounded-xl text-text-primary font-label-sm text-label-sm placeholder:text-text-tertiary outline-none focus:bg-surface-canvas shadow-sm transition-all"
              placeholder="Search by customer name, phone, or customer tag..."
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search.length > 0 && (
              <button
                className="absolute inset-y-0 right-0 pr-space-sm flex items-center text-text-tertiary hover:text-text-primary"
                type="button"
                onClick={() => setSearch('')}
              >
                <Icon name="cancel" className="text-[16px]" />
              </button>
            )}
          </div>
        </section>

        {/* Filter Chips */}
        <div className="w-full bg-surface-canvas px-margin py-space-sm shadow-sm">
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1">
            {CRM_FILTERS.map((crmFilter) => {
              const active = filter === crmFilter.key;
              return (
                <button
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                    active
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'text-text-secondary bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                  key={crmFilter.key}
                  type="button"
                  onClick={() => setFilter(crmFilter.key)}
                >
                  {crmFilter.icon && <Icon name={crmFilter.icon} className="text-[14px]" />}
                  <span>{crmFilter.label}</span>
                  <span
                    className={`font-caption text-caption px-1.5 rounded-full ${
                      active ? 'bg-white/20' : 'bg-surface-canvas text-text-secondary'
                    }`}
                  >
                    {crmFilter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Metric Strip */}
        <div className="px-margin pt-space-sm">
          <div className="bg-surface-tint-blue rounded-xl p-space-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm shrink-0">
                <Icon name="loyalty" className="text-[17px]" />
              </div>
              <div className="min-w-0">
                <p className="font-label-sm text-label-sm text-primary font-semibold">Active Patron Directory</p>
                <p className="font-caption text-caption text-text-secondary truncate">
                  76 frequent patrons account for 48% of monthly repeat revenue
                </p>
              </div>
            </div>
            <button
              className="p-1 rounded-full text-primary hover:bg-primary/10 transition-colors shrink-0"
              title="Export Segment"
              type="button"
              onClick={() => showToast('Exporting 76 patron records (CSV)…')}
            >
              <Icon name="download" className="text-[17px]" />
            </button>
          </div>
        </div>

        {/* Customer list — one line per customer */}
        <section className="px-margin pt-space-sm">
          {isDesktop ? (
            <div className="bg-surface-canvas rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse min-w-[620px]">
                <thead>
                  <tr className="border-b border-border-subtle">
                    {['Customer', 'Tier', 'Activity', 'Last activity', ''].map((label) => (
                      <th
                        className="text-left font-caption text-caption text-text-tertiary font-medium py-2 px-space-xs first:pl-space-sm"
                        key={label}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleCustomers.map((customer) => (
                    <tr className="border-b border-border-subtle last:border-0" key={customer.key}>
                      <td className="py-2 pl-space-sm pr-space-xs">
                        <div className="flex items-center gap-space-xs min-w-0">
                          <img
                            alt={customer.alt}
                            className="w-7 h-7 rounded-full object-cover bg-surface-container shrink-0"
                            src={customer.img}
                          />
                          <span className="min-w-0">
                            <span className="font-label-sm text-label-sm text-text-primary font-medium block truncate">
                              {customer.name}
                            </span>
                            <span className="font-caption text-caption text-text-tertiary block truncate">
                              {customer.contact}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-space-xs">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-caption text-caption font-medium whitespace-nowrap ${customer.tierClass}`}
                        >
                          <Icon name={customer.tierIcon} className="text-[12px]" />
                          {customer.tierLabel.split('•')[0].trim()}
                        </span>
                      </td>
                      <td className="py-2 px-space-xs font-caption text-caption text-text-secondary whitespace-nowrap">
                        {activityMeta(customer)}
                      </td>
                      <td className="py-2 px-space-xs font-caption text-caption text-text-tertiary max-w-[180px] truncate">
                        {lastActivity(customer)}
                      </td>
                      <td className="py-2 px-space-xs pr-space-sm text-right">
                        <button
                          className="h-8 px-space-xs rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1 ml-auto active:scale-95 transition-transform"
                          type="button"
                          onClick={() => openCustomer(customer)}
                        >
                          <span>View</span>
                          <Icon name="chevron_right" className="text-[15px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-surface-canvas rounded-2xl shadow-sm divide-y divide-border-subtle">
              {visibleCustomers.map((customer) => (
                <button
                  className="w-full flex items-center gap-space-xs px-space-sm py-2.5 text-left active:bg-surface-container-low transition-colors"
                  key={customer.key}
                  type="button"
                  onClick={() => openCustomer(customer)}
                >
                  <span className="relative shrink-0">
                    <img
                      alt={customer.alt}
                      className="w-9 h-9 rounded-full object-cover bg-surface-container shadow-sm"
                      src={customer.img}
                    />
                    {customer.verified && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm"
                        title="Verified Customer"
                      >
                        <Icon name="verified" filled className="text-[9px]" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                        {customer.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-caption text-caption font-medium shrink-0 ${customer.tierClass}`}
                      >
                        <Icon name={customer.tierIcon} className="text-[11px]" />
                        {customer.tierLabel.split('•')[0].trim()}
                      </span>
                    </span>
                    <span className="font-caption text-caption text-text-tertiary block truncate">
                      {activityMeta(customer)} · {lastActivity(customer)}
                    </span>
                  </span>
                  <span className="flex items-center justify-center shrink-0 text-text-tertiary">
                    <Icon name="chevron_right" className="text-[20px]" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {visibleCustomers.length === 0 && (
            <div className="py-space-xl flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-surface-container-high text-primary flex items-center justify-center mb-space-sm">
                <Icon name="person_search" className="text-[28px]" />
              </div>
              <h4 className="font-label-md text-label-md font-semibold text-text-primary">No customers found</h4>
              <p className="font-label-sm text-label-sm text-text-secondary max-w-xs mt-1">
                Try adjusting your search terms or selecting another category filter.
              </p>
              <button
                className="mt-space-sm px-space-md h-9 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold"
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* Analytics Banner */}
        <section className="px-margin pt-space-md pb-space-md">
          <div className="bg-gradient-to-r from-surface-tint-blue via-surface-container-low to-surface-tint-blue rounded-2xl p-space-sm shadow-sm flex items-start gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Icon name="insights" className="text-[17px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-sm text-label-sm text-text-primary font-semibold">Deep Dive Analytics</p>
              <p className="font-caption text-caption text-text-secondary mt-0.5 leading-relaxed">
                Looking for sales trends, customer lifetime value graphs, and retention cohort analytics?
              </p>
              <button
                className="inline-flex items-center gap-1 font-caption text-caption text-primary font-semibold hover:underline mt-1.5"
                type="button"
                onClick={() => (onOpenAnalytics ? onOpenAnalytics() : undefined)}
              >
                <span>View Customer Analytics in Analytics Hub</span>
                <Icon name="north_east" className="text-[13px]" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Customer detail drawer (used when no profile route is wired) */}
      {drawer && (
        <div
          className="fixed inset-0 z-[60] bg-on-surface/50 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setDrawerCustomer(null)}
        >
          <div
            className="w-full max-w-[430px] bg-surface rounded-t-3xl p-space-md pb-[calc(env(safe-area-inset-bottom,0px)+16px)] flex flex-col gap-space-sm shadow-xl max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mx-auto" />
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
                  Customer 360
                </span>
                <h3 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate">
                  {drawer.name}
                </h3>
              </div>
              <button
                aria-label="Close customer details"
                className="w-8 h-8 rounded-full bg-surface-container-low text-text-secondary flex items-center justify-center hover:bg-surface-container shrink-0"
                type="button"
                onClick={() => setDrawerCustomer(null)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="flex items-center gap-space-xs p-space-xs bg-surface-tint-blue rounded-xl">
              <Icon name="verified_user" className="text-primary text-[20px]" />
              <div className="min-w-0">
                <p className="font-label-sm text-label-sm text-primary font-semibold truncate">{drawer.tierLabel}</p>
                <p className="font-caption text-caption text-text-secondary">
                  Loyalty score 98/100 • Zero dispute or chargeback flags
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-xs">
              <div className="p-space-xs rounded-xl bg-surface-container-low min-w-0">
                <p className="font-caption text-caption text-text-secondary">Contact</p>
                <p className="font-label-sm text-label-sm text-text-primary font-medium truncate">{drawer.contact}</p>
              </div>
              <div className="p-space-xs rounded-xl bg-surface-container-low min-w-0">
                <p className="font-caption text-caption text-text-secondary">Average ticket</p>
                <p className="font-label-sm text-label-sm text-text-primary font-medium truncate">₦22,750</p>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-low p-space-xs">
              <p className="font-caption text-caption text-text-secondary">Activity</p>
              <p className="font-label-sm text-label-sm text-text-primary mt-0.5">{activityMeta(drawer)}</p>
              <p className="font-caption text-caption text-text-tertiary mt-1 leading-relaxed">
                {drawer.historyParts.map((part) => (
                  <span key={part.text}>
                    {part.text}
                    <strong className={part.strongClass}>{part.strong}</strong>{' '}
                  </span>
                ))}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-label-sm text-label-sm text-text-primary font-semibold">Favorite items</h4>
              <div className="flex flex-wrap gap-1.5">
                {['Chargrilled Ribeye', 'Hibiscus Cooler', 'Truffle Parm Fries'].map((favorite) => (
                  <span
                    className="px-2 py-1 rounded-lg bg-surface-container text-text-secondary font-caption text-caption"
                    key={favorite}
                  >
                    {favorite}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-space-xs pt-space-2xs">
              <button
                className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                type="button"
                onClick={() => {
                  setDrawerCustomer(null);
                  onMessage(drawer.name);
                }}
              >
                <Icon name="chat" className="text-[18px]" />
                <span>Message {drawer.name.split(' ')[0]}</span>
              </button>
              <button
                className="w-full h-11 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-2"
                type="button"
                onClick={() => {
                  setDrawerCustomer(null);
                  showToast(`Exclusive VIP offer sent to ${drawer.name.split(' ')[0]}!`);
                }}
              >
                <Icon name="card_giftcard" className="text-[18px]" />
                <span>Send Exclusive VIP Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      <BusinessTabBar active="business" onTab={onTab} />
    </AppScreen>
  );
}
