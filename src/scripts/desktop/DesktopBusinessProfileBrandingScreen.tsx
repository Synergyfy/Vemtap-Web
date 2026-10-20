import { useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { pickAndUploadImage } from '../../services/uploadService';
import { Icon } from '../../components/ui/Icon';
import { CreateWithAiButton } from '../../components/CreateWithAiButton';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { AiPromptContext } from '../aiDesignAssistant';
import type { BusinessProfileDraft } from './DesktopBusinessOnboardingScreen';

export interface BrandingResult {
  logoUrl?: string;
  coverImage?: string;
  gallery: string[];
}

/** Neutral placeholder shown before a live business uploads its cover. */
const EMPTY_COVER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23dbe5ff'/><stop offset='1' stop-color='%23f1f3ff'/></linearGradient></defs><rect width='16' height='9' fill='url(%23g)'/></svg>";

interface DesktopBusinessProfileBrandingScreenProps {
  draft: BusinessProfileDraft;
  onBack: () => void;
  /** Receives the uploaded image URLs (live) so the parent can save them. */
  onNext: (branding: BrandingResult) => void;
  onSaveDraft: () => void;
}

const COVER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2JOfNmoZIIkwU06NkcYfl6e1JqTRu64gsaUSJXXxE5xKyvkg_JCCE0rDL0s0TcvCJf0iPpgWjaURIs1kiLHKnnRA6hPLC1GvGaUcPkf1R-knn6x5ELqhWxSYJlIxze5ZcP9xGzKO6_bo9SY3jRnH-Qbd5WP6_EFF6FBjjsff7LxLl7gXIjHzulk66KL_nhkK11dOO-9jKDipqUvQKQ-sPTKqsK3ncxRUD2kkFakf-';

const MOBILE_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDMhwU7v_sp8PlDeFM-sws8LnsO3o0dHGmR7XaaHFgWgJp6C_TO3Qk35e9DGWw5NO23KbDziH2zeu7j1J1I_sxrvnPyL2RrlhUMTJf91kBYbgO_RICFO25n4MxwxBBSK2ito2FrgwvE-0q335GTBNxuh-iViXLF8Hp-SuAasoCeBxgP3KchhJJzlLRUn-ZHvQSOPJ52WjtaxXok7z7AecPAsnlciyxH9jCj5HeA9jqp';

const LAUNCH_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCNczFLc0faRiEg4jO8sXFdg1kenSyM1sPXHoySM_AZy0ALkQgOd5Rz9poPpMDFASLZ-lonWkAaADj9SsuBiiphhxFqofAmKSvGnwvS87VQPjE4FPWUubVLH3Ex-PmTHoXYS3DH-NvdMggquKPlwNLFV-pGyoxF8uwY4afUg_ifquogK2A90GDeEQEeyipYTwK7ucgRwD_uy_HLw8_aQjJN1e1QQtNO7AzVw8QIbMIu';

const BURGER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDHk3biOqEuIMayc3ojFbe1EvaaZQr7qRWUvaiNX5TNKpcAR0hCux7fvYUtn0m_4S0pbC-HWusuAD6sRdsddfc7MXiRsLoqrPR5nWUI4i1Ybi4mlZDh8iy7L50yy3jm9WnmiS2jL293F5OJRCOXaPRoqlptfwbdCI9X5RujvHU6qsUSui6Ej5YP8chVWOpDBnkez0AshfuX5jxRO65MBNThcL1CvR4drEloEuaHQb1a';

const COCKTAIL_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB9yDJIRR6Z0k1UM5kPN4tK7_wWPGjuOIgJcxe8Av2VfNFPu63VrFO71YoNInvxo24fawHDuGvqQ0ER2-BXzmYCLA6ReiOGoAuVBd0M5-XPNSFV3AANxhuahdS7_8qGT-MkTnPP3haHLYrfxRuYI3qTHLEu9FTGBd51uzsW0S0bTmAIpnQbu6A4r0Zhva1-h4-22JlWIJDam511qJrOLtqI0qIILL4utjHavfieJd6j';

const PREVIEW_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5dzA4NBAOCv8WHjHeAUd0GDHJuw3Xu9Wt_eewOB-81uuYogGXyQ6MFM98NYjTQRSM3oOSevn6R6MYNHn9HIshGOXM9F_mGWj0f6XtvdcBO5r6p9C_g6xN2DjZ2TWv71WNNByGsVIY65oH1-uEw48N9OgZytM-xS3cIYNegsQxRCxC_OKVjSmPuyMAuDiR3WW7SbMbW77BRJv0naZYXPjPch665tF_fD7Xkq4VGBet';

const COVER_OPTIONS = [
  { src: COVER_IMAGE, alt: 'Warm atmospheric interior of Urban Grill and Bistro with ambient Edison bulb lighting, rustic wooden dining tables set with fine tableware, an open-concept exhibition grill kitchen in background with warm golden glows and modern metropolitan ambiance.' },
  { src: MOBILE_HERO_IMAGE, alt: 'Inviting shot of Urban Grill and Bistro dining hall with guests laughing, warm ambient interior lighting, warm exposed brickwork, and artisanal food platters arranged on clean tables.' },
  { src: LAUNCH_IMAGE, alt: 'A modern upscale restaurant interior with warm ambient lighting, timber wooden tables, glowing bar in background, vibrant Lagos urban culinary dining experience with guests in stylish casual attire' },
];

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  label: string;
}

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 1,
    src: BURGER_IMAGE,
    alt: 'Artisanal gourmet double smash burger with melted aged cheddar, smoked bacon, caramelized onions, crisp butter lettuce on a brioche bun, paired with golden crispy truffle fries on a dark slate plate with warm warm restaurant lighting.',
    label: 'Signature Burger',
  },
  {
    id: 2,
    src: COCKTAIL_IMAGE,
    alt: 'Upscale modern cocktail bar lounge with brass accents, backlit emerald liquor shelves, mixologist crafting a cocktail with smoke infuser, deep navy leather barstools under warm low mood illumination.',
    label: 'Lounge Bar',
  },
];

const GALLERY_POOL: Array<{ src: string; alt: string; label: string }> = [
  {
    src: MOBILE_HERO_IMAGE,
    alt: 'Inviting shot of Urban Grill and Bistro dining hall with guests laughing, warm ambient interior lighting, warm exposed brickwork, and artisanal food platters arranged on clean tables.',
    label: 'Dining Hall',
  },
  {
    src: LAUNCH_IMAGE,
    alt: 'A modern upscale restaurant interior with warm ambient lighting, timber wooden tables, glowing bar in background, vibrant Lagos urban culinary dining experience with guests in stylish casual attire',
    label: 'Lagos Interior',
  },
  {
    src: PREVIEW_IMAGE,
    alt: 'An inviting, high-end warm bistro and grill interior with exposed wooden beams, glowing ambient filament lamps, sizzling charcoal grill kitchen in soft bokeh background, and elegant dining tables.',
    label: 'Grill Room',
  },
];

export function DesktopBusinessProfileBrandingScreen({
  draft,
  onBack,
  onNext,
  onSaveDraft,
}: DesktopBusinessProfileBrandingScreenProps) {
  // Live: real uploads only — no sample logo, cover or gallery photos.
  const live = hasApiConfig();
  const [hasLogo, setHasLogo] = useState(!live);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'logo' | 'cover' | 'gallery' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [coverIndex, setCoverIndex] = useState(0);
  const [gallery, setGallery] = useState<GalleryItem[]>(live ? [] : INITIAL_GALLERY);
  const [nextGalleryId, setNextGalleryId] = useState(3);
  const [poolCursor, setPoolCursor] = useState(0);

  const displayName = draft.name.trim().length > 0 ? draft.name.trim() : 'Your Business Name';
  const nameWords = displayName.split(/\s+/).filter((word) => word !== '&');
  const avatarLabel = nameWords.length > 0 ? nameWords[nameWords.length - 1].toUpperCase() : 'BISTRO';

  const cover = live
    ? { src: coverUrl ?? EMPTY_COVER, alt: coverUrl ? 'Your storefront cover photo' : 'No cover photo yet' }
    : COVER_OPTIONS[coverIndex];

  /** Picks an image, uploads it and hands back the hosted URL (null when cancelled). */
  const upload = async (kind: 'logo' | 'cover' | 'gallery') => {
    setUploadError(null);
    setUploading(kind);
    try {
      return await pickAndUploadImage();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      return null;
    } finally {
      setUploading(null);
    }
  };

  const changeLogo = async () => {
    if (!live) return setHasLogo(true);
    const url = await upload('logo');
    if (url) {
      setLogoUrl(url);
      setHasLogo(true);
    }
  };

  const replaceCover = async () => {
    if (!live) return setCoverIndex((index) => (index + 1) % COVER_OPTIONS.length);
    const url = await upload('cover');
    if (url) setCoverUrl(url);
  };

  const addPhoto = async () => {
    if (gallery.length >= 5) return;
    if (live) {
      const url = await upload('gallery');
      if (url) {
        setGallery((prev) => [...prev, { id: nextGalleryId, src: url, alt: 'Business photo', label: `Photo ${prev.length + 1}` }]);
        setNextGalleryId((id) => id + 1);
      }
      return;
    }
    const next = GALLERY_POOL[poolCursor % GALLERY_POOL.length];
    setGallery((prev) => [...prev, { id: nextGalleryId, ...next }]);
    setNextGalleryId((id) => id + 1);
    setPoolCursor((cursor) => cursor + 1);
  };

  const removePhoto = (id: number) => setGallery((prev) => prev.filter((item) => item.id !== id));

  /** Business facts already in the onboarding draft — feed the AI prompt. */
  const aiBrandContext: AiPromptContext = {
    businessName: draft.name,
    category: draft.categories.join(', '),
    subcategory: draft.tags.join(', '),
    description: draft.description,
  };

  return (
    <BusinessSetupChrome activeNav="profile">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-space-xl">
        {uploadError ? (
          <div role="alert" className="mb-space-md rounded-xl bg-error-container text-on-error-container px-space-md py-space-sm font-label-md text-label-md flex items-center justify-between gap-space-sm">
            <span>{uploadError}</span>
            <button type="button" className="underline" onClick={() => setUploadError(null)}>
              Dismiss
            </button>
          </div>
        ) : null}
        <div className="mb-space-xl bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center justify-center px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-label-sm text-caption font-semibold">
                Stage 2 of 3
              </span>
              <span className="font-label-md text-label-md text-text-secondary font-medium">Visual Branding</span>
              <span className="text-text-tertiary text-caption font-caption">•</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">66% Complete</span>
            </div>
            <div className="w-full md:w-80 h-2 bg-surface-container rounded-full overflow-hidden mt-space-2xs">
              <div className="h-full bg-primary-container rounded-full" style={{ width: '66%' }} />
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs">
              <div className="w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                <Icon name="check" className="text-[16px]" />
              </div>
              <span className="font-label-sm text-label-sm text-text-primary font-medium hidden sm:inline">
                1. Business Info
              </span>
            </div>
            <span className="w-6 h-0.5 bg-border-active" />
            <div className="flex items-center gap-space-xs">
              <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                2
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">2. Visual Branding</span>
            </div>
            <span className="w-6 h-0.5 bg-surface-container-high" />
            <div className="flex items-center gap-space-xs opacity-60">
              <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm font-semibold">
                3
              </div>
              <span className="font-label-sm text-label-sm text-text-secondary hidden sm:inline">3. Channels</span>
            </div>
          </div>
        </div>

        <div className="mb-space-xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div className="max-w-2xl">
              <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                Storefront Appearance
              </span>
              <h1 className="font-display-hero text-display-hero text-text-primary mt-space-2xs">
                Upload your brand visuals
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary mt-space-xs">
                Businesses with high-quality photos get up to 40% more deal views and customer walk-ins across the
                hyper-local feed.
              </p>
            </div>
            <div className="flex items-center gap-space-sm px-space-md py-space-sm bg-surface-tint-blue rounded-xl self-start lg:self-auto">
              <div className="w-10 h-10 rounded-full bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                <Icon name="trending_up" className="text-[22px]" />
              </div>
              <div>
                <span className="block font-heading-sm text-heading-sm text-primary leading-tight">
                  +40% Impressions
                </span>
                <span className="block font-caption text-caption text-text-secondary">Verified profile boost</span>
              </div>
            </div>
          </div>
          <div className="mt-space-md p-space-md bg-surface-canvas rounded-xl shadow-sm flex items-start gap-space-md">
            <div className="w-8 h-8 rounded-lg bg-badge-discount-bg text-badge-discount-text flex-shrink-0 flex items-center justify-center mt-0.5">
              <Icon name="lightbulb" className="text-[18px]" />
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <p className="font-body-md text-body-md text-text-primary">
                <span className="font-semibold text-primary">Pro Tip:</span> Crisp, natural lighting turns first-time
                scrollers into immediate table reservations.
              </p>
              <span className="font-label-sm text-label-sm text-text-secondary hover:text-primary cursor-pointer shrink-0">
                Read photo guidelines
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Store Logo &amp; Avatar</h2>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Appears on voucher stamps, map pushpins, and checkout headers
                  </p>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-subtle font-caption text-caption text-text-secondary font-medium">
                  Required
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg pt-space-xs">
                <div className="relative group">
                  {hasLogo && logoUrl ? (
                    <img src={logoUrl} alt="Your logo" className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover shadow-md" />
                  ) : hasLogo ? (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-primary-container flex flex-col items-center justify-center shadow-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary to-transparent opacity-60" />
                      <div className="relative z-10 flex flex-col items-center justify-center text-on-primary">
                        <Icon name="restaurant" className="text-[42px] leading-none" />
                        <span className="font-caption text-caption tracking-widest uppercase font-bold mt-1 text-on-primary/90">
                          {avatarLabel}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary bg-surface-subtle flex flex-col items-center justify-center gap-space-2xs text-center">
                      <Icon name="photo_camera" className="text-[28px] text-text-tertiary" />
                      <span className="font-caption text-caption text-text-tertiary">Upload Logo</span>
                    </div>
                  )}
                  {hasLogo && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-badge-discount-text text-on-primary flex items-center justify-center shadow-sm">
                      <Icon name="check" className="text-[14px]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-space-xs">
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={() => void changeLogo()}
                      disabled={uploading !== null}
                      className="px-space-md py-space-xs rounded-lg bg-surface-tint-blue hover:bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center gap-space-2xs shadow-sm transition-all duration-150"
                    >
                      <Icon name="photo_camera" className="text-[18px]" />
                      <span>{uploading === 'logo' ? 'Uploading…' : live && !logoUrl ? 'Upload Logo' : 'Change Logo'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={!hasLogo}
                      onClick={() => {
                        setHasLogo(false);
                        setLogoUrl(null);
                      }}
                      className="px-space-md py-space-xs rounded-lg bg-surface-subtle hover:bg-surface-container-high text-error font-button-secondary text-button-secondary flex items-center gap-space-2xs transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Icon name="delete" className="text-[18px]" />
                      <span>Remove</span>
                    </button>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-space-2xs leading-relaxed">
                    Square 1:1 (PNG, JPG max 5MB). Optimal resolution: 400 × 400px. High-contrast shapes ensure
                    legibility on small phone maps.
                  </p>
                </div>
              </div>
              <div>
                <CreateWithAiButton
                  aspectRatio="square"
                  assetType="logo"
                  context={aiBrandContext}
                  fileHint="Square 1:1 (PNG, JPG max 5MB)"
                />
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Storefront Cover Banner</h2>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Primary visual displayed in discovery streams and store top-card
                  </p>
                </div>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue font-caption text-caption text-primary font-semibold">
                  16:9 Landscape
                </span>
              </div>
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-sm group">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={cover.alt}
                  src={cover.src}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/20 flex flex-col justify-between p-space-md">
                  <div className="flex items-center justify-between">
                    <span className="px-space-xs py-space-2xs rounded-md bg-surface-canvas/90 backdrop-blur-md font-caption text-caption text-text-primary font-semibold flex items-center gap-1 shadow-sm">
                      <Icon name="verified" className="text-[14px] text-badge-discount-text" /> 1200 × 675px
                    </span>
                    <span className="px-space-xs py-space-2xs rounded-md bg-surface-canvas/90 backdrop-blur-md font-caption text-caption text-text-secondary font-medium">
                      {live ? (coverUrl ? 'Cover uploaded' : 'No cover yet') : 'Cover Verified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-space-xs">
                    <div className="text-on-primary">
                      <p className="font-label-md text-label-md font-semibold drop-shadow">
                        {live ? draft.name.trim() || 'Your storefront' : 'Main Dining Room & Bar'}
                      </p>
                      <p className="font-caption text-caption text-on-primary/80 drop-shadow">
                        {live ? (coverUrl ? 'Ready to publish' : 'Upload a 16:9 photo of your storefront') : 'Uploaded today, 14:20'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void replaceCover()}
                      disabled={uploading !== null}
                      className="px-space-md py-space-xs rounded-lg bg-surface-canvas/95 hover:bg-surface-canvas text-text-primary font-button-secondary text-button-secondary shadow-md flex items-center gap-space-2xs backdrop-blur-md transition-all"
                    >
                      <Icon name="sync" className="text-[18px]" />
                      <span>{uploading === 'cover' ? 'Uploading…' : live && !coverUrl ? 'Upload Cover Photo' : 'Replace Cover Photo'}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-text-secondary font-caption text-caption px-space-2xs">
                <span>Minimum 1200 × 675px (16:9 aspect ratio)</span>
                <span>JPG or WebP up to 10MB</span>
              </div>
              <div>
                <CreateWithAiButton
                  aspectRatio="16/9"
                  assetType="banner"
                  context={aiBrandContext}
                  fileHint="JPG or WebP up to 10MB"
                />
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Featured Menu &amp; Space Gallery
                    </h2>
                    <span className="px-space-xs py-space-2xs rounded-full bg-surface-container font-caption text-caption text-primary font-bold">
                      {gallery.length} / 5 Uploaded
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Highlight signature dishes, mixology, outdoor seating, or ambiance
                  </p>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-medium hover:underline cursor-pointer">
                  View requirements
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-surface-container shadow-sm"
                  >
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      alt={item.alt}
                      src={item.src}
                    />
                    <div className="absolute inset-0 bg-inverse-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-space-xs">
                      <button
                        type="button"
                        title="Remove"
                        aria-label={`Remove ${item.label}`}
                        onClick={() => removePhoto(item.id)}
                        className="w-8 h-8 rounded-full bg-surface-canvas text-error flex items-center justify-center shadow hover:scale-110 transition-transform"
                      >
                        <Icon name="delete" className="text-[16px]" />
                      </button>
                      <button
                        type="button"
                        title="View"
                        aria-label={`View ${item.label}`}
                        className="w-8 h-8 rounded-full bg-surface-canvas text-text-primary flex items-center justify-center shadow hover:scale-110 transition-transform"
                      >
                        <Icon name="visibility" className="text-[16px]" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-space-xs py-space-2xs bg-inverse-surface/80 rounded backdrop-blur text-on-primary font-caption text-caption font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
                {gallery.length < 5 && (
                  <button
                    type="button"
                    onClick={() => void addPhoto()}
                    disabled={uploading !== null}
                    className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-space-xs p-space-sm text-center bg-surface-subtle hover:bg-surface-tint-blue/30 cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-canvas shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Icon name="add_photo_alternate" className="text-[24px]" />
                    </div>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">+ Add Photo</span>
                    <span className="font-caption text-caption text-text-tertiary">
                      {5 - gallery.length} slots remaining
                    </span>
                  </button>
                )}
              </div>
              <div className="p-space-sm bg-surface-subtle rounded-lg flex items-center gap-space-xs text-text-secondary font-caption text-caption mt-space-2xs">
                <Icon name="info" className="text-text-tertiary text-[18px]" />
                <span>
                  You can rearrange gallery display priority by dragging cards once all 5 photos are uploaded.
                </span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-space-md">
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Live Mobile Discovery Preview
                </span>
              </div>
              <span className="font-caption text-caption text-text-tertiary">Real-time simulator</span>
            </div>
            <div className="bg-surface-canvas rounded-[2.5rem] p-space-md shadow-xl ring-1 ring-black/5 relative overflow-hidden">
              <div className="w-full flex items-center justify-between px-space-md pb-space-sm pt-space-2xs border-b border-surface-subtle">
                <span className="font-caption text-caption font-semibold text-text-primary">9:41</span>
                <div className="w-20 h-4 bg-surface-container rounded-full mx-auto" />
                <div className="flex items-center gap-1 text-text-primary">
                  <Icon name="signal_cellular_4_bar" className="text-[14px]" />
                  <Icon name="wifi" className="text-[14px]" />
                  <Icon name="battery_full" className="text-[14px]" />
                </div>
              </div>
              <div className="py-space-xs px-space-2xs flex items-center justify-between">
                <div className="flex items-center gap-space-2xs">
                  <Icon name="near_me" className="text-[16px] text-primary" />
                  <span className="font-label-sm text-caption text-text-secondary font-medium">Nearby Dining Feed</span>
                </div>
                <span className="px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                  1 Tap View
                </span>
              </div>
              <div className="rounded-2xl bg-surface-canvas overflow-hidden shadow-md border-0 group transition-all mt-space-2xs">
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <img className="w-full h-full object-cover" alt={cover.alt} src={cover.src} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                  <div className="absolute top-3 left-3 flex items-center gap-space-2xs">
                    <span className="px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-bold shadow-sm tracking-wide">
                      20% OFF FIRST VISIT
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-space-xs">
                    <span className="px-space-xs py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-semibold flex items-center gap-1 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                      Open Now
                    </span>
                    <div className="w-8 h-8 rounded-full bg-surface-canvas/80 backdrop-blur-md text-text-primary flex items-center justify-center shadow-sm">
                      <Icon name="bookmark_border" className="text-[16px]" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-space-xs py-1 rounded-md bg-inverse-surface/85 backdrop-blur-md text-on-primary font-caption text-caption font-medium flex items-center gap-1">
                      <Icon name="location_on" className="text-[13px]" /> 0.4 km away
                    </span>
                  </div>
                </div>
                <div className="p-space-md flex flex-col gap-space-xs bg-surface-canvas">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex flex-col items-center justify-center flex-shrink-0 shadow-sm relative -mt-6 ring-2 ring-surface-canvas">
                      <Icon name="restaurant" className="text-[20px] leading-none" />
                      <span className="text-[8px] font-bold tracking-widest mt-0.5">{avatarLabel}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{displayName}</h3>
                        <div className="flex items-center gap-1 px-space-xs py-0.5 rounded bg-surface-container text-primary font-label-sm text-caption font-bold">
                          <Icon name="star" filled className="text-[14px]" />
                          <span>4.9</span>
                        </div>
                      </div>
                      <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                        American Fusion • Casual Dining • $$
                      </p>
                    </div>
                  </div>
                  <div className="mt-space-2xs p-space-xs bg-surface-subtle rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-6 h-6 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                        <Icon name="confirmation_number" className="text-[14px]" />
                      </div>
                      <span className="font-label-sm text-caption text-text-primary font-medium truncate">
                        Complimentary Truffle Fries with Main
                      </span>
                    </div>
                    <span className="font-label-sm text-caption text-primary font-semibold shrink-0">Claim →</span>
                  </div>
                  <div className="mt-space-xs pt-space-xs border-t border-surface-subtle flex items-center justify-between text-text-tertiary font-caption text-caption">
                    <span className="flex items-center gap-1">
                      <Icon name="check_circle" className="text-[14px] text-badge-discount-text" />
                      VEMTAP Verified Merchant
                    </span>
                    <span>Tap for Menu</span>
                  </div>
                </div>
              </div>
              <div className="mt-space-md p-space-sm rounded-xl bg-surface-subtle flex items-center gap-space-sm opacity-70">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-text-secondary">
                  <Icon name="store" className="text-[20px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 w-28 bg-surface-container-high rounded mb-1" />
                  <div className="h-2.5 w-40 bg-surface-container rounded" />
                </div>
              </div>
            </div>
            <div className="px-space-xs text-text-secondary font-caption text-caption flex items-start gap-space-2xs">
              <Icon name="touch_app" className="text-[16px] text-primary mt-0.5" />
              <span>
                This interactive preview reflects changes automatically. High-resolution imagery creates stronger
                conversions on the iOS &amp; Android consumer feed.
              </span>
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
              <span>Back to Step 1</span>
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
              onClick={() =>
                onNext({
                  logoUrl: logoUrl ?? undefined,
                  coverImage: coverUrl ?? undefined,
                  gallery: live ? gallery.map((item) => item.src) : [],
                })
              }
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              <span>Continue to Contact &amp; Channels</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
