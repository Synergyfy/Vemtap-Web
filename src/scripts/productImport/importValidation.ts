import type { ImportIssue, ImportProductDraft, ValidationReport } from './importTypes';

/**
 * Validation for the import preview (Step 5).
 *
 * Blocking errors prevent a row from being imported: missing product name,
 * missing/unparseable selling price, and duplicate SKUs inside the file.
 * Everything else — missing images, missing categories, suspicious margins,
 * possible duplicates of existing catalogue items — is a warning that imports
 * the product as "needs review" instead of failing it.
 */

/** Names/SKUs already in the catalogue, used for duplicate detection. */
export interface ExistingCatalogueIndex {
  skus: Set<string>;
  names: Set<string>;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function buildCatalogueIndex(existing: Array<{ name: string; sku?: string }>): ExistingCatalogueIndex {
  const skus = new Set<string>();
  const names = new Set<string>();
  for (const item of existing) {
    if (item.sku?.trim()) skus.add(item.sku.trim().toLowerCase());
    if (item.name?.trim()) names.add(normalizeName(item.name));
  }
  return { skus, names };
}

const EMPTY_INDEX: ExistingCatalogueIndex = { skus: new Set(), names: new Set() };

export function validateImportDrafts(
  drafts: ImportProductDraft[],
  existing: ExistingCatalogueIndex = EMPTY_INDEX,
): ValidationReport {
  const issues: ImportIssue[] = [];

  // In-file duplicate SKUs: every colliding row is flagged, none is auto-merged.
  const skuCounts = new Map<string, number>();
  for (const draft of drafts) {
    const sku = draft.sku.trim().toLowerCase();
    if (sku) skuCounts.set(sku, (skuCounts.get(sku) ?? 0) + 1);
  }
  const nameCounts = new Map<string, number>();
  for (const draft of drafts) {
    const name = normalizeName(draft.name);
    if (name) nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
  }

  for (const draft of drafts) {
    const push = (severity: ImportIssue['severity'], field: ImportIssue['field'], message: string) =>
      issues.push({ rowId: draft.rowId, rowNumber: draft.rowNumber, severity, field, message });

    if (!draft.name.trim()) push('blocking', 'name', 'Product name is missing.');
    if (draft.price === null) {
      push('blocking', 'price', 'Selling price is missing or not a number.');
    } else if (draft.price < 0) {
      push('blocking', 'price', 'Selling price cannot be negative.');
    }

    const sku = draft.sku.trim();
    if (sku && (skuCounts.get(sku.toLowerCase()) ?? 0) > 1) {
      push('blocking', 'sku', `Duplicate SKU "${sku}" appears multiple times in this file.`);
    }
    if (!sku && !draft.barcode.trim()) {
      push('warning', 'sku', 'No SKU or barcode — we will generate an SKU on import.');
    }
    if (sku && existing.skus.has(sku.toLowerCase())) {
      push('warning', 'sku', `SKU "${sku}" already exists in your catalogue — this may be a duplicate product.`);
    }

    const name = normalizeName(draft.name);
    if (name && (nameCounts.get(name) ?? 0) > 1) {
      push('warning', 'name', 'Another row in this file has the same product name.');
    } else if (name && existing.names.has(name)) {
      push('warning', 'name', 'A product with this name already exists in your catalogue.');
    }

    if (draft.salePrice !== null) {
      if (draft.salePrice < 0) push('blocking', 'salePrice', 'Sale price cannot be negative.');
      else if (draft.price !== null && draft.salePrice >= draft.price) {
        push('warning', 'salePrice', 'Sale price is not lower than the selling price.');
      }
    }
    if (draft.costPrice !== null && draft.price !== null && draft.costPrice > draft.price) {
      push('warning', 'costPrice', 'Cost price is higher than the selling price (negative margin).');
    }
    if (draft.stock !== null && draft.stock < 0) {
      push('blocking', 'stock', 'Stock quantity cannot be negative.');
    }
    if (!draft.category.trim()) {
      push('warning', 'category', 'No category — the product will be placed in General.');
    }
    if (draft.variants.some((variant) => variant.name.trim() === '')) {
      push('warning', 'variants', 'A variant has no name.');
    }
    if (draft.bulkPricing.length > 0 && draft.bulkPricing.some((tier) => tier.price >= (draft.price ?? Infinity))) {
      push('warning', 'bulkPrice', 'A bulk tier price is not below the regular price.');
    }
    // Missing/unavailable images are warnings only — they never block import.
    if (draft.images.length === 0) {
      push(
        'warning',
        'image',
        draft.useCategoryImage
          ? 'No image — the category image is used when that category has one, otherwise add one after import.'
          : 'No image — you can add one after import.',
      );
    }
  }

  const blockedRows = new Set(issues.filter((issue) => issue.severity === 'blocking').map((issue) => issue.rowId));
  const warningRows = new Set(issues.filter((issue) => issue.severity === 'warning').map((issue) => issue.rowId));

  let warningCount = 0;
  let blockedCount = 0;
  for (const draft of drafts) {
    if (blockedRows.has(draft.rowId)) blockedCount += 1;
    else if (warningRows.has(draft.rowId)) warningCount += 1;
  }

  return {
    issues,
    readyCount: drafts.length - blockedCount - warningCount,
    warningCount,
    blockedCount,
    includedCount: drafts.length - blockedCount,
  };
}

/** True when a draft can be published (required fields present). Images are optional. */
export function canPublishDraft(draft: Pick<ImportProductDraft, 'name' | 'price'>): boolean {
  return draft.name.trim() !== '' && draft.price !== null && draft.price >= 0;
}
