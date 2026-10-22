import { useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import {
  reasonCopy,
  verificationService,
  type IdentityIdType,
  type VerificationCheck,
} from '../../services/verificationService';

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
/** Public page the selfie tab returns to; it only asks the user to close the tab. */
export const LIVENESS_RETURN_PATH = '/verification/liveness-done';

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
