import { hasApiConfig } from '../../services/api/client';
import { getCentralCategories, URBAN_PRODUCTS } from '../../scripts/catalogueData';
import { toPrice } from '../../services/catalogueItemsService';
import { useBusinessQr } from './useBusinessQr';
import { useCatalogueCategories } from './useCatalogueCategories';
import { useCatalogueItems } from './useCatalogueItems';
import { useMyBusiness } from './useMyBusiness';

/**
 * The three stable public destinations printed on a store's QR codes.
 *
 * The links are built against the app the merchant is actually looking at
 * (`window.location.origin`), so a QR generated locally opens the local
 * storefront and a QR generated in production opens the production one. The
 * short `/b/<code>` link is resolved by `resolveBusinessPath` into the public
 * profile, a category-filtered catalogue or a product detail page.
 */
export function usePrimaryStoreQrLinks() {
  const live = hasApiConfig();
  const businessQr = useBusinessQr();
  const myBusiness = useMyBusiness();
  const liveCategories = useCatalogueCategories();
  const liveProducts = useCatalogueItems('product');

  const codeFromQr = (() => {
    try {
      const match = /\/b\/([^/?#]+)/.exec(businessQr.url ?? '');
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  })();
  const code = myBusiness.data?.uniqueCode || codeFromQr;

  // Demo mode uses the bundled store's code, but always on the current host.
  const storeBase = live
    ? code
      ? `${window.location.origin}/b/${encodeURIComponent(code)}`
      : ''
    : `${window.location.origin}/business/urban-grill-bistro-104/products`;
  const withParams = (params: string) => (storeBase ? `${storeBase}${storeBase.includes('?') ? '&' : '?'}${params}` : '');

  const categories = live
    ? (liveCategories.data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon ?? 'category',
        description: category.description ?? '',
        stats: null as null | { scans: number; ordersCount: number; totalRevenue: number },
      }))
    : getCentralCategories('product');

  const products = live
    ? (liveProducts.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        image: item.mainImage || '',
        imageAlt: item.name,
        price: toPrice(item.price ?? undefined) ?? 0,
        category: item.category?.name ?? 'Product',
      }))
    : URBAN_PRODUCTS;

  return {
    live,
    loading: businessQr.loading || (live && !code),
    error: businessQr.error,
    storeName: live ? businessQr.name ?? 'Your business' : 'Urban Grill & Bistro',
    withParams,
    storeUrl: withParams('src=store-qr'),
    categoryUrl: (categoryId: string) => withParams(`category=${encodeURIComponent(categoryId)}&src=cat-qr`),
    productUrl: (productId: string) => withParams(`product=${encodeURIComponent(productId)}&src=prod-qr`),
    categories,
    products,
  };
}
