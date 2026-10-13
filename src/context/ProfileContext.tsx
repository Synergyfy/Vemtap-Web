import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Customer profile store.
 *
 * Every screen previously re-hardcoded "Zainab Ahmed" / "zainab.ahmed@example.com".
 * The claim flow needs one source of truth so it can show the customer's real
 * identity for confirmation, and offer a way to complete a missing profile
 * instead of failing silently.
 */

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ProfileContextValue extends ProfileData {
  fullName: string;
  initials: string;
  /** First name, last name and a syntactically valid email are all present. */
  isComplete: boolean;
  hasPhone: boolean;
  maskedPhone: string;
  update: (patch: Partial<ProfileData>) => void;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

const PROFILE_KEY = 'vemtap_profile';

const DEFAULT_PROFILE: ProfileData = {
  firstName: 'Zainab',
  lastName: 'Ahmed',
  email: 'zainab.ahmed@example.com',
  phone: '+234 803 555 0192',
};

const readProfile = (): ProfileData => {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<ProfileData>;
    return {
      firstName: parsed.firstName ?? DEFAULT_PROFILE.firstName,
      lastName: parsed.lastName ?? DEFAULT_PROFILE.lastName,
      email: parsed.email ?? DEFAULT_PROFILE.email,
      phone: parsed.phone ?? DEFAULT_PROFILE.phone,
    };
  } catch {
    // storage unavailable (private mode) or corrupt JSON -> defaults
    return DEFAULT_PROFILE;
  }
};

const writeProfile = (profile: ProfileData) => {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable; session stays in memory only
  }
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(readProfile);

  const update = useCallback((patch: Partial<ProfileData>) => {
    setProfile((current) => {
      const next = { ...current, ...patch };
      writeProfile(next);
      return next;
    });
  }, []);

  const value = useMemo<ProfileContextValue>(() => {
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase().slice(0, 2);
    const phoneDigits = profile.phone.replace(/\D/g, '');
    // Local numbers are written with a leading trunk zero, e.g. `0803 555 0192`.
    const masked = phoneDigits.length <= 3 ? profile.phone : `\u2022\u2022\u2022\u2022\u2022\u2022 ${phoneDigits.slice(-3)}`;

    return {
      ...profile,
      fullName,
      initials,
      isComplete: Boolean(
        profile.firstName.trim() && profile.lastName.trim() && isValidEmail(profile.email),
      ),
      hasPhone: phoneDigits.length >= 7,
      maskedPhone: masked,
      update,
    };
  }, [profile, update]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
