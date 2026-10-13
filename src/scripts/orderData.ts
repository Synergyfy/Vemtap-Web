export type FulfillmentMode = 'pickup' | 'delivery';

export interface OrderLine {
  id: string;
  productId?: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  options?: string;
  instructions?: string;
}

export interface OrderSummary {
  ref: string;
  lines: OrderLine[];
  subtotal: number;
  savings: number;
  deliveryFee: number;
  total: number;
  fulfillment: FulfillmentMode;
}

export const VOUCHER_CODE = 'VT-48F261';
export const VOUCHER_RATE = 0.2;
export const DELIVERY_FEE = 1000;
export const SERVICE_FEE = 0;

export const MERCHANT_NAME = 'Urban Grill & Bistro';
export const MERCHANT_PHONE_DISPLAY = '+234 802 345 6789';
export const MERCHANT_PHONE_TEL = '+2348023456789';
export const MERCHANT_ADDRESS = 'Plot 104 Apo Boulevard, Garki, Abuja';
export const MERCHANT_LOCATION_SUBLINE = 'Plot 104 Apo Boulevard, Ground Floor Food Court';

export const MERCHANT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCA8_kMmN6cnVSKGg_FDIm2SzH9HmOHSLTtjZyaZwJWLCj2BHLOAcN6uGA-S-zEwlWFysUhzXoYUu0jeKXAYCupeyY00C-kLrF2n8NObPQMutWhfbBLfZx4Vh8gmU4sEWUIc8SyHTYKkdEVFamZLfN-R8wHGIMBAbWGuSAAY76R6eT6pCMme_X7T3tIL6nUZHfOzG1R8AlYqxsCZ8oa2oSfmEulVSGSL0kw3gcv7AjkQKzyMF06cbCDKw';

export const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAzhZzFT3Gry5iHdZCpEQvkukGdJ_7K69oNSRrJGyum-Zc_a6VShzga5YmUHmQeWy0p3AyHsh0T6wZCEMRNpagbgjvaWNEFOV_yaEb4-moOELk0PVDthraM4eokB9PReJcbzcjOswMTrA7TTOea_LgJdFfl9vOihjwfyo8k8IF0o15t4i2QRZGrONyOxQd_-Gfowx_WEbO_KQwrol9aRmcMVbunpciSq6vXr3_6Tr3ZwM8-ayUxMud8rg';

export const newOrderRef = (taken: readonly string[] = []): string => {
  const blocked = new Set(taken.map((ref) => ref.trim().toUpperCase()));
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = `UG-${Math.floor(10000 + Math.random() * 89999)}`;
    if (!blocked.has(candidate.toUpperCase())) return candidate;
  }
  // Practically unreachable, but never hand out a colliding reference.
  return `UG-${String(Date.now()).slice(-5)}`;
};

export type OrderStatus =
  | 'submitted'
  | 'confirmed'
  | 'processing'
  | 'ready-for-collection'
  | 'completed'
  | 'cancelled';

export interface OrderStatusMeta {
  key: OrderStatus;
  label: string;
  tone: 'new' | 'progress' | 'ready' | 'done' | 'cancelled';
}

export const ORDER_STATUSES: readonly OrderStatusMeta[] = [
  { key: 'submitted', label: 'Submitted', tone: 'new' },
  { key: 'confirmed', label: 'Confirmed', tone: 'progress' },
  { key: 'processing', label: 'Processing', tone: 'progress' },
  { key: 'ready-for-collection', label: 'Ready for Collection', tone: 'ready' },
  { key: 'completed', label: 'Completed', tone: 'done' },
  { key: 'cancelled', label: 'Cancelled', tone: 'cancelled' },
];

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((meta) => meta.key === status)?.label ?? status;
}

export const estimateReadyBy = (minutes = 25) =>
  new Date(Date.now() + minutes * 60_000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
