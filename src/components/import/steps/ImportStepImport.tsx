import { Icon } from '../../ui/Icon';
import type { ImportBatchResult } from '../../../scripts/productImport/importTypes';

export interface ImportRunState {
  running: boolean;
  progress: { done: number; total: number };
  result: ImportBatchResult | null;
  /** Drafts that failed (or were blocked) and can be retried after fixing. */
  retryableCount: number;
}

interface ImportStepImportProps {
  willImport: number;
  willSkipBlocked: number;
  /** Rows marked with the "publish after import" bulk action. */
  willPublishAfterImport: number;
  run: ImportRunState;
  onStart: () => void;
  onRetry: () => void;
  onReview: () => void;
  onClose: () => void;
}

/** Step 6 — safe batched import with progress, results and retry. */
export function ImportStepImport({
  willImport,
  willSkipBlocked,
  willPublishAfterImport,
  run,
  onStart,
  onRetry,
  onReview,
  onClose,
}: ImportStepImportProps) {
  const { running, progress, result } = run;
  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  if (running) {
    return (
      <div className="flex flex-col items-center text-center py-space-xl gap-space-sm">
        <span className="w-16 h-16 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
          <Icon name="progress_activity" className="text-[36px] animate-spin" />
        </span>
        <h2 className="font-heading-md text-heading-md text-text-primary">Importing products…</h2>
        <p className="font-body-md text-body-md text-text-secondary">
          {progress.done.toLocaleString()} of {progress.total.toLocaleString()} rows processed
        </p>
        <div className="w-full max-w-md bg-surface-container-high rounded-full h-2.5 overflow-hidden">
          <div className="bg-primary-container h-full rounded-full transition-all duration-200" style={{ width: `${percent}%` }} />
        </div>
        <span className="font-caption text-caption text-text-tertiary">
          Large files import in small batches so this page stays responsive. Keep it open.
        </span>
      </div>
    );
  }

  if (result) {
    const hasFailures = result.failures.length > 0 || result.failed > 0;
    return (
      <div className="flex flex-col gap-space-md">
        <div className="flex flex-col items-center text-center">
          <span className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center mb-space-xs">
            <Icon name="check_circle" className="text-[36px]" />
          </span>
          <h2 className="font-heading-md text-heading-md text-text-primary">Import finished</h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
            “{result.fileName}” was processed.{' '}
            {result.published === 0
              ? 'Everything was saved as a draft — review and publish when ready.'
              : result.published >= result.imported
                ? `All ${result.imported.toLocaleString()} were published immediately.`
                : `${result.published.toLocaleString()} product${result.published === 1 ? ' was' : 's were'} published — the rest are saved as drafts. Review and publish them when ready.`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm">
          <div className="rounded-xl bg-badge-discount-bg p-space-sm flex flex-col">
            <span className="font-heading-md text-heading-md font-bold text-badge-discount-text">
              {result.imported.toLocaleString()}
            </span>
            <span className="font-caption text-caption text-badge-discount-text font-semibold">Imported (all)</span>
          </div>
          <div className="rounded-xl bg-surface-tint-blue p-space-sm flex flex-col">
            <span className="font-heading-md text-heading-md font-bold text-primary">
              {result.published.toLocaleString()}
            </span>
            <span className="font-caption text-caption text-primary font-semibold">Published now</span>
          </div>
          <div className="rounded-xl bg-surface-container-high p-space-sm flex flex-col">
            <span className="font-heading-md text-heading-md font-bold text-text-secondary">
              {result.needsReview.toLocaleString()}
            </span>
            <span className="font-caption text-caption text-text-secondary font-semibold">Need review</span>
          </div>
          <div className="rounded-xl bg-error-container p-space-sm flex flex-col">
            <span className="font-heading-md text-heading-md font-bold text-on-error-container">
              {result.failed.toLocaleString()}
            </span>
            <span className="font-caption text-caption text-on-error-container font-semibold">Failed / blocked</span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-space-sm flex flex-col">
            <span className="font-heading-md text-heading-md font-bold text-text-secondary">
              {result.skippedDuplicates.toLocaleString()}
            </span>
            <span className="font-caption text-caption text-text-secondary font-semibold">Duplicates skipped</span>
          </div>
        </div>

        {result.failures.length > 0 && (
          <div className="rounded-xl border border-border-subtle overflow-hidden">
            <div className="px-space-sm py-space-xs bg-surface-container-low font-label-sm text-label-sm text-text-secondary font-semibold flex items-center gap-space-2xs">
              <Icon name="priority_high" className="text-[15px] text-error" />
              <span>Rows that didn&apos;t import ({result.failures.length} shown)</span>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-border-subtle">
              {result.failures.slice(0, 50).map((failure, index) => (
                <div key={`${failure.rowNumber}-${index}`} className="px-space-sm py-space-2xs flex items-center justify-between gap-space-sm">
                  <span className="font-caption text-caption text-text-primary truncate">
                    {failure.name || `Row ${failure.rowNumber}`}
                  </span>
                  <span className="font-caption text-caption text-text-secondary shrink-0">row {failure.rowNumber}</span>
                  <span className="font-caption text-caption text-error truncate max-w-[180px]" title={failure.message}>
                    {failure.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            type="button"
            onClick={onReview}
            className="inline-flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary hover:bg-primary transition-colors"
          >
            <Icon name="rate_review" className="text-[18px]" />
            <span>Review imported products</span>
          </button>
          {hasFailures && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary border border-border-subtle hover:bg-surface-tint-blue transition-colors"
            >
              <Icon name="refresh" className="text-[18px]" />
              <span>Retry failed rows ({run.retryableCount.toLocaleString()})</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-space-2xs px-space-md py-space-sm rounded-xl text-text-secondary font-button-secondary text-button-secondary hover:bg-surface-container transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
            <span>Back to catalogue</span>
          </button>
        </div>

        {hasFailures && (
          <p className="font-caption text-caption text-text-tertiary leading-relaxed">
            Retrying only re-processes rows that didn&apos;t import — successful products are never duplicated. Fix
            blocked rows in the review table first.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div>
        <h2 className="font-heading-md text-heading-md text-text-primary">Ready to import</h2>
        <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
          {willImport.toLocaleString()} products will be imported as <span className="font-semibold text-text-primary">drafts</span>
          {willPublishAfterImport > 0 && (
            <>
              , of which <span className="font-semibold text-text-primary">{willPublishAfterImport.toLocaleString()}</span>{' '}
              {willPublishAfterImport === 1 ? 'is' : 'are'} marked to publish right after import
            </>
          )}
          {willSkipBlocked > 0 && (
            <> {willSkipBlocked.toLocaleString()} blocked row(s) will be skipped until fixed.</>
          )}{' '}
          You can edit, add images and publish them from the catalogue afterwards.
        </p>
      </div>
      <div className="rounded-xl bg-surface-tint-blue p-space-sm flex items-start gap-space-sm">
        <Icon name="shield" className="text-[22px] text-primary shrink-0 mt-0.5" />
        <span className="font-caption text-caption text-text-secondary leading-relaxed">
          Import runs in small batches with duplicate protection: products whose SKU already exists are skipped, and
          nothing is published automatically. Rows you marked to publish are still checked — a row missing a name or
          price stays a draft instead of going live. If the browser interrupts the run, retrying won&apos;t duplicate
          the rows that already succeeded.
        </span>
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={willImport === 0}
        className="self-start inline-flex items-center gap-space-2xs px-space-lg py-space-sm rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary hover:bg-primary transition-colors disabled:opacity-40 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98]"
      >
        <Icon name="upload_file" className="text-[20px]" />
        <span>
          Import {willImport.toLocaleString()} product{willImport === 1 ? '' : 's'}
          {willPublishAfterImport > 0 ? ` · publish ${willPublishAfterImport.toLocaleString()}` : ' as drafts'}
        </span>
      </button>
    </div>
  );
}
