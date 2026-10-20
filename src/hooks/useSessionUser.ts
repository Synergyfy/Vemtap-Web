import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { sessionService } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';

export const sessionKeys = { profile: ['session', 'profile'] as const };

/** The signed-in user (`GET /auth/profile`); undefined in demo mode or when signed out. */
export function useSessionUser() {
  const { authed } = useAuth();
  return useQuery({
    queryKey: sessionKeys.profile,
    queryFn: sessionService.profile,
    enabled: authed && hasApiConfig(),
    staleTime: 5 * 60_000,
  });
}
