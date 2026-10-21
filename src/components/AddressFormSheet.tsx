import { useEffect, useState } from 'react';
import { Icon } from './ui/Icon';
import { SheetShell } from './sheets/SheetShell';
import type { AddressInput, SavedAddress } from '../services/addressesService';
import { apiErrorMessage } from '../services/errorMessages';

interface AddressFormSheetProps {
  open: boolean;
  /** The address being edited; omit to add a new one. */
  address?: SavedAddress | null;
  onClose: () => void;
  onSave: (input: AddressInput) => Promise<void>;
}

const LABEL_PRESETS = ['Home', 'Office', 'Other'];

const inputClass =
  'w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-text-tertiary outline-none focus:bg-surface-canvas shadow-sm transition-all';

/** Add or edit a saved address (label, street line, area, delivery notes). */
export function AddressFormSheet({ open, address, onClose, onSave }: AddressFormSheetProps) {
  const [label, setLabel] = useState('Home');
  const [line, setLine] = useState('');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLabel(address?.label ?? 'Home');
    setLine(address?.line ?? '');
    setArea(address?.area ?? '');
    setNotes(address?.notes ?? '');
    setIsDefault(false);
    setError(null);
  }, [open, address]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!label.trim() || !line.trim()) {
      setError('Add a label and the street address.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        label: label.trim(),
        line: line.trim(),
        area: area.trim() || undefined,
        notes: notes.trim() || undefined,
        ...(isDefault ? { isDefault: true } : {}),
      });
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save this address. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SheetShell open={open} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-space-md p-space-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-heading-sm text-heading-sm text-on-surface">{address ? 'Edit address' : 'Add an address'}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex gap-space-xs">
          {LABEL_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setLabel(preset)}
              className={`h-9 px-space-sm rounded-full font-label-sm text-label-sm font-semibold transition-colors ${
                label === preset ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-text-secondary">Label</span>
          <input className={inputClass} value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-text-secondary">Street address</span>
          <input
            className={inputClass}
            value={line}
            maxLength={200}
            placeholder="12 Aminu Kano Crescent, Wuse II"
            onChange={(e) => setLine(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-text-secondary">City / area (optional)</span>
          <input
            className={inputClass}
            value={area}
            maxLength={120}
            placeholder="Abuja, FCT"
            onChange={(e) => setArea(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-text-secondary">Delivery notes (optional)</span>
          <input
            className={inputClass}
            value={notes}
            maxLength={300}
            placeholder="Gate code, landmark…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        {!address?.isDefault && (
          <label className="flex items-center gap-space-xs font-body-md text-body-md text-text-primary">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            Make this my default address
          </label>
        )}

        {error && <p className="font-caption text-caption text-error">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 rounded-xl bg-primary text-on-primary font-button text-button font-semibold disabled:opacity-60 active:scale-[0.98] transition-transform"
        >
          {saving ? 'Saving…' : 'Save address'}
        </button>
      </form>
    </SheetShell>
  );
}
