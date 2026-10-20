import { useRef, useState } from 'react';
import { Icon } from './ui/Icon';

export interface CategoryImageFieldProps {
  /** Current image (data URL) or an empty string. Categories are optional. */
  value: string;
  onChange: (next: string) => void;
  /** Field label. */
  label?: string;
  /** Helper copy under the control. */
  hint?: string;
}

/**
 * Optional image picker for a product/service category: preview, replace and
 * remove in one compact control.
 *
 * Storage follows the app's existing approach (`ServiceImageUploader`): the
 * file is read into a data URL client-side, because the app has no storage
 * bucket yet. The image is optional everywhere it is used — clearing it just
 * leaves the category icon as the fallback.
 */
export function CategoryImageField({
  value,
  onChange,
  label = 'Category image',
  hint = 'Optional. Used as the fallback image for products in this category that have no image of their own.',
}: CategoryImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG or WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setError(null);
        onChange(dataUrl);
      } else {
        setError('That image could not be read. Try another file.');
      }
    };
    reader.onerror = () => setError('That image could not be read. Try another file.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1">
      <label className="text-caption font-semibold text-text-primary">
        {label} <span className="text-text-tertiary font-normal">(optional)</span>
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      <div className="flex items-start gap-space-sm">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          title={value ? 'Replace image' : 'Upload image'}
          className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-subtle border border-border shrink-0 group"
        >
          {value ? (
            <>
              <img src={value} alt="Category" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Icon name="file_upload" className="text-[20px]" />
              </span>
            </>
          ) : (
            <span className="w-full h-full flex flex-col items-center justify-center text-text-tertiary gap-1">
              <Icon name="add_photo_alternate" className="text-[22px]" />
              <span className="text-[10px] font-semibold">Upload</span>
            </span>
          )}
        </button>

        <div className="flex flex-col gap-1 min-w-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-left text-caption font-semibold text-primary hover:underline"
          >
            {value ? 'Replace image' : 'Choose an image'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                onChange('');
              }}
              className="text-left text-caption font-semibold text-error hover:underline"
            >
              Remove image
            </button>
          )}
          <span className="text-[11px] text-text-tertiary leading-snug">{hint}</span>
        </div>
      </div>

      {error && <p className="text-caption text-error font-semibold">{error}</p>}
    </div>
  );
}
