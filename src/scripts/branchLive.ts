import type { Branch } from '../services/branchService';

/**
 * Display values for live branches, shared by the branch screens so each one
 * maps a real branch into its own card shape the same way.
 */

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

type DayHours = { open?: string; close?: string; closed?: boolean };

const to12h = (value: string) => {
  const [h, m = '00'] = value.split(':');
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${((hour + 11) % 12) + 1}:${m.padStart(2, '0')} ${suffix}`;
};

const todayHours = (branch: Branch, now = new Date()): DayHours | null => {
  const hours = branch.businessHours as Record<string, DayHours> | null | undefined;
  return hours?.[DAYS[now.getDay()]] ?? null;
};

/** "Open Now • Closes 9:00 PM" / "Closed today" / "Hours not set". */
export const branchOpenLabel = (branch: Branch, now = new Date()) => {
  const today = todayHours(branch, now);
  if (!today) return 'Hours not set';
  if (today.closed || !today.open || !today.close) return 'Closed today';
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [oh, om = '0'] = today.open.split(':').map(Number) as unknown as [number, number];
  const [ch, cm = '0'] = today.close.split(':').map(Number) as unknown as [number, number];
  const open = Number(oh) * 60 + Number(om);
  const close = Number(ch) * 60 + Number(cm);
  if (minutes >= open && minutes < close) return `Open Now • Closes ${to12h(today.close)}`;
  return minutes < open ? `Opens ${to12h(today.open)}` : 'Closed now';
};

/** "· 8:00 AM – 10:00 PM (today)" style hours line. */
export const branchHoursLabel = (branch: Branch, now = new Date()) => {
  const today = todayHours(branch, now);
  if (!today) return 'Hours not set';
  if (today.closed || !today.open || !today.close) return 'Closed today';
  return `${to12h(today.open)} – ${to12h(today.close)} today`;
};

export const branchAddressLabel = (branch: Branch) =>
  [branch.address, branch.city, branch.state].filter(Boolean).join(', ') || '—';
