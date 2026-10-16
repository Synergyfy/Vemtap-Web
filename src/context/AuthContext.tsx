import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { clearAuthTokens, getAccessToken, hasApiConfig } from '../lib/api';
import { authService } from '../services';

interface AuthCredentials {
  identifier?: string;
  email?: string;
  password?: string;
  source?: string;
}

interface AuthContextValue {
  authed: boolean;
  claimed: boolean;
  signIn: (credentials?: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  markClaimed: () => void;
  resetClaim: () => void;
}

const DEFAULT_VALUE: AuthContextValue = {
  authed: false,
  claimed: false,
  signIn: async () => undefined,
  signOut: async () => undefined,
  markClaimed: () => undefined,
  resetClaim: () => undefined,
};

const AUTHED_KEY = 'vemtap_authed';
const CLAIMED_KEY = 'vemtap_claimed';
const PROFILE_KEY = 'vemtap_profile';

const readFlag = (key: string) => {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

const writeFlag = (key: string, value: boolean) => {
  try {
    if (value) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    // storage unavailable (private mode) — session stays in memory only
  }
};

const persistProfileFromUser = (user?: { firstName?: string; lastName?: string; email?: string; phone?: string; name?: string }) => {
  if (!user) return;

  const fullName = (user.name ?? '').trim();
  const nameParts = fullName ? fullName.split(/\s+/).filter(Boolean) : [];
  const firstName = user.firstName?.trim() || nameParts[0] || 'User';
  const lastName = user.lastName?.trim() || nameParts.slice(1).join(' ');

  const nextProfile = {
    firstName: firstName || 'User',
    lastName: lastName || '',
    email: user.email?.trim() || '',
    phone: user.phone?.trim() || '',
  };

  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
  } catch {
    // storage unavailable; session stays in memory only
  }
};

const clearStoredProfile = () => {
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // storage unavailable; session stays in memory only
  }
};

const AuthContext = createContext<AuthContextValue>(DEFAULT_VALUE);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => readFlag(AUTHED_KEY) || Boolean(getAccessToken()));
  const [claimed, setClaimed] = useState(() => readFlag(CLAIMED_KEY));

  const value = useMemo<AuthContextValue>(
    () => ({
      authed,
      claimed,
      signIn: async (credentials?: AuthCredentials) => {
        const identifier = (credentials?.identifier ?? credentials?.email ?? 'customer@vemtap.com').trim();
        const password = credentials?.password;

        if (hasApiConfig()) {
          if (!identifier || !password || !password.trim()) {
            throw new Error('Identifier and password are required for API login.');
          }

          try {
            const response = await authService.login({
              identifier,
              password: password.trim(),
            });
            persistProfileFromUser(response?.user);
            writeFlag(AUTHED_KEY, true);
            setAuthed(true);
            return;
          } catch (error) {
            console.error('Login failed:', error);
            clearStoredProfile();
            writeFlag(AUTHED_KEY, false);
            setAuthed(false);
            throw error;
          }
        }

        writeFlag(AUTHED_KEY, true);
        clearAuthTokens();
        setAuthed(true);
      },
      signOut: async () => {
        if (hasApiConfig()) {
          try {
            await authService.logout();
          } catch (error) {
            console.error('Logout failed:', error);
            throw error;
          } finally {
            clearStoredProfile();
            clearAuthTokens();
            writeFlag(AUTHED_KEY, false);
            writeFlag(CLAIMED_KEY, false);
            setAuthed(false);
            setClaimed(false);
          }
          return;
        }

        clearAuthTokens();
        clearStoredProfile();
        writeFlag(AUTHED_KEY, false);
        writeFlag(CLAIMED_KEY, false);
        setAuthed(false);
        setClaimed(false);
      },
      markClaimed: () => {
        writeFlag(CLAIMED_KEY, true);
        setClaimed(true);
      },
      resetClaim: () => {
        writeFlag(CLAIMED_KEY, false);
        setClaimed(false);
      },
    }),
    [authed, claimed],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
