import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearAuthTokens, getAccessToken, hasApiConfig } from '../lib/api';
import { authService } from '../services';
import { SESSION_EXPIRED_EVENT } from '../services/api/client';
import { queryClient } from '../services/queryClient';
import type { SessionUser } from '../services/sessionService';

interface AuthCredentials {
  identifier?: string;
  email?: string;
  password?: string;
  source?: string;
}

interface AuthContextValue {
  authed: boolean;
  claimed: boolean;
  /** Resolves with the signed-in user when the API is configured (undefined in demo mode). */
  signIn: (credentials?: AuthCredentials) => Promise<SessionUser | undefined>;
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

const readNestedUser = (value: unknown): { firstName?: string; lastName?: string; email?: string; phone?: string; name?: string } | undefined => {
  if (!value || typeof value !== 'object') return undefined;

  const candidate = value as Record<string, unknown>;
  if (candidate.firstName || candidate.lastName || candidate.name || candidate.email || candidate.phone) {
    return {
      firstName: typeof candidate.firstName === 'string' ? candidate.firstName : undefined,
      lastName: typeof candidate.lastName === 'string' ? candidate.lastName : undefined,
      name: typeof candidate.name === 'string' ? candidate.name : undefined,
      email: typeof candidate.email === 'string' ? candidate.email : undefined,
      phone: typeof candidate.phone === 'string' ? candidate.phone : undefined,
    };
  }

  for (const nestedKey of ['data', 'result', 'payload', 'user', 'profile']) {
    const nested = candidate[nestedKey];
    const found = readNestedUser(nested);
    if (found) return found;
  }

  return undefined;
};

const persistProfileFromUser = (input?: unknown) => {
  const user = readNestedUser(input) ?? readNestedUser((input as { user?: unknown })?.user);
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

  // The API rejected the token (expired or revoked): drop the local session.
  useEffect(() => {
    const handleExpired = () => {
      if (!readFlag(AUTHED_KEY)) return;
      clearStoredProfile();
      queryClient.clear();
      writeFlag(AUTHED_KEY, false);
      setAuthed(false);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

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
            persistProfileFromUser(response);
            const user = (response as { user?: SessionUser }).user;
            if (user) queryClient.setQueryData(['session', 'profile'], user);
            writeFlag(AUTHED_KEY, true);
            setAuthed(true);
            return user;
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
        return undefined;
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
            queryClient.clear();
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
