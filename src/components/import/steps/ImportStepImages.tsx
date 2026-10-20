import { useMemo, useRef, useState } from 'react';
import { Icon } from '../../ui/Icon';
import {
  MAX_IMAGES_PER_PRODUCT,
  compressImageFile,
  extractImagesFromZip,
  matchImagesToProducts,
  verifyImageUrls,
  type UrlCheck,
} from '../../../scripts/productImport/importImages';
import type { ImportProductDraft, StagedRow } from '../../../scripts/productImport/importTypes';

const PAGE_SIZE = 12;

interface ImportStepImagesProps {
  rows: StagedRow[];
  /** Current drafts (SKU/name) used to match bulk & ZIP uploads to products. */
  draftByRowId: Map<string, ImportProductDraft>;
  onRowsChange: (updater: (prev: StagedRow[]) => StagedRow[]) => void;
  onCommit: () => void;
}

/** Step 4 — image URLs, per-product uploads, bulk & ZIP uploads. Optional. */
export function ImportStepImages({ rows, draftByRowId, onRowsChange, onCommit }: ImportStepImagesProps) {
  const [page, setPage] = useState(0);
  const [busy, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [urlChecks, setUrlChecks] = useState<UrlCheck[] | null>(null);
  const [checking, setChecking] = useState(false);

  const bulkInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const perRowInputRef = useRef<HTMLInputElement>(null);
  const pendingRowId = useRef<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const urlStatus = useMemo(() => {
    const map = new Map<string, boolean>();
    urlChecks?.forEach((check) => map.set(check.url, check.ok));
    return map;
  }, [urlChecks]);

  const withImages = rows.filter((row) => row.images.length > 0).length;
  const missingImages = rows.length - withImages;

  const setRowImages = (rowId: string, images: string[], imageErrors: string[]) => {
    onRowsChange((prev) => prev.map((row) => (row.id === rowId ? { ...row, images, imageErrors } : row)));
  };

  const handleRowUpload = async (files: FileList | null) => {
    const rowId = pendingRowId.current;
    if (!rowId || !files || files.length === 0) return;
    const row = rows.find((entry) => entry.id === rowId);
    if (!row) return;
    onCommit();
    const next = [...row.images];
    const rowErrors: string[] = [];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_IMAGES_PER_PRODUCT) {
        rowErrors.push(`Maximum ${MAX_IMAGES_PER_PRODUCT} images per product.`);
        break;
      }
      try {
        next.push(await compressImageFile(file));
      } catch (error) {
        rowErrors.push(error instanceof Error ? error.message : 'Could not read that image.');
      }
    }
    setRowImages(rowId, next, rowErrors);
  };

  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setNotice(null);
    onCommit();
    const extracted: Array<{ fileName: string; dataUrl: string }> = [];
    const readErrors: string[] = [];
    for (const file of Array.from(files)) {
      try {
        extracted.push({ fileName: file.name, dataUrl: await compressImageFile(file) });
      } catch (error) {
        readErrors.push(error instanceof Error ? error.message : `Could not read ${file.name}.`);
      }
    }
    applyMatches(extracted, readErrors);
    setUploading(false);
  };

  const handleZipUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice(null);
    onCommit();
    try {
      const extracted = await extractImagesFromZip(file);
      applyMatches(extracted, []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'That ZIP file could not be read.');
    }
    setUploading(false);
  };

  const applyMatches = (extracted: Array<{ fileName: string; dataUrl: string }>, readErrors: string[]) => {
    const { matched, unmatched } = matchImagesToProducts(
      extracted,
      rows.map((row) => {
        const draft = draftByRowId.get(row.id);
        return { rowId: row.id, sku: draft?.sku ?? '', name: draft?.name ?? '' };
      }),
    );
    if (matched.size > 0) {
      onRowsChange((prev) =>
        prev.map((row) => {
          const additions = matched.get(row.id);
          if (!additions || additions.length === 0) return row;
          return { ...row, images: [...row.images, ...additions].slice(0, MAX_IMAGES_PER_PRODUCT) };
        }),
      );
    }
    const parts: string[] = [];
    if (matched.size > 0) {
      const count = Array.from(matched.values()).reduce((total, list) => total + list.length, 0);
      parts.push(`Added ${count} image${count === 1 ? '' : 's'} to ${matched.size} product${matched.size === 1 ? '' : 's'}.`);
    }
    if (unmatched.length > 0) parts.push(`${unmatched.length} file${unmatched.length === 1 ? '' : 's'} matched no product (check SKU or product name).`);
    if (readErrors.length > 0) parts.push(readErrors[0]);
    setNotice(parts.length > 0 ? parts.join(' ') : 'No images found to attach.');
  };

  const runUrlCheck = async () => {
    setChecking(true);
    const urls = rows.flatMap((row) => row.images.filter((image) => /^https?:/i.test(image)));
    setUrlChecks(await verifyImageUrls(urls));
    setChecking(false);
  };

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-col">
        <h2 className="font-heading-md text-heading-md text-text-primary">Add product images</h2>
        <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
          Images are optional — products without one import fine and you can add photos later. Image links from your
          file are already attached below.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-space-xs">
        <button
          type="button"
          disabled={busy}
          onClick={() => bulkInputRef.current?.click()}
          className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-tint-blue disabled:opacity-40 transition-colors"
        >
          <Icon name={busy ? 'progress_activity' : 'add_photo_alternate'} className={`text-[16px] ${busy ? 'animate-spin' : ''}`} />
          <span>Upload images (matched by SKU or name)</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => zipInputRef.current?.click()}
          className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-tint-blue disabled:opacity-40 transition-colors"
        >
          <Icon name="folder_zip" className="text-[16px]" />
          <span>Upload ZIP of images</span>
        </button>
        <button
          type="button"
          disabled={checking}
          onClick={runUrlCheck}
          className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold hover:bg-surface-container disabled:opacity-40 transition-colors"
        >
          <Icon name={checking ? 'progress_activity' : 'link'} className={`text-[16px] ${checking ? 'animate-spin' : ''}`} />
          <span>Check image links</span>
        </button>
        <input
          ref={bulkInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void handleBulkUpload(event.target.files);
            event.target.value = '';
          }}
        />
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(event) => {
            void handleZipUpload(event.target.files);
            event.target.value = '';
          }}
        />
        <input
          ref={perRowInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void handleRowUpload(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {notice && (
        <div role="alert" className="rounded-xl bg-error-container text-on-error-container p-space-sm font-caption text-caption flex items-start gap-space-2xs">
          <Icon name="error" className="text-[16px] shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-space-xs font-caption text-caption text-text-secondary">
        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-semibold">
          <Icon name="image" className="text-[13px]" />
          {withImages.toLocaleString()} with images
        </span>
        <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-text-secondary font-semibold">
          <Icon name="hide_image" className="text-[13px]" />
          {missingImages.toLocaleString()} without (won&apos;t block import)
        </span>
        <span>File names like “VG-STEAK-01.jpg” or “woodfire-ribeye.png” are matched automatically.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xs">
        {pageRows.map((row) => {
          const name = draftByRowId.get(row.id)?.name ?? '';
          return (
            <div key={row.id} className="rounded-xl border border-border-subtle bg-surface-canvas p-space-sm flex gap-space-sm">
              <div className="flex gap-space-2xs shrink-0">
                {row.images.slice(0, 3).map((image, index) => {
                  const failed = urlStatus.get(image) === false;
                  return (
                    <span key={`${row.id}-${index}`} className="relative w-14 h-14 rounded-lg overflow-hidden bg-surface-container block">
                      <img alt={`Product ${row.rowNumber} image ${index + 1}`} className="w-full h-full object-cover" src={image} />
                      {failed && (
                        <span title="This link could not be loaded" className="absolute inset-0 bg-error-container/80 flex items-center justify-center">
                          <Icon name="link_off" className="text-[16px] text-error" />
                        </span>
                      )}
                    </span>
                  );
                })}
                {row.images.length === 0 && (
                  <span className="w-14 h-14 rounded-lg bg-surface-container-high text-text-tertiary flex flex-col items-center justify-center">
                    <Icon name="hide_image" className="text-[18px]" />
                    <span className="text-[9px] font-semibold uppercase">No image</span>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="min-w-0">
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold block truncate" title={name}>
                    {name || `Row ${row.rowNumber}`}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    {row.images.length === 0 ? 'Missing image (optional)' : `${row.images.length} of ${MAX_IMAGES_PER_PRODUCT} images`}
                  </span>
                  {row.imageErrors.length > 0 && (
                    <span className="font-caption text-[11px] text-error block mt-0.5">{row.imageErrors[0]}</span>
                  )}
                </div>
                <div className="flex items-center gap-space-2xs mt-space-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      pendingRowId.current = row.id;
                      perRowInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1 px-space-xs py-1 rounded-md bg-surface-container-low text-primary font-caption text-caption font-semibold hover:bg-surface-tint-blue transition-colors"
                  >
                    <Icon name="upload" className="text-[13px]" />
                    <span>{row.images.length > 0 ? 'Add / replace' : 'Upload image'}</span>
                  </button>
                  {row.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onCommit();
                        setRowImages(row.id, [], []);
                      }}
                      className="inline-flex items-center gap-1 px-space-xs py-1 rounded-md text-text-tertiary hover:text-error font-caption text-caption font-semibold"
                    >
                      <Icon name="delete" className="text-[13px]" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-caption text-caption text-text-secondary">
          Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, rows.length)} of {rows.length.toLocaleString()}
        </span>
        <div className="flex items-center gap-space-2xs">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
            className="px-space-sm py-1 rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-caption text-caption text-text-secondary px-space-2xs">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage(currentPage + 1)}
            className="px-space-sm py-1 rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
