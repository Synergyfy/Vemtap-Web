import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { CheckoutHubShell } from './CheckoutHubShell';
import { apiErrorMessage } from '../../services/errorMessages';
import { useLiveDisplay } from '../posLive';

interface DesktopPosDisplayTipScreenProps {
  onProceed?: () => void;
}

const SUBTOTAL = 27628;

const TIP_PRESETS: Array<{ id: string; label: string; percent: number; amount: number; caption: string; captionClass: string; popular?: boolean }> = [
  { id: 'none', label: 'No Tip', percent: 0, amount: 0, caption: 'Skip tip', captionClass: 'text-text-tertiary' },
  { id: 'p10', label: '10% • Good', percent: 10, amount: 2760, caption: 'Support staff', captionClass: 'text-text-secondary' },
  { id: 'p15', label: '15% • Great', percent: 15, amount: 4140, caption: 'Recommended', captionClass: 'text-on-primary/75', popular: true },
  { id: 'p20', label: '20% • Exceptional', percent: 20, amount: 5525, caption: 'Generous host', captionClass: 'text-badge-discount-text' },
];

const RATING_FEEDBACKS = [
  '"Needs attention"',
  '"Satisfactory visit"',
  '"Good experience"',
  '"Very pleasant service!"',
  '"Flawless dining experience!"',
];

const FEEDBACK_TAGS: Array<{ id: string; label: string; defaultActive: boolean }> = [
  { id: 'food', label: 'Delicious Food 🥩', defaultActive: true },
  { id: 'service', label: 'Super Fast Service ⚡', defaultActive: true },
  { id: 'ambiance', label: 'Great Ambiance ✨', defaultActive: true },
  { id: 'staff', label: 'Friendly Staff 😊', defaultActive: false },
  { id: 'clean', label: 'Clean Space 🌿', defaultActive: false },
];

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export function DesktopPosDisplayTipScreen({ onProceed }: DesktopPosDisplayTipScreenProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('p15');
  const [customTip, setCustomTip] = useState<number | null>(null);
  const [tipAmount, setTipAmount] = useState(4140);
  const [tipPercent, setTipPercent] = useState(15);
  const [rating, setRating] = useState(5);
  const [activeTags, setActiveTags] = useState<string[]>(
    FEEDBACK_TAGS.filter((tag) => tag.defaultActive).map((tag) => tag.id),
  );
  const [paymentState, setPaymentState] = useState<'idle' | 'authorizing' | 'sent'>('idle');
  const customInputRef = useRef<HTMLInputElement>(null);

  const display = useLiveDisplay();
  const live = display.live;
  const [toast, setToast] = useState<string | null>(null);
  const subtotal = live ? display.total : SUBTOTAL;
  // Live: the business's tip presets, after "No Tip".
  const tipPresets = live
    ? [
        TIP_PRESETS[0],
        ...display.tipOptions.map((option, index) => ({
          ...TIP_PRESETS[Math.min(index + 1, TIP_PRESETS.length - 1)],
          id: `p${option.percent}`,
          label: `${option.percent}%`,
          percent: option.percent,
          amount: option.amount,
        })),
      ]
    : TIP_PRESETS;

  // Live: start with no tip rather than the demo's 15%.
  useEffect(() => {
    if (!live) return;
    setSelectedPreset('none');
    setTipPercent(0);
    setTipAmount(0);
  }, [live]);

  const total = subtotal + tipAmount;

  useEffect(() => {
    if (paymentState !== 'authorizing') return;
    if (live) {
      // Live: save the tip and rating against this till, then hand over to pay.
      if (tipAmount === 0) {
        setPaymentState('sent');
        return;
      }
      display
        .sendTip(tipAmount, rating)
        .then(() => setPaymentState('sent'))
        .catch((error: unknown) => {
          setPaymentState('idle');
          setToast(apiErrorMessage(error, 'Could not save the tip.'));
          window.setTimeout(() => setToast(null), 3000);
        });
      return;
    }
    const timeout = setTimeout(() => setPaymentState('sent'), 1200);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentState]);

  useEffect(() => {
    if (paymentState !== 'sent') return;
    const timeout = setTimeout(() => onProceed?.(), 900);
    return () => clearTimeout(timeout);
  }, [paymentState, onProceed]);

  const selectPreset = (id: string, percent: number, amount: number) => {
    setSelectedPreset(id);
    setCustomTip(null);
    setTipPercent(percent);
    setTipAmount(amount);
    if (customInputRef.current) customInputRef.current.value = '';
  };

  const applyCustomTip = (value: string) => {
    const custom = parseFloat(value) || 0;
    setSelectedPreset('');
    setCustomTip(custom);
    setTipPercent(0);
    setTipAmount(custom);
  };

  const skipTip = () => {
    setSelectedPreset('none');
    setCustomTip(null);
    setTipPercent(0);
    setTipAmount(0);
    onProceed?.();
  };

  const toggleTag = (id: string) => {
    setActiveTags((tags) => (tags.includes(id) ? tags.filter((tag) => tag !== id) : [...tags, id]));
  };

  const tipLabel =
    customTip !== null ? 'Custom Tip' : tipPercent === 0 ? 'Tip (None)' : `Tip Amount (${tipPercent}%)`;

  const isPresetActive = (id: string) => selectedPreset === id && customTip === null;

  return (
    <CheckoutHubShell>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-md">
        {/* Top Merchant Status & Server Recognition Banner */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-sm shrink-0">
              <img
                className="w-full h-full object-cover"
                alt="Warm portrait of a smiling African male head waiter named Sunday wearing a neat bistro apron in a warm ambient Abuja restaurant, soft rim lighting, ultra-high resolution"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPeohLHuBlm9Ndg8yYMcCv-BuLjtasTTzi0lb3chn-qUfCADk1wrn4zf_zk4owBS1p1Hu9NbQcHt1sWlwNJWjGbg75eJfXfNKLyU6v2ah5odf99Y3g_u2b1455t8RKs9gqGQLU7-2-7bDa-dFHlOhOpzG5ZadPGA7HB7RFlQ4_vHHhyC7-mAvEsf8PgC1B2kaN8crhSesueNanKi3_SINxj0zswqDImTHwcv-3irc4aU9dfFBmsh1TOQ"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-badge-discount-text rounded-full ring-2 ring-surface-container-lowest flex items-center justify-center">
                <Icon name="check" className="text-[10px] text-on-primary" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                  {live ? display.venueName : 'Sunday M. & Kitchen Crew'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                  VEMTAP CFD Active
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                {live ? display.whereLine : 'Urban Grill & Bistro #01'} • Order{' '}
                <span className="font-semibold text-text-primary">
                  #{live ? (display.ticket?.reference ?? '—') : 'TK-108'}
                </span>
                {live ? (display.ticket?.tableNumber ? ` • Table ${display.ticket.tableNumber}` : '') : ' • Table 04 (Dine-in)'}
              </p>
              <p className="font-caption text-caption text-primary flex items-center gap-1 mt-0.5">
                <Icon name="volunteer_activism" className="text-[14px]" />
                {live ? '100% of staff tips go directly to the team.' : '100% of staff tips go directly to Sunday and the Abuja culinary crew.'}
              </p>
            </div>
          </div>
          {/* Quick Subtotal Anchor */}
          <div className="flex md:flex-col items-center md:items-end justify-between bg-surface-container-low px-space-md py-space-xs rounded-lg shrink-0">
            <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
              Order Subtotal
            </span>
            <span className="font-heading-md text-heading-md text-text-primary font-bold">
              {naira(subtotal)}<span className="font-caption text-caption font-normal text-text-secondary">.00</span>
            </span>
          </div>
        </div>

        {/* 2-Column Split: Left Tip Selection Matrix | Right Rating & Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          {/* LEFT COLUMN: Tip Preset Matrix & Live Computation */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="savings" className="text-primary text-[22px]" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">Add a Tip</h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm font-semibold text-text-secondary">
                    Currency: ₦ (NGN)
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary mb-space-md">
                  Optional gesture for dedicated floor service &amp; culinary craft.
                </p>

                {/* Tip Presets Grid */}
                <div className="grid grid-cols-2 gap-space-sm mb-space-md">
                  {tipPresets.map((preset) => {
                    const active = isPresetActive(preset.id);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectPreset(preset.id, preset.percent, preset.amount)}
                        className={`relative flex flex-col items-start justify-between p-space-md rounded-xl text-left transition-all duration-150 ${
                          active
                            ? 'bg-primary text-on-primary shadow-[0_8px_20px_-4px_rgba(0,85,196,0.3)] scale-[1.01]'
                            : 'bg-surface-container-low hover:bg-surface-container'
                        }`}
                      >
                        {active && preset.popular && (
                          <div className="absolute -top-2.5 right-3 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-caption text-caption font-bold shadow-sm flex items-center gap-1">
                            <Icon name="star" className="text-[12px] text-tertiary-container" filled />
                            Popular
                          </div>
                        )}
                        <span
                          className={`font-label-sm text-label-sm ${active ? 'text-on-primary/80' : 'text-text-secondary'}`}
                        >
                          {preset.label}
                        </span>
                        <span
                          className={`font-heading-sm text-heading-sm font-bold mt-space-xs ${
                            active ? 'text-on-primary' : 'text-text-primary'
                          }`}
                        >
                          {naira(preset.amount)}
                        </span>
                        <span
                          className={`font-caption text-caption mt-0.5 ${
                            active ? 'text-on-primary/75' : preset.captionClass
                          }`}
                        >
                          {preset.caption}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tip Input */}
                <div className="bg-surface-container-low rounded-xl p-space-sm mb-space-md flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs flex-1">
                    <Icon name="edit" className="text-text-tertiary text-[20px]" />
                    <input
                      ref={customInputRef}
                      className="w-full bg-transparent font-label-md text-label-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
                      onChange={(event) => applyCustomTip(event.target.value)}
                      placeholder="Enter Custom Amount (₦)..."
                      type="number"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      customInputRef.current?.focus();
                      if (customInputRef.current?.value) applyCustomTip(customInputRef.current.value);
                    }}
                    className="px-space-sm py-1.5 rounded-lg bg-surface-canvas text-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-surface-tint-blue"
                  >
                    Apply →
                  </button>
                </div>
              </div>

              {/* Realtime Bill Breakdown */}
              <div className="bg-surface rounded-xl p-space-md mt-auto shadow-inner">
                <div className="flex justify-between items-center py-1">
                  <span className="font-body-md text-body-md text-text-secondary">Meal Subtotal</span>
                  <span className="font-body-md text-body-md text-text-primary font-medium">{naira(subtotal)}.00</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-body-md text-body-md text-primary font-medium">{tipLabel}</span>
                  <span className="font-body-md text-body-md text-primary font-bold">
                    {tipAmount > 0 ? `+${naira(tipAmount)}.00` : '₦0.00'}
                  </span>
                </div>
                <div className="h-px bg-surface-container-highest my-space-xs" />
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="font-heading-sm text-heading-sm text-text-primary font-bold block">
                      Total Payable
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">
                      VAT &amp; Consumption Tax inclusive
                    </span>
                  </div>
                  <span className="font-heading-md text-heading-md text-primary font-bold">
                    {naira(total)}.00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Rating, Compliments & Rewards */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between h-full">
              <div>
                {/* Header & Outlet Badge */}
                <div className="flex items-start justify-between mb-space-xs">
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">Rate Your Visit</h2>
                    <p className="font-body-md text-body-md text-text-secondary">
                      {live ? display.whereLine : 'Urban Grill & Bistro • Wuse II Branch'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold">
                    <Icon name="star" className="text-[16px]" filled />
                    5.0 Verified
                  </div>
                </div>

                {/* Star Rating Visual */}
                <div className="bg-surface-container-low rounded-xl p-space-md my-space-md flex flex-col items-center justify-center text-center">
                  <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-tertiary mb-space-xs">
                    Tap Stars to Update Rating
                  </span>
                  <div className="flex items-center gap-space-xs cursor-pointer select-none">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-transform hover:scale-110 active:scale-95 ${
                          star <= rating ? 'text-tertiary-container' : 'text-outline-variant'
                        }`}
                      >
                        <Icon name="star" className="text-[36px]" filled={star <= rating} />
                      </button>
                    ))}
                  </div>
                  <span className="font-label-md text-label-md text-text-primary font-semibold mt-space-xs">
                    {RATING_FEEDBACKS[rating - 1]}
                  </span>
                </div>

                {/* Standout Feedback Tags */}
                <div className="mb-space-md">
                  <label className="font-label-sm text-label-sm text-text-secondary font-medium block mb-space-xs">
                    What stood out most?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_TAGS.map((tag) => {
                      const active = activeTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-2 rounded-full transition-all ${
                            active
                              ? 'bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold shadow-sm'
                              : 'bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-medium hover:bg-surface-container'
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Featured Dish Praise Card */}
                <div className="bg-surface rounded-xl p-space-sm mb-space-md flex items-center gap-space-sm">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 shadow-sm">
                    <img
                      className="w-full h-full object-cover"
                      alt="Plated gourmet smoked Asun Ribeye steak with fragrant smoky Nigerian jollof rice garnished with fresh micro herbs on a dark ceramic bistro plate, warm lighting, food photography"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBzzO9Yi1OkBLXwE7SQv7ae7RzZCXUSw1LGGStOs_kHkNkHh8DgLeJUCn4I_4FKP8Ib6JXGmPJSqGGEhxbxGgZ7LZqtHa4agDBv_6-9mMOYv-xo-N7LokOYWRYBGZMx0atPGPrBI3U_W3bWWNcmyw9LRICMGzx0SKbE_DljvJ_GF1AeIzWXpGkWhhkHnFqUuf4NeytwwDyxmRvsNoH65AaZArx2BxUJP28e_9hHEOPfgYP49TVsxLDsw"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-caption text-caption text-text-tertiary uppercase font-semibold">
                      Ordered Highlight
                    </span>
                    <span className="font-label-md text-label-md font-bold text-text-primary truncate">
                      Smoked Asun Ribeye &amp; Jollof
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                      <Icon name="thumb_up" className="text-[14px]" /> Signature wood-fired perfection
                    </span>
                  </div>
                </div>
              </div>

              {/* Bonus Points Gamification Callout */}
              <div className="bg-gradient-to-r from-surface-tint-blue via-secondary-container/40 to-surface-tint-blue rounded-xl p-space-md flex items-center gap-space-sm mt-auto shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(6,108,244,0.3)]">
                  <Icon name="stars" className="text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md font-bold text-text-primary flex items-center gap-1">
                    +50 Bonus VEMTAP Points
                    <Icon name="lock_open" className="text-[16px] text-badge-discount-text" />
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    Reward unlocked for sharing your Abuja dining experience!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Master Action Deck */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-lg mt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center shrink-0 text-text-secondary">
              <Icon name="contactless" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-tertiary uppercase font-semibold">
                Ready for customer payment
              </span>
              <span className="font-label-md text-label-md font-bold text-text-primary">
                Contactless POS / Card / VEMTAP Pay
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
            {/* Secondary Escape Hatch */}
            <button
              type="button"
              onClick={skipTip}
              className="w-full sm:w-auto px-space-lg py-3.5 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary font-semibold hover:bg-surface-container transition-all active:scale-[0.98]"
            >
              Skip &amp; Pay Subtotal ({naira(subtotal)})
            </button>
            {/* Primary High-Contrast Proceed Button */}
            <button
              type="button"
              onClick={() => paymentState === 'idle' && setPaymentState('authorizing')}
              className={
                paymentState === 'sent'
                  ? 'w-full sm:w-auto px-space-xl py-3.5 rounded-xl bg-badge-discount-text text-on-primary font-button-primary text-button-primary font-bold shadow-md flex items-center justify-center gap-space-xs'
                  : 'w-full sm:w-auto px-space-xl py-3.5 rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary font-bold shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-space-xs'
              }
            >
              {paymentState === 'idle' && (
                <>
                  <span>Confirm &amp; Proceed to Pay ({naira(total)})</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </>
              )}
              {paymentState === 'authorizing' && (
                <>
                  <Icon name="sync" className="text-[18px] animate-spin" />
                  <span>Authorizing {naira(total)}...</span>
                </>
              )}
              {paymentState === 'sent' && (
                <>
                  <Icon name="done_all" className="text-[18px]" />
                  <span>Terminal Prompt Sent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-on-surface-inverse px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
          {toast}
        </div>
      )}
    </CheckoutHubShell>
  );
}
