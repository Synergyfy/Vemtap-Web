/**
 * Shared display helpers.
 *
 * The app has no network layer, so formatting lives here rather than being
 * re-implemented per screen (several screens previously each rolled their own
 * naira formatter, and phone masking did not exist at all).
 */

/**
 * Mask a phone number so only the last three digits stay visible.
 *
 * `+234 803 555 0192` -> `+234 ••• ••• 192`
 * `0803555192`        -> `•••••• 192`
 */
export function maskPhone(phone?: string | null): string {
  if (typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  // Keep the country/trunk prefix readable; mask everything else but last 3.
  const prefix = /^\+(\d{1,3}|234)|^0/.exec(trimmed)?.[0] ?? '';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length <= 3) return trimmed;

  const visibleTail = digits.slice(-3);
  const hiddenCount = digits.length - prefix.replace(/\D/g, '').length - 3;

  if (hiddenCount <= 0) return visibleTail;

  // Group the masked run in threes so it reads like a phone number.
  const masked = Array.from({ length: hiddenCount }, () => '•')
    .reduce<string[]>((groups, _, index) => {
      const groupIndex = Math.floor(index / 3);
      groups[groupIndex] = (groups[groupIndex] ?? '') + '•';
      return groups;
    }, [])
    .join(' ');

  const country = /^\+/.test(prefix) ? prefix : '';
  return `${country}${country ? ' ' : ''}${masked} ${visibleTail}`;
}

/** `9600` -> `₦9,600` */
export function formatNaira(value: number): string {
  return `\u20A6${Math.round(value).toLocaleString('en-US')}`;
}
