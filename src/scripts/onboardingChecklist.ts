/**
 * Onboarding progress model for the post-onboarding welcome screen.
 *
 * The checklist is derived purely from state the frontend already holds, so it
 * reads honestly: an optional step that was skipped stays "skipped" and never
 * counts towards readiness, and no step is marked complete unless the app
 * actually recorded it.
 */

export type ChecklistStatus = 'completed' | 'skipped' | 'pending';

export interface OnboardingChecklistItem {
  id: string;
  label: string;
  detail: string;
  status: ChecklistStatus;
  /** Required steps drive the readiness percentage; optional ones never do. */
  required: boolean;
}

export const CHECKLIST_STATUS_LABEL: Record<ChecklistStatus, string> = {
  completed: 'Completed',
  skipped: 'Skipped',
  pending: 'To do',
};

/**
 * Business readiness counts required steps only. A skipped optional step is
 * excluded from both the numerator and the denominator.
 */
export function readinessPercent(items: OnboardingChecklistItem[]): number {
  const required = items.filter((item) => item.required);
  if (required.length === 0) return 0;
  const done = required.filter((item) => item.status === 'completed').length;
  return Math.round((done / required.length) * 100);
}

export interface CustomerChecklistInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locationGranted: boolean;
  referralCodeApplied: boolean;
}

/**
 * Customer account-setup summary — deliberately account-focused rather than a
 * copy of the business checklist.
 */
export function buildCustomerChecklist(input: CustomerChecklistInput): OnboardingChecklistItem[] {
  const phoneDigits = input.phone.replace(/\D/g, '');
  return [
    {
      id: 'account',
      label: 'Account created',
      detail: input.email.trim() ? `Signed up as ${input.email}` : 'Email verified',
      status: 'completed',
      required: true,
    },
    {
      id: 'profile',
      label: 'Profile details',
      detail:
        input.firstName.trim() && input.lastName.trim()
          ? `${input.firstName} ${input.lastName}`
          : 'Add your name to personalise VEMTAP',
      status: input.firstName.trim() && input.lastName.trim() ? 'completed' : 'pending',
      required: true,
    },
    {
      id: 'phone',
      label: 'Phone number',
      detail: phoneDigits.length >= 7 ? 'Added — used for claims and order updates' : 'Optional — add it to speed up deal claims',
      status: phoneDigits.length >= 7 ? 'completed' : 'skipped',
      required: false,
    },
    {
      id: 'location',
      label: 'Location access',
      detail: input.locationGranted ? 'Set — shows deals near you' : 'Skipped — you can set a location manually',
      status: input.locationGranted ? 'completed' : 'skipped',
      required: false,
    },
    {
      id: 'referral',
      label: 'Referral code',
      detail: input.referralCodeApplied ? 'Applied during sign-up' : 'Optional — you can add one later from your dashboard',
      status: input.referralCodeApplied ? 'completed' : 'skipped',
      required: false,
    },
  ];
}

export interface BusinessChecklistInput {
  profileCompleted: boolean;
  offeringsCompleted: boolean;
  verificationState: 'not-started' | 'in-progress' | 'complete';
  referralCodeApplied: boolean;
}

/**
 * Business readiness from the three real business-setup sections plus the
 * optional referral step.
 */
export function buildBusinessChecklist(input: BusinessChecklistInput): OnboardingChecklistItem[] {
  const verificationDone = input.verificationState === 'complete';
  const verificationStatus: ChecklistStatus = verificationDone
    ? 'completed'
    : input.verificationState === 'in-progress'
      ? 'pending'
      : 'skipped';
  return [
    {
      id: 'profile',
      label: 'Business Profile',
      detail: input.profileCompleted ? 'Business information and branding completed' : 'Finish your business information',
      status: input.profileCompleted ? 'completed' : 'pending',
      required: true,
    },
    {
      id: 'offerings',
      label: 'Products, Services & Deals',
      detail: input.offeringsCompleted ? 'Catalogue and offers configured' : 'Add your first products or services',
      status: input.offeringsCompleted ? 'completed' : 'pending',
      required: true,
    },
    {
      id: 'verification',
      label: 'Business Verification',
      detail: verificationDone
        ? 'Verification complete'
        : input.verificationState === 'in-progress'
          ? 'Verification submitted — awaiting review'
          : 'Optional at launch; required before some features unlock',
      status: verificationStatus,
      required: false,
    },
    {
      id: 'referral',
      label: 'Referral code',
      detail: input.referralCodeApplied ? 'Applied during sign-up' : 'Optional — add one later from your dashboard',
      status: input.referralCodeApplied ? 'completed' : 'skipped',
      required: false,
    },
  ];
}
