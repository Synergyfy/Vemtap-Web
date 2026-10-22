import { createContext, useContext } from 'react';

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
 * It is additionally mirrored into `sessionStorage`, so a hard browser
 * refresh (or reopening the tab on Vercel, where every URL is a fresh page
 * load) resumes the run at the same step with the same drafts instead of
 * restarting setup from scratch.
 * ------------------------------------------------------------------ */

export interface BusinessSetupSnapshot {
  step: string;
  verificationState: VerificationSectionState;
  data: Record<string, unknown>;
}

const SNAPSHOT_STORAGE_KEY = 'vemtap_business_setup_snapshot';

function readPersistedSnapshot(): BusinessSetupSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BusinessSetupSnapshot | null;
    if (
      !parsed ||
      typeof parsed.step !== 'string' ||
      typeof parsed.data !== 'object' ||
      !parsed.data
    ) {
      return null;
    }
    return parsed;
  } catch {
    // Unreadable/corrupted payload or storage blocked — start clean.
    return null;
  }
}

function persistSnapshot(): void {
  try {
    if (snapshot) {
      window.sessionStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    } else {
      window.sessionStorage.removeItem(SNAPSHOT_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode/quota) — the in-memory copy still works.
  }
}

// Hydrate from the previous page load so a refresh mid-setup resumes the run.
let snapshot: BusinessSetupSnapshot | null = readPersistedSnapshot();

export function getBusinessSetupSnapshot(): BusinessSetupSnapshot | null {
  return snapshot;
}

export function saveBusinessSetupSnapshot(step: string, data: Record<string, unknown>): void {
  snapshot = {
    step,
    verificationState: snapshot?.verificationState ?? 'not-started',
    data,
  };
  persistSnapshot();
}

export function setBusinessSetupVerificationState(state: VerificationSectionState): void {
  snapshot = snapshot
    ? { ...snapshot, verificationState: state }
    : { step: 'basic', verificationState: state, data: {} };
  persistSnapshot();
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
    snapshot = { ...snapshot, step };
    persistSnapshot();
  }
}

/** Called only once setup is genuinely finished, so a new run starts clean. */
export function clearBusinessSetupSnapshot(): void {
  snapshot = null;
  persistSnapshot();
}
