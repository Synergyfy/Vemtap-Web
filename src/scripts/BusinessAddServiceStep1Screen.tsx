import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { ServiceDraft } from './serviceDraft';

interface BusinessAddServiceStep1ScreenProps {
  draft: ServiceDraft;
  onDraftChange: (patch: Partial<ServiceDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const SERVICE_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5kJCcN5hfN4CHAyjM9ztBajNRH9N3SkL38ksjE3AyoelX4MEYejaPFoGwctYS266qyorIoQKcWEmZNs7Q5kgsygotoz2TJKsdyOZYsKcGnxlqAEEA6v2xVfV-oWp54srCsfwKZnaL4Xke7K7ZfNfVhgRqlpp7nIUNRt-iHDnIJxgjld79QZmEiqRPpWOQJ6NN-L-WTDKk9tyaTUh62Bs2W5DGAuGcrqcwBfQezAWCYT5AF74uuP4PBg',
    alt: 'Serene luxury spa aesthetic treatment room with warm ambient backlighting, neatly folded organic white towels, aromatic botanical diffusers, and a sleek treatment bed prepared with soft plush linens in serene minimalist aesthetic.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRT0JQg87G9GpBxmx2LkeUI6CVnJYmoSzQkXqIfpXgrEHHK-8SRiJ6rD8DLL7wUTzIU_W7JZH0Zfctt_2QFYSHy3FVQhZjp29LOim6qzQqQsIWVDtxIOwpCiOnvR4L6Nr8Mvsm6CUgbuiTSefV96fF9xBR4EBcOrUB-vQuigJdrV7EnEw3NosjORfttKVk5hqtAGK6SuaGbV3m5X7Sjsy4owvD8Ymt8DolSWp3nfU08hLvk97VNm6RfA',
    alt: 'Close up aesthetic shot of serene model receiving a soothing organic botanical facial cleansing application with gentle aesthetic foaming bubbles.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtmwhvUUzD_ewKDmRA7m2RX9FD_aCLK1mv9J6RIZYxdp48G05Oo9CRs5k20Al-7eNX4KhPSR3NzayISpP6-r4_7rjXDG26tpyKYdSyWO9PdNtiDpCpcwfTvGjaz_tFELxleutDcQh7ZCjt5SOkkP32s9Y-6DQg43OIo1-zEK46FVL65J-_xp8qAlen7Zeb4E0pbl3WbVua18bMh0O1xqkA1Hb4M2Lz88hW52Pad1MUSMKqP6QYEElbSQ',
    alt: 'High quality aesthetic cosmetic glass droppers with amber liquid botanical hydrating facial serum on natural clean stone slab.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6zBmPpSqLRhs0pmUGVti6x3UYkA-lYXmXV18ADSgilBGs30Z9VXlA4W9epW6Rem-X7KENLu3sRHxz7QfQoNiokDvylgXO_G37r6MC7iUCWk0hYzp18QwE-X5FC148oP7-6NlJdQBhNN6E8tekaeQbFfkSicnNEU17PDPBAE4DA74ecJ6n6HUbpFx0zt6RDjE8hfy_TFLKUG62Ibn8EZtGakkD7861AV82uIgLrTgD-uC4CvkFxlhf7w',
    alt: 'Gentle relaxing facial jade roller massage on smooth glowing skin in bright airy modern skincare treatment suite.',
  },
];

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
}: BusinessAddServiceStep1ScreenProps) {
  const [gender, setGender] = useState<'all' | 'women' | 'men'>('all');

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Service Media</h2>
              <span className="text-error font-heading-sm text-heading-sm">*</span>
            </div>
            <span className="font-caption text-caption text-text-secondary">4 / 10 photos</span>
          </div>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm bg-surface-container-high group">
            <img
              className="w-full h-full object-cover"
              alt={SERVICE_IMAGES[0].alt}
              src={SERVICE_IMAGES[0].src}
            />
            <div className="absolute top-space-sm left-space-sm right-space-sm flex items-center justify-between pointer-events-none">
              <div className="bg-on-surface/85 backdrop-blur-md px-space-xs py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Icon className="text-[14px] text-tertiary-fixed" filled name="star" />
                <span className="font-label-sm text-label-sm text-on-primary font-medium">Cover Photo</span>
              </div>
              <div className="bg-surface-container-lowest/90 backdrop-blur-md px-space-xs py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Icon className="text-[14px] text-text-secondary" name="drag_indicator" />
                <span className="font-caption text-caption text-text-secondary">Drag to reorder</span>
              </div>
            </div>
            <button
              className="absolute bottom-space-sm right-space-sm bg-surface-container-lowest/95 hover:bg-surface-container-lowest active:scale-95 text-text-primary px-space-sm py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition-all"
              type="button"
            >
              <Icon className="text-[16px] text-primary" name="photo_camera" />
              <span className="font-button-secondary text-button-secondary font-medium">Change</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-space-xs">
            {SERVICE_IMAGES.slice(1).map((image, index) => (
              <div
                key={image.src}
                className="relative aspect-square rounded-lg overflow-hidden shadow-sm bg-surface-container"
              >
                <img className="w-full h-full object-cover" alt={image.alt} src={image.src} />
                <span className="absolute bottom-1 right-1 bg-on-surface/75 text-on-primary rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px]">
                  {index + 1}
                </span>
              </div>
            ))}
            <button
              className="aspect-square rounded-lg bg-surface-container-low hover:bg-surface-container active:scale-95 flex flex-col items-center justify-center gap-1 transition-all"
              type="button"
            >
              <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                <Icon name="add_a_photo" className="text-[18px]" />
              </div>
              <span className="font-caption text-caption text-primary font-medium">+ Add</span>
            </button>
          </div>
          <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-start gap-space-xs">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="text-primary text-[18px]" filled name="lightbulb" />
            </div>
            <p className="font-caption text-caption text-text-secondary leading-snug">
              <strong className="text-primary font-medium">Pro Tip:</strong> Clean ambient treatment photos increase
              appointment bookings by up to <span className="text-primary font-semibold">3.4x</span>.
            </p>
          </div>
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
              >
                Change
              </button>
            </div>
          </div>
        </section>

        <section className="px-margin mt-space-lg flex flex-col gap-space-sm">
          <h2 className="font-heading-sm text-heading-sm text-on-surface">Category &amp; Treatment Type</h2>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <Icon name="self_improvement" className="text-[18px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Primary Category</span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    {draft.primaryCategory}
                  </span>
                </div>
              </div>
              <button
                className="font-label-sm text-label-sm text-primary font-medium px-space-xs py-1 rounded hover:bg-surface-tint-blue transition-colors"
                type="button"
              >
                Change
              </button>
            </div>
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <Icon name="face_retouching_natural" className="text-[18px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Sub-Category</span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    {draft.subCategory}
                  </span>
                </div>
              </div>
              <button
                className="font-label-sm text-label-sm text-primary font-medium px-space-xs py-1 rounded hover:bg-surface-tint-blue transition-colors"
                type="button"
              >
                Change
              </button>
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
                  const isSelected = gender === option.value;
                  return (
                    <button
                      key={option.value}
                      className={`flex-1 py-2 px-space-xs rounded-full font-label-md text-label-md text-center transition-all ${
                        isSelected
                          ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                          : 'bg-surface-container-low text-text-secondary font-medium hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => setGender(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-text-primary font-medium">
                  Minimum Age Requirement
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Mandatory for client consent forms
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="bg-surface-container px-space-sm py-1.5 rounded-full font-label-md text-label-md text-text-primary font-semibold">
                  Ages 16+
                </span>
                <button
                  className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-secondary transition-colors"
                  type="button"
                >
                  <Icon name="edit" className="text-[18px]" />
                </button>
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
    </AppScreen>
  );
}
