import { Icon } from '../../ui/Icon';
import { naira } from '../../../scripts/catalogueData';
import type { ImportIssue, ImportProductDraft, ValidationReport } from '../../../scripts/productImport/importTypes';

interface ImportStepValidateProps {
  report: ValidationReport;
  drafts: ImportProductDraft[];
  onJumpToRow: (rowId: string, rowNumber: number) => void;
}

function issueIcon(issue: ImportIssue) {
  if (issue.severity === 'blocking') return 'block';
  switch (issue.field) {
    case 'image':
      return 'hide_image';
    case 'sku':
    case 'name':
      return 'content_copy';
    case 'price':
    case 'salePrice':
    case 'costPrice':
      return 'payments';
    default:
      return 'warning';
  }
}

/** Step 5 — validation summary + per-row issues before importing. */
export function ImportStepValidate({ report, drafts, onJumpToRow }: ImportStepValidateProps) {
  const draftById = new Map(drafts.map((draft) => [draft.rowId, draft]));
  const sorted = [...report.issues].sort(
    (a, b) => Number(a.severity === 'warning') - Number(b.severity === 'warning') || a.rowNumber - b.rowNumber,
  );

  const sample = drafts[0];

  return (
    <div className="flex flex-col gap-space-md">
      <div>
        <h2 className="font-heading-md text-heading-md text-text-primary">Validate &amp; preview</h2>
        <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
          We checked every row. Blocking errors must be fixed first; warnings import anyway and flag the product
          for review. Nothing goes live — all products arrive as drafts.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-space-sm">
        <div className="rounded-xl bg-badge-discount-bg p-space-sm flex flex-col">
          <span className="font-heading-md text-heading-md font-bold text-badge-discount-text">
            {report.readyCount.toLocaleString()}
          </span>
          <span className="font-caption text-caption text-badge-discount-text font-semibold">Ready to import</span>
        </div>
        <div className="rounded-xl bg-surface-container-high p-space-sm flex flex-col">
          <span className="font-heading-md text-heading-md font-bold text-text-secondary">
            {report.warningCount.toLocaleString()}
          </span>
          <span className="font-caption text-caption text-text-secondary font-semibold">Import with warnings</span>
        </div>
        <div className="rounded-xl bg-error-container p-space-sm flex flex-col">
          <span className="font-heading-md text-heading-md font-bold text-on-error-container">
            {report.blockedCount.toLocaleString()}
          </span>
          <span className="font-caption text-caption text-on-error-container font-semibold">Blocked (need fixes)</span>
        </div>
      </div>

      {/* Mapping reminder: prices/stock are kept separate */}
      {sample && (
        <div className="rounded-xl bg-surface-container-low p-space-sm flex flex-col gap-space-2xs">
          <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Sample of what will be saved</span>
          <span className="font-caption text-caption text-text-secondary leading-relaxed">
            <span className="text-text-primary font-semibold">{sample.name || '—'}</span> · Regular{' '}
            {sample.price !== null ? naira(sample.price) : '—'}
            {sample.salePrice !== null && <> · Sale {naira(sample.salePrice)}</>}
            {sample.costPrice !== null && <> · Cost {naira(sample.costPrice)}</>}
            {sample.bulkPricing.length > 0 && <> · {sample.bulkPricing.length} bulk tier(s)</>}
            {sample.stock !== null && <> · Stock {sample.stock} {sample.unit || 'units'}</>}
            {sample.variants.length > 0 && <> · {sample.variants.length} variant(s)</>}
          </span>
          <span className="font-caption text-caption text-text-tertiary">
            Regular, sale, cost and bulk prices, units and variants are stored as separate fields — never merged.
          </span>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-xl bg-badge-discount-bg p-space-md flex items-center gap-space-sm">
          <Icon name="check_circle" className="text-[28px] text-badge-discount-text" />
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-badge-discount-text font-semibold">Everything looks clean</span>
            <span className="font-caption text-caption text-text-secondary">No issues found in any row.</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border-subtle overflow-hidden">
          <div className="max-h-[340px] overflow-y-auto divide-y divide-border-subtle">
            {sorted.map((issue, index) => {
              const draft = draftById.get(issue.rowId);
              return (
                <button
                  key={`${issue.rowId}-${issue.field ?? 'row'}-${index}`}
                  type="button"
                  onClick={() => onJumpToRow(issue.rowId, issue.rowNumber)}
                  className={`w-full flex items-start gap-space-sm px-space-sm py-space-xs text-left hover:bg-surface-subtle transition-colors ${
                    issue.severity === 'blocking' ? 'bg-error-container/30' : 'bg-surface-canvas'
                  }`}
                >
                  <Icon
                    name={issueIcon(issue)}
                    className={`text-[18px] shrink-0 mt-0.5 ${issue.severity === 'blocking' ? 'text-error' : 'text-text-tertiary'}`}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-space-2xs">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate max-w-[220px]">
                        {draft?.name?.trim() || `Row ${issue.rowNumber}`}
                      </span>
                      <span className="font-caption text-caption text-text-tertiary">row {issue.rowNumber}</span>
                      {issue.severity === 'blocking' && (
                        <span className="px-space-2xs py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-[10px] font-bold uppercase">
                          blocking
                        </span>
                      )}
                    </span>
                    <span className="font-caption text-caption text-text-secondary block mt-0.5">{issue.message}</span>
                  </span>
                  <Icon name="edit" className="text-[15px] text-text-tertiary shrink-0 mt-0.5" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {report.blockedCount > 0 && (
        <p className="font-caption text-caption text-text-secondary leading-relaxed">
          Blocked rows are skipped in this run — fix them in the review table (tap any issue above), then continue.
          Successful rows are never re-imported if you retry later.
        </p>
      )}
    </div>
  );
}
