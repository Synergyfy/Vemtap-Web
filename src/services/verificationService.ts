import { api } from './api/client';
import { withMock } from './mock';

/**
 * Business verification on bytID (backend `apps/backend/docs/
 * verification-and-trial-integration.md`). Identity = the person running the
 * account (ID + selfie liveness); business = CAC registration, or an
 * unregistered business reviewed by a person.
 */
export type IdentityIdType = 'nin' | 'drivers_license' | 'voters_card' | 'passport';
export type VerificationCheckStatus = 'pending' | 'verified' | 'needs_review' | 'failed';
export type BusinessVerificationStatus = 'unverified' | 'in_progress' | 'needs_review' | 'verified' | 'rejected';

export interface VerificationCheck {
  id: string;
  kind: 'identity' | 'business';
  idType: string;
  status: VerificationCheckStatus;
  maskedId?: string | null;
  recordName?: string | null;
  reasons?: string[] | null;
  createdAt?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}

export interface VerificationStatus {
  status: BusinessVerificationStatus;
  isVerified: boolean;
  verifiedAt?: string | null;
  nextStep: 'identity' | 'business' | 'review' | 'done';
  identity?: VerificationCheck | null;
  business?: VerificationCheck | null;
}

export interface LivenessSession {
  sessionId: string;
  url: string;
  status?: string | null;
  expiresAt?: string | null;
}

export interface LivenessStatus {
  sessionId: string;
  status: 'pending' | 'passed' | 'failed' | 'expired';
  usableForFaceMatch?: boolean | null;
  reasons?: string[] | null;
}

export interface VerifyIdentityInput {
  idType: IdentityIdType;
  idNumber?: string;
  firstName: string;
  lastName: string;
  /** `YYYY-MM-DD` */
  dob?: string;
  livenessSessionId: string;
}

/** Friendly copy for each reason code the backend can return. */
const REASON_COPY: Record<string, string> = {
  id_not_found: "We couldn't find that ID number. Check it and try again.",
  face_not_matched: "Your selfie didn't match the photo on the ID.",
  face_unavailable: "We couldn't compare your selfie with the ID photo.",
  name_mismatch: "The name on the ID doesn't match your account name.",
  registry_unavailable: 'The ID registry was not responding. Please try again shortly.',
  provider_error: 'Something went wrong while checking. Please try again.',
  cac_not_found: "We couldn't find that CAC number.",
  business_name_mismatch: "The registered name doesn't match your business name.",
  owner_not_listed: "You aren't listed as a director or owner on the CAC record.",
  company_not_active: 'The company is not active on the CAC register.',
  unregistered_business: 'Our team will review your business details.',
  manual_review_requested: 'You asked our team to review this.',
};

export const reasonCopy = (reasons?: string[] | null) =>
  (reasons ?? []).map((reason) => REASON_COPY[reason] ?? reason.replace(/_/g, ' '));

const mockCheck = (kind: 'identity' | 'business', idType: string, failed: boolean): VerificationCheck => ({
  id: `chk-${Date.now()}`,
  kind,
  idType,
  status: failed ? 'needs_review' : 'verified',
  reasons: failed ? [kind === 'identity' ? 'id_not_found' : 'cac_not_found'] : [],
});

export const verificationService = {
  status: () =>
    withMock(
      () => api.get<VerificationStatus>('/verification/status'),
      (): VerificationStatus => ({ status: 'verified', isVerified: true, nextStep: 'done', identity: null, business: null }),
    ),

  startLiveness: (redirectUrl: string) => api.post<LivenessSession>('/verification/liveness-sessions', { redirectUrl }),

  livenessStatus: (sessionId: string) =>
    api.get<LivenessStatus>(`/verification/liveness-sessions/${encodeURIComponent(sessionId)}`),

  verifyIdentity: (input: VerifyIdentityInput) =>
    withMock(
      () => api.post<VerificationCheck>('/verification/identity', input),
      // Demo: an all-zero ID number stands in for a failed lookup.
      () => mockCheck('identity', input.idType, /^0+$/.test(input.idNumber ?? '')),
    ),

  /** `registrationNumber` must start with RC, BN or IT, e.g. `RC1234567`. */
  verifyBusiness: (registrationNumber: string) =>
    withMock(
      () => api.post<VerificationCheck>('/verification/business', { registrationNumber }),
      () => mockCheck('business', 'cac', /^(RC|BN|IT)0+$/i.test(registrationNumber.replace(/[\s-]/g, ''))),
    ),

  submitUnregistered: (input: { note?: string; documentUrls?: string[] }) =>
    withMock(
      () => api.post<VerificationCheck>('/verification/business/unregistered', input),
      () => ({ ...mockCheck('business', 'unregistered', false), status: 'needs_review' as const, reasons: ['unregistered_business'] }),
    ),

  requestManualReview: (input: { checkId?: string; note?: string }) =>
    withMock(
      () => api.post<VerificationCheck>('/verification/manual-review', input),
      () => ({ ...mockCheck('identity', 'manual', false), status: 'needs_review' as const, reasons: ['manual_review_requested'] }),
    ),
};
