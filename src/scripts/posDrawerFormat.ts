/** Shared labels for the POS business header and persisted cash-drawer records. */

/** Removes a location suffix such as "— Wuse II" from the live business name. */
export const cleanPosBusinessName = (name?: string | null, branchName?: string | null) => {
  const cleaned = (name ?? '')
    .replace(/\s*[—–]\s*.*$/, '')
    .replace(/\s+-\s+[^-]+$/, '')
    .trim();
  if (!cleaned) return '';
  // The old header showed "Name • Name" when the branch carried the same name.
  if (branchName && cleaned.toLowerCase() === branchName.trim().toLowerCase()) return cleaned;
  return cleaned;
};

export const drawerMoney = (value?: number | string | null) =>
  `₦${(Number(value) || 0).toLocaleString()}`;

export const drawerDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
