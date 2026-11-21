import { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface ProductImageProps {
  /** Live product image URL. Empty, missing or broken URLs use the cart placeholder. */
  src?: string | null;
  alt: string;
  /** Sizing/positioning for the image container, e.g. `h-44 w-full`. */
  className?: string;
  /** Styling for the real image only, e.g. `object-cover group-hover:scale-105`. */
  imageClassName?: string;
  /** Hide the caption on very small thumbnails. */
  showLabel?: boolean;
  /** Override the placeholder cart icon size. */
  iconClassName?: string;
}

/**
 * Shared product image renderer. Live catalogue products can legitimately have
 * no image, and hosted images can fail to load; both cases show the same clean
 * grey cart tile instead of an empty/broken box. Badges layered over this
 * component by callers continue to work because the container stays relative.
 */
export function ProductImage({
  src,
  alt,
  className = '',
  imageClassName = 'h-full w-full object-cover',
  showLabel = true,
  iconClassName = 'text-[30px]',
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src?.trim()) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-surface-subtle ${className}`}>
      {hasImage ? (
        <img
          alt={alt}
          className={imageClassName}
          onError={() => setFailed(true)}
          src={src ?? undefined}
        />
      ) : (
        <div
          aria-label={`${alt} — no image uploaded yet`}
          className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-surface-canvas via-surface-subtle to-surface-container px-2 text-center"
          role="img"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-canvas/80 shadow-xs">
            <Icon className={`text-text-tertiary ${iconClassName}`} name="shopping_cart" />
          </span>
          {showLabel && (
            <span className="mt-2 font-caption text-caption font-medium text-text-tertiary">
              No image yet
            </span>
          )}
        </div>
      )}
    </div>
  );
}
