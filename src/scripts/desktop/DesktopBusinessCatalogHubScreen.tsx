import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessCatalogHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onOpenBranchPricing?: () => void;
  onOpenServices?: () => void;
}

type CatalogChip = 'all' | 'published' | 'deals' | 'low' | 'dinein' | 'takeaway' | 'oos';

interface CatalogRow {
  id: string;
  name: string;
  image: string;
  alt: string;
  kitchenLabel?: boolean;
  verified?: boolean;
  draft?: boolean;
  hidden?: boolean;
  dimmed?: boolean;
  sku: string;
  sub: string;
  category: string;
  categoryIcon: string;
  price: string;
  was?: string;
  dealBadge?: string;
  priceNote?: string;
  priceChip?: string;
  priceSubNote?: string;
  branchDot: 'ok' | 'secondary' | 'tertiary';
  branchLabel: string;
  branchNote: string;
  stock: {
    tone: 'ok' | 'error' | 'off';
    label: string;
    units?: string;
    unitsTone?: 'default' | 'error';
    bar?: number;
    barTone?: 'ok' | 'error';
    note?: string;
  };
  sync: boolean;
  filters: CatalogChip[];
}

const ROWS: CatalogRow[] = [
  {
    id: 'p1',
    name: 'Woodfire Aged Ribeye Steak',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO6jJ9p4hR6rNGDGRINEHScNzfF8QX9958juImpMv7docBzJhIFFTSv0EqqohPlk21qedzh0yj6VoV4ENinMd8PtWdjbgLvTNyW6DzMNzVWBBdNwnHXR5xFauu5gHS1bVOzDmta7grAM4POxOXeEhzPSB90eU3jwqP8X35nF3AyPhKakI43tDrWub1fzx-gNhATtVwdkcjO3Hjz7arXt2eY8pvnSwKjc_HdpZEuUQH_y3nRojTdPeUQg',
    alt: 'Gourmet prime aged ribeye steak seared over woodfire grill with rosemary sprig and melted garlic butter glistening on top, soft dramatic culinary lighting, restaurant setting.',
    kitchenLabel: true,
    verified: true,
    sku: 'VG-STEAK-01',
    sub: 'Dine-In & Takeaway',
    category: 'Steaks & Grills',
    categoryIcon: 'outdoor_grill',
    price: '₦9,600',
    was: '₦12,000',
    dealBadge: '20% OFF Deal Active',
    branchDot: 'ok',
    branchLabel: 'All 3 Branches',
    branchNote: 'MSRP override active on VI Branch',
    stock: { tone: 'ok', label: 'In Stock', units: '42 units ready', bar: 78, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'deals', 'dinein', 'takeaway'],
  },
  {
    id: 'p2',
    name: 'Truffle Parmesan Fries',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6BaZG7YzMbQArQWnt4edHnV9aCqK3a7xIIh-c8OV4tFJBToZ7tcF2Nlpag653DPDvv1YwAEFvyZWLEWjhh3JKXPU_39La5FCCObsJ2bXVvYHYwRfdfbXPyrgvSgRX4XxMhc27qVEA_iTG43lTtzd34YcQozjDBHcuV7C7GWsm1WeMhPRtYcC2-I3NREV_8QfVRodpcjS7DvAGEn1vrjQohXldZ8Ghr28n4UXThhCL24s-z5spmv5Wbg',
    alt: 'Crispy golden hand-cut french fries tossed in grated parmesan cheese and fresh chopped parsley with black truffle oil glaze, served in a ceramic bowl on a dark rustic table.',
    sku: 'VG-SIDE-04',
    sub: 'Side Dish',
    category: 'Starters & Sides',
    categoryIcon: 'tapas',
    price: '₦4,500',
    priceNote: 'Standard Branch Base',
    branchDot: 'secondary',
    branchLabel: 'Wuse & Maitama Only',
    branchNote: '2 branches enabled',
    stock: { tone: 'ok', label: 'In Stock', units: '18 units', bar: 45, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'dinein', 'takeaway'],
  },
  {
    id: 'p3',
    name: 'Vintage Reserve Cabernet 2018',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6trtXFp0MMJwWku9jLYDwdIp28fGzHTmDO0RUE47jOl9iydBvF7jC1uRok91vQ_a6YHaxw4BDUNnwjZjepIJqde7592zFopV-N30aLGLAkzyvljtnJ1fLl5Pxy_BHumGgYbahvqugs4Q1hW9TTACnFpjlk5pxuNHrRFbxC07olPXnXlN-PrXlK9_FwVnZsQcJzb-TwkpEm5q383Eftusf4vv5jvGGhsBKrpbEAYulvhhXJvoaQRairA',
    alt: 'Elegant wine bottle of Vintage Reserve Cabernet Sauvignon with deep crimson seal resting beside a crystal wine glass against warm cellar barrel background.',
    sku: 'VG-WINE-12',
    sub: 'Cellar 750ml',
    category: 'Cellar & Spirits',
    categoryIcon: 'wine_bar',
    price: '₦42,000',
    priceNote: 'Maitama: ₦42k • VI: ₦45k',
    branchDot: 'ok',
    branchLabel: 'All Branches',
    branchNote: 'Divergent Regional Taxes',
    stock: {
      tone: 'error',
      label: 'Limited Stock',
      units: 'Only 3 left',
      unitsTone: 'error',
      bar: 12,
      barTone: 'error',
    },
    sync: true,
    filters: ['all', 'published', 'low'],
  },
  {
    id: 'p4',
    name: 'Artisan Sourdough Loaf',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcpJ2c7dvjW1lzsXtOkizM9pbVdGGWEiMmh1UyBM6Qyd_a7HJHN9pYrI0s4OC7t1D52fmKiwCl0_EW9Qugz_jyIIIXo0L3JfccsRlSlOmwgv2C6MkI2vnSFj1ji-q5FQ6Yqs8YUeIiIe1jQ5hpZL4naxtfledRh2j3Nq1C5E6wUF9iHI6e5wVcRvSUF_gX7hELTdOD8VEpNtx8S93rNUj1Z-0YH06xP2fKgi9-dccpqRQVrf3449_Eig',
    alt: 'Freshly baked artisan sourdough boule bread with a flour-dusted scored crust resting on a rustic wooden baker cutting board in natural morning bakery daylight.',
    draft: true,
    hidden: true,
    dimmed: true,
    sku: 'VG-BAKE-02',
    sub: 'Bakery Daily',
    category: 'Bakery',
    categoryIcon: 'bakery_dining',
    price: '₦3,500',
    priceNote: 'Standard Retail',
    branchDot: 'tertiary',
    branchLabel: 'Configured for 3 locations',
    branchNote: 'Draft deployment ready',
    stock: { tone: 'off', label: 'Unpublished / Draft', note: '0 active in POS batch' },
    sync: false,
    filters: ['all'],
  },
  {
    id: 'p5',
    name: 'Smokey Jollof Feast',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB91KTEStK91Ccurq-fAdEtC-3I8n4gXuMqpfwcMA_5A7h_nKUAouQfyxb6sIaLr4yh8qEJvf7XPR274pCgT_FOtGzBywL25v3g-trAUxSQ8fpYFeSAccqtSye0ekYzX75UlkTZxst5wHeAEpD6b88FITPNV7DVmR9ma0F2JfEciwHgIHFVb_B9cBDLYj3QeMAm3o-PANcSttHXXePp0sCRO1Pr9wbY1irA6QCDsOCquwmIvjT_twL9bA',
    alt: 'West African Nigerian party jollof rice with fried plantains, grilled spicy suya chicken and fresh garnishes served hot on a modern minimalist platter.',
    sku: 'VG-MAIN-03',
    sub: 'Signature Platter',
    category: 'Rice & Mains',
    categoryIcon: 'dinner_dining',
    price: '₦4,800',
    priceChip: '20% Deal',
    priceSubNote: 'Combo promotion active',
    branchDot: 'ok',
    branchLabel: 'All Branches',
    branchNote: 'Par-level synchronized',
    stock: { tone: 'ok', label: 'In Stock', units: '55 units', bar: 85, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'deals', 'dinein', 'takeaway'],
  },
  {
    id: 'p6',
    name: 'Fresh Citrus Lemonade 500ml',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUiDSDB0U6DIQbKdR4nbdyze90ujBGPVjtXkRtfBd9bTD7ayw-e4Wh9tE2aWP-0W8il7E99i_AKKTGdKB-0Q4XvB30T4SIcXpyTQZbRN3lmxV_wCe5Ct5DpdcWiuqnb62zLnnquPrL5vEdOp8fVeexyC3n0F9sRFumghhv5u0-lrnkMEGWBz53nIXftbRqB1GjowVQGK5G4aFlqJxzgT8LjeWnQiKHKU4EsVVVcHsOJyUaBb9sD73WxQ',
    alt: 'Cold pressed artisan citrus lemonade in a clear reusable glass bottle with condensation drops, lemon slices and fresh mint leaves on a clean marble surface.',
    sku: 'VG-BEV-01',
    sub: 'Cold Bottled',
    category: 'Beverages',
    categoryIcon: 'local_cafe',
    price: '₦2,000',
    priceNote: 'High Volume Item',
    branchDot: 'ok',
    branchLabel: 'All Branches',
    branchNote: 'Standardized Prep',
    stock: { tone: 'ok', label: 'In Stock', units: '80 units', bar: 95, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'dinein', 'takeaway'],
  },
];

const STATS = [
  {
    label: 'Total Active SKUs',
    value: '42',
    valueClass: 'text-on-surface',
    note: '+3 this month',
    noteClass: 'text-badge-discount-text',
    noteIcon: 'trending_up',
    iconBox: 'bg-surface-tint-blue text-primary',
    icon: 'inventory_2',
  },
  {
    label: 'Deal-Linked Items',
    value: '4',
    valueClass: 'text-on-surface',
    note: 'Driving +18% GMV',
    noteClass: 'text-text-secondary',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
    icon: 'local_offer',
  },
  {
    label: 'Low Stock Alerts',
    value: '3',
    valueClass: 'text-error',
    note: 'Requires Restock',
    noteClass: 'text-error',
    iconBox: 'bg-error-container text-on-error-container',
    icon: 'warning',
  },
  {
    label: 'Mesh Sync Fidelity',
    value: '99.98%',
    valueClass: 'text-primary',
    note: 'Instant POS push',
    noteClass: 'text-text-secondary',
    iconBox: 'bg-surface-container-high text-primary',
    icon: 'sync_alt',
  },
];

const CHIPS: Array<{ key: CatalogChip; label: string; icon?: string; tone?: 'green' | 'error' }> = [
  { key: 'all', label: 'All (28)' },
  { key: 'published', label: 'Active & Published (24)' },
  { key: 'deals', label: 'Deal Linked (4)', icon: 'percent', tone: 'green' },
  { key: 'low', label: 'Low Stock (3)', icon: 'priority_high', tone: 'error' },
  { key: 'dinein', label: 'Dine-In' },
  { key: 'takeaway', label: 'Takeaway' },
  { key: 'oos', label: 'Out of Stock' },
];

const BRANCH_DOT: Record<CatalogRow['branchDot'], string> = {
  ok: 'bg-badge-discount-text',
  secondary: 'bg-secondary',
  tertiary: 'bg-text-tertiary',
};

export function DesktopBusinessCatalogHubScreen({
  onNav,
  onOpenBranchPricing,
  onOpenServices,
}: DesktopBusinessCatalogHubScreenProps) {
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<CatalogChip>('all');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selected, setSelected] = useState<string[]>([]);
  const [sync, setSync] = useState<Record<string, boolean>>(
    Object.fromEntries(ROWS.map((row) => [row.id, row.sync])),
  );

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));

  const toggleAll = () => setSelected(selected.length === ROWS.length ? [] : ROWS.map((row) => row.id));

  const visibleRows = ROWS.filter((row) => {
    const matchesChip = chip === 'all' ? true : row.filters.includes(chip);
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      row.name.toLowerCase().includes(needle) ||
      row.sku.toLowerCase().includes(needle) ||
      row.category.toLowerCase().includes(needle);
    return matchesChip && matchesQuery;
  });

  return (
    <MerchantShell activeNav="catalog" onNav={onNav}>
      <div className="flex flex-col gap-space-lg">
        {/* Breadcrumbs & Meta Top Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
            <button
              type="button"
              onClick={() => onNav('overview')}
              className="hover:text-primary transition-colors flex items-center gap-space-2xs"
            >
              <Icon name="storefront" className="text-[16px]" />
              <span>Business Hub</span>
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="hover:text-primary transition-colors">Catalog</span>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-on-surface font-label-sm text-label-sm font-semibold">Products & Services</span>
          </div>
          <div className="flex items-center gap-space-sm self-start sm:self-auto">
            <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span>Live in POS Mesh • 28ms latency</span>
            </div>
            <div className="hidden md:flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg bg-surface-tint-blue text-primary font-caption text-caption">
              <Icon name="cloud_sync" className="text-[16px]" />
              <span>3 Branches Synced</span>
            </div>
          </div>
        </div>

        {/* Page Header & Multi-action Deck */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-space-xs px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-label-sm text-label-sm mb-space-xs">
              <Icon name="hub" className="text-[16px]" />
              <span>Enterprise SKU Multi-Tenancy</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Central Products & Services Catalogue
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              Centralized multi-location catalog. Manage dishes, retail merchandise, and services across Abuja and Lagos
              branches.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative">
              <label className="sr-only" htmlFor="locationSelector">
                Scope Branch
              </label>
              <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-xl shadow-sm text-on-surface cursor-pointer hover:bg-surface-subtle transition-colors">
                <Icon name="domain" className="text-primary text-[20px]" />
                <div className="text-left">
                  <span className="block font-caption text-caption text-text-secondary leading-none">Branch Scope</span>
                  <select
                    className="bg-transparent font-label-md text-label-md font-semibold text-on-surface outline-none cursor-pointer pr-space-xs"
                    defaultValue="all"
                    id="locationSelector"
                  >
                    <option value="all">All Locations (Abuja & Lagos)</option>
                    <option value="wuse">Wuse II Branch (Abuja)</option>
                    <option value="maitama">Maitama Flagship (Abuja)</option>
                    <option value="vi">Victoria Island (Lagos)</option>
                  </select>
                </div>
                <Icon name="expand_more" className="text-text-secondary text-[18px]" />
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-button-secondary text-button-secondary shadow-sm"
            >
              <Icon name="room_service" className="text-primary text-[20px]" />
              <span>+ Add Service</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-space-2xs px-space-lg py-space-sm rounded-xl bg-primary-container text-on-primary-container hover:bg-primary transition-all font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98]"
            >
              <Icon name="add_circle" className="text-[20px]" />
              <span>+ Add Product</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bento Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="font-caption text-caption text-text-secondary block">{stat.label}</span>
                <span className={`font-heading-md text-heading-md font-bold ${stat.valueClass}`}>{stat.value}</span>
                <span className={`font-caption text-caption ${stat.noteClass} flex items-center gap-space-2xs mt-space-2xs`}>
                  {stat.noteIcon && <Icon name={stat.noteIcon} className="text-[14px]" />}
                  {stat.note}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.iconBox}`}>
                <Icon name={stat.icon} className="text-[24px]" />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs & View Options */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-xs rounded-xl shadow-sm">
          <div className="flex items-center gap-space-2xs overflow-x-auto">
            <button
              type="button"
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold transition-all shadow-sm whitespace-nowrap"
            >
              <Icon name="restaurant_menu" className="text-[18px]" />
              <span>Products</span>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-canvas/20 text-on-primary font-caption text-caption font-bold">
                28 active
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenServices}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all whitespace-nowrap"
            >
              <Icon name="spa" className="text-[18px]" />
              <span>Services</span>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-text-secondary font-caption text-caption font-bold">
                14
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenServices}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all whitespace-nowrap"
            >
              <Icon name="category" className="text-[18px]" />
              <span>Categories</span>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-text-secondary font-caption text-caption font-bold">
                6
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenBranchPricing}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-all whitespace-nowrap"
            >
              <Icon name="price_change" className="text-[18px]" />
              <span>Pricing Matrix</span>
            </button>
          </div>
          <div className="flex items-center gap-space-xs px-space-xs">
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
              <button
                type="button"
                title="List View"
                onClick={() => setView('list')}
                className={`p-space-2xs rounded-md transition-colors ${
                  view === 'list' ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-on-surface'
                }`}
              >
                <Icon name="view_list" className="text-[20px]" />
              </button>
              <button
                type="button"
                title="Grid View"
                onClick={() => setView('grid')}
                className={`p-space-2xs rounded-md transition-colors ${
                  view === 'grid' ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-on-surface'
                }`}
              >
                <Icon name="grid_view" className="text-[20px]" />
              </button>
            </div>
            <button
              type="button"
              className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg text-text-secondary hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm transition-colors"
            >
              <Icon name="file_download" className="text-[18px]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Console */}
        <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
          <div className="relative w-full">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search items, SKU, category or tags... (⌘K)"
              className="w-full h-[48px] bg-surface-container-low rounded-xl pl-12 pr-28 text-on-surface font-body-md text-body-md placeholder-text-tertiary outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-space-2xs">
              <kbd className="px-space-xs py-space-2xs rounded bg-surface-container text-text-secondary font-caption text-caption shadow-xs">
                ⌘K
              </kbd>
              <button
                type="button"
                title="Voice Search"
                className="p-space-2xs text-text-secondary hover:text-primary transition-colors"
              >
                <Icon name="mic" className="text-[18px]" />
              </button>
            </div>
          </div>

          {/* Quick Chips Bar */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-space-2xs pt-space-2xs">
            {CHIPS.map((entry) => {
              const active = chip === entry.key;
              let classes =
                'px-space-md py-space-2xs rounded-full bg-surface-subtle text-text-secondary hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors';
              if (active)
                classes =
                  'px-space-md py-space-2xs rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold whitespace-nowrap shadow-xs';
              else if (entry.tone === 'green')
                classes =
                  'flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold whitespace-nowrap transition-colors';
              else if (entry.tone === 'error')
                classes =
                  'flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold whitespace-nowrap transition-colors';
              return (
                <button key={entry.key} type="button" onClick={() => setChip(entry.key)} className={classes}>
                  {entry.icon && <Icon name={entry.icon} className="text-[16px]" />}
                  <span>{entry.label}</span>
                </button>
              );
            })}
            <div className="ml-auto pl-space-sm flex items-center gap-space-2xs">
              <button
                type="button"
                className="flex items-center gap-space-2xs text-text-secondary hover:text-primary font-caption text-caption font-semibold"
              >
                <Icon name="tune" className="text-[16px]" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-text-secondary font-label-sm text-label-sm">
                  <th className="py-space-sm px-space-md w-12 text-center" scope="col">
                    <input
                      aria-label="Select all products"
                      checked={selected.length === ROWS.length}
                      className="rounded text-primary cursor-pointer"
                      onChange={toggleAll}
                      type="checkbox"
                    />
                  </th>
                  <th className="py-space-sm px-space-md font-semibold text-on-surface-variant min-w-[280px]" scope="col">
                    Product & SKU
                  </th>
                  <th className="py-space-sm px-space-md font-semibold text-on-surface-variant" scope="col">
                    Category
                  </th>
                  <th className="py-space-sm px-space-md font-semibold text-on-surface-variant" scope="col">
                    Base Price & Deals
                  </th>
                  <th className="py-space-sm px-space-md font-semibold text-on-surface-variant" scope="col">
                    Branch Scope
                  </th>
                  <th className="py-space-sm px-space-md font-semibold text-on-surface-variant" scope="col">
                    Inventory Status
                  </th>
                  <th className="py-space-sm px-space-md font-semibold text-on-surface-variant text-center" scope="col">
                    Terminal Sync
                  </th>
                  <th className="py-space-sm px-space-md font-semibold text-on-surface-variant text-right" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-on-surface font-body-md text-body-md">
                {visibleRows.map((row) => {
                  const syncOn = sync[row.id];
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-surface-subtle transition-colors group ${row.dimmed ? 'opacity-80' : ''}`}
                    >
                      <td className="py-space-md px-space-md text-center">
                        <input
                          aria-label={`Select ${row.name}`}
                          checked={selected.includes(row.id)}
                          className="rounded text-primary cursor-pointer"
                          onChange={() => toggleRow(row.id)}
                          type="checkbox"
                        />
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex items-center gap-space-md">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                            <img
                              alt={row.alt}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              src={row.image}
                            />
                            {row.kitchenLabel && (
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-0.5 text-center">
                                <span className="font-caption text-[9px] text-white font-bold uppercase tracking-wider">
                                  Kitchen
                                </span>
                              </div>
                            )}
                            {row.hidden && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Icon name="visibility_off" className="text-white text-[18px]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-space-2xs">
                              <a
                                className="font-label-md text-label-md font-bold text-on-surface hover:text-primary transition-colors truncate"
                                href="#"
                              >
                                {row.name}
                              </a>
                              {row.verified && (
                                <span title="Best Seller">
                                  <Icon name="verified" className="text-badge-discount-text text-[16px]" />
                                </span>
                              )}
                              {row.draft && (
                                <span className="px-space-2xs py-0.5 rounded bg-surface-container text-text-secondary font-caption text-[11px] font-semibold uppercase">
                                  Draft
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-space-xs mt-space-2xs font-caption text-caption text-text-secondary">
                              <span className="font-mono bg-surface-container px-space-2xs rounded">{row.sku}</span>
                              <span>•</span>
                              <span>{row.sub}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          <Icon name={row.categoryIcon} className="text-[14px]" />
                          <span>{row.category}</span>
                        </span>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div>
                          <div className="flex items-center gap-space-xs">
                            <span
                              className={`font-label-md text-label-md font-bold ${
                                row.dealBadge ? 'text-primary' : 'text-on-surface'
                              }`}
                            >
                              {row.price}
                            </span>
                            {row.was && (
                              <span className="font-caption text-caption text-text-tertiary line-through">{row.was}</span>
                            )}
                            {row.priceChip && (
                              <span className="px-space-2xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                                {row.priceChip}
                              </span>
                            )}
                          </div>
                          {row.dealBadge && (
                            <div className="inline-flex items-center gap-space-2xs mt-space-2xs px-space-xs py-space-2xs rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                              <Icon name="loyalty" className="text-[12px]" />
                              <span>{row.dealBadge}</span>
                            </div>
                          )}
                          {row.priceNote && (
                            <span className="font-caption text-caption text-text-secondary block mt-space-2xs">
                              {row.priceNote}
                            </span>
                          )}
                          {row.priceSubNote && (
                            <span className="font-caption text-caption text-text-secondary block mt-space-2xs">
                              {row.priceSubNote}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div>
                          <div
                            className={`flex items-center gap-space-2xs font-label-sm text-label-sm font-semibold ${
                              row.branchDot === 'tertiary' ? 'text-text-secondary' : 'text-on-surface'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${BRANCH_DOT[row.branchDot]}`} />
                            <span>{row.branchLabel}</span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary block mt-space-2xs">
                            {row.branchNote}
                          </span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div>
                          <div className="flex items-center gap-space-xs">
                            <span
                              className={`inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full font-caption text-caption font-semibold ${
                                row.stock.tone === 'ok'
                                  ? 'bg-badge-discount-bg text-badge-discount-text'
                                  : row.stock.tone === 'error'
                                    ? 'bg-error-container text-on-error-container'
                                    : 'bg-surface-container text-text-secondary'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  row.stock.tone === 'ok'
                                    ? 'bg-badge-discount-text'
                                    : row.stock.tone === 'error'
                                      ? 'bg-error'
                                      : 'bg-text-tertiary'
                                }`}
                              />
                              {row.stock.label}
                            </span>
                            {row.stock.units && (
                              <span
                                className={`font-label-sm text-label-sm font-bold ${
                                  row.stock.unitsTone === 'error' ? 'text-error' : 'text-on-surface'
                                }`}
                              >
                                {row.stock.units}
                              </span>
                            )}
                          </div>
                          {row.stock.bar !== undefined && (
                            <div className="w-28 bg-surface-container rounded-full h-1.5 mt-space-xs overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${row.stock.barTone === 'error' ? 'bg-error' : 'bg-badge-discount-text'}`}
                                style={{ width: `${row.stock.bar}%` }}
                              />
                            </div>
                          )}
                          {row.stock.note && (
                            <span className="font-caption text-caption text-text-secondary block mt-space-2xs">
                              {row.stock.note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-space-md px-space-md text-center">
                        <button
                          aria-checked={syncOn}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer p-0.5 transition-colors focus:outline-none rounded-full ${
                            syncOn ? 'bg-primary-container' : 'bg-surface-container-highest'
                          }`}
                          onClick={() => setSync((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
                          role="switch"
                          type="button"
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-canvas shadow ring-0 transition duration-200 ${
                              syncOn ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-space-md px-space-md text-right">
                        <div className="flex items-center justify-end gap-space-2xs">
                          <button
                            type="button"
                            title="Edit Item"
                            className="p-space-2xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                          >
                            <Icon name="edit" className="text-[20px]" />
                          </button>
                          <button
                            type="button"
                            title="Branch Pricing Matrix"
                            onClick={onOpenBranchPricing}
                            className="p-space-2xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                          >
                            <Icon name="tune" className="text-[20px]" />
                          </button>
                          <button
                            type="button"
                            title="More Options"
                            className="p-space-2xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-on-surface transition-colors"
                          >
                            <Icon name="more_vert" className="text-[20px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination and Batch Controls Footer Strip */}
          <div className="p-space-md bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md text-text-secondary font-caption text-caption">
              <span>
                Showing <strong className="text-on-surface">1–{visibleRows.length}</strong> of{' '}
                <strong className="text-on-surface">28</strong> products
              </span>
              <div className="h-4 w-px bg-outline-variant" />
              <div className="flex items-center gap-space-xs">
                <span>Rows per page:</span>
                <select className="bg-surface-container-lowest px-space-xs py-1 rounded text-on-surface font-semibold outline-none cursor-pointer">
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                disabled
                className="p-space-2xs rounded-lg bg-surface-container-lowest text-text-secondary hover:text-on-surface disabled:opacity-40 transition-colors shadow-sm"
              >
                <Icon name="chevron_left" className="text-[20px]" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow-sm"
              >
                1
              </button>
              {['2', '3', '4'].map((page) => (
                <button
                  key={page}
                  type="button"
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest text-text-secondary hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors shadow-sm"
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="p-space-2xs rounded-lg bg-surface-container-lowest text-text-secondary hover:text-on-surface transition-colors shadow-sm"
              >
                <Icon name="chevron_right" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Intelligent Rules & Automation Callout Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex items-start gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name="auto_fix_high" className="text-[22px]" />
            </div>
            <div>
              <h2 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                Multi-Location Pricing Rules
              </h2>
              <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                Victoria Island (Lagos) branch has a default 7.5% regional logistics markup applied on all imported
                meats and cellar items.
              </p>
              <button
                type="button"
                onClick={onOpenBranchPricing}
                className="inline-flex items-center gap-space-2xs text-primary font-label-sm text-label-sm font-semibold mt-space-xs hover:underline"
              >
                <span>Configure regional price matrices</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex items-start gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
              <Icon name="inventory" className="text-[22px]" />
            </div>
            <div>
              <h2 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                Low-Stock Automated Reorders
              </h2>
              <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                Items dropping below 5 units generate instant procurement tickets dispatched to centralized warehouse
                suppliers.
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-space-2xs text-primary font-label-sm text-label-sm font-semibold mt-space-xs hover:underline"
              >
                <span>Edit automated replenishment triggers</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MerchantShell>
  );
}
