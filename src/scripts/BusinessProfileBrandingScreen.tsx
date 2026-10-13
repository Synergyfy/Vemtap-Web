import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { BusinessProfileDraft } from './BusinessOnboardingScreen';

interface BusinessProfileBrandingScreenProps {
  draft: BusinessProfileDraft;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

interface GalleryPhoto {
  src: string;
  alt: string;
}

const COVER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Bmp2JXF0_L9X5Y8f-viSlV4zmpflw50Wewkumd3pttDJ7MxzlQhqYL5HmRZQFb_DQkazYpgOc2tNmSvjUEoH05XniatWUFuM7GbW_tfHS84uYYrkIoH1G5vwQeijYdBp7qpzA88DlKhosyHtVPBLDamn6p3k67H33ceY6PUX7UQokHWh7MeNyNuDcWlAZIZNQoFV2HiGalkELPTXNLaLlWYo8O9bvmRlEygFUlAluWPpjQBi7nuvCA';
const COVER_ALT =
  'A warm and inviting modern bistro restaurant interior with ambient overhead brass pendant lighting, elegant wooden dining tables, exposed brick walls, and comfortable olive green leather booths, captured in a crisp editorial architectural photography style with natural window light.';
const FOOD_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB6cGT5T73djW8zj1lJUr4qoC538qxZPKnX7DBfGQr5gKnGSBth8v5Cb08HwMc0mvDGz8buSsvlxQtOiGaB593yvPiIQCIBC0zwAsl6FAk9C6x_-E75GmjIKFNIRG9xwJFXFPaSoAl7NY5rFfPDe5rwOsJkDHC9GdOExv8C_urKt67FZIbgvyrYvlsok0PRo2WjUW5b7Dbp07C4PvpN2wr5oDqeZCsGEhmw0aaqaWBhXBWLSSfRAIZqgg';
const FOOD_ALT =
  'A beautifully plated artisanal wagyu burger with melted smoked cheddar, crisp arugula, and truffle aioli on a toasted brioche bun, presented on a dark slate board with rosemary sea salt fries in the background under soft warm restaurant lighting.';
const BAR_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDmrRtVAOLR9hiYWqgEok0KgFl3L_Dde0E-W6KZAkX4vMPoAOagxYg8FGsryD-ISsD7DObhvuiGEsm904AoKxRnuU69uf39U_l97z1daI2tAjfP9IvdkeoTgEi-t-06owQYvHmDuBhgNlNIhK1Cc-mEtcYMnWwlijsLHZIaAnX72B56bhaGT9JG59qKX4Xez8-omegcmHJIGDU0y5RWyOULzry5MnZ48dY72WuEDj55c5NzsOSGX_1CDw';
const BAR_ALT =
  'A cozy cocktail bar corner featuring an illuminated backlit liquor display shelf, polished marble countertop, fresh garnish jars with mint and citrus, and craft glassware ready for service in a vibrant evening ambiance.';
const FEED_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDzjzOBwUpuQS_1AMCsRI7RpDfjlmJc58sI3hufN6uvd-7Kpbd3-dptWv6AwPOxtcKj1CPBZLlQ_VXuQs8Kn-yDL1gKWpHbqJN_7LKO4qayEqcRTvW7qIFrarALWy4y0hY8SMLtWNniLJux1Rqbtvgrvq0ZUAe1_FYG6zQ6cAtpf3EHJtQTjQ8XV-IA8o2fTZpOlLNsSypHrjceNqMYzQechet-WjVxubRp7mm25hhlG3ysQBboAmo9Eg';
const FEED_ALT =
  'An inviting perspective view of a trendy urban bistro patio filled with patrons, warm string fairy lights, wooden bistro tables, and lush green potted planters under an evening sky.';

const GALLERY_POOL: GalleryPhoto[] = [
  { src: FOOD_IMG, alt: FOOD_ALT },
  { src: BAR_IMG, alt: BAR_ALT },
  { src: FEED_IMG, alt: FEED_ALT },
  { src: COVER_IMG, alt: COVER_ALT },
];

export function BusinessProfileBrandingScreen({
  draft,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessProfileBrandingScreenProps) {
  const [hasLogo, setHasLogo] = useState(true);
  const [cover, setCover] = useState(COVER_IMG);
  const [gallery, setGallery] = useState<GalleryPhoto[]>(GALLERY_POOL.slice(0, 2));

  const remainingPhotos = GALLERY_POOL.filter(
    (photo) => !gallery.some((entry) => entry.src === photo.src),
  );
  const canAddPhoto = remainingPhotos.length > 0 && gallery.length < 5;
  const previewTitle = draft.name.trim() || 'Your Store Name';

  const handleReplaceCover = () => {
    setCover((current) => (current === COVER_IMG ? FEED_IMG : COVER_IMG));
  };

  const handleAddPhoto = () => {
    if (!canAddPhoto) return;
    setGallery((current) => [...current, remainingPhotos[0]]);
  };

  const handleRemovePhoto = (src: string) => {
    setGallery((current) => current.filter((entry) => entry.src !== src));
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
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate max-w-[210px]">
              Media And Branding
            </h1>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full">
        <section className="px-margin pt-space-md pb-space-sm">
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-2xs">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-badge-discount-bg text-badge-discount-text">
                  <Icon name="check" className="text-[14px]" />
                </span>
                <span className="font-label-sm text-label-sm text-text-secondary">Step 2 of 3</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">66% Complete</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-primary h-full w-2/3 rounded-full transition-all duration-300" />
            </div>
            <div className="flex items-center justify-between mt-space-xs text-text-secondary">
              <span className="font-caption text-caption">1. Business Info</span>
              <span className="font-caption text-caption text-primary font-medium">2. Visual Branding</span>
              <span className="font-caption text-caption">3. Channels</span>
            </div>
          </div>
        </section>

        <section className="px-margin pt-space-xs pb-space-md">
          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            Upload your brand visuals
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Businesses with high-quality photos get up to{' '}
            <span className="font-semibold text-primary">40% more deal views</span> and customer walk-ins.
          </p>
          <div className="mt-space-sm bg-surface-tint-blue rounded-xl p-space-sm flex items-center gap-space-xs">
            <Icon className="text-primary text-[20px] flex-shrink-0" name="lightbulb" filled />
            <p className="font-caption text-caption text-on-secondary-container">
              Crisp, natural lighting turns first-time scrollers into immediate table reservations.
            </p>
          </div>
        </section>

        <div className="px-margin flex flex-col gap-space-lg pb-space-3xl">
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex flex-col gap-1 mb-space-sm">
              <div className="flex items-center justify-between gap-space-xs flex-wrap">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Store Logo</h3>
                <span className="bg-surface-container text-on-surface-variant font-label-sm text-[12px] px-2.5 py-0.5 rounded-full whitespace-nowrap font-medium">
                  Square 1:1 (PNG, JPG max 5MB)
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-tight">
                Used on customer vouchers, map pins, and header badges.
              </p>
            </div>
            <div className="mt-space-sm flex items-center gap-space-md">
              <div className="relative w-20 h-20 rounded-xl bg-surface-container flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                {hasLogo ? (
                  <div className="w-full h-full bg-surface-container-high flex flex-col items-center justify-center relative">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
                      <Icon name="restaurant_menu" className="text-[26px]" />
                    </div>
                    <span className="absolute bottom-1 font-caption text-[9px] font-bold text-on-secondary-container tracking-wider">
                      BISTRO
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-text-tertiary">
                    <Icon name="photo_camera" className="text-[24px]" />
                  </div>
                )}
                {hasLogo && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-badge-discount-text" />}
              </div>
              <div className="flex flex-col gap-space-xs flex-grow">
                <div className="flex items-center gap-space-xs">
                  <button
                    className="h-9 px-space-md bg-surface-tint-blue text-primary font-button-secondary text-button-secondary rounded-lg flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                    type="button"
                    onClick={() => setHasLogo(true)}
                  >
                    <Icon name="photo_camera" className="text-[18px]" />
                    Change
                  </button>
                  <button
                    className="h-9 px-space-sm bg-surface-container-low text-text-secondary hover:text-error font-button-secondary text-button-secondary rounded-lg flex items-center gap-1 transition-colors"
                    type="button"
                    onClick={() => setHasLogo(false)}
                  >
                    <Icon name="delete" className="text-[18px]" />
                    Remove
                  </button>
                </div>
                <p className="font-caption text-caption text-text-tertiary">Optimal resolution: 400 × 400px</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-start justify-between mb-space-xs">
              <div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Storefront Cover Banner</h3>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Primary banner shown on your business profile and search cards.
                </p>
              </div>
              <span className="bg-surface-subtle text-text-secondary font-label-sm text-label-sm px-2.5 py-1 rounded-full whitespace-nowrap">
                16:9 Recommended
              </span>
            </div>
            <div className="mt-space-sm relative w-full h-44 rounded-xl overflow-hidden shadow-sm">
              <img
                alt={cover === COVER_IMG ? COVER_ALT : FEED_ALT}
                className="w-full h-full object-cover"
                src={cover}
              />
              <div className="absolute top-space-xs left-space-xs bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface font-caption text-caption px-2 py-0.5 rounded-full flex items-center gap-1">
                <Icon name="aspect_ratio" className="text-[12px]" />
                1200 × 675px
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-text-primary/70 via-transparent to-transparent flex items-end justify-between p-space-sm">
                <button
                  className="h-10 px-space-md bg-surface-canvas text-text-primary font-button-secondary text-button-secondary rounded-xl flex items-center gap-space-xs shadow-md transition-transform active:scale-95"
                  type="button"
                  onClick={handleReplaceCover}
                >
                  <Icon name="add_a_photo" className="text-primary text-[20px]" />
                  Replace Cover Photo
                </button>
                <span className="text-on-primary font-caption text-caption opacity-90 hidden sm:inline-block">
                  JPG, WEBP up to 10MB
                </span>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Interior &amp; Product Photos</h3>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Add up to 5 photos showcasing your space, menu, or products.
                </p>
              </div>
              <span className="text-primary font-label-sm text-label-sm font-semibold">{gallery.length} / 5</span>
            </div>
            <div className="grid grid-cols-3 gap-space-xs mt-space-sm">
              {gallery.map((photo) => (
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm group" key={photo.src}>
                  <img alt={photo.alt} className="w-full h-full object-cover" src={photo.src} />
                  <button
                    aria-label="Remove item"
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-text-primary/70 text-on-primary flex items-center justify-center shadow"
                    type="button"
                    onClick={() => handleRemovePhoto(photo.src)}
                  >
                    <Icon name="close" className="text-[14px]" />
                  </button>
                </div>
              ))}
              {canAddPhoto && (
                <button
                  className="aspect-square rounded-xl bg-surface-subtle flex flex-col items-center justify-center gap-1 text-primary hover:bg-surface-tint-blue transition-colors p-2 text-center active:scale-95"
                  type="button"
                  onClick={handleAddPhoto}
                >
                  <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="add" className="text-[20px]" />
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold text-primary leading-tight">Add Photo</span>
                </button>
              )}
            </div>
          </section>

          <section className="bg-surface-container-low rounded-xl p-space-md">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-1.5">
                <Icon name="visibility" className="text-primary text-[18px]" />
                <span className="font-label-md text-label-md text-text-primary font-semibold">Live Feed Preview</span>
              </div>
              <span className="font-caption text-caption text-text-tertiary">How customers see you</span>
            </div>
            <div className="bg-surface-canvas rounded-xl shadow-md overflow-hidden">
              <div className="relative h-32 w-full">
                <img alt={FEED_ALT} className="w-full h-full object-cover" src={FEED_IMG} />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold px-2 py-0.5 rounded-full shadow-sm">
                    20% OFF FIRST VISIT
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 bg-surface-canvas/90 backdrop-blur-sm text-badge-discount-text font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  Open Now
                </div>
              </div>
              <div className="p-space-sm flex items-start gap-space-sm">
                <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex-shrink-0 flex items-center justify-center shadow -mt-6 relative z-10">
                  <Icon name="restaurant_menu" className="text-[20px]" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading-sm text-heading-sm text-text-primary truncate">{previewTitle}</h4>
                    <div className="flex items-center text-tertiary-container font-label-sm text-label-sm font-semibold">
                      <Icon name="star" className="text-[16px]" filled />
                      4.9
                    </div>
                  </div>
                  <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                    American Fusion • Casual Dining • 0.3 mi away
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-space-xs flex flex-col gap-space-sm">
            <button
              className="w-full h-[52px] bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]"
              type="button"
              onClick={onNext}
            >
              <span>Continue to Contact &amp; Channels</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <div className="flex items-center justify-between px-space-xs">
              <button
                className="h-11 px-space-sm text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary flex items-center gap-1 rounded-lg"
                type="button"
                onClick={onBack}
              >
                <Icon name="chevron_left" className="text-[18px]" />
                Back
              </button>
              <button
                className="h-11 px-space-sm text-text-secondary hover:text-primary font-button-secondary text-button-secondary flex items-center gap-1.5 rounded-lg"
                type="button"
                onClick={onSaveDraft}
              >
                <Icon name="bookmark" className="text-[18px]" />
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
