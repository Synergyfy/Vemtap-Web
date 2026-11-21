import { CreateWithAiButton } from './CreateWithAiButton';
import { Icon } from './ui/Icon';
import { ProductImage } from './ui/ProductImage';

interface ProductImageUploadPromptProps {
  itemName: string;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  uploading: boolean;
  error?: string | null;
  onUpload: () => void;
}

/** Upload/help content shared by the desktop and mobile deal image gates. */
export function ProductImageUploadPrompt({
  itemName,
  category,
  description,
  imageUrl,
  uploading,
  error,
  onUpload,
}: ProductImageUploadPromptProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-subtle p-space-sm">
      <div className="flex items-start gap-space-sm">
        <ProductImage
          alt={itemName}
          className="h-20 w-20 shrink-0 rounded-lg"
          iconClassName="text-[22px]"
          showLabel={false}
          src={imageUrl}
        />
        <div className="min-w-0 flex-1">
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-space-sm font-label-sm text-label-sm font-bold text-on-primary hover:bg-primary-hover disabled:opacity-60 transition-colors"
            disabled={uploading}
            onClick={onUpload}
            type="button"
          >
            <Icon className={uploading ? 'text-[17px] animate-spin' : 'text-[17px]'} name={uploading ? 'progress_activity' : 'upload'} />
            {uploading ? 'Uploading…' : imageUrl ? 'Replace photo' : 'Upload product photo'}
          </button>
          <p className="mt-space-2xs font-caption text-caption text-text-secondary">
            JPG, PNG or WEBP up to 5MB. This photo replaces the grey cart tile everywhere this product appears.
          </p>
          <div className="mt-space-2xs flex flex-wrap items-center gap-x-space-sm gap-y-space-2xs">
            <CreateWithAiButton
              assetType="product"
              aspectRatio="square"
              fileHint="JPG, PNG or WEBP up to 5MB"
              label="Create with AI"
              context={{
                itemName,
                category: category ?? undefined,
                itemDescription: description ?? undefined,
              }}
            />
            <span className="font-caption text-caption text-text-tertiary">Generate, download, then upload it here.</span>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-space-xs rounded-lg bg-error-container px-space-xs py-space-2xs font-caption text-caption font-medium text-on-error-container">
          {error}
        </p>
      )}
    </div>
  );
}
