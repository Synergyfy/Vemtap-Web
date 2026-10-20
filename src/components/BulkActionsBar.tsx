import { useRef, useState } from 'react';
import { Icon } from './ui/Icon';

export interface BulkAction {
  value: string;
  label: string;
  /** Greyed out with an explanatory tooltip when false. */
  disabled?: boolean;
  /** Shown as the option's tooltip / the Apply button's title. */
  hint?: string;
}

export interface BulkActionsBarProps {
  /** How many rows are currently selected. */
  selectedCount: number;
  /** How many rows the current filter shows — the "select all" scope. */
  filteredCount: number;
  /** How many rows exist in total, when it differs from `filteredCount`. */
  totalCount?: number;
  /** Extra context word in the scope sentence, e.g. "products" or "rows". */
  scopeNoun?: string;
  /**
   * Overrides the scope sentence, e.g. "1,000 rows in this file" when the list
   * is paginated and the selection covers more than one page.
   */
  viewLabel?: string;
  /** Overrides the "Select all N in view" wording. */
  selectAllLabel?: string;
  actions: BulkAction[];
  /** Called with the chosen action value once Apply is pressed. */
  onApply: (action: string) => void;
  /** Selects every row in the current filtered view. */
  onSelectAllFiltered?: () => void;
  onClearSelection?: () => void;
  /** Renders an extra inline control (e.g. a category input) next to Apply. */
  extra?: React.ReactNode;
  /** Disables the Apply button while an action is running. */
  busy?: boolean;
}

/**
 * WordPress-style bulk actions control: a dropdown of actions plus an Apply
 * button, a selection counter, and explicit scope helpers so it is always
 * obvious whether an action will touch the selected rows or the whole
 * filtered view.
 *
 * Selection is never assumed — nothing happens until the merchant picks an
 * action and presses Apply, and "select all" only ever covers the rows
 * currently on screen (never hidden pages).
 */
export function BulkActionsBar({
  selectedCount,
  filteredCount,
  totalCount,
  scopeNoun = 'items',
  viewLabel,
  selectAllLabel,
  actions,
  onApply,
  onSelectAllFiltered,
  onClearSelection,
  extra,
  busy = false,
}: BulkActionsBarProps) {
  const [action, setAction] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);

  const chosen = actions.find((entry) => entry.value === action);
  const canApply = Boolean(action) && !busy && !(chosen?.disabled ?? false);

  // Reset the dropdown once the action has been applied so a stale choice
  // cannot be re-applied accidentally on the next batch.
  const handleApply = () => {
    if (!canApply) return;
    onApply(action);
    setAction('');
    selectRef.current?.focus();
  };

  const scopeText =
    viewLabel ??
    (totalCount !== undefined && totalCount !== filteredCount
      ? `${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} ${scopeNoun} shown`
      : `${filteredCount.toLocaleString()} ${scopeNoun} in this view`);

  return (
    <div className="rounded-xl bg-surface-tint-blue border border-primary/15 p-space-sm flex flex-col gap-space-xs">
      <div className="flex flex-wrap items-center gap-space-xs">
        <span className="font-label-md text-label-md text-primary font-semibold whitespace-nowrap">
          {selectedCount > 0 ? `${selectedCount.toLocaleString()} selected` : 'Bulk actions'}
        </span>

        <select
          ref={selectRef}
          aria-label="Bulk actions"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          className="h-9 min-w-[170px] bg-surface-canvas rounded-lg px-space-xs font-label-sm text-label-sm text-text-primary outline-none focus:shadow-[0_0_0_2px_#066cf4] disabled:opacity-50"
          disabled={busy}
        >
          <option value="">Choose action…</option>
          {actions.map((entry) => (
            <option key={entry.value} value={entry.value} disabled={entry.disabled} title={entry.hint}>
              {entry.label}
              {entry.disabled ? ' (unavailable)' : ''}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!canApply}
          title={canApply ? undefined : (chosen?.hint ?? 'Choose an action to apply')}
          onClick={handleApply}
          className="h-9 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary transition-colors disabled:opacity-40 disabled:hover:bg-primary-container"
        >
          {busy ? <Icon name="progress_activity" className="text-[16px] animate-spin" /> : <span>Apply</span>}
        </button>

        {extra}

        <div className="ml-auto flex items-center gap-space-xs">
          {onSelectAllFiltered && filteredCount > 0 && (
            <button
              type="button"
              onClick={onSelectAllFiltered}
              className="font-caption text-caption text-primary font-semibold whitespace-nowrap hover:underline"
            >
              Select all {selectAllLabel ?? `${filteredCount.toLocaleString()} in view`}
            </button>
          )}
          {onClearSelection && selectedCount > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="font-caption text-caption text-text-secondary font-semibold whitespace-nowrap hover:text-text-primary"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-space-2xs font-caption text-caption text-text-secondary">
        <Icon name="info" className="text-[14px] text-primary shrink-0" />
        <span>
          {selectedCount > 0
            ? `Applies to the ${selectedCount.toLocaleString()} selected ${scopeNoun} only — nothing else is changed.`
            : `Nothing selected. Choose an action, then select rows — actions only touch what you select.`}
        </span>
        <span className="whitespace-nowrap">({scopeText})</span>
      </div>
    </div>
  );
}
