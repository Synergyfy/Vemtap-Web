import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { adWalletService } from '../services';
import { apiErrorMessage } from '../services/errorMessages';
import { sponsoredKeys, useAdWallet } from '../hooks/business/useSponsored';
import { formatNaira } from '../utils/format';

/** Shown when auto-reload has never been set: the backend's defaults. */
export const AUTO_RELOAD_DEFAULT = { threshold: 3000, amount: 10000 };

/**
 * The Boost Wallet's live data and actions, shared by the mobile and desktop
 * wallet screens: balance, ledger, prepacks, Paystack top-up (and confirming
 * it when Paystack sends the owner back) and auto-reload.
 */
export function useLiveWallet(notify: (message: string) => void) {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const summary = useAdWallet();
  const transactions = useQuery({
    queryKey: [...sponsoredKeys.all, 'wallet-transactions'],
    queryFn: () => adWalletService.getTransactions({ limit: 20 }),
    enabled: live,
  });
  const prepacks = useQuery({
    queryKey: [...sponsoredKeys.all, 'wallet-prepacks'],
    queryFn: adWalletService.getPrepacks,
    enabled: live,
    staleTime: 10 * 60_000,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: sponsoredKeys.all });

  const topUp = useMutation({
    mutationFn: (input: { amount?: number; prepackId?: string }) =>
      adWalletService.topUp({ ...input, callbackUrl: window.location.href.split('?')[0] }),
    onSuccess: (result) => {
      if (result.authorizationUrl) {
        window.location.assign(result.authorizationUrl);
        return;
      }
      notify(`Top-up of ${formatNaira(Number(result.amount) || 0)} started`);
      void refresh();
    },
    onError: (error) => notify(apiErrorMessage(error, 'Could not start the top-up.')),
  });

  const autoReload = useMutation({
    mutationFn: (enabled: boolean) => {
      const current = summary.data?.autoReload;
      return adWalletService.setAutoReload({
        enabled,
        threshold: Number(current?.threshold) || AUTO_RELOAD_DEFAULT.threshold,
        amount: Number(current?.amount) || AUTO_RELOAD_DEFAULT.amount,
      });
    },
    onSuccess: (_result, enabled) => {
      notify(enabled ? 'Auto-reload switched on' : 'Auto-reload switched off');
      void refresh();
    },
    onError: (error) => notify(apiErrorMessage(error, 'Could not change auto-reload.')),
  });

  // Paystack returns here with `?reference=` (or `trxref=`): confirm it once.
  const confirmed = useRef(false);
  useEffect(() => {
    if (!live || confirmed.current) return;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') ?? params.get('trxref');
    if (!reference) return;
    confirmed.current = true;
    adWalletService
      .confirmTopUp(reference)
      .then((result) => {
        notify(result.status === 'completed' ? 'Top-up received — your wallet is updated' : 'Top-up is still processing');
        void refresh();
      })
      .catch((error: unknown) => notify(apiErrorMessage(error, 'Could not confirm the top-up.')))
      .finally(() => window.history.replaceState(null, '', window.location.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const loadError = summary.error ?? transactions.error;
  useEffect(() => {
    if (loadError) notify(apiErrorMessage(loadError, 'Could not load your Boost Wallet.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadError]);

  const bonusFor = (amount: number) => {
    const pack = (prepacks.data ?? []).find((entry) => Number(entry.amount) === amount);
    return pack && Number(pack.bonus) ? `${formatNaira(Number(pack.bonus))} bonus ad credit` : '';
  };

  return {
    live,
    summary: summary.data,
    transactions: transactions.data ?? [],
    prepacks: prepacks.data ?? [],
    bonusFor,
    autoReloadOn: Boolean(summary.data?.autoReload?.enabled),
    autoReloadThreshold: Number(summary.data?.autoReload?.threshold) || AUTO_RELOAD_DEFAULT.threshold,
    autoReloadAmount: Number(summary.data?.autoReload?.amount) || AUTO_RELOAD_DEFAULT.amount,
    topUp,
    autoReload,
  };
}
