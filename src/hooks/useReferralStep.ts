import { useState } from 'react';
import {
  getProvisionalReferralCode,
  normaliseReferralCode,
  provisionalReferralIsFromUrl,
  setProvisionalReferralCode,
} from '../scripts/referralData';

/**
 * Referral entry for the last onboarding step.
 *
 * The field is inert on its own: nothing is validated or stored while the user
 * types. Submitting pauses the step and opens `ReferralConfirmSheet`; only
 * Confirm or Skip releases it. The confirmed code is kept in localStorage
 * (30-day TTL) so a reload mid-sign-up keeps it; it is only sent to the
 * server with the sign-up request itself.
 */
export function useReferralStep() {
  const [prefilledCode] = useState(() => (provisionalReferralIsFromUrl() ? getProvisionalReferralCode() : ''));
  const [fromUrl] = useState(() => provisionalReferralIsFromUrl());
  const [code, setCode] = useState(() => getProvisionalReferralCode());
  const [confirmed, setConfirmed] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  /** True when the step must pause for the referral confirmation sheet. */
  const needsConfirmation = code.trim() !== '' && !confirmed;

  const changeCode = (next: string) => {
    setCode(next);
    // Editing after a confirmation invalidates it, so the sheet re-opens.
    if (confirmed) setConfirmed(false);
  };

  const confirm = () => {
    const normalised = normaliseReferralCode(code);
    setProvisionalReferralCode(
      normalised,
      normalised === normaliseReferralCode(prefilledCode) && normalised !== '' ? 'url' : 'manual',
    );
    setCode(normalised);
    setConfirmed(true);
    setPromptOpen(false);
  };

  const skip = () => {
    setProvisionalReferralCode('');
    setCode('');
    setConfirmed(false);
    setPromptOpen(false);
  };

  return {
    /** Raw text in the field — never silently rewritten while typing. */
    code,
    fromUrl,
    needsConfirmation,
    promptOpen,
    changeCode,
    requestConfirmation: () => setPromptOpen(true),
    confirm,
    skip,
    cancel: () => setPromptOpen(false),
  };
}
