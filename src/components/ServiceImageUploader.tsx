import { useRef } from 'react';
import { Icon } from './ui/Icon';
import { CreateWithAiButton } from './CreateWithAiButton';
import type { AiPromptContext } from '../scripts/aiDesignAssistant';

export const SERVICE_PRESET_GALLERY = [];

interface ServiceImageUploaderProps {
  currentImage: string;
  onImageChange: (imageUrl: string) => void;
  aspectRatio?: '4/3' | '16/9' | 'square';
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
  aiContext,
}: ServiceImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onImageChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if desired
    e.target.value = '';
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
        accept="image/*"
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

      {/* Contextual AI option — the upload action above stays unchanged */}
      <div>
        <CreateWithAiButton
          aspectRatio={aspectRatio}
          assetType="service"
          context={aiContext}
          fileHint="Image files (JPG, PNG, WEBP)"
        />
      </div>
    </div>
  );
}
