import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dealLedgerService, type DealLedgerQuery } from '../../services/dealLedgerService';

export const dealLedgerKeys = {
  all: ['deal-ledger'] as const,
  list: (query: DealLedgerQuery) => ['deal-ledger', query] as const,
};

export function useDealLedger(query: DealLedgerQuery) {
  return useQuery({
    queryKey: dealLedgerKeys.list(query),
    queryFn: () => dealLedgerService.list(query),
    placeholderData: keepPreviousData,
  });
}
