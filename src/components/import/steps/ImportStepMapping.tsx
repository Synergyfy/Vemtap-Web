import { Icon } from '../../ui/Icon';
import { IMPORT_FIELDS, type ImportFieldKey, type ImportMapping, type ParsedColumn, type ParsedSpreadsheet } from '../../../scripts/productImport/importTypes';
import { ambiguityNotice, hasUnconfirmedAmbiguity, mappingProblems } from '../../../scripts/productImport/importMapping';

interface ImportStepMappingProps {
  sheet: ParsedSpreadsheet;
  columns: ParsedColumn[];
  mapping: ImportMapping;
  onMappingChange: (index: number, field: ImportFieldKey) => void;
  confirmed: Record<number, boolean>;
  onConfirm: (index: number) => void;
}

const CONFIDENCE_STYLE: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-badge-discount-bg text-badge-discount-text',
  medium: 'bg-surface-tint-blue text-primary',
  low: 'bg-error-container text-on-error-container',
};

function confidenceBand(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

/** Step 2 — automatic column mapping with per-column correction. */
export function ImportStepMapping({
  sheet,
  columns,
  mapping,
  onMappingChange,
  confirmed,
  onConfirm,
}: ImportStepMappingProps) {
  const unconfirmed = hasUnconfirmedAmbiguity(columns, mapping, confirmed);
  const problems = mappingProblems(mapping);
  const blocked = unconfirmed.length > 0 || problems.length > 0;

  return (
    <div className="flex flex-col gap-space-md">
      <div>
        <h2 className="font-heading-md text-heading-md text-text-primary">Match your columns</h2>
        <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
          We analysed &quot;{sheet.fileName}&quot; — {sheet.rows.length.toLocaleString()} product rows across{' '}
          {columns.length} columns — and guessed a mapping from your headers and sample values. Correct anything
          that&apos;s wrong.
        </p>
      </div>

      {sheet.warnings.length > 0 && (
        <div className="rounded-xl bg-surface-container-low p-space-sm flex flex-col gap-space-2xs">
          <span className="font-label-sm text-label-sm text-text-secondary font-semibold flex items-center gap-space-2xs">
            <Icon name="info" className="text-[16px]" />
            Notes while reading the file
          </span>
          {sheet.warnings.map((warning) => (
            <span key={warning} className="font-caption text-caption text-text-secondary">
              • {warning}
            </span>
          ))}
        </div>
      )}

      {unconfirmed.length > 0 && (
        <div role="alert" className="rounded-xl bg-error-container p-space-sm flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-error-container font-semibold flex items-center gap-space-2xs">
            <Icon name="help" className="text-[18px]" />
            Confirm {unconfirmed.length === 1 ? 'this guess' : 'these guesses'} before continuing
          </span>
          {unconfirmed.map((column) => (
            <div key={column.index} className="flex flex-wrap items-center gap-space-xs bg-surface-canvas/70 rounded-lg p-space-xs">
              <span className="font-caption text-caption text-text-primary flex-1 min-w-[200px]">
                {ambiguityNotice(column)}
              </span>
              <button
                type="button"
                onClick={() => onConfirm(column.index)}
                className="px-space-xs py-1 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary transition-colors"
              >
                Yes, use “{IMPORT_FIELDS.find((field) => field.key === column.suggestedField)?.label}”
              </button>
              <span className="font-caption text-caption text-text-secondary">or pick the correct field below</span>
            </div>
          ))}
        </div>
      )}

      {problems.length > 0 && (
        <div className="rounded-xl bg-error-container p-space-sm flex flex-col gap-space-2xs">
          {problems.map((problem) => (
            <span key={problem} className="font-caption text-caption text-on-error-container flex items-center gap-space-2xs">
              <Icon name="priority_high" className="text-[15px]" />
              {problem}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col rounded-xl border border-border-subtle overflow-hidden">
        {columns.map((column) => {
          const field = mapping[column.index] ?? 'ignore';
          const isAmbiguous = column.ambiguous && !confirmed[column.index] && field !== 'ignore';
          const sample = column.samples[0] ?? '—';
          return (
            <div
              key={column.index}
              className={`flex flex-col md:flex-row md:items-center gap-space-sm p-space-sm border-b border-border-subtle last:border-b-0 ${
                isAmbiguous ? 'bg-error-container/40' : column.suggestedField === 'ignore' ? 'bg-surface-subtle/50' : 'bg-surface-canvas'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-space-2xs min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{column.header}</span>
                  <span
                    className={`px-space-2xs py-0.5 rounded-full font-caption text-[11px] font-semibold whitespace-nowrap ${
                      CONFIDENCE_STYLE[confidenceBand(column.confidence)]
                    }`}
                  >
                    {Math.round(column.confidence * 100)}% match
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary block mt-0.5 truncate">
                  {column.reason} — e.g. “{sample}”
                </span>
              </div>
              <div className="flex items-center gap-space-xs shrink-0">
                {column.ambiguous && field !== 'ignore' && !confirmed[column.index] && (
                  <button
                    type="button"
                    onClick={() => onConfirm(column.index)}
                    className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center"
                    title="Confirm this guess"
                  >
                    <Icon name="help" className="text-[16px]" />
                  </button>
                )}
                {column.ambiguous && confirmed[column.index] && (
                  <span title="Confirmed by you">
                    <Icon name="verified" className="text-[18px] text-badge-discount-text" />
                  </span>
                )}
                <select
                  aria-label={`Map column "${column.header}"`}
                  value={field}
                  onChange={(event) => onMappingChange(column.index, event.target.value as ImportFieldKey)}
                  className={`h-10 min-w-[170px] bg-surface-container-low rounded-lg px-space-xs font-label-sm text-label-sm text-text-primary outline-none focus:shadow-[0_0_0_2px_#066cf4] transition-all ${
                    field === 'ignore' ? 'text-text-tertiary' : ''
                  }`}
                >
                  {IMPORT_FIELDS.map((spec) => (
                    <option key={spec.key} value={spec.key}>
                      {spec.label}
                      {spec.required ? ' *' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-caption text-caption text-text-tertiary leading-relaxed">
        Columns marked &quot;Do not import&quot; keep their values visible in the review table and travel with the
        product record — nothing from your file is discarded.
      </p>

      {blocked && (
        <p className="font-label-sm text-label-sm text-error font-semibold">
          Resolve the items above to continue.
        </p>
      )}
    </div>
  );
}
