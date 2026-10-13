import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessCreateDealScreenProps {
  onBack: () => void;
  onReview: () => void;
}

const DEAL_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPwmoBwxjM1jOR7yY4q5bXOdE8_8xlvUxP4jPyvmFV63CVECyGlt_StMkWOzCNw42yd_if0_nJ8sZk3Z6WbI708D__N7LgB7IcNh6gWajgGRa75ublty6q1k7QuSI-nbxmcM562wOW9ZQNjyaoEJrmdjHRL0Mqdog8yC3EFQ3A8R9JtoUV0mOWVnEO9gOB8LoaLwxfjaV6bScCIQQmJy6_hfGotA5s-eKsD7Cf2J9d_M0tOnfpRHA24w';
const DEAL_ALT =
  'Gourmet artisanal lunch combo featuring a medium rare prime steak slider with crisp shoestring fries and a craft beverage, top-down culinary food photography, warm soft daylight studio styling with modern fresh blue accents';

export function BusinessCreateDealScreen({ onBack, onReview }: BusinessCreateDealScreenProps) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [wuseOn, setWuseOn] = useState(true);
  const [victoriaOn, setVictoriaOn] = useState(true);
  const [wuseCustom, setWuseCustom] = useState(false);
  const [victoriaCustom, setVictoriaCustom] = useState(true);
  const [giftEnabled, setGiftEnabled] = useState(true);
  const [boostOnLaunch, setBoostOnLaunch] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-2xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:text-primary transition-colors shrink-0"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">
              Create Deal & Location Assignment
            </h1>
          </div>
          <div className="flex items-center gap-space-2xs shrink-0 pr-space-xs">
            <button
              aria-label="More options"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-6">
        {/* Progress Tracker */}
        <div className="px-margin pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-caption text-caption text-primary tracking-wide uppercase font-semibold">
              Step 2 of 3
            </span>
            <span className="font-caption text-caption text-text-secondary">Locations & Pricing</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: '66%' }} />
          </div>
        </div>

        <div className="px-margin flex flex-col gap-5 mt-2">
          {/* Attached Deal Summary */}
          <div className="bg-surface-canvas rounded-xl p-3.5 shadow-sm flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
              <img alt={DEAL_ALT} className="w-full h-full object-cover" src={DEAL_IMG} />
              <div className="absolute top-1 left-1 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold px-1.5 py-0.5 rounded-full">
                -20%
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">Prime Lunch Combo</h2>
                <span className="font-caption text-caption text-primary font-medium shrink-0 bg-surface-tint-blue px-2 py-0.5 rounded-full">
                  Draft
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                20% Discount · Mon–Fri 12–4 PM
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-label-md text-label-md font-semibold text-text-primary">₦9,600</span>
                <span className="font-caption text-caption text-text-tertiary line-through">₦12,000</span>
                <span className="font-caption text-caption text-badge-discount-text font-medium ml-auto">
                  Save ₦2,400
                </span>
              </div>
            </div>
          </div>

          {/* Scope Radio Cards */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Where is this deal available?</h3>
              <Icon name="storefront" className="text-text-tertiary text-[20px]" />
            </div>
            <button
              className={`bg-surface-canvas rounded-xl p-3.5 shadow-sm transition-all text-left w-full ${scope === 'selected' ? '' : 'opacity-90'}`}
              type="button"
              onClick={() => setScope('selected')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    scope === 'selected' ? 'bg-primary-container' : 'bg-surface-container'
                  }`}
                >
                  {scope === 'selected' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    Selected locations only
                  </span>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">
                    Specify which branches honor this voucher and adjust branch-level promotional pricing.
                  </p>
                </div>
              </div>
            </button>
            <button
              className={`bg-surface-canvas rounded-xl p-3.5 shadow-sm transition-all text-left w-full ${scope === 'all' ? '' : 'opacity-90'}`}
              type="button"
              onClick={() => setScope('all')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    scope === 'all' ? 'bg-primary-container' : 'bg-surface-container'
                  }`}
                >
                  {scope === 'all' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      All locations (Current & future)
                    </span>
                    <span className="font-caption text-caption bg-surface-container px-1.5 py-0.5 rounded text-secondary font-medium">
                      Auto-sync
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">
                    Deal is universally redeemable across all present and incoming branches automatically.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Branch Participation */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Participation</h3>
                <p className="font-caption text-caption text-text-secondary">2 of 3 branches participating</p>
              </div>
              <button
                className="font-label-sm text-label-sm text-primary font-semibold py-1 px-2 hover:bg-surface-tint-blue rounded-lg transition-colors"
                type="button"
                onClick={() => {
                  setWuseOn(true);
                  setVictoriaOn(true);
                }}
              >
                Select All
              </button>
            </div>

            <div
              className={`bg-surface-canvas rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-opacity ${wuseOn ? '' : 'opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-label-md text-label-md font-semibold text-text-primary truncate">
                      Wuse Branch
                    </h4>
                    <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text inline-block" />
                      Active
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">Flagship #1 · Central Area, Abuja</p>
                </div>
                <button
                  aria-checked={wuseOn}
                  className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${wuseOn ? 'bg-primary-container justify-end' : 'bg-surface-container justify-start'}`}
                  role="switch"
                  type="button"
                  onClick={() => setWuseOn((on) => !on)}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow transition-transform" />
                </button>
              </div>
              <div className="bg-surface-subtle rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Standard Deal Price</span>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">₦9,600</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Weekly Allocation</span>
                  <span className="font-label-sm text-label-sm font-medium text-text-primary bg-surface-container px-2 py-0.5 rounded">
                    50 Vouchers
                  </span>
                </div>
              </div>
              <button
                className="flex items-center gap-2.5 text-left"
                type="button"
                onClick={() => setWuseCustom((on) => !on)}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${wuseCustom ? 'bg-primary-container text-white' : 'bg-surface-container'}`}
                >
                  {wuseCustom && <Icon name="check" className="text-[13px] font-bold" />}
                </div>
                <span className="font-label-sm text-label-sm text-text-secondary">
                  Use different price for this location
                </span>
              </button>
            </div>

            <div
              className={`bg-surface-canvas rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-opacity ${victoriaOn ? '' : 'opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-label-md text-label-md font-semibold text-text-primary truncate">
                      Victoria Island Branch
                    </h4>
                    <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text inline-block" />
                      Active
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">#2 · Lagos Island, Lagos</p>
                </div>
                <button
                  aria-checked={victoriaOn}
                  className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${victoriaOn ? 'bg-primary-container justify-end' : 'bg-surface-container justify-start'}`}
                  role="switch"
                  type="button"
                  onClick={() => setVictoriaOn((on) => !on)}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow transition-transform" />
                </button>
              </div>
              {victoriaCustom && (
                <div className="bg-surface-tint-blue rounded-lg p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-caption text-caption font-medium text-primary">Custom Branch Deal Price</span>
                      <span className="font-caption text-caption text-secondary mt-0.5">
                        +₦1,200 branch logistics adjustment
                      </span>
                    </div>
                    <div className="bg-surface-canvas px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="font-label-md text-label-md font-bold text-text-primary">₦10,800</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-caption text-caption text-text-secondary">Weekly Allocation</span>
                    <span className="font-label-sm text-label-sm font-medium text-text-primary bg-surface-container px-2 py-0.5 rounded">
                      30 Vouchers
                    </span>
                  </div>
                </div>
              )}
              <button
                className="flex items-center gap-2.5 text-left"
                type="button"
                onClick={() => setVictoriaCustom((on) => !on)}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${victoriaCustom ? 'bg-primary-container text-white' : 'bg-surface-container'}`}
                >
                  {victoriaCustom && <Icon name="check" className="text-[13px] font-bold" />}
                </div>
                <span className="font-label-sm text-label-sm font-medium text-text-primary">
                  Use different price for selected location
                </span>
              </button>
            </div>

            <div className="bg-surface-canvas/60 rounded-xl p-4 shadow-sm flex flex-col gap-2.5 opacity-75">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-label-md text-label-md font-semibold text-text-secondary truncate">
                      Garki Branch
                    </h4>
                    <span className="font-caption text-caption text-error bg-error-container/40 px-2 py-0.5 rounded-full font-medium">
                      Renovation
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary mt-0.5">#3 · Area 11, Garki, Abuja</p>
                </div>
                <button
                  aria-checked={false}
                  className="w-12 h-7 bg-surface-container rounded-full p-0.5 flex items-center shrink-0 cursor-not-allowed"
                  role="switch"
                  type="button"
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow" />
                </button>
              </div>
              <div className="bg-surface-container-low rounded-lg p-2.5 flex items-start gap-2">
                <Icon name="info" className="text-text-tertiary text-[18px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary leading-snug">
                  Deal will automatically activate here once branch reopening is confirmed on the merchant portal.
                </p>
              </div>
            </div>
          </div>

          {/* Redemption & Boost */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Redemption & Boost</h3>
            <div className="bg-surface-canvas rounded-xl p-4 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Customer Claim Limit
                  </span>
                  <span className="font-caption text-caption text-text-secondary">Prevents voucher hoarding</span>
                </div>
                <div className="bg-surface-subtle px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">1 / day</span>
                  <Icon name="expand_more" className="text-text-tertiary text-[16px]" />
                </div>
              </div>
              <div className="h-px bg-surface-container" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon name="card_giftcard" className="text-primary text-[18px]" />
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Gift to Friends & Family
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Allow customers to claim and send this deal to someone else as a digital gift voucher.
                  </p>
                </div>
                <button
                  aria-checked={giftEnabled}
                  className={`w-12 h-7 rounded-full p-0.5 flex items-center shrink-0 transition-colors mt-0.5 ${giftEnabled ? 'bg-primary-container justify-end' : 'bg-surface-container justify-start'}`}
                  role="switch"
                  type="button"
                  onClick={() => setGiftEnabled((on) => !on)}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow transition-transform" />
                </button>
              </div>
              <div className="h-px bg-surface-container" />
              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-bold text-text-primary">Boost on Launch</span>
                      <span className="font-caption text-caption bg-tertiary-fixed text-on-tertiary-fixed font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Icon name="bolt" className="text-[13px]" />
                        Promoted Feed
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-1 leading-snug">
                      Instantly feature this deal to <strong>1,500+ foodies</strong> within 5km radius upon publication.
                    </p>
                  </div>
                  <button
                    aria-checked={boostOnLaunch}
                    className={`w-12 h-7 rounded-full p-0.5 flex items-center shrink-0 transition-colors ${boostOnLaunch ? 'bg-primary-container justify-end' : 'bg-surface-container justify-start'}`}
                    role="switch"
                    type="button"
                    onClick={() => setBoostOnLaunch((on) => !on)}
                  >
                    <div className="w-6 h-6 bg-white rounded-full shadow transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 pt-2 pb-4">
            <button
              className="w-full h-11 bg-primary-container text-white font-button-primary text-button-primary rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
              type="button"
              onClick={onReview}
            >
              <span>Review & Launch Deal</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <button
              className="w-full h-11 bg-transparent text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary flex items-center justify-center transition-colors"
              type="button"
              onClick={onBack}
            >
              Save Deal as Draft
            </button>
            <div className="text-center pt-1">
              <p className="font-caption text-caption text-text-tertiary">
                Need custom multi-location rules?{' '}
                <button className="text-primary font-medium hover:underline" type="button" onClick={() => showToast('Merchant tier settings opening…')}>
                  Manage Merchant Tier
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
