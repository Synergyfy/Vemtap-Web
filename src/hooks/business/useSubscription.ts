import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { subscriptionService, type BillingPeriod } from '../../services/subscriptionService';

/**
 * Live subscription & billing data: plans, the active subscription, invoice
 * history, the saved card, and credit bundles. Every query is gated on
 * `hasApiConfig()` so demo screens keep their static values.
 */

export const subscriptionKeys = {
  all: ['subscription'] as const,
  plans: ['subscription', 'plans'] as const,
  active: ['subscription', 'active'] as const,
  billing: ['subscription', 'billing'] as const,
  paymentMethod: ['subscription', 'payment-method'] as const,
  creditPlans: ['subscription', 'credit-plans'] as const,
  creditBalance: ['subscription', 'credit-balance'] as const,
};

/** Active plans (`GET /plans`). */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans,
    queryFn: subscriptionService.plans,
    enabled: hasApiConfig(),
    staleTime: 5 * 60_000,
  });
}

/** The business's current subscription; `null` when none is active. */
export function useActiveSubscription() {
  return useQuery({
    queryKey: subscriptionKeys.active,
    queryFn: subscriptionService.active,
    enabled: hasApiConfig(),
    retry: false,
    staleTime: 60_000,
  });
}

/** Invoice history for the billing dashboard. */
export function useBillingHistory() {
  return useQuery({
    queryKey: subscriptionKeys.billing,
    queryFn: subscriptionService.billingHistory,
    enabled: hasApiConfig(),
    staleTime: 60_000,
  });
}

/** Saved card — 404s ("No active subscription") until a plan is bought, so no retry. */
export function usePaymentMethod() {
  return useQuery({
    queryKey: subscriptionKeys.paymentMethod,
    queryFn: subscriptionService.paymentMethod,
    enabled: hasApiConfig(),
    retry: false,
    staleTime: 60_000,
  });
}

/** One-time credit bundles (`GET /credit-plans`). */
export function useCreditPlans() {
  return useQuery({
    queryKey: subscriptionKeys.creditPlans,
    queryFn: subscriptionService.creditPlans,
    enabled: hasApiConfig(),
    staleTime: 5 * 60_000,
  });
}

/** Current SMS / email / WhatsApp / AI credit balances. */
export function useCreditBalance() {
  return useQuery({
    queryKey: subscriptionKeys.creditBalance,
    queryFn: subscriptionService.creditBalance,
    enabled: hasApiConfig(),
    staleTime: 60_000,
  });
}

export function useSubscriptionMutations() {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
  };
  return {
    startTrial: useMutation({
      mutationFn: ({ planId, billingPeriod }: { planId: string; billingPeriod: BillingPeriod }) =>
        subscriptionService.startTrial(planId, billingPeriod),
      onSuccess: refresh,
    }),
    cancel: useMutation({ mutationFn: () => subscriptionService.cancel(), onSuccess: refresh }),
  };
}

/** Paystack checkout for a credit bundle; sends the browser to the hosted page. */
export function useCreditCheckout() {
  return useMutation({
    mutationFn: (planId: string) =>
      subscriptionService
        .startCreditCheckout(planId, window.location.href.split('?')[0])
        .then((result) => {
          if (result.authorizationUrl) window.location.assign(result.authorizationUrl);
          return result;
        }),
  });
}

/** Live price preview for one plan + period (`GET /subscriptions/price-preview`). */
export function usePricePreview(planId?: string, billingPeriod: BillingPeriod = 'monthly') {
  return useQuery({
    queryKey: [...subscriptionKeys.all, 'price-preview', planId ?? 'none', billingPeriod],
    queryFn: () => subscriptionService.pricePreview(planId!, billingPeriod),
    enabled: hasApiConfig() && Boolean(planId),
    staleTime: 60_000,
    retry: false,
  });
}

/** Paystack checkout for a subscription plan; sends the browser to the hosted page. */
export function useSubscriptionCheckout() {
  return useMutation({
    mutationFn: ({ planId, billingPeriod }: { planId: string; billingPeriod: BillingPeriod }) =>
      subscriptionService
        .initializePayment({
          planId,
          billingPeriod,
          callbackUrl: window.location.href.split('?')[0],
        })
        .then((result) => {
          if (result.authorization_url) window.location.assign(result.authorization_url);
          return result;
        }),
  });
}

/**
 * Confirms a Paystack return (`?reference=` / `?trxref=`) exactly once —
 * call from the subscription flow root so a redirect back from checkout
 * lands on the success step. `onVerified` fires after the confirmation call
 * completes, success or failure, so the owner is never stuck on a blank URL.
 */
export function useVerifySubscriptionPayment(onVerified: () => void) {
  const live = hasApiConfig();
  const handled = useRef(false);
  useEffect(() => {
    if (!live || handled.current) return;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') ?? params.get('trxref');
    if (!reference) return;
    handled.current = true;
    window.history.replaceState(null, '', window.location.pathname);
    subscriptionService.verifyPayment(reference).then(
      () => onVerified(),
      () => onVerified(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);
}
