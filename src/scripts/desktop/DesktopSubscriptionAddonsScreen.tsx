import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { useActiveSubscription, useCreditBalance, useCreditCheckout, useCreditPlans } from '../../hooks/business/useSubscription';
import { hasApiConfig } from '../../services/api/client';
import { cheapestCreditPlan, creditBundleLine } from '../subscriptionLive';
import { SubscriptionChrome } from './SubscriptionChrome';

interface DesktopSubscriptionAddonsScreenProps {
  onBack: () => void;
  onBoost: () => void;
}

const AI_FEATURES = [
  { icon: 'restaurant_menu', label: 'Menu Copy' },
  { icon: 'rate_review', label: 'Reviews' },
  { icon: 'local_offer', label: 'Deals' },
];

const BOOST_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBWTtRidQwuW9xLsfx9UwkC-dRF93WR7gYGp67eXpJW9rFh1v75uv7wVnYHgDZxG-6dklauRdi7bWwy6S9olY12xv51r_8IBPnPuZxP0mKcoiW45b7x_VjVAfCwsoK1miDoxreJELT6zbOgC_t1i8qBCvbbWc9WQSrmiYNWCkqCLDYdU1uwpxiAlD19-rOHLN0OoBbU49cNimDp5wOwO-e2vwKkPaVYaFE1SrkRbW4TaQEfuu991VVmgw';
const BOOST_ALT =
  'Vibrant modern coffee shop display on a smartphone screen showing high customer engagement metrics and elevated ranking badge, clean modern retail ambiance with warm lighting and deep blue accents.';
const PROMOTE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBYUNYjcfh8PjajY1pdmAcScVjolApMRKWER3jMevPSS0Oz5M_i15-Ps2NMpNfh1b1jXbm8huKV0__OK6YdKPWcWD_e1fHW8-3vhpnenNo7NuhmCWvAm4vZyXbcsD7HaDU0-RMHwSNNMFYTmGEG7juOIUgAH2BgQo7Ao35quwzRq1RP2c6DEnezXK1jksjyx7mFOVqnxx2vmF09tKEEh8ZSuvNyONtpTmTDpTTwbVqKHx_s_MzCvRUcJg';
const PROMOTE_ALT =
  'Bird eye view map illustration with stylized location pins glowing softly with blue aura, clean modern street layout showcasing local bakery and boutique retail highlights.';
const POS_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAqQFUIKZaCUhPtU_pjePUG8bXiHc7_CW9OARNkJRft82ZNSTHquZW8K_PLX5de876RaJfe30PEX7NhODi5JoDmEypcg_6RbXhVaZo0k9Mo_VxuzJ35pnh--xWeRK9p1OcZW8X0jE5Pl_1V8fyuWjm_hZDHUGwbzZ82d3BHyI9gNmrUNDzPfHEEhuQvymHUWA2dRqaNBWyhJ3qvPi5xjNLrxc2PVwXifyEgbp9-TddRwM5-m5oJqTr5ZA';
const POS_ALT =
  'Sleek modern handheld point of sale card reader device with vivid screen display showing rapid contactless tap animation, minimal matte finish on clean cafe wooden counter.';

export function DesktopSubscriptionAddonsScreen({ onBack, onBoost }: DesktopSubscriptionAddonsScreenProps) {
  const [waitlisted, setWaitlisted] = useState(false);
  const balance = useCreditBalance();
  const creditPlans = useCreditPlans();
  const checkout = useCreditCheckout();
  const live = hasApiConfig();
  const activePlan = useActiveSubscription();

  // Live: real balances + the cheapest live bundle per credit type; demo
  // keeps the scripted "0 SMS / 0 AI" figures.
  const smsBalance = balance.data?.smsCredits ?? 0;
  const aiBalance = balance.data?.aiCredits ?? 0;
  const smsPlan = cheapestCreditPlan(creditPlans.data ?? [], 'sms');
  const aiPlan = cheapestCreditPlan(creditPlans.data ?? [], 'ai');
  const smsLine = creditBundleLine(smsPlan, 'sms');
  const aiLine = creditBundleLine(aiPlan, 'ai');

  const buyCredit = (planId?: string) => {
    if (planId) checkout.mutate(planId);
  };

  return (
    <SubscriptionChrome onBrand={onBack} activeNav="billing" breadcrumb="Paid Add-Ons">
      <div className="max-w-6xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-xl">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-surface-tint-blue via-surface-subtle to-surface-canvas shadow-sm">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary/5 pointer-events-none blur-2xl" />
          <div className="relative z-10 p-space-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-fixed text-primary">
                  <Icon name="bolt" filled className="text-[15px]" />
                </span>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                  Flexible Power-Ups
                </span>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight max-w-2xl">
                Paid Add-Ons
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
                Optional paid services when your business needs extra reach or specialized tools.
              </p>
            </div>
            <div className="flex flex-col gap-space-xs p-space-md rounded-xl bg-surface-canvas/80 border border-border-subtle/60 shadow-sm">
              <span className="font-caption text-caption text-text-secondary">Current credit balances</span>
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-2xs">
                  <Icon name="sms" className="text-primary text-[18px]" />
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{smsBalance} SMS</span>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <Icon name="auto_awesome" className="text-primary text-[18px]" />
                  <span className="font-label-md text-label-md text-text-primary font-semibold">{aiBalance} AI</span>
                </div>
              </div>
              <button
                type="button"
                className="mt-space-2xs h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs shadow-sm active:scale-[0.98] transition-all"
              >
                <Icon name="add_card" className="text-[18px]" />
                <span>Recharge Credits</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="rocket_launch" className="text-[22px]" />
              </div>
              <div>
                <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium mb-space-2xs">
                  Hyperlocal Reach
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                  Boost a Deal
                </h2>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Get more visibility for a specific deal in customer feeds and search results.
            </p>
            <div className="relative w-full h-32 rounded-lg overflow-hidden">
              <img alt={BOOST_ALT} className="w-full h-full object-cover" src={BOOST_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-subtle via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 px-space-xs py-space-2xs rounded bg-surface-canvas/90 backdrop-blur-sm text-text-primary font-caption text-caption font-medium flex items-center gap-space-2xs shadow-sm">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                Up to 3.4x neighborhood impressions
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-2xs mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Starting from</span>
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦2,000</span>
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
                type="button"
                onClick={onBoost}
              >
                <span>Boost Deal</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="storefront" className="text-[22px]" />
              </div>
              <div>
                <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-primary-fixed text-primary font-caption text-caption font-medium mb-space-2xs">
                  Storefront Spotlight
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                  Promote My Business
                </h2>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Increase visibility for your business profile across the neighborhood discovery map.
            </p>
            <div className="relative w-full h-32 rounded-lg overflow-hidden">
              <img alt={PROMOTE_ALT} className="w-full h-full object-cover" src={PROMOTE_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-subtle via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 px-space-xs py-space-2xs rounded bg-surface-canvas/90 backdrop-blur-sm text-text-primary font-caption text-caption font-medium flex items-center gap-space-2xs shadow-sm">
                <Icon name="pin_drop" className="text-primary text-[14px]" />
                Top pin placement across 5km radius
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-2xs mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Starting from</span>
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦3,500</span>
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
                type="button"
              >
                <span>Promote Business</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="sms" className="text-[22px]" />
              </div>
              <div>
                <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-surface-container-high text-secondary font-caption text-caption font-medium mb-space-2xs">
                  Direct Marketing
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                  SMS Credits
                </h2>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Send SMS campaigns and customer announcements when you need them.
            </p>
            <div className="bg-surface-canvas p-space-xs rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <Icon name="mark_chat_read" className="text-text-tertiary text-[18px]" />
                <span className="font-label-sm text-label-sm text-text-secondary">
                  Instant delivery to opt-in patrons
                </span>
              </div>
              <span className="font-label-sm text-label-sm font-semibold text-primary">99.8% rate</span>
            </div>
            <div className="flex items-center justify-between pt-space-2xs mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Bundles from</span>
                {smsLine ? (
                  <div className="flex items-baseline gap-space-2xs">
                    <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                      {smsLine.split(' / ')[0]}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">/ {smsLine.split(' / ')[1]}</span>
                  </div>
                ) : (
                  <span className="font-label-sm text-label-sm text-text-secondary">No bundles on sale yet</span>
                )}
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
                disabled={!smsPlan}
                onClick={() => buyCredit(smsPlan?.id)}
              >
                <span>Buy SMS Credits</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-surface-subtle p-space-lg shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="auto_awesome" className="text-[22px]" />
              </div>
              <div>
                <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-surface-container-high text-secondary font-caption text-caption font-medium mb-space-2xs">
                  Smart Automation
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                  AI Credits
                </h2>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Use VEMTAP AI-powered menu copy, review responses, and deal generator tools.
            </p>
            <div className="grid grid-cols-3 gap-space-xs">
              {AI_FEATURES.map((feature) => (
                <div
                  className="bg-surface-canvas p-space-xs rounded-lg text-center flex flex-col items-center"
                  key={feature.label}
                >
                  <Icon name={feature.icon} className="text-primary text-[17px] mb-space-2xs" />
                  <span className="font-caption text-caption text-text-secondary font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-space-2xs mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Bundles from</span>
                {aiLine ? (
                  <div className="flex items-baseline gap-space-2xs">
                    <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                      {aiLine.split(' / ')[0]}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">/ {aiLine.split(' / ')[1]}</span>
                  </div>
                ) : (
                  <span className="font-label-sm text-label-sm text-text-secondary">No bundles on sale yet</span>
                )}
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
                disabled={!aiPlan}
                onClick={() => buyCredit(aiPlan?.id)}
              >
                <span>Buy AI Credits</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </section>

          <section className="lg:col-span-2 rounded-xl bg-surface-subtle p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center gap-space-lg">
            <div className="flex-1 flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-11 h-11 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
                  <Icon name="point_of_sale" className="text-[22px]" />
                </div>
                <div>
                  <div className="flex items-center gap-space-2xs mb-space-2xs flex-wrap">
                    <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-surface-container-high text-secondary font-caption text-caption font-medium">
                      In-Store Payments
                    </span>
                    <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                      Coming Soon
                    </span>
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                    POS Terminal &amp; Hardware
                  </h2>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary leading-normal">
                All-in-one smart terminal for contactless NFC card payments and instant QR redemptions.
              </p>
              <div className="flex items-center gap-space-2xs text-text-secondary">
                <Icon name="devices" className="text-[17px]" />
                <span className="font-label-sm text-label-sm font-medium">Hardware Pack</span>
              </div>
              <button
                className="mt-space-xs h-11 px-space-md rounded-xl bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs active:scale-[0.98] transition-all w-fit"
                type="button"
                disabled={waitlisted}
                onClick={() => setWaitlisted(true)}
              >
                <span>{waitlisted ? 'Added to Waitlist' : 'Explore POS (Waitlist)'}</span>
                <Icon name={waitlisted ? 'check_circle' : 'notifications'} className="text-[17px]" filled={waitlisted} />
              </button>
            </div>
            <div className="w-full lg:w-72 h-36 rounded-lg overflow-hidden bg-surface-container shrink-0">
              <img alt={POS_ALT} className="w-full h-full object-cover opacity-80" src={POS_IMG} />
            </div>
          </section>
        </div>

        <section className="rounded-xl bg-badge-discount-bg p-space-md shadow-sm flex items-start gap-space-sm">
          <Icon name="inventory" className="text-badge-discount-text text-[20px] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-badge-discount-text font-semibold">Bulk Packs</span>
            <p className="font-caption text-caption text-text-secondary leading-relaxed mt-space-2xs">
              Bundle SMS + AI credits together and save up to 20%. Ask your merchant desk about quarterly power-up
              packs.
            </p>
          </div>
        </section>

        <section className="flex items-start gap-space-sm rounded-xl bg-surface-tint-blue p-space-md shadow-sm">
          <Icon name="info" className="text-primary text-[20px] flex-shrink-0 mt-0.5" />
          <p className="font-body-md text-body-md text-text-secondary leading-normal">
            Add-ons are one-time or pay-as-you-go. They never alter your base{' '}
            <span className="text-text-primary font-semibold">{live ? (activePlan.data?.plan?.name ? `${activePlan.data.plan.name} plan` : 'subscription plan') : '₦5,000/mo Growth subscription'}</span>.
          </p>
        </section>
      </div>
    </SubscriptionChrome>
  );
}
