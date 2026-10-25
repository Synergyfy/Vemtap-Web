import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { categoriesService, type CatalogueCategory } from '../../services/categoriesService';
import { pickAndUploadImage } from '../../services/uploadService';
import { useCatalogueCategories } from './useCatalogueCategories';
import { categoriesKeys } from './useCatalogueCategories';
import type { CentralCategory } from '../../scripts/catalogueData';

/** An API category in the shape the add-item editors render. */
const toCentral = (category: CatalogueCategory, type: 'product' | 'service'): CentralCategory => ({
  id: category.id,
  name: category.name,
  slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  type,
  description: '',
  icon: type === 'service' ? 'spa' : 'category',
  productCount: 0,
  activeBranches: ['all'],
  qrDestinationUrl: '',
  stats: { scans: 0, uniqueScans: 0, ordersCount: 0, unitsOrdered: 0, totalRevenue: 0 },
});

/**
 * Live add-item editors: the business's real categories (created through the
 * API when added inline) and photo uploads. Demo mode keeps the sample data.
 */
export function useLiveItemEditor(type: 'product' | 'service') {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const categories = useCatalogueCategories();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return {
    live,
    categories: (categories.data ?? []).map((c) => toCentral(c, type)),
    categoriesLoading: categories.isLoading,
    createCategory: async (name: string) => {
      const created = await categoriesService.create(name);
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      return toCentral(created, type);
    },
    uploading,
    uploadError,
    clearUploadError: () => setUploadError(null),
    /** Picks an image and uploads it; resolves with its URL, or null when cancelled or failed. */
    uploadPhoto: async (): Promise<string | null> => {
      setUploadError(null);
      setUploading(true);
      try {
        return await pickAndUploadImage();
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
        return null;
      } finally {
        setUploading(false);
      }
    },
  };
}
