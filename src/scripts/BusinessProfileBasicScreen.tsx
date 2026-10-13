import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { BusinessProfileDraft } from './BusinessOnboardingScreen';
import { MOCKUP_SEED_CHAR_COUNT, SEED_DESCRIPTION } from './businessOnboardingSeed';

interface BusinessProfileBasicScreenProps {
  draft: BusinessProfileDraft;
  onChange: (patch: Partial<BusinessProfileDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

interface CategoryOption {
  value: string;
  label: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'restaurant', label: 'Restaurant & Dining' },
  { value: 'spa', label: 'Spa & Wellness' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'groceries', label: 'Groceries & Market' },
  { value: 'services', label: 'Local Services & Repair' },
];

const SUBCATEGORY_CHIPS = ['Grill & Steakhouse', 'Bistro & Cafe', 'Fast Casual', 'Fine Dining', 'Bakery'];

export function BusinessProfileBasicScreen({
  draft,
  onChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessProfileBasicScreenProps) {
  const [shakeTag, setShakeTag] = useState<string | null>(null);

  const descriptionCount =
    draft.description === SEED_DESCRIPTION ? MOCKUP_SEED_CHAR_COUNT : draft.description.length;

  const categoryValue = CATEGORY_OPTIONS.some((option) => option.value === draft.category)
    ? draft.category
    : CATEGORY_OPTIONS[0].value;

  const previewTitle = draft.name.trim() || 'Your Store Name';
  const previewSubtitle = draft.tags.length > 0 ? draft.tags.join(' • ') : 'Select specialty';

  const toggleTag = (tag: string) => {
    const isSelected = draft.tags.includes(tag);
    if (!isSelected && draft.tags.length >= 2) {
      setShakeTag(tag);
      window.setTimeout(() => setShakeTag(null), 150);
      return;
    }
    onChange({
      tags: isSelected ? draft.tags.filter((entry) => entry !== tag) : [...draft.tags, tag],
    });
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
          <div className="space-y-space-xs">
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
              <div className="relative flex items-center bg-surface-container-lowest rounded-xl shadow-sm">
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
            </div>

            <div className="space-y-space-2xs">
              <label className="block font-label-md text-label-md text-text-primary" htmlFor="primary-category">
                Primary Category (Required)
              </label>
              <div className="relative bg-surface-container-lowest rounded-xl shadow-sm">
                <select
                  className="w-full h-[52px] pl-4 pr-11 bg-transparent font-body-md text-body-md text-text-primary rounded-xl appearance-none focus:outline-none focus:bg-surface-subtle transition-all cursor-pointer"
                  id="primary-category"
                  value={categoryValue}
                  onChange={(event) => onChange({ category: event.target.value })}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-text-secondary">
                  <Icon name="expand_more" className="text-[20px]" />
                </div>
              </div>
              <p className="font-caption text-caption text-text-tertiary px-1">
                Helps assign your store to the right category carousel on nearby feeds.
              </p>
            </div>

            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <label className="block font-label-md text-label-md text-text-primary">
                  Subcategory Specialty <span className="font-normal text-text-secondary">(Select up to 2)</span>
                </label>
                <span className="font-caption text-caption text-primary-container font-semibold">
                  {draft.tags.length} / 2 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-space-xs pt-0.5">
                {SUBCATEGORY_CHIPS.map((chip) => {
                  const isActive = draft.tags.includes(chip);
                  return (
                    <button
                      className={`chip-item h-9 px-3 rounded-full flex items-center gap-1.5 transition-all font-label-md text-label-md shadow-sm ${
                        isActive
                          ? 'bg-surface-tint-blue text-primary-container'
                          : 'bg-surface-container text-text-secondary hover:text-text-primary'
                      } ${shakeTag === chip ? 'scale-95' : ''}`}
                      key={chip}
                      type="button"
                      onClick={() => toggleTag(chip)}
                    >
                      <Icon className={`text-[16px] check-icon ${isActive ? '' : 'hidden'}`} name="check" />
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>
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
            <button
              className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary font-button-primary text-button-primary rounded-xl shadow-lg flex items-center justify-center gap-space-xs transition-all"
              type="button"
              onClick={onNext}
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
