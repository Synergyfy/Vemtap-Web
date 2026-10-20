import { createPortal } from 'react-dom';
import { useAnchoredPanel } from '../hooks/useAnchoredPanel';
import { Icon } from './ui/Icon';

export interface FilterChoice {
  /** `''` conventionally means "no filter — show everything". */
  value: string;
  label: string;
  /** Optional right-aligned hint (counts, units, ranges). */
  meta?: string;
}

export interface FilterMenuProps {
  /** Button text. Pass `null` for an icon-only trigger. */
  label?: string | null;
  icon?: string;
  iconClassName?: string;
  choices: FilterChoice[];
  value: string;
  onChange: (next: string) => void;
  /** Full trigger classes. When omitted a neutral toolbar button is used. */
  buttonClassName?: string;
  /** Which edge the panel lines up with. */
  align?: 'left' | 'right';
  /** Names the control when `label` is null. */
  ariaLabel?: string;
  /** Heading rendered above the choices. */
  title?: string;
}

const DEFAULT_TRIGGER =
  'inline-flex items-center gap-space-2xs h-11 px-space-sm rounded-xl bg-surface-container-low shadow-sm font-label-sm text-label-sm font-semibold text-on-surface hover:bg-surface-container transition-colors shrink-0';

const PANEL_WIDTH = 248;

/**
 * Single-select dropdown filter — the shared replacement for every inert
 * "Filter" button in the app.
 *
 * The panel is portalled to `document.body` and anchored by
 * `useAnchoredPanel`, so it is never clipped by a scrolling toolbar or lost
 * inside a `backdrop-blur` header. Only the *selection* lives here: each screen
 * keeps its own predicate, so a backend query can replace it later without
 * touching this component.
 */
export function FilterMenu({
  label = 'Filter',
  icon = 'tune',
  iconClassName,
  choices,
  value,
  onChange,
  buttonClassName,
  align = 'right',
  ariaLabel,
  title,
}: FilterMenuProps) {
  const { open, setOpen, triggerRef, panelRef, style } = useAnchoredPanel({
    width: PANEL_WIDTH,
    align,
  });

  const active = choices.find((choice) => choice.value === value);
  const hasActive = active !== undefined && active.value !== '';

  const panel = (
    <>
      {/* Backdrop doubles as the outside-click-to-close affordance. */}
      <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
      <div
        aria-label={title ?? ariaLabel ?? 'Filter options'}
        aria-orientation="vertical"
        className="fixed z-[61] bg-surface-canvas rounded-xl shadow-xl border border-border-subtle overflow-y-auto no-scrollbar p-space-2xs"
        ref={panelRef}
        role="menu"
        style={style}
      >
        {title && (
          <div className="px-space-xs py-space-2xs font-caption text-caption text-text-tertiary font-semibold uppercase tracking-wide">
            {title}
          </div>
        )}
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <button
              aria-checked={selected}
              className={`w-full text-left px-space-xs py-space-xs rounded-lg font-label-sm text-label-sm flex items-center justify-between gap-space-xs transition-colors ${
                selected
                  ? 'bg-surface-tint-blue text-primary font-semibold'
                  : 'hover:bg-surface-container-low text-text-primary'
              }`}
              key={choice.value}
              onClick={() => {
                onChange(choice.value);
                setOpen(false);
              }}
              role="menuitemradio"
              type="button"
            >
              <span className="truncate">{choice.label}</span>
              <span className="flex items-center gap-space-2xs shrink-0">
                {choice.meta && (
                  <span className="font-caption text-caption text-text-tertiary">{choice.meta}</span>
                )}
                {selected && <Icon className="text-[16px]" name="check" />}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label === null ? (ariaLabel ?? 'Filter') : undefined}
        className={`${buttonClassName ?? DEFAULT_TRIGGER} ${hasActive ? 'ring-1 ring-primary/40' : ''}`}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        {hasActive && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
        <Icon className={iconClassName ?? (label === null ? 'text-[18px]' : 'text-[16px]')} name={icon} />
        {label !== null && <span>{hasActive && active ? active.label : label}</span>}
      </button>
      {open && typeof document !== 'undefined' && createPortal(panel, document.body)}
    </>
  );
}
