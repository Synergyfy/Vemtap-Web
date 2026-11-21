import { useEffect, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { ImageCropControl } from '../components/media/ImageCropControl';
import { Icon } from '../components/ui/Icon';
import { CreateWithAiButton } from '../components/CreateWithAiButton';
import type { AiPromptContext } from './aiDesignAssistant';
import type { ProductDraft } from './productDraft';
import { useLiveItemEditor } from '../hooks/business/useLiveItemEditor';
import { UserAvatar } from '../components/ui/UserAvatar';
import {
  imageFileError,
  MAX_IMAGE_UPLOAD_MB,
  MAX_VIDEO_UPLOAD_MB,
  pickImage,
  pickAndUploadVideo,
} from '../services/uploadService';
import { apiErrorMessage } from '../services/errorMessages';

interface BusinessAddProductImageScreenProps {
  draft: ProductDraft;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  /** Live: receives the uploaded photo's URL as `mainImage`. */
  onDraftChange?: (patch: Partial<ProductDraft>) => void;
}

/**
 * Product image step — runs *after* the details and pricing steps so the AI
 * assistant can build its prompt from everything already entered (name,
 * description, category). The merchant never re-enters product
 * information here; the draft stays mounted in the container meanwhile.
 */
export function BusinessAddProductImageScreen({ draft, onBack, onNext, onSaveDraft, onDraftChange }: BusinessAddProductImageScreenProps) {
  // Live: photos are cropped before upload; videos go to the item's `videos` field.
  const editor = useLiveItemEditor('product');
  const [pendingPhoto, setPendingPhoto] = useState<{ file: File; target: 'cover' | 'gallery' } | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const galleryImages = draft.galleryImages ?? [];
  const totalPhotos = (draft.mainImage ? 1 : 0) + galleryImages.length;

  const pickAndPreparePhoto = async (target: 'cover' | 'gallery') => {
    if (editor.uploading) return;
    const file = await pickImage();
    if (!file) return;
    const problem = imageFileError(file);
    if (problem) {
      setMediaError(problem);
      return;
    }
    setMediaError(null);
    setPendingPhoto({ file, target });
  };

  const useCroppedPhoto = async (file: File) => {
    if (!pendingPhoto) return;
    const target = pendingPhoto.target;
    const url = await editor.uploadFile(file);
    if (url) {
      if (target === 'cover') {
        onDraftChange?.({ mainImage: url });
      } else {
        const next = [...galleryImages, url].slice(0, 4);
        onDraftChange?.({ galleryImages: next });
      }
    }
    setPendingPhoto(null);
  };

  const removeCoverPhoto = () => {
    onDraftChange?.({ mainImage: undefined });
  };

  const removeGalleryPhoto = (index: number) => {
    const next = galleryImages.filter((_, i) => i !== index);
    onDraftChange?.({ galleryImages: next });
  };

  const addVideo = async () => {
    if (videoBusy) return;
    setVideoBusy(true);
    setMediaError(null);
    try {
      const url = await pickAndUploadVideo();
      if (url) onDraftChange?.({ videos: [...(draft.videos ?? []), url] });
    } catch (error) {
      setMediaError(apiErrorMessage(error, 'Could not upload this video.'));
    } finally {
      setVideoBusy(false);
    }
  };

  useEffect(() => {
    if (!editor.uploadError) return;
    const timer = window.setTimeout(editor.clearUploadError, 4000);
    return () => window.clearTimeout(timer);
  }, [editor.uploadError]);

  useEffect(() => {
    if (!mediaError) return;
    const timer = window.setTimeout(() => setMediaError(null), 5000);
    return () => window.clearTimeout(timer);
  }, [mediaError]);
  /** Product facts from the draft — business facts come from setup state. */
  const aiProductContext: AiPromptContext = {
    itemName: draft.title,
    itemDescription: draft.description,
    category: draft.primaryCategory,
    subcategory: draft.subCategory,
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
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
              Step 3 of 5
            </span>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Add New Product</h1>
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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-md pb-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide uppercase">
                Step 3 of 5: Product Image
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-text-secondary font-medium">60% completed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden flex gap-1 p-0.5">
            <div className="h-full rounded-full bg-primary-container w-1/5 transition-all duration-500 shadow-sm" />
            <div className="h-full rounded-full bg-primary-container w-1/5 transition-all duration-500 shadow-sm" />
            <div className="h-full rounded-full bg-primary-container w-1/5 transition-all duration-500 shadow-sm" />
            <div className="h-full rounded-full bg-surface-variant/40 w-1/5" />
            <div className="h-full rounded-full bg-surface-variant/40 w-1/5" />
          </div>
          <p className="font-caption text-caption text-text-secondary mt-1">
            Upload your own photos or generate one with AI — the prompt is prepared from the details you
            just entered.
          </p>
        </div>

        <div className="flex flex-col gap-space-lg px-margin mt-space-xs">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1.5">
                  Product Media
                  <span className="font-caption text-caption bg-badge-discount-bg text-badge-discount-text font-semibold px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </h2>
                <span className="font-caption text-caption text-text-secondary">
                  Photos JPG, PNG or WEBP up to {MAX_IMAGE_UPLOAD_MB}MB · videos up to {MAX_VIDEO_UPLOAD_MB}MB
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold bg-surface-tint-blue px-2 py-0.5 rounded-full">
                {totalPhotos} of 5 Photos Added
              </span>
            </div>

            {draft.mainImage ? (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low group shadow-inner">
                <img
                  alt={draft.title || 'Product cover photo'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={draft.mainImage}
                />
                <div className="absolute top-3 left-3 bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Icon className="text-[14px] text-badge-discount-bg" filled name="star" />
                  <span className="font-caption text-caption font-semibold">Cover Photo</span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Remove cover photo"
                    onClick={removeCoverPhoto}
                    className="w-8 h-8 rounded-full bg-inverse-surface/85 hover:bg-error text-inverse-on-surface flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </div>
                <button
                  className="absolute bottom-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md text-text-primary hover:text-primary px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  type="button"
                  onClick={() => pickAndPreparePhoto('cover')}
                >
                  <Icon name="add_a_photo" className="text-[16px] text-primary" />
                  <span className="font-label-sm text-label-sm font-semibold">{editor.uploading ? 'Uploading…' : 'Change'}</span>
                </button>
              </div>
            ) : (
              <div className="relative w-full aspect-square rounded-xl border-2 border-dashed border-outline-variant/60 hover:border-primary bg-surface-container-low flex flex-col items-center justify-center p-space-md text-center transition-colors">
                <div className="w-12 h-12 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center mb-space-xs">
                  <Icon name="add_a_photo" className="text-[24px]" />
                </div>
                <h3 className="font-label-md text-label-md font-semibold text-text-primary mb-1">
                  Add Cover Photo
                </h3>
                <p className="font-caption text-caption text-text-secondary max-w-[220px] mb-space-sm">
                  Required main product image. JPG, PNG or WEBP up to {MAX_IMAGE_UPLOAD_MB}MB.
                </p>
                <button
                  type="button"
                  onClick={() => pickAndPreparePhoto('cover')}
                  className="px-space-md py-space-xs rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <Icon name="cloud_upload" className="text-[16px]" />
                  <span>{editor.uploading ? 'Uploading…' : 'Upload Cover Photo'}</span>
                </button>
              </div>
            )}

            {(editor.uploadError || mediaError) && (
              <p role="alert" className="rounded-lg bg-error-container px-space-sm py-space-xs font-caption text-caption text-error font-semibold">
                {editor.uploadError ?? mediaError}
              </p>
            )}

            {pendingPhoto && (
              <ImageCropControl
                file={pendingPhoto.file}
                onApply={useCroppedPhoto}
                onCancel={() => setPendingPhoto(null)}
              />
            )}

            <div className="flex flex-col gap-space-2xs mt-1">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption font-medium text-text-secondary">
                  Gallery Photos ({galleryImages.length} of 4)
                </span>
                <span className="font-caption text-[11px] text-text-tertiary">Optional</span>
              </div>
              <div className="grid grid-cols-5 gap-space-2xs">
                {galleryImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-high shadow-sm ring-1 ring-border-subtle"
                  >
                    <img alt={`Gallery photo ${index + 1}`} className="w-full h-full object-cover" src={src} />
                    <button
                      type="button"
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() => removeGalleryPhoto(index)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-inverse-surface/85 text-inverse-on-surface hover:bg-error flex items-center justify-center transition-colors"
                    >
                      <Icon name="close" className="text-[12px]" />
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 bg-inverse-surface/75 text-inverse-on-surface text-[9px] font-bold px-1 rounded">
                      #{index + 2}
                    </span>
                  </div>
                ))}
                {galleryImages.length < 4 && (
                  <button
                    className="aspect-square rounded-lg bg-surface-container-low hover:bg-surface-tint-blue flex flex-col items-center justify-center text-primary active:scale-95 transition-all border border-dashed border-outline-variant/60"
                    type="button"
                    onClick={() => pickAndPreparePhoto('gallery')}
                  >
                    <Icon name="add" className="text-[20px]" />
                    <span className="text-[10px] font-medium text-text-secondary mt-0.5">Add</span>
                  </button>
                )}
                {(draft.videos ?? []).map((video, index) => (
                  <div
                    key={`${video}-${index}`}
                    className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-high shadow-sm"
                  >
                    <video src={video} muted playsInline className="w-full h-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove video ${index + 1}`}
                      onClick={() => onDraftChange?.({ videos: (draft.videos ?? []).filter((_, i) => i !== index) })}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-inverse-surface/85 text-inverse-on-surface flex items-center justify-center"
                    >
                      <Icon name="close" className="text-[12px]" />
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-inverse-surface/80 px-1 text-[9px] font-bold text-inverse-on-surface">
                      V{index + 1}
                    </span>
                  </div>
                ))}
                <button
                  className="aspect-square rounded-lg bg-surface-container-low/60 flex flex-col items-center justify-center text-text-secondary active:scale-95 transition-all border border-dashed border-outline-variant/60"
                  type="button"
                  onClick={addVideo}
                >
                  <Icon name="videocam" className="text-[18px]" />
                  <span className="text-[9px] font-medium mt-0.5">{videoBusy ? 'Uploading…' : 'Video'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-space-xs p-space-sm bg-surface-tint-blue rounded-xl text-primary">
              <Icon className="text-[20px] text-primary-container shrink-0 mt-0.5" filled name="lightbulb" />
              <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
                <span className="font-semibold text-primary">Pro Tip:</span> Clear, well-lit photos on clean neutral
                backgrounds unlock{' '}
                <strong className="font-semibold text-primary">3x higher customer engagement</strong> and faster
                checkouts.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div>
              <h2 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1.5">
                <Icon name="auto_awesome" className="text-[18px] text-primary" />
                No image? Create one with AI
              </h2>
              <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                VEMTAP prepares an image prompt from your product name
                {draft.title ? ` (“${draft.title}”)` : ''}, description and category
                {draft.primaryCategory ? ` (${draft.primaryCategory})` : ''}. You can review and edit the prompt before opening ChatGPT or Google Gemini, then upload the
                result right here.
              </p>
            </div>
            <CreateWithAiButton
              aspectRatio="square"
              assetType="product"
              context={aiProductContext}
              fileHint="Up to 6 high-res shots"
            />
          </div>

          <div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs">
            <Icon name="history" className="text-[18px] text-primary shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              Your product details, pricing and branch availability from the previous steps are saved — go
              Back at any time to edit them, and everything you entered stays exactly as you left it.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-container-lowest/90 backdrop-blur-xl px-margin py-space-sm shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)] pb-safe flex flex-col gap-2">
        <button
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:bg-primary active:scale-[0.98] transition-all cursor-pointer"
          type="button"
          onClick={onNext}
        >
          <span>Continue to Branch Availability</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
        <div className="flex items-center justify-center">
          <button
            className="h-9 px-4 font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
            type="button"
            onClick={onSaveDraft}
          >
            <Icon name="save" className="text-[16px]" />
            <span>Save as Draft &amp; Exit</span>
          </button>
        </div>
      </div>
      {editor.uploadError && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {editor.uploadError}
        </div>
      )}
    </AppScreen>
  );
}
