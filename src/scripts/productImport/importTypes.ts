/**
 * Shared types for the Bulk Product Import feature.
 *
 * The importer is intentionally frontend-only and plugs into the app's existing
 * localStorage-backed data conventions (see `catalogueData.ts`,
 * `ProfileContext`). When a real backend lands, `importedProductStore.ts` is the
 * single swap point: its functions mirror the REST resources listed in
 * `platformConnectors.ts`.
 */

/** Target product fields a spreadsheet column can be mapped to. */
export type ImportFieldKey =
  | 'name'
  | 'description'
  | 'sku'
  | 'barcode'
  | 'category'
  | 'price'
  | 'salePrice'
  | 'costPrice'
  | 'bulkPrice'
  | 'stock'
  | 'unit'
  | 'variants'
  | 'image'
  | 'ignore';

export interface ImportFieldSpec {
  key: ImportFieldKey;
  label: string;
  hint: string;
  icon: string;
  /** Required before a product can be imported. */
  required?: boolean;
  /** Only one column may map to a singleton field. */
  singleton?: boolean;
}

export const IMPORT_FIELDS: ImportFieldSpec[] = [
  { key: 'name', label: 'Product Name', hint: 'Title customers see', icon: 'sell', required: true, singleton: true },
  { key: 'description', label: 'Description', hint: 'Long product copy', icon: 'notes', singleton: true },
  { key: 'sku', label: 'SKU', hint: 'Stock keeping unit code', icon: 'tag', singleton: true },
  { key: 'barcode', label: 'Barcode / EAN', hint: 'Numeric barcode', icon: 'barcode', singleton: true },
  { key: 'category', label: 'Category', hint: 'Catalogue category', icon: 'category', singleton: true },
  { key: 'price', label: 'Selling Price', hint: 'Regular price (₦)', icon: 'payments', required: true, singleton: true },
  { key: 'salePrice', label: 'Sale Price', hint: 'Discounted / compare-at price', icon: 'percent', singleton: true },
  { key: 'costPrice', label: 'Cost Price', hint: 'Private cost per item', icon: 'receipt_long', singleton: true },
  { key: 'bulkPrice', label: 'Bulk / Tiered Price', hint: 'Qty tiers, e.g. 1-5:900|6+:800', icon: 'stacks', singleton: true },
  { key: 'stock', label: 'Stock / Quantity', hint: 'Units available', icon: 'inventory_2', singleton: true },
  { key: 'unit', label: 'Unit', hint: 'e.g. piece, kg, pack', icon: 'straighten', singleton: true },
  { key: 'variants', label: 'Variants', hint: 'e.g. Large:1800|Small:1200', icon: 'widgets', singleton: true },
  { key: 'image', label: 'Image URL', hint: 'Link to product photo', icon: 'image', singleton: true },
  { key: 'ignore', label: 'Do not import', hint: 'Column kept for review only', icon: 'do_not_disturb_on' },
];

export const FIELD_SPECS: Record<ImportFieldKey, ImportFieldSpec> = IMPORT_FIELDS.reduce(
  (acc, spec) => {
    acc[spec.key] = spec;
    return acc;
  },
  {} as Record<ImportFieldKey, ImportFieldSpec>,
);

/** One column detected in the uploaded file, with a profile used for mapping. */
export interface ParsedColumn {
  index: number;
  header: string;
  normalizedHeader: string;
  /** First N non-empty sample values (used for heuristics + previews). */
  samples: string[];
  nonEmpty: number;
  numericRatio: number;
  currencyRatio: number;
  integerRatio: number;
  urlRatio: number;
  avgLength: number;
  maxLength: number;
  uniqueRatio: number;
  /** Suggested field + confidence (0..1) from the rule-based mapper. */
  suggestedField: ImportFieldKey;
  confidence: number;
  /** Human-readable reason shown in the mapping UI. */
  reason: string;
  /** True when the suggestion relies on weak data-driven heuristics. */
  ambiguous: boolean;
}

export interface ParsedSpreadsheet {
  fileName: string;
  fileType: 'csv' | 'excel';
  headers: string[];
  rows: string[][];
  /** Non-fatal parse warnings (ragged rows, blank headers, etc). */
  warnings: string[];
}

/** column index -> field. Unset columns are treated as unmapped/ignored. */
export type ImportMapping = Record<number, ImportFieldKey>;

export interface StagedRow {
  /** Stable client id used for React keys + selection. */
  id: string;
  /** 1-based data row number in the source file (header = row 0). */
  rowNumber: number;
  cells: string[];
  /** Uploaded or ZIP-extracted image data (data URLs / URLs). */
  images: string[];
  /** Errors from image extraction (bad file, size, etc). */
  imageErrors: string[];
  /** User excluded this row from the import (source data still visible). */
  excluded: boolean;
  /**
   * Bulk-action intent: publish this row right after it is imported.
   * It never bypasses validation — invalid rows still import as drafts and
   * land in Needs Review instead of going live.
   */
  publishAfterImport?: boolean;
  /** Bulk-action intent: flag the imported product for manual review. */
  markForReview?: boolean;
}

export type IssueSeverity = 'blocking' | 'warning';

export interface ImportIssue {
  rowId: string;
  rowNumber: number;
  severity: IssueSeverity;
  field?: ImportFieldKey | 'row';
  message: string;
}

export interface ValidationReport {
  issues: ImportIssue[];
  readyCount: number;
  warningCount: number;
  blockedCount: number;
  /** Rows excluded by the user are not counted as blocked. */
  includedCount: number;
}

/** Normalised product produced by the staging table for one row. */
export interface ImportProductDraft {
  rowId: string;
  rowNumber: number;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category: string;
  price: number | null;
  salePrice: number | null;
  costPrice: number | null;
  bulkPricing: Array<{ minQty: number; price: number }>;
  stock: number | null;
  unit: string;
  variants: Array<{ name: string; price: number | null }>;
  images: string[];
  /** Unmapped source columns preserved verbatim — never discarded. */
  extra: Record<string, string>;
  /** Bulk action: publish immediately after import (still validation-gated). */
  publishAfterImport?: boolean;
  /** Bulk action / warning: flag the imported product for manual review. */
  markForReview?: boolean;
  /**
   * Bulk action: let the product fall back to its category's image when it
   * has none of its own. Resolved at display time — never copied into
   * `images`, so a later category image change propagates automatically.
   */
  useCategoryImage?: boolean;
}

export interface ImportBatchResult {
  batchId: string;
  fileName: string;
  importedAt: number;
  imported: number;
  /** Products that passed the "publish after import" bulk action + validation. */
  published: number;
  needsReview: number;
  failed: number;
  skippedDuplicates: number;
  failures: Array<{ rowNumber: number; name: string; message: string; draft: ImportProductDraft }>;
}

export type ImportedProductStatus = 'draft' | 'published';

/** A product created by the bulk importer, persisted in `importedProductStore`. */
export interface ImportedProduct {
  id: string;
  batchId: string;
  rowNumber: number;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category: string;
  price: number | null;
  salePrice: number | null;
  costPrice: number | null;
  bulkPricing: Array<{ minQty: number; price: number }>;
  stock: number | null;
  unit: string;
  variants: Array<{ name: string; price: number | null }>;
  images: string[];
  extra: Record<string, string>;
  /** Imported products are drafts by default and never go live automatically. */
  status: ImportedProductStatus;
  needsReview: boolean;
  /**
   * When true the product may display its category's image while it has none
   * of its own. The category image is resolved live and never copied into
   * `images`, so updating or removing the category image propagates here.
   */
  useCategoryImage?: boolean;
  /**
   * Bulk-action flag: this product is linked to a deal. Deal terms themselves
   * are configured in the Deals workspace — this only records the link so the
   * catalogue's "Deal Linked" filter reflects the merchant's own choice.
   */
  linkedDeal?: boolean;
  createdAt: number;
  updatedAt: number;
}
