import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { describeServiceSector, getBusinessClassificationOptions } from './serviceClassification';
import type { ServiceDraft } from './serviceDraft';
import { ServiceImageUploader } from '../components/ServiceImageUploader';
import { ServiceLocationSelectorModal } from '../components/ServiceLocationSelectorModal';
import { SERVICE_LOCATIONS, locationsToBranches } from './serviceStudioShared';

interface BusinessAddServiceStep1ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  businessCategories?: string[];
  businessSubcategories?: string[];
}

const DELIVERY_OPTIONS: Array<{
  value: ServiceDraft['deliveryFormat'];
  icon: string;
  label: string;
  sub: string;
}> = [
  { value: 'in-salon', icon: 'storefront', label: 'In-Salon / Studio', sub: 'Client visits your physical location' },
  { value: 'mobile', icon: 'local_taxi', label: 'At-Home / Mobile', sub: 'You or team travel directly to client' },
  { value: 'both', icon: 'alt_route', label: 'Both Options', sub: 'Offer on-site and remote home services' },
];

const GENDER_OPTIONS: Array<{ value: 'all' | 'women' | 'men'; label: string }> = [
  { value: 'all', label: 'All Welcome' },
  { value: 'women', label: 'Women Only' },
  { value: 'men', label: 'Men Only' },
];

export function BusinessAddServiceStep1Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
  businessCategories = [],
  businessSubcategories = [],
}: BusinessAddServiceStep1ScreenProps) {
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const handleLocationSave = (selectedIds: string[]) => {
    onDraftChange({
      locations: selectedIds,
      branches: locationsToBranches(selectedIds),
    });
  };

  // Available business categories if the business supports multiple classifications
  const categoryOptions = getBusinessClassificationOptions(businessCategories, businessSubcategories);

  // The service inherits its classification from the business profile, so the
  // sector is derived from the draft rather than re-asked here.
  const sectorLabel = describeServiceSector([draft.primaryCategory], [draft.subCategory]);

  const toggleHighlight = (index: number) => {
    onDraftChange({
      highlights: draft.highlights.map((highlight, position) =>
        position === index ? { ...highlight, active: !highlight.active } : highlight,
      ),
    });
  };

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
              {'Add Service   Step 1: Service Basics & Media'}
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

      <div className="flex flex-col w-full pb-32">
        <section className="px-margin pt-space-md pb-space-sm">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="font-label-md text-label-md text-primary font-semibold">Step 1 of 4</span>
                <span className="font-body-md text-body-md text-text-secondary">• Service Basics</span>
              </div>
              <span className="bg-surface-tint-blue text-primary font-label-sm text-label-sm px-space-xs py-0.5 rounded-full font-medium">
                25% completed
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: '25%' }} />
            </div>
            <p className="font-caption text-caption text-text-secondary mt-space-2xs">
              Set up appointment bookings, treatments, or sessions with clear customer expectations.
            </p>
          </div>
        </section>

        <section className="px-margin mt-space-sm flex flex-col gap-space-sm">
          <ServiceImageUploader
            currentImage={draft.image}
            onImageChange={(imageUrl) => onDraftChange({ image: imageUrl })}
            aiContext={{
              itemName: draft.title,
              itemDescription: draft.description,
              category: draft.primaryCategory,
              subcategory: draft.subCategory,
            }}
          />
        </section>

        <section className="px-margin mt-space-lg flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-sm text-heading-sm text-on-surface">Service Identity</h2>
            <span className="font-caption text-caption text-text-tertiary">Basic Info</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-text-primary font-medium" htmlFor="service-title-input">
                Service Title <span className="text-error">*</span>
              </label>
              <span className="font-caption text-caption text-text-tertiary">{draft.title.length} / 80</span>
            </div>
            <div className="bg-surface-subtle rounded-lg px-space-sm py-2.5 flex items-center focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
              <input
                className="w-full bg-transparent font-body-md text-body-md text-text-primary outline-none placeholder-text-tertiary"
                id="service-title-input"
                maxLength={80}
                placeholder="e.g. 60 Min Classic Therapeutic Massage"
                type="text"
                value={draft.title}
                onChange={(event) => onDraftChange({ title: event.target.value })}
              />
            </div>
            <p className="font-caption text-caption text-text-secondary">
              Be clear and descriptive so customers spot this immediately on search.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <span className="font-label-sm text-label-sm text-text-secondary font-medium">Listed Under Provider</span>
            <div className="flex items-center justify-between bg-surface-container-low rounded-lg p-space-xs">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <Icon className="text-[20px]" filled name="spa" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                      {draft.provider}
                    </span>
                    <Icon className="text-primary text-[16px]" filled name="verified" />
                  </div>
                  <span className="font-caption text-caption text-text-secondary">
                    Main Branch • Downtown Flagship
                  </span>
                </div>
              </div>
              <button
                className="text-primary font-label-sm text-label-sm font-medium px-space-xs py-1 rounded hover:bg-surface-container transition-colors"
                type="button"
                onClick={() => setLocationModalOpen(true)}
              >
                Change
              </button>
            </div>
            {draft.locations && draft.locations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {draft.locations.map((locId) => {
                  const loc = SERVICE_LOCATIONS.find((l) => l.id === locId);
                  return (
                    <span
                      key={locId}
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-container text-text-secondary"
                    >
                      {loc?.name || locId}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="px-margin mt-space-lg flex flex-col gap-space-sm">
          <h2 className="font-heading-sm text-heading-sm text-on-surface">Service Category</h2>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Icon name="verified" className="text-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">Service Category</span>
                  <span className="font-caption text-caption font-semibold text-primary bg-surface-canvas px-1.5 py-0.5 rounded-full">
                    Inherited
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Matched to your business profile — no need to enter it again.
                </p>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-space-2xs">
                  <span className="font-label-md text-label-md font-semibold text-primary">{draft.primaryCategory}</span>
                  <Icon name="chevron_right" className="text-[16px] text-text-tertiary" />
                  <span className="font-label-sm text-label-sm font-medium text-text-primary">{draft.subCategory}</span>
                </div>
                <p className="font-caption text-caption text-text-tertiary mt-0.5">
                  {sectorLabel} settings and suggested policies are applied automatically in the next steps.
                </p>

                {categoryOptions.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-primary/10 flex flex-col gap-2">
                    <span className="font-caption text-caption font-semibold text-text-primary">
                      Switch to another category from your business profile:
                    </span>
                    <div className="flex flex-col gap-1.5">
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
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                              isSelected
                                ? 'bg-surface-canvas border-primary shadow-xs ring-1 ring-primary'
                                : 'bg-surface-canvas/60 border-outline/20 hover:bg-surface-canvas text-text-secondary'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon
                                name={isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                                className={`text-[16px] ${isSelected ? 'text-primary' : 'text-text-tertiary'}`}
                              />
                              <div className="truncate">
                                <span className={`block font-label-sm text-label-sm truncate ${isSelected ? 'font-semibold text-text-primary' : 'font-medium'}`}>
                                  {opt.category}
                                </span>
                                <span className="block font-caption text-caption text-text-tertiary truncate">
                                  {opt.subCategory}
                                </span>
                              </div>
                            </div>
                            <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-text-secondary shrink-0">
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
            <div className="flex flex-col gap-space-xs pt-space-2xs">
              <span className="font-label-md text-label-md text-text-primary font-medium">
                Service Delivery Format
              </span>
              <div className="grid grid-cols-1 gap-space-xs">
                {DELIVERY_OPTIONS.map((option) => {
                  const isSelected = draft.deliveryFormat === option.value;
                  return (
                    <button
                      key={option.value}
                      className={`rounded-xl p-space-sm flex items-center justify-between cursor-pointer transition-all ${
                        isSelected ? 'bg-surface-tint-blue shadow-sm' : 'bg-surface-container-low'
                      }`}
                      type="button"
                      onClick={() => onDraftChange({ deliveryFormat: option.value })}
                    >
                      <div className="flex items-center gap-space-sm">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-secondary'
                          }`}
                        >
                          <Icon name={option.icon} className="text-[20px]" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span
                            className={`font-label-md text-label-md text-text-primary ${
                              isSelected ? 'font-semibold' : 'font-medium'
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="font-caption text-caption text-text-secondary">{option.sub}</span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest'
                        }`}
                      >
                        {isSelected && <Icon name="check" className="text-[14px]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-margin mt-space-lg flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-sm text-heading-sm text-on-surface">Description &amp; Highlights</h2>
            <div className="flex items-center gap-1 bg-surface-tint-blue px-2 py-0.5 rounded-full shadow-sm">
              <Icon name="auto_awesome" className="text-primary text-[14px]" />
              <span className="font-caption text-caption text-primary font-medium">AI Polish Ready</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <label className="font-label-md text-label-md text-text-primary font-medium" htmlFor="service-description">
              Detailed Service Overview
            </label>
            <div className="bg-surface-subtle rounded-lg p-space-sm focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
              <textarea
                className="w-full bg-transparent font-body-md text-body-md text-text-primary outline-none resize-none placeholder-text-tertiary"
                id="service-description"
                placeholder="Describe what client experiences during this treatment..."
                rows={4}
                value={draft.description}
                onChange={(event) => onDraftChange({ description: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-space-xs mt-space-2xs">
              <span className="font-caption text-caption text-text-secondary font-medium">
                Quick Highlight Tags (Tap to toggle)
              </span>
              <div className="flex flex-wrap gap-space-xs">
                {draft.highlights.map((highlight, index) => (
                  <button
                    key={highlight.text}
                    className={`px-space-xs py-1 rounded-full font-label-sm text-label-sm font-medium transition-all ${
                      highlight.active
                        ? 'bg-surface-tint-blue text-primary shadow-sm'
                        : 'bg-surface-container-low text-text-secondary hover:bg-surface-container'
                    }`}
                    type="button"
                    onClick={() => toggleHighlight(index)}
                  >
                    {highlight.active ? '✓' : '+'} {highlight.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-margin mt-space-lg flex flex-col gap-space-sm">
          <h2 className="font-heading-sm text-heading-sm text-on-surface">
            Client Requirements &amp; Suitability
          </h2>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-text-primary font-medium">Gender Suitability</span>
              <div className="flex items-center gap-space-xs">
                {GENDER_OPTIONS.map((option) => {
                  const isSelected = (draft.genderSuitability || 'all') === option.value;
                  return (
                    <button
                      key={option.value}
                      className={`flex-1 py-2 px-space-xs rounded-full font-label-md text-label-md text-center transition-all ${
                        isSelected
                          ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                          : 'bg-surface-container-low text-text-secondary font-medium hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => onDraftChange({ genderSuitability: option.value })}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-space-xs">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-text-primary font-medium">
                  Age Range Requirement
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Specify minimum and optional maximum age
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-surface-container px-3 py-1.5 rounded-xl">
                  <span className="font-caption text-caption text-text-secondary">Min:</span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={draft.ageMin ?? 16}
                    onChange={(e) => onDraftChange({ ageMin: Number(e.target.value) || 0 })}
                    className="w-12 bg-transparent font-label-md text-label-md font-semibold text-text-primary text-center focus:outline-none"
                  />
                </div>
                <span className="text-text-tertiary">–</span>
                <div className="flex items-center gap-1 bg-surface-container px-3 py-1.5 rounded-xl">
                  <span className="font-caption text-caption text-text-secondary">Max:</span>
                  <input
                    type="number"
                    min={draft.ageMin ?? 16}
                    max={120}
                    placeholder="None"
                    value={draft.ageMax ?? ''}
                    onChange={(e) =>
                      onDraftChange({ ageMax: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-12 bg-transparent font-label-md text-label-md font-semibold text-text-primary text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pt-space-sm pb-safe shadow-[0_-4px_20px_rgba(17,24,39,0.06)] flex flex-col gap-space-xs">
        <button
          className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] transition-all"
          type="button"
          onClick={onNext}
        >
          <span>Continue to Duration &amp; Pricing</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
        <button
          className="w-full h-11 flex items-center justify-center font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary active:scale-[0.98] transition-colors"
          type="button"
          onClick={onSaveDraft}
        >
          Save as Draft &amp; Exit
        </button>
      </div>

      <ServiceLocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        selectedLocations={draft.locations || ['main']}
        onSave={handleLocationSave}
      />
    </AppScreen>
  );
}
