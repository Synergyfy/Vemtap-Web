import { useEffect, useRef, useState } from 'react';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ServiceDraft } from './desktopServiceDraft';
import { validateAllServiceSteps, hasServiceValidationErrors } from '../serviceStudioShared';
import { NO_ITEM_IMAGE, draftImageAlt } from './draftImage';

interface DesktopServiceReviewScreenProps {
  draft: ServiceDraft;
  onBack: () => void;
  onEditBasics: () => void;
  onEditPricing: () => void;
  onEditBranches: () => void;
  onEditDescription: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

/** Live: tier cards rendered from the merchant's own tiers; none configured → a single base-price card. */
const tierCards = (draft: ServiceDraft): Array<{ badge: string; name: string; body: string; price: string }> =>
  draft.tiers.length > 0
    ? draft.tiers.map((tier, index) => ({
        badge: `Tier ${index + 1}`,
        name: tier.name,
        body: tier.note,
        price: tier.price,
      }))
    : [
        {
          badge: 'Base',
          name: draft.title || 'Base session',
          body: 'Standard session at the base price.',
          price: draft.basePrice,
        },
      ];

/** Narrative chips from the merchant's own highlights plus the real suitability setting. */
const narrativeChips = (draft: ServiceDraft): Array<{ icon: string; label: string }> => [
  ...draft.highlights.map((highlight) => ({ icon: highlight.icon, label: highlight.label })),
  {
    icon: 'group',
    label:
      draft.genderSuitability === 'women'
        ? 'Women Only'
        : draft.genderSuitability === 'men'
          ? 'Men Only'
          : 'Unisex (All Welcome)',
  },
];

const toNumber = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function DesktopServiceReviewScreen({
  draft,
  onBack,
  onEditBasics,
  onEditPricing,
  onEditBranches,
  onEditDescription,
  onPublish,
  onSaveDraft,
  onNav,
}: DesktopServiceReviewScreenProps) {
  // Live: the real branches chosen in the previous step (`locations`) and the real business name.
  const { branches: liveBranches } = useBusinessBranch();
  const myBusiness = useMyBusiness();
  const businessName = myBusiness.data?.name || 'Your business';
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'success'>('idle');
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const base = toNumber(draft.basePrice);
  const compare = toNumber(draft.comparePrice);
  const saving = compare - base;
  const savingPercent = compare > 0 ? Math.round((saving / compare) * 100) : 0;

  const validationErrors = validateAllServiceSteps(draft);
  const hasErrors = hasServiceValidationErrors(validationErrors);
  const errorCount =
    validationErrors.identity.length +
    validationErrors.locations.length +
    validationErrors.description.length +
    validationErrors.pricing.length +
    validationErrors.policies.length;

  const handlePublish = () => {
    if (publishState !== 'idle' || hasErrors) return;
    setPublishState('publishing');
    timers.current.push(window.setTimeout(() => setPublishState('success'), 900));
    timers.current.push(window.setTimeout(() => onPublish(), 1900));
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="max-w-7xl mx-auto w-full px-margin py-space-xl flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-caption text-caption text-text-tertiary">
                <span className="hover:text-primary cursor-pointer transition-colors">Catalog Workflow</span>
                <span>/</span>
                <span className="text-primary font-medium">Final Review</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
                  Step 4 of 4: Final Service Audit &amp; Verification
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 shadow-sm">
                  <Icon name="verified" className="text-[14px]" /> Ready for Live Booking
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2.5 rounded-xl shadow-sm">
              <div className="flex flex-col items-end">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">100% Completed</span>
                <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> Fast-Track Live Enabled
                </span>
              </div>
              <div className="w-32 h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full w-full transition-all duration-500" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="h-1.5 rounded-full bg-primary-container" />
            <div className="h-1.5 rounded-full bg-primary-container" />
            <div className="h-1.5 rounded-full bg-primary-container" />
            <div className="h-1.5 rounded-full bg-primary-container relative">
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary-container rounded-full ring-4 ring-surface flex items-center justify-center text-on-primary">
                <Icon name="check" className="text-[10px]" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-canvas rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="relative w-full h-72 sm:h-80 bg-surface-container">
                <img
                  alt={draftImageAlt(draft.title, '')}
                  className="w-full h-full object-cover"
                  src={draft.image || NO_ITEM_IMAGE}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent" />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                  <span className="px-3 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm">
                    <Icon name="photo_library" className="text-[16px] text-primary" />
                    {draft.image ? '1 Photo' : 'No Photo Yet'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-tint-blue/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm">
                    <Icon name="home_repair_service" className="text-[16px]" />
                    {draft.deliveryFormat === 'both'
                      ? 'In-Studio & Mobile Concierge'
                      : draft.deliveryFormat === 'mobile'
                        ? 'Mobile Concierge'
                        : 'In-Studio'}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    onClick={onEditBasics}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md hover:bg-surface-canvas text-on-surface font-label-sm text-label-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Icon name="edit" className="text-[16px] text-text-secondary" /> Edit Basics
                  </button>
                </div>
                <div className="absolute bottom-5 left-6 right-6 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    <span className="font-caption text-caption uppercase tracking-wider text-inverse-on-surface font-semibold">
                      {draft.provider || businessName}
                    </span>
                  </div>
                  <h2 className="font-heading-lg text-heading-lg font-bold text-on-primary text-shadow-sm leading-snug">
                    {draft.title}
                  </h2>
                  <p className="font-label-sm text-label-sm text-inverse-on-surface/80 flex items-center gap-1.5">
                    <Icon name="category" className="text-[16px]" />
                    {draft.primaryCategory} &gt; {draft.subCategory}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-surface-subtle flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="payments" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary font-medium">
                      Starting Session Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading-md text-heading-md font-bold text-on-surface">₦{draft.basePrice}</span>
                      <span className="font-label-sm text-label-sm text-text-tertiary line-through">
                        ₦{draft.comparePrice}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        Save ₦{saving.toLocaleString('en-US')} ({savingPercent}% off)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary font-medium">Standard Slot</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      {draft.durationMins} Minutes
                    </span>
                  </div>
                  <div className="h-8 w-px bg-surface-container-highest" />
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-secondary font-medium">Buffer</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      {draft.bufferMins} Minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <Icon name="layers" className="text-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                      Pricing &amp; Session Tiers Audit
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      {draft.tiers.length} active operational tiers configured for immediate customer checkout
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onEditPricing}
                  className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <Icon name="tune" className="text-[16px] text-text-secondary" /> Edit Tiers
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {tierCards(draft).map((tier, index) => (
                  <div
                    key={tier.badge}
                    className={`p-4 rounded-xl flex flex-col justify-between gap-3 relative transition-colors ${
                      index === 1 ? 'bg-surface-tint-blue/60 hover:bg-surface-tint-blue' : 'bg-surface-subtle hover:bg-surface-tint-blue/30'
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-md font-caption text-caption font-bold uppercase tracking-wider ${
                            index === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {tier.badge}
                        </span>
                      </div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface mt-1">{tier.name}</h4>
                      {tier.body && <p className="font-caption text-caption text-text-secondary line-clamp-2">{tier.body}</p>}
                    </div>
                    <div className="pt-2 flex items-baseline justify-between">
                      <span className="font-heading-sm text-heading-sm font-bold text-primary">₦{tier.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icon name="location_on" className="text-primary text-[20px]" />
                      <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">Branch Studios</h3>
                    </div>
                    <button
                      type="button"
                      onClick={onEditBranches}
                      className="text-primary font-caption text-caption font-semibold hover:underline"
                    >
                      Edit Studios
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {liveBranches
                      .filter((branch) => branch.id && draft.locations.includes(branch.id))
                      .map((branch) => (
                        <div key={branch.id} className="p-3.5 rounded-xl bg-surface-subtle flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <Icon name="domain" className="text-text-secondary text-[18px] mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-label-md text-label-md font-bold text-on-surface">{branch.name}</span>
                              <span className="font-caption text-caption text-text-secondary">{branch.area || '—'}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold whitespace-nowrap">
                            —
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 text-text-secondary font-caption text-caption">
                  <Icon name="schedule" className="text-[16px] text-primary" />
                  <span>
                    Booking lead notice: <strong className="text-on-surface">{draft.leadNotice}</strong>
                  </span>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icon name="shield" className="text-badge-discount-text text-[20px]" />
                      <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                        Booking &amp; Safety Policies
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={onEditBranches}
                      className="text-primary font-caption text-caption font-semibold hover:underline"
                    >
                      Edit Policies
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {draft.policies.map((policy) => (
                      <div key={policy.id || policy.title} className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-subtle">
                        <Icon name="verified_user" className="text-primary text-[18px] mt-0.5" />
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm font-semibold text-on-surface">{policy.title}</span>
                          <span className="font-caption text-caption text-text-secondary">{policy.body}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 text-badge-discount-text font-caption text-caption font-medium">
                  <Icon name="check_circle" className="text-[16px]" />
                  <span>All compliance checks passed</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon name="description" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                    Treatment Clinical Overview &amp; Attributes
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onEditDescription}
                  className="text-primary font-caption text-caption font-semibold hover:underline"
                >
                  Edit Narrative
                </button>
              </div>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                {draft.description || 'No description provided yet.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {narrativeChips(draft).map((chip) => (
                  <span
                    key={chip.label}
                    className="px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 bg-surface-tint-blue text-primary font-semibold"
                  >
                    <Icon name={chip.icon} className="text-[16px]" />
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-20">
            <div className="bg-surface-canvas rounded-2xl p-6 shadow-md flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Icon name="preview" className="text-primary text-[20px]" />
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    Client Discovery Simulator
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  Abuja Live View
                </span>
              </div>
              <div className="w-full bg-surface-subtle rounded-2xl p-4 shadow-inner flex flex-col gap-3">
                <div className="flex items-center justify-between px-1 text-text-tertiary">
                  <span className="font-caption text-caption font-semibold text-text-secondary">9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <Icon name="signal_cellular_alt" className="text-[14px]" />
                    <Icon name="wifi" className="text-[14px]" />
                    <Icon name="battery_full" className="text-[14px]" />
                  </div>
                </div>
                <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="relative h-32 w-full bg-surface-container">
                    <img
                      alt={draftImageAlt(draft.title, '')}
                      className="w-full h-full object-cover"
                      src={draft.image || NO_ITEM_IMAGE}
                    />
                  </div>
                  <div className="p-3.5 flex flex-col gap-2">
                    <span className="font-caption text-caption font-bold text-primary uppercase tracking-wide">
                      {draft.provider || businessName}
                    </span>
                    <div className="font-label-md text-label-md font-bold text-on-surface line-clamp-1">
                      {draft.title}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
                      <Icon name="timer" className="text-[14px]" /> {draft.durationMins} mins <span>•</span>
                      <span>Free cancellation</span>
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-text-tertiary line-through">
                          ₦{draft.comparePrice}
                        </span>
                        <span className="font-heading-sm text-heading-sm font-bold text-on-surface leading-none">
                          ₦{draft.basePrice}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-xs hover:bg-primary-container transition-colors"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-center font-caption text-caption text-text-tertiary">
                  Live render as experienced on mobile app &amp; web store
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {hasErrors ? (
                <div className="p-4 rounded-xl border border-error/30 bg-error/5 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-error font-label-sm text-label-sm font-bold">
                    <Icon name="error" className="text-[18px]" />
                    <span>{errorCount} Required {errorCount === 1 ? 'Item' : 'Items'} Missing Before Launch</span>
                  </div>
                  <ul className="text-caption font-caption text-text-secondary space-y-1 pl-5 list-disc">
                    {validationErrors.identity.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditBasics} className="text-primary underline font-medium">
                          Fix in Basics
                        </button>
                      </li>
                    ))}
                    {validationErrors.locations.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditBranches} className="text-primary underline font-medium">
                          Select Locations
                        </button>
                      </li>
                    ))}
                    {validationErrors.description.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditDescription} className="text-primary underline font-medium">
                          Fix in Description
                        </button>
                      </li>
                    ))}
                    {validationErrors.pricing.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditPricing} className="text-primary underline font-medium">
                          Fix in Pricing
                        </button>
                      </li>
                    ))}
                    {validationErrors.policies.map((e) => (
                      <li key={e}>
                        {e} —{' '}
                        <button type="button" onClick={onEditBranches} className="text-primary underline font-medium">
                          Add Policy
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center gap-2 font-caption text-caption font-semibold">
                  <Icon name="check_circle" className="text-[16px]" />
                  <span>All validation checks passed • Ready for instant storefront deployment</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePublish}
                disabled={publishState !== 'idle' || hasErrors}
                className={`w-full py-4 px-6 rounded-2xl active:scale-[0.99] text-on-primary font-button-primary text-button-primary shadow-lg transition-all flex items-center justify-center gap-2 group ${
                  publishState === 'success'
                    ? 'bg-badge-discount-text cursor-default'
                    : publishState === 'publishing'
                      ? 'bg-primary opacity-75 cursor-not-allowed'
                      : hasErrors
                        ? 'bg-surface-container-highest text-text-tertiary cursor-not-allowed opacity-60'
                        : 'bg-primary hover:bg-primary-container cursor-pointer'
                }`}
              >
                {publishState === 'idle' && (
                  <>
                    <span>Publish Service to Storefront</span>
                    <Icon name="rocket_launch" className="text-[20px] transition-transform group-hover:translate-x-1" />
                  </>
                )}
                {publishState === 'publishing' && (
                  <>
                    <Icon name="refresh" className="text-[20px] animate-spin" />
                    <span>Broadcasting to Storefronts...</span>
                  </>
                )}
                {publishState === 'success' && (
                  <>
                    <Icon name="check_circle" className="text-[20px]" />
                    <span>Service is Now Live!</span>
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="bookmark" className="text-[18px]" /> Save Draft
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="py-3 px-4 rounded-xl bg-surface-subtle hover:bg-surface-container-high text-on-surface font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="arrow_back" className="text-[18px]" /> Edit Steps
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-surface-tint-blue via-surface-subtle to-surface-canvas flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Icon name="bolt" className="text-primary text-[20px]" />
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  Next Growth Step: Deal Engine
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Once published, you can instantly plug this service into the{' '}
                <strong className="text-on-surface">Hyper-Local Deal Engine</strong> to broadcast flash-discounts during
                slower weekday afternoon slots across Abuja.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-caption text-caption text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                  Explore Deal Setup Guidelines →
                </span>
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-canvas shadow-sm flex items-center justify-between text-text-secondary">
              <div className="flex items-center gap-2 font-caption text-caption">
                <Icon name="lock" className="text-badge-discount-text text-[18px]" />
                <span>PCI-DSS &amp; NDPR Encrypted Deployment</span>
              </div>
              <span className="font-caption text-caption font-semibold text-primary cursor-pointer hover:underline">
                Compliance Desk
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
          publishState === 'success' ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-inverse-surface text-inverse-on-surface px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-badge-discount-text flex items-center justify-center text-on-primary">
            <Icon name="done_all" className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-bold">Service Successfully Published!</span>
            <span className="font-caption text-caption text-inverse-on-surface/80">
              Live on your storefront{draft.locations.length > 1 ? 's' : ''} now.
            </span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Edit Steps</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishState !== 'idle' || hasErrors}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-80"
            >
              {publishState === 'idle' && (
                <>
                  <span>Publish Service to Storefront</span>
                  <Icon name="rocket_launch" className="text-[20px]" />
                </>
              )}
              {publishState === 'publishing' && (
                <>
                  <Icon name="refresh" className="text-[20px] animate-spin" />
                  <span>Broadcasting to Storefronts...</span>
                </>
              )}
              {publishState === 'success' && (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Service is Now Live!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
