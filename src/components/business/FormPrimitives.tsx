import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';
import { PosToggle } from '../PosControls';

export function SettingsSection({ title, icon, children }: { title: string; icon?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-md">
      <h2 className="flex items-center gap-space-xs font-heading-sm text-heading-sm text-text-primary">
        {icon ? (
          <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
            <Icon name={icon} className="text-[18px]" />
          </span>
        ) : null}
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SwitchRow({
  title,
  body,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  body?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-space-md ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex flex-col min-w-0">
        <span className="font-label-md text-label-md text-text-primary font-medium">{title}</span>
        {body ? <span className="font-caption text-caption text-text-secondary">{body}</span> : null}
      </div>
      <PosToggle checked={checked} onChange={() => onChange(!checked)} ariaLabel={title} />
    </div>
  );
}

const fieldClass =
  'w-full h-11 px-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-container/40 disabled:opacity-60';

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  disabled,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: 'decimal' | 'numeric' | 'text' | 'tel';
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label htmlFor={id} className="font-label-sm text-label-sm text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        className={fieldClass}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <span className="font-caption text-caption text-text-tertiary">{hint}</span> : null}
    </div>
  );
}

export function RadioCard({
  title,
  body,
  selected,
  onSelect,
}: {
  title: string;
  body?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex items-start gap-space-xs p-space-sm rounded-lg text-left transition-colors border ${
        selected ? 'bg-surface-tint-blue border-primary/40' : 'bg-surface-subtle border-transparent hover:bg-surface-container-low'
      }`}
    >
      <Icon
        name={selected ? 'radio_button_checked' : 'radio_button_unchecked'}
        className={`text-[20px] ${selected ? 'text-primary' : 'text-text-tertiary'}`}
      />
      <span className="flex flex-col">
        <span className="font-label-md text-label-md text-text-primary font-medium">{title}</span>
        {body ? <span className="font-caption text-caption text-text-secondary">{body}</span> : null}
      </span>
    </button>
  );
}

/** Sticky save bar shown under a settings form. */
export function SaveBar({
  label,
  note,
  dirty,
  saving,
  saved,
  error,
  onSave,
  onReset,
}: {
  label: string;
  note?: string;
  dirty: boolean;
  saving: boolean;
  saved?: boolean;
  error?: string | null;
  onSave: () => void;
  onReset?: () => void;
}) {
  return (
    <div className="sticky bottom-0 lg:bottom-4 z-10 rounded-xl bg-surface-canvas/95 backdrop-blur border border-border-subtle shadow-lg p-space-sm flex flex-col sm:flex-row sm:items-center gap-space-xs justify-between">
      <span className={`font-caption text-caption ${error ? 'text-red-600' : 'text-text-secondary'}`}>
        {error ?? (saved && !dirty ? 'Saved' : note)}
      </span>
      <div className="flex gap-space-xs">
        {onReset && dirty ? (
          <button
            type="button"
            onClick={onReset}
            disabled={saving}
            className="h-10 px-space-md rounded-lg bg-surface-container text-text-primary font-label-md text-label-md"
          >
            Discard
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
        >
          {saving ? 'Saving…' : label}
        </button>
      </div>
    </div>
  );
}
