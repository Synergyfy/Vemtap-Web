import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { ServiceImageUploader } from '../../components/ServiceImageUploader';
import { ServiceLocationSelectorModal } from '../../components/ServiceLocationSelectorModal';
import { SERVICE_LOCATIONS, locationsToBranches } from '../serviceStudioShared';
import { describeServiceSector, getBusinessClassificationOptions } from '../serviceClassification';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ServiceDraft } from './desktopServiceDraft';

interface DesktopAddServiceStep1ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
  businessCategories?: string[];
  businessSubcategories?: string[];
}


const DELIVERY_OPTIONS: Array<{
  value: ServiceDraft['deliveryFormat'];
  icon: string;
  label: string;
  hint: string;
}> = [
  {
    value: 'in-salon',
    icon: 'domain',
    label: 'In-Salon / Studio',
    hint: 'Client visits your physical sanctuary or suite location.',
  },
  {
    value: 'mobile',
    icon: 'commute',
    label: 'At-Home / Mobile',
    hint: 'You or your licensed team travel directly to the client.',
  },
  {
    value: 'both',
    icon: 'all_inclusive',
    label: 'Both Options',
    hint: 'Offer on-site studio bookings and flexible mobile sessions.',
  },
];

const BEST_PRACTICES = [
  'Natural & Soothing Ambient Lighting',
  'Clear Session Durations on Card Preview',
  'Treatment Step & Benefit Transparency',
];



export function DesktopAddServiceStep1Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
  businessCategories = [],
  businessSubcategories = [],
}: DesktopAddServiceStep1ScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [consent, setConsent] = useState(true);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Available business categories if the business supports multiple classifications
  const categoryOptions = getBusinessClassificationOptions(businessCategories, businessSubcategories);

  // The service inherits its classification from the business profile, so the
  // sector is derived from the draft rather than re-asked here.
  const sectorLabel = describeServiceSector([draft.primaryCategory], [draft.subCategory]);

  const removeHighlight = (label: string) => {
    onDraftChange({ highlights: draft.highlights.filter((entry) => entry.label !== label) });
  };

  const addHighlight = () => {
    onDraftChange({
      highlights: [...draft.highlights, { icon: 'auto_awesome', label: 'Treatment Customization' }],
    });
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <section className="w-full bg-surface-canvas shadow-[0_1px_3px_rgba(13,37,76,0.03)]">
        <div className="max-w-7xl mx-auto px-margin py-space-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
                <button
                  type="button"
                  onClick={onBack}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Catalog Workflow
                </button>
                <span className="text-text-tertiary">/</span>
                <span className="text-text-secondary font-medium">Step 3 of 4: Offerings &amp; Catalog Setup</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <h1 className="font-heading-lg text-heading-lg text-text-primary">
                  Step 1 of 4: Service Basics &amp; Media
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-tint-blue font-caption text-caption font-medium text-primary">
                  Draft v1.3
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex flex-col gap-space-2xs w-48 sm:w-56">
                <div className="flex items-center justify-between font-caption text-caption">
                  <span className="text-text-secondary">Progress</span>
                  <span className="font-semibold text-primary">25% Completed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full w-1/4 transition-all duration-300" />
                </div>
              </div>
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-on-surface-variant font-button-secondary text-button-secondary transition-colors"
              >
                <Icon name="visibility" className="text-[18px]" />
                <span>Mobile Preview</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-margin py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-2xl p-6 lg:p-8 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon name="photo_library" className="text-primary text-[22px]" />
                    <h2 className="font-heading-md text-heading-md text-text-primary">Service Media (Required)</h2>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-1">
                    Upload high-resolution photography of treatment suites and treatments (up to 10 photos).
                  </p>
                </div>
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold px-2 py-1 bg-surface-subtle rounded-md self-start">
                  5 / 10 Added
                </span>
              </div>

              <ServiceImageUploader
                currentImage={draft.image}
                onImageChange={(url) => onDraftChange({ image: url })}
                aspectRatio="16/9"
              />

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-tint-blue text-on-surface-variant">
                <Icon name="tips_and_updates" className="text-primary text-[20px] shrink-0" />
                <p className="font-caption text-caption leading-relaxed">
                  <span className="font-semibold text-primary">Pro Tip:</span> Clean ambient treatment photos increase
                  appointment bookings by up to <strong className="text-text-primary">3.4x</strong> on local consumer
                  discovery.
                </p>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 lg:p-8 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Icon name="badge" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-text-primary">Service Identity &amp; Provider</h2>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="service-title">
                    Service Title <span className="text-error">*</span>
                  </label>
                  <span className="font-caption text-caption text-text-tertiary">
                    {draft.title.length} / 80 characters
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="service-title"
                    type="text"
                    value={draft.title}
                    onChange={(event) => onDraftChange({ title: event.target.value })}
                    className="w-full h-[52px] px-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none shadow-sm focus:shadow-[0_0_0_3px_rgba(6,108,244,0.18)] transition-all"
                  />
                </div>
                <span className="font-caption text-caption text-text-secondary">
                  Keep it descriptive and highlight unique benefits for nearby shoppers.
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-text-primary font-semibold">
                  Assigned Business Location &amp; Branch
                </label>
                <div className="p-4 rounded-xl bg-surface-subtle flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                        <Icon name="storefront" className="text-[22px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          {draft.provider}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">
                          {draft.locations.length === 0
                            ? 'No locations assigned yet'
                            : `${draft.locations.length} location${draft.locations.length > 1 ? 's' : ''} assigned`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocationModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-surface-canvas hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold shadow-xs transition-colors"
                    >
                      Change
                    </button>
                  </div>
                  {draft.locations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_LOCATIONS.filter((loc) => draft.locations.includes(loc.id)).map((loc) => (
                        <span
                          key={loc.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold"
                        >
                          <Icon name="location_on" className="text-[12px]" />
                          {loc.name.split('(')[0].trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <ServiceLocationSelectorModal
                isOpen={locationModalOpen}
                selectedLocations={draft.locations}
                onSave={(locs) =>
                  onDraftChange({ locations: locs, branches: locationsToBranches(locs) })
                }
                onClose={() => setLocationModalOpen(false)}
              />
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 lg:p-8 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Icon name="category" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-text-primary">
                  Service Category
                </h2>
              </div>
              <div className="bg-surface-tint-blue rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <Icon name="verified" className="text-[22px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                      Service Category
                    </h3>
                    <span className="font-caption text-caption font-semibold text-primary bg-surface-canvas px-2 py-0.5 rounded-full">
                      Inherited from business profile
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-1">
                    Your business already declared its classification during setup — this service inherits it
                    automatically, so there's nothing to re-enter here.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="font-label-md text-label-md font-semibold text-primary">
                      {draft.primaryCategory}
                    </span>
                    <Icon name="chevron_right" className="text-[18px] text-text-tertiary" />
                    <span className="font-label-md text-label-md font-medium text-text-primary">
                      {draft.subCategory}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary mt-2">
                    {sectorLabel} settings and suggested policies are applied automatically in the next steps.
                  </p>

                  {categoryOptions.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-primary/10 flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <Icon name="tune" className="text-primary text-[16px]" />
                        <label className="font-label-sm text-label-sm font-semibold text-text-primary">
                          Business supports multiple categories — choose which one applies to this service:
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categoryOptions.map((opt) => {
                          const isSelected =
                            draft.primaryCategory.toLowerCase() === opt.category.toLowerCase();
                          return (
                            <button
                              key={opt.category}
                              type="button"
                              onClick={() => {
                                onDraftChange({
                                  primaryCategory: opt.category,
                                  subCategory: opt.subCategory,
                                });
                              }}
                              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-surface-canvas border-primary shadow-xs ring-1 ring-primary'
                                  : 'bg-surface-canvas/60 border-outline/20 hover:bg-surface-canvas text-text-secondary'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon
                                  name={isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                                  className={`text-[18px] ${isSelected ? 'text-primary' : 'text-text-tertiary'}`}
                                />
                                <div className="truncate">
                                  <span className={`block font-label-md text-label-md truncate ${isSelected ? 'font-semibold text-text-primary' : 'font-medium'}`}>
                                    {opt.category}
                                  </span>
                                  <span className="block font-caption text-caption text-text-tertiary truncate">
                                    {opt.subCategory}
                                  </span>
                                </div>
                              </div>
                              <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container text-text-secondary shrink-0">
                                {opt.preset.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 lg:p-8 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Icon name="room_service" className="text-primary text-[22px]" />
                  <h2 className="font-heading-md text-heading-md text-text-primary">Service Delivery Format</h2>
                </div>
                <p className="font-body-md text-body-md text-text-secondary mt-1">
                  Specify where and how clients will experience this treatment.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {DELIVERY_OPTIONS.map((option) => {
                  const selected = draft.deliveryFormat === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all ${
                        selected
                          ? 'bg-surface-tint-blue shadow-sm'
                          : 'bg-surface-subtle hover:bg-surface-container-high/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selected ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          <Icon name={option.icon} className="text-[18px]" />
                        </div>
                        {selected ? (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary">
                            <Icon name="check" className="text-[14px]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-surface-container-high" />
                        )}
                      </div>
                      <span
                        className={`font-label-md text-label-md font-bold ${
                          selected ? 'text-primary' : 'text-text-primary'
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="font-caption text-caption text-text-secondary mt-1">{option.hint}</span>
                      <input
                        className="sr-only"
                        name="delivery_format"
                        type="radio"
                        checked={selected}
                        onChange={() => onDraftChange({ deliveryFormat: option.value })}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 lg:p-8 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="description" className="text-primary text-[22px]" />
                  <h2 className="font-heading-md text-heading-md text-text-primary">
                    Description &amp; Treatment Highlights
                  </h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-tint-blue hover:bg-primary-container hover:text-on-primary text-primary font-caption text-caption font-semibold transition-colors shadow-xs"
                >
                  <Icon name="auto_awesome" className="text-[16px]" />
                  <span>AI Polish with Wellness Tone</span>
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(event) => onDraftChange({ description: event.target.value })}
                  className="w-full p-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_3px_rgba(6,108,244,0.18)] leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between font-caption text-caption text-text-tertiary px-1">
                  <span>Markdown formatting supported</span>
                  <span>{draft.description.length} / 600 characters</span>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                  Quick Highlight Chips for Marketplace Card
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {draft.highlights.map((entry) => (
                    <span
                      key={entry.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold shadow-xs"
                    >
                      <Icon name={entry.icon} className="text-[14px]" />
                      {entry.label}
                      <button
                        type="button"
                        onClick={() => removeHighlight(entry.label)}
                        className="hover:text-error ml-1 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-subtle hover:bg-surface-container-high text-text-secondary font-caption text-caption font-medium transition-colors"
                  >
                    <Icon name="add" className="text-[14px]" />
                    Add Highlight
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 lg:p-8 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Icon name="verified_user" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-text-primary">
                  Client Requirements &amp; Suitability
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-text-primary font-semibold">
                    Gender Suitability
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['all', 'women', 'men'] as const).map((value) => {
                      const label = value === 'all' ? 'All Welcome' : value === 'women' ? 'Women Only' : 'Men Only';
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onDraftChange({ genderSuitability: value })}
                          className={
                            draft.genderSuitability === value
                              ? 'py-2.5 px-2 rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold text-center shadow-xs'
                              : 'py-2.5 px-2 rounded-xl bg-surface-subtle text-text-secondary hover:bg-surface-container-high font-label-md text-label-md font-medium text-center transition-colors'
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-text-primary font-semibold">
                    Age Range
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-caption text-caption text-text-tertiary">Min</span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={draft.ageMin}
                        onChange={(e) => onDraftChange({ ageMin: Number(e.target.value) })}
                        className="w-full h-[48px] pl-10 pr-3 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_3px_rgba(6,108,244,0.18)] transition-all text-right font-semibold"
                      />
                    </div>
                    <span className="text-text-tertiary font-caption">—</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-caption text-caption text-text-tertiary">Max</span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        placeholder="Any"
                        value={draft.ageMax ?? ''}
                        onChange={(e) => onDraftChange({ ageMax: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full h-[48px] pl-10 pr-3 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_3px_rgba(6,108,244,0.18)] transition-all text-right font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConsent((prev) => !prev)}
                className="flex items-start gap-3 p-4 rounded-xl bg-surface-subtle text-left"
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                    consent ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-text-tertiary'
                  }`}
                >
                  {consent && <Icon name="check" className="text-[16px]" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Mandatory Skin Consultation &amp; Health Consent
                  </span>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Require client to sign digital waiver &amp; skin sensitivity checklist automatically before their
                    appointment date.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">
            <div className="bg-surface-canvas rounded-2xl p-6 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-tertiary">
                  Live Storefront Preview
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" /> Dynamic Card
                </span>
              </div>
              <div className="rounded-xl overflow-hidden shadow-md bg-surface-canvas group">
                <div className="relative aspect-[16/10] bg-surface-container-high overflow-hidden">
                  <img alt="Service preview" className="w-full h-full object-cover" src={draft.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4wRhk7Z2awcljAxG1LjsDB3N2bAN7rQlDkEXDILlYF6i09D_DE0_JDmPFddvIXLKfZ-TtuSypTz0Kl3jUy7knUpU3HB4NuSb137foMDpgotXoiK7w3GVbU1FRlvDkCRSfNt7lLHtinSDkQaVQwt40lHDAj3DUxzf9tBWYtOf7qlTY-_mE9_3gDNIH9wVJF72-OJb0k0sqg-vLThSLsh7dq90yBqvw9fzIB1gXV-Fo2ZXSueR6oLefog'} />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-xs">
                      Instant Confirmation
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-surface-canvas font-caption text-caption font-medium">
                    {draft.durationMins} mins
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                    <span className="font-semibold text-text-primary flex items-center gap-1">
                      <Icon name="verified" className="text-primary text-[16px]" />
                      Glow &amp; Serenity Spa
                    </span>
                    <span className="flex items-center gap-0.5 text-text-tertiary">
                      <Icon name="near_me" className="text-[14px]" /> 0.8 km away
                    </span>
                  </div>
                  <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary leading-snug line-clamp-2">
                    {draft.title}
                  </h3>
                  <div className="flex items-center gap-1 font-caption text-caption text-text-secondary">
                    <Icon name="spa" className="text-[15px] text-badge-discount-text" />
                    <span>Sensitive Skin Safe • Steam &amp; LED</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-caption text-caption text-text-tertiary">Starting from</span>
                      <span className="font-heading-sm text-heading-sm font-bold text-primary">₦{draft.basePrice}</span>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-xs"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
              <p className="font-caption text-caption text-text-tertiary text-center">
                Reflects real-time styling in customer mobile app feed.
              </p>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Icon name="checklist" className="text-primary text-[20px]" />
                <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                  Marketplace Best Practices
                </h3>
              </div>
              <div className="flex flex-col gap-3 font-caption text-caption">
                {BEST_PRACTICES.map((entry) => (
                  <div key={entry} className="flex items-center gap-2.5 text-text-primary">
                    <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
            </div>

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
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft &amp; Exit</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              <span>Continue to Duration &amp; Pricing</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
