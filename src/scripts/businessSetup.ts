import { createContext, useContext } from 'react';
import { getAccessToken, hasApiConfig } from '../services/api/client';
import { businessSetupService } from '../services/businessSetupService';

/**
 * Shared model for the three top-level business-setup sections. This is the
 * single source of truth for the progress tracker rendered across the
 * onboarding screens (desktop chrome + mobile), so a section means the same
 * thing everywhere it appears.
 */
export type BusinessSetupSectionId = 'profile' | 'offerings' | 'verification';

export type BusinessSetupSectionState = 'completed' | 'active' | 'available' | 'locked';

export type VerificationSectionState = 'not-started' | 'in-progress' | 'complete';

export interface BusinessSetupSectionMeta {
  id: BusinessSetupSectionId;
  title: string;
  shortTitle: string;
  summary: string;
  icon: string;
}

export const BUSINESS_SETUP_SECTIONS: readonly BusinessSetupSectionMeta[] = [
  {
    id: 'profile',
    title: 'Business Profile',
    shortTitle: 'Profile',
    summary: 'Business information, branding, contact details, social channels, location and branches.',
    icon: 'storefront',
  },
  {
    id: 'offerings',
    title: 'Products, Services & Deals',
    shortTitle: 'Products & Deals',
    summary: 'Create and manage catalogue items, configure offers, set redemption rules and review publications.',
    icon: 'shopping_bag',
  },
  {
    id: 'verification',
    title: 'Business Verification',
    shortTitle: 'Verification',
    summary: 'Complete the applicable verification requirements and track the verification status.',
    icon: 'verified_user',
  },
];

export interface BusinessSetupProgressSnapshot {
  activeSection: BusinessSetupSectionId;
  profileCompleted: boolean;
  offeringsCompleted: boolean;
  verificationState: VerificationSectionState;
}

/**
 * Navigation is separated from eligibility: a section is `locked` purely
 * because a prerequisite section is unfinished, while `available`/`active`
 * only describe navigation. Whether the business is actually *eligible* for
 * verification is decided inside the verification flow.
 */
export function getSectionStates(
  snapshot: BusinessSetupProgressSnapshot,
): Record<BusinessSetupSectionId, BusinessSetupSectionState> {
  const prereqMet: Record<BusinessSetupSectionId, boolean> = {
    profile: true,
    offerings: snapshot.profileCompleted,
    verification: snapshot.offeringsCompleted,
  };
  const done: Record<BusinessSetupSectionId, boolean> = {
    profile: snapshot.profileCompleted,
    offerings: snapshot.offeringsCompleted,
    verification: snapshot.verificationState === 'complete',
  };
  const result: Record<BusinessSetupSectionId, BusinessSetupSectionState> = {
    profile: 'locked',
    offerings: 'locked',
    verification: 'locked',
  };
  BUSINESS_SETUP_SECTIONS.forEach(({ id }) => {
    if (id === snapshot.activeSection) result[id] = 'active';
    else if (done[id]) result[id] = 'completed';
    else result[id] = prereqMet[id] ? 'available' : 'locked';
  });
  return result;
}

export interface BusinessSetupNavValue extends BusinessSetupProgressSnapshot {
  /** Navigate to a section. Ignored while the section is locked. */
  onSelectSection: (id: BusinessSetupSectionId) => void;
}

export const BusinessSetupNavContext = createContext<BusinessSetupNavValue | null>(null);

export function useBusinessSetupNav(): BusinessSetupNavValue | null {
  return useContext(BusinessSetupNavContext);
}

/* ------------------------------------------------------------------ *
 * Progress persistence.
 *
 * The onboarding container and the verification route are separate routes,
 * so the container unmounts while verification is open. This tiny module-level
 * snapshot keeps the merchant's progress (current step + in-flight drafts)
 * alive across that round trip so returning resumes at the right step instead
 * of restarting setup.
 *
 * It is additionally mirrored into `localStorage` (and, live, the owner's
 * account), so a reload, a later visit or another device resumes the run on
 * the page after the last one completed, with the same drafts.
 * ------------------------------------------------------------------ */

export interface BusinessSetupSnapshot {
  step: string;
  /** The page after the last completed one — where a return visit lands. */
  resumeStep?: string;
  /** Pages the merchant has moved forward from. */
  completedSteps?: string[];
  verificationState: VerificationSectionState;
  data: Record<string, unknown>;
  /** Last change (ms); the newest of the local and account copies wins. */
  updatedAt?: number;
  /** Every setup page is done; only verification (reviewed separately) is left. */
  screensDone?: boolean;
}

// Mirrored to localStorage so a reload, or coming back later, resumes setup
// at the same step with the same drafts (cleared once setup is finished).
const STORAGE_KEY = 'vemtap_business_setup';

const isSnapshot = (value: unknown): value is BusinessSetupSnapshot => {
  const parsed = value as BusinessSetupSnapshot | null;
  return !!parsed && typeof parsed.step === 'string' && typeof parsed.data === 'object' && !!parsed.data;
};

const readStored = (): BusinessSetupSnapshot | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    // A corrupted or older-shaped payload starts clean instead of crashing setup.
    return isSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

let snapshot: BusinessSetupSnapshot | null = typeof window === 'undefined' ? null : readStored();

const writeLocal = () => {
  try {
    if (snapshot) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: progress still lives for this page view.
  }
};

/* Live, a signed-in owner's run is also kept on their account (debounced),
 * so sign-out, cleared storage or another device resumes at the same page. */
const SERVER_SAVE_DELAY_MS = 800;
let serverSaveTimer: number | undefined;

const canSyncToServer = () => hasApiConfig() && Boolean(getAccessToken());

/** Inline images (`data:` URLs) are re-uploaded by their step, never stored on the account. */
const withoutInlineImages = (value: unknown): unknown => {
  if (typeof value === 'string') return value.startsWith('data:') ? undefined : value;
  if (Array.isArray(value)) return value.map(withoutInlineImages);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, withoutInlineImages(entry)]));
  }
  return value;
};

const cancelServerSave = () => {
  if (serverSaveTimer !== undefined) window.clearTimeout(serverSaveTimer);
  serverSaveTimer = undefined;
};

const scheduleServerSave = () => {
  if (!canSyncToServer()) return;
  cancelServerSave();
  serverSaveTimer = window.setTimeout(() => {
    serverSaveTimer = undefined;
    // Signed out while waiting: nothing to save to.
    if (!snapshot || !canSyncToServer()) return;
    businessSetupService.save(withoutInlineImages(snapshot) as Record<string, unknown>).catch(() => {
      // Best effort: the local copy still resumes setup on this device.
    });
  }, SERVER_SAVE_DELAY_MS);
};

const persist = () => {
  if (snapshot) snapshot = { ...snapshot, updatedAt: Date.now() };
  writeLocal();
  if (snapshot) scheduleServerSave();
};

export function getBusinessSetupSnapshot(): BusinessSetupSnapshot | null {
  return snapshot;
}

export function saveBusinessSetupSnapshot(step: string, data: Record<string, unknown>): void {
  snapshot = {
    ...snapshot,
    step,
    verificationState: snapshot?.verificationState ?? 'not-started',
    data,
  };
  persist();
}

/**
 * Moving forward completes the page being left: it is recorded, and the page
 * moved to becomes where a return visit resumes. Going back changes neither.
 */
export function recordBusinessSetupAdvance(from: string, to: string): void {
  const completed = snapshot?.completedSteps ?? [];
  snapshot = {
    step: snapshot?.step ?? from,
    verificationState: snapshot?.verificationState ?? 'not-started',
    data: snapshot?.data ?? {},
    ...snapshot,
    completedSteps: completed.includes(from) ? completed : [...completed, from],
    resumeStep: to,
  };
  persist();
}

/** The page a saved run reopens on: after the last completed page, else where it was left. */
export function getBusinessSetupResumeStep(saved: BusinessSetupSnapshot | null = snapshot): string | null {
  return saved ? saved.resumeStep ?? saved.step : null;
}

/**
 * Whether a signed-in owner has setup to come back to: a run that got past the
 * marketing intro and whose setup pages are not all done yet.
 */
export function hasUnfinishedBusinessSetup(saved: BusinessSetupSnapshot | null = snapshot): boolean {
  if (!saved || saved.screensDone || saved.verificationState === 'complete') return false;
  return getBusinessSetupResumeStep(saved) !== 'intro' || (saved.completedSteps?.length ?? 0) > 0;
}

/**
 * Live: adopt the account's copy of the run when it is newer than this
 * device's (or this device has none), so setup resumes after sign-out or on
 * another device. Resolves with the run to resume (or null).
 */
export async function hydrateBusinessSetupFromServer(): Promise<BusinessSetupSnapshot | null> {
  if (!canSyncToServer()) return snapshot;
  try {
    const remote = await businessSetupService.get();
    if (isSnapshot(remote) && (!snapshot || (remote.updatedAt ?? 0) > (snapshot.updatedAt ?? 0))) {
      snapshot = remote;
      writeLocal();
    }
  } catch {
    // Offline or not available: keep this device's copy.
  }
  return snapshot;
}

/** The last setup page is done: return visits stop reopening setup. */
export function markBusinessSetupScreensDone(): void {
  if (snapshot) {
    snapshot = { ...snapshot, screensDone: true };
    persist();
  }
}

export function setBusinessSetupVerificationState(state: VerificationSectionState): void {
  snapshot = snapshot
    ? { ...snapshot, verificationState: state }
    : { step: 'basic', verificationState: state, data: {} };
  persist();
}

/**
 * Re-aim a saved run at another step without touching its in-flight drafts.
 * The business sign-up happens on the marketing intro, so when it completes
 * the run is pointed at `basic` ("Business Profile") before the onboarding
 * route mounts — otherwise restoring the saved `intro` step would send the new
 * merchant back to the screen they just left.
 */
export function setBusinessSetupSnapshotStep(step: string): void {
  if (snapshot) {
    snapshot = { ...snapshot, step, resumeStep: step };
    persist();
  }
}

/** Called only once setup is genuinely finished, so a new run starts clean (here and on the account). */
export function clearBusinessSetupSnapshot(): void {
  snapshot = null;
  cancelServerSave();
  writeLocal();
  if (canSyncToServer()) {
    businessSetupService.clear().catch(() => {
      // Best effort: a stale account copy is ignored once verification is complete.
    });
  }
}

/**
 * Sign-out: forget the run on this device only. The owner's account keeps its
 * copy, so signing back in resumes setup while the next person starts clean.
 */
export function forgetLocalBusinessSetup(): void {
  snapshot = null;
  cancelServerSave();
  writeLocal();
}

/* ------------------------------------------------------------------ *
 * Business sign-up, before the account exists.
 *
 * Email → code → name/phone/PIN happen before there is an account to save to,
 * so the stage reached and the details typed are kept on this device. A
 * return visit reopens the next stage with them filled in. The PIN and the
 * code are never stored.
 * ------------------------------------------------------------------ */

/** The sign-up screen a return visit reopens (the one after the last completed). */
export type BusinessSignupStage = 'business-auth' | 'verify-email' | 'profile-setup';

const SIGNUP_STAGES: readonly BusinessSignupStage[] = ['business-auth', 'verify-email', 'profile-setup'];

export interface BusinessSignupRecord {
  stage: BusinessSignupStage;
  /** Where the code was sent; known from `verify-email` on. */
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  updatedAt: number;
}

const SIGNUP_STORAGE_KEY = 'vemtap_business_signup';
/** Sign-up codes expire; after a day a fresh start is clearer than a stale resume. */
const SIGNUP_TTL_MS = 24 * 60 * 60 * 1000;

export function getBusinessSignup(): BusinessSignupRecord | null {
  try {
    const raw = window.localStorage.getItem(SIGNUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BusinessSignupRecord | null;
    const valid =
      !!parsed &&
      SIGNUP_STAGES.includes(parsed.stage) &&
      (parsed.stage === 'business-auth' || !!parsed.email) &&
      Date.now() - (parsed.updatedAt ?? 0) < SIGNUP_TTL_MS;
    if (!valid) {
      window.localStorage.removeItem(SIGNUP_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveBusinessSignup(patch: Partial<Omit<BusinessSignupRecord, 'updatedAt'>>): void {
  const current = getBusinessSignup();
  const next = { ...current, ...patch, updatedAt: Date.now() };
  // Past the email screen, nothing can resume without the email the code was sent to.
  if (!next.stage || (next.stage !== 'business-auth' && !next.email)) return;
  try {
    window.localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: the in-memory flow still works this visit.
  }
}

export function clearBusinessSignup(): void {
  try {
    window.localStorage.removeItem(SIGNUP_STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing was saved.
  }
}
