import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { SubscriptionChrome } from './SubscriptionChrome';

interface DesktopSubscriptionEndingScreenProps {
  onBack: () => void;
  onContinue: () => void;
  onReviewBusiness: () => void;
}

const KEEP_BENEFITS = [
  'Keep your business profile & storefront active',
  'Keep your deals visible to local shoppers',
  'Keep managing your branch locations (Apo & Wuse II)',
  'Continue engaging customers via direct in-app chat',
  'Continue using analytics, QR tap codes & loyalty tools',
];

const METRIC_CARDS = [
  { icon: 'near_me', label: 'Monthly impressions', value: '12.4k' },
  { icon: 'local_offer', label: 'Deal claims (trial)', value: '318' },
  { icon: 'groups', label: 'Returning customers', value: '42%' },
];

const FAQS = [
  {
    q: 'What happens on day 30?',
    a: 'Growth features pause. Your data stays safe and reactivates instantly on subscribe.',
  },
  {
    q: 'Can I switch to annual?',
    a: 'Yes — annual billing saves ₦1,000/month (₦4,000/mo billed yearly).',
  },
  {
    q: 'Will customers notice?',
    a: 'Your profile stays visible in read-only form, but deals and messaging pause.',
  },
  {
    q: 'How do I pay?',
    a: 'Paystack / Flutterwave cards, bank transfer, USSD, Apple Pay or Google Pay.',
  },
];

const STORE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCf1bbGzmyknuRv6JJjZob16_tE3Rl83Fln41x6CqCXX8OVvYrxsHkmLDBBx89eBWIpmX18hXeGHaxIYD6ydAk_ZlxHQE82eaGn76pyXv_pBIyg66F46WT1wkBg-MKWxOoOgGYeT15wOcB3A7r-jL4Lx64FAulOZQLYvRmn782nf7chBB0qof3mzi8yHrjHtslTRpb2k8P1NF36d8VSt8rIvZsuX_0QzeVoctjvJugy4flJq-BEgPmOwg';
const STORE_ALT =
  'Warm welcoming modern coffee roastery and artisan bakery storefront interior in Abuja Nigeria with natural warm wood accents, lush indoor plants, clean brass tap counter, vibrant local patrons having brunch under gentle morning sunlight in crisp retail aesthetics.';

export function DesktopSubscriptionEndingScreen({
  onBack,
  onContinue,
  onReviewBusiness,
}: DesktopSubscriptionEndingScreenProps) {
  const [paying, setPaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const handleRenew = () => {
    if (paying) return;
    setPaying(true);
    timer.current = window.setTimeout(() => onContinue(), 2400);
  };

  return (
    <SubscriptionChrome onBrand={onBack} activeNav="billing" breadcrumb="Trial Ending">
      <div className="max-w-6xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-lg">
        <section className="relative overflow-hidden rounded-xl bg-tertiary-fixed p-space-lg shadow-sm">
          <div className="flex items-start gap-space-md">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0 text-tertiary">
              <Icon name="hourglass_top" filled className="text-[26px]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-heading-md text-heading-md font-semibold text-on-tertiary-fixed leading-snug block">
                Your VEMTAP trial is ending
              </span>
              <p className="font-body-md text-body-md text-on-tertiary-fixed-variant leading-relaxed mt-space-2xs">
                Your free trial ends in <span className="font-bold text-tertiary">3 days</span> (Oct 21, 2024). Keep
                your momentum going without losing store visibility.
              </p>
            </div>
            <svg className="shrink-0" height="72" viewBox="0 0 72 72" width="72" aria-hidden="true">
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="7" />
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="currentColor"
                className="text-tertiary"
                strokeDasharray={`${0.9 * 2 * Math.PI * 30} ${2 * Math.PI * 30}`}
                strokeLinecap="round"
                strokeWidth="7"
                transform="rotate(-90 36 36)"
              />
              <text className="fill-tertiary" fontSize="14" fontWeight="700" textAnchor="middle" x="36" y="41">
                90%
              </text>
            </svg>
          </div>
          <div className="mt-space-sm pt-space-sm flex items-center justify-between border-t border-tertiary/10">
            <div className="flex items-center gap-space-2xs text-on-tertiary-fixed-variant">
              <Icon name="event_available" className="text-[15px] text-tertiary" />
              <span className="font-caption text-caption">Day 27 of 30 completed</span>
            </div>
            <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full font-caption text-caption font-bold bg-tertiary text-on-tertiary">
              3 Days Left
            </span>
          </div>
        </section>

        <section className="rounded-xl bg-surface-subtle p-space-md shadow-sm border border-border-subtle/50 flex items-center gap-space-md">
          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
            <img alt={STORE_ALT} className="w-full h-full object-cover" src={STORE_IMG} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption text-badge-discount-text uppercase tracking-wider font-semibold">
                Live Storefronts
              </span>
            </div>
            <p className="font-heading-sm text-heading-sm font-semibold text-text-primary truncate">
              Koffee &amp; Co. Roasters
            </p>
            <p className="font-label-sm text-label-sm text-text-secondary truncate mt-space-2xs">
              Apo Resettlement • Wuse II Branch
            </p>
          </div>
          <span className="font-caption text-caption text-text-secondary shrink-0">2 active branches</span>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <section className="rounded-xl bg-surface-canvas p-space-lg shadow-sm border border-border-subtle/60">
              <h2 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">
                Continue with VEMTAP Growth
              </h2>
              <div className="flex flex-col gap-space-xs">
                {KEEP_BENEFITS.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-space-sm rounded-lg bg-surface-subtle px-space-sm py-space-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                      <Icon name="check" filled className="text-badge-discount-text text-[14px]" />
                    </div>
                    <span className="font-label-sm text-label-sm text-text-primary">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-space-md flex items-start gap-space-sm rounded-xl bg-surface-tint-blue p-space-sm">
                <Icon name="visibility" className="text-primary text-[18px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Transparency: renewing keeps every product, deal, QR code and customer chat exactly where you left
                  them. No re-onboarding required.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              {METRIC_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl bg-surface-subtle p-space-md shadow-sm flex flex-col gap-space-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name={card.icon} className="text-[18px]" />
                  </div>
                  <span className="font-caption text-caption text-text-secondary">{card.label}</span>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{card.value}</span>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl bg-surface-canvas p-space-sm shadow-sm border border-border-subtle/60 flex flex-col gap-space-2xs"
                >
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">{faq.q}</span>
                  <span className="font-caption text-caption text-text-secondary leading-relaxed">{faq.a}</span>
                </div>
              ))}
            </section>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-space-lg">
            <section className="rounded-xl bg-surface-subtle p-space-lg shadow-md">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">Order Summary</h3>
              <div className="flex flex-col gap-space-2xs">
                {[
                  { label: 'Plan', value: 'VEMTAP Growth' },
                  { label: 'Billing', value: 'Monthly' },
                  { label: 'Renews', value: 'Oct 21, 2024' },
                  { label: 'Setup fee', value: 'Waived' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-space-2xs">
                    <span className="font-caption text-caption text-text-secondary">{row.label}</span>
                    <span className="font-label-sm text-label-sm text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-space-xs pt-space-xs border-t border-border-subtle flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Due Today</span>
                <span className="font-heading-md text-heading-md text-text-primary font-bold">₦5,000.00</span>
              </div>
              <div className="mt-space-sm flex items-center gap-space-xs rounded-lg bg-surface-container-low px-space-xs py-space-2xs">
                <Icon name="credit_card" className="text-text-secondary text-[16px]" />
                <span className="font-caption text-caption text-text-secondary">
                  Visa •••• 4242 (default) — change at checkout
                </span>
              </div>
              <button
                type="button"
                disabled={paying}
                onClick={handleRenew}
                className={`mt-space-sm w-full h-11 rounded-xl font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all ${
                  paying ? 'bg-primary/80 text-on-primary' : 'bg-primary-container text-on-primary hover:bg-primary'
                }`}
              >
                {paying ? (
                  <>
                    <Icon name="progress_activity" className="animate-spin text-[20px]" />
                    <span>Processing Renewal...</span>
                  </>
                ) : (
                  <>
                    <Icon name="autorenew" className="text-[18px]" />
                    <span>Continue with Growth</span>
                  </>
                )}
              </button>
              <div className="mt-space-sm flex items-center justify-center gap-space-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-caption text-caption text-text-tertiary">
                  Network: Paystack secure node • Lagos
                </span>
              </div>
            </section>

            <button
              type="button"
              onClick={onReviewBusiness}
              className="h-11 rounded-xl bg-surface-tint-blue text-primary-container font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all"
            >
              <Icon name="storefront" className="text-[18px]" />
              <span>Review My Business</span>
            </button>
          </div>
        </div>
      </div>
    </SubscriptionChrome>
  );
}
