import { api } from './api/client';
import type { SessionUser } from './sessionService';

export interface OwnerSession {
  access_token: string;
  user: SessionUser;
  isNewUser?: boolean;
}

/** Business fields both registration and the customer → owner upgrade accept (all optional). */
export interface OwnerBusinessFields {
  businessName?: string;
  categoryId?: string;
  subcategoryId?: string;
  whatsappNumber?: string;
  officialEmail?: string;
  businessNumber?: string;
  businessAddress?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  businessWebsite?: string;
  isRegistered?: boolean;
  referralCode?: string;
}

/** The backend refuses registration until the emailed code is verified, with this message. */
export const OTP_GATE_MESSAGE = 'OTP must be verified before completing registration';

/**
 * Owner sign-up: request a code by email, verify the 4-character code, then
 * register. A signed-in customer upgrades in place instead.
 */
export const ownerAuthService = {
  requestOtp: (email: string, names: { firstName?: string; lastName?: string } = {}) =>
    api.post<{ message: string }>('/auth/register/owner/request-otp', { email, role: 'Owner', ...names }),

  verifyOtp: (email: string, code: string) => api.post<{ message: string }>('/auth/otp/verify', { email, code }),

  register: (input: { email: string; password?: string; firstName?: string; lastName?: string } & OwnerBusinessFields) =>
    api.post<OwnerSession>('/auth/register/owner', input),

  /** Local-auth accounts confirm their password; Google accounts omit it. */
  upgrade: (input: { password?: string } & OwnerBusinessFields) => api.post<OwnerSession>('/auth/upgrade-to-owner', input),
};
