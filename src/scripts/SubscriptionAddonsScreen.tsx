import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { SubscriptionHeader } from './SubscriptionHeader';

interface SubscriptionAddonsScreenProps {
  onBack: () => void;
  onBoost: () => void;
}

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

const AI_FEATURES = [
  { icon: 'restaurant_menu', label: 'Menu Copy' },
  { icon: 'rate_review', label: 'Reviews' },
  { icon: 'local_offer', label: 'Deals' },
];

export function SubscriptionAddonsScreen({ onBack, onBoost }: SubscriptionAddonsScreenProps) {
  const [waitlisted, setWaitlisted] = useState(false);

  return (
    <AppScreen surface="bg-surface-canvas">
      <SubscriptionHeader title="Paid Add Ons" onBack={onBack} />
      <div className="flex flex-col w-full flex-1 px-margin pb-8">
        {/* Intro */}
        <div className="pt-1 pb-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-fixed text-primary">
              <Icon name="bolt" filled className="text-[15px]" />
            </span>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
              Flexible Power-Ups
            </span>
          </div>
          <p className="font-body-md text-body-md text-text-secondary leading-normal">
            Optional paid services when your business needs extra reach or specialized tools.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Boost a Deal */}
          <div className="bg-surface-subtle rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="rocket_launch" className="text-[22px]" />
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium mb-0.5">
                    Hyperlocal Reach
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                    Boost a Deal
                  </h2>
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Get more visibility for a specific deal in customer feeds and search results.
            </p>
            <div className="relative w-full h-28 rounded-lg overflow-hidden my-1">
              <img alt={BOOST_ALT} className="w-full h-full object-cover" src={BOOST_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-subtle via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-surface-canvas/90 backdrop-blur-sm text-text-primary font-caption text-caption font-medium flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                Up to 3.4x neighborhood impressions
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Starting from</span>
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦2,000</span>
              </div>
              <button
                className="h-11 px-4 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                type="button"
                onClick={onBoost}
              >
                <span>Boost Deal</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>

          {/* Promote My Business */}
          <div className="bg-surface-subtle rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="storefront" className="text-[22px]" />
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-caption text-caption font-medium mb-0.5">
                    Storefront Spotlight
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                    Promote My Business
                  </h2>
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Increase visibility for your business profile across the neighborhood discovery map.
            </p>
            <div className="relative w-full h-28 rounded-lg overflow-hidden my-1">
              <img alt={PROMOTE_ALT} className="w-full h-full object-cover" src={PROMOTE_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-subtle via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-surface-canvas/90 backdrop-blur-sm text-text-primary font-caption text-caption font-medium flex items-center gap-1.5 shadow-sm">
                <Icon name="pin_drop" className="text-primary text-[14px]" />
                Top pin placement across 5km radius
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Starting from</span>
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦3,500</span>
              </div>
              <button
                className="h-11 px-4 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                type="button"
              >
                <span>Promote Business</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>

          {/* SMS Credits */}
          <div className="bg-surface-subtle rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="sms" className="text-[22px]" />
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-caption text-caption font-medium mb-0.5">
                    Direct Marketing
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                    SMS Credits
                  </h2>
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Send SMS campaigns and customer announcements when you need them.
            </p>
            <div className="bg-surface-canvas p-2.5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="mark_chat_read" className="text-text-tertiary text-[18px]" />
                <span className="font-label-sm text-label-sm text-text-secondary">
                  Instant delivery to opt-in patrons
                </span>
              </div>
              <span className="font-label-sm text-label-sm font-semibold text-primary">99.8% rate</span>
            </div>
            <div className="flex items-center justify-between pt-1 mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Bundles from</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦1,500</span>
                  <span className="font-caption text-caption text-text-secondary">/ 250 SMS</span>
                </div>
              </div>
              <button
                className="h-11 px-4 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                type="button"
              >
                <span>Buy SMS Credits</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>

          {/* AI Credits */}
          <div className="bg-surface-subtle rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="auto_awesome" className="text-[22px]" />
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-caption text-caption font-medium mb-0.5">
                    Smart Automation
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                    AI Credits
                  </h2>
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              Use VEMTAP AI-powered menu copy, review responses, and deal generator tools.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {AI_FEATURES.map((feature) => (
                <div className="bg-surface-canvas p-2 rounded-lg text-center flex flex-col items-center" key={feature.label}>
                  <Icon name={feature.icon} className="text-primary text-[17px] mb-0.5" />
                  <span className="font-caption text-caption text-text-secondary font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1 mt-auto">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Bundles from</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦1,000</span>
                  <span className="font-caption text-caption text-text-secondary">/ 100 Credits</span>
                </div>
              </div>
              <button
                className="h-11 px-4 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                type="button"
              >
                <span>Buy AI Credits</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>

          {/* POS Terminal & Hardware */}
          <div className="bg-surface-subtle rounded-xl p-4 shadow-sm flex flex-col gap-3 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center flex-shrink-0">
                  <Icon name="point_of_sale" className="text-[22px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-caption text-caption font-medium">
                      In-Store Payments
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                      Coming Soon
                    </span>
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary leading-tight font-semibold">
                    POS Terminal & Hardware
                  </h2>
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              All-in-one smart terminal for contactless NFC card payments and instant QR redemptions.
            </p>
            <div className="relative w-full h-24 rounded-lg overflow-hidden my-1 bg-surface-container">
              <img alt={POS_ALT} className="w-full h-full object-cover opacity-80" src={POS_IMG} />
            </div>
            <div className="flex items-center justify-between pt-1 mt-auto">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Icon name="devices" className="text-[17px]" />
                <span className="font-label-sm text-label-sm font-medium">Hardware Pack</span>
              </div>
              <button
                className="h-11 px-4 rounded-xl bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary flex items-center gap-1.5 active:scale-95 transition-all"
                type="button"
                disabled={waitlisted}
                onClick={() => setWaitlisted(true)}
              >
                <span>{waitlisted ? 'Added to Waitlist' : 'Explore POS (Waitlist)'}</span>
                <Icon name={waitlisted ? 'check_circle' : 'notifications'} className="text-[17px]" filled={waitlisted} />
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Info Footer */}
        <div className="mt-6 mb-2 p-4 rounded-xl bg-surface-tint-blue flex items-start gap-3">
          <Icon name="info" className="text-primary text-[20px] flex-shrink-0 mt-0.5" />
          <p className="font-body-md text-body-md text-text-secondary leading-normal">
            Add-ons are one-time or pay-as-you-go. They never alter your base{' '}
            <span className="text-text-primary font-semibold">₦5,000/mo Growth subscription</span>.
          </p>
        </div>
      </div>
    </AppScreen>
  );
}
