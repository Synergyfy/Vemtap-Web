import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { POS_MODIFIER_GROUPS, describeModifiers, modifierSurcharge, naira } from './posRegisterExtras';

/**
 * Modifier picker for a ticket line. Toggles grouped options and reports the
 * chosen ids (plus the surcharge) back to the caller, which folds them into
 * the line's `mods` label and unit price.
 */
export function PosModifiersModal({
  lineName,
  initial,
  onCancel,
  onApply,
}: {
  lineName: string;
  /** Modifier ids already applied to the line. */
  initial: string[];
  onCancel: () => void;
  onApply: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const surcharge = modifierSurcharge(selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Modifiers">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[86vh]">
        <div className="px-space-lg pt-space-lg pb-space-sm border-b border-border-subtle flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">Modifiers</h2>
            <p className="font-caption text-caption text-text-secondary truncate mt-0.5">{lineName}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors shrink-0"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-space-lg py-space-md flex flex-col gap-space-md">
          {POS_MODIFIER_GROUPS.map((group) => (
            <div key={group.id} className="flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const active = selected.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggle(option.id)}
                      className={`h-10 px-space-sm rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        active
                          ? 'bg-surface-tint-blue text-primary'
                          : 'bg-surface hover:bg-surface-container-high text-text-primary'
                      }`}
                    >
                      {active && <Icon name="check" className="text-[15px]" />}
                      <span>{option.label}</span>
                      {option.price > 0 && (
                        <span className="font-caption text-caption text-text-tertiary">+{naira(option.price)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selected.length === 0 && (
            <p className="font-caption text-caption text-text-tertiary">
              No modifiers selected — the line keeps its standard preparation.
            </p>
          )}
        </div>

        <div className="px-space-lg py-space-md border-t border-border-subtle flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-caption text-caption text-text-secondary block truncate">
              {selected.length > 0 ? describeModifiers(selected) : 'No modifiers'}
            </span>
            {surcharge > 0 && (
              <span className="font-label-sm text-label-sm font-semibold text-primary">+{naira(surcharge)} per item</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 px-space-md rounded-xl border border-border bg-surface hover:bg-surface-subtle text-text-secondary font-label-md text-label-md font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onApply(selected)}
              className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Icon name="check" className="text-[17px]" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
