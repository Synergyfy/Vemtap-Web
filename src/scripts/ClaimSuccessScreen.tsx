import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface ClaimSuccessScreenProps {
  onViewMyDeal: () => void;
  onContinue: () => void;
  onBack: () => void;
}

const STOREFRONT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ42MXT84QJaLlfP9_IaLBtFvS_KxFLadi_pt_Kn7tawuErwsolNnrbdFRbee-S47CYzKYI-okvg53pKGQAl7Y3ndalFK_DOmS5STdMFh8yQhSP4dM6jg2UiZvn_qu3FkF3laEXkyrj9ncW-xBSTqLg_xtDqBoNEOxATQgrc5DXVM7TqBv2zrlI2Ky4OFfpyZcrN4JoPlmrqvdtOoUaBPIMAdT43_oFjVtgAg9DvKcBYVlykA1iWVGEg';

const STOREFRONT_ALT =
  'Warm modern bistro interior with contemporary wooden tables, soft ambient warm ceiling pendant lamps, indoor plants, and a bustling artisan open kitchen, commercial photography style, crisp clean lighting';

export function ClaimSuccessScreen({ onViewMyDeal, onContinue, onBack }: ClaimSuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const copyClaimCode = () => {
    navigator.clipboard?.writeText('VT-48291').catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Deal Claimed" onBack={onBack} />

      <div className="relative isolate flex flex-col w-full px-margin pt-space-md pb-space-2xl">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-72 left-8 w-44 h-44 bg-surface-container-highest/60 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="flex flex-col items-center text-center mt-space-md mb-space-lg">
          <div className="relative flex items-center justify-center mb-space-md">
            <div className="absolute w-24 h-24 rounded-full bg-primary/10 animate-ping opacity-60" />
            <div className="absolute w-28 h-28 rounded-full bg-surface-tint-blue blur-md" />
            <Icon
              name="arrow_back_ios_new"
              filled
              className="absolute -top-1 -right-2 text-primary text-xl select-none animate-pulse"
            />
            <Icon
              name="star"
              filled
              className="absolute bottom-1 -left-3 text-secondary text-sm select-none opacity-75"
            />
            <Icon name="flare" className="absolute top-4 -left-4 text-primary text-xs select-none opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-primary to-primary-container shadow-xl flex items-center justify-center text-on-primary">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-inner">
                <Icon
                  name="check_circle"
                  className="text-4xl select-none"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                />
              </div>
            </div>
          </div>
          <h1 className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight mb-space-2xs">
            Deal Claimed!
          </h1>
          <p className="font-body-md text-body-md text-text-secondary max-w-[290px]">
            Your deal has been saved to My Deals and is ready to use.
          </p>
        </div>

        <div className="relative w-full bg-surface-canvas rounded-2xl shadow-xl overflow-hidden mb-space-md">
          <div className="p-space-md pb-space-sm bg-surface-canvas">
            <div className="flex items-center justify-between gap-space-xs mb-space-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-badge-discount-text opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-badge-discount-text" />
                </span>
                <span className="font-label-sm text-caption font-semibold tracking-wider uppercase">Active Claim</span>
              </div>
              <button
                type="button"
                onClick={copyClaimCode}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-surface-container-low active:bg-surface-container-highest transition-colors cursor-pointer"
              >
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  {copied ? 'Copied!' : 'Claim #VT-48291'}
                </span>
                <Icon name={copied ? 'check' : 'content_copy'} className="text-text-secondary text-sm" />
              </button>
            </div>

            <div className="flex items-start gap-space-sm mt-space-2xs">
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0 shadow-sm text-primary">
                <Icon name="restaurant" filled className="text-2xl" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                  Urban Grill &amp; Bistro
                </span>
                <h2 className="font-heading-sm text-heading-sm text-primary font-bold tracking-tight line-clamp-1">
                  Lunch Combo — 20% Off
                </h2>
                <div className="flex items-center gap-1 mt-0.5 text-text-secondary">
                  <Icon name="location_on" filled className="text-sm shrink-0" />
                  <span className="font-caption text-caption truncate">Apo, Abuja (0.8 km away)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full h-6 flex items-center justify-between px-0 overflow-hidden bg-surface-canvas">
            <div className="w-4 h-6 rounded-r-full bg-surface shadow-inner -ml-2" />
            <div className="flex-1 mx-2 flex items-center justify-between overflow-hidden">
              <div className="w-full border-t-2 border-dashed border-outline-variant/50" />
            </div>
            <div className="w-4 h-6 rounded-l-full bg-surface shadow-inner -mr-2" />
          </div>

          <div className="p-space-md pt-space-2xs bg-surface-canvas flex flex-col gap-space-sm">
            <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Deal Price</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading-md text-heading-md font-bold text-text-primary">₦9,600</span>
                </div>
                <span className="font-caption text-caption text-badge-discount-text font-medium">Save ₦2,400</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-caption text-caption text-text-tertiary">Validity</span>
                <span className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                  20 Sep 2025
                </span>
                <span className="font-caption text-caption text-text-secondary">One-time redemption</span>
              </div>
            </div>

            <div className="relative w-full h-24 rounded-xl overflow-hidden mt-space-2xs">
              <img className="w-full h-full object-cover" alt={STOREFRONT_ALT} src={STOREFRONT_IMAGE} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-space-xs">
                <div className="flex items-center gap-1.5 text-on-primary">
                  <Icon name="storefront" className="text-xs" />
                  <span className="font-caption text-caption font-medium">Dine-in or Takeaway</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-space-xs p-space-sm rounded-xl bg-surface-tint-blue mb-space-lg">
          <Icon name="info" filled className="text-primary text-xl shrink-0 mt-0.5" />
          <p className="font-body-md text-caption text-secondary leading-relaxed">
            Present this claim code or show your voucher to the attendant upon arrival.
          </p>
        </div>

        <div className="flex flex-col gap-space-sm w-full mt-auto">
          <button
            type="button"
            onClick={onViewMyDeal}
            className="relative w-full h-[54px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-lg hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs group"
          >
            <span>View My Deal</span>
            <Icon name="arrow_forward" className="text-xl group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="w-full h-11 rounded-xl bg-transparent text-text-secondary font-button-secondary text-button-secondary hover:text-text-primary active:bg-surface-container-low transition-colors flex items-center justify-center"
          >
            Continue Discovering
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
