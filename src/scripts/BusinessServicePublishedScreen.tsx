import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { ServiceDraft } from './serviceDraft';
import { draftImage, draftImageAlt } from './desktop/draftImage';

interface BusinessServicePublishedScreenProps {
  draft: ServiceDraft;
  onMakeDeal: () => void;
  onViewCatalog: () => void;
  onAddAnother: () => void;
}

const PUBLISHED_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVYUwMwu8cNy9KLzjQLvJvKQzb6fVQKYs3BJn-JalHAr4WYn7edF6a0Bun3XMOIqhDwPEqvOgpEdYIpC79kiDBlxtyak2o8HuhcTW4ua9w_gExhBjGVvp5bYB5c4JOsWineCW7Kd_w5NBuQK4N_jROYYEqoasReIOnfCJHJ568IQwWN8kB-Dzyr8CxrSKJig1LfXQsGAtu9FgLWTTpay3888DXOfXMWi6LP9YvLKEYY8icOvBtVM-oiw',
  alt: 'Close up aesthetic shot of a luxury facial treatment at an Abuja beauty clinic with organic hydrating masks, golden warm studio lighting, serene wellness ambiance, and soft clean towels in blue and white tones',
};

export function BusinessServicePublishedScreen({
  draft,
  onMakeDeal,
  onViewCatalog,
  onAddAnother,
}: BusinessServicePublishedScreenProps) {
  const [status, setStatus] = useState<'live' | 'draft'>('live');
  const isLive = status === 'live';

  const durations = draft.tiers
    .map((tier) => parseInt(tier.duration, 10))
    .filter((minutes) => !Number.isNaN(minutes));
  const lowDuration = durations.length > 0 ? Math.min(...durations) : draft.durationMins;
  const highDuration = durations.length > 0 ? Math.max(...durations) : draft.durationMins;
  const tierPrices = draft.tiers.map((tier) => tier.price);
  const lowPrice = tierPrices[0] ?? draft.basePrice;
  const highPrice = tierPrices[tierPrices.length - 1] ?? lowPrice;
  const studioNames = [
    ...(draft.branches.maitama ? ['Maitama'] : []),
    ...(draft.branches.wuseII ? ['Wuse'] : []),
    ...(draft.branches.garki ? ['Garki'] : []),
  ];
  const activeBranchCount = studioNames.length;

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onViewCatalog}
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1 truncate px-space-xs">
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">
              {'Add Service   Step 5: Service Published Or Saved As Draft'}
            </h1>
          </div>
          <div className="flex items-center gap-space-xs -mr-2">
            <button
              aria-label="Save draft"
              className="h-11 min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-all"
              type="button"
            >
              Draft
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full">
        <div className="px-margin pt-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-primary font-semibold">Step 4 of 4</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <span className="font-caption text-caption text-text-secondary">Completion</span>
          </div>
          <div className="flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-caption text-caption font-semibold">Live Online</span>
          </div>
        </div>

        <div className="px-margin flex flex-col items-center text-center pt-space-xs pb-space-sm">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-high shadow-sm mb-space-sm">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-60" />
            <div className="relative w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
              <Icon className="text-[32px]" filled name="verified" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container shadow-sm">
              <Icon className="text-[16px]" name="auto_awesome" />
            </div>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            Service is Live on Storefront!
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs max-w-[320px]">
            Clients within <span className="font-semibold text-text-primary">4.0 km</span> can now discover,
            schedule, and book appointments in real-time.
          </p>
        </div>

        <div className="px-margin mt-space-xs">
          <div className="w-full p-1 rounded-xl bg-surface-container-high flex items-center shadow-inner">
            <button
              className={`flex-1 py-2.5 px-space-xs rounded-lg flex items-center justify-center gap-space-2xs transition-all active:scale-[0.98] ${
                isLive ? 'bg-surface-container-lowest text-text-primary shadow-sm' : 'text-text-secondary'
              }`}
              type="button"
              onClick={() => setStatus('live')}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-badge-discount-text' : 'bg-text-tertiary'}`}
              />
              <span className={`font-label-md text-label-md ${isLive ? 'font-semibold' : ''}`}>
                Live on Storefront
              </span>
            </button>
            <button
              className={`flex-1 py-2.5 px-space-xs rounded-lg flex items-center justify-center gap-space-2xs transition-all active:scale-[0.98] ${
                !isLive ? 'bg-surface-container-lowest text-text-primary shadow-sm' : 'text-text-secondary'
              }`}
              type="button"
              onClick={() => setStatus('draft')}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${!isLive ? 'bg-tertiary' : 'bg-text-tertiary'}`}
              />
              <span className={`font-label-md text-label-md ${!isLive ? 'font-semibold' : ''}`}>
                Saved as Draft
              </span>
            </button>
          </div>
        </div>

        <div className="px-margin flex flex-col gap-space-md mt-space-sm pb-space-2xl">
          <div className="w-full rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-start gap-space-sm">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <img className="w-full h-full object-cover" alt={draftImageAlt(draft.title, PUBLISHED_IMAGE.alt)} src={draftImage(draft.image, PUBLISHED_IMAGE.src)} />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-caption text-[10px] font-medium backdrop-blur-xs">
                  {activeBranchCount} Studios
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    Active in Catalog
                  </span>
                  <span className="font-caption text-caption text-text-tertiary font-mono">#{draft.skuCode}</span>
                </div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{draft.title}</h3>
                <p className="font-label-md text-label-md font-semibold text-primary mt-0.5">
                  ₦{lowPrice} – ₦{highPrice}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-space-md pt-space-xs text-text-secondary font-label-sm text-label-sm">
              <div className="flex items-center gap-1">
                <Icon name="schedule" className="text-[16px] text-primary" />
                <span>
                  {lowDuration}–{highDuration} mins duration
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="storefront" className="text-[16px] text-primary" />
                <span>{studioNames.join(' & ')} Studios</span>
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl bg-surface-tint-blue p-space-md flex items-start gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-0.5">
              <Icon name="notifications_active" className="text-[20px]" />
            </div>
            <div className="flex flex-col space-y-1">
              <h4 className="font-label-md text-label-md font-semibold text-primary">Live Bookings Enabled</h4>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Appointments appear instantly on your merchant calendar and dispatch WhatsApp alerts to your on-duty
                specialists. You can toggle this to Draft to temporarily pause new bookings.
              </p>
            </div>
          </div>

          <div className="relative w-full rounded-xl bg-gradient-to-br from-surface-container-lowest via-surface-subtle to-surface-container-low p-space-md shadow-md flex flex-col gap-space-md overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-tertiary-container/10 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold">
                <Icon className="text-[15px]" filled name="local_fire_department" />
                <span>Growth Booster</span>
              </div>
              <span className="font-caption text-caption text-text-secondary font-medium">Instant One-Tap Import</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1.5">
                Fill Empty Slots with a VEMTAP Deal
              </h3>
              <p className="font-body-md text-body-md text-text-secondary">
                Transform this Radiance Facial into a featured promotional voucher for slow hours or weekdays. Photos,
                duration tiers, and studio branches will pre-fill into Deal Studio automatically.
              </p>
            </div>
            <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-high/60">
              <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                <Icon name="trending_up" className="text-[16px] text-badge-discount-text" />
              </div>
              <p className="font-caption text-caption text-text-primary font-medium">
                Service deals get <span className="font-bold text-primary">4.2x higher</span> first-time appointment
                bookings on the Hyperlocal Map.
              </p>
            </div>
            <button
              className="w-full h-13 min-h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-all"
              type="button"
              onClick={onMakeDeal}
            >
              <span>Make as a Deal 🔥</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>

          <div className="w-full pt-space-xs flex flex-col gap-space-sm">
            <button
              className="w-full h-12 min-h-[48px] rounded-xl bg-surface-container-high text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all"
              type="button"
              onClick={onViewCatalog}
            >
              <Icon name="view_list" className="text-[20px] text-secondary" />
              <span>View in Services Catalog</span>
            </button>
            <div className="flex justify-center">
              <button
                className="h-11 px-space-md flex items-center gap-1.5 text-primary font-label-md text-label-md font-semibold active:opacity-75 transition-opacity"
                type="button"
                onClick={onAddAnother}
              >
                <Icon name="add" className="text-[18px]" />
                <span>Add Another Product or Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
