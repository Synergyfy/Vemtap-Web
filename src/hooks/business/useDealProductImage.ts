import { useEffect, useState } from 'react';
import { firstUsableItemImage } from '../../scripts/catalogueLive';
import { apiErrorMessage } from '../../services/errorMessages';
import type { CatalogueItem } from '../../services/catalogueItemsService';
import { pickAndUploadImage } from '../../services/uploadService';
import { useCatalogueItemMutations } from './useCatalogueItems';

/**
 * Shared image gate for live deal creation. It uploads through the existing
 * `/uploads` flow, saves the hosted URL back to the catalogue item, and exposes
 * the new URL so both deal studios can replace their neutral tile with the
 * merchant's photo.
 */
export function useDealProductImage(sourceItem: CatalogueItem | null | undefined) {
  const update = useCatalogueItemMutations().update;
  const [imageUrl, setImageUrl] = useState<string | null>(() => firstUsableItemImage(sourceItem));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl(firstUsableItemImage(sourceItem));
    setUploadError(null);
  }, [sourceItem?.id, sourceItem?.mainImage]);

  const uploadPhoto = async (): Promise<string | null> => {
    setUploadError(null);
    setUploading(true);
    try {
      const url = await pickAndUploadImage();
      if (!url) return null;
      if (sourceItem) {
        await update.mutateAsync({ id: sourceItem.id, input: { mainImage: url } });
      }
      setImageUrl(url);
      return url;
    } catch (error) {
      setUploadError(apiErrorMessage(error, 'Could not upload this photo. Please try again.'));
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    imageUrl,
    uploadPhoto,
    uploading: uploading || update.isPending,
    error: uploadError ?? (update.isError ? apiErrorMessage(update.error, 'Could not save this photo to the product.') : null),
  };
}
