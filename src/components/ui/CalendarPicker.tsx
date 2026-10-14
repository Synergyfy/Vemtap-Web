import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { spaDateKey, spaParseDate, spaToday } from '../../scripts/spaBookingData';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface CalendarDayNote {
  label: string;
  tone?: 'default' | 'discount' | 'tertiary';
}

export interface CalendarPickerProps {
  /** Selected date as `YYYY-MM-DD`. */
  valueISO: string;
  onSelect: (iso: string) => void;
  /** Return true to disable a date (past, closed, out of window…). */
  isDateDisabled?: (date: Date) => boolean;
  /** Optional small caption under each day number. */
  dateNote?: (iso: string) => CalendarDayNote | undefined;
}

const NOTE_TONE_CLASS: Record<NonNullable<CalendarDayNote['tone']>, string> = {
  default: 'text-text-tertiary',
  discount: 'text-badge-discount-text',
  tertiary: 'text-text-tertiary',
};

/**
 * Full month-grid calendar (BUG-020). Past / disabled dates are struck out
 * and unselectable; available dates are selectable on desktop and mobile.
 */
export function CalendarPicker({ valueISO, onSelect, isDateDisabled, dateNote }: CalendarPickerProps) {
  const today = useMemo(() => spaToday(), []);
  const initial = valueISO ? spaParseDate(valueISO) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const atFirstAllowedMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const leadingBlanks = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const goPrev = () => {
    if (atFirstAllowedMonth) return;
    const next = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const goNext = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          aria-label="Previous month"
          type="button"
          disabled={atFirstAllowedMonth}
          onClick={goPrev}
          className="flex size-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="chevron_left" className="text-[20px]" />
        </button>
        <span className="font-label-md text-label-md font-bold text-on-surface">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          aria-label="Next month"
          type="button"
          onClick={goNext}
          className="flex size-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-container-low"
        >
          <Icon name="chevron_right" className="text-[20px]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="text-center text-[11px] font-semibold uppercase tracking-wide text-text-tertiary py-1"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} />;
          const iso = spaDateKey(date);
          const disabled = isDateDisabled?.(date) ?? false;
          const selected = iso === valueISO;
          const note = disabled ? undefined : dateNote?.(iso);
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={date.toDateString()}
              onClick={() => onSelect(iso)}
              className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 transition ${
                selected
                  ? 'bg-primary-container text-white shadow-md ring-2 ring-primary-container ring-offset-1'
                  : disabled
                    ? 'bg-surface-subtle text-text-tertiary cursor-not-allowed opacity-50'
                    : 'bg-surface-container-lowest border border-border-subtle text-on-surface hover:border-primary'
              }`}
            >
              <span className={`text-label-md text-label-md font-semibold ${disabled ? 'line-through' : ''}`}>
                {date.getDate()}
              </span>
              {note && (
                <span
                  className={`text-[9px] font-semibold leading-none mt-0.5 px-1 rounded-full ${
                    selected ? 'text-white/90' : NOTE_TONE_CLASS[note.tone ?? 'default']
                  }`}
                >
                  {note.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border-subtle text-[11px] text-text-secondary">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container" /> Selected
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" /> Available
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-surface-container-high" /> Unavailable
        </span>
      </div>
    </div>
  );
}
