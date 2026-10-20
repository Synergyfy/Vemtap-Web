/**
 * Platform connections registry — architecture placeholder.
 *
 * "Connect an Existing Platform" is intentionally a Coming Soon option. No
 * Shopify/WooCommerce/etc. integration exists, and this app currently has no
 * network layer at all (see `OrdersContext.tsx`), so shipping a fake sync
 * would be dishonest. This registry keeps the architecture ready: a future
 * implementation registers an authorised connector here and the chooser in
 * `AddProductMethodsDialog` flips from disabled to active without any other
 * changes.
 *
 * Required backend work when the time comes (none of it exists today):
 *  - OAuth callback endpoints per platform (authorisation must happen
 *    server-side so merchant credentials never touch this browser).
 *  - `POST /integrations/:platform/connect` + `GET /integrations/:platform/products`
 *    with the importing business's ownership enforced server-side.
 *  - Server-side image proxying so remote CDN assets can be stored.
 */
export interface PlatformConnector {
  id: string;
  name: string;
  icon: string;
  blurb: string;
  /** Only real, shipped connectors may set this. */
  available: boolean;
  /** Authorisation entry point once the backend exists. */
  authorizeUrl?: string;
}

export const PLATFORM_CONNECTORS: PlatformConnector[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    icon: 'shopping_bag',
    blurb: 'Import products, SKUs and images from a Shopify store.',
    available: false,
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    icon: 'woo_commerce',
    blurb: 'Sync your WooCommerce catalogue into VEMTAP.',
    available: false,
  },
  {
    id: 'square',
    name: 'Square',
    icon: 'square',
    blurb: 'Bring across Square items and inventory counts.',
    available: false,
  },
];

export const AVAILABLE_CONNECTORS = PLATFORM_CONNECTORS.filter((connector) => connector.available);
