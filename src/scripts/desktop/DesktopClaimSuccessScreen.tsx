import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import type { ClaimRecord } from '../../context/ClaimsContext';
import { maskPhone } from '../../utils/format';

interface DesktopClaimSuccessScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onViewMyDeal: () => void;
  onContinue: () => void;
  claim?: ClaimRecord | null;
}

const STOREFRONT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ42MXT84QJaLlfP9_IaLBtFvS_KxFLadi_pt_Kn7tawuErwsolNnrbdFRbee-S47CYzKYI-okvg53pKGQAl7Y3ndalFK_DOmS5STdMFh8yQhSP4dM6jg2UiZvn_qu3FkF3laEXkyrj9ncW-xBSTqLg_xtDqBoNEOxATQgrc5DXVM7TqBv2zrlI2Ky4OFfpyZcrN4JoPlmrqvdtOoUaBPIMAdT43_oFjVtgAg9DvKcBYVlykA1iWVGEg';

const STOREFRONT_ALT =
  'Warm modern bistro interior with contemporary wooden tables, soft ambient warm ceiling pendant lamps, indoor plants, and a bustling artisan open kitchen, commercial photography style, crisp clean lighting';

export function DesktopClaimSuccessScreen({
  onNav,
  onBack,
  onViewMyDeal,
  onContinue,
  claim,
}: DesktopClaimSuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const claimRef = claim?.ref ?? 'VT-48291';
  const isSomeoneElseClaim = claim?.kind === 'someone-else' && Boolean(claim.recipient);
  const dealTitle = claim?.dealTitle ?? 'Lunch Combo — 20% Off';

  const copyClaimCode = () => {
    navigator.clipboard?.writeText(claimRef).catch(() => undefined);
    setCopied(true);
    timers.current.push(window.setTimeout(() => setCopied(false), 2000));
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="my-deals">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-text-tertiary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[16px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              My Deals
            </button>
            <Icon name="chevron_right" className="text-[16px]" />
            <span className="text-text-primary font-semibold">Deal Claimed</span>
          </nav>

          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption mb-space-xs shadow-sm">
              <Icon name="verified" className="text-[14px]" filled />
              <span className="font-semibold tracking-wider uppercase">Active Claim</span>
            </span>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">Deal Claimed!</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-space-2xs leading-relaxed">
              {isSomeoneElseClaim
                ? `Claim authorized for ${claim?.recipient?.name}. The redemption pass is ready to share.`
                : 'Your deal has been saved to My Deals and is ready to use.'}
            </p>
          </div>

          {isSomeoneElseClaim ? (
            <div className="mb-8 p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm">
              <Icon name="person_pin" className="text-primary text-[20px] shrink-0 mt-0.5" filled />
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary">
                  Redeemer: {claim?.recipient?.name}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  {claim?.recipient?.email}
                  {claim?.recipient?.phone ? ` • ${maskPhone(claim.recipient.phone)}` : ''}
                </span>
                <span className="font-caption text-caption text-text-tertiary">
                  You made the claim; the voucher is registered under the recipient's name.
                </span>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
            <div className="flex flex-col gap-4 min-w-0">
              <div className="relative isolate bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden px-space-xl py-space-2xl flex flex-col items-center">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-surface-tint-blue rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute top-40 left-8 w-44 h-44 bg-surface-container-highest/60 rounded-full blur-2xl pointer-events-none -z-10" />

                <div className="relative flex items-center justify-center mb-space-md">
                  <div className="absolute w-28 h-28 rounded-full bg-primary-container/20 animate-ping opacity-60" />
                  <div className="absolute w-32 h-32 rounded-full bg-surface-tint-blue blur-md" />
                  <Icon
                    name="arrow_back_ios_new"
                    filled
                    className="absolute -top-1 -right-3 text-primary text-2xl select-none animate-pulse"
                  />
                  <Icon
                    name="star"
                    filled
                    className="absolute bottom-1 -left-4 text-text-secondary text-base select-none opacity-75"
                  />
                  <Icon name="flare" className="absolute top-4 -left-5 text-primary text-sm select-none opacity-60" />
                  <div className="relative w-24 h-24 rounded-full bg-primary-container shadow-xl flex items-center justify-center text-on-primary">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-inner">
                      <Icon
                        name="check_circle"
                        className="text-5xl select-none"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                      />
                    </div>
                  </div>
                </div>

                <p className="font-heading-md text-heading-md text-text-primary text-center">
                  Your {claim?.dealBusiness ?? 'Urban Grill &amp; Bistro'} {dealTitle} is reserved.
                </p>
                <p className="font-body-md text-body-md text-text-secondary text-center mt-space-2xs max-w-md">
                  {isSomeoneElseClaim
                    ? `Show the claim code below to the attendant when ${claim?.recipient?.name} arrives at the Apo, Abuja branch.`
                    : 'Show the claim code below to the attendant when you arrive at the Apo, Abuja branch.'}
                </p>
              </div>

              <div className="flex items-start gap-space-xs p-space-sm rounded-xl bg-surface-tint-blue">
                <Icon name="info" filled className="text-primary text-xl shrink-0 mt-0.5" />
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  Present this claim code or show your voucher to the attendant upon arrival.
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4 lg:sticky lg:top-24">
              <div className="relative bg-surface-canvas rounded-2xl shadow-xl overflow-hidden">
                <div className="p-space-md pb-space-sm bg-surface-canvas">
                  <div className="flex items-center justify-between gap-space-xs mb-space-sm">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-badge-discount-text opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-badge-discount-text" />
                      </span>
                      <span className="font-label-sm text-caption font-semibold tracking-wider uppercase">
                        Active Claim
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyClaimCode}
                      className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-highest transition-colors cursor-pointer"
                    >
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        {copied ? 'Copied!' : `Claim #${claimRef}`}
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
                        {claim?.dealBusiness ?? 'Urban Grill & Bistro'}
                      </span>
                      <h2 className="font-heading-sm text-heading-sm text-primary font-bold tracking-tight line-clamp-1">
                        {dealTitle}
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
                    <div className="w-full border-t-2 border-dashed border-border-subtle" />
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
                      <span className="font-caption text-caption text-badge-discount-text font-medium">
                        Save ₦2,400
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="font-caption text-caption text-text-tertiary">Validity</span>
                      <span className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                        20 Sep 2025
                      </span>
                      <span className="font-caption text-caption text-text-secondary">One-time redemption</span>
                    </div>
                  </div>

                  <div className="relative w-full h-32 rounded-xl overflow-hidden mt-space-2xs">
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

              <div className="flex flex-col gap-space-sm w-full">
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
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
