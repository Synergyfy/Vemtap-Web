import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessService } from '../../services/businessService';
import { useAuth } from '../../context/AuthContext';

export const myBusinessKeys = { all: ['my-business'] as const };

/** The owner's business and branches; disabled in demo mode and when signed out. */
export function useMyBusiness() {
  const { authed } = useAuth();
  return useQuery({
    queryKey: myBusinessKeys.all,
    queryFn: businessService.myBusiness,
    enabled: authed && hasApiConfig(),
    staleTime: 5 * 60_000,
  });
}
