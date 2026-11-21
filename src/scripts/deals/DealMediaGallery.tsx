import { useState } from 'react';
import { CreateWithAiButton } from '../../components/CreateWithAiButton';
import { Icon } from '../../components/ui/Icon';
import { ProductImage } from '../../components/ui/ProductImage';
import { useDealBranches, useDealProductCatalog } from '../../hooks/business/useDealStudioLive';
import {
  imageFileError,
  pickImage,
  pickVideo,
  uploadImage,
  uploadVideo,
  videoFileError,
} from '../../services/uploadService';
import type { DealStudioDraft } from './dealStudioShared';
import {
  DEAL_GALLERY_SLOTS,
  MAX_DEAL_IMAGE_MB,
  MAX_DEAL_VIDEO_MB,
  dealAiPromptData,
  dealMediaItems,
  withVideoMediaMarker,
  withDealMediaSlot,
  type DealMediaItem,
  type DealMediaSlot,
} from './dealStudioShared';

interface DealMediaGalleryProps {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  variant?: 'mobile' | 'desktop';
}

interface DealMediaPreviewProps {
  item: DealMediaItem | null;
  alt: string;
  className?: string;
  imageClassName?: string;
}

/** One renderer for deal media so image and video previews stay identical in both views. */
export function DealMediaPreview({
  item,
  alt,
  className = '',
  imageClassName = 'h-full w-full object-cover',
}: DealMediaPreviewProps) {
  if (item?.kind === 'video') {
    return (
      <video
        aria-label={alt}
        className={`${className} bg-black object-cover`}
        controls
        playsInline
        preload="metadata"
        src={item.url}
      />
    );
  }
  return <ProductImage alt={alt} className={className} imageClassName={imageClassName} src={item?.url} />;
}

const mainLabel = (slot: DealMediaSlot) => (slot === 0 ? 'Main media' : `Additional slot ${slot}`);

/**
 * Existing Deal Studio gallery, extended in place: one compulsory main slot,
 * four additional image/video slots, one video maximum, and AI prompt entry
 * points built from the merchant's own deal information.
 */
export function DealMediaGallery({ studio, onStudioChange, variant = 'mobile' }: DealMediaGalleryProps) {
  const { catalog, products } = useDealProductCatalog();
  const selectedItems = products.filter((item) => studio.productIds.includes(item.id));
  const dealBranches = useDealBranches(studio, selectedItems);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const media = dealMediaItems(studio);
  const bySlot = new Map(media.map((item) => [item.slot, item]));
  const main = bySlot.get(0) ?? null;
  const hasOtherVideo = media.some((item) => item.kind === 'video' && item.slot !== 0);
  const aiContext = {
    deal: dealAiPromptData(
      studio,
      catalog,
      dealBranches.options.filter((branch) => dealBranches.selectedIds.includes(branch.id)).map((branch) => branch.name),
    ),
  };
  const isDesktop = variant === 'desktop';
  const mainClass = isDesktop ? 'h-64 w-full rounded-xl' : 'h-44 w-full rounded-xl';
  const tileClass = isDesktop ? 'h-28 w-full rounded-lg' : 'h-24 w-full rounded-lg';

  const chooseMedia = async (slot: DealMediaSlot, kind: 'image' | 'video') => {
    setError(null);
    const existingVideo = media.find((item) => item.kind === 'video' && item.slot !== slot);
    if (kind === 'video' && existingVideo) {
      setError(`Only one video is allowed. Remove the video in ${mainLabel(existingVideo.slot)} first.`);
      return;
    }
    setBusy(`${slot}-${kind}`);
    try {
      const file = kind === 'image' ? await pickImage() : await pickVideo();
      if (!file) return;
      const formatProblem = kind === 'image' ? imageFileError(file) : videoFileError(file);
      if (formatProblem) {
        setError(formatProblem);
        return;
      }
      const limitMb = kind === 'image' ? MAX_DEAL_IMAGE_MB : MAX_DEAL_VIDEO_MB;
      if (file.size > limitMb * 1024 * 1024) {
        setError(`${kind === 'image' ? 'Images' : 'Videos'} must be ${limitMb}MB or smaller.`);
        return;
      }
      const uploadedUrl = kind === 'image' ? await uploadImage(file) : await uploadVideo(file);
      const url = kind === 'video' ? withVideoMediaMarker(uploadedUrl) : uploadedUrl;
      onStudioChange(
        withDealMediaSlot(studio, slot, {
          kind,
          url,
          sizeBytes: file.size,
          name: file.name,
        }),
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : `Could not upload that ${kind}.`);
    } finally {
      setBusy(null);
    }
  };

  const removeMedia = (slot: DealMediaSlot) => {
    setError(null);
    onStudioChange(withDealMediaSlot(studio, slot, null));
  };

  const aiButtons = (
    <div className={`flex flex-wrap gap-x-space-sm gap-y-space-2xs ${isDesktop ? '' : 'justify-center'}`}>
      <CreateWithAiButton
        aspectRatio="square"
        assetType="deal-image"
        className="inline-flex items-center gap-1.5 text-primary font-caption text-caption font-semibold hover:underline text-left"
        context={aiContext}
        fileHint="JPG, PNG or WebP • max 2MB"
        label="Generate image with AI"
      />
      <CreateWithAiButton
        aspectRatio="9/16"
        assetType="deal-video"
        className="inline-flex items-center gap-1.5 text-primary font-caption text-caption font-semibold hover:underline text-left"
        context={aiContext}
        fileHint="MP4, WebM or MOV • max 5MB"
        label="Generate Deal Video with AI"
      />
    </div>
  );

  const slotButtons = (slot: DealMediaSlot, filled: boolean) => (
    <div className="flex flex-wrap items-center justify-center gap-space-2xs">
      <button
        className="px-space-xs py-space-2xs rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold disabled:opacity-40"
        disabled={Boolean(busy)}
        type="button"
        onClick={() => void chooseMedia(slot, 'image')}
      >
        {busy === `${slot}-image` ? 'Uploading…' : filled ? 'Replace image' : 'Add image'}
      </button>
      <button
        className="px-space-xs py-space-2xs rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold disabled:opacity-40"
        disabled={Boolean(busy) || (slot !== 0 && hasOtherVideo) || (slot === 0 && Boolean(media.find((item) => item.kind === 'video' && item.slot !== 0)))}
        type="button"
        onClick={() => void chooseMedia(slot, 'video')}
      >
        {busy === `${slot}-video` ? 'Uploading…' : filled ? 'Replace video' : 'Add video'}
      </button>
      {filled && (
        <button
          aria-label={`Remove media from ${mainLabel(slot)}`}
          className="w-8 h-8 rounded-lg bg-surface-subtle text-error flex items-center justify-center"
          type="button"
          onClick={() => removeMedia(slot)}
        >
          <Icon className="text-[16px]" name="delete" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-space-md">
      <div className="rounded-xl bg-surface-container-lowest p-space-sm shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-start justify-between gap-space-xs">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-text-primary font-semibold">
              Main media <span className="text-error">*</span>
            </span>
            <p className="font-caption text-caption text-text-secondary">
              Required. Choose one image or one video as the deal cover.
            </p>
          </div>
          {main && (
            <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold shrink-0">
              {main.kind === 'video' ? 'Video' : 'Image'}
            </span>
          )}
        </div>
        <div className="relative">
          <DealMediaPreview alt="Deal main media" className={mainClass} item={main} />
          {!main && (
            <span className="absolute bottom-space-xs left-1/2 -translate-x-1/2 px-space-sm py-space-2xs rounded-full bg-inverse-surface text-inverse-on-surface font-caption text-caption font-semibold whitespace-nowrap">
              Main image or video required
            </span>
          )}
        </div>
        {slotButtons(0, Boolean(main))}
        {aiButtons}
      </div>

      <div className="rounded-xl bg-surface-container-lowest p-space-sm shadow-sm flex flex-col gap-space-sm">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-text-primary font-semibold">Additional media (up to 4)</span>
          <p className="font-caption text-caption text-text-secondary">
            Add more images to any open slot. You may use the single video here instead of the main slot.
          </p>
        </div>
        <div className={isDesktop ? 'grid grid-cols-2 lg:grid-cols-4 gap-space-sm' : 'grid grid-cols-2 gap-space-xs'}>
          {DEAL_GALLERY_SLOTS.map((slot) => {
            const item = bySlot.get(slot) ?? null;
            return (
              <div className="rounded-lg bg-surface-subtle p-space-2xs flex flex-col gap-space-2xs" key={slot}>
                <div className="relative">
                  <DealMediaPreview alt={`Deal additional media ${slot}`} className={tileClass} item={item} />
                  {item && (
                    <span className="absolute top-1 right-1 px-space-xs rounded-full bg-inverse-surface text-inverse-on-surface font-caption text-caption font-semibold">
                      {item.kind === 'video' ? 'Video' : `Photo ${slot}`}
                    </span>
                  )}
                </div>
                <span className="font-caption text-caption text-text-secondary text-center">{mainLabel(slot)}</span>
                {slotButtons(slot, Boolean(item))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-surface-tint-blue px-space-sm py-space-2xs flex items-start gap-space-xs">
        <Icon className="text-[16px] text-primary mt-0.5 shrink-0" name="info" />
        <p className="font-caption text-caption text-text-secondary leading-snug">
          Images: JPG, PNG or WebP up to {MAX_DEAL_IMAGE_MB}MB each. Video: MP4, WebM or MOV up to{' '}
          {MAX_DEAL_VIDEO_MB}MB, maximum one per deal. AI prompts are built from your deal information and
          open in ChatGPT or Gemini; generated files are uploaded through the buttons above.
        </p>
      </div>

      {error && (
        <p aria-live="polite" className="rounded-xl bg-error-container px-space-sm py-space-2xs font-caption text-caption text-on-error-container">
          {error}
        </p>
      )}
    </div>
  );
}
