import { ApiError } from './api/client';

/**
 * Mirror of the backend's plan-restriction contract
 * (`apps/backend/src/common/enums/plan-errors.enum.ts`). Services send the slug
 * as the 403 body's `error`; the Subscription and Capability guards only send
 * a message, so those are recognised by their fixed wording as a fallback.
 */
export const PLAN_ERRORS = {
  FEATURE_NOT_INCLUDED: 'PLAN_FEATURE_NOT_INCLUDED',
  LIMIT_REACHED: 'PLAN_LIMIT_REACHED',
} as const;

export type PlanProblem = 'feature' | 'limit' | 'expired';

export function planProblem(error: unknown): PlanProblem | null {
  if (!(error instanceof ApiError) || error.status !== 403) return null;
  if (error.code === PLAN_ERRORS.LIMIT_REACHED || /reached the limit for/i.test(error.message)) return 'limit';
  if (error.code === PLAN_ERRORS.FEATURE_NOT_INCLUDED || /not included in your current plan/i.test(error.message)) return 'feature';
  if (/subscription expired/i.test(error.message)) return 'expired';
  return null;
}

/** Copy that says what happened and what to do, or null when it isn't a plan refusal. */
export function planErrorMessage(error: unknown): string | null {
  switch (planProblem(error)) {
    case 'limit':
      return "You've used everything your plan includes for this. Upgrade or add an add-on to keep going.";
    case 'feature':
      return "This isn't included in your current plan. Upgrade to unlock it.";
    case 'expired':
      return 'Your subscription has expired. Renew to keep using your business dashboard.';
    default:
      return null;
  }
}
