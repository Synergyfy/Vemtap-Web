import { useMemo, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { adminService, type AdminPlatformCategory } from '../../services/adminService';
import { formatCount, NONE } from './adminLive';
import { adminErrorMessage, useAdminAction, useAdminBusinessSummary, useAdminCategories } from './useAdminData';

interface Subcategory {
  id: string;
  label: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  icon: string;
  subcategories: Subcategory[];
  extraCount: number;
  merchantsCount: number;
  pctNetwork: number;
  discoveryBadge: string;
  discoveryStyle: string;
  fee: string;
  iconBg: string;
  /** Live: the category description and full subcategory records. */
  description?: string;
  liveSubcategories?: Array<{ id: string; name: string; description?: string | null }>;
}

const SUBCATEGORY_PREVIEW = 4;

function toCategory(category: AdminPlatformCategory): Category {
  const subs = category.subcategories ?? [];
  return {
    id: category.id,
    name: category.name,
    code: category.id.slice(0, 8).toUpperCase(),
    icon: 'category',
    iconBg: 'bg-[#d9e2ff] text-[#0055c4]',
    subcategories: subs.slice(0, SUBCATEGORY_PREVIEW).map((sub) => ({ id: sub.id, label: sub.name })),
    extraCount: Math.max(0, subs.length - SUBCATEGORY_PREVIEW),
    merchantsCount: 0,
    pctNetwork: 0,
    discoveryBadge: '',
    discoveryStyle: '',
    fee: '',
    description: category.description ?? '',
    liveSubcategories: subs,
  };
}

/** What the inspector is editing in live mode. */
type Editing =
  | { kind: 'category' }
  | { kind: 'subcategory'; id: string }
  | { kind: 'new-category' }
  | { kind: 'new-subcategory' };

const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food, Dining & Groceries',
    code: 'CAT-FDG-001',
    icon: 'restaurant',
    iconBg: 'bg-orange-100 text-orange-700',
    subcategories: [
      { id: 'qsr', label: 'Fast Casual & QSR' },
      { id: 'grocery', label: 'Supermarkets' },
      { id: 'bakery', label: 'Bakery & Pastries' },
    ],
    extraCount: 11,
    merchantsCount: 1182,
    pctNetwork: 34,
    discoveryBadge: 'FEATURED FEED',
    discoveryStyle: 'bg-[#d9e2ff] text-[#001a41]',
    fee: 'Tier: 3.5% + ₦100',
  },
  {
    id: 'electronics',
    name: 'Consumer Electronics & Tech',
    code: 'CAT-ELC-002',
    icon: 'devices',
    iconBg: 'bg-blue-100 text-blue-700',
    subcategories: [
      { id: 'phones', label: 'Phones & Accessories' },
      { id: 'computing', label: 'Computing' },
      { id: 'audio', label: 'Audio & Visual' },
      { id: 'pos', label: 'POS Hardware' },
    ],
    extraCount: 5,
    merchantsCount: 842,
    pctNetwork: 26,
    discoveryBadge: 'ACTIVE IN DISCOVERY',
    discoveryStyle: 'bg-[#d9e2ff] text-[#001a41]',
    fee: 'Tier: 2.0% Fixed',
  },
  {
    id: 'health',
    name: 'Health, Beauty & Wellness',
    code: 'CAT-HBW-003',
    icon: 'spa',
    iconBg: 'bg-pink-100 text-pink-700',
    subcategories: [
      { id: 'pharma', label: 'Pharmacies' },
      { id: 'cosmetics', label: 'Cosmetics & Skin' },
      { id: 'salons', label: 'Salons & Spa' },
    ],
    extraCount: 9,
    merchantsCount: 512,
    pctNetwork: 15,
    discoveryBadge: 'ACTIVE IN DISCOVERY',
    discoveryStyle: 'bg-[#d9e2ff] text-[#001a41]',
    fee: 'Tier: 3.0% Standard',
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    code: 'CAT-FSH-004',
    icon: 'apparel',
    iconBg: 'bg-purple-100 text-purple-700',
    subcategories: [
      { id: 'mens', label: "Men's Wear" },
      { id: 'womens', label: "Women's Fashion" },
      { id: 'footwear', label: 'Footwear & Bags' },
    ],
    extraCount: 8,
    merchantsCount: 478,
    pctNetwork: 13,
    discoveryBadge: 'ACTIVE IN DISCOVERY',
    discoveryStyle: 'bg-[#d9e2ff] text-[#001a41]',
    fee: 'Tier: 4.0% Standard',
  },
  {
    id: 'home',
    name: 'Home, Living & Interior',
    code: 'CAT-HLI-005',
    icon: 'chair',
    iconBg: 'bg-emerald-100 text-emerald-700',
    subcategories: [
      { id: 'furniture', label: 'Furniture' },
      { id: 'decor', label: 'Home Decor' },
      { id: 'kitchen', label: 'Kitchenware' },
    ],
    extraCount: 5,
    merchantsCount: 322,
    pctNetwork: 9,
    discoveryBadge: 'ACTIVE IN DISCOVERY',
    discoveryStyle: 'bg-[#d9e2ff] text-[#001a41]',
    fee: 'Tier: 3.5% Standard',
  },
];

interface AdminCategoriesScreenProps {
  onNavigate?: (path: string) => void;
}

export function AdminCategoriesScreen({ onNavigate: _onNavigate }: AdminCategoriesScreenProps) {
  const live = hasApiConfig();
  const [mockSelected, setMockSelected] = useState<Category>(CATEGORIES[0]);
  const [filterQuery, setFilterQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Live API: platform business categories with their subcategories.
  const categoriesQuery = useAdminCategories();
  const activeBusinesses = useAdminBusinessSummary().data?.totalActiveBusiness;
  const liveCategories = useMemo(() => (categoriesQuery.data?.items ?? []).map(toCategory), [categoriesQuery.data]);
  const allCategories = live ? liveCategories : CATEGORIES;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const liveSelected = liveCategories.find((c) => c.id === selectedId) ?? liveCategories[0] ?? null;
  const selectedCategory: Category | null = live ? liveSelected : mockSelected;
  const setSelectedCategory = (cat: Category) => {
    if (!live) return setMockSelected(cat);
    setSelectedId(cat.id);
    startEditing({ kind: 'category' }, cat);
  };
  const subcategoryTotal = liveCategories.reduce((sum, c) => sum + (c.liveSubcategories?.length ?? 0), 0);

  const [editing, setEditing] = useState<Editing>({ kind: 'category' });
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draftFor, setDraftFor] = useState<string | null>(null);

  const startEditing = (next: Editing, cat: Category | null = selectedCategory) => {
    setEditing(next);
    setConfirmDelete(false);
    setActionError(null);
    const sub = next.kind === 'subcategory' ? cat?.liveSubcategories?.find((x) => x.id === next.id) : undefined;
    setDraftName(next.kind === 'category' ? cat?.name ?? '' : sub?.name ?? '');
    setDraftDescription(next.kind === 'category' ? cat?.description ?? '' : sub?.description ?? '');
    setDraftFor(cat?.id ?? null);
  };
  // Load the first category into the editor once the list arrives.
  if (live && liveSelected && draftFor === null && editing.kind === 'category') {
    startEditing({ kind: 'category' }, liveSelected);
  }

  const notify = (message: string) => {
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 3500);
  };
  const saveCategory = useAdminAction(async () => {
    const name = draftName.trim();
    const description = draftDescription.trim();
    if (editing.kind === 'new-category') return adminService.createCategory({ name, description });
    if (editing.kind === 'new-subcategory' && selectedCategory)
      return adminService.createSubcategory({ name, description: description || undefined, categoryId: selectedCategory.id });
    if (editing.kind === 'subcategory') return adminService.updateSubcategory(editing.id, { name, description });
    if (selectedCategory) return adminService.updateCategory(selectedCategory.id, { name, description });
    return undefined;
  });
  const deleteEntry = useAdminAction(async () => {
    if (editing.kind === 'subcategory') return adminService.deleteSubcategory(editing.id);
    if (editing.kind === 'category' && selectedCategory) return adminService.deleteCategory(selectedCategory.id);
    return undefined;
  });

  // Toggles state
  const [nafdac, setNafdac] = useState(true);
  const [fulfillment, setFulfillment] = useState(true);
  const [kitchenLead, setKitchenLead] = useState(true);
  const [dietary, setDietary] = useState(false);

  const handleSave = () => {
    if (live) {
      if (!draftName.trim()) return setActionError('Enter a name.');
      if ((editing.kind === 'new-category' || editing.kind === 'category') && !draftDescription.trim()) {
        return setActionError('Categories need a description.');
      }
      setActionError(null);
      saveCategory.mutate(undefined, {
        onSuccess: (saved) => {
          notify(`"${draftName.trim()}" saved.`);
          if (editing.kind === 'new-category' && saved && typeof saved === 'object' && 'id' in saved) {
            setSelectedId(String((saved as { id: string }).id));
            setEditing({ kind: 'category' });
          } else if (editing.kind === 'new-subcategory' && saved && typeof saved === 'object' && 'id' in saved) {
            setEditing({ kind: 'subcategory', id: String((saved as { id: string }).id) });
          }
        },
        onError: (error) => setActionError(adminErrorMessage(error)),
      });
      return;
    }
    if (!selectedCategory) return;
    setActionNotice(`"${selectedCategory.name}" category attributes saved successfully.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDelete = () => {
    if (!confirmDelete) return setConfirmDelete(true);
    setConfirmDelete(false);
    deleteEntry.mutate(undefined, {
      onSuccess: () => {
        notify(editing.kind === 'subcategory' ? 'Subcategory deleted.' : 'Category deleted.');
        if (editing.kind === 'category') setSelectedId(null);
        setDraftFor(null);
        setEditing({ kind: 'category' });
      },
      onError: (error) => setActionError(adminErrorMessage(error)),
    });
  };

  const handleExportTree = () => {
    const tree = liveCategories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      subcategories: (c.liveSubcategories ?? []).map((sub) => ({ id: sub.id, name: sub.name, description: sub.description })),
    }));
    const url = URL.createObjectURL(new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-business-categories-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const query = filterQuery.toLowerCase();
  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(query) ||
    (live ? cat.liveSubcategories ?? [] : []).some((sub) => sub.name.toLowerCase().includes(query)) ||
    cat.subcategories.some((s) => s.label.toLowerCase().includes(query))
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)}>
            <span className="material-symbols-outlined text-[15px] text-emerald-600">close</span>
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-red-600">error</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)}>
            <span className="material-symbols-outlined text-[15px] text-red-600">close</span>
          </button>
        </div>
      )}

      {/* WORKSPACE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">
            <span>Section 03</span>
            <span>•</span>
            <span className="text-[#066cf4]">Taxonomy Governance Engine</span>
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#191c1e]">
            Business Categories & Taxonomies
          </h1>
          <p className="text-[14px] text-[#4a5e88]">
            Manage primary commercial classifications, nested merchant subcategories, compliance attributes, and algorithmic consumer discovery weights across the VEMTAP platform.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
{!live && (
<>
          <button className="h-9 px-3 rounded-lg bg-[#f2f4f6] text-[#4a5e88] hover:bg-[#e6e8ea] hover:text-[#191c1e] text-[12px] font-medium flex items-center gap-1.5 transition-colors">
            <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
            Reorder Taxonomies
          </button>
</>
)}
          <button
            onClick={live ? handleExportTree : undefined}
            className="h-9 px-3 rounded-lg bg-[#f2f4f6] text-[#4a5e88] hover:bg-[#e6e8ea] hover:text-[#191c1e] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export Tree
          </button>
          <button
            onClick={live ? () => startEditing({ kind: 'new-category' }) : undefined}
            className="h-9 px-3 rounded-lg bg-[#066cf4] text-white text-[12px] font-medium hover:bg-[#0055c4] flex items-center gap-1.5 shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Category
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Active Primaries</span>
              <div className="text-[28px] font-bold text-[#191c1e] mt-1">{live ? formatCount(liveCategories.length) : '18'}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#d9e2ff] flex items-center justify-center text-[#0055c4]">
              <span className="material-symbols-outlined text-[22px]">category</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
{!live && (
<>
            <span className="text-[#0055c4] font-medium flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>100% Published
            </span>
            <span className="text-[#4a5e88]">•</span>
            <span className="text-[#4a5e88]">0 In Draft</span>
</>
)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#066cf4] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Subcategories & Offerings</span>
              <div className="text-[28px] font-bold text-[#191c1e] mt-1">{live ? formatCount(subcategoryTotal) : '142'}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#dae2fd] flex items-center justify-center text-[#4a5e88]">
              <span className="material-symbols-outlined text-[22px]">account_tree</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            {!live && <span className="text-[#0055c4] font-medium">+14 recently added</span>}
            {!live && <span className="text-[#4a5e88]">•</span>}
            <span className="text-[#4a5e88]">
              {live
                ? `Avg ${liveCategories.length ? (subcategoryTotal / liveCategories.length).toFixed(1) : '0'} per category`
                : 'Avg 7.8 per category'}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4a5e88] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Catalogued SKUs Tagged</span>
              <div className="text-[28px] font-bold text-[#191c1e] mt-1">{live ? NONE : '184,920'}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#ffdbce] flex items-center justify-center text-[#c94a03]">
              <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            {live ? (
              <span className="text-[#4a5e88]">Not tracked yet</span>
            ) : (
              <>
                <span className="text-[#0055c4] font-medium">+9.4% MoM</span>
                <span className="text-[#4a5e88]">catalog penetration</span>
              </>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c94a03] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </div>

        {/* KPI 4: Merchant Density with bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Merchant Density</span>
              <div className="text-[28px] font-bold text-[#191c1e] mt-1">
                {live ? formatCount(activeBusinesses) : '3,490'} <span className="text-[14px] text-[#4a5e88] font-normal">Active</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#e6e8ea] flex items-center justify-center text-[#4a5e88]">
              <span className="material-symbols-outlined text-[22px]">pie_chart</span>
            </div>
          </div>
{!live && (
<>
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="w-full h-2 rounded-full bg-[#f2f4f6] flex overflow-hidden">
              <div className="h-full bg-[#066cf4]" style={{ width: '34%' }} title="Food & Dining: 34%" />
              <div className="h-full bg-[#4a5e88]" style={{ width: '26%' }} title="Electronics: 26%" />
              <div className="h-full bg-[#c94a03]" style={{ width: '21%' }} title="Fashion & Beauty: 21%" />
              <div className="h-full bg-[#c2c6d7]" style={{ width: '19%' }} title="Other: 19%" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#4a5e88]">
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#066cf4] mr-1" />Food 34%</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#4a5e88] mr-1" />Elec 26%</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#c94a03] mr-1" />Style 21%</span>
            </div>
          </div>
</>
)}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c2c6d7] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </div>
      </div>

      {/* MAIN DUAL-PANE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Category Hierarchy Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#f2f4f6]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative w-full max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#727786]">search</span>
                <input
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#f2f4f6] text-[#191c1e] placeholder:text-[#727786] text-[12px] focus:outline-none focus:ring-2 focus:ring-[#066cf4]/30 transition-all"
                  placeholder="Filter categories, subcategories, tags..."
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
{!live && (
<>
              <button className="h-9 px-3 rounded-lg bg-[#f2f4f6] text-[#4a5e88] hover:bg-[#e6e8ea] hover:text-[#191c1e] text-[12px] font-medium flex items-center gap-1.5 transition-colors">
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                All Statuses
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
</>
)}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#4a5e88]">
              <span>Displaying {filteredCategories.length} of {live ? liveCategories.length : 18} Primaries</span>
              <button className="w-7 h-7 rounded hover:bg-[#f2f4f6] flex items-center justify-center" title="Collapse All">
                <span className="material-symbols-outlined text-[18px]">unfold_less</span>
              </button>
              <button className="w-7 h-7 rounded hover:bg-[#f2f4f6] flex items-center justify-center" title="Expand All">
                <span className="material-symbols-outlined text-[18px]">unfold_more</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="bg-[#f2f4f6] text-[#4a5e88] text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-3 px-4 w-10 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" />
                  </th>
                  <th className="py-3 px-4">Primary Category</th>
                  <th className="py-3 px-4">Subcategories & Structure</th>
                  <th className="py-3 px-4">Merchants</th>
                  <th className="py-3 px-4">Discovery & Fee</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[#191c1e]">
                {live && filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-[#4a5e88]">
                      {categoriesQuery.isLoading
                        ? 'Loading categories…'
                        : categoriesQuery.isError
                          ? `Couldn't load categories: ${adminErrorMessage(categoriesQuery.error)}`
                          : 'No categories yet.'}
                    </td>
                  </tr>
                )}
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <tr
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`transition-colors group cursor-pointer relative border-b border-[#f2f4f6] last:border-0 ${
                        isSelected
                          ? 'bg-[#dae2fd]/40 hover:bg-[#dae2fd]/60'
                          : 'hover:bg-[#f2f4f6] bg-white'
                      }`}
                    >
                      <td className="py-3 px-4 text-center relative">
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#066cf4]" />
                        )}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cat.iconBg}`}>
                            <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <div className={`text-[13px] font-semibold text-[#191c1e] flex items-center gap-1.5 ${isSelected ? '' : ''}`}>
                              {cat.name}
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#066cf4]" />}
                            </div>
                            <span className="text-[11px] text-[#4a5e88]">
                              {live ? 'ID' : 'Code'}: {cat.code} • {cat.subcategories.length + cat.extraCount} Subcategories
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {cat.subcategories.map((sub) => (
                            <span key={sub.id} className="px-2 py-0.5 rounded bg-[#f2f4f6] text-[#4a5e88] text-[11px]">
                              {sub.label}
                            </span>
                          ))}
                          {cat.extraCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-[#e6e8ea] text-[#4a5e88] text-[11px] font-medium">
                              +{cat.extraCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="text-[13px] font-medium text-[#191c1e]">{live ? NONE : cat.merchantsCount.toLocaleString()}</div>
                        {!live && <span className="text-[11px] text-[#4a5e88]">{cat.pctNetwork}% of network</span>}
                      </td>
                      <td className="py-3 px-4 align-top">
                        {live ? (
                          <span className="text-[11px] text-[#4a5e88] line-clamp-2">{cat.description || NONE}</span>
                        ) : (
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-max ${cat.discoveryStyle}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#066cf4]" />
                            {cat.discoveryBadge}
                          </span>
                          <span className="text-[11px] text-[#4a5e88]">{cat.fee}</span>
                        </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!live) return;
                              setSelectedId(cat.id);
                              startEditing({ kind: 'new-subcategory' }, cat);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-[#f2f4f6] flex items-center justify-center text-[#4a5e88]"
                            title="Add Subcategory"
                          >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (live) setSelectedCategory(cat);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-[#f2f4f6] flex items-center justify-center text-[#4a5e88]"
                            title="Edit Category"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (live: every category loads at once) */}
          {!live && (
          <div className="p-3 bg-[#f2f4f6]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#4a5e88] text-[11px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select className="bg-white text-[#191c1e] rounded px-2 py-1 text-[11px] focus:outline-none border border-[#e6e8ea]">
                  <option>10 per page</option>
                  <option>25 per page</option>
                  <option>50 per page</option>
                </select>
              </div>
              <span>Selected 1 category</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 rounded bg-[#e6e8ea] text-[#4a5e88] hover:bg-[#d4d7db] transition-colors opacity-50" disabled>
                Previous
              </button>
              <span className="px-2 font-medium text-[#191c1e]">Page 1 of 4</span>
              <button className="px-2.5 py-1 rounded bg-[#e6e8ea] text-[#4a5e88] hover:bg-[#d4d7db] transition-colors">
                Next
              </button>
            </div>
          </div>
          )}
        </div>

        {/* RIGHT: Subcategory Configuration Inspector (4 cols) */}
        {live && (
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 bg-[#f2f4f6] flex items-start justify-between border-b border-[#e6e8ea]">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#066cf4]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">
                    {editing.kind === 'new-category'
                      ? 'New Category'
                      : editing.kind === 'new-subcategory'
                        ? 'New Subcategory'
                        : editing.kind === 'subcategory'
                          ? 'Subcategory Configuration'
                          : 'Category Configuration'}
                  </span>
                </div>
                <h2 className="text-[15px] font-semibold text-[#191c1e] mt-1">{draftName || 'Untitled'}</h2>
                {editing.kind !== 'new-category' && selectedCategory && (
                  <span className="text-[11px] text-[#4a5e88]">
                    {editing.kind === 'category' ? `${selectedCategory.liveSubcategories?.length ?? 0} subcategories` : `Parent: ${selectedCategory.name}`}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 flex flex-col gap-5 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#191c1e]">Name</label>
                <input
                  className="h-9 px-3 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-[12px] focus:outline-none focus:ring-2 focus:ring-[#066cf4]/30"
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#191c1e]">
                  Description{editing.kind === 'subcategory' || editing.kind === 'new-subcategory' ? ' (optional)' : ''}
                </label>
                <textarea
                  rows={3}
                  className="px-3 py-2 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-[12px] focus:outline-none focus:ring-2 focus:ring-[#066cf4]/30"
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                />
              </div>

              {selectedCategory && editing.kind !== 'new-category' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#191c1e]">Subcategories</span>
                    <button
                      onClick={() => startEditing({ kind: 'new-subcategory' })}
                      className="text-[11px] text-[#066cf4] hover:underline"
                    >
                      + Add subcategory
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => startEditing({ kind: 'category' })}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        editing.kind === 'category' ? 'bg-[#066cf4] text-white' : 'bg-[#f2f4f6] text-[#4a5e88]'
                      }`}
                    >
                      {selectedCategory.name}
                    </button>
                    {(selectedCategory.liveSubcategories ?? []).map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => startEditing({ kind: 'subcategory', id: sub.id })}
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          editing.kind === 'subcategory' && editing.id === sub.id
                            ? 'bg-[#066cf4] text-white'
                            : 'bg-[#f2f4f6] text-[#4a5e88] hover:bg-[#e6e8ea]'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saveCategory.isPending}
                  className="flex-1 h-10 rounded-lg bg-[#066cf4] text-white text-[13px] font-semibold hover:bg-[#0055c4] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {editing.kind === 'new-category' || editing.kind === 'new-subcategory' ? 'Create' : 'Save Changes'}
                </button>
                {(editing.kind === 'category' || editing.kind === 'subcategory') && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteEntry.isPending}
                    title={confirmDelete ? 'Click again to delete' : 'Delete'}
                    className={`h-10 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors text-[12px] font-medium disabled:opacity-50 ${
                      confirmDelete ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#4a5e88]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    {confirmDelete && 'Confirm'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {!live && selectedCategory && (
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="p-4 bg-[#f2f4f6] flex items-start justify-between border-b border-[#e6e8ea]">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#066cf4]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Subcategory Configuration</span>
              </div>
              <h2 className="text-[15px] font-semibold text-[#191c1e] mt-1">
                {selectedCategory.name === 'Food, Dining & Groceries'
                  ? 'Fast Casual & Quick Service'
                  : selectedCategory.subcategories[0]?.label ?? selectedCategory.name}
              </h2>
              <span className="text-[11px] text-[#4a5e88]">Parent: {selectedCategory.name}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#001a41] text-[10px] font-bold uppercase">Live Sync</span>
          </div>

          {/* Editor Form */}
          <div className="p-4 flex flex-col gap-5 overflow-y-auto">
            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#191c1e]">Subcategory Identifier & Slug</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-9 px-3 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-[12px] focus:outline-none focus:ring-2 focus:ring-[#066cf4]/30"
                  type="text"
                  defaultValue={
                    selectedCategory.name === 'Food, Dining & Groceries' ? 'fast-casual-qsr' :
                    selectedCategory.subcategories[0]?.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? 'subcategory'
                  }
                  key={selectedCategory.id}
                />
                <span className="h-9 px-3 rounded-lg bg-[#f2f4f6] text-[#4a5e88] text-[12px] flex items-center">#1402</span>
              </div>
            </div>

            {/* Discovery Display Asset */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#191c1e]">Discovery Display Icon & Asset</label>
              <div className="flex items-center gap-3 p-3 bg-[#f2f4f6] rounded-lg">
                <div className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${selectedCategory.iconBg}`}>
                  <span className="material-symbols-outlined text-[36px]">{selectedCategory.icon}</span>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[12px] font-medium text-[#191c1e] truncate">
                    {selectedCategory.id}_hero_thumbnail.png
                  </span>
                  <span className="text-[11px] text-[#4a5e88]">480×480 SVG/WebP vector</span>
                  <button className="text-[#066cf4] text-left text-[12px] hover:underline mt-0.5">Replace Graphic</button>
                </div>
              </div>
            </div>

            {/* Compliance Toggles */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#191c1e]">Mandatory Merchant Form Attributes</span>
                <span className="text-[11px] text-[#0055c4]">Rules (4 active)</span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: 'NAFDAC Reg. Number Check',
                    sub: 'Require health certificate for packaged food items',
                    checked: nafdac,
                    toggle: () => setNafdac(!nafdac),
                  },
                  {
                    label: 'Fulfillment Model Tagging',
                    sub: 'Require Dine-in, Takeaway, or Drive-thru specification',
                    checked: fulfillment,
                    toggle: () => setFulfillment(!fulfillment),
                  },
                  {
                    label: 'Kitchen Prep Lead Time Tag',
                    sub: 'Enforce 15m/30m/45m standard turnaround markers',
                    checked: kitchenLead,
                    toggle: () => setKitchenLead(!kitchenLead),
                  },
                  {
                    label: 'Dietary Credential Badges',
                    sub: 'Halal, Vegetarian, Gluten-Free filter tags',
                    checked: dietary,
                    toggle: () => setDietary(!dietary),
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors">
                    <div className="flex flex-col pr-3">
                      <span className="text-[12px] font-medium text-[#191c1e]">{item.label}</span>
                      <span className="text-[11px] text-[#4a5e88]">{item.sub}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={item.toggle}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#e6e8ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#066cf4]" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission Tiers */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#191c1e]">Category Commission Rate Tier</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#f2f4f6] flex flex-col">
                  <span className="text-[11px] text-[#4a5e88]">In-Store Tap POS</span>
                  <span className="text-[16px] font-bold text-[#191c1e] mt-0.5">1.5%</span>
                </div>
                <div className="p-3 rounded-lg bg-[#f2f4f6] flex flex-col">
                  <span className="text-[11px] text-[#4a5e88]">App In-Feed Order</span>
                  <span className="text-[16px] font-bold text-[#0055c4] mt-0.5">3.5% + ₦100</span>
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 h-10 rounded-lg bg-[#066cf4] text-white text-[13px] font-semibold hover:bg-[#0055c4] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Subcategory Config
              </button>
              <button className="h-10 w-10 rounded-lg bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#4a5e88] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
