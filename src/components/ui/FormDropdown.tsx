import { useState } from 'react';
import { Icon } from './Icon';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface FormDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
}

export function FormDropdown({ value, options, onChange, ariaLabel, placeholder }: FormDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="w-full min-h-11 px-3.5 py-1.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-2 text-left transition-all focus:outline-none focus:bg-surface-canvas"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-2.5 min-w-0 py-0.5">
          {selected?.icon && (
            <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name={selected.icon} className="text-[18px]" />
            </span>
          )}
          <span className="flex flex-col min-w-0">
            {selected ? (
              <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                {selected.label}
              </span>
            ) : (
              <span className="font-label-md text-label-md text-text-tertiary truncate">
                {placeholder ?? 'Select an option'}
              </span>
            )}
            {selected?.description && (
              <span className="font-caption text-caption text-text-secondary truncate">{selected.description}</span>
            )}
          </span>
        </span>
        <Icon
          name="expand_more"
          className={`text-[20px] text-text-tertiary transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-40 bg-surface-canvas rounded-xl shadow-lg border border-border-subtle py-1 overflow-hidden"
          role="listbox"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                aria-selected={active}
                className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-surface-subtle active:bg-surface-container transition-colors"
                key={option.value}
                role="option"
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.icon && (
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      active ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <Icon name={option.icon} className="text-[18px]" />
                  </span>
                )}
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-on-surface truncate">{option.label}</span>
                  {option.description && (
                    <span className="font-caption text-caption text-text-secondary truncate">{option.description}</span>
                  )}
                </span>
                {active && <Icon name="check" className="text-primary text-[18px] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
