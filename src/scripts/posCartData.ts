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

export const cartTotals = (lines: PosCartLine[]) => {
  const subtotal = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const discount = lines.reduce((sum, line) => sum + (line.unit - line.member) * line.qty, 0);
  const vat = Math.round((subtotal - discount) * 0.075);
  return { subtotal, discount, vat, total: subtotal - discount + vat };
};
