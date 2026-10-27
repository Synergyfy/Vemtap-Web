import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import type { PosCustomerRecord } from './posRegisterExtras';
import { setDossierCustomerId, useDebounced, useLiveCustomerLookup, useLivePos } from '../posLive';

interface DesktopPosCustomerLookupScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  /** Live screens also hand over the API customer, so the sale can earn them points. */
  onAttach: (name: string, record?: PosCustomerRecord) => void;
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
  record?: PosCustomerRecord;
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

export function DesktopPosCustomerLookupScreen({
  onNav,
  onAttach,
  onOpenDossier,
  onRegisterNew,
}: DesktopPosCustomerLookupScreenProps) {
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

  const live = hasApiConfig();
  const pos = useLivePos();
  const search = useDebounced(query.trim());
  const lookup = useLiveCustomerLookup(search, filter === 'vip');
  const memberCount = live ? lookup.total : CUSTOMERS.length;

  useEffect(() => {
    if (live && lookup.error) showToast(apiErrorMessage(lookup.error, 'Could not load customers.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookup.error]);

  const results = useMemo(() => {
    if (live) {
      // VIP and the search run on the server; "Recent" is the last 7 days.
      const week = Date.now() - 7 * 86_400_000;
      return lookup.rows
        .filter((row) => filter !== 'recent' || (row.lastVisitAt && new Date(row.lastVisitAt).getTime() >= week))
        .map<LookupCustomer>((row) => ({ ...row, tags: row.segments, perk: '—' }));
    }
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
  }, [query, filter, live, lookup.rows]);

  const attach = (item: LookupCustomer) => {
    if (attachTimer.current !== null) window.clearTimeout(attachTimer.current);
    setAttachedId(item.id);
    attachTimer.current = window.setTimeout(() => {
      onAttach(item.name, item.record);
    }, 700);
  };

  return (
    <PosTerminalChrome onNav={onNav} activeNav="orders">
      {/* Notice banner */}
      <div className="py-space-xs bg-surface-tint-blue">
        <div className="flex items-start gap-space-xs">
          <Icon name="campaign" className="text-primary text-[18px] mt-0.5 shrink-0" />
          <span className="font-body-md text-body-md text-on-surface">
            4 guests dined this shift without a member attached — attach before checkout to earn them points.
          </span>
        </div>
      </div>

      <div className="py-space-lg flex flex-col gap-space-lg">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span className="h-7 px-space-xs rounded-full bg-surface-tint-blue text-primary font-semibold flex items-center gap-1 normal-case tracking-normal">
                <Icon name="storefront" className="text-[13px]" />
                <span>{live ? `${pos.branchName} · ${pos.isOpen ? pos.tillName : 'No till open'}` : 'Wuse II · Till 01'}</span>
              </span>
              <span className="h-7 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-semibold flex items-center gap-1 normal-case tracking-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span>Online</span>
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Customer Lookup</h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              {live ? `${memberCount} customers on record` : `${memberCount} members on this till today`} — search by name, phone or email, or scan a loyalty QR at the
              counter.
            </p>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              aria-label="Scan loyalty QR"
              onClick={() => showToast(live ? 'Loyalty QR scanning is coming soon' : 'Loyalty QR scanner ready')}
              className="h-11 px-space-md rounded-xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary font-semibold flex items-center gap-space-xs hover:bg-surface-container-high transition-colors"
            >
              <Icon name="qr_code_scanner" className="text-[18px]" />
              <span>Scan QR</span>
            </button>
            <button
              type="button"
              onClick={onRegisterNew}
              className="h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all flex items-center gap-space-xs"
            >
              <Icon name="person_add" className="text-[18px]" />
              <span>New Member</span>
            </button>
          </div>
        </div>

        {/* Search + filter toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-space-sm">
          <div className="flex-1 h-11 bg-surface-container rounded-xl px-space-sm flex items-center gap-space-xs border border-transparent focus-within:border-border-active transition-colors">
            <Icon name="search" className="text-text-secondary text-[18px]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone or email…"
              autoComplete="off"
              inputMode="search"
              className="flex-1 min-w-0 bg-transparent outline-none font-label-md text-label-md text-on-surface placeholder:text-text-tertiary"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-text-secondary">
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-space-xs">
            {FILTERS.map((item) => {
              const isActive = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (live && item.key === 'deals') {
                      showToast('Deal filters are coming soon');
                      return;
                    }
                    setFilter(item.key);
                  }}
                  className={`h-9 px-space-sm rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive ? 'bg-primary text-on-primary' : 'bg-surface-canvas border border-border-subtle text-on-surface hover:bg-surface-subtle'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results + till sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Customer cards */}
          <div className="lg:col-span-8 flex flex-col gap-space-sm">
            {results.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Member Directory
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  {results.length} of {memberCount} members shown
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
              {results.map((item) => {
                const isAttached = attachedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs"
                  >
                    <div className="flex items-center justify-between gap-space-xs">
                      <div className="flex items-center gap-space-sm min-w-0">
                        <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shrink-0">
                          {item.initials}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="flex items-center gap-1 min-w-0">
                            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                              {item.name}
                            </span>
                            <Icon name="verified" filled className="text-primary text-[14px] shrink-0" />
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate">
                            {item.phone} · {item.email}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`h-6 px-space-xs rounded-full font-caption text-caption font-semibold shrink-0 flex items-center ${item.tierClass}`}
                      >
                        {item.tier}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-space-xs">
                      {[
                        { label: 'Points', value: item.points },
                        { label: 'Visits', value: item.visits },
                        { label: 'Lifetime', value: item.spend },
                      ].map((metric) => (
                        <div
                          key={metric.label}
                          className="bg-surface-container-low rounded-lg px-space-xs py-1 flex flex-col"
                        >
                          <span className="font-caption text-caption text-text-secondary">{metric.label}</span>
                          <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-space-xs">
                      <span className="flex items-center gap-1 min-w-0">
                        <Icon name="schedule" className="text-text-tertiary text-[14px]" />
                        <span className="font-caption text-caption text-text-secondary truncate">
                          Last visit {item.lastVisit}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 min-w-0 text-right">
                        <Icon name="stars" filled className="text-badge-discount-text text-[14px]" />
                        <span className="font-caption text-caption text-badge-discount-text truncate">{item.perk}</span>
                      </span>
                    </div>

                    <div className="flex gap-space-xs border-t border-border-subtle pt-space-xs">
                      <button
                        type="button"
                        onClick={() => attach(item)}
                        className={`flex-1 h-10 rounded-xl font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-xs transition-all ${
                          isAttached
                            ? 'bg-badge-discount-bg text-badge-discount-text'
                            : 'bg-primary-container text-on-primary shadow-sm hover:bg-primary'
                        }`}
                      >
                        <Icon name={isAttached ? 'check_circle' : 'person_add'} className="text-[16px]" filled={isAttached} />
                        <span>{isAttached ? 'Attached to Sale' : `Attach ${item.name.split(' ')[0]}`}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (live) setDossierCustomerId(item.id);
                          onOpenDossier(item.name);
                        }}
                        className="h-10 px-space-sm rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors shrink-0"
                      >
                        <Icon name="badge" className="text-text-secondary text-[15px]" />
                        <span>Dossier</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {results.length === 0 && (
              <div className="flex flex-col items-center text-center gap-space-sm py-space-xl bg-surface-canvas rounded-xl shadow-sm">
                <span className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
                  <Icon name="person_search" className="text-text-secondary text-[26px]" />
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface">No member matched</span>
                <span className="font-body-md text-body-md text-text-secondary max-w-md">
                  Check the number, or register them as a new VEMTAP member in seconds.
                </span>
                <button
                  type="button"
                  onClick={onRegisterNew}
                  className="h-10 px-space-sm rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 hover:bg-primary transition-all"
                >
                  <Icon name="person_add" className="text-[16px]" />
                  <span>Register new member</span>
                </button>
              </div>
            )}
          </div>

          {/* Till sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-space-sm">
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Active Till Operator</span>
                <Icon name="point_of_sale" className="text-primary text-[20px]" />
              </div>
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Icon name="person" className="text-on-primary text-[18px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">{live ? pos.cashierName : 'Emeka O.'}</span>
                    <span className="font-caption text-caption text-text-secondary">Cashier · Till 01</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Customer profile"
                  onClick={() => showToast(live ? `Signed in as ${pos.cashierName}` : 'Signed in as Emeka O. · Cashier')}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
                >
                  <Icon name="person" className="text-text-secondary text-[16px]" />
                </button>
              </div>
              <div className="w-full h-px bg-surface-container" />
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                    Members on this till today
                  </span>
                  <span className="font-heading-sm text-heading-sm text-on-surface">{memberCount}</span>
                </div>
                <button
                  type="button"
                  aria-label="Sync customers"
                  onClick={() => (live ? void lookup.refetch().then(() => showToast('Customer list refreshed')) : showToast('Customer list re-synced'))}
                  className="h-9 px-space-sm rounded-lg bg-surface-tint-blue text-primary font-button-secondary text-button-secondary font-semibold flex items-center gap-1 hover:bg-surface-container-high transition-colors"
                >
                  <Icon name="sync" className="text-[16px]" />
                  <span>Re-sync</span>
                </button>
              </div>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-xs">
              <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">Tier legend</span>
              {[
                { label: 'VIP Platinum · Gold', className: 'bg-surface-tint-blue text-primary', note: 'vip · recent · deals' },
                { label: 'Silver', className: 'bg-surface-container text-text-secondary', note: 'recent' },
                { label: 'Bronze', className: 'bg-surface-container text-text-secondary', note: 'deals' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-space-2xs">
                  <span className={`h-6 px-space-xs rounded-full font-caption text-caption font-semibold flex items-center ${row.className}`}>
                    {row.label}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">{row.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm">
          <div className="bg-surface-container-highest text-on-surface px-4 py-2.5 rounded-xl font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
