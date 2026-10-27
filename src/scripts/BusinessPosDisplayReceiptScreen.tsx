import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { downloadCsv } from '../utils/exportCsv';
import { printKvTable, printReport } from '../utils/printReport';
import { apiErrorMessage } from '../services/errorMessages';
import { naira, useLiveDisplay, useLiveDisplayReceipt, useLivePos } from './posLive';

interface BusinessPosDisplayReceiptScreenProps {
  onBack: () => void;
  onDone: () => void;
}

const ITEMS = [
  { qty: '1×', name: 'Woodfire Ribeye 250g', meta: 'Medium Rare, Pepper sauce', price: '₦16,000.00' },
  { qty: '1×', name: 'Double Smash Burger', meta: 'House sauce, pickles', price: '₦6,500.00' },
  { qty: '1×', name: 'Truffle Parm Fries', meta: 'Large portion', price: '₦3,200.00' },
  { qty: '1×', name: 'Passionfruit Mojito', meta: 'House craft signature', price: '₦3,500.00' },
];

const BREAKDOWN = [
  { label: 'Subtotal', value: '₦29,200.00', tone: 'text-text-secondary', valueTone: 'text-text-primary' },
  { label: 'VAT (7.5%)', value: '₦2,072.00', tone: 'text-text-secondary', valueTone: 'text-text-primary' },
  { label: 'Staff Tip (15%)', value: '+₦4,140.00', tone: 'text-text-secondary', valueTone: 'text-text-primary font-medium', extra: 'to Sunday M.' },
];

const RATING_REMARKS = [
  'Thanks for the feedback. We will improve!',
  'We appreciate your honesty.',
  'Glad you enjoyed your meal!',
  'Great! We will let Emeka & kitchen know.',
  'Phenomenal! 5-star review saved for Urban Grill.',
];

export function BusinessPosDisplayReceiptScreen({ onBack, onDone }: BusinessPosDisplayReceiptScreenProps) {
  const [whatsApp, setWhatsApp] = useState(true);
  const [email, setEmail] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [rating, setRating] = useState(0);
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
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const receipt = useLiveDisplayReceipt();
  const display = useLiveDisplay();
  const pos = useLivePos();
  const live = receipt.live;
  const items = live ? receipt.items : ITEMS;
  const breakdown: { label: string; value: string; tone: string; valueTone: string; extra?: string }[] = live ? receipt.breakdown : BREAKDOWN;
  const totalLabel = live ? `${naira(receipt.total)}.00` : '₦31,768.00';
  const venue = live ? (receipt.venue ?? pos.businessName) : 'Urban Grill & Bistro';
  const orderRef = live ? receipt.ref : 'TK-108';

  useEffect(() => {
    if (live && receipt.error) showToast(apiErrorMessage(receipt.error, 'Could not load the receipt.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.error]);

  const sendCustom = () => {
    if (live) {
      showToast('Sending receipts by email or WhatsApp is coming soon');
      return;
    }
    const value = recipient.trim();
    if (!value) {
      showToast('Please enter an email or phone number');
      return;
    }
    setRecipient('');
    showToast(`Receipt forwarded to ${value}`);
  };

  const downloadReceiptPdf = () => {
    downloadCsv(
      live ? `Receipt_${orderRef}.csv` : 'UrbanGrill_TK108.csv',
      ['Item', 'Detail', 'Price'],
      items.map((item) => [`${item.qty} ${item.name}`, item.meta, item.price]),
    );
    printReport(
      `VEMTAP Receipt — Order #${orderRef}`,
      `${printKvTable('Payment', [
        ['Merchant', venue],
        ['Order', `#${orderRef}`],
        ['Reference', live ? receipt.ref : 'VEM-REC-894210'],
        ['Auth code', live ? receipt.method : '#990214'],
      ])}
       ${printKvTable('Items', items.map((item) => [`${item.qty} ${item.name} — ${item.meta}`, item.price]))}
       ${printKvTable(
         'Totals',
         [
           ...breakdown.map(
             (line) => [line.label, line.extra ? `${line.value} (${line.extra})` : line.value] as [string, string],
           ),
           ['Net total paid', totalLabel],
         ],
       )}
       <p class="foot">A CSV copy of the itemised receipt downloaded alongside this PDF.</p>`,
    );
    showToast(live ? `PDF downloaded: Receipt_${orderRef}.pdf` : 'PDF downloaded: UrbanGrill_TK108.pdf');
  };

  return (
    <AppScreen>
      <ScreenHeader title="Digital E-Receipt" onBack={onBack} />

      <div className="flex flex-col w-full px-margin pb-space-2xl gap-space-sm pt-space-xs">
        {/* Merchant meta */}
        <div className="flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-2xs min-w-0">
            <Icon name="restaurant" className="text-[16px] text-primary shrink-0" />
            <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">{venue}</span>
            <span className="text-text-tertiary">•</span>
            <span className="font-caption text-caption text-text-secondary truncate">Order #{orderRef}</span>
          </div>
          <div className="flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-caption text-caption font-medium">Paid Just Now</span>
          </div>
        </div>

        {/* Success hero */}
        <div className="flex flex-col items-center text-center relative py-space-2xs">
          <div className="relative flex items-center justify-center mb-space-xs">
            <div className="absolute w-24 h-24 rounded-full bg-badge-discount-bg scale-125 opacity-80 blur-xl" />
            <div className="w-16 h-16 rounded-full bg-badge-discount-bg flex items-center justify-center relative shadow-sm">
              <div className="w-12 h-12 rounded-full bg-badge-discount-text flex items-center justify-center shadow-md">
                <Icon name="check" className="text-surface-canvas text-[30px]" filled />
              </div>
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold uppercase tracking-wider mb-0.5">
            Payment Confirmed
          </span>
          <h2 className="font-heading-md text-heading-md text-text-primary mb-0.5">{totalLabel}</h2>
          <div className="flex items-center justify-center gap-space-2xs text-text-secondary flex-wrap">
            <Icon name="contactless" className="text-[15px] text-primary" />
            <span className="font-caption text-caption">{live ? receipt.method : 'Contactless Card Tap'}</span>
            <span className="text-text-tertiary">·</span>
            <span className="font-caption text-caption font-medium">{live ? display.whereLine : 'Till 01 (Wuse II)'}</span>
          </div>
          <div className="bg-surface-subtle px-space-xs py-0.5 rounded-full flex items-center gap-space-2xs max-w-full mt-space-2xs">
            <span className="font-caption text-caption text-text-tertiary truncate">{live ? `Ref: ${receipt.ref}` : 'Ref: VEM-REC-894210 · Auth: #990214'}</span>
            <button
              aria-label="Copy reference ID"
              className="text-text-secondary hover:text-primary transition-colors flex items-center shrink-0"
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(live ? receipt.ref : 'VEM-REC-894210').catch(() => undefined);
                showToast('Reference ID copied!');
              }}
            >
              <Icon name="content_copy" className="text-[14px]" />
            </button>
          </div>
          <p className="font-caption text-caption text-text-tertiary mt-1">{live ? receipt.when : 'Oct 17, 2024 · 2:14 PM'}</p>
        </div>

        {/* Receipt card */}
        <div className="relative bg-surface-canvas rounded-xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.06)] overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-badge-discount-text" />
          <div className="p-space-md flex flex-col gap-space-sm">
            <div className="flex flex-col gap-1 pb-space-xs bg-surface-subtle -mx-space-md -mt-space-md px-space-md pt-space-md mb-space-2xs">
              <div className="flex items-start justify-between gap-space-xs">
                <div className="min-w-0">
                  <h3 className="font-label-md text-label-md text-text-primary font-semibold">{venue}</h3>
                  <p className="font-caption text-caption text-text-secondary leading-snug">
                    {live ? (receipt.address ?? receipt.branch ?? pos.branchName) : 'Plot 12 Ademola Adetokunbo Crescent, Wuse II, Abuja'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                  <Icon name="storefront" filled className="text-primary text-[18px]" />
                </div>
              </div>
              <div className="flex items-center justify-between text-text-tertiary gap-space-xs">
                <span className="font-caption text-caption">{live ? `TIN: ${receipt.tin}` : 'TIN: TIN-88492019-01'}</span>
                <span className="font-caption text-caption text-text-secondary">{live ? `${receipt.cashier} · ${receipt.orderType}` : 'Emeka O. · Table 04 (Dine-in)'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-caption text-label-sm text-text-tertiary uppercase tracking-wider font-semibold">
                Ordered Items
              </span>
              <span className="font-caption text-caption text-text-tertiary">4 Items</span>
            </div>

            <div className="flex flex-col gap-space-xs">
              {items.map((item) => (
                <div className="flex items-start justify-between gap-space-xs" key={item.name}>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-baseline gap-space-2xs">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">{item.qty}</span>
                      <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-caption text-caption text-text-tertiary pl-4">{item.meta}</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold shrink-0">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="h-3 flex items-center justify-between -mx-space-md my-space-2xs px-2 opacity-40">
              <div className="w-3 h-3 rounded-full bg-background -ml-3" />
              <div className="flex-1 border-t-2 border-dashed border-outline-variant mx-2" />
              <div className="w-3 h-3 rounded-full bg-background -mr-3" />
            </div>

            <div className="flex flex-col gap-space-2xs">
              {breakdown.map((row) => (
                <div className="flex items-center justify-between gap-space-xs" key={row.label}>
                  <div className="flex items-center gap-space-2xs min-w-0">
                    <span className={`font-label-sm text-label-sm ${row.tone}`}>{row.label}</span>
                    {row.extra && <span className="font-caption text-caption text-text-tertiary">{row.extra}</span>}
                  </div>
                  <span className={`font-label-sm text-label-sm ${row.valueTone}`}>{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-2xs min-w-0">
                  <span className="font-label-sm text-label-sm text-badge-discount-text font-medium">{live ? (receipt.discount ? 'Discount' : 'No discount') : 'VEMTAP Member Perk'}</span>
                  <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-1.5 py-0.5 rounded-full font-bold">
                    5% OFF
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-badge-discount-text font-medium">{live ? `-${naira(receipt.discount)}.00` : '-₦1,572.00'}</span>
              </div>

              <div className="bg-surface-tint-blue rounded-xl p-space-sm mt-space-2xs flex items-center justify-between gap-space-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                    Net Total Paid
                  </span>
                  <span className="font-caption text-caption text-text-secondary">Card ending in •• 4092</span>
                </div>
                <span className="font-heading-sm text-heading-sm text-primary font-bold shrink-0">{totalLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-gradient-to-r from-primary to-primary-container rounded-xl p-space-sm text-surface-canvas shadow-md flex items-center justify-between relative overflow-hidden gap-space-xs">
          <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-full bg-surface-canvas/10 blur-xl pointer-events-none" />
          <div className="flex items-center gap-space-xs z-10 min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface-canvas/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Icon name="stars" filled className="text-surface-canvas text-[22px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-surface-canvas font-bold truncate">+{live ? receipt.points.toLocaleString() : '318'} Points Credited!</span>
              <p className="font-caption text-caption text-surface-canvas/90 truncate">
                {live ? (
                  'Points land on your VEMTAP account'
                ) : (
                  <>
                    New Balance: <strong className="font-bold">2,768 pts</strong> · VIP Member
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="bg-surface-canvas/20 px-space-xs py-1 rounded-full text-surface-canvas font-caption text-caption font-semibold shrink-0 z-10">
            Tier Gold
          </div>
        </div>

        {/* Dispatch */}
        <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <Icon name="send_to_mobile" className="text-primary text-[18px]" />
              <span className="font-label-md text-label-md text-text-primary font-semibold">Send Copy of E-Receipt</span>
            </div>
            <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
              <Icon name="check_circle" className="text-[14px]" /> Auto-queued
            </span>
          </div>
          <label className="flex items-center gap-space-xs p-space-xs bg-surface-canvas rounded-lg cursor-pointer transition-colors hover:bg-surface-subtle">
            <input
              checked={whatsApp}
              className="w-4 h-4 rounded text-primary accent-primary"
              type="checkbox"
              onChange={(event) => {
                setWhatsApp(event.target.checked);
                showToast(event.target.checked ? 'WhatsApp dispatch enabled' : 'WhatsApp dispatch unselected');
              }}
            />
            <div className="flex items-center gap-space-2xs min-w-0 flex-1">
              <Icon name="chat" className="text-[18px] text-badge-discount-text" />
              <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                WhatsApp ({live ? receipt.sale?.customer?.phone || 'no phone on file' : '+234 803 219 8831'})
              </span>
            </div>
            <span className="font-caption text-caption text-text-tertiary">Default</span>
          </label>
          <label className="flex items-center gap-space-xs p-space-xs bg-surface-canvas rounded-lg cursor-pointer transition-colors hover:bg-surface-subtle">
            <input
              checked={email}
              className="w-4 h-4 rounded text-primary accent-primary"
              type="checkbox"
              onChange={(event) => {
                setEmail(event.target.checked);
                showToast(event.target.checked ? 'Email dispatch enabled' : 'Email dispatch unselected');
              }}
            />
            <div className="flex items-center gap-space-2xs min-w-0 flex-1">
              <Icon name="mail" className="text-[18px] text-primary" />
              <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                Email ({live ? receipt.sale?.customer?.email || 'no email on file' : 'michael.j@example.com'})
              </span>
            </div>
            <span className="font-caption text-caption text-text-tertiary">Verified</span>
          </label>

          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption text-text-secondary font-medium" htmlFor="customRecipient">
              Forward to another recipient:
            </label>
            <div className="flex items-center gap-space-2xs bg-surface-canvas rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-primary shadow-sm">
              <Icon name="alternate_email" className="text-text-tertiary text-[18px] pl-2" />
              <input
                className="w-full bg-transparent px-2 py-1.5 text-text-primary font-label-sm text-label-sm outline-none placeholder:text-text-tertiary"
                id="customRecipient"
                placeholder="e.g. accounting@company.com"
                type="text"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') sendCustom();
                }}
              />
              <button
                className="bg-primary text-on-primary px-space-sm py-1.5 rounded-lg font-label-sm text-label-sm font-medium transition-transform active:scale-95 shrink-0"
                type="button"
                onClick={sendCustom}
              >
                Send
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
            <button
              className="flex items-center justify-center gap-space-2xs h-10 bg-surface-canvas text-text-primary rounded-xl font-label-sm text-label-sm font-semibold transition-all active:scale-95 shadow-sm"
              type="button"
              onClick={downloadReceiptPdf}
            >
              <Icon name="download" className="text-primary text-[17px]" />
              <span>Download PDF</span>
            </button>
            <button
              className="flex items-center justify-center gap-space-2xs h-10 bg-surface-canvas text-text-primary rounded-xl font-label-sm text-label-sm font-semibold transition-all active:scale-95 shadow-sm"
              type="button"
              onClick={() => showToast(live ? 'Receipt share links are coming soon' : 'Receipt share link copied!')}
            >
              <Icon name="ios_share" className="text-primary text-[17px]" />
              <span>Share Receipt</span>
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col items-center text-center gap-space-2xs">
          <span className="font-label-sm text-label-sm text-text-secondary">Rate your experience at</span>
          <h4 className="font-label-md text-label-md text-text-primary font-semibold">{venue}</h4>
          <div className="flex items-center gap-1.5 py-space-2xs">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                aria-label={`${score} star${score > 1 ? 's' : ''}`}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                  score <= rating ? 'text-tertiary-container' : 'text-outline-variant'
                }`}
                key={score}
                type="button"
                onClick={() => {
                  setRating(score);
                  if (!live) {
                    showToast(`${score} Star Rating Recorded!`);
                    return;
                  }
                  display
                    .sendTip(0, score)
                    .then(() => showToast(`${score} Star Rating Recorded!`))
                    .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not save the rating.')));
                }}
              >
                <Icon name="star" filled={score <= rating} className="text-[26px]" />
              </button>
            ))}
          </div>
          <p className="font-caption text-caption text-badge-discount-text font-medium min-h-[16px]">
            {rating > 0 ? RATING_REMARKS[rating - 1] : 'Tap a star to leave instant praise'}
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-space-xs pt-space-2xs">
          <button
            className="w-full h-12 bg-primary-container text-surface-canvas rounded-2xl font-label-md text-label-md font-semibold shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all"
            type="button"
            onClick={onDone}
          >
            <span>Done / Return to Home</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <div className="flex flex-col items-center gap-0.5 text-center pt-space-2xs">
            <div className="flex items-center gap-1 text-text-tertiary">
              <Icon name="verified_user" className="text-[14px]" />
              <span className="font-caption text-caption">Government Compliant E-Receipt</span>
            </div>
            <p className="font-caption text-caption text-text-tertiary">
              Verified by VEMTAP Merchant Cloud · Session #894-WUSE
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-[430px] px-margin pointer-events-none">
          <div className="bg-on-surface text-surface-canvas px-space-sm py-space-xs rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-space-2xs justify-center">
            <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
