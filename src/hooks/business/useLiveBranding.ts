import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessService, type MyBusiness } from '../../services/businessService';
import { myBusinessKeys, useMyBusiness } from './useMyBusiness';

type BrandingPatch = Pick<MyBusiness, 'logoUrl' | 'coverImage' | 'gallery'>;

/**
 * Live branding: each image is saved to the business as soon as it uploads, so
 * a reload (or leaving setup) never loses it, and the screen starts from what
 * is already saved. `onLoaded` runs once with the saved images.
 */
export function useLiveBranding(onLoaded: (saved: { logoUrl: string | null; coverImage: string | null; gallery: string[] }) => void) {
  const live = hasApiConfig();
  const business = useMyBusiness();
  const queryClient = useQueryClient();
  const loaded = useRef(false);

  useEffect(() => {
    if (!live || loaded.current || !business.data) return;
    loaded.current = true;
    onLoaded({ logoUrl: business.data.logoUrl ?? null, coverImage: business.data.coverImage ?? null, gallery: business.data.gallery ?? [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, business.data]);

  const save = async (patch: BrandingPatch) => {
    if (!live) return;
    await businessService.updateMyBusiness(patch);
    void queryClient.invalidateQueries({ queryKey: myBusinessKeys.all });
  };

  return { live, save };
}
