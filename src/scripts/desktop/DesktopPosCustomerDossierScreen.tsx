import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { money } from '../../services/posService';
import type { PosCustomerRecord } from './posRegisterExtras';
import { initials, naira as nairaLabel, useLiveDossier, useLivePos, whenLabel } from '../posLive';

interface DesktopPosCustomerDossierScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  customer: string;
  onBack: () => void;
  /** Live screens hand over the API customer so the sale can earn them points. */
  onAttach: (record?: PosCustomerRecord) => void;
  onOpenCrm: () => void;
}

const METRICS = [
  { label: 'Lifetime spend', value: '₦412,900', sub: 'Top 4% of members' },
  { label: 'Visits', value: '58', sub: 'Avg ₦7,119 / visit' },
  { label: 'Points', value: '5,120', sub: '≈ ₦5,120 credit' },
];

const PERKS = [
  { icon: 'cake', title: 'Birthday reward', detail: 'Free dessert · expires 24 Oct', cta: 'Apply' },
  { icon: 'local_activity', title: 'Lunch deal 20% off', detail: 'Weekdays 12–3 PM · 2 uses left', cta: 'Redeem' },
];

const VISITS = [
  { date: 'Today · 12:41 PM', items: 'Ribeye, Burger, Wedges', total: 27251 },
  { date: '6 Oct 2026 · 7:22 PM', items: 'Brisket, Lamb Chops ×2', total: 34500 },
  { date: '28 Sep 2026 · 1:05 PM', items: 'Jollof & Prawns, Chapman', total: 10500 },
];

const CONTACT_CHIPS = [
  { icon: 'call', value: '+234 701 228 5510' },
  { icon: 'mail', value: 'michael.j@email.com' },
  { icon: 'cake', value: 'Birthday 14 Nov' },
];

const NOTES = [
  { icon: 'restaurant', text: 'Kitchen: no shellfish · medium rare always' },
  { icon: 'payments', text: 'Cashier: prefers split bill, tips 10%' },
];

function naira(value: number): string {
  return `₦${value.toLocaleString('en-NG')}`;
}

export function DesktopPosCustomerDossierScreen({
  onNav,
  customer: customerName,
  onBack,
  onAttach,
  onOpenCrm,
}: DesktopPosCustomerDossierScreenProps) {
  const live = hasApiConfig();
  const pos = useLivePos();
  const dossier = useLiveDossier();
  const person = dossier.customer;
  const customer = live ? (dossier.record?.name ?? customerName) : customerName;
  const visits = person?.totalVisits ?? 0;
  const spent = money(person?.totalSpent);
  const tillLabel = live ? (pos.isOpen ? pos.tillName : 'No till open') : 'Till 01';
  const metrics = live
    ? [
        { label: 'Lifetime spend', value: nairaLabel(spent), sub: person?.tier ? `${person.tier} member` : 'Member' },
        { label: 'Visits', value: String(visits), sub: `Avg ${nairaLabel(money(person?.averageOrderValue) || (visits ? Math.round(spent / visits) : 0))} / visit` },
        { label: 'Points', value: (person?.pointsBalance ?? 0).toLocaleString(), sub: 'Loyalty balance' },
      ]
    : METRICS;
  const perks = live
    ? dossier.rewards.map((reward) => ({
        icon: 'redeem',
        title: reward.name,
        detail: reward.affordable ? `${reward.pointsRequired.toLocaleString()} pts` : `${reward.pointsShort.toLocaleString()} pts short`,
        cta: 'Redeem',
      }))
    : PERKS;
  const recentVisits = live
    ? (person?.recentPurchases ?? []).map((purchase) => ({
        date: whenLabel(purchase.date),
        items: purchase.itemNames.join(', ') || `${purchase.items} items`,
        total: purchase.total,
      }))
    : VISITS;
  const contactChips = live
    ? [
        { icon: 'call', value: person?.phone ?? '—' },
        { icon: 'mail', value: person?.email ?? '—' },
      ]
    : CONTACT_CHIPS;
  const notes = live ? [{ icon: 'info', text: 'No notes yet' }] : NOTES;
  const tierLine = live
    ? `${person?.tier ?? 'Member'}${person?.firstVisitAt ? ` · since ${new Date(person.firstVisitAt).getFullYear()}` : ''}`
    : 'VIP Platinum · since 2023';
  const [attached, setAttached] = useState(false);
  const [applied, setApplied] = useState<string[]>([]);
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

  const attach = () => {
    setAttached(true);
    showToast(`${customer} attached to the active sale`);
    attachTimer.current = window.setTimeout(() => onAttach(dossier.record ?? undefined), 700);
  };

  useEffect(() => {
    if (live && dossier.error) showToast(apiErrorMessage(dossier.error, 'Could not load this customer.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossier.error]);

  const togglePerk = (title: string) => {
    if (live) {
      showToast('Redeeming rewards at the till is coming soon');
      return;
    }
    setApplied((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
    showToast(applied.includes(title) ? `${title} removed from ticket` : `${title} applied to ticket`);
  };

  return (
    <PosTerminalChrome onNav={onNav} activeNav="orders">
      <div className="py-space-lg flex flex-col gap-space-lg">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={onBack}
              className="self-start mb-space-xs inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary hover:text-primary-container transition-colors"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              <span>Customer Lookup</span>
            </button>
            <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span>Customer Dossier</span>
              <span>•</span>
              <span>Quick view · {tillLabel}</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{customer}</h1>
              <Icon name="verified" filled className="text-primary text-[22px] shrink-0" />
            </div>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              {live
                ? `${tierLine} · ${visits} visits · ${nairaLabel(spent)} lifetime spend`
                : 'VIP Platinum member since 2023 · 58 visits · ₦412,900 lifetime spend'}
            </p>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              aria-label="More options"
              onClick={() => showToast(live ? 'More actions are coming soon' : 'More actions: statement, block, merge')}
              className="w-11 h-11 rounded-xl bg-surface-container text-text-secondary flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
            >
              <Icon name="more_horiz" className="text-[18px]" />
            </button>
            <button
              type="button"
              onClick={attach}
              disabled={attached}
              className={`h-11 px-space-lg rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md transition-all ${
                attached ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary hover:bg-primary'
              }`}
            >
              <Icon name={attached ? 'check_circle' : 'person_add'} className="text-[18px]" filled={attached} />
              <span>{attached ? 'Attached to Active Sale' : 'Attach to Active Sale'}</span>
            </button>
          </div>
        </div>

        {/* Identity card */}
        <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <span className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm font-bold shrink-0">
              {live
                ? initials(customer)
                : customer
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
            </span>
            <div className="flex flex-col min-w-0 gap-space-2xs">
              <span className="flex items-center gap-1 min-w-0">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold truncate">{customer}</span>
                <span className="h-5 px-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold flex items-center">
                  {tierLine}
                </span>
              </span>
              <div className="flex flex-wrap gap-space-2xs">
                {contactChips.map((chip) => (
                  <span
                    key={chip.value}
                    className="h-7 px-space-xs rounded-full bg-surface-container-low font-caption text-caption text-text-secondary flex items-center gap-1"
                  >
                    <Icon name={chip.icon} className="text-primary text-[13px]" />
                    <span>{chip.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Metric bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between"
            >
              <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary truncate">
                {metric.label}
              </span>
              <span className="font-display-hero text-display-hero text-on-surface leading-none mt-space-xs truncate">
                {metric.value}
              </span>
              <span className="font-caption text-caption text-text-tertiary mt-space-2xs truncate">{metric.sub}</span>
            </div>
          ))}

          {/* Home store tile fills the 4th bento slot */}
          <div className="p-space-lg rounded-xl bg-surface-tint-blue shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">Home store</span>
              <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Icon name="storefront" className="text-on-primary text-[19px]" />
              </span>
            </div>
            <div className="flex flex-col mt-space-xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                {live ? pos.businessName : 'Urban Grill & Bistro'}
              </span>
              <span className="font-caption text-caption text-text-secondary truncate">
                {live ? `${pos.branchName} · ${visits} visits` : 'Wuse II · 41 of 58 visits here'}
              </span>
            </div>
          </div>
        </div>

        {/* Perks / notes / visits + CRM rail */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-lg items-start">
          <div className="flex flex-col gap-space-md">
            {/* Perks */}
            <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden">
              <div className="px-space-lg py-space-sm flex items-center justify-between border-b border-border-subtle">
                <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                  Available Perks
                </span>
                <span className="font-caption text-caption text-text-secondary">{perks.length} active</span>
              </div>
              <div className="p-space-md flex flex-col gap-space-xs">
                {perks.map((perk) => {
                  const isApplied = applied.includes(perk.title);
                  return (
                    <div
                      key={perk.title}
                      className="px-space-sm py-space-xs rounded-lg bg-surface-container-low flex items-center justify-between gap-space-sm"
                    >
                      <span className="flex items-center gap-space-sm min-w-0">
                        <span className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                          <Icon name={perk.icon} className="text-primary text-[18px]" />
                        </span>
                        <span className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            {perk.title}
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate">{perk.detail}</span>
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePerk(perk.title)}
                        className={`h-9 px-space-sm rounded-lg font-label-sm text-label-sm font-semibold shrink-0 transition-colors ${
                          isApplied ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary text-on-primary'
                        }`}
                      >
                        {isApplied ? 'Applied' : perk.cta}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden">
              <div className="px-space-lg py-space-sm border-b border-border-subtle">
                <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                  Notes
                </span>
              </div>
              <div className="p-space-md flex flex-col gap-space-xs">
                {notes.map((note) => (
                  <div
                    key={note.text}
                    className="bg-surface-container-low rounded-lg px-space-sm py-space-xs flex items-start gap-space-sm"
                  >
                    <Icon name={note.icon} className="text-primary text-[16px] mt-0.5 shrink-0" />
                    <span className="font-body-md text-body-md text-text-secondary">{note.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent visits */}
            <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden">
              <div className="px-space-lg py-space-sm flex items-center justify-between border-b border-border-subtle">
                <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                  Recent Visits
                </span>
                <span className="font-caption text-caption text-text-secondary">{recentVisits.length} of {live ? visits : 58}</span>
              </div>
              <div>
                {recentVisits.map((visit, index) => (
                  <div
                    key={`${visit.date}-${index}`}
                    className="px-space-lg py-space-sm flex items-center justify-between gap-space-sm border-b border-border-subtle last:border-b-0 hover:bg-surface transition-colors"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface truncate">{visit.date}</span>
                      <span className="font-caption text-caption text-text-secondary truncate">{visit.items}</span>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface font-semibold shrink-0">
                      {naira(visit.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right rail: CRM + quick attach status */}
          <div className="flex flex-col gap-space-md">
            <button
              type="button"
              onClick={onOpenCrm}
              className="w-full rounded-xl bg-surface-canvas shadow-sm border border-border-subtle px-space-md py-space-sm flex items-center justify-between gap-space-sm text-left hover:bg-surface-subtle transition-colors"
            >
              <span className="flex items-center gap-space-sm min-w-0">
                <span className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                  <Icon name="hub" className="text-primary text-[18px]" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                    Open full CRM profile
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Orders, loyalty ledger and campaign history
                  </span>
                </span>
              </span>
              <Icon name="chevron_right" className="text-primary text-[18px] shrink-0" />
            </button>

            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md font-semibold text-on-surface">Sale attachment</span>
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-secondary">Active ticket status</span>
                <span
                  className={`h-6 px-space-xs rounded-full font-caption text-caption font-semibold flex items-center ${
                    attached ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
                  }`}
                >
                  {attached ? 'Attached' : 'Not attached'}
                </span>
              </div>
              <div className="w-full h-px bg-surface-container" />
              <span className="font-caption text-caption text-text-tertiary">
                Perks applied here sync to the open ticket at {tillLabel} in real time.
              </span>
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
