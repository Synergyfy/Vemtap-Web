import { useRef, useState } from 'react';
import { Icon } from './ui/Icon';
import { CreateWithAiButton } from './CreateWithAiButton';
import { ImageCropControl } from './media/ImageCropControl';
import {
  imageFileError,
  pickAndUploadVideo,
  uploadImage,
  MAX_IMAGE_UPLOAD_MB,
  MAX_VIDEO_UPLOAD_MB,
} from '../services/uploadService';
import { apiErrorMessage } from '../services/errorMessages';
import { hasApiConfig } from '../services/api/client';
import type { AiPromptContext } from '../scripts/aiDesignAssistant';

export const SERVICE_PRESET_GALLERY = [];

interface ServiceImageUploaderProps {
  currentImage: string;
  onImageChange: (imageUrl: string) => void;
  aspectRatio?: '4/3' | '16/9' | 'square';
  /** Live service video URLs, shown beside the cover photo. */
  videos?: string[];
  /** Receives the updated video list after an upload or removal. */
  onVideosChange?: (videos: string[]) => void;
  /**
   * Service facts for the contextual "Create with AI" prompt (title,
   * description, classification). Business-level facts are resolved by the
   * prompt builder itself; omit this to fall back to whatever is available.
   */
  aiContext?: AiPromptContext;
}

export function ServiceImageUploader({
  currentImage,
  onImageChange,
  aspectRatio = '4/3',
  videos = [],
  onVideosChange,
  aiContext,
}: ServiceImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showVideos = Boolean(onVideosChange) && hasApiConfig();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset file input so same file can be re-selected if desired
    e.target.value = '';
    if (!file) return;
    const problem = imageFileError(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setPendingFile(file);
  };

  const useCroppedFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      onImageChange(url);
      setPendingFile(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not upload this image.');
    } finally {
      setBusy(false);
    }
  };

  const addVideo = async () => {
    if (!onVideosChange || videoBusy) return;
    setVideoBusy(true);
    setError(null);
    try {
      const url = await pickAndUploadVideo();
      if (url) onVideosChange([...videos, url]);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'Could not upload this video.'));
    } finally {
      setVideoBusy(false);
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : 'aspect-[4/3]';

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Preview Box */}
      <div className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden shadow-sm bg-surface-container-high group border border-outline/10`}>
        {currentImage ? (
          <img
            src={currentImage}
            alt="Service cover preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-text-tertiary">
            <Icon name="add_photo_alternate" className="text-[48px]" />
            <span className="font-label-md text-label-md">No image selected</span>
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-scrim/75 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm text-white">
            <Icon className="text-[14px] text-tertiary-fixed" filled name="star" />
            <span className="font-label-sm text-label-sm font-medium">Cover Photo</span>
          </div>
          <span className="font-caption text-caption bg-surface-canvas/90 backdrop-blur-md px-2.5 py-1 rounded-full text-text-secondary font-medium">
            Active on Storefront
          </span>
        </div>

        {/* Floating Bottom Actions */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-surface-canvas/95 hover:bg-surface-canvas active:scale-95 text-text-primary px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all font-button-secondary text-button-secondary font-semibold"
          >
            <Icon className="text-[18px] text-primary" name="file_upload" />
            <span>{currentImage ? 'Replace Photo' : 'Upload Photo'}</span>
          </button>
        </div>
      </div>

      <p className="font-caption text-caption text-text-secondary">
        JPG, PNG or WEBP up to {MAX_IMAGE_UPLOAD_MB}MB. Crop the photo before it is uploaded.
      </p>

      {showVideos && (
        <div className="flex flex-wrap gap-2">
          {videos.map((video, index) => (
            <div
              key={`${video}-${index}`}
              className="relative h-16 w-24 rounded-xl overflow-hidden bg-surface-container-high shadow-sm"
            >
              <video src={video} muted playsInline className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label={`Remove video ${index + 1}`}
                onClick={() => onVideosChange?.(videos.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-inverse-surface/85 text-inverse-on-surface"
              >
                <Icon name="close" className="text-[12px]" />
              </button>
              <span className="absolute bottom-1 left-1 rounded bg-inverse-surface/80 px-1 text-[9px] font-bold text-inverse-on-surface">
                V{index + 1}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={addVideo}
            disabled={videoBusy}
            className="flex h-16 w-24 flex-col items-center justify-center gap-0.5 rounded-xl bg-surface-container-low text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-60"
          >
            <Icon name="videocam" className="text-[18px]" />
            <span className="text-[10px] font-medium">{videoBusy ? 'Uploading…' : 'Add Video'}</span>
            <span className="text-[9px] text-text-tertiary">MP4 • ≤{MAX_VIDEO_UPLOAD_MB}MB</span>
          </button>
        </div>
      )}

      {error && <p className="font-caption text-caption text-error font-semibold">{error}</p>}

      {pendingFile && (
        <ImageCropControl
          file={pendingFile}
          onApply={useCroppedFile}
          onCancel={() => {
            setError(null);
            setPendingFile(null);
          }}
        />
      )}

      {/* Contextual AI option — the upload action above stays unchanged */}
      <div>
        <CreateWithAiButton
          aspectRatio={aspectRatio}
          assetType="service"
          context={aiContext}
          fileHint={`JPG, PNG or WEBP up to ${MAX_IMAGE_UPLOAD_MB}MB`}
        />
      </div>
      {busy && <p className="font-caption text-caption text-primary">Uploading cropped image…</p>}
    </div>
  );
}
