import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { ServiceDraft } from './desktopServiceDraft';

interface DesktopAddServiceStep1ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const COVER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4wRhk7Z2awcljAxG1LjsDB3N2bAN7rQlDkEXDILlYF6i09D_DE0_JDmPFddvIXLKfZ-TtuSypTz0Kl3jUy7knUpU3HB4NuSb137foMDpgotXoiK7w3GVbU1FRlvDkCRSfNt7lLHtinSDkQaVQwt40lHDAj3DUxzf9tBWYtOf7qlTY-_mE9_3gDNIH9wVJF72-OJb0k0sqg-vLThSLsh7dq90yBqvw9fzIB1gXV-Fo2ZXSueR6oLefog';

const COVER_ALT =
  'A luxury aesthetic spa suite interior with soft warm architectural lighting, minimalist linen draped massage bed, bamboo partition, and high-end botanical skincare flacons on stone trays in high dynamic range.';

const THUMBNAIL_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2k-0GygPR7thrr6kQT5yTqoGDw0NcxF2dP0AlXRwce_9v75rvKjTFCOII2nYkQknciVnh52IMyXZtpFEzCOC6Sc0ZFQf8bwDaVJM2likf3N9H6Yf4CtRNeAYa6jwXLogctOB85hy8oxyDnz-IvnlOo7GjU_Ij8kfKJBzE9Lqhpjxks9aQ7vHEEYWcFEkDqE1E9UzAJhRl3UfANQ6pD0rmV-2EbDY3S2bIgoQ14Il52tS12xywmcy8cw',
    alt: 'Macro clean shot of an organic facial treatment in progress with refreshing gel mask applied carefully on glowing hydrated female skin with soft salon bokeh.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQQg6upTKKOpZ6Tp5hbXhIT0nrg2PTYYJD8pZdNoNbADXPGVUlGtg5_IAiMhY_gBomAojJ0rOnD_uEzXlk49b1wzpAfQuzfVJcWJ-Xypy29WDHSt9ojs2P9Up2_n17ziHnvoKCcpI9NZlpXD8kgiKN2dMkkEmLwLwMc1Ex0CSBaT9U39DCU6k75vJDBBwgS3lA_M8ImtJdn_-Y6oRcmTZZu8lQAdXmi80dzIi1l8my5dOBdtCsdLaAoA',
    alt: 'Artisanal glass dropper bottle dispensing golden organic botanical facial serum with morning light reflecting through herbal extract droplets on stone background.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRkxDuU2EkpayCjLM8RjpKom_HYD5XDFkDseQtqJX6TB7a2f_vb-4cFXnWwPVQbnzcFVfAEqqentFeQstEL4LkSYV1tdUi7K9zjAu9C6FLAZjthahprr2xunBUlpbTctoK9QIPAIYXU4JC20SQfsC_tMFInBsCsLJXBqApQh-01CZ-Sj6RrHATlNT1MPUT6JZmYlUYbjl9rf8qb9y14XrEtvEMPhgOrKYC0wFxA4dTVV23IK6D8U5HBw',
    alt: 'Peaceful client resting during esthetics session with bamboo headwrap and white fluffy towel in modern boutique day spa atmosphere.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEs-HfAtSHgpNUAB8Bj14NAp8xqq3Et-0WjBr12CSBKBZjAj4iofnMfh4AalTQaa8cbMfsXu-QYJraNwqgRPQ4Lg0ljeo9GVBPoNJd-Fho9G9VKzOiPTbmzQMR3aA06az0K0bfzGK0xlhBcpWPQY00LVlKcfJazLxvAWANEEVSG9vJddiTQINLaOi8FkBLV1e0GVq6c-AQ0n_DGJPHkzpgPNUfvD11OZBD3Ur2PQvi-pTnkaXpBv18NQ',
    alt: 'Close up of licensed aesthetician hands performing gentle lymphatic drainage facial massage on client cheeks with natural daylight.',
  },
];

const PREVIEW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCOp2GprrnMkZvR4PU0KdJRedLeEo_--yoJWjkqgxtBZFcRkJYv22ZkzOsSDY2ZJUL2_zBY_uHf2HCTRiaZoQj1LQXKEJ8hWFNtIBboAvkNudRMzMxiQyfMevw8mWtbfmr2PuAPcWOLruTUZOm7cIxpQGsP5KJ-HnKeCupkv03MSChAcHBJnkJ1YN5cMAVbUCK2LcOV1I90oT-e3O7k39oh3sWjmHSXM4nITxuK1IeQi7b3xH0Q-u04Jg';

const PREVIEW_ALT =
  'Client enjoying a restorative facial treatment in a tranquil luxury spa with modern aesthetics and soft flattering lighting.';

const PRIMARY_CATEGORIES = [
  'Health, Beauty & Wellness',
  'Medical Aesthetics',
  'Massage & Holistic Care',
  'Hair Styling & Scalp Care',
];

const SUB_CATEGORIES = [
  'Facials, Skincare & Esthetics',
  'Chemical Peels & Resurfacing',
  'Hydra-Dermabrasion',
  'Anti-Aging LED Therapies',
];

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

const GENDER_OPTIONS = ['All Welcome', 'Women Only', 'Men Only'];

export function DesktopAddServiceStep1Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
}: DesktopAddServiceStep1ScreenProps) {
  const [gender, setGender] = useState('All Welcome');
  const [consent, setConsent] = useState(true);

  const removeHighlight = (label: string) => {
    onDraftChange({ highlights: draft.highlights.filter((entry) => entry.label !== label) });
  };

  const addHighlight = () => {
    onDraftChange({
      highlights: [...draft.highlights, { icon: 'auto_awesome', label: 'Treatment Customization' }],
    });
  };

  return (
    <BusinessSetupChrome activeNav="catalog">
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

              <div className="flex flex-col gap-4">
                <div className="relative rounded-xl overflow-hidden bg-surface-container-high aspect-[16/9] max-h-80 shadow-inner group">
                  <img
                    alt={COVER_ALT}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    src={COVER_IMAGE}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold flex items-center gap-1 shadow-sm">
                        <Icon name="star" className="text-[14px]" />
                        Primary Cover Photo
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-surface-canvas/90 hover:bg-surface-canvas backdrop-blur-md text-text-primary font-caption text-caption font-semibold flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Icon name="edit" className="text-[16px]" />
                          Change Photo
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg bg-surface-canvas/90 hover:bg-error-container text-text-secondary hover:text-error backdrop-blur-md transition-all shadow-sm"
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      </div>
                    </div>
                    <div className="text-surface-canvas font-caption text-caption opacity-90 flex items-center gap-2">
                      <Icon name="crop_original" className="text-[16px]" />
                      2400 × 1350 px • JPEG • Appears first in VEMTAP marketplace search
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {THUMBNAIL_IMAGES.map((image, index) => (
                    <div
                      key={image.src}
                      className="relative rounded-xl overflow-hidden aspect-square group shadow-sm bg-surface-subtle"
                    >
                      <img alt={image.alt} className="w-full h-full object-cover" src={image.src} />
                      <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/60 text-surface-canvas font-caption text-caption flex items-center justify-center font-bold">
                        {index + 2}
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button
                          type="button"
                          className="p-1 rounded bg-surface-canvas text-text-primary hover:text-primary"
                        >
                          <Icon name="drag_indicator" className="text-[16px]" />
                        </button>
                        <button type="button" className="p-1 rounded bg-surface-canvas text-error hover:bg-error-container">
                          <Icon name="close" className="text-[16px]" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center aspect-square rounded-xl bg-surface-subtle hover:bg-surface-tint-blue text-text-secondary hover:text-primary transition-colors cursor-pointer group shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center shadow-xs group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                      <Icon name="add" className="text-[20px]" />
                    </div>
                    <span className="font-label-sm text-label-sm mt-1.5 font-medium">Add Photo</span>
                  </button>
                </div>
              </div>

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
                <div className="p-4 rounded-xl bg-surface-subtle flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                      <Icon name="storefront" className="text-[22px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        {draft.provider}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Main Branch • Downtown Flagship Suite 402
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-surface-canvas hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold shadow-xs transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-6 lg:p-8 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Icon name="category" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-text-primary">
                  Category &amp; Treatment Taxonomy
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="primary-cat">
                    Primary Category <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="primary-cat"
                      value={draft.primaryCategory}
                      onChange={(event) => onDraftChange({ primaryCategory: event.target.value })}
                      className="w-full h-[52px] pl-4 pr-10 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_3px_rgba(6,108,244,0.18)] cursor-pointer"
                    >
                      {PRIMARY_CATEGORIES.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <Icon
                      name="expand_more"
                      className="text-[20px] text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="sub-cat">
                    Sub-Category <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="sub-cat"
                      value={draft.subCategory}
                      onChange={(event) => onDraftChange({ subCategory: event.target.value })}
                      className="w-full h-[52px] pl-4 pr-10 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_3px_rgba(6,108,244,0.18)] cursor-pointer"
                    >
                      {SUB_CATEGORIES.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <Icon
                      name="expand_more"
                      className="text-[20px] text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                  </div>
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
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setGender(option)}
                        className={
                          gender === option
                            ? 'py-2.5 px-2 rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold text-center shadow-xs'
                            : 'py-2.5 px-2 rounded-xl bg-surface-subtle text-text-secondary hover:bg-surface-container-high font-label-md text-label-md font-medium text-center transition-colors'
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-text-primary font-semibold">
                    Minimum Age Requirement
                  </label>
                  <div className="h-[52px] px-4 rounded-xl bg-surface-subtle flex items-center justify-between">
                    <span className="font-body-md text-body-md text-text-primary font-semibold">Ages 16+</span>
                    <button
                      type="button"
                      className="text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1 font-caption text-caption font-medium"
                    >
                      <Icon name="edit" className="text-[18px]" />
                      Change
                    </button>
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
                  <img alt={PREVIEW_ALT} className="w-full h-full object-cover" src={PREVIEW_IMAGE} />
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

            <div className="bg-surface-canvas rounded-2xl p-6 shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-3">
              <button
                type="button"
                onClick={onNext}
                className="w-full h-[52px] rounded-2xl bg-primary-container hover:bg-primary active:scale-[0.99] text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] transition-all"
              >
                <span>Continue to Duration &amp; Pricing</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
              <button
                type="button"
                onClick={onSaveDraft}
                className="w-full h-11 rounded-xl text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary flex items-center justify-center transition-colors"
              >
                Save as Draft &amp; Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
