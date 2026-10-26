import { useEffect, useMemo, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import type { PosCustomerRecord } from './desktop/posRegisterExtras';
import { useDebounced, useLiveCustomerLookup, useLivePos } from './posLive';

interface BusinessPosCustomerScreenProps {
  onBack: () => void;
  /** Live screens also hand over the API customer, so the sale can earn them points. */
  onAttach: (name: string, record?: PosCustomerRecord) => void;
  onRegisterNew: () => void;
}

interface CustomerRecord {
  id: string;
  record?: PosCustomerRecord;
  name: string;
  phone: string;
  tier: string;
  tierClass: string;
  points: string;
  spend: string;
  visits: string;
  note: string;
}

const CUSTOMERS: CustomerRecord[] = [
  {
    id: 'adaeze',
    name: 'Adaeze Nwosu',
    phone: '+234 803 411 9082',
    tier: 'Gold Member',
    tierClass: 'bg-badge-discount-bg text-badge-discount-text',
    points: '2,450',
    spend: '₦186,400',
    visits: '24',
    note: 'Prefers terrace seating · no shellfish',
  },
  {
    id: 'michael',
    name: 'Michael James',
    phone: '+234 701 228 5510',
    tier: 'Platinum',
    tierClass: 'bg-surface-tint-blue text-primary',
    points: '5,120',
    spend: '₦412,900',
    visits: '58',
    note: 'Always requests peppercorn sauce',
  },
  {
    id: 'zainab',
    name: 'Zainab Bello',
    phone: '+234 909 670 3321',
    tier: 'Silver',
    tierClass: 'bg-surface-container text-text-secondary',
    points: '760',
    spend: '₦54,300',
    visits: '9',
    note: 'Birthday month · double points active',
  },
];

export function BusinessPosCustomerScreen({ onBack, onAttach, onRegisterNew }: BusinessPosCustomerScreenProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('adaeze');
  const [attaching, setAttaching] = useState(false);
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
  const lookup = useLiveCustomerLookup(search, false, 10);

  useEffect(() => {
    if (live && lookup.error) showToast(apiErrorMessage(lookup.error, 'Could not load customers.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookup.error]);

  // Live: the first match is picked until the cashier taps another.
  useEffect(() => {
    if (live && lookup.rows.length && !lookup.rows.some((row) => row.id === selectedId)) setSelectedId(lookup.rows[0].id);
  }, [live, lookup.rows, selectedId]);

  const results = useMemo(() => {
    if (live) return lookup.rows.map<CustomerRecord>((row) => ({ ...row, note: `Last visit ${row.lastVisit}` }));
    const q = query.trim().toLowerCase();
    if (!q) return CUSTOMERS;
    return CUSTOMERS.filter(
      (item) => item.name.toLowerCase().includes(q) || item.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')),
    );
  }, [query, live, lookup.rows]);

  const selected = results.find((item) => item.id === selectedId) ?? null;

  const attach = () => {
    if (!selected || attaching) return;
    setAttaching(true);
    attachTimer.current = window.setTimeout(() => {
      onAttach(selected.name, selected.record);
    }, 700);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between gap-space-xs">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all shrink-0"
          >
            <Icon name="arrow_back" className="text-[21px]" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">
              Attach Customer
            </span>
            <span className="font-caption text-caption text-text-secondary leading-none">
              {live ? `New ticket · ${pos.isOpen ? pos.tillName : 'No till open'}` : 'Ticket #POS-1049 · Till 01'}
            </span>
          </div>
          <button
            type="button"
            aria-label="Scan loyalty card"
            onClick={() => showToast(live ? 'Loyalty QR scanning is coming soon' : 'Loyalty QR scanner ready')}
            className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center active:scale-95 transition-transform shrink-0"
          >
            <Icon name="qr_code_scanner" className="text-primary text-[16px]" />
          </button>
        </div>

        {/* Search */}
        <div className="px-margin pb-space-xs">
          <div className="h-11 bg-surface-container rounded-xl px-space-xs flex items-center gap-space-2xs border border-transparent focus-within:border-border-active transition-colors">
            <Icon name="search" className="text-text-secondary text-[18px]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or phone number…"
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
        </div>
      </header>

      <div className="flex flex-col pb-28">
        {/* Selected customer card */}
        {selected ? (
          <div className="px-margin pt-space-2xs pb-space-xs">
            <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shrink-0">
                    {selected.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                      {selected.name}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">{selected.phone}</span>
                  </div>
                </div>
                <span
                  className={`font-caption text-caption px-space-xs py-0.5 rounded-full shrink-0 font-semibold ${selected.tierClass}`}
                >
                  {selected.tier}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-space-2xs">
                <div className="bg-surface-container-low rounded-lg px-space-xs py-1 flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Points</span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">{selected.points}</span>
                </div>
                <div className="bg-surface-container-low rounded-lg px-space-xs py-1 flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Lifetime</span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">{selected.spend}</span>
                </div>
                <div className="bg-surface-container-low rounded-lg px-space-xs py-1 flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Visits</span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">{selected.visits}</span>
                </div>
              </div>

              <div className="flex items-start gap-space-2xs bg-badge-discount-bg rounded-lg px-space-xs py-1">
                <Icon name="stars" filled className="text-badge-discount-text text-[14px] mt-0.5 shrink-0" />
                <span className="font-caption text-caption text-badge-discount-text">
                  {live ? selected.note : `5% member pricing + 2× points on grills this week. ${selected.note}`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-margin pt-space-md pb-space-xs flex flex-col items-center text-center gap-space-xs">
            <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
              <Icon name="person_search" className="text-text-secondary text-[22px]" />
            </span>
            <span className="font-label-md text-label-md text-on-surface">No customer matched</span>
            <span className="font-caption text-caption text-text-secondary max-w-[250px]">
              Check the number, or register them as a new VEMTAP member in seconds.
            </span>
          </div>
        )}

        {/* Rewards shortcuts */}
        <div className="px-margin pt-space-xs pb-space-2xs">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            Reward Options
          </span>
        </div>
        <div className="px-margin flex gap-space-2xs overflow-x-auto no-scrollbar pb-space-xs">
          {[
            { icon: 'redeem', label: 'Redeem 1,000 pts' },
            { icon: 'local_activity', label: 'Apply lunch deal' },
            { icon: 'card_giftcard', label: 'Gift card balance' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => showToast(live ? `${item.label} is coming soon` : `${item.label} — available at checkout`)}
              className="h-9 px-space-xs rounded-full bg-surface-canvas border border-border-subtle font-caption text-caption text-on-surface flex items-center gap-1 whitespace-nowrap shrink-0 active:scale-95 transition-transform"
            >
              <Icon name={item.icon} className="text-primary text-[14px]" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Result list */}
        <div className="px-margin pt-space-xs pb-space-2xs">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            {query ? 'Search Results' : 'Recent Customers'}
          </span>
        </div>
        <div className="px-margin flex flex-col gap-space-2xs">
          {results.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-xl p-space-xs flex items-center justify-between gap-space-xs text-left transition-all ${
                  isSelected ? 'bg-surface-tint-blue border-2 border-border-active' : 'bg-surface-canvas border-2 border-transparent shadow-sm'
                }`}
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-caption text-caption font-bold shrink-0 ${
                      isSelected ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    {item.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface truncate">{item.name}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {item.phone} · {item.points} pts
                    </span>
                  </div>
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-primary' : 'border-outline-variant'
                  }`}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </span>
              </button>
            );
          })}
          {results.length === 0 && (
            <button
              type="button"
              onClick={onRegisterNew}
              className="w-full rounded-xl p-space-sm bg-surface-canvas border border-dashed border-border-subtle flex items-center gap-space-xs text-left active:scale-[0.99] transition-transform"
            >
              <span className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                <Icon name="person_add" className="text-[17px]" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface truncate">
                  Register “{query || 'new customer'}”
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Create a VEMTAP member and attach in one step
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Sticky attach deck */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin pt-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+12px)] flex flex-col gap-space-2xs shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={attach}
          disabled={!selected || attaching}
          className={`w-full h-11 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-40 ${
            attaching ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary'
          }`}
        >
          {attaching ? (
            <>
              <Icon name="check_circle" filled className="text-[17px]" />
              <span>Attached to Active Order</span>
            </>
          ) : (
            <>
              <Icon name="person_add" className="text-[17px]" />
              <span>{selected ? `Attach ${selected.name}` : 'Select a customer'}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onRegisterNew}
          className="w-full h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
        >
          <Icon name="badge" className="text-text-secondary text-[16px]" />
          <span>Register New Customer</span>
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
