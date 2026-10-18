import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import type { DropdownOption } from './FormDropdown';

interface MultiSelectDropdownProps {
  values: string[];
  options: DropdownOption[];
  onChange: (values: string[]) => void;
  ariaLabel: string;
  placeholder?: string;
  /** Prevents selecting more than this many options (undefined = unlimited). */
  maxSelected?: number;
  /** Renders the collapsed control in a read-only state. */
  disabled?: boolean;
}

/**
 * Compact collapsed control that expands into a checkbox list. Selected values stay
 * visible in the collapsed control as a truncated summary plus a count badge.
 */
export function MultiSelectDropdown({
  values,
  options,
  onChange,
  ariaLabel,
  placeholder = 'Select options',
  maxSelected,
  disabled = false,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const selectedLabels = options.filter((option) => values.includes(option.value)).map((option) => option.label);
  const limitReached = typeof maxSelected === 'number' && values.length >= maxSelected;

  const toggleOption = (option: DropdownOption) => {
    if (option.disabled) return;
    const isSelected = values.includes(option.value);
    if (!isSelected && limitReached) return;
    onChange(isSelected ? values.filter((value) => value !== option.value) : [...values, option.value]);
  };

  return (
    <div className="relative">
      {open && !disabled && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="w-full h-[52px] px-4 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-space-xs text-left font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-subtle transition-all disabled:opacity-60"
        disabled={disabled}
        title={selectedLabels.join(', ')}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={`truncate ${selectedLabels.length === 0 ? 'text-text-tertiary' : ''}`}>
          {selectedLabels.length === 0 ? placeholder : selectedLabels.join(' • ')}
        </span>
        {values.length > 0 && (
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
            {values.length}
          </span>
        )}
        <Icon
          name="expand_more"
          className={`text-[20px] text-text-tertiary transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && !disabled && (
        <div
          aria-multiselectable="true"
          className="absolute top-full left-0 right-0 mt-1 z-40 bg-surface-canvas rounded-xl shadow-lg border border-border-subtle py-1 max-h-64 overflow-y-auto"
          role="listbox"
        >
          {options.length === 0 && (
            <p className="px-4 py-3 font-body-md text-body-md text-text-secondary">
              No options available yet. Make your other selections first.
            </p>
          )}
          {options.map((option) => {
            const active = values.includes(option.value);
            const optionDisabled = option.disabled || (!active && limitReached);
            return (
              <button
                aria-selected={active}
                className={`w-full px-4 py-2.5 flex items-center gap-space-sm text-left transition-colors ${
                  optionDisabled ? 'opacity-45 cursor-not-allowed' : 'hover:bg-surface-subtle active:bg-surface-container'
                }`}
                disabled={optionDisabled}
                key={option.value}
                role="option"
                type="button"
                onClick={() => toggleOption(option)}
              >
                <span
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                    active ? 'bg-primary border-primary' : 'bg-surface-canvas border-outline-variant'
                  }`}
                >
                  {active && <Icon name="check" filled className="text-[14px] text-on-primary" />}
                </span>
                <span className="flex flex-col min-w-0 flex-1">
                  <span
                    className={`font-label-md text-label-md truncate ${
                      option.disabled ? 'line-through text-text-tertiary' : 'text-on-surface'
                    }`}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="font-caption text-caption text-text-secondary truncate">{option.description}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
