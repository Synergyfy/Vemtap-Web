import { useCallback, useEffect, useState } from 'react';
import type { ImportBatchResult, ImportProductDraft, ImportedProduct, ImportedProductStatus } from './importTypes';
import { canPublishDraft } from './importValidation';

/**
 * Persisted store for products created by the Bulk Product Import.
 *
 * Follows the in-app data conventions (module-level store, like the category
 * store in `catalogueData.ts`) but additionally persists to localStorage so
 * imported drafts survive reloads — the same persistence style used by every
 * business context (e.g. `ProfileContext`, `PosOfflineContext`).
 *
 * This module is the single integration point for a future backend: each
 * function maps 1:1 onto the REST resources documented in
 * `platformConnectors.ts` (POST /products/import, PATCH /products/:id, ...).
 * There is currently no network layer anywhere in this app (see
 * `OrdersContext.tsx` "backend gap" notes), so nothing here pretends to call
 * one.
 */

const STORAGE_KEY = 'vemtap.importedProducts.v1';

let cache: ImportedProduct[] | null = null;
const listeners = new Set<() => void>();

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null; // Storage can throw in private-browsing modes.
  }
}

function loadFromStorage(): ImportedProduct[] {
  const storage = safeStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ImportedProduct[]) : [];
  } catch {
    return [];
  }
}

function persist(): void {
  const storage = safeStorage();
  if (!storage || cache === null) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Quota exceeded (usually base64 images). Keep working from memory and
    // retry with the image payloads trimmed so the catalogue still functions.
    try {
      const trimmed = cache.map((product) =>
        product.images.some((image) => image.startsWith('data:'))
          ? { ...product, images: product.images.filter((image) => !image.startsWith('data:')) }
          : product,
      );
      storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      /* memory-only for this session; the UI surfaces a storage warning */
    }
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function listImportedProducts(): ImportedProduct[] {
  if (cache === null) cache = loadFromStorage();
  return cache;
}

function write(next: ImportedProduct[]): void {
  cache = next;
  persist();
  notify();
}

/** Subscribes to store changes; returns an unsubscribe function. */
export function subscribeImportedProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface SaveImportOptions {
  /** Existing SKUs in the catalogue (from the seed rows) for duplicate protection. */
  existingSkus?: Set<string>;
  /** rowIds whose drafts carried validation warnings — flagged for review. */
  needsReviewRowIds?: Set<string>;
}

/**
 * Persists a batch of imported drafts. Imported products default to draft —
 * they only go live when a draft carried the explicit "publish after import"
 * bulk intent *and* passes required-field validation (see `canPublishDraft`).
 * SKUs that already exist (in the store or in `existingSkus`) are skipped,
 * never overwritten.
 */
export function saveImportedProducts(
  batch: Pick<ImportBatchResult, 'batchId' | 'fileName' | 'importedAt'>,
  drafts: ImportProductDraft[],
  options: SaveImportOptions = {},
): { saved: ImportedProduct[]; skippedDuplicates: number; published: number } {
  const current = listImportedProducts();
  const takenSkus = new Set<string>(current.map((product) => product.sku.trim().toLowerCase()).filter(Boolean));
  for (const sku of options.existingSkus ?? []) takenSkus.add(sku.trim().toLowerCase());

  const now = Date.now();
  const saved: ImportedProduct[] = [];
  let skippedDuplicates = 0;

  for (const draft of drafts) {
    const sku = draft.sku.trim().toLowerCase();
    if (sku && takenSkus.has(sku)) {
      skippedDuplicates += 1;
      continue;
    }
    if (sku) takenSkus.add(sku);

    // "Publish after import" is a bulk *intent*, never a validation bypass:
    // a row missing a name or price is still saved as a review-flagged draft.
    const publishable = canPublishDraft(draft);
    const publishNow = draft.publishAfterImport === true && publishable;

    saved.push({
      id: `imp_${now.toString(36)}_${draft.rowId}`,
      batchId: batch.batchId,
      rowNumber: draft.rowNumber,
      name: draft.name.trim(),
      description: draft.description.trim(),
      sku: draft.sku.trim(),
      barcode: draft.barcode.trim(),
      category: draft.category.trim() || 'General',
      price: draft.price,
      salePrice: draft.salePrice,
      costPrice: draft.costPrice,
      bulkPricing: draft.bulkPricing,
      stock: draft.stock,
      unit: draft.unit.trim(),
      variants: draft.variants,
      images: draft.images,
      extra: draft.extra,
      status: publishNow ? 'published' : 'draft',
      needsReview:
        !publishNow &&
        (options.needsReviewRowIds?.has(draft.rowId) === true ||
          draft.markForReview === true ||
          (draft.publishAfterImport === true && !publishable)),
      useCategoryImage: draft.useCategoryImage === true,
      createdAt: now,
      updatedAt: now,
    });
  }

  write([...saved, ...current]);
  return {
    saved,
    skippedDuplicates,
    published: saved.filter((product) => product.status === 'published').length,
  };
}

/** Applies a partial update to one imported product. */
export function updateImportedProduct(id: string, patch: Partial<ImportedProduct>): ImportedProduct | null {
  const current = listImportedProducts();
  let updated: ImportedProduct | null = null;
  const next = current.map((product) => {
    if (product.id !== id) return product;
    updated = { ...product, ...patch, updatedAt: Date.now() };
    return updated;
  });
  if (updated) write(next);
  return updated;
}

/**
 * Removes imported products. Returns how many were actually removed, so bulk
 * callers can report partial results honestly (e.g. a row deleted twice).
 */
export function removeImportedProducts(ids: string[]): number {
  const idSet = new Set(ids);
  const current = listImportedProducts();
  const next = current.filter((product) => !idSet.has(product.id));
  const removed = current.length - next.length;
  if (removed > 0) write(next);
  return removed;
}

export interface PublishCheck {
  published: string[];
  /** ids that failed required-field validation (images are never required). */
  blocked: string[];
}

/**
 * Publishes imported products after required-field validation. Missing images
 * alone never block publication.
 */
export function publishImportedProducts(ids: string[]): PublishCheck {
  const idSet = new Set(ids);
  const published: string[] = [];
  const blocked: string[] = [];
  const current = listImportedProducts();
  const next = current.map((product) => {
    if (!idSet.has(product.id)) return product;
    const valid = product.name.trim() !== '' && product.price !== null && product.price >= 0;
    if (!valid) {
      blocked.push(product.id);
      return { ...product, needsReview: true };
    }
    published.push(product.id);
    return { ...product, status: 'published' as ImportedProductStatus, needsReview: false, updatedAt: Date.now() };
  });
  if (published.length > 0 || blocked.length > 0) write(next);
  return { published, blocked };
}

/** Reverts published imported products back to draft. */
export function unpublishImportedProducts(ids: string[]): void {
  const idSet = new Set(ids);
  write(
    listImportedProducts().map((product) =>
      idSet.has(product.id) ? { ...product, status: 'draft' as ImportedProductStatus, updatedAt: Date.now() } : product,
    ),
  );
}

/**
 * Bulk-sets (or clears) the Needs Review flag on the given imported products.
 * Returns how many products actually changed, so callers can report partial
 * results instead of assuming every id matched.
 */
export function setImportedNeedsReview(ids: string[], needsReview: boolean): number {
  const idSet = new Set(ids);
  let changed = 0;
  const next = listImportedProducts().map((product) => {
    if (!idSet.has(product.id) || product.needsReview === needsReview) return product;
    changed += 1;
    return { ...product, needsReview, updatedAt: Date.now() };
  });
  if (changed > 0) write(next);
  return changed;
}

/**
 * Bulk-links (or unlinks) imported products to a deal. Deal terms live in the
 * Deals workspace — this only records the link on the product. Returns how
 * many products actually changed so callers can report partial results.
 */
export function setImportedLinkedDeal(ids: string[], linkedDeal: boolean): number {
  const idSet = new Set(ids);
  let changed = 0;
  const next = listImportedProducts().map((product) => {
    if (!idSet.has(product.id) || (product.linkedDeal === true) === linkedDeal) return product;
    changed += 1;
    return { ...product, linkedDeal, updatedAt: Date.now() };
  });
  if (changed > 0) write(next);
  return changed;
}

/**
 * Resolves the image a product should display, preferring its own image and
 * falling back to the category image when the product opted in and has none.
 * Purely a display fallback: the category image is looked up live (never
 * copied into `product.images`) so later category edits propagate.
 *
 * Returns `undefined` when nothing is available — callers keep their existing
 * placeholder. Category lookup is injected to keep this module DOM/dep-free.
 */
export function resolveProductDisplayImage(
  product: Pick<ImportedProduct, 'images' | 'useCategoryImage' | 'category'>,
  findCategoryImage?: (categoryName: string) => string | undefined,
): string | undefined {
  const own = product.images.find((image) => image.trim() !== '');
  if (own) return own;
  if (!product.useCategoryImage) return undefined;
  return findCategoryImage?.(product.category) || undefined;
}

export function findImportedBySku(sku: string): ImportedProduct | undefined {
  const needle = sku.trim().toLowerCase();
  if (!needle) return undefined;
  return listImportedProducts().find((product) => product.sku.trim().toLowerCase() === needle);
}

/** React hook: subscribes to the store and re-renders on change. */
export function useImportedProducts(): ImportedProduct[] {
  const [products, setProducts] = useState<ImportedProduct[]>(() => listImportedProducts());
  useEffect(() => subscribeImportedProducts(() => setProducts(listImportedProducts())), []);
  const refresh = useCallback(() => setProducts(listImportedProducts()), []);
  void refresh;
  return products;
}
