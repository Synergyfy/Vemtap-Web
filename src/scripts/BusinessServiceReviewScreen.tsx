import { useEffect, useRef, useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { ServiceDraft } from './serviceDraft';
import { validateAllServiceSteps, hasServiceValidationErrors } from './serviceStudioShared';

interface BusinessServiceReviewScreenProps {
  draft: ServiceDraft;
  onBack: () => void;
  onEditBasics: () => void;
  onEditPricing: () => void;
  onEditBranches: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
}

const REVIEW_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9REik3ILBvjNtdNDrlCVS0aKSacNyBW1-Z7T2o1OPsRfuGHu8aZt4WZKK-5hiUdQKEwnAuVcj0_v8ej3yUxt_t7U3FFu1vg5L81s8Y6pEOoPyIPX8A7Duvqd4OUN0-0XfD5PcE1_euP9XVjppx4AHgDttFTXDNkYPCxom2rf66-QrMF7VQyaiQ2Gx8iZEPQqCcTXDCKN7qSz8C1WO-s6p7P1XSeUihtm6BK6935LD24Iq4_4Zs51d0Q',
  alt: 'Close up luxurious aesthetic facial treatment in an upscale wellness spa, organic botanical serum droplet on glowing skin, tranquil soft ambient warm lighting, pristine minimalist modern aesthetic',
};

const TIER_COPY: Record<string, { name: string; note: string }> = {
  'essential-glow': { name: 'Essential Glow', note: '60 mins standard care' },
  'deluxe-radiance': { name: 'Deluxe Radiance + LED Light', note: '75 mins deep rejuvenation' },
  'vip-serenity': { name: 'VIP Serenity + Scalp Massage', note: '90 mins ultra deluxe suite' },
};

const HIGHLIGHT_PILLS = ['Sensitive Skin Safe', 'Organic Botanicals', 'LED Therapy Booster', 'Unisex (All Welcome)'];

const REVIEW_BRANCHES: Array<{
  key: string;
  name: string;
  badge: string;
  rooms: string;
}> = [
  { key: 'maitama', name: 'Maitama Heights Studio', badge: 'Flagship', rooms: '3 Treatment Rooms available' },
  { key: 'wuseII', name: 'Wuse II Sanctuary', badge: 'Secondary', rooms: '2 Treatment Rooms available' },
];

/** Neutral tile until a live service has a photo. */
const LIVE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function BusinessServiceReviewScreen({
  draft,
  onBack,
  onEditBasics,
  onEditPricing,
  onEditBranches,
  onPublish,
  onSaveDraft,
}: BusinessServiceReviewScreenProps) {
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published'>('idle');
  const [previewing, setPreviewing] = useState(false);
  const publishTimer = useRef<number | null>(null);
  const previewTimer = useRef<number | null>(null);

  const validationErrors = validateAllServiceSteps(draft);
  const hasErrors = hasServiceValidationErrors(validationErrors);
  const errorCount =
    validationErrors.identity.length +
    validationErrors.locations.length +
    validationErrors.description.length +
    validationErrors.pricing.length +
    validationErrors.policies.length;

  useEffect(
    () => () => {
      if (publishTimer.current !== null) {
        window.clearTimeout(publishTimer.current);
      }
      if (previewTimer.current !== null) {
        window.clearTimeout(previewTimer.current);
      }
    },
    [],
  );

  const handlePublish = () => {
    if (publishStatus !== 'idle' || hasErrors) return;
    setPublishStatus('publishing');
    publishTimer.current = window.setTimeout(() => {
      setPublishStatus('published');
      publishTimer.current = window.setTimeout(() => {
        onPublish();
      }, 900);
    }, 900);
  };

  const handleInspect = () => {
    if (previewing) return;
    setPreviewing(true);
    previewTimer.current = window.setTimeout(() => {
      setPreviewing(false);
    }, 600);
  };

  const basePrice = parseAmount(draft.basePrice);
  const comparePrice = parseAmount(draft.comparePrice);
  const savings = comparePrice - basePrice;
  // Live: the real branches chosen in the previous step (`locations`).
  const live = hasApiConfig();
  const { branches: liveBranches } = useBusinessBranch();
  const activeBranches = live
    ? liveBranches
        .filter((branch) => branch.id && draft.locations.includes(branch.id))
        .map((branch) => ({
          key: branch.id as string,
          name: branch.name,
          badge: branch.isMainBranch ? 'Main' : 'Branch',
          rooms: '—',
        }))
    : REVIEW_BRANCHES.filter((branch) => draft.branches[branch.key as 'maitama' | 'wuseII']);
  const activeBranchCount = activeBranches.length;

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1 truncate px-space-xs">
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">
              {'Add Service   Step 4: Review Service Summary'}
            </h1>
          </div>
          <div className="flex items-center gap-space-xs -mr-2">
            <button
              aria-label="Save draft"
              className="h-11 min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-all"
              type="button"
              onClick={onSaveDraft}
            >
              Draft
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-56">
        <div className="px-margin flex flex-col gap-space-lg pt-space-md pb-space-3xl">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <Icon className="text-primary text-[20px]" filled name="verified" />
                <span className="font-heading-sm text-heading-sm text-text-primary">Step 4 of 4: Final Review</span>
              </div>
              <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-space-xs py-space-2xs rounded-full font-semibold">
                100% Complete
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full w-full rounded-full transition-all duration-500" />
            </div>
            <div className="flex items-start space-x-space-xs bg-surface-tint-blue p-space-sm rounded-lg">
              <Icon className="text-primary text-[18px] shrink-0 mt-0.5" name="check_circle" />
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                <strong className="text-primary font-semibold">Ready for bookings:</strong> All treatment safety
                protocols and calendar schedules match VEMTAP Instant Booking standards.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="relative w-full h-52 bg-surface-container">
              <img className="w-full h-full object-cover" alt={live ? draft.title || 'Service photo' : REVIEW_IMAGE.alt} src={draft.image || (live ? LIVE_IMAGE_PLACEHOLDER : REVIEW_IMAGE.src)} />
              <div className="absolute top-space-sm left-space-sm flex flex-wrap gap-space-2xs">
                <div className="flex items-center space-x-1 bg-surface-canvas/90 backdrop-blur-md px-space-xs py-1 rounded-full shadow-sm">
                  <Icon className="text-[14px] text-text-primary" name="photo_library" />
                  <span className="font-caption text-caption text-text-primary font-medium">3 Photos</span>
                </div>
                <div className="flex items-center space-x-1 bg-primary text-on-primary px-space-xs py-1 rounded-full shadow-sm">
                  <Icon className="text-[14px] text-on-primary" name="spa" />
                  <span className="font-caption text-caption text-on-primary font-medium">In-Studio &amp; Mobile</span>
                </div>
              </div>
              <button
                className="absolute bottom-space-sm right-space-sm flex items-center space-x-1 bg-surface-canvas/95 backdrop-blur-md text-primary font-label-sm text-label-sm px-space-sm py-1.5 rounded-full shadow-sm active:scale-95 transition-all"
                type="button"
                onClick={onEditBasics}
              >
                <span>Edit Basics</span>
                <Icon name="chevron_right" className="text-[14px]" />
              </button>
            </div>
            <div className="p-space-md space-y-space-xs">
              <div className="flex items-center space-x-space-2xs text-text-tertiary font-label-sm text-label-sm">
                <Icon className="text-[16px] text-primary" name="store" />
                <span className="truncate">{draft.provider}</span>
              </div>
              <h2 className="font-heading-md text-heading-md text-text-primary leading-tight">{draft.title}</h2>
              <p className="font-body-md text-body-md text-text-secondary">
                {draft.primaryCategory} &gt; {draft.subCategory}
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="payments" className="text-[18px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Pricing &amp; Session Tiers</h3>
                  <p className="font-caption text-caption text-text-tertiary">
                    {draft.tiers.length} customizable options available
                  </p>
                </div>
              </div>
              <button
                className="font-label-md text-label-md text-primary font-medium px-space-xs py-1 rounded-lg hover:bg-surface-tint-blue active:scale-95 transition-all"
                type="button"
                onClick={onEditPricing}
              >
                Edit
              </button>
            </div>
            <div className="bg-surface-subtle p-space-sm rounded-lg flex items-center justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-text-secondary block">Base Starting Rate</span>
                <div className="flex items-baseline space-x-space-xs mt-0.5">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                    ₦{draft.basePrice}
                  </span>
                  <span className="font-caption text-caption text-text-tertiary line-through">
                    ₦{draft.comparePrice}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    • {draft.durationMins} mins
                  </span>
                </div>
              </div>
              {savings > 0 && (
                <span className="font-caption text-caption font-semibold text-badge-discount-text bg-badge-discount-bg px-space-xs py-1 rounded-full">
                  Save ₦{formatAmount(savings)}
                </span>
              )}
            </div>
            <div className="space-y-space-xs">
              {draft.tiers.map((tier) => {
                const copy = TIER_COPY[tier.id];
                return (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded-lg shadow-sm"
                  >
                    <div className="flex items-center space-x-space-sm min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                          {copy ? copy.name : tier.name}
                        </h4>
                        <p className="font-caption text-caption text-text-tertiary">
                          {copy ? copy.note : `${tier.duration} standard care`}
                        </p>
                      </div>
                    </div>
                    <span className="font-label-md text-label-md text-text-primary font-bold shrink-0">
                      ₦{tier.price}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center space-x-space-xs pt-space-xs text-text-secondary font-label-sm text-label-sm">
              <Icon className="text-primary text-[18px]" name="badge" />
              <span>Amara K. &amp; Zainab T. available (Client choice enabled)</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="location_on" className="text-[18px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Availability</h3>
                  <span className="font-caption text-caption text-badge-discount-text font-medium">
                    {activeBranchCount} Active Studios Serving This Treatment
                  </span>
                </div>
              </div>
              <button
                className="font-label-md text-label-md text-primary font-medium px-space-xs py-1 rounded-lg hover:bg-surface-tint-blue active:scale-95 transition-all"
                type="button"
                onClick={onEditBranches}
              >
                Edit
              </button>
            </div>
            <div className="space-y-space-xs">
              {activeBranches.map((branch) => (
                <div key={branch.key} className="p-space-sm bg-surface-subtle rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">{branch.name}</span>
                    <span
                      className={`font-caption text-caption px-space-xs py-0.5 rounded font-medium ${
                        branch.badge === 'Flagship'
                          ? 'bg-surface-container-high text-on-surface-variant'
                          : 'bg-surface-tint-blue text-primary'
                      }`}
                    >
                      {branch.badge}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    ₦{draft.basePrice} Base • {branch.rooms}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-space-xs text-text-secondary font-label-sm text-label-sm pt-space-2xs">
              <Icon className="text-tertiary-container text-[18px]" name="schedule" />
              <span>Minimum 2 hours advance booking required</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="policy" className="text-[18px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Booking &amp; Safety Policies</h3>
              </div>
              <button
                className="font-label-md text-label-md text-primary font-medium px-space-xs py-1 rounded-lg hover:bg-surface-tint-blue active:scale-95 transition-all"
                type="button"
                onClick={onEditBranches}
              >
                Edit
              </button>
            </div>
            <div className="space-y-space-sm">
              {(draft.policies && draft.policies.length > 0
                ? draft.policies
                : [
                    { id: 'p1', title: 'Pay at Salon Reception', body: '₦0 Upfront Fee on VEMTAP Instant Booking.' },
                    { id: 'p2', title: 'Flexible Cancellation', body: 'Free cancellation & reschedule up to 2 hours before slot.' },
                    { id: 'p3', title: 'Turnaround Buffer', body: '15 mins sanitization and room prep between clients.' },
                  ]
              ).map((p) => (
                <div key={p.id} className="flex items-start space-x-space-xs">
                  <Icon className="text-primary text-[18px] shrink-0 mt-0.5" name="verified_user" />
                  <div>
                    <p className="font-label-md text-label-md text-text-primary font-semibold">{p.title}</p>
                    <p className="font-caption text-caption text-text-secondary">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="auto_awesome" className="text-[18px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Treatment Highlights</h3>
              </div>
              <button
                className="font-label-md text-label-md text-primary font-medium px-space-xs py-1 rounded-lg hover:bg-surface-tint-blue active:scale-95 transition-all"
                type="button"
                onClick={onEditBasics}
              >
                Edit
              </button>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              A clinically formulated, deeply replenishing facial tailored to combat dry Sahelian climates and city
              pollution. Includes ultrasonic pore cleanse, cold-pressed antioxidant mist, and botanical serum infused
              via gentle thermal induction.
            </p>
            <div className="flex flex-wrap gap-space-2xs">
              {HIGHLIGHT_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="font-caption text-caption bg-surface-subtle text-text-secondary px-space-sm py-1 rounded-full"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface-tint-blue rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-space-sm min-w-0 pr-space-xs">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="text-[20px]" filled name="visibility" />
              </div>
              <div className="min-w-0">
                <h4 className="font-label-md text-label-md text-primary font-semibold truncate">
                  Consumer View Preview
                </h4>
                <p className="font-caption text-caption text-text-secondary truncate">
                  Simulate live client booking screen
                </p>
              </div>
            </div>
            <button
              className="shrink-0 bg-surface-canvas text-primary font-label-sm text-label-sm font-semibold px-space-sm py-2 rounded-lg shadow-sm hover:bg-surface-subtle active:scale-95 transition-all"
              type="button"
              onClick={handleInspect}
            >
              {previewing ? 'Opening...' : 'Inspect'}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/90 backdrop-blur-md px-margin py-space-sm shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
        <div className="flex flex-col gap-space-sm">
          {hasErrors && (
            <div className="p-2.5 rounded-xl border border-error/30 bg-error/5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-error font-label-sm text-label-sm font-bold">
                <Icon name="error" className="text-[16px]" />
                <span>{errorCount} Required {errorCount === 1 ? 'Field' : 'Fields'} Missing</span>
              </div>
              <div className="text-[11px] text-text-secondary flex flex-wrap gap-x-2 gap-y-0.5">
                {validationErrors.identity.map((e) => (
                  <span key={e}>• {e} (<button type="button" onClick={onEditBasics} className="text-primary underline">Fix</button>)</span>
                ))}
                {validationErrors.locations.map((e) => (
                  <span key={e}>• {e} (<button type="button" onClick={onEditBranches} className="text-primary underline">Fix</button>)</span>
                ))}
                {validationErrors.pricing.map((e) => (
                  <span key={e}>• {e} (<button type="button" onClick={onEditPricing} className="text-primary underline">Fix</button>)</span>
                ))}
                {validationErrors.policies.map((e) => (
                  <span key={e}>• {e} (<button type="button" onClick={onEditBranches} className="text-primary underline">Fix</button>)</span>
                ))}
              </div>
            </div>
          )}
          <button
            className={`w-full h-[52px] rounded-xl font-button-primary text-button-primary flex items-center justify-center space-x-space-xs transition-all active:scale-[0.98] ${
              publishStatus === 'published'
                ? 'bg-badge-discount-text text-on-primary'
                : hasErrors
                  ? 'bg-surface-container-highest text-text-tertiary cursor-not-allowed opacity-60'
                  : 'bg-primary-container hover:bg-primary text-on-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)]'
            }`}
            type="button"
            disabled={publishStatus !== 'idle' || hasErrors}
            onClick={handlePublish}
          >
            {publishStatus === 'idle' && (
              <>
                <span>Publish Service to Storefront</span>
                <span className="text-[18px]">🚀</span>
              </>
            )}
            {publishStatus === 'publishing' && (
              <>
                <Icon name="progress_activity" className="text-[20px] animate-spin" />
                <span>Publishing to VEMTAP...</span>
              </>
            )}
            {publishStatus === 'published' && (
              <>
                <Icon name="done_all" className="text-[20px]" />
                <span>Live on Storefront! 🎉</span>
              </>
            )}
          </button>
          <button
            className="w-full min-h-[44px] text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary py-space-xs active:scale-95 transition-all"
            type="button"
            onClick={onSaveDraft}
          >
            Save as Draft
          </button>
          <p className="font-caption text-caption text-text-tertiary text-center px-space-sm leading-relaxed">
            You can edit treatment details, block calendar dates, or convert this service into a promotional deal
            voucher anytime from your merchant portal.
          </p>
        </div>
      </div>
    </AppScreen>
  );
}
