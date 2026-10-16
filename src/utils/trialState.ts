/**
 * Persistent, idempotent trial state.
 *
 * The trial period is recorded once in localStorage. `startTrial()` is safe to
 * call repeatedly — it never resets an existing trial's start date and never
 * creates a duplicate subscription record. This prevents accidental re-activation
 * when a user navigates back and re-enters the trial confirmation screen.
 */

const TRIAL_STORAGE_KEY = 'vemtap_trial_state_v1';
export const TRIAL_DAYS = 30;
const DAY_MS = 86400000;

export interface TrialState {
  startedAt: string | null;
  status: 'none' | 'active' | 'expired';
}

function readRaw(): TrialState {
  try {
    const raw = window.localStorage.getItem(TRIAL_STORAGE_KEY);
    if (!raw) return { startedAt: null, status: 'none' };
    const parsed = JSON.parse(raw) as TrialState;
    if (!parsed || typeof parsed.startedAt !== 'string') return { startedAt: null, status: 'none' };
    return parsed;
  } catch {
    return { startedAt: null, status: 'none' };
  }
}

function writeRaw(state: TrialState) {
  try {
    window.localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

/** Returns the current trial state, auto-transitioning to `expired` when the window has passed. */
export function getTrialState(): TrialState {
  const state = readRaw();
  if (state.status !== 'active' || !state.startedAt) return state;
  const end = new Date(state.startedAt).getTime() + TRIAL_DAYS * DAY_MS;
  if (Date.now() >= end) {
    const expired: TrialState = { startedAt: state.startedAt, status: 'expired' };
    writeRaw(expired);
    return expired;
  }
  return state;
}

export function hasActiveTrial(): boolean {
  return getTrialState().status === 'active';
}

/**
 * Starts the trial. Idempotent: if a trial is already active (or was already
 * started and expired), the original start date is preserved and no new
 * subscription record is created. Returns `fresh: true` only on first activation.
 */
export function startTrial(): { state: TrialState; fresh: boolean } {
  const current = getTrialState();
  if (current.startedAt) {
    return { state: current, fresh: false };
  }
  const next: TrialState = { startedAt: new Date().toISOString(), status: 'active' };
  writeRaw(next);
  return { state: next, fresh: true };
}

export function getTrialEndDate(): Date | null {
  const state = getTrialState();
  if (!state.startedAt) return null;
  return new Date(new Date(state.startedAt).getTime() + TRIAL_DAYS * DAY_MS);
}

export function getTrialDaysLeft(): number {
  const state = getTrialState();
  if (state.status !== 'active' || !state.startedAt) return 0;
  const end = new Date(state.startedAt).getTime() + TRIAL_DAYS * DAY_MS;
  return Math.max(0, Math.ceil((end - Date.now()) / DAY_MS));
}

/** Dev/testing helper — clears the persisted trial record. */
export function clearTrialState() {
  try {
    window.localStorage.removeItem(TRIAL_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
