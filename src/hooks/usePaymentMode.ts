import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { paymentsService, type PaymentMode } from '../services/paymentsService';

/**
 * The server's Paystack mode, so checkout copy only mentions test mode when
 * the server really uses test keys. Demo builds (no API) are always `test`;
 * `null` while loading or when the server is older than `/payments/config`.
 */
export function usePaymentMode(): PaymentMode | null {
  const live = hasApiConfig();
  const config = useQuery({
    queryKey: ['payments', 'config'],
    queryFn: paymentsService.config,
    enabled: live,
    staleTime: 10 * 60_000,
    retry: false,
  });
  if (!live) return 'test';
  return config.data?.mode ?? null;
}
