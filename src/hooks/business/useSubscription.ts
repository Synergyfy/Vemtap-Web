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
