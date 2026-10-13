import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';


interface DesktopPosStockScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onOpenProduct: () => void;
  onOpenCatalogue: () => void;
}

type StockStatus = 'in-stock' | 'low' | 'critical' | 'eighty-sixed';

interface StockRow {
  id: string;
  name: string;
  category: string;
  sku: string;
  unit: number;
  onHand: number;
  reorder: number;
  par: number;
  status: StockStatus;
  shiftSold: number;
  img: string;
}

const STATUS_META: Record<StockStatus, { label: string; className: string; dot: string }> = {
  'in-stock': {
    label: 'In Stock',
    className: 'bg-badge-discount-bg text-badge-discount-text',
    dot: 'bg-badge-discount-text',
  },
  low: { label: 'Low Stock', className: 'bg-tertiary-fixed text-tertiary', dot: 'bg-tertiary' },
  critical: { label: 'Critical', className: 'bg-error-container text-error', dot: 'bg-error' },
  'eighty-sixed': { label: "86'd", className: 'bg-inverse-surface text-inverse-on-surface', dot: 'bg-error' },
};

const STOCK_ROWS: StockRow[] = [
  {
    id: 'ribeye-250g',
    name: 'Woodfire Ribeye (250g)',
    category: 'Grills & Steaks',
    sku: 'GRL-RIB-250',
    unit: 16000,
    onHand: 18,
    reorder: 10,
    par: 40,
    status: 'in-stock',
    shiftSold: 42,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPV0LICrsL7sBBwisqTkdKZIt8_rrpfjwf7TSwpUgOwhy9tSI0bJZltSnwGlynbrb1JUK3kEcW-UGTQC48vnPufm6C2eCNK9r3hI27azE93bsUCO_AyBi6u7ZCH2rZtyDvQt6OGW6-7h4gWb2kIcbtDpn34cVtI3vmwzBlYZVm8LcC5gckjbrCmWCM8MY51He5fkDE8wOrAImAWetpAjrItE7nsv2EkZMd_qHKq9mqWDbh3Cs1GeO6fg',
  },
  {
    id: 'prime-lunch-combo',
    name: 'Prime Lunch Combo',
    category: 'Bundles',
    sku: 'BND-LUN-01',
    unit: 9600,
    onHand: 24,
    reorder: 12,
    par: 30,
    status: 'in-stock',
    shiftSold: 19,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5Pbacf4pZg68cdCZNzRXHjbWyxbYZKMV_-BI97VtwU4rjELDcWSC8uQxwQu7rAkEsmt-nMiOoVL3Z4ilOVT0e2wWEYy5aon0AUPP5I6IMwlBFkzksQiIMPYLrmxRIiV0KvPVdDqEUSHqbNIy4Dg86F-23ntFE0PCu7eyLduZtlcsHLFn8vNEOYPto3IaS0CUfr9pw6ptlqvlMTl8OcC9BPQpsmw3ZDeutDaY6iQz0YW-c15sE2EQf9g',
  },
  {
    id: 'smash-burger',
    name: 'Double Smash Burger',
    category: 'Burgers & Sandwiches',
    sku: 'BGR-SM-02',
    unit: 6500,
    onHand: 32,
    reorder: 15,
    par: 60,
    status: 'in-stock',
    shiftSold: 55,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiGTR7m35BMDYxs-T6QDx4Bevv27VaIqYG-1l27jEZJ84-oqB2JoVeb0hy5t_pVkWByYzRqD7m5fiJWgt5iVIgj6BVoK_YSyApAy0sxJlNnXINz1uFbR7mwwcW49UqkBmn3455rQgB_y6UrZ-xHp8TeCEjhmgM0SDkPavjnBwl_1jKj1qK81dSpedWKGGtST6UIwIK8-nSFJovSTvvgtbUNpniE4jxnIna_7WEHFIC86jU4HUzaIFf0g',
  },
  {
    id: 'bbq-wings',
    name: 'Charcoal BBQ Wings (6)',
    category: 'Starters & Sides',
    sku: 'STR-WNG-06',
    unit: 4800,
    onHand: 14,
    reorder: 20,
    par: 50,
    status: 'low',
    shiftSold: 27,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWUnnSHksLO9aAY2z-CIF3WYjm0JyB0CzXPOQARhIJqeZd4KMYFdEhafA0-64AmwCk-Aw2EXnmvGyfo6j-dDYR_O8gUhosUJoP8zGGHOM46BwHY5tb3FgtQbqtQ9aIsfxSxDXbUQ6_98nlPdwp0HQ_Pfbq8eDIXGDJMRr5aRWRty68SmlnYyBlSLj9rgdiil6ayZ_V7naY3uzxOJlit7NOxwFR70Vl9D6aMrqSO7qQptqyjB16SRBAqQ',
  },
  {
    id: 'truffle-fries',
    name: 'Truffle Parmesan Fries',
    category: 'Starters & Sides',
    sku: 'STR-FRY-03',
    unit: 3200,
    onHand: 41,
    reorder: 18,
    par: 60,
    status: 'in-stock',
    shiftSold: 38,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVwjtZ2PDXqaXVxSeRsVTwxc1AYcTP56YvF3Y6P5Smh0YC6LcPvZwF9BOrbS6vZrjATR3FN_fHQdlHao7oumdyWaWpmTTVMgoe_jmVzajVd3k8fluXlmfWV3i1rIT_pv1jNRRW7zrElTQ0jmj6mtzTHpgU-1fGZNtMAmf_9DLIDmQkW02ewmvouGTJgMfgnfUUeJeZjTDe9C_uPTqreV2x14t2Eg3PJ4mY2-a5Lk97th1Deup_UQACZw',
  },
  {
    id: 'mojito',
    name: 'Passionfruit Mojito',
    category: 'Cocktails & Drinks',
    sku: 'BAR-MOJ-08',
    unit: 3500,
    onHand: 58,
    reorder: 24,
    par: 80,
    status: 'in-stock',
    shiftSold: 44,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDik5s0N4wPpWAdWipiX1HizSxfESNYvqbEqSeyhVkoYbtnTIC5zIyJ8IRTnGu2-4BVau9IiZ4_EKG8cFNLLCBl7L4flzrk9B3PB5cmuLQDrza39Rssbjmh5wgQDVkzth961n5T-2HvcFvWBcZHXBMLRmhps02xavM5ipFWm0512m9ro8JVAV_OS_Zi1wHWkayehjPimFV89y0Lrc75rQ6eaWFD7XZL0Uv4AtVuX0mgeiEB5HugT9wECw',
  },
  {
    id: 'draft-beer',
    name: 'Craft Draft Beer 500ml',
    category: 'Cocktails & Drinks',
    sku: 'BAR-DFT-12',
    unit: 2200,
    onHand: 9,
    reorder: 30,
    par: 120,
    status: 'critical',
    shiftSold: 61,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI0bXHHdJYqHhyLmbkmT1iri8aEhgGARxuFC2e9i-YlSw-HrxZkfcbTaGlpVhL6ipgUFbXE0HsbIabC99BOPX3le4E1StHVXNikjsdCt8BFdwAulmmiiZfLPxvTAB_OS8hgdn-8BEA0LFgOZzu1m2JiPmahkbj3PCMwwLEU5GzXEQJjHn7NvS0GcB1qhT_b4JMTgktVjZ9IKn8QI3A1qls2-AxAz2T7_3oBK2h0CK-MJ4Gl_XiM1yy_Q',
  },
  {
    id: 'jollof-asun',
    name: 'Smokey Jollof & Asun',
    category: 'Grills & Steaks',
    sku: 'GRL-JOL-05',
    unit: 4800,
    onHand: 26,
    reorder: 12,
    par: 40,
    status: 'in-stock',
    shiftSold: 33,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAwo0N01_45e8BBjvYHPOT3dtIoKHtTdlvj3wMPgej3E--Zcr-x79EUVGTfbiQtDvMtyrAP7Jo1PBLoAlcKD7M5GtPWXbyeNvGLTUGiorJBGhUHcAV-4x3JH2Q3dsmB2J6_kk4tqhnW91LiBp3_cV7RjQi5AJBqoFO8Dd6sPN-qDLy5NWIM-B3gOE1ruk8H1Zw25owzeHP0eUDvkoVx6a8ad5pONfbSb949fz9kWG7TSlc2JiIJbYYZw',
  },
  {
    id: 'oxtail',
    name: 'Peppered Oxtail',
    category: 'Grills & Steaks',
    sku: 'GRL-OXT-09',
    unit: 12500,
    onHand: 0,
    reorder: 8,
    par: 25,
    status: 'eighty-sixed',
    shiftSold: 15,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPV0LICrsL7sBBwisqTkdKZIt8_rrpfjwf7TSwpUgOwhy9tSI0bJZltSnwGlynbrb1JUK3kEcW-UGTQC48vnPufm6C2eCNK9r3hI27azE93bsUCO_AyBi6u7ZCH2rZtyDvQt6OGW6-7h4gWb2kIcbtDpn34cVtI3vmwzBlYZVm8LcC5gckjbrCmWCM8MY51He5fkDE8wOrAImAWetpAjrItE7nsv2EkZMd_qHKq9mqWDbh3Cs1GeO6fg',
  },
  {
    id: 'tiger-prawns',
    name: 'Grilled Tiger Prawns',
    category: 'Grills & Steaks',
    sku: 'GRL-PRW-11',
    unit: 14500,
    onHand: 0,
    reorder: 6,
    par: 20,
    status: 'eighty-sixed',
    shiftSold: 8,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5Pbacf4pZg68cdCZNzRXHjbWyxbYZKMV_-BI97VtwU4rjELDcWSC8uQxwQu7rAkEsmt-nMiOoVL3Z4ilOVT0e2wWEYy5aon0AUPP5I6IMwlBFkzksQiIMPYLrmxRIiV0KvPVdDqEUSHqbNIy4Dg86F-23ntFE0PCu7eyLduZtlcsHLFn8vNEOYPto3IaS0CUfr9pw6ptlqvlMTl8OcC9BPQpsmw3ZDeutDaY6iQz0YW-c15sE2EQf9g',
  },
];

type FilterKey = 'all' | 'low' | 'eighty-sixed' | 'food' | 'bar';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All Items (184)' },
  { key: 'low', label: `Low Stock (${STOCK_ROWS.filter((r) => r.status === 'low' || r.status === 'critical').length})` },
  { key: 'eighty-sixed', label: `86'd (${STOCK_ROWS.filter((r) => r.status === 'eighty-sixed').length})` },
  { key: 'food', label: 'Food' },
  { key: 'bar', label: 'Bar & Drinks' },
];

export function DesktopPosStockScreen({ onNav, onOpenProduct, onOpenCatalogue }: DesktopPosStockScreenProps) {
  const [alertOpen, setAlertOpen] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [eightySix, setEightySix] = useState<Record<string, boolean>>({
    oxtail: true,
    'tiger-prawns': true,
  });

  const filtered = useMemo(() => {
    return STOCK_ROWS.filter((row) => {
      const matchesQuery =
        !query ||
        row.name.toLowerCase().includes(query.toLowerCase()) ||
        row.sku.toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (filter === 'low') return row.status === 'low' || row.status === 'critical';
      if (filter === 'eighty-sixed') return row.status === 'eighty-sixed' || eightySix[row.id];
      if (filter === 'food') return row.category !== 'Cocktails & Drinks';
      if (filter === 'bar') return row.category === 'Cocktails & Drinks';
      return true;
    });
  }, [filter, query, eightySix]);

  const totalValue = useMemo(
    () => STOCK_ROWS.reduce((sum, row) => sum + row.onHand * row.unit, 0),
    [],
  );

  const stats = [
    { label: 'Total Live SKUs', value: '184', meta: 'Across 5 categories', tone: 'text-text-primary' },
    { label: 'Low / Critical', value: '6', meta: 'Reorder suggested', tone: 'text-tertiary' },
    { label: "86'd Today", value: '2', meta: 'Kitchen flagged', tone: 'text-error' },
    { label: 'Stock Value (Cost)', value: `₦${(totalValue / 1000).toFixed(1)}k`, meta: 'At cost valuation', tone: 'text-text-primary' },
    { label: 'Shift Units Sold', value: '312', meta: 'Since 08:30 AM', tone: 'text-primary' },
  ];

  return (
    <PosTerminalChrome activeNav="products" onNav={onNav}>
      {/* Sub-header toolbar */}
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="w-full py-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Icon name="inventory_2" className="text-primary text-[24px]" />
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Products &amp; Shift Stock Inventory
              </h1>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              Realtime on-hand, reorder levels and 86'd control • Synced from mesh node #WUSE2-01
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or SKU…"
                className="h-11 w-full sm:w-64 pl-10 pr-3 rounded-lg bg-surface text-text-primary placeholder:text-text-tertiary font-label-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={onOpenCatalogue}
              className="h-11 px-space-md rounded-lg bg-surface-tint-blue text-primary font-button-secondary text-button-secondary font-semibold flex items-center gap-1.5 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="menu_book" className="text-[18px]" />
              <span>Full Catalogue</span>
            </button>
            <button
              type="button"
              className="h-11 px-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icon name="add" className="text-[18px]" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="w-full py-space-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex flex-col">
              <span className="font-caption text-caption text-text-tertiary uppercase font-semibold tracking-wider">
                {stat.label}
              </span>
              <span className={`font-heading-lg text-heading-lg font-bold mt-1 ${stat.tone}`}>{stat.value}</span>
              <span className="font-caption text-caption text-text-secondary">{stat.meta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Kitchen 86'd alert banner */}
      {alertOpen ? (
        <section className="w-full pb-space-md">
          <div className="w-full rounded-xl bg-error-container p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm shadow-sm">
            <div className="flex items-start gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-error text-on-error flex items-center justify-center shrink-0">
                <Icon name="kitchen" className="text-[20px]" />
              </div>
              <div>
                <span className="font-label-md text-label-md font-bold text-on-error-container block">
                  Kitchen alert: 2 items toggled 86'd this shift
                </span>
                <span className="font-caption text-caption text-on-error-container/80">
                  Peppered Oxtail and Grilled Tiger Prawns are hidden from the register catalogue until restocked.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <button
                type="button"
                onClick={onOpenProduct}
                className="px-space-md py-2 rounded-lg bg-surface-canvas text-error font-button-secondary text-button-secondary font-semibold hover:bg-surface-container transition-colors"
              >
                Review 86'd Items
              </button>
              <button
                type="button"
                onClick={() => setAlertOpen(false)}
                aria-label="Dismiss alert"
                className="w-9 h-9 rounded-lg hover:bg-error/10 text-on-error-container flex items-center justify-center transition-colors"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Inventory table */}
      <section className="w-full pb-space-lg">
        <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden">
          <div className="p-space-md flex flex-wrap items-center gap-space-xs border-b border-surface-container">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`px-space-md py-2 rounded-full font-label-md text-label-md transition-colors ${
                  filter === item.key
                    ? 'bg-surface-tint-blue text-primary font-semibold'
                    : 'bg-surface text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
            <span className="ml-auto font-caption text-caption text-text-tertiary">
              Showing {filtered.length} of {STOCK_ROWS.length} tracked lines
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="bg-surface text-text-tertiary font-caption text-caption uppercase tracking-wider">
                  <th className="px-space-md py-3 font-semibold">Product</th>
                  <th className="px-space-md py-3 font-semibold">SKU</th>
                  <th className="px-space-md py-3 font-semibold">Unit Price</th>
                  <th className="px-space-md py-3 font-semibold">Stock on Hand</th>
                  <th className="px-space-md py-3 font-semibold">Reorder</th>
                  <th className="px-space-md py-3 font-semibold">Shift Sold</th>
                  <th className="px-space-md py-3 font-semibold">Status</th>
                  <th className="px-space-md py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const ratio = Math.min(100, Math.round((row.onHand / row.par) * 100));
                  const isEightySixed = row.status === 'eighty-sixed' || eightySix[row.id];
                  const meta = isEightySixed ? STATUS_META['eighty-sixed'] : STATUS_META[row.status];
                  const barTone = isEightySixed
                    ? 'bg-error'
                    : row.status === 'critical'
                      ? 'bg-error'
                      : row.status === 'low'
                        ? 'bg-tertiary'
                        : 'bg-badge-discount-text';
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-surface-container hover:bg-surface transition-colors"
                    >
                      <td className="px-space-md py-3">
                        <button
                          type="button"
                          onClick={onOpenProduct}
                          className="flex items-center gap-space-sm text-left"
                        >
                          <img
                            alt={row.name}
                            src={row.img}
                            className="w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md font-semibold text-text-primary">
                              {row.name}
                            </span>
                            <span className="font-caption text-caption text-text-tertiary">{row.category}</span>
                          </div>
                        </button>
                      </td>
                      <td className="px-space-md py-3 font-mono text-caption text-text-secondary">{row.sku}</td>
                      <td className="px-space-md py-3 font-label-md text-label-md font-semibold text-text-primary">
                        ₦{row.unit.toLocaleString('en-NG')}
                      </td>
                      <td className="px-space-md py-3">
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <span className="font-label-md text-label-md font-semibold text-text-primary">
                            {row.onHand} units
                          </span>
                          <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                            <div className={`h-full ${barTone}`} style={{ width: `${isEightySixed ? 100 : ratio}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-space-md py-3 font-label-md text-label-md text-text-secondary">
                        {row.reorder} units
                      </td>
                      <td className="px-space-md py-3 font-label-md text-label-md font-semibold text-text-primary">
                        {row.shiftSold}
                      </td>
                      <td className="px-space-md py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold ${meta.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-space-md py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setEightySix((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                            }
                            title={isEightySixed ? "Restore item to menu" : "Toggle 86'd"}
                            className={`px-2.5 py-1.5 rounded-lg font-caption text-caption font-semibold transition-colors ${
                              isEightySixed
                                ? 'bg-surface-tint-blue text-primary hover:bg-surface-container-high'
                                : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'
                            }`}
                          >
                            {isEightySixed ? 'Restore' : "86"}
                          </button>
                          <button
                            type="button"
                            onClick={onOpenProduct}
                            title="Adjust stock"
                            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary flex items-center justify-center transition-colors"
                          >
                            <Icon name="tune" className="text-[18px]" />
                          </button>
                          <button
                            type="button"
                            title="Restock order"
                            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary flex items-center justify-center transition-colors"
                          >
                            <Icon name="add_box" className="text-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-space-md py-space-sm bg-surface flex flex-wrap items-center justify-between gap-space-sm">
            <span className="font-caption text-caption text-text-secondary">
              Last full recount: Today 07:55 WAT • Variance −2 units (within tolerance)
            </span>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                className="px-space-sm py-1.5 rounded-lg bg-surface-canvas shadow-sm font-caption text-caption font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <Icon name="download" className="text-[16px]" />
                Export CSV
              </button>
              <button
                type="button"
                className="px-space-sm py-1.5 rounded-lg bg-surface-canvas shadow-sm font-caption text-caption font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <Icon name="print" className="text-[16px]" />
                Print Count Sheet
              </button>
            </div>
          </div>
        </div>
      </section>
    </PosTerminalChrome>
  );
}
