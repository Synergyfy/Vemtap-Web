import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MultiSelectDropdown } from '../components/ui/MultiSelectDropdown';
import type { BusinessProfileDraft } from './BusinessOnboardingScreen';
import { useBusinessCategoryOptions } from '../hooks/business/useBusinessCategoryOptions';
import {
  BUSINESS_CATEGORIES,
  MAX_CATEGORY_SELECTIONS,
  MAX_SUBCATEGORY_SELECTIONS,
  MIN_CATEGORY_SELECTIONS,
  MIN_SUBCATEGORY_SELECTIONS,
  MOCKUP_SEED_CHAR_COUNT,
  SEED_DESCRIPTION,
} from './businessOnboardingSeed';

interface BusinessProfileBasicScreenProps {
  draft: BusinessProfileDraft;
  onChange: (patch: Partial<BusinessProfileDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}



export function BusinessProfileBasicScreen({
  draft,
  onChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessProfileBasicScreenProps) {
  const [showErrors, setShowErrors] = useState(false);
  const categoryData = useBusinessCategoryOptions(BUSINESS_CATEGORIES);
  const CATEGORY_OPTIONS = categoryData.options.map((category) => ({ value: category.value, label: category.label }));
  /** Subcategories available for a given set of parent categories (order preserved, deduped). */
  const availableSubcategories = (selected: string[]): string[] => {
    const subcategories = categoryData.options
      .filter((category) => selected.includes(category.value))
      .flatMap((category) => category.subcategories);
    return subcategories.filter((subcategory, index) => subcategories.indexOf(subcategory) === index);
  };

  const descriptionCount =
    draft.description === SEED_DESCRIPTION ? MOCKUP_SEED_CHAR_COUNT : draft.description.length;

  const previewTitle = draft.name.trim() || 'Your Store Name';
  const previewSubtitle = draft.tags.length > 0 ? draft.tags.join(' • ') : 'Select specialty';

  const subcategories = availableSubcategories(draft.categories);
  const subcategoryOptions = subcategories.map((subcategory) => ({ value: subcategory, label: subcategory }));

  const handleCategoryChange = (categories: string[]) => {
    const validSubcategories = availableSubcategories(categories);
    onChange({
      categories,
      // Drop subcategories that no longer belong to any selected parent category.
      tags: draft.tags.filter((tag) => validSubcategories.includes(tag)),
    });
  };

  const hasName = draft.name.trim().length > 0;
  const hasEnoughCategories = draft.categories.length >= MIN_CATEGORY_SELECTIONS;
  const hasEnoughSubcategories = draft.tags.length >= MIN_SUBCATEGORY_SELECTIONS;
  const canContinue = hasName && hasEnoughCategories && hasEnoughSubcategories;
  const missingFields = [
    !hasName ? 'a business name' : null,
    !hasEnoughCategories ? `at least ${MIN_CATEGORY_SELECTIONS} categories` : null,
    !hasEnoughSubcategories ? `at least ${MIN_SUBCATEGORY_SELECTIONS} specialties` : null,
  ].filter((value): value is string => Boolean(value));

  const handleContinue = () => {
    if (!canContinue) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    onNext();
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go Back"
              className="w-11 h-11 flex items-center justify-center -ml-2 text-on-surface hover:text-primary transition-colors focus:outline-none shrink-0"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate max-w-[210px]">Basic Information</h1>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full">
        <div className="px-margin pt-space-md pb-space-2xl space-y-space-lg">
          <div className="space-y-space-2xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-primary-container font-semibold tracking-wide uppercase">
                Step 1 of 3: Basic Info
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">33% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full transition-all duration-300 w-1/3" />
            </div>
          </div>

          <div className="space-y-space-2xs">
            <h2 className="font-heading-lg text-heading-lg text-text-primary">Tell us about your business</h2>
            <p className="font-body-md text-body-md text-text-secondary">
              This information helps local customers discover your store and services across your district.
            </p>
          </div>

          <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm shadow-sm">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
              <Icon className="text-primary-container text-[20px]" name="verified_user" filled />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md text-text-primary font-semibold">District Verified Profile</p>
              <p className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">
                Your business details are verified before publishing to shoppers in your district.
              </p>
            </div>
          </div>

          <div className="space-y-space-lg">
            <div className="space-y-space-2xs">
              <label className="block font-label-md text-label-md text-text-primary" htmlFor="business-name">
                Business Name <span className="text-error">*</span>
              </label>
              <div
                className={`relative flex items-center bg-surface-container-lowest rounded-xl shadow-sm transition-all ${
                  showErrors && !hasName ? 'ring-2 ring-error' : ''
                }`}
              >
                <div className="absolute left-4 flex items-center pointer-events-none text-text-tertiary">
                  <Icon name="storefront" className="text-[20px]" />
                </div>
                <input
                  className="w-full h-[52px] pl-11 pr-4 bg-transparent font-body-md text-body-md text-text-primary placeholder-text-tertiary rounded-xl focus:outline-none focus:bg-surface-subtle transition-all"
                  id="business-name"
                  placeholder="e.g. Oak Street Market"
                  type="text"
                  value={draft.name}
                  onChange={(event) => onChange({ name: event.target.value })}
                />
              </div>
              {showErrors && !hasName && (
                <p className="font-caption text-caption text-error px-1">Business name is required.</p>
              )}
            </div>

            <div className="space-y-space-2xs">
              <div className="flex items-center justify-between">
                <label className="block font-label-md text-label-md text-text-primary">
                  Business Categories <span className="text-error">*</span>
                </label>
                <span className="font-caption text-caption text-text-secondary font-medium">
                  Select at least {MIN_CATEGORY_SELECTIONS}
                </span>
              </div>
              <div
                className={`rounded-xl transition-all ${
                  showErrors && !hasEnoughCategories ? 'ring-2 ring-error' : ''
                }`}
              >
                <MultiSelectDropdown
                  ariaLabel="Select business categories"
                  maxSelected={MAX_CATEGORY_SELECTIONS}
                  placeholder="Choose business categories"
                  values={draft.categories}
                  options={CATEGORY_OPTIONS}
                  onChange={handleCategoryChange}
                />
              </div>
              {showErrors && !hasEnoughCategories ? (
                <p className="font-caption text-caption text-error px-1">
                  Select at least {MIN_CATEGORY_SELECTIONS} business categories to continue.
                </p>
              ) : (
                <p className="font-caption text-caption text-text-tertiary px-1">
                  Helps assign your store to the right category carousel on nearby feeds.
                </p>
              )}
            </div>

            <div className="space-y-space-2xs">
              <div className="flex items-center justify-between">
                <label className="block font-label-md text-label-md text-text-primary">
                  Subcategory Specialties <span className="text-error">*</span>
                </label>
                <span className="font-caption text-caption text-primary-container font-semibold">
                  {draft.tags.length} / {MAX_SUBCATEGORY_SELECTIONS} selected
                </span>
              </div>
              <div
                className={`rounded-xl transition-all ${
                  showErrors && !hasEnoughSubcategories ? 'ring-2 ring-error' : ''
                }`}
              >
                <MultiSelectDropdown
                  ariaLabel="Select subcategory specialties"
                  disabled={draft.categories.length === 0}
                  maxSelected={MAX_SUBCATEGORY_SELECTIONS}
                  placeholder={
                    draft.categories.length === 0 ? 'Select categories first' : 'Choose subcategories'
                  }
                  values={draft.tags}
                  options={subcategoryOptions}
                  onChange={(tags) => onChange({ tags })}
                />
              </div>
              {showErrors && !hasEnoughSubcategories ? (
                <p className="font-caption text-caption text-error px-1">
                  Select at least {MIN_SUBCATEGORY_SELECTIONS} subcategory from your chosen categories.
                </p>
              ) : (
                <p className="font-caption text-caption text-text-tertiary px-1">
                  Subcategories update automatically based on your selected categories.
                </p>
              )}
            </div>

            <div className="space-y-space-2xs">
              <div className="flex items-center justify-between">
                <label className="block font-label-md text-label-md text-text-primary" htmlFor="storefront-desc">
                  Storefront Description
                </label>
                <span className="font-caption text-caption text-text-secondary">{descriptionCount} / 250</span>
              </div>
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-3 focus-within:bg-surface-subtle transition-all">
                <textarea
                  className="w-full bg-transparent font-body-md text-body-md text-text-primary resize-none focus:outline-none placeholder-text-tertiary leading-relaxed"
                  id="storefront-desc"
                  maxLength={250}
                  placeholder="Introduce what makes your business special..."
                  rows={3}
                  value={draft.description}
                  onChange={(event) => onChange({ description: event.target.value })}
                />
              </div>
              <p className="font-caption text-caption text-text-tertiary px-1">
                Appears on your deal cards and search results.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-tertiary font-semibold uppercase tracking-wider">
                  Consumer Card Preview
                </span>
                <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full font-medium">
                  Live Preview
                </span>
              </div>
              <div className="flex items-center gap-space-sm bg-surface-subtle p-space-xs rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  <Icon name="restaurant" className="text-primary-container text-[24px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate">{previewTitle}</h4>
                  <p className="font-caption text-caption text-text-secondary truncate">{previewSubtitle}</p>
                  <span className="font-caption text-caption text-primary-container font-medium flex items-center gap-0.5 mt-0.5">
                    <Icon name="pin_drop" className="text-[14px]" />
                    Within your district
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-space-md pb-space-lg space-y-space-md">
            {showErrors && !canContinue && (
              <div role="alert" className="rounded-xl border border-error/40 bg-error-container/60 p-space-sm flex items-start gap-space-sm">
                <Icon name="error" className="text-on-error text-[18px] shrink-0 mt-0.5" filled />
                <span className="font-body-sm text-body-sm text-on-error">
                  Still needed before you can continue: {missingFields.join(', ')}.
                </span>
              </div>
            )}
            <button
              className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary font-button-primary text-button-primary rounded-xl shadow-lg flex items-center justify-center gap-space-xs transition-all"
              type="button"
              onClick={handleContinue}
            >
              <span>Continue to Branding</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <div className="flex flex-col items-center gap-space-sm">
              <button
                className="font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary py-1 px-4 rounded-lg active:bg-surface-container transition-colors"
                type="button"
                onClick={onSaveDraft}
              >
                Save as Draft
              </button>
              <div aria-label="Step indicator" className="flex items-center gap-2 pt-1">
                <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                <span className="w-1.5 h-1.5 rounded-full bg-surface-container" />
                <span className="w-1.5 h-1.5 rounded-full bg-surface-container" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
