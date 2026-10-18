import { useState } from 'react';
import { Icon } from './Icon';
import { FormDropdown, type DropdownOption } from './FormDropdown';
import { MultiSelectDropdown } from './MultiSelectDropdown';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WEEKDAY_ABBREVIATIONS: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

export interface StandardHours {
  days: string[];
  open: string;
  close: string;
}

export interface CustomDayHours {
  day: string;
  open: string;
  close: string;
}

interface OperatingHoursEditorProps {
  standard: StandardHours;
  onStandardChange: (standard: StandardHours) => void;
  customDays: CustomDayHours[];
  onCustomDaysChange: (customDays: CustomDayHours[]) => void;
  customizeEnabled: boolean;
  onCustomizeEnabledChange: (enabled: boolean) => void;
  /** Caption shown under the "Customize specific day hours" label. */
  customizeHint?: string;
  /** Extra note appended to the standard-hours summary (e.g. timezone). */
  timezoneNote?: string;
  /** Tighter spacing for the mobile card layout. */
  dense?: boolean;
}

const formatTime = (totalMinutes: number): string => {
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

/** 6:00 AM through 11:30 PM in 30-minute steps. */
const TIME_OPTIONS: DropdownOption[] = Array.from({ length: 36 }, (_, index) => {
  const label = formatTime(6 * 60 + index * 30);
  return { value: label, label };
});

const DAY_OPTIONS: DropdownOption[] = WEEKDAYS.map((day) => ({ value: day, label: day }));

const summarizeDays = (days: string[]): string => {
  if (days.length === WEEKDAYS.length) return 'Mon – Sun';
  if (days.length === 0) return 'No days selected';
  return days.map((day) => WEEKDAY_ABBREVIATIONS[day] ?? day).join(', ');
};

export function OperatingHoursEditor({
  standard,
  onStandardChange,
  customDays,
  onCustomDaysChange,
  customizeEnabled,
  onCustomizeEnabledChange,
  customizeHint,
  timezoneNote,
  dense = false,
}: OperatingHoursEditorProps) {
  const [editingStandard, setEditingStandard] = useState(false);

  const standardDaysAll = standard.days.length === WEEKDAYS.length;
  const summaryTitle = standard.days.length > 0 ? `${summarizeDays(standard.days)} Standard` : 'No standard days';
  const summaryTime = `${standard.open} – ${standard.close}${standardDaysAll ? ' (Daily)' : ''}${
    timezoneNote ? ` • ${timezoneNote}` : ''
  }`;

  const usedCustomDays = customDays.map((entry) => entry.day);
  const unusedDays = WEEKDAYS.filter((day) => !usedCustomDays.includes(day));

  const updateCustomDay = (index: number, patch: Partial<CustomDayHours>) => {
    onCustomDaysChange(customDays.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)));
  };

  const removeCustomDay = (index: number) => {
    onCustomDaysChange(customDays.filter((_, entryIndex) => entryIndex !== index));
  };

  const addCustomDay = () => {
    if (unusedDays.length === 0) return;
    onCustomDaysChange([...customDays, { day: unusedDays[0], open: standard.open, close: standard.close }]);
  };

  const rowPadding = dense ? 'p-space-sm' : 'p-space-md';

  return (
    <div className="flex flex-col gap-space-md">
      <div className="bg-surface-subtle rounded-xl flex flex-col">
        {editingStandard ? (
          <div className={`flex flex-col gap-space-sm ${rowPadding}`}>
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Standard hours</span>
              <button
                className="h-9 px-space-sm rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container transition-colors flex items-center gap-space-2xs active:opacity-75"
                type="button"
                onClick={() => setEditingStandard(false)}
              >
                <Icon name="check" className="text-[16px]" />
                <span>Done</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-sm text-label-sm text-text-secondary">Applies to weekdays</span>
              <MultiSelectDropdown
                ariaLabel="Select weekdays for standard hours"
                placeholder="Choose weekdays"
                values={standard.days}
                options={DAY_OPTIONS}
                onChange={(days) => onStandardChange({ ...standard, days })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-sm text-label-sm text-text-secondary">Opens</span>
                <FormDropdown
                  ariaLabel="Standard opening time"
                  placeholder="Opening time"
                  value={standard.open}
                  options={TIME_OPTIONS}
                  onChange={(open) => onStandardChange({ ...standard, open })}
                />
              </div>
              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-sm text-label-sm text-text-secondary">Closes</span>
                <FormDropdown
                  ariaLabel="Standard closing time"
                  placeholder="Closing time"
                  value={standard.close}
                  options={TIME_OPTIONS}
                  onChange={(close) => onStandardChange({ ...standard, close })}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex items-center justify-between gap-space-sm ${rowPadding}`}>
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
                <Icon name="calendar_today" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary truncate">{summaryTitle}</span>
                <span className="font-caption text-caption text-text-secondary truncate">{summaryTime}</span>
              </div>
            </div>
            <button
              className="h-9 px-space-sm rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container transition-colors active:opacity-75 shrink-0"
              type="button"
              onClick={() => setEditingStandard(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-space-sm pt-space-2xs">
        <div className="flex flex-col min-w-0">
          <span className="font-label-sm text-label-sm text-text-secondary">Customize specific day hours</span>
          {customizeHint && <span className="font-caption text-caption text-text-tertiary">{customizeHint}</span>}
        </div>
        <button
          aria-label="Customize specific day hours"
          aria-pressed={customizeEnabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
            customizeEnabled ? 'bg-primary-container' : 'bg-surface-container'
          }`}
          type="button"
          onClick={() => onCustomizeEnabledChange(!customizeEnabled)}
        >
          <span
            className={`${
              customizeEnabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-canvas shadow transition duration-200 ease-in-out`}
          />
        </button>
      </div>

      {customizeEnabled && (
        <div className="flex flex-col gap-space-xs">
          {customDays.length === 0 && (
            <p className="font-caption text-caption text-text-tertiary px-1">
              No custom days yet. Add a day to override your standard hours.
            </p>
          )}
          {customDays.map((entry, index) => (
            <div className={`bg-surface-subtle rounded-xl flex flex-col gap-space-xs ${rowPadding}`} key={entry.day}>
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-secondary font-semibold uppercase tracking-wider">
                  Custom day {index + 1}
                </span>
                <button
                  aria-label={`Remove custom hours for ${entry.day}`}
                  className="w-8 h-8 -mr-1 flex items-center justify-center rounded-full text-text-tertiary hover:text-error hover:bg-surface-container transition-colors"
                  type="button"
                  onClick={() => removeCustomDay(index)}
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
                <FormDropdown
                  ariaLabel={`Weekday for custom day ${index + 1}`}
                  placeholder="Weekday"
                  value={entry.day}
                  options={DAY_OPTIONS.map((option) => ({
                    ...option,
                    disabled: option.value !== entry.day && usedCustomDays.includes(option.value),
                  }))}
                  onChange={(day) => updateCustomDay(index, { day })}
                />
                <FormDropdown
                  ariaLabel={`Opening time for ${entry.day}`}
                  placeholder="Opens"
                  value={entry.open}
                  options={TIME_OPTIONS}
                  onChange={(open) => updateCustomDay(index, { open })}
                />
                <FormDropdown
                  ariaLabel={`Closing time for ${entry.day}`}
                  placeholder="Closes"
                  value={entry.close}
                  options={TIME_OPTIONS}
                  onChange={(close) => updateCustomDay(index, { close })}
                />
              </div>
            </div>
          ))}
          <button
            className="self-start h-9 px-space-sm rounded-lg bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-space-2xs hover:bg-surface-container transition-colors active:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={unusedDays.length === 0}
            type="button"
            onClick={addCustomDay}
          >
            <Icon name="add" className="text-[16px]" />
            <span>{unusedDays.length === 0 ? 'All days customized' : 'Add specific day'}</span>
          </button>
          {customDays.length > 0 && (
            <p className="font-caption text-caption text-text-tertiary px-1">
              Custom days override your standard hours for the selected weekday.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
