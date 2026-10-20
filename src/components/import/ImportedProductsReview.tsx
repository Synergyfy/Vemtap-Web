import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import { BulkActionsBar, type BulkAction } from '../BulkActionsBar';
import { ConfirmActionDialog } from '../ConfirmActionDialog';
import { naira, getCentralCategories, getCategoryImageByName } from '../../scripts/catalogueData';
import {
  publishImportedProducts,
  removeImportedProducts,
  resolveProductDisplayImage,
  setImportedNeedsReview,
  unpublishImportedProducts,
  updateImportedProduct,
  useImportedProducts,
} from '../../scripts/productImport/importedProductStore';
import { compressImageFile } from '../../scripts/productImport/importImages';
import type { ImportedProduct } from '../../scripts/productImport/importTypes';

interface ImportedProductsReviewProps {
  onBack?: () => void;
}

type FilterKey = 'all' | 'draft' | 'published' | 'review';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'published', label: 'Published' },
  { key: 'review', label: 'Needs review' },
];

function statusPill(product: ImportedProduct) {
  if (product.status === 'published') {
    return (
      <span className="inline-flex items-center gap-1 px-space-2xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
        <Icon name="check_circle" className="text-[12px]" />
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-space-2xs py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-[11px] font-semibold">
      <Icon name="edit_note" className="text-[12px]" />
      Draft
    </span>
  );
}

function canPublish(product: ImportedProduct): boolean {
  return product.name.trim() !== '' && product.price !== null && product.price >= 0;
}

/**
 * Post-import review: edit details, manage images, and publish imported
 * products individually or in bulk. Required-field validation gates
 * publication; missing images never do.
 */
export function ImportedProductsReview({ onBack }: ImportedProductsReviewProps) {
  const products = useImportedProducts();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ ids: string[]; count: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    price: '',
    salePrice: '',
    costPrice: '',
    stock: '',
    unit: '',
    description: '',
  });

  const categoryOptions = useMemo(() => getCentralCategories('product').map((category) => category.name), []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const visible = products.filter((product) => {
    if (filter === 'draft' && product.status !== 'draft') return false;
    if (filter === 'published' && product.status !== 'published') return false;
    if (filter === 'review' && !(product.needsReview || !canPublish(product))) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      product.name.toLowerCase().includes(needle) ||
      product.sku.toLowerCase().includes(needle) ||
      product.category.toLowerCase().includes(needle)
    );
  });

  const draftCount = products.filter((product) => product.status === 'draft').length;
  const reviewCount = products.filter((product) => product.needsReview).length;

  // Keep the selection inside the currently shown list: switching a filter or
  // searching drops rows that are no longer visible, so a bulk action can only
  // ever touch products the merchant can actually see (and the "N selected"
  // count always matches what will be acted on).
  useEffect(() => {
    const visibleIds = new Set(visible.map((product) => product.id));
    setSelected((previous) => {
      const next = new Set<string>();
      previous.forEach((id) => {
        if (visibleIds.has(id)) next.add(id);
      });
      return next.size === previous.size ? previous : next;
    });
  }, [visible]);

  const startEdit = (product: ImportedProduct) => {
    setEditForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      price: product.price === null ? '' : String(product.price),
      salePrice: product.salePrice === null ? '' : String(product.salePrice),
      costPrice: product.costPrice === null ? '' : String(product.costPrice),
      stock: product.stock === null ? '' : String(product.stock),
      unit: product.unit,
      description: product.description,
    });
    setEditingId(product.id);
  };

  const saveEdit = (product: ImportedProduct) => {
    const price = editForm.price.trim() === '' ? null : Number(editForm.price.replace(/[^\d.]/g, ''));
    updateImportedProduct(product.id, {
      name: editForm.name.trim(),
      sku: editForm.sku.trim(),
      barcode: editForm.barcode.trim(),
      category: editForm.category.trim() || 'General',
      price: price !== null && Number.isFinite(price) ? price : null,
      salePrice: editForm.salePrice.trim() === '' ? null : Number(editForm.salePrice.replace(/[^\d.]/g, '')) || null,
      costPrice: editForm.costPrice.trim() === '' ? null : Number(editForm.costPrice.replace(/[^\d.]/g, '')) || null,
      stock: editForm.stock.trim() === '' ? null : Number(editForm.stock.replace(/[^\d]/g, '')),
      unit: editForm.unit.trim(),
      description: editForm.description.trim(),
    });
    setEditingId(null);
    showToast('Product updated.');
  };

  const handleUpload = async (files: FileList | null) => {
    const productId = uploadTargetId.current;
    const file = files?.[0];
    if (!productId || !file) return;
    setImageBusy(true);
    try {
      const dataUrl = await compressImageFile(file);
      const product = products.find((entry) => entry.id === productId);
      updateImportedProduct(productId, { images: [...(product?.images ?? []), dataUrl].slice(0, 6) });
      showToast('Image added.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not read that image.');
    } finally {
      setImageBusy(false);
    }
  };

  const handlePublish = (ids: string[]) => {
    const { published, blocked } = publishImportedProducts(ids);
    const parts: string[] = [];
    if (published.length > 0) parts.push(`Published ${published.length} product${published.length === 1 ? '' : 's'}.`);
    if (blocked.length > 0) {
      const names = blocked
        .map((id) => products.find((product) => product.id === id)?.name?.trim())
        .filter((name): name is string => Boolean(name))
        .slice(0, 3);
      parts.push(
        `${blocked.length} couldn't publish (missing name or price)${names.length > 0 ? `: ${names.join(', ')}` : ''}. ${
          blocked.length <= 5 ? 'Use Edit to fix them.' : ''
        }`.trim(),
      );
    }
    showToast(parts.join(' ') || 'Nothing to publish.');
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  /** Selects every product in the *current filtered view* — never hidden ones. */
  const selectAllFiltered = () => setSelected(new Set(visible.map((product) => product.id)));
  const clearSelection = () => setSelected(new Set());

  const selectedPublishable = visible.filter((product) => selected.has(product.id) && canPublish(product)).map((p) => p.id);

  /**
   * Applies one bulk action to the selected products only. Ids are
   * intersected with the visible list so a product filtered out of view can
   * never be modified by accident, and each action reports partial results.
   */
  const applyBulkAction = (action: string) => {
    const ids = visible.filter((product) => selected.has(product.id)).map((product) => product.id);
    if (ids.length === 0) {
      showToast('Select at least one product first.');
      return;
    }

    if (action === 'delete') {
      setDeleteConfirm({ ids, count: ids.length });
      return;
    }

    if (action === 'publish') {
      handlePublish(ids);
      return;
    }

    if (action === 'draft') {
      const alreadyDraft = visible.filter((product) => selected.has(product.id) && product.status === 'draft').length;
      unpublishImportedProducts(ids);
      const changed = ids.length - alreadyDraft;
      showToast(
        changed > 0
          ? `${changed} product${changed === 1 ? '' : 's'} moved back to draft.`
          : 'Those products were already drafts.',
      );
      clearSelection();
      return;
    }

    if (action === 'review') {
      const changed = setImportedNeedsReview(ids, true);
      showToast(
        changed > 0
          ? `${changed} product${changed === 1 ? '' : 's'} marked as needing review.`
          : 'Those products were already flagged for review.',
      );
      clearSelection();
      return;
    }

    if (action === 'clearReview') {
      const changed = setImportedNeedsReview(ids, false);
      showToast(
        changed > 0
          ? `Review flag cleared on ${changed} product${changed === 1 ? '' : 's'}.`
          : 'No products in this selection were flagged.',
      );
      clearSelection();
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    try {
      const removed = removeImportedProducts(deleteConfirm.ids);
      const missing = deleteConfirm.count - removed;
      showToast(
        `Deleted ${removed} product${removed === 1 ? '' : 's'} from imported products.` +
          (missing > 0 ? ` ${missing} were already gone.` : ''),
      );
      clearSelection();
    } catch {
      showToast('Some products could not be deleted. Refresh and try again.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const bulkActions: BulkAction[] = [
    { value: 'publish', label: 'Publish', hint: 'Products missing a name or price are skipped and flagged instead.' },
    { value: 'draft', label: 'Move to Draft' },
    { value: 'review', label: 'Mark as Needs Review' },
    { value: 'clearReview', label: 'Clear Needs Review' },
    { value: 'delete', label: 'Delete' },
  ];

  return (
    <div className="flex flex-col gap-space-sm relative">
      {/* Header */}
      <div className="flex items-center gap-space-sm">
        {onBack && (
          <button
            type="button"
            aria-label="Back to catalogue"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary transition-colors shrink-0"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
        )}
        <div className="flex flex-col min-w-0">
          <h2 className="font-heading-md text-heading-md text-text-primary">Imported products</h2>
          <p className="font-caption text-caption text-text-secondary">
            {products.length.toLocaleString()} imported · {draftCount.toLocaleString()} drafts ·{' '}
            {reviewCount.toLocaleString()} need review
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl bg-surface-container-low p-space-xl flex flex-col items-center text-center">
          <span className="w-14 h-14 rounded-full bg-surface-container-high text-text-tertiary flex items-center justify-center mb-space-sm">
            <Icon name="upload_file" className="text-[28px]" />
          </span>
          <span className="font-heading-sm text-heading-sm text-text-primary">No imported products yet</span>
          <span className="font-caption text-caption text-text-secondary mt-space-2xs max-w-xs">
            Use Bulk Import from the Add Product menu to bring in a CSV or Excel file. Everything lands here as a
            draft until you publish it.
          </span>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-space-xs">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]" />
              <input
                aria-label="Search imported products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, SKU, category…"
                className="w-full h-10 bg-surface-container-low rounded-xl pl-10 pr-3 font-body-md text-body-md outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] transition-all"
              />
            </div>
            <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar">
              {FILTERS.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => setFilter(entry.key)}
                  className={`px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors ${
                    filter === entry.key
                      ? 'bg-surface-tint-blue text-primary font-semibold'
                      : 'bg-surface-container-high text-text-secondary hover:bg-surface-container'
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk actions (WordPress-style) — always visible so the affordance is discoverable */}
          <BulkActionsBar
            selectedCount={selected.size}
            filteredCount={visible.length}
            totalCount={products.length}
            scopeNoun="products"
            actions={bulkActions}
            onApply={applyBulkAction}
            onSelectAllFiltered={selectAllFiltered}
            onClearSelection={clearSelection}
          />

          {selectedPublishable.length > 0 && selectedPublishable.length < selected.size && (
            <div className="rounded-xl bg-error-container/60 px-space-sm py-space-2xs font-caption text-caption text-on-error-container flex items-center gap-space-2xs">
              <Icon name="priority_high" className="text-[15px] shrink-0" />
              <span>
                {selected.size - selectedPublishable.length} of the {selected.size.toLocaleString()} selected
                products are missing a name or price, so they can&apos;t be published. Fix them with Edit, or use
                &ldquo;Mark as Needs Review&rdquo; instead.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-space-xs">
            {visible.length === 0 && (
              <div className="rounded-xl bg-surface-container-low p-space-lg text-center font-caption text-caption text-text-secondary">
                No imported products match this filter.
              </div>
            )}
            {visible.map((product) => {
              const editing = editingId === product.id;
              const publishable = canPublish(product);
              const displayImage = resolveProductDisplayImage(product, getCategoryImageByName);
              const showingCategoryImage = !product.images[0] && Boolean(displayImage);
              return (
                <div key={product.id} className="rounded-xl border border-border-subtle bg-surface-canvas overflow-hidden">
                  <div className="flex gap-space-sm p-space-sm">
                    {/* Thumbnails */}
                    <div className="flex gap-space-2xs shrink-0">
                      {product.images.length > 0 ? (
                        product.images.slice(0, 2).map((image, index) => (
                          <span key={`${product.id}-${index}`} className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container block">
                            <img alt={`${product.name} image ${index + 1}`} className="w-full h-full object-cover" src={image} />
                          </span>
                        ))
                      ) : showingCategoryImage && displayImage ? (
                        /* Fallback to the category image (resolved live, never copied onto the product). */
                        <span
                          className="relative w-14 h-14 rounded-lg overflow-hidden bg-surface-container block"
                          title={`Category image for ${product.category}`}
                        >
                          <img alt={`${product.category} category image`} className="w-full h-full object-cover" src={displayImage} />
                          <span className="absolute bottom-0 inset-x-0 bg-black/55 text-white text-[8px] leading-tight text-center font-semibold uppercase tracking-wide py-px">
                            Category
                          </span>
                        </span>
                      ) : (
                        <span className="w-14 h-14 rounded-lg bg-surface-container-high text-text-tertiary flex flex-col items-center justify-center">
                          <Icon name="hide_image" className="text-[18px]" />
                          <span className="text-[9px] font-semibold uppercase">No image</span>
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-space-xs">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-space-2xs">
                            <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                              {product.name || '(missing name)'}
                            </span>
                            {statusPill(product)}
                            {product.needsReview && (
                              <span className="px-space-2xs py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-[11px] font-semibold">
                                Needs review
                              </span>
                            )}
                            {!publishable && (
                              <span className="px-space-2xs py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-[11px] font-semibold">
                                Can&apos;t publish yet
                              </span>
                            )}
                          </div>
                          <span className="font-caption text-caption text-text-secondary block mt-0.5 truncate">
                            <span className="font-mono">{product.sku || 'no SKU'}</span> • {product.category}
                            {product.stock !== null && ` • stock ${product.stock} ${product.unit || 'units'}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-2xs shrink-0">
                          <input
                            aria-label={`Select ${product.name || 'product'}`}
                            type="checkbox"
                            className="rounded text-primary cursor-pointer"
                            checked={selected.has(product.id)}
                            onChange={() => toggleSelect(product.id)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-space-xs mt-space-2xs">
                        <span className="font-label-md text-label-md text-text-primary font-bold">
                          {product.salePrice !== null && product.price !== null && product.salePrice < product.price
                            ? naira(product.salePrice)
                            : product.price !== null
                              ? naira(product.price)
                              : '—'}
                        </span>
                        {product.salePrice !== null && product.price !== null && product.salePrice < product.price && (
                          <span className="font-caption text-caption text-text-tertiary line-through">{naira(product.price)}</span>
                        )}
                        {product.costPrice !== null && (
                          <span className="font-caption text-caption text-text-secondary">cost {naira(product.costPrice)}</span>
                        )}
                        {product.bulkPricing.length > 0 && (
                          <span className="font-caption text-caption text-text-secondary">
                            {product.bulkPricing.length} bulk tier{product.bulkPricing.length === 1 ? '' : 's'}
                          </span>
                        )}
                        {product.variants.length > 0 && (
                          <span className="font-caption text-caption text-text-secondary">
                            {product.variants.length} variant{product.variants.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>

                      {/* Action row */}
                      <div className="flex flex-wrap items-center gap-space-xs mt-space-xs">
                        {editing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(product)}
                              className="px-space-xs py-1 rounded-md bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary transition-colors"
                            >
                              Save changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-space-xs py-1 rounded-md text-text-secondary font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(product)}
                              className="inline-flex items-center gap-1 px-space-xs py-1 rounded-md bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-tint-blue transition-colors"
                            >
                              <Icon name="edit" className="text-[14px]" />
                              <span>Edit</span>
                            </button>
                            {product.status === 'draft' ? (
                              <button
                                type="button"
                                disabled={!publishable}
                                title={publishable ? 'Publish this product' : 'Add a name and price first'}
                                onClick={() => handlePublish([product.id])}
                                className="inline-flex items-center gap-1 px-space-xs py-1 rounded-md bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold disabled:opacity-40 hover:bg-badge-discount-text hover:text-on-primary transition-colors"
                              >
                                <Icon name="publish" className="text-[14px]" />
                                <span>Publish</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  unpublishImportedProducts([product.id]);
                                  showToast('Moved back to draft.');
                                }}
                                className="inline-flex items-center gap-1 px-space-xs py-1 rounded-md bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors"
                              >
                                <Icon name="unpublished" className="text-[14px]" />
                                <span>Unpublish</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({ ids: [product.id], count: 1 })
                              }
                              className="inline-flex items-center gap-1 px-space-xs py-1 rounded-md text-text-tertiary font-label-sm text-label-sm font-semibold hover:text-error transition-colors"
                            >
                              <Icon name="delete" className="text-[14px]" />
                              <span>Remove</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline editor */}
                  {editing && (
                    <div className="border-t border-border-subtle bg-surface-subtle/50 p-space-sm grid grid-cols-1 md:grid-cols-3 gap-space-xs">
                      {[
                        { key: 'name', label: 'Product name *', span: 'md:col-span-2' },
                        { key: 'sku', label: 'SKU' },
                        { key: 'category', label: 'Category' },
                        { key: 'price', label: 'Selling price *' },
                        { key: 'salePrice', label: 'Sale price' },
                        { key: 'costPrice', label: 'Cost price' },
                        { key: 'stock', label: 'Stock' },
                        { key: 'unit', label: 'Unit' },
                        { key: 'barcode', label: 'Barcode' },
                      ].map((field) => (
                        <label key={field.key} className={`flex flex-col gap-space-2xs ${field.span ?? ''}`}>
                          <span className="font-caption text-caption text-text-secondary">{field.label}</span>
                          <input
                            value={editForm[field.key as keyof typeof editForm]}
                            list={field.key === 'category' ? 'import-review-categories' : undefined}
                            onChange={(event) => setEditForm((previous) => ({ ...previous, [field.key]: event.target.value }))}
                            className="h-9 bg-surface-canvas rounded-lg px-space-xs font-body-md text-body-md outline-none focus:shadow-[0_0_0_2px_#066cf4]"
                          />
                        </label>
                      ))}
                      <datalist id="import-review-categories">
                        {categoryOptions.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                      <label className="flex flex-col gap-space-2xs md:col-span-3">
                        <span className="font-caption text-caption text-text-secondary">Description</span>
                        <textarea
                          rows={2}
                          value={editForm.description}
                          onChange={(event) => setEditForm((previous) => ({ ...previous, description: event.target.value }))}
                          className="bg-surface-canvas rounded-lg px-space-xs py-space-2xs font-body-md text-body-md outline-none focus:shadow-[0_0_0_2px_#066cf4]"
                        />
                      </label>
                      <div className="md:col-span-3 flex flex-wrap items-center gap-space-xs">
                        <button
                          type="button"
                          disabled={imageBusy}
                          onClick={() => {
                            uploadTargetId.current = product.id;
                            fileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-1 px-space-xs py-1 rounded-md bg-surface-canvas border border-border-subtle text-primary font-label-sm text-label-sm font-semibold disabled:opacity-40 hover:bg-surface-tint-blue transition-colors"
                        >
                          <Icon name={imageBusy ? 'progress_activity' : 'upload'} className={`text-[14px] ${imageBusy ? 'animate-spin' : ''}`} />
                          <span>{product.images.length > 0 ? 'Add / replace image' : 'Upload image'}</span>
                        </button>
                        {product.images.length > 0 && (
                          <button
                            type="button"
                            onClick={() => updateImportedProduct(product.id, { images: [] })}
                            className="inline-flex items-center gap-1 px-space-xs py-1 rounded-md text-text-tertiary font-label-sm text-label-sm font-semibold hover:text-error transition-colors"
                          >
                            <Icon name="delete" className="text-[14px]" />
                            <span>Remove images</span>
                          </button>
                        )}
                        <span className="font-caption text-caption text-text-tertiary">
                          Images are optional and never block publishing.
                        </span>
                      </div>

                      {/* Category image fallback — a display fallback, never copied onto the product */}
                      <label className="md:col-span-3 flex items-start gap-space-xs bg-surface-canvas rounded-lg p-space-xs border border-border-subtle cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded text-primary cursor-pointer mt-0.5 shrink-0"
                          checked={product.useCategoryImage === true}
                          onChange={(event) =>
                            updateImportedProduct(product.id, { useCategoryImage: event.target.checked })
                          }
                        />
                        <span className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                            Use the {product.category} category image when this product has none
                          </span>
                          <span className="font-caption text-caption text-text-secondary">
                            A fallback only — the product keeps its own image whenever it has one, and the category
                            image stays linked (so editing it updates this product too).
                          </span>
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void handleUpload(event.target.files);
              event.target.value = '';
            }}
          />
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-on-surface text-surface-canvas px-space-md py-space-xs rounded-xl shadow-2xl font-label-md text-label-md max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      <ConfirmActionDialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        tone="danger"
        title={`Delete ${deleteConfirm?.count ?? 0} product${deleteConfirm?.count === 1 ? '' : 's'}?`}
        message={
          deleteConfirm?.count === 1
            ? 'This permanently removes this product from your catalogue. Your original CSV or Excel file is untouched, and you can import it again later.'
            : `This permanently removes the ${deleteConfirm?.count ?? 0} selected products from your catalogue. Your original CSV or Excel file is untouched, and you can import it again later.`
        }
        bullets={[
          'Published products disappear from your storefront immediately.',
          'Images you uploaded to these products are removed too.',
          'Duplicate protection will let the same SKU be re-imported afterwards.',
        ]}
        confirmLabel={`Delete ${deleteConfirm?.count ?? 0} product${deleteConfirm?.count === 1 ? '' : 's'}`}
      />
    </div>
  );
}
