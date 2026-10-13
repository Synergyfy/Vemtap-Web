import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { CheckoutHubShell } from './CheckoutHubShell';

interface DesktopPosDisplayReceiptScreenProps {
  onDone?: () => void;
}

const RECEIPT_ITEMS: Array<{ name: string; detail: string; amount: string }> = [
  { name: 'Woodfire Ribeye 250g', detail: 'Medium Rare, Pepper sauce, Sea-salt finish', amount: '₦16,000.00' },
  { name: 'Double Smash Burger', detail: 'House craft smoked sauce, aged cheddar, dill pickles', amount: '₦6,500.00' },
  { name: 'Truffle Parm Fries', detail: 'Large portion, Grana Padano, White truffle oil drizzle', amount: '₦3,200.00' },
  { name: 'Passionfruit Mojito', detail: 'House craft signature, fresh crushed mint, cane soda', amount: '₦3,500.00' },
];

const RATING_LABELS: Record<number, string> = {
  1: '1.0 • Poor',
  2: '2.0 • Fair',
  3: '3.0 • Good',
  4: '4.0 • Very Good',
  5: '5.0 • Superb!',
};

const PRAISE_CHIPS = [
  '🔥 Ribeye Cooked to Perfection',
  '⚡ Ultra Fast POS Tap',
  '🙌 Server Sunday Was Great',
];

export function DesktopPosDisplayReceiptScreen({ onDone }: DesktopPosDisplayReceiptScreenProps) {
  const [whatsappOn, setWhatsappOn] = useState(true);
  const [emailOn, setEmailOn] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [forwardSent, setForwardSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [rating, setRating] = useState(5);
  const [starHint, setStarHint] = useState('Tap a star to leave instant praise');
  const [toast, setToast] = useState<string | null>(null);
  const recipientRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!forwardSent) return;
    const timeout = setTimeout(() => setForwardSent(false), 3500);
    return () => clearTimeout(timeout);
  }, [forwardSent]);

  useEffect(() => {
    if (!linkCopied) return;
    const timeout = setTimeout(() => setLinkCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [linkCopied]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleForward = () => {
    if (recipient.trim().length > 3) {
      setForwardSent(true);
      setRecipient('');
    } else {
      recipientRef.current?.focus();
    }
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText('https://pay.vemtap.com/r/TK-108-894210');
    setLinkCopied(true);
  };

  return (
    <CheckoutHubShell>
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface pb-space-3xl pt-space-xl">
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="pointer-events-none absolute top-20 -left-20 h-72 w-72 rounded-full bg-badge-discount-bg/80 blur-2xl" />

        <div className="relative mx-auto w-full max-w-7xl px-margin">
          {/* Status Banner / Confirmation Strip */}
          <section className="mb-space-xl rounded-2xl bg-surface-canvas p-space-lg shadow-sm">
            <div className="flex flex-col gap-space-lg lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-space-md">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-badge-discount-bg text-badge-discount-text shadow-sm">
                  <Icon name="check_circle" className="text-[36px]" filled />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-canvas shadow-sm">
                    <Icon name="contactless" className="text-primary text-[14px]" />
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <span className="font-heading-sm text-heading-sm font-bold text-on-surface">
                      Urban Grill &amp; Bistro
                    </span>
                    <span className="text-text-tertiary">•</span>
                    <span className="font-label-md text-label-md text-text-secondary">Order #TK-108</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-badge-discount-bg px-2.5 py-0.5 font-caption text-caption font-semibold text-badge-discount-text">
                      <span className="h-1.5 w-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                      Paid Just Now
                    </span>
                  </div>
                  <h1 className="mt-space-2xs font-display-hero text-display-hero font-bold tracking-tight text-on-surface">
                    PAYMENT CONFIRMED <span className="text-text-tertiary font-light">—</span>{' '}
                    <span className="text-primary">₦31,768.00</span>
                  </h1>
                  <div className="mt-space-xs flex flex-wrap items-center gap-x-space-md gap-y-1 font-caption text-caption text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="contactless" className="text-[16px] text-primary" />
                      Contactless Card Tap • Till 01 (Wuse II)
                    </span>
                    <span className="text-text-tertiary">•</span>
                    <span>
                      Ref: <strong className="font-medium text-on-surface">VEM-REC-894210</strong>
                    </span>
                    <span className="text-text-tertiary">•</span>
                    <span>
                      Auth: <strong className="font-medium text-on-surface">#990214</strong>
                    </span>
                    <span className="text-text-tertiary">•</span>
                    <span>Oct 17, 2024, 2:14 PM</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs self-start lg:self-center">
                <button
                  type="button"
                  onClick={() => setToast('Receipt PDF generated — download starting.')}
                  className="flex items-center gap-space-2xs rounded-xl bg-surface-tint-blue px-space-md py-2.5 font-button-secondary text-button-secondary text-primary transition-all hover:bg-primary hover:text-on-primary"
                >
                  <Icon name="download" className="text-[18px]" />
                  <span>Quick PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="flex items-center gap-space-2xs rounded-xl bg-surface-container-low px-space-md py-2.5 font-button-secondary text-button-secondary text-on-surface transition-all hover:bg-surface-container-high"
                >
                  <Icon name="share" className="text-[18px]" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </section>

          {/* Main Layout: 2 Columns (7 cols / 5 cols) */}
          <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
            {/* LEFT COLUMN: Detailed Digital Receipt Slip (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-space-lg">
              <div className="relative overflow-hidden rounded-2xl bg-surface-canvas p-space-xl shadow-md">
                {/* Perforation Deco at top edge */}
                <div className="absolute -top-3 left-0 right-0 flex justify-between px-3">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="h-3 w-3 rounded-full bg-surface" />
                  ))}
                </div>

                {/* Merchant Slip Top Bar */}
                <div className="flex flex-col gap-space-md md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-space-md">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                      <img
                        className="h-full w-full object-cover"
                        alt="Modern upscale bistro logo with hot ember typography and fork insignia on deep slate background"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTHRT_1hasSOvxmcyjFykwIFe3s6e_NgSVL9JctfmDCDUpEj3euauAmznLu3AP36fuVJhn7tsVY9pkMCSRm7cjrBT804LkflA5nBZ8JHGNZg-Kd52kojP9X3awKr5UvqCt_nKdfz0dVgiw9h9iV3lP33SeyKDwAiCaRpmQz0UwaQTajrFCht1djA-6h8Hq3JHta2b9xwfyXplVpMUZn1WPmQGNDpEElgpBFeeigBtNVof8--uMEeHJ0g"
                      />
                    </div>
                    <div>
                      <h2 className="font-heading-md text-heading-md font-bold text-on-surface">
                        Urban Grill &amp; Bistro
                      </h2>
                      <p className="font-body-md text-body-md text-text-secondary">
                        Plot 12 Ademola Adetokunbo Crescent, Wuse II, Abuja
                      </p>
                      <div className="mt-space-2xs flex flex-wrap items-center gap-x-space-sm font-caption text-caption text-text-tertiary">
                        <span>
                          TIN: <strong className="text-on-surface">TIN-88492019-01</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Cashier: <strong className="text-on-surface">Emeka O.</strong>
                        </span>
                        <span>•</span>
                        <span className="rounded bg-surface-container-low px-1.5 py-0.5 text-on-surface font-medium">
                          Table 04 (Dine-in)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-tint-blue px-3 py-1 font-label-sm text-label-sm font-semibold text-primary">
                      <Icon name="verified" className="text-[16px]" />
                      VEMTAP Certified
                    </span>
                    <span className="mt-1 font-caption text-caption text-text-tertiary">
                      POS Terminal ID: #POS-ABJ-09
                    </span>
                  </div>
                </div>

                {/* Receipt Meta Divider Block */}
                <div className="mt-space-lg rounded-xl bg-surface-subtle p-space-md">
                  <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-4 font-caption text-caption">
                    <div>
                      <span className="text-text-tertiary">Receipt No</span>
                      <div className="font-label-sm text-label-sm font-bold text-on-surface">TK-108-894210</div>
                    </div>
                    <div>
                      <span className="text-text-tertiary">Time Placed</span>
                      <div className="font-label-sm text-label-sm font-medium text-on-surface">01:42 PM</div>
                    </div>
                    <div>
                      <span className="text-text-tertiary">Payment Channel</span>
                      <div className="font-label-sm text-label-sm font-medium text-on-surface">Access POS / NFC</div>
                    </div>
                    <div>
                      <span className="text-text-tertiary">Fulfillment</span>
                      <div className="font-label-sm text-label-sm font-medium text-badge-discount-text">Completed</div>
                    </div>
                  </div>
                </div>

                {/* Ordered Items Section */}
                <div className="mt-space-xl">
                  <div className="flex items-center justify-between pb-space-xs font-label-md text-label-md font-semibold text-text-tertiary uppercase tracking-wider">
                    <span>Ordered Items</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex flex-col gap-space-sm mt-space-xs">
                    {RECEIPT_ITEMS.map((item) => (
                      <div
                        key={item.name}
                        className="group flex items-start justify-between rounded-xl p-space-sm transition-colors hover:bg-surface-container-low/60"
                      >
                        <div className="flex items-start gap-space-sm">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container font-label-sm text-label-sm font-bold text-primary">
                            1×
                          </span>
                          <div>
                            <div className="font-heading-sm text-heading-sm font-semibold text-on-surface">
                              {item.name}
                            </div>
                            <div className="font-caption text-caption text-text-secondary">{item.detail}</div>
                          </div>
                        </div>
                        <div className="font-heading-sm text-heading-sm font-bold text-on-surface">{item.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Totals Ledger */}
                <div className="mt-space-lg rounded-2xl bg-surface-subtle p-space-lg">
                  <div className="flex flex-col gap-space-xs font-body-md text-body-md text-text-secondary">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-on-surface">₦29,200.00</span>
                    </div>
                    <div className="flex items-center justify-between text-badge-discount-text">
                      <span className="flex items-center gap-1 font-medium">
                        <Icon name="local_offer" className="text-[16px]" />
                        VEMTAP Member Perk (5% OFF)
                      </span>
                      <span className="font-bold">-₦1,572.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>VAT (7.5% Fed Inland Revenue)</span>
                      <span className="font-medium text-on-surface">₦2,072.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Icon name="favorite" className="text-[16px] text-tertiary" />
                        Staff Tip (15% to Sunday M.)
                      </span>
                      <span className="font-medium text-on-surface">+₦4,140.00</span>
                    </div>
                  </div>

                  {/* Primary Net Line */}
                  <div className="mt-space-md rounded-xl bg-surface-canvas p-space-md shadow-sm">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-bold">
                          NET TOTAL PAID
                        </div>
                        <div className="mt-1 flex items-center gap-space-2xs font-caption text-caption text-text-secondary">
                          <Icon name="credit_card" className="text-primary text-[18px]" />
                          Card ending in •• 4092 (Stanbic IBTC)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display-hero-mobile text-display-hero-mobile font-bold text-primary">
                          ₦31,768.00
                        </div>
                        <span className="font-caption text-caption text-badge-discount-text font-semibold">
                          Payment Settled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature & Auth Footer inside slip */}
                <div className="mt-space-lg flex flex-col items-center justify-between gap-space-sm sm:flex-row font-caption text-caption text-text-tertiary">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="shield" className="text-[16px] text-primary" />
                    <span>Cryptographically Signed by VEMTAP Merchant HSM</span>
                  </div>
                  <div>STAN: 009214 • RRN: 8942103301</div>
                </div>
              </div>

              {/* Merchant Details Mini-Card */}
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-canvas text-primary shadow-sm">
                    <Icon name="restaurant" className="text-[20px]" />
                  </div>
                  <div>
                    <div className="font-label-md text-label-md font-semibold text-on-surface">
                      Questions regarding this meal?
                    </div>
                    <div className="font-caption text-caption text-text-secondary">
                      Urban Grill &amp; Bistro Concierge: +234 9 291 4402 • concierge@urbangrillabj.com
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setToast('Concierge contact card shared to your device.')}
                  className="rounded-lg bg-surface-canvas px-3 py-1.5 font-label-sm text-label-sm font-semibold text-on-surface shadow-sm hover:bg-surface-tint-blue"
                >
                  Contact
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Loyalty Rewards, Dispatch & Feedback (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              {/* Loyalty Points Credited Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container p-space-lg text-on-primary shadow-md">
                <div className="pointer-events-none absolute -right-6 -bottom-6 h-36 w-36 rounded-full bg-white/10 blur-xl" />
                <div className="relative flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="inline-flex items-center gap-1 font-caption text-caption uppercase tracking-wider text-on-primary/80 font-bold">
                      <Icon name="stars" className="text-[14px]" />
                      VEMTAP Rewards Club
                    </span>
                    <div className="mt-space-xs font-heading-lg text-heading-lg font-bold text-on-primary">
                      +318 Points Credited
                    </div>
                  </div>
                  <span className="rounded-full bg-on-primary/20 px-3 py-1 font-label-sm text-label-sm font-bold backdrop-blur-md">
                    Tier Gold
                  </span>
                </div>
                <div className="mt-space-md flex items-center justify-between rounded-xl bg-black/15 p-space-sm backdrop-blur-sm">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-on-primary/80">Updated Balance</span>
                    <span className="font-heading-sm text-heading-sm font-bold text-on-primary">2,768 pts</span>
                  </div>
                  <div className="text-right">
                    <span className="font-caption text-caption text-on-primary/80">Next Reward</span>
                    <span className="font-label-sm text-label-sm font-semibold text-on-primary block">
                      Free Cocktail at 3,000 pts
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-space-sm flex flex-col gap-1">
                  <div className="flex justify-between font-caption text-caption text-on-primary/80">
                    <span>92% to Platinum status</span>
                    <span>232 pts needed</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-on-primary/20">
                    <div
                      className="h-full rounded-full bg-on-primary transition-all duration-700"
                      style={{ width: '92.2%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Send Copy of E-Receipt */}
              <div className="rounded-2xl bg-surface-canvas p-space-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="send_to_mobile" className="text-primary text-[22px]" />
                    <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">Dispatch E-Receipt</h3>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">Real-time Delivery</span>
                </div>

                <div className="mt-space-md flex flex-col gap-space-sm">
                  {/* WhatsApp Option (Checked) */}
                  <button
                    type="button"
                    onClick={() => setWhatsappOn((on) => !on)}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-surface-subtle p-space-sm transition-all hover:bg-surface-tint-blue/40 text-left"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-badge-discount-bg text-badge-discount-text">
                        <Icon name="chat" className="text-[20px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
                          WhatsApp Dispatch
                          <span className="rounded bg-badge-discount-bg px-1.5 py-0.2 font-caption text-caption font-bold text-badge-discount-text">
                            Auto-queued
                          </span>
                        </div>
                        <div className="font-caption text-caption text-text-secondary">
                          +234 803 219 8831 (Default)
                        </div>
                      </div>
                    </div>
                    {whatsappOn && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
                        <Icon name="check" className="text-[16px]" />
                      </div>
                    )}
                  </button>

                  {/* Email Option (Checked) */}
                  <button
                    type="button"
                    onClick={() => setEmailOn((on) => !on)}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-surface-subtle p-space-sm transition-all hover:bg-surface-tint-blue/40 text-left"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tint-blue text-primary">
                        <Icon name="mail" className="text-[20px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
                          Email Statement
                          <span className="rounded bg-surface-container-high px-1.5 py-0.2 font-caption text-caption font-medium text-text-secondary">
                            Verified
                          </span>
                        </div>
                        <div className="font-caption text-caption text-text-secondary">michael.j@example.com</div>
                      </div>
                    </div>
                    {emailOn && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
                        <Icon name="check" className="text-[16px]" />
                      </div>
                    )}
                  </button>

                  {/* Forward to another recipient */}
                  <div className="mt-space-xs flex flex-col gap-space-2xs">
                    <span className="font-caption text-caption text-text-secondary font-medium">
                      Forward copy to accountant or guest:
                    </span>
                    <div className="flex items-center gap-space-xs">
                      <div className="relative flex-1">
                        <Icon
                          name="alternate_email"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary"
                        />
                        <input
                          ref={recipientRef}
                          className="w-full rounded-xl bg-surface-subtle py-2.5 pl-9 pr-3 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
                          onChange={(event) => setRecipient(event.target.value)}
                          placeholder="colleague@domain.com or phone"
                          type="email"
                          value={recipient}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleForward}
                        className="flex h-[42px] items-center justify-center rounded-xl bg-primary px-space-md font-button-secondary text-button-secondary font-semibold text-on-primary shadow-sm transition-all hover:bg-surface-tint active:scale-95"
                      >
                        Send
                      </button>
                    </div>
                    <div
                      className={`${forwardSent ? '' : 'hidden'} text-badge-discount-text font-caption text-caption mt-1`}
                    >
                      Receipt copy dispatched successfully!
                    </div>
                  </div>
                </div>

                {/* Document Actions Row */}
                <div className="mt-space-md grid grid-cols-2 gap-space-xs pt-space-xs">
                  <button
                    type="button"
                    onClick={() => setToast('Receipt PDF generated — download starting.')}
                    className="flex items-center justify-center gap-space-2xs rounded-xl bg-surface-container-low py-3 font-button-secondary text-button-secondary font-semibold text-on-surface transition-all hover:bg-surface-container-high"
                  >
                    <Icon name="picture_as_pdf" className="text-[18px] text-primary" />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="flex items-center justify-center gap-space-2xs rounded-xl bg-surface-container-low py-3 font-button-secondary text-button-secondary font-semibold text-on-surface transition-all hover:bg-surface-container-high"
                  >
                    <Icon
                      name={linkCopied ? 'check' : 'link'}
                      className={`text-[18px] ${linkCopied ? 'text-badge-discount-text' : 'text-secondary'}`}
                    />
                    {linkCopied ? 'Link Copied!' : 'Share Link'}
                  </button>
                </div>
              </div>

              {/* Rate Your Experience (Interactive 5-star module) */}
              <div className="rounded-2xl bg-surface-canvas p-space-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">Rate Urban Grill</h3>
                    <p className="font-caption text-caption text-text-secondary">{starHint}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-tertiary-container">
                    <Icon name="reviews" className="text-[20px]" />
                  </div>
                </div>
                <div className="mt-space-md flex items-center justify-between rounded-xl bg-surface-subtle px-space-md py-space-sm">
                  <div className="flex items-center gap-2 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRating(star);
                          setStarHint('Feedback registered. Thank you!');
                        }}
                        className={`transition-transform hover:scale-110 ${
                          star <= rating ? 'text-primary' : 'text-text-tertiary'
                        }`}
                      >
                        <Icon name="star" className="text-[32px]" filled={star <= rating} />
                      </button>
                    ))}
                  </div>
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {RATING_LABELS[rating]}
                  </span>
                </div>
                <div className="mt-space-xs flex flex-wrap gap-1.5">
                  {PRAISE_CHIPS.map((chip) => (
                    <span
                      key={chip}
                      className="cursor-pointer rounded-full bg-surface-container-low px-2.5 py-1 font-caption text-caption font-medium text-text-secondary hover:bg-surface-tint-blue hover:text-primary transition-colors"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Flow Terminal Action */}
              <div className="flex flex-col gap-space-xs">
                <button
                  type="button"
                  onClick={onDone}
                  className="flex h-[54px] w-full items-center justify-center gap-space-xs rounded-2xl bg-primary font-button-primary text-button-primary text-on-primary shadow-lg shadow-primary-container/25 transition-all hover:bg-surface-tint active:scale-[0.98]"
                >
                  <span>Done / Return to Home</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
                <div className="flex items-center justify-center gap-space-xs text-center font-caption text-caption text-text-tertiary pt-space-2xs">
                  <Icon name="history" className="text-[14px]" />
                  <span>This receipt is permanently synced to your VEMTAP transaction vault</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Institutional Footer Ribbon */}
          <section className="mt-space-2xl rounded-2xl bg-surface-container-lowest p-space-md text-center shadow-sm">
            <div className="flex flex-col items-center justify-between gap-space-xs md:flex-row font-caption text-caption text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Icon name="verified_user" className="text-badge-discount-text text-[18px]" />
                <span className="font-semibold text-on-surface">Government Compliant E-Receipt</span>
                <span>• Verified by VEMTAP Merchant Cloud • FIRS Electronic Stamp Valid</span>
              </div>
              <div className="flex items-center gap-space-sm font-mono text-text-tertiary">
                <span>Session #894-WUSE</span>
                <span>•</span>
                <span>Nonce: 0x90BF412A</span>
              </div>
            </div>
          </section>

          {toast && (
            <div className="fixed bottom-6 right-6 z-50 px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm shadow-lg">
              {toast}
            </div>
          )}
        </div>
      </div>
    </CheckoutHubShell>
  );
}
