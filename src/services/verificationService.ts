import { api } from './api/client';
import { withMock } from './mock';

/**
 * Business verification on bytID (backend `apps/backend/docs/
 * verification-and-trial-integration.md`). Identity = the person running the
 * account (ID + selfie liveness; BVN is a record lookup); business = CAC
 * registration, or an unregistered business reviewed by a person. Ownership
 * is a separate check and is never inferred from a registry lookup.
 */
export type IdentityIdType = 'nin' | 'drivers_license' | 'voters_card' | 'bvn' | 'passport';
export type VerificationCheckStatus = 'pending' | 'verified' | 'needs_review' | 'failed';
export type BusinessVerificationStatus = 'unverified' | 'in_progress' | 'needs_review' | 'verified' | 'rejected';
export type VerificationEnvironment = 'test' | 'live';

export type VerificationCheckKind = 'identity' | 'business' | 'representative';

export interface VerificationCheck {
  id: string;
  kind: VerificationCheckKind;
  idType: string;
  status: VerificationCheckStatus;
  maskedId?: string | null;
  recordName?: string | null;
  reasons?: string[] | null;
  createdAt?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  /** `test` means a sandbox result; never present it as live verification. */
  environment?: VerificationEnvironment | null;
}

/** Minimal CAC fields the form may prefill; no directors' personal details. */
export interface BusinessPreview {
  legalName: string | null;
  registrationNumber: string | null;
  status: string | null;
  registrationDate: string | null;
  companyType: string | null;
  representativeCount: number;
  ownersPublished: boolean;
}

export type BusinessPreviewCheck = VerificationCheck & { preview: BusinessPreview };

export interface VerificationStatus {
  status: BusinessVerificationStatus;
  isVerified: boolean;
  verifiedAt?: string | null;
  nextStep: 'identity' | 'business' | 'review' | 'done';
  identity?: VerificationCheck | null;
  business?: VerificationCheck | null;
  representative?: VerificationCheck | null;
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
  /** Not used for BVN (record lookup only). */
  livenessSessionId?: string;
  /** Passport only: hosted URL of the uploaded data page. */
  documentUrl?: string;
}

export interface VerifyBusinessInput {
  registrationNumber: string;
  /** ID from `POST /verification/business/preview`. */
  previewId?: string;
  /** Must be true when `previewId` is used. */
  confirmed?: boolean;
}

export interface VerifyRepresentativeInput {
  /** ID from `POST /verification/business/preview`. */
  previewId?: string;
  representativeName: string;
}

/** Friendly copy for each reason code the backend can return. */
const REASON_COPY: Record<string, string> = {
  id_not_found: "We couldn't find that ID number. Check it and try again.",
  face_not_matched: "Your selfie didn't match the photo on the ID.",
  face_unavailable: "We couldn't compare your selfie with the ID photo.",
  name_mismatch: "The name on the ID doesn't match your account name.",
  details_mismatch: 'Some details you entered do not match the registry record.',
  registry_unavailable: 'The ID registry was not responding. Please try again shortly.',
  provider_error: 'Something went wrong while checking. Please try again.',
  cac_not_found: "We couldn't find that CAC number.",
  business_name_mismatch: "The registered name doesn't match your business name.",
  owner_not_listed: "You aren't listed as a director or owner on the CAC record.",
  representative_not_listed: 'The CAC record does not publish directors or owners. Our team will review this.',
  representative_mismatch: "The representative's name doesn't match a director or owner on the CAC record.",
  company_not_active: 'The company is not active on the CAC register.',
  unregistered_business: 'Our team will review your business details.',
  manual_review_requested: 'You asked our team to review this.',
};

export const reasonCopy = (reasons?: string[] | null) =>
  (reasons ?? []).map((reason) => REASON_COPY[reason] ?? reason.replace(/_/g, ' '));

/** Never show or send an unmasked ID number as a credential reference. */
export const maskIdNumber = (value?: string | null) => {
  const digits = (value ?? '').replace(/\D/g, '');
  return `•••• ${digits.slice(-4).padStart(4, '0')}`;
};

const mockCheck = (kind: VerificationCheckKind, idType: string, failed: boolean): VerificationCheck => ({
  id: `chk-${Date.now()}`,
  kind,
  idType,
  status: failed ? 'needs_review' : 'verified',
  reasons: failed ? [kind === 'business' ? 'cac_not_found' : 'id_not_found'] : [],
});

const mockBusinessPreview = (registrationNumber: string): BusinessPreviewCheck => ({
  ...mockCheck('business', 'cac', /^(RC|BN|IT)0+$/i.test(registrationNumber.replace(/[\s-]/g, ''))),
  preview: {
    legalName: null,
    registrationNumber,
    status: null,
    registrationDate: null,
    companyType: null,
    representativeCount: 0,
    ownersPublished: false,
  },
});

export const verificationService = {
  status: () =>
    withMock(
      () => api.get<VerificationStatus>('/verification/status'),
      (): VerificationStatus => ({ status: 'verified', isVerified: true, nextStep: 'done', identity: null, business: null, representative: null }),
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

  /** Registry lookup for autofill only. It never verifies the business or ownership. */
  previewBusiness: (registrationNumber: string) =>
    withMock(
      () => api.post<BusinessPreviewCheck>('/verification/business/preview', { registrationNumber }),
      () => mockBusinessPreview(registrationNumber),
    ),

  /** `registrationNumber` must start with RC, BN or IT, e.g. `RC1234567`. */
  verifyBusiness: (input: VerifyBusinessInput) =>
    withMock(
      () => api.post<VerificationCheck>('/verification/business', input),
      () =>
        mockCheck(
          'business',
          'cac',
          /^(RC|BN|IT)0+$/i.test(input.registrationNumber.replace(/[\s-]/g, '')),
        ),
    ),

  /** Separate ownership check; a successful CAC lookup is not enough. */
  verifyRepresentative: (input: VerifyRepresentativeInput) =>
    withMock(
      () => api.post<VerificationCheck>('/verification/business/representative', input),
      () => mockCheck('representative', 'cac', false),
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
