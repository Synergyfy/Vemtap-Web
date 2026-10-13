import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopClaimedDealScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onContact: () => void;
  onReview: () => void;
  onCancelClaim: () => void;
}

const CLAIM_CODE = 'VT-48F261';
const CASHIER_PIN = '8821';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNsQYzlQAh9oju3O9Pp7b2OqE4Q1w9NTs0_fLXsac8VzxG06oD2NcwkkT8F3q8guxDTRfKEplRfmk3C-S9j62uAZ-X3SG4rkR3dDcngRx8sOpiwe5UeKWYk-lyy81904uUukw2Do3wMAOVj0Vg_7dv90NC6KTvhmoR0HFL6aPR56jOI4gZrX7w67mzbdQcgA44gm5lNRoAe6oGg6V1rNX8nBhjhfYCCBlRIssV7QqZImEOkPqpYnQDw';

const MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBRzuuVi9eFa4IfiKY-0CLXnUqZT2sbZNosW0fYczr-35iaT8YS48jMPhxX5FhnlpIT0M6U61-52cj6dPjBQzinsAIKVmlZpDUKfvnY7-G3LByd50m-xoQvFZg9A_dkudzO9jz0LRWmtKBN1qsOyrPwhv2R0EFtDw9bUTJM-yJ2xFm00pWt8sgDfxXVcbelWtpObOkpjajIiqRQK8pSgKgT2aPd465gP81ZRfUsDx5-0GtlsxHiafGQhg';

const DIRECTIONS_URL = 'https://www.google.com/maps/search/?api=1&query=Apo%20Boulevard%2C%20Abuja';

const REDEEM_STEPS: { title: string; body: ReactNode }[] = [
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
    body: (
      <>
        Show your QR Code or provide Claim Code <span className="font-semibold text-primary">{CLAIM_CODE}</span>.
      </>
    ),
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

const INCLUDED_ITEMS = [
  'Choice of Dry-aged Angus burger or marinated grilled chicken supreme',
  'Truffle parmesan hand-cut fries or garden crisp salad',
  'Cold-pressed peach cooler or signature hibiscus iced tea',
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

export function DesktopClaimedDealScreen({
  onNav,
  onBack,
  onContact,
  onReview,
  onCancelClaim,
}: DesktopClaimedDealScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<null | 'redeem' | 'cancel'>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const showToast = (message: string) => {
    setToast(message);
    timers.current.push(
      window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200),
    );
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(CLAIM_CODE).catch(() => undefined);
    setCopied(true);
    showToast(`Merchant Code Copied: ${CLAIM_CODE}`);
    timers.current.push(window.setTimeout(() => setCopied(false), 2000));
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
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <nav className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-tertiary">
              <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
                Home
              </button>
              <Icon name="chevron_right" className="text-[16px]" />
              <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
                My Deals
              </button>
              <Icon name="chevron_right" className="text-[16px]" />
              <span className="text-text-primary font-semibold">Claimed Deal Pass</span>
            </nav>

            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Share deal"
                type="button"
                onClick={sharePass}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-label-sm text-label-sm shadow-sm transition-colors"
              >
                <Icon name="share" className="text-[18px]" />
                <span>Share</span>
              </button>
              <button
                aria-label="More options"
                type="button"
                onClick={() => showToast('Pass options: report issue, redeem rules, cancel')}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-text-secondary hover:text-text-primary shadow-sm transition-colors"
              >
                <Icon name="more_vert" className="text-[20px]" />
              </button>
            </div>
          </div>

          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-1 rounded-full mb-space-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Active Claim • Ready to Use
              </span>
            </span>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">Claimed Deal Pass</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-space-2xs leading-relaxed">
              Your Urban Grill &amp; Bistro lunch combo is active — present the QR pass or claim code below to your
              server or cashier before billing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="flex flex-col gap-4 min-w-0">
              <div className="relative bg-surface-canvas rounded-2xl shadow-xl overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-surface-tint-blue blur-2xl pointer-events-none" />

                <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="inline-flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-1 rounded-full w-fit">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                      ACTIVE CLAIM • READY TO USE
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-text-secondary">
                    <Icon name="hourglass_top" className="text-[16px] text-primary" />
                    <span className="font-caption text-caption">Expires Oct 18, 2024 at 11:59 PM (in 2 days)</span>
                  </div>
                </div>

                <div className="p-space-md space-y-space-sm">
                  <div className="relative w-full h-56 lg:h-64 rounded-xl overflow-hidden">
                    <img className="w-full h-full object-cover" alt="Gourmet double beef burger platter" src={HERO_IMG} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-space-xs left-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-xs py-0.5 rounded-full flex items-center gap-1 text-primary shadow-sm">
                      <Icon name="local_fire_department" className="text-[16px]" />
                      <span className="font-label-sm text-label-sm font-semibold">20% Saved</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        Urban Grill &amp; Bistro
                      </span>
                      <Icon name="verified" className="text-[16px] text-primary" filled />
                    </div>
                    <h2 className="font-heading-md text-heading-md text-text-primary font-semibold tracking-tight">
                      20% Off Prime Lunch Gourmet Combo
                    </h2>
                    <div className="flex items-start gap-1 text-text-secondary mt-1">
                      <Icon name="pin_drop" className="text-[16px] mt-0.5 text-primary" />
                      <p className="font-caption text-caption">
                        Apo Boulevard Branch • Suite 12, Apo District, Abuja (0.8 km away)
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center justify-between">
                    <div>
                      <p className="font-caption text-caption text-text-secondary">Discounted Total</p>
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
                  <div className="w-full border-t border-dashed border-border-subtle mx-4" />
                  <div className="absolute -right-3 w-6 h-6 rounded-full bg-surface" />
                </div>

                <div className="p-space-md text-center space-y-space-sm bg-surface-subtle" ref={qrRef}>
                  <div className="inline-block p-space-sm bg-surface-canvas rounded-2xl shadow-sm">
                    <div className="w-56 h-56 mx-auto flex items-center justify-center relative bg-surface rounded-lg p-2">
                      <QrCodeArt />
                    </div>
                    <span className="inline-block mt-2 font-caption text-caption text-text-secondary font-medium">
                      Scan to Redeem Instantly
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-space-xs">
                    <div className="bg-surface-canvas p-space-xs rounded-xl flex flex-col items-center justify-center">
                      <span className="font-caption text-caption text-text-secondary">Merchant Code</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-heading-sm text-heading-sm font-bold text-text-primary tracking-wider">
                          {CLAIM_CODE}
                        </span>
                        <button
                          type="button"
                          onClick={copyCode}
                          title="Copy code"
                          aria-label="Copy claim code"
                          className="w-7 h-7 flex items-center justify-center text-primary rounded-full hover:bg-surface-tint-blue"
                        >
                          <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-surface-canvas p-space-xs rounded-xl flex flex-col items-center justify-center">
                      <span className="font-caption text-caption text-text-secondary">Cashier PIN</span>
                      <span className="font-heading-sm text-heading-sm font-bold text-primary mt-0.5 tracking-widest">
                        {CASHIER_PIN}
                      </span>
                    </div>
                  </div>

                  <p className="font-caption text-caption text-text-secondary px-space-sm">
                    Present this digital pass to your server or cashier before billing.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left pt-1">
                    <div className="p-3 rounded-xl bg-surface-canvas shadow-sm">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Pass Holder
                      </span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                        Zainab Ahmed
                      </p>
                      <p className="font-caption text-caption text-text-secondary">+234 803 555 0192</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-canvas shadow-sm">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Validity Window
                      </span>
                      <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                        Mon–Fri, 12:00 PM – 4:00 PM
                      </p>
                      <p className="font-caption text-caption text-error font-medium">
                        Expires Oct 18, 2024 at 11:59 PM
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-canvas text-left shadow-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        Included Items in this Claim
                      </span>
                      <span className="font-caption text-caption text-primary font-medium">3 of 3 Included</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 font-body-md text-body-md text-text-primary">
                      {INCLUDED_ITEMS.map((item) => (
                        <li className="flex items-center gap-2" key={item}>
                          <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
                          <span>
                            <strong>1x</strong> {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-tint-blue flex items-start gap-2 text-text-primary text-left">
                    <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
                    <p className="font-caption text-caption leading-relaxed">
                      <strong>Settlement Notice:</strong> Pay <strong>₦9,600</strong> directly to Urban Grill &amp;
                      Bistro cashier at redemption via card or cash. Zero upfront checkout fees charged by VEMTAP.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Claim Verification</h3>
                  <span className="bg-surface-container-high text-text-secondary px-2 py-0.5 rounded-full font-label-sm text-label-sm">
                    #CLM-982410
                  </span>
                </div>
                <div className="space-y-space-xs text-body-md font-body-md">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Claimed On</span>
                    <span className="text-text-primary font-medium text-caption">Oct 15, 2024 • 10:42 AM</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Claim Holder</span>
                    <div className="flex items-center gap-1">
                      <span className="text-text-primary font-medium text-caption">Zainab Ahmed</span>
                      <Icon name="verified_user" className="text-primary text-[14px]" filled />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Payment Mode</span>
                    <span className="text-text-primary font-medium text-caption text-right">
                      In-person (Cash / POS / Transfer)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-secondary font-caption text-caption">Usage Allocation</span>
                    <span className="bg-surface-tint-blue text-primary px-2 py-0.5 rounded-md font-label-sm text-label-sm font-medium">
                      Personal Use
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="verified" className="text-[18px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">How to Redeem</h3>
                    <p className="font-caption text-caption text-text-secondary">4 quick steps at the restaurant</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                  {REDEEM_STEPS.map((step, index) => (
                    <div
                      className="flex items-start gap-space-sm p-3 rounded-xl bg-surface-subtle"
                      key={step.title}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm font-semibold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-body-md text-body-md font-medium text-text-primary">{step.title}</p>
                        <p className="font-caption text-caption text-text-secondary">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-xs">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Terms &amp; Deal Rules</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-space-xs text-text-secondary font-caption text-caption">
                  {DEAL_RULES.map((rule) => (
                    <li className="flex items-center gap-2" key={rule.text}>
                      <Icon name={rule.icon} className="text-[16px] text-primary" />
                      <span>{rule.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-surface-canvas p-space-md shadow-sm space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold">
                      UG
                    </div>
                    <div>
                      <h4 className="font-heading-sm text-heading-sm text-text-primary">Urban Grill &amp; Bistro</h4>
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
                  <div className="bg-surface-canvas/90 backdrop-blur-md px-space-xs py-1 rounded-lg flex items-center gap-1 text-text-primary">
                    <Icon name="location_on" className="text-[16px] text-primary" />
                    <span className="font-caption text-caption font-semibold">0.8 km away • 4 mins drive</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-space-xs pt-1">
                  <a
                    href="tel:+2348000001234"
                    className="h-10 rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="call" className="text-[18px] text-primary" />
                    <span>Call Branch</span>
                  </a>
                  <button
                    type="button"
                    onClick={onContact}
                    className="h-10 rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="forum" className="text-[18px] text-primary" />
                    <span>In-App Chat</span>
                  </button>
                </div>
              </div>
            </div>

            <aside className="w-full flex flex-col gap-4 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
                    Pass Actions
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-semibold">Ready</span>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirming('redeem')}
                  className="h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md hover:bg-primary active:scale-[0.98] transition-all"
                >
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Use Deal Now (Confirm In-Store)</span>
                </button>

                <div className="grid grid-cols-2 gap-space-xs">
                  <button
                    type="button"
                    onClick={onContact}
                    className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="chat" className="text-[18px]" />
                    <span>Direct Chat</span>
                  </button>
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="directions" className="text-[18px]" />
                    <span>Get Directions</span>
                  </a>
                </div>

                <div className="h-px bg-border-subtle" />

                <div className="grid grid-cols-2 gap-space-xs">
                  <button
                    type="button"
                    onClick={showBarcode}
                    className="h-11 px-2 rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="qr_code_scanner" className="text-[20px]" />
                    <span>Barcode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming('redeem')}
                    className="h-11 px-2 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md hover:bg-primary active:scale-[0.98] transition-all"
                  >
                    <Icon name="bolt" className="text-[20px]" />
                    <span>Use Deal (₦9,600)</span>
                  </button>
                </div>

                <div className="h-px bg-border-subtle" />

                <div className="grid grid-cols-2 gap-space-xs">
                  <button
                    type="button"
                    onClick={sharePass}
                    className="h-10 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="share" className="text-[18px] text-primary" />
                    <span>Share Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={onReview}
                    className="h-10 rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="rate_review" className="text-[18px] text-primary" />
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

              <div className="px-4 py-3 rounded-xl bg-surface-tint-blue flex items-start gap-2">
                <Icon name="info" className="text-primary text-[18px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  In-person settlement: pay the discounted bill of <strong className="text-text-primary">₦9,600</strong>{' '}
                  at the checkout counter via card or cash.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-canvas rounded-2xl p-space-lg w-full max-w-sm space-y-space-md shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center mx-auto">
              <Icon name="storefront" className="text-[28px]" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-heading-md text-heading-md text-text-primary font-semibold">
                {confirming === 'cancel' ? 'Cancel Claim?' : 'Confirm In-Store Redemption'}
              </h4>
              <p className="font-body-md text-body-md text-text-secondary">
                {confirming === 'cancel'
                  ? 'This voucher will be returned to the pool for other foodies. This cannot be undone.'
                  : `Make sure your server is ready to scan or note code ${CLAIM_CODE} before closing this session.`}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center hover:bg-primary transition-colors"
              >
                {confirming === 'cancel' ? 'Yes, Cancel Claim' : 'Yes, Present Now'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="w-full h-10 rounded-xl bg-transparent text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center hover:text-text-primary transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-text-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </DesktopPage>
  );
}
