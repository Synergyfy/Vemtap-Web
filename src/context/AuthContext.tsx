import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { apiPost, hasApiConfig } from '../lib/api';

interface AuthContextValue {
  authed: boolean;
  claimed: boolean;
  signIn: () => Promise<void>;
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

const AuthContext = createContext<AuthContextValue>(DEFAULT_VALUE);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => readFlag(AUTHED_KEY));
  const [claimed, setClaimed] = useState(() => readFlag(CLAIMED_KEY));

  const value = useMemo<AuthContextValue>(
    () => ({
      authed,
      claimed,
      signIn: async () => {
        if (hasApiConfig()) {
          try {
            await apiPost('/auth/login', {
              email: 'customer@vemtap.com',
              source: 'web',
            });
          } catch {
            // The app can still operate in local-only mode when the backend is not running.
          }
        }

        writeFlag(AUTHED_KEY, true);
        setAuthed(true);
      },
      signOut: async () => {
        if (hasApiConfig()) {
          try {
            await apiPost('/auth/logout', {});
          } catch {
            // Ignore logout errors and preserve the local UX in demo mode.
          }
        }

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
