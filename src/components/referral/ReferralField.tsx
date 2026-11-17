import { Icon } from '../ui/Icon';

export interface ReferralFieldProps {
  value: string;
  onChange: (next: string) => void;
  /** True when the field was prefilled from a referral URL. */
  fromUrl?: boolean;
  /** Uses the shorter helper line (for already-dense desktop panels). */
  compact?: boolean;
  /** Lets several instances on one page keep unique label targets. */
  inputId?: string;
}

const REFERRAL_FIELD_ID = 'referral-code';

/**
 * Optional referral code entry.
 *
 * Deliberately inert on its own: the field accepts whatever the merchant types
 * (letters, numbers, spaces, dashes) and never blocks keystrokes or judges a
 * half-typed code. Validation happens once, at submit time, inside
 * `ReferralConfirmSheet`, which is what keeps the Apply/Skip buttons out of
 * the way.
 */
export function ReferralField({
  value,
  onChange,
  fromUrl = false,
  compact = false,
  inputId = REFERRAL_FIELD_ID,
}: ReferralFieldProps) {
  return (
    <div className="flex flex-col gap-space-2xs">
      <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor={inputId}>
        Referral code <span className="text-text-tertiary font-normal">(optional)</span>
      </label>

      <div className="flex flex-col">
        <div className="flex-1 flex items-center bg-surface-subtle rounded-xl h-[50px] px-4 shadow-sm border border-transparent focus-within:border-primary/40 transition-colors">
          <Icon name="confirmation_number" className="text-[18px] text-text-tertiary mr-2 shrink-0" />
          <input
            autoCapitalize="characters"
            autoComplete="off"
            className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:ring-0 tracking-[0.08em] uppercase"
            id={inputId}
            maxLength={16}
            placeholder="e.g. VEM-8OGUU4"
            spellCheck={false}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>

        <p className="font-caption text-caption text-text-tertiary leading-snug mt-space-2xs">
          {fromUrl
            ? 'Prefilled from your referral link — letters, numbers and dashes, checked when you finish setup.'
            : compact
              ? 'Letters, numbers and dashes, 4–16 characters. We check it when you finish setup — you can also skip it.'
              : 'Have a code from a friend or business? Letters, numbers and dashes, 4–16 characters. We check it when you finish setup, and you can skip it.'}
        </p>
      </div>
    </div>
  );
}
