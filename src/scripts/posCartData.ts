export interface PosCartLine {
  id: string;
  name: string;
  unit: number;
  member: number;
  qty: number;
  note?: string;
}

export const SEED_POS_CART: PosCartLine[] = [
  {
    id: 'woodfire-ribeye-400g',
    name: 'Woodfire Aged Ribeye Steak',
    unit: 14000,
    member: 13300,
    qty: 1,
    note: 'Medium rare, peppercorn sauce',
  },
  {
    id: 'smoked-wagyu-double-burger',
    name: 'Smoked Wagyu Double Burger',
    unit: 6500,
    member: 6500,
    qty: 2,
    note: 'Extra pickles, house sauce',
  },
  { id: 'truffle-parmesan-wedges', name: 'Truffle Parmesan Wedges', unit: 3200, member: 3200, qty: 1 },
  { id: 'chapman-royale', name: 'Chapman Royale Signature', unit: 3000, member: 3000, qty: 2, note: 'Crushed ice, no sugar' },
];

export const cartCount = (lines: PosCartLine[]) => lines.reduce((sum, line) => sum + line.qty, 0);

/** How the till treats tax — derived from POS Settings → Tax & Pricing (shared via PosSettingsContext). */
export type TaxMode = 'none' | 'checkout' | 'inclusive';

/** Default tax rate — the live rate comes from POS Settings. */
export const VAT_RATE = 0.075;

/** Renders receipt text with the [business name] token replaced by the live name. */
export function formatReceiptText(text: string, businessName: string): string {
  return text.replace(/\[business name\]/gi, businessName);
}

export const cartTotals = (lines: PosCartLine[], mode: TaxMode = 'checkout', rate: number = VAT_RATE) => {
  const subtotal = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const discount = lines.reduce((sum, line) => sum + (line.unit - line.member) * line.qty, 0);
  const net = subtotal - discount;
  // 'none' → no tax at all; 'checkout' → charged on top of the net;
  // 'inclusive' → already inside the listed prices, so only the embedded
  // portion is reported and the total stays net.
  const vat = mode === 'none' ? 0 : mode === 'inclusive' ? net - Math.round(net / (1 + rate)) : Math.round(net * rate);
  const total = mode === 'inclusive' ? net : net + vat;
  return { subtotal, discount, vat, total };
};
