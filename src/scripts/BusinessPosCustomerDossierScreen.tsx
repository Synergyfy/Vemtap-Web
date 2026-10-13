import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { naira } from './catalogueData';

interface BusinessPosCustomerDossierScreenProps {
  customer: string;
  onBack: () => void;
  onAttach: () => void;
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

export function BusinessPosCustomerDossierScreen({ customer, onBack, onAttach, onOpenCrm }: BusinessPosCustomerDossierScreenProps) {
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
    attachTimer.current = window.setTimeout(() => onAttach(), 700);
  };

  const togglePerk = (title: string) => {
    setApplied((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
    showToast(applied.includes(title) ? `${title} removed from ticket` : `${title} applied to ticket`);
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
            <span className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">Customer Dossier</span>
            <span className="font-caption text-caption text-text-secondary leading-none">Quick view · Till 01</span>
          </div>
          <button
            type="button"
            aria-label="More options"
            onClick={() => showToast('More actions: statement, block, merge')}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Icon name="more_horiz" className="text-text-secondary text-[16px]" />
          </button>
        </div>
      </header>

      <div className="flex flex-col pb-36">
        {/* Identity card */}
        <div className="px-margin pt-space-xs">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm font-bold shrink-0">
                {customer
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="flex items-center gap-1 min-w-0">
                  <span className="font-heading-sm text-heading-sm text-on-surface font-bold truncate">{customer}</span>
                  <Icon name="verified" filled className="text-primary text-[15px] shrink-0" />
                </span>
                <span className="h-5 px-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold self-start flex items-center">
                  VIP Platinum · since 2023
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-space-2xs">
              {[
                { icon: 'call', value: '+234 701 228 5510' },
                { icon: 'mail', value: 'michael.j@email.com' },
                { icon: 'cake', value: 'Birthday 14 Nov' },
              ].map((chip) => (
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

        {/* Attach CTA */}
        <div className="px-margin pt-space-xs">
          <button
            type="button"
            onClick={attach}
            disabled={attached}
            className={`w-full h-11 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all ${
              attached ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary'
            }`}
          >
            <Icon name={attached ? 'check_circle' : 'person_add'} className="text-[17px]" filled={attached} />
            <span>{attached ? 'Attached to Active Sale' : 'Attach to Active Sale'}</span>
          </button>
        </div>

        {/* Metric bento */}
        <div className="px-margin pt-space-xs grid grid-cols-3 gap-space-2xs">
          {METRICS.map((metric) => (
            <div key={metric.label} className="bg-surface-canvas rounded-xl p-space-2xs shadow-sm flex flex-col gap-0.5 min-w-0">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wide truncate">{metric.label}</span>
              <span className="font-label-md text-label-md text-on-surface font-bold truncate">{metric.value}</span>
              <span className="font-caption text-caption text-text-tertiary truncate">{metric.sub}</span>
            </div>
          ))}
        </div>

        {/* Perks */}
        <div className="px-margin pt-space-sm pb-space-2xs flex items-center justify-between">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            Available Perks
          </span>
          <span className="font-caption text-caption text-text-secondary">{PERKS.length} active</span>
        </div>
        <div className="px-margin flex flex-col gap-space-2xs">
          {PERKS.map((perk) => {
            const isApplied = applied.includes(perk.title);
            return (
              <div
                key={perk.title}
                className="bg-surface-canvas rounded-xl px-space-xs py-space-2xs shadow-sm flex items-center justify-between gap-space-xs"
              >
                <span className="flex items-center gap-space-xs min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center shrink-0">
                    <Icon name={perk.icon} className="text-on-secondary-fixed text-[17px]" />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">{perk.title}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">{perk.detail}</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => togglePerk(perk.title)}
                  className={`h-8 px-space-xs rounded-lg font-label-sm text-label-sm font-semibold shrink-0 active:scale-95 transition-transform ${
                    isApplied ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary text-on-primary'
                  }`}
                >
                  {isApplied ? 'Applied' : perk.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <div className="px-margin pt-space-sm pb-space-2xs">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">Notes</span>
        </div>
        <div className="px-margin flex flex-col gap-space-2xs">
          {[
            { icon: 'restaurant', text: 'Kitchen: no shellfish · medium rare always' },
            { icon: 'payments', text: 'Cashier: prefers split bill, tips 10%' },
          ].map((note) => (
            <div key={note.text} className="bg-surface-container-low rounded-xl px-space-xs py-space-2xs flex items-start gap-space-2xs">
              <Icon name={note.icon} className="text-primary text-[15px] mt-0.5 shrink-0" />
              <span className="font-caption text-caption text-text-secondary">{note.text}</span>
            </div>
          ))}
        </div>

        {/* Recent visits */}
        <div className="px-margin pt-space-sm pb-space-2xs flex items-center justify-between">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            Recent Visits
          </span>
          <span className="font-caption text-caption text-text-secondary">{VISITS.length} of 58</span>
        </div>
        <div className="px-margin flex flex-col gap-space-2xs">
          {VISITS.map((visit) => (
            <div
              key={visit.date}
              className="bg-surface-canvas rounded-xl px-space-xs py-space-2xs shadow-sm flex items-center justify-between gap-space-xs"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface truncate">{visit.date}</span>
                <span className="font-caption text-caption text-text-secondary truncate">{visit.items}</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold shrink-0">{naira(visit.total)}</span>
            </div>
          ))}
        </div>

        {/* Store banner */}
        <div className="px-margin pt-space-sm">
          <div className="rounded-2xl overflow-hidden bg-surface-tint-blue flex items-center gap-space-xs p-space-xs">
            <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Icon name="storefront" className="text-on-primary text-[19px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">Urban Grill &amp; Bistro</span>
              <span className="font-caption text-caption text-text-secondary truncate">
                Home store · Wuse II · 41 of 58 visits here
              </span>
            </div>
          </div>
        </div>

        {/* CRM link */}
        <div className="px-margin pt-space-xs">
          <button
            type="button"
            onClick={onOpenCrm}
            className="w-full rounded-xl bg-surface-canvas shadow-sm border border-border-subtle px-space-xs py-space-2xs flex items-center justify-between gap-space-xs text-left active:scale-[0.99] transition-transform"
          >
            <span className="flex items-center gap-space-xs min-w-0">
              <span className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                <Icon name="hub" className="text-primary text-[18px]" />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">Open full CRM profile</span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  Orders, loyalty ledger and campaign history
                </span>
              </span>
            </span>
            <Icon name="chevron_right" className="text-primary text-[18px] shrink-0" />
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
