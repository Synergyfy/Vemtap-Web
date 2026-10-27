import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { DesktopAddServiceStep1Screen } from './DesktopAddServiceStep1Screen';
import { DesktopAddServiceStep2Screen } from './DesktopAddServiceStep2Screen';
import { DesktopAddServiceStep3Screen } from './DesktopAddServiceStep3Screen';
import { DesktopServiceReviewScreen } from './DesktopServiceReviewScreen';
import { DesktopServicePublishedScreen } from './DesktopServicePublishedScreen';
import { INITIAL_SERVICE_DRAFT, type ServiceDraft } from './desktopServiceDraft';
import { getBusinessSetupSnapshot } from '../businessSetup';
import { classifyServiceFromBusiness } from '../serviceClassification';
import type { BusinessProfileDraft } from './DesktopBusinessOnboardingScreen';
import {
  getCentralCategories,
  addCentralCategory,
  updateCentralCategory,
  archiveCentralCategory,
  type CentralCategory,
} from '../catalogueData';
import { CategoryImageField } from '../../components/CategoryImageField';
import { BulkActionsBar, type BulkAction } from '../../components/BulkActionsBar';
import { ConfirmActionDialog } from '../../components/ConfirmActionDialog';
import {
  getStoredServices,
  saveStoredServices,
  type ServiceCatalogRow,
  type ServiceCatalogChip,
} from '../servicesCatalogData';

interface DesktopServicesCategoriesScreenProps {
  onNav: (key: BusinessPortalNavKey | string) => void;
  onBackToCatalog?: () => void;
  onOpenCatalog?: () => void;
}

const BRANCH_DOT: Record<ServiceCatalogRow['branchDot'], string> = {
  ok: 'bg-badge-discount-text',
  secondary: 'bg-primary',
  tertiary: 'bg-text-tertiary',
};

const CHIPS: Array<{ key: ServiceCatalogChip; label: string; icon?: string; tone?: 'green' | 'error'; counted?: boolean }> = [
  { key: 'all', label: 'All Services', counted: true },
  { key: 'published', label: 'Active & Published', counted: true },
  { key: 'deals', label: 'Deal Linked', icon: 'percent', tone: 'green', counted: true },
  { key: 'low', label: 'Low Slot Availability', icon: 'priority_high', tone: 'error', counted: true },
  { key: 'booking', label: 'Requires Booking' },
  { key: 'walkin', label: 'Walk-ins Allowed' },
  { key: 'draft', label: 'Drafts', counted: true },
];

interface AdvancedFilters {
  category: string;
  status: 'any' | 'published' | 'draft' | 'hidden';
  deal: 'any' | 'linked' | 'unlinked';
  sync: 'any' | 'synced' | 'unsynced';
}

const EMPTY_FILTERS: AdvancedFilters = {
  category: '',
  status: 'any',
  deal: 'any',
  sync: 'any',
};

function parseAmount(value: string) {
  return value.replace(/[^0-9.]/g, '');
}

export function DesktopServicesCategoriesScreen({
  onNav,
  onBackToCatalog,
  onOpenCatalog: _onOpenCatalog,
}: DesktopServicesCategoriesScreenProps) {
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [serviceRows, setServiceRows] = useState<ServiceCatalogRow[]>(() => getStoredServices());
  const [centralCategories, setCentralCategories] = useState<CentralCategory[]>(() => getCentralCategories());
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryModal, setCategoryModal] = useState<{
    mode: 'add' | 'edit';
    category?: CentralCategory;
  } | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catFormIcon, setCatFormIcon] = useState('spa');
  const [catFormImage, setCatFormImage] = useState('');

  const [subFlow, setSubFlow] = useState<
    | 'none'
    | 'service1'
    | 'service2'
    | 'service3'
    | 'serviceReview'
    | 'servicePublished'
  >('none');

  const businessSnapshot = getBusinessSetupSnapshot();
  const businessDraft = businessSnapshot?.data.draft as BusinessProfileDraft | undefined;
  const businessCategories = businessDraft?.categories ?? [];
  const businessSubcategories = businessDraft?.tags ?? [];

  const getInitialServiceDraft = (): ServiceDraft => {
    const classification = classifyServiceFromBusiness(businessCategories, businessSubcategories);
    if (classification) {
      return {
        ...INITIAL_SERVICE_DRAFT,
        primaryCategory: classification.primaryCategory,
        subCategory: classification.subCategory,
      };
    }
    return { ...INITIAL_SERVICE_DRAFT };
  };

  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(getInitialServiceDraft);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<ServiceCatalogChip>('all');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkDelete, setBulkDelete] = useState<{ ids: string[]; count: number } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advanced, setAdvanced] = useState<AdvancedFilters>(EMPTY_FILTERS);
  const [actionMenuRowId, setActionMenuRowId] = useState<string | null>(null);

  const [sync, setSync] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(serviceRows.map((row) => [row.id, row.sync])),
  );

  const flash = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const exitSubFlow = () => {
    setEditingRowId(null);
    setSubFlow('none');
  };

  const persistServices = (updater: (prev: ServiceCatalogRow[]) => ServiceCatalogRow[]) => {
    setServiceRows((prev) => {
      const next = updater(prev);
      saveStoredServices(next);
      return next;
    });
  };

  const handlePublishService = () => {
    const isEdit = Boolean(editingRowId);
    const updatedFields = {
      name: serviceDraft.title || 'New Service Session',
      alt: serviceDraft.title || 'Service Item',
      sku: serviceDraft.skuCode || `VG-SRV-${Math.floor(10 + Math.random() * 90)}`,
      sub: `${serviceDraft.durationMins || 60} min session`,
      category: serviceDraft.primaryCategory || 'Spa & Wellness',
      price: serviceDraft.basePrice ? `₦${Number(serviceDraft.basePrice).toLocaleString('en-US')}` : '₦18,000',
      was: serviceDraft.comparePrice ? `₦${Number(serviceDraft.comparePrice).toLocaleString('en-US')}` : undefined,
      dealBadge: serviceDraft.comparePrice ? 'Introductory Offer' : undefined,
    };

    if (isEdit) {
      persistServices((prev) =>
        prev.map((item) => (item.id === editingRowId ? { ...item, ...updatedFields } : item)),
      );
      setEditingRowId(null);
      setSubFlow('none');
      flash(`"${updatedFields.name}" updated successfully.`);
      return;
    }

    const newServiceRow: ServiceCatalogRow = {
      id: `s_${Date.now()}`,
      ...updatedFields,
      image:
        serviceDraft.image ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB4wRhk7Z2awcljAxG1LjsDB3N2bAN7rQlDkEXDILlYF6i09D_DE0_JDmPFddvIXLKfZ-TtuSypTz0Kl3jUy7knUpU3HB4NuSb137foMDpgotXoiK7w3GVbU1FRlvDkCRSfNt7lLHtinSDkQaVQwt40lHDAj3DUxzf9tBWYtOf7qlTY-_mE9_3gDNIH9wVJF72-OJb0k0sqg-vLThSLsh7dq90yBqvw9fzIB1gXV-Fo2ZXSueR6oLefog',
      categoryIcon: 'spa',
      branchDot: 'ok',
      branchLabel: 'All 3 Branches',
      branchNote: 'Bookings Enabled',
      stock: {
        tone: 'ok',
        label: 'Slots Open Today',
        units: 'Available for Booking',
        bar: 85,
        barTone: 'ok',
      },
      sync: true,
      filters: ['all', 'published', 'booking'],
    };

    persistServices((prev) => [newServiceRow, ...prev]);
    setSync((prev) => ({ ...prev, [newServiceRow.id]: true }));
    setSubFlow('servicePublished');
  };

  const handleOpenEditItem = (row: ServiceCatalogRow) => {
    setActionMenuRowId(null);
    setEditingRowId(row.id);
    const durationMatch = row.sub.match(/(\d+)\s*min/i);
    setServiceDraft((prev) => ({
      ...prev,
      title: row.name,
      skuCode: row.sku,
      primaryCategory: row.category,
      basePrice: parseAmount(row.price),
      comparePrice: row.was ? parseAmount(row.was) : '',
      image: row.image || prev.image,
      durationMins: durationMatch ? Number(durationMatch[1]) : prev.durationMins,
    }));
    setSubFlow('service1');
  };

  const handleDuplicateItem = (row: ServiceCatalogRow) => {
    setActionMenuRowId(null);
    const newId = `${row.id}-copy-${Date.now()}`;
    const newSku = `${row.sku}-CP`;
    const duplicated: ServiceCatalogRow = {
      ...row,
      id: newId,
      sku: newSku,
      name: `${row.name} (Copy)`,
    };
    persistServices((prev) => [duplicated, ...prev]);
    flash(`Duplicated "${row.name}" as "${duplicated.name}".`);
  };

  const handleToggleHideItem = (row: ServiceCatalogRow) => {
    setActionMenuRowId(null);
    const nextHidden = !row.hidden;
    persistServices((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, hidden: nextHidden } : item)),
    );
    flash(`"${row.name}" is now ${nextHidden ? 'hidden from storefront' : 'visible in storefront'}.`);
  };

  const handleDeleteItem = (row: ServiceCatalogRow) => {
    setActionMenuRowId(null);
    persistServices((prev) => prev.filter((item) => item.id !== row.id));
    flash(`"${row.name}" removed from catalogue.`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'SKU', 'Service Name', 'Category', 'Price', 'Was Price', 'Branches', 'Duration / Schedule', 'Slot Status', 'Booking Sync'];
    const csvRows = [
      headers.join(','),
      ...serviceRows.map((row) =>
        [
          row.id,
          `"${row.sku}"`,
          `"${row.name.replace(/"/g, '""')}"`,
          `"${row.category}"`,
          `"${row.price}"`,
          `"${row.was ?? ''}"`,
          `"${row.branchLabel}"`,
          `"${row.sub}"`,
          `"${row.stock.label}"`,
          sync[row.id] ? 'Synced' : 'Offline',
        ].join(','),
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vemtap_services_catalog.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    flash(`Exported ${serviceRows.length} services to CSV.`);
  };

  // Category operations
  const serviceCategories = useMemo(
    () => centralCategories.filter((c) => c.type === 'service'),
    [centralCategories],
  );

  const filteredCategories = useMemo(() => {
    const q = categorySearchQuery.trim().toLowerCase();
    return serviceCategories.filter((c) => {
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    });
  }, [serviceCategories, categorySearchQuery]);

  const handleOpenAddCategory = () => {
    setCatFormName('');
    setCatFormDesc('');
    setCatFormIcon('spa');
    setCatFormImage('');
    setCategoryModal({ mode: 'add' });
  };

  const handleOpenEditCategory = (cat: CentralCategory) => {
    setCatFormName(cat.name);
    setCatFormDesc(cat.description);
    setCatFormIcon(cat.icon);
    setCatFormImage(cat.image ?? '');
    setCategoryModal({ mode: 'edit', category: cat });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) return;
    if (categoryModal?.mode === 'add') {
      const slug = catFormName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      addCentralCategory({
        id: slug,
        name: catFormName.trim(),
        slug,
        type: 'service',
        description: catFormDesc.trim() || `${catFormName.trim()} appointments & treatments`,
        icon: catFormIcon,
        image: catFormImage || undefined,
        productCount: 0,
        activeBranches: ['all'],
        qrDestinationUrl: `/business/glow-serenity-spa-219/services?category=${slug}`,
      });
      setCentralCategories(getCentralCategories());
      flash(`Category "${catFormName.trim()}" created successfully.`);
    } else if (categoryModal?.mode === 'edit' && categoryModal.category) {
      updateCentralCategory(categoryModal.category.id, {
        name: catFormName.trim(),
        description: catFormDesc.trim(),
        icon: catFormIcon,
        image: catFormImage || undefined,
      });
      setCentralCategories(getCentralCategories());
      flash(`Category "${catFormName.trim()}" updated successfully.`);
    }
    setCategoryModal(null);
  };

  const handleArchiveCategory = (id: string, name: string) => {
    archiveCentralCategory(id);
    setCentralCategories(getCentralCategories());
    flash(`Category "${name}" archived.`);
  };

  // Filtration
  const visibleRows = useMemo(() => {
    return serviceRows.filter((row) => {
      const matchesChip = chip === 'all' ? true : row.filters.includes(chip);
      const needle = query.trim().toLowerCase();
      const matchesQuery =
        !needle ||
        row.name.toLowerCase().includes(needle) ||
        row.sku.toLowerCase().includes(needle) ||
        row.category.toLowerCase().includes(needle);

      const matchesCategory = !advanced.category || row.category === advanced.category;
      const isSynced = sync[row.id] === true;
      const matchesSync =
        advanced.sync === 'any' ? true : advanced.sync === 'synced' ? isSynced : !isSynced;
      const matchesDeal =
        advanced.deal === 'any' ? true : advanced.deal === 'linked' ? row.filters.includes('deals') : !row.filters.includes('deals');
      const matchesStatus =
        advanced.status === 'any'
          ? true
          : advanced.status === 'published'
          ? row.filters.includes('published') && !row.draft
          : advanced.status === 'draft'
          ? row.draft === true
          : row.hidden === true;

      return matchesChip && matchesQuery && matchesCategory && matchesSync && matchesDeal && matchesStatus;
    });
  }, [serviceRows, chip, query, advanced, sync]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(serviceRows.map((r) => r.category))).sort(),
    [serviceRows],
  );

  const activeAdvancedCount = useMemo(() => {
    return (
      (advanced.category ? 1 : 0) +
      (advanced.status !== 'any' ? 1 : 0) +
      (advanced.deal !== 'any' ? 1 : 0) +
      (advanced.sync !== 'any' ? 1 : 0)
    );
  }, [advanced]);

  const chipCount = (key: ServiceCatalogChip) => serviceRows.filter((row) => row.filters.includes(key)).length;

  const visibleIds = visibleRows.map((row) => row.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = prev.filter((id) => !visibleIds.includes(id));
      return allVisibleSelected ? next : [...next, ...visibleIds];
    });

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));

  const visibleSelectedRows = visibleRows.filter((row) => selected.includes(row.id));

  const bulkActions: BulkAction[] = [
    { value: 'publish', label: 'Publish to Online Booking' },
    { value: 'draft', label: 'Move to Draft' },
    { value: 'hide', label: 'Hide from Storefront' },
    { value: 'show', label: 'Show on Storefront' },
    { value: 'addToDeals', label: 'Link with Deals' },
    { value: 'removeFromDeals', label: 'Remove from Deals' },
    { value: 'delete', label: 'Delete Services' },
  ];

  const applyBulkAction = (action: string) => {
    const rows = visibleSelectedRows;
    if (rows.length === 0) {
      flash('Select at least one service first.');
      return;
    }

    if (action === 'delete') {
      setBulkDelete({ ids: rows.map((row) => row.id), count: rows.length });
      return;
    }

    const ids = rows.map((r) => r.id);
    const idSet = new Set(ids);

    if (action === 'publish') {
      persistServices((prev) =>
        prev.map((row) =>
          idSet.has(row.id)
            ? { ...row, draft: false, filters: Array.from(new Set([...row.filters, 'published'])) }
            : row,
        ),
      );
      setSync((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          next[id] = true;
        });
        return next;
      });
      flash(`Published ${ids.length} services to booking mesh.`);
    } else if (action === 'draft') {
      persistServices((prev) =>
        prev.map((row) =>
          idSet.has(row.id)
            ? { ...row, draft: true, filters: row.filters.filter((f) => f !== 'published') }
            : row,
        ),
      );
      flash(`Moved ${ids.length} services to draft.`);
    } else if (action === 'hide') {
      persistServices((prev) =>
        prev.map((row) => (idSet.has(row.id) ? { ...row, hidden: true } : row)),
      );
      flash(`Hidden ${ids.length} services from storefront.`);
    } else if (action === 'show') {
      persistServices((prev) =>
        prev.map((row) => (idSet.has(row.id) ? { ...row, hidden: false } : row)),
      );
      flash(`Made ${ids.length} services visible on storefront.`);
    } else if (action === 'addToDeals') {
      persistServices((prev) =>
        prev.map((row) =>
          idSet.has(row.id)
            ? {
                ...row,
                filters: Array.from(new Set([...row.filters, 'deals'])),
                dealBadge: row.dealBadge ?? 'Deal Linked',
              }
            : row,
        ),
      );
      flash(`Linked ${ids.length} services to deals.`);
    } else if (action === 'removeFromDeals') {
      persistServices((prev) =>
        prev.map((row) =>
          idSet.has(row.id)
            ? {
                ...row,
                filters: row.filters.filter((f) => f !== 'deals'),
                dealBadge: undefined,
              }
            : row,
        ),
      );
      flash(`Unlinked ${ids.length} services from deals.`);
    }

    setSelected([]);
  };

  const confirmBulkDelete = () => {
    if (!bulkDelete) return;
    const idSet = new Set(bulkDelete.ids);
    persistServices((prev) => prev.filter((r) => !idSet.has(r.id)));
    flash(`Deleted ${bulkDelete.count} service${bulkDelete.count === 1 ? '' : 's'}.`);
    setBulkDelete(null);
    setSelected([]);
  };

  // Subflow Views
  if (subFlow === 'service1') {
    return (
      <DesktopAddServiceStep1Screen
        draft={serviceDraft}
        onDraftChange={(patch) => setServiceDraft((prev) => ({ ...prev, ...patch }))}
        onBack={exitSubFlow}
        onNext={() => setSubFlow('service2')}
        onSaveDraft={exitSubFlow}
        onNav={onNav}
        businessCategories={businessCategories}
        businessSubcategories={businessSubcategories}
      />
    );
  }

  if (subFlow === 'service2') {
    return (
      <DesktopAddServiceStep2Screen
        draft={serviceDraft}
        onDraftChange={(patch) => setServiceDraft((prev) => ({ ...prev, ...patch }))}
        onBack={() => setSubFlow('service1')}
        onNext={() => setSubFlow('service3')}
        onSaveDraft={exitSubFlow}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'service3') {
    return (
      <DesktopAddServiceStep3Screen
        draft={serviceDraft}
        onDraftChange={(patch) => setServiceDraft((prev) => ({ ...prev, ...patch }))}
        onBack={() => setSubFlow('service2')}
        onNext={() => setSubFlow('serviceReview')}
        onSaveDraft={exitSubFlow}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'serviceReview') {
    return (
      <DesktopServiceReviewScreen
        draft={serviceDraft}
        onBack={() => setSubFlow('service3')}
        onEditBasics={() => setSubFlow('service1')}
        onEditPricing={() => setSubFlow('service2')}
        onEditBranches={() => setSubFlow('service3')}
        onEditDescription={() => setSubFlow('service1')}
        onPublish={handlePublishService}
        onSaveDraft={exitSubFlow}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'servicePublished') {
    return (
      <DesktopServicePublishedScreen
        draft={serviceDraft}
        onMakeDeal={() => onNav('deals')}
        onViewCatalog={() => {
          setActiveTab('services');
          setSubFlow('none');
        }}
        onAddAnother={() => {
          setServiceDraft(getInitialServiceDraft());
          setEditingRowId(null);
          setSubFlow('service1');
        }}
        onNav={onNav}
      />
    );
  }

  const activeServicesCount = serviceRows.filter((r) => !r.draft && !r.hidden).length;
  const dealLinkedCount = serviceRows.filter((r) => r.filters.includes('deals')).length;

  return (
    <MerchantShell activeNav="business-services" onNav={onNav}>
      <div className="flex flex-col gap-space-lg">
        {/* Breadcrumb Top Strip */}
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
            <button
              type="button"
              onClick={onBackToCatalog || (() => onNav('business-catalog'))}
              className="hover:text-primary transition-colors"
            >
              My Products
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-on-surface font-label-sm text-label-sm font-semibold">My Service</span>
          </div>
          <div className="flex items-center gap-space-sm self-start sm:self-auto">
            <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span>Booking Mesh Online • 0ms sync</span>
            </div>
            <div className="hidden md:flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg bg-surface-tint-blue text-primary font-caption text-caption">
              <Icon name="calendar_month" className="text-[16px]" />
              <span>3 Branches Booking-Ready</span>
            </div>
          </div>
        </div>

        {/* Page Header Deck */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
          <div className="max-w-3xl min-w-0">
            <div className="inline-flex items-center gap-space-xs px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-label-sm text-label-sm mb-space-xs">
              <Icon name="design_services" className="text-[16px]" />
              <span>Services &amp; Appointments Engine</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Services &amp; Appointments Catalogue
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              Centralized appointment booking and treatment management. Configure service duration, room capacities,
              pricing tiers, and therapist allocation across branches.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-button-secondary text-button-secondary shadow-sm active:scale-[0.98]"
            >
              <Icon name="create_new_folder" className="text-primary text-[20px]" />
              <span>+ Add Service Category</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setServiceDraft(getInitialServiceDraft());
                setEditingRowId(null);
                setSubFlow('service1');
              }}
              className="flex items-center gap-space-2xs px-space-lg py-space-sm rounded-xl bg-primary-container text-on-primary-container hover:bg-primary transition-all font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98]"
            >
              <Icon name="add_task" className="text-[20px]" />
              <span>+ Add Service</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div>
              <span className="font-caption text-caption text-text-secondary block">Active Services</span>
              <span className="font-heading-md text-heading-md font-bold text-on-surface">
                {activeServicesCount}
              </span>
              <span className="font-caption text-caption text-badge-discount-text flex items-center gap-space-2xs mt-space-2xs">
                <Icon name="check_circle" className="text-[14px]" />
                Online &amp; Bookable
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-surface-tint-blue text-primary">
              <Icon name="spa" className="text-[24px]" />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div>
              <span className="font-caption text-caption text-text-secondary block">Deal-Linked Offers</span>
              <span className="font-heading-md text-heading-md font-bold text-on-surface">
                {dealLinkedCount}
              </span>
              <span className="font-caption text-caption text-primary flex items-center gap-space-2xs mt-space-2xs">
                <Icon name="local_offer" className="text-[14px]" />
                Promotional Perks
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-badge-discount-bg text-badge-discount-text">
              <Icon name="percent" className="text-[24px]" />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div>
              <span className="font-caption text-caption text-text-secondary block">Booking Capacity</span>
              <span className="font-heading-md text-heading-md font-bold text-on-surface">
                92% Ready
              </span>
              <span className="font-caption text-caption text-text-secondary flex items-center gap-space-2xs mt-space-2xs">
                <Icon name="calendar_clock" className="text-[14px]" />
                Rooms &amp; Slots Available
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-surface-container-high text-secondary">
              <Icon name="event_seat" className="text-[24px]" />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div>
              <span className="font-caption text-caption text-text-secondary block">Online Sync Status</span>
              <span className="font-heading-md text-heading-md font-bold text-primary">
                100% In-Sync
              </span>
              <span className="font-caption text-caption text-text-secondary flex items-center gap-space-2xs mt-space-2xs">
                <Icon name="sync" className="text-[14px]" />
                Across 3 Locations
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-surface-tint-blue text-primary">
              <Icon name="cloud_done" className="text-[24px]" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-xs rounded-xl shadow-sm">
          <div className="flex items-center gap-space-2xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold transition-all whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Icon name="spa" className="text-[18px]" />
              <span>Services</span>
              <span
                className={`px-space-xs py-space-2xs rounded-full font-caption text-caption font-bold ${
                  activeTab === 'services'
                    ? 'bg-surface-canvas/20 text-on-primary'
                    : 'bg-surface-container text-text-secondary'
                }`}
              >
                {serviceRows.length} active
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold transition-all whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Icon name="category" className="text-[18px]" />
              <span>Categories</span>
              <span
                className={`px-space-xs py-space-2xs rounded-full font-caption text-caption font-bold ${
                  activeTab === 'categories'
                    ? 'bg-surface-canvas/20 text-on-primary'
                    : 'bg-surface-container text-text-secondary'
                }`}
              >
                {serviceCategories.length} categories
              </span>
            </button>
          </div>

          <div className="flex items-center gap-space-xs px-space-xs">
            {activeTab === 'services' && (
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
            )}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg text-text-secondary hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm transition-colors active:scale-95"
            >
              <Icon name="file_download" className="text-[18px]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Categories Management */}
        {activeTab === 'categories' ? (
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Filter service categories..."
                  className="w-full h-[44px] bg-surface-container-low rounded-xl pl-12 pr-4 text-on-surface font-body-md text-body-md placeholder-text-tertiary outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-body-sm shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Icon name="add" className="text-[18px]" />
                <span>Create Service Category</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-border-subtle">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-subtle/50 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                      <th className="py-3.5 px-4">Category &amp; Slug</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Active Services</th>
                      <th className="py-3.5 px-4">Direct Booking Link</th>
                      <th className="py-3.5 px-4">Scans &amp; Orders</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-body-sm">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-text-tertiary">
                          No service categories found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-surface-subtle/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {cat.image ? (
                                <img
                                  src={cat.image}
                                  alt=""
                                  className="w-10 h-10 rounded-xl object-cover shrink-0 bg-surface-container"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                                  <Icon name={cat.icon || 'spa'} className="text-[20px]" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-text-primary block">{cat.name}</span>
                                <span className="text-[11px] font-mono text-text-tertiary">{cat.slug}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-text-secondary line-clamp-2 max-w-xs text-caption">
                              {cat.description || 'No description provided.'}
                            </p>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-text-primary">
                              {serviceRows.filter((r) => r.category === cat.name).length || cat.productCount} services
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <code className="text-[11px] font-mono bg-surface-subtle px-2 py-1 rounded text-text-secondary truncate max-w-[160px]">
                                {cat.qrDestinationUrl}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof window !== 'undefined') {
                                    navigator.clipboard?.writeText(window.location.origin + cat.qrDestinationUrl);
                                  }
                                  flash(`QR destination URL for "${cat.name}" copied.`);
                                }}
                                title="Copy URL"
                                className="p-1 rounded hover:bg-surface-subtle text-text-tertiary hover:text-text-primary"
                              >
                                <Icon name="content_copy" className="text-[15px]" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-col text-[12px]">
                              <span className="font-medium text-text-primary">
                                {cat.stats?.scans || 0} scans • {cat.stats?.ordersCount || 0} bookings
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCategory(cat)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-subtle"
                                title="Edit Category"
                              >
                                <Icon name="edit" className="text-[18px]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleArchiveCategory(cat.id, cat.name)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-surface-subtle"
                                title="Archive Category"
                              >
                                <Icon name="archive" className="text-[18px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Services Management */
          <div className="flex flex-col gap-space-md">
            {/* Search and Chips Toolbar */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
              <div className="relative w-full">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search services, SKU, treatments or categories... (⌘K)"
                  className="w-full h-[48px] bg-surface-container-low rounded-xl pl-12 pr-28 text-on-surface font-body-md text-body-md placeholder-text-tertiary outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-space-2xs">
                  <kbd className="px-space-xs py-space-2xs rounded bg-surface-container text-text-secondary font-caption text-caption shadow-xs">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Quick Chips Bar */}
              <div className="flex items-center gap-space-xs overflow-x-auto pb-space-2xs pt-space-2xs">
                {CHIPS.map((entry) => {
                  const active = chip === entry.key;
                  let classes =
                    'px-space-md py-space-2xs rounded-full bg-surface-subtle text-text-secondary hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors cursor-pointer';
                  if (active)
                    classes =
                      'px-space-md py-space-2xs rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold whitespace-nowrap shadow-xs cursor-pointer';
                  else if (entry.tone === 'green')
                    classes =
                      'flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold whitespace-nowrap transition-colors cursor-pointer';
                  else if (entry.tone === 'error')
                    classes =
                      'flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold whitespace-nowrap transition-colors cursor-pointer';
                  return (
                    <button
                      key={entry.key}
                      type="button"
                      onClick={() => setChip(entry.key)}
                      className={classes}
                    >
                      {entry.icon && <Icon name={entry.icon} className="text-[16px]" />}
                      <span>
                        {entry.label}
                        {entry.counted ? ` (${chipCount(entry.key)})` : ''}
                      </span>
                    </button>
                  );
                })}
                <div className="ml-auto pl-space-sm flex items-center gap-space-2xs">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((o) => !o)}
                    className={`flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg font-caption text-caption font-semibold transition-colors ${
                      filtersOpen || activeAdvancedCount > 0
                        ? 'bg-surface-tint-blue text-primary'
                        : 'text-text-secondary hover:text-primary'
                    }`}
                  >
                    <Icon name="tune" className="text-[16px]" />
                    <span>More Filters</span>
                    {activeAdvancedCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[11px] font-bold leading-none">
                        {activeAdvancedCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {filtersOpen && (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between gap-space-sm border-b border-border-subtle pb-space-xs">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="tune" className="text-[18px] text-primary" />
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Filter Services &amp; Schedules
                    </span>
                  </div>
                  {activeAdvancedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setAdvanced(EMPTY_FILTERS)}
                      className="text-primary hover:underline font-label-sm text-label-sm font-semibold"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs">
                  <div>
                    <label className="block text-caption font-semibold text-text-secondary mb-1">
                      Service Category
                    </label>
                    <select
                      value={advanced.category}
                      onChange={(e) => setAdvanced((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full h-9 bg-surface-canvas rounded-lg px-2 text-label-sm text-text-primary border border-border-subtle"
                    >
                      <option value="">All Categories</option>
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-text-secondary mb-1">
                      Publish Status
                    </label>
                    <select
                      value={advanced.status}
                      onChange={(e) => setAdvanced((prev) => ({ ...prev, status: e.target.value as any }))}
                      className="w-full h-9 bg-surface-canvas rounded-lg px-2 text-label-sm text-text-primary border border-border-subtle"
                    >
                      <option value="any">Any Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-text-secondary mb-1">
                      Deal Promotion
                    </label>
                    <select
                      value={advanced.deal}
                      onChange={(e) => setAdvanced((prev) => ({ ...prev, deal: e.target.value as any }))}
                      className="w-full h-9 bg-surface-canvas rounded-lg px-2 text-label-sm text-text-primary border border-border-subtle"
                    >
                      <option value="any">Any</option>
                      <option value="linked">Deal Linked</option>
                      <option value="unlinked">No Deals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-text-secondary mb-1">
                      Booking Sync
                    </label>
                    <select
                      value={advanced.sync}
                      onChange={(e) => setAdvanced((prev) => ({ ...prev, sync: e.target.value as any }))}
                      className="w-full h-9 bg-surface-canvas rounded-lg px-2 text-label-sm text-text-primary border border-border-subtle"
                    >
                      <option value="any">Any</option>
                      <option value="synced">Synced Online</option>
                      <option value="unsynced">Offline / Manual</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions Floating Bar */}
            <BulkActionsBar
              selectedCount={visibleSelectedRows.length}
              filteredCount={visibleRows.length}
              totalCount={serviceRows.length}
              scopeNoun="services"
              actions={bulkActions}
              onApply={applyBulkAction}
              onClearSelection={() => setSelected([])}
              onSelectAllFiltered={toggleAll}
            />

            {/* List / Grid Display */}
            {view === 'list' ? (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-border-subtle">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-subtle bg-surface-subtle/50 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                        <th className="py-3.5 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleAll}
                            className="rounded border-border-subtle text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="py-3.5 px-4">Service &amp; Details</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Pricing</th>
                        <th className="py-3.5 px-4">Branch Availability</th>
                        <th className="py-3.5 px-4">Slot Status</th>
                        <th className="py-3.5 px-4 text-center">Sync Mesh</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-body-sm">
                      {visibleRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16 text-center text-text-tertiary">
                            <Icon name="spa" className="text-[36px] mx-auto mb-2 text-text-tertiary/60" />
                            <p className="font-semibold text-text-secondary">No services found</p>
                            <p className="text-caption mt-1">Try tweaking your search or filter chips.</p>
                          </td>
                        </tr>
                      ) : (
                        visibleRows.map((row) => {
                          const isRowSelected = selected.includes(row.id);
                          const syncOn = sync[row.id] === true;
                          return (
                            <tr
                              key={row.id}
                              className={`hover:bg-surface-subtle/40 transition-colors ${
                                isRowSelected ? 'bg-primary/5' : ''
                              }`}
                            >
                              <td className="py-3.5 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isRowSelected}
                                  onChange={() => toggleRow(row.id)}
                                  className="rounded border-border-subtle text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                                    <img
                                      src={row.image}
                                      alt={row.alt}
                                      className="w-full h-full object-cover"
                                    />
                                    {row.hidden && (
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Icon name="visibility_off" className="text-white text-[16px]" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-on-surface text-label-md">
                                        {row.name}
                                      </span>
                                      {row.verified && (
                                        <Icon name="verified" className="text-badge-discount-text text-[16px]" />
                                      )}
                                      {row.draft && (
                                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-text-secondary font-caption text-[10px] font-bold uppercase">
                                          Draft
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 font-caption text-caption text-text-secondary">
                                      <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded text-[11px]">
                                        {row.sku}
                                      </span>
                                      <span>•</span>
                                      <span className="text-primary font-medium">{row.sub}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                                  <Icon name={row.categoryIcon || 'spa'} className="text-[14px]" />
                                  <span>{row.category}</span>
                                </span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-label-md text-on-surface">
                                      {row.price}
                                    </span>
                                    {row.was && (
                                      <span className="font-caption text-caption text-text-tertiary line-through">
                                        {row.was}
                                      </span>
                                    )}
                                  </div>
                                  {row.dealBadge && (
                                    <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                                      <Icon name="loyalty" className="text-[12px]" />
                                      <span>{row.dealBadge}</span>
                                    </div>
                                  )}
                                  {row.priceNote && (
                                    <span className="font-caption text-caption text-text-secondary block mt-0.5">
                                      {row.priceNote}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div>
                                  <div className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold">
                                    <span className={`w-2 h-2 rounded-full ${BRANCH_DOT[row.branchDot]}`} />
                                    <span>{row.branchLabel}</span>
                                  </div>
                                  <span className="font-caption text-caption text-text-secondary block mt-0.5">
                                    {row.branchNote}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${
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
                                  </div>
                                  {row.stock.units && (
                                    <span className="font-label-sm text-label-sm font-bold block mt-1">
                                      {row.stock.units}
                                    </span>
                                  )}
                                  {row.stock.bar !== undefined && (
                                    <div className="w-24 bg-surface-container rounded-full h-1.5 mt-1 overflow-hidden">
                                      <div
                                        className={`h-1.5 rounded-full ${
                                          row.stock.barTone === 'error' ? 'bg-error' : 'bg-badge-discount-text'
                                        }`}
                                        style={{ width: `${row.stock.bar}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={syncOn}
                                  onClick={() => {
                                    setSync((prev) => {
                                      const next = { ...prev, [row.id]: !prev[row.id] };
                                      persistServices((p) =>
                                        p.map((item) => (item.id === row.id ? { ...item, sync: !prev[row.id] } : item)),
                                      );
                                      return next;
                                    });
                                    flash(`Booking sync ${!syncOn ? 'enabled' : 'disabled'} for "${row.name}".`);
                                  }}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer p-0.5 transition-colors focus:outline-none rounded-full ${
                                    syncOn ? 'bg-primary-container' : 'bg-surface-container-highest'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-canvas shadow ring-0 transition duration-200 ${
                                      syncOn ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1 relative">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditItem(row)}
                                    title="Edit Service"
                                    className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                                  >
                                    <Icon name="edit" className="text-[18px]" />
                                  </button>

                                  <div className="relative">
                                    <button
                                      type="button"
                                      title="More Options"
                                      onClick={() => setActionMenuRowId((cur) => (cur === row.id ? null : row.id))}
                                      className={`p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-on-surface transition-colors ${
                                        actionMenuRowId === row.id ? 'bg-surface-container text-primary' : ''
                                      }`}
                                    >
                                      <Icon name="more_vert" className="text-[18px]" />
                                    </button>

                                    {actionMenuRowId === row.id && (
                                      <div className="absolute right-0 top-full mt-1 w-48 bg-surface-canvas rounded-xl shadow-xl border border-border-subtle py-1.5 z-40 text-left animate-fade-in">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditItem(row)}
                                          className="w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-container flex items-center gap-2 transition-colors"
                                        >
                                          <Icon name="edit" className="text-[16px] text-primary" />
                                          <span>Edit Details</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateItem(row)}
                                          className="w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-container flex items-center gap-2 transition-colors"
                                        >
                                          <Icon name="content_copy" className="text-[16px] text-secondary" />
                                          <span>Duplicate Service</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleToggleHideItem(row)}
                                          className="w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-container flex items-center gap-2 transition-colors"
                                        >
                                          <Icon
                                            name={row.hidden ? 'visibility' : 'visibility_off'}
                                            className="text-[16px] text-text-secondary"
                                          />
                                          <span>{row.hidden ? 'Show on Storefront' : 'Hide from Storefront'}</span>
                                        </button>
                                        <div className="h-[1px] bg-border-subtle my-1" />
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteItem(row)}
                                          className="w-full px-3 py-2 text-xs font-semibold text-error hover:bg-error-container/20 flex items-center gap-2 transition-colors"
                                        >
                                          <Icon name="delete" className="text-[16px] text-error" />
                                          <span>Delete Service</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {visibleRows.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-text-tertiary bg-surface-container-lowest rounded-xl">
                    <Icon name="spa" className="text-[36px] mx-auto mb-2 text-text-tertiary/60" />
                    <p className="font-semibold text-text-secondary">No services found</p>
                    <p className="text-caption mt-1">Try tweaking your search or filter chips.</p>
                  </div>
                ) : (
                  visibleRows.map((row) => {
                    const syncOn = sync[row.id] === true;
                    return (
                      <div
                        key={row.id}
                        className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-border-subtle shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="relative h-44 w-full bg-surface-container overflow-hidden">
                          <img
                            src={row.image}
                            alt={row.alt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-sm text-text-primary text-[11px] font-bold shadow-xs">
                              {row.category}
                            </span>
                            {row.dealBadge && (
                              <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg/95 backdrop-blur-sm text-badge-discount-text text-[11px] font-bold shadow-xs">
                                {row.dealBadge}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs backdrop-blur-sm ${
                                syncOn
                                  ? 'bg-primary-container text-on-primary-container'
                                  : 'bg-surface-canvas/90 text-text-tertiary'
                              }`}
                            >
                              {syncOn ? 'Synced' : 'Manual'}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditItem(row)}
                              className="p-2 rounded-full bg-surface-canvas/90 backdrop-blur-sm text-text-primary hover:text-primary shadow-xs transition-colors"
                              title="Edit Service"
                            >
                              <Icon name="edit" className="text-[16px]" />
                            </button>
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white font-mono text-[11px] font-semibold">
                              {row.sub}
                            </span>
                          </div>
                        </div>

                        <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-on-surface text-label-lg line-clamp-1">
                                {row.name}
                              </h3>
                              {row.verified && (
                                <Icon name="verified" className="text-badge-discount-text text-[18px] shrink-0" />
                              )}
                            </div>
                            <p className="text-caption text-text-secondary mt-1 font-mono text-[11px]">
                              {row.sku} • {row.branchLabel}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-space-xs border-t border-border-subtle">
                            <div>
                              <span className="font-caption text-caption text-text-secondary block">Price</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-heading-sm text-on-surface">
                                  {row.price}
                                </span>
                                {row.was && (
                                  <span className="text-caption text-text-tertiary line-through">
                                    {row.was}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenEditItem(row)}
                              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-caption transition-colors flex items-center gap-1"
                            >
                              <Icon name="settings" className="text-[16px]" />
                              <span>Manage</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Category Add/Edit Modal */}
        {categoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface-canvas rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-border-subtle animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle">
                <h3 className="font-bold text-on-surface text-label-lg">
                  {categoryModal.mode === 'add' ? 'Create Service Category' : 'Edit Service Category'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCategoryModal(null)}
                  className="p-1 rounded-lg text-text-tertiary hover:text-text-primary"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-caption font-semibold text-text-secondary mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={catFormName}
                    onChange={(e) => setCatFormName(e.target.value)}
                    placeholder="e.g. Wellness Massages & Aromatherapy"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface-subtle text-text-primary text-label-md focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-caption font-semibold text-text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={catFormDesc}
                    onChange={(e) => setCatFormDesc(e.target.value)}
                    placeholder="Brief description for clients browsing booking packages..."
                    className="w-full p-3 rounded-xl border border-border bg-surface-subtle text-text-primary text-label-md focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <CategoryImageField
                  value={catFormImage}
                  onChange={setCatFormImage}
                />

                <div>
                  <label className="block text-caption font-semibold text-text-secondary mb-2">
                    Category Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      'spa',
                      'self_improvement',
                      'face',
                      'content_cut',
                      'brush',
                      'table_restaurant',
                      'room_service',
                      'water_drop',
                      'health_and_safety',
                      'fitness_center',
                      'clean_hands',
                      'hot_tub',
                    ].map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setCatFormIcon(iconName)}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                          catFormIcon === iconName
                            ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                            : 'border-border bg-surface-subtle text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Icon name={iconName} className="text-[20px]" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setCategoryModal(null)}
                    className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm"
                  >
                    {categoryModal.mode === 'add' ? 'Create Category' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl border border-outline-variant animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
            <span className="font-label-md text-label-md font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Bulk Delete Confirm */}
        <ConfirmActionDialog
          open={bulkDelete !== null}
          onClose={() => setBulkDelete(null)}
          onConfirm={confirmBulkDelete}
          tone="danger"
          title={`Delete ${bulkDelete?.count ?? 0} service${bulkDelete?.count === 1 ? '' : 's'}?`}
          message={`This permanently removes ${bulkDelete?.count ?? 0} selected service${
            bulkDelete?.count === 1 ? '' : 's'
          } from your booking catalogue.`}
          confirmLabel={`Delete ${bulkDelete?.count ?? 0} service${bulkDelete?.count === 1 ? '' : 's'}`}
        />
      </div>
    </MerchantShell>
  );
}
