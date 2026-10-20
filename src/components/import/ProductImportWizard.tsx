import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import { ModalCloseButton } from '../desktop/DesktopModal';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import {
  ImportError,
  parseSpreadsheetFile,
} from '../../scripts/productImport/importFile';
import { buildAutoMapping } from '../../scripts/productImport/importMapping';
import { buildImportDrafts } from '../../scripts/productImport/importRecords';
import { buildCatalogueIndex, validateImportDrafts } from '../../scripts/productImport/importValidation';
import {
  saveImportedProducts,
} from '../../scripts/productImport/importedProductStore';
import type {
  ImportBatchResult,
  ImportFieldKey,
  ImportMapping,
  ImportProductDraft,
  ParsedColumn,
  ParsedSpreadsheet,
  StagedRow,
  ValidationReport,
} from '../../scripts/productImport/importTypes';
import { ImportStepUpload } from './steps/ImportStepUpload';
import { ImportStepMapping } from './steps/ImportStepMapping';
import { ImportStepStaging } from './steps/ImportStepStaging';
import { ImportStepImages } from './steps/ImportStepImages';
import { ImportStepValidate } from './steps/ImportStepValidate';
import { ImportStepImport, type ImportRunState } from './steps/ImportStepImport';

export interface ProductImportWizardProps {
  open: boolean;
  onClose: () => void;
  /** Fires after each import run (parents use it for toasts/refreshes). */
  onImported?: (result: ImportBatchResult) => void;
  /** Opens the post-import review UI, if the host provides one. */
  onOpenReview?: () => void;
  /** SKUs already in the catalogue — used for duplicate protection. */
  existingSkus?: string[];
  /** Names already in the catalogue — used for possible-duplicate warnings. */
  existingNames?: string[];
}

const STEP_LABELS = ['Upload', 'Map columns', 'Review rows', 'Images', 'Validate', 'Import'] as const;
const BATCH_SIZE = 100;

function toStagedRows(rows: string[][]): StagedRow[] {
  return rows.map((cells, index) => ({
    id: `row_${index + 1}`,
    rowNumber: index + 1,
    cells,
    images: [],
    imageErrors: [],
    excluded: false,
  }));
}

/** Applies the opt-in "use category image when the product has none" flag to a batch. */
function withCategoryImageFallback(drafts: ImportProductDraft[], enabled: boolean): ImportProductDraft[] {
  return enabled ? drafts.map((draft) => ({ ...draft, useCategoryImage: true })) : drafts;
}

/**
 * The Bulk Product Import wizard (Steps 1–6). One reusable implementation used
 * by both business onboarding and the Business Dashboard catalogue — hosts
 * only render `<ProductImportWizard open … />` and provide catalogue SKUs for
 * duplicate protection. Fully client-side; imported products are stored as
 * drafts via `importedProductStore` and only ever go live when a row carries
 * the explicit "publish after import" bulk intent *and* passes validation.
 */
export function ProductImportWizard({
  open,
  onClose,
  onImported,
  onOpenReview,
  existingSkus = [],
  existingNames = [],
}: ProductImportWizardProps) {
  const isDesktop = useIsDesktop();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [sheet, setSheet] = useState<ParsedSpreadsheet | null>(null);
  const [columns, setColumns] = useState<ParsedColumn[]>([]);
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});
  const [columnOrder, setColumnOrder] = useState<number[]>([]);
  const [initialRows, setInitialRows] = useState<StagedRow[]>([]);
  const [rows, setRows] = useState<StagedRow[]>([]);
  const [history, setHistory] = useState<StagedRow[][]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [highlightRowId, setHighlightRowId] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<ImportProductDraft[]>([]);
  const [report, setReport] = useState<ValidationReport | null>(null);

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<ImportBatchResult | null>(null);
  const [retryDrafts, setRetryDrafts] = useState<ImportProductDraft[]>([]);
  /** Opt-in: products with no image of their own may show their category image. */
  const [useCategoryImage, setUseCategoryImage] = useState(false);
  const sheetRef = useRef<ParsedSpreadsheet | null>(null);
  sheetRef.current = sheet;

  const existingIndex = useMemo(
    () =>
      buildCatalogueIndex([
        ...existingSkus.map((sku) => ({ name: '', sku })),
        ...existingNames.map((name) => ({ name, sku: '' })),
      ]),
    [existingSkus, existingNames],
  );

  const draftByRowId = useMemo(() => {
    if (!sheet) return new Map<string, ImportProductDraft>();
    const applied = withCategoryImageFallback(buildImportDrafts(rows, mapping, sheet.headers), useCategoryImage);
    return new Map(applied.map((draft) => [draft.rowId, draft]));
  }, [rows, mapping, sheet, useCategoryImage]);

  // Recompute drafts + validation whenever the validate step is (re)visited.
  useEffect(() => {
    if (step !== 5 || !sheet) return;
    const applied = withCategoryImageFallback(buildImportDrafts(rows, mapping, sheet.headers), useCategoryImage);
    setDrafts(applied);
    // Validate the exact drafts that will be imported (category-image fallback included).
    setReport(validateImportDrafts(applied, existingIndex));
  }, [step, rows, mapping, sheet, existingIndex, useCategoryImage]);

  useEffect(() => {
    if (!open) {
      // Reset everything when reopened so each import starts clean.
      setStep(1);
      setBusy(false);
      setParseError(null);
      setSheet(null);
      setColumns([]);
      setMapping({});
      setConfirmed({});
      setColumnOrder([]);
      setInitialRows([]);
      setRows([]);
      setHistory([]);
      setSelected(new Set());
      setHighlightRowId(null);
      setDrafts([]);
      setReport(null);
      setRunning(false);
      setProgress({ done: 0, total: 0 });
      setResult(null);
      setRetryDrafts([]);
      setUseCategoryImage(false);
    }
  }, [open]);

  /* ---------------- Step 1: file handling ---------------- */

  const handleFileChosen = async (file: File) => {
    setBusy(true);
    setParseError(null);
    try {
      const parsed = await parseSpreadsheetFile(file);
      const auto = buildAutoMapping(parsed);
      setSheet(parsed);
      setColumns(auto.columns);
      setMapping(auto.mapping);
      setConfirmed({});
      setColumnOrder(parsed.headers.map((_header, index) => index));
      const staged = toStagedRows(parsed.rows);
      setInitialRows(staged);
      setRows(staged);
      setHistory([]);
      setSelected(new Set());
      setResult(null);
      setStep(2);
    } catch (error) {
      setParseError(
        error instanceof ImportError
          ? error.message
          : 'Something went wrong while reading this file. Please try another export.',
      );
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- Staging helpers ---------------- */

  const pushHistory = () => setHistory((previous) => [...previous.slice(-29), rows]);

  const handleUndo = () => {
    setHistory((previous) => {
      if (previous.length === 0) return previous;
      setRows(previous[previous.length - 1]);
      return previous.slice(0, -1);
    });
  };

  const handleResetRows = () => {
    pushHistory();
    setRows(initialRows.map((row) => ({ ...row })));
    setSelected(new Set());
  };

  const handleColumnMove = (columnIndex: number, direction: -1 | 1) => {
    setColumnOrder((previous) => {
      const position = previous.indexOf(columnIndex);
      const target = position + direction;
      if (position < 0 || target < 0 || target >= previous.length) return previous;
      const next = [...previous];
      next.splice(position, 1);
      next.splice(target, 0, columnIndex);
      return next;
    });
  };

  const handleMappingChange = (index: number, field: ImportFieldKey) => {
    setMapping((previous) => ({ ...previous, [index]: field }));
    const column = columns[index];
    // Manually choosing a field counts as confirming an ambiguous guess.
    if (column && field !== column.suggestedField) setConfirmed((previous) => ({ ...previous, [index]: true }));
  };

  /* ---------------- Import runner ---------------- */

  const runImport = async (draftsToRun: ImportProductDraft[], isRetry: boolean) => {
    if (!sheetRef.current || draftsToRun.length === 0) return;
    const fileName = sheetRef.current.fileName;
    const warningRowIds = new Set(
      (report?.issues ?? []).filter((issue) => issue.severity === 'warning').map((issue) => issue.rowId),
    );
    const batchId = `batch_${Date.now().toString(36)}`;
    const failures: ImportBatchResult['failures'] = [];
    let imported = 0;
    let published = 0;
    let needsReview = 0;
    let skippedDuplicates = 0;

    setRunning(true);
    setProgress({ done: 0, total: draftsToRun.length });

    for (let offset = 0; offset < draftsToRun.length; offset += BATCH_SIZE) {
      const slice = draftsToRun.slice(offset, offset + BATCH_SIZE);
      try {
        const savedResult = saveImportedProducts(
          { batchId, fileName, importedAt: Date.now() },
          slice,
          { existingSkus: new Set(existingSkus), needsReviewRowIds: warningRowIds },
        );
        imported += savedResult.saved.length;
        published += savedResult.published;
        needsReview += savedResult.saved.filter((product) => product.needsReview).length;
        skippedDuplicates += savedResult.skippedDuplicates;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error while saving.';
        slice.forEach((draft) =>
          failures.push({ rowNumber: draft.rowNumber, name: draft.name, message, draft }),
        );
      }
      setProgress({ done: Math.min(offset + slice.length, draftsToRun.length), total: draftsToRun.length });
      // Yield between batches so the progress bar paints and the UI stays responsive.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const fresh: ImportBatchResult = {
      batchId,
      fileName,
      importedAt: Date.now(),
      imported,
      published,
      needsReview,
      failed: failures.length,
      skippedDuplicates,
      failures,
    };
    const merged: ImportBatchResult =
      isRetry && result
        ? {
            ...result,
            imported: result.imported + imported,
            published: result.published + published,
            needsReview: result.needsReview + needsReview,
            failed: failures.length,
            skippedDuplicates: result.skippedDuplicates + skippedDuplicates,
            failures,
          }
        : fresh;
    setResult(merged);
    setRetryDrafts(failures.map((failure) => failure.draft));
    setRunning(false);
    onImported?.(merged);
  };

  /* ---------------- Navigation ---------------- */

  const unconfirmedAmbiguous = columns.filter(
    (column) => column.ambiguous && !confirmed[column.index] && (mapping[column.index] ?? 'ignore') !== 'ignore',
  ).length;
  const missingRequired = (mapping && !Object.values(mapping).includes('name')) || !Object.values(mapping).includes('price');
  const canContinueMapping = unconfirmedAmbiguous === 0 && !missingRequired;

  const blockedRowIds = useMemo(
    () => new Set((report?.issues ?? []).filter((issue) => issue.severity === 'blocking').map((issue) => issue.rowId)),
    [report],
  );
  const willImportDrafts = useMemo(() => drafts.filter((draft) => !blockedRowIds.has(draft.rowId)), [drafts, blockedRowIds]);

  const runState: ImportRunState = {
    running,
    progress,
    result,
    retryableCount: retryDrafts.length,
  };

  if (!open) return null;

  const showFooter = step < 6 || (!result && !running);
  const footerLabel =
    step === 2 ? 'Continue to rows' : step === 3 ? 'Continue to images' : step === 4 ? 'Continue to validation' : 'Continue to import';

  const handleContinue = () => {
    if (step === 2 && !canContinueMapping) return;
    setHighlightRowId(null);
    setStep((current) => Math.min(6, current + 1));
  };

  const handleBack = () => setStep((current) => Math.max(1, current - 1));

  const panel = (
    <div className="flex flex-col h-full bg-surface-canvas overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-space-sm px-space-md py-space-sm border-b border-border-subtle shrink-0">
        {step > 1 && (
          <button
            type="button"
            aria-label="Back a step"
            onClick={handleBack}
            disabled={running}
            className="w-9 h-9 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary disabled:opacity-40 transition-colors"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-heading-sm text-heading-sm text-text-primary truncate">Bulk Product Import</span>
          <span className="font-caption text-caption text-text-secondary truncate">
            Step {step} of 6 · {STEP_LABELS[step - 1]}
          </span>
        </div>
        <ModalCloseButton onClose={running ? () => undefined : onClose} label="Close import wizard" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-space-2xs px-space-md py-space-2xs border-b border-border-subtle shrink-0 overflow-x-auto no-scrollbar">
        {STEP_LABELS.map((label, index) => {
          const number = index + 1;
          const active = number === step;
          const done = number < step;
          return (
            <span
              key={label}
              className={`inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full whitespace-nowrap font-caption text-caption font-semibold ${
                active ? 'bg-primary-container text-on-primary' : done ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-high text-text-tertiary'
              }`}
            >
              {done ? <Icon name="check" className="text-[13px]" /> : <span>{number}</span>}
              <span className="hidden sm:inline">{label}</span>
            </span>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-space-md py-space-md">
        {step === 1 && (
          <ImportStepUpload onFileChosen={handleFileChosen} error={parseError} busy={busy} fileName={sheet?.fileName ?? null} />
        )}
        {step === 2 && sheet && (
          <ImportStepMapping
            sheet={sheet}
            columns={columns}
            mapping={mapping}
            onMappingChange={handleMappingChange}
            confirmed={confirmed}
            onConfirm={(index) => setConfirmed((previous) => ({ ...previous, [index]: true }))}
          />
        )}
        {step === 3 && sheet && (
          <ImportStepStaging
            sheet={sheet}
            columnOrder={columnOrder}
            onColumnOrderMove={handleColumnMove}
            mapping={mapping}
            onMappingChange={handleMappingChange}
            rows={rows}
            onRowsChange={setRows}
            onCommit={pushHistory}
            onUndo={handleUndo}
            canUndo={history.length > 0}
            onReset={handleResetRows}
            selected={selected}
            onSelectedChange={setSelected}
            highlightRowId={highlightRowId}
            useCategoryImage={useCategoryImage}
            onUseCategoryImageChange={setUseCategoryImage}
          />
        )}
        {step === 4 && sheet && (
          <ImportStepImages
            rows={rows}
            draftByRowId={draftByRowId}
            onRowsChange={setRows}
            onCommit={pushHistory}
          />
        )}
        {step === 5 && report && sheet && (
          <ImportStepValidate
            report={report}
            drafts={drafts}
            onJumpToRow={(rowId) => {
              setHighlightRowId(rowId);
              setStep(3);
            }}
          />
        )}
        {step === 6 && (
          <ImportStepImport
            willImport={willImportDrafts.length}
            willSkipBlocked={(drafts.length || rows.filter((row) => !row.excluded).length) - willImportDrafts.length}
            willPublishAfterImport={willImportDrafts.filter((draft) => draft.publishAfterImport === true).length}
            run={runState}
            onStart={() => void runImport(willImportDrafts, false)}
            onRetry={() => void runImport(retryDrafts, true)}
            onReview={() => {
              onOpenReview?.();
              onClose();
            }}
            onClose={onClose}
          />
        )}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm border-t border-border-subtle shrink-0 bg-surface-canvas">
          <button
            type="button"
            onClick={step === 1 ? onClose : handleBack}
            className="inline-flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg text-text-secondary hover:bg-surface-container font-button-secondary text-button-secondary transition-colors"
          >
            <Icon name={step === 1 ? 'close' : 'arrow_back'} className="text-[18px]" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>
          {step < 6 && (
            <button
              type="button"
              onClick={handleContinue}
              disabled={step === 2 && !canContinueMapping}
              className="inline-flex items-center gap-space-2xs px-space-lg py-space-xs rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary hover:bg-primary transition-colors disabled:opacity-40 active:scale-[0.98]"
            >
              <span>{footerLabel}</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 z-[70] bg-surface-canvas flex flex-col" role="dialog" aria-modal="true" aria-label="Bulk Product Import">
        {panel}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-space-md bg-on-surface/40 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bulk Product Import"
        className="w-full max-w-[1180px] h-[92vh] bg-surface-canvas rounded-2xl shadow-2xl overflow-hidden"
      >
        {panel}
      </div>
    </div>
  );
}
