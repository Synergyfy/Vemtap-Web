import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import type { PosCustomerRecord } from './posRegisterExtras';
import { useDebounced, useLiveCustomerLookup, useLivePos } from '../posLive';

interface DesktopPosCustomerScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
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
    tierClass: 'bg-surface-container-high text-text-secondary',
    points: '760',
    spend: '₦54,300',
    visits: '9',
    note: 'Birthday month · double points active',
  },
];

const REWARD_OPTIONS = [
  { icon: 'redeem', label: 'Redeem 1,000 pts' },
  { icon: 'local_activity', label: 'Apply lunch deal' },
  { icon: 'card_giftcard', label: 'Gift card balance' },
];

export function DesktopPosCustomerScreen({ onNav, onBack, onAttach, onRegisterNew }: DesktopPosCustomerScreenProps) {
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
  const ticketLabel = live ? 'New ticket' : 'Ticket #POS-1049';
  const tillLabel = live ? (pos.isOpen ? pos.tillName : 'No till open') : 'Till 01';

  useEffect(() => {
    if (live && lookup.error) showToast(apiErrorMessage(lookup.error, 'Could not load customers.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookup.error]);

  // Live: the first match is picked until the cashier clicks another.
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
    if (attachTimer.current !== null) window.clearTimeout(attachTimer.current);
    attachTimer.current = window.setTimeout(() => {
      onAttach(selected.name, selected.record);
    }, 700);
  };

  return (
    <PosTerminalChrome activeNav="register" onNav={onNav}>
      {/* Search toolbar */}
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="w-full py-2.5 flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
            <Icon name="loyalty" className="text-primary text-[17px]" />
            <span className="uppercase tracking-wider font-semibold">Loyalty Directory</span>
            <span className="text-text-tertiary">•</span>
            <span>{ticketLabel} · {tillLabel}</span>
          </div>
          <div className="relative w-full sm:w-80">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or phone number…"
              autoComplete="off"
              inputMode="search"
              className="w-full h-10 pl-9 pr-9 rounded-lg bg-surface text-text-primary placeholder:text-text-tertiary font-label-sm text-label-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="py-space-lg flex flex-col gap-space-xl">
        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-space-xs self-start font-button-secondary text-button-secondary text-text-secondary hover:text-primary transition-colors"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Back to Current Sale</span>
        </button>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span>Attach Customer</span>
              <span>•</span>
              <span>{ticketLabel}</span>
              <span>•</span>
              <span>{tillLabel}</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Attach Customer</h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              Search the loyalty directory by name or phone number, review rewards and attach a VEMTAP member to this
              ticket in a single step.
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              type="button"
              aria-label="Scan loyalty card"
              onClick={() => showToast(live ? 'Loyalty QR scanning is coming soon' : 'Loyalty QR scanner ready')}
              className="w-11 h-11 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors shadow-sm"
            >
              <Icon name="qr_code_scanner" className="text-[20px]" />
            </button>
            <button
              type="button"
              onClick={attach}
              disabled={!selected || attaching}
              className={`inline-flex items-center gap-space-xs px-space-lg h-11 rounded-xl font-button-primary text-button-primary shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 ${
                attaching ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary hover:bg-primary'
              }`}
            >
              {attaching ? (
                <>
                  <Icon name="check_circle" filled className="text-[18px]" />
                  <span>Attached to Active Order</span>
                </>
              ) : (
                <>
                  <Icon name="person_add" className="text-[18px]" />
                  <span>{selected ? `Attach ${selected.name}` : 'Select a customer'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Body: results + member profile rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left: reward shortcuts + result list */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Reward shortcuts */}
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Reward Options
              </span>
              <div className="flex flex-wrap gap-space-xs">
                {REWARD_OPTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => showToast(live ? `${item.label} is coming soon` : `${item.label} — available at checkout`)}
                    className="h-9 px-space-sm rounded-full bg-surface-canvas border border-border-subtle font-caption text-caption text-on-surface flex items-center gap-1 whitespace-nowrap shadow-sm hover:bg-surface-tint-blue hover:text-primary transition-colors"
                  >
                    <Icon name={item.icon} className="text-primary text-[14px]" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Result list */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                  {query ? 'Search Results' : 'Recent Customers'}
                </span>
                <span className="font-caption text-caption px-space-xs py-1 rounded-full bg-surface-container-high text-text-secondary">
                  {results.length} {results.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              {results.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-xl p-space-sm flex items-center justify-between gap-space-md text-left transition-all shadow-sm ${
                      isSelected
                        ? 'bg-surface-tint-blue border-2 border-primary'
                        : 'bg-surface-canvas border-2 border-transparent hover:border-border-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-caption text-caption font-bold shrink-0 ${
                          isSelected ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-text-secondary'
                        }`}
                      >
                        {item.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-sm text-label-sm text-on-surface truncate font-semibold">
                          {item.name}
                        </span>
                        <span className="font-caption text-caption text-text-secondary truncate">
                          {item.phone} · {item.points} pts
                        </span>
                      </div>
                    </div>
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary' : 'border-border-subtle'
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
                  className="w-full rounded-xl p-space-md bg-surface-canvas border border-dashed border-border-subtle flex items-center gap-space-xs text-left hover:bg-surface-tint-blue transition-colors"
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

          {/* Right: selected member profile + attach deck */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg sticky top-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="contacts" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-on-surface">Member Profile</h2>
              </div>
              <span className="font-caption text-caption px-space-xs py-1 rounded-full bg-surface-container-high font-medium text-text-secondary">
                {ticketLabel}
              </span>
            </div>

            {selected ? (
              <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm border border-border-subtle flex flex-col gap-space-xs">
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
            ) : (
              <div className="p-space-xl rounded-xl bg-surface-canvas border border-border-subtle shadow-sm flex flex-col items-center text-center gap-space-xs">
                <span className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Icon name="person_search" className="text-text-secondary text-[22px]" />
                </span>
                <span className="font-label-md text-label-md text-on-surface">No customer matched</span>
                <span className="font-caption text-caption text-text-secondary max-w-[250px]">
                  Check the number, or register them as a new VEMTAP member in seconds.
                </span>
              </div>
            )}

            {/* Sticky attach deck */}
            <div className="p-space-md rounded-xl bg-surface-canvas border border-border-subtle shadow-md flex flex-col gap-space-xs">
              <button
                type="button"
                onClick={attach}
                disabled={!selected || attaching}
                className={`w-full h-12 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-40 ${
                  attaching ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary hover:bg-primary'
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
                className="w-full h-11 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs hover:bg-surface-container-high transition-colors"
              >
                <Icon name="badge" className="text-text-secondary text-[16px]" />
                <span>Register New Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
