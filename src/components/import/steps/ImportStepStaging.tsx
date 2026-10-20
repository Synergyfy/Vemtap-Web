import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../ui/Icon';
import { BulkActionsBar, type BulkAction } from '../../BulkActionsBar';
import { downloadCsv } from '../../../utils/exportCsv';
import { getCentralCategories } from '../../../scripts/catalogueData';
import {
  IMPORT_FIELDS,
  type ImportFieldKey,
  type ImportMapping,
  type ParsedSpreadsheet,
  type StagedRow,
} from '../../../scripts/productImport/importTypes';

const PAGE_SIZE = 25;

interface ImportStepStagingProps {
  sheet: ParsedSpreadsheet;
  columnOrder: number[];
  onColumnOrderMove: (columnIndex: number, direction: -1 | 1) => void;
  mapping: ImportMapping;
  onMappingChange: (index: number, field: ImportFieldKey) => void;
  rows: StagedRow[];
  onRowsChange: (updater: (prev: StagedRow[]) => StagedRow[]) => void;
  /** Snapshots the current rows so the change can be undone. */
  onCommit: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onReset: () => void;
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
  highlightRowId: string | null;
  /** Opt-in: products with no image of their own may show their category image. */
  useCategoryImage: boolean;
  onUseCategoryImageChange: (next: boolean) => void;
}

/** Step 3 — editable staging table: mapping fixes, reordering, inline edits. */
export function ImportStepStaging({
  sheet,
  columnOrder,
  onColumnOrderMove,
  mapping,
  onMappingChange,
  rows,
  onRowsChange,
  onCommit,
  onUndo,
  canUndo,
  onReset,
  selected,
  onSelectedChange,
  highlightRowId,
  useCategoryImage,
  onUseCategoryImageChange,
}: ImportStepStagingProps) {
  const [page, setPage] = useState(0);
  const [bulkCategory, setBulkCategory] = useState('');

  // Jump to the page containing a row highlighted from the validation list.
  useEffect(() => {
    if (!highlightRowId) return;
    const index = rows.findIndex((row) => row.id === highlightRowId);
    if (index >= 0) setPage(Math.floor(index / PAGE_SIZE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightRowId]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const categoryOptions = useMemo(() => getCentralCategories('product').map((category) => category.name), []);
  const categoryColumn = columnOrder.find((index) => mapping[index] === 'category');

  const includedCount = rows.filter((row) => !row.excluded).length;

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange(next);
  };

  const togglePage = () => {
    const pageIds = pageRows.map((row) => row.id);
    const allSelected = pageIds.every((id) => selected.has(id));
    const next = new Set(selected);
    pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
    onSelectedChange(next);
  };

  const patchRow = (rowId: string, patch: Partial<StagedRow>) => {
    onRowsChange((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  /** Applies a partial patch to several rows at once (bulk actions). */
  const patchRows = (rowIds: string[], patch: Partial<StagedRow>) => {
    const idSet = new Set(rowIds);
    onRowsChange((prev) => prev.map((row) => (idSet.has(row.id) ? { ...row, ...patch } : row)));
  };

  const patchCells = (rowIds: string[], updater: (cells: string[]) => string[]) => {
    const idSet = new Set(rowIds);
    onRowsChange((prev) => prev.map((row) => (idSet.has(row.id) ? { ...row, cells: updater([...row.cells]) } : row)));
  };

  const setExcluded = (rowIds: string[], excluded: boolean) => {
    const idSet = new Set(rowIds);
    onRowsChange((prev) => prev.map((row) => (idSet.has(row.id) ? { ...row, excluded } : row)));
  };

  const selectedIds = rows.filter((row) => selected.has(row.id)).map((row) => row.id);

  /**
   * Sets a per-row intent on the selected rows. None of these delete or
   * modify already-saved products — they only shape what happens when the
   * import runs.
   */
  const applyBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;
    onCommit();
    if (action === 'publish') patchRows(selectedIds, { publishAfterImport: true, markForReview: false });
    else if (action === 'draft') patchRows(selectedIds, { publishAfterImport: false });
    else if (action === 'review') patchRows(selectedIds, { markForReview: true });
    else if (action === 'clearReview') patchRows(selectedIds, { markForReview: false });
    else if (action === 'include') setExcluded(selectedIds, false);
    else if (action === 'exclude') setExcluded(selectedIds, true);
    onSelectedChange(new Set());
  };

  const bulkActions: BulkAction[] = [
    {
      value: 'publish',
      label: 'Publish after import',
      hint: 'Rows are still validated — any missing a name or price import as drafts instead of going live.',
    },
    { value: 'draft', label: 'Move to Draft', hint: 'Undo the publish intent for these rows.' },
    { value: 'review', label: 'Mark for Review', hint: 'Flag these products for manual review after import.' },
    { value: 'clearReview', label: 'Clear Review flag' },
    { value: 'include', label: 'Include in import', hint: 'Add these rows back to the batch.' },
    {
      value: 'exclude',
      label: 'Remove from import',
      hint: 'Removes rows from this batch only — it does not delete any saved product. Undo or Reset can bring them back.',
    },
  ];

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-col">
        <h2 className="font-heading-md text-heading-md text-text-primary">Review &amp; edit before importing</h2>
        <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
          {rows.length.toLocaleString()} rows staged ({includedCount.toLocaleString()} included). Fix cells inline,
          re-order or re-map columns, or exclude rows — your source file is never changed.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-space-xs">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold hover:bg-surface-container disabled:opacity-40 transition-colors"
        >
          <Icon name="undo" className="text-[16px]" />
          <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors"
        >
          <Icon name="restart_alt" className="text-[16px]" />
          <span>Reset to file</span>
        </button>
        <button
          type="button"
          onClick={() => downloadCsv('vemtap_staged_products', sheet.headers, rows.map((row) => row.cells))}
          className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors"
        >
          <Icon name="file_download" className="text-[16px]" />
          <span>Export staged rows</span>
        </button>
      </div>

      {/* Category image fallback — opt-in, display-only */}
      <label className="flex items-start gap-space-xs rounded-xl border border-border-subtle bg-surface-container-low p-space-sm cursor-pointer">
        <input
          type="checkbox"
          checked={useCategoryImage}
          onChange={(event) => onUseCategoryImageChange(event.target.checked)}
          className="rounded text-primary cursor-pointer mt-0.5 shrink-0"
        />
        <span className="flex flex-col">
          <span className="font-label-sm text-label-sm text-text-primary font-semibold">
            Use category image when product has no image
          </span>
          <span className="font-caption text-caption text-text-secondary">
            A product&apos;s own image always wins. When a product has none, we show its category&apos;s image if one
            exists — otherwise the usual placeholder appears and the import is not blocked. The category image is
            linked, not copied, so later edits to the category image update these products too.
          </span>
        </span>
      </label>

      {/* Bulk actions for selected rows (WordPress-style) */}
      <BulkActionsBar
        selectedCount={selected.size}
        filteredCount={rows.length}
        scopeNoun="rows"
        viewLabel={`${rows.length.toLocaleString()} rows in this file (list is paginated)`}
        selectAllLabel={`${rows.length.toLocaleString()} rows in this file`}
        actions={bulkActions}
        onApply={applyBulkAction}
        onSelectAllFiltered={() => onSelectedChange(new Set(rows.map((row) => row.id)))}
        onClearSelection={() => onSelectedChange(new Set())}
        extra={
          <>
            <input
              aria-label="Category to assign"
              list="import-bulk-categories"
              value={bulkCategory}
              onChange={(event) => setBulkCategory(event.target.value)}
              placeholder="Category name…"
              className="h-9 min-w-[160px] bg-surface-canvas rounded-lg px-space-xs font-body-md text-body-md outline-none focus:shadow-[0_0_0_2px_#066cf4]"
            />
            <datalist id="import-bulk-categories">
              {categoryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
            <button
              type="button"
              disabled={!bulkCategory.trim() || categoryColumn === undefined || selected.size === 0}
              title={categoryColumn === undefined ? 'Map a column to Category first' : undefined}
              onClick={() => {
                onCommit();
                patchCells(selectedIds, (cells) => {
                  cells[categoryColumn as number] = bulkCategory.trim();
                  return cells;
                });
              }}
              className="h-9 px-space-xs rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold disabled:opacity-40 hover:bg-primary transition-colors"
            >
              Assign category
            </button>
          </>
        }
      />

      {/* Staging table */}
      <div className="rounded-xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse text-left min-w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="py-space-xs px-space-sm w-10 sticky left-0 bg-surface-container-low z-10">
                  <input
                    aria-label="Select all rows on this page"
                    type="checkbox"
                    className="rounded text-primary cursor-pointer"
                    checked={pageRows.length > 0 && pageRows.every((row) => selected.has(row.id))}
                    onChange={togglePage}
                  />
                </th>
                <th className="py-space-xs px-space-2xs w-16 font-label-sm text-label-sm text-text-secondary">Row</th>
                {columnOrder.map((columnIndex, position) => {
                  const field = mapping[columnIndex] ?? 'ignore';
                  return (
                    <th key={columnIndex} className="py-space-xs px-space-2xs min-w-[150px] align-top">
                      <div className="flex flex-col gap-space-2xs">
                        <div className="flex items-center gap-space-2xs">
                          <select
                            aria-label={`Map column "${sheet.headers[columnIndex]}"`}
                            value={field}
                            onChange={(event) => onMappingChange(columnIndex, event.target.value as ImportFieldKey)}
                            className={`h-8 flex-1 min-w-0 bg-surface-canvas rounded-md px-space-2xs font-caption text-caption font-semibold outline-none focus:shadow-[0_0_0_2px_#066cf4] ${
                              field === 'ignore' ? 'text-text-tertiary' : 'text-primary'
                            }`}
                          >
                            {IMPORT_FIELDS.map((spec) => (
                              <option key={spec.key} value={spec.key}>
                                {spec.label}
                                {spec.required ? ' *' : ''}
                              </option>
                            ))}
                          </select>
                          <span className="flex flex-col leading-none">
                            <button
                              type="button"
                              title="Move column left"
                              disabled={position === 0}
                              onClick={() => onColumnOrderMove(columnIndex, -1)}
                              className="text-text-tertiary hover:text-primary disabled:opacity-30"
                            >
                              <Icon name="arrow_left" className="text-[14px]" />
                            </button>
                            <button
                              type="button"
                              title="Move column right"
                              disabled={position === columnOrder.length - 1}
                              onClick={() => onColumnOrderMove(columnIndex, 1)}
                              className="text-text-tertiary hover:text-primary disabled:opacity-30"
                            >
                              <Icon name="arrow_right" className="text-[14px]" />
                            </button>
                          </span>
                        </div>
                        <span className="font-caption text-[10px] text-text-tertiary truncate" title={sheet.headers[columnIndex]}>
                          {sheet.headers[columnIndex]}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th className="py-space-xs px-space-sm w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pageRows.map((row) => (
                <tr
                  key={row.id}
                  className={`${row.excluded ? 'opacity-50' : ''} ${
                    highlightRowId === row.id ? 'bg-error-container/60' : 'bg-surface-canvas'
                  }`}
                >
                  <td className="py-1 px-space-sm sticky left-0 bg-inherit z-10">
                    <input
                      aria-label={`Select row ${row.rowNumber}`}
                      type="checkbox"
                      className="rounded text-primary cursor-pointer"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td className="py-1 px-space-2xs">
                    <span className="font-caption text-caption text-text-secondary">{row.rowNumber}</span>
                    {row.excluded && (
                      <span className="block font-caption text-[10px] text-error font-semibold">excluded</span>
                    )}
                    {!row.excluded && row.publishAfterImport && (
                      <span className="block font-caption text-[10px] text-badge-discount-text font-semibold">publish</span>
                    )}
                    {!row.excluded && row.markForReview && (
                      <span className="block font-caption text-[10px] text-text-secondary font-semibold">review</span>
                    )}
                  </td>
                  {columnOrder.map((columnIndex) => (
                    <td key={columnIndex} className="py-1 px-space-2xs">
                      <input
                        aria-label={`Row ${row.rowNumber}, column ${sheet.headers[columnIndex]}`}
                        value={row.cells[columnIndex] ?? ''}
                        onFocus={onCommit}
                        onChange={(event) => {
                          const value = event.target.value;
                          onRowsChange((prev) =>
                            prev.map((entry) => {
                              if (entry.id !== row.id) return entry;
                              const cells = [...entry.cells];
                              cells[columnIndex] = value;
                              return { ...entry, cells };
                            }),
                          );
                        }}
                        className={`w-full h-8 bg-transparent rounded px-space-2xs font-body-md text-body-md outline-none focus:bg-surface-tint-blue focus:shadow-[0_0_0_2px_#066cf4] ${
                          (mapping[columnIndex] ?? 'ignore') === 'ignore' ? 'text-text-tertiary' : 'text-text-primary'
                        }`}
                      />
                    </td>
                  ))}
                  <td className="py-1 px-space-sm text-center">
                    <button
                      type="button"
                      title={row.excluded ? 'Include this row' : 'Exclude this row'}
                      onClick={() => {
                        onCommit();
                        patchRow(row.id, { excluded: !row.excluded });
                      }}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                        row.excluded ? 'text-error hover:bg-error-container' : 'text-text-tertiary hover:bg-surface-container'
                      }`}
                    >
                      <Icon name={row.excluded ? 'undo' : 'visibility_off'} className="text-[16px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="font-caption text-caption text-text-secondary">
          Rows {(currentPage * PAGE_SIZE + 1).toLocaleString()}–{Math.min((currentPage + 1) * PAGE_SIZE, rows.length).toLocaleString()} of{' '}
          {rows.length.toLocaleString()}
        </span>
        <div className="flex items-center gap-space-2xs">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
            className="px-space-sm py-1 rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold disabled:opacity-40 hover:bg-surface-container"
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
            className="px-space-sm py-1 rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-semibold disabled:opacity-40 hover:bg-surface-container"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
