import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { ImageCropControl } from '../../components/media/ImageCropControl';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ProductDraft } from './desktopProductDraft';
import { CreateWithAiButton } from '../../components/CreateWithAiButton';
import type { AiPromptContext } from '../aiDesignAssistant';
import { useLiveItemEditor } from '../../hooks/business/useLiveItemEditor';
import {
  imageFileError,
  MAX_IMAGE_UPLOAD_MB,
  MAX_VIDEO_UPLOAD_MB,
  pickImage,
  pickAndUploadVideo,
} from '../../services/uploadService';
import { apiErrorMessage } from '../../services/errorMessages';

interface DesktopAddProductImageScreenProps {
  draft: ProductDraft;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
  /** Live: receives uploaded photos/videos in draft. */
  onDraftChange?: (patch: Partial<ProductDraft>) => void;
}

/**
 * Step 3 — Product image. Runs after details and pricing so the AI
 * assistant can build its prompt from everything already entered (name,
 * description, category). The draft stays mounted in the container,
 * so nothing typed in the earlier steps is lost while the merchant works
 * on the image or jumps Back to edit details.
 */
export function DesktopAddProductImageScreen({
  draft,
  onBack,
  onNext,
  onSaveDraft,
  onNav,
  onDraftChange,
}: DesktopAddProductImageScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
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

  const wizardSteps = [
    { number: 1, label: 'Product Details', done: true },
    { number: 2, label: 'Pricing & Variants', done: true },
    { number: 3, label: 'Product Image', active: true },
    { number: 4, label: 'Branch Availability' },
    { number: 5, label: 'Review' },
  ];

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-xl">
        <nav className="flex items-center gap-space-xs text-caption font-caption text-text-secondary mb-space-md">
          <button type="button" onClick={onSaveDraft} className="hover:text-primary transition-colors">
            Merchant Portal
          </button>
          <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
          <button type="button" onClick={onBack} className="hover:text-primary transition-colors">
            Products
          </button>
          <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
          <span className="text-text-primary font-semibold">Add New Product</span>
        </nav>

        <section className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Step 3 of 5: Product Image
              </h1>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                Draft #PRD-8821
              </span>
            </div>
            <div className="flex items-center gap-space-md pt-space-2xs flex-wrap">
              {wizardSteps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-space-xs">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm shadow-sm ${step.active
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : step.done
                        ? 'bg-primary-container/80 text-on-primary-container'
                        : 'bg-surface-container-high text-on-surface'
                      }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`font-label-md text-label-md ${step.active ? 'font-semibold text-text-primary' : 'text-text-secondary opacity-70'
                      }`}
                  >
                    {step.label}
                  </span>
                  {index < wizardSteps.length - 1 && (
                    <div
                      className={`w-6 h-1 rounded-full ${step.done ? 'bg-primary-container' : 'bg-surface-container-high'}`}
                    />
                  )}
                </div>
              ))}
              <span className="font-caption text-caption text-badge-discount-text font-semibold ml-space-xs bg-badge-discount-bg px-space-xs py-0.5 rounded">
                60% Completed
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl mt-space-lg">
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <Icon name="photo_camera_back" className="text-primary text-[22px]" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Product Media Studio</h2>
                    <span className="text-caption font-caption text-error font-medium">* Required</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-1">
                    High-quality product photography increases customer engagement and conversion.
                  </p>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-semibold bg-surface-tint-blue px-space-xs py-space-2xs rounded-lg">
                  {totalPhotos} of 5 Photos Added
                </span>
              </div>

              {draft.mainImage ? (
                <div className="relative w-full h-80 rounded-xl overflow-hidden bg-surface-container-high group shadow-sm mb-space-md">
                  <img
                    alt={draft.title || 'Product cover photo'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={draft.mainImage}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-space-md left-space-md flex items-center gap-space-xs">
                    <span className="bg-primary text-on-primary font-label-sm text-label-sm font-semibold px-space-sm py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Icon name="star" className="text-[15px]" filled />
                      Cover Photo
                    </span>
                    <span className="bg-surface-canvas/90 backdrop-blur text-text-primary font-caption text-caption font-semibold px-space-xs py-1 rounded-full shadow-sm">
                      Aspect 16:9
                    </span>
                  </div>
                  <div className="absolute top-space-md right-space-md flex items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={() => pickAndPreparePhoto('cover')}
                      className="bg-surface-canvas/90 hover:bg-surface-canvas text-text-primary px-space-sm py-1.5 rounded-lg shadow-md font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Icon name="edit" className="text-[16px]" />
                      <span>Crop new photo</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Remove cover photo"
                      onClick={removeCoverPhoto}
                      className="w-8 h-8 rounded-lg bg-surface-canvas/90 hover:bg-error hover:text-on-primary text-text-secondary flex items-center justify-center transition-colors shadow-md"
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </div>
                  <div className="absolute bottom-space-md left-space-md right-space-md flex items-center justify-between text-on-primary">
                    <div>
                      <p className="font-label-md text-label-md font-semibold text-on-primary">
                        {draft.title || 'Product cover photo'}
                      </p>
                      <p className="font-caption text-caption text-on-primary/80">
                        JPG, PNG or WEBP up to {MAX_IMAGE_UPLOAD_MB}MB
                      </p>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <button
                        type="button"
                        onClick={() => pickAndPreparePhoto('cover')}
                        className="px-space-md py-space-xs rounded-xl bg-surface-canvas text-text-primary font-label-md text-label-md font-semibold shadow hover:bg-surface-tint-blue transition-colors flex items-center gap-1"
                      >
                        <Icon name="cached" className="text-[18px] text-primary" />
                        <span>{editor.uploading ? 'Uploading…' : 'Change Photo'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-72 rounded-xl border-2 border-dashed border-outline-variant/60 hover:border-primary bg-surface-container-low flex flex-col items-center justify-center p-space-lg text-center transition-colors mb-space-md">
                  <div className="w-14 h-14 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center mb-space-sm">
                    <Icon name="add_a_photo" className="text-[28px]" />
                  </div>
                  <h3 className="font-heading-xs text-heading-xs text-text-primary mb-1">
                    Add Main Cover Photo
                  </h3>
                  <p className="font-caption text-caption text-text-secondary max-w-sm mb-space-md">
                    Upload your primary product photo in 16:9 aspect ratio. JPG, PNG or WEBP up to {MAX_IMAGE_UPLOAD_MB}MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => pickAndPreparePhoto('cover')}
                    className="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <Icon name="cloud_upload" className="text-[18px]" />
                    <span>{editor.uploading ? 'Uploading…' : 'Upload Cover Photo'}</span>
                  </button>
                </div>
              )}

              {(editor.uploadError || mediaError) && (
                <p role="alert" className="mb-space-md rounded-lg bg-error-container px-space-sm py-space-xs font-caption text-caption text-error font-semibold">
                  {editor.uploadError ?? mediaError}
                </p>
              )}

              {pendingPhoto && (
                <div className="mb-space-md">
                  <ImageCropControl
                    file={pendingPhoto.file}
                    onApply={useCroppedPhoto}
                    onCancel={() => setPendingPhoto(null)}
                  />
                </div>
              )}

              <div className="flex flex-col gap-space-xs mb-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                    Additional Gallery Images (Up to 4 optional photos)
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">
                    {galleryImages.length} of 4 gallery photos
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-space-sm">
                  {galleryImages.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="relative aspect-square rounded-xl overflow-hidden bg-surface-container group shadow-sm ring-1 ring-border-subtle"
                    >
                      <img alt={`Gallery photo ${index + 1}`} className="w-full h-full object-cover" src={src} />
                      <button
                        type="button"
                        aria-label={`Remove gallery photo ${index + 1}`}
                        onClick={() => removeGalleryPhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-inverse-surface/85 text-inverse-on-surface hover:bg-error hover:text-on-primary flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Icon name="close" className="text-[14px]" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-inverse-surface/80 text-inverse-on-surface text-[10px] font-bold px-1.5 py-0.5 rounded">
                        #{index + 2}
                      </span>
                    </div>
                  ))}
                  {galleryImages.length < 4 && (
                    <button
                      type="button"
                      onClick={() => pickAndPreparePhoto('gallery')}
                      className="aspect-square rounded-xl bg-surface-container-low hover:bg-surface-tint-blue text-primary flex flex-col items-center justify-center gap-1 transition-all group border border-dashed border-outline-variant/60 hover:border-primary"
                    >
                      <Icon name="add_photo_alternate" className="text-[24px] group-hover:scale-110 transition-transform" />
                      <span className="font-caption text-caption font-semibold">+ Add Photo</span>
                      <span className="text-[10px] text-text-tertiary">({4 - galleryImages.length} left)</span>
                    </button>
                  )}
                  {(draft.videos ?? []).map((video, index) => (
                    <div
                      key={`${video}-${index}`}
                      className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-high shadow-sm"
                    >
                      <video src={video} muted playsInline className="w-full h-full object-cover" />
                      <button
                        type="button"
                        aria-label={`Remove video ${index + 1}`}
                        onClick={() => onDraftChange?.({ videos: (draft.videos ?? []).filter((_, i) => i !== index) })}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-inverse-surface/85 text-inverse-on-surface flex items-center justify-center"
                      >
                        <Icon name="close" className="text-[14px]" />
                      </button>
                      <span className="absolute bottom-1 left-1 rounded bg-inverse-surface/80 px-1 text-[10px] font-bold text-inverse-on-surface">
                        VIDEO {index + 1}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVideo}
                    className="aspect-square rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary flex flex-col items-center justify-center gap-1 transition-all border border-dashed border-outline-variant/60"
                  >
                    <Icon name="videocam" className="text-[22px]" />
                    <span className="font-caption text-caption">
                      {videoBusy ? 'Uploading…' : 'Add Video'}
                    </span>
                    <span className="text-[10px] text-text-tertiary">MP4 • ≤{MAX_VIDEO_UPLOAD_MB}MB</span>
                  </button>
                </div>
              </div>

              <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
                <Icon name="tips_and_updates" className="text-primary text-[22px] shrink-0" />
                <div className="flex-1">
                  <p className="font-label-sm text-label-sm font-semibold text-primary">Pro Tip for Merchants</p>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5 leading-relaxed">
                    Clear, well-lit photos on clean neutral backgrounds unlock 3x higher customer engagement and faster
                    checkouts.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-xl">
            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="auto_awesome" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">No image? Create one with AI</h2>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                VEMTAP prepares an image prompt from your product name
                {draft.title ? ` (“${draft.title}”)` : ''}, description and category
                {draft.primaryCategory ? ` (${draft.primaryCategory})` : ''}. Review and edit the prompt before opening
                ChatGPT or Google Gemini, generate the image there, then upload it right here.
              </p>
              <CreateWithAiButton aspectRatio="16/9" assetType="product" context={aiProductContext} fileHint="Aspect 16:9" />
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-sm p-space-xl flex flex-col gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <Icon name="history" className="text-primary text-[20px] shrink-0" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Everything you entered in Step 1 (details) and Step 2 (pricing) is saved. Use the Back button any time
                  to edit it — your image selection stays right here when you return.
                </p>
              </div>
            </section>
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
              <span>Back to Pricing</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft &amp; Exit</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-sm hover:shadow-md transition-all"
          >
            <span>Continue to Branch Availability</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </div>
      {editor.uploadError && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {editor.uploadError}
        </div>
      )}
    </Shell>
  );
}
