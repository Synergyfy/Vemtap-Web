import type { TaxMode } from '../posCartData';

export interface PosTerminalLine {
  id: string;
  name: string;
  mods: string;
  /** Base unit price in NGN before any promotional/member discount. */
  unit: number;
  /** Per-unit promotional or member discount in NGN. */
  promo?: number;
  qty: number;
  /** Applied modifier ids (temperature, sauces, sides…). */
  modifierIds?: string[];
  /** Reference of the store order this line was loaded from, if any. */
  sourceOrderRef?: string;
}

export const VAT_RATE = 0.075;

export const SEED_POS_TERMINAL_LINES: PosTerminalLine[] = [
  {
    id: 'ribeye-250g',
    name: 'Woodfire Ribeye (250g)',
    mods: 'Medium Rare • Peppercorn Sauce • Garlic Butter',
    unit: 16000,
    qty: 1,
  },
  {
    id: 'smash-burger',
    name: 'Double Smash Burger & Fries',
    mods: 'No Pickles • Truffle Dip On Side',
    unit: 6500,
    promo: 650,
    qty: 1,
  },
  {
    id: 'mojito',
    name: 'Passionfruit Mojito',
    mods: 'Standard Ice • Low Cane Sugar',
    unit: 3500,
    qty: 1,
  },
];

export interface PosTerminalTotals {
  gross: number;
  discount: number;
  net: number;
  vat: number;
  total: number;
  itemCount: number;
}

export function computeTotals(
  lines: PosTerminalLine[],
  mode: TaxMode = 'checkout',
  rate: number = VAT_RATE,
): PosTerminalTotals {
  const gross = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const discount = lines.reduce((sum, line) => sum + (line.promo ?? 0) * line.qty, 0);
  const net = gross - discount;
  // 'none' → no tax at all; 'checkout' → charged on top of the net;
  // 'inclusive' → already inside the listed prices (embedded portion reported).
  const vat = mode === 'none' ? 0 : mode === 'inclusive' ? net - Math.round(net / (1 + rate)) : Math.round(net * rate);
  const total = mode === 'inclusive' ? net : net + vat;
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
  return { gross, discount, net, vat, total, itemCount };
}

export function formatNaira(value: number): string {
  return `₦${value.toLocaleString('en-NG')}`;
}

export interface PosCatalogItem {
  id: string;
  name: string;
  desc: string;
  unit: number;
  /** Optional pre-discount price for promotional catalogue cards. */
  was?: number;
  mods: string;
  img: string;
  alt: string;
  badge: string;
  badgeTone: 'neutral' | 'promo' | 'low' | 'ready' | 'express' | 'chef' | 'keg';
  stock: string;
  stockTone?: 'default' | 'low';
}

export const POS_CATALOG: PosCatalogItem[] = [
  {
    id: 'ribeye-250g',
    name: 'Woodfire Ribeye (250g)',
    desc: 'Prime aged beef • peppercorn sauce',
    unit: 16000,
    mods: 'Chef Special • Grills & Steaks',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPV0LICrsL7sBBwisqTkdKZIt8_rrpfjwf7TSwpUgOwhy9tSI0bJZltSnwGlynbrb1JUK3kEcW-UGTQC48vnPufm6C2eCNK9r3hI27azE93bsUCO_AyBi6u7ZCH2rZtyDvQt6OGW6-7h4gWb2kIcbtDpn34cVtI3vmwzBlYZVm8LcC5gckjbrCmWCM8MY51He5fkDE8wOrAImAWetpAjrItE7nsv2EkZMd_qHKq9mqWDbh3Cs1GeO6fg',
    alt: 'Gourmet woodfire seared ribeye steak 250 grams with crispy rosemary and crushed peppercorn crust served on a dark slate board with melted garlic butter sheen in fine dining restaurant lighting.',
    badge: '18 in stock',
    badgeTone: 'neutral',
    stock: '18 in stock',
  },
  {
    id: 'prime-lunch-combo',
    name: 'Prime Lunch Combo',
    desc: 'Entree + Side + Drink bundle',
    unit: 9600,
    was: 12000,
    mods: 'Bundled Deal',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5Pbacf4pZg68cdCZNzRXHjbWyxbYZKMV_-BI97VtwU4rjELDcWSC8uQxwQu7rAkEsmt-nMiOoVL3Z4ilOVT0e2wWEYy5aon0AUPP5I6IMwlBFkzksQiIMPYLrmxRIiV0KvPVdDqEUSHqbNIy4Dg86F-23ntFE0PCu7eyLduZtlcsHLFn8vNEOYPto3IaS0CUfr9pw6ptlqvlMTl8OcC9BPQpsmw3ZDeutDaY6iQz0YW-c15sE2EQf9g',
    alt: 'Artisanal lunch combo platter featuring a smoked gourmet sandwich, rustic crispy fries and a chilled craft soda glass arranged on clean minimalist marble counter with warm overhead studio light.',
    badge: '20% OFF DEAL',
    badgeTone: 'promo',
    stock: '20% OFF',
  },
  {
    id: 'smash-burger',
    name: 'Double Smash Burger',
    desc: 'Brioche bun, house truffle dip',
    unit: 6500,
    mods: 'No Pickles • Truffle Dip',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiGTR7m35BMDYxs-T6QDx4Bevv27VaIqYG-1l27jEZJ84-oqB2JoVeb0hy5t_pVkWByYzRqD7m5fiJWgt5iVIgj6BVoK_YSyApAy0sxJlNnXINz1uFbR7mwwcW49UqkBmn3455rQgB_y6UrZ-xHp8TeCEjhmgM0SDkPavjnBwl_1jKj1qK81dSpedWKGGtST6UIwIK8-nSFJovSTvvgtbUNpniE4jxnIna_7WEHFIC86jU4HUzaIFf0g',
    alt: 'Delicious double smash cheeseburger with melted cheddar cheese cascading down crispy seared edges on glazed brioche bun served alongside golden fries.',
    badge: '32 left',
    badgeTone: 'neutral',
    stock: '32 left',
  },
  {
    id: 'bbq-wings',
    name: 'Charcoal BBQ Wings (6)',
    desc: 'Sweet honey heat • Blue cheese',
    unit: 4800,
    mods: 'Sweet Honey Heat • Blue Cheese',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWUnnSHksLO9aAY2z-CIF3WYjm0JyB0CzXPOQARhIJqeZd4KMYFdEhafA0-64AmwCk-Aw2EXnmvGyfo6j-dDYR_O8gUhosUJoP8zGGHOM46BwHY5tb3FgtQbqtQ9aIsfxSxDXbUQ6_98nlPdwp0HQ_Pfbq8eDIXGDJMRr5aRWRty68SmlnYyBlSLj9rgdiil6ayZ_V7naY3uzxOJlit7NOxwFR70Vl9D6aMrqSO7qQptqyjB16SRBAqQ',
    alt: 'Six glazed charcoal BBQ chicken wings garnished with toasted sesame seeds and fresh scallions next to creamy blue cheese dip in a white ceramic dish.',
    badge: 'Low Stock (14)',
    badgeTone: 'low',
    stock: 'Low Stock (14)',
    stockTone: 'low',
  },
  {
    id: 'truffle-fries',
    name: 'Truffle Parmesan Fries',
    desc: 'Aged parmesan, black truffle oil',
    unit: 3200,
    mods: 'Aged Parmesan • Black Truffle Oil',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVwjtZ2PDXqaXVxSeRsVTwxc1AYcTP56YvF3Y6P5Smh0YC6LcPvZwF9BOrbS6vZrjATR3FN_fHQdlHao7oumdyWaWpmTTVMgoe_jmVzajVd3k8fluXlmfWV3i1rIT_pv1jNRRW7zrElTQ0jmj6mtzTHpgU-1fGZNtMAmf_9DLIDmQkW02ewmvouGTJgMfgnfUUeJeZjTDe9C_uPTqreV2x14t2Eg3PJ4mY2-a5Lk97th1Deup_UQACZw',
    alt: 'Golden hand-cut truffle parmesan french fries dusted with finely grated aged parmesan cheese and micro herbs served in an artisan metal serving basket.',
    badge: 'Ready in 4m',
    badgeTone: 'ready',
    stock: 'Ready in 4m',
  },
  {
    id: 'mojito',
    name: 'Passionfruit Mojito',
    desc: 'Fresh mint, crushed ice, cane syrup',
    unit: 3500,
    mods: 'Standard Ice • Low Cane Sugar',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDik5s0N4wPpWAdWipiX1HizSxfESNYvqbEqSeyhVkoYbtnTIC5zIyJ8IRTnGu2-4BVau9IiZ4_EKG8cFNLLCBl7L4flzrk9B3PB5cmuLQDrza39Rssbjmh5wgQDVkzth961n5T-2HvcFvWBcZHXBMLRmhps02xavM5ipFWm0512m9ro8JVAV_OS_Zi1wHWkayehjPimFV89y0Lrc75rQ6eaWFD7XZL0Uv4AtVuX0mgeiEB5HugT9wECw',
    alt: 'Vibrant tropical passionfruit mojito cocktail in tall ribbed glass with fresh mint sprigs, lime wedge, crushed crystal ice and sparkling bubbles on dark bar background.',
    badge: 'Bar Express',
    badgeTone: 'express',
    stock: 'Bar Express',
  },
  {
    id: 'draft-beer',
    name: 'Craft Draft Beer 500ml',
    desc: 'Cold tap house lager • 4.8% ABV',
    unit: 2200,
    mods: 'Cold Tap House Lager • 4.8% ABV',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI0bXHHdJYqHhyLmbkmT1iri8aEhgGARxuFC2e9i-YlSw-HrxZkfcbTaGlpVhL6ipgUFbXE0HsbIabC99BOPX3le4E1StHVXNikjsdCt8BFdwAulmmiiZfLPxvTAB_OS8hgdn-8BEA0LFgOZzu1m2JiPmahkbj3PCMwwLEU5GzXEQJjHn7NvS0GcB1qhT_b4JMTgktVjZ9IKn8QI3A1qls2-AxAz2T7_3oBK2h0CK-MJ4Gl_XiM1yy_Q',
    alt: 'Frosty tall beer mug with cold golden craft draft lager, thick frothy white head and condensation droplets against warm ambient pub tavern lights.',
    badge: 'Keg: 64%',
    badgeTone: 'keg',
    stock: 'Keg: 64%',
  },
  {
    id: 'jollof-asun',
    name: 'Smokey Jollof & Asun',
    desc: 'Dodo plantain + Charcoal goat meat',
    unit: 4800,
    mods: 'Dodo Plantain • Charcoal Goat Meat',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAwo0N01_45e8BBjvYHPOT3dtIoKHtTdlvj3wMPgej3E--Zcr-x79EUVGTfbiQtDvMtyrAP7Jo1PBLoAlcKD7M5GtPWXbyeNvGLTUGiorJBGhUHcAV-4x3JH2Q3dsmB2J6_kk4tqhnW91LiBp3_cV7RjQi5AJBqoFO8Dd6sPN-qDLy5NWIM-B3gOE1ruk8H1Zw25owzeHP0eUDvkoVx6a8ad5pONfbSb949fz9kWG7TSlc2JiIJbYYZw',
    alt: 'Authentic Nigerian smokey party jollof rice paired with tender spicy charcoal peppered asun goat meat and golden sweet fried dodo plantain slices on modern ceramic tableware.',
    badge: 'Chef Choice',
    badgeTone: 'chef',
    stock: 'Chef Choice',
  },
];

export function findCatalogItem(id: string): PosCatalogItem | undefined {
  return POS_CATALOG.find((item) => item.id === id);
}

export function addLine(lines: PosTerminalLine[], item: PosCatalogItem): PosTerminalLine[] {
  const existing = lines.find((line) => line.id === item.id);
  if (existing) {
    return lines.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line));
  }
  return [
    ...lines,
    {
      id: item.id,
      name: item.name,
      mods: item.mods,
      unit: item.unit,
      promo: item.id === 'smash-burger' ? 650 : undefined,
      qty: 1,
    },
  ];
}
