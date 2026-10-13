import { useEffect, useMemo, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosTabBar, POS_NAV_MAIN, type PosTabKey } from '../components/PosTabBar';

interface BusinessPosCustomerLookupScreenProps {
  onNav: (key: PosTabKey) => void;
  onAttach: (name: string) => void;
  onOpenDossier: (name: string) => void;
  onRegisterNew: () => void;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'vip', label: 'VIP' },
  { key: 'recent', label: 'Recent' },
  { key: 'deals', label: 'Deals' },
];

interface LookupCustomer {
  id: string;
  name: string;
  initials: string;
  tier: string;
  tierClass: string;
  phone: string;
  email: string;
  points: string;
  visits: string;
  spend: string;
  lastVisit: string;
  tags: string[];
  perk: string;
}

const CUSTOMERS: LookupCustomer[] = [
  {
    id: 'michael',
    name: 'Michael James',
    initials: 'MJ',
    tier: 'VIP Platinum',
    tierClass: 'bg-surface-tint-blue text-primary',
    phone: '+234 701 228 5510',
    email: 'michael.j@email.com',
    points: '5,120',
    visits: '58',
    spend: '₦412,900',
    lastVisit: 'Today',
    tags: ['vip', 'recent', 'deals'],
    perk: 'Free dessert on 60th visit',
  },
  {
    id: 'adaeze',
    name: 'Adaeze Nwosu',
    initials: 'AN',
    tier: 'Gold',
    tierClass: 'bg-badge-discount-bg text-badge-discount-text',
    phone: '+234 803 411 9082',
    email: 'adaeze.n@email.com',
    points: '2,450',
    visits: '24',
    spend: '₦186,400',
    lastVisit: 'Yesterday',
    tags: ['vip', 'recent', 'deals'],
    perk: '2× points on grills this week',
  },
  {
    id: 'chidi',
    name: 'Chidi Okonkwo',
    initials: 'CO',
    tier: 'Silver',
    tierClass: 'bg-surface-container text-text-secondary',
    phone: '+234 905 774 2213',
    email: 'chidi.o@email.com',
    points: '890',
    visits: '11',
    spend: '₦67,250',
    lastVisit: '3 days ago',
    tags: ['recent'],
    perk: 'Birthday month double points',
  },
  {
    id: 'zainab',
    name: 'Zainab Bello',
    initials: 'ZB',
    tier: 'Bronze',
    tierClass: 'bg-surface-container text-text-secondary',
    phone: '+234 909 670 3321',
    email: 'zainab.b@email.com',
    points: '310',
    visits: '4',
    spend: '₦18,900',
    lastVisit: 'Last week',
    tags: ['deals'],
    perk: 'Welcome deal · ₦1,000 off',
  },
];

export function BusinessPosCustomerLookupScreen({
  onNav,
  onAttach,
  onOpenDossier,
  onRegisterNew,
}: BusinessPosCustomerLookupScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [attachedId, setAttachedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const attachTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (attachTimer.current !== null) window.clearTimeout(attachTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CUSTOMERS.filter((item) => {
      const matchesFilter = filter === 'all' || item.tags.includes(filter);
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        item.email.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  const attach = (item: LookupCustomer) => {
    if (attachTimer.current !== null) window.clearTimeout(attachTimer.current);
    setAttachedId(item.id);
    attachTimer.current = window.setTimeout(() => {
      onAttach(item.name);
    }, 700);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="px-margin pt-space-xs pb-space-2xs flex items-center justify-between gap-space-xs">
          <span className="h-7 px-space-xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold flex items-center gap-1 min-w-0">
            <Icon name="storefront" className="text-[13px]" />
            <span className="truncate">Wuse II · Till 01</span>
          </span>
          <span className="h-7 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
            <span>Online</span>
          </span>
          <button
            type="button"
            aria-label="Customer profile"
            onClick={() => showToast('Signed in as Emeka O. · Cashier')}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Icon name="person" className="text-text-secondary text-[16px]" />
          </button>
        </div>
        <div className="px-margin pb-space-xs flex items-center justify-between gap-space-xs">
          <div className="flex flex-col min-w-0">
            <span className="font-heading-sm text-heading-sm text-on-surface leading-tight">Customer Lookup</span>
            <span className="font-caption text-caption text-text-secondary">{CUSTOMERS.length} members on this till today</span>
          </div>
          <button
            type="button"
            aria-label="Sync customers"
            onClick={() => showToast('Customer list re-synced')}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Icon name="sync" className="text-text-secondary text-[16px]" />
          </button>
        </div>
      </header>

      <div className="flex flex-col pb-24">
        {/* Notice banner */}
        <div className="px-margin pt-space-2xs">
          <div className="bg-surface-tint-blue rounded-xl px-space-xs py-space-2xs flex items-start gap-space-2xs">
            <Icon name="campaign" className="text-primary text-[16px] mt-0.5 shrink-0" />
            <span className="font-caption text-caption text-on-surface">
              4 guests dined this shift without a member attached — attach before checkout to earn them points.
            </span>
          </div>
        </div>

        {/* Search + QR + New */}
        <div className="px-margin pt-space-xs flex gap-space-2xs">
          <div className="flex-1 h-11 bg-surface-container rounded-xl px-space-xs flex items-center gap-space-2xs border border-transparent focus-within:border-border-active transition-colors">
            <Icon name="search" className="text-text-secondary text-[18px]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone or email…"
              autoComplete="off"
              inputMode="search"
              className="flex-1 min-w-0 bg-transparent outline-none font-label-sm text-label-sm text-on-surface placeholder:text-text-tertiary"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-text-secondary">
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Scan loyalty QR"
            onClick={() => showToast('Loyalty QR scanner ready')}
            className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center active:scale-95 transition-transform shrink-0"
          >
            <Icon name="qr_code_scanner" className="text-primary text-[19px]" />
          </button>
          <button
            type="button"
            onClick={onRegisterNew}
            className="h-11 px-space-xs rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
          >
            <Icon name="person_add" className="text-[16px]" />
            <span>New</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="px-margin pt-space-xs flex gap-space-2xs overflow-x-auto no-scrollbar pb-space-2xs">
          {FILTERS.map((item) => {
            const isActive = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`h-9 px-space-xs rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-transform ${
                  isActive ? 'bg-primary text-on-primary' : 'bg-surface-canvas border border-border-subtle text-on-surface'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Customer cards */}
        <div className="px-margin pt-space-2xs flex flex-col gap-space-xs">
          {results.map((item) => {
            const isAttached = attachedId === item.id;
            return (
              <div key={item.id} className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm flex flex-col gap-space-2xs">
                <div className="flex items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shrink-0">
                      {item.initials}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="flex items-center gap-1 min-w-0">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{item.name}</span>
                        <Icon name="verified" filled className="text-primary text-[14px] shrink-0" />
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        {item.phone} · {item.email}
                      </span>
                    </div>
                  </div>
                  <span className={`h-6 px-space-xs rounded-full font-caption text-caption font-semibold shrink-0 ${item.tierClass}`}>
                    {item.tier}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-space-2xs">
                  {[
                    { label: 'Points', value: item.points },
                    { label: 'Visits', value: item.visits },
                    { label: 'Lifetime', value: item.spend },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-surface-container-low rounded-lg px-space-2xs py-1 flex flex-col">
                      <span className="font-caption text-caption text-text-secondary">{metric.label}</span>
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">{metric.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-space-2xs">
                  <span className="flex items-center gap-1 min-w-0">
                    <Icon name="schedule" className="text-text-tertiary text-[13px]" />
                    <span className="font-caption text-caption text-text-secondary truncate">Last visit {item.lastVisit}</span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0 text-right">
                    <Icon name="stars" filled className="text-badge-discount-text text-[13px]" />
                    <span className="font-caption text-caption text-badge-discount-text truncate">{item.perk}</span>
                  </span>
                </div>

                <div className="flex gap-space-2xs border-t border-border-subtle pt-space-2xs">
                  <button
                    type="button"
                    onClick={() => attach(item)}
                    className={`flex-1 h-10 rounded-xl font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-all ${
                      isAttached ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary shadow-sm'
                    }`}
                  >
                    <Icon name={isAttached ? 'check_circle' : 'person_add'} className="text-[16px]" filled={isAttached} />
                    <span>{isAttached ? 'Attached to Sale' : `Attach ${item.name.split(' ')[0]}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDossier(item.name)}
                    className="h-10 px-space-xs rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform shrink-0"
                  >
                    <Icon name="badge" className="text-text-secondary text-[15px]" />
                    <span>Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}

          {results.length === 0 && (
            <div className="flex flex-col items-center text-center gap-space-xs py-space-md">
              <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="person_search" className="text-text-secondary text-[22px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">No member matched</span>
              <span className="font-caption text-caption text-text-secondary max-w-[250px]">
                Check the number, or register them as a new VEMTAP member in seconds.
              </span>
              <button
                type="button"
                onClick={onRegisterNew}
                className="h-10 px-space-sm rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Icon name="person_add" className="text-[16px]" />
                <span>Register new member</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <PosTabBar items={POS_NAV_MAIN} active="customers" onSelect={onNav} />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
