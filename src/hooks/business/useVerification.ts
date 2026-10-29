import { useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import {
  reasonCopy,
  verificationService,
  type BusinessVerificationStatus,
  type IdentityIdType,
  type VerificationCheck,
  type VerificationCheckStatus,
} from '../../services/verificationService';
import { useMyBusiness } from './useMyBusiness';
import { useSessionUser } from '../useSessionUser';

export const verificationKeys = { status: ['verification', 'status'] as const };

export function useVerificationStatus() {
  return useQuery({ queryKey: verificationKeys.status, queryFn: verificationService.status, staleTime: 30_000 });
}

export interface CheckOutcome {
  result: 'success' | 'review';
  check: VerificationCheck;
  /** Human-readable reasons when the check needs review. */
  reasons: string[];
}

const POLL_MS = 3_000;
const LIVENESS_TIMEOUT_MS = 10 * 60_000;
/** Where the selfie tab returns to: the status center, which shows the result. */
export const LIVENESS_RETURN_PATH = '/business-verification/status';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** "14 / 08 / 1989" or "1989-08-14" → "1989-08-14"; undefined when unreadable. */
export function toIsoDate(value: string): string | undefined {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split(/\D+/).filter(Boolean);
  if (parts.length !== 3) return undefined;
  const [day, month, year] = parts;
  if (year.length !== 4) return undefined;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

const outcome = (check: VerificationCheck): CheckOutcome => ({
  result: check.status === 'verified' ? 'success' : 'review',
  check,
  reasons: reasonCopy(check.reasons),
});

export function useVerificationActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: verificationKeys.status });

  /**
   * Identity check. Live: opens bytID's selfie check in a new tab (opened
   * synchronously so popup blockers allow it), polls until the selfie passes,
   * then submits the ID details. Demo: resolves like the old simulation.
   * Must be called directly from a click handler.
   */
  const verifyIdentity = async (
    input: { idType: IdentityIdType; idNumber: string; legalName: string; dateOfBirth: string },
    onStage?: (stage: 'selfie' | 'checking') => void,
  ): Promise<CheckOutcome> => {
    const { firstName, lastName } = splitName(input.legalName);
    if (!firstName || !lastName) throw new Error('Enter your first and last name as they appear on the ID.');
    const dob = input.dateOfBirth ? toIsoDate(input.dateOfBirth) : undefined;
    if (input.dateOfBirth && !dob) throw new Error('Enter your date of birth as DD / MM / YYYY.');
    const base = { idType: input.idType, idNumber: input.idNumber || undefined, firstName, lastName, dob };

    if (!hasApiConfig()) {
      onStage?.('checking');
      const check = await verificationService.verifyIdentity({ ...base, livenessSessionId: 'demo' });
      return outcome(check);
    }

    const selfieTab = window.open('', '_blank');
    try {
      const session = await verificationService.startLiveness(window.location.origin + LIVENESS_RETURN_PATH);
      if (selfieTab) selfieTab.location.href = session.url;
      else window.open(session.url, '_blank');
      onStage?.('selfie');

      const deadline = Date.now() + LIVENESS_TIMEOUT_MS;
      for (;;) {
        await wait(POLL_MS);
        const liveness = await verificationService.livenessStatus(session.sessionId);
        if (liveness.status === 'passed') break;
        if (liveness.status === 'failed') throw new Error(reasonCopy(liveness.reasons)[0] ?? 'The selfie check did not pass. Try again in good light.');
        if (liveness.status === 'expired' || Date.now() > deadline) throw new Error('The selfie check timed out. Start again when you are ready.');
      }

      onStage?.('checking');
      const check = await verificationService.verifyIdentity({ ...base, livenessSessionId: session.sessionId });
      return outcome(check);
    } catch (error) {
      selfieTab?.close();
      throw error;
    } finally {
      void refresh();
    }
  };

  /** CAC check — `entity` + digits, e.g. `RC` + `1234567`. */
  const verifyBusiness = async (entity: string, cacNumber: string): Promise<CheckOutcome> => {
    const digits = cacNumber.replace(/\D/g, '');
    const prefix = (entity || cacNumber.replace(/[^a-z]/gi, '').slice(0, 2)).toUpperCase();
    if (!/^(RC|BN|IT)$/.test(prefix) || !digits) throw new Error('Enter a CAC number that starts with RC, BN or IT.');
    try {
      return outcome(await verificationService.verifyBusiness(`${prefix}${digits}`));
    } finally {
      void refresh();
    }
  };

  const submitUnregistered = async (note?: string) => {
    try {
      return outcome(await verificationService.submitUnregistered({ note }));
    } finally {
      void refresh();
    }
  };

  return { verifyIdentity, verifyBusiness, submitUnregistered };
}

const STATUS_LABEL: Record<BusinessVerificationStatus, string> = {
  verified: 'Verified Business',
  in_progress: 'Verification in progress',
  needs_review: 'Under review',
  rejected: 'Verification rejected',
  unverified: 'Not verified yet',
};

const CHECK_LABEL: Record<VerificationCheckStatus, string> = {
  verified: 'Verified',
  pending: 'Pending',
  needs_review: 'In review',
  failed: 'Failed',
};

const ID_TYPE_LABEL: Record<string, string> = {
  nin: 'NIN',
  drivers_license: "Driver's licence",
  voters_card: "Voter's card",
  passport: 'Passport',
};

const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

const checkSummary = (check?: VerificationCheck | null) => ({
  label: check ? CHECK_LABEL[check.status] : 'Not started',
  ok: check?.status === 'verified',
  name: check?.recordName ?? null,
  ref: check?.maskedId ?? null,
  idType: check ? (ID_TYPE_LABEL[check.idType] ?? check.idType) : null,
  note: check ? (reasonCopy(check.reasons)[0] ?? null) : null,
  date: shortDate(check?.reviewedAt ?? check?.createdAt),
});

/**
 * Display values for the verification status center, from `GET /verification/status`
 * and the business record. `live` is false in demo mode, where the page keeps its sample copy.
 */
export function useVerificationSummary() {
  const live = hasApiConfig();
  const status = useVerificationStatus();
  const business = useMyBusiness();
  const data = live ? status.data : undefined;
  const identity = checkSummary(data?.identity);
  const registration = checkSummary(data?.business);
  return {
    live,
    loading: live && status.isLoading,
    businessName: business.data?.name ?? 'Your business',
    verified: data?.isVerified ?? false,
    statusLabel: data ? STATUS_LABEL[data.status] : 'Checking status…',
    lastVerified: shortDate(data?.verifiedAt),
    checksVerified: Number(identity.ok) + Number(registration.ok),
    identity,
    registration,
  };
}

/** Verification flow step "Start verification" resumes at. */
export type VerificationResumeStep = 'idType' | 'cacStatus' | 'inReview' | 'complete';

/**
 * The verification intro's live facts: where the owner left off, the button
 * and note that match it, and the business shown on the badge preview.
 * Demo mode always starts fresh with the sample copy.
 */
export function useVerificationIntro() {
  const live = hasApiConfig();
  const status = useVerificationStatus();
  const business = useMyBusiness();
  const data = live ? status.data : undefined;
  const done = Boolean(data?.isVerified) || data?.nextStep === 'done';
  const resumeStep: VerificationResumeStep = done
    ? 'complete'
    : data?.nextStep === 'review'
      ? 'inReview'
      : data?.nextStep === 'business'
        ? 'cacStatus'
        : 'idType';
  const rejected = data?.status === 'rejected';
  const copy: Record<VerificationResumeStep, { cta: string; note: string | null }> = {
    idType: {
      cta: rejected ? 'Try Verification Again' : 'Start Verification',
      note: rejected ? 'Your last verification attempt wasn’t approved. You can try again.' : null,
    },
    cacStatus: { cta: 'Continue Verification', note: 'Your identity is verified. Next: your business registration.' },
    inReview: { cta: 'View Review Status', note: 'Your details are with our team for review.' },
    complete: { cta: 'View Verification', note: 'Your business is verified.' },
  };
  return {
    live,
    loading: live && status.isLoading,
    resumeStep,
    verified: done,
    started: live && resumeStep !== 'idType',
    ...copy[resumeStep],
    businessName: live ? business.data?.name?.trim() || 'Your business' : 'Your Store Name',
    logoUrl: live ? business.data?.logoUrl ?? null : null,
  };
}

/** What each ID type actually needs, as the verification API checks it. */
export const ID_TYPE_REQUIREMENTS: Record<IdentityIdType, string> = {
  nin: 'Your 11-digit NIN and a quick selfie — checked against the NIMC registry.',
  drivers_license: 'Your licence number and a quick selfie — checked against the FRSC registry.',
  voters_card: 'Your 19-character VIN and a quick selfie — checked against the INEC registry.',
  passport: 'A clear photo of your passport data page and a quick selfie (no registry lookup).',
};

const ID_TYPE_NAMES: Record<string, string> = {
  nin: 'NIN',
  drivers_license: "Driver's Licence",
  voters_card: "Voter's Card",
  passport: 'Passport',
};

/**
 * Live facts for the ID-type step: the name the ID must match, and the last
 * identity attempt when it didn't go through. Empty in demo mode.
 */
export function useIdTypeStep() {
  const live = hasApiConfig();
  const status = useVerificationStatus();
  const user = useSessionUser().data;
  const identity = live ? status.data?.identity : null;
  const lastAttempt =
    identity && identity.status !== 'verified'
      ? {
          idType: identity.idType,
          label: [ID_TYPE_NAMES[identity.idType] ?? identity.idType, identity.maskedId].filter(Boolean).join(' '),
          underReview: identity.status === 'needs_review' || identity.status === 'pending',
          reasons: reasonCopy(identity.reasons),
        }
      : null;
  return {
    live,
    accountName: live ? [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null : null,
    lastAttempt,
  };
}
