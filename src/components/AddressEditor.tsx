import { useState } from 'react';
import { Icon } from './ui/Icon';
import type { AddressInput, SavedAddress } from '../services/addressesService';

interface AddressEditorProps {
  /** The address being edited; omit to add a new one. */
  initial?: SavedAddress | null;
  busy?: boolean;
  onCancel: () => void;
  onSave: (input: AddressInput) => void;
}

const LABELS = ['Home', 'Office', 'Other'] as const;

/** Inline add/edit fields for a saved address, rendered inside the address card. */
export function AddressEditor({ initial, busy, onCancel, onSave }: AddressEditorProps) {
  const [label, setLabel] = useState(initial?.label ?? 'Home');
  const [line, setLine] = useState(initial?.line ?? '');
  const [area, setArea] = useState(initial?.area ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!label.trim()) return setError('Give this place a name');
    if (line.trim().length < 3) return setError('Enter the street address');
    setError(null);
    onSave({
      label: label.trim(),
      line: line.trim(),
      ...(area.trim() ? { area: area.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      isDefault,
    });
  };

  const input =
    'h-11 w-full px-space-sm rounded-lg bg-surface-subtle border border-border-subtle text-body-md font-body-md text-text-primary outline-none focus:border-primary transition-colors';

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-wrap gap-space-2xs">
        {LABELS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLabel(option === 'Other' ? (['Home', 'Office'].includes(label) ? '' : label) : option)}
            className={`h-8 px-space-sm rounded-full text-label-sm font-label-sm font-semibold transition-colors ${
              (option === 'Other' ? !['Home', 'Office'].includes(label) : label === option)
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-text-secondary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {!['Home', 'Office'].includes(label) && (
        <label className="flex flex-col gap-space-2xs">
          <span className="text-label-sm font-label-sm text-text-secondary font-semibold">Name</span>
          <input className={input} value={label} maxLength={40} placeholder="e.g. Mum's place" onChange={(event) => setLabel(event.target.value)} />
        </label>
      )}
      <label className="flex flex-col gap-space-2xs">
        <span className="text-label-sm font-label-sm text-text-secondary font-semibold">Street address</span>
        <input className={input} value={line} maxLength={200} placeholder="House number and street" onChange={(event) => setLine(event.target.value)} />
      </label>
      <label className="flex flex-col gap-space-2xs">
        <span className="text-label-sm font-label-sm text-text-secondary font-semibold">Area / city (optional)</span>
        <input className={input} value={area} maxLength={120} placeholder="District, city" onChange={(event) => setArea(event.target.value)} />
      </label>
      <label className="flex flex-col gap-space-2xs">
        <span className="text-label-sm font-label-sm text-text-secondary font-semibold">Directions (optional)</span>
        <input className={input} value={notes} maxLength={200} placeholder="Landmark, gate colour…" onChange={(event) => setNotes(event.target.value)} />
      </label>
      <label className="flex items-center gap-space-xs text-body-md font-body-md text-text-primary">
        <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} className="w-4 h-4 accent-primary" />
        <span>Use as my default address</span>
      </label>
      {error && (
        <p className="flex items-center gap-space-2xs text-label-sm font-label-sm text-error">
          <Icon name="error" className="text-[16px]" />
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-space-xs">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-space-sm rounded-lg bg-surface-container text-text-secondary text-label-sm font-label-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="h-9 px-space-sm rounded-lg bg-primary text-on-primary text-label-sm font-label-sm font-semibold disabled:opacity-60"
        >
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Save address'}
        </button>
      </div>
    </div>
  );
}
