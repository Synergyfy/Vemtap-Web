import { Fragment } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { BusinessProfileDraft } from './DesktopBusinessOnboardingScreen';
import { CATEGORY_OPTIONS, MOCKUP_SEED_CHAR_COUNT, SEED_DESCRIPTION, SUBCATEGORY_TAGS } from './businessOnboardingData';

interface DesktopBusinessProfileBasicScreenProps {
  draft: BusinessProfileDraft;
  onDraftChange: (patch: Partial<BusinessProfileDraft>) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const PREVIEW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5dzA4NBAOCv8WHjHeAUd0GDHJuw3Xu9Wt_eewOB-81uuYogGXyQ6MFM98NYjTQRSM3oOSevn6R6MYNHn9HIshGOXM9F_mGWj0f6XtvdcBO5r6p9C_g6xN2DjZ2TWv71WNNByGsVIY65oH1-uEw48N9OgZytM-xS3cIYNegsQxRCxC_OKVjSmPuyMAuDiR3WW7SbMbW77BRJv0naZYXPjPch665tF_fD7Xkq4VGBet';

export function DesktopBusinessProfileBasicScreen({
  draft,
  onDraftChange,
  onPrevious,
  onNext,
  onSaveDraft,
}: DesktopBusinessProfileBasicScreenProps) {
  const descriptionCount =
    draft.description === SEED_DESCRIPTION ? MOCKUP_SEED_CHAR_COUNT : draft.description.length;

  const toggleTag = (tag: string) => {
    const selected = draft.tags.includes(tag);
    if (!selected && draft.tags.length >= 2) return;
    onDraftChange({
      tags: selected ? draft.tags.filter((item) => item !== tag) : [...draft.tags, tag],
    });
  };

  const hasName = draft.name.trim().length > 0;
  const hasDescription = draft.description.trim().length > 0;

  const checklistRow = (label: string, ok: boolean, okValue: string, failValue: string) => (
    <div className="flex items-center justify-between font-label-sm text-caption text-on-surface">
      <span className="flex items-center gap-space-2xs">
        <Icon
          name={ok ? 'check_circle' : 'error'}
          filled
          className={`text-[16px] ${ok ? 'text-badge-discount-text' : 'text-error'}`}
        />
        <span>{label}</span>
      </span>
      <span className={`font-semibold ${ok ? 'text-badge-discount-text' : 'text-error'}`}>
        {ok ? okValue : failValue}
      </span>
    </div>
  );

  return (
    <BusinessSetupChrome activeNav="profile">
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
            <div>
              <div className="flex items-center gap-space-xs mb-space-2xs">
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-label-sm text-caption font-semibold">
                  Step 1 of 3
                </span>
                <span className="font-label-sm text-caption text-text-secondary">Basic Info (33% Complete)</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-on-surface">Store Setup &amp; Discovery Profile</h1>
            </div>
            <div className="flex items-center gap-space-md bg-surface-subtle px-space-md py-space-xs rounded-xl shadow-sm">
              <div className="flex items-center gap-space-2xs text-text-secondary font-label-sm text-label-sm">
                <Icon name="verified" className="text-primary text-[18px]" />
                <span>
                  District Auto-Sync: <strong>Active</strong>
                </span>
              </div>
              <span className="w-1 h-3 rounded-full bg-surface-variant" />
              <div className="text-text-secondary font-caption text-caption">Estimated 4 mins remaining</div>
            </div>
          </div>
          <div className="relative w-full">
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full w-1/3 transition-all duration-500 ease-out" />
            </div>
            <div className="grid grid-cols-3 pt-space-sm gap-space-md">
              <div className="flex items-center gap-space-xs group">
                <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-caption font-semibold shadow-sm">
                  1
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-primary font-semibold truncate">1. Basic Info</span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Identity &amp; Classification
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs opacity-60">
                <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-sm text-caption font-semibold">
                  2
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface truncate">2. Visual Branding</span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Logos &amp; Storefront Banners
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs opacity-60">
                <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-sm text-caption font-semibold">
                  3
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface truncate">
                    3. Contact &amp; Channels
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    WhatsApp, In-District Desks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-space-xl">
        <div className="w-full mb-space-xl p-space-md rounded-xl bg-surface-tint-blue shadow-sm flex items-start sm:items-center justify-between gap-space-md">
          <div className="flex items-start sm:items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-on-primary">
              <Icon name="local_police" filled className="text-[20px]" />
            </div>
            <div>
              <h2 className="font-heading-sm text-heading-sm text-on-surface">District Verified Profile</h2>
              <p className="font-body-md text-body-md text-text-secondary">
                Your business details are verified before publishing to shoppers in your district.
              </p>
            </div>
          </div>
          <span className="hidden md:inline-flex items-center gap-space-2xs px-space-sm py-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-semibold flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
            Priority Fast-Track
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            <div>
              <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                Step 01 / General Foundation
              </span>
              <h2 className="font-display-hero text-display-hero text-on-surface tracking-tight mt-space-2xs">
                Tell us about your business
              </h2>
              <p className="font-body-lg text-body-lg text-text-secondary mt-space-xs">
                This information helps local customers discover your store and services across your district.
              </p>
            </div>
            <form
              className="flex flex-col gap-space-lg"
              onSubmit={(event) => {
                event.preventDefault();
                onNext();
              }}
            >
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="business-name">
                    Business Name <span className="text-error">*</span>
                  </label>
                  <span className="font-caption text-caption text-text-secondary">Appears in discover feeds</span>
                </div>
                <div className="relative flex items-center">
                  <Icon name="storefront" className="absolute left-space-md text-text-tertiary text-[20px]" />
                  <input
                    id="business-name"
                    type="text"
                    value={draft.name}
                    onChange={(event) => onDraftChange({ name: event.target.value })}
                    placeholder="e.g. Urban Grill & Bistro"
                    className="w-full h-[52px] pl-[46px] pr-space-md rounded-xl bg-surface-canvas shadow-sm text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-label-md text-on-surface font-semibold"
                    htmlFor="primary-category"
                  >
                    Primary Category <span className="text-error">*</span>
                  </label>
                  <span className="font-caption text-caption text-text-secondary">Dictates primary indexing</span>
                </div>
                <div className="relative flex items-center">
                  <Icon name="restaurant" className="absolute left-space-md text-text-tertiary text-[20px]" />
                  <select
                    id="primary-category"
                    value={draft.category}
                    onChange={(event) => onDraftChange({ category: event.target.value })}
                    className="w-full h-[52px] pl-[46px] pr-10 rounded-xl bg-surface-canvas shadow-sm text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container appearance-none transition-all cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="expand_more"
                    className="absolute right-space-md pointer-events-none text-text-secondary text-[20px]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Subcategory Specialties <span className="text-error">*</span>
                  </label>
                  <span className="font-label-sm text-caption text-primary font-semibold" id="selected-tag-counter">
                    {draft.tags.length} of 2 selected
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  Select specialties so search filters pinpoint your culinary profile.
                </p>
                <div className="flex flex-wrap gap-space-xs pt-space-2xs" id="tag-group">
                  {SUBCATEGORY_TAGS.map((tag) => {
                    const selected = draft.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`h-[38px] px-space-md rounded-full flex items-center gap-space-xs font-label-md text-label-md shadow-sm hover:scale-[1.02] transition-transform ${
                          selected
                            ? 'text-primary bg-surface-tint-blue'
                            : 'text-text-secondary bg-surface-canvas hover:text-on-surface'
                        }`}
                      >
                        <Icon
                          name={selected ? 'check' : 'add'}
                          filled={selected}
                          className={`text-[16px] ${selected ? '' : 'text-text-tertiary'}`}
                        />
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-label-md text-on-surface font-semibold"
                    htmlFor="store-description"
                  >
                    Storefront Description <span className="text-error">*</span>
                  </label>
                  <span className="font-caption text-caption text-text-secondary font-medium" id="char-counter">
                    {descriptionCount}/250
                  </span>
                </div>
                <textarea
                  id="store-description"
                  maxLength={250}
                  rows={4}
                  value={draft.description}
                  onChange={(event) => onDraftChange({ description: event.target.value })}
                  className="w-full p-space-md rounded-xl bg-surface-canvas shadow-sm text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container resize-none transition-all"
                />
                <p className="font-caption text-caption text-text-secondary flex items-center gap-space-2xs">
                  <Icon name="info" className="text-[16px] text-text-tertiary" />
                  Highlight your culinary focus, ambiance, and signature dishes for neighborhood shoppers.
                </p>
              </div>

              <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-lg order-2 sm:order-1">
                  <button
                    type="button"
                    onClick={onPrevious}
                    className="font-button-secondary text-button-secondary text-text-secondary hover:text-primary transition-colors flex items-center gap-space-2xs"
                  >
                    <Icon name="arrow_back" className="text-[18px]" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSaveDraft}
                    className="font-button-secondary text-button-secondary text-text-secondary hover:text-primary transition-colors flex items-center gap-space-2xs"
                  >
                    <Icon name="save" className="text-[18px]" />
                    <span>Save as Draft</span>
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto h-[52px] px-space-xl rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-space-xs order-1 sm:order-2"
                >
                  <span>Continue to Branding</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
              </div>
            </form>

            <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-md mt-space-md">
              <Icon name="verified_user" className="text-primary text-[24px]" />
              <div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">
                  VEMTAP One-Tap Verified Standard
                </h3>
                <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                  Every profile completed with accredited taxonomy ranks 3.4x higher in neighborhood geo-fences,
                  giving instant mobile visibility to walk-in patrons.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Live Consumer Feed Card Preview
                </span>
              </div>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-container font-caption text-caption text-primary font-medium">
                Real-time
              </span>
            </div>

            <div className="w-full bg-surface-canvas rounded-2xl shadow-xl overflow-hidden group">
              <div className="relative h-56 w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="An inviting, high-end warm bistro and grill interior with exposed wooden beams, glowing ambient filament lamps, sizzling charcoal grill kitchen in soft bokeh background, and elegant dining tables."
                  src={PREVIEW_IMAGE}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent" />
                <div className="absolute top-space-md left-space-md flex items-center gap-space-xs">
                  <span className="px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-bold shadow-sm flex items-center gap-space-2xs">
                    <Icon name="local_fire_department" className="text-[14px]" />
                    <span>Trending District Spot</span>
                  </span>
                </div>
                <div className="absolute top-space-md right-space-md w-9 h-9 rounded-full bg-surface-canvas/90 backdrop-blur-md flex items-center justify-center text-text-secondary shadow-sm">
                  <Icon name="favorite" className="text-[18px]" />
                </div>
                <div className="absolute bottom-space-md left-space-md right-space-md flex items-end justify-between text-on-primary">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-11 h-11 rounded-xl bg-surface-canvas shadow-md p-1 flex items-center justify-center flex-shrink-0">
                      <div className="w-full h-full rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                        <Icon name="restaurant_menu" className="text-[24px]" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-caption text-primary-fixed uppercase tracking-wider font-semibold">
                        {draft.category}
                      </span>
                      <span className="font-heading-sm text-heading-sm font-bold text-on-primary drop-shadow-sm truncate">
                        {draft.name.trim().length > 0 ? draft.name.trim() : 'Your Business Name'}
                      </span>
                    </div>
                  </div>
                  <div className="px-space-xs py-space-2xs rounded-lg bg-inverse-surface/80 backdrop-blur-md font-label-sm text-caption font-semibold flex items-center gap-space-2xs">
                    <Icon name="near_me" className="text-[14px] text-badge-discount-text" />
                    <span>0.3 mi</span>
                  </div>
                </div>
              </div>

              <div className="p-space-lg flex flex-col gap-space-md">
                <div
                  className="flex items-center gap-space-xs text-text-secondary font-label-sm text-caption truncate"
                  id="preview-tags-meta"
                >
                  {draft.tags.length === 0 ? (
                    <span className="text-text-secondary">Select specialties above &bull; Within your district</span>
                  ) : (
                    <>
                      {draft.tags.map((tag, index) => (
                        <Fragment key={tag}>
                          {index > 0 && <span>&bull;</span>}
                          <span className="font-medium text-primary">{tag}</span>
                        </Fragment>
                      ))}
                      <span>&bull;</span>
                      <span className="text-text-secondary">Within your district</span>
                    </>
                  )}
                </div>
                <p className="font-body-md text-body-md text-text-secondary line-clamp-2" id="preview-desc-text">
                  {draft.description.trim().length > 0
                    ? draft.description
                    : 'Provide a brief summary of what you offer to let neighbors explore your craft.'}
                </p>
                <div className="pt-space-xs flex items-center justify-between text-on-surface">
                  <div className="flex items-center gap-space-xs">
                    <div className="flex items-center text-tertiary-container">
                      <Icon name="star" filled className="text-[18px]" />
                      <span className="font-label-md text-label-md font-bold ml-1">4.9</span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary">(120+ local patrons)</span>
                  </div>
                  <div className="flex items-center gap-space-2xs text-badge-discount-text font-label-sm text-caption font-medium bg-badge-discount-bg px-space-xs py-space-2xs rounded-md">
                    <Icon name="bolt" className="text-[14px]" />
                    <span>Instant Tap Perks</span>
                  </div>
                </div>
                <div className="pt-space-2xs">
                  <div className="w-full h-11 rounded-xl bg-surface-subtle flex items-center justify-between px-space-md text-text-secondary font-label-md text-label-md">
                    <span className="flex items-center gap-space-xs">
                      <Icon name="storefront" className="text-primary text-[18px]" />
                      <span>Visit Storefront</span>
                    </span>
                    <Icon name="chevron_right" className="text-[18px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-canvas shadow-sm flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
                <Icon name="preview" className="text-[18px]" />
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                This is how your business identity card appears in nearby customer feeds, map searches, and promotion
                banners. Keep names clean and categories precise to capture high-intent local foot traffic.
              </p>
            </div>

            <div className="p-space-md rounded-xl bg-surface-canvas shadow-sm flex flex-col gap-space-xs">
              <span className="font-label-sm text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Step 1 Checklist
              </span>
              {checklistRow('Official Business Identity', hasName, 'Valid', 'Required')}
              {checklistRow(
                'District Taxonomy Assigned',
                draft.tags.length > 0,
                `${draft.tags.length} Tags`,
                'None Selected',
              )}
              {checklistRow('Storefront Summary & Hooks', hasDescription, 'Optimal', 'Required')}
            </div>
          </div>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
