import { useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useLiveDisplay } from './posLive';

interface BusinessSplitBillScreenProps {
  onBack: () => void;
  onPay: () => void;
}

type SplitMode = 'equally' | 'items' | 'custom';
type TipKey = number;

const BASE_SHARE = 20962;

const TIPS: { key: TipKey; label: string; sub: string }[] = [
  { key: 0, label: 'No Tip', sub: '₦0' },
  { key: 2000, label: '10%', sub: '+₦2,000' },
  { key: 3140, label: '15% Great!', sub: '+₦3,140' },
];

const MODES: { key: SplitMode; label: string }[] = [
  { key: 'equally', label: 'Split Equally' },
  { key: 'items', label: 'By Items' },
  { key: 'custom', label: 'Custom' },
];

const SEGS = [
  { name: 'Michael', width: '66%', color: 'bg-primary' },
  { name: 'Sarah', width: '27%', color: 'bg-badge-discount-text' },
  { name: 'Tunde', width: '5%', color: 'bg-tertiary-container' },
  { name: 'Unclaimed', width: '2%', color: 'bg-surface-dim' },
];

const DINERS = [
  {
    initials: 'MJ',
    name: 'Michael James',
    tag: 'You',
    meta: '2 Items assigned',
    status: 'Ready to Pay',
    statusClass: 'bg-primary text-on-primary',
    avatarClass: 'bg-primary text-on-primary',
    cardClass: 'bg-surface-tint-blue/80',
    items: [
      { label: 'Woodfire Ribeye 250g', value: '₦16,000' },
      { label: 'Passionfruit Mojito', value: '₦3,500' },
    ],
    vat: 'Share of VAT (7.5%)',
    vatValue: '+₦1,462',
    totalLabel: 'Your Base Share',
    total: '₦20,962',
    totalClass: 'text-primary',
    highlight: true,
    notice: null as string | null,
  },
  {
    initials: 'SJ',
    name: 'Sarah Jenkins',
    tag: '',
    meta: 'Smash Burger · 1/2 Truffle Fries',
    status: 'Paid via Tap',
    statusClass: 'bg-badge-discount-bg text-badge-discount-text',
    avatarClass: 'bg-badge-discount-bg text-badge-discount-text',
    cardClass: 'bg-surface-container-low',
    items: [],
    vat: 'Items + Share of VAT (₦607)',
    vatValue: '',
    totalLabel: 'Settled',
    total: '₦8,707',
    totalClass: 'text-text-primary',
    highlight: false,
    notice: null as string | null,
  },
  {
    initials: 'TO',
    name: 'Tunde Oladipo',
    tag: '',
    meta: '1/2 Truffle Fries',
    status: 'Waiting for Pay',
    statusClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    avatarClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    cardClass: 'bg-surface-container-low',
    items: [],
    vat: 'Items + Share of VAT (₦120)',
    vatValue: '',
    totalLabel: '',
    total: '₦1,720',
    totalClass: 'text-text-primary',
    highlight: false,
    notice: null as string | null,
  },
];

const formatNaira = (value: number) => `₦${value.toLocaleString('en-US')}`;

/** Live tip choices: a share of the ticket total. */
const LIVE_TIPS = [
  { key: 0, label: 'No Tip', percent: 0 },
  { key: 1, label: '10%', percent: 10 },
  { key: 2, label: '15% Great!', percent: 15 },
];
const LIVE_SEG_COLORS = ['bg-primary', 'bg-badge-discount-text', 'bg-tertiary-container', 'bg-secondary-container'];

export function BusinessSplitBillScreen({ onBack, onPay }: BusinessSplitBillScreenProps) {
  // Live: the open till's ticket, split evenly; the sample table is for running without an API.
  const display = useLiveDisplay();
  const live = display.live;
  const [mode, setMode] = useState<SplitMode>(live ? 'equally' : 'items');
  const [diners, setDiners] = useState(live ? 2 : 3);
  const [tip, setTip] = useState<number>(live ? 0 : 3140);
  const [toast, setToast] = useState<string | null>(null);

  const ticketTotal = Math.round(display.total);
  const tipPercent = LIVE_TIPS.find((option) => option.key === tip)?.percent ?? 0;
  const liveTip = Math.round((ticketTotal * tipPercent) / 100);
  const liveGrand = ticketTotal + liveTip;
  const liveShares = useMemo(() => {
    const base = Math.floor(liveGrand / diners);
    return Array.from({ length: diners }, (_, index) => (index === 0 ? base + (liveGrand - base * diners) : base));
  }, [liveGrand, diners]);
  const itemCount = display.ticket?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;
  const liveDiners = liveShares.map((share, index) => ({
    initials: `D${index + 1}`,
    name: `Diner ${index + 1}`,
    tag: index === 0 ? 'You' : '',
    meta: 'Equal share of the ticket',
    status: index === 0 ? 'Ready to Pay' : 'Waiting for Pay',
    statusClass: index === 0 ? 'bg-primary text-on-primary' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    avatarClass: index === 0 ? 'bg-primary text-on-primary' : 'bg-tertiary-fixed text-on-tertiary-fixed',
    cardClass: index === 0 ? 'bg-surface-tint-blue/80' : 'bg-surface-container-low',
    items: [] as { label: string; value: string }[],
    vat: liveTip ? `Includes ${formatNaira(Math.round(liveTip / diners))} tip` : 'Includes tax',
    vatValue: '',
    totalLabel: '',
    total: formatNaira(share),
    totalClass: 'text-text-primary',
    highlight: index === 0,
    notice: null as string | null,
  }));
  const dinerCards = live ? liveDiners : DINERS;
  const tipOptions = live
    ? LIVE_TIPS.map((option) => ({ key: option.key, label: option.label, sub: option.percent ? `+${formatNaira(Math.round((ticketTotal * option.percent) / 100))}` : '₦0' }))
    : TIPS;
  const segments = live
    ? liveShares.map((share, index) => ({
        name: `Diner ${index + 1}`,
        width: `${liveGrand ? (share / liveGrand) * 100 : 0}%`,
        color: LIVE_SEG_COLORS[index % LIVE_SEG_COLORS.length],
      }))
    : SEGS;
  const yourShare = live ? liveShares[0] ?? 0 : BASE_SHARE;

  const shareSplit = () => {
    const text = `${display.venueName} bill ${formatNaira(liveGrand)} split ${diners} ways: ${formatNaira(liveShares[0] ?? 0)} each.`;
    navigator.clipboard?.writeText(text).then(
      () => showToast('Split summary copied to clipboard'),
      () => showToast('The split summary couldn’t be copied'),
    );
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const finalTotal = live ? yourShare : BASE_SHARE + tip;

  return (
    <AppScreen>
      <ScreenHeader title="Split The Bill" onBack={onBack} />

      <div className="flex flex-col w-full pb-space-2xl">
        {/* Bill header */}
        <section className="px-margin pt-space-xs pb-space-sm">
          <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/5 pointer-events-none" />
            <div className="flex items-start justify-between gap-space-sm mb-space-2xs">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
                    <Icon name="receipt_long" className="text-[13px]" />
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {live ? (display.ticket ? display.whereLine : 'No open ticket') : 'Order #TK-108 · Table 04'}
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-text-primary font-medium truncate mt-0.5">
                  {live ? display.venueName : 'Urban Grill & Bistro, Wuse II'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-caption text-caption text-text-tertiary block">Total Bill</span>
                <span className="font-heading-md text-heading-md text-text-primary tracking-tight font-bold">{live ? formatNaira(ticketTotal) : '₦27,628'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-text-secondary pt-space-2xs bg-surface-canvas/60 rounded-lg px-space-xs py-0.5 gap-space-xs">
              <span className="font-caption text-caption flex items-center gap-1 min-w-0">
                <Icon name="check_circle" className="text-[13px] text-badge-discount-text shrink-0" />
                <span className="truncate">{live ? `${itemCount} ${itemCount === 1 ? 'Item' : 'Items'} incl. tax` : '3 Items + 7.5% State VAT'}</span>
              </span>
              <span className="font-caption text-caption text-primary font-semibold shrink-0">Live POS Session</span>
            </div>
          </div>
        </section>

        {/* Split mode */}
        <section className="px-margin pb-space-xs">
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl gap-1">
            {MODES.map((item) => (
              <button
                className={`flex-1 py-space-xs px-space-2xs rounded-lg text-center font-label-sm text-label-sm transition-all ${
                  mode === item.key ? 'bg-surface-canvas text-primary shadow-sm font-semibold' : 'text-text-secondary'
                }`}
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Allocation meter */}
        <section className="px-margin pb-space-sm">
          <div className="bg-surface-container-high/60 rounded-xl p-space-xs space-y-space-2xs">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-space-2xs min-w-0">
                <Icon name="pie_chart" className="text-[15px] text-primary" />
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">Accounted Breakdown</span>
              </div>
              <span className="font-caption text-caption font-medium text-text-secondary shrink-0">
                {live ? `${formatNaira(liveGrand)}${tipPercent ? ` (w/ ${tipPercent}% Tip)` : ''}` : '₦29,669 / ₦31,768 (w/ 15% Table Tip)'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-surface-variant/70 rounded-full overflow-hidden flex">
              {segments.map((seg) => (
                <div className={`${seg.color} h-full transition-all duration-500`} key={seg.name} style={{ width: seg.width }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-text-secondary font-caption text-caption gap-space-xs flex-wrap">
              {live
                ? liveShares.slice(0, 3).map((share, index) => (
                    <span className="flex items-center gap-1" key={index}>
                      <span className={`w-2 h-2 rounded-full inline-block ${LIVE_SEG_COLORS[index % LIVE_SEG_COLORS.length]}`} />{' '}
                      {index === 0 ? 'You' : `Diner ${index + 1}`}: {formatNaira(share)}
                    </span>
                  ))
                : (
                  <>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text inline-block" /> Sarah: Paid (₦8,707)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" /> You: ₦20,962
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary-container inline-block" /> Tunde: ₦1,720
              </span>
                  </>
                )}
            </div>
          </div>
        </section>

        {/* Diners stepper */}
        <section className="px-margin pb-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold text-text-primary">Table Diners</span>
            <div className="flex items-center bg-surface-container-low rounded-lg p-0.5">
              <button
                aria-label="Decrease diners"
                className="w-7 h-7 flex items-center justify-center rounded text-text-secondary hover:bg-surface-canvas active:scale-95 transition-transform"
                type="button"
                onClick={() => setDiners((current) => Math.max(1, current - 1))}
              >
                <Icon name="remove" className="text-[15px]" />
              </button>
              <span className="font-label-sm text-label-sm font-semibold text-text-primary px-space-xs">{diners}</span>
              <button
                aria-label="Increase diners"
                className="w-7 h-7 flex items-center justify-center rounded text-text-secondary hover:bg-surface-canvas active:scale-95 transition-transform"
                type="button"
                onClick={() => setDiners((current) => Math.min(12, current + 1))}
              >
                <Icon name="add" className="text-[15px]" />
              </button>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1 font-caption text-caption text-primary font-medium"
            type="button"
            onClick={() => setMode('equally')}
          >
            <Icon name="call_split" className="text-[14px]" />
            Split shared items evenly
          </button>
        </section>

        {/* Diners */}
        <section className="px-margin space-y-space-sm pb-space-sm">
          {dinerCards.map((diner) => (
            <div
              className={`${diner.cardClass} rounded-xl p-space-sm shadow-sm relative overflow-hidden`}
              key={diner.name}
            >
              <div className="flex items-center justify-between mb-space-2xs gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full font-label-sm text-label-sm font-semibold flex items-center justify-center shrink-0 ${diner.avatarClass}`}
                  >
                    {diner.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-sm text-label-sm font-bold text-text-primary truncate">{diner.name}</span>
                      {diner.tag && (
                        <span className="bg-primary/10 text-primary font-caption text-caption px-1.5 py-0.5 rounded-full font-semibold">
                          {diner.tag}
                        </span>
                      )}
                    </div>
                    <span className="font-caption text-caption text-text-secondary truncate">{diner.meta}</span>
                  </div>
                </div>
                <span
                  className={`font-caption text-caption px-space-xs py-0.5 rounded-full font-semibold shrink-0 ${diner.statusClass}`}
                >
                  {diner.status}
                </span>
              </div>

              {diner.items.length > 0 ? (
                <div className="space-y-1 bg-surface-canvas/90 rounded-lg p-space-xs mb-space-2xs">
                  {diner.items.map((item) => (
                    <div className="flex items-center justify-between" key={item.label}>
                      <div className="flex items-center gap-space-2xs min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">{item.label}</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold shrink-0">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between font-caption text-caption text-text-secondary pt-space-2xs">
                    <span className="text-text-tertiary">{diner.vat}</span>
                    <span>{diner.vatValue}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                  <span>{diner.vat}</span>
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    {diner.totalLabel === 'Settled' ? `${diner.total} Settled` : diner.total}
                  </span>
                </div>
              )}

              {diner.highlight && (
                <div className="flex items-baseline justify-between pt-space-2xs">
                  <span className="font-caption text-label-sm text-text-secondary">Your Base Share</span>
                  <span className="font-heading-sm text-heading-sm text-primary font-bold">{diner.total}</span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Tip */}
        <section className="px-margin pb-space-sm">
          <div className="bg-surface-container rounded-xl p-space-sm">
            <div className="flex items-center justify-between mb-space-2xs">
              <span className="font-label-sm text-label-sm font-semibold text-text-primary">Add Tip for Service</span>
              <span className="font-caption text-caption text-text-secondary">Shared with kitchen &amp; table captain</span>
            </div>
            <div className="grid grid-cols-3 gap-space-xs">
              {tipOptions.map((item) => {
                const active = tip === item.key;
                return (
                  <button
                    className={`py-space-xs rounded-xl text-center transition-all ${
                      active ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-canvas'
                    }`}
                    key={item.key}
                    type="button"
                    onClick={() => setTip(item.key)}
                  >
                    <span
                      className={`block font-label-sm text-label-sm ${active ? 'font-bold' : 'font-medium text-text-primary'}`}
                    >
                      {item.label}
                    </span>
                    <span className={`block font-caption text-caption ${active ? 'text-on-primary/80' : 'text-text-secondary'}`}>
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Checkout */}
        <section className="px-margin pb-space-lg space-y-space-xs">
          <div className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between gap-space-xs">
            <div className="min-w-0">
              <span className="font-caption text-caption text-text-secondary block">{live ? 'Total to Pay (Your Share)' : 'Total to Pay (Michael)'}</span>
              <span className="font-caption text-caption text-text-tertiary">
                {live ? `Base ${formatNaira(Math.floor(ticketTotal / diners))} + Tip ${formatNaira(Math.round(liveTip / diners))}` : `Base ₦20,962 + Tip ${formatNaira(tip)}`}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-heading-md text-heading-md text-primary font-bold tracking-tight">
                {formatNaira(finalTotal)}
              </span>
            </div>
          </div>
          <button
            className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.99] transition-all"
            type="button"
            onClick={onPay}
          >
            <span>Pay Your Share ({formatNaira(finalTotal)})</span>
            <Icon name="arrow_forward" className="text-[17px]" />
          </button>
          <div className="grid grid-cols-2 gap-space-xs">
            <button
              className="h-11 bg-surface-container-low text-text-primary rounded-xl font-label-sm text-label-sm font-medium flex items-center justify-center gap-space-2xs transition-colors"
              type="button"
              onClick={() => (live ? shareSplit() : showToast('Split bill link copied to clipboard'))}
            >
              <Icon name="share" className="text-text-secondary text-[16px]" />
              <span>Share Bill Link</span>
            </button>
            <button
              className="h-11 bg-surface-container-low text-text-primary rounded-xl font-label-sm text-label-sm font-medium flex items-center justify-center gap-space-2xs transition-colors"
              type="button"
              onClick={() => showToast(`Sending ${diners} split slips to printer…`)}
            >
              <Icon name="print" className="text-text-secondary text-[16px]" />
              <span>Print Split Slips</span>
            </button>
          </div>
          <div className="pt-space-2xs flex items-center justify-center gap-space-2xs text-text-tertiary">
            <Icon name="verified_user" className="text-badge-discount-text text-[14px]" />
            <span className="font-caption text-caption">{live ? display.whereLine : 'Encrypted via VEMTAP Instant POS Gateway · Session #TK-108'}</span>
          </div>
        </section>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
