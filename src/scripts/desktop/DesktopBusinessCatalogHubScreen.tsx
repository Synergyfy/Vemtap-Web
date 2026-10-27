import { useEffect, useMemo, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { useCatalogueItemMutations, useCatalogueItems } from '../../hooks/business/useCatalogueItems';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { productDraftToInput, serviceDraftToInput, toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { formatNaira } from '../../utils/format';
import { useCatalogueCategories, useCategoryMutation } from '../../hooks/business/useCatalogueCategories';
import { useStorefrontPreview } from '../../hooks/business/useStorefrontPreview';
import { uploadDataUrlImage } from '../../services/uploadService';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { DesktopAddProductStep1Screen } from './DesktopAddProductStep1Screen';
import { DesktopAddProductStep2Screen } from './DesktopAddProductStep2Screen';
import { DesktopAddProductImageScreen } from './DesktopAddProductImageScreen';
import { DesktopAddProductStep3Screen } from './DesktopAddProductStep3Screen';
import { DesktopProductReviewScreen } from './DesktopProductReviewScreen';
import { DesktopProductPublishedScreen } from './DesktopProductPublishedScreen';
import { DesktopProductPricingConfigScreen } from './DesktopProductPricingConfigScreen';
import { BLANK_PRODUCT_DRAFT, INITIAL_PRODUCT_DRAFT, type ProductDraft } from './desktopProductDraft';
import { DesktopAddServiceStep1Screen } from './DesktopAddServiceStep1Screen';
import { DesktopAddServiceStep2Screen } from './DesktopAddServiceStep2Screen';
import { DesktopAddServiceStep3Screen } from './DesktopAddServiceStep3Screen';
import { DesktopServiceReviewScreen } from './DesktopServiceReviewScreen';
import { DesktopServicePublishedScreen } from './DesktopServicePublishedScreen';
import { BLANK_SERVICE_DRAFT, INITIAL_SERVICE_DRAFT, type ServiceDraft } from './desktopServiceDraft';
import { getBusinessSetupSnapshot } from '../businessSetup';
import { classifyServiceFromBusiness } from '../serviceClassification';
import type { BusinessProfileDraft } from './DesktopBusinessOnboardingScreen';
import {
  getCentralCategories,
  getCategoryImageByName,
  addCentralCategory,
  updateCentralCategory,
  archiveCentralCategory,
  type CentralCategory,
} from '../catalogueData';
import { AddProductMethodsDialog } from '../../components/import/AddProductMethodsDialog';
import { CategoryImageField } from '../../components/CategoryImageField';
import { ProductImportWizard } from '../../components/import/ProductImportWizard';
import { ImportedProductsReview } from '../../components/import/ImportedProductsReview';
import { BulkActionsBar, type BulkAction } from '../../components/BulkActionsBar';
import { ConfirmActionDialog } from '../../components/ConfirmActionDialog';
import {
  publishImportedProducts,
  removeImportedProducts,
  resolveProductDisplayImage,
  setImportedLinkedDeal,
  unpublishImportedProducts,
  useImportedProducts,
} from '../productImport/importedProductStore';
import { summariseImport } from '../productImport/importSummary';
import { naira } from '../catalogueData';
import type { ImportedProduct } from '../productImport/importTypes';

interface DesktopBusinessCatalogHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  /** Live: receives the item whose branch prices to edit. */
  onOpenBranchPricing?: (itemId?: string) => void;
  onOpenServices?: () => void;
  /** Live: start a deal for this real item. */
  onMakeDeal?: (item: CatalogueItem) => void;
  /** A message to show once when the screen opens (e.g. "pick an item"). */
  notice?: string | null;
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

/* ------------------------------------------------------------------ *
 * "More Filters" panel — narrow the list beyond the quick chips
 * ------------------------------------------------------------------ */

type AdvancedStatus = 'any' | 'published' | 'draft' | 'hidden';
type AdvancedStock = 'any' | 'in' | 'out' | 'unset';
type AdvancedDeal = 'any' | 'linked' | 'unlinked';
type AdvancedSync = 'any' | 'synced' | 'unsynced';

interface CatalogAdvancedFilters {
  /** '' means every category — kept as one dropdown rather than a chip list. */
  category: string;
  status: AdvancedStatus;
  stock: AdvancedStock;
  deal: AdvancedDeal;
  sync: AdvancedSync;
}

const EMPTY_ADVANCED_FILTERS: CatalogAdvancedFilters = {
  category: '',
  status: 'any',
  stock: 'any',
  deal: 'any',
  sync: 'any',
};

function countActiveAdvancedFilters(advanced: CatalogAdvancedFilters): number {
  return (
    (advanced.category === '' ? 0 : 1) +
    (advanced.status === 'any' ? 0 : 1) +
    (advanced.stock === 'any' ? 0 : 1) +
    (advanced.deal === 'any' ? 0 : 1) +
    (advanced.sync === 'any' ? 0 : 1)
  );
}

/**
 * Applies the "More Filters" panel to one row. `isSynced` is injected because
 * terminal sync lives in component state, not on the row model.
 */
function rowMatchesAdvancedFilters(
  row: CatalogRow,
  advanced: CatalogAdvancedFilters,
  isSynced: boolean,
): boolean {
  if (advanced.category !== '' && row.category !== advanced.category) return false;
  if (advanced.status === 'published' && !(row.filters.includes('published') && row.draft !== true)) return false;
  if (advanced.status === 'draft' && row.draft !== true) return false;
  if (advanced.status === 'hidden' && row.hidden !== true) return false;
  if (advanced.stock === 'in' && row.stock.tone !== 'ok') return false;
  if (advanced.stock === 'out' && row.stock.tone !== 'error') return false;
  if (advanced.stock === 'unset' && row.stock.tone !== 'off') return false;
  if (advanced.deal === 'linked' && !row.filters.includes('deals')) return false;
  if (advanced.deal === 'unlinked' && row.filters.includes('deals')) return false;
  if (advanced.sync === 'synced' && !isSynced) return false;
  if (advanced.sync === 'unsynced' && isSynced) return false;
  return true;
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

const SERVICES_ROWS: CatalogRow[] = [
  {
    id: 's1',
    name: 'Moroccan Hammam & Body Glow Polish',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4wRhk7Z2awcljAxG1LjsDB3N2bAN7rQlDkEXDILlYF6i09D_DE0_JDmPFddvIXLKfZ-TtuSypTz0Kl3jUy7knUpU3HB4NuSb137foMDpgotXoiK7w3GVbU1FRlvDkCRSfNt7lLHtinSDkQaVQwt40lHDAj3DUxzf9tBWYtOf7qlTY-_mE9_3gDNIH9wVJF72-OJb0k0sqg-vLThSLsh7dq90yBqvw9fzIB1gXV-Fo2ZXSueR6oLefog',
    alt: 'Luxury aesthetic spa suite with aromatic bath, warm candlelight and natural stone therapy.',
    verified: true,
    sku: 'VG-SRV-01',
    sub: '75 min session',
    category: 'Spa & Wellness',
    categoryIcon: 'spa',
    price: '₦28,000',
    was: '₦35,000',
    dealBadge: '20% Off Perk',
    branchDot: 'ok',
    branchLabel: 'All 3 Branches',
    branchNote: 'Private Suites Available',
    stock: { tone: 'ok', label: 'Slots Open Today', units: '6 slots available', bar: 75, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'deals'],
  },
  {
    id: 's2',
    name: 'Aromatherapy Deep Muscle Release',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2k-0GygPR7thrr6kQT5yTqoGDw0NcxF2dP0AlXRwce_9v75rvKjTFCOII2nYkQknciVnh52IMyXZtpFEzCOC6Sc0ZFQf8bwDaVJM2likf3N9H6Yf4CtRNeAYa6jwXLogctOB85hy8oxyDnz-IvnlOo7GjU_Ij8kfKJBzE9Lqhpjxks9aQ7vHEEYWcFEkDqE1E9UzAJhRl3UfANQ6pD0rmV-2EbDY3S2bIgoQ14Il52tS12xywmcy8cw',
    alt: 'Therapeutic warm botanical oil massage session with organic aromatherapy essence.',
    sku: 'VG-SRV-02',
    sub: '60 min session',
    category: 'Massage & Therapy',
    categoryIcon: 'self_improvement',
    price: '₦22,500',
    priceNote: 'Therapist Choice',
    branchDot: 'ok',
    branchLabel: 'Wuse & Maitama Only',
    branchNote: '2 branches active',
    stock: { tone: 'ok', label: 'Available', units: '9 slots open', bar: 60, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published'],
  },
  {
    id: 's3',
    name: 'Signature HydraFacial & Collagen Boost',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6BaZG7YzMbQArQWnt4edHnV9aCqK3a7xIIh-c8OV4tFJBToZ7tcF2Nlpag653DPDvv1YwAEFvyZWLEWjhh3JKXPU_39La5FCCObsJ2bXVvYHYwRfdfbXPyrgvSgRX4XxMhc27qVEA_iTG43lTtzd34YcQozjDBHcuV7C7GWsm1WeMhPRtYcC2-I3NREV_8QfVRodpcjS7DvAGEn1vrjQohXldZ8Ghr28n4UXThhCL24s-z5spmv5Wbg',
    alt: 'Dermatological medical-grade facial rejuvenation treatment with ultrasonic infusion.',
    sku: 'VG-SRV-03',
    sub: '45 min session',
    category: 'Skin & Aesthetics',
    categoryIcon: 'face',
    price: '₦35,000',
    priceNote: 'Includes LED Light Therapy',
    branchDot: 'ok',
    branchLabel: 'All 3 Branches',
    branchNote: 'Certified Aesthetician',
    stock: { tone: 'ok', label: 'Available', units: '4 slots left', bar: 40, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published', 'low'],
  },
  {
    id: 's4',
    name: 'Executive Precision Haircut & Beard Sculpt',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO6jJ9p4hR6rNGDGRINEHScNzfF8QX9958juImpMv7docBzJhIFFTSv0EqqohPlk21qedzh0yj6VoV4ENinMd8PtWdjbgLvTNyW6DzMNzVWBBdNwnHXR5xFauu5gHS1bVOzDmta7grAM4POxOXeEhzPSB90eU3jwqP8X35nF3AyPhKakI43tDrWub1fzx-gNhATtVwdkcjO3Hjz7arXt2eY8pvnSwKjc_HdpZEuUQH_y3nRojTdPeUQg',
    alt: 'Gentleman luxury grooming salon session with hot towel and beard oil balm.',
    sku: 'VG-SRV-04',
    sub: '40 min session',
    category: 'Grooming & Barber',
    categoryIcon: 'content_cut',
    price: '₦8,500',
    priceChip: 'Hot Towel Incl.',
    branchDot: 'ok',
    branchLabel: 'All Branches',
    branchNote: 'Walk-ins & Bookings',
    stock: { tone: 'ok', label: 'Walk-in & Bookings', units: 'Barbers on Duty', bar: 85, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published'],
  },
  {
    id: 's5',
    name: 'Russian Manicure & Gel Polish Duo',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6trtXFp0MMJwWku9jLYDwdIp28fGzHTmDO0RUE47jOl9iydBvF7jC1uRok91vQ_a6YHaxw4BDUNnwjZjepIJqde7592zFopV-N30aLGLAkzyvljtnJ1fLl5Pxy_BHumGgYbahvqugs4Q1hW9TTACnFpjlk5pxuNHrRFbxC07olPXnXlN-PrXlK9_FwVnZsQcJzb-TwkpEm5q383Eftusf4vv5jvGGhsBKrpbEAYulvhhXJvoaQRairA',
    alt: 'Impeccable clean e-file manicure with glossy long-lasting nude gel coat.',
    sku: 'VG-SRV-05',
    sub: '60 min session',
    category: 'Nails & Beauty',
    categoryIcon: 'brush',
    price: '₦15,000',
    branchDot: 'ok',
    branchLabel: 'All Branches',
    branchNote: 'Choice of 120+ Gel Colors',
    stock: { tone: 'ok', label: 'Slots Open', units: 'Nail Artists Available', bar: 90, barTone: 'ok' },
    sync: true,
    filters: ['all', 'published'],
  },
  {
    id: 's6',
    name: 'Swedish Relaxation Full Body Massage',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcpJ2c7dvjW1lzsXtOkizM9pbVdGGWEiMmh1UyBM6Qyd_a7HJHN9pYrI0s4OC7t1D52fmKiwCl0_EW9Qugz_jyIIIXo0L3JfccsRlSlOmwgv2C6MkI2vnSFj1ji-q5FQ6Yqs8YUeIiIe1jQ5hpZL4naxtfledRh2j3Nq1C5E6wUF9iHI6e5wVcRvSUF_gX7hELTdOD8VEpNtx8S93rNUj1Z-0YH06xP2fKgi9-dccpqRQVrf3449_Eig',
    alt: 'Gentle long stroke swedish therapeutic body session with heated calming stones.',
    draft: true,
    hidden: true,
    sku: 'VG-SRV-06',
    sub: '60 min session',
    category: 'Massage & Therapy',
    categoryIcon: 'spa',
    price: '₦18,000',
    branchDot: 'tertiary',
    branchLabel: 'Maitama Flagship Only',
    branchNote: 'Draft launch scheduled',
    stock: { tone: 'off', label: 'Unpublished Draft', note: 'Configuring room schedules' },
    sync: false,
    filters: ['all'],
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

const CHIPS: Array<{ key: CatalogChip; label: string; icon?: string; tone?: 'green' | 'error'; counted?: boolean }> = [
  { key: 'all', label: 'All', counted: true },
  { key: 'published', label: 'Active & Published', counted: true },
  { key: 'deals', label: 'Deal Linked', icon: 'percent', tone: 'green', counted: true },
  { key: 'low', label: 'Low Stock', icon: 'priority_high', tone: 'error', counted: true },
  { key: 'dinein', label: 'Dine-In' },
  { key: 'takeaway', label: 'Takeaway' },
  { key: 'oos', label: 'Out of Stock' },
];

const BRANCH_DOT: Record<CatalogRow['branchDot'], string> = {
  ok: 'bg-badge-discount-text',
  secondary: 'bg-secondary',
  tertiary: 'bg-text-tertiary',
};

const ITEM_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23eef2ff'/></svg>";

/** A live catalogue item in the hub's row shape. */
function itemToRow(item: CatalogueItem): CatalogRow {
  const isService = item.itemType === 'service';
  const price = toPrice(item.price ?? undefined);
  const was = toPrice(item.compareAtPrice ?? undefined);
  const stock = item.stockQuantity ?? null;
  const low = stock !== null && item.minStock !== null && item.minStock !== undefined && stock <= item.minStock;
  const published = item.status === 'active' || item.status === 'published';
  const branchCount = item.branches?.length ?? 1;
  return {
    id: item.id,
    name: item.name,
    image: item.mainImage || ITEM_PLACEHOLDER,
    alt: item.name,
    draft: !published,
    hidden: item.isSuspended === true,
    sku: item.sku || '—',
    sub: isService ? item.duration || 'Service' : item.shortDescription || 'Product',
    category: item.category?.name || 'Uncategorised',
    categoryIcon: isService ? 'spa' : 'inventory_2',
    price: price !== undefined ? formatNaira(price) : '—',
    was: was !== undefined && price !== undefined && was > price ? formatNaira(was) : undefined,
    branchDot: 'ok',
    branchLabel: `${branchCount} ${branchCount === 1 ? 'branch' : 'branches'}`,
    branchNote: published ? 'Live on storefront & POS' : `Status: ${item.status}`,
    stock: isService
      ? { tone: 'ok', label: item.isBookable ? 'Bookable' : 'Not bookable' }
      : stock === null
        ? { tone: 'off', label: 'Not tracked' }
        : stock <= 0
          ? { tone: 'error', label: 'Out of stock', units: '0 units', unitsTone: 'error' }
          : { tone: low ? 'error' : 'ok', label: low ? 'Low stock' : 'In Stock', units: `${stock} units`, unitsTone: low ? 'error' : 'default' },
    sync: published,
    filters: [
      'all',
      ...(published ? (['published'] as CatalogChip[]) : []),
      ...(low ? (['low'] as CatalogChip[]) : []),
      ...(stock === 0 ? (['oos'] as CatalogChip[]) : []),
    ],
  };
}

/** Maps a bulk-imported product (store record) onto a catalogue list row. */
function importedProductToRow(product: ImportedProduct): CatalogRow {
  const onSale = product.salePrice !== null && product.price !== null && product.salePrice < product.price;
  // Own image first; category image only as a fallback, resolved live so
  // category edits propagate (never copied onto the product).
  const image = resolveProductDisplayImage(product, getCategoryImageByName) ?? ROWS[0].image;
  const baseFilters: CatalogChip[] = product.status === 'published' ? ['all', 'published'] : ['all'];
  return {
    id: product.id,
    name: product.name || 'Untitled imported product',
    image,
    alt: product.description || product.name || 'Imported product',
    draft: product.status === 'draft',
    hidden: product.status === 'draft',
    dimmed: product.needsReview,
    sku: product.sku || '—',
    sub: product.unit || 'Imported item',
    category: product.category || 'General',
    categoryIcon: 'storefront',
    price: product.price !== null ? naira(onSale ? (product.salePrice as number) : product.price) : '—',
    was: onSale && product.price !== null ? naira(product.price) : undefined,
    priceNote: product.status === 'draft' ? 'Imported draft — publish when ready' : 'Imported product',
    branchDot: 'ok',
    branchLabel: 'All 3 Branches',
    branchNote: product.status === 'draft' ? 'Draft until published' : 'Active in POS & Storefront',
    stock:
      product.stock !== null
        ? {
            tone: product.stock <= 0 ? 'error' : 'ok',
            label: product.stock <= 0 ? 'Out of Stock' : 'In Stock',
            units: `${product.stock} ${product.unit || 'units'}`,
            unitsTone: product.stock <= 5 ? 'error' : 'default',
          }
        : { tone: 'off', label: 'Stock not set' },
    sync: product.status === 'published',
    filters: product.linkedDeal ? [...baseFilters, 'deals'] : baseFilters,
    dealBadge: product.linkedDeal ? 'Deal Linked' : undefined,
  };
}

/** Bulk-imported rows are backed by the imported-product store, not local row state. */
const isImportedRow = (id: string) => id.startsWith('imp_');

/**
 * Flips a locally-held catalogue row between published and draft, mirroring the
 * semantics bulk-imported products already have (a draft is unpublished and
 * hidden; publishing makes it live again).
 *
 * Only copy that literally advertises itself as unpublished is repaired on the
 * way back — real stock counts and branch notes are never overwritten or
 * invented.
 */
function withPublishState(row: CatalogRow, publish: boolean): CatalogRow {
  if (publish) {
    const placeholderStock = row.stock.label === 'Unpublished / Draft';
    const placeholderBranch = row.branchNote === 'Draft deployment ready';
    return {
      ...row,
      draft: false,
      hidden: false,
      dimmed: false,
      sync: true,
      filters: row.filters.includes('published') ? row.filters : [...row.filters, 'published'],
      stock: placeholderStock ? { tone: 'off', label: 'Stock not set' } : row.stock,
      branchDot: placeholderBranch ? 'ok' : row.branchDot,
      branchNote: placeholderBranch ? 'Active in POS & Storefront' : row.branchNote,
    };
  }
  return {
    ...row,
    draft: true,
    hidden: true,
    dimmed: true,
    sync: false,
    filters: row.filters.filter((entry) => entry !== 'published'),
  };
}

/**
 * Links or unlinks a locally-held catalogue row to a deal. Deal terms are
 * configured in the Deals workspace — this only records the link, which is
 * what the "Deal Linked" chip filters on.
 */
function withDealLinked(row: CatalogRow, linked: boolean): CatalogRow {
  const alreadyLinked = row.filters.includes('deals');
  if (alreadyLinked === linked) return row;
  return {
    ...row,
    filters: linked ? [...row.filters, 'deals'] : row.filters.filter((entry) => entry !== 'deals'),
    // Keep an existing badge; only brand newly-linked rows with a neutral one.
    dealBadge: linked ? (row.dealBadge ?? 'Deal Linked') : undefined,
  };
}

export function DesktopBusinessCatalogHubScreen({
  onNav,
  onOpenBranchPricing,
  onOpenServices: _onOpenServices,
  onMakeDeal,
  notice,
}: DesktopBusinessCatalogHubScreenProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'categories'>('products');
  // Live: rows come from `/catalogue/items` for the active branch; demo keeps the sample rows.
  const live = hasApiConfig();
  const { activeBranchId, branches } = useBusinessBranch();
  const productItems = useCatalogueItems('product');
  const serviceItems = useCatalogueItems('service');
  const itemMutations = useCatalogueItemMutations();
  const [productRows, setProductRows] = useState<CatalogRow[]>(live ? [] : ROWS);
  const [serviceRows, setServiceRows] = useState<CatalogRow[]>(live ? [] : SERVICES_ROWS);
  useEffect(() => {
    if (live && productItems.data) setProductRows(productItems.data.map(itemToRow));
  }, [live, productItems.data]);
  useEffect(() => {
    if (live && serviceItems.data) setServiceRows(serviceItems.data.map(itemToRow));
  }, [live, serviceItems.data]);
  const liveCategories = useCatalogueCategories();
  const importedProducts = useImportedProducts();
  const importedRows = useMemo(() => importedProducts.map(importedProductToRow), [importedProducts]);
  /** Imported products still awaiting review/publish. */
  const draftImportCount = useMemo(
    () => (live ? 0 : importedProducts.filter((product) => product.status === 'draft').length),
    [importedProducts, live],
  );
  /** Seed rows + bulk-imported products (imported ones render first). Live: server items only. */
  const allProductRows = useMemo(() => (live ? productRows : [...importedRows, ...productRows]), [importedRows, productRows, live]);
  const [demoCategories, setCentralCategories] = useState<CentralCategory[]>(() => getCentralCategories());
  // Live: the business's own categories with real item counts; demo keeps the sample set.
  const categoryMutation = useCategoryMutation();
  const storefront = useStorefrontPreview();
  const liveCatalogueItems = [...(productItems.data ?? []), ...(serviceItems.data ?? [])];
  const centralCategories: CentralCategory[] = live
    ? (liveCategories.data ?? []).map((category) => {
        const items = liveCatalogueItems.filter((item) => item.categoryId === category.id || item.category?.id === category.id);
        const kind = category.kind ?? (items.some((item) => item.itemType === 'service') ? 'service' : 'product');
        return {
          id: category.id,
          name: category.name,
          slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          type: kind,
          description: category.description ?? '',
          icon: category.icon ?? (kind === 'service' ? 'spa' : 'category'),
          image: category.imageUrl ?? undefined,
          productCount: items.length,
          activeBranches: ['all'],
          qrDestinationUrl: storefront.publicUrl ? `${storefront.publicUrl}?category=${category.id}` : '',
          // No per-category scan or order data exists yet; the table shows "—" live.
          stats: { scans: 0, uniqueScans: 0, ordersCount: 0, unitsOrdered: 0, totalRevenue: 0 },
        };
      })
    : demoCategories;
  const categoryLink = (cat: CentralCategory) =>
    /^https?:/.test(cat.qrDestinationUrl) ? cat.qrDestinationUrl : window.location.origin + cat.qrDestinationUrl;
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryModal, setCategoryModal] = useState<{
    mode: 'add' | 'edit';
    category?: CentralCategory;
  } | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormType, setCatFormType] = useState<'product' | 'service'>('product');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catFormIcon, setCatFormIcon] = useState('restaurant');
  /** Optional category image (data URL), same storage approach as ServiceImageUploader. */
  const [catFormImage, setCatFormImage] = useState('');

  const handleOpenAddCategory = () => {
    setCatFormName('');
    setCatFormType('product');
    setCatFormDesc('');
    setCatFormIcon('restaurant');
    setCatFormImage('');
    setCategoryModal({ mode: 'add' });
  };

  const handleOpenEditCategory = (cat: CentralCategory) => {
    setCatFormName(cat.name);
    setCatFormType(cat.type);
    setCatFormDesc(cat.description);
    setCatFormIcon(cat.icon);
    setCatFormImage(cat.image ?? '');
    setCategoryModal({ mode: 'edit', category: cat });
  };

  /** Live: upload the image (if new), then create or update the category. */
  const saveLiveCategory = async () => {
    const name = catFormName.trim();
    try {
      const imageUrl = catFormImage ? await uploadDataUrlImage(catFormImage, 'category') : undefined;
      const details = { kind: catFormType, description: catFormDesc.trim(), icon: catFormIcon, ...(imageUrl ? { imageUrl } : {}) };
      if (categoryModal?.mode === 'edit' && categoryModal.category) {
        await categoryMutation.mutateAsync({ type: 'update', id: categoryModal.category.id, name, details });
        setToastMessage(`Category "${name}" updated successfully.`);
      } else {
        await categoryMutation.mutateAsync({ type: 'create', name, details });
        setToastMessage(`Category "${name}" created successfully.`);
      }
      setCategoryModal(null);
    } catch (error) {
      setToastMessage(apiErrorMessage(error, 'Could not save the category.'));
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) return;
    if (live) {
      void saveLiveCategory();
      return;
    }
    if (categoryModal?.mode === 'add') {
      const slug = catFormName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      addCentralCategory({
        id: slug,
        name: catFormName.trim(),
        slug,
        type: catFormType,
        description: catFormDesc.trim() || `${catFormName.trim()} selections`,
        icon: catFormIcon,
        image: catFormImage || undefined,
        productCount: 0,
        activeBranches: ['all'],
        qrDestinationUrl: `/business/urban-grill-bistro-104/products?category=${slug}`,
      });
      setCentralCategories(getCentralCategories());
      setToastMessage(`Category "${catFormName.trim()}" created successfully.`);
    } else if (categoryModal?.mode === 'edit' && categoryModal.category) {
      updateCentralCategory(categoryModal.category.id, {
        name: catFormName.trim(),
        type: catFormType,
        description: catFormDesc.trim(),
        icon: catFormIcon,
        // Explicitly write the (possibly emptied) image so "Remove" persists.
        image: catFormImage || undefined,
      });
      setCentralCategories(getCentralCategories());
      setToastMessage(`Category "${catFormName.trim()}" updated successfully.`);
    }
    setCategoryModal(null);
  };

  const handleArchiveCategory = (id: string, name: string) => {
    if (live) {
      categoryMutation.mutate(
        { type: 'remove', id },
        {
          onSuccess: () => setToastMessage(`Category "${name}" removed. Its items are kept, uncategorised.`),
          onError: (error) => setToastMessage(apiErrorMessage(error, 'Could not remove the category.')),
        },
      );
      return;
    }
    archiveCentralCategory(id);
    setCentralCategories(getCentralCategories());
    setToastMessage(`Category "${name}" archived.`);
  };

  const filteredCategories = centralCategories
    .filter((c) => {
      if (categoryTypeFilter === 'all') return true;
      return c.type === categoryTypeFilter;
    })
    .filter((c) => {
      if (!categorySearchQuery.trim()) return true;
      const q = categorySearchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    });

  const [subFlow, setSubFlow] = useState<
    | 'none'
    | 'addProduct1'
    | 'addProduct2'
    | 'addProductImage'
    | 'addProduct3'
    | 'productReview'
    | 'productPricingConfig'
    | 'productPublished'
    | 'importReview'
    | 'service1'
    | 'service2'
    | 'service3'
    | 'serviceReview'
    | 'servicePublished'
  >('none');
  const [addMethodsOpen, setAddMethodsOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);

  const businessSnapshot = getBusinessSetupSnapshot();
  const businessDraft = businessSnapshot?.data.draft as BusinessProfileDraft | undefined;
  const businessCategories = businessDraft?.categories ?? [];
  const businessSubcategories = businessDraft?.tags ?? [];

  const getInitialServiceDraft = (): ServiceDraft => {
    const base = live ? BLANK_SERVICE_DRAFT : INITIAL_SERVICE_DRAFT;
    const classification = classifyServiceFromBusiness(businessCategories, businessSubcategories);
    if (classification) {
      return {
        ...base,
        primaryCategory: classification.primaryCategory,
        subCategory: classification.subCategory,
      };
    }
    return { ...base };
  };

  const [productDraft, setProductDraft] = useState<ProductDraft>({ ...(live ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT) });
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(getInitialServiceDraft);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // When set, the add-product/add-service flow is being used to edit this existing row.
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<CatalogChip>('all');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selected, setSelected] = useState<string[]>([]);
  /** Set while a bulk Delete is waiting for confirmation. */
  const [bulkDelete, setBulkDelete] = useState<{ ids: string[]; count: number } | null>(null);
  /** "More Filters" panel state — combined with the quick chips and search. */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advanced, setAdvanced] = useState<CatalogAdvancedFilters>(EMPTY_ADVANCED_FILTERS);
  const [sync, setSync] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...ROWS, ...SERVICES_ROWS].map((row) => [row.id, row.sync])),
  );
  // Live rows bring their own published state into the Terminal Sync switches.
  useEffect(() => {
    if (!live) return;
    setSync((prev) => ({ ...prev, ...Object.fromEntries([...productRows, ...serviceRows].map((row) => [row.id, row.sync])) }));
  }, [live, productRows, serviceRows]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /** The item just published, so its "Make a deal" can start from it. */
  const [lastPublished, setLastPublished] = useState<CatalogueItem | null>(null);
  const makeDealFromPublished = () => {
    if (live && lastPublished && onMakeDeal) return onMakeDeal(lastPublished);
    onNav('deals');
  };

  /** Live publish: create or update the item, then refresh the list from the API. */
  const publishLive = (kind: 'product' | 'service') => {
    if (!activeBranchId) return showToast('Choose a branch first.');
    const input = kind === 'product' ? productDraftToInput(productDraft, activeBranchId) : serviceDraftToInput(serviceDraft, activeBranchId);
    if (!input.name) return showToast(`Give the ${kind} a name first.`);
    const done = (name: string, edited: boolean) => {
      setEditingRowId(null);
      if (edited) {
        setSubFlow('none');
        showToast(`"${name}" updated.`);
      } else {
        setSubFlow(kind === 'product' ? 'productPublished' : 'servicePublished');
      }
    };
    const onError = (error: unknown) => showToast(planErrorMessage(error) ?? apiErrorMessage(error, `Could not save the ${kind}.`));
    if (editingRowId) {
      itemMutations.update.mutate({ id: editingRowId, input }, { onSuccess: () => done(input.name, true), onError });
    } else {
      itemMutations.create.mutate(input, {
        onSuccess: (created) => {
          setLastPublished(created);
          done(input.name, false);
        },
        onError,
      });
    }
  };

  const handlePublishProduct = () => {
    if (live) return publishLive('product');
    const isEdit = Boolean(editingRowId);
    const updatedFields = {
      name: productDraft.title || 'New Product Item',
      alt: productDraft.title || 'Product Item',
      sku: productDraft.sku || `VG-PROD-${Math.floor(10 + Math.random() * 90)}`,
      sub: productDraft.classification || 'Retail Product',
      category: productDraft.primaryCategory || 'General',
      price: productDraft.basePrice ? `₦${Number(productDraft.basePrice).toLocaleString('en-US')}` : '₦5,000',
      was: productDraft.comparePrice ? `₦${Number(productDraft.comparePrice).toLocaleString('en-US')}` : undefined,
      dealBadge: productDraft.comparePrice ? 'Special Deal' : undefined,
    };
    if (isEdit) {
      setProductRows((prev) =>
        prev.map((item) => (item.id === editingRowId ? { ...item, ...updatedFields } : item)),
      );
      setEditingRowId(null);
      setSubFlow('none');
      setToastMessage(`"${updatedFields.name}" updated successfully.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const newRow: CatalogRow = {
      id: `p_${Date.now()}`,
      ...updatedFields,
      image: ROWS[0].image,
      categoryIcon: 'storefront',
      branchDot: 'ok',
      branchLabel: 'All 3 Branches',
      branchNote: 'Active in POS & Storefront',
      stock: {
        tone: 'ok',
        label: 'In Stock',
        units: '50 units ready',
        bar: 80,
        barTone: 'ok',
      },
      sync: true,
      filters: ['all', 'published', 'dinein'],
    };
    setProductRows((prev) => [newRow, ...prev]);
    setSync((prev) => ({ ...prev, [newRow.id]: true }));
    setSubFlow('productPublished');
  };

  const handlePublishService = () => {
    if (live) return publishLive('service');
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
      setServiceRows((prev) =>
        prev.map((item) => (item.id === editingRowId ? { ...item, ...updatedFields } : item)),
      );
      setEditingRowId(null);
      setSubFlow('none');
      setToastMessage(`"${updatedFields.name}" updated successfully.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const newServiceRow: CatalogRow = {
      id: `s_${Date.now()}`,
      ...updatedFields,
      image: SERVICES_ROWS[0].image,
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
      filters: ['all', 'published'],
    };
    setServiceRows((prev) => [newServiceRow, ...prev]);
    setSync((prev) => ({ ...prev, [newServiceRow.id]: true }));
    setSubFlow('servicePublished');
  };

  const handleExportCSV = () => {
    const currentList = activeTab === 'products' ? allProductRows : serviceRows;
    const headers = ['ID', 'SKU', 'Name', 'Category', 'Price', 'Was Price', 'Branches', 'Stock Status', 'Units', 'Terminal Sync'];
    const csvRows = [
      headers.join(','),
      ...currentList.map((row) =>
        [
          JSON.stringify(row.id),
          JSON.stringify(row.sku),
          JSON.stringify(row.name),
          JSON.stringify(row.category),
          JSON.stringify(row.price),
          JSON.stringify(row.was || ''),
          JSON.stringify(row.branchLabel),
          JSON.stringify(row.stock.label),
          JSON.stringify(row.stock.units || row.stock.note || ''),
          JSON.stringify(sync[row.id] ? 'Yes' : 'No'),
        ].join(','),
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vemtap_${activeTab}_catalog.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(`Exported ${currentList.length} ${activeTab} items to CSV`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Item Action & Edit State
  const [actionMenuRowId, setActionMenuRowId] = useState<string | null>(null);

  // Leaving the add/edit sub-flows must always return to the catalog list.
  const exitSubFlow = () => {
    setEditingRowId(null);
    setSubFlow('none');
  };

  const parseAmount = (value: string) => value.replace(/[^0-9.]/g, '');

  // "Edit" reopens the full add-product / add-service flow, prefilled with the row's data,
  // so every component (basics, pricing, fulfillment, review) stays editable.
  const liveItem = (id: string) => [...(productItems.data ?? []), ...(serviceItems.data ?? [])].find((item) => item.id === id);
  const isServiceRow = (row: CatalogRow) => (live ? serviceRows.some((r) => r.id === row.id) : row.id.startsWith('s'));

  const handleOpenEditItem = (row: CatalogRow) => {
    setActionMenuRowId(null);
    // Bulk-imported products are edited in the dedicated import review panel.
    if (row.id.startsWith('imp_')) {
      setSubFlow('importReview');
      return;
    }
    setEditingRowId(row.id);
    const item = live ? liveItem(row.id) : undefined;
    if (item) {
      // Live: prefill from the stored item so saving never drops fields the row doesn't show.
      const amount = (v: unknown) => (toPrice(v as string) ?? '').toString();
      if (item.itemType === 'service') {
        const minutes = Number(/(\d+)/.exec(item.duration ?? '')?.[1]);
        setServiceDraft({
          ...BLANK_SERVICE_DRAFT,
          title: item.name,
          description: item.description ?? '',
          standardPrice: amount(item.price),
          basePrice: amount(item.price),
          comparePrice: amount(item.compareAtPrice),
          skuCode: item.sku ?? '',
          image: item.mainImage ?? '',
          durationMins: Number.isFinite(minutes) && minutes > 0 ? minutes : BLANK_SERVICE_DRAFT.durationMins,
        });
        setSubFlow('service1');
      } else {
        setProductDraft({
          ...BLANK_PRODUCT_DRAFT,
          title: item.name,
          description: item.description ?? '',
          basePrice: amount(item.price),
          comparePrice: amount(item.compareAtPrice),
          sku: item.sku ?? '',
          skuCode: item.sku ?? '',
          lowStock: item.minStock !== null && item.minStock !== undefined ? String(item.minStock) : '',
          backorder: item.allowBackOrder === true,
        });
        setSubFlow('addProduct1');
      }
      return;
    }
    if (isServiceRow(row)) {
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
    } else {
      setProductDraft((prev) => ({
        ...prev,
        title: row.name,
        sku: row.sku,
        skuCode: row.sku,
        primaryCategory: row.category,
        classification: row.sub,
        description: row.alt,
        basePrice: parseAmount(row.price),
        comparePrice: row.was ? parseAmount(row.was) : '',
      }));
      setSubFlow('addProduct1');
    }
  };

  /** Live: set an item's status and report the outcome. */
  const setLiveStatus = (row: CatalogRow, status: 'active' | 'inactive', message: string) => {
    setActionMenuRowId(null);
    itemMutations.update.mutate(
      { id: row.id, input: { status } },
      { onSuccess: () => showToast(message), onError: (e) => showToast(apiErrorMessage(e, 'Could not update the item.')) },
    );
  };

  const handleDuplicateItem = (row: CatalogRow) => {
    setActionMenuRowId(null);
    if (row.id.startsWith('imp_')) {
      setToastMessage('Imported products are managed from the review panel.');
      setSubFlow('importReview');
      return;
    }
    const source = live ? liveItem(row.id) : undefined;
    if (source && activeBranchId) {
      itemMutations.create.mutate(
        {
          name: `${source.name} (Copy)`,
          description: source.description || source.name,
          price: toPrice(source.price ?? undefined),
          compareAtPrice: toPrice(source.compareAtPrice ?? undefined),
          itemType: source.itemType === 'service' ? 'service' : 'product',
          mainImage: source.mainImage ?? undefined,
          duration: source.duration ?? undefined,
          branchId: activeBranchId,
        },
        { onSuccess: () => showToast(`Duplicated "${source.name}".`), onError: (e) => showToast(planErrorMessage(e) ?? apiErrorMessage(e)) },
      );
      return;
    }
    const newId = `${row.id}-copy-${Date.now()}`;
    const newSku = `${row.sku}-CP`;
    const duplicated: CatalogRow = {
      ...row,
      id: newId,
      sku: newSku,
      name: `${row.name} (Copy)`,
    };

    if (activeTab === 'products') {
      setProductRows((prev) => [duplicated, ...prev]);
    } else {
      setServiceRows((prev) => [duplicated, ...prev]);
    }

    setToastMessage(`Duplicated "${row.name}" as "${duplicated.name}".`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleHideItem = (row: CatalogRow) => {
    if (live) return setLiveStatus(row, row.sync ? 'inactive' : 'active', `"${row.name}" is now ${row.sync ? 'hidden from' : 'visible in'} storefront.`);
    const nextHidden = !row.hidden;
    setActionMenuRowId(null);
    if (row.id.startsWith('imp_')) {
      setToastMessage(
        nextHidden ? 'Imported product hidden — publish it from the review panel to show it.' : 'Imported product will show once published.',
      );
      return;
    }
    const updater = (prev: CatalogRow[]) =>
      prev.map((item) => (item.id === row.id ? { ...item, hidden: nextHidden } : item));

    if (activeTab === 'products') {
      setProductRows(updater);
    } else {
      setServiceRows(updater);
    }

    setActionMenuRowId(null);
    setToastMessage(`"${row.name}" is now ${nextHidden ? 'hidden from storefront' : 'visible in storefront'}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteItem = (row: CatalogRow) => {
    setActionMenuRowId(null);
    if (row.id.startsWith('imp_')) {
      removeImportedProducts([row.id]);
      setToastMessage(`"${row.name}" removed from imported products.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (live) {
      itemMutations.remove.mutate(row.id, {
        onSuccess: () => showToast(`"${row.name}" removed from catalog.`),
        onError: (e) => showToast(apiErrorMessage(e, 'Could not delete the item.')),
      });
      return;
    }
    if (activeTab === 'products') {
      setProductRows((prev) => prev.filter((item) => item.id !== row.id));
    } else {
      setServiceRows((prev) => prev.filter((item) => item.id !== row.id));
    }

    setToastMessage(`"${row.name}" removed from catalog.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Replicated Onboarding flows inside Hub Catalog
  if (subFlow === 'addProduct1') {
    return (
      <DesktopAddProductStep1Screen
        draft={productDraft}
        onDraftChange={(patch) => setProductDraft((prev) => ({ ...prev, ...patch }))}
        onBack={() => exitSubFlow()}
        onNext={() => setSubFlow('addProduct2')}
        onSaveDraft={() => exitSubFlow()}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'addProduct2') {
    return (
      <DesktopAddProductStep2Screen
        draft={productDraft}
        onDraftChange={(patch) => setProductDraft((prev) => ({ ...prev, ...patch }))}
        onBack={() => setSubFlow('addProduct1')}
        onNext={() => setSubFlow('addProductImage')}
        onSaveDraft={() => exitSubFlow()}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'addProductImage') {
    return (
      <DesktopAddProductImageScreen
        draft={productDraft}
        onDraftChange={(patch) => setProductDraft((prev) => ({ ...prev, ...patch }))}
        onBack={() => setSubFlow('addProduct2')}
        onNext={() => setSubFlow('addProduct3')}
        onSaveDraft={() => exitSubFlow()}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'addProduct3') {
    return (
      <DesktopAddProductStep3Screen
        draft={productDraft}
        onDraftChange={(patch) => setProductDraft((prev) => ({ ...prev, ...patch }))}
        onBack={() => setSubFlow('addProductImage')}
        onNext={() => setSubFlow('productReview')}
        onSaveDraft={() => exitSubFlow()}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'productReview') {
    return (
      <DesktopProductReviewScreen
        draft={productDraft}
        onBack={() => setSubFlow('addProduct3')}
        onEditBasics={() => setSubFlow('addProduct1')}
        onEditPricing={() => setSubFlow('productPricingConfig')}
        onEditBranches={() => setSubFlow('productPricingConfig')}
        onEditFulfillment={() => setSubFlow('addProduct3')}
        onEditDescription={() => setSubFlow('addProduct1')}
        onEditImage={() => setSubFlow('addProductImage')}
        onEditSteps={() => setSubFlow('addProduct3')}
        onPublish={handlePublishProduct}
        onSaveDraft={() => exitSubFlow()}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'productPricingConfig') {
    return (
      <DesktopProductPricingConfigScreen
        draft={productDraft}
        onDraftChange={(patch) => setProductDraft((prev) => ({ ...prev, ...patch }))}
        onSaved={() => setSubFlow('productReview')}
        onCancel={() => setSubFlow('productReview')}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'productPublished') {
    return (
      <DesktopProductPublishedScreen
        draft={productDraft}
        onMakeDeal={makeDealFromPublished}
        onViewCatalog={() => {
          setActiveTab('products');
          setSubFlow('none');
        }}
        onAddAnother={() => {
          setProductDraft({ ...(live ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT) });
          setEditingRowId(null);
          setSubFlow('addProduct1');
        }}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'importReview') {
    return (
      <MerchantShell activeNav="business-catalog" onNav={onNav}>
        <ImportedProductsReview onBack={() => setSubFlow('none')} />
      </MerchantShell>
    );
  }

  if (subFlow === 'service1') {
    return (
      <DesktopAddServiceStep1Screen
        draft={serviceDraft}
        onDraftChange={(patch) => setServiceDraft((prev) => ({ ...prev, ...patch }))}
        onBack={() => exitSubFlow()}
        onNext={() => setSubFlow('service2')}
        onSaveDraft={() => exitSubFlow()}
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
        onSaveDraft={() => exitSubFlow()}
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
        onSaveDraft={() => exitSubFlow()}
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
        onSaveDraft={() => exitSubFlow()}
        onNav={onNav}
      />
    );
  }

  if (subFlow === 'servicePublished') {
    return (
      <DesktopServicePublishedScreen
        draft={serviceDraft}
        onMakeDeal={makeDealFromPublished}
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

  const currentDataset = activeTab === 'products' ? allProductRows : serviceRows;

  // Live: tiles and chip counts come from the real rows; the demo keeps its sample figures.
  const allLiveRows = [...productRows, ...serviceRows];
  const countWith = (key: CatalogChip) => currentDataset.filter((row) => row.filters.includes(key)).length;
  const stats = live
    ? [
        { ...STATS[0], label: 'Published Items', value: String(allLiveRows.filter((r) => r.sync).length), note: `${allLiveRows.length} in catalogue`, noteIcon: undefined, noteClass: 'text-text-secondary' },
        { ...STATS[1], label: 'Drafts', value: String(allLiveRows.filter((r) => !r.sync).length), note: 'Not visible to customers', noteClass: 'text-text-secondary' },
        { ...STATS[2], label: 'Low Stock Alerts', value: String(allLiveRows.filter((r) => r.filters.includes('low')).length), note: 'At or below minimum stock' },
        { ...STATS[3], label: 'Out of Stock', value: String(allLiveRows.filter((r) => r.filters.includes('oos')).length), valueClass: 'text-on-surface', note: 'Restock to sell again' },
      ]
    : STATS;
  const chips = live
    ? CHIPS.map((entry) => ({ ...entry, label: `${entry.label.replace(/\s*\(\d+\)$/, '')} (${countWith(entry.key)})` }))
    : CHIPS;

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));

  const visibleRows = currentDataset.filter((row) => {
    const matchesChip = chip === 'all' ? true : row.filters.includes(chip);
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      row.name.toLowerCase().includes(needle) ||
      row.sku.toLowerCase().includes(needle) ||
      row.category.toLowerCase().includes(needle);
    return matchesChip && matchesQuery && rowMatchesAdvancedFilters(row, advanced, sync[row.id] === true);
  });

  /** Everything the "More Filters" panel can offer, drawn from the live rows. */
  const categoryOptions = Array.from(new Set(currentDataset.map((row) => row.category))).sort();
  const activeAdvancedCount = countActiveAdvancedFilters(advanced);
  /** Live chip counts — the seed labels were hard-coded and went stale. */
  const chipCount = (key: CatalogChip) => currentDataset.filter((row) => row.filters.includes(key)).length;

  const selectClass =
    'h-9 w-full bg-surface-canvas rounded-lg px-space-xs font-label-sm text-label-sm text-text-primary outline-none focus:shadow-[0_0_0_2px_#066cf4]';
  const groupLabelClass = 'font-caption text-caption text-text-secondary font-semibold';

  /**
   * Select-all is scoped to the *filtered* rows only. Rows hidden by a chip
   * or the search box are never silently added to the selection.
   */
  const visibleIds = visibleRows.map((row) => row.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = prev.filter((id) => !visibleIds.includes(id));
      return allVisibleSelected ? next : [...next, ...visibleIds];
    });

  /**
   * Bulk actions only ever touch rows that are both selected *and* on screen.
   * Ids left over from another tab, chip or search are never acted on, so the
   * "N selected" count always matches exactly what will change.
   */
  const visibleSelectedRows = visibleRows.filter((row) => selected.includes(row.id));
  const bulkNoun = activeTab === 'products' ? 'products' : 'services';
  const bulkSingular = activeTab === 'products' ? 'product' : 'service';

  const bulkActions: BulkAction[] = [
    {
      value: 'publish',
      label: 'Publish',
      hint: 'Imported products missing a name or price are skipped and reported instead of published.',
    },
    { value: 'draft', label: 'Move to Draft' },
    { value: 'hide', label: 'Hide from Storefront' },
    { value: 'show', label: 'Show on Storefront' },
    {
      value: 'addToDeals',
      label: 'Add to Deals',
      hint: 'Marks these items as deal-linked in this catalogue. Deal terms and discounts are configured in the Deals workspace.',
    },
    { value: 'removeFromDeals', label: 'Remove from Deals' },
    { value: 'delete', label: 'Delete' },
  ];

  const flash = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    if (notice) flash(notice);
  }, [notice]);

  /** Applies a change to the selected rows held in local catalogue state. */
  const updateSeedRows = (ids: string[], updater: (row: CatalogRow) => CatalogRow) => {
    const idSet = new Set(ids);
    const map = (previous: CatalogRow[]) => previous.map((row) => (idSet.has(row.id) ? updater(row) : row));
    if (activeTab === 'products') setProductRows(map);
    else setServiceRows(map);
  };

  /** Keeps the Terminal Sync column in step with publish/draft changes. */
  const setSeedSync = (ids: string[], value: boolean) =>
    setSync((previous) => {
      const next = { ...previous };
      ids.forEach((id) => {
        next[id] = value;
      });
      return next;
    });

  const applyBulkAction = (action: string) => {
    const rows = visibleSelectedRows;
    if (rows.length === 0) {
      flash('Select at least one item first.');
      return;
    }

    if (action === 'delete') {
      setBulkDelete({ ids: rows.map((row) => row.id), count: rows.length });
      return;
    }

    if (live && (action === 'addToDeals' || action === 'removeFromDeals')) {
      // Live deals are built on one item in the deal studio.
      const item = rows.length === 1 ? liveItem(rows[0].id) : undefined;
      setSelected([]);
      if (action === 'removeFromDeals') return flash('End or pause the deal from Deals to stop it.');
      if (!item || !onMakeDeal) return flash('Select one item to make a deal from.');
      return onMakeDeal(item);
    }

    const importedRowsSelected = rows.filter((row) => isImportedRow(row.id));
    const seedRowsSelected = rows.filter((row) => !isImportedRow(row.id));
    const importedIds = importedRowsSelected.map((row) => row.id);
    const seedIds = seedRowsSelected.map((row) => row.id);
    const parts: string[] = [];

    if (action === 'publish') {
      let publishedCount = 0;
      let blockedCount = 0;
      if (importedIds.length > 0) {
        const result = publishImportedProducts(importedIds);
        publishedCount += result.published.length;
        blockedCount += result.blocked.length;
      }
      if (seedIds.length > 0) {
        updateSeedRows(seedIds, (row) => withPublishState(row, true));
        setSeedSync(seedIds, true);
        publishedCount += seedIds.length;
      }
      if (publishedCount > 0) parts.push(`published ${publishedCount} item${publishedCount === 1 ? '' : 's'}`);
      if (blockedCount > 0)
        parts.push(
          `${blockedCount} couldn't publish yet (missing a name or price) — open Review to fix them`,
        );
    } else if (action === 'draft') {
      const alreadyDraft = rows.filter((row) => row.draft === true).length;
      if (importedIds.length > 0) unpublishImportedProducts(importedIds);
      if (seedIds.length > 0) {
        updateSeedRows(seedIds, (row) => withPublishState(row, false));
        setSeedSync(seedIds, false);
      }
      const changed = rows.length - alreadyDraft;
      if (changed > 0) parts.push(`moved ${changed} item${changed === 1 ? '' : 's'} back to draft`);
      if (alreadyDraft > 0)
        parts.push(`${alreadyDraft} ${alreadyDraft === 1 ? 'was' : 'were'} already ${alreadyDraft === 1 ? 'a draft' : 'drafts'}`);
    } else if (action === 'hide' || action === 'show') {
      const nextHidden = action === 'hide';
      if (seedIds.length > 0) {
        updateSeedRows(seedIds, (row) => (row.hidden === nextHidden ? row : { ...row, hidden: nextHidden }));
        parts.push(
          `${nextHidden ? 'hid' : 'showed'} ${seedIds.length} item${seedIds.length === 1 ? '' : 's'} ${
            nextHidden ? 'from' : 'on'
          } your storefront`,
        );
      }
      if (importedIds.length > 0) {
        parts.push(
          importedIds.length === 1
            ? '1 imported product is governed by its publish status — use Publish or Move to Draft instead'
            : `${importedIds.length} imported products are governed by their publish status — use Publish or Move to Draft instead`,
        );
      }
    } else if (action === 'addToDeals' || action === 'removeFromDeals') {
      const linked = action === 'addToDeals';
      const seedChanged = seedRowsSelected.filter((row) => row.filters.includes('deals') !== linked).length;
      let changed = importedIds.length > 0 ? setImportedLinkedDeal(importedIds, linked) : 0;
      if (seedIds.length > 0) {
        updateSeedRows(seedIds, (row) => withDealLinked(row, linked));
        changed += seedChanged;
      }
      if (changed > 0) {
        parts.push(
          `${linked ? 'linked' : 'unlinked'} ${changed} item${changed === 1 ? '' : 's'} ${linked ? 'to' : 'from'} a deal`,
        );
        parts.push('deal terms and discounts are still set up in the Deals workspace');
      } else {
        parts.push(`those items were already ${linked ? 'linked to' : 'unlinked from'} a deal`);
      }
    }

    if (parts.length > 0) {
      const message = parts.join('; ');
      flash(message.charAt(0).toUpperCase() + message.slice(1) + '.');
    } else {
      flash('That action did not apply to the selected items.');
    }
    setSelected([]);
  };

  const confirmBulkDelete = () => {
    if (!bulkDelete) return;
    const idSet = new Set(bulkDelete.ids);
    const importedIds = bulkDelete.ids.filter(isImportedRow);
    const seedIds = bulkDelete.ids.filter((id) => !isImportedRow(id));
    const removedImported = importedIds.length > 0 ? removeImportedProducts(importedIds) : 0;
    if (seedIds.length > 0) {
      if (activeTab === 'products') setProductRows((previous) => previous.filter((row) => !idSet.has(row.id)));
      else setServiceRows((previous) => previous.filter((row) => !idSet.has(row.id)));
    }
    const total = removedImported + seedIds.length;
    setBulkDelete(null);
    setSelected([]);
    flash(`Deleted ${total} item${total === 1 ? '' : 's'} from your catalogue.`);
  };

  /** A bulk selection can mix imported products with locally-held rows. */
  const deleteIncludesImported = bulkDelete?.ids.some(isImportedRow) ?? false;
  const deleteBullets = [
    ...(deleteIncludesImported
      ? [
          'Bulk-imported products leave your imported store too — your original CSV or Excel file is untouched and can be re-imported later.',
        ]
      : []),
    'Anything currently published disappears from your storefront immediately.',
    'This cannot be undone from here.',
  ];

  return (
    <MerchantShell activeNav="business-catalog" onNav={onNav}>
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
              <span>{live ? 'Live in POS' : 'Live in POS Mesh • 28ms latency'}</span>
            </div>
            <div className="hidden md:flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg bg-surface-tint-blue text-primary font-caption text-caption">
              <Icon name="cloud_sync" className="text-[16px]" />
              <span>{live ? `${branches.length} ${branches.length === 1 ? 'Branch' : 'Branches'}` : '3 Branches Synced'}</span>
            </div>
          </div>
        </div>

        {/* Page Header & Multi-action Deck — stacks until `xl` so it fits iPad Pro 13 */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
          <div className="max-w-3xl min-w-0">
            <div className="inline-flex items-center gap-space-xs px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-label-sm text-label-sm mb-space-xs">
              <Icon name="hub" className="text-[16px]" />
              <span>Enterprise SKU Multi-Tenancy</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Central Products &amp; Services Catalogue
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              Centralized multi-location catalog. Manage dishes, retail merchandise, and services across Abuja and Lagos
              branches.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm">
            {/* Side-by-side Add Buttons on the same line */}
            <div className="flex items-center gap-space-sm shrink-0 whitespace-nowrap">
              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-button-secondary text-button-secondary shadow-sm active:scale-[0.98]"
              >
                <Icon name="create_new_folder" className="text-primary text-[20px]" />
                <span>+ Add Category</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceDraft(getInitialServiceDraft());
                  setEditingRowId(null);
                  setSubFlow('service1');
                }}
                className="flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-button-secondary text-button-secondary shadow-sm active:scale-[0.98]"
              >
                <Icon name="room_service" className="text-primary text-[20px]" />
                <span>+ Add Service</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMethodsOpen(true)}
                className="flex items-center gap-space-2xs px-space-lg py-space-sm rounded-xl bg-primary-container text-on-primary-container hover:bg-primary transition-all font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98]"
              >
                <Icon name="add_circle" className="text-[20px]" />
                <span>+ Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bento Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
          {stats.map((stat) => (
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

        {/* Navigation Tabs & View Options - Only Products & Services */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-xs rounded-xl shadow-sm">
          <div className="flex items-center gap-space-2xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold transition-all shadow-sm whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Icon name="restaurant_menu" className="text-[18px]" />
              <span>Products</span>
              <span
                className={`px-space-xs py-space-2xs rounded-full font-caption text-caption font-bold ${
                  activeTab === 'products'
                    ? 'bg-surface-canvas/20 text-on-primary'
                    : 'bg-surface-container text-text-secondary'
                }`}
              >
                {allProductRows.length} active
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold transition-all whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-primary-container text-on-primary-container'
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
                  ? 'bg-primary-container text-on-primary-container'
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
                {live ? liveCategories.data?.length ?? 0 : centralCategories.length} categories
              </span>
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
              onClick={() => setImportWizardOpen(true)}
              className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg text-text-secondary hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm transition-colors active:scale-95"
            >
              <Icon name="upload_file" className="text-[18px]" />
              <span>Import CSV</span>
            </button>
            {draftImportCount > 0 && (
              <button
                type="button"
                onClick={() => setSubFlow('importReview')}
                className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg bg-surface-tint-blue text-primary hover:bg-primary hover:text-on-primary font-label-sm text-label-sm font-semibold transition-colors active:scale-95"
              >
                <Icon name="edit_note" className="text-[18px]" />
                <span>
                  Review {draftImportCount.toLocaleString()} draft{draftImportCount === 1 ? '' : 's'}
                </span>
              </button>
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

        {activeTab === 'categories' ? (
          <div className="flex flex-col gap-space-md">
            {/* Category Search & Action Console */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Filter categories by name, slug, or keywords..."
                  className="w-full h-[44px] bg-surface-container-low rounded-xl pl-12 pr-4 text-on-surface font-body-md text-body-md placeholder-text-tertiary outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
                  {(['all', 'product', 'service'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCategoryTypeFilter(t)}
                      className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-all capitalize ${
                        categoryTypeFilter === t
                          ? 'bg-surface-canvas text-primary shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {t === 'all'
                        ? `All (${centralCategories.length})`
                        : t === 'product'
                        ? `Products (${centralCategories.filter((c) => c.type === 'product').length})`
                        : `Services (${centralCategories.filter((c) => c.type === 'service').length})`}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-body-sm shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="add" className="text-[18px]" />
                  <span>Create Category</span>
                </button>
              </div>
            </div>

            {/* Central Categories Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-border-subtle">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-subtle/50 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                      <th className="py-3.5 px-4">Category &amp; Identification</th>
                      <th className="py-3.5 px-4">Classification</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Linked Items</th>
                      <th className="py-3.5 px-4">QR Destination</th>
                      <th className="py-3.5 px-4">Scan &amp; Orders</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-body-sm">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-text-tertiary">
                          No categories found matching your query.
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
                                  <Icon name={cat.icon || 'restaurant'} className="text-[20px]" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-text-primary block">{cat.name}</span>
                                <span className="text-[11px] font-mono text-text-tertiary">{cat.slug}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-caption font-semibold ${
                                cat.type === 'product'
                                  ? 'bg-surface-tint-blue text-primary'
                                  : 'bg-badge-discount-bg text-badge-discount-text'
                              }`}
                            >
                              {cat.type === 'product' ? 'Product Category' : 'Service Category'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-text-secondary line-clamp-2 max-w-xs text-caption">
                              {cat.description || 'No description provided.'}
                            </p>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-text-primary">
                              {cat.productCount} {cat.type === 'product' ? 'products' : 'services'}
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
                                    navigator.clipboard?.writeText(categoryLink(cat));
                                  }
                                  setToastMessage(`QR Destination URL for ${cat.name} copied.`);
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
                                {live ? '— scans • — orders' : `${cat.stats?.scans || 0} scans • ${cat.stats?.ordersCount || 0} orders`}
                              </span>
                              <span className="text-[11px] text-badge-discount-text font-semibold">
                                {live ? '— GMV' : `₦${(cat.stats?.totalRevenue || 0).toLocaleString()} GMV`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCategory(cat)}
                                title="Edit Category"
                                className="p-1.5 rounded-lg border border-border hover:bg-surface-subtle text-text-secondary hover:text-primary transition-colors"
                              >
                                <Icon name="edit" className="text-[16px]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleArchiveCategory(cat.id, cat.name)}
                                title="Archive Category"
                                className="p-1.5 rounded-lg border border-border hover:bg-error-container/20 text-text-secondary hover:text-error transition-colors"
                              >
                                <Icon name="archive" className="text-[16px]" />
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
          <>
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
            {chips.map((entry) => {
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
                <button
                  key={entry.key}
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setChip(entry.key)}
                  className={classes}
                >
                  {entry.icon && <Icon name={entry.icon} className="text-[16px]" />}
                  <span>
                    {entry.label}
                    {entry.counted ? ` (${chipCount(entry.key).toLocaleString()})` : ''}
                  </span>
                </button>
              );
            })}
            <div className="ml-auto pl-space-sm flex items-center gap-space-2xs">
              <button
                aria-expanded={filtersOpen}
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
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

        {/* More Filters panel — narrow the list beyond the quick chips */}
        {filtersOpen && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-2xs">
                <Icon name="tune" className="text-[18px] text-primary" />
                <span className="font-label-md text-label-md text-text-primary font-semibold">More filters</span>
                {activeAdvancedCount > 0 && (
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                    {activeAdvancedCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={activeAdvancedCount === 0}
                onClick={() => setAdvanced(EMPTY_ADVANCED_FILTERS)}
                className="font-caption text-caption text-primary font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Clear all filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-space-sm">
              {categoryOptions.length > 1 && (
                <label className="flex flex-col gap-space-2xs">
                  <span className={groupLabelClass}>Category</span>
                  <select
                    className={selectClass}
                    value={advanced.category}
                    onChange={(event) => setAdvanced((previous) => ({ ...previous, category: event.target.value }))}
                  >
                    <option value="">All categories</option>
                    {categoryOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="flex flex-col gap-space-2xs">
                <span className={groupLabelClass}>Status</span>
                <select
                  className={selectClass}
                  value={advanced.status}
                  onChange={(event) =>
                    setAdvanced((previous) => ({ ...previous, status: event.target.value as AdvancedStatus }))
                  }
                >
                  <option value="any">Any status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="hidden">Hidden from storefront</option>
                </select>
              </label>

              <label className="flex flex-col gap-space-2xs">
                <span className={groupLabelClass}>Stock</span>
                <select
                  className={selectClass}
                  value={advanced.stock}
                  onChange={(event) =>
                    setAdvanced((previous) => ({ ...previous, stock: event.target.value as AdvancedStock }))
                  }
                >
                  <option value="any">Any stock</option>
                  <option value="in">In stock</option>
                  <option value="out">Out of stock</option>
                  <option value="unset">Stock not set</option>
                </select>
              </label>

              <label className="flex flex-col gap-space-2xs">
                <span className={groupLabelClass}>Deal link</span>
                <select
                  className={selectClass}
                  value={advanced.deal}
                  onChange={(event) =>
                    setAdvanced((previous) => ({ ...previous, deal: event.target.value as AdvancedDeal }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="linked">Linked to a deal</option>
                  <option value="unlinked">Not linked</option>
                </select>
              </label>

              <label className="flex flex-col gap-space-2xs">
                <span className={groupLabelClass}>Terminal sync</span>
                <select
                  className={selectClass}
                  value={advanced.sync}
                  onChange={(event) =>
                    setAdvanced((previous) => ({ ...previous, sync: event.target.value as AdvancedSync }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="synced">Synced to POS</option>
                  <option value="unsynced">Not synced</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between gap-space-sm pt-space-xs border-t border-border-subtle">
              <span className="font-caption text-caption text-text-secondary">
                {visibleRows.length.toLocaleString()} of {currentDataset.length.toLocaleString()} {bulkNoun} match
                {activeAdvancedCount === 0 ? ' the current view' : ' these filters'}
              </span>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="px-space-sm py-space-2xs rounded-lg bg-surface-container-low text-text-secondary hover:bg-surface-container font-label-sm text-label-sm font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Data Table / Grid Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          {/* Bulk actions stay out of the way until something is selected, then fade in */}
          {currentDataset.length > 0 && visibleRows.length > 0 && (
            <div
              className={`transition-all duration-200 overflow-hidden ${
                visibleSelectedRows.length > 0
                  ? 'max-h-[400px] opacity-100 p-space-sm'
                  : 'max-h-0 opacity-0 invisible pointer-events-none p-0'
              }`}
            >
              <BulkActionsBar
                selectedCount={visibleSelectedRows.length}
                filteredCount={visibleRows.length}
                totalCount={currentDataset.length}
                scopeNoun={bulkNoun}
                selectAllLabel={`${visibleRows.length.toLocaleString()} ${bulkNoun} in view`}
                actions={bulkActions}
                onApply={applyBulkAction}
                onSelectAllFiltered={toggleAll}
                onClearSelection={() => setSelected([])}
              />
            </div>
          )}
          {visibleRows.length === 0 ? (
            <div className="p-space-xl text-center flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-text-secondary mb-space-sm">
                <Icon name="search_off" className="text-[32px]" />
              </div>
              <h3 className="font-heading-sm font-bold text-on-surface">No {activeTab} match your criteria</h3>
              <p className="font-body-md text-text-secondary mt-1 max-w-sm">
                Try clearing your search query, the filter chips, or the More Filters panel to see more {activeTab}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setChip('all');
                  setQuery('');
                  setAdvanced(EMPTY_ADVANCED_FILTERS);
                }}
                className="mt-space-md inline-flex items-center gap-space-2xs text-primary font-semibold text-label-md hover:underline"
              >
                <Icon name="refresh" className="text-[18px]" />
                <span>Reset all filters</span>
              </button>
            </div>
          ) : view === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-text-secondary font-label-sm text-label-sm">
                    <th className="py-space-sm px-space-md w-12 text-center" scope="col">
                      <input
                        aria-label={`Select all ${activeTab} in the current view`}
                        checked={allVisibleSelected}
                        className="rounded text-primary cursor-pointer"
                        onChange={toggleAll}
                        type="checkbox"
                      />
                    </th>
                    <th className="py-space-sm px-space-md font-semibold text-on-surface-variant min-w-[280px]" scope="col">
                      {activeTab === 'products' ? 'Product & SKU' : 'Service & SKU'}
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
                      {activeTab === 'products' ? 'Inventory Status' : 'Duration & Availability'}
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
                            onClick={() =>
                              live
                                ? setLiveStatus(row, sync[row.id] ? 'inactive' : 'active', `"${row.name}" ${sync[row.id] ? 'removed from' : 'live on'} POS & storefront.`)
                                : setSync((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                            }
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
                          <div className="flex items-center justify-end gap-space-2xs relative">
                            <button
                              type="button"
                              title="Edit Item"
                              onClick={() => handleOpenEditItem(row)}
                              className="p-space-2xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                            >
                              <Icon name="edit" className="text-[20px]" />
                            </button>
                            <button
                              type="button"
                              title="Branch Pricing Matrix"
                              onClick={() => onOpenBranchPricing?.(live ? row.id : undefined)}
                              className="p-space-2xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                            >
                              <Icon name="tune" className="text-[20px]" />
                            </button>
                            <div className="relative">
                              <button
                                type="button"
                                title="More Options"
                                onClick={() => setActionMenuRowId((cur) => (cur === row.id ? null : row.id))}
                                className={`p-space-2xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-on-surface transition-colors ${
                                  actionMenuRowId === row.id ? 'bg-surface-container text-primary' : ''
                                }`}
                              >
                                <Icon name="more_vert" className="text-[20px]" />
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
                                    <span>Duplicate Item</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleHideItem(row)}
                                    className="w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-container flex items-center gap-2 transition-colors"
                                  >
                                    <Icon name={row.hidden ? 'visibility' : 'visibility_off'} className="text-[16px] text-text-secondary" />
                                    <span>{row.hidden ? 'Show on Storefront' : 'Hide from Storefront'}</span>
                                  </button>
                                  <div className="my-1 border-t border-border-subtle" />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(row)}
                                    className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                                  >
                                    <Icon name="delete" className="text-[16px]" />
                                    <span>Delete Item</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
              {visibleRows.map((row) => {
                const syncOn = sync[row.id];
                return (
                  <div
                    key={row.id}
                    className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Media Card Thumbnail */}
                      <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container mb-space-sm">
                        <img
                          alt={row.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={row.image}
                        />
                        {/* Overlay Controls */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                          <input
                            aria-label={`Select ${row.name}`}
                            checked={selected.includes(row.id)}
                            className="rounded text-primary cursor-pointer w-4 h-4 bg-surface-canvas/90 shadow-sm"
                            onChange={() => toggleRow(row.id)}
                            type="checkbox"
                          />
                          {row.verified && (
                            <span className="bg-surface-canvas/95 px-2 py-0.5 rounded text-[11px] font-bold text-badge-discount-text flex items-center gap-1 shadow-sm backdrop-blur-xs">
                              <Icon name="verified" className="text-[13px]" />
                              Best Seller
                            </span>
                          )}
                          {row.draft && (
                            <span className="px-2 py-0.5 rounded bg-surface-container/95 text-text-secondary font-caption text-[11px] font-semibold uppercase shadow-sm">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-canvas/95 text-on-surface font-label-sm text-label-sm font-semibold shadow-sm backdrop-blur-xs">
                            <Icon name={row.categoryIcon} className="text-[14px] text-primary" />
                            <span>{row.category}</span>
                          </span>
                        </div>
                        {row.kitchenLabel && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-center">
                            <span className="font-caption text-[10px] text-white font-bold uppercase tracking-wider">
                              Kitchen Expedited
                            </span>
                          </div>
                        )}
                        {row.hidden && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="px-2 py-1 rounded bg-black/60 text-white font-caption text-[11px] font-semibold flex items-center gap-1">
                              <Icon name="visibility_off" className="text-[14px]" />
                              Hidden
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <div className="flex items-start justify-between gap-space-sm">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-label-lg text-label-lg font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                            {row.name}
                          </h3>
                          <div className="flex items-center gap-space-xs mt-1 font-caption text-caption text-text-secondary">
                            <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded text-[11px] font-semibold">
                              {row.sku}
                            </span>
                            <span>•</span>
                            <span className="truncate">{row.sub}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Row */}
                      <div className="mt-space-sm pt-space-xs border-t border-surface-container-low flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-space-xs">
                            <span
                              className={`font-heading-sm text-heading-sm font-bold ${
                                row.dealBadge ? 'text-primary' : 'text-on-surface'
                              }`}
                            >
                              {row.price}
                            </span>
                            {row.was && (
                              <span className="font-caption text-caption text-text-tertiary line-through">{row.was}</span>
                            )}
                            {row.priceChip && (
                              <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                                {row.priceChip}
                              </span>
                            )}
                          </div>
                          {row.dealBadge && (
                            <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                              <Icon name="loyalty" className="text-[12px]" />
                              <span>{row.dealBadge}</span>
                            </div>
                          )}
                        </div>

                        {/* Branch badge */}
                        <div className="text-right">
                          <div
                            className={`flex items-center justify-end gap-1.5 font-label-sm text-label-sm font-semibold ${
                              row.branchDot === 'tertiary' ? 'text-text-secondary' : 'text-on-surface'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${BRANCH_DOT[row.branchDot]}`} />
                            <span className="text-[12px]">{row.branchLabel}</span>
                          </div>
                          <span className="font-caption text-[11px] text-text-secondary block mt-0.5">
                            {row.branchNote}
                          </span>
                        </div>
                      </div>

                      {/* Stock / Duration Section */}
                      <div className="mt-space-sm bg-surface-container-low p-space-xs rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-[11px] font-semibold ${
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
                        {row.stock.note && (
                          <span className="font-caption text-[11px] text-text-secondary">
                            {row.stock.note}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Bottom Strip */}
                    <div className="mt-space-md pt-space-xs border-t border-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-caption text-[11px] text-text-secondary font-medium">POS Sync</span>
                        <button
                          aria-checked={syncOn}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer p-0.5 transition-colors focus:outline-none rounded-full ${
                            syncOn ? 'bg-primary-container' : 'bg-surface-container-highest'
                          }`}
                          onClick={() =>
                              live
                                ? setLiveStatus(row, sync[row.id] ? 'inactive' : 'active', `"${row.name}" ${sync[row.id] ? 'removed from' : 'live on'} POS & storefront.`)
                                : setSync((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                            }
                          role="switch"
                          type="button"
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface-canvas shadow ring-0 transition duration-200 ${
                              syncOn ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 relative">
                        <button
                          type="button"
                          title="Edit Item"
                          onClick={() => handleOpenEditItem(row)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          title="Branch Pricing Matrix"
                          onClick={() => onOpenBranchPricing?.(live ? row.id : undefined)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                        >
                          <Icon name="tune" className="text-[18px]" />
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
                            <div className="absolute right-0 bottom-full mb-1 w-48 bg-surface-canvas rounded-xl shadow-xl border border-border-subtle py-1.5 z-40 text-left animate-fade-in">
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
                                <span>Duplicate Item</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleHideItem(row)}
                                className="w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-container flex items-center gap-2 transition-colors"
                              >
                                <Icon name={row.hidden ? 'visibility' : 'visibility_off'} className="text-[16px] text-text-secondary" />
                                <span>{row.hidden ? 'Show on Storefront' : 'Hide from Storefront'}</span>
                              </button>
                              <div className="my-1 border-t border-border-subtle" />
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(row)}
                                className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                              >
                                <Icon name="delete" className="text-[16px]" />
                                <span>Delete Item</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination and Batch Controls Footer Strip */}
          <div className="p-space-md bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md text-text-secondary font-caption text-caption">
              <span>
                Showing <strong className="text-on-surface">1–{visibleRows.length}</strong> of{' '}
                <strong className="text-on-surface">{currentDataset.length}</strong> {activeTab}
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
              {(live ? [] : ['2', '3', '4']).map((page) => (
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
        </>
        )}

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
                {live
                  ? branches.length > 1
                    ? `Set a different price per branch for any item across your ${branches.length} branches.`
                    : 'Add another branch to price items differently per location.'
                  : 'Victoria Island (Lagos) branch has a default 7.5% regional logistics markup applied on all imported meats and cellar items.'}
              </p>
              <button
                type="button"
                onClick={() => onOpenBranchPricing?.(live ? productItems.data?.[0]?.id : undefined)}
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
                {live ? 'Low-Stock Alerts' : 'Low-Stock Automated Reorders'}
              </h2>
              <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                {live
                  ? (() => {
                      const lowCount = allLiveRows.filter((row) => row.filters.includes('low')).length;
                      return lowCount
                        ? `${lowCount} ${lowCount === 1 ? 'item is' : 'items are'} at or below the minimum stock you set. Restock or raise the level in each item.`
                        : 'No items are below their minimum stock. Set a minimum on each item to get low-stock alerts.';
                    })()
                  : 'Items dropping below 5 units generate instant procurement tickets dispatched to centralized warehouse suppliers.'}
              </p>
              <button
                type="button"
                onClick={live ? () => setChip('low') : undefined}
                className="inline-flex items-center gap-space-2xs text-primary font-label-sm text-label-sm font-semibold mt-space-xs hover:underline"
              >
                <span>{live ? 'View low-stock items' : 'Edit automated replenishment triggers'}</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Add/Edit Modal */}
        {categoryModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setCategoryModal(null)}
            />
            <div className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name={categoryModal.mode === 'add' ? 'create_new_folder' : 'edit'} className="text-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                      {categoryModal.mode === 'add' ? 'Create Central Category' : 'Edit Category'}
                    </h3>
                    <p className="text-[12px] text-text-secondary">
                      Central single source of truth for POS, Storefront &amp; QR
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryModal(null)}
                  className="p-1.5 rounded-lg text-text-tertiary hover:bg-surface-subtle"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="mt-space-md space-y-space-md">
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-text-primary">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catFormName}
                    onChange={(e) => setCatFormName(e.target.value)}
                    placeholder="e.g. Woodfire Steaks &amp; Grills"
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-subtle border border-border text-body-md text-text-primary focus:outline-hidden focus:border-primary"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-caption font-semibold text-text-primary">Classification</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCatFormType('product')}
                      className={`py-2 px-3 rounded-xl border text-caption font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        catFormType === 'product'
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-surface-subtle text-text-secondary'
                      }`}
                    >
                      <Icon name="inventory_2" className="text-[16px]" />
                      <span>Product Category</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatFormType('service')}
                      className={`py-2 px-3 rounded-xl border text-caption font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        catFormType === 'service'
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-surface-subtle text-text-secondary'
                      }`}
                    >
                      <Icon name="spa" className="text-[16px]" />
                      <span>Service Category</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-caption font-semibold text-text-primary">Description</label>
                  <textarea
                    rows={2}
                    value={catFormDesc}
                    onChange={(e) => setCatFormDesc(e.target.value)}
                    placeholder="Public description shown to customers on Storefront menu"
                    className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-sm text-text-primary focus:outline-hidden focus:border-primary"
                  />
                </div>

                <CategoryImageField value={catFormImage} onChange={setCatFormImage} />

                <div className="space-y-1">
                  <label className="text-caption font-semibold text-text-primary">Material Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      'outdoor_grill',
                      'lunch_dining',
                      'local_pizza',
                      'tapas',
                      'local_bar',
                      'cake',
                      'table_restaurant',
                      'room_service',
                      'spa',
                      'content_cut',
                      'brush',
                      'set_meal',
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

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
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


        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl border border-outline-variant animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
            <span className="font-label-md text-label-md font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Bulk delete confirmation — desktop modal / mobile sheet from one body */}
        <ConfirmActionDialog
          open={bulkDelete !== null}
          onClose={() => setBulkDelete(null)}
          onConfirm={confirmBulkDelete}
          tone="danger"
          title={`Delete ${bulkDelete?.count ?? 0} ${bulkDelete?.count === 1 ? bulkSingular : bulkNoun}?`}
          message={
            bulkDelete?.count === 1
              ? `This permanently removes this ${bulkSingular} from your catalogue.`
              : `This permanently removes the ${bulkDelete?.count ?? 0} selected ${bulkNoun} from your catalogue.`
          }
          bullets={deleteBullets}
          confirmLabel={`Delete ${bulkDelete?.count ?? 0} ${bulkDelete?.count === 1 ? bulkSingular : bulkNoun}`}
        />

        {/* Add Product: manual / bulk import / connect platform (coming soon) */}
        <AddProductMethodsDialog
          open={addMethodsOpen}
          onClose={() => setAddMethodsOpen(false)}
          onAddManually={() => {
            setAddMethodsOpen(false);
            setProductDraft({ ...(live ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT) });
            setEditingRowId(null);
            setSubFlow('addProduct1');
          }}
          onBulkImport={() => {
            setAddMethodsOpen(false);
            setImportWizardOpen(true);
          }}
        />

        {/* Reusable Bulk Product Import wizard */}
        <ProductImportWizard
          open={importWizardOpen}
          onClose={() => setImportWizardOpen(false)}
          existingSkus={allProductRows.map((row) => row.sku)}
          existingNames={allProductRows.map((row) => row.name)}
          onImported={(importResult) => {
            setToastMessage(summariseImport(importResult));
            setTimeout(() => setToastMessage(null), 4000);
            setActiveTab('products');
          }}
          onOpenReview={() => setSubFlow('importReview')}
        />
      </div>
    </MerchantShell>
  );
}
