import { useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface ClaimedDealScreenProps {
  onBack: () => void;
  onContact: () => void;
  onReview: () => void;
  onCancelClaim: () => void;
}

export const CLAIM_CODE = 'VT-48F261';
const CASHIER_PIN = '8821';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNsQYzlQAh9oju3O9Pp7b2OqE4Q1w9NTs0_fLXsac8VzxG06oD2NcwkkT8F3q8guxDTRfKEplRfmk3C-S9j62uAZ-X3SG4rkR3dDcngRx8sOpiwe5UeKWYk-lyy81904uUukw2Do3wMAOVj0Vg_7dv90NC6KTvhmoR0HFL6aPR56jOI4gZrX7w67mzbdQcgA44gm5lNRoAe6oGg6V1rNX8nBhjhfYCCBlRIssV7QqZImEOkPqpYnQDw';

const MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBRzuuVi9eFa4IfiKY-0CLXnUqZT2sbZNosW0fYczr-35iaT8YS48jMPhxX5FhnlpIT0M6U61-52cj6dPjBQzinsAIKVmlZpDUKfvnY7-G3LByd50m-xoQvFZg9A_dkudzO9jz0LRWmtKBN1qsOyrPwhv2R0EFtDw9bUTJM-yJ2xFm00pWt8sgDfxXVcbelWtpObOkpjajIiqRQK8pSgKgT2aPd465gP81ZRfUsDx5-0GtlsxHiafGQhg';

const DIRECTIONS_URL = 'https://www.google.com/maps/search/?api=1&query=Apo%20Boulevard%2C%20Abuja';

const REDEEM_STEPS = [
  {
    title: 'Visit the Branch',
    body: 'Head to Urban Grill & Bistro located at Apo Boulevard, Abuja.',
  },
  {
    title: 'Notify Your Server',
    body: 'Mention you have an active VEMTAP voucher when placing your lunch combo order.',
  },
  {
    title: 'Scan or Enter Code',
    body: <>Show your QR Code or provide Claim Code <span className="font-semibold text-primary">{CLAIM_CODE}</span>.</>,
  },
  {
    title: 'Enjoy & Save',
    body: 'Pay the discounted bill of ₦9,600 right at checkout counter.',
  },
];

const DEAL_RULES = [
  { icon: 'calendar_today', text: 'Valid Monday – Friday, 12:00 PM – 4:00 PM (Lunch hours).' },
  { icon: 'restaurant', text: 'Dine-in exclusive (Takeaway & delivery excluded).' },
  { icon: 'confirmation_number', text: 'One claim voucher valid per table / visit.' },
  { icon: 'block', text: 'Cannot be combined with student or other combo promos.' },
];

function QrCodeArt() {
  return (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
      <rect fill="#141B2B" height="30" rx="3" width="30" x="0" y="0" />
      <rect fill="#FFFFFF" height="20" rx="2" width="20" x="5" y="5" />
      <rect fill="#141B2B" height="10" rx="1" width="10" x="10" y="10" />
      <rect fill="#141B2B" height="30" rx="3" width="30" x="70" y="0" />
      <rect fill="#FFFFFF" height="20" rx="2" width="20" x="75" y="5" />
      <rect fill="#141B2B" height="10" rx="1" width="10" x="80" y="10" />
      <rect fill="#141B2B" height="30" rx="3" width="30" x="0" y="70" />
      <rect fill="#FFFFFF" height="20" rx="2" width="20" x="5" y="75" />
      <rect fill="#141B2B" height="10" rx="1" width="10" x="10" y="80" />
      <rect fill="#141B2B" height="8" rx="1" width="8" x="36" y="4" />
      <rect fill="#141B2B" height="6" rx="1" width="6" x="48" y="12" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="58" y="4" />
      <rect fill="#141B2B" height="6" rx="1" width="6" x="36" y="20" />
      <rect fill="#141B2B" height="6" rx="1" width="6" x="4" y="38" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="16" y="46" />
      <rect fill="#141B2B" height="14" rx="1" width="6" x="28" y="38" />
      <rect fill="#141B2B" height="6" rx="1" width="14" x="68" y="38" />
      <rect fill="#141B2B" height="8" rx="1" width="8" x="88" y="44" />
      <rect fill="#141B2B" height="8" rx="1" width="6" x="38" y="68" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="48" y="74" />
      <rect fill="#141B2B" height="6" rx="1" width="6" x="62" y="68" />
      <rect fill="#141B2B" height="8" rx="1" width="8" x="76" y="78" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="88" y="70" />
      <rect fill="#141B2B" height="6" rx="1" width="14" x="38" y="86" />
      <rect fill="#141B2B" height="6" rx="1" width="8" x="60" y="88" />
      <rect fill="#141B2B" height="6" rx="1" width="10" x="82" y="90" />
      <rect fill="#066CF4" height="28" rx="6" width="28" x="36" y="36" />
      <path d="M44 44L50 56L56 44" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}

export function ClaimedDealScreen({ onBack, onContact, onReview, onCancelClaim }: ClaimedDealScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<null | 'redeem' | 'cancel'>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(CLAIM_CODE).catch(() => undefined);
    setCopied(true);
    showToast(`Merchant Code Copied: ${CLAIM_CODE}`);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const sharePass = () => {
    const text = `Urban Grill & Bistro — 20% Off Prime Lunch Gourmet Combo (${CLAIM_CODE})`;
    if (navigator.share) {
      navigator.share({ title: 'Claimed Deal Pass', text }).catch(() => undefined);
      return;
    }
    navigator.clipboard?.writeText(text).catch(() => undefined);
    showToast('Pass details copied to clipboard');
  };

  const handleConfirm = () => {
    if (confirming === 'redeem') {
      setConfirming(null);
      showToast('Pass marked as presented in-store!');
    } else if (confirming === 'cancel') {
      setConfirming(null);
      onCancelClaim();
    }
  };

  const showBarcode = () => {
    qrRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Displaying full scannable pass');
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:text-primary transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate max-w-[200px]">
              Claimed Deal Pass
            </h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Share deal"
              type="button"
              onClick={sharePass}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="share" className="text-[24px]" />
            </button>
            <button
              aria-label="More options"
              type="button"
              onClick={() => showToast('Pass options: report issue, redeem rules, cancel')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="more_vert" className="text-[24px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface">
        <div className="px-margin pt-space-xs pb-space-2xl space-y-space-md">
          <div className="relative w-full rounded-2xl bg-surface-canvas shadow-xl overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-secondary-fixed/40 blur-2xl pointer-events-none" />

            <div className="p-space-md bg-surface-container-low flex flex-col gap-space-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-1 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  ACTIVE CLAIM • READY TO USE
                </span>
              </div>
              <div className="inline-flex items-center gap-1 text-on-surface-variant">
                <Icon name="hourglass_top" className="text-[16px] text-tertiary" />
                <span className="font-caption text-caption">Expires Oct 18, 2024 at 11:59 PM (in 2 days)</span>
              </div>
            </div>

            <div className="p-space-md space-y-space-sm">
              <div className="relative w-full h-44 rounded-xl overflow-hidden">
                <img className="w-full h-full object-cover" alt="Gourmet double beef burger platter" src={HERO_IMG} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-space-xs left-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-xs py-0.5 rounded-full flex items-center gap-1 text-primary shadow-sm">
                  <Icon name="local_fire_department" className="text-[16px]" />
                  <span className="font-label-sm text-label-sm font-semibold">20% Saved</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-primary">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Urban Grill &amp; Bistro</span>
                  <Icon name="verified" className="text-[16px] text-primary-container" filled />
                </div>
                <h2 className="font-heading-md text-heading-md text-on-surface font-semibold tracking-tight">
                  20% Off Prime Lunch Gourmet Combo
                </h2>
                <div className="flex items-start gap-1 text-on-surface-variant mt-1">
                  <Icon name="pin_drop" className="text-[16px] mt-0.5 text-primary" />
                  <p className="font-caption text-caption">
                    Apo Boulevard Branch • Suite 12, Apo District, Abuja (0.8 km away)
                  </p>
                </div>
              </div>

              <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center justify-between">
                <div>
                  <p className="font-caption text-caption text-on-surface-variant">Discounted Total</p>
                  <p className="font-heading-md text-heading-md text-primary font-bold">₦9,600</p>
                </div>
                <div className="text-right">
                  <p className="font-caption text-caption text-text-tertiary line-through">₦12,000 Reg.</p>
                  <span className="inline-block bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded-md">
                    Save ₦2,400
                  </span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="absolute -left-3 w-6 h-6 rounded-full bg-surface" />
              <div className="w-full border-t border-dashed border-outline-variant/50 mx-4" />
              <div className="absolute -right-3 w-6 h-6 rounded-full bg-surface" />
            </div>

            <div className="p-space-md text-center space-y-space-sm bg-surface-subtle" ref={qrRef}>
              <div className="inline-block p-space-sm bg-surface-canvas rounded-2xl shadow-sm">
                <div className="w-48 h-48 mx-auto flex items-center justify-center relative bg-surface-bright rounded-lg p-2">
                  <QrCodeArt />
                </div>
                <span className="inline-block mt-2 font-caption text-caption text-on-surface-variant font-medium">
                  Scan to Redeem Instantly
                </span>
              </div>

              <div className="grid grid-cols-2 gap-space-xs">
                <div className="bg-surface-canvas p-space-xs rounded-xl flex flex-col items-center justify-center">
                  <span className="font-caption text-caption text-on-surface-variant">Merchant Code</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-heading-sm text-heading-sm font-bold text-on-surface tracking-wider">
                      {CLAIM_CODE}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      title="Copy code"
                      className="w-7 h-7 flex items-center justify-center text-primary rounded-full hover:bg-surface-tint-blue"
                    >
                      <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
                    </button>
                  </div>
                </div>
                <div className="bg-surface-canvas p-space-xs rounded-xl flex flex-col items-center justify-center">
                  <span className="font-caption text-caption text-on-surface-variant">Cashier PIN</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-primary mt-0.5 tracking-widest">
                    {CASHIER_PIN}
                  </span>
                </div>
              </div>

              <p className="font-caption text-caption text-on-surface-variant px-space-sm">
                Present this digital pass to your server or cashier before billing.
              </p>
            </div>
          </div>

          <div className="space-y-space-xs">
            <button
              type="button"
              onClick={() => setConfirming('redeem')}
              className="w-full h-11 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-transform"
            >
              <Icon name="check_circle" className="text-[20px]" />
              <span>Use Deal Now (Confirm In-Store)</span>
            </button>
            <div className="grid grid-cols-2 gap-space-xs">
              <button
                type="button"
                onClick={onContact}
                className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
              >
                <Icon name="chat" className="text-[18px]" />
                <span>Direct Chat</span>
              </button>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
              >
                <Icon name="directions" className="text-[18px]" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-sm text-heading-sm text-on-surface">Claim Verification</h3>
              <span className="bg-surface-container-high text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-label-sm">
                #CLM-982410
              </span>
            </div>
            <div className="space-y-space-xs text-body-md font-body-md">
              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant font-caption text-caption">Claimed On</span>
                <span className="text-on-surface font-medium text-caption">Oct 15, 2024 • 10:42 AM</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant font-caption text-caption">Claim Holder</span>
                <div className="flex items-center gap-1">
                  <span className="text-on-surface font-medium text-caption">Zainab Ahmed</span>
                  <Icon name="verified_user" className="text-primary text-[14px]" filled />
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant font-caption text-caption">Payment Mode</span>
                <span className="text-on-surface font-medium text-caption text-right">
                  In-person (Cash / POS / Transfer)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant font-caption text-caption">Usage Allocation</span>
                <span className="bg-surface-tint-blue text-primary px-2 py-0.5 rounded-md font-label-sm text-label-sm font-medium">
                  Personal Use
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-primary">
                <Icon name="verified" className="text-[18px]" />
              </div>
              <div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">How to Redeem</h3>
                <p className="font-caption text-caption text-on-surface-variant">4 quick steps at the restaurant</p>
              </div>
            </div>
            <div className="space-y-space-sm relative">
              {REDEEM_STEPS.map((step, index) => (
                <div key={step.title} className="flex items-start gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-semibold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-medium text-on-surface">{step.title}</p>
                    <p className="font-caption text-caption text-on-surface-variant">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-xs">
            <h3 className="font-heading-sm text-heading-sm text-on-surface">Terms &amp; Deal Rules</h3>
            <ul className="space-y-space-2xs text-on-surface-variant font-caption text-caption">
              {DEAL_RULES.map((rule) => (
                <li key={rule.text} className="flex items-center gap-2">
                  <Icon name={rule.icon} className="text-[16px] text-primary" />
                  <span>{rule.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold">
                  UG
                </div>
                <div>
                  <h4 className="font-heading-sm text-heading-sm text-on-surface">Urban Grill &amp; Bistro</h4>
                  <span className="inline-flex items-center gap-1 font-caption text-caption text-badge-discount-text font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> Open Now • Closes 10:00 PM
                  </span>
                </div>
              </div>
            </div>

            <div
              className="w-full h-32 rounded-xl bg-cover bg-center relative overflow-hidden flex items-end p-space-xs shadow-inner"
              style={{ backgroundImage: `url('${MAP_IMG}')` }}
            >
              <div className="bg-surface-canvas/90 backdrop-blur-md px-space-xs py-1 rounded-lg flex items-center gap-1 text-on-surface">
                <Icon name="location_on" className="text-[16px] text-primary" />
                <span className="font-caption text-caption font-semibold">0.8 km away • 4 mins drive</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-xs pt-1">
              <a
                href="tel:+2348000001234"
                className="h-10 rounded-xl bg-surface-container-low text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
              >
                <Icon name="call" className="text-[18px] text-primary" />
                <span>Call Branch</span>
              </a>
              <button
                type="button"
                onClick={onContact}
                className="h-10 rounded-xl bg-surface-container-low text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
              >
                <Icon name="forum" className="text-[18px] text-primary" />
                <span>In-App Chat</span>
              </button>
            </div>
          </div>

          <div className="space-y-space-sm pt-space-xs text-center">
            <div className="flex items-center justify-center gap-space-md">
              <button
                type="button"
                onClick={sharePass}
                className="flex items-center gap-1 text-primary font-label-md text-label-md font-medium"
              >
                <Icon name="share" className="text-[18px]" />
                <span>Share Pass</span>
              </button>
              <span className="text-outline-variant">•</span>
              <button
                type="button"
                onClick={onReview}
                className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md font-medium"
              >
                <Icon name="rate_review" className="text-[18px]" />
                <span>Review Merchant</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setConfirming('cancel')}
              className="font-caption text-caption text-text-tertiary hover:text-error transition-colors underline pt-1"
            >
              Cancel this claim (releases voucher for others)
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 w-full bg-surface-canvas/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin py-space-sm pb-safe flex items-center gap-space-xs z-40">
          <button
            type="button"
            onClick={showBarcode}
            className="h-11 px-space-md rounded-2xl bg-surface-container-low text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:bg-surface-container"
          >
            <Icon name="qr_code_scanner" className="text-[20px]" />
            <span>Barcode</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirming('redeem')}
            className="flex-1 h-11 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_4px_16px_-2px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-transform"
          >
            <Icon name="bolt" className="text-[20px]" />
            <span>Use Deal (₦9,600)</span>
          </button>
        </div>
      </main>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-canvas rounded-2xl p-space-lg w-full max-w-sm space-y-space-md shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center mx-auto">
              <Icon name="storefront" className="text-[28px]" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-heading-md text-heading-md text-on-surface font-semibold">
                {confirming === 'cancel' ? 'Cancel Claim?' : 'Confirm In-Store Redemption'}
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {confirming === 'cancel'
                  ? 'This voucher will be returned to the pool for other foodies. This cannot be undone.'
                  : `Make sure your server is ready to scan or note code ${CLAIM_CODE} before closing this session.`}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center"
              >
                {confirming === 'cancel' ? 'Yes, Cancel Claim' : 'Yes, Present Now'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="w-full h-10 rounded-xl bg-transparent text-on-surface-variant font-button-secondary text-button-secondary flex items-center justify-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
