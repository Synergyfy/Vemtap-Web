import { api } from './api/client';
import { withMock } from './mock';

/**
 * `GET /pos/settings` — only the fields the web screens edit are typed here;
 * the server returns more (permissions, tender rails, sync limits).
 */
export interface PosSettings {
  currency?: string | null;
  receiptHeader?: string | null;
  receiptFooter?: string | null;
  receiptAddress?: string | null;
  receiptPhone?: string | null;
  receiptWidth?: number | null;
  autoPrintReceipt?: boolean | null;
  autoPrintOn?: string[] | null;
  printKitchenChits?: boolean | null;
  showLogo?: boolean | null;
  tin?: string | null;
  taxEnabled?: boolean | null;
  taxRate?: number | null;
  taxLabel?: string | null;
  pricesIncludeTax?: boolean | null;
  takeawayVatExempt?: boolean | null;
  serviceChargeEnabled?: boolean | null;
  serviceChargeRate?: number | null;
  serviceChargeWaivable?: boolean | null;
  packagingFee?: number | null;
  packagingAutoApply?: boolean | null;
  selfOrderingEnabled?: boolean | null;
  maxQrOrderValue?: number | null;
  rushPause?: boolean | null;
}

/** Partial update body; the server merges field by field. */
export type PosSettingsUpdate = Partial<PosSettings>;

let mockSettings: PosSettings = {
  currency: 'NGN',
  receiptHeader: 'Thank you for dining with Urban Grill',
  receiptFooter: 'No returns after 7 days. Receipt required.',
  receiptAddress: 'Plot 42, Aminu Kano Cres, Wuse II, Abuja',
  receiptPhone: '+234 803 411 9082',
  receiptWidth: 80,
  autoPrintReceipt: false,
  autoPrintOn: ['sale'],
  printKitchenChits: true,
  showLogo: true,
  tin: '',
  taxEnabled: true,
  taxRate: 7.5,
  taxLabel: 'VAT',
  pricesIncludeTax: false,
  takeawayVatExempt: false,
  serviceChargeEnabled: false,
  serviceChargeRate: 5,
  serviceChargeWaivable: true,
  packagingFee: 200,
  packagingAutoApply: false,
  selfOrderingEnabled: true,
  maxQrOrderValue: 0,
  rushPause: false,
};

export const posSettingsService = {
  get: () => withMock(() => api.get<PosSettings>('/pos/settings'), () => ({ ...mockSettings })),

  update: (body: PosSettingsUpdate) =>
    withMock(
      () => api.patch<PosSettings>('/pos/settings', body),
      () => {
        mockSettings = { ...mockSettings, ...body };
        return { ...mockSettings };
      },
    ),
};
